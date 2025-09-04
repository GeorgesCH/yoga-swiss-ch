-- =====================================================
-- DYNAMIC GLOBAL RETREATS SYSTEM SCHEMA
-- Scalable system for retreats abroad (Lithuania, Bali, etc.)
-- Lead generation landing pages with custom booking flows
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis" CASCADE; -- For location coordinates

-- =====================================================
-- RETREAT DESTINATIONS & LOCATIONS
-- =====================================================

-- Retreat destinations (countries/regions)
CREATE TABLE IF NOT EXISTS retreat_destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    
    -- Destination Info
    name JSONB NOT NULL, -- {"en": "Lithuania", "de": "Litauen", "fr": "Lituanie", "it": "Lituania"}
    country_code TEXT NOT NULL, -- ISO 3166-1 alpha-2 (LT, ID, CR, etc.)
    region JSONB, -- {"en": "Baltic States", "de": "Baltikum", "fr": "États baltes"}
    description JSONB, -- Multi-language descriptions
    
    -- Location Details
    coordinates POINT, -- PostGIS point for map display
    timezone TEXT NOT NULL DEFAULT 'UTC',
    currency TEXT DEFAULT 'EUR',
    
    -- Media
    hero_image_url TEXT,
    gallery_urls TEXT[],
    video_url TEXT,
    
    -- SEO & Marketing
    seo_slug TEXT UNIQUE NOT NULL,
    meta_title JSONB,
    meta_description JSONB,
    keywords TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Specific retreat venues within destinations
CREATE TABLE IF NOT EXISTS retreat_venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES retreat_destinations(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    
    -- Venue Info
    name JSONB NOT NULL,
    description JSONB,
    venue_type TEXT CHECK (venue_type IN ('hotel', 'villa', 'eco_lodge', 'resort', 'retreat_center', 'glamping', 'monastery', 'farm_stay')),
    
    -- Location
    address JSONB,
    coordinates POINT,
    
    -- Amenities & Features
    amenities TEXT[], -- ['yoga_shala', 'pool', 'spa', 'meditation_garden', 'wifi', 'restaurant']
    room_types JSONB DEFAULT '[]'::jsonb, -- [{type: 'single', name: {...}, capacity: 1, price_modifier: 0}]
    capacity_total INTEGER NOT NULL,
    
    -- Media
    images TEXT[],
    virtual_tour_url TEXT,
    
    -- Policies
    check_in_time TIME DEFAULT '15:00',
    check_out_time TIME DEFAULT '11:00',
    cancellation_policy JSONB,
    house_rules JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RETREAT PROGRAMS & TEMPLATES
-- =====================================================

-- Main retreats table (templates that can have multiple dates)
CREATE TABLE IF NOT EXISTS retreats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES retreat_destinations(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES retreat_venues(id) ON DELETE SET NULL,
    
    -- Basic Info
    title JSONB NOT NULL,
    subtitle JSONB,
    slug TEXT UNIQUE NOT NULL,
    description JSONB NOT NULL,
    long_description_md JSONB, -- Markdown content per language
    
    -- Program Details
    retreat_type TEXT CHECK (retreat_type IN ('yoga', 'meditation', 'wellness', 'spiritual', 'adventure', 'detox', 'womens', 'mens', 'couples', 'family')),
    style_tags TEXT[], -- ['vinyasa', 'yin', 'breathwork', 'ice_bath', 'forest_bathing']
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'all_levels')),
    
    -- Duration & Capacity
    duration_days INTEGER NOT NULL,
    duration_nights INTEGER NOT NULL,
    min_participants INTEGER DEFAULT 6,
    max_participants INTEGER NOT NULL DEFAULT 12,
    
    -- Instructors & Team
    lead_instructors UUID[] DEFAULT '{}', -- Array of instructor IDs
    supporting_team JSONB DEFAULT '[]'::jsonb, -- [{name: "...", role: "...", bio: "...", image: "..."}]
    
    -- Pricing Structure
    base_price DECIMAL(10,2) NOT NULL, -- Base price in retreat currency
    currency TEXT NOT NULL DEFAULT 'CHF',
    vat_rate DECIMAL(5,2) DEFAULT 0, -- Many retreat destinations are VAT-free
    deposit_amount DECIMAL(10,2),
    deposit_percentage DECIMAL(5,2),
    early_bird_discount DECIMAL(5,2), -- Percentage discount
    early_bird_deadline DATE,
    
    -- What's Included
    includes JSONB DEFAULT '[]'::jsonb, -- ["accommodation", "meals", "yoga_classes", "transport"]
    excludes JSONB DEFAULT '[]'::jsonb, -- ["flights", "insurance", "personal_expenses"]
    
    -- Daily Schedule Template
    daily_schedule JSONB DEFAULT '[]'::jsonb, -- [{day: 1, activities: [...]}]
    itinerary JSONB DEFAULT '[]'::jsonb, -- Detailed day-by-day itinerary
    
    -- Media & Marketing
    hero_image_url TEXT,
    gallery_urls TEXT[],
    video_url TEXT,
    testimonials JSONB DEFAULT '[]'::jsonb,
    
    -- Booking Configuration
    booking_form_config JSONB DEFAULT '{}'::jsonb, -- Custom form fields configuration
    auto_approve_bookings BOOLEAN DEFAULT false,
    requires_application BOOLEAN DEFAULT true,
    application_deadline_days INTEGER DEFAULT 30, -- Days before retreat start
    
    -- Policies
    cancellation_policy_md JSONB,
    terms_conditions_md JSONB,
    covid_policy_md JSONB,
    packing_list JSONB,
    
    -- SEO & Landing Page
    seo_title JSONB,
    seo_description JSONB,
    seo_keywords TEXT[],
    landing_page_config JSONB DEFAULT '{}'::jsonb, -- Custom landing page sections
    
    -- Status & Visibility
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'sold_out', 'cancelled', 'completed')),
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'by_link')),
    featured BOOLEAN DEFAULT false,
    
    -- Lead Generation
    lead_magnet_enabled BOOLEAN DEFAULT true,
    newsletter_signup_incentive JSONB, -- Free guide, early access, etc.
    tracking_pixels JSONB DEFAULT '[]'::jsonb, -- Facebook, Google, etc.
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Specific retreat dates/sessions
CREATE TABLE IF NOT EXISTS retreat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    retreat_id UUID NOT NULL REFERENCES retreats(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    
    -- Session Details
    name JSONB, -- Optional custom name like "Women's Only Session"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Capacity & Availability
    max_participants INTEGER, -- Override retreat default
    current_bookings INTEGER DEFAULT 0,
    waitlist_count INTEGER DEFAULT 0,
    
    -- Pricing Overrides
    price_override DECIMAL(10,2), -- Override base price for this session
    deposit_override DECIMAL(10,2),
    special_offer_text JSONB, -- "Early Bird Special", "Last 2 Spots"
    
    -- Session-Specific Details
    special_features JSONB DEFAULT '[]'::jsonb, -- Session-specific additions
    restrictions JSONB DEFAULT '{}'::jsonb, -- Age, gender, experience restrictions
    
    -- Status
    status TEXT DEFAULT 'open' CHECK (status IN ('draft', 'open', 'filling_up', 'waitlist', 'sold_out', 'cancelled', 'completed')),
    booking_deadline DATE,
    final_payment_deadline DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RETREAT BOOKINGS & APPLICATIONS
-- =====================================================

-- Retreat applications/bookings
CREATE TABLE IF NOT EXISTS retreat_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    retreat_id UUID NOT NULL REFERENCES retreats(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES retreat_sessions(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Application Status
    status TEXT DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'under_review', 'approved', 'waitlisted', 'declined', 
        'confirmed', 'deposit_paid', 'fully_paid', 'cancelled', 'completed'
    )),
    status_updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Room & Accommodation
    room_type TEXT, -- From venue room_types
    room_preference TEXT, -- 'single', 'shared', 'specific_roommate'
    roommate_request TEXT, -- Specific roommate name/email
    accommodation_notes TEXT,
    
    -- Pricing & Payment
    total_price DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL,
    deposit_amount DECIMAL(10,2),
    remaining_balance DECIMAL(10,2),
    early_bird_applied BOOLEAN DEFAULT false,
    discount_applied DECIMAL(5,2),
    discount_reason TEXT,
    
    -- Payment Status
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'deposit_paid', 'payment_plan', 'fully_paid', 'refunded', 'partial_refund'
    )),
    payment_plan JSONB DEFAULT '[]'::jsonb, -- [{amount: 500, due_date: "2024-03-01", status: "pending"}]
    
    -- Lead Source & Attribution
    lead_source TEXT, -- 'organic', 'facebook', 'google', 'referral', 'email'
    referral_code TEXT,
    utm_campaign TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_content TEXT,
    
    -- Application Data
    application_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- All form responses
    dietary_requirements TEXT[],
    medical_conditions TEXT,
    emergency_contact JSONB,
    
    -- Travel Information
    arrival_flight_info JSONB,
    departure_flight_info JSONB,
    visa_required BOOLEAN,
    passport_expiry DATE,
    travel_insurance BOOLEAN DEFAULT false,
    
    -- Admin Notes
    admin_notes TEXT,
    internal_tags TEXT[],
    risk_assessment TEXT, -- 'low', 'medium', 'high'
    follow_up_required BOOLEAN DEFAULT false,
    
    -- Communication
    last_contact_date TIMESTAMPTZ,
    email_sequence_stage TEXT,
    whatsapp_number TEXT,
    preferred_contact_method TEXT DEFAULT 'email',
    
    -- Timestamps
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(session_id, customer_id)
);

-- Payment records for retreat applications
CREATE TABLE IF NOT EXISTS retreat_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES retreat_applications(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    
    -- Payment Details
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL,
    payment_type TEXT CHECK (payment_type IN ('deposit', 'installment', 'balance', 'refund')),
    
    -- Payment Method
    payment_method TEXT CHECK (payment_method IN ('credit_card', 'bank_transfer', 'twint', 'paypal', 'crypto')),
    payment_provider TEXT, -- 'stripe', 'wise', 'revolut'
    transaction_id TEXT,
    reference TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    processed_at TIMESTAMPTZ,
    
    -- Metadata
    payment_metadata JSONB DEFAULT '{}'::jsonb,
    fees DECIMAL(10,2) DEFAULT 0,
    exchange_rate DECIMAL(10,6),
    original_currency TEXT,
    original_amount DECIMAL(10,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RETREAT ACTIVITIES & SCHEDULE
-- =====================================================

-- Activities available at retreats
CREATE TABLE IF NOT EXISTS retreat_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    retreat_id UUID NOT NULL REFERENCES retreats(id) ON DELETE CASCADE,
    
    -- Activity Details
    name JSONB NOT NULL,
    description JSONB,
    activity_type TEXT CHECK (activity_type IN (
        'yoga', 'meditation', 'breathwork', 'workshop', 'excursion', 
        'meal', 'spa', 'free_time', 'ceremony', 'adventure'
    )),
    
    -- Scheduling
    duration_minutes INTEGER,
    is_daily BOOLEAN DEFAULT false,
    is_optional BOOLEAN DEFAULT false,
    requires_booking BOOLEAN DEFAULT false,
    max_participants INTEGER,
    
    -- Requirements
    fitness_level_required TEXT,
    special_equipment JSONB,
    weather_dependent BOOLEAN DEFAULT false,
    
    -- Instructor/Guide
    instructor_id UUID REFERENCES auth.users(id),
    instructor_name TEXT, -- For external instructors
    instructor_bio JSONB,
    
    -- Pricing (for optional activities)
    additional_cost DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled activities for specific retreat sessions
CREATE TABLE IF NOT EXISTS retreat_session_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES retreat_sessions(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES retreat_activities(id) ON DELETE CASCADE,
    
    -- Schedule Details
    day_number INTEGER NOT NULL, -- Day of retreat (1, 2, 3, etc.)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT, -- 'yoga_shala', 'beach', 'forest', 'restaurant'
    
    -- Attendance
    participant_ids UUID[] DEFAULT '{}', -- For optional activities
    max_participants INTEGER,
    
    -- Notes
    special_instructions JSONB,
    weather_backup_plan TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RETREAT REVIEWS & TESTIMONIALS
-- =====================================================

-- Post-retreat reviews
CREATE TABLE IF NOT EXISTS retreat_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    retreat_id UUID NOT NULL REFERENCES retreats(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES retreat_sessions(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES retreat_applications(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    review_text TEXT,
    
    -- Detailed Ratings
    accommodation_rating INTEGER CHECK (accommodation_rating >= 1 AND accommodation_rating <= 5),
    food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
    activities_rating INTEGER CHECK (activities_rating >= 1 AND activities_rating <= 5),
    instructors_rating INTEGER CHECK (instructors_rating >= 1 AND instructors_rating <= 5),
    organization_rating INTEGER CHECK (organization_rating >= 1 AND organization_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    
    -- Recommendation
    would_recommend BOOLEAN,
    would_return BOOLEAN,
    favorite_aspect TEXT,
    improvement_suggestions TEXT,
    
    -- Media
    photos TEXT[],
    video_url TEXT,
    
    -- Moderation
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    moderated_at TIMESTAMPTZ,
    moderated_by UUID REFERENCES auth.users(id),
    
    -- Response
    organizer_response TEXT,
    response_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(application_id) -- One review per application
);

-- =====================================================
-- RETREAT COMMUNICATION & AUTOMATION
-- =====================================================

-- Email/SMS templates for retreats
CREATE TABLE IF NOT EXISTS retreat_communication_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    retreat_id UUID REFERENCES retreats(id) ON DELETE SET NULL, -- NULL = global template
    
    -- Template Details
    name TEXT NOT NULL,
    template_type TEXT CHECK (template_type IN (
        'application_received', 'application_approved', 'application_declined', 
        'waitlist_notification', 'payment_reminder', 'deposit_confirmation',
        'final_payment_due', 'pre_departure_info', 'packing_list',
        'arrival_instructions', 'post_retreat_followup', 'review_request',
        'newsletter_signup', 'early_bird_reminder'
    )),
    
    -- Content
    subject JSONB NOT NULL, -- Multi-language subjects
    content_html JSONB NOT NULL, -- HTML email content
    content_text JSONB, -- Plain text fallback
    sms_content JSONB, -- For SMS templates
    
    -- Trigger Configuration
    trigger_event TEXT,
    trigger_delay_hours INTEGER DEFAULT 0,
    send_time TIME DEFAULT '09:00', -- Preferred send time
    
    -- Automation
    is_automated BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Personalization
    merge_fields TEXT[] DEFAULT '{}', -- Available merge fields
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication history
CREATE TABLE IF NOT EXISTS retreat_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES retreat_applications(id) ON DELETE CASCADE,
    template_id UUID REFERENCES retreat_communication_templates(id),
    
    -- Communication Details
    communication_type TEXT CHECK (communication_type IN ('email', 'sms', 'whatsapp', 'call', 'in_person')),
    subject TEXT,
    content TEXT,
    
    -- Delivery
    recipient_email TEXT,
    recipient_phone TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    error_message TEXT,
    
    -- Metadata
    sent_by UUID REFERENCES auth.users(id),
    is_automated BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MARKETING & LEAD GENERATION
-- =====================================================

-- Lead magnets and opt-in forms
CREATE TABLE IF NOT EXISTS retreat_lead_magnets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    retreat_id UUID REFERENCES retreats(id) ON DELETE SET NULL,
    
    -- Lead Magnet Details
    title JSONB NOT NULL,
    description JSONB,
    magnet_type TEXT CHECK (magnet_type IN (
        'guide', 'checklist', 'video', 'email_course', 'discount', 
        'early_access', 'free_call', 'meditation', 'yoga_class'
    )),
    
    -- Content
    file_url TEXT, -- PDF guide, video, etc.
    content_description JSONB,
    delivery_method TEXT DEFAULT 'email' CHECK (delivery_method IN ('email', 'download', 'access_link')),
    
    -- Form Configuration
    form_fields JSONB DEFAULT '[]'::jsonb, -- Fields to collect
    privacy_policy_required BOOLEAN DEFAULT true,
    marketing_consent BOOLEAN DEFAULT true,
    
    -- Automation
    email_sequence_id UUID, -- Link to email automation
    tag_subscribers_with TEXT[], -- Tags to add to subscribers
    
    -- Analytics
    views INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead captures from retreat pages
CREATE TABLE IF NOT EXISTS retreat_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    retreat_id UUID REFERENCES retreats(id) ON DELETE SET NULL,
    lead_magnet_id UUID REFERENCES retreat_lead_magnets(id) ON DELETE SET NULL,
    
    -- Lead Information
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    country TEXT,
    
    -- Source & Attribution
    source TEXT, -- 'landing_page', 'popup', 'sidebar', 'footer'
    utm_campaign TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_content TEXT,
    referrer TEXT,
    
    -- Lead Data
    lead_data JSONB DEFAULT '{}'::jsonb, -- Any additional form data
    interests TEXT[], -- Retreat types they're interested in
    budget_range TEXT,
    preferred_dates TEXT,
    
    -- Status
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'unsubscribed')),
    lead_score INTEGER DEFAULT 0, -- 0-100 lead scoring
    
    -- Follow-up
    last_contact_date TIMESTAMPTZ,
    next_followup_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES auth.users(id),
    
    -- Consent
    marketing_consent BOOLEAN DEFAULT false,
    privacy_policy_accepted BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS & REPORTING
-- =====================================================

-- Retreat performance analytics
CREATE TABLE IF NOT EXISTS retreat_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    retreat_id UUID NOT NULL REFERENCES retreats(id) ON DELETE CASCADE,
    session_id UUID REFERENCES retreat_sessions(id) ON DELETE CASCADE,
    
    -- Date for analytics (daily aggregation)
    analytics_date DATE NOT NULL,
    
    -- Landing Page Metrics
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    time_on_page_seconds INTEGER DEFAULT 0,
    
    -- Lead Generation
    leads_generated INTEGER DEFAULT 0,
    lead_conversion_rate DECIMAL(5,2) DEFAULT 0,
    newsletter_signups INTEGER DEFAULT 0,
    
    -- Booking Funnel
    booking_form_starts INTEGER DEFAULT 0,
    booking_form_completions INTEGER DEFAULT 0,
    booking_conversion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Applications
    applications_submitted INTEGER DEFAULT 0,
    applications_approved INTEGER DEFAULT 0,
    applications_declined INTEGER DEFAULT 0,
    waitlist_signups INTEGER DEFAULT 0,
    
    -- Revenue
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    deposits_collected DECIMAL(10,2) DEFAULT 0,
    average_booking_value DECIMAL(10,2) DEFAULT 0,
    
    -- Social & Engagement
    social_shares INTEGER DEFAULT 0,
    social_platform TEXT, -- If tracking specific platform
    email_opens INTEGER DEFAULT 0,
    email_clicks INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(retreat_id, session_id, analytics_date, social_platform)
);

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Retreat performance summary view
CREATE OR REPLACE VIEW retreat_performance_view AS
SELECT 
    r.id,
    r.title,
    r.slug,
    r.org_id,
    r.destination_id,
    rd.name as destination_name,
    r.status,
    r.featured,
    
    -- Session Stats
    COUNT(rs.id) as total_sessions,
    COUNT(CASE WHEN rs.status = 'open' THEN 1 END) as open_sessions,
    COUNT(CASE WHEN rs.status = 'sold_out' THEN 1 END) as sold_out_sessions,
    
    -- Booking Stats
    COUNT(ra.id) as total_applications,
    COUNT(CASE WHEN ra.status = 'approved' THEN 1 END) as approved_applications,
    COUNT(CASE WHEN ra.status = 'confirmed' THEN 1 END) as confirmed_bookings,
    COUNT(CASE WHEN ra.status = 'fully_paid' THEN 1 END) as fully_paid_bookings,
    COUNT(CASE WHEN ra.status = 'waitlisted' THEN 1 END) as waitlisted_applications,
    
    -- Revenue Stats
    COALESCE(SUM(CASE WHEN ra.status IN ('confirmed', 'fully_paid', 'completed') THEN ra.total_price END), 0) as total_revenue,
    COALESCE(SUM(CASE WHEN ra.payment_status IN ('deposit_paid', 'fully_paid') THEN ra.deposit_amount END), 0) as deposits_collected,
    COALESCE(AVG(CASE WHEN ra.status IN ('approved', 'confirmed', 'fully_paid') THEN ra.total_price END), 0) as avg_booking_value,
    
    -- Lead Generation
    COUNT(rl.id) as total_leads,
    CASE 
        WHEN COUNT(rl.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN ra.id IS NOT NULL THEN 1 END)::decimal / COUNT(rl.id)) * 100, 2)
        ELSE 0 
    END as lead_conversion_rate,
    
    -- Reviews
    COUNT(rr.id) as review_count,
    COALESCE(AVG(rr.rating::decimal), 0) as avg_rating,
    COUNT(CASE WHEN rr.would_recommend = true THEN 1 END) as recommendation_count,
    
    -- Occupancy Rate
    CASE 
        WHEN SUM(rs.max_participants) > 0 THEN 
            ROUND((COUNT(CASE WHEN ra.status IN ('confirmed', 'fully_paid', 'completed') THEN 1 END)::decimal / SUM(rs.max_participants)) * 100, 2)
        ELSE 0 
    END as occupancy_rate

FROM retreats r
LEFT JOIN retreat_destinations rd ON rd.id = r.destination_id
LEFT JOIN retreat_sessions rs ON rs.retreat_id = r.id
LEFT JOIN retreat_applications ra ON ra.retreat_id = r.id
LEFT JOIN retreat_leads rl ON rl.retreat_id = r.id
LEFT JOIN retreat_reviews rr ON rr.retreat_id = r.id AND rr.is_published = true
GROUP BY r.id, r.title, r.slug, r.org_id, r.destination_id, rd.name, r.status, r.featured;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Retreats indexes
CREATE INDEX IF NOT EXISTS idx_retreats_org_id ON retreats(org_id);
CREATE INDEX IF NOT EXISTS idx_retreats_destination_id ON retreats(destination_id);
CREATE INDEX IF NOT EXISTS idx_retreats_slug ON retreats(slug);
CREATE INDEX IF NOT EXISTS idx_retreats_status ON retreats(status, visibility);
CREATE INDEX IF NOT EXISTS idx_retreats_featured ON retreats(featured, status);

-- Retreat sessions indexes
CREATE INDEX IF NOT EXISTS idx_retreat_sessions_retreat_id ON retreat_sessions(retreat_id);
CREATE INDEX IF NOT EXISTS idx_retreat_sessions_dates ON retreat_sessions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_retreat_sessions_status ON retreat_sessions(status);

-- Applications indexes
CREATE INDEX IF NOT EXISTS idx_retreat_applications_retreat_id ON retreat_applications(retreat_id);
CREATE INDEX IF NOT EXISTS idx_retreat_applications_session_id ON retreat_applications(session_id);
CREATE INDEX IF NOT EXISTS idx_retreat_applications_customer_id ON retreat_applications(customer_id);
CREATE INDEX IF NOT EXISTS idx_retreat_applications_status ON retreat_applications(status);
CREATE INDEX IF NOT EXISTS idx_retreat_applications_lead_source ON retreat_applications(lead_source, utm_source);

-- Communications indexes
CREATE INDEX IF NOT EXISTS idx_retreat_communications_application_id ON retreat_communications(application_id);
CREATE INDEX IF NOT EXISTS idx_retreat_communications_sent_at ON retreat_communications(sent_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_retreat_analytics_retreat_id ON retreat_analytics(retreat_id);
CREATE INDEX IF NOT EXISTS idx_retreat_analytics_date ON retreat_analytics(analytics_date);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Apply updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_retreat_destinations_updated_at ON retreat_destinations;
CREATE TRIGGER update_retreat_destinations_updated_at BEFORE UPDATE ON retreat_destinations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_retreat_venues_updated_at ON retreat_venues;
CREATE TRIGGER update_retreat_venues_updated_at BEFORE UPDATE ON retreat_venues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_retreats_updated_at ON retreats;
CREATE TRIGGER update_retreats_updated_at BEFORE UPDATE ON retreats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_retreat_sessions_updated_at ON retreat_sessions;
CREATE TRIGGER update_retreat_sessions_updated_at BEFORE UPDATE ON retreat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_retreat_applications_updated_at ON retreat_applications;
CREATE TRIGGER update_retreat_applications_updated_at BEFORE UPDATE ON retreat_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE retreat_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE retreat_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE retreats ENABLE ROW LEVEL SECURITY;
ALTER TABLE retreat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE retreat_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE retreat_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE retreat_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE retreat_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE retreat_leads ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for retreats
CREATE POLICY "Public can view published retreats" ON retreats
    FOR SELECT USING (visibility = 'public' AND status = 'published');

CREATE POLICY "Org users can manage retreats" ON retreats
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM org_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Applications policies
CREATE POLICY "Users can view their applications" ON retreat_applications
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Users can create applications" ON retreat_applications
    FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Org staff can manage applications" ON retreat_applications
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM org_users 
            WHERE user_id = auth.uid() AND role IN ('owner', 'manager', 'staff') AND status = 'active'
        )
    );

-- Similar policies for other tables...
CREATE POLICY "Public destinations" ON retreat_destinations
    FOR SELECT USING (is_active = true);

CREATE POLICY "Applications follow retreat access" ON retreat_applications
    FOR SELECT USING (
        customer_id = auth.uid() OR
        retreat_id IN (
            SELECT id FROM retreats 
            WHERE org_id IN (
                SELECT org_id FROM org_users 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );