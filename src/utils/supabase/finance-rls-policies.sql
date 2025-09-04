-- Row Level Security (RLS) Policies for Finance Module
-- All policies enforce tenant isolation and role-based access

-- Enable RLS on all finance tables
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_drawers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_drawer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_transactions ENABLE ROW LEVEL SECURITY;

-- Helper function to get user tenant access
CREATE OR REPLACE FUNCTION get_user_tenant_access(user_id UUID)
RETURNS TABLE (
    tenant_id UUID,
    role TEXT,
    permissions TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uta.tenant_id,
        uta.role,
        uta.permissions
    FROM user_tenant_access uta
    WHERE uta.user_id = get_user_tenant_access.user_id
    AND uta.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check finance permissions
CREATE OR REPLACE FUNCTION has_finance_access(required_permission TEXT DEFAULT 'finance.read')
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions TEXT[];
    current_tenant_id UUID;
BEGIN
    -- Get current user's permissions for current tenant
    SELECT permissions INTO user_permissions
    FROM get_user_tenant_access(auth.uid()::UUID)
    WHERE tenant_id = current_setting('app.current_tenant_id', true)::UUID;
    
    -- Check if user has required permission
    RETURN user_permissions @> ARRAY[required_permission] OR 
           user_permissions @> ARRAY['finance.*'] OR
           user_permissions @> ARRAY['admin.*'];
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tax Rates Policies
CREATE POLICY "tax_rates_tenant_isolation" ON tax_rates
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "tax_rates_read" ON tax_rates
    FOR SELECT USING (has_finance_access('finance.read'));

CREATE POLICY "tax_rates_write" ON tax_rates
    FOR INSERT WITH CHECK (has_finance_access('finance.admin'));

CREATE POLICY "tax_rates_update" ON tax_rates
    FOR UPDATE USING (has_finance_access('finance.admin'));

-- Revenue Categories Policies
CREATE POLICY "revenue_categories_tenant_isolation" ON revenue_categories
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "revenue_categories_read" ON revenue_categories
    FOR SELECT USING (has_finance_access('finance.read'));

CREATE POLICY "revenue_categories_write" ON revenue_categories
    FOR INSERT WITH CHECK (has_finance_access('finance.admin'));

CREATE POLICY "revenue_categories_update" ON revenue_categories
    FOR UPDATE USING (has_finance_access('finance.admin'));

-- Orders Policies
CREATE POLICY "orders_tenant_isolation" ON orders
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "orders_read" ON orders
    FOR SELECT USING (has_finance_access('finance.read'));

CREATE POLICY "orders_write" ON orders
    FOR INSERT WITH CHECK (has_finance_access('finance.write'));

CREATE POLICY "orders_update" ON orders
    FOR UPDATE USING (has_finance_access('finance.write'));

-- Order Items Policies
CREATE POLICY "order_items_tenant_isolation" ON order_items
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "order_items_read" ON order_items
    FOR SELECT USING (has_finance_access('finance.read'));

CREATE POLICY "order_items_write" ON order_items
    FOR INSERT WITH CHECK (has_finance_access('finance.write'));

CREATE POLICY "order_items_update" ON order_items
    FOR UPDATE USING (has_finance_access('finance.write'));

-- Payments Policies
CREATE POLICY "payments_tenant_isolation" ON payments
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "payments_read" ON payments
    FOR SELECT USING (has_finance_access('finance.read'));

CREATE POLICY "payments_write" ON payments
    FOR INSERT WITH CHECK (has_finance_access('finance.write'));

CREATE POLICY "payments_update" ON payments
    FOR UPDATE USING (has_finance_access('finance.write'));

-- Refunds Policies
CREATE POLICY "refunds_tenant_isolation" ON refunds
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "refunds_read" ON refunds
    FOR SELECT USING (has_finance_access('finance.read'));

CREATE POLICY "refunds_write" ON refunds
    FOR INSERT WITH CHECK (has_finance_access('finance.refund'));

CREATE POLICY "refunds_update" ON refunds
    FOR UPDATE USING (has_finance_access('finance.refund'));

-- Payouts Policies  
CREATE POLICY "payouts_tenant_isolation" ON payouts
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "payouts_read" ON payouts
    FOR SELECT USING (has_finance_access('finance.read'));

CREATE POLICY "payouts_write" ON payouts
    FOR INSERT WITH CHECK (has_finance_access('finance.admin'));

CREATE POLICY "payouts_update" ON payouts
    FOR UPDATE USING (has_finance_access('finance.admin'));

-- Payout Items Policies
CREATE POLICY "payout_items_tenant_isolation" ON payout_items
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "payout_items_read" ON payout_items
    FOR SELECT USING (has_finance_access('finance.read'));

CREATE POLICY "payout_items_write" ON payout_items
    FOR INSERT WITH CHECK (has_finance_access('finance.admin'));

-- Invoices Policies
CREATE POLICY "invoices_tenant_isolation" ON invoices
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "invoices_read" ON invoices
    FOR SELECT USING (has_finance_access('finance.read'));

CREATE POLICY "invoices_write" ON invoices
    FOR INSERT WITH CHECK (has_finance_access('finance.invoice'));

CREATE POLICY "invoices_update" ON invoices
    FOR UPDATE USING (has_finance_access('finance.invoice'));

-- Instructor Earnings Policies
CREATE POLICY "instructor_earnings_tenant_isolation" ON instructor_earnings
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "instructor_earnings_read" ON instructor_earnings
    FOR SELECT USING (
        has_finance_access('finance.read') OR 
        instructor_id = auth.uid()::UUID -- Instructors can see their own earnings
    );

CREATE POLICY "instructor_earnings_write" ON instructor_earnings
    FOR INSERT WITH CHECK (has_finance_access('finance.payroll'));

CREATE POLICY "instructor_earnings_update" ON instructor_earnings
    FOR UPDATE USING (has_finance_access('finance.payroll'));

-- Earnings Details Policies
CREATE POLICY "earnings_details_tenant_isolation" ON earnings_details
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "earnings_details_read" ON earnings_details
    FOR SELECT USING (
        has_finance_access('finance.read') OR
        EXISTS (
            SELECT 1 FROM instructor_earnings ie 
            WHERE ie.id = earnings_details.earnings_id 
            AND ie.instructor_id = auth.uid()::UUID
        )
    );

CREATE POLICY "earnings_details_write" ON earnings_details
    FOR INSERT WITH CHECK (has_finance_access('finance.payroll'));

-- Customer Wallets Policies
CREATE POLICY "customer_wallets_tenant_isolation" ON customer_wallets
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "customer_wallets_read" ON customer_wallets
    FOR SELECT USING (
        has_finance_access('finance.read') OR
        customer_id = auth.uid()::UUID -- Customers can see their own wallets
    );

CREATE POLICY "customer_wallets_write" ON customer_wallets
    FOR INSERT WITH CHECK (has_finance_access('finance.wallet'));

CREATE POLICY "customer_wallets_update" ON customer_wallets
    FOR UPDATE USING (has_finance_access('finance.wallet'));

-- Wallet Ledger Policies
CREATE POLICY "wallet_ledger_tenant_isolation" ON wallet_ledger
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "wallet_ledger_read" ON wallet_ledger
    FOR SELECT USING (
        has_finance_access('finance.read') OR
        EXISTS (
            SELECT 1 FROM customer_wallets cw 
            WHERE cw.id = wallet_ledger.wallet_id 
            AND cw.customer_id = auth.uid()::UUID
        )
    );

CREATE POLICY "wallet_ledger_write" ON wallet_ledger
    FOR INSERT WITH CHECK (has_finance_access('finance.wallet'));

-- Gift Cards Policies
CREATE POLICY "gift_cards_tenant_isolation" ON gift_cards
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "gift_cards_read" ON gift_cards
    FOR SELECT USING (
        has_finance_access('finance.read') OR
        purchaser_id = auth.uid()::UUID OR
        recipient_id = auth.uid()::UUID
    );

CREATE POLICY "gift_cards_write" ON gift_cards
    FOR INSERT WITH CHECK (has_finance_access('finance.write'));

CREATE POLICY "gift_cards_update" ON gift_cards
    FOR UPDATE USING (has_finance_access('finance.write'));

-- Gift Card Transactions Policies
CREATE POLICY "gift_card_transactions_tenant_isolation" ON gift_card_transactions
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "gift_card_transactions_read" ON gift_card_transactions
    FOR SELECT USING (
        has_finance_access('finance.read') OR
        EXISTS (
            SELECT 1 FROM gift_cards gc 
            WHERE gc.id = gift_card_transactions.gift_card_id 
            AND (gc.purchaser_id = auth.uid()::UUID OR gc.recipient_id = auth.uid()::UUID)
        )
    );

CREATE POLICY "gift_card_transactions_write" ON gift_card_transactions
    FOR INSERT WITH CHECK (has_finance_access('finance.write'));

-- Reconciliation Records Policies
CREATE POLICY "reconciliation_records_tenant_isolation" ON reconciliation_records
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "reconciliation_records_read" ON reconciliation_records
    FOR SELECT USING (has_finance_access('finance.reconcile'));

CREATE POLICY "reconciliation_records_write" ON reconciliation_records
    FOR INSERT WITH CHECK (has_finance_access('finance.reconcile'));

CREATE POLICY "reconciliation_records_update" ON reconciliation_records
    FOR UPDATE USING (has_finance_access('finance.reconcile'));

-- Finance Audit Logs Policies
CREATE POLICY "finance_audit_logs_tenant_isolation" ON finance_audit_logs
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "finance_audit_logs_read" ON finance_audit_logs
    FOR SELECT USING (has_finance_access('finance.audit'));

CREATE POLICY "finance_audit_logs_write" ON finance_audit_logs
    FOR INSERT WITH CHECK (true); -- System can always write audit logs

-- Cash Drawers Policies
CREATE POLICY "cash_drawers_tenant_isolation" ON cash_drawers
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "cash_drawers_read" ON cash_drawers
    FOR SELECT USING (has_finance_access('finance.pos'));

CREATE POLICY "cash_drawers_write" ON cash_drawers
    FOR INSERT WITH CHECK (has_finance_access('finance.pos'));

CREATE POLICY "cash_drawers_update" ON cash_drawers
    FOR UPDATE USING (has_finance_access('finance.pos'));

-- Cash Drawer Sessions Policies
CREATE POLICY "cash_drawer_sessions_tenant_isolation" ON cash_drawer_sessions
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "cash_drawer_sessions_read" ON cash_drawer_sessions
    FOR SELECT USING (
        has_finance_access('finance.pos') OR
        operator_id = auth.uid()::UUID -- Operators can see their own sessions
    );

CREATE POLICY "cash_drawer_sessions_write" ON cash_drawer_sessions
    FOR INSERT WITH CHECK (has_finance_access('finance.pos'));

CREATE POLICY "cash_drawer_sessions_update" ON cash_drawer_sessions
    FOR UPDATE USING (
        has_finance_access('finance.pos') OR
        operator_id = auth.uid()::UUID -- Operators can update their own sessions
    );

-- Cash Transactions Policies
CREATE POLICY "cash_transactions_tenant_isolation" ON cash_transactions
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "cash_transactions_read" ON cash_transactions
    FOR SELECT USING (
        has_finance_access('finance.pos') OR
        EXISTS (
            SELECT 1 FROM cash_drawer_sessions cds 
            WHERE cds.id = cash_transactions.session_id 
            AND cds.operator_id = auth.uid()::UUID
        )
    );

CREATE POLICY "cash_transactions_write" ON cash_transactions
    FOR INSERT WITH CHECK (has_finance_access('finance.pos'));

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_finance_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only audit tables we care about
    IF TG_TABLE_NAME IN ('orders', 'payments', 'refunds', 'customer_wallets', 'gift_cards', 'cash_drawer_sessions') THEN
        INSERT INTO finance_audit_logs (
            tenant_id,
            event_type,
            table_name,
            record_id,
            user_id,
            action,
            old_values,
            new_values,
            risk_level
        ) VALUES (
            COALESCE(NEW.tenant_id, OLD.tenant_id),
            TG_OP,
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            auth.uid(),
            TG_OP,
            CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
            CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
            CASE 
                WHEN TG_TABLE_NAME IN ('payments', 'refunds') THEN 'high'
                WHEN TG_TABLE_NAME IN ('customer_wallets', 'gift_cards') THEN 'medium'
                ELSE 'low'
            END
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers
CREATE TRIGGER audit_orders_changes
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION audit_finance_changes();

CREATE TRIGGER audit_payments_changes
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_finance_changes();

CREATE TRIGGER audit_refunds_changes
    AFTER INSERT OR UPDATE OR DELETE ON refunds
    FOR EACH ROW EXECUTE FUNCTION audit_finance_changes();

CREATE TRIGGER audit_customer_wallets_changes
    AFTER INSERT OR UPDATE OR DELETE ON customer_wallets
    FOR EACH ROW EXECUTE FUNCTION audit_finance_changes();

CREATE TRIGGER audit_gift_cards_changes
    AFTER INSERT OR UPDATE OR DELETE ON gift_cards
    FOR EACH ROW EXECUTE FUNCTION audit_finance_changes();

CREATE TRIGGER audit_cash_drawer_sessions_changes
    AFTER INSERT OR UPDATE OR DELETE ON cash_drawer_sessions
    FOR EACH ROW EXECUTE FUNCTION audit_finance_changes();