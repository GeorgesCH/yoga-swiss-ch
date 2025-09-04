// Complete Marketing Service for YogaSwiss - implements all marketing module requirements
import { supabase } from './client';
import { getSupabaseProjectId, getSupabaseAnonKey } from './env';
import type { Database } from './schemas';

type Tables = Database['public']['Tables'];
type Segment = Tables['segments']['Row'];
type Campaign = Tables['campaigns']['Row'];
type Funnel = Tables['funnels']['Row'];
type Journey = Tables['journeys']['Row'];
type Lead = Tables['leads']['Row'];
type Message = Tables['messages']['Row'];
type Attribution = Tables['attribution_events']['Row'];
type Template = Tables['templates']['Row'];
type Offer = Tables['offers']['Row'];
type Referral = Tables['referrals']['Row'];

export interface SegmentDefinition {
  profile_filters?: {
    locale?: string[];
    city?: string[];
    region?: string[];
    tags?: string[];
    source?: string[];
    corporate_membership?: boolean;
  };
  behavior_filters?: {
    classes_attended_min?: number;
    classes_attended_max?: number;
    last_booking_days_ago?: number;
    no_show_count_max?: number;
    waitlists_joined_min?: number;
    device_type?: string[];
  };
  finance_filters?: {
    spend_min?: number;
    spend_max?: number;
    ltv_min?: number;
    ltv_max?: number;
    membership_status?: string[];
    wallet_balance_min?: number;
    gift_card_holder?: boolean;
  };
  marketing_filters?: {
    consent_email?: boolean;
    consent_sms?: boolean;
    consent_push?: boolean;
    consent_whatsapp?: boolean;
    last_open_days_ago?: number;
    last_click_days_ago?: number;
    domain_risk_score_max?: number;
  };
}

export interface CampaignConfig {
  name: string;
  type: 'blast' | 'recurring' | 'triggered' | 'ad_campaign';
  channel: 'email' | 'sms' | 'push' | 'whatsapp' | 'banner';
  audience_segment_id?: string;
  template_id?: string;
  schedule_json?: {
    send_at?: string;
    timezone?: string;
    quiet_hours?: { start: string; end: string };
    frequency_cap?: { period: 'day' | 'week' | 'month'; limit: number };
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      days?: number[];
      time?: string;
    };
  };
  ab_test_json?: {
    variants: Array<{
      name: string;
      percentage: number;
      template_id?: string;
      subject_line?: string;
      from_name?: string;
    }>;
    metric: 'open_rate' | 'click_rate' | 'conversion_rate' | 'revenue';
    duration_hours?: number;
  };
  holdout_pct?: number;
  budget_json?: {
    max_spend?: number;
    cost_per_send?: number;
    currency: 'CHF';
  };
  utm_params?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export interface FunnelConfig {
  name: string;
  goal_type: 'booking' | 'purchase' | 'signup' | 'referral';
  goal_object_id?: string;
  locale: 'de-CH' | 'fr-CH' | 'it-CH' | 'en-CH';
  theme?: string;
  domain?: string;
  steps: FunnelStep[];
}

export interface FunnelStep {
  type: 'opt_in' | 'sales_page' | 'checkout' | 'upsell' | 'thank_you' | 'quiz';
  order_index: number;
  content_json: {
    title?: string;
    subtitle?: string;
    content?: string;
    cta_text?: string;
    background_color?: string;
    text_color?: string;
    button_color?: string;
    image_url?: string;
    video_url?: string;
    countdown_timer?: {
      type: 'evergreen' | 'fixed';
      duration_minutes?: number;
      end_at?: string;
    };
    testimonials?: Array<{
      name: string;
      text: string;
      rating?: number;
      image_url?: string;
    }>;
  };
  form_id?: string;
  offer_id?: string;
  test_group?: 'A' | 'B' | 'C';
}

export interface JourneyConfig {
  name: string;
  entry_triggers_json: {
    triggers: Array<{
      type: 'signup' | 'booking' | 'purchase' | 'no_activity' | 'birthday' | 'waitlist' | 'refund';
      conditions?: Record<string, any>;
    }>;
  };
  quiet_hours_json?: {
    start: string;
    end: string;
    timezone: string;
  };
  frequency_caps_json?: Array<{
    channel: string;
    period: 'day' | 'week' | 'month';
    limit: number;
  }>;
  nodes: JourneyNode[];
}

export interface JourneyNode {
  type: 'trigger' | 'action' | 'wait' | 'branch' | 'exit';
  config_json: Record<string, any>;
  position: { x: number; y: number };
}

export interface LeadData {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  locale?: 'de-CH' | 'fr-CH' | 'it-CH' | 'en-CH';
  region?: string;
  interests?: string[];
  source?: string;
  utm_json?: Record<string, any>;
  custom_fields?: Record<string, any>;
  consent_json: {
    email?: { granted: boolean; timestamp: string; ip?: string };
    sms?: { granted: boolean; timestamp: string; ip?: string };
    push?: { granted: boolean; timestamp: string; ip?: string };
    whatsapp?: { granted: boolean; timestamp: string; ip?: string };
  };
}

export interface OfferConfig {
  type: 'coupon' | 'gift_card' | 'bundle' | 'referral_reward';
  name: string;
  description?: Record<string, string>; // localized
  rules_json: {
    discount_type?: 'percentage' | 'fixed' | 'free_shipping';
    discount_value?: number;
    min_order_value?: number;
    max_discount_value?: number;
    applicable_to?: 'order' | 'item' | 'category';
    item_ids?: string[];
    category_ids?: string[];
    usage_limit_per_customer?: number;
    usage_limit_total?: number;
    stackable?: boolean;
    channels?: string[];
    new_customers_only?: boolean;
  };
  budget?: number;
  start_at?: string;
  end_at?: string;
}

export class MarketingService {
  
  // API helper function
  private async apiCall(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API call failed');
    }
    
    return response.json();
  }
  
  // ==================== SEGMENTS & AUDIENCES ====================
  
  async createSegment(orgId: string, name: string, definition: SegmentDefinition) {
    const data = await this.apiCall(`/marketing/segments/${orgId}`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        definition_json: definition
      })
    });
    
    return data.data;
  }

  async refreshSegment(segmentId: string) {
    const { data, error } = await supabase.rpc('refresh_segment_count', {
      p_segment_id: segmentId
    });

    if (error) throw error;
    return data;
  }

  async getSegmentPreview(orgId: string, definition: SegmentDefinition, limit = 10) {
    const { data, error } = await supabase.rpc('preview_segment', {
      p_org_id: orgId,
      p_definition: definition,
      p_limit: limit
    });

    if (error) throw error;
    return data;
  }

  async syncAudienceToAds(segmentId: string, platform: 'meta' | 'google', audienceName: string) {
    const { data, error } = await supabase.rpc('sync_audience_to_ads', {
      p_segment_id: segmentId,
      p_platform: platform,
      p_audience_name: audienceName
    });

    if (error) throw error;
    return data;
  }

  async getSegments(orgId: string) {
    const data = await this.apiCall(`/marketing/segments/${orgId}`);
    return data.data;
  }

  // ==================== CAMPAIGNS ====================
  
  async createCampaign(orgId: string, config: CampaignConfig) {
    const data = await this.apiCall(`/marketing/campaigns/${orgId}`, {
      method: 'POST',
      body: JSON.stringify(config)
    });
    
    return data.data;
  }

  async scheduleCampaign(campaignId: string, sendAt: string) {
    const data = await this.apiCall(`/marketing/campaigns/${campaignId}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ send_at: sendAt })
    });
    
    return data.data;
  }

  async runPreflightChecks(campaignId: string) {
    const { data, error } = await supabase.rpc('run_campaign_preflight_checks', {
      p_campaign_id: campaignId
    });

    if (error) throw error;
    return data;
  }

  async sendCampaignPreview(campaignId: string, recipientEmail: string) {
    const data = await this.apiCall(`/marketing/campaigns/${campaignId}/preview`, {
      method: 'POST',
      body: JSON.stringify({ email: recipientEmail })
    });
    
    return data;
  }

  async getCampaigns(orgId: string, filters?: {
    status?: string[];
    type?: string[];
    channel?: string[];
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status[0]);
    if (filters?.type) params.append('type', filters.type[0]);
    if (filters?.channel) params.append('channel', filters.channel[0]);
    
    const queryString = params.toString();
    const endpoint = `/marketing/campaigns/${orgId}${queryString ? `?${queryString}` : ''}`;
    
    const data = await this.apiCall(endpoint);
    return data.data;
  }

  async getCampaignAnalytics(campaignId: string) {
    const data = await this.apiCall(`/marketing/campaigns/${campaignId}/analytics`);
    return data.data;
  }

  // ==================== FUNNELS ====================
  
  async createFunnel(orgId: string, config: FunnelConfig) {
    const { data: funnel, error: funnelError } = await supabase
      .from('funnels')
      .insert({
        org_id: orgId,
        name: config.name,
        goal_type: config.goal_type,
        goal_object_id: config.goal_object_id,
        locale: config.locale,
        theme: config.theme,
        domain: config.domain,
        status: 'draft'
      })
      .select()
      .single();

    if (funnelError) throw funnelError;

    // Create funnel steps
    if (config.steps.length > 0) {
      const steps = config.steps.map(step => ({
        funnel_id: funnel.id,
        type: step.type,
        order_index: step.order_index,
        content_json: step.content_json,
        form_id: step.form_id,
        offer_id: step.offer_id,
        test_group: step.test_group
      }));

      const { data: stepData, error: stepError } = await supabase
        .from('funnel_steps')
        .insert(steps)
        .select();

      if (stepError) throw stepError;
    }

    return funnel;
  }

  async publishFunnel(funnelId: string) {
    const { data, error } = await supabase
      .from('funnels')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', funnelId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getFunnelAnalytics(funnelId: string, startDate?: string, endDate?: string) {
    const { data, error } = await supabase.rpc('get_funnel_analytics', {
      p_funnel_id: funnelId,
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) throw error;
    return data;
  }

  async trackFunnelEvent(sessionId: string, funnelId: string, stepId: string, event: string, data?: Record<string, any>) {
    const { data: eventResult, error } = await supabase
      .from('attribution_events')
      .insert({
        session_id: sessionId,
        event: `funnel_${event}`,
        ts: new Date().toISOString(),
        url: `funnel/${funnelId}/step/${stepId}`,
        data_json: data
      })
      .select()
      .single();

    if (error) throw error;
    return eventResult;
  }

  // ==================== JOURNEYS ====================
  
  async createJourney(orgId: string, config: JourneyConfig) {
    const { data: journey, error: journeyError } = await supabase
      .from('journeys')
      .insert({
        org_id: orgId,
        name: config.name,
        entry_triggers_json: config.entry_triggers_json,
        quiet_hours_json: config.quiet_hours_json,
        frequency_caps_json: config.frequency_caps_json,
        status: 'draft',
        version: 1
      })
      .select()
      .single();

    if (journeyError) throw journeyError;

    // Create journey nodes
    if (config.nodes.length > 0) {
      const nodes = config.nodes.map(node => ({
        journey_id: journey.id,
        type: node.type,
        config_json: node.config_json,
        position: node.position
      }));

      const { data: nodeData, error: nodeError } = await supabase
        .from('journey_nodes')
        .insert(nodes)
        .select();

      if (nodeError) throw nodeError;
    }

    return journey;
  }

  async publishJourney(journeyId: string) {
    const { data, error } = await supabase
      .from('journeys')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', journeyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async simulateJourney(journeyId: string, testLead: LeadData) {
    const { data, error } = await supabase.rpc('simulate_journey', {
      p_journey_id: journeyId,
      p_test_lead: testLead
    });

    if (error) throw error;
    return data;
  }

  async enrollLeadInJourney(leadId: string, journeyId: string, entryNodeId: string) {
    const { data, error } = await supabase.rpc('enroll_lead_in_journey', {
      p_lead_id: leadId,
      p_journey_id: journeyId,
      p_entry_node_id: entryNodeId
    });

    if (error) throw error;
    return data;
  }

  // ==================== LEADS CRM ====================
  
  async createLead(orgId: string, leadData: LeadData, sourceInfo?: Record<string, any>) {
    // Check for existing lead first
    const existing = await this.findExistingLead(leadData.email, leadData.phone);
    
    if (existing) {
      // Update existing lead instead of creating duplicate
      return await this.updateLead(existing.id, {
        ...leadData,
        updated_at: new Date().toISOString()
      });
    }

    const { data, error } = await supabase
      .from('leads')
      .insert({
        org_id: orgId,
        email: leadData.email,
        phone: leadData.phone,
        first_name: leadData.first_name,
        last_name: leadData.last_name,
        locale: leadData.locale,
        region: leadData.region,
        interests: leadData.interests,
        source: leadData.source,
        utm_json: leadData.utm_json,
        custom_fields: leadData.custom_fields,
        consent_json: leadData.consent_json,
        status: 'new',
        score: 0,
        tags: []
      })
      .select()
      .single();

    if (error) throw error;

    // Log lead creation activity
    await this.logLeadActivity(data.id, 'lead_created', {
      source: leadData.source,
      utm: leadData.utm_json,
      ...sourceInfo
    });

    return data;
  }

  private async findExistingLead(email?: string, phone?: string) {
    if (!email && !phone) return null;

    let query = supabase.from('leads').select('*');
    
    if (email && phone) {
      query = query.or(`email.eq.${email},phone.eq.${phone}`);
    } else if (email) {
      query = query.eq('email', email);
    } else if (phone) {
      query = query.eq('phone', phone);
    }

    const { data, error } = await query.limit(1).single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  }

  async updateLead(leadId: string, updates: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async logLeadActivity(leadId: string, type: string, data?: Record<string, any>) {
    const { data: activity, error } = await supabase
      .from('lead_activities')
      .insert({
        lead_id: leadId,
        type,
        ts: new Date().toISOString(),
        data_json: data
      })
      .select()
      .single();

    if (error) throw error;
    return activity;
  }

  async scoreLeads(orgId: string, leadIds?: string[]) {
    const { data, error } = await supabase.rpc('score_leads', {
      p_org_id: orgId,
      p_lead_ids: leadIds
    });

    if (error) throw error;
    return data;
  }

  async assignLead(leadId: string, ownerId: string) {
    const { data, error } = await supabase
      .from('leads')
      .update({
        owner_id: ownerId,
        assigned_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;

    // Log assignment activity
    await this.logLeadActivity(leadId, 'assigned', { owner_id: ownerId });

    return data;
  }

  async getLeads(orgId: string, filters?: {
    status?: string[];
    owner_id?: string;
    source?: string[];
    score_min?: number;
    score_max?: number;
    tags?: string[];
  }) {
    let query = supabase
      .from('leads')
      .select(`
        *,
        owner:user_profiles(*),
        activities:lead_activities(*)
      `)
      .eq('org_id', orgId);

    if (filters?.status) query = query.in('status', filters.status);
    if (filters?.owner_id) query = query.eq('owner_id', filters.owner_id);
    if (filters?.source) query = query.in('source', filters.source);
    if (filters?.score_min) query = query.gte('score', filters.score_min);
    if (filters?.score_max) query = query.lte('score', filters.score_max);
    if (filters?.tags) query = query.contains('tags', filters.tags);

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // ==================== TEMPLATES ====================
  
  async createTemplate(orgId: string, template: {
    type: 'email' | 'sms' | 'push' | 'whatsapp';
    name: string;
    subject?: string;
    content: string;
    locale: string;
    design_json?: Record<string, any>;
  }) {
    const { data, error } = await supabase
      .from('templates')
      .insert({
        org_id: orgId,
        tenant_id: orgId, // For now, using orgId as tenant_id
        type: template.type,
        name: template.name,
        subject: template.subject,
        content: template.content,
        locale: template.locale,
        design_json: template.design_json,
        version: 1,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTemplates(orgId: string, filters?: {
    type?: string;
    locale?: string;
    is_active?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.locale) params.append('locale', filters.locale);
    
    const queryString = params.toString();
    const endpoint = `/marketing/templates/${orgId}${queryString ? `?${queryString}` : ''}`;
    
    const data = await this.apiCall(endpoint);
    return data.data;
  }

  async renderTemplate(templateId: string, variables: Record<string, any>) {
    const { data, error } = await supabase.rpc('render_template', {
      p_template_id: templateId,
      p_variables: variables
    });

    if (error) throw error;
    return data;
  }

  // ==================== OFFERS ====================
  
  async createOffer(orgId: string, offer: OfferConfig) {
    const { data, error } = await supabase
      .from('offers')
      .insert({
        org_id: orgId,
        type: offer.type,
        name: offer.name,
        description: offer.description,
        rules_json: offer.rules_json,
        budget: offer.budget,
        start_at: offer.start_at,
        end_at: offer.end_at,
        usage_count: 0,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async validateOffer(offerId: string, customerId: string, orderValue: number) {
    const { data, error } = await supabase.rpc('validate_offer', {
      p_offer_id: offerId,
      p_customer_id: customerId,
      p_order_value: orderValue
    });

    if (error) throw error;
    return data;
  }

  async applyOffer(offerId: string, orderId: string) {
    const { data, error } = await supabase.rpc('apply_offer', {
      p_offer_id: offerId,
      p_order_id: orderId
    });

    if (error) throw error;
    return data;
  }

  // ==================== REFERRALS ====================
  
  async createReferralProgram(orgId: string, program: {
    name: string;
    referrer_reward: number;
    referee_reward: number;
    min_purchase_value?: number;
    max_rewards_per_referrer?: number;
    valid_until?: string;
  }) {
    const { data, error } = await supabase
      .from('referral_programs')
      .insert({
        org_id: orgId,
        name: program.name,
        rules_json: {
          referrer_reward: program.referrer_reward,
          referee_reward: program.referee_reward,
          min_purchase_value: program.min_purchase_value,
          max_rewards_per_referrer: program.max_rewards_per_referrer
        },
        valid_until: program.valid_until,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async generateReferralCode(customerId: string, programId: string) {
    const { data, error } = await supabase.rpc('generate_referral_code', {
      p_customer_id: customerId,
      p_program_id: programId
    });

    if (error) throw error;
    return data;
  }

  async trackReferral(referralCode: string, refereeId: string, orderId?: string) {
    const { data, error } = await supabase.rpc('track_referral', {
      p_referral_code: referralCode,
      p_referee_id: refereeId,
      p_order_id: orderId
    });

    if (error) throw error;
    return data;
  }

  // ==================== ATTRIBUTION & ANALYTICS ====================
  
  async trackWebEvent(sessionId: string, event: string, data: {
    url?: string;
    referrer?: string;
    user_agent?: string;
    utm_json?: Record<string, any>;
    person_id?: string;
    order_id?: string;
  }) {
    const { data: eventData, error } = await supabase
      .from('attribution_events')
      .insert({
        session_id: sessionId,
        event,
        ts: new Date().toISOString(),
        url: data.url,
        referrer: data.referrer,
        user_agent: data.user_agent,
        utm_json: data.utm_json,
        person_id: data.person_id,
        order_id: data.order_id
      })
      .select()
      .single();

    if (error) throw error;
    return eventData;
  }

  async recordConversion(orderId: string, sourceEventId?: string) {
    const { data, error } = await supabase.rpc('record_conversion', {
      p_order_id: orderId,
      p_source_event_id: sourceEventId
    });

    if (error) throw error;
    return data;
  }

  async getAttributionAnalytics(orgId: string, startDate: string, endDate: string, model: 'last_click' | 'first_touch' | 'position_based' = 'last_click') {
    const { data, error } = await supabase.rpc('get_attribution_analytics', {
      p_org_id: orgId,
      p_start_date: startDate,
      p_end_date: endDate,
      p_model: model
    });

    if (error) throw error;
    return data;
  }

  async getCohortAnalytics(orgId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase.rpc('get_cohort_analytics', {
      p_org_id: orgId,
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) throw error;
    return data;
  }

  // ==================== DELIVERABILITY & COMPLIANCE ====================
  
  async updateDomainSettings(orgId: string, settings: {
    sending_domain?: string;
    dkim_private_key?: string;
    link_domain?: string;
  }) {
    const { data, error } = await supabase
      .from('domain_settings')
      .upsert({
        org_id: orgId,
        sending_domain: settings.sending_domain,
        dkim_private_key: settings.dkim_private_key,
        link_domain: settings.link_domain
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async processBouncesAndComplaints(webhookData: any) {
    const { data, error } = await supabase.rpc('process_bounce_webhook', {
      p_webhook_data: webhookData
    });

    if (error) throw error;
    return data;
  }

  async addToSuppressionList(orgId: string, email: string, reason: string) {
    const { data, error } = await supabase
      .from('suppression_lists')
      .insert({
        org_id: orgId,
        type: 'email',
        value: email,
        reason,
        added_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async unsubscribe(email: string, campaignId?: string) {
    const { data, error } = await supabase.rpc('process_unsubscribe', {
      p_email: email,
      p_campaign_id: campaignId
    });

    if (error) throw error;
    return data;
  }

  // ==================== EXPERIMENTS ====================
  
  async createExperiment(orgId: string, experiment: {
    name: string;
    scope: 'campaign' | 'page' | 'price';
    hypothesis: string;
    variants_json: Record<string, any>;
    primary_metric: string;
    duration_days: number;
  }) {
    const { data, error } = await supabase
      .from('experiments')
      .insert({
        org_id: orgId,
        name: experiment.name,
        scope: experiment.scope,
        hypothesis: experiment.hypothesis,
        variants_json: experiment.variants_json,
        primary_metric: experiment.primary_metric,
        status: 'draft',
        start_at: null,
        end_at: new Date(Date.now() + experiment.duration_days * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async startExperiment(experimentId: string) {
    const { data, error } = await supabase
      .from('experiments')
      .update({
        status: 'running',
        start_at: new Date().toISOString()
      })
      .eq('id', experimentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getExperimentResults(experimentId: string) {
    const { data, error } = await supabase.rpc('get_experiment_results', {
      p_experiment_id: experimentId
    });

    if (error) throw error;
    return data;
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================
  
  subscribeToCampaignUpdates(orgId: string, callback: (payload: any) => void) {
    return supabase
      .channel('campaign_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns',
          filter: `org_id=eq.${orgId}`
        },
        callback
      )
      .subscribe();
  }

  subscribeToLeadUpdates(orgId: string, callback: (payload: any) => void) {
    return supabase
      .channel('lead_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `org_id=eq.${orgId}`
        },
        callback
      )
      .subscribe();
  }
}

// Export singleton instance
export const marketingService = new MarketingService();
