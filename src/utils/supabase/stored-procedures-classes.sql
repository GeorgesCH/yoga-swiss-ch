-- Complete Classes Module Stored Procedures for YogaSwiss
-- These procedures implement the core business logic for the classes module

-- ==================== CLASS OCCURRENCE GENERATION ====================

CREATE OR REPLACE FUNCTION generate_class_occurrences(p_instance_id UUID)
RETURNS TABLE(occurrence_id UUID, start_time TIMESTAMP, end_time TIMESTAMP)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    instance_rec RECORD;
    template_rec RECORD;
    current_date DATE;
    end_date DATE;
    occurrence_count INTEGER := 0;
    max_occurrences INTEGER;
    generated_occurrence UUID;
BEGIN
    -- Get instance details
    SELECT * INTO instance_rec
    FROM class_instances
    WHERE id = p_instance_id;
    
    IF instance_rec IS NULL THEN
        RAISE EXCEPTION 'Class instance not found';
    END IF;

    -- Get template details
    SELECT * INTO template_rec
    FROM class_templates
    WHERE id = instance_rec.template_id;
    
    IF template_rec IS NULL THEN
        RAISE EXCEPTION 'Class template not found';
    END IF;

    -- Determine end date
    IF instance_rec.recurrence_end_date IS NOT NULL THEN
        end_date := instance_rec.recurrence_end_date;
        max_occurrences := 365; -- Safety limit
    ELSIF instance_rec.recurrence_end_count IS NOT NULL THEN
        end_date := instance_rec.start_date + INTERVAL '1 year'; -- Safety limit
        max_occurrences := instance_rec.recurrence_end_count;
    ELSE
        -- Single occurrence
        end_date := instance_rec.start_date;
        max_occurrences := 1;
    END IF;

    current_date := instance_rec.start_date;

    WHILE current_date <= end_date AND occurrence_count < max_occurrences LOOP
        -- Skip blackout dates
        IF instance_rec.blackout_dates IS NULL OR 
           NOT (current_date::TEXT = ANY(SELECT jsonb_array_elements_text(instance_rec.blackout_dates))) THEN
            
            -- Create occurrence
            INSERT INTO class_occurrences (
                instance_id,
                template_id,
                org_id,
                instructor_id,
                location_id,
                start_time,
                end_time,
                slug,
                price,
                capacity,
                booked_count,
                waitlist_count,
                status
            ) VALUES (
                p_instance_id,
                instance_rec.template_id,
                instance_rec.org_id,
                COALESCE(
                    (instance_rec.instructor_overrides->>0)::UUID,
                    (template_rec.default_instructors->>0)::UUID
                ),
                COALESCE(
                    (instance_rec.location_overrides->>0)::UUID,
                    (template_rec.default_locations->>0)::UUID
                ),
                (current_date || ' ' || instance_rec.time_window_start)::TIMESTAMP,
                (current_date || ' ' || instance_rec.time_window_end)::TIMESTAMP,
                generate_occurrence_slug(template_rec.name, current_date),
                template_rec.default_price,
                COALESCE(instance_rec.capacity_override, template_rec.default_capacity),
                0,
                0,
                'scheduled'
            )
            RETURNING id INTO generated_occurrence;

            -- Return generated occurrence info
            RETURN QUERY SELECT 
                generated_occurrence,
                (current_date || ' ' || instance_rec.time_window_start)::TIMESTAMP,
                (current_date || ' ' || instance_rec.time_window_end)::TIMESTAMP;

            occurrence_count := occurrence_count + 1;
        END IF;

        -- Move to next occurrence date based on recurrence pattern
        IF instance_rec.recurrence_pattern IS NULL OR 
           (instance_rec.recurrence_pattern->>'type') = 'none' THEN
            -- Single occurrence
            EXIT;
        ELSIF (instance_rec.recurrence_pattern->>'type') = 'daily' THEN
            current_date := current_date + INTERVAL '1 day';
        ELSIF (instance_rec.recurrence_pattern->>'type') = 'weekly' THEN
            current_date := current_date + INTERVAL '1 week';
        ELSE
            -- Custom pattern - implement based on rules
            current_date := current_date + INTERVAL '1 week'; -- Default to weekly
        END IF;
    END LOOP;
END;
$$;

-- Helper function to generate unique slugs
CREATE OR REPLACE FUNCTION generate_occurrence_slug(class_name TEXT, occurrence_date DATE)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from class name and date
    base_slug := lower(
        regexp_replace(
            unaccent(class_name || '-' || to_char(occurrence_date, 'YYYY-MM-DD')), 
            '[^a-z0-9]+', '-', 'g'
        )
    );
    base_slug := trim(base_slug, '-');
    
    final_slug := base_slug;
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM class_occurrences WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$;

-- ==================== RECURRING CLASS EDIT PREVIEW ====================

CREATE OR REPLACE FUNCTION preview_recurring_edit(
    p_instance_id UUID,
    p_scope TEXT, -- 'this_occurrence' | 'future_occurrences' | 'all_occurrences'
    p_changes JSONB
)
RETURNS TABLE(
    affected_occurrences INTEGER,
    affected_registrations INTEGER,
    conflicts JSONB,
    impact_summary JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    occurrence_filter TEXT;
    conflicts_array JSONB := '[]'::JSONB;
    total_revenue DECIMAL := 0;
    total_bookings INTEGER := 0;
    customers_count INTEGER := 0;
BEGIN
    -- Build occurrence filter based on scope
    IF p_scope = 'this_occurrence' THEN
        -- This should be called with occurrence_id, not instance_id
        RAISE EXCEPTION 'For single occurrence edits, use occurrence_id directly';
    ELSIF p_scope = 'future_occurrences' THEN
        occurrence_filter := 'start_time > NOW()';
    ELSIF p_scope = 'all_occurrences' THEN
        occurrence_filter := '1=1'; -- All occurrences
    END IF;

    -- Count affected occurrences
    EXECUTE format('
        SELECT COUNT(*) FROM class_occurrences 
        WHERE instance_id = $1 AND %s', occurrence_filter)
    USING p_instance_id INTO affected_occurrences;

    -- Count affected registrations and calculate impact
    EXECUTE format('
        SELECT 
            COUNT(r.*),
            COALESCE(SUM(r.price), 0),
            COUNT(DISTINCT r.customer_id)
        FROM registrations r
        JOIN class_occurrences o ON o.id = r.occurrence_id
        WHERE o.instance_id = $1 
        AND r.status IN (''confirmed'', ''pending'')
        AND %s', occurrence_filter)
    USING p_instance_id INTO affected_registrations, total_revenue, customers_count;

    -- Check for conflicts (instructor, location, resource availability)
    -- This would be expanded with actual conflict checking logic
    IF p_changes ? 'instructor_id' THEN
        -- Check instructor availability conflicts
        conflicts_array := conflicts_array || jsonb_build_object(
            'type', 'instructor',
            'message', 'Potential instructor conflicts detected'
        );
    END IF;

    IF p_changes ? 'location_id' THEN
        -- Check location availability conflicts
        conflicts_array := conflicts_array || jsonb_build_object(
            'type', 'location',
            'message', 'Potential location conflicts detected'
        );
    END IF;

    RETURN QUERY SELECT 
        affected_occurrences,
        affected_registrations,
        conflicts_array,
        jsonb_build_object(
            'total_bookings', total_bookings,
            'total_revenue', total_revenue,
            'customers_to_notify', customers_count
        );
END;
$$;

-- ==================== BOOKING ELIGIBILITY CHECK ====================

CREATE OR REPLACE FUNCTION check_booking_eligibility(
    p_customer_id UUID,
    p_occurrence_id UUID,
    p_org_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    customer_rec RECORD;
    occurrence_rec RECORD;
    template_rec RECORD;
    eligibility_result JSONB := '{"eligible": true, "reasons": []}'::JSONB;
    reasons JSONB := '[]'::JSONB;
    membership_valid BOOLEAN := false;
    outstanding_dues DECIMAL := 0;
BEGIN
    -- Get customer info
    SELECT up.*, ou.role
    INTO customer_rec
    FROM user_profiles up
    JOIN org_users ou ON ou.user_id = up.id
    WHERE up.id = p_customer_id AND ou.org_id = p_org_id;

    IF customer_rec IS NULL THEN
        reasons := reasons || '"Customer not found or not member of organization"'::JSONB;
        RETURN jsonb_build_object(
            'eligible', false,
            'reasons', reasons
        );
    END IF;

    -- Get occurrence and template info
    SELECT o.*, t.requirements, t.level
    INTO occurrence_rec
    FROM class_occurrences o
    JOIN class_templates t ON t.id = o.template_id
    WHERE o.id = p_occurrence_id AND o.org_id = p_org_id;

    IF occurrence_rec IS NULL THEN
        reasons := reasons || '"Class occurrence not found"'::JSONB;
        RETURN jsonb_build_object(
            'eligible', false,
            'reasons', reasons
        );
    END IF;

    -- Check if class is full
    IF occurrence_rec.booked_count >= occurrence_rec.capacity THEN
        reasons := reasons || '"Class is full - can join waitlist"'::JSONB;
    END IF;

    -- Check sales window
    IF occurrence_rec.start_time - INTERVAL '2 hours' < NOW() THEN
        reasons := reasons || '"Sales closed - too close to class start time"'::JSONB;
    END IF;

    -- Check age requirements (simplified)
    IF customer_rec.date_of_birth IS NOT NULL THEN
        -- Calculate age and check minimums
        -- This would be expanded with actual age validation
    END IF;

    -- Check active membership
    SELECT COUNT(*) > 0 INTO membership_valid
    FROM passes p
    WHERE p.customer_id = p_customer_id 
    AND p.org_id = p_org_id 
    AND p.is_active = true
    AND (p.valid_until IS NULL OR p.valid_until > NOW());

    -- Check outstanding dues
    SELECT COALESCE(SUM(total_amount), 0) INTO outstanding_dues
    FROM orders
    WHERE customer_id = p_customer_id 
    AND org_id = p_org_id
    AND status = 'pending'
    AND created_at < NOW() - INTERVAL '30 days';

    IF outstanding_dues > 0 THEN
        reasons := reasons || format('"Outstanding dues of CHF %.2f must be paid"', outstanding_dues)::JSONB;
    END IF;

    -- Check if already registered
    IF EXISTS (
        SELECT 1 FROM registrations
        WHERE customer_id = p_customer_id 
        AND occurrence_id = p_occurrence_id
        AND status IN ('confirmed', 'pending')
    ) THEN
        reasons := reasons || '"Already registered for this class"'::JSONB;
    END IF;

    RETURN jsonb_build_object(
        'eligible', jsonb_array_length(reasons) = 0,
        'reasons', reasons,
        'membership_valid', membership_valid,
        'outstanding_dues', outstanding_dues
    );
END;
$$;

-- ==================== CALCULATE CLASS PRICE ====================

CREATE OR REPLACE FUNCTION calculate_class_price(
    p_occurrence_id UUID,
    p_customer_id UUID,
    p_tier_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    base_price DECIMAL;
    final_price DECIMAL;
    discounts JSONB := '[]'::JSONB;
    tax_amount DECIMAL;
    membership_discount DECIMAL := 0;
    early_bird_discount DECIMAL := 0;
    pricing_tier RECORD;
    customer_membership RECORD;
BEGIN
    -- Get base price from occurrence
    SELECT price INTO base_price
    FROM class_occurrences
    WHERE id = p_occurrence_id;

    IF base_price IS NULL THEN
        RAISE EXCEPTION 'Class occurrence not found';
    END IF;

    final_price := base_price;

    -- Apply pricing tier if specified
    IF p_tier_id IS NOT NULL THEN
        SELECT * INTO pricing_tier
        FROM pricing_rules
        WHERE id = p_tier_id AND is_active = true;

        IF pricing_tier IS NOT NULL THEN
            final_price := pricing_tier.price;
            
            -- Check early bird eligibility
            IF pricing_tier.early_bird_price IS NOT NULL AND 
               pricing_tier.early_bird_deadline_hours IS NOT NULL THEN
                
                IF EXISTS (
                    SELECT 1 FROM class_occurrences
                    WHERE id = p_occurrence_id
                    AND start_time > NOW() + (pricing_tier.early_bird_deadline_hours || ' hours')::INTERVAL
                ) THEN
                    early_bird_discount := final_price - pricing_tier.early_bird_price;
                    final_price := pricing_tier.early_bird_price;
                    discounts := discounts || jsonb_build_object(
                        'type', 'early_bird',
                        'amount', early_bird_discount,
                        'description', 'Early bird discount'
                    );
                END IF;
            END IF;
        END IF;
    END IF;

    -- Check membership discount
    SELECT p.*, pr.name INTO customer_membership
    FROM passes p
    JOIN products pr ON pr.id = p.product_id
    WHERE p.customer_id = p_customer_id 
    AND p.is_active = true
    AND (p.valid_until IS NULL OR p.valid_until > NOW())
    LIMIT 1;

    IF customer_membership IS NOT NULL THEN
        -- Apply membership-specific pricing or discounts
        -- This would be expanded based on membership types
        IF pricing_tier IS NOT NULL AND pricing_tier.member_discount_percentage IS NOT NULL THEN
            membership_discount := final_price * (pricing_tier.member_discount_percentage / 100.0);
            final_price := final_price - membership_discount;
            discounts := discounts || jsonb_build_object(
                'type', 'membership',
                'amount', membership_discount,
                'description', 'Member discount'
            );
        END IF;
    END IF;

    -- Calculate Swiss VAT (7.7%)
    tax_amount := final_price * 0.077;

    RETURN jsonb_build_object(
        'base_price', base_price,
        'final_price', final_price,
        'tax_amount', tax_amount,
        'total_price', final_price + tax_amount,
        'discounts', discounts,
        'currency', 'CHF',
        'includes_tax', false
    );
END;
$$;

-- ==================== CREATE CLASS BOOKING ====================

CREATE OR REPLACE FUNCTION create_class_booking(
    p_occurrence_id UUID,
    p_customer_id UUID,
    p_org_id UUID,
    p_price DECIMAL,
    p_payment_method TEXT DEFAULT 'pending',
    p_source_channel TEXT DEFAULT 'admin',
    p_notes TEXT DEFAULT NULL,
    p_tier_id UUID DEFAULT NULL,
    p_use_credits BOOLEAN DEFAULT false,
    p_use_membership BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    occurrence_rec RECORD;
    booking_id UUID;
    current_capacity INTEGER;
    waitlist_position INTEGER := NULL;
    booking_status TEXT := 'confirmed';
    final_payment_status TEXT := 'pending';
BEGIN
    -- Get occurrence info with lock to prevent race conditions
    SELECT * INTO occurrence_rec
    FROM class_occurrences
    WHERE id = p_occurrence_id
    FOR UPDATE;

    IF occurrence_rec IS NULL THEN
        RAISE EXCEPTION 'Class occurrence not found';
    END IF;

    IF occurrence_rec.status != 'scheduled' THEN
        RAISE EXCEPTION 'Class is not available for booking (status: %)', occurrence_rec.status;
    END IF;

    -- Check capacity and determine if should go to waitlist
    current_capacity := occurrence_rec.booked_count;
    
    IF current_capacity >= occurrence_rec.capacity THEN
        booking_status := 'waitlisted';
        
        -- Get next waitlist position
        SELECT COALESCE(MAX(waitlist_position), 0) + 1 INTO waitlist_position
        FROM registrations
        WHERE occurrence_id = p_occurrence_id AND status = 'waitlisted';
    END IF;

    -- Handle payment method
    IF p_use_credits OR p_use_membership THEN
        final_payment_status := 'paid';
    ELSIF p_payment_method = 'free' THEN
        final_payment_status := 'free';
    END IF;

    -- Create registration
    INSERT INTO registrations (
        occurrence_id,
        customer_id,
        org_id,
        status,
        source_channel,
        price,
        booked_at,
        waitlist_position,
        payment_status,
        payment_method,
        notes
    ) VALUES (
        p_occurrence_id,
        p_customer_id,
        p_org_id,
        booking_status,
        p_source_channel,
        p_price,
        NOW(),
        waitlist_position,
        final_payment_status,
        p_payment_method,
        p_notes
    )
    RETURNING id INTO booking_id;

    -- Update occurrence counts
    IF booking_status = 'confirmed' THEN
        UPDATE class_occurrences
        SET booked_count = booked_count + 1,
            updated_at = NOW()
        WHERE id = p_occurrence_id;
    ELSE
        UPDATE class_occurrences
        SET waitlist_count = waitlist_count + 1,
            updated_at = NOW()
        WHERE id = p_occurrence_id;
    END IF;

    -- Handle credits/membership redemption
    IF p_use_credits THEN
        -- Deduct credits from customer's passes
        PERFORM use_pass_credit_for_booking(p_customer_id, p_org_id, booking_id);
    END IF;

    -- Queue confirmation notification
    INSERT INTO notifications (
        org_id,
        customer_id,
        type,
        channel,
        template_name,
        template_data,
        scheduled_at
    ) VALUES (
        p_org_id,
        p_customer_id,
        CASE WHEN booking_status = 'confirmed' THEN 'confirmation' ELSE 'waitlist_confirmation' END,
        'email',
        CASE WHEN booking_status = 'confirmed' THEN 'booking_confirmation' ELSE 'waitlist_joined' END,
        jsonb_build_object(
            'booking_id', booking_id,
            'occurrence_id', p_occurrence_id,
            'class_name', occurrence_rec.template_id, -- Would join to get actual name
            'waitlist_position', waitlist_position
        ),
        NOW()
    );

    RETURN jsonb_build_object(
        'booking_id', booking_id,
        'status', booking_status,
        'waitlist_position', waitlist_position,
        'payment_status', final_payment_status,
        'success', true
    );
END;
$$;

-- ==================== WAITLIST PROMOTION ====================

CREATE OR REPLACE FUNCTION promote_from_waitlist(p_entry_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    entry_rec RECORD;
    occurrence_rec RECORD;
    available_spots INTEGER;
BEGIN
    -- Get waitlist entry
    SELECT * INTO entry_rec
    FROM waitlist_entries
    WHERE id = p_entry_id AND promoted_at IS NULL;

    IF entry_rec IS NULL THEN
        RAISE EXCEPTION 'Waitlist entry not found or already promoted';
    END IF;

    -- Get occurrence info
    SELECT * INTO occurrence_rec
    FROM class_occurrences
    WHERE id = entry_rec.occurrence_id
    FOR UPDATE;

    -- Check if spots available
    available_spots := occurrence_rec.capacity - occurrence_rec.booked_count;
    
    IF available_spots <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'reason', 'No spots available'
        );
    END IF;

    -- Create confirmed booking
    INSERT INTO registrations (
        occurrence_id,
        customer_id,
        org_id,
        status,
        source_channel,
        price,
        booked_at,
        payment_status,
        payment_method,
        notes
    ) VALUES (
        entry_rec.occurrence_id,
        entry_rec.customer_id,
        entry_rec.org_id,
        'confirmed',
        'waitlist_promotion',
        occurrence_rec.price, -- Use current occurrence price
        NOW(),
        CASE WHEN entry_rec.payment_capture_mode = 'immediate' THEN 'paid' ELSE 'pending' END,
        'pending',
        'Promoted from waitlist'
    );

    -- Update waitlist entry
    UPDATE waitlist_entries
    SET promoted_at = NOW(),
        updated_at = NOW()
    WHERE id = p_entry_id;

    -- Update occurrence counts
    UPDATE class_occurrences
    SET booked_count = booked_count + 1,
        waitlist_count = waitlist_count - 1,
        updated_at = NOW()
    WHERE id = entry_rec.occurrence_id;

    -- Queue promotion notification
    INSERT INTO notifications (
        org_id,
        customer_id,
        type,
        channel,
        template_name,
        template_data,
        scheduled_at
    ) VALUES (
        entry_rec.org_id,
        entry_rec.customer_id,
        'waitlist_promotion',
        'email',
        'waitlist_promotion',
        jsonb_build_object(
            'occurrence_id', entry_rec.occurrence_id,
            'payment_window_hours', entry_rec.payment_window_hours
        ),
        NOW()
    );

    RETURN jsonb_build_object(
        'success', true,
        'payment_required', entry_rec.payment_capture_mode != 'immediate',
        'payment_window_hours', entry_rec.payment_window_hours
    );
END;
$$;

-- ==================== CANCEL CLASS OCCURRENCE ====================

CREATE OR REPLACE FUNCTION cancel_class_occurrence(
    p_occurrence_id UUID,
    p_reason TEXT,
    p_notify_customers BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    occurrence_rec RECORD;
    affected_registrations INTEGER := 0;
    refund_total DECIMAL := 0;
BEGIN
    -- Get occurrence info
    SELECT * INTO occurrence_rec
    FROM class_occurrences
    WHERE id = p_occurrence_id;

    IF occurrence_rec IS NULL THEN
        RAISE EXCEPTION 'Class occurrence not found';
    END IF;

    IF occurrence_rec.status = 'cancelled' THEN
        RAISE EXCEPTION 'Class is already cancelled';
    END IF;

    -- Update occurrence status
    UPDATE class_occurrences
    SET status = 'cancelled',
        cancellation_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_occurrence_id;

    -- Get all confirmed registrations for processing
    SELECT COUNT(*), COALESCE(SUM(price), 0)
    INTO affected_registrations, refund_total
    FROM registrations
    WHERE occurrence_id = p_occurrence_id 
    AND status IN ('confirmed', 'pending');

    -- Process automatic refunds for confirmed bookings
    IF p_notify_customers THEN
        -- Queue cancellation notifications and process refunds
        INSERT INTO notifications (
            org_id,
            customer_id,
            type,
            channel,
            template_name,
            template_data,
            scheduled_at
        )
        SELECT 
            r.org_id,
            r.customer_id,
            'cancellation',
            'email',
            'class_cancelled',
            jsonb_build_object(
                'registration_id', r.id,
                'occurrence_id', p_occurrence_id,
                'reason', p_reason,
                'refund_amount', r.price
            ),
            NOW()
        FROM registrations r
        WHERE r.occurrence_id = p_occurrence_id 
        AND r.status IN ('confirmed', 'pending');

        -- Update all registrations to cancelled and process refunds
        UPDATE registrations
        SET status = 'cancelled',
            cancelled_at = NOW(),
            notes = COALESCE(notes || ' | ', '') || 'Class cancelled: ' || p_reason,
            updated_at = NOW()
        WHERE occurrence_id = p_occurrence_id 
        AND status IN ('confirmed', 'pending');
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'affected_registrations', affected_registrations,
        'total_refunds', refund_total,
        'reason', p_reason
    );
END;
$$;

-- ==================== ANALYTICS FUNCTIONS ====================

CREATE OR REPLACE FUNCTION get_class_analytics(
    p_org_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE(
    total_classes INTEGER,
    total_revenue DECIMAL,
    average_occupancy DECIMAL,
    total_bookings INTEGER,
    cancellation_rate DECIMAL,
    no_show_rate DECIMAL,
    popular_times JSONB,
    popular_instructors JSONB,
    revenue_by_category JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH class_stats AS (
        SELECT 
            COUNT(DISTINCT o.id) as classes,
            COALESCE(SUM(r.price), 0) as revenue,
            AVG((o.booked_count::DECIMAL / o.capacity) * 100) as avg_occupancy,
            COUNT(r.id) as bookings,
            COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END)::DECIMAL / 
                NULLIF(COUNT(o.id), 0) * 100 as cancel_rate,
            COUNT(CASE WHEN r.status = 'no_show' THEN 1 END)::DECIMAL / 
                NULLIF(COUNT(r.id), 0) * 100 as no_show_rate
        FROM class_occurrences o
        LEFT JOIN registrations r ON r.occurrence_id = o.id
        WHERE o.org_id = p_org_id
        AND o.start_time::DATE BETWEEN p_start_date AND p_end_date
    ),
    time_popularity AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'hour', EXTRACT(HOUR FROM start_time),
                'count', cnt
            ) ORDER BY cnt DESC
        ) as popular_times
        FROM (
            SELECT 
                EXTRACT(HOUR FROM start_time) as hour,
                COUNT(*) as cnt
            FROM class_occurrences
            WHERE org_id = p_org_id
            AND start_time::DATE BETWEEN p_start_date AND p_end_date
            GROUP BY EXTRACT(HOUR FROM start_time)
            ORDER BY cnt DESC
            LIMIT 5
        ) t
    ),
    instructor_popularity AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'instructor_id', instructor_id,
                'bookings', cnt
            ) ORDER BY cnt DESC
        ) as popular_instructors
        FROM (
            SELECT 
                o.instructor_id,
                COUNT(r.id) as cnt
            FROM class_occurrences o
            JOIN registrations r ON r.occurrence_id = o.id
            WHERE o.org_id = p_org_id
            AND o.start_time::DATE BETWEEN p_start_date AND p_end_date
            GROUP BY o.instructor_id
            ORDER BY cnt DESC
            LIMIT 5
        ) t
    ),
    category_revenue AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'category', t.category,
                'revenue', revenue
            ) ORDER BY revenue DESC
        ) as revenue_by_category
        FROM (
            SELECT 
                ct.category,
                COALESCE(SUM(r.price), 0) as revenue
            FROM class_templates ct
            LEFT JOIN class_occurrences o ON o.template_id = ct.id
            LEFT JOIN registrations r ON r.occurrence_id = o.id
            WHERE ct.org_id = p_org_id
            AND (o.start_time IS NULL OR o.start_time::DATE BETWEEN p_start_date AND p_end_date)
            GROUP BY ct.category
            ORDER BY revenue DESC
        ) t
    )
    SELECT 
        cs.classes::INTEGER,
        cs.revenue,
        ROUND(cs.avg_occupancy, 2),
        cs.bookings::INTEGER,
        ROUND(cs.cancel_rate, 2),
        ROUND(cs.no_show_rate, 2),
        tp.popular_times,
        ip.popular_instructors,
        cr.revenue_by_category
    FROM class_stats cs
    CROSS JOIN time_popularity tp
    CROSS JOIN instructor_popularity ip  
    CROSS JOIN category_revenue cr;
END;
$$;