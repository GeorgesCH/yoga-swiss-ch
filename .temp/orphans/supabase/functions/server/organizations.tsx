import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

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

// GET /orgs - Get user's organizations with hybrid support
app.get("/orgs", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    console.log(`[Orgs] Loading organizations for user: ${user.id}`);

    let userOrgs = [];

    // First try Supabase using the RPC function
    try {
      console.log(`[Orgs] Trying RPC get_user_organizations for user: ${user.id}`);
      const { data: supabaseOrgs, error: supabaseError } = await supabase
        .rpc('get_user_organizations', { p_user_id: user.id });
      
      if (!supabaseError && supabaseOrgs && Array.isArray(supabaseOrgs) && supabaseOrgs.length > 0) {
        userOrgs = supabaseOrgs.map(org => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          primary_locale: org.primary_locale,
          timezone: org.timezone,
          currency: org.currency,
          status: org.status,
          role: org.role,
          permissions: {
            schedule: true,
            customers: true,
            finance: true,
            marketing: true,
            settings: true,
            analytics: true,
            wallet_management: true,
            user_management: true
          },
          created_at: org.created_at
        }));
        console.log(`[Orgs] Found ${userOrgs.length} organizations in Supabase`);
        return c.json({ orgs: userOrgs, count: userOrgs.length, source: 'supabase' });
      } else if (supabaseError) {
        console.log(`[Orgs] Supabase RPC error: ${supabaseError.message}, code: ${supabaseError.code}`);
        
        // If RPC fails, try direct table query as fallback
        try {
          console.log(`[Orgs] RPC failed, trying direct table query`);
          const { data: directOrgs, error: directError } = await supabase
            .from('orgs')
            .select(`
              *,
              org_users!inner(role, status)
            `)
            .eq('org_users.user_id', user.id)
            .eq('org_users.is_active', true);

          if (!directError && directOrgs && directOrgs.length > 0) {
            userOrgs = directOrgs.map(org => ({
              id: org.id,
              name: org.name,
              slug: org.slug,
              primary_locale: org.primary_locale,
              timezone: org.timezone,
              currency: org.currency,
              status: org.status,
              role: org.org_users[0]?.role,
              permissions: {
                schedule: true,
                customers: true,
                finance: true,
                marketing: true,
                settings: true,
                analytics: true,
                wallet_management: true,
                user_management: true
              },
              created_at: org.created_at
            }));
            console.log(`[Orgs] Found ${userOrgs.length} organizations via direct query`);
            return c.json({ orgs: userOrgs, count: userOrgs.length, source: 'supabase-direct' });
          } else if (directError) {
            console.log(`[Orgs] Direct query also failed: ${directError.message}, code: ${directError.code}`);
          }
        } catch (directQueryError) {
          console.log(`[Orgs] Direct query exception:`, directQueryError);
        }
      }
    } catch (supabaseError) {
      console.log(`[Orgs] Supabase lookup exception:`, supabaseError);
    }

    // Fallback to KV store
    try {
      const orgsKey = `user_orgs:${user.id}`;
      const cachedOrgs = await kv.get(orgsKey);
      if (cachedOrgs && Array.isArray(cachedOrgs) && cachedOrgs.length > 0) {
        userOrgs = cachedOrgs;
        console.log(`[Orgs] Found ${userOrgs.length} organizations in KV store`);
        return c.json({ orgs: userOrgs, count: userOrgs.length, source: 'kv' });
      }
    } catch (kvError) {
      console.log(`[Orgs] KV lookup failed:`, kvError);
    }

    // Return empty array if no orgs found anywhere
    console.log(`[Orgs] No organizations found for user`);
    return c.json({ orgs: [], count: 0, source: 'none' });
    
  } catch (error) {
    console.error('[Orgs] Error loading organizations:', error);
    return c.json({ 
      error: 'Failed to load organizations',
      details: error.message 
    }, 500);
  }
});

// POST /orgs - Create new organization with dual storage
app.post("/orgs", async (c) => {
  let orgId = null;
  let slug = null;
  
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { name, type, settings = {} } = body;
    slug = body.slug;

    if (!name || !slug || !type) {
      return c.json({ error: 'Missing required fields: name, slug, type' }, 400);
    }

    if (!['studio', 'brand'].includes(type)) {
      return c.json({ error: 'Type must be either "studio" or "brand"' }, 400);
    }

    console.log(`[Orgs] Creating organization: ${name} (${slug}) for user: ${user.id}`);

    // Generate organization ID
    orgId = crypto.randomUUID();
    
    // Try to create in Supabase first using the RPC
    let supabaseSuccess = false;
    try {
      console.log(`[Orgs] Calling create_organization_owner RPC with: name=${name}, slug=${slug}`);
      const { data: createdOrgId, error: supabaseError } = await supabase
        .rpc('create_organization_owner', {
          p_name: name,
          p_slug: slug,
          p_locale: 'de-CH',
          p_timezone: 'Europe/Zurich',
          p_currency: 'CHF'
        });

      if (!supabaseError && createdOrgId) {
        orgId = createdOrgId;
        supabaseSuccess = true;
        console.log(`[Orgs] Organization created in Supabase: ${orgId}`);
      } else if (supabaseError) {
        console.log(`[Orgs] Supabase RPC creation failed: ${supabaseError.message}, code: ${supabaseError.code}`);
        if (supabaseError.message.includes('duplicate') || 
            supabaseError.message.includes('unique') || 
            supabaseError.code === '23505') {
          return c.json({ error: 'Organization slug already exists' }, 400);
        }
        // Don't return here - continue to KV fallback
      }
    } catch (supabaseError) {
      console.log(`[Orgs] Supabase creation exception:`, supabaseError);
    }

    // Also store in KV for compatibility
    try {
      // Check KV slug uniqueness if Supabase failed
      if (!supabaseSuccess) {
        const existingSlug = await kv.get(`org_slug:${slug}`);
        if (existingSlug) {
          return c.json({ error: 'Organization slug already exists' }, 400);
        }
      }

      const newOrg = {
        id: orgId,
        name,
        slug,
        type,
        currency: 'CHF',
        timezone: 'Europe/Zurich',
        primary_locale: 'de-CH',
        settings: {
          languages: ['en', 'de'],
          default_language: 'en',
          vat_rate: 7.7,
          twint_enabled: false,
          qr_bill_enabled: false,
          stripe_enabled: false,
          ...settings
        },
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: 'owner',
        permissions: {
          schedule: true,
          customers: true,
          finance: true,
          marketing: true,
          settings: true,
          analytics: true,
          wallet_management: true,
          user_management: true
        }
      };

      // Store in KV
      await kv.set(`org:${orgId}`, newOrg);
      await kv.set(`org_slug:${slug}`, orgId);
      
      // Create org user relationship
      const orgUser = {
        id: crypto.randomUUID(),
        org_id: orgId,
        user_id: user.id,
        role: 'owner',
        status: 'active',
        is_active: true,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      await kv.set(`org_user:${orgId}:${user.id}`, orgUser);
      
      // Update user's organizations list
      let userOrgs = [];
      try {
        const orgsKey = `user_orgs:${user.id}`;
        const existingOrgs = await kv.get(orgsKey);
        if (existingOrgs && Array.isArray(existingOrgs)) {
          userOrgs = existingOrgs.filter(org => org.id !== orgId); // Remove duplicates
        }
      } catch (error) {
        console.log('[Orgs] No existing orgs found, starting fresh');
      }
      
      userOrgs.push(newOrg);
      await kv.set(`user_orgs:${user.id}`, userOrgs);

      console.log(`[Orgs] Organization created successfully: ${orgId} (${supabaseSuccess ? 'Supabase + KV' : 'KV only'})`);
      
      return c.json({ 
        org: newOrg,
        message: 'Organization created successfully',
        storage: supabaseSuccess ? 'supabase+kv' : 'kv'
      });
      
    } catch (kvError) {
      console.error(`[Orgs] KV storage failed:`, kvError);
      
      // If Supabase succeeded but KV failed, that's still OK
      if (supabaseSuccess) {
        console.log(`[Orgs] Organization created in Supabase but KV storage failed`);
        return c.json({ 
          org: { id: orgId, name, slug, type, status: 'active' },
          message: 'Organization created successfully',
          storage: 'supabase',
          warning: 'Cache update failed'
        });
      }
      
      throw new Error('Failed to store organization data');
    }
    
  } catch (error) {
    console.error('[Orgs] Error creating organization:', error);
    
    // Cleanup on error
    if (orgId && slug) {
      try {
        await kv.delete(`org:${orgId}`);
        await kv.delete(`org_slug:${slug}`);
      } catch (cleanupError) {
        console.error(`[Orgs] Cleanup failed:`, cleanupError);
      }
    }
    
    return c.json({ 
      error: 'Failed to create organization',
      details: error.message 
    }, 500);
  }
});

// DELETE /orgs/cleanup - Clean up stuck organization data
app.delete("/cleanup", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    console.log(`[Orgs] Cleaning up stuck data for user: ${user.id}`);
    
    // Get current user orgs
    let userOrgs = [];
    try {
      const orgsKey = `user_orgs:${user.id}`;
      const existingOrgs = await kv.get(orgsKey);
      if (existingOrgs && Array.isArray(existingOrgs)) {
        userOrgs = existingOrgs;
      }
    } catch (error) {
      console.log('[Orgs] No user orgs found to clean up');
    }

    let cleanedCount = 0;
    
    // Check each org to see if it's properly stored
    for (const org of userOrgs) {
      try {
        const storedOrg = await kv.get(`org:${org.id}`);
        if (!storedOrg) {
          console.log(`[Orgs] Found orphaned org in user list: ${org.id}`);
          // Remove slug reference if it exists
          if (org.slug) {
            try {
              const slugRef = await kv.get(`org_slug:${org.slug}`);
              if (slugRef === org.id) {
                await kv.delete(`org_slug:${org.slug}`);
                console.log(`[Orgs] Removed orphaned slug: ${org.slug}`);
              }
            } catch (error) {
              console.log(`[Orgs] Error cleaning slug ${org.slug}:`, error);
            }
          }
          cleanedCount++;
        }
      } catch (error) {
        console.log(`[Orgs] Error checking org ${org.id}:`, error);
      }
    }

    // Filter out any orgs that don't exist
    const validOrgs = [];
    for (const org of userOrgs) {
      try {
        const storedOrg = await kv.get(`org:${org.id}`);
        if (storedOrg) {
          validOrgs.push(org);
        }
      } catch (error) {
        console.log(`[Orgs] Error validating org ${org.id}:`, error);
      }
    }

    // Update user orgs list with only valid orgs
    try {
      await kv.set(`user_orgs:${user.id}`, validOrgs);
      console.log(`[Orgs] Updated user orgs list: ${validOrgs.length} valid orgs`);
    } catch (error) {
      console.log(`[Orgs] Error updating user orgs list:`, error);
    }

    console.log(`[Orgs] Cleanup complete. Removed ${cleanedCount} orphaned entries`);
    
    return c.json({ 
      message: 'Cleanup completed',
      cleanedCount,
      validOrgsCount: validOrgs.length
    });
    
  } catch (error) {
    console.error('[Orgs] Error during cleanup:', error);
    return c.json({ 
      error: 'Cleanup failed',
      details: error.message 
    }, 500);
  }
});

// GET /orgs/:id - Get specific organization details
app.get("/:id", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const orgId = c.req.param('id');
    console.log(`[Orgs] Loading organization details: ${orgId} for user: ${user.id}`);

    // Try Supabase first
    try {
      const { data: org, error: supabaseError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();
      
      if (!supabaseError && org) {
        console.log(`[Orgs] Found organization in Supabase: ${org.name}`);
        return c.json({ org: { ...org, source: 'supabase' } });
      }
    } catch (supabaseError) {
      console.log(`[Orgs] Supabase lookup error:`, supabaseError);
    }

    // Fallback to KV store
    try {
      const org = await kv.get(`org:${orgId}`);
      if (org) {
        console.log(`[Orgs] Found organization in KV: ${org.name}`);
        return c.json({ org: { ...org, source: 'kv' } });
      }
    } catch (kvError) {
      console.log(`[Orgs] KV lookup failed:`, kvError);
    }

    return c.json({ error: 'Organization not found' }, 404);
    
  } catch (error) {
    console.error('[Orgs] Error loading organization:', error);
    return c.json({ 
      error: 'Failed to load organization',
      details: error.message 
    }, 500);
  }
});

export default app;