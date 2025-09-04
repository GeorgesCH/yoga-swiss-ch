-- Row Level Security (RLS) Policies for YogaSwiss Platform
-- These policies ensure proper data access control based on user roles and organization membership

-- Enable RLS on all tables
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Organizations (orgs) policies
CREATE POLICY "Users can view orgs they belong to" ON orgs
  FOR SELECT USING (
    id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Brand owners can manage brand and child studios" ON orgs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_users 
      WHERE org_id = orgs.id 
      AND user_id = auth.uid() 
      AND role = 'owner' 
      AND is_active = true
    )
    OR 
    EXISTS (
      SELECT 1 FROM org_users ou
      JOIN orgs parent ON parent.id = ou.org_id
      WHERE parent.type = 'brand'
      AND orgs.parent_id = parent.id
      AND ou.user_id = auth.uid()
      AND ou.role = 'owner'
      AND ou.is_active = true
    )
  );

-- User profiles policies
CREATE POLICY "Users can view and update their own profile" ON user_profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "Studio staff can view customer profiles in their org" ON user_profiles
  FOR SELECT USING (
    id IN (
      SELECT ou.user_id FROM org_users ou
      JOIN org_users staff ON staff.org_id = ou.org_id
      WHERE staff.user_id = auth.uid()
      AND staff.role IN ('manager', 'owner', 'front_desk', 'instructor')
      AND staff.is_active = true
    )
  );

-- Organization users (org_users) policies  
CREATE POLICY "Users can view their own org memberships" ON org_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers and owners can view org users in their org" ON org_users
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid()
      AND role IN ('manager', 'owner')
      AND is_active = true
    )
  );

CREATE POLICY "Owners can manage org users" ON org_users
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid()
      AND role = 'owner'
      AND is_active = true
    )
  );

-- Locations policies
CREATE POLICY "Users can view locations in their org" ON locations
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Managers and owners can manage locations" ON locations
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid()
      AND role IN ('manager', 'owner')
      AND is_active = true
    )
  );

-- Class templates policies
CREATE POLICY "Users can view class templates in their org" ON class_templates
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Instructors and managers can manage class templates" ON class_templates
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid()
      AND role IN ('instructor', 'manager', 'owner')
      AND is_active = true
    )
  );

-- Class occurrences policies
CREATE POLICY "Users can view class occurrences in their org" ON class_occurrences
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Instructors can manage their own classes" ON class_occurrences
  FOR ALL USING (
    instructor_id = auth.uid()
    OR org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid()
      AND role IN ('manager', 'owner')
      AND is_active = true
    )
  );

-- Registrations policies
CREATE POLICY "Customers can view their own registrations" ON registrations
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can create registrations for themselves" ON registrations
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can cancel their own registrations" ON registrations
  FOR UPDATE USING (
    customer_id = auth.uid()
    AND status IN ('confirmed', 'waitlisted')
  ) WITH CHECK (
    customer_id = auth.uid()
    AND status = 'cancelled'
  );

CREATE POLICY "Studio staff can view registrations in their org" ON registrations
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid()
      AND role IN ('manager', 'owner', 'front_desk', 'instructor')
      AND is_active = true
    )
  );

CREATE POLICY "Studio staff can manage registrations in their org" ON registrations
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid()
      AND role IN ('manager', 'owner', 'front_desk')
      AND is_active = true
    )
  );

-- Instructors can only see basic roster info (not PII) unless explicitly granted
CREATE POLICY "Instructors can view basic registration info for their classes" ON registrations
  FOR SELECT USING (
    occurrence_id IN (
      SELECT id FROM class_occurrences
      WHERE instructor_id = auth.uid()
    )
    -- Additional check: instructor has roster access permission
    AND EXISTS (
      SELECT 1 FROM org_users
      WHERE user_id = auth.uid()
      AND org_id = registrations.org_id
      AND 'read:roster_basic' = ANY(permissions)
      AND is_active = true
    )
  );

-- Wallets policies
CREATE POLICY "Customers can view their own wallets" ON wallets
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Studio staff can view customer wallets in their org" ON wallets
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid()
      AND role IN ('manager', 'owner', 'front_desk')
      AND is_active = true
    )
  );

CREATE POLICY "Front desk and managers can update wallets" ON wallets
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid()
      AND role IN ('manager', 'owner', 'front_desk')
      AND is_active = true
    )
  );

-- Passes policies
CREATE POLICY "Customers can view their own passes" ON passes
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Studio staff can view customer passes in their org" ON passes
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid()
      AND role IN ('manager', 'owner', 'front_desk')
      AND is_active = true
    )
  );

CREATE POLICY "Staff can create and manage passes" ON passes
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid()
      AND role IN ('manager', 'owner', 'front_desk')
      AND is_active = true
    )
  );

-- Products policies
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Managers can manage products" ON products
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid()
      AND role IN ('manager', 'owner')
      AND is_active = true
    )
  );

-- Orders policies
CREATE POLICY "Customers can view their own orders" ON orders
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can create orders for themselves" ON orders
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Studio staff can view orders in their org" ON orders
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid()
      AND role IN ('manager', 'owner', 'front_desk', 'accountant')
      AND is_active = true
    )
  );

-- Invoices policies
CREATE POLICY "Customers can view their own invoices" ON invoices
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Finance staff can view invoices in their org" ON invoices
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid()
      AND role IN ('manager', 'owner', 'accountant')
      AND is_active = true
    )
  );

CREATE POLICY "Accountants and managers can manage invoices" ON invoices
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid()
      AND role IN ('manager', 'owner', 'accountant')
      AND is_active = true
    )
  );

-- Security functions for additional checks

-- Function to check specific permissions
CREATE OR REPLACE FUNCTION has_permission(required_permission text, target_org_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM org_users
    WHERE user_id = auth.uid()
    AND org_id = target_org_id
    AND (
      required_permission = ANY(permissions)
      OR role = 'owner'  -- Owners have all permissions
    )
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access sensitive PII (medical/dietary info)
CREATE OR REPLACE FUNCTION can_access_sensitive_pii(target_org_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM org_users
    WHERE user_id = auth.uid()
    AND org_id = target_org_id
    AND role IN ('owner', 'manager')  -- Only owners and managers
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION audit_sensitive_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive data
  INSERT INTO audit_log (
    user_id,
    action,
    table_name,
    record_id,
    org_id,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.org_id, OLD.org_id),
    jsonb_build_object(
      'sensitive_access', true,
      'ip_address', current_setting('request.headers')::json->>'cf-connecting-ip'
    ),
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER audit_user_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION audit_sensitive_access();

CREATE TRIGGER audit_registrations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON registrations
  FOR EACH ROW EXECUTE FUNCTION audit_sensitive_access();

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  org_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only owners and managers can view audit logs for their org
CREATE POLICY "Owners and managers can view audit logs" ON audit_log
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
      AND is_active = true
    )
  );