-- =====================================================
-- YogaSwiss Complete RLS Policies
-- Row Level Security for Multi-Tenant Architecture
-- =====================================================

-- Enable RLS on all tables
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
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Function to check if user has roles in organization
CREATE OR REPLACE FUNCTION user_has_roles_in_org(org_id UUID, allowed_roles user_role[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = org_id
    AND om.user_id = auth.uid()
    AND om.role = ANY(allowed_roles)
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
-- ORGANIZATIONS & USERS
-- =====================================================

-- Organizations: Only members can view, only owners can modify
CREATE POLICY "Members can view their organizations" ON organizations
  FOR SELECT USING (
    id = ANY(user_organizations())
  );

CREATE POLICY "Owners can update their organizations" ON organizations
  FOR UPDATE USING (
    user_has_roles_in_org(id, ARRAY['owner'])
  );

CREATE POLICY "Owners can insert organizations" ON organizations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Profiles: Users can see their own profile and org members
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (
    user_is_self(id)
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (
    user_is_self(id)
  );

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (
    user_is_self(id)
  );

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
CREATE POLICY "Members can view org membership" ON organization_members
  FOR SELECT USING (
    user_is_org_member(organization_id)
  );

CREATE POLICY "Staff can manage org membership" ON organization_members
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

-- =====================================================
-- LOCATIONS & RESOURCES
-- =====================================================

-- Locations: Org members can view, staff can manage
CREATE POLICY "Org members can view locations" ON locations
  FOR SELECT USING (
    user_is_org_member(organization_id)
  );

CREATE POLICY "Staff can manage locations" ON locations
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

-- Rooms: Same as locations
CREATE POLICY "Org members can view rooms" ON rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM locations l
      WHERE l.id = rooms.location_id
      AND user_is_org_member(l.organization_id)
    )
  );

CREATE POLICY "Staff can manage rooms" ON rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM locations l
      WHERE l.id = rooms.location_id
      AND user_has_roles_in_org(l.organization_id, ARRAY['owner', 'studio_manager'])
    )
  );

-- Resources: Same as locations
CREATE POLICY "Org members can view resources" ON resources
  FOR SELECT USING (
    user_is_org_member(organization_id)
  );

CREATE POLICY "Staff can manage resources" ON resources
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

-- =====================================================
-- CLASSES & SCHEDULING
-- =====================================================

-- Class Templates: Org members can view, staff can manage
CREATE POLICY "Org members can view class templates" ON class_templates
  FOR SELECT USING (
    user_is_org_member(organization_id)
  );

CREATE POLICY "Staff can manage class templates" ON class_templates
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

CREATE POLICY "Instructors can update their templates" ON class_templates
  FOR UPDATE USING (
    instructor_id = auth.uid()
    AND user_is_org_member(organization_id)
  );

-- Class Instances: Org members can view, staff can manage
CREATE POLICY "Org members can view class instances" ON class_instances
  FOR SELECT USING (
    user_is_org_member(organization_id)
  );

CREATE POLICY "Staff can manage class instances" ON class_instances
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk'])
  );

CREATE POLICY "Instructors can update their classes" ON class_instances
  FOR UPDATE USING (
    instructor_id = auth.uid()
    AND user_is_org_member(organization_id)
  );

-- Recurring Class Rules: Staff only
CREATE POLICY "Staff can manage recurring rules" ON recurring_class_rules
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

-- =====================================================
-- REGISTRATIONS & BOOKINGS
-- =====================================================

-- Class Registrations: Customers can view their own, staff can view all
CREATE POLICY "Customers can view their registrations" ON class_registrations
  FOR SELECT USING (
    customer_id = auth.uid()
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'instructor'])
  );

CREATE POLICY "Customers can register for classes" ON class_registrations
  FOR INSERT WITH CHECK (
    customer_id = auth.uid()
    AND user_is_org_member(organization_id)
  );

CREATE POLICY "Customers can cancel their registrations" ON class_registrations
  FOR UPDATE USING (
    customer_id = auth.uid()
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk'])
  );

CREATE POLICY "Staff can manage all registrations" ON class_registrations
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk'])
  );

-- Waitlists: Same as registrations
CREATE POLICY "Customers can view their waitlist entries" ON waitlists
  FOR SELECT USING (
    customer_id = auth.uid()
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk'])
  );

CREATE POLICY "Customers can join waitlists" ON waitlists
  FOR INSERT WITH CHECK (
    customer_id = auth.uid()
    AND user_is_org_member(organization_id)
  );

CREATE POLICY "Staff can manage waitlists" ON waitlists
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk'])
  );

-- =====================================================
-- PRODUCTS & ORDERS
-- =====================================================

-- Products: Org members can view, staff can manage
CREATE POLICY "Org members can view products" ON products
  FOR SELECT USING (
    user_is_org_member(organization_id)
  );

CREATE POLICY "Staff can manage products" ON products
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

-- Orders: Customers can view their own, staff can view all
CREATE POLICY "Customers can view their orders" ON orders
  FOR SELECT USING (
    customer_id = auth.uid()
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'accountant'])
  );

CREATE POLICY "Customers can create orders" ON orders
  FOR INSERT WITH CHECK (
    customer_id = auth.uid()
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk'])
  );

CREATE POLICY "Staff can manage orders" ON orders
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'accountant'])
  );

-- Order Items: Same access as parent order
CREATE POLICY "Users can view order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND (o.customer_id = auth.uid() 
           OR user_has_roles_in_org(o.organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'accountant']))
    )
  );

CREATE POLICY "Staff can manage order items" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND user_has_roles_in_org(o.organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'accountant'])
    )
  );

-- =====================================================
-- PAYMENTS & FINANCE
-- =====================================================

-- Payments: Customers can view their own, finance staff can view all
CREATE POLICY "Customers can view their payments" ON payments
  FOR SELECT USING (
    customer_id = auth.uid()
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'accountant'])
  );

CREATE POLICY "Staff can manage payments" ON payments
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'accountant'])
  );

-- Wallets: Customers can view their own, staff can view all
CREATE POLICY "Customers can view their wallets" ON wallets
  FOR SELECT USING (
    customer_id = auth.uid()
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'accountant'])
  );

CREATE POLICY "Staff can manage wallets" ON wallets
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'accountant'])
  );

-- Wallet Transactions: Same as wallets
CREATE POLICY "Users can view wallet transactions" ON wallet_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wallets w
      WHERE w.id = wallet_transactions.wallet_id
      AND (w.customer_id = auth.uid() 
           OR user_has_roles_in_org(w.organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'accountant']))
    )
  );

CREATE POLICY "Staff can manage wallet transactions" ON wallet_transactions
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'accountant'])
  );

-- Invoices: Customers can view their own, finance staff can manage
CREATE POLICY "Customers can view their invoices" ON invoices
  FOR SELECT USING (
    customer_id = auth.uid()
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'accountant'])
  );

CREATE POLICY "Finance staff can manage invoices" ON invoices
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'accountant'])
  );

-- =====================================================
-- INSTRUCTORS & PAYROLL
-- =====================================================

-- Instructors: Org members can view, managers can manage
CREATE POLICY "Org members can view instructors" ON instructors
  FOR SELECT USING (
    user_is_org_member(organization_id)
  );

CREATE POLICY "Managers can manage instructors" ON instructors
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

CREATE POLICY "Instructors can update their profile" ON instructors
  FOR UPDATE USING (
    user_id = auth.uid()
    AND user_is_org_member(organization_id)
  );

-- Instructor Availability: Instructors can manage their own, managers can view all
CREATE POLICY "Instructors can manage their availability" ON instructor_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM instructors i
      WHERE i.id = instructor_availability.instructor_id
      AND (i.user_id = auth.uid() 
           OR user_has_roles_in_org(i.organization_id, ARRAY['owner', 'studio_manager']))
    )
  );

-- Earnings: Instructors can view their own, finance staff can manage
CREATE POLICY "Instructors can view their earnings" ON earnings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM instructors i
      WHERE i.id = earnings.instructor_id
      AND (i.user_id = auth.uid() 
           OR user_has_roles_in_org(earnings.organization_id, ARRAY['owner', 'studio_manager', 'accountant']))
    )
  );

CREATE POLICY "Finance staff can manage earnings" ON earnings
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'accountant'])
  );

-- Timesheets: Instructors can manage their own, staff can view
CREATE POLICY "Instructors can manage their timesheets" ON timesheets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM instructors i
      WHERE i.id = timesheets.instructor_id
      AND (i.user_id = auth.uid() 
           OR user_has_roles_in_org(timesheets.organization_id, ARRAY['owner', 'studio_manager', 'accountant']))
    )
  );

-- =====================================================
-- RETREATS & PROGRAMS
-- =====================================================

-- Retreats: Org members can view, staff can manage
CREATE POLICY "Org members can view retreats" ON retreats
  FOR SELECT USING (
    user_is_org_member(organization_id)
  );

CREATE POLICY "Staff can manage retreats" ON retreats
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

-- Retreat Registrations: Customers can view their own, staff can view all
CREATE POLICY "Customers can view their retreat registrations" ON retreat_registrations
  FOR SELECT USING (
    customer_id = auth.uid()
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk'])
  );

CREATE POLICY "Customers can register for retreats" ON retreat_registrations
  FOR INSERT WITH CHECK (
    customer_id = auth.uid()
    AND user_is_org_member(organization_id)
  );

CREATE POLICY "Staff can manage retreat registrations" ON retreat_registrations
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk'])
  );

-- Programs: Same as retreats
CREATE POLICY "Org members can view programs" ON programs
  FOR SELECT USING (
    user_is_org_member(organization_id)
  );

CREATE POLICY "Staff can manage programs" ON programs
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

-- =====================================================
-- MARKETING & COMMUNICATIONS
-- =====================================================

-- Segments: Marketing staff only
CREATE POLICY "Marketing staff can manage segments" ON segments
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'marketer'])
  );

-- Campaigns: Marketing staff only
CREATE POLICY "Marketing staff can manage campaigns" ON campaigns
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'marketer'])
  );

-- Journeys: Marketing staff only
CREATE POLICY "Marketing staff can manage journeys" ON journeys
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'marketer'])
  );

-- Referrals: Customers can view their own, staff can manage
CREATE POLICY "Customers can view their referrals" ON referrals
  FOR SELECT USING (
    referrer_id = auth.uid() OR referee_id = auth.uid()
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'marketer'])
  );

CREATE POLICY "Customers can create referrals" ON referrals
  FOR INSERT WITH CHECK (
    referrer_id = auth.uid()
    AND user_is_org_member(organization_id)
  );

CREATE POLICY "Staff can manage referrals" ON referrals
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'marketer'])
  );

-- =====================================================
-- BRAND MANAGEMENT
-- =====================================================

-- Brands: Org members can view, owners can manage
CREATE POLICY "Org members can view brands" ON brands
  FOR SELECT USING (
    user_is_org_member(organization_id)
  );

CREATE POLICY "Owners can manage brands" ON brands
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner'])
  );

-- =====================================================
-- SYSTEM & MONITORING
-- =====================================================

-- System Alerts: Org specific or global, staff can manage
CREATE POLICY "Staff can view system alerts" ON system_alerts
  FOR SELECT USING (
    organization_id IS NULL -- Global alerts
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

CREATE POLICY "Staff can manage system alerts" ON system_alerts
  FOR ALL USING (
    organization_id IS NULL -- Global alerts (service role only)
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

-- Audit Logs: Read-only for relevant users
CREATE POLICY "Staff can view audit logs" ON audit_logs
  FOR SELECT USING (
    user_id = auth.uid() -- Own actions
    OR (organization_id IS NOT NULL AND user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'auditor']))
  );

-- Webhook Deliveries: Owners only
CREATE POLICY "Owners can manage webhooks" ON webhook_deliveries
  FOR ALL USING (
    organization_id IS NULL -- System webhooks
    OR user_has_roles_in_org(organization_id, ARRAY['owner'])
  );

-- SIS Tables: Staff can view
CREATE POLICY "Staff can view sis checks" ON sis_checks
  FOR SELECT USING (
    organization_id IS NULL
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

CREATE POLICY "Staff can view sis summaries" ON sis_summaries
  FOR SELECT USING (
    organization_id IS NULL
    OR user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

CREATE POLICY "Staff can view sis runs" ON sis_runs
  FOR SELECT USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

-- =====================================================
-- COMMUNITY & MESSAGING
-- =====================================================

-- Threads: Org members can view, moderators can manage
CREATE POLICY "Org members can view threads" ON threads
  FOR SELECT USING (
    user_is_org_member(organization_id)
  );

CREATE POLICY "Customers can create threads" ON threads
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND user_is_org_member(organization_id)
  );

CREATE POLICY "Moderators can manage threads" ON threads
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
    OR created_by = auth.uid()
  );

-- Thread Messages: Org members can view, authors can edit
CREATE POLICY "Org members can view messages" ON thread_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM threads t
      WHERE t.id = thread_messages.thread_id
      AND user_is_org_member(t.organization_id)
    )
  );

CREATE POLICY "Users can create messages" ON thread_messages
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM threads t
      WHERE t.id = thread_messages.thread_id
      AND user_is_org_member(t.organization_id)
    )
  );

CREATE POLICY "Authors can edit their messages" ON thread_messages
  FOR UPDATE USING (
    author_id = auth.uid()
  );

-- Moderation Queue: Staff only
CREATE POLICY "Staff can manage moderation queue" ON moderation_queue
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

-- =====================================================
-- SERVICE ROLE POLICIES (Bypass RLS)
-- =====================================================

-- Allow service role to bypass RLS for system operations
CREATE POLICY "Service role has full access" ON organizations
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role has full access" ON profiles
  FOR ALL TO service_role USING (true);

-- Apply service role policy to all tables
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'sql_%'
        AND tablename != 'organizations'
        AND tablename != 'profiles'
    LOOP
        EXECUTE format('CREATE POLICY "Service role has full access" ON %I FOR ALL TO service_role USING (true)', table_name);
    END LOOP;
END $$;

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE class_instances;
ALTER PUBLICATION supabase_realtime ADD TABLE class_registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE waitlists;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE threads;
ALTER PUBLICATION supabase_realtime ADD TABLE thread_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE system_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE sis_runs;