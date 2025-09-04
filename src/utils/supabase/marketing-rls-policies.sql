-- Marketing Module RLS Policies for YogaSwiss
-- Comprehensive Row Level Security with proper multi-tenant isolation

-- ==================== SEGMENTS & AUDIENCES ====================

-- Segments
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "segments_tenant_isolation" ON segments
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "segments_read_access" ON segments
    FOR SELECT USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND (
            has_permission('marketing.view') 
            OR has_permission('campaigns.view')
            OR has_permission('analytics.view')
        )
    );

CREATE POLICY "segments_write_access" ON segments
    FOR INSERT WITH CHECK (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('marketing.manage')
    );

CREATE POLICY "segments_update_access" ON segments
    FOR UPDATE USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('marketing.manage')
    );

CREATE POLICY "segments_delete_access" ON segments
    FOR DELETE USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('marketing.manage')
    );

-- Audiences
ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audiences_tenant_isolation" ON audiences
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "audiences_read_access" ON audiences
    FOR SELECT USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('marketing.view')
    );

CREATE POLICY "audiences_write_access" ON audiences
    FOR INSERT WITH CHECK (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('marketing.manage')
    );

-- ==================== FUNNELS & LANDING PAGES ====================

-- Funnels
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "funnels_tenant_isolation" ON funnels
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "funnels_read_access" ON funnels
    FOR SELECT USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND (
            has_permission('marketing.view')
            OR has_permission('funnels.view')
        )
    );

CREATE POLICY "funnels_write_access" ON funnels
    FOR INSERT WITH CHECK (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('funnels.manage')
    );

CREATE POLICY "funnels_update_access" ON funnels
    FOR UPDATE USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('funnels.manage')
    );

-- Funnel steps
ALTER TABLE funnel_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "funnel_steps_access" ON funnel_steps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM funnels 
            WHERE funnels.id = funnel_steps.funnel_id
            AND funnels.tenant_id = (SELECT get_current_tenant_id())
            AND funnels.org_id = (SELECT get_current_org_id())
        )
    );

-- Landing pages
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "landing_pages_tenant_isolation" ON landing_pages
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "landing_pages_read_access" ON landing_pages
    FOR SELECT USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND (
            has_permission('marketing.view')
            OR has_permission('pages.view')
        )
    );

CREATE POLICY "landing_pages_write_access" ON landing_pages
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('pages.manage')
    );

-- Forms
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forms_tenant_isolation" ON forms
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "forms_read_access" ON forms
    FOR SELECT USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('marketing.view')
    );

CREATE POLICY "forms_write_access" ON forms
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('marketing.manage')
    );

-- Form submissions
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "form_submissions_access" ON form_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_submissions.form_id
            AND forms.tenant_id = (SELECT get_current_tenant_id())
            AND forms.org_id = (SELECT get_current_org_id())
        )
    );

-- ==================== LEADS CRM ====================

-- Leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_tenant_isolation" ON leads
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "leads_read_access" ON leads
    FOR SELECT USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND (
            has_permission('leads.view')
            OR has_permission('marketing.view')
            OR owner_id = (SELECT get_current_user_id())
        )
    );

CREATE POLICY "leads_write_access" ON leads
    FOR INSERT WITH CHECK (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('leads.manage')
    );

CREATE POLICY "leads_update_access" ON leads
    FOR UPDATE USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND (
            has_permission('leads.manage')
            OR (owner_id = (SELECT get_current_user_id()) AND has_permission('leads.edit_own'))
        )
    );

-- PII masking for leads without proper permissions
CREATE OR REPLACE VIEW leads_masked AS
SELECT 
    id,
    org_id,
    tenant_id,
    person_id,
    CASE 
        WHEN has_permission('customers.view_contact') THEN email
        ELSE REGEXP_REPLACE(email, '(.{2}).*(@.*)', '\1***\2')
    END as email,
    CASE 
        WHEN has_permission('customers.view_contact') THEN phone
        ELSE REGEXP_REPLACE(phone, '(.{3}).*(.{2})', '\1***\2')
    END as phone,
    first_name,
    last_name,
    full_name,
    locale,
    region,
    interests,
    source,
    status,
    owner_id,
    score,
    tags,
    utm_json,
    CASE 
        WHEN has_permission('customers.view_sensitive') THEN custom_fields
        ELSE '{}'::jsonb
    END as custom_fields,
    consent_json,
    assigned_at,
    last_contact_at,
    created_at,
    updated_at
FROM leads
WHERE tenant_id = (SELECT get_current_tenant_id());

-- Lead activities
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_activities_access" ON lead_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM leads 
            WHERE leads.id = lead_activities.lead_id
            AND leads.tenant_id = (SELECT get_current_tenant_id())
            AND leads.org_id = (SELECT get_current_org_id())
            AND (
                has_permission('leads.view')
                OR leads.owner_id = (SELECT get_current_user_id())
            )
        )
    );

-- ==================== CAMPAIGNS ====================

-- Campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_tenant_isolation" ON campaigns
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "campaigns_read_access" ON campaigns
    FOR SELECT USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND (
            has_permission('campaigns.view')
            OR has_permission('marketing.view')
        )
    );

CREATE POLICY "campaigns_write_access" ON campaigns
    FOR INSERT WITH CHECK (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('campaigns.manage')
    );

CREATE POLICY "campaigns_update_access" ON campaigns
    FOR UPDATE USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('campaigns.manage')
    );

CREATE POLICY "campaigns_send_access" ON campaigns
    FOR UPDATE USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND (
            has_permission('campaigns.send')
            OR (has_permission('campaigns.send_approved') AND status = 'approved')
        )
    );

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_campaign_access" ON messages
    FOR ALL USING (
        (campaign_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = messages.campaign_id
            AND campaigns.tenant_id = (SELECT get_current_tenant_id())
            AND campaigns.org_id = (SELECT get_current_org_id())
        ))
        OR
        (journey_node_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM journey_nodes 
            JOIN journeys ON journeys.id = journey_nodes.journey_id
            WHERE journey_nodes.id = messages.journey_node_id
            AND journeys.tenant_id = (SELECT get_current_tenant_id())
            AND journeys.org_id = (SELECT get_current_org_id())
        ))
    );

CREATE POLICY "messages_read_access" ON messages
    FOR SELECT USING (
        has_permission('campaigns.view') OR has_permission('journeys.view')
    );

-- ==================== JOURNEYS ====================

-- Journeys
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journeys_tenant_isolation" ON journeys
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "journeys_read_access" ON journeys
    FOR SELECT USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND (
            has_permission('journeys.view')
            OR has_permission('marketing.view')
        )
    );

CREATE POLICY "journeys_write_access" ON journeys
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('journeys.manage')
    );

-- Journey nodes
ALTER TABLE journey_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journey_nodes_access" ON journey_nodes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM journeys 
            WHERE journeys.id = journey_nodes.journey_id
            AND journeys.tenant_id = (SELECT get_current_tenant_id())
            AND journeys.org_id = (SELECT get_current_org_id())
        )
    );

-- Journey enrollments
ALTER TABLE journey_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journey_enrollments_access" ON journey_enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM journeys 
            WHERE journeys.id = journey_enrollments.journey_id
            AND journeys.tenant_id = (SELECT get_current_tenant_id())
            AND journeys.org_id = (SELECT get_current_org_id())
        )
        AND
        EXISTS (
            SELECT 1 FROM leads 
            WHERE leads.id = journey_enrollments.lead_id
            AND leads.tenant_id = (SELECT get_current_tenant_id())
            AND leads.org_id = (SELECT get_current_org_id())
        )
    );

-- ==================== TEMPLATES ====================

-- Templates
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_tenant_isolation" ON templates
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "templates_read_access" ON templates
    FOR SELECT USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND (
            has_permission('templates.view')
            OR has_permission('marketing.view')
        )
    );

CREATE POLICY "templates_write_access" ON templates
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('templates.manage')
    );

-- ==================== OFFERS & INCENTIVES ====================

-- Offers
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "offers_tenant_isolation" ON offers
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "offers_read_access" ON offers
    FOR SELECT USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND (
            has_permission('offers.view')
            OR has_permission('marketing.view')
        )
    );

CREATE POLICY "offers_write_access" ON offers
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('offers.manage')
    );

-- Offer redemptions
ALTER TABLE offer_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "offer_redemptions_access" ON offer_redemptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM offers 
            WHERE offers.id = offer_redemptions.offer_id
            AND offers.tenant_id = (SELECT get_current_tenant_id())
            AND offers.org_id = (SELECT get_current_org_id())
        )
    );

-- Referral programs
ALTER TABLE referral_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referral_programs_tenant_isolation" ON referral_programs
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "referral_programs_access" ON referral_programs
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('referrals.manage')
    );

-- Referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_tenant_isolation" ON referrals
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "referrals_read_access" ON referrals
    FOR SELECT USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND (
            has_permission('referrals.view')
            OR has_permission('marketing.view')
            OR referrer_customer_id = (SELECT get_current_user_id())
        )
    );

CREATE POLICY "referrals_write_access" ON referrals
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND (
            has_permission('referrals.manage')
            OR referrer_customer_id = (SELECT get_current_user_id())
        )
    );

-- ==================== ATTRIBUTION & ANALYTICS ====================

-- Attribution events
ALTER TABLE attribution_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attribution_events_tenant_isolation" ON attribution_events
    FOR ALL USING (
        (tenant_id = (SELECT get_current_tenant_id()) OR tenant_id IS NULL)
        AND (org_id = (SELECT get_current_org_id()) OR org_id IS NULL)
    );

CREATE POLICY "attribution_events_read_access" ON attribution_events
    FOR SELECT USING (
        (tenant_id = (SELECT get_current_tenant_id()) OR tenant_id IS NULL)
        AND (
            has_permission('analytics.view')
            OR has_permission('marketing.view')
        )
    );

CREATE POLICY "attribution_events_write_access" ON attribution_events
    FOR INSERT WITH CHECK (
        tenant_id = (SELECT get_current_tenant_id()) OR tenant_id IS NULL
    );

-- Experiments
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experiments_tenant_isolation" ON experiments
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "experiments_access" ON experiments
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('experiments.manage')
    );

-- Ad costs
ALTER TABLE ad_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_costs_tenant_isolation" ON ad_costs
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "ad_costs_read_access" ON ad_costs
    FOR SELECT USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('analytics.view')
    );

CREATE POLICY "ad_costs_write_access" ON ad_costs
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('marketing.manage')
    );

-- ==================== COMPLIANCE & DELIVERABILITY ====================

-- Domain settings
ALTER TABLE domain_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "domain_settings_tenant_isolation" ON domain_settings
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "domain_settings_access" ON domain_settings
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('marketing.manage_domains')
    );

-- Suppression lists
ALTER TABLE suppression_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suppression_lists_tenant_isolation" ON suppression_lists
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "suppression_lists_read_access" ON suppression_lists
    FOR SELECT USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('marketing.view')
    );

CREATE POLICY "suppression_lists_write_access" ON suppression_lists
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('marketing.manage')
    );

-- Webhooks
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhooks_tenant_isolation" ON webhooks
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "webhooks_access" ON webhooks
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND has_permission('integrations.manage')
    );

-- Marketing audit logs
ALTER TABLE marketing_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marketing_audit_logs_tenant_isolation" ON marketing_audit_logs
    FOR ALL USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND org_id = (SELECT get_current_org_id())
    );

CREATE POLICY "marketing_audit_logs_read_access" ON marketing_audit_logs
    FOR SELECT USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND (
            has_permission('audit.view')
            OR has_permission('marketing.view')
        )
    );

CREATE POLICY "marketing_audit_logs_write_access" ON marketing_audit_logs
    FOR INSERT WITH CHECK (
        tenant_id = (SELECT get_current_tenant_id())
    );

-- ==================== ROLE-SPECIFIC POLICIES ====================

-- Marketer role restrictions (no PII exports)
CREATE POLICY "marketers_no_pii_export" ON leads
    FOR SELECT USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND (
            has_permission('leads.view')
            AND NOT (get_current_context() ->> 'export_mode' = 'true' AND NOT has_permission('customers.export_pii'))
        )
    );

-- Studio manager approval gates
CREATE POLICY "studio_manager_budget_approval" ON campaigns
    FOR UPDATE USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND (
            has_permission('campaigns.manage')
            OR (
                has_permission('campaigns.approve')
                AND (budget_json ->> 'max_spend')::decimal <= 1000
            )
        )
    );

-- Instructor transactional only
CREATE POLICY "instructor_transactional_only" ON campaigns
    FOR SELECT USING (
        tenant_id = (SELECT get_current_tenant_id())
        AND (
            has_permission('campaigns.view')
            OR (
                has_role('instructor')
                AND type = 'transactional'
                AND channel = 'email'
            )
        )
    );

-- Support impersonation logging
CREATE OR REPLACE FUNCTION log_support_access() RETURNS trigger AS $$
BEGIN
    IF get_current_role() = 'support' AND get_current_context() ->> 'impersonation_mode' = 'true' THEN
        INSERT INTO marketing_audit_logs (
            org_id,
            tenant_id,
            user_id,
            action,
            resource_type,
            resource_id,
            ip_address,
            user_agent
        ) VALUES (
            NEW.org_id,
            NEW.tenant_id,
            (SELECT get_current_user_id()),
            'support_access',
            TG_TABLE_NAME,
            NEW.id,
            get_current_context() ->> 'ip_address',
            get_current_context() ->> 'user_agent'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply support logging to sensitive tables
CREATE TRIGGER support_access_leads 
    AFTER SELECT ON leads 
    FOR EACH ROW EXECUTE FUNCTION log_support_access();

CREATE TRIGGER support_access_campaigns 
    AFTER SELECT ON campaigns 
    FOR EACH ROW EXECUTE FUNCTION log_support_access();