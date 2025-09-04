-- =====================================================
-- SIS (Supabase Integration Status) Complete Schema
-- Inventory tracking, health checks, and monitoring
-- =====================================================

-- =====================================================
-- SIS INVENTORY TABLES
-- =====================================================

-- Track all Supabase resources used by admin components
CREATE TABLE IF NOT EXISTS sis_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area TEXT NOT NULL, -- Dashboard, People, Classes, Shop, Marketing, Finance, Settings, Community
  page TEXT NOT NULL,
  component TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- table, rpc, view, storage, realtime, edge
  resource_ref TEXT NOT NULL, -- actual table/function name
  criticality TEXT NOT NULL, -- P1, P2, P3
  owner_role TEXT NOT NULL, -- comma-separated roles
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(area, page, component, resource_ref)
);

-- Track individual health checks
CREATE TABLE IF NOT EXISTS sis_checks (
  id BIGINT PRIMARY KEY,
  area TEXT NOT NULL,
  page TEXT NOT NULL,
  component TEXT NOT NULL,
  name TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_ref TEXT NOT NULL,
  expectation_json JSONB NOT NULL,
  severity TEXT NOT NULL, -- critical, high, medium, low
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track SIS runs (nightly + on-demand)
CREATE TABLE IF NOT EXISTS sis_runs (
  id BIGSERIAL PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  actor UUID REFERENCES profiles(id),
  environment TEXT DEFAULT 'production',
  result TEXT, -- ok, warn, fail
  duration_ms INTEGER,
  checks_total INTEGER DEFAULT 0,
  checks_passed INTEGER DEFAULT 0,
  checks_failed INTEGER DEFAULT 0,
  checks_warning INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track individual check results
CREATE TABLE IF NOT EXISTS sis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id BIGINT NOT NULL REFERENCES sis_runs(id) ON DELETE CASCADE,
  check_id BIGINT NOT NULL REFERENCES sis_checks(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- ok, warn, fail
  latency_ms INTEGER,
  sample_count INTEGER DEFAULT 1,
  message TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System alerts for critical issues
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  alert_type TEXT NOT NULL, -- sis_failure, webhook_failure, payment_failure, etc.
  severity TEXT NOT NULL, -- critical, high, medium, low
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  source_table TEXT,
  source_id UUID,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMMUNITY MESSAGING TABLES
-- =====================================================

-- Message threads (conversations)
CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  type TEXT NOT NULL DEFAULT 'direct', -- direct, class, retreat, announcement, support
  title TEXT,
  context_id UUID, -- class_id, retreat_id, etc.
  created_by UUID NOT NULL REFERENCES profiles(id),
  visibility TEXT DEFAULT 'roster', -- org, roster, staff, private
  locked BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thread membership
CREATE TABLE IF NOT EXISTS thread_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- owner, moderator, member
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  muted BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  UNIQUE(thread_id, user_id)
);

-- Individual messages
CREATE TABLE IF NOT EXISTS thread_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  body TEXT NOT NULL,
  body_html TEXT,
  attachments JSONB DEFAULT '[]', -- array of file objects
  reply_to_id UUID REFERENCES thread_messages(id),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message moderation queue
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  message_id UUID NOT NULL REFERENCES thread_messages(id) ON DELETE CASCADE,
  reason TEXT NOT NULL, -- spam, inappropriate, harassment, other
  state TEXT DEFAULT 'pending', -- pending, approved, rejected
  reporter_id UUID REFERENCES profiles(id),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message templates for quick replies
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  category TEXT, -- welcome, reminder, support, etc.
  subject TEXT,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- available variables like {customer_name}, {class_name}
  role_permissions TEXT[] DEFAULT '{}', -- which roles can use this template
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADDITIONAL SUPPORTING TABLES
-- =====================================================

-- Materialized view for finance KPIs
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_finance_kpis AS
SELECT 
  o.organization_id,
  DATE_TRUNC('day', o.created_at) as date,
  COUNT(o.id) as order_count,
  SUM(o.total_cents) as total_revenue_cents,
  COUNT(DISTINCT o.customer_id) as unique_customers,
  AVG(o.total_cents) as average_order_value_cents,
  COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as paid_orders,
  COUNT(CASE WHEN p.status = 'failed' THEN 1 END) as failed_payments
FROM orders o
LEFT JOIN payments p ON o.id = p.order_id
WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY o.organization_id, DATE_TRUNC('day', o.created_at);

-- Refresh index for performance
CREATE UNIQUE INDEX IF NOT EXISTS mv_finance_kpis_org_date 
ON mv_finance_kpis(organization_id, date);

-- Marketing attribution view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_marketing_attribution AS
SELECT 
  c.organization_id,
  c.id as campaign_id,
  c.name as campaign_name,
  c.type as campaign_type,
  COUNT(DISTINCT o.id) as orders_attributed,
  SUM(o.total_cents) as revenue_attributed_cents,
  c.cost_cents,
  CASE 
    WHEN c.cost_cents > 0 
    THEN (SUM(o.total_cents)::DECIMAL / c.cost_cents) 
    ELSE NULL 
  END as roas
FROM campaigns c
LEFT JOIN orders o ON o.metadata->>'campaign_id' = c.id::text
WHERE c.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY c.organization_id, c.id, c.name, c.type, c.cost_cents;

-- VAT report view for Swiss compliance
CREATE VIEW IF NOT EXISTS vw_tax_report AS
SELECT 
  o.organization_id,
  DATE_TRUNC('month', o.created_at) as tax_period,
  SUM(o.subtotal_cents) as net_revenue_cents,
  SUM(o.tax_cents) as vat_collected_cents,
  COUNT(o.id) as transaction_count,
  'CHF' as currency
FROM orders o
WHERE o.status = 'confirmed'
GROUP BY o.organization_id, DATE_TRUNC('month', o.created_at);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- SIS indexes
CREATE INDEX IF NOT EXISTS idx_sis_inventory_org_area ON sis_inventory(organization_id, area);
CREATE INDEX IF NOT EXISTS idx_sis_runs_org_created ON sis_runs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sis_results_run_status ON sis_results(run_id, status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_org_unresolved ON system_alerts(organization_id, resolved) WHERE NOT resolved;

-- Community messaging indexes
CREATE INDEX IF NOT EXISTS idx_threads_org_type ON threads(organization_id, type);
CREATE INDEX IF NOT EXISTS idx_threads_context ON threads(context_id) WHERE context_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_thread_members_user ON thread_members(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_messages_thread_created ON thread_messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_org_state ON moderation_queue(organization_id, state);

-- Performance indexes for views
CREATE INDEX IF NOT EXISTS idx_orders_org_created_status ON orders(organization_id, created_at, status);
CREATE INDEX IF NOT EXISTS idx_payments_order_status ON payments(order_id, status);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE sis_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sis_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- SIS policies (admin/owner only)
CREATE POLICY "Owners can manage SIS inventory" ON sis_inventory
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

CREATE POLICY "Owners can view SIS checks" ON sis_checks
  FOR SELECT USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

CREATE POLICY "Owners can manage SIS runs" ON sis_runs
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

CREATE POLICY "Staff can view SIS results" ON sis_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sis_runs sr 
      WHERE sr.id = sis_results.run_id 
      AND user_has_roles_in_org(sr.organization_id, ARRAY['owner', 'studio_manager'])
    )
  );

CREATE POLICY "Staff can view system alerts" ON system_alerts
  FOR SELECT USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk'])
  );

-- Community messaging policies
CREATE POLICY "Users can view threads they're members of" ON threads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM thread_members tm 
      WHERE tm.thread_id = threads.id 
      AND tm.user_id = auth.uid()
    ) OR
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

CREATE POLICY "Staff can create threads" ON threads
  FOR INSERT WITH CHECK (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'instructor'])
  );

CREATE POLICY "Users can manage their thread membership" ON thread_members
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM threads t 
      WHERE t.id = thread_members.thread_id 
      AND user_has_roles_in_org(t.organization_id, ARRAY['owner', 'studio_manager'])
    )
  );

CREATE POLICY "Thread members can view messages" ON thread_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM thread_members tm 
      WHERE tm.thread_id = thread_messages.thread_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Thread members can post messages" ON thread_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM thread_members tm 
      WHERE tm.thread_id = thread_messages.thread_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage moderation queue" ON moderation_queue
  FOR ALL USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager'])
  );

CREATE POLICY "Staff can view message templates" ON message_templates
  FOR SELECT USING (
    user_has_roles_in_org(organization_id, ARRAY['owner', 'studio_manager', 'front_desk', 'instructor', 'marketer'])
  );

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Update thread message count when messages are added/removed
CREATE OR REPLACE FUNCTION update_thread_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE threads 
    SET message_count = message_count + 1,
        last_message_at = NEW.created_at
    WHERE id = NEW.thread_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE threads 
    SET message_count = GREATEST(0, message_count - 1)
    WHERE id = OLD.thread_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER thread_message_count_trigger
  AFTER INSERT OR DELETE ON thread_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_message_count();

-- Auto-create system alerts for failed SIS checks
CREATE OR REPLACE FUNCTION create_sis_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create alert for critical/high severity failures
  IF NEW.status = 'fail' AND EXISTS (
    SELECT 1 FROM sis_checks sc 
    WHERE sc.id = NEW.check_id 
    AND sc.severity IN ('critical', 'high')
  ) THEN
    INSERT INTO system_alerts (
      organization_id,
      alert_type,
      severity,
      title,
      message,
      source_table,
      source_id
    )
    SELECT 
      sr.organization_id,
      'sis_failure',
      sc.severity,
      'SIS Check Failed: ' || sc.name,
      COALESCE(NEW.message, 'Health check failed for ' || sc.resource_ref),
      'sis_results',
      NEW.id
    FROM sis_runs sr
    JOIN sis_checks sc ON sc.id = NEW.check_id
    WHERE sr.id = NEW.run_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sis_alert_trigger
  AFTER INSERT ON sis_results
  FOR EACH ROW
  EXECUTE FUNCTION create_sis_alert();

-- =====================================================
-- REFRESH MATERIALIZED VIEWS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_finance_kpis;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_marketing_attribution;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;