-- Finance Module Schema for YogaSwiss
-- All tables include tenant isolation with RLS policies

-- Tax Rates Configuration
CREATE TABLE IF NOT EXISTS tax_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    rate DECIMAL(5,3) NOT NULL CHECK (rate >= 0 AND rate <= 100),
    region TEXT DEFAULT 'CH',
    category TEXT DEFAULT 'standard', -- standard, reduced, exempt
    valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Revenue Categories for Accounting
CREATE TABLE IF NOT EXISTS revenue_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    accounting_code TEXT,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders - Master transaction record
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    customer_id UUID,
    studio_id UUID,
    location_id UUID,
    order_number TEXT UNIQUE NOT NULL,
    channel TEXT NOT NULL DEFAULT 'web' CHECK (channel IN ('web', 'mobile', 'pos', 'admin', 'api')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    currency TEXT NOT NULL DEFAULT 'CHF',
    
    -- Financial totals
    subtotal_cents BIGINT NOT NULL DEFAULT 0,
    tax_total_cents BIGINT NOT NULL DEFAULT 0,
    discount_cents BIGINT NOT NULL DEFAULT 0,
    total_cents BIGINT NOT NULL DEFAULT 0,
    
    -- Customer details (cached for invoicing)
    customer_email TEXT,
    customer_name TEXT,
    customer_address JSONB,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order Items - Line items within orders
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    
    -- Item details
    item_type TEXT NOT NULL CHECK (item_type IN ('registration', 'retail', 'membership', 'pass', 'fee', 'gift_card', 'service')),
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    
    -- Linked objects
    class_id UUID,
    product_id UUID,
    package_id UUID,
    service_id UUID,
    
    -- Pricing
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_cents BIGINT NOT NULL,
    total_price_cents BIGINT NOT NULL,
    
    -- Tax handling
    tax_rate DECIMAL(5,3) NOT NULL DEFAULT 0,
    tax_amount_cents BIGINT NOT NULL DEFAULT 0,
    tax_inclusive BOOLEAN NOT NULL DEFAULT true,
    
    -- Revenue allocation
    revenue_category_id UUID REFERENCES revenue_categories(id),
    studio_id UUID,
    location_id UUID,
    instructor_id UUID,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments - Payment records for orders
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Payment details
    method TEXT NOT NULL CHECK (method IN ('card', 'twint', 'cash', 'bank_transfer', 'wallet', 'gift_card', 'qr_bill')),
    provider TEXT, -- stripe, datatrans, wallee, etc.
    provider_payment_id TEXT,
    provider_intent_id TEXT,
    
    -- Amounts in cents
    amount_cents BIGINT NOT NULL,
    fee_amount_cents BIGINT NOT NULL DEFAULT 0,
    net_amount_cents BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CHF',
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'authorized', 'captured', 'partially_captured', 
        'failed', 'cancelled', 'refunded', 'partially_refunded', 'chargeback'
    )),
    
    -- Timestamps
    authorized_at TIMESTAMPTZ,
    captured_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    
    -- Error handling
    failure_reason TEXT,
    failure_code TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Refunds - Refund records
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id),
    payment_id UUID REFERENCES payments(id),
    
    -- Refund details
    refund_number TEXT UNIQUE NOT NULL,
    amount_cents BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CHF',
    reason TEXT NOT NULL,
    reason_code TEXT,
    
    -- Processing
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    provider_refund_id TEXT,
    
    -- Staff tracking
    initiated_by UUID,
    approved_by UUID,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payouts - Provider payout records
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Payout details
    payout_number TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL, -- stripe, datatrans, etc.
    provider_payout_id TEXT,
    
    -- Period
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Amounts in cents
    gross_amount_cents BIGINT NOT NULL,
    fee_amount_cents BIGINT NOT NULL DEFAULT 0,
    refund_amount_cents BIGINT NOT NULL DEFAULT 0,
    chargeback_amount_cents BIGINT NOT NULL DEFAULT 0,
    net_amount_cents BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CHF',
    
    -- Status and timing
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'paid', 'failed', 'cancelled')),
    arrival_date DATE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payout Items - Individual payment items in payouts
CREATE TABLE IF NOT EXISTS payout_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payout_id UUID NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id),
    tenant_id UUID NOT NULL,
    
    -- Item amounts
    gross_amount_cents BIGINT NOT NULL,
    fee_amount_cents BIGINT NOT NULL DEFAULT 0,
    net_amount_cents BIGINT NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoices - Legal invoicing documents
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id),
    
    -- Invoice details
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- Customer details (frozen at time of invoice)
    customer_id UUID,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_address JSONB,
    customer_vat_id TEXT,
    
    -- Financial details
    subtotal_cents BIGINT NOT NULL,
    tax_total_cents BIGINT NOT NULL,
    total_cents BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CHF',
    
    -- Tax handling
    tax_mode TEXT NOT NULL DEFAULT 'inclusive' CHECK (tax_mode IN ('inclusive', 'exclusive')),
    tax_breakdown JSONB, -- Array of tax rates and amounts
    
    -- Document storage
    pdf_url TEXT,
    qr_bill_url TEXT,
    qr_bill_reference TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')),
    sent_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Instructor Earnings - Earnings calculation and payment tracking
CREATE TABLE IF NOT EXISTS instructor_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    instructor_id UUID NOT NULL,
    
    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Earnings calculation
    total_classes INTEGER NOT NULL DEFAULT 0,
    total_students INTEGER NOT NULL DEFAULT 0,
    base_earnings_cents BIGINT NOT NULL DEFAULT 0,
    bonus_earnings_cents BIGINT NOT NULL DEFAULT 0,
    adjustments_cents BIGINT NOT NULL DEFAULT 0,
    deductions_cents BIGINT NOT NULL DEFAULT 0,
    gross_earnings_cents BIGINT NOT NULL DEFAULT 0,
    
    -- Payment details
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'paid', 'cancelled')),
    payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'cash', 'payroll')),
    payment_reference TEXT,
    
    -- Approval workflow
    calculated_at TIMESTAMPTZ,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    
    -- Metadata
    breakdown JSONB, -- Detailed earnings breakdown
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Earnings Details - Individual class earnings
CREATE TABLE IF NOT EXISTS earnings_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    earnings_id UUID NOT NULL REFERENCES instructor_earnings(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    
    -- Class details
    class_occurrence_id UUID,
    class_name TEXT NOT NULL,
    class_date TIMESTAMPTZ NOT NULL,
    
    -- Earnings calculation
    basis TEXT NOT NULL CHECK (basis IN ('per_head', 'per_class', 'percentage', 'fixed')),
    student_count INTEGER NOT NULL DEFAULT 0,
    base_rate_cents BIGINT NOT NULL DEFAULT 0,
    earnings_cents BIGINT NOT NULL DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customer Wallets - Multi-wallet system
CREATE TABLE IF NOT EXISTS customer_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    studio_id UUID, -- NULL for global wallets
    instructor_id UUID, -- NULL for non-instructor specific
    
    -- Wallet details
    wallet_type TEXT NOT NULL DEFAULT 'customer' CHECK (wallet_type IN ('customer', 'gift', 'promotion', 'corporate')),
    currency TEXT NOT NULL DEFAULT 'CHF',
    
    -- Balances
    balance_cents BIGINT NOT NULL DEFAULT 0,
    reserved_cents BIGINT NOT NULL DEFAULT 0, -- Reserved for pending transactions
    available_cents BIGINT NOT NULL DEFAULT 0,
    
    -- Credits system
    total_credits INTEGER NOT NULL DEFAULT 0,
    used_credits INTEGER NOT NULL DEFAULT 0,
    available_credits INTEGER NOT NULL DEFAULT 0,
    credits_expiry TIMESTAMPTZ,
    
    -- Status and rules
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
    rules JSONB DEFAULT '{}', -- Credit eligibility rules, transfer policies, etc.
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraints
    UNIQUE(tenant_id, customer_id, studio_id, instructor_id),
    CHECK (available_cents = balance_cents - reserved_cents),
    CHECK (available_credits = total_credits - used_credits)
);

-- Wallet Ledger - All wallet transactions
CREATE TABLE IF NOT EXISTS wallet_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES customer_wallets(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    
    -- Transaction details
    transaction_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    entry_type TEXT NOT NULL CHECK (entry_type IN ('credit', 'debit', 'reserve', 'release', 'expiry', 'transfer_in', 'transfer_out')),
    
    -- Amounts
    amount_cents BIGINT NOT NULL DEFAULT 0,
    credits_delta INTEGER NOT NULL DEFAULT 0,
    
    -- Balances after transaction
    balance_after_cents BIGINT NOT NULL,
    credits_after INTEGER NOT NULL,
    
    -- Reference
    reference_type TEXT CHECK (reference_type IN ('order', 'refund', 'adjustment', 'transfer', 'expiry', 'purchase', 'redemption')),
    reference_id UUID,
    
    -- Description
    description TEXT NOT NULL,
    reason_code TEXT,
    
    -- Staff tracking
    initiated_by UUID,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gift Cards
CREATE TABLE IF NOT EXISTS gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Gift card details
    code TEXT UNIQUE NOT NULL,
    initial_amount_cents BIGINT NOT NULL,
    current_balance_cents BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CHF',
    
    -- Parties
    purchaser_id UUID,
    recipient_id UUID,
    recipient_email TEXT,
    recipient_name TEXT,
    
    -- Status and expiry
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
    expires_at TIMESTAMPTZ,
    
    -- Activation
    activated_at TIMESTAMPTZ,
    first_use_at TIMESTAMPTZ,
    last_use_at TIMESTAMPTZ,
    
    -- Metadata
    message TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gift Card Transactions
CREATE TABLE IF NOT EXISTS gift_card_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    
    -- Transaction details
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'redemption', 'refund')),
    amount_cents BIGINT NOT NULL,
    balance_after_cents BIGINT NOT NULL,
    
    -- References
    order_id UUID REFERENCES orders(id),
    used_by UUID,
    
    -- Metadata
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reconciliation Records
CREATE TABLE IF NOT EXISTS reconciliation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Source details
    source_type TEXT NOT NULL CHECK (source_type IN ('bank_statement', 'provider_report', 'pos_cash', 'manual')),
    source_reference TEXT,
    file_name TEXT,
    file_url TEXT,
    
    -- Period
    reconciliation_date DATE NOT NULL,
    period_start DATE,
    period_end DATE,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'matched', 'discrepancy', 'completed')),
    
    -- Results
    total_records INTEGER DEFAULT 0,
    matched_records INTEGER DEFAULT 0,
    unmatched_records INTEGER DEFAULT 0,
    discrepancies JSONB,
    
    -- Staff tracking
    processed_by UUID,
    approved_by UUID,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    
    processed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Logs for Finance
CREATE TABLE IF NOT EXISTS finance_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Event details
    event_type TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    
    -- User and session
    user_id UUID,
    user_email TEXT,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Changes
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Context
    context JSONB DEFAULT '{}',
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cash Drawer Management
CREATE TABLE IF NOT EXISTS cash_drawers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    location_id UUID NOT NULL,
    
    -- Drawer details
    drawer_name TEXT NOT NULL,
    drawer_number TEXT,
    register_id TEXT,
    
    -- Current session
    current_session_id UUID,
    current_operator_id UUID,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'closed' CHECK (status IN ('closed', 'open', 'locked', 'maintenance')),
    
    -- Current balance
    current_balance_cents BIGINT NOT NULL DEFAULT 0,
    expected_balance_cents BIGINT NOT NULL DEFAULT 0,
    
    -- Last Z-report
    last_z_report_at TIMESTAMPTZ,
    last_z_report_number TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(tenant_id, location_id, drawer_name)
);

-- Cash Drawer Sessions
CREATE TABLE IF NOT EXISTS cash_drawer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drawer_id UUID NOT NULL REFERENCES cash_drawers(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    
    -- Session details
    operator_id UUID NOT NULL,
    shift_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    shift_end TIMESTAMPTZ,
    
    -- Opening balance
    opening_balance_cents BIGINT NOT NULL DEFAULT 0,
    opening_counted_cents BIGINT,
    opening_variance_cents BIGINT DEFAULT 0,
    
    -- Closing balance
    closing_balance_cents BIGINT,
    closing_counted_cents BIGINT,
    closing_variance_cents BIGINT DEFAULT 0,
    
    -- Session totals
    total_sales_cents BIGINT DEFAULT 0,
    total_refunds_cents BIGINT DEFAULT 0,
    total_deposits_cents BIGINT DEFAULT 0,
    total_withdrawals_cents BIGINT DEFAULT 0,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'reconciled')),
    
    -- Reports
    z_report_number TEXT,
    z_report_generated_at TIMESTAMPTZ,
    
    -- Metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cash Transactions
CREATE TABLE IF NOT EXISTS cash_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES cash_drawer_sessions(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    
    -- Transaction details
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'refund', 'deposit', 'withdrawal', 'float_adjustment')),
    amount_cents BIGINT NOT NULL,
    
    -- References
    order_id UUID REFERENCES orders(id),
    payment_id UUID REFERENCES payments(id),
    refund_id UUID REFERENCES refunds(id),
    
    -- Description
    description TEXT NOT NULL,
    reference TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_tenant_customer ON orders(tenant_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(provider, provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_order ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_payouts_provider ON payouts(provider, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id, invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_instructor_earnings_instructor ON instructor_earnings(instructor_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_customer_wallets_customer ON customer_wallets(tenant_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_wallet ON wallet_ledger(wallet_id, transaction_timestamp);
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_finance_audit_logs_tenant_table ON finance_audit_logs(tenant_id, table_name, created_at);
CREATE INDEX IF NOT EXISTS idx_cash_drawers_location ON cash_drawers(tenant_id, location_id);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_session ON cash_transactions(session_id, created_at);

-- Update timestamps triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON refunds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_instructor_earnings_updated_at BEFORE UPDATE ON instructor_earnings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_wallets_updated_at BEFORE UPDATE ON customer_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gift_cards_updated_at BEFORE UPDATE ON gift_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reconciliation_records_updated_at BEFORE UPDATE ON reconciliation_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cash_drawers_updated_at BEFORE UPDATE ON cash_drawers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cash_drawer_sessions_updated_at BEFORE UPDATE ON cash_drawer_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();