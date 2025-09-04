-- Stored Procedures for Finance Module
-- Comprehensive financial operations with strict business logic

-- Create Order with Items and Calculate Totals
CREATE OR REPLACE FUNCTION create_order_with_items(
    p_tenant_id UUID,
    p_customer_id UUID,
    p_studio_id UUID,
    p_location_id UUID,
    p_channel TEXT,
    p_customer_details JSONB,
    p_items JSONB[], -- Array of order items
    p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_item JSONB;
    v_item_id UUID;
    v_subtotal_cents BIGINT := 0;
    v_tax_total_cents BIGINT := 0;
    v_total_cents BIGINT := 0;
    v_tax_rate DECIMAL(5,3);
    v_item_tax_cents BIGINT;
    v_result JSONB;
BEGIN
    -- Generate order number
    v_order_number := 'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                      LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' ||
                      LPAD((RANDOM() * 9999)::INT::TEXT, 4, '0');
    
    -- Create order
    INSERT INTO orders (
        id, tenant_id, customer_id, studio_id, location_id,
        order_number, channel, status, currency,
        customer_email, customer_name, customer_address,
        metadata
    ) VALUES (
        gen_random_uuid(), p_tenant_id, p_customer_id, p_studio_id, p_location_id,
        v_order_number, p_channel, 'pending', 'CHF',
        p_customer_details->>'email',
        p_customer_details->>'name',
        p_customer_details->'address',
        p_metadata
    ) RETURNING id INTO v_order_id;
    
    -- Process each item
    FOREACH v_item IN ARRAY p_items
    LOOP
        -- Get applicable tax rate
        SELECT rate INTO v_tax_rate
        FROM tax_rates 
        WHERE tenant_id = p_tenant_id 
        AND valid_from <= NOW() 
        AND (valid_to IS NULL OR valid_to > NOW())
        AND region = 'CH'
        ORDER BY valid_from DESC
        LIMIT 1;
        
        v_tax_rate := COALESCE(v_tax_rate, 7.7); -- Default Swiss VAT
        
        -- Calculate tax for this item
        IF (v_item->>'tax_inclusive')::BOOLEAN THEN
            -- Tax included in price
            v_item_tax_cents := ROUND(
                (v_item->>'total_price_cents')::BIGINT * v_tax_rate / (100 + v_tax_rate)
            );
        ELSE
            -- Tax exclusive
            v_item_tax_cents := ROUND(
                (v_item->>'total_price_cents')::BIGINT * v_tax_rate / 100
            );
        END IF;
        
        -- Insert order item
        INSERT INTO order_items (
            order_id, tenant_id, item_type, name, description, sku,
            class_id, product_id, package_id, service_id,
            quantity, unit_price_cents, total_price_cents,
            tax_rate, tax_amount_cents, tax_inclusive,
            revenue_category_id, studio_id, location_id, instructor_id,
            metadata
        ) VALUES (
            v_order_id, p_tenant_id,
            v_item->>'item_type',
            v_item->>'name',
            v_item->>'description',
            v_item->>'sku',
            (v_item->>'class_id')::UUID,
            (v_item->>'product_id')::UUID,
            (v_item->>'package_id')::UUID,
            (v_item->>'service_id')::UUID,
            (v_item->>'quantity')::INTEGER,
            (v_item->>'unit_price_cents')::BIGINT,
            (v_item->>'total_price_cents')::BIGINT,
            v_tax_rate,
            v_item_tax_cents,
            (v_item->>'tax_inclusive')::BOOLEAN,
            (v_item->>'revenue_category_id')::UUID,
            p_studio_id,
            p_location_id,
            (v_item->>'instructor_id')::UUID,
            COALESCE(v_item->'metadata', '{}')
        ) RETURNING id INTO v_item_id;
        
        -- Update totals
        v_subtotal_cents := v_subtotal_cents + (v_item->>'total_price_cents')::BIGINT;
        v_tax_total_cents := v_tax_total_cents + v_item_tax_cents;
    END LOOP;
    
    v_total_cents := v_subtotal_cents;
    
    -- Update order totals
    UPDATE orders SET
        subtotal_cents = v_subtotal_cents,
        tax_total_cents = v_tax_total_cents,
        total_cents = v_total_cents,
        updated_at = NOW()
    WHERE id = v_order_id;
    
    -- Return order details
    SELECT jsonb_build_object(
        'order_id', v_order_id,
        'order_number', v_order_number,
        'subtotal_cents', v_subtotal_cents,
        'tax_total_cents', v_tax_total_cents,
        'total_cents', v_total_cents,
        'currency', 'CHF'
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process Payment for Order
CREATE OR REPLACE FUNCTION process_payment(
    p_tenant_id UUID,
    p_order_id UUID,
    p_payment_method TEXT,
    p_provider TEXT,
    p_provider_payment_id TEXT,
    p_amount_cents BIGINT,
    p_fee_amount_cents BIGINT DEFAULT 0,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    v_payment_id UUID;
    v_net_amount_cents BIGINT;
    v_order_total BIGINT;
    v_paid_amount BIGINT;
    v_remaining_amount BIGINT;
    v_result JSONB;
BEGIN
    -- Calculate net amount
    v_net_amount_cents := p_amount_cents - p_fee_amount_cents;
    
    -- Get order total and current paid amount
    SELECT 
        o.total_cents,
        COALESCE(SUM(p.amount_cents), 0) AS paid_amount
    INTO v_order_total, v_paid_amount
    FROM orders o
    LEFT JOIN payments p ON p.order_id = o.id AND p.status IN ('captured', 'authorized')
    WHERE o.id = p_order_id AND o.tenant_id = p_tenant_id
    GROUP BY o.total_cents;
    
    IF v_order_total IS NULL THEN
        RAISE EXCEPTION 'Order not found or access denied';
    END IF;
    
    v_remaining_amount := v_order_total - v_paid_amount;
    
    IF p_amount_cents > v_remaining_amount THEN
        RAISE EXCEPTION 'Payment amount exceeds remaining order balance';
    END IF;
    
    -- Create payment record
    INSERT INTO payments (
        id, tenant_id, order_id, method, provider, provider_payment_id,
        amount_cents, fee_amount_cents, net_amount_cents, currency,
        status, authorized_at, metadata
    ) VALUES (
        gen_random_uuid(), p_tenant_id, p_order_id, p_payment_method, p_provider, p_provider_payment_id,
        p_amount_cents, p_fee_amount_cents, v_net_amount_cents, 'CHF',
        'authorized', NOW(), p_metadata
    ) RETURNING id INTO v_payment_id;
    
    -- Check if order is fully paid
    v_paid_amount := v_paid_amount + p_amount_cents;
    
    IF v_paid_amount >= v_order_total THEN
        -- Mark order as completed
        UPDATE orders SET 
            status = 'completed',
            updated_at = NOW()
        WHERE id = p_order_id;
    END IF;
    
    -- Return payment details
    SELECT jsonb_build_object(
        'payment_id', v_payment_id,
        'status', 'authorized',
        'amount_cents', p_amount_cents,
        'net_amount_cents', v_net_amount_cents,
        'order_status', CASE WHEN v_paid_amount >= v_order_total THEN 'completed' ELSE 'pending' END,
        'remaining_amount_cents', GREATEST(0, v_order_total - v_paid_amount)
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Capture Payment
CREATE OR REPLACE FUNCTION capture_payment(
    p_tenant_id UUID,
    p_payment_id UUID,
    p_capture_amount_cents BIGINT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_payment payments%ROWTYPE;
    v_capture_amount BIGINT;
    v_result JSONB;
BEGIN
    -- Get payment details
    SELECT * INTO v_payment
    FROM payments
    WHERE id = p_payment_id AND tenant_id = p_tenant_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found or access denied';
    END IF;
    
    IF v_payment.status != 'authorized' THEN
        RAISE EXCEPTION 'Payment is not in authorized status';
    END IF;
    
    -- Determine capture amount
    v_capture_amount := COALESCE(p_capture_amount_cents, v_payment.amount_cents);
    
    IF v_capture_amount > v_payment.amount_cents THEN
        RAISE EXCEPTION 'Capture amount exceeds authorized amount';
    END IF;
    
    -- Update payment status
    UPDATE payments SET
        status = 'captured',
        captured_at = NOW(),
        amount_cents = v_capture_amount,
        net_amount_cents = v_capture_amount - fee_amount_cents,
        updated_at = NOW()
    WHERE id = p_payment_id;
    
    -- Return capture details
    SELECT jsonb_build_object(
        'payment_id', p_payment_id,
        'status', 'captured',
        'captured_amount_cents', v_capture_amount,
        'captured_at', NOW()
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process Refund
CREATE OR REPLACE FUNCTION process_refund(
    p_tenant_id UUID,
    p_order_id UUID,
    p_payment_id UUID DEFAULT NULL,
    p_amount_cents BIGINT,
    p_reason TEXT,
    p_reason_code TEXT DEFAULT NULL,
    p_initiated_by UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_refund_id UUID;
    v_refund_number TEXT;
    v_available_amount BIGINT;
    v_result JSONB;
BEGIN
    -- Generate refund number
    v_refund_number := 'REF-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                       LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' ||
                       LPAD((RANDOM() * 9999)::INT::TEXT, 4, '0');
    
    -- Check available refund amount
    SELECT 
        COALESCE(SUM(p.amount_cents), 0) - COALESCE(SUM(r.amount_cents), 0)
    INTO v_available_amount
    FROM payments p
    LEFT JOIN refunds r ON r.payment_id = p.id AND r.status = 'completed'
    WHERE p.order_id = p_order_id 
    AND p.tenant_id = p_tenant_id
    AND p.status = 'captured'
    AND (p_payment_id IS NULL OR p.id = p_payment_id);
    
    IF v_available_amount < p_amount_cents THEN
        RAISE EXCEPTION 'Refund amount exceeds available refund balance';
    END IF;
    
    -- Create refund record
    INSERT INTO refunds (
        id, tenant_id, order_id, payment_id, refund_number,
        amount_cents, currency, reason, reason_code,
        status, initiated_by, notes
    ) VALUES (
        gen_random_uuid(), p_tenant_id, p_order_id, p_payment_id, v_refund_number,
        p_amount_cents, 'CHF', p_reason, p_reason_code,
        'pending', p_initiated_by, p_notes
    ) RETURNING id INTO v_refund_id;
    
    -- Return refund details
    SELECT jsonb_build_object(
        'refund_id', v_refund_id,
        'refund_number', v_refund_number,
        'amount_cents', p_amount_cents,
        'status', 'pending',
        'available_amount_cents', v_available_amount - p_amount_cents
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add Funds to Customer Wallet
CREATE OR REPLACE FUNCTION add_wallet_funds(
    p_tenant_id UUID,
    p_customer_id UUID,
    p_studio_id UUID DEFAULT NULL,
    p_instructor_id UUID DEFAULT NULL,
    p_amount_cents BIGINT DEFAULT 0,
    p_credits INTEGER DEFAULT 0,
    p_reason TEXT DEFAULT 'manual_adjustment',
    p_description TEXT DEFAULT NULL,
    p_initiated_by UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_wallet_id UUID;
    v_new_balance_cents BIGINT;
    v_new_credits INTEGER;
    v_result JSONB;
BEGIN
    -- Get or create wallet
    INSERT INTO customer_wallets (
        tenant_id, customer_id, studio_id, instructor_id,
        wallet_type, currency, balance_cents, available_cents,
        total_credits, available_credits, status
    ) VALUES (
        p_tenant_id, p_customer_id, p_studio_id, p_instructor_id,
        'customer', 'CHF', p_amount_cents, p_amount_cents,
        p_credits, p_credits, 'active'
    )
    ON CONFLICT (tenant_id, customer_id, studio_id, instructor_id)
    DO UPDATE SET
        balance_cents = customer_wallets.balance_cents + p_amount_cents,
        available_cents = customer_wallets.available_cents + p_amount_cents,
        total_credits = customer_wallets.total_credits + p_credits,
        available_credits = customer_wallets.available_credits + p_credits,
        updated_at = NOW()
    RETURNING id, balance_cents, total_credits INTO v_wallet_id, v_new_balance_cents, v_new_credits;
    
    -- Create ledger entries
    IF p_amount_cents != 0 THEN
        INSERT INTO wallet_ledger (
            wallet_id, tenant_id, entry_type, amount_cents, credits_delta,
            balance_after_cents, credits_after, reference_type,
            description, reason_code, initiated_by
        ) VALUES (
            v_wallet_id, p_tenant_id, 'credit', p_amount_cents, 0,
            v_new_balance_cents, v_new_credits, 'adjustment',
            COALESCE(p_description, 'Manual balance adjustment'), p_reason, p_initiated_by
        );
    END IF;
    
    IF p_credits != 0 THEN
        INSERT INTO wallet_ledger (
            wallet_id, tenant_id, entry_type, amount_cents, credits_delta,
            balance_after_cents, credits_after, reference_type,
            description, reason_code, initiated_by
        ) VALUES (
            v_wallet_id, p_tenant_id, 'credit', 0, p_credits,
            v_new_balance_cents, v_new_credits, 'adjustment',
            COALESCE(p_description, 'Manual credits adjustment'), p_reason, p_initiated_by
        );
    END IF;
    
    -- Return wallet status
    SELECT jsonb_build_object(
        'wallet_id', v_wallet_id,
        'balance_cents', v_new_balance_cents,
        'credits', v_new_credits,
        'amount_added_cents', p_amount_cents,
        'credits_added', p_credits
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Use Wallet Credits for Payment
CREATE OR REPLACE FUNCTION use_wallet_credits(
    p_tenant_id UUID,
    p_customer_id UUID,
    p_studio_id UUID DEFAULT NULL,
    p_instructor_id UUID DEFAULT NULL,
    p_amount_cents BIGINT DEFAULT 0,
    p_credits INTEGER DEFAULT 0,
    p_order_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT 'Credit redemption'
)
RETURNS JSONB AS $$
DECLARE
    v_wallet customer_wallets%ROWTYPE;
    v_new_balance_cents BIGINT;
    v_new_credits INTEGER;
    v_result JSONB;
BEGIN
    -- Get wallet with row lock
    SELECT * INTO v_wallet
    FROM customer_wallets
    WHERE tenant_id = p_tenant_id
    AND customer_id = p_customer_id
    AND COALESCE(studio_id, 'NULL'::TEXT) = COALESCE(p_studio_id::TEXT, 'NULL')
    AND COALESCE(instructor_id, 'NULL'::TEXT) = COALESCE(p_instructor_id::TEXT, 'NULL')
    AND status = 'active'
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found or inactive';
    END IF;
    
    -- Check available funds/credits
    IF v_wallet.available_cents < p_amount_cents THEN
        RAISE EXCEPTION 'Insufficient wallet balance. Available: % cents, Requested: % cents', 
                       v_wallet.available_cents, p_amount_cents;
    END IF;
    
    IF v_wallet.available_credits < p_credits THEN
        RAISE EXCEPTION 'Insufficient wallet credits. Available: % credits, Requested: % credits', 
                       v_wallet.available_credits, p_credits;
    END IF;
    
    -- Calculate new balances
    v_new_balance_cents := v_wallet.balance_cents - p_amount_cents;
    v_new_credits := v_wallet.total_credits - p_credits;
    
    -- Update wallet
    UPDATE customer_wallets SET
        balance_cents = v_new_balance_cents,
        available_cents = v_new_balance_cents - reserved_cents,
        total_credits = v_new_credits,
        used_credits = used_credits + p_credits,
        available_credits = v_new_credits - used_credits - p_credits,
        updated_at = NOW()
    WHERE id = v_wallet.id;
    
    -- Create ledger entries
    IF p_amount_cents > 0 THEN
        INSERT INTO wallet_ledger (
            wallet_id, tenant_id, entry_type, amount_cents, credits_delta,
            balance_after_cents, credits_after, reference_type, reference_id,
            description, initiated_by
        ) VALUES (
            v_wallet.id, p_tenant_id, 'debit', -p_amount_cents, 0,
            v_new_balance_cents, v_new_credits, 'redemption', p_order_id,
            p_description, auth.uid()
        );
    END IF;
    
    IF p_credits > 0 THEN
        INSERT INTO wallet_ledger (
            wallet_id, tenant_id, entry_type, amount_cents, credits_delta,
            balance_after_cents, credits_after, reference_type, reference_id,
            description, initiated_by
        ) VALUES (
            v_wallet.id, p_tenant_id, 'debit', 0, -p_credits,
            v_new_balance_cents, v_new_credits, 'redemption', p_order_id,
            p_description, auth.uid()
        );
    END IF;
    
    -- Return transaction details
    SELECT jsonb_build_object(
        'wallet_id', v_wallet.id,
        'amount_used_cents', p_amount_cents,
        'credits_used', p_credits,
        'new_balance_cents', v_new_balance_cents,
        'new_credits', v_new_credits,
        'transaction_timestamp', NOW()
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate Instructor Earnings for Period
CREATE OR REPLACE FUNCTION calculate_instructor_earnings(
    p_tenant_id UUID,
    p_instructor_id UUID,
    p_period_start DATE,
    p_period_end DATE
)
RETURNS JSONB AS $$
DECLARE
    v_earnings_id UUID;
    v_total_classes INTEGER := 0;
    v_total_students INTEGER := 0;
    v_base_earnings_cents BIGINT := 0;
    v_class_record RECORD;
    v_result JSONB;
BEGIN
    -- Create earnings record
    INSERT INTO instructor_earnings (
        tenant_id, instructor_id, period_start, period_end,
        total_classes, total_students, base_earnings_cents,
        gross_earnings_cents, payment_status, calculated_at
    ) VALUES (
        p_tenant_id, p_instructor_id, p_period_start, p_period_end,
        0, 0, 0, 0, 'pending', NOW()
    ) RETURNING id INTO v_earnings_id;
    
    -- Calculate earnings from class occurrences
    FOR v_class_record IN
        SELECT 
            co.id as occurrence_id,
            ct.name as class_name,
            co.start_time,
            co.instructor_earnings_rate_cents,
            co.instructor_earnings_basis,
            COUNT(r.id) as student_count
        FROM class_occurrences co
        JOIN class_templates ct ON ct.id = co.class_template_id
        LEFT JOIN registrations r ON r.class_occurrence_id = co.id 
                                  AND r.status IN ('confirmed', 'attended')
        WHERE co.instructor_id = p_instructor_id
        AND co.start_time::DATE BETWEEN p_period_start AND p_period_end
        AND co.status = 'completed'
        GROUP BY co.id, ct.name, co.start_time, co.instructor_earnings_rate_cents, co.instructor_earnings_basis
    LOOP
        DECLARE
            v_class_earnings_cents BIGINT := 0;
        BEGIN
            -- Calculate earnings based on basis
            CASE v_class_record.instructor_earnings_basis
                WHEN 'per_head' THEN
                    v_class_earnings_cents := v_class_record.instructor_earnings_rate_cents * v_class_record.student_count;
                WHEN 'per_class' THEN
                    v_class_earnings_cents := v_class_record.instructor_earnings_rate_cents;
                WHEN 'percentage' THEN
                    -- TODO: Calculate from class revenue
                    v_class_earnings_cents := 0;
                ELSE
                    v_class_earnings_cents := 0;
            END CASE;
            
            -- Insert earnings detail
            INSERT INTO earnings_details (
                earnings_id, tenant_id, class_occurrence_id, class_name, class_date,
                basis, student_count, base_rate_cents, earnings_cents
            ) VALUES (
                v_earnings_id, p_tenant_id, v_class_record.occurrence_id,
                v_class_record.class_name, v_class_record.start_time,
                v_class_record.instructor_earnings_basis, v_class_record.student_count,
                v_class_record.instructor_earnings_rate_cents, v_class_earnings_cents
            );
            
            -- Update totals
            v_total_classes := v_total_classes + 1;
            v_total_students := v_total_students + v_class_record.student_count;
            v_base_earnings_cents := v_base_earnings_cents + v_class_earnings_cents;
        END;
    END LOOP;
    
    -- Update earnings totals
    UPDATE instructor_earnings SET
        total_classes = v_total_classes,
        total_students = v_total_students,
        base_earnings_cents = v_base_earnings_cents,
        gross_earnings_cents = v_base_earnings_cents, -- No adjustments yet
        updated_at = NOW()
    WHERE id = v_earnings_id;
    
    -- Return earnings summary
    SELECT jsonb_build_object(
        'earnings_id', v_earnings_id,
        'instructor_id', p_instructor_id,
        'period_start', p_period_start,
        'period_end', p_period_end,
        'total_classes', v_total_classes,
        'total_students', v_total_students,
        'base_earnings_cents', v_base_earnings_cents,
        'gross_earnings_cents', v_base_earnings_cents
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate Invoice for Order
CREATE OR REPLACE FUNCTION generate_invoice(
    p_tenant_id UUID,
    p_order_id UUID,
    p_due_days INTEGER DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
    v_invoice_id UUID;
    v_invoice_number TEXT;
    v_order orders%ROWTYPE;
    v_qr_reference TEXT;
    v_result JSONB;
BEGIN
    -- Get order details
    SELECT * INTO v_order
    FROM orders
    WHERE id = p_order_id AND tenant_id = p_tenant_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found or access denied';
    END IF;
    
    -- Generate invoice number
    v_invoice_number := 'INV-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                        LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' ||
                        LPAD((RANDOM() * 9999)::INT::TEXT, 4, '0');
    
    -- Generate QR reference
    v_qr_reference := 'RF' || LPAD((RANDOM() * 999999999999999)::BIGINT::TEXT, 15, '0');
    
    -- Create invoice
    INSERT INTO invoices (
        id, tenant_id, order_id, invoice_number, invoice_date, due_date,
        customer_id, customer_name, customer_email, customer_address,
        subtotal_cents, tax_total_cents, total_cents, currency,
        tax_mode, qr_bill_reference, status
    ) VALUES (
        gen_random_uuid(), p_tenant_id, p_order_id, v_invoice_number,
        CURRENT_DATE, CURRENT_DATE + INTERVAL '%s days' % p_due_days,
        v_order.customer_id, v_order.customer_name, v_order.customer_email, v_order.customer_address,
        v_order.subtotal_cents, v_order.tax_total_cents, v_order.total_cents, v_order.currency,
        'inclusive', v_qr_reference, 'draft'
    ) RETURNING id INTO v_invoice_id;
    
    -- Return invoice details
    SELECT jsonb_build_object(
        'invoice_id', v_invoice_id,
        'invoice_number', v_invoice_number,
        'qr_reference', v_qr_reference,
        'total_cents', v_order.total_cents,
        'due_date', CURRENT_DATE + INTERVAL '%s days' % p_due_days
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reconcile Bank Statement
CREATE OR REPLACE FUNCTION reconcile_bank_statement(
    p_tenant_id UUID,
    p_file_name TEXT,
    p_transactions JSONB[] -- Array of bank transactions
)
RETURNS JSONB AS $$
DECLARE
    v_reconciliation_id UUID;
    v_transaction JSONB;
    v_matched_count INTEGER := 0;
    v_unmatched_count INTEGER := 0;
    v_total_count INTEGER := 0;
    v_result JSONB;
BEGIN
    -- Create reconciliation record
    INSERT INTO reconciliation_records (
        tenant_id, source_type, file_name, reconciliation_date, status
    ) VALUES (
        p_tenant_id, 'bank_statement', p_file_name, CURRENT_DATE, 'processing'
    ) RETURNING id INTO v_reconciliation_id;
    
    -- Process each transaction
    FOREACH v_transaction IN ARRAY p_transactions
    LOOP
        DECLARE
            v_reference TEXT;
            v_amount_cents BIGINT;
            v_matched_payment_id UUID;
        BEGIN
            v_total_count := v_total_count + 1;
            v_reference := v_transaction->>'reference';
            v_amount_cents := (v_transaction->>'amount_cents')::BIGINT;
            
            -- Try to match with payment
            SELECT id INTO v_matched_payment_id
            FROM payments p
            JOIN orders o ON o.id = p.order_id
            WHERE p.tenant_id = p_tenant_id
            AND (
                p.provider_payment_id = v_reference OR
                o.order_number = v_reference
            )
            AND ABS(p.amount_cents - v_amount_cents) <= 100 -- Allow 1 CHF variance
            LIMIT 1;
            
            IF v_matched_payment_id IS NOT NULL THEN
                v_matched_count := v_matched_count + 1;
                -- Update payment as reconciled
                UPDATE payments SET
                    metadata = COALESCE(metadata, '{}') || 
                               jsonb_build_object('reconciled', true, 'reconciliation_id', v_reconciliation_id)
                WHERE id = v_matched_payment_id;
            ELSE
                v_unmatched_count := v_unmatched_count + 1;
            END IF;
        END;
    END LOOP;
    
    -- Update reconciliation status
    UPDATE reconciliation_records SET
        status = CASE WHEN v_unmatched_count = 0 THEN 'matched' ELSE 'discrepancy' END,
        total_records = v_total_count,
        matched_records = v_matched_count,
        unmatched_records = v_unmatched_count,
        processed_at = NOW()
    WHERE id = v_reconciliation_id;
    
    -- Return reconciliation results
    SELECT jsonb_build_object(
        'reconciliation_id', v_reconciliation_id,
        'total_transactions', v_total_count,
        'matched_transactions', v_matched_count,
        'unmatched_transactions', v_unmatched_count,
        'match_rate', ROUND((v_matched_count::DECIMAL / v_total_count * 100), 2)
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;