-- =====================================================
-- YogaSwiss RLS Policies Migration
-- Migration: 20241203000002_rls_policies
-- Row Level Security for Multi-Tenant Architecture
-- =====================================================

-- =====================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_class_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE retreats ENABLE ROW LEVEL SECURITY;
ALTER TABLE retreat_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sis_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sis_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Function to check if user has roles in organization
CREATE OR REPLACE FUNCTION user_has_roles_in_org(org_id UUID, allowed_roles text[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = org_id
    AND om.user_id = auth.uid()
    AND om.role::text = ANY(allowed_roles)
    AND om.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is member of organization
CREATE OR REPLACE FUNCTION user_is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = org_id
    AND om.user_id = auth.uid()
    AND om.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's organizations
CREATE OR REPLACE FUNCTION user_organizations()
RETURNS UUID[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is the owner
CREATE OR REPLACE FUNCTION user_is_self(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 3: BASIC RLS POLICIES
-- =====================================================

-- Organizations: Only members can view, only owners can modify
DROP POLICY IF EXISTS "Members can view their organizations" ON organizations;
CREATE POLICY "Members can view their organizations" ON organizations
  FOR SELECT USING (
    id = ANY(user_organizations())
  );

DROP POLICY IF EXISTS "Owners can update their organizations" ON organizations;
CREATE POLICY "Owners can update their organizations" ON organizations
  FOR UPDATE USING (
    user_has_roles_in_org(id, ARRAY['owner'])
  );

DROP POLICY IF EXISTS "Owners can insert organizations" ON organizations;
CREATE POLICY "Owners can insert organizations" ON organizations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Profiles: Users can see their own profile and org members
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (
    user_is_self(id)
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (
    user_is_self(id)
  );

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (
    user_is_self(id)
  );

DROP POLICY IF EXISTS "Org members can view member profiles" ON profiles;
CREATE POLICY "Org members can view member profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om1, organization_members om2
      WHERE om1.user_id = auth.uid()
      AND om2.user_id = profiles.id
      AND om1.organization_id = om2.organization_id
      AND om1.is_active = true
      AND om2.is_active = true
    )
  );

-- Organization Members: Staff can manage, members can view
DROP POLICY IF EXISTS "Members can view org membership" ON organization_members;
CREATE POLICY "Members can view org membership" ON organization_members
  FOR SELECT USING (
    user_is_org_member(organization_id)
  );

DROP POLICY IF EXISTS "Staff can manage org membership" ON organization_members;
CREATE POLICY "Staff can manage org membership" ON organization_members
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

-- Class Instances: Org members can view, staff can manage
DROP POLICY IF EXISTS "Org members can view class instances" ON class_instances;
CREATE POLICY "Org members can view class instances" ON class_instances
  FOR SELECT USING (
    user_is_org_member(organization_id)
  );

DROP POLICY IF EXISTS "Staff can manage class instances" ON class_instances;
CREATE POLICY "Staff can manage class instances" ON class_instances
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk'])
  );

-- Class Registrations: Customers can view their own, staff can view all
DROP POLICY IF EXISTS "Customers can view their registrations" ON class_registrations;
CREATE POLICY "Customers can view their registrations" ON class_registrations
  FOR SELECT USING (
    customer_id = auth.uid()
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'instructor'])
  );

DROP POLICY IF EXISTS "Customers can register for classes" ON class_registrations;
CREATE POLICY "Customers can register for classes" ON class_registrations
  FOR INSERT WITH CHECK (
    customer_id = auth.uid()
    AND user_is_org_member(organization_id)
  );

DROP POLICY IF EXISTS "Staff can manage all registrations" ON class_registrations;
CREATE POLICY "Staff can manage all registrations" ON class_registrations
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk'])
  );

-- Orders: Customers can view their own, staff can view all
DROP POLICY IF EXISTS "Customers can view their orders" ON orders;
CREATE POLICY "Customers can view their orders" ON orders
  FOR SELECT USING (
    customer_id = auth.uid()
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'accountant'])
  );

DROP POLICY IF EXISTS "Staff can manage orders" ON orders;
CREATE POLICY "Staff can manage orders" ON orders
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'accountant'])
  );

-- Wallets: Customers can view their own, staff can view all
DROP POLICY IF EXISTS "Customers can view their wallets" ON wallets;
CREATE POLICY "Customers can view their wallets" ON wallets
  FOR SELECT USING (
    customer_id = auth.uid()
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'accountant'])
  );

DROP POLICY IF EXISTS "Staff can manage wallets" ON wallets;
CREATE POLICY "Staff can manage wallets" ON wallets
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'accountant'])
  );

-- =====================================================
-- STEP 4: SERVICE ROLE POLICIES (Bypass RLS)
-- =====================================================

-- Allow service role to bypass RLS for system operations
DROP POLICY IF EXISTS "Service role has full access organizations" ON organizations;
CREATE POLICY "Service role has full access organizations" ON organizations
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role has full access profiles" ON profiles;
CREATE POLICY "Service role has full access profiles" ON profiles
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role has full access organization_members" ON organization_members;
CREATE POLICY "Service role has full access organization_members" ON organization_members
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role has full access class_instances" ON class_instances;
CREATE POLICY "Service role has full access class_instances" ON class_instances
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role has full access class_registrations" ON class_registrations;
CREATE POLICY "Service role has full access class_registrations" ON class_registrations
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role has full access orders" ON orders;
CREATE POLICY "Service role has full access orders" ON orders
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role has full access wallets" ON wallets;
CREATE POLICY "Service role has full access wallets" ON wallets
  FOR ALL TO service_role USING (true);

-- Add service role policies for other essential tables
DROP POLICY IF EXISTS "Service role has full access locations" ON locations;
CREATE POLICY "Service role has full access locations" ON locations
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role has full access class_templates" ON class_templates;
CREATE POLICY "Service role has full access class_templates" ON class_templates
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role has full access products" ON products;
CREATE POLICY "Service role has full access products" ON products
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role has full access payments" ON payments;
CREATE POLICY "Service role has full access payments" ON payments
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role has full access instructors" ON instructors;
CREATE POLICY "Service role has full access instructors" ON instructors
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role has full access retreats" ON retreats;
CREATE POLICY "Service role has full access retreats" ON retreats
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role has full access system_alerts" ON system_alerts;
CREATE POLICY "Service role has full access system_alerts" ON system_alerts
  FOR ALL TO service_role USING (true);