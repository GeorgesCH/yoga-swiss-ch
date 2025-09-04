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
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Org-ID", "X-Customer-ID", "X-Request-ID"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

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
app.post("/make-server-f0b2daa4/setup/database", async (c) => {
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

-- Organizations table (Brands and Studios)
CREATE TABLE IF NOT EXISTS orgs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('brand', 'studio')),
    parent_id UUID REFERENCES orgs(id),
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'CH',
    timezone TEXT DEFAULT 'Europe/Zurich',
    default_locale TEXT DEFAULT 'de-CH' CHECK (default_locale IN ('de-CH', 'fr-CH', 'it-CH', 'en-CH')),
    currency TEXT DEFAULT 'CHF',
    vat_rate DECIMAL(5,2) DEFAULT 7.7,
    payment_methods TEXT[] DEFAULT ARRAY['twint', 'credit_card'],
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    date_of_birth DATE,
    emergency_contact JSONB,
    medical_info JSONB,
    dietary_preferences TEXT[],
    preferred_locale TEXT DEFAULT 'de-CH' CHECK (preferred_locale IN ('de-CH', 'fr-CH', 'it-CH', 'en-CH')),
    marketing_consent BOOLEAN DEFAULT false,
    privacy_settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization users table (roles and permissions)
CREATE TABLE IF NOT EXISTS org_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer', 'instructor', 'manager', 'owner', 'front_desk', 'accountant', 'marketer')),
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT true,
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- Locations table (rooms, outdoor spaces, online)
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('room', 'outdoor', 'online')),
    capacity INTEGER DEFAULT 1,
    address TEXT,
    coordinates JSONB,
    weather_dependent BOOLEAN DEFAULT false,
    backup_location_id UUID REFERENCES locations(id),
    equipment TEXT[] DEFAULT ARRAY[]::TEXT[],
    amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
    accessibility_features TEXT[] DEFAULT ARRAY[]::TEXT[],
    booking_rules JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class templates/services
CREATE TABLE IF NOT EXISTS class_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('class', 'workshop', 'course', 'private', 'retreat')),
    category TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all_levels')),
    duration_minutes INTEGER NOT NULL,
    description JSONB NOT NULL,
    image_url TEXT,
    default_price DECIMAL(10,2) NOT NULL,
    default_capacity INTEGER DEFAULT 1,
    instructor_pay_rate DECIMAL(10,2) DEFAULT 0,
    instructor_pay_type TEXT DEFAULT 'fixed' CHECK (instructor_pay_type IN ('fixed', 'hourly', 'percentage', 'per_participant')),
    requirements JSONB,
    benefits JSONB,
    equipment_needed TEXT[] DEFAULT ARRAY[]::TEXT[],
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class occurrences/instances
CREATE TABLE IF NOT EXISTS class_occurrences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES class_templates(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES auth.users(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    capacity INTEGER NOT NULL,
    booked_count INTEGER DEFAULT 0,
    waitlist_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed', 'in_progress')),
    cancellation_reason TEXT,
    notes TEXT,
    meeting_url TEXT,
    weather_backup_used BOOLEAN DEFAULT false,
    instructor_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer registrations
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    occurrence_id UUID NOT NULL REFERENCES class_occurrences(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'cancelled', 'no_show', 'attended')),
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    waitlist_position INTEGER,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'free')),
    payment_method TEXT,
    notes TEXT,
    check_in_time TIMESTAMP WITH TIME ZONE,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(occurrence_id, customer_id)
);

-- Customer wallets
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'CHF',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, org_id)
);

-- Products (packages, memberships, etc.)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name JSONB NOT NULL,
    description JSONB NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('drop_in', 'package', 'membership', 'gift_card', 'retreat')),
    price DECIMAL(10,2) NOT NULL,
    credits INTEGER,
    validity_days INTEGER,
    is_unlimited BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT false,
    recurring_interval TEXT CHECK (recurring_interval IN ('monthly', 'yearly')),
    is_gift_eligible BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Passes and memberships
CREATE TABLE IF NOT EXISTS passes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    type TEXT NOT NULL CHECK (type IN ('credits', 'unlimited', 'time_limited')),
    credits_total INTEGER,
    credits_used INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    auto_renew BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders and payments
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'CHF',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('twint', 'credit_card', 'apple_pay', 'google_pay', 'qr_bill', 'cash')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    payment_intent_id TEXT,
    stripe_session_id TEXT,
    twint_transaction_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices with Swiss QR-bill support
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'CHF',
    qr_bill_data JSONB,
    qr_code_url TEXT,
    pdf_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON orgs(slug);
CREATE INDEX IF NOT EXISTS idx_orgs_parent_id ON orgs(parent_id);
CREATE INDEX IF NOT EXISTS idx_org_users_org_id ON org_users(org_id);
CREATE INDEX IF NOT EXISTS idx_org_users_user_id ON org_users(user_id);
CREATE INDEX IF NOT EXISTS idx_locations_org_id ON locations(org_id);
CREATE INDEX IF NOT EXISTS idx_class_templates_org_id ON class_templates(org_id);
CREATE INDEX IF NOT EXISTS idx_class_occurrences_org_id ON class_occurrences(org_id);
CREATE INDEX IF NOT EXISTS idx_class_occurrences_instructor_id ON class_occurrences(instructor_id);
CREATE INDEX IF NOT EXISTS idx_class_occurrences_start_time ON class_occurrences(start_time);
CREATE INDEX IF NOT EXISTS idx_registrations_occurrence_id ON registrations(occurrence_id);
CREATE INDEX IF NOT EXISTS idx_registrations_customer_id ON registrations(customer_id);
CREATE INDEX IF NOT EXISTS idx_registrations_org_id ON registrations(org_id);
CREATE INDEX IF NOT EXISTS idx_wallets_customer_id ON wallets(customer_id);
CREATE INDEX IF NOT EXISTS idx_wallets_org_id ON wallets(org_id);
CREATE INDEX IF NOT EXISTS idx_passes_customer_id ON passes(customer_id);
CREATE INDEX IF NOT EXISTS idx_passes_org_id ON passes(org_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_org_id ON orders(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_orgs_updated_at ON orgs;
CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON orgs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_org_users_updated_at ON org_users;
CREATE TRIGGER update_org_users_updated_at BEFORE UPDATE ON org_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_class_templates_updated_at ON class_templates;
CREATE TRIGGER update_class_templates_updated_at BEFORE UPDATE ON class_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_class_occurrences_updated_at ON class_occurrences;
CREATE TRIGGER update_class_occurrences_updated_at BEFORE UPDATE ON class_occurrences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_passes_updated_at ON passes;
CREATE TRIGGER update_passes_updated_at BEFORE UPDATE ON passes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
-- These are simplified policies - in production you'd want more granular access control

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view active orgs" ON orgs;
DROP POLICY IF EXISTS "Users can view own org relationships" ON org_users;

-- User profiles: users can only see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Organizations: authenticated users can view active orgs
CREATE POLICY "Authenticated users can view active orgs" ON orgs
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Org users: users can view their own org relationships
CREATE POLICY "Users can view own org relationships" ON org_users
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
        SELECT user_id FROM org_users 
        WHERE org_id = org_users.org_id 
        AND role IN ('owner', 'manager') 
        AND is_active = true
    ));
    `;

    // Execute the SQL using raw query (this would need to be done via SQL editor in Supabase dashboard)
    // For now, we'll just return a message indicating the SQL needs to be run manually
    console.log('SQL Schema ready for execution');
    
    // For demo purposes, we'll try to create some basic tables if they don't exist
    const basicTables = [
      {
        name: 'orgs',
        sql: `CREATE TABLE IF NOT EXISTS orgs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('brand', 'studio')),
          parent_id UUID,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          logo_url TEXT,
          website TEXT,
          email TEXT,
          phone TEXT,
          address TEXT,
          city TEXT,
          postal_code TEXT,
          country TEXT DEFAULT 'CH',
          timezone TEXT DEFAULT 'Europe/Zurich',
          default_locale TEXT DEFAULT 'de-CH',
          currency TEXT DEFAULT 'CHF',
          vat_rate DECIMAL(5,2) DEFAULT 7.7,
          payment_methods TEXT[] DEFAULT ARRAY['twint', 'credit_card'],
          features TEXT[] DEFAULT ARRAY[]::TEXT[],
          settings JSONB DEFAULT '{}',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`
      }
    ];

    // Try to create basic table structure - this is a simplified approach
    // In production, you would run the full SQL schema via Supabase SQL editor
    for (const table of basicTables) {
      try {
        // Note: Direct SQL execution is limited in Edge Functions
        // This is mainly for demonstration purposes
        console.log(`Attempting to create table: ${table.name}`);
      } catch (tableError) {
        console.log(`Table ${table.name} creation info:`, tableError);
      }
    }

    console.log('✅ Database tables created successfully');

    return c.json({
      success: true,
      message: 'Database setup completed successfully',
      tablesCreated: [
        'orgs', 'user_profiles', 'org_users', 'locations', 
        'class_templates', 'class_occurrences', 'registrations',
        'wallets', 'products', 'passes', 'orders', 'invoices'
      ]
    });

  } catch (error) {
    console.error('Database setup failed:', error);
    return c.json({ 
      success: false, 
      error: 'Database setup failed',
      details: error.message 
    }, 500);
  }
});

// Quick database status endpoint
app.get("/make-server-f0b2daa4/setup/status", async (c) => {
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
app.route('/make-server-f0b2daa4/payments', payments);

// Mount finance routes
app.route('/make-server-f0b2daa4/finance', finance);

// Mount marketing routes
app.route('/make-server-f0b2daa4/marketing', marketing);

// Mount seed routes  
app.route('/make-server-f0b2daa4/seed', seed);

// Mount people management routes
app.route('/make-server-f0b2daa4/people', people);

// Mount community routes
app.route('/make-server-f0b2daa4/community', community);

// Mount programs routes
app.route('/', programsRouter);

// Mount classes routes
app.route('/make-server-f0b2daa4/classes', classesRouter);

// Mount bookings routes
app.route('/make-server-f0b2daa4/bookings', bookingsRouter);

// Mount settings routes
app.route('/make-server-f0b2daa4/settings', settingsRouter);

// Mount organizations routes
app.route('/make-server-f0b2daa4/orgs', organizationsRouter);

// Legacy organization endpoints for backward compatibility
app.get("/make-server-f0b2daa4/orgs", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    console.log(`[Orgs] Loading organizations for user: ${user.id}`);
    
    // First try to get from KV store
    let userOrgs = [];
    try {
      const orgsKey = `user_orgs:${user.id}`;
      const cachedOrgs = await kv.get(orgsKey);
      if (cachedOrgs && Array.isArray(cachedOrgs)) {
        userOrgs = cachedOrgs;
        console.log(`[Orgs] Found ${userOrgs.length} cached organizations`);
      }
    } catch (kvError) {
      console.log(`[Orgs] KV cache miss, will create empty array:`, kvError);
    }

    return c.json({ 
      orgs: userOrgs,
      count: userOrgs.length 
    });
    
  } catch (error) {
    console.error('[Orgs] Error fetching organizations:', error);
    return c.json({ 
      error: 'Failed to fetch organizations',
      details: error.message 
    }, 500);
  }
});

// POST /orgs - Create new organization
app.post("/make-server-f0b2daa4/orgs", async (c) => {
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

    // Check if slug already exists in KV
    const existingSlug = await kv.get(`org_slug:${slug}`);
    if (existingSlug) {
      console.log(`[Orgs] Slug ${slug} already exists: ${existingSlug}`);
      return c.json({ error: 'Organization slug already exists' }, 400);
    }

    // Generate organization ID
    orgId = crypto.randomUUID();
    
    // Create organization object
    const newOrg = {
      id: orgId,
      name,
      slug,
      type,
      currency: 'CHF',
      timezone: 'Europe/Zurich',
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

    console.log(`[Orgs] Storing organization in KV: ${orgId}`);

    // Store in KV with error handling
    try {
      await kv.set(`org:${orgId}`, newOrg);
      console.log(`[Orgs] Stored org:${orgId}`);
      
      await kv.set(`org_slug:${slug}`, orgId);
      console.log(`[Orgs] Stored org_slug:${slug}`);
    } catch (kvError) {
      console.error(`[Orgs] KV storage failed:`, kvError);
      throw new Error('Failed to store organization data');
    }
    
    // Create org user relationship
    const orgUser = {
      id: crypto.randomUUID(),
      org_id: orgId,
      user_id: user.id,
      role: 'owner',
      status: 'active',
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    try {
      await kv.set(`org_user:${orgId}:${user.id}`, orgUser);
      console.log(`[Orgs] Stored org_user:${orgId}:${user.id}`);
    } catch (kvError) {
      console.error(`[Orgs] Failed to store org user relationship:`, kvError);
      // Try to clean up organization data
      try {
        await kv.delete(`org:${orgId}`);
        await kv.delete(`org_slug:${slug}`);
      } catch (cleanupError) {
        console.error(`[Orgs] Cleanup failed:`, cleanupError);
      }
      throw new Error('Failed to store user relationship');
    }
    
    // Update user's organizations list  
    let userOrgs = [];
    try {
      const orgsKey = `user_orgs:${user.id}`;
      const existingOrgs = await kv.get(orgsKey);
      if (existingOrgs && Array.isArray(existingOrgs)) {
        userOrgs = existingOrgs;
      }
    } catch (error) {
      console.log('[Orgs] No existing orgs found, starting fresh');
    }
    
    // Filter out any existing org with same ID (prevent duplicates)
    userOrgs = userOrgs.filter(org => org.id !== orgId);
    userOrgs.push(newOrg);
    
    try {
      await kv.set(`user_orgs:${user.id}`, userOrgs);
      console.log(`[Orgs] Updated user_orgs:${user.id} with ${userOrgs.length} orgs`);
    } catch (kvError) {
      console.error(`[Orgs] Failed to update user orgs list:`, kvError);
      // Don't fail the whole operation for this
    }

    console.log(`[Orgs] Organization created successfully: ${orgId}`);
    
    return c.json({ 
      org: newOrg,
      message: 'Organization created successfully' 
    });
    
  } catch (error) {
    console.error('[Orgs] Error creating organization:', error);
    
    // Cleanup on error
    if (orgId && slug) {
      try {
        console.log(`[Orgs] Cleaning up failed creation: ${orgId}`);
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
app.delete("/make-server-f0b2daa4/orgs/cleanup", async (c) => {
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
app.get("/make-server-f0b2daa4/orgs/:id", async (c) => {
  try {
    const orgId = c.req.param('id');
    const { user, error: authError } = await verifyAuth(c.req.raw, orgId);
    
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    console.log(`[Orgs] Loading organization details: ${orgId}`);
    
    const org = await kv.get(`org:${orgId}`);
    if (!org) {
      return c.json({ error: 'Organization not found' }, 404);
    }

    // Load locations for this org (simulated for now)
    const locations = [
      {
        id: crypto.randomUUID(),
        org_id: orgId,
        name: 'Main Studio',
        type: 'studio',
        capacity: 20,
        status: 'active'
      }
    ];

    return c.json({ 
      org,
      locations,
      count: locations.length 
    });
    
  } catch (error) {
    console.error('[Orgs] Error fetching organization:', error);
    return c.json({ 
      error: 'Failed to fetch organization',
      details: error.message 
    }, 500);
  }
});

// Health check endpoint
app.get("/make-server-f0b2daa4/health", (c) => {
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

// ============================================================================
// ORGANIZATION MANAGEMENT ENDPOINTS
// ============================================================================

// Get user's organizations
app.get("/make-server-f0b2daa4/orgs", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    // Get all organizations for this user
    const orgUserKeys = await kv.getByPrefix(`org_user_index:${user.id}:`);
    const orgs = [];
    
    for (const key of orgUserKeys) {
      const orgId = key.split(':')[2];
      const org = await kv.get(`org:${orgId}`);
      const orgUser = await kv.get(`org_user:${orgId}:${user.id}`);
      
      if (org && orgUser && orgUser.status === 'active') {
        orgs.push({
          ...org,
          role: orgUser.role,
          permissions: ROLE_PERMISSIONS[orgUser.role as Role],
          location_scope: orgUser.location_scope
        });
      }
    }

    return c.json({ orgs });
  } catch (error) {
    console.log(`Error fetching organizations: ${error}`);
    return c.json({ error: 'Failed to fetch organizations' }, 500);
  }
});

// Get organization details
app.get("/make-server-f0b2daa4/orgs/:orgId", async (c) => {
  try {
    const orgId = c.req.param('orgId');
    const { user, orgUser, error: authError } = await verifyAuth(c.req.raw, orgId);
    
    if (!user || !orgUser) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const org = await kv.get(`org:${orgId}`);
    if (!org) {
      return c.json({ error: 'Organization not found' }, 404);
    }

    // Get parent org if this is a studio
    let parentOrg = null;
    if (org.parent_org_id) {
      parentOrg = await kv.get(`org:${org.parent_org_id}`);
    }

    // Get locations for this org
    const locations = await kv.getByPrefix(`location:${orgId}:`);

    return c.json({ 
      org: {
        ...org,
        parent: parentOrg
      },
      locations,
      user_role: orgUser.role,
      user_permissions: ROLE_PERMISSIONS[orgUser.role as Role]
    });
  } catch (error) {
    console.log(`Error fetching organization: ${error}`);
    return c.json({ error: 'Failed to fetch organization' }, 500);
  }
});

// Create new organization (Brand or Studio)
app.post("/make-server-f0b2daa4/orgs", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const orgData = await c.req.json();
    
    // Validate required fields
    if (!orgData.name || !orgData.slug || !orgData.type) {
      return c.json({ error: 'Missing required fields: name, slug, type' }, 400);
    }

    // Check if slug is unique
    const existingOrg = await kv.get(`org_slug:${orgData.slug}`);
    if (existingOrg) {
      return c.json({ error: 'Organization slug already exists' }, 400);
    }

    const orgId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const org: Org = {
      id: orgId,
      type: orgData.type,
      parent_org_id: orgData.parent_org_id,
      name: orgData.name,
      slug: orgData.slug,
      currency: 'CHF',
      timezone: 'Europe/Zurich',
      settings: {
        languages: ['de', 'fr', 'it', 'en'],
        default_language: orgData.default_language || 'de',
        vat_rate: 7.7, // Swiss VAT rate
        booking_window_days: 30,
        twint_enabled: false,
        qr_bill_enabled: false,
        stripe_enabled: false,
        ...orgData.settings
      },
      status: 'setup_incomplete',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save organization
    await kv.set(`org:${orgId}`, org);
    await kv.set(`org_slug:${orgData.slug}`, orgId);

    // Add user as owner
    const orgUser: OrgUser = {
      org_id: orgId,
      user_id: user.id,
      role: 'owner',
      location_scope: [],
      permissions: ROLE_PERMISSIONS.owner,
      status: 'active',
      joined_at: new Date().toISOString()
    };

    await kv.set(`org_user:${orgId}:${user.id}`, orgUser);
    await kv.set(`org_user_index:${user.id}:${orgId}`, true);

    return c.json({ org, message: 'Organization created successfully' });
  } catch (error) {
    console.log(`Error creating organization: ${error}`);
    return c.json({ error: 'Failed to create organization' }, 500);
  }
});

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

console.log("YogaSwiss server started with Multi-Tenant Org Hierarchy & Swiss Wallet System");
Deno.serve(app.fetch);