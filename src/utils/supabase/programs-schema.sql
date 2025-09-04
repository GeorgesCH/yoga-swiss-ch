-- =====================================================
-- PROGRAMS AS APPOINTMENTS SCHEMA
-- Individual 1-to-1 services with appointment booking
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROGRAMS CATALOG
-- =====================================================

-- Main programs table
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    
    -- Basic Info
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    summary TEXT,
    long_description_md TEXT,
    
    -- Classification
    category TEXT NOT NULL CHECK (category IN ('coaching', 'mobility', 'reiki', 'private_class', 'therapy', 'assessment', 'consultation')),
    delivery_mode TEXT NOT NULL CHECK (delivery_mode IN ('in_person', 'online', 'hybrid')),
    
    -- Session Configuration
    session_length_min INTEGER NOT NULL DEFAULT 60,
    is_multi_session BOOLEAN DEFAULT false,
    default_sessions_count INTEGER DEFAULT 1,
    max_sessions_count INTEGER,
    
    -- Availability
    availability_rules JSONB DEFAULT '{}'::jsonb,
    booking_window_days INTEGER DEFAULT 30,
    min_advance_booking_hours INTEGER DEFAULT 24,
    max_advance_booking_days INTEGER DEFAULT 90,
    
    -- Content & Media
    media_banner_url TEXT,
    thumbnail_url TEXT,
    gallery_urls TEXT[],
    tags TEXT[],
    
    -- SEO & Visibility
    visibility TEXT DEFAULT 'draft' CHECK (visibility IN ('draft', 'private', 'by_link', 'public')),
    seo_json JSONB DEFAULT '{}'::jsonb,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    
    -- Policies
    cancellation_policy_md TEXT,
    terms_conditions_md TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    
    -- Constraints
    UNIQUE(org_id, slug),
    CHECK (session_length_min > 0),
    CHECK (default_sessions_count > 0),
    CHECK (NOT is_multi_session OR default_sessions_count > 1)
);

-- Program variants (pricing tiers)
CREATE TABLE IF NOT EXISTS program_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    
    -- Variant Info
    name TEXT NOT NULL,
    description TEXT,
    sessions_count INTEGER NOT NULL DEFAULT 1,
    
    -- Pricing
    currency TEXT DEFAULT 'CHF',
    price DECIMAL(10,2) NOT NULL,
    credit_price INTEGER, -- How many class credits can be used
    vat_rate DECIMAL(5,2) DEFAULT 7.7,
    
    -- Payment Options
    deposit_amount DECIMAL(10,2),
    deposit_percentage DECIMAL(5,2),
    pay_plan_json JSONB DEFAULT '{}'::jsonb, -- Payment plan configuration
    
    -- Availability
    is_active BOOLEAN DEFAULT true,
    max_bookings INTEGER, -- Max concurrent bookings for this variant
    order_idx INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CHECK (price > 0),
    CHECK (sessions_count > 0),
    CHECK (deposit_percentage IS NULL OR (deposit_percentage >= 0 AND deposit_percentage <= 100))
);

-- =====================================================
-- INTAKE FORMS & MILESTONES
-- =====================================================

-- Custom intake forms for programs
CREATE TABLE IF NOT EXISTS program_intake_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    
    -- Form Configuration
    form_schema_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_required BOOLEAN DEFAULT false,
    show_after_booking BOOLEAN DEFAULT false, -- Show during booking vs after payment
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Program milestones and progress tracking
CREATE TABLE IF NOT EXISTS program_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    
    -- Milestone Info
    name TEXT NOT NULL,
    description_md TEXT,
    milestone_type TEXT DEFAULT 'checkpoint' CHECK (milestone_type IN ('intake', 'assessment', 'homework', 'checkpoint', 'completion')),
    
    -- Scheduling
    due_day_offset INTEGER, -- Days after booking/session start
    due_session_number INTEGER, -- Due after specific session number
    
    -- Configuration
    is_required BOOLEAN DEFAULT false,
    allows_file_upload BOOLEAN DEFAULT false,
    instructor_review_required BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    order_idx INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BOOKINGS & SESSIONS
-- =====================================================

-- Program bookings
CREATE TABLE IF NOT EXISTS program_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES program_variants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Booking Status
    status TEXT DEFAULT 'reserved' CHECK (status IN ('reserved', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    status_updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Financial
    order_id UUID REFERENCES orders(id),
    total_price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'CHF',
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'deposit_paid', 'paid', 'refunded', 'partially_refunded')),
    
    -- Source & Attribution
    source TEXT DEFAULT 'direct' CHECK (source IN ('direct', 'referral', 'marketing', 'instructor')),
    referral_code TEXT,
    utm_source TEXT,
    
    -- Access
    private_link_token TEXT UNIQUE, -- For by_link programs
    
    -- Customer Info
    intake_responses JSONB DEFAULT '{}'::jsonb,
    customer_notes TEXT,
    
    -- Admin Notes
    admin_notes TEXT,
    internal_notes TEXT,
    
    -- Timestamps
    booked_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CHECK (total_price >= 0)
);

-- Individual sessions within program bookings
CREATE TABLE IF NOT EXISTS program_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES program_bookings(id) ON DELETE CASCADE,
    
    -- Session Info
    session_number INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    
    -- Scheduling
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Europe/Zurich',
    
    -- Location
    location_id UUID REFERENCES locations(id),
    location_type TEXT DEFAULT 'studio' CHECK (location_type IN ('studio', 'online', 'customer_home', 'outdoor', 'other')),
    meeting_url TEXT,
    meeting_password TEXT,
    address_override TEXT,
    
    -- Session Status
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled')),
    
    -- Attendance
    customer_check_in_at TIMESTAMPTZ,
    instructor_check_in_at TIMESTAMPTZ,
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    
    -- Session Notes
    pre_session_notes_md TEXT,
    session_notes_md TEXT,
    notes_private_md TEXT, -- Instructor-only notes
    homework_assigned_md TEXT,
    
    -- Rescheduling
    original_starts_at TIMESTAMPTZ,
    rescheduled_by UUID REFERENCES auth.users(id),
    rescheduled_at TIMESTAMPTZ,
    rescheduled_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CHECK (starts_at < ends_at),
    CHECK (session_number > 0)
);

-- Progress tracking and milestone completion
CREATE TABLE IF NOT EXISTS program_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES program_bookings(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES program_milestones(id) ON DELETE SET NULL,
    session_id UUID REFERENCES program_sessions(id) ON DELETE SET NULL,
    
    -- Progress Info
    milestone_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description_md TEXT,
    
    -- Completion
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id),
    
    -- Artifacts
    artifact_url TEXT,
    artifact_type TEXT, -- 'document', 'image', 'video', 'audio'
    response_json JSONB DEFAULT '{}'::jsonb,
    
    -- Assessment
    instructor_feedback_md TEXT,
    customer_notes_md TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'skipped')),
    due_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INSTRUCTOR AVAILABILITY
-- =====================================================

-- Instructor availability specifically for programs
CREATE TABLE IF NOT EXISTS program_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE, -- NULL = applies to all programs
    
    -- Time Slots
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Dates
    effective_from DATE NOT NULL,
    effective_until DATE,
    
    -- Configuration
    slot_duration_min INTEGER NOT NULL DEFAULT 60,
    buffer_before_min INTEGER DEFAULT 15,
    buffer_after_min INTEGER DEFAULT 15,
    
    -- Capacity
    max_concurrent_sessions INTEGER DEFAULT 1,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CHECK (start_time < end_time),
    CHECK (slot_duration_min > 0)
);

-- Instructor availability overrides (exceptions)
CREATE TABLE IF NOT EXISTS program_availability_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Date/Time
    override_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    
    -- Override Type
    override_type TEXT NOT NULL CHECK (override_type IN ('available', 'unavailable', 'busy')),
    reason TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REVIEWS & FEEDBACK
-- =====================================================

-- Program reviews and ratings
CREATE TABLE IF NOT EXISTS program_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES program_bookings(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    review_text TEXT,
    
    -- Detailed Ratings
    instructor_rating INTEGER CHECK (instructor_rating >= 1 AND instructor_rating <= 5),
    content_rating INTEGER CHECK (content_rating >= 1 AND content_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    experience_rating INTEGER CHECK (experience_rating >= 1 AND experience_rating <= 5),
    
    -- Recommendation
    would_recommend BOOLEAN,
    would_book_again BOOLEAN,
    
    -- Moderation
    is_published BOOLEAN DEFAULT false,
    moderated_at TIMESTAMPTZ,
    moderated_by UUID REFERENCES auth.users(id),
    moderation_notes TEXT,
    
    -- Response
    instructor_response TEXT,
    instructor_response_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(booking_id) -- One review per booking
);

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Program performance view
CREATE OR REPLACE VIEW program_performance_view AS
SELECT 
    p.id,
    p.org_id,
    p.title,
    p.category,
    p.delivery_mode,
    p.is_active,
    p.featured,
    
    -- Booking Stats
    COUNT(pb.id) as total_bookings,
    COUNT(CASE WHEN pb.status = 'confirmed' THEN 1 END) as confirmed_bookings,
    COUNT(CASE WHEN pb.status = 'completed' THEN 1 END) as completed_bookings,
    COUNT(CASE WHEN pb.status = 'cancelled' THEN 1 END) as cancelled_bookings,
    
    -- Revenue Stats
    COALESCE(SUM(CASE WHEN pb.status IN ('confirmed', 'completed') THEN pb.total_price END), 0) as total_revenue,
    COALESCE(AVG(CASE WHEN pb.status IN ('confirmed', 'completed') THEN pb.total_price END), 0) as avg_booking_value,
    
    -- Session Stats
    COUNT(ps.id) as total_sessions,
    COUNT(CASE WHEN ps.status = 'completed' THEN 1 END) as completed_sessions,
    COUNT(CASE WHEN ps.status = 'no_show' THEN 1 END) as no_show_sessions,
    
    -- Review Stats
    COUNT(pr.id) as review_count,
    COALESCE(AVG(pr.rating::decimal), 0) as avg_rating,
    COUNT(CASE WHEN pr.would_recommend = true THEN 1 END) as recommendation_count,
    
    -- Conversion Rates
    CASE 
        WHEN COUNT(pb.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN pb.status = 'completed' THEN 1 END)::decimal / COUNT(pb.id)) * 100, 2)
        ELSE 0 
    END as completion_rate,
    
    CASE 
        WHEN COUNT(ps.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN ps.status = 'no_show' THEN 1 END)::decimal / COUNT(ps.id)) * 100, 2)
        ELSE 0 
    END as no_show_rate

FROM programs p
LEFT JOIN program_bookings pb ON pb.program_id = p.id
LEFT JOIN program_sessions ps ON ps.booking_id = pb.id
LEFT JOIN program_reviews pr ON pr.program_id = p.id AND pr.is_published = true
GROUP BY p.id, p.org_id, p.title, p.category, p.delivery_mode, p.is_active, p.featured;

-- Instructor program dashboard view
CREATE OR REPLACE VIEW instructor_program_dashboard_view AS
SELECT 
    up.id as instructor_id,
    up.full_name as instructor_name,
    
    -- Program Stats
    COUNT(DISTINCT p.id) as active_programs,
    COUNT(DISTINCT CASE WHEN p.featured THEN p.id END) as featured_programs,
    
    -- This Week's Sessions
    COUNT(DISTINCT CASE 
        WHEN ps.starts_at >= date_trunc('week', CURRENT_TIMESTAMP) 
        AND ps.starts_at < date_trunc('week', CURRENT_TIMESTAMP) + INTERVAL '1 week'
        AND ps.status IN ('scheduled', 'confirmed')
        THEN ps.id 
    END) as this_week_sessions,
    
    -- Earnings (This Month)
    COALESCE(SUM(CASE 
        WHEN pb.status = 'completed' 
        AND pb.completed_at >= date_trunc('month', CURRENT_TIMESTAMP)
        THEN pb.total_price * 0.7 -- Assuming 70% instructor commission
    END), 0) as this_month_earnings,
    
    -- Reviews
    COALESCE(AVG(pr.instructor_rating::decimal), 0) as avg_instructor_rating,
    COUNT(pr.id) as total_reviews

FROM user_profiles up
LEFT JOIN programs p ON p.instructor_id = up.id AND p.is_active = true
LEFT JOIN program_bookings pb ON pb.program_id = p.id
LEFT JOIN program_sessions ps ON ps.booking_id = pb.id
LEFT JOIN program_reviews pr ON pr.instructor_id = up.id AND pr.is_published = true
WHERE up.role = 'instructor'
GROUP BY up.id, up.full_name;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Programs indexes
CREATE INDEX IF NOT EXISTS idx_programs_org_id ON programs(org_id);
CREATE INDEX IF NOT EXISTS idx_programs_instructor_id ON programs(instructor_id);
CREATE INDEX IF NOT EXISTS idx_programs_slug ON programs(org_id, slug);
CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category);
CREATE INDEX IF NOT EXISTS idx_programs_visibility ON programs(visibility, is_active);
CREATE INDEX IF NOT EXISTS idx_programs_featured ON programs(featured, is_active);

-- Program variants indexes
CREATE INDEX IF NOT EXISTS idx_program_variants_program_id ON program_variants(program_id);
CREATE INDEX IF NOT EXISTS idx_program_variants_active ON program_variants(is_active);

-- Program bookings indexes
CREATE INDEX IF NOT EXISTS idx_program_bookings_program_id ON program_bookings(program_id);
CREATE INDEX IF NOT EXISTS idx_program_bookings_customer_id ON program_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_program_bookings_instructor_id ON program_bookings(instructor_id);
CREATE INDEX IF NOT EXISTS idx_program_bookings_status ON program_bookings(status);
CREATE INDEX IF NOT EXISTS idx_program_bookings_dates ON program_bookings(booked_at, completed_at);

-- Program sessions indexes
CREATE INDEX IF NOT EXISTS idx_program_sessions_booking_id ON program_sessions(booking_id);
CREATE INDEX IF NOT EXISTS idx_program_sessions_dates ON program_sessions(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_program_sessions_status ON program_sessions(status);
CREATE INDEX IF NOT EXISTS idx_program_sessions_instructor_schedule ON program_sessions(booking_id, starts_at) 
    WHERE status IN ('scheduled', 'confirmed', 'in_progress');

-- Availability indexes
CREATE INDEX IF NOT EXISTS idx_program_availability_instructor ON program_availability(instructor_id, is_active);
CREATE INDEX IF NOT EXISTS idx_program_availability_program ON program_availability(program_id, is_active);
CREATE INDEX IF NOT EXISTS idx_program_availability_schedule ON program_availability(day_of_week, start_time, end_time);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Update timestamps function (reuse existing if available)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_programs_updated_at ON programs;
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_program_variants_updated_at ON program_variants;
CREATE TRIGGER update_program_variants_updated_at BEFORE UPDATE ON program_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_program_bookings_updated_at ON program_bookings;
CREATE TRIGGER update_program_bookings_updated_at BEFORE UPDATE ON program_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_program_sessions_updated_at ON program_sessions;
CREATE TRIGGER update_program_sessions_updated_at BEFORE UPDATE ON program_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_program_progress_updated_at ON program_progress;
CREATE TRIGGER update_program_progress_updated_at BEFORE UPDATE ON program_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_availability_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_reviews ENABLE ROW LEVEL SECURITY;

-- Programs policies
CREATE POLICY "Users can view public programs" ON programs
    FOR SELECT USING (visibility = 'public' AND is_active = true);

CREATE POLICY "Users can view org programs" ON programs
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM org_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Instructors can manage their programs" ON programs
    FOR ALL USING (
        instructor_id = auth.uid() OR
        org_id IN (
            SELECT org_id FROM org_users 
            WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Program bookings policies
CREATE POLICY "Customers can view their bookings" ON program_bookings
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Instructors can view their program bookings" ON program_bookings
    FOR SELECT USING (
        instructor_id = auth.uid() OR
        program_id IN (
            SELECT p.id FROM programs p
            JOIN program_bookings pb ON pb.program_id = p.id
            WHERE p.org_id IN (
                SELECT org_id FROM org_users 
                WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
            )
        )
    );

CREATE POLICY "Customers can create bookings" ON program_bookings
    FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Instructors can update their bookings" ON program_bookings
    FOR UPDATE USING (
        instructor_id = auth.uid() OR
        program_id IN (
            SELECT p.id FROM programs p
            WHERE p.org_id IN (
                SELECT org_id FROM org_users 
                WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
            )
        )
    );

-- Program sessions policies (inherit from bookings)
CREATE POLICY "Sessions follow booking permissions" ON program_sessions
    FOR ALL USING (
        booking_id IN (
            SELECT id FROM program_bookings
            WHERE customer_id = auth.uid() OR instructor_id = auth.uid() OR
            program_id IN (
                SELECT p.id FROM programs p
                WHERE p.org_id IN (
                    SELECT org_id FROM org_users 
                    WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
                )
            )
        )
    );

-- Similar policies for other tables...
CREATE POLICY "Variants follow program permissions" ON program_variants
    FOR ALL USING (
        program_id IN (SELECT id FROM programs) -- Will be filtered by programs RLS
    );

CREATE POLICY "Forms follow program permissions" ON program_intake_forms
    FOR ALL USING (
        program_id IN (SELECT id FROM programs) -- Will be filtered by programs RLS  
    );

CREATE POLICY "Milestones follow program permissions" ON program_milestones
    FOR ALL USING (
        program_id IN (SELECT id FROM programs) -- Will be filtered by programs RLS
    );

CREATE POLICY "Progress follows booking permissions" ON program_progress
    FOR ALL USING (
        booking_id IN (SELECT id FROM program_bookings) -- Will be filtered by bookings RLS
    );

CREATE POLICY "Instructor availability" ON program_availability
    FOR ALL USING (
        instructor_id = auth.uid() OR
        instructor_id IN (
            SELECT up.id FROM user_profiles up
            JOIN org_users ou ON ou.user_id = up.id
            WHERE ou.org_id IN (
                SELECT org_id FROM org_users 
                WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
            )
        )
    );

CREATE POLICY "Reviews follow booking permissions" ON program_reviews
    FOR SELECT USING (
        (customer_id = auth.uid() AND is_published = true) OR
        instructor_id = auth.uid() OR
        program_id IN (
            SELECT p.id FROM programs p
            WHERE p.org_id IN (
                SELECT org_id FROM org_users 
                WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
            )
        )
    );

CREATE POLICY "Customers can create reviews" ON program_reviews
    FOR INSERT WITH CHECK (
        customer_id = auth.uid() AND
        booking_id IN (
            SELECT id FROM program_bookings 
            WHERE customer_id = auth.uid() AND status = 'completed'
        )
    );