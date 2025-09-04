import { supabase } from './client';

export interface DatabaseInitStep {
  id: string;
  name: string;
  description: string;
  sql: string;
  critical: boolean;
}

export const DATABASE_INIT_STEPS: DatabaseInitStep[] = [
  {
    id: 'organizations',
    name: 'Organizations Table',
    description: 'Create the main organizations table for multi-tenancy',
    critical: true,
    sql: `
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        type TEXT DEFAULT 'studio',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
      CREATE TRIGGER update_organizations_updated_at
        BEFORE UPDATE ON organizations
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
  },
  {
    id: 'profiles',
    name: 'User Profiles',
    description: 'Create profiles table for user management',
    critical: true,
    sql: `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id),
        email TEXT NOT NULL,
        full_name TEXT,
        first_name TEXT,
        last_name TEXT,
        role TEXT DEFAULT 'customer',
        phone TEXT,
        avatar_url TEXT,
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
      CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
  },
  {
    id: 'studios',
    name: 'Studios Table',
    description: 'Create studios/locations table',
    critical: true,
    sql: `
      CREATE TABLE IF NOT EXISTS studios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT,
        description TEXT,
        address TEXT,
        city TEXT,
        postal_code TEXT,
        country TEXT DEFAULT 'Switzerland',
        phone TEXT,
        email TEXT,
        website TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        amenities TEXT[],
        capacity INTEGER DEFAULT 20,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      DROP TRIGGER IF EXISTS update_studios_updated_at ON studios;
      CREATE TRIGGER update_studios_updated_at
        BEFORE UPDATE ON studios
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
  },
  {
    id: 'instructors',
    name: 'Instructors Table',
    description: 'Create instructors table',
    critical: true,
    sql: `
      CREATE TABLE IF NOT EXISTS instructors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        profile_id UUID REFERENCES profiles(id),
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        bio TEXT,
        specialties TEXT[],
        qualifications TEXT[],
        hourly_rate_chf DECIMAL(10,2),
        status TEXT DEFAULT 'active',
        avatar_url TEXT,
        social_links JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      DROP TRIGGER IF EXISTS update_instructors_updated_at ON instructors;
      CREATE TRIGGER update_instructors_updated_at
        BEFORE UPDATE ON instructors
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
  },
  {
    id: 'class_templates',
    name: 'Class Templates',
    description: 'Create class templates for recurring classes',
    critical: true,
    sql: `
      CREATE TABLE IF NOT EXISTS class_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT,
        description TEXT,
        duration_minutes INTEGER DEFAULT 60,
        max_capacity INTEGER DEFAULT 20,
        price_chf DECIMAL(10,2),
        style TEXT,
        level TEXT,
        equipment_needed TEXT[],
        tags TEXT[],
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      DROP TRIGGER IF EXISTS update_class_templates_updated_at ON class_templates;
      CREATE TRIGGER update_class_templates_updated_at
        BEFORE UPDATE ON class_templates
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
  },
  {
    id: 'class_instances',
    name: 'Class Instances',
    description: 'Create specific class instances/sessions',
    critical: true,
    sql: `
      CREATE TABLE IF NOT EXISTS class_instances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        template_id UUID REFERENCES class_templates(id),
        instructor_id UUID REFERENCES instructors(id),
        studio_id UUID REFERENCES studios(id),
        name TEXT NOT NULL,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        price_chf DECIMAL(10,2),
        max_capacity INTEGER DEFAULT 20,
        current_bookings INTEGER DEFAULT 0,
        status TEXT DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      DROP TRIGGER IF EXISTS update_class_instances_updated_at ON class_instances;
      CREATE TRIGGER update_class_instances_updated_at
        BEFORE UPDATE ON class_instances
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
  },
  {
    id: 'bookings',
    name: 'Bookings Table',
    description: 'Create bookings/reservations table',
    critical: true,
    sql: `
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        class_instance_id UUID REFERENCES class_instances(id),
        customer_id UUID REFERENCES profiles(id),
        status TEXT DEFAULT 'confirmed',
        amount_paid_chf DECIMAL(10,2),
        payment_method TEXT,
        payment_status TEXT DEFAULT 'pending',
        booking_date TIMESTAMPTZ DEFAULT NOW(),
        checked_in_at TIMESTAMPTZ,
        cancelled_at TIMESTAMPTZ,
        cancellation_reason TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
      CREATE TRIGGER update_bookings_updated_at
        BEFORE UPDATE ON bookings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
  },
  {
    id: 'transactions',
    name: 'Financial Transactions',
    description: 'Create transactions table for payments',
    critical: true,
    sql: `
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        customer_id UUID REFERENCES profiles(id),
        booking_id UUID REFERENCES bookings(id),
        amount_chf DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'CHF',
        type TEXT NOT NULL, -- 'payment', 'refund', 'credit', 'debit'
        method TEXT, -- 'twint', 'card', 'cash', 'bank_transfer'
        status TEXT DEFAULT 'completed',
        description TEXT,
        reference_id TEXT,
        metadata JSONB DEFAULT '{}',
        processed_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    id: 'customer_wallets',
    name: 'Customer Wallets',
    description: 'Create customer wallet system for credits',
    critical: false,
    sql: `
      CREATE TABLE IF NOT EXISTS customer_wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES profiles(id) UNIQUE,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        balance_chf DECIMAL(10,2) DEFAULT 0.00,
        credits INTEGER DEFAULT 0,
        total_spent_chf DECIMAL(10,2) DEFAULT 0.00,
        last_transaction_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      DROP TRIGGER IF EXISTS update_customer_wallets_updated_at ON customer_wallets;
      CREATE TRIGGER update_customer_wallets_updated_at
        BEFORE UPDATE ON customer_wallets
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
  },
  {
    id: 'brands',
    name: 'Brand Management',
    description: 'Create brands table for multi-tenant theming',
    critical: false,
    sql: `
      CREATE TABLE IF NOT EXISTS brands (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        primary_color TEXT DEFAULT '#123C2E',
        secondary_color TEXT DEFAULT '#E6D9C7',
        accent_color TEXT DEFAULT '#1C4E73',
        logo_url TEXT,
        logo_dark_url TEXT,
        favicon_url TEXT,
        font_family TEXT DEFAULT 'Inter',
        font_heading TEXT DEFAULT 'Libre Caslon Text',
        custom_css TEXT,
        theme_config JSONB DEFAULT '{}',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
      CREATE TRIGGER update_brands_updated_at
        BEFORE UPDATE ON brands
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
  }
];

export async function executeDatabaseInitStep(step: DatabaseInitStep): Promise<void> {
  try {
    // Split SQL by statements and execute each one
    const statements = step.sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        console.warn(`Warning executing statement in step ${step.id}:`, error);
        // For now, continue with other statements even if one fails
      }
    }
  } catch (error) {
    console.error(`Error executing database init step ${step.id}:`, error);
    throw error;
  }
}

export async function seedDemoData(): Promise<void> {
  try {
    // Insert demo organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .upsert({
        name: 'YogaSwiss Demo Studio',
        slug: 'yogaswiss-demo',
        type: 'studio',
        status: 'active'
      })
      .select()
      .single();

    if (orgError && orgError.code !== '23505') { // Ignore unique constraint errors
      throw orgError;
    }

    if (!org) return;

    // Insert demo studio
    const { error: studioError } = await supabase
      .from('studios')
      .upsert({
        organization_id: org.id,
        name: 'Flow Studio Zürich',
        slug: 'flow-studio-zurich',
        description: 'Modern yoga studio in the heart of Zurich',
        address: 'Bahnhofstrasse 45',
        city: 'Zürich',
        postal_code: '8001',
        country: 'Switzerland',
        phone: '+41 44 123 45 67',
        email: 'info@flowstudio.ch',
        capacity: 25,
        amenities: ['yoga mats', 'props', 'changing rooms', 'lockers']
      });

    if (studioError && studioError.code !== '23505') {
      throw studioError;
    }

    // Insert demo instructor
    const { error: instructorError } = await supabase
      .from('instructors')
      .upsert({
        organization_id: org.id,
        name: 'Sarah Zimmermann',
        email: 'sarah@flowstudio.ch',
        bio: 'Experienced yoga instructor with 10+ years teaching all levels.',
        specialties: ['Vinyasa', 'Hatha', 'Meditation'],
        qualifications: ['200h YTT', '500h YTT', 'Meditation Teacher'],
        hourly_rate_chf: 120,
        status: 'active'
      });

    if (instructorError && instructorError.code !== '23505') {
      throw instructorError;
    }

    // Insert demo class templates
    const templates = [
      {
        organization_id: org.id,
        name: 'Vinyasa Flow',
        slug: 'vinyasa-flow',
        description: 'Dynamic yoga practice connecting breath with movement',
        duration_minutes: 75,
        max_capacity: 20,
        price_chf: 45,
        style: 'Vinyasa',
        level: 'All Levels',
        tags: ['flow', 'strength', 'flexibility']
      },
      {
        organization_id: org.id,
        name: 'Yin Yoga',
        slug: 'yin-yoga',
        description: 'Gentle, meditative practice with longer held poses',
        duration_minutes: 60,
        max_capacity: 15,
        price_chf: 38,
        style: 'Yin',
        level: 'Beginner',
        tags: ['relaxation', 'meditation', 'stress relief']
      },
      {
        organization_id: org.id,
        name: 'Hot Power Yoga',
        slug: 'hot-power-yoga',
        description: 'Intensive heated yoga for strength and detox',
        duration_minutes: 60,
        max_capacity: 20,
        price_chf: 42,
        style: 'Power',
        level: 'Advanced',
        tags: ['heated', 'strength', 'cardio']
      }
    ];

    for (const template of templates) {
      const { error } = await supabase
        .from('class_templates')
        .upsert(template);
      
      if (error && error.code !== '23505') {
        console.warn('Error inserting class template:', error);
      }
    }

    console.log('✅ Demo data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
}

export async function checkDatabaseHealth(): Promise<{
  tablesExist: boolean;
  hasData: boolean;
  details: any;
}> {
  try {
    // Import project ID
    const { getSupabaseProjectId } = await import('./env');
    const projectId = getSupabaseProjectId();
    
    let orgExists = false;
    let profileExists = false;
    let locationExists = false;
    let orgCount = 0;

    // Check each table individually and handle errors gracefully
    try {
      const { error: orgError } = await supabase
        .from('orgs')
        .select('count', { count: 'exact', head: true })
        .limit(0);
      orgExists = !orgError;

      if (orgExists) {
        const { count } = await supabase
          .from('orgs')
          .select('*', { count: 'exact', head: true });
        orgCount = count || 0;
      }
    } catch (e) {
      console.log('orgs table check failed:', e);
    }

    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .select('count', { count: 'exact', head: true })
        .limit(0);
      profileExists = !profileError;
    } catch (e) {
      console.log('user_profiles table check failed:', e);
    }

    try {
      const { error: locationError } = await supabase
        .from('locations')
        .select('count', { count: 'exact', head: true })
        .limit(0);
      locationExists = !locationError;
    } catch (e) {
      console.log('locations table check failed:', e);
    }

    const tablesExist = orgExists && profileExists && locationExists;
    const hasData = orgCount > 0;

    return {
      tablesExist,
      hasData,
      details: {
        orgs: orgExists,
        user_profiles: profileExists,
        locations: locationExists,
        orgCount,
        projectId,
        // Add connection test result
        connectionWorking: orgExists || profileExists || locationExists
      }
    };
  } catch (error) {
    // Import project ID for fallback
    let projectId = '';
    try {
      const env = await import('./env');
      projectId = env.getSupabaseProjectId();
    } catch (e) {
      // Ignore
    }

    return {
      tablesExist: false,
      hasData: false,
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId,
        connectionWorking: false
      }
    };
  }
}
