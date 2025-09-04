-- =====================================================
-- YogaSwiss Core Business Functions
-- Essential stored procedures and functions
-- =====================================================

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number(org_id UUID)
RETURNS TEXT AS $$
DECLARE
    prefix TEXT;
    counter INTEGER;
    year_suffix TEXT;
BEGIN
    -- Get organization slug for prefix
    SELECT UPPER(LEFT(slug, 3)) INTO prefix
    FROM organizations WHERE id = org_id;
    
    -- Get current year suffix
    year_suffix := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2);
    
    -- Get next counter for this organization and year
    SELECT COALESCE(MAX(
        CASE 
            WHEN order_number ~ ('^' || prefix || year_suffix || '[0-9]+$')
            THEN SUBSTRING(order_number FROM (LENGTH(prefix || year_suffix) + 1))::INTEGER
            ELSE 0
        END
    ), 0) + 1
    INTO counter
    FROM orders 
    WHERE organization_id = org_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    
    RETURN prefix || year_suffix || LPAD(counter::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(org_id UUID)
RETURNS TEXT AS $$
DECLARE
    prefix TEXT;
    counter INTEGER;
    year_suffix TEXT;
BEGIN
    SELECT UPPER(LEFT(slug, 3)) INTO prefix
    FROM organizations WHERE id = org_id;
    
    year_suffix := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2);
    
    SELECT COALESCE(MAX(
        CASE 
            WHEN invoice_number ~ ('^INV-' || prefix || year_suffix || '[0-9]+$')
            THEN SUBSTRING(invoice_number FROM (LENGTH('INV-' || prefix || year_suffix) + 1))::INTEGER
            ELSE 0
        END
    ), 0) + 1
    INTO counter
    FROM invoices 
    WHERE organization_id = org_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    
    RETURN 'INV-' || prefix || year_suffix || LPAD(counter::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CLASS MANAGEMENT FUNCTIONS
-- =====================================================

-- Book a class
CREATE OR REPLACE FUNCTION book_class(
    p_class_instance_id UUID,
    p_customer_id UUID,
    p_payment_method payment_method DEFAULT 'wallet',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_class_info RECORD;
    v_registration_id UUID;
    v_wallet_id UUID;
    v_order_id UUID;
    v_available_spots INTEGER;
    v_current_registrations INTEGER;
    v_wallet_balance INTEGER := 0;
    v_result JSONB;
BEGIN
    -- Get class information
    SELECT 
        ci.id,
        ci.organization_id,
        ci.capacity,
        ci.price_cents,
        ci.status,
        ci.start_time
    INTO v_class_info
    FROM class_instances ci
    WHERE ci.id = p_class_instance_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Class not found'
        );
    END IF;
    
    -- Check if class is bookable
    IF v_class_info.status != 'scheduled' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Class is not available for booking'
        );
    END IF;
    
    -- Check if booking window is still open (24h before class)
    IF v_class_info.start_time <= NOW() + INTERVAL '24 hours' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Booking window has closed'
        );
    END IF;
    
    -- Check if already registered
    IF EXISTS (
        SELECT 1 FROM class_registrations 
        WHERE class_instance_id = p_class_instance_id 
        AND customer_id = p_customer_id
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Already registered for this class'
        );
    END IF;
    
    -- Count current registrations
    SELECT COUNT(*) INTO v_current_registrations
    FROM class_registrations
    WHERE class_instance_id = p_class_instance_id
    AND status = 'confirmed';
    
    v_available_spots := v_class_info.capacity - v_current_registrations;
    
    -- If no spots available, add to waitlist
    IF v_available_spots <= 0 THEN
        INSERT INTO waitlists (
            class_instance_id,
            customer_id,
            organization_id,
            position
        ) VALUES (
            p_class_instance_id,
            p_customer_id,
            v_class_info.organization_id,
            (SELECT COALESCE(MAX(position), 0) + 1 FROM waitlists WHERE class_instance_id = p_class_instance_id)
        );
        
        RETURN jsonb_build_object(
            'success', true,
            'status', 'waitlisted',
            'message', 'Added to waitlist'
        );
    END IF;
    
    -- Handle payment
    IF p_payment_method = 'wallet' AND v_class_info.price_cents > 0 THEN
        -- Check wallet balance
        SELECT id, credit_balance INTO v_wallet_id, v_wallet_balance
        FROM wallets
        WHERE customer_id = p_customer_id 
        AND organization_id = v_class_info.organization_id
        AND is_active = true
        ORDER BY expires_at ASC NULLS LAST
        LIMIT 1;
        
        IF v_wallet_balance < v_class_info.price_cents THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Insufficient wallet balance',
                'required', v_class_info.price_cents,
                'available', COALESCE(v_wallet_balance, 0)
            );
        END IF;
    END IF;
    
    -- Create the registration
    INSERT INTO class_registrations (
        class_instance_id,
        customer_id,
        organization_id,
        status,
        notes,
        payment_status,
        price_paid_cents,
        booking_source
    ) VALUES (
        p_class_instance_id,
        p_customer_id,
        v_class_info.organization_id,
        'confirmed',
        p_notes,
        CASE WHEN v_class_info.price_cents = 0 THEN 'paid' ELSE 'pending' END,
        v_class_info.price_cents,
        'portal'
    ) RETURNING id INTO v_registration_id;
    
    -- Handle wallet payment
    IF p_payment_method = 'wallet' AND v_class_info.price_cents > 0 THEN
        -- Deduct from wallet
        UPDATE wallets
        SET credit_balance = credit_balance - v_class_info.price_cents,
            last_used_at = NOW()
        WHERE id = v_wallet_id;
        
        -- Record transaction
        INSERT INTO wallet_transactions (
            wallet_id,
            organization_id,
            type,
            amount,
            balance_after,
            class_registration_id,
            description
        ) VALUES (
            v_wallet_id,
            v_class_info.organization_id,
            'debit',
            -v_class_info.price_cents,
            v_wallet_balance - v_class_info.price_cents,
            v_registration_id,
            'Class booking payment'
        );
        
        -- Update registration payment status
        UPDATE class_registrations
        SET payment_status = 'paid'
        WHERE id = v_registration_id;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'status', 'confirmed',
        'registration_id', v_registration_id,
        'spots_remaining', v_available_spots - 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cancel a class registration
CREATE OR REPLACE FUNCTION cancel_class_registration(
    p_registration_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_registration RECORD;
    v_refund_amount INTEGER := 0;
    v_wallet_id UUID;
    v_next_waitlist RECORD;
BEGIN
    -- Get registration details
    SELECT 
        cr.id,
        cr.class_instance_id,
        cr.customer_id,
        cr.organization_id,
        cr.status,
        cr.price_paid_cents,
        cr.payment_status,
        ci.start_time,
        ci.capacity
    INTO v_registration
    FROM class_registrations cr
    JOIN class_instances ci ON ci.id = cr.class_instance_id
    WHERE cr.id = p_registration_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Registration not found'
        );
    END IF;
    
    IF v_registration.status = 'cancelled' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Registration already cancelled'
        );
    END IF;
    
    -- Check cancellation window (24h before class)
    IF v_registration.start_time <= NOW() + INTERVAL '24 hours' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cancellation window has closed'
        );
    END IF;
    
    -- Calculate refund (full refund if cancelled 24h+ before)
    IF v_registration.payment_status = 'paid' AND v_registration.price_paid_cents > 0 THEN
        v_refund_amount := v_registration.price_paid_cents;
        
        -- Find customer's wallet
        SELECT id INTO v_wallet_id
        FROM wallets
        WHERE customer_id = v_registration.customer_id
        AND organization_id = v_registration.organization_id
        AND is_active = true
        LIMIT 1;
        
        -- If no wallet exists, create one
        IF v_wallet_id IS NULL THEN
            INSERT INTO wallets (
                customer_id,
                organization_id,
                credit_balance
            ) VALUES (
                v_registration.customer_id,
                v_registration.organization_id,
                0
            ) RETURNING id INTO v_wallet_id;
        END IF;
        
        -- Add refund to wallet
        UPDATE wallets
        SET credit_balance = credit_balance + v_refund_amount
        WHERE id = v_wallet_id;
        
        -- Record transaction
        INSERT INTO wallet_transactions (
            wallet_id,
            organization_id,
            type,
            amount,
            balance_after,
            class_registration_id,
            description
        ) VALUES (
            v_wallet_id,
            v_registration.organization_id,
            'refund',
            v_refund_amount,
            (SELECT credit_balance FROM wallets WHERE id = v_wallet_id),
            v_registration.id,
            'Class cancellation refund'
        );
    END IF;
    
    -- Cancel the registration
    UPDATE class_registrations
    SET 
        status = 'cancelled',
        cancelled_at = NOW(),
        cancellation_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_registration_id;
    
    -- Promote from waitlist if available
    SELECT 
        w.id,
        w.customer_id,
        w.position
    INTO v_next_waitlist
    FROM waitlists w
    WHERE w.class_instance_id = v_registration.class_instance_id
    ORDER BY w.position ASC
    LIMIT 1;
    
    IF FOUND THEN
        -- Create registration for waitlisted customer
        INSERT INTO class_registrations (
            class_instance_id,
            customer_id,
            organization_id,
            status,
            payment_status,
            price_paid_cents,
            booking_source
        ) VALUES (
            v_registration.class_instance_id,
            v_next_waitlist.customer_id,
            v_registration.organization_id,
            'confirmed',
            'pending',
            v_registration.price_paid_cents,
            'waitlist_promotion'
        );
        
        -- Remove from waitlist
        DELETE FROM waitlists WHERE id = v_next_waitlist.id;
        
        -- Update other waitlist positions
        UPDATE waitlists
        SET position = position - 1
        WHERE class_instance_id = v_registration.class_instance_id
        AND position > v_next_waitlist.position;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'refund_amount', v_refund_amount,
        'waitlist_promoted', v_next_waitlist.customer_id IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- WALLET MANAGEMENT FUNCTIONS
-- =====================================================

-- Add credits to wallet
CREATE OR REPLACE FUNCTION add_wallet_credits(
    p_customer_id UUID,
    p_organization_id UUID,
    p_product_id UUID,
    p_credits INTEGER,
    p_order_id UUID DEFAULT NULL,
    p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_wallet_id UUID;
    v_new_balance INTEGER;
BEGIN
    -- Find or create wallet for this product
    SELECT id INTO v_wallet_id
    FROM wallets
    WHERE customer_id = p_customer_id
    AND organization_id = p_organization_id
    AND product_id = p_product_id;
    
    IF v_wallet_id IS NULL THEN
        INSERT INTO wallets (
            customer_id,
            organization_id,
            product_id,
            credit_balance,
            expires_at
        ) VALUES (
            p_customer_id,
            p_organization_id,
            p_product_id,
            p_credits,
            p_expires_at
        ) RETURNING id, credit_balance INTO v_wallet_id, v_new_balance;
    ELSE
        UPDATE wallets
        SET 
            credit_balance = credit_balance + p_credits,
            expires_at = COALESCE(p_expires_at, expires_at),
            is_active = true
        WHERE id = v_wallet_id
        RETURNING credit_balance INTO v_new_balance;
    END IF;
    
    -- Record transaction
    INSERT INTO wallet_transactions (
        wallet_id,
        organization_id,
        type,
        amount,
        balance_after,
        order_id,
        description
    ) VALUES (
        v_wallet_id,
        p_organization_id,
        'credit',
        p_credits,
        v_new_balance,
        p_order_id,
        'Credits added to wallet'
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'wallet_id', v_wallet_id,
        'new_balance', v_new_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ORDER PROCESSING FUNCTIONS
-- =====================================================

-- Create order with items
CREATE OR REPLACE FUNCTION create_order_with_items(
    p_organization_id UUID,
    p_customer_id UUID,
    p_items JSONB, -- Array of {product_id, quantity, unit_price_cents}
    p_customer_email TEXT DEFAULT NULL,
    p_customer_name TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_subtotal INTEGER := 0;
    v_tax INTEGER := 0;
    v_total INTEGER := 0;
    v_item JSONB;
    v_product_name TEXT;
BEGIN
    -- Generate order number
    v_order_number := generate_order_number(p_organization_id);
    
    -- Create order
    INSERT INTO orders (
        organization_id,
        customer_id,
        order_number,
        customer_email,
        customer_name,
        status
    ) VALUES (
        p_organization_id,
        p_customer_id,
        v_order_number,
        p_customer_email,
        p_customer_name,
        'pending'
    ) RETURNING id INTO v_order_id;
    
    -- Add order items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Get product name
        SELECT name->>'en' INTO v_product_name
        FROM products
        WHERE id = (v_item->>'product_id')::UUID;
        
        -- Calculate item total
        v_subtotal := v_subtotal + ((v_item->>'quantity')::INTEGER * (v_item->>'unit_price_cents')::INTEGER);
        
        INSERT INTO order_items (
            order_id,
            product_id,
            name,
            quantity,
            unit_price_cents,
            total_price_cents
        ) VALUES (
            v_order_id,
            (v_item->>'product_id')::UUID,
            COALESCE(v_product_name, 'Product'),
            (v_item->>'quantity')::INTEGER,
            (v_item->>'unit_price_cents')::INTEGER,
            (v_item->>'quantity')::INTEGER * (v_item->>'unit_price_cents')::INTEGER
        );
    END LOOP;
    
    -- Calculate tax (Swiss VAT 7.7%)
    v_tax := ROUND(v_subtotal * 0.077);
    v_total := v_subtotal + v_tax;
    
    -- Update order totals
    UPDATE orders
    SET 
        subtotal_cents = v_subtotal,
        tax_cents = v_tax,
        total_cents = v_total,
        updated_at = NOW()
    WHERE id = v_order_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'total_cents', v_total
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INSTRUCTOR FUNCTIONS
-- =====================================================

-- Calculate instructor earnings for period
CREATE OR REPLACE FUNCTION calculate_instructor_earnings(
    p_instructor_id UUID,
    p_period_start DATE,
    p_period_end DATE
)
RETURNS JSONB AS $$
DECLARE
    v_total_classes INTEGER := 0;
    v_total_hours DECIMAL := 0;
    v_base_earnings INTEGER := 0;
    v_bonus_earnings INTEGER := 0;
    v_total_earnings INTEGER := 0;
    v_instructor_rate INTEGER;
BEGIN
    -- Get instructor's hourly rate
    SELECT hourly_rate_cents INTO v_instructor_rate
    FROM instructors
    WHERE id = p_instructor_id;
    
    -- Calculate from approved timesheets
    SELECT 
        COUNT(*),
        COALESCE(SUM(hours_worked), 0),
        COALESCE(SUM(total_amount_cents), 0)
    INTO v_total_classes, v_total_hours, v_base_earnings
    FROM timesheets
    WHERE instructor_id = p_instructor_id
    AND DATE(start_time) BETWEEN p_period_start AND p_period_end
    AND status = 'approved';
    
    -- Calculate bonuses (example: 10% bonus if teaching 20+ classes)
    IF v_total_classes >= 20 THEN
        v_bonus_earnings := ROUND(v_base_earnings * 0.10);
    END IF;
    
    v_total_earnings := v_base_earnings + v_bonus_earnings;
    
    -- Create or update earnings record
    INSERT INTO earnings (
        organization_id,
        instructor_id,
        period_start,
        period_end,
        base_amount_cents,
        bonus_amount_cents,
        total_amount_cents,
        status
    ) VALUES (
        (SELECT organization_id FROM instructors WHERE id = p_instructor_id),
        p_instructor_id,
        p_period_start,
        p_period_end,
        v_base_earnings,
        v_bonus_earnings,
        v_total_earnings,
        'calculated'
    ) ON CONFLICT (instructor_id, period_start, period_end) DO UPDATE SET
        base_amount_cents = EXCLUDED.base_amount_cents,
        bonus_amount_cents = EXCLUDED.bonus_amount_cents,
        total_amount_cents = EXCLUDED.total_amount_cents,
        updated_at = NOW();
    
    RETURN jsonb_build_object(
        'success', true,
        'instructor_id', p_instructor_id,
        'period_start', p_period_start,
        'period_end', p_period_end,
        'total_classes', v_total_classes,
        'total_hours', v_total_hours,
        'base_earnings_cents', v_base_earnings,
        'bonus_earnings_cents', v_bonus_earnings,
        'total_earnings_cents', v_total_earnings
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

-- Get organization metrics
CREATE OR REPLACE FUNCTION get_organization_metrics(
    p_organization_id UUID,
    p_period_start DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_period_end DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
    v_total_revenue INTEGER := 0;
    v_total_bookings INTEGER := 0;
    v_total_customers INTEGER := 0;
    v_total_classes INTEGER := 0;
    v_avg_class_attendance DECIMAL := 0;
    v_wallet_balance INTEGER := 0;
BEGIN
    -- Total revenue from payments
    SELECT COALESCE(SUM(amount_cents), 0) INTO v_total_revenue
    FROM payments
    WHERE organization_id = p_organization_id
    AND status = 'paid'
    AND DATE(confirmed_at) BETWEEN p_period_start AND p_period_end;
    
    -- Total bookings
    SELECT COUNT(*) INTO v_total_bookings
    FROM class_registrations
    WHERE organization_id = p_organization_id
    AND status IN ('confirmed', 'checked_in')
    AND DATE(registered_at) BETWEEN p_period_start AND p_period_end;
    
    -- Total unique customers
    SELECT COUNT(DISTINCT customer_id) INTO v_total_customers
    FROM class_registrations
    WHERE organization_id = p_organization_id
    AND DATE(registered_at) BETWEEN p_period_start AND p_period_end;
    
    -- Total classes offered
    SELECT COUNT(*) INTO v_total_classes
    FROM class_instances
    WHERE organization_id = p_organization_id
    AND DATE(start_time) BETWEEN p_period_start AND p_period_end;
    
    -- Average class attendance
    SELECT COALESCE(AVG(attendance_count), 0) INTO v_avg_class_attendance
    FROM (
        SELECT COUNT(*) as attendance_count
        FROM class_registrations cr
        JOIN class_instances ci ON ci.id = cr.class_instance_id
        WHERE ci.organization_id = p_organization_id
        AND cr.status IN ('confirmed', 'checked_in')
        AND DATE(ci.start_time) BETWEEN p_period_start AND p_period_end
        GROUP BY ci.id
    ) sub;
    
    -- Total wallet balance
    SELECT COALESCE(SUM(credit_balance), 0) INTO v_wallet_balance
    FROM wallets
    WHERE organization_id = p_organization_id
    AND is_active = true;
    
    RETURN jsonb_build_object(
        'period_start', p_period_start,
        'period_end', p_period_end,
        'total_revenue_cents', v_total_revenue,
        'total_bookings', v_total_bookings,
        'total_customers', v_total_customers,
        'total_classes', v_total_classes,
        'avg_class_attendance', v_avg_class_attendance,
        'total_wallet_balance_cents', v_wallet_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AUTOMATED TASKS
-- =====================================================

-- Process expired wallets
CREATE OR REPLACE FUNCTION process_expired_wallets()
RETURNS JSONB AS $$
DECLARE
    v_expired_count INTEGER := 0;
    v_expired_credits INTEGER := 0;
BEGIN
    -- Deactivate expired wallets and record transactions
    WITH expired_wallets AS (
        UPDATE wallets
        SET is_active = false
        WHERE expires_at < NOW()
        AND is_active = true
        RETURNING id, organization_id, credit_balance
    )
    INSERT INTO wallet_transactions (
        wallet_id,
        organization_id,
        type,
        amount,
        balance_after,
        description
    )
    SELECT 
        id,
        organization_id,
        'expiry',
        -credit_balance,
        0,
        'Wallet credits expired'
    FROM expired_wallets;
    
    GET DIAGNOSTICS v_expired_count = ROW_COUNT;
    
    -- Calculate total expired credits
    SELECT COALESCE(SUM(credit_balance), 0) INTO v_expired_credits
    FROM wallets
    WHERE expires_at < NOW() - INTERVAL '1 day'
    AND is_active = false;
    
    RETURN jsonb_build_object(
        'success', true,
        'expired_wallets', v_expired_count,
        'expired_credits_cents', v_expired_credits
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up old audit logs (keep 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS JSONB AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN jsonb_build_object(
        'success', true,
        'deleted_logs', v_deleted_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;