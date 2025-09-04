-- =====================================================
-- RETREATS & FESTIVALS SCHEMA
-- Complete multi-tenant retreat management system
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis" CASCADE;

-- =====================================================
-- RETREAT CATALOG
-- =====================================================

-- Main retreats table
CREATE TABLE IF NOT EXISTS retreats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    
    -- Basic Info
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    summary TEXT,
    long_description_md TEXT,
    
    -- Location
    country TEXT NOT NULL DEFAULT 'CH',
    region TEXT,
    city TEXT,
    address TEXT,
    coordinates POINT,
    venue_name TEXT,
    venue_description_md TEXT,
    
    -- Dates & Capacity
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    registration_opens_at TIMESTAMPTZ,
    registration_closes_at TIMESTAMPTZ,
    early_bird_deadline TIMESTAMPTZ,
    capacity_total INTEGER NOT NULL DEFAULT 20,
    min_participants INTEGER DEFAULT 8,
    max_participants INTEGER,
    min_age INTEGER DEFAULT 18,
    max_age INTEGER,
    
    -- Languages & Localization
    languages TEXT[] DEFAULT ARRAY['de-CH'],
    default_language TEXT DEFAULT 'de-CH',
    
    -- Hosts & Brand
    host_brand_id UUID REFERENCES orgs(id),
    hosts JSONB DEFAULT '[]'::jsonb,
    lead_instructor_id UUID,
    
    -- Content
    included_md TEXT,
    not_included_md TEXT,
    what_to_bring_md TEXT,
    policies_md TEXT,
    faq_md TEXT,
    
    -- Status & Publishing
    visibility TEXT DEFAULT 'draft' CHECK (visibility IN ('draft', 'private', 'published')),
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    
    -- SEO
    seo_json JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    
    -- Constraints
    UNIQUE(tenant_id, slug),
    CHECK (start_date < end_date),
    CHECK (capacity_total > 0),
    CHECK (min_participants <= capacity_total)
);

-- Content sections for flexible page building
CREATE TABLE IF NOT EXISTS retreat_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    retreat_id UUID NOT NULL REFERENCES retreats(id) ON DELETE CASCADE,
    
    kind TEXT NOT NULL CHECK (kind IN ('essentials', 'location', 'program', 'impressions', 'faq', 'hosts', 'custom')),
    title TEXT,
    content_md TEXT,
    order_idx INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media gallery for retreats
CREATE TABLE IF NOT EXISTS retreat_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    retreat_id UUID NOT NULL REFERENCES retreats(id) ON DELETE CASCADE,
    
    kind TEXT NOT NULL CHECK (kind IN ('hero', 'gallery', 'venue', 'activity', 'food', 'accommodation')),
    url TEXT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    order_idx INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRICING & ROOM TYPES
-- =====================================================

-- Room types and pricing tiers
CREATE TABLE IF NOT EXISTS retreat_room_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    retreat_id UUID NOT NULL REFERENCES retreats(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    occupancy INTEGER NOT NULL CHECK (occupancy IN (1, 2, 3, 4)),
    
    -- Pricing
    currency TEXT DEFAULT 'CHF',
    price DECIMAL(10,2) NOT NULL,
    early_bird_price DECIMAL(10,2),
    deposit_amount DECIMAL(10,2),
    deposit_percentage DECIMAL(5,2),
    
    -- Availability
    inventory INTEGER NOT NULL DEFAULT 1,
    available_inventory INTEGER,
    
    -- Policies
    gender_policy TEXT DEFAULT 'any' CHECK (gender_policy IN ('any', 'female_only', 'male_only', 'mixed_preferred')),
    shareable BOOLEAN DEFAULT true,
    age_restricted BOOLEAN DEFAULT false,
    
    -- Tax
    vat_rate DECIMAL(5,2) DEFAULT 7.7,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    order_idx INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add-on services and extras
CREATE TABLE IF NOT EXISTS retreat_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    retreat_id UUID NOT NULL REFERENCES retreats(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    
    -- Pricing
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'CHF',
    vat_rate DECIMAL(5,2) DEFAULT 7.7,
    
    -- Availability
    type TEXT DEFAULT 'service' CHECK (type IN ('service', 'item', 'experience', 'transport')),
    inventory INTEGER,
    per_person BOOLEAN DEFAULT true,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    order_idx INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discount codes and promotions
CREATE TABLE IF NOT EXISTS retreat_discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    retreat_id UUID NOT NULL REFERENCES retreats(id) ON DELETE CASCADE,
    
    code TEXT NOT NULL,
    name TEXT,
    description TEXT,
    
    -- Discount rules
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'early_bird')),
    value DECIMAL(10,2) NOT NULL,
    
    -- Validity
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    
    -- Rules
    rules_json JSONB DEFAULT '{}'::jsonb,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(retreat_id, code)
);

-- =====================================================
-- APPLICATION FORMS
-- =====================================================

-- Dynamic form builder for retreat applications
CREATE TABLE IF NOT EXISTS retreat_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    retreat_id UUID NOT NULL REFERENCES retreats(id) ON DELETE CASCADE,
    
    form_schema_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    requires_approval BOOLEAN DEFAULT true,
    auto_approve_criteria JSONB DEFAULT '{}'::jsonb,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- APPLICATIONS & BOOKINGS
-- =====================================================

-- Customer applications for retreats
CREATE TABLE IF NOT EXISTS retreat_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    retreat_id UUID NOT NULL REFERENCES retreats(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Application Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'waitlist', 'rejected', 'withdrawn', 'expired')),
    status_updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Form Responses
    answers_jsonb JSONB DEFAULT '{}'::jsonb,
    consents_jsonb JSONB DEFAULT '{}'::jsonb,
    
    -- Accommodation Preferences
    room_type_id UUID REFERENCES retreat_room_types(id),
    roommate_preference TEXT,
    roommate_requests TEXT,
    special_requests TEXT,
    
    -- Personal Information
    dietary_requirements TEXT,
    medical_conditions TEXT,
    emergency_contact JSONB,
    
    -- Travel Information
    passport_country TEXT,
    passport_number_last4 TEXT,
    travel_insurance_confirmed BOOLEAN DEFAULT false,
    arrival_info JSONB DEFAULT '{}'::jsonb,
    departure_info JSONB DEFAULT '{}'::jsonb,
    
    -- Pricing
    quoted_price DECIMAL(10,2),
    currency TEXT DEFAULT 'CHF',
    discount_code TEXT,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Admin Notes
    admin_notes TEXT,
    rejection_reason TEXT,
    
    -- Timestamps
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(retreat_id, customer_id)
);

-- Retreat bookings (post-approval)
CREATE TABLE IF NOT EXISTS retreat_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES retreat_applications(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id),
    
    -- Booking Status
    status TEXT DEFAULT 'reserved' CHECK (status IN ('reserved', 'confirmed', 'cancelled', 'no_show', 'completed')),
    
    -- Financial
    deposit_amount DECIMAL(10,2) NOT NULL,
    balance_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'CHF',
    
    -- Payment Schedule
    deposit_paid_at TIMESTAMPTZ,
    balance_due_date DATE NOT NULL,
    balance_paid_at TIMESTAMPTZ,
    
    -- Cancellation
    cancellation_policy_version TEXT,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room allocations and roommate assignments
CREATE TABLE IF NOT EXISTS retreat_room_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    retreat_id UUID NOT NULL REFERENCES retreats(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES retreat_bookings(id) ON DELETE CASCADE,
    
    room_type_id UUID NOT NULL REFERENCES retreat_room_types(id),
    room_number TEXT,
    bed_number INTEGER,
    roommate_group_id UUID,
    
    -- Status
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'changed')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(retreat_id, room_number, bed_number)
);

-- Retreat itinerary and daily schedule
CREATE TABLE IF NOT EXISTS retreat_itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    retreat_id UUID NOT NULL REFERENCES retreats(id) ON DELETE CASCADE,
    
    day INTEGER NOT NULL,
    date DATE,
    title TEXT NOT NULL,
    description_md TEXT,
    
    -- Timing
    starts_at TIME,
    ends_at TIME,
    duration_minutes INTEGER,
    
    -- Location
    location TEXT,
    venue TEXT,
    
    -- Activity Details
    activity_type TEXT,
    instructor TEXT,
    requirements TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    order_idx INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VIEWS FOR MANIFESTS AND REPORTING
-- =====================================================

-- Comprehensive retreat manifest view
CREATE OR REPLACE VIEW retreat_manifest_view AS
SELECT 
    r.id as retreat_id,
    r.title as retreat_title,
    r.start_date,
    r.end_date,
    r.city,
    r.country,
    
    -- Application Info
    ra.id as application_id,
    ra.status as application_status,
    ra.submitted_at,
    ra.approved_at,
    
    -- Customer Info
    up.id as customer_id,
    up.full_name,
    up.email,
    up.phone,
    up.date_of_birth,
    
    -- Accommodation
    rt.name as room_type,
    rt.occupancy,
    rra.room_number,
    rra.bed_number,
    rra.roommate_group_id,
    
    -- Special Requirements
    ra.dietary_requirements,
    ra.medical_conditions,
    ra.emergency_contact,
    
    -- Travel
    ra.passport_country,
    ra.travel_insurance_confirmed,
    ra.arrival_info,
    ra.departure_info,
    
    -- Booking Status
    rb.status as booking_status,
    rb.deposit_paid_at,
    rb.balance_paid_at,
    rb.total_amount,
    
    -- Flags for admin
    CASE WHEN ra.medical_conditions IS NOT NULL AND ra.medical_conditions != '' THEN true ELSE false END as has_medical_conditions,
    CASE WHEN ra.dietary_requirements IS NOT NULL AND ra.dietary_requirements != '' THEN true ELSE false END as has_dietary_requirements,
    CASE WHEN rb.balance_paid_at IS NULL AND rb.balance_due_date < CURRENT_DATE THEN true ELSE false END as balance_overdue
    
FROM retreats r
LEFT JOIN retreat_applications ra ON ra.retreat_id = r.id
LEFT JOIN user_profiles up ON up.id = ra.customer_id
LEFT JOIN retreat_bookings rb ON rb.application_id = ra.id
LEFT JOIN retreat_room_allocations rra ON rra.booking_id = rb.id
LEFT JOIN retreat_room_types rt ON rt.id = rra.room_type_id
WHERE ra.status IN ('approved', 'confirmed')
ORDER BY r.start_date, up.full_name;

-- Retreat capacity and availability view
CREATE OR REPLACE VIEW retreat_availability_view AS
SELECT 
    r.id,
    r.title,
    r.start_date,
    r.end_date,
    r.capacity_total,
    
    -- Room type availability
    json_agg(
        json_build_object(
            'room_type_id', rt.id,
            'name', rt.name,
            'occupancy', rt.occupancy,
            'inventory', rt.inventory,
            'available', rt.available_inventory,
            'price', rt.price,
            'early_bird_price', rt.early_bird_price
        ) ORDER BY rt.order_idx
    ) as room_types,
    
    -- Booking counts
    COUNT(CASE WHEN ra.status = 'approved' THEN 1 END) as confirmed_bookings,
    COUNT(CASE WHEN ra.status = 'waitlist' THEN 1 END) as waitlist_count,
    COUNT(CASE WHEN ra.status IN ('submitted', 'under_review') THEN 1 END) as pending_applications,
    
    -- Availability calculation
    r.capacity_total - COUNT(CASE WHEN ra.status = 'approved' THEN 1 END) as spots_remaining,
    
    -- Status flags
    CASE WHEN r.capacity_total - COUNT(CASE WHEN ra.status = 'approved' THEN 1 END) <= 0 THEN 'full'
         WHEN r.capacity_total - COUNT(CASE WHEN ra.status = 'approved' THEN 1 END) <= 3 THEN 'almost_full'
         ELSE 'available'
    END as availability_status

FROM retreats r
LEFT JOIN retreat_room_types rt ON rt.retreat_id = r.id AND rt.is_active = true
LEFT JOIN retreat_applications ra ON ra.retreat_id = r.id
WHERE r.is_active = true
GROUP BY r.id, r.title, r.start_date, r.end_date, r.capacity_total;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Retreats indexes
CREATE INDEX IF NOT EXISTS idx_retreats_tenant_id ON retreats(tenant_id);
CREATE INDEX IF NOT EXISTS idx_retreats_slug ON retreats(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_retreats_dates ON retreats(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_retreats_country ON retreats(country);
CREATE INDEX IF NOT EXISTS idx_retreats_visibility ON retreats(visibility, is_active);

-- Applications indexes
CREATE INDEX IF NOT EXISTS idx_retreat_applications_retreat_id ON retreat_applications(retreat_id);
CREATE INDEX IF NOT EXISTS idx_retreat_applications_customer_id ON retreat_applications(customer_id);
CREATE INDEX IF NOT EXISTS idx_retreat_applications_status ON retreat_applications(status);
CREATE INDEX IF NOT EXISTS idx_retreat_applications_submitted ON retreat_applications(submitted_at);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_retreat_bookings_application_id ON retreat_bookings(application_id);
CREATE INDEX IF NOT EXISTS idx_retreat_bookings_status ON retreat_bookings(status);
CREATE INDEX IF NOT EXISTS idx_retreat_bookings_balance_due ON retreat_bookings(balance_due_date);

-- Room allocations indexes
CREATE INDEX IF NOT EXISTS idx_retreat_room_allocations_retreat_id ON retreat_room_allocations(retreat_id);
CREATE INDEX IF NOT EXISTS idx_retreat_room_allocations_booking_id ON retreat_room_allocations(booking_id);
CREATE INDEX IF NOT EXISTS idx_retreat_room_allocations_roommate_group ON retreat_room_allocations(roommate_group_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_retreats_updated_at ON retreats;
CREATE TRIGGER update_retreats_updated_at BEFORE UPDATE ON retreats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_retreat_sections_updated_at ON retreat_sections;
CREATE TRIGGER update_retreat_sections_updated_at BEFORE UPDATE ON retreat_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_retreat_room_types_updated_at ON retreat_room_types;
CREATE TRIGGER update_retreat_room_types_updated_at BEFORE UPDATE ON retreat_room_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_retreat_addons_updated_at ON retreat_addons;
CREATE TRIGGER update_retreat_addons_updated_at BEFORE UPDATE ON retreat_addons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_retreat_discounts_updated_at ON retreat_discounts;
CREATE TRIGGER update_retreat_discounts_updated_at BEFORE UPDATE ON retreat_discounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_retreat_applications_updated_at ON retreat_applications;
CREATE TRIGGER update_retreat_applications_updated_at BEFORE UPDATE ON retreat_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_retreat_bookings_updated_at ON retreat_bookings;
CREATE TRIGGER update_retreat_bookings_updated_at BEFORE UPDATE ON retreat_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();