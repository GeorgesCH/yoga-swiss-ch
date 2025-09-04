import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";
import payments from './payments.tsx';
import finance from './finance.tsx';
import marketing from './marketing.tsx';
import seed from './seed.tsx';
import people from './people.tsx';
import community from './community.tsx';
import programsRouter from './programs.tsx';
import classesRouter from './classes.tsx';
import settingsRouter from './settings.tsx';
import bookingsRouter from './bookings.tsx';
import organizationsRouter from './organizations.tsx';
import { teachersCircleApp } from './teachers-circle.tsx';
import { retreatRequestsApp } from './retreat-requests.tsx';
import type { 
  Org, 
  OrgUser, 
  Location, 
  Wallet, 
  WalletLedger, 
  Package, 
  Pass, 
  Order, 
  OrderItem, 
  Payment,
  SwissPaymentSettings,
  Role,
  ROLE_PERMISSIONS 
} from "./schemas.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
// Best practice: allow only configured origins in production.
const allowedOriginsEnv = Deno.env.get("ALLOWED_ORIGINS")?.split(",").map(s => s.trim()).filter(Boolean) ?? [];
const isProd = (Deno.env.get("DENO_REGION") || "").length > 0;
const defaultOrigins = [
  "https://*.supabase.co",
  "https://*.vercel.app",
  "https://*.netlify.app"
];
const allowedOrigins = isProd && allowedOriginsEnv.length > 0 ? allowedOriginsEnv : [...defaultOrigins, "*"];

app.use(
  "/*",
  cors({
    origin: (origin) => {
      // Allow requests without an Origin (e.g., curl) and configured origins
      if (!origin) return "*";
      if (allowedOrigins.includes("*")) return "*";
      return allowedOrigins.includes(origin) ? origin : false;
    },
    allowHeaders: ["Content-Type", "Authorization", "X-Org-ID", "X-Customer-ID", "X-Request-ID"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Root endpoint for basic connectivity test (clean path)
app.get("/", (c) => {
  return c.json({
    service: "YogaSwiss Edge Function Server",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      organizations: "/orgs"
    }
  });
});

// Supabase client for server operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);

// Helper function to verify authentication and org access
const verifyAuth = async (request: Request, requiredOrgId?: string) => {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  const orgId = request.headers.get('X-Org-ID') || requiredOrgId;
  
  if (!accessToken) {
    return { user: null, orgUser: null, error: 'No access token provided' };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { user: null, orgUser: null, error: error?.message || 'Invalid token' };
  }

  // If org access is required, verify user belongs to org
  let orgUser = null;
  if (orgId) {
    orgUser = await kv.get(`org_user:${orgId}:${user.id}`);
    if (!orgUser || orgUser.status !== 'active') {
      return { user, orgUser: null, error: 'Access denied to organization' };
    }
  }
  
  return { user, orgUser, error: null };
};

// Helper to check permissions
const hasPermission = (orgUser: OrgUser, permission: keyof typeof ROLE_PERMISSIONS.owner): boolean => {
  const permissions = ROLE_PERMISSIONS[orgUser.role as Role];
  return permissions?.[permission] || false;
};

// Helper to format price in CHF
const formatCHF = (amountCents: number): string => {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF'
  }).format(amountCents / 100);
};

// Database setup endpoint
app.post("/setup/database", async (c) => {
  try {
    console.log('🗄️ Starting normalized database setup...');

    // This endpoint will instruct users to run the proper migrations
    // Since we can't execute DDL directly from Edge Functions, we provide the migration info
    
    const migrationInfo = {
      message: 'Database setup requires running migrations',
      instructions: [
        'Run the migration files in order via Supabase SQL Editor:',
        '1. /supabase/migrations/20241204000001_complete_normalized_schema.sql',
        '2. /supabase/migrations/20241204000002_compatibility_and_auth.sql'
      ],
      tables_to_create: [
        'organizations',
        'profiles', 
        'organization_members',
        'instructors',
        'locations',
        'rooms',
        'class_templates',
        'class_occurrences',
        'registrations',
        'waitlists',
        'timesheets',
        'customer_feedback',
        'products',
        'orders',
        'order_items',
        'invoices',
        'invoice_items',
        'payments',
        'segments',
        'campaigns',
        'campaign_segments',
        'journeys',
        'analytics_events',
        'resources',
        'programs',
        'program_registrations',
        'retreats',
        'retreat_registrations',
        'customer_wallets',
        'wallet_transactions',
        'referrals',
        'earnings',
        'instructor_availability',
        'kv_store'
      ],
      compatibility_views: [
        'orgs (maps to organizations)',
        'org_users (maps to organization_members)', 
        'user_profiles (maps to profiles)'
      ]
    };

    // Test if database is already set up by checking for key tables
    let tablesExist = false;
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .limit(1);
      
      if (!error) {
        tablesExist = true;
        console.log('✅ Database tables already exist');
      }
    } catch (testError) {
      console.log('ℹ️ Database tables not yet created');
    }

    if (tablesExist) {
      return c.json({
        success: true,
        message: 'Database is already set up with normalized schema',
        status: 'ready'
      });
    } else {
      return c.json({
        success: false,
        message: 'Database setup required - please run migrations manually',
        ...migrationInfo,
        status: 'needs_setup'
      });
    }

  } catch (error) {
    console.error('Database setup check failed:', error);
    return c.json({ 
      success: false, 
      error: 'Database setup check failed',
      details: error.message,
      status: 'error'
    }, 500);
  }
});

// Export the app for external use (wrapped and served by function entry)
export { app };

// Quick database status endpoint
app.get("/setup/status", async (c) => {
  try {
    console.log('🔍 Checking database status...');

    const status = {
      normalized_schema: false,
      compatibility_views: false,
      auth_functions: false,
      sample_data: false
    };

    // Check if main tables exist
    try {
      const { error: orgError } = await supabase.from('organizations').select('id').limit(1);
      const { error: profileError } = await supabase.from('profiles').select('id').limit(1);
      const { error: memberError } = await supabase.from('organization_members').select('id').limit(1);
      
      if (!orgError && !profileError && !memberError) {
        status.normalized_schema = true;
      }
    } catch (error) {
      console.log('Main tables check failed:', error);
    }

    // Check if compatibility views exist
    try {
      const { error: orgsViewError } = await supabase.from('orgs').select('id').limit(1);
      const { error: orgUsersViewError } = await supabase.from('org_users').select('user_id').limit(1);
      
      if (!orgsViewError && !orgUsersViewError) {
        status.compatibility_views = true;
      }
    } catch (error) {
      console.log('Compatibility views check failed:', error);
    }

    // Check if RPC functions exist
    try {
      const { data, error } = await supabase.rpc('get_user_organizations', { p_user_id: '00000000-0000-0000-0000-000000000000' });
      if (error && !error.message.includes('permission denied')) {
        status.auth_functions = true;
      }
    } catch (error) {
      console.log('RPC functions check failed:', error);
    }

    const isReady = status.normalized_schema && status.compatibility_views;

    return c.json({
      success: true,
      ready: isReady,
      status,
      message: isReady ? 'Database is ready' : 'Database setup incomplete'
    });

  } catch (error) {
    console.error('Database status check failed:', error);
    return c.json({ 
      success: false, 
      error: 'Database status check failed',
      details: error.message 
    }, 500);
  }
});

// Mount payment routes
app.route('/payments', payments);

// Mount finance routes
app.route('/finance', finance);

// Mount marketing routes
app.route('/marketing', marketing);

// Mount seed routes  
app.route('/seed', seed);

// Mount people management routes
app.route('/people', people);

// Mount community routes
app.route('/community', community);

// Mount programs routes
app.route('/', programsRouter);

// Mount classes routes
app.route('/classes', classesRouter);

// Mount bookings routes
app.route('/bookings', bookingsRouter);

// Mount settings routes
app.route('/settings', settingsRouter);

// Mount organizations routes
app.route('/orgs', organizationsRouter);

// Health check endpoint
app.get("/health", (c) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    version: '1.2.0',
    platform: 'YogaSwiss',
    features: ['payments', 'auth', 'swiss-localization', 'seeding', 'people-management', 'multi-tenant'],
    endpoints: {
      payments: '/make-server-f0b2daa4/payments',
      seed: '/make-server-f0b2daa4/seed',
      people: '/make-server-f0b2daa4/people',
      setup: '/make-server-f0b2daa4/setup',
      auth: '/make-server-f0b2daa4/auth'
    },
    config: {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : null,
      environment: 'edge-function',
      databaseReady: false // Would need to check actual database
    }
  });
});

// Deployment verification endpoint
app.get("/make-server-f0b2daa4/deploy/status", async (c) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Test database connection
    let dbConnectionTest = false;
    let dbTables = [];
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (!error) {
        dbConnectionTest = true;
        dbTables = data?.map(t => t.table_name) || [];
      }
    } catch (dbError) {
      console.log('Database connection test failed:', dbError);
    }
    
    // Test auth functionality
    let authTest = false;
    try {
      const testAuth = await supabase.auth.getSession();
      authTest = true;
    } catch (authError) {
      console.log('Auth test failed:', authError);
    }
    
    const deploymentStatus = {
      status: 'deployed',
      timestamp: new Date().toISOString(),
      version: '1.2.0',
      environment: {
        supabaseUrl: !!supabaseUrl,
        serviceKey: !!supabaseServiceKey,
        region: Deno.env.get('DENO_REGION') || 'unknown'
      },
      services: {
        edgeFunction: true,
        database: dbConnectionTest,
        auth: authTest,
        storage: false // Would need to test storage
      },
      database: {
        connected: dbConnectionTest,
        tablesFound: dbTables.length,
        requiredTables: [
          'orgs', 'user_profiles', 'org_users', 'locations',
          'class_templates', 'class_occurrences', 'registrations',
          'wallets', 'products', 'passes', 'orders', 'invoices'
        ],
        tablesExist: dbTables
      },
      apis: {
        people: '/make-server-f0b2daa4/people',
        payments: '/make-server-f0b2daa4/payments',
        seed: '/make-server-f0b2daa4/seed',
        setup: '/make-server-f0b2daa4/setup'
      }
    };
    
    return c.json(deploymentStatus);
    
  } catch (error) {
    console.error('Deployment status check failed:', error);
    return c.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Simple demo creation endpoint (minimal version) - using signup instead of admin API
app.post("/make-server-f0b2daa4/auth/create-demo-simple", async (c) => {
  try {
    console.log('Simple demo creation started');
    
    const demoEmail = 'studio@yogaswiss.ch';
    const demoPassword = 'password';
    
    // Use regular signup instead of admin API
    const { data, error } = await supabase.auth.signUp({
      email: demoEmail,
      password: demoPassword,
      options: {
        data: {
          firstName: 'Demo',
          lastName: 'Studio',
          role: 'owner'
        }
      }
    });

    if (error) {
      console.log(`Simple demo creation error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    
    console.log('Simple demo account created:', data.user?.email);
    return c.json({ message: 'Simple demo account created', user: data.user });
    
  } catch (error) {
    console.error('Simple demo creation failed:', error);
    return c.json({ 
      error: 'Simple demo creation failed: ' + (error?.message || error) 
    }, 500);
  }
});

// Demo account creation endpoint
app.post("/make-server-f0b2daa4/auth/create-demo", async (c) => {
  try {
    // First check if Supabase is configured properly
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Demo endpoint called - Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      urlPreview: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'none',
      keyPreview: supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'none'
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return c.json({ 
        error: 'Server configuration error: Missing Supabase credentials',
        debug: { hasUrl: !!supabaseUrl, hasServiceKey: !!supabaseServiceKey }
      }, 500);
    }
    
    const demoEmail = 'studio@yogaswiss.ch';
    const demoPassword = 'password';
    const forceRecreate = c.req.header('X-Force-Recreate') === 'true';
    
    console.log('Starting demo account creation process...');
    
    // Check if demo account already exists - using different approach since getUserByEmail might not be available
    console.log('Checking for existing demo account...');
    let existingUser = null;
    
    // Try to sign in to check if user exists instead of using admin.getUserByEmail
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      });
      
      if (signInData?.user && !signInError) {
        existingUser = { user: signInData.user };
        console.log('Demo account already exists (verified by sign-in)');
        // Sign out immediately since we were just checking
        await supabase.auth.signOut();
      }
    } catch (checkError) {
      console.log('User does not exist or sign-in failed (this is expected for new demo account)');
    }
    
    if (existingUser?.user && !forceRecreate) {
      console.log('Demo account already exists, returning existing user');
      return c.json({ message: 'Demo account already exists', user: existingUser.user });
    }
    
    // If forcing recreate and user exists, we'll skip for now since admin.deleteUser isn't available
    if (existingUser?.user && forceRecreate) {
      console.log('Force recreate requested but admin.deleteUser not available - proceeding with existing user');
      return c.json({ message: 'Demo account already exists', user: existingUser.user });
    }
    
    if (existingUser?.user && !forceRecreate) {
      console.log('Demo account already exists, returning existing user');
      return c.json({ message: 'Demo account already exists', user: existingUser.user });
    }
    
    // Create demo studio account using signup
    console.log('Creating demo studio account with credentials:', { email: demoEmail, password: demoPassword });
    const { data, error } = await supabase.auth.signUp({
      email: demoEmail,
      password: demoPassword,
      options: {
        data: {
          firstName: 'Demo',
          lastName: 'Studio',
          role: 'owner',
          language: 'en',
          orgName: 'YogaZen Zürich',
          orgSlug: 'yogazen-zurich'
        }
      }
    });

    if (error) {
      console.log(`Error creating demo account: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    
    console.log('Demo account created successfully:', data.user?.email);

    // Create demo organization
    if (data.user) {
      console.log('Creating demo organization for user:', data.user.id);
      const orgId = 'org-demo-1';
      const org: Org = {
        id: orgId,
        type: 'studio',
        parent_org_id: null,
        name: 'YogaZen Zürich',
        slug: 'yogazen-zurich',
        currency: 'CHF',
        timezone: 'Europe/Zurich',
        settings: {
          languages: ['de', 'en'],
          default_language: 'de',
          vat_rate: 7.7,
          booking_window_days: 30,
          twint_enabled: true,
          qr_bill_enabled: true,
          stripe_enabled: false
        },
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      try {
        console.log('Saving organization to KV store...');
        await kv.set(`org:${orgId}`, org);
        await kv.set(`org_slug:yogazen-zurich`, orgId);

        // Add user as owner
        const orgUser: OrgUser = {
          org_id: orgId,
          user_id: data.user.id,
          role: 'owner',
          location_scope: [],
          permissions: ROLE_PERMISSIONS.owner,
          status: 'active',
          joined_at: new Date().toISOString()
        };

        console.log('Saving org user relationship...');
        await kv.set(`org_user:${orgId}:${data.user.id}`, orgUser);
        await kv.set(`org_user_index:${data.user.id}:${orgId}`, true);
        
        console.log('Demo organization setup completed successfully');
      } catch (kvError) {
        console.error('Error setting up demo organization in KV store:', kvError);
        // Don't fail the whole process for KV errors, just log them
      }
    }

    return c.json({ message: 'Demo account created successfully', user: data.user });
  } catch (error) {
    console.error('Caught error in demo account creation:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    return c.json({ 
      error: 'Failed to create demo account: ' + (error?.message || error?.toString() || 'Unknown error'),
      details: {
        name: error?.name,
        message: error?.message,
        type: typeof error
      }
    }, 500);
  }
});

// Authentication endpoints
app.post("/make-server-f0b2daa4/auth/signup", async (c) => {
  try {
    const { email, password, firstName, lastName, language = 'en' } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        firstName, 
        lastName, 
        language,
        role: 'customer',
        onboarding_completed: false 
      },
      email_confirm: true, // Auto-confirm since email server hasn't been configured
    });

    if (error) {
      console.log(`Authentication error during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store additional customer profile in KV store
    if (data.user) {
      await kv.set(`customer_profile:${data.user.id}`, {
        id: data.user.id,
        email,
        firstName,
        lastName,
        language,
        membershipType: 'trial',
        creditsBalance: 3, // Welcome credits
        upcomingBookings: 0,
        totalClasses: 0,
        favoriteStudios: [],
        favoriteInstructors: [],
        preferences: {
          yogaStyles: [],
          difficulty: 'all',
          location: 'zurich',
          notifications: {
            email: true,
            sms: false,
            push: true
          }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Server error during signup: ${error}`);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

app.post("/make-server-f0b2daa4/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Authentication error during signin: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      user: data.user, 
      session: data.session,
      access_token: data.session?.access_token 
    });
  } catch (error) {
    console.log(`Server error during signin: ${error}`);
    return c.json({ error: 'Internal server error during signin' }, 500);
  }
});

// Customer profile endpoints
app.get("/make-server-f0b2daa4/customer/profile", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`customer_profile:${user.id}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.log(`Error fetching customer profile: ${error}`);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

app.put("/make-server-f0b2daa4/customer/profile", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();
    const currentProfile = await kv.get(`customer_profile:${user.id}`);
    
    if (!currentProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`customer_profile:${user.id}`, updatedProfile);
    
    return c.json({ profile: updatedProfile });
  } catch (error) {
    console.log(`Error updating customer profile: ${error}`);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Classes and schedule endpoints
app.get("/make-server-f0b2daa4/classes/search", async (c) => {
  try {
    const url = new URL(c.req.url);
    const query = url.searchParams.get('q') || '';
    const location = url.searchParams.get('location') || 'zurich';
    const style = url.searchParams.get('style') || '';
    const level = url.searchParams.get('level') || '';
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    // For demo purposes, return mock data filtered by search parameters
    const mockClasses = [
      {
        id: '1',
        name: 'Vinyasa Flow',
        instructor: 'Sarah Miller',
        studio: 'Flow Studio Zürich',
        studioId: 'studio_1',
        time: '18:30',
        date: date,
        duration: 75,
        level: 'All Levels',
        price: 32,
        spotsLeft: 5,
        totalSpots: 20,
        style: 'Vinyasa',
        description: 'Dynamic flowing sequences linking breath and movement',
        location: 'zurich',
        isOnline: false,
        image: 'https://images.unsplash.com/photo-1602827114685-efbb2717da9f'
      },
      {
        id: '2',
        name: 'Yin Yoga & Meditation',
        instructor: 'Marc Dubois',
        studio: 'Zen Space Geneva',
        studioId: 'studio_2',
        time: '19:00',
        date: date,
        duration: 90,
        level: 'Beginner',
        price: 28,
        spotsLeft: 12,
        totalSpots: 15,
        style: 'Yin',
        description: 'Slow-paced practice with longer holds and deep relaxation',
        location: 'geneva',
        isOnline: false,
        image: 'https://images.unsplash.com/photo-1529693662653-9d480530a697'
      },
      {
        id: '3',
        name: 'Hot Yoga Power',
        instructor: 'Lisa Chen',
        studio: 'Heat Yoga Basel',
        studioId: 'studio_3',
        time: '19:30',
        date: date,
        duration: 60,
        level: 'Intermediate',
        price: 35,
        spotsLeft: 3,
        totalSpots: 12,
        style: 'Hot',
        description: 'Intense practice in a heated room for strength and flexibility',
        location: 'basel',
        isOnline: false,
        image: 'https://images.unsplash.com/photo-1570050785774-7288f3039ba6'
      }
    ];

    // Filter classes based on search parameters
    let filteredClasses = mockClasses;

    if (query) {
      filteredClasses = filteredClasses.filter(cls => 
        cls.name.toLowerCase().includes(query.toLowerCase()) ||
        cls.instructor.toLowerCase().includes(query.toLowerCase()) ||
        cls.studio.toLowerCase().includes(query.toLowerCase()) ||
        cls.style.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (location && location !== 'all') {
      filteredClasses = filteredClasses.filter(cls => cls.location === location);
    }

    if (style) {
      filteredClasses = filteredClasses.filter(cls => cls.style.toLowerCase() === style.toLowerCase());
    }

    if (level && level !== 'all') {
      filteredClasses = filteredClasses.filter(cls => cls.level.toLowerCase().includes(level.toLowerCase()));
    }

    return c.json({ classes: filteredClasses });
  } catch (error) {
    console.log(`Error searching classes: ${error}`);
    return c.json({ error: 'Failed to search classes' }, 500);
  }
});

// Studios endpoints
app.get("/make-server-f0b2daa4/studios", async (c) => {
  try {
    const url = new URL(c.req.url);
    const location = url.searchParams.get('location') || 'all';

    const mockStudios = [
      {
        id: 'studio_1',
        name: 'Flow Studio Zürich',
        location: 'zurich',
        address: 'Bahnhofstrasse 25, 8001 Zürich',
        rating: 4.9,
        reviews: 1250,
        distance: '0.8 km',
        nextClass: 'Vinyasa Flow in 2h',
        specialties: ['Vinyasa', 'Yin', 'Hot Yoga'],
        amenities: ['Showers', 'Lockers', 'Mat Rental', 'Parking'],
        priceRange: '25-45 CHF',
        image: 'https://images.unsplash.com/photo-1602827114685-efbb2717da9f',
        description: 'Modern studio in the heart of Zürich offering diverse yoga styles',
        languages: ['DE', 'EN'],
        paymentMethods: ['TWINT', 'Credit Card', 'Cash']
      },
      {
        id: 'studio_2',
        name: 'Zen Space Geneva',
        location: 'geneva',
        address: 'Rue du Rhône 45, 1204 Geneva',
        rating: 4.8,
        reviews: 890,
        distance: '1.2 km',
        nextClass: 'Meditation in 45min',
        specialties: ['Yin', 'Meditation', 'Prenatal'],
        amenities: ['Meditation Room', 'Tea Corner', 'Workshops'],
        priceRange: '20-40 CHF',
        image: 'https://images.unsplash.com/photo-1529693662653-9d480530a697',
        description: 'Peaceful retreat space focused on mindfulness and gentle practice',
        languages: ['FR', 'EN'],
        paymentMethods: ['TWINT', 'Credit Card']
      },
      {
        id: 'studio_3',
        name: 'Mountain Yoga Basel',
        location: 'basel',
        address: 'Steinenvorstadt 15, 4051 Basel',
        rating: 4.7,
        reviews: 650,
        distance: '2.1 km',
        nextClass: 'Power Yoga in 3h',
        specialties: ['Power', 'Ashtanga', 'Aerial'],
        amenities: ['Hot Room', 'Aerial Equipment', 'Protein Bar'],
        priceRange: '30-50 CHF',
        image: 'https://images.unsplash.com/photo-1570050785774-7288f3039ba6',
        description: 'Dynamic studio offering challenging practices with mountain views',
        languages: ['DE', 'EN', 'FR'],
        paymentMethods: ['TWINT', 'Credit Card', 'Apple Pay']
      }
    ];

    let filteredStudios = mockStudios;
    if (location && location !== 'all') {
      filteredStudios = filteredStudios.filter(studio => studio.location === location);
    }

    return c.json({ studios: filteredStudios });
  } catch (error) {
    console.log(`Error fetching studios: ${error}`);
    return c.json({ error: 'Failed to fetch studios' }, 500);
  }
});

// Instructors endpoints
app.get("/make-server-f0b2daa4/instructors", async (c) => {
  try {
    const url = new URL(c.req.url);
    const location = url.searchParams.get('location') || 'all';
    const specialty = url.searchParams.get('specialty') || '';

    const mockInstructors = [
      {
        id: 'instructor_1',
        name: 'Sarah Miller',
        specialties: ['Vinyasa', 'Power Yoga'],
        languages: ['English', 'German'],
        location: 'zurich',
        rating: 4.9,
        students: 450,
        nextClass: 'Today 18:30',
        bio: 'RYT-500 certified with 8 years of teaching experience',
        experience: '8 years',
        certifications: ['RYT-500', 'Yin Yoga', 'Meditation'],
        image: 'https://images.unsplash.com/photo-1529693662653-9d480530a697',
        studios: ['Flow Studio Zürich'],
        hourlyRate: '80-120 CHF',
        availability: ['Monday', 'Wednesday', 'Friday']
      },
      {
        id: 'instructor_2',
        name: 'Marc Dubois',
        specialties: ['Yin', 'Meditation'],
        languages: ['French', 'English'],
        location: 'geneva',
        rating: 4.8,
        students: 320,
        nextClass: 'Tomorrow 19:00',
        bio: 'Mindfulness teacher and former athlete',
        experience: '6 years',
        certifications: ['RYT-300', 'Mindfulness', 'Trauma Informed'],
        image: 'https://images.unsplash.com/photo-1529693662653-9d480530a697',
        studios: ['Zen Space Geneva'],
        hourlyRate: '70-100 CHF',
        availability: ['Tuesday', 'Thursday', 'Saturday']
      }
    ];

    let filteredInstructors = mockInstructors;
    if (location && location !== 'all') {
      filteredInstructors = filteredInstructors.filter(instructor => instructor.location === location);
    }
    if (specialty) {
      filteredInstructors = filteredInstructors.filter(instructor => 
        instructor.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
      );
    }

    return c.json({ instructors: filteredInstructors });
  } catch (error) {
    console.log(`Error fetching instructors: ${error}`);
    return c.json({ error: 'Failed to fetch instructors' }, 500);
  }
});

// Booking endpoints
app.post("/make-server-f0b2daa4/bookings", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const { classId, paymentMethod = 'credits' } = await c.req.json();
    
    // Get customer profile to check credits
    const profile = await kv.get(`customer_profile:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Customer profile not found' }, 404);
    }

    // For demo purposes, assume booking costs 1 credit or the class price
    if (paymentMethod === 'credits') {
      if (profile.creditsBalance < 1) {
        return c.json({ error: 'Insufficient credits' }, 400);
      }
      
      // Deduct credit and update bookings
      const updatedProfile = {
        ...profile,
        creditsBalance: profile.creditsBalance - 1,
        upcomingBookings: profile.upcomingBookings + 1,
        totalClasses: profile.totalClasses + 1,
        updatedAt: new Date().toISOString()
      };

      await kv.set(`customer_profile:${user.id}`, updatedProfile);
    }

    // Create booking record
    const booking = {
      id: `booking_${Date.now()}`,
      userId: user.id,
      classId,
      status: 'confirmed',
      paymentMethod,
      bookedAt: new Date().toISOString(),
      price: paymentMethod === 'credits' ? 0 : 32 // Mock price
    };

    await kv.set(`booking:${booking.id}`, booking);

    return c.json({ booking, message: 'Booking confirmed successfully' });
  } catch (error) {
    console.log(`Error creating booking: ${error}`);
    return c.json({ error: 'Failed to create booking' }, 500);
  }
});

// Swiss payment integration endpoints
app.post("/make-server-f0b2daa4/payments/twint", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const { amount, currency = 'CHF', reference } = await c.req.json();

    // Mock TWINT payment processing
    const payment = {
      id: `twint_${Date.now()}`,
      amount,
      currency,
      reference,
      status: 'pending',
      qrCode: `twint://payment?amount=${amount}&currency=${currency}&ref=${reference}`,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      createdAt: new Date().toISOString()
    };

    await kv.set(`payment:${payment.id}`, payment);

    return c.json({ 
      payment,
      message: 'TWINT payment initiated. Scan QR code to complete payment.' 
    });
  } catch (error) {
    console.log(`Error processing TWINT payment: ${error}`);
    return c.json({ error: 'Failed to process TWINT payment' }, 500);
  }
});

// Swiss QR-Bill generation endpoint
app.post("/make-server-f0b2daa4/billing/qr-bill", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const { amount, reference, description } = await c.req.json();

    // Mock QR-Bill generation (in production, use Swiss QR-Bill library)
    const qrBill = {
      id: `qrbill_${Date.now()}`,
      amount,
      currency: 'CHF',
      reference,
      description,
      creditor: {
        name: 'YogaSwiss GmbH',
        address: 'Bahnhofstrasse 1',
        postalCode: '8001',
        city: 'Zürich',
        country: 'CH'
      },
      iban: 'CH93 0076 2011 6238 5295 7', // Mock IBAN
      qrCodeData: `SPC\n0200\n1\n${amount}\nCHF\n...\n`, // Simplified QR code data
      paymentSlip: `data:application/pdf;base64,mock_pdf_data`,
      createdAt: new Date().toISOString()
    };

    await kv.set(`qrbill:${qrBill.id}`, qrBill);

    return c.json({ 
      qrBill,
      message: 'QR-Bill generated successfully' 
    });
  } catch (error) {
    console.log(`Error generating QR-Bill: ${error}`);
    return c.json({ error: 'Failed to generate QR-Bill' }, 500);
  }
});

// Organization routes are handled by the mounted organizationsRouter

// ============================================================================
// WALLET MANAGEMENT ENDPOINTS
// ============================================================================

// Get customer wallets for an organization
app.get("/make-server-f0b2daa4/orgs/:orgId/wallets", async (c) => {
  try {
    const orgId = c.req.param('orgId');
    const { user, orgUser, error: authError } = await verifyAuth(c.req.raw, orgId);
    
    if (!user || !orgUser) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    if (!hasPermission(orgUser, 'finance')) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const url = new URL(c.req.url);
    const customerId = url.searchParams.get('customer_id');
    const kind = url.searchParams.get('kind') || 'customer';

    if (customerId) {
      // Get specific customer's wallet
      const wallet = await kv.get(`wallet:${orgId}:${customerId}:${kind}`);
      return c.json({ wallet });
    } else {
      // Get all wallets for the organization
      const wallets = await kv.getByPrefix(`wallet:${orgId}:`);
      return c.json({ wallets });
    }
  } catch (error) {
    console.log(`Error fetching wallets: ${error}`);
    return c.json({ error: 'Failed to fetch wallets' }, 500);
  }
});

// Create or get customer wallet
app.post("/make-server-f0b2daa4/orgs/:orgId/wallets", async (c) => {
  try {
    const orgId = c.req.param('orgId');
    const { user, orgUser, error: authError } = await verifyAuth(c.req.raw, orgId);
    
    if (!user || !orgUser) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const { customer_id, kind = 'customer', initial_balance_cents = 0, initial_credits = 0 } = await c.req.json();

    if (!customer_id) {
      return c.json({ error: 'customer_id is required' }, 400);
    }

    const walletKey = `wallet:${orgId}:${customer_id}:${kind}`;
    
    // Check if wallet already exists
    let wallet = await kv.get(walletKey);
    
    if (!wallet) {
      const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      wallet = {
        id: walletId,
        org_id: orgId,
        owner_type: 'studio', // Default to studio-owned
        user_id: customer_id,
        kind,
        currency: 'CHF',
        balance_cents: initial_balance_cents,
        credits: initial_credits,
        status: 'active',
        metadata: {
          created_by: user.id,
          notes: ''
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await kv.set(walletKey, wallet);
      await kv.set(`wallet_id:${walletId}`, walletKey);

      // Create initial ledger entries if there's an initial balance
      if (initial_balance_cents > 0 || initial_credits > 0) {
        const ledgerEntry: WalletLedger = {
          id: `ledger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          wallet_id: walletId,
          timestamp: new Date().toISOString(),
          entry_type: 'credit',
          amount_cents: initial_balance_cents,
          credits_delta: initial_credits,
          reason: 'initial_balance',
          metadata: {
            description: 'Initial wallet creation',
            initiated_by: user.id
          }
        };

        await kv.set(`ledger:${walletId}:${ledgerEntry.id}`, ledgerEntry);
      }
    }

    return c.json({ wallet, message: 'Wallet ready' });
  } catch (error) {
    console.log(`Error creating wallet: ${error}`);
    return c.json({ error: 'Failed to create wallet' }, 500);
  }
});

// Add funds or credits to wallet
app.post("/make-server-f0b2daa4/orgs/:orgId/wallets/:walletId/add", async (c) => {
  try {
    const orgId = c.req.param('orgId');
    const walletId = c.req.param('walletId');
    const { user, orgUser, error: authError } = await verifyAuth(c.req.raw, orgId);
    
    if (!user || !orgUser) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    if (!hasPermission(orgUser, 'wallet_management')) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const { amount_cents = 0, credits = 0, reason, description } = await c.req.json();

    if (amount_cents <= 0 && credits <= 0) {
      return c.json({ error: 'Must add positive amount or credits' }, 400);
    }

    // Get wallet
    const walletKey = await kv.get(`wallet_id:${walletId}`);
    if (!walletKey) {
      return c.json({ error: 'Wallet not found' }, 404);
    }

    const wallet = await kv.get(walletKey);
    if (!wallet || wallet.org_id !== orgId) {
      return c.json({ error: 'Wallet not found in this organization' }, 404);
    }

    // Update wallet balance
    const updatedWallet = {
      ...wallet,
      balance_cents: wallet.balance_cents + amount_cents,
      credits: wallet.credits + credits,
      updated_at: new Date().toISOString()
    };

    await kv.set(walletKey, updatedWallet);

    // Create ledger entry
    const ledgerEntry: WalletLedger = {
      id: `ledger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      wallet_id: walletId,
      timestamp: new Date().toISOString(),
      entry_type: 'credit',
      amount_cents,
      credits_delta: credits,
      reason: reason || 'manual_adjustment',
      metadata: {
        description: description || 'Manual wallet adjustment',
        initiated_by: user.id
      }
    };

    await kv.set(`ledger:${walletId}:${ledgerEntry.id}`, ledgerEntry);

    return c.json({ 
      wallet: updatedWallet, 
      ledger_entry: ledgerEntry,
      message: `Added ${formatCHF(amount_cents)} and ${credits} credits to wallet` 
    });
  } catch (error) {
    console.log(`Error adding to wallet: ${error}`);
    return c.json({ error: 'Failed to add to wallet' }, 500);
  }
});

// Get wallet transaction history
app.get("/make-server-f0b2daa4/orgs/:orgId/wallets/:walletId/history", async (c) => {
  try {
    const orgId = c.req.param('orgId');
    const walletId = c.req.param('walletId');
    const { user, orgUser, error: authError } = await verifyAuth(c.req.raw, orgId);
    
    if (!user || !orgUser) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    // Get ledger entries for this wallet
    const ledgerEntries = await kv.getByPrefix(`ledger:${walletId}:`);
    
    // Sort by timestamp descending
    const sortedEntries = ledgerEntries.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return c.json({ history: sortedEntries });
  } catch (error) {
    console.log(`Error fetching wallet history: ${error}`);
    return c.json({ error: 'Failed to fetch wallet history' }, 500);
  }
});

// ============================================================================
// SWISS PAYMENT ENDPOINTS
// ============================================================================

// Configure Swiss payment settings
app.post("/make-server-f0b2daa4/orgs/:orgId/payment-settings", async (c) => {
  try {
    const orgId = c.req.param('orgId');
    const { user, orgUser, error: authError } = await verifyAuth(c.req.raw, orgId);
    
    if (!user || !orgUser) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    if (!hasPermission(orgUser, 'settings')) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const settings = await c.req.json();

    const paymentSettings: SwissPaymentSettings = {
      org_id: orgId,
      twint_enabled: settings.twint_enabled || false,
      twint_provider: settings.twint_provider || 'datatrans',
      twint_merchant_id: settings.twint_merchant_id,
      twint_api_key: settings.twint_api_key,
      qr_bill_enabled: settings.qr_bill_enabled || false,
      creditor_name: settings.creditor_name || '',
      creditor_address: settings.creditor_address || {},
      iban: settings.iban || '',
      qr_iban: settings.qr_iban,
      vat_number: settings.vat_number,
      vat_rate: settings.vat_rate || 7.7,
      tax_inclusive: settings.tax_inclusive !== false, // Default to true
      bank_account: settings.bank_account,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`payment_settings:${orgId}`, paymentSettings);

    return c.json({ settings: paymentSettings, message: 'Payment settings updated' });
  } catch (error) {
    console.log(`Error updating payment settings: ${error}`);
    return c.json({ error: 'Failed to update payment settings' }, 500);
  }
});

// Enhanced TWINT payment processing
app.post("/make-server-f0b2daa4/orgs/:orgId/payments/twint", async (c) => {
  try {
    const orgId = c.req.param('orgId');
    const { user, orgUser, error: authError } = await verifyAuth(c.req.raw, orgId);
    
    if (!user || !orgUser) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const { amount_cents, reference, order_id, description } = await c.req.json();

    // Get payment settings
    const paymentSettings = await kv.get(`payment_settings:${orgId}`);
    if (!paymentSettings?.twint_enabled) {
      return c.json({ error: 'TWINT payments not enabled for this organization' }, 400);
    }

    // Create payment record
    const payment: Payment = {
      id: `twint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order_id,
      amount_cents,
      currency: 'CHF',
      method: 'twint',
      provider: paymentSettings.twint_provider,
      provider_transaction_id: `twint_${Date.now()}`,
      status: 'pending',
      metadata: {
        twint_qr_code: `twint://payment?amount=${amount_cents/100}&currency=CHF&ref=${reference}`,
        description
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`payment:${payment.id}`, payment);
    await kv.set(`payment_order:${order_id}`, payment.id);

    return c.json({ 
      payment,
      qr_code: payment.metadata.twint_qr_code,
      message: 'TWINT payment initiated. Customer can scan QR code to pay.' 
    });
  } catch (error) {
    console.log(`Error processing TWINT payment: ${error}`);
    return c.json({ error: 'Failed to process TWINT payment' }, 500);
  }
});

// Enhanced QR-Bill generation
app.post("/make-server-f0b2daa4/orgs/:orgId/payments/qr-bill", async (c) => {
  try {
    const orgId = c.req.param('orgId');
    const { user, orgUser, error: authError } = await verifyAuth(c.req.raw, orgId);
    
    if (!user || !orgUser) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const { amount_cents, reference, order_id, debtor_info } = await c.req.json();

    // Get payment settings
    const paymentSettings = await kv.get(`payment_settings:${orgId}`);
    if (!paymentSettings?.qr_bill_enabled) {
      return c.json({ error: 'QR-Bill payments not enabled for this organization' }, 400);
    }

    // Generate Swiss QR-Bill reference number (simplified)
    const qrReference = `${orgId.slice(-6)}${Date.now().toString().slice(-10)}${String(amount_cents).padStart(8, '0')}`;

    // Create QR-Bill payment record
    const payment: Payment = {
      id: `qrbill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order_id,
      amount_cents,
      currency: 'CHF',
      method: 'qr_bill',
      provider: 'swiss_qr_bill',
      provider_transaction_id: qrReference,
      status: 'pending',
      metadata: {
        qr_bill_reference: qrReference,
        creditor: paymentSettings.creditor_name,
        iban: paymentSettings.iban,
        debtor_info
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`payment:${payment.id}`, payment);
    await kv.set(`payment_order:${order_id}`, payment.id);

    // In production, generate actual QR-Bill PDF here
    const qrBillData = {
      creditor: {
        name: paymentSettings.creditor_name,
        address: paymentSettings.creditor_address,
        iban: paymentSettings.iban
      },
      amount: amount_cents / 100,
      currency: 'CHF',
      reference: qrReference,
      debtor: debtor_info,
      qr_code_data: `SPC\n0200\n1\n${paymentSettings.iban}\nK\n${paymentSettings.creditor_name}\n${paymentSettings.creditor_address.street}\n${paymentSettings.creditor_address.postal_code} ${paymentSettings.creditor_address.city}\n\n\nCH\n\n\n\n\n\n\n\n${amount_cents/100}\nCHF\n\n\n\n\n\n\n\nQRR\n${qrReference}\n\n\nEPD`
    };

    return c.json({ 
      payment,
      qr_bill: qrBillData,
      message: 'QR-Bill generated successfully' 
    });
  } catch (error) {
    console.log(`Error generating QR-Bill: ${error}`);
    return c.json({ error: 'Failed to generate QR-Bill' }, 500);
  }
});

// Important: Do not call Deno.serve here. The function entry file is responsible
// for starting the server to avoid double-serve in multi-function setups.
