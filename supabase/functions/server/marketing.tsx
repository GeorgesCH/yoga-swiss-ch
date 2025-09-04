import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import { supabaseAdmin } from './auth.tsx';

const marketing = new Hono();

// CORS configuration
marketing.use('*', cors({
  origin: ['https://*.supabase.co', 'https://*.vercel.app', 'https://*.netlify.app'],
  credentials: true,
}));

// ==================== CAMPAIGNS ====================

// Get campaigns with analytics
marketing.get('/campaigns/:org_id', async (c) => {
  try {
    const org_id = c.req.param('org_id');
    const { status, type, channel } = c.req.query();

    let query = supabaseAdmin
      .from('campaigns')
      .select(`
        *,
        segments:audience_segment_id (
          id, name, live_count
        ),
        templates:template_id (
          id, name, type
        )
      `)
      .eq('org_id', org_id);

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);
    if (channel) query = query.eq('channel', channel);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch campaigns:', error);
      return c.json({ error: 'Failed to fetch campaigns' }, 500);
    }

    // Add mock analytics data for each campaign
    const campaignsWithAnalytics = (data || []).map(campaign => ({
      ...campaign,
      sends_count: Math.floor(Math.random() * 1000) + 100,
      opens_count: Math.floor(Math.random() * 500) + 50,
      clicks_count: Math.floor(Math.random() * 100) + 10,
      conversions_count: Math.floor(Math.random() * 20) + 1,
      revenue_total: Math.floor(Math.random() * 5000) + 500,
      cost_total: Math.floor(Math.random() * 200) + 50
    }));

    return c.json({ success: true, data: campaignsWithAnalytics });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create campaign
marketing.post('/campaigns/:org_id', async (c) => {
  try {
    const org_id = c.req.param('org_id');
    const body = await c.req.json();

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .insert({
        org_id,
        tenant_id: org_id,
        ...body,
        status: 'draft',
        sends_count: 0,
        opens_count: 0,
        clicks_count: 0,
        conversions_count: 0,
        revenue_total: 0,
        cost_total: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create campaign:', error);
      return c.json({ error: 'Failed to create campaign' }, 500);
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Schedule campaign
marketing.post('/campaigns/:campaign_id/schedule', async (c) => {
  try {
    const campaign_id = c.req.param('campaign_id');
    const body = await c.req.json();
    const { send_at } = body;

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update({
        status: 'scheduled',
        scheduled_at: send_at
      })
      .eq('id', campaign_id)
      .select()
      .single();

    if (error) {
      console.error('Failed to schedule campaign:', error);
      return c.json({ error: 'Failed to schedule campaign' }, 500);
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error scheduling campaign:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Send campaign preview
marketing.post('/campaigns/:campaign_id/preview', async (c) => {
  try {
    const campaign_id = c.req.param('campaign_id');
    const body = await c.req.json();
    const { email } = body;

    // In a real implementation, this would send an actual preview email
    console.log(`Sending preview for campaign ${campaign_id} to ${email}`);

    return c.json({ success: true, message: 'Preview sent successfully' });
  } catch (error) {
    console.error('Error sending preview:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get campaign analytics
marketing.get('/campaigns/:campaign_id/analytics', async (c) => {
  try {
    const campaign_id = c.req.param('campaign_id');

    // Mock analytics data
    const analytics = {
      overview: {
        sends: Math.floor(Math.random() * 1000) + 100,
        opens: Math.floor(Math.random() * 500) + 50,
        clicks: Math.floor(Math.random() * 100) + 10,
        conversions: Math.floor(Math.random() * 20) + 1,
        revenue: Math.floor(Math.random() * 5000) + 500,
        cost: Math.floor(Math.random() * 200) + 50
      },
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        opens: Math.floor(Math.random() * 50),
        clicks: Math.floor(Math.random() * 20)
      })),
      deviceBreakdown: {
        mobile: 45,
        desktop: 35,
        tablet: 20
      },
      locationBreakdown: [
        { country: 'Switzerland', opens: 150, clicks: 25 },
        { country: 'Germany', opens: 80, clicks: 15 },
        { country: 'Austria', opens: 45, clicks: 8 }
      ]
    };

    return c.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== SEGMENTS ====================

// Get segments
marketing.get('/segments/:org_id', async (c) => {
  try {
    const org_id = c.req.param('org_id');

    const { data, error } = await supabaseAdmin
      .from('segments')
      .select('*')
      .eq('org_id', org_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch segments:', error);
      return c.json({ error: 'Failed to fetch segments' }, 500);
    }

    return c.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching segments:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create segment
marketing.post('/segments/:org_id', async (c) => {
  try {
    const org_id = c.req.param('org_id');
    const body = await c.req.json();

    const { data, error } = await supabaseAdmin
      .from('segments')
      .insert({
        org_id,
        tenant_id: org_id,
        ...body,
        live_count: Math.floor(Math.random() * 500) + 50 // Mock count
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create segment:', error);
      return c.json({ error: 'Failed to create segment' }, 500);
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error creating segment:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== TEMPLATES ====================

// Get templates
marketing.get('/templates/:org_id', async (c) => {
  try {
    const org_id = c.req.param('org_id');
    const { type, locale } = c.req.query();

    let query = supabaseAdmin
      .from('templates')
      .select('*')
      .eq('org_id', org_id)
      .eq('is_active', true);

    if (type) query = query.eq('type', type);
    if (locale) query = query.eq('locale', locale);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch templates:', error);
      return c.json({ error: 'Failed to fetch templates' }, 500);
    }

    return c.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create template
marketing.post('/templates/:org_id', async (c) => {
  try {
    const org_id = c.req.param('org_id');
    const body = await c.req.json();

    const { data, error } = await supabaseAdmin
      .from('templates')
      .insert({
        org_id,
        tenant_id: org_id,
        ...body,
        version: 1,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create template:', error);
      return c.json({ error: 'Failed to create template' }, 500);
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error creating template:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== ANALYTICS ====================

// Get marketing overview analytics
marketing.get('/analytics/overview/:org_id', async (c) => {
  try {
    const org_id = c.req.param('org_id');
    const { period = '30d' } = c.req.query();

    // Mock analytics data
    const analytics = {
      summary: {
        total_campaigns: Math.floor(Math.random() * 20) + 5,
        active_campaigns: Math.floor(Math.random() * 10) + 2,
        total_sends: Math.floor(Math.random() * 10000) + 1000,
        avg_open_rate: (Math.random() * 30 + 15).toFixed(1),
        avg_click_rate: (Math.random() * 10 + 2).toFixed(1),
        total_revenue: Math.floor(Math.random() * 50000) + 10000
      },
      campaignPerformance: Array.from({ length: 10 }, (_, i) => ({
        name: `Campaign ${i + 1}`,
        sends: Math.floor(Math.random() * 1000) + 100,
        opens: Math.floor(Math.random() * 500) + 50,
        clicks: Math.floor(Math.random() * 100) + 10,
        revenue: Math.floor(Math.random() * 5000) + 500
      })),
      revenueData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 1000) + 100,
        orders: Math.floor(Math.random() * 20) + 5
      })),
      audienceGrowth: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString('de-CH', { month: 'short' }),
        subscribers: Math.floor(Math.random() * 500) + 1000 + i * 50
      }))
    };

    return c.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching marketing analytics:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get email deliverability stats
marketing.get('/analytics/deliverability/:org_id', async (c) => {
  try {
    const org_id = c.req.param('org_id');

    const deliverability = {
      deliveryRate: (Math.random() * 5 + 95).toFixed(1),
      bounceRate: (Math.random() * 3 + 1).toFixed(1),
      spamRate: (Math.random() * 1 + 0.1).toFixed(2),
      unsubscribeRate: (Math.random() * 2 + 0.5).toFixed(1),
      reputationScore: Math.floor(Math.random() * 20 + 80),
      domainHealth: 'Good',
      recentIssues: []
    };

    return c.json({ success: true, data: deliverability });
  } catch (error) {
    console.error('Error fetching deliverability stats:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default marketing;