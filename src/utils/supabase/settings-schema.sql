-- Settings Management Schema for YogaSwiss
-- Complete settings system with full Swiss compliance and multi-tenant support

-- Settings categories and configuration
CREATE TABLE settings_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Main settings table - generic key-value store per org
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  category_id UUID REFERENCES settings_categories(id),
  key TEXT NOT NULL,
  value JSONB,
  data_type TEXT CHECK (data_type IN ('string', 'number', 'boolean', 'array', 'object', 'date', 'url', 'email', 'phone')),
  is_encrypted BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  validation_rules JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, key)
);

-- System Health Monitoring
CREATE TABLE system_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('database', 'api', 'realtime', 'storage', 'webhook', 'payment', 'email', 'sms')),
  endpoint TEXT,
  expected_response JSONB,
  timeout_seconds INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE system_health_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_id UUID NOT NULL REFERENCES system_health_checks(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('ok', 'warn', 'fail')) NOT NULL,
  response_time_ms INTEGER,
  response_data JSONB,
  error_message TEXT,
  checked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- API Keys and Access Management
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  permissions TEXT[] DEFAULT '{}',
  ip_allowlist INET[],
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Webhook Management
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  signing_method TEXT DEFAULT 'sha256',
  is_active BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,
  timeout_seconds INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT CHECK (status IN ('pending', 'success', 'failed', 'retrying')) DEFAULT 'pending',
  response_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  attempt_count INTEGER DEFAULT 0,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Integration Providers
CREATE TABLE integration_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT CHECK (type IN ('payment', 'messaging', 'analytics', 'calendar', 'accounting', 'storage')),
  description TEXT,
  logo_url TEXT,
  config_schema JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES integration_providers(id),
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  credentials JSONB, -- encrypted
  status TEXT CHECK (status IN ('connected', 'disconnected', 'error', 'pending')) DEFAULT 'pending',
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, provider_id)
);

-- Compliance and Legal
CREATE TABLE compliance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('terms', 'privacy', 'cookie', 'waiver', 'cancellation', 'refund')) NOT NULL,
  title JSONB NOT NULL, -- multi-language titles
  content JSONB NOT NULL, -- multi-language content (HTML)
  version TEXT NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL,
  effective_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  requires_acceptance BOOLEAN DEFAULT false,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE policy_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES compliance_policies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(policy_id, user_id)
);

-- Data Subject Access Requests (GDPR)
CREATE TABLE data_subject_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  requester_email TEXT NOT NULL,
  requester_name TEXT,
  request_type TEXT CHECK (request_type IN ('access', 'portability', 'rectification', 'erasure', 'restriction')) NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'expired')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  response_data JSONB,
  notes TEXT,
  assigned_to UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Consent Management
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  email TEXT,
  purpose TEXT NOT NULL, -- marketing, analytics, functional, etc.
  consent_given BOOLEAN NOT NULL,
  consent_method TEXT CHECK (consent_method IN ('opt_in', 'opt_out', 'double_opt_in', 'implied', 'legitimate_interest')),
  ip_address INET,
  user_agent TEXT,
  source_url TEXT,
  metadata JSONB,
  expires_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Security Settings
CREATE TABLE security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, setting_key)
);

-- Role-Based Access Control
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  permissions TEXT[] DEFAULT '{}',
  is_system_role BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, slug)
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Supabase Integration Status (SIS)
CREATE TABLE sis_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area TEXT NOT NULL,
  page TEXT NOT NULL,
  component TEXT NOT NULL,
  resource_type TEXT CHECK (resource_type IN ('table', 'rpc', 'storage', 'realtime', 'edge')) NOT NULL,
  resource_ref TEXT NOT NULL,
  criticality TEXT CHECK (criticality IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  owner_role TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(area, page, component, resource_ref)
);

CREATE TABLE sis_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area TEXT NOT NULL,
  page TEXT NOT NULL,
  component TEXT NOT NULL,
  name TEXT NOT NULL,
  resource_type TEXT CHECK (resource_type IN ('table', 'rpc', 'storage', 'realtime', 'edge')) NOT NULL,
  resource_ref TEXT NOT NULL,
  expectation_json JSONB NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warn', 'error', 'critical')) DEFAULT 'error',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sis_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  actor UUID REFERENCES user_profiles(id),
  environment TEXT DEFAULT 'production',
  result TEXT CHECK (result IN ('ok', 'warn', 'fail')),
  duration_ms INTEGER,
  checks_total INTEGER,
  checks_passed INTEGER,
  checks_warned INTEGER,
  checks_failed INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES sis_runs(id) ON DELETE CASCADE,
  check_id UUID NOT NULL REFERENCES sis_checks(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pass', 'warn', 'fail')) NOT NULL,
  latency_ms INTEGER,
  sample_count INTEGER,
  message TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Template Management
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('transactional', 'marketing', 'system')),
  subject JSONB NOT NULL, -- multi-language subjects
  html_content JSONB NOT NULL, -- multi-language HTML
  text_content JSONB, -- multi-language plain text
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, name)
);

-- Feature Flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT CHECK (type IN ('boolean', 'string', 'number', 'json')) DEFAULT 'boolean',
  default_value JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE org_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  value JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, flag_id)
);

-- Indexes for performance
CREATE INDEX idx_settings_org_id ON settings(org_id);
CREATE INDEX idx_settings_category_id ON settings(category_id);
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_system_health_results_check_id ON system_health_results(check_id);
CREATE INDEX idx_system_health_results_status ON system_health_results(status);
CREATE INDEX idx_system_health_results_checked_at ON system_health_results(checked_at DESC);
CREATE INDEX idx_api_keys_org_id ON api_keys(org_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_webhooks_org_id ON webhooks(org_id);
CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_integrations_org_id ON integrations(org_id);
CREATE INDEX idx_integrations_provider_id ON integrations(provider_id);
CREATE INDEX idx_compliance_policies_org_id ON compliance_policies(org_id);
CREATE INDEX idx_compliance_policies_type ON compliance_policies(type);
CREATE INDEX idx_policy_acceptances_policy_id ON policy_acceptances(policy_id);
CREATE INDEX idx_policy_acceptances_user_id ON policy_acceptances(user_id);
CREATE INDEX idx_data_subject_requests_org_id ON data_subject_requests(org_id);
CREATE INDEX idx_data_subject_requests_status ON data_subject_requests(status);
CREATE INDEX idx_consent_records_org_id ON consent_records(org_id);
CREATE INDEX idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX idx_consent_records_purpose ON consent_records(purpose);
CREATE INDEX idx_security_settings_org_id ON security_settings(org_id);
CREATE INDEX idx_roles_org_id ON roles(org_id);
CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_sis_runs_started_at ON sis_runs(started_at DESC);
CREATE INDEX idx_sis_results_run_id ON sis_results(run_id);
CREATE INDEX idx_sis_results_check_id ON sis_results(check_id);
CREATE INDEX idx_email_templates_org_id ON email_templates(org_id);
CREATE INDEX idx_org_feature_flags_org_id ON org_feature_flags(org_id);

-- Trigger to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_system_health_checks_updated_at BEFORE UPDATE ON system_health_checks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_webhook_deliveries_updated_at BEFORE UPDATE ON webhook_deliveries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_integration_providers_updated_at BEFORE UPDATE ON integration_providers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_compliance_policies_updated_at BEFORE UPDATE ON compliance_policies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_data_subject_requests_updated_at BEFORE UPDATE ON data_subject_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_consent_records_updated_at BEFORE UPDATE ON consent_records FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_security_settings_updated_at BEFORE UPDATE ON security_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sis_inventory_updated_at BEFORE UPDATE ON sis_inventory FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sis_checks_updated_at BEFORE UPDATE ON sis_checks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_org_feature_flags_updated_at BEFORE UPDATE ON org_feature_flags FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();