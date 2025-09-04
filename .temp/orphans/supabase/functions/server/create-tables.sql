-- YogaSwiss Database Schema
-- This script creates all the required tables for the multi-tenant yoga platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    coordinates JSONB, -- {lat: number, lng: number}
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
    description JSONB NOT NULL, -- Multi-language descriptions
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
    name JSONB NOT NULL, -- Multi-language names
    description JSONB NOT NULL, -- Multi-language descriptions
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
    qr_bill_data JSONB, -- Swiss QR-bill specific data
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
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON orgs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_org_users_updated_at BEFORE UPDATE ON org_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_templates_updated_at BEFORE UPDATE ON class_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_occurrences_updated_at BEFORE UPDATE ON class_occurrences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_passes_updated_at BEFORE UPDATE ON passes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
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

-- For the demo, we'll also allow service role to bypass RLS
-- This allows the server functions to work with full access