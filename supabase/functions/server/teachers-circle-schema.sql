-- Teachers Circle and Retreat Requests Schema
-- Run this SQL in Supabase SQL Editor to create the necessary tables

-- Venues table for Teachers Circle events
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    coordinates JSONB,
    access_instructions TEXT,
    capacity INTEGER DEFAULT 25,
    amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teachers Circle events table
CREATE TABLE IF NOT EXISTS teachers_circle_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city TEXT NOT NULL CHECK (city IN ('Lausanne', 'Zürich')),
    title TEXT NOT NULL,
    description TEXT,
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    venue_id UUID NOT NULL REFERENCES venues(id),
    capacity INTEGER NOT NULL DEFAULT 25,
    price DECIMAL(10,2) DEFAULT 0,
    is_free BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teachers Circle registrations table
CREATE TABLE IF NOT EXISTS teachers_circle_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES teachers_circle_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'waitlisted', 'cancelled', 'attended', 'no_show')),
    payment_id TEXT,
    consent_photo BOOLEAN DEFAULT false,
    consent_policy BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, email)
);

-- Retreat requests table
CREATE TABLE IF NOT EXISTS retreat_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    teacher_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    brand_studio TEXT,
    city TEXT,
    language TEXT,
    yogaswiss_profile TEXT,
    
    -- Retreat details
    preferred_country TEXT,
    preferred_region TEXT,
    start_date DATE,
    end_date DATE,
    length_nights INTEGER,
    group_size_min INTEGER,
    group_size_max INTEGER,
    room_preference TEXT CHECK (room_preference IN ('private', 'shared', 'mixed')),
    yoga_style TEXT,
    daily_schedule TEXT,
    budget_low DECIMAL(10,2),
    budget_high DECIMAL(10,2),
    currency TEXT DEFAULT 'CHF',
    
    -- Services and requirements
    services JSONB DEFAULT '{}',
    support_level TEXT CHECK (support_level IN ('light', 'full')),
    amenities JSONB DEFAULT '{}',
    marketing_preferences JSONB DEFAULT '{}',
    accessibility TEXT,
    family_friendly BOOLEAN DEFAULT false,
    alcohol_policy TEXT,
    additional_requirements TEXT,
    attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Consent and status
    consent_contact BOOLEAN DEFAULT false,
    consent_data BOOLEAN DEFAULT false,
    newsletter_opt_in BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'scoping', 'quoting', 'pending_approval', 'confirmed', 'cancelled')),
    assigned_manager_id UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retreat request status history
CREATE TABLE IF NOT EXISTS retreat_request_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES retreat_requests(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    note TEXT,
    actor_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retreat partners table
CREATE TABLE IF NOT EXISTS retreat_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('venue', 'hotel', 'chef', 'media', 'transport')),
    locations TEXT[] DEFAULT ARRAY[]::TEXT[],
    capabilities JSONB DEFAULT '{}',
    contact_details JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partner quotes table
CREATE TABLE IF NOT EXISTS partner_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES retreat_requests(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES retreat_partners(id),
    summary TEXT,
    price_chf DECIMAL(10,2),
    inclusions JSONB DEFAULT '{}',
    exclusions JSONB DEFAULT '{}',
    valid_until DATE,
    files TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retreat projects table (when a request is approved)
CREATE TABLE IF NOT EXISTS retreat_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES retreat_requests(id),
    public_listing_id UUID, -- Reference to public retreat listing if created
    deposit_amount DECIMAL(10,2),
    payment_schedule JSONB DEFAULT '{}',
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_teachers_circle_events_city ON teachers_circle_events(city);
CREATE INDEX IF NOT EXISTS idx_teachers_circle_events_start_at ON teachers_circle_events(start_at);
CREATE INDEX IF NOT EXISTS idx_teachers_circle_registrations_event_id ON teachers_circle_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_teachers_circle_registrations_user_id ON teachers_circle_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_circle_registrations_email ON teachers_circle_registrations(email);
CREATE INDEX IF NOT EXISTS idx_retreat_requests_user_id ON retreat_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_retreat_requests_email ON retreat_requests(email);
CREATE INDEX IF NOT EXISTS idx_retreat_requests_status ON retreat_requests(status);
CREATE INDEX IF NOT EXISTS idx_retreat_request_status_history_request_id ON retreat_request_status_history(request_id);
CREATE INDEX IF NOT EXISTS idx_partner_quotes_request_id ON partner_quotes(request_id);
CREATE INDEX IF NOT EXISTS idx_retreat_projects_request_id ON retreat_projects(request_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_venues_updated_at ON venues;
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teachers_circle_events_updated_at ON teachers_circle_events;
CREATE TRIGGER update_teachers_circle_events_updated_at BEFORE UPDATE ON teachers_circle_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teachers_circle_registrations_updated_at ON teachers_circle_registrations;
CREATE TRIGGER update_teachers_circle_registrations_updated_at BEFORE UPDATE ON teachers_circle_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_retreat_requests_updated_at ON retreat_requests;
CREATE TRIGGER update_retreat_requests_updated_at BEFORE UPDATE ON retreat_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_retreat_partners_updated_at ON retreat_partners;
CREATE TRIGGER update_retreat_partners_updated_at BEFORE UPDATE ON retreat_partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partner_quotes_updated_at ON partner_quotes;
CREATE TRIGGER update_partner_quotes_updated_at BEFORE UPDATE ON partner_quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_retreat_projects_updated_at ON retreat_projects;
CREATE TRIGGER update_retreat_projects_updated_at BEFORE UPDATE ON retreat_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers_circle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers_circle_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE retreat_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE retreat_request_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE retreat_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE retreat_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Venues: Public read access for active venues
DROP POLICY IF EXISTS "Public can view active venues" ON venues;
CREATE POLICY "Public can view active venues" ON venues
    FOR SELECT USING (is_active = true);

-- Teachers Circle Events: Public read access for future events
DROP POLICY IF EXISTS "Public can view future events" ON teachers_circle_events;
CREATE POLICY "Public can view future events" ON teachers_circle_events
    FOR SELECT USING (start_at > NOW() AND status = 'open');

-- Teachers Circle Registrations: Users can only see their own registrations
DROP POLICY IF EXISTS "Users can view own registrations" ON teachers_circle_registrations;
CREATE POLICY "Users can view own registrations" ON teachers_circle_registrations
    FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = email);

DROP POLICY IF EXISTS "Users can create registrations" ON teachers_circle_registrations;
CREATE POLICY "Users can create registrations" ON teachers_circle_registrations
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own registrations" ON teachers_circle_registrations;
CREATE POLICY "Users can update own registrations" ON teachers_circle_registrations
    FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = email);

-- Retreat Requests: Users can only see their own requests
DROP POLICY IF EXISTS "Users can view own retreat requests" ON retreat_requests;
CREATE POLICY "Users can view own retreat requests" ON retreat_requests
    FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = email);

DROP POLICY IF EXISTS "Users can create retreat requests" ON retreat_requests;
CREATE POLICY "Users can create retreat requests" ON retreat_requests
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own retreat requests" ON retreat_requests;
CREATE POLICY "Users can update own retreat requests" ON retreat_requests
    FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = email);

-- Retreat Partners: Public read access for active partners
DROP POLICY IF EXISTS "Public can view active partners" ON retreat_partners;
CREATE POLICY "Public can view active partners" ON retreat_partners
    FOR SELECT USING (is_active = true);

-- Insert some sample venues for Teachers Circle
INSERT INTO venues (name, address, city, access_instructions, capacity) VALUES
    ('Yoga Studio Lausanne', 'Rue du Lac 15, 1003 Lausanne', 'Lausanne', 'Enter through main entrance. Circle room on 2nd floor.', 25),
    ('Yoga Loft Zürich', 'Bahnhofstrasse 45, 8001 Zürich', 'Zürich', 'Enter through main entrance. Circle room on 2nd floor.', 30)
ON CONFLICT DO NOTHING;

-- Insert sample retreat partners
INSERT INTO retreat_partners (name, type, locations, capabilities, contact_details) VALUES
    ('Burgenstock Resort', 'venue', ARRAY['Switzerland'], '{"luxury": true, "spa": true, "capacity": 100}', '{"email": "events@burgenstock.ch", "phone": "+41 41 612 9040"}'),
    ('Villa Stephanie', 'venue', ARRAY['Germany'], '{"luxury": true, "wellness": true, "capacity": 50}', '{"email": "info@villa-stephanie.com"}'),
    ('Chef Marcus Weber', 'chef', ARRAY['Zürich', 'Switzerland'], '{"cuisine_types": ["healthy", "vegetarian", "vegan"], "group_sizes": [10, 50]}', '{"email": "marcus@chefsolutions.ch"}'),
    ('Alpine Photography', 'media', ARRAY['Swiss Alps'], '{"services": ["photography", "videography"], "specialties": ["yoga", "wellness", "retreats"]}', '{"email": "info@alpine-photo.ch"}'),
    ('Wellness Transfer Services', 'transport', ARRAY['Switzerland'], '{"vehicle_types": ["luxury_van", "coach"], "capacity": 20}', '{"email": "bookings@wellness-transfers.ch"}'})
ON CONFLICT DO NOTHING;

-- Create storage bucket for retreat attachments (run this separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('retreat-leads', 'retreat-leads', false) ON CONFLICT DO NOTHING;