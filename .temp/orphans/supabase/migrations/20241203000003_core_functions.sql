-- =====================================================
-- YogaSwiss Core Functions Migration
-- Migration: 20241203000003_core_functions
-- Essential business logic functions
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
    v_available_spots INTEGER;
    v_current_registrations INTEGER;
    v_wallet_balance INTEGER := 0;
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
-- DATABASE VERIFICATION FUNCTION
-- =====================================================

-- Create verification function
CREATE OR REPLACE FUNCTION verify_database_setup()
RETURNS JSONB AS $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    function_count INTEGER;
    trigger_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name NOT LIKE 'pg_%'
    AND table_name NOT LIKE 'sql_%';
    
    -- Count indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public';
    
    -- Count functions
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION';
    
    -- Count triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public';
    
    RETURN jsonb_build_object(
        'success', true,
        'tables_created', table_count,
        'indexes_created', index_count,
        'functions_created', function_count,
        'triggers_created', trigger_count,
        'setup_completed_at', NOW(),
        'message', 'YogaSwiss database setup completed successfully!'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;