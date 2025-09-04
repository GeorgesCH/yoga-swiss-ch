-- Marketing Module Schema for YogaSwiss
-- Complete implementation of all marketing requirements

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== SEGMENTS & AUDIENCES ====================

-- Customer segments for targeting
CREATE TABLE segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    definition_json JSONB NOT NULL,
    live_count INTEGER DEFAULT 0,
    refreshed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Audience syncs to ad platforms
CREATE TABLE audiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    segment_id UUID NOT NULL,
    sync_target TEXT NOT NULL, -- 'meta', 'google', 'webhook'
    external_audience_id TEXT,
    status TEXT DEFAULT 'pending',
    last_synced_at TIMESTAMPTZ,
    sync_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE CASCADE
);

-- ==================== FUNNELS & LANDING PAGES ====================

-- Marketing funnels (ClickFunnels-style)
CREATE TABLE funnels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    status TEXT DEFAULT 'draft', -- draft, published, archived
    goal_type TEXT NOT NULL, -- booking, purchase, signup, referral
    goal_object_id UUID, -- ID of class, product, etc.
    locale TEXT DEFAULT 'en-CH',
    theme TEXT DEFAULT 'default',
    domain TEXT,
    published_at TIMESTAMPTZ,
    views_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    revenue_total DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Funnel steps
CREATE TABLE funnel_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funnel_id UUID NOT NULL,
    type TEXT NOT NULL, -- opt_in, sales_page, checkout, upsell, thank_you, quiz
    order_index INTEGER NOT NULL,
    content_json JSONB NOT NULL,
    form_id UUID,
    offer_id UUID,
    test_group TEXT, -- A, B, C for A/B testing
    views_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (funnel_id) REFERENCES funnels(id) ON DELETE CASCADE
);

-- Landing pages
CREATE TABLE landing_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    content_json JSONB NOT NULL,
    seo_json JSONB, -- meta title, description, keywords
    publish_at TIMESTAMPTZ,
    locale TEXT DEFAULT 'en-CH',
    theme TEXT DEFAULT 'default',
    views_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE(org_id, slug)
);

-- Forms for lead capture
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    schema_json JSONB NOT NULL, -- field definitions
    double_opt_in BOOLEAN DEFAULT false,
    redirect_url TEXT,
    webhook_url TEXT,
    submissions_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Form submissions
CREATE TABLE form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL,
    lead_id UUID,
    data_json JSONB NOT NULL,
    utm_json JSONB,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- ==================== LEADS CRM ====================

-- Lead management
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    person_id UUID, -- links to customers table if converted
    email TEXT,
    phone TEXT,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (COALESCE(first_name || ' ' || last_name, first_name, last_name, email)) STORED,
    locale TEXT DEFAULT 'en-CH',
    region TEXT,
    interests TEXT[],
    source TEXT, -- form, import, referral, api
    status TEXT DEFAULT 'new', -- new, contacted, qualified, booked, enrolled, won, lost
    owner_id UUID, -- assigned staff member
    score INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    utm_json JSONB, -- attribution data
    custom_fields JSONB DEFAULT '{}',
    consent_json JSONB NOT NULL DEFAULT '{}', -- consent per channel
    assigned_at TIMESTAMPTZ,
    last_contact_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE SET NULL,
    FOREIGN KEY (owner_id) REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Lead activities timeline
CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL,
    type TEXT NOT NULL, -- created, contacted, email_opened, clicked, booked, note
    ts TIMESTAMPTZ DEFAULT NOW(),
    data_json JSONB DEFAULT '{}',
    created_by UUID, -- staff member who performed action
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- ==================== CAMPAIGNS ====================

-- Marketing campaigns
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- blast, recurring, triggered, ad_campaign
    channel TEXT NOT NULL, -- email, sms, push, whatsapp, banner
    status TEXT DEFAULT 'draft', -- draft, scheduled, sending, sent, paused, cancelled
    audience_segment_id UUID,
    template_id UUID,
    schedule_json JSONB, -- send time, timezone, quiet hours, frequency caps
    ab_test_json JSONB, -- A/B test configuration
    holdout_pct DECIMAL(5,2) DEFAULT 0, -- percentage held out for measurement
    budget_json JSONB, -- cost caps, currency
    utm_params JSONB, -- tracking parameters
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    sends_count INTEGER DEFAULT 0,
    opens_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    revenue_total DECIMAL(10,2) DEFAULT 0,
    cost_total DECIMAL(10,2) DEFAULT 0,
    preflight_passed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (audience_segment_id) REFERENCES segments(id) ON DELETE SET NULL
);

-- Individual messages sent
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID,
    journey_node_id UUID,
    recipient_type TEXT NOT NULL, -- lead, customer
    recipient_id UUID NOT NULL,
    channel TEXT NOT NULL,
    subject TEXT,
    content TEXT,
    rendered_size INTEGER,
    send_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivery_status TEXT DEFAULT 'pending', -- pending, sent, delivered, bounced, failed
    open_at TIMESTAMPTZ,
    click_at TIMESTAMPTZ,
    bounce_type TEXT, -- hard, soft, complaint
    bounce_reason TEXT,
    unsubscribe_at TIMESTAMPTZ,
    conversion_order_id UUID,
    cost DECIMAL(10,4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- ==================== JOURNEYS (AUTOMATIONS) ====================

-- Marketing journeys/automations
CREATE TABLE journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft', -- draft, published, paused, archived
    entry_triggers_json JSONB NOT NULL,
    quiet_hours_json JSONB, -- when not to send
    frequency_caps_json JSONB, -- limits per channel
    version INTEGER DEFAULT 1,
    published_at TIMESTAMPTZ,
    enrollments_count INTEGER DEFAULT 0,
    completions_count INTEGER DEFAULT 0,
    revenue_total DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Journey nodes (workflow steps)
CREATE TABLE journey_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID NOT NULL,
    type TEXT NOT NULL, -- trigger, action, wait, branch, exit
    config_json JSONB NOT NULL,
    position JSONB NOT NULL, -- x, y coordinates for visual editor
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
);

-- Journey enrollments (who's in what journey)
CREATE TABLE journey_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID NOT NULL,
    lead_id UUID NOT NULL,
    current_node_id UUID,
    status TEXT DEFAULT 'active', -- active, completed, exited, paused
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    exit_reason TEXT,
    FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (current_node_id) REFERENCES journey_nodes(id) ON DELETE SET NULL,
    UNIQUE(journey_id, lead_id)
);

-- ==================== TEMPLATES ====================

-- Message templates
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- email, sms, push, whatsapp
    subject TEXT,
    content TEXT NOT NULL,
    locale TEXT DEFAULT 'en-CH',
    design_json JSONB, -- visual design elements
    variables TEXT[] DEFAULT '{}', -- available variables
    legal_footer_id UUID,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- ==================== OFFERS & INCENTIVES ====================

-- Marketing offers (coupons, gift cards, referrals)
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    type TEXT NOT NULL, -- coupon, gift_card, bundle, referral_reward
    name TEXT NOT NULL,
    code TEXT, -- unique redemption code
    description JSONB, -- localized descriptions
    rules_json JSONB NOT NULL, -- discount rules, eligibility
    budget DECIMAL(10,2),
    budget_used DECIMAL(10,2) DEFAULT 0,
    usage_limit_total INTEGER,
    usage_limit_per_customer INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Offer redemptions
CREATE TABLE offer_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    order_id UUID,
    discount_amount DECIMAL(10,2) NOT NULL,
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES people(id) ON DELETE CASCADE
);

-- Referral programs
CREATE TABLE referral_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    rules_json JSONB NOT NULL, -- reward amounts, conditions
    code_prefix TEXT DEFAULT 'REF',
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    referrals_count INTEGER DEFAULT 0,
    successful_referrals_count INTEGER DEFAULT 0,
    total_rewards_paid DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Individual referrals
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    program_id UUID NOT NULL,
    referrer_customer_id UUID NOT NULL,
    referee_customer_id UUID,
    code TEXT UNIQUE NOT NULL,
    share_url TEXT,
    status TEXT DEFAULT 'pending', -- pending, completed, expired, fraudulent
    reward_amount DECIMAL(10,2),
    paid_at TIMESTAMPTZ,
    fraud_status TEXT, -- clean, suspicious, blocked
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES referral_programs(id) ON DELETE CASCADE,
    FOREIGN KEY (referrer_customer_id) REFERENCES people(id) ON DELETE CASCADE,
    FOREIGN KEY (referee_customer_id) REFERENCES people(id) ON DELETE SET NULL
);

-- ==================== ATTRIBUTION & ANALYTICS ====================

-- Web and campaign attribution events
CREATE TABLE attribution_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID,
    tenant_id UUID,
    person_id UUID, -- if known user
    session_id TEXT NOT NULL,
    event TEXT NOT NULL, -- page_view, click, form_submit, purchase
    ts TIMESTAMPTZ DEFAULT NOW(),
    utm_json JSONB, -- utm parameters
    url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    device_type TEXT,
    order_id UUID, -- for conversion events
    revenue DECIMAL(10,2),
    data_json JSONB, -- additional event data
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE SET NULL
);

-- A/B Testing experiments
CREATE TABLE experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    scope TEXT NOT NULL, -- campaign, page, price
    status TEXT DEFAULT 'draft', -- draft, running, paused, completed
    hypothesis TEXT,
    variants_json JSONB NOT NULL,
    primary_metric TEXT NOT NULL,
    confidence_level DECIMAL(5,2) DEFAULT 95,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    winner_variant TEXT,
    statistical_significance DECIMAL(5,2),
    results_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Ad cost data (imported from Meta, Google, etc.)
CREATE TABLE ad_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    platform TEXT NOT NULL, -- meta, google, tiktok
    campaign_id_external TEXT NOT NULL,
    adset_id_external TEXT,
    ad_id_external TEXT,
    date DATE NOT NULL,
    spend DECIMAL(10,2) NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'CHF',
    imported_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE(org_id, platform, campaign_id_external, date)
);

-- ==================== DELIVERABILITY & COMPLIANCE ====================

-- Email domain settings
CREATE TABLE domain_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    sending_domain TEXT NOT NULL,
    dkim_selector TEXT DEFAULT 'yogaswiss',
    dkim_private_key TEXT,
    dkim_public_key TEXT,
    dkim_status TEXT DEFAULT 'pending', -- pending, verified, failed
    spf_status TEXT DEFAULT 'pending',
    dmarc_policy TEXT DEFAULT 'none',
    link_domain TEXT,
    is_verified BOOLEAN DEFAULT false,
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE(org_id, sending_domain)
);

-- Email suppression lists
CREATE TABLE suppression_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    type TEXT NOT NULL, -- email, phone, device_id
    value TEXT NOT NULL,
    reason TEXT NOT NULL, -- bounce, complaint, unsubscribe, abuse
    source_campaign_id UUID,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (source_campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
    UNIQUE(org_id, type, value)
);

-- Webhooks for external integrations
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    target_url TEXT NOT NULL,
    secret TEXT,
    events TEXT[] NOT NULL, -- which events to send
    is_active BOOLEAN DEFAULT true,
    last_success_at TIMESTAMPTZ,
    last_error_at TIMESTAMPTZ,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Audit logs for marketing actions
CREATE TABLE marketing_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- campaign, segment, lead, etc.
    resource_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- ==================== INDEXES ====================

-- Segments
CREATE INDEX idx_segments_org_id ON segments(org_id);
CREATE INDEX idx_segments_tenant_id ON segments(tenant_id);
CREATE INDEX idx_segments_is_active ON segments(is_active);

-- Audiences  
CREATE INDEX idx_audiences_segment_id ON audiences(segment_id);
CREATE INDEX idx_audiences_sync_target ON audiences(sync_target);
CREATE INDEX idx_audiences_status ON audiences(status);

-- Funnels
CREATE INDEX idx_funnels_org_id ON funnels(org_id);
CREATE INDEX idx_funnels_tenant_id ON funnels(tenant_id);
CREATE INDEX idx_funnels_status ON funnels(status);
CREATE INDEX idx_funnels_slug ON funnels(slug);

-- Funnel steps
CREATE INDEX idx_funnel_steps_funnel_id ON funnel_steps(funnel_id);
CREATE INDEX idx_funnel_steps_order ON funnel_steps(funnel_id, order_index);

-- Landing pages
CREATE INDEX idx_landing_pages_org_id ON landing_pages(org_id);
CREATE INDEX idx_landing_pages_tenant_id ON landing_pages(tenant_id);
CREATE INDEX idx_landing_pages_slug ON landing_pages(org_id, slug);

-- Forms
CREATE INDEX idx_forms_org_id ON forms(org_id);
CREATE INDEX idx_forms_tenant_id ON forms(tenant_id);

-- Form submissions
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_lead_id ON form_submissions(lead_id);
CREATE INDEX idx_form_submissions_session ON form_submissions(session_id);

-- Leads
CREATE INDEX idx_leads_org_id ON leads(org_id);
CREATE INDEX idx_leads_tenant_id ON leads(tenant_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_owner_id ON leads(owner_id);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_score ON leads(score);
CREATE INDEX idx_leads_tags ON leads USING GIN(tags);

-- Lead activities
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_type ON lead_activities(type);
CREATE INDEX idx_lead_activities_ts ON lead_activities(ts);

-- Campaigns
CREATE INDEX idx_campaigns_org_id ON campaigns(org_id);
CREATE INDEX idx_campaigns_tenant_id ON campaigns(tenant_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(type);
CREATE INDEX idx_campaigns_channel ON campaigns(channel);
CREATE INDEX idx_campaigns_scheduled_at ON campaigns(scheduled_at);

-- Messages
CREATE INDEX idx_messages_campaign_id ON messages(campaign_id);
CREATE INDEX idx_messages_journey_node_id ON messages(journey_node_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_type, recipient_id);
CREATE INDEX idx_messages_channel ON messages(channel);
CREATE INDEX idx_messages_delivery_status ON messages(delivery_status);
CREATE INDEX idx_messages_send_at ON messages(send_at);

-- Journeys
CREATE INDEX idx_journeys_org_id ON journeys(org_id);
CREATE INDEX idx_journeys_tenant_id ON journeys(tenant_id);
CREATE INDEX idx_journeys_status ON journeys(status);

-- Journey nodes
CREATE INDEX idx_journey_nodes_journey_id ON journey_nodes(journey_id);
CREATE INDEX idx_journey_nodes_type ON journey_nodes(type);

-- Journey enrollments
CREATE INDEX idx_journey_enrollments_journey_id ON journey_enrollments(journey_id);
CREATE INDEX idx_journey_enrollments_lead_id ON journey_enrollments(lead_id);
CREATE INDEX idx_journey_enrollments_status ON journey_enrollments(status);

-- Templates
CREATE INDEX idx_templates_org_id ON templates(org_id);
CREATE INDEX idx_templates_tenant_id ON templates(tenant_id);
CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_templates_locale ON templates(locale);
CREATE INDEX idx_templates_is_active ON templates(is_active);

-- Offers
CREATE INDEX idx_offers_org_id ON offers(org_id);
CREATE INDEX idx_offers_tenant_id ON offers(tenant_id);
CREATE INDEX idx_offers_type ON offers(type);
CREATE INDEX idx_offers_code ON offers(code);
CREATE INDEX idx_offers_is_active ON offers(is_active);
CREATE INDEX idx_offers_dates ON offers(start_at, end_at);

-- Offer redemptions
CREATE INDEX idx_offer_redemptions_offer_id ON offer_redemptions(offer_id);
CREATE INDEX idx_offer_redemptions_customer_id ON offer_redemptions(customer_id);
CREATE INDEX idx_offer_redemptions_redeemed_at ON offer_redemptions(redeemed_at);

-- Referrals
CREATE INDEX idx_referrals_org_id ON referrals(org_id);
CREATE INDEX idx_referrals_tenant_id ON referrals(tenant_id);
CREATE INDEX idx_referrals_program_id ON referrals(program_id);
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_customer_id);
CREATE INDEX idx_referrals_code ON referrals(code);
CREATE INDEX idx_referrals_status ON referrals(status);

-- Attribution events
CREATE INDEX idx_attribution_events_org_id ON attribution_events(org_id);
CREATE INDEX idx_attribution_events_tenant_id ON attribution_events(tenant_id);
CREATE INDEX idx_attribution_events_person_id ON attribution_events(person_id);
CREATE INDEX idx_attribution_events_session_id ON attribution_events(session_id);
CREATE INDEX idx_attribution_events_event ON attribution_events(event);
CREATE INDEX idx_attribution_events_ts ON attribution_events(ts);
CREATE INDEX idx_attribution_events_order_id ON attribution_events(order_id);

-- Experiments
CREATE INDEX idx_experiments_org_id ON experiments(org_id);
CREATE INDEX idx_experiments_tenant_id ON experiments(tenant_id);
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_experiments_scope ON experiments(scope);

-- Ad costs
CREATE INDEX idx_ad_costs_org_id ON ad_costs(org_id);
CREATE INDEX idx_ad_costs_tenant_id ON ad_costs(tenant_id);
CREATE INDEX idx_ad_costs_platform ON ad_costs(platform);
CREATE INDEX idx_ad_costs_date ON ad_costs(date);

-- Suppression lists
CREATE INDEX idx_suppression_lists_org_id ON suppression_lists(org_id);
CREATE INDEX idx_suppression_lists_tenant_id ON suppression_lists(tenant_id);
CREATE INDEX idx_suppression_lists_type_value ON suppression_lists(type, value);
CREATE INDEX idx_suppression_lists_reason ON suppression_lists(reason);

-- Marketing audit logs
CREATE INDEX idx_marketing_audit_logs_org_id ON marketing_audit_logs(org_id);
CREATE INDEX idx_marketing_audit_logs_tenant_id ON marketing_audit_logs(tenant_id);
CREATE INDEX idx_marketing_audit_logs_user_id ON marketing_audit_logs(user_id);
CREATE INDEX idx_marketing_audit_logs_resource ON marketing_audit_logs(resource_type, resource_id);
CREATE INDEX idx_marketing_audit_logs_created_at ON marketing_audit_logs(created_at);