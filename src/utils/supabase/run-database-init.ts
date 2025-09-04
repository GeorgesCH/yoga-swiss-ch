import { supabase } from './client';
import { createYogaSwissAdminUsers, displayAdminCredentials } from './create-admin-users';

// Database initialization scripts broken into manageable chunks
const SQL_SCRIPTS = [
  // Step 1: Extensions
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   CREATE EXTENSION IF NOT EXISTS "ltree";`,
  
  // Step 2: Custom Types
  `DO $$ 
   BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
       CREATE TYPE user_role AS ENUM (
         'owner', 'studio_manager', 'instructor', 'front_desk',
         'accountant', 'marketer', 'auditor', 'customer'
       );
     END IF;
   END $$;`,
   
  `DO $$ 
   BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'class_status') THEN
       CREATE TYPE class_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled');
     END IF;
   END $$;`,
   
  `DO $$ 
   BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
       CREATE TYPE registration_status AS ENUM ('confirmed', 'waitlist', 'cancelled', 'no_show', 'checked_in');
     END IF;
   END $$;`,
   
  `DO $$ 
   BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
       CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partial_refund');
     END IF;
   END $$;`,
   
  `DO $$ 
   BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
       CREATE TYPE payment_method AS ENUM ('card', 'twint', 'bank_transfer', 'cash', 'wallet', 'invoice');
     END IF;
   END $$;`,
   
  `DO $$ 
   BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
       CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
     END IF;
   END $$;`,
   
  `DO $$ 
   BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wallet_transaction_type') THEN
       CREATE TYPE wallet_transaction_type AS ENUM ('credit', 'debit', 'refund', 'expiry', 'transfer');
     END IF;
   END $$;`,
  
  // Step 3: Core Tables
  `CREATE TABLE IF NOT EXISTS organizations (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     slug TEXT UNIQUE NOT NULL,
     description TEXT,
     settings JSONB DEFAULT '{}',
     subscription_tier TEXT DEFAULT 'starter',
     subscription_status TEXT DEFAULT 'active',
     logo_url TEXT,
     brand_colors JSONB DEFAULT '{}',
     locale TEXT DEFAULT 'de-CH',
     timezone TEXT DEFAULT 'Europe/Zurich',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );`,
  
  `CREATE TABLE IF NOT EXISTS profiles (
     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     email TEXT NOT NULL,
     display_name TEXT,
     first_name TEXT,
     last_name TEXT,
     phone TEXT,
     avatar_url TEXT,
     default_organization_id UUID REFERENCES organizations(id),
     date_of_birth DATE,
     emergency_contact JSONB,
     health_info JSONB,
     preferences JSONB DEFAULT '{}',
     swiss_resident BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );`,
  
  `CREATE TABLE IF NOT EXISTS organization_members (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
     user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
     role user_role NOT NULL DEFAULT 'customer',
     permissions JSONB DEFAULT '{}',
     invited_by UUID REFERENCES profiles(id),
     invited_at TIMESTAMPTZ,
     joined_at TIMESTAMPTZ DEFAULT NOW(),
     is_active BOOLEAN DEFAULT true,
     UNIQUE(organization_id, user_id)
   );`,
  
  `CREATE TABLE IF NOT EXISTS locations (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     type TEXT DEFAULT 'studio',
     address JSONB,
     coordinates POINT,
     capacity INTEGER DEFAULT 20,
     amenities JSONB DEFAULT '[]',
     images TEXT[] DEFAULT '{}',
     weather_dependent BOOLEAN DEFAULT false,
     settings JSONB DEFAULT '{}',
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );`,
  
  `CREATE TABLE IF NOT EXISTS rooms (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     capacity INTEGER NOT NULL DEFAULT 20,
     amenities JSONB DEFAULT '[]',
     equipment TEXT[] DEFAULT '{}',
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );`,
  
  `CREATE TABLE IF NOT EXISTS class_templates (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     description TEXT,
     type TEXT NOT NULL,
     level TEXT DEFAULT 'beginner',
     duration_minutes INTEGER NOT NULL DEFAULT 60,
     capacity INTEGER DEFAULT 20,
     price_cents INTEGER DEFAULT 0,
     instructor_id UUID REFERENCES profiles(id),
     location_id UUID REFERENCES locations(id),
     room_id UUID REFERENCES rooms(id),
     images TEXT[] DEFAULT '{}',
     tags TEXT[] DEFAULT '{}',
     requirements JSONB DEFAULT '{}',
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );`,
  
  `CREATE TABLE IF NOT EXISTS class_instances (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     template_id UUID NOT NULL REFERENCES class_templates(id) ON DELETE CASCADE,
     organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
     name TEXT,
     start_time TIMESTAMPTZ NOT NULL,
     end_time TIMESTAMPTZ NOT NULL,
     instructor_id UUID REFERENCES profiles(id),
     location_id UUID REFERENCES locations(id),
     room_id UUID REFERENCES rooms(id),
     capacity INTEGER,
     price_cents INTEGER,
     status class_status DEFAULT 'scheduled',
     notes TEXT,
     weather_conditions JSONB,
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );`,
  
  `CREATE TABLE IF NOT EXISTS class_registrations (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     class_instance_id UUID NOT NULL REFERENCES class_instances(id) ON DELETE CASCADE,
     customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
     organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
     status registration_status DEFAULT 'confirmed',
     registered_at TIMESTAMPTZ DEFAULT NOW(),
     checked_in_at TIMESTAMPTZ,
     cancelled_at TIMESTAMPTZ,
     cancellation_reason TEXT,
     notes TEXT,
     payment_required BOOLEAN DEFAULT true,
     payment_status payment_status DEFAULT 'pending',
     price_paid_cents INTEGER DEFAULT 0,
     booking_source TEXT DEFAULT 'admin',
     waitlist_position INTEGER,
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(class_instance_id, customer_id)
   );`,
  
  `CREATE TABLE IF NOT EXISTS products (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
     name JSONB NOT NULL,
     description JSONB DEFAULT '{}',
     type TEXT NOT NULL,
     category TEXT,
     sku TEXT,
     price_cents INTEGER NOT NULL DEFAULT 0,
     currency TEXT DEFAULT 'CHF',
     tax_class TEXT DEFAULT 'standard',
     credit_count INTEGER,
     validity_days INTEGER,
     class_types TEXT[],
     billing_interval TEXT,
     billing_period INTEGER DEFAULT 1,
     images TEXT[] DEFAULT '{}',
     is_active BOOLEAN DEFAULT true,
     inventory_tracking BOOLEAN DEFAULT false,
     max_quantity_per_order INTEGER,
     channel_flags TEXT[] DEFAULT '{"web"}',
     visibility TEXT DEFAULT 'public',
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );`,
  
  `CREATE TABLE IF NOT EXISTS orders (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
     customer_id UUID REFERENCES profiles(id),
     order_number TEXT UNIQUE NOT NULL,
     subtotal_cents INTEGER NOT NULL DEFAULT 0,
     tax_cents INTEGER NOT NULL DEFAULT 0,
     discount_cents INTEGER NOT NULL DEFAULT 0,
     total_cents INTEGER NOT NULL DEFAULT 0,
     currency TEXT DEFAULT 'CHF',
     status TEXT DEFAULT 'pending',
     payment_status payment_status DEFAULT 'pending',
     customer_email TEXT,
     customer_name TEXT,
     customer_phone TEXT,
     billing_address JSONB,
     vat_number TEXT,
     notes TEXT,
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );`,
  
  `CREATE TABLE IF NOT EXISTS order_items (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
     product_id UUID REFERENCES products(id),
     class_instance_id UUID REFERENCES class_instances(id),
     name TEXT NOT NULL,
     description TEXT,
     quantity INTEGER NOT NULL DEFAULT 1,
     unit_price_cents INTEGER NOT NULL,
     total_price_cents INTEGER NOT NULL,
     tax_rate DECIMAL(5,4) DEFAULT 0.077,
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT NOW()
   );`,
  
  `CREATE TABLE IF NOT EXISTS payments (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
     order_id UUID REFERENCES orders(id),
     customer_id UUID REFERENCES profiles(id),
     amount_cents INTEGER NOT NULL,
     currency TEXT DEFAULT 'CHF',
     payment_method payment_method NOT NULL,
     status payment_status DEFAULT 'pending',
     stripe_payment_intent_id TEXT,
     twint_transaction_id TEXT,
     postfinance_id TEXT,
     bank_reference TEXT,
     qr_bill_reference TEXT,
     attempted_at TIMESTAMPTZ DEFAULT NOW(),
     confirmed_at TIMESTAMPTZ,
     failed_at TIMESTAMPTZ,
     refunded_at TIMESTAMPTZ,
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );`,
  
  `CREATE TABLE IF NOT EXISTS wallets (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
     organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
     product_id UUID REFERENCES products(id),
     credit_balance INTEGER DEFAULT 0,
     expires_at TIMESTAMPTZ,
     is_active BOOLEAN DEFAULT true,
     purchased_at TIMESTAMPTZ DEFAULT NOW(),
     last_used_at TIMESTAMPTZ,
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(customer_id, organization_id, product_id)
   );`,
  
  `CREATE TABLE IF NOT EXISTS wallet_transactions (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
     organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
     type wallet_transaction_type NOT NULL,
     amount INTEGER NOT NULL,
     balance_after INTEGER NOT NULL,
     order_id UUID REFERENCES orders(id),
     class_registration_id UUID REFERENCES class_registrations(id),
     payment_id UUID REFERENCES payments(id),
     description TEXT,
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT NOW()
   );`,
  
  `CREATE TABLE IF NOT EXISTS invoices (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
     customer_id UUID REFERENCES profiles(id),
     order_id UUID REFERENCES orders(id),
     invoice_number TEXT UNIQUE NOT NULL,
     issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
     due_date DATE NOT NULL,
     subtotal_cents INTEGER NOT NULL DEFAULT 0,
     tax_cents INTEGER NOT NULL DEFAULT 0,
     total_cents INTEGER NOT NULL DEFAULT 0,
     status invoice_status DEFAULT 'draft',
     currency TEXT DEFAULT 'CHF',
     qr_reference TEXT,
     qr_code_data TEXT,
     billing_address JSONB,
     notes TEXT,
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );`,
  
  `CREATE TABLE IF NOT EXISTS instructors (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
     user_id UUID NOT NULL REFERENCES profiles(id),
     instructor_number TEXT,
     specialties TEXT[],
     bio TEXT,
     qualifications JSONB DEFAULT '{}',
     hourly_rate_cents INTEGER,
     commission_rate DECIMAL(5,4),
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );`,
  
  `CREATE TABLE IF NOT EXISTS brands (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     slug TEXT UNIQUE NOT NULL,
     domain TEXT UNIQUE,
     logo_url TEXT,
     favicon_url TEXT,
     primary_color TEXT DEFAULT '#123C2E',
     secondary_color TEXT DEFAULT '#E6D9C7',
     accent_color TEXT DEFAULT '#1C4E73',
     font_family TEXT DEFAULT 'Inter',
     settings JSONB DEFAULT '{}',
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );`,
  
  // Step 4: Indexes
  `CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
   CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
   CREATE INDEX IF NOT EXISTS idx_organization_members_org_user ON organization_members(organization_id, user_id);
   CREATE INDEX IF NOT EXISTS idx_organization_members_role ON organization_members(organization_id, role);
   CREATE INDEX IF NOT EXISTS idx_locations_org ON locations(organization_id);
   CREATE INDEX IF NOT EXISTS idx_class_templates_org ON class_templates(organization_id);
   CREATE INDEX IF NOT EXISTS idx_class_instances_org_time ON class_instances(organization_id, start_time);
   CREATE INDEX IF NOT EXISTS idx_class_registrations_class ON class_registrations(class_instance_id);
   CREATE INDEX IF NOT EXISTS idx_class_registrations_customer ON class_registrations(customer_id);
   CREATE INDEX IF NOT EXISTS idx_products_org_active ON products(organization_id, is_active);
   CREATE INDEX IF NOT EXISTS idx_orders_org_created ON orders(organization_id, created_at);
   CREATE INDEX IF NOT EXISTS idx_payments_org_created ON payments(organization_id, created_at);
   CREATE INDEX IF NOT EXISTS idx_wallets_customer_org ON wallets(customer_id, organization_id);`,
  
  // Step 5: Triggers
  `CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
       NEW.updated_at = NOW();
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;`,
  
  `DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
   CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
   CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
   CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   DROP TRIGGER IF EXISTS update_class_templates_updated_at ON class_templates;
   CREATE TRIGGER update_class_templates_updated_at BEFORE UPDATE ON class_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   DROP TRIGGER IF EXISTS update_class_instances_updated_at ON class_instances;
   CREATE TRIGGER update_class_instances_updated_at BEFORE UPDATE ON class_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   DROP TRIGGER IF EXISTS update_class_registrations_updated_at ON class_registrations;
   CREATE TRIGGER update_class_registrations_updated_at BEFORE UPDATE ON class_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   DROP TRIGGER IF EXISTS update_products_updated_at ON products;
   CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
   CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
   CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
   CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
   CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
  
  // Step 6: RLS Policies - Enable RLS
  `ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
   ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
   ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
   ALTER TABLE class_templates ENABLE ROW LEVEL SECURITY;
   ALTER TABLE class_instances ENABLE ROW LEVEL SECURITY;
   ALTER TABLE class_registrations ENABLE ROW LEVEL SECURITY;
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
   ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
   ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
   ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
   ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
   ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
   ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
   ALTER TABLE brands ENABLE ROW LEVEL SECURITY;`,
  
  // Step 7: Helper functions
  `CREATE OR REPLACE FUNCTION user_has_roles_in_org(org_id UUID, allowed_roles user_role[])
   RETURNS BOOLEAN AS $$
   BEGIN
     RETURN EXISTS (
       SELECT 1 FROM organization_members om
       WHERE om.organization_id = org_id
       AND om.user_id = auth.uid()
       AND om.role = ANY(allowed_roles)
       AND om.is_active = true
     );
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;`,
  
  `CREATE OR REPLACE FUNCTION user_is_org_member(org_id UUID)
   RETURNS BOOLEAN AS $$
   BEGIN
     RETURN EXISTS (
       SELECT 1 FROM organization_members om
       WHERE om.organization_id = org_id
       AND om.user_id = auth.uid()
       AND om.is_active = true
     );
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;`,
  
  // Basic RLS policies
  `CREATE POLICY "Users can view their organizations" ON organizations
   FOR SELECT USING (
     EXISTS (
       SELECT 1 FROM organization_members om
       WHERE om.organization_id = organizations.id
       AND om.user_id = auth.uid()
       AND om.is_active = true
     )
   );`,
  
  `CREATE POLICY "Users can view their profile" ON profiles
   FOR SELECT USING (id = auth.uid());
   CREATE POLICY "Users can update their profile" ON profiles
   FOR UPDATE USING (id = auth.uid());`,
  
  // Add registrations view for backward compatibility\n  `CREATE OR REPLACE VIEW registrations AS \n   SELECT * FROM class_registrations;`,\n   \n  // Add missing analytics function\n  `CREATE OR REPLACE FUNCTION get_class_analytics(\n     p_organization_id UUID,\n     p_start_date TIMESTAMPTZ,\n     p_end_date TIMESTAMPTZ\n   )\n   RETURNS TABLE (\n     total_classes INTEGER,\n     total_registrations INTEGER,\n     revenue_cents INTEGER,\n     attendance_rate DECIMAL\n   ) AS $\n   BEGIN\n     RETURN QUERY\n     SELECT \n       COUNT(DISTINCT ci.id)::INTEGER as total_classes,\n       COUNT(cr.id)::INTEGER as total_registrations,\n       COALESCE(SUM(cr.price_paid_cents), 0)::INTEGER as revenue_cents,\n       CASE \n         WHEN COUNT(cr.id) > 0 THEN \n           ROUND((COUNT(CASE WHEN cr.status = 'checked_in' THEN 1 END)::DECIMAL / COUNT(cr.id)::DECIMAL) * 100, 2)\n         ELSE 0\n       END as attendance_rate\n     FROM class_instances ci\n     LEFT JOIN class_registrations cr ON ci.id = cr.class_instance_id\n     WHERE ci.organization_id = p_organization_id\n       AND ci.start_time >= p_start_date\n       AND ci.start_time <= p_end_date;\n   END;\n   $ LANGUAGE plpgsql SECURITY DEFINER;`,\n  \n  // Step 8: Sample Data
  `INSERT INTO organizations (id, name, slug, description, settings) 
   VALUES (
     '11111111-1111-1111-1111-111111111111',
     'YogaSwiss Demo Studio', 
     'demo-studio',
     'A demo yoga studio for testing',
     '{"timezone": "Europe/Zurich", "currency": "CHF"}'
   ) ON CONFLICT (id) DO NOTHING;`,
  
  `INSERT INTO locations (organization_id, name, type, address, capacity)
   VALUES (
     '11111111-1111-1111-1111-111111111111',
     'Flow Studio Zürich',
     'studio',
     '{"street": "Bahnhofstrasse 45", "city": "Zürich", "postal_code": "8001", "country": "Switzerland"}',
     25
   ) ON CONFLICT DO NOTHING;`,
  
  `INSERT INTO class_templates (organization_id, name, description, type, level, duration_minutes, capacity, price_cents)
   VALUES (
     '11111111-1111-1111-1111-111111111111',
     'Vinyasa Flow',
     'Dynamic yoga practice connecting breath with movement',
     'vinyasa',
     'all_levels',
     75,
     20,
     4500
   ) ON CONFLICT DO NOTHING;`,
  
  `INSERT INTO brands (organization_id, name, slug, primary_color, secondary_color, accent_color)
   VALUES (
     '11111111-1111-1111-1111-111111111111',
     'YogaSwiss Demo Brand',
     'demo-brand',
     '#123C2E',
     '#E6D9C7',
     '#1C4E73'
   ) ON CONFLICT (slug) DO NOTHING;`
];

// Check if database is properly initialized by testing key tables
async function checkDatabaseStatus(): Promise<boolean> {
  try {
    // Try to query a few key tables to see if they exist
    const { error: orgError } = await supabase.from('organizations').select('id').limit(1);
    const { error: profileError } = await supabase.from('profiles').select('id').limit(1);
    const { error: locationError } = await supabase.from('locations').select('id').limit(1);
    
    // If all queries work (even if they return no data), the database is initialized
    return !orgError && !profileError && !locationError;
  } catch (error) {
    return false;
  }
}

// Main database initialization function
export async function runDatabaseInitialization(): Promise<{ success: boolean; error?: string }> {
  console.log('🚀 Starting YogaSwiss database initialization...');
  console.log('📋 Checking database status...');
  
  try {
    // First check if database is already initialized
    const isInitialized = await checkDatabaseStatus();
    
    if (isInitialized) {
      console.log('✅ Database already initialized, checking for demo data...');
      
      // Check if demo organization exists
      const { data: demoOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', 'demo-studio')
        .single();
        
      if (!demoOrg) {
        console.log('📝 Adding demo organization...');
        await supabase.from('organizations').insert({
          id: '11111111-1111-1111-1111-111111111111',
          name: 'YogaSwiss Demo Studio',
          slug: 'demo-studio',
          description: 'A demo yoga studio for testing',
          settings: { timezone: 'Europe/Zurich', currency: 'CHF' }
        });
      }
      
    } else {
      console.log('⚠️ Database not fully initialized.');
      console.log('📋 To complete initialization, please run these SQL scripts in your Supabase SQL editor:');
      console.log('');
      console.log('='.repeat(80));
      console.log('🔗 Go to: https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql');
      console.log('='.repeat(80));
      console.log('');
      
      // Display all SQL scripts for manual execution
      SQL_SCRIPTS.forEach((script, index) => {
        console.log(`-- SCRIPT ${index + 1}/${SQL_SCRIPTS.length}`);
        console.log('-'.repeat(40));
        console.log(script);
        console.log('');
      });
      
      console.log('='.repeat(80));
      console.log('📝 After running these scripts, restart the application.');
      console.log('='.repeat(80));
    }
    
    // Create admin users
    console.log('👥 Creating YogaSwiss admin users...');
    await createYogaSwissAdminUsers();
    console.log('✅ Admin users created successfully');
    
    // Display credentials
    await displayAdminCredentials();
    
    console.log('🎉 YogaSwiss database initialization process completed!');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage && errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      console.log('');
      console.log('💡 This error indicates the database schema is not set up.');
      console.log('📋 Please run the SQL scripts manually in Supabase dashboard:');
      console.log('🔗 https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql');
      console.log('');
      console.log('Then copy and paste each of these SQL scripts:');
      console.log('='.repeat(80));
      SQL_SCRIPTS.forEach((script, index) => {
        console.log(`-- SCRIPT ${index + 1}/${SQL_SCRIPTS.length}`);
        console.log(script);
        console.log('');
      });
      console.log('='.repeat(80));
    }
    
    return { success: false, error: errorMessage };
  }
}

// Verification function for database setup
export async function verifyDatabaseSetup(): Promise<{ success: boolean; tablesCount: number; details: any }> {
  try {
    console.log('🔍 Verifying database setup...');
    
    // Check if key tables exist by trying to query them
    const tableChecks = [
      { name: 'organizations', query: () => supabase.from('organizations').select('id').limit(1) },
      { name: 'profiles', query: () => supabase.from('profiles').select('id').limit(1) },
      { name: 'locations', query: () => supabase.from('locations').select('id').limit(1) },
      { name: 'class_templates', query: () => supabase.from('class_templates').select('id').limit(1) },
      { name: 'class_instances', query: () => supabase.from('class_instances').select('id').limit(1) },
      { name: 'class_registrations', query: () => supabase.from('class_registrations').select('id').limit(1) },
      { name: 'products', query: () => supabase.from('products').select('id').limit(1) },
      { name: 'orders', query: () => supabase.from('orders').select('id').limit(1) },
      { name: 'payments', query: () => supabase.from('payments').select('id').limit(1) },
      { name: 'wallets', query: () => supabase.from('wallets').select('id').limit(1) },
    ];
    
    let tablesFound = 0;
    const results = [];
    
    for (const check of tableChecks) {
      try {
        const { error } = await check.query();
        if (!error) {
          tablesFound++;
          results.push({ table: check.name, status: 'exists' });
        } else {
          results.push({ table: check.name, status: 'missing', error: error.message });
        }
      } catch (err) {
        results.push({ table: check.name, status: 'error', error: err instanceof Error ? err.message : String(err) });
      }
    }
    
    console.log(`✅ Found ${tablesFound}/${tableChecks.length} tables`);
    
    return {
      success: tablesFound >= Math.floor(tableChecks.length * 0.8), // 80% of tables should exist
      tablesCount: tablesFound,
      details: { results, totalChecked: tableChecks.length }
    };
    
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    return {
      success: false,
      tablesCount: 0,
      details: { error: error instanceof Error ? error.message : String(error) }
    };
  }
}

// Export for use in other modules
export { SQL_SCRIPTS };