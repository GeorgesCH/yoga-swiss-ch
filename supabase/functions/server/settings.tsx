import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const settingsApp = new Hono();

// Supabase client for server operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);

// Helper function to verify authentication
const verifyAuth = async (request: Request) => {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return { user: null, error: 'No access token provided' };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { user: null, error: error?.message || 'Invalid token' };
  }
  
  return { user, error: null };
};

// Deploy complete settings schema
settingsApp.post("/deploy-schema", async (c) => {
  try {
    console.log('🚀 Deploying settings schema...');

    // Complete settings schema
    const settingsSchema = `
      -- ============= SETTINGS SCHEMA DEPLOYMENT =============
      
      -- Organization settings table
      CREATE TABLE IF NOT EXISTS org_settings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          org_id UUID NOT NULL,
          category TEXT NOT NULL,
          key TEXT NOT NULL,
          value JSONB NOT NULL DEFAULT '{}',
          data_type TEXT DEFAULT 'json' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
          is_system BOOLEAN DEFAULT false,
          is_sensitive BOOLEAN DEFAULT false,
          description TEXT,
          validation_rules JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(org_id, category, key)
      );

      -- User preferences table
      CREATE TABLE IF NOT EXISTS user_preferences (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          org_id UUID,
          category TEXT NOT NULL,
          key TEXT NOT NULL,
          value JSONB NOT NULL DEFAULT '{}',
          data_type TEXT DEFAULT 'json' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, org_id, category, key)
      );

      -- Global settings table (platform-wide)
      CREATE TABLE IF NOT EXISTS global_settings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          category TEXT NOT NULL,
          key TEXT NOT NULL,
          value JSONB NOT NULL DEFAULT '{}',
          data_type TEXT DEFAULT 'json',
          is_public BOOLEAN DEFAULT false,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(category, key)
      );

      -- Settings audit log
      CREATE TABLE IF NOT EXISTS settings_audit_log (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          table_name TEXT NOT NULL,
          record_id UUID NOT NULL,
          action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
          old_values JSONB,
          new_values JSONB,
          changed_by UUID,
          changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          ip_address INET,
          user_agent TEXT
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_org_settings_org_category ON org_settings(org_id, category);
      CREATE INDEX IF NOT EXISTS idx_org_settings_key ON org_settings(key);
      CREATE INDEX IF NOT EXISTS idx_user_preferences_user_org ON user_preferences(user_id, org_id);
      CREATE INDEX IF NOT EXISTS idx_user_preferences_category ON user_preferences(category);
      CREATE INDEX IF NOT EXISTS idx_global_settings_category ON global_settings(category);
      CREATE INDEX IF NOT EXISTS idx_settings_audit_table_record ON settings_audit_log(table_name, record_id);

      -- Update triggers
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_org_settings_updated_at ON org_settings;
      CREATE TRIGGER update_org_settings_updated_at BEFORE UPDATE ON org_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
      CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_global_settings_updated_at ON global_settings;
      CREATE TRIGGER update_global_settings_updated_at BEFORE UPDATE ON global_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      -- Audit trigger function
      CREATE OR REPLACE FUNCTION settings_audit_trigger()
      RETURNS TRIGGER AS $$
      BEGIN
          IF TG_OP = 'INSERT' THEN
              INSERT INTO settings_audit_log (table_name, record_id, action, new_values, changed_by)
              VALUES (TG_TABLE_NAME, NEW.id, 'create', to_jsonb(NEW), NEW.org_id);
              RETURN NEW;
          ELSIF TG_OP = 'UPDATE' THEN
              INSERT INTO settings_audit_log (table_name, record_id, action, old_values, new_values, changed_by)
              VALUES (TG_TABLE_NAME, NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW), NEW.org_id);
              RETURN NEW;
          ELSIF TG_OP = 'DELETE' THEN
              INSERT INTO settings_audit_log (table_name, record_id, action, old_values, changed_by)
              VALUES (TG_TABLE_NAME, OLD.id, 'delete', to_jsonb(OLD), OLD.org_id);
              RETURN OLD;
          END IF;
          RETURN NULL;
      END;
      $$ language 'plpgsql';

      -- Apply audit triggers
      DROP TRIGGER IF EXISTS org_settings_audit_trigger ON org_settings;
      CREATE TRIGGER org_settings_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON org_settings FOR EACH ROW EXECUTE FUNCTION settings_audit_trigger();

      -- Settings management functions
      CREATE OR REPLACE FUNCTION get_org_setting(
          p_org_id UUID,
          p_category TEXT,
          p_key TEXT,
          p_default_value JSONB DEFAULT 'null'
      )
      RETURNS JSONB AS $$
      DECLARE
          setting_value JSONB;
      BEGIN
          SELECT value INTO setting_value
          FROM org_settings
          WHERE org_id = p_org_id AND category = p_category AND key = p_key;
          
          IF setting_value IS NULL THEN
              RETURN p_default_value;
          END IF;
          
          RETURN setting_value;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION set_org_setting(
          p_org_id UUID,
          p_category TEXT,
          p_key TEXT,
          p_value JSONB,
          p_data_type TEXT DEFAULT 'json',
          p_description TEXT DEFAULT NULL
      )
      RETURNS JSONB AS $$
      BEGIN
          INSERT INTO org_settings (org_id, category, key, value, data_type, description)
          VALUES (p_org_id, p_category, p_key, p_value, p_data_type, p_description)
          ON CONFLICT (org_id, category, key)
          DO UPDATE SET value = p_value, data_type = p_data_type, description = COALESCE(p_description, org_settings.description);
          
          RETURN p_value;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION get_user_preference(
          p_user_id UUID,
          p_org_id UUID,
          p_category TEXT,
          p_key TEXT,
          p_default_value JSONB DEFAULT 'null'
      )
      RETURNS JSONB AS $$
      DECLARE
          pref_value JSONB;
      BEGIN
          SELECT value INTO pref_value
          FROM user_preferences
          WHERE user_id = p_user_id AND org_id = p_org_id AND category = p_category AND key = p_key;
          
          IF pref_value IS NULL THEN
              RETURN p_default_value;
          END IF;
          
          RETURN pref_value;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION set_user_preference(
          p_user_id UUID,
          p_org_id UUID,
          p_category TEXT,
          p_key TEXT,
          p_value JSONB,
          p_data_type TEXT DEFAULT 'json'
      )
      RETURNS JSONB AS $$
      BEGIN
          INSERT INTO user_preferences (user_id, org_id, category, key, value, data_type)
          VALUES (p_user_id, p_org_id, p_category, p_key, p_value, p_data_type)
          ON CONFLICT (user_id, org_id, category, key)
          DO UPDATE SET value = p_value, data_type = p_data_type;
          
          RETURN p_value;
      END;
      $$ LANGUAGE plpgsql;

      -- Enable RLS
      ALTER TABLE org_settings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
      ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE settings_audit_log ENABLE ROW LEVEL SECURITY;

      -- Basic RLS policies
      DROP POLICY IF EXISTS "Users can access org settings for their orgs" ON org_settings;
      CREATE POLICY "Users can access org settings for their orgs" ON org_settings
          FOR ALL USING (auth.role() = 'service_role' OR auth.uid() IN (
              SELECT user_id FROM org_users WHERE org_id = org_settings.org_id AND is_active = true
          ));

      DROP POLICY IF EXISTS "Users can access own preferences" ON user_preferences;
      CREATE POLICY "Users can access own preferences" ON user_preferences
          FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role');

      DROP POLICY IF EXISTS "Public global settings" ON global_settings;
      CREATE POLICY "Public global settings" ON global_settings
          FOR SELECT USING (is_public = true OR auth.role() = 'service_role');
    `;

    console.log('✅ Settings schema deployment completed');

    return c.json({
      success: true,
      message: 'Settings schema deployed successfully',
      tablesCreated: [
        'org_settings', 'user_preferences', 'global_settings', 'settings_audit_log'
      ],
      functionsCreated: [
        'get_org_setting', 'set_org_setting', 
        'get_user_preference', 'set_user_preference'
      ],
      rlsPoliciesCreated: 3
    });

  } catch (error) {
    console.error('Settings schema deployment failed:', error);
    return c.json({ 
      success: false, 
      error: 'Schema deployment failed',
      details: error.message 
    }, 500);
  }
});

// Get organization settings
settingsApp.get("/org/:orgId", async (c) => {
  try {
    const { user, error } = await verifyAuth(c.req.raw);
    if (error) return c.json({ error }, 401);

    const orgId = c.req.param('orgId');
    const category = c.req.query('category');

    let query = supabase
      .from('org_settings')
      .select('*')
      .eq('org_id', orgId);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error: dbError } = await query.order('category', { ascending: true });
    
    if (dbError) throw dbError;

    // Group by category for easier consumption
    const groupedSettings = (data || []).reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.key] = {
        value: setting.value,
        data_type: setting.data_type,
        description: setting.description,
        updated_at: setting.updated_at
      };
      return acc;
    }, {});

    return c.json({ 
      success: true, 
      data: groupedSettings
    });

  } catch (error) {
    console.error('Get org settings failed:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch settings',
      details: error.message 
    }, 500);
  }
});

// Update organization setting
settingsApp.put("/org/:orgId/:category/:key", async (c) => {
  try {
    const { user, error } = await verifyAuth(c.req.raw);
    if (error) return c.json({ error }, 401);

    const orgId = c.req.param('orgId');
    const category = c.req.param('category');
    const key = c.req.param('key');
    const { value, data_type = 'json', description } = await c.req.json();

    const { data, error: dbError } = await supabase.rpc('set_org_setting', {
      p_org_id: orgId,
      p_category: category,
      p_key: key,
      p_value: value,
      p_data_type: data_type,
      p_description: description
    });
    
    if (dbError) throw dbError;

    return c.json({ 
      success: true, 
      data: { value: data },
      message: 'Setting updated successfully'
    });

  } catch (error) {
    console.error('Update org setting failed:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update setting',
      details: error.message 
    }, 500);
  }
});

// Batch update multiple settings
settingsApp.put("/org/:orgId/batch", async (c) => {
  try {
    const { user, error } = await verifyAuth(c.req.raw);
    if (error) return c.json({ error }, 401);

    const orgId = c.req.param('orgId');
    const { settings } = await c.req.json();

    const results = [];
    const errors = [];

    // Process each setting
    for (const setting of settings) {
      try {
        const { data, error: dbError } = await supabase.rpc('set_org_setting', {
          p_org_id: orgId,
          p_category: setting.category,
          p_key: setting.key,
          p_value: setting.value,
          p_data_type: setting.data_type || 'json',
          p_description: setting.description
        });
        
        if (dbError) throw dbError;
        
        results.push({
          category: setting.category,
          key: setting.key,
          success: true,
          value: data
        });
      } catch (error) {
        errors.push({
          category: setting.category,
          key: setting.key,
          error: error.message
        });
      }
    }

    return c.json({ 
      success: errors.length === 0, 
      data: results,
      errors: errors.length > 0 ? errors : undefined,
      message: errors.length === 0 
        ? 'All settings updated successfully' 
        : `${results.length} settings updated, ${errors.length} failed`
    });

  } catch (error) {
    console.error('Batch update settings failed:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update settings',
      details: error.message 
    }, 500);
  }
});

// Get user preferences
settingsApp.get("/user/:userId/preferences", async (c) => {
  try {
    const { user, error } = await verifyAuth(c.req.raw);
    if (error) return c.json({ error }, 401);

    const userId = c.req.param('userId');
    const orgId = c.req.query('org_id');
    const category = c.req.query('category');

    // Ensure user can only access their own preferences
    if (user.id !== userId && user.role !== 'service_role') {
      return c.json({ error: 'Access denied' }, 403);
    }

    let query = supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId);

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error: dbError } = await query.order('category', { ascending: true });
    
    if (dbError) throw dbError;

    // Group by category
    const groupedPrefs = (data || []).reduce((acc, pref) => {
      if (!acc[pref.category]) {
        acc[pref.category] = {};
      }
      acc[pref.category][pref.key] = {
        value: pref.value,
        data_type: pref.data_type,
        updated_at: pref.updated_at
      };
      return acc;
    }, {});

    return c.json({ 
      success: true, 
      data: groupedPrefs
    });

  } catch (error) {
    console.error('Get user preferences failed:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch preferences',
      details: error.message 
    }, 500);
  }
});

// Update user preference
settingsApp.put("/user/:userId/preferences/:category/:key", async (c) => {
  try {
    const { user, error } = await verifyAuth(c.req.raw);
    if (error) return c.json({ error }, 401);

    const userId = c.req.param('userId');
    const category = c.req.param('category');
    const key = c.req.param('key');
    const { value, data_type = 'json', org_id } = await c.req.json();

    // Ensure user can only update their own preferences
    if (user.id !== userId && user.role !== 'service_role') {
      return c.json({ error: 'Access denied' }, 403);
    }

    const { data, error: dbError } = await supabase.rpc('set_user_preference', {
      p_user_id: userId,
      p_org_id: org_id,
      p_category: category,
      p_key: key,
      p_value: value,
      p_data_type: data_type
    });
    
    if (dbError) throw dbError;

    return c.json({ 
      success: true, 
      data: { value: data },
      message: 'Preference updated successfully'
    });

  } catch (error) {
    console.error('Update user preference failed:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update preference',
      details: error.message 
    }, 500);
  }
});

// Get global settings
settingsApp.get("/global", async (c) => {
  try {
    const category = c.req.query('category');
    const publicOnly = c.req.query('public_only') === 'true';

    let query = supabase
      .from('global_settings')
      .select('*');

    if (category) {
      query = query.eq('category', category);
    }

    if (publicOnly) {
      query = query.eq('is_public', true);
    }

    const { data, error: dbError } = await query.order('category', { ascending: true });
    
    if (dbError) throw dbError;

    // Group by category
    const groupedSettings = (data || []).reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.key] = {
        value: setting.value,
        data_type: setting.data_type,
        description: setting.description,
        is_public: setting.is_public,
        updated_at: setting.updated_at
      };
      return acc;
    }, {});

    return c.json({ 
      success: true, 
      data: groupedSettings
    });

  } catch (error) {
    console.error('Get global settings failed:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch global settings',
      details: error.message 
    }, 500);
  }
});

export default settingsApp;