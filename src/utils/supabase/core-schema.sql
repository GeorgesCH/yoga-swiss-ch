-- =====================================================
-- YogaSwiss Complete Database Schema
-- Production-ready multi-tenant schema with RLS
-- =====================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "ltree";

-- Custom Types
CREATE TYPE user_role AS ENUM (
  'owner',
  'studio_manager', 
  'instructor',
  'front_desk',
  'accountant',
  'marketer',
  'auditor',
  'customer'
);

CREATE TYPE class_status AS ENUM (
  'scheduled',
  'active',
  'completed',
  'cancelled'
);

CREATE TYPE registration_status AS ENUM (
  'confirmed',
  'waitlist',
  'cancelled',
  'no_show',
  'checked_in'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'failed',
  'refunded',
  'partial_refund'
);

CREATE TYPE payment_method AS ENUM (
  'card',
  'twint',
  'bank_transfer',
  'cash',
  'wallet',
  'invoice'
);

CREATE TYPE invoice_status AS ENUM (
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled'
);

CREATE TYPE wallet_transaction_type AS ENUM (
  'credit',
  'debit',
  'refund',
  'expiry',
  'transfer'
);

-- =====================================================
-- CORE TENANT & AUTH TABLES
-- =====================================================

-- Organizations (Studios/Chains)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'starter',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  default_organization_id UUID REFERENCES organizations(id),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Members (RBAC)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(organization_id, user_id)
);

-- =====================================================
-- LOCATIONS & RESOURCES
-- =====================================================

-- Locations (Studios, Outdoor spots)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'studio', -- studio, outdoor, online
  address JSONB,
  coordinates POINT,
  capacity INTEGER DEFAULT 20,
  amenities JSONB DEFAULT '[]',
  images TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms within locations
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 20,
  amenities JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment & Resources
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- equipment, space, service
  quantity INTEGER DEFAULT 1,
  is_bookable BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CLASSES & SCHEDULING
-- =====================================================

-- Class Templates (recurring class definitions)
CREATE TABLE class_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- yoga, pilates, meditation, etc.
  level TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced, all_levels
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  capacity INTEGER DEFAULT 20,
  price_cents INTEGER DEFAULT 0,
  instructor_id UUID REFERENCES profiles(id),
  location_id UUID REFERENCES locations(id),
  room_id UUID REFERENCES rooms(id),
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  requirements JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class Instances (specific scheduled classes)
CREATE TABLE class_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES class_templates(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT, -- Override template name if needed
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  instructor_id UUID REFERENCES profiles(id),
  location_id UUID REFERENCES locations(id),
  room_id UUID REFERENCES rooms(id),
  capacity INTEGER,
  price_cents INTEGER,
  status class_status DEFAULT 'scheduled',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring class rules
CREATE TABLE recurring_class_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES class_templates(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  recurrence_pattern JSONB NOT NULL, -- RRULE-like pattern
  start_date DATE NOT NULL,
  end_date DATE,
  exceptions DATE[] DEFAULT '{}', -- Skip these dates
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REGISTRATIONS & BOOKINGS
-- =====================================================

-- Class Registrations
CREATE TABLE class_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_instance_id UUID NOT NULL REFERENCES class_instances(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status registration_status DEFAULT 'confirmed',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  checked_in_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes TEXT,
  payment_required BOOLEAN DEFAULT true,
  payment_status payment_status DEFAULT 'pending',
  price_paid_cents INTEGER DEFAULT 0,
  booking_source TEXT DEFAULT 'admin', -- admin, portal, api, walk_in
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_instance_id, customer_id)
);

-- Waitlists
CREATE TABLE waitlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_instance_id UUID NOT NULL REFERENCES class_instances(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  promoted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  UNIQUE(class_instance_id, customer_id)
);

-- =====================================================
-- PRODUCTS & PACKAGES
-- =====================================================

-- Products (passes, memberships, retail)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name JSONB NOT NULL, -- Multi-language support
  description JSONB DEFAULT '{}',
  type TEXT NOT NULL, -- retail, class_pack, membership, gift_card, rental
  category TEXT,
  sku TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'CHF',
  tax_class TEXT DEFAULT 'standard',
  
  -- Package specific fields
  credit_count INTEGER, -- For class packs
  validity_days INTEGER, -- How long the package is valid
  class_types TEXT[], -- Which class types this package applies to
  
  -- Membership specific fields
  billing_interval TEXT, -- monthly, yearly
  billing_period INTEGER DEFAULT 1,
  
  -- Product settings
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  inventory_tracking BOOLEAN DEFAULT false,
  max_quantity_per_order INTEGER,
  channel_flags TEXT[] DEFAULT '{"web"}', -- web, pos, mobile
  visibility TEXT DEFAULT 'public', -- public, unlisted, private
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ORDERS & PAYMENTS
-- =====================================================

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id),
  order_number TEXT UNIQUE NOT NULL,
  
  -- Amounts in cents
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  
  currency TEXT DEFAULT 'CHF',
  status TEXT DEFAULT 'pending', -- pending, confirmed, fulfilled, cancelled
  payment_status payment_status DEFAULT 'pending',
  
  -- Customer details (for guest orders)
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  class_instance_id UUID REFERENCES class_instances(id), -- For direct class bookings
  
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL,
  total_price_cents INTEGER NOT NULL,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  customer_id UUID REFERENCES profiles(id),
  
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'CHF',
  payment_method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  
  -- External payment references
  stripe_payment_intent_id TEXT,
  twint_transaction_id TEXT,
  bank_reference TEXT,
  
  -- Swiss specific
  qr_bill_reference TEXT,
  
  -- Timestamps
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WALLETS & CREDITS
-- =====================================================

-- Customer Wallets
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id), -- Which package/membership this wallet is for
  
  credit_balance INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Tracking
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, organization_id, product_id)
);

-- Wallet Transactions (Ledger)
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  type wallet_transaction_type NOT NULL,
  amount INTEGER NOT NULL, -- Positive for credits, negative for debits
  balance_after INTEGER NOT NULL,
  
  -- Related records
  order_id UUID REFERENCES orders(id),
  class_registration_id UUID REFERENCES class_registrations(id),
  payment_id UUID REFERENCES payments(id),
  
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INVOICES & BILLING
-- =====================================================

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  
  invoice_number TEXT UNIQUE NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  
  status invoice_status DEFAULT 'draft',
  currency TEXT DEFAULT 'CHF',
  
  -- Swiss QR-Bill specific
  qr_reference TEXT,
  qr_code_data TEXT,
  
  -- Customer details
  billing_address JSONB,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MARKETING & COMMUNICATIONS
-- =====================================================

-- Customer Segments
CREATE TABLE segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL, -- Query criteria
  last_calculated_at TIMESTAMPTZ,
  member_count INTEGER DEFAULT 0,
  is_dynamic BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- email, sms, push, automated
  status TEXT DEFAULT 'draft', -- draft, scheduled, active, paused, completed
  
  -- Targeting
  segment_ids UUID[],
  
  -- Content
  subject TEXT,
  content JSONB,
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Stats
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SYSTEM & MONITORING
-- =====================================================

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES profiles(id),
  
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook Deliveries
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  
  webhook_url TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  
  status TEXT DEFAULT 'pending', -- pending, delivered, failed
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  
  response_status INTEGER,
  response_body TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SIS (Supabase Integration Status) Tables
CREATE TABLE sis_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  
  check_name TEXT NOT NULL,
  check_type TEXT NOT NULL, -- schema, rls, data, function
  status TEXT NOT NULL, -- pass, fail, warning
  
  details JSONB DEFAULT '{}',
  error_message TEXT,
  
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sis_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  
  total_checks INTEGER DEFAULT 0,
  passed_checks INTEGER DEFAULT 0,
  failed_checks INTEGER DEFAULT 0,
  warning_checks INTEGER DEFAULT 0,
  
  overall_status TEXT DEFAULT 'unknown', -- healthy, warning, critical, unknown
  last_check_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Multi-tenant indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_organization_members_org_user ON organization_members(organization_id, user_id);
CREATE INDEX idx_organization_members_role ON organization_members(organization_id, role);

-- Location indexes
CREATE INDEX idx_locations_org ON locations(organization_id);
CREATE INDEX idx_locations_type ON locations(organization_id, type);
CREATE INDEX idx_rooms_location ON rooms(location_id);

-- Class indexes
CREATE INDEX idx_class_templates_org ON class_templates(organization_id);
CREATE INDEX idx_class_instances_org_time ON class_instances(organization_id, start_time);
CREATE INDEX idx_class_instances_instructor ON class_instances(instructor_id);
CREATE INDEX idx_class_instances_status ON class_instances(organization_id, status);

-- Registration indexes
CREATE INDEX idx_class_registrations_class ON class_registrations(class_instance_id);
CREATE INDEX idx_class_registrations_customer ON class_registrations(customer_id);
CREATE INDEX idx_class_registrations_org_status ON class_registrations(organization_id, status);
CREATE INDEX idx_waitlists_class_position ON waitlists(class_instance_id, position);

-- Product indexes
CREATE INDEX idx_products_org_active ON products(organization_id, is_active);
CREATE INDEX idx_products_type ON products(organization_id, type);

-- Order indexes
CREATE INDEX idx_orders_org_created ON orders(organization_id, created_at);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(organization_id, status);

-- Payment indexes
CREATE INDEX idx_payments_org_created ON payments(organization_id, created_at);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(organization_id, status);

-- Wallet indexes
CREATE INDEX idx_wallets_customer_org ON wallets(customer_id, organization_id);
CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);

-- Invoice indexes
CREATE INDEX idx_invoices_org_status ON invoices(organization_id, status);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_due_date ON invoices(due_date) WHERE status IN ('sent', 'overdue');

-- Marketing indexes
CREATE INDEX idx_segments_org ON segments(organization_id);
CREATE INDEX idx_campaigns_org_status ON campaigns(organization_id, status);

-- Audit indexes
CREATE INDEX idx_audit_logs_org_created ON audit_logs(organization_id, created_at);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_templates_updated_at BEFORE UPDATE ON class_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_instances_updated_at BEFORE UPDATE ON class_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_registrations_updated_at BEFORE UPDATE ON class_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_segments_updated_at BEFORE UPDATE ON segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhook_deliveries_updated_at BEFORE UPDATE ON webhook_deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sis_summaries_updated_at BEFORE UPDATE ON sis_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();