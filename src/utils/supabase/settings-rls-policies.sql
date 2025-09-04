-- Row Level Security Policies for Settings Management
-- Ensures proper multi-tenant isolation and role-based access

-- Enable RLS on all settings tables
ALTER TABLE settings_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sis_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sis_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_feature_flags ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's organizations and role
CREATE OR REPLACE FUNCTION get_user_org_role(target_org_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM org_users
  WHERE user_id = auth.uid() 
    AND org_id = target_org_id 
    AND is_active = true;
  
  RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has specific permission
CREATE OR REPLACE FUNCTION user_has_permission(target_org_id UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_perm BOOLEAN := false;
BEGIN
  SELECT true INTO has_perm
  FROM org_users
  WHERE user_id = auth.uid() 
    AND org_id = target_org_id 
    AND is_active = true
    AND (
      role IN ('owner', 'manager') OR 
      required_permission = ANY(permissions)
    );
  
  RETURN COALESCE(has_perm, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Settings Categories (Global read, admin write)
CREATE POLICY "Everyone can read settings categories" ON settings_categories
  FOR SELECT USING (true);

CREATE POLICY "System admins can manage settings categories" ON settings_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_users 
      WHERE user_id = auth.uid() 
        AND role = 'owner' 
        AND is_active = true
    )
  );

-- Settings (Org-specific, role-based access)
CREATE POLICY "Users can read org settings" ON settings
  FOR SELECT USING (
    user_has_permission(org_id, 'settings.read') OR
    get_user_org_role(org_id) IN ('owner', 'manager', 'front_desk', 'accountant')
  );

CREATE POLICY "Managers can manage org settings" ON settings
  FOR ALL USING (
    user_has_permission(org_id, 'settings.write') OR
    get_user_org_role(org_id) IN ('owner', 'manager')
  );

-- System Health Checks (Global for system admins)
CREATE POLICY "System admins can read health checks" ON system_health_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_users 
      WHERE user_id = auth.uid() 
        AND role = 'owner' 
        AND is_active = true
    )
  );

CREATE POLICY "System admins can manage health checks" ON system_health_checks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_users 
      WHERE user_id = auth.uid() 
        AND role = 'owner' 
        AND is_active = true
    )
  );

-- System Health Results (Read-only for managers)
CREATE POLICY "Managers can read health results" ON system_health_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_users 
      WHERE user_id = auth.uid() 
        AND role IN ('owner', 'manager') 
        AND is_active = true
    )
  );

CREATE POLICY "System can insert health results" ON system_health_results
  FOR INSERT WITH CHECK (true); -- Allow system to insert results

-- API Keys (Org-specific, restricted access)
CREATE POLICY "Owners can read org API keys" ON api_keys
  FOR SELECT USING (
    get_user_org_role(org_id) = 'owner'
  );

CREATE POLICY "Owners can manage org API keys" ON api_keys
  FOR ALL USING (
    get_user_org_role(org_id) = 'owner'
  );

-- Webhooks (Org-specific, manager access)
CREATE POLICY "Managers can read org webhooks" ON webhooks
  FOR SELECT USING (
    user_has_permission(org_id, 'integrations.read') OR
    get_user_org_role(org_id) IN ('owner', 'manager')
  );

CREATE POLICY "Managers can manage org webhooks" ON webhooks
  FOR ALL USING (
    user_has_permission(org_id, 'integrations.write') OR
    get_user_org_role(org_id) IN ('owner', 'manager')
  );

-- Webhook Deliveries (Read-only for debugging)
CREATE POLICY "Managers can read webhook deliveries" ON webhook_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM webhooks w
      WHERE w.id = webhook_deliveries.webhook_id
        AND (
          user_has_permission(w.org_id, 'integrations.read') OR
          get_user_org_role(w.org_id) IN ('owner', 'manager')
        )
    )
  );

CREATE POLICY "System can insert webhook deliveries" ON webhook_deliveries
  FOR INSERT WITH CHECK (true); -- Allow system to insert deliveries

-- Integration Providers (Global read)
CREATE POLICY "Everyone can read integration providers" ON integration_providers
  FOR SELECT USING (is_active = true);

CREATE POLICY "System admins can manage providers" ON integration_providers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_users 
      WHERE user_id = auth.uid() 
        AND role = 'owner' 
        AND is_active = true
    )
  );

-- Integrations (Org-specific, manager access)
CREATE POLICY "Managers can read org integrations" ON integrations
  FOR SELECT USING (
    user_has_permission(org_id, 'integrations.read') OR
    get_user_org_role(org_id) IN ('owner', 'manager')
  );

CREATE POLICY "Managers can manage org integrations" ON integrations
  FOR ALL USING (
    user_has_permission(org_id, 'integrations.write') OR
    get_user_org_role(org_id) IN ('owner', 'manager')
  );

-- Compliance Policies (Org-specific, public read for active policies)
CREATE POLICY "Public can read active policies" ON compliance_policies
  FOR SELECT USING (
    is_active = true AND 
    effective_from <= now() AND 
    (effective_until IS NULL OR effective_until > now())
  );

CREATE POLICY "Managers can manage org policies" ON compliance_policies
  FOR ALL USING (
    user_has_permission(org_id, 'compliance.write') OR
    get_user_org_role(org_id) IN ('owner', 'manager')
  );

-- Policy Acceptances (User can read own, managers can read all)
CREATE POLICY "Users can read own acceptances" ON policy_acceptances
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can read org acceptances" ON policy_acceptances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM compliance_policies cp
      WHERE cp.id = policy_acceptances.policy_id
        AND (
          user_has_permission(cp.org_id, 'compliance.read') OR
          get_user_org_role(cp.org_id) IN ('owner', 'manager')
        )
    )
  );

CREATE POLICY "Users can accept policies" ON policy_acceptances
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Data Subject Requests (Org-specific, privacy officer access)
CREATE POLICY "Privacy officers can read DSARs" ON data_subject_requests
  FOR SELECT USING (
    user_has_permission(org_id, 'privacy.read') OR
    get_user_org_role(org_id) IN ('owner', 'manager')
  );

CREATE POLICY "Privacy officers can manage DSARs" ON data_subject_requests
  FOR ALL USING (
    user_has_permission(org_id, 'privacy.write') OR
    get_user_org_role(org_id) IN ('owner', 'manager')
  );

-- Consent Records (User can read own, managers can read all)
CREATE POLICY "Users can read own consent" ON consent_records
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can read org consent" ON consent_records
  FOR SELECT USING (
    user_has_permission(org_id, 'privacy.read') OR
    get_user_org_role(org_id) IN ('owner', 'manager')
  );

CREATE POLICY "System can manage consent" ON consent_records
  FOR ALL USING (true); -- Allow system to manage consent records

-- Security Settings (Owner only)
CREATE POLICY "Owners can read security settings" ON security_settings
  FOR SELECT USING (
    get_user_org_role(org_id) = 'owner'
  );

CREATE POLICY "Owners can manage security settings" ON security_settings
  FOR ALL USING (
    get_user_org_role(org_id) = 'owner'
  );

-- Roles (Org-specific, owner access)
CREATE POLICY "Users can read org roles" ON roles
  FOR SELECT USING (
    user_has_permission(org_id, 'roles.read') OR
    get_user_org_role(org_id) IN ('owner', 'manager')
  );

CREATE POLICY "Owners can manage roles" ON roles
  FOR ALL USING (
    get_user_org_role(org_id) = 'owner'
  );

-- Audit Logs (Read-only for managers, system writes)
CREATE POLICY "Managers can read org audit logs" ON audit_logs
  FOR SELECT USING (
    user_has_permission(org_id, 'audit.read') OR
    get_user_org_role(org_id) IN ('owner', 'manager')
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true); -- Allow system to insert audit logs

-- SIS Inventory (Global read for developers, system admin write)
CREATE POLICY "Developers can read SIS inventory" ON sis_inventory
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_users 
      WHERE user_id = auth.uid() 
        AND role IN ('owner', 'manager') 
        AND is_active = true
    )
  );

CREATE POLICY "System admins can manage SIS inventory" ON sis_inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_users 
      WHERE user_id = auth.uid() 
        AND role = 'owner' 
        AND is_active = true
    )
  );

-- SIS Checks (Global read for developers, system admin write)
CREATE POLICY "Developers can read SIS checks" ON sis_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_users 
      WHERE user_id = auth.uid() 
        AND role IN ('owner', 'manager') 
        AND is_active = true
    )
  );

CREATE POLICY "System admins can manage SIS checks" ON sis_checks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_users 
      WHERE user_id = auth.uid() 
        AND role = 'owner' 
        AND is_active = true
    )
  );

-- SIS Runs (Global read for developers, system write)
CREATE POLICY "Developers can read SIS runs" ON sis_runs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_users 
      WHERE user_id = auth.uid() 
        AND role IN ('owner', 'manager') 
        AND is_active = true
    )
  );

CREATE POLICY "System can manage SIS runs" ON sis_runs
  FOR ALL USING (true); -- Allow system to manage runs

-- SIS Results (Global read for developers, system write)
CREATE POLICY "Developers can read SIS results" ON sis_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_users 
      WHERE user_id = auth.uid() 
        AND role IN ('owner', 'manager') 
        AND is_active = true
    )
  );

CREATE POLICY "System can manage SIS results" ON sis_results
  FOR ALL USING (true); -- Allow system to manage results

-- Email Templates (Org-specific, manager access)
CREATE POLICY "Users can read org email templates" ON email_templates
  FOR SELECT USING (
    user_has_permission(org_id, 'templates.read') OR
    get_user_org_role(org_id) IN ('owner', 'manager', 'marketer')
  );

CREATE POLICY "Managers can manage email templates" ON email_templates
  FOR ALL USING (
    user_has_permission(org_id, 'templates.write') OR
    get_user_org_role(org_id) IN ('owner', 'manager', 'marketer')
  );

-- Feature Flags (Global read, system admin write)
CREATE POLICY "Everyone can read active feature flags" ON feature_flags
  FOR SELECT USING (is_active = true);

CREATE POLICY "System admins can manage feature flags" ON feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_users 
      WHERE user_id = auth.uid() 
        AND role = 'owner' 
        AND is_active = true
    )
  );

-- Org Feature Flags (Org-specific, manager access)
CREATE POLICY "Users can read org feature flags" ON org_feature_flags
  FOR SELECT USING (
    user_has_permission(org_id, 'feature_flags.read') OR
    get_user_org_role(org_id) IN ('owner', 'manager')
  );

CREATE POLICY "Managers can manage org feature flags" ON org_feature_flags
  FOR ALL USING (
    user_has_permission(org_id, 'feature_flags.write') OR
    get_user_org_role(org_id) IN ('owner', 'manager')
  );