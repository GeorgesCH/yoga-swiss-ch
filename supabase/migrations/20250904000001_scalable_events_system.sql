-- =====================================================
-- Scalable Events & Registrations System Migration
-- Migration: 20250904000001_scalable_events_system
-- Implements Series + Events model for high-scale bookings
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- =====================================================
-- STEP 1: NEW SCALABLE DATA MODEL
-- =====================================================

-- Class Series (recurrence & defaults)
CREATE TABLE IF NOT EXISTS public.class_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_name text NOT NULL,
  timezone text NOT NULL DEFAULT 'Europe/Zurich',
  rrule text,                                -- RFC5545 string, NULL for one-off sets
  start_date date NOT NULL,
  end_date date,                              -- NULL = open-ended
  default_duration_mins int NOT NULL,
  default_capacity int,                       -- NULL = unlimited
  default_price_cents int NOT NULL,
  location_id uuid REFERENCES public.locations(id),
  instructor_id uuid REFERENCES public.profiles(id),
  metadata jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',      -- active, paused, archived
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Class Events (bookable rows; partitioned by month)
CREATE TABLE IF NOT EXISTS public.class_events (
  id uuid DEFAULT gen_random_uuid(),
  series_id uuid REFERENCES public.class_series(id),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,                        -- snapshot from series/template
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  capacity int,                               -- nullable => unlimited
  reg_count int NOT NULL DEFAULT 0,
  waitlist_count int NOT NULL DEFAULT 0,
  price_cents int NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',   -- scheduled, cancelled, completed
  location_id uuid REFERENCES public.locations(id),
  instructor_id uuid REFERENCES public.profiles(id),
  snapshot jsonb NOT NULL DEFAULT '{}',       -- duration, tags, image, etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id, start_at)
) PARTITION BY RANGE (start_at);

-- Registrations (unique seat per event & profile; partitioned by event month recommended)
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'confirmed',   -- confirmed, cancelled, no_show, refunded
  idempotency_key text UNIQUE,               -- to make booking retries safe
  booked_at timestamptz DEFAULT now(),
  cancel_reason text,
  metadata jsonb NOT NULL DEFAULT '{}'
);

-- Booking Holds (optional; for high-demand events)
CREATE TABLE IF NOT EXISTS public.booking_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (event_id, profile_id)
);

-- Enhanced Waitlists
CREATE TABLE IF NOT EXISTS public.event_waitlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  position int NOT NULL,
  added_at timestamptz DEFAULT now(),
  notified_at timestamptz,
  promoted_at timestamptz,
  expires_at timestamptz,
  UNIQUE (event_id, profile_id)
);

-- Outbox Events (for async email, webhooks, search)
CREATE TABLE IF NOT EXISTS public.outbox_events (
  id bigserial PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type text NOT NULL,                         -- e.g., registration.created
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

-- Rate Limiting Table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key text PRIMARY KEY,
  tokens int NOT NULL,
  refill_rate int NOT NULL,        -- tokens per minute
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- STEP 2: CREATE MONTHLY PARTITIONS FOR CLASS_EVENTS
-- =====================================================

-- Create partitions for current month -1 to +18 months
DO $$
DECLARE
    start_date date;
    end_date date;
    partition_name text;
    year_month text;
BEGIN
    -- Start from previous month
    start_date := date_trunc('month', CURRENT_DATE - interval '1 month');
    
    -- Create 20 monthly partitions (past 1 + current + future 18)
    FOR i IN 0..19 LOOP
        year_month := to_char(start_date + (i || ' months')::interval, 'YYYY_MM');
        partition_name := 'class_events_' || year_month;
        end_date := start_date + (i + 1 || ' months')::interval;
        
        EXECUTE format('
            CREATE TABLE IF NOT EXISTS %I PARTITION OF public.class_events
            FOR VALUES FROM (%L) TO (%L)',
            partition_name,
            start_date + (i || ' months')::interval,
            end_date
        );
    END LOOP;
END $$;

-- =====================================================
-- STEP 3: INDEXES FOR PERFORMANCE
-- =====================================================

-- Class Series indexes
CREATE INDEX IF NOT EXISTS idx_class_series_org ON public.class_series(organization_id);
CREATE INDEX IF NOT EXISTS idx_class_series_status ON public.class_series(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_class_series_dates ON public.class_series(start_date, end_date);

-- Class Events indexes (will be created on each partition)
CREATE INDEX IF NOT EXISTS idx_class_events_org_start ON public.class_events(organization_id, start_at);
CREATE INDEX IF NOT EXISTS idx_class_events_status_start ON public.class_events(status, start_at) WHERE status='scheduled';
CREATE INDEX IF NOT EXISTS idx_class_events_series ON public.class_events(series_id);
CREATE INDEX IF NOT EXISTS idx_class_events_instructor ON public.class_events(instructor_id, start_at);
CREATE INDEX IF NOT EXISTS idx_class_events_location ON public.class_events(location_id, start_at);

-- BRIN index for time-series data
CREATE INDEX IF NOT EXISTS idx_class_events_brin_start ON public.class_events USING BRIN(start_at);

-- Registrations indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_event_profile ON public.registrations(event_id, profile_id);
CREATE INDEX IF NOT EXISTS idx_registrations_profile ON public.registrations(profile_id, booked_at);
CREATE INDEX IF NOT EXISTS idx_registrations_org_event ON public.registrations(organization_id, event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(organization_id, status);

-- Booking Holds indexes
CREATE INDEX IF NOT EXISTS idx_booking_holds_expires ON public.booking_holds(expires_at);
CREATE INDEX IF NOT EXISTS idx_booking_holds_event ON public.booking_holds(event_id);

-- Waitlist indexes
CREATE INDEX IF NOT EXISTS idx_event_waitlists_event_position ON public.event_waitlists(event_id, position);
CREATE INDEX IF NOT EXISTS idx_event_waitlists_profile ON public.event_waitlists(profile_id);
CREATE INDEX IF NOT EXISTS idx_event_waitlists_expires ON public.event_waitlists(expires_at) WHERE expires_at IS NOT NULL;

-- Outbox indexes
CREATE INDEX IF NOT EXISTS idx_outbox_events_unprocessed ON public.outbox_events(created_at) WHERE processed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_outbox_events_type ON public.outbox_events(type, created_at) WHERE processed_at IS NULL;

-- =====================================================
-- STEP 4: ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE public.class_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_waitlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox_events ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies (tenant isolation + public discovery)
-- Class Events: public read for discovery
CREATE POLICY class_events_public_read
ON public.class_events
FOR SELECT
USING (status = 'scheduled');

-- Class Events: org members can manage
CREATE POLICY class_events_org_manage
ON public.class_events
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.organization_members 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Registrations: users can read their own
CREATE POLICY registrations_own_read
ON public.registrations
FOR SELECT
USING (profile_id = auth.uid());

-- Registrations: org staff can manage
CREATE POLICY registrations_org_manage
ON public.registrations
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.organization_members 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'studio_manager', 'front_desk', 'instructor')
    AND is_active = true
  )
);

-- Similar policies for other tables
CREATE POLICY class_series_org_access ON public.class_series FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY booking_holds_own_access ON public.booking_holds FOR ALL USING (
  profile_id = auth.uid() OR 
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'studio_manager', 'front_desk') AND is_active = true
  )
);

CREATE POLICY event_waitlists_access ON public.event_waitlists FOR ALL USING (
  profile_id = auth.uid() OR 
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'studio_manager', 'front_desk', 'instructor') AND is_active = true
  )
);

-- Outbox events: service role only (handled in Edge Functions)
CREATE POLICY outbox_events_service_only ON public.outbox_events FOR ALL USING (false);

-- =====================================================
-- STEP 5: TRIGGERS & AUTOMATION
-- =====================================================

-- Updated at triggers
CREATE TRIGGER update_class_series_updated_at 
  BEFORE UPDATE ON public.class_series 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_events_updated_at 
  BEFORE UPDATE ON public.class_events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 6: HELPER FUNCTIONS
-- =====================================================

-- Function to create new monthly partitions
CREATE OR REPLACE FUNCTION public.create_monthly_partition(table_name text, start_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    partition_name text;
    end_date date;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + interval '1 month';
    
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I PARTITION OF public.%I
        FOR VALUES FROM (%L) TO (%L)',
        partition_name, table_name, start_date, end_date
    );
    
    -- Create indexes on the new partition
    IF table_name = 'class_events' THEN
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I(organization_id, start_at)', 
                      'idx_' || partition_name || '_org_start', partition_name);
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I(status, start_at) WHERE status=''scheduled''', 
                      'idx_' || partition_name || '_status_start', partition_name);
    END IF;
END $$;

-- Function to automatically create future partitions
CREATE OR REPLACE FUNCTION public.maintain_partitions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    month_date date;
    target_date date;
BEGIN
    -- Find the latest partition end date
    SELECT date_trunc('month', CURRENT_DATE + interval '18 months') INTO target_date;
    
    -- Create partitions up to target date
    FOR month_date IN
        SELECT generate_series(
            date_trunc('month', CURRENT_DATE),
            target_date,
            interval '1 month'
        )::date
    LOOP
        EXECUTE format('
            CREATE TABLE IF NOT EXISTS public.class_events_%s
            PARTITION OF public.class_events
            FOR VALUES FROM (%L) TO (%L)',
            to_char(month_date, 'YYYY_MM'),
            month_date,
            month_date + interval '1 month'
        );
    END LOOP;
END$$;

-- Rate limiting function
CREATE OR REPLACE FUNCTION public.try_consume(p_key text, p_cost int, p_refill int)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE 
    v_tokens int;
BEGIN
    INSERT INTO public.rate_limits(key, tokens, refill_rate)
    VALUES (p_key, p_refill, p_refill)
    ON CONFLICT (key) DO NOTHING;

    UPDATE public.rate_limits
    SET tokens = LEAST(p_refill,
                      GREATEST(0, tokens + FLOOR(EXTRACT(EPOCH FROM (now()-updated_at))/60.0)*refill_rate) - p_cost),
        updated_at = now()
    WHERE key = p_key
    RETURNING tokens INTO v_tokens;

    RETURN v_tokens >= 0;
END $$;

-- =====================================================
-- STEP 7: INITIAL DATA MIGRATION HELPERS
-- =====================================================

-- Function to migrate existing class_instances to new model
CREATE OR REPLACE FUNCTION public.migrate_class_instances_to_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create series for existing templates
    INSERT INTO public.class_series (
        id,
        organization_id,
        template_name,
        default_duration_mins,
        default_capacity,
        default_price_cents,
        location_id,
        instructor_id,
        start_date,
        metadata,
        created_at,
        updated_at
    )
    SELECT 
        ct.id,
        ct.organization_id,
        ct.name,
        ct.duration_minutes,
        ct.capacity,
        ct.price_cents,
        ct.location_id,
        ct.instructor_id,
        CURRENT_DATE,
        jsonb_build_object(
            'type', ct.type,
            'level', ct.level,
            'description', ct.description,
            'tags', ct.tags,
            'images', ct.images
        ),
        ct.created_at,
        ct.updated_at
    FROM public.class_templates ct
    WHERE NOT EXISTS (
        SELECT 1 FROM public.class_series cs WHERE cs.id = ct.id
    );

    -- Migrate class instances to events
    INSERT INTO public.class_events (
        id,
        series_id,
        organization_id,
        title,
        description,
        start_at,
        end_at,
        capacity,
        reg_count,
        price_cents,
        status,
        location_id,
        instructor_id,
        snapshot,
        created_at,
        updated_at
    )
    SELECT 
        ci.id,
        ci.template_id,
        ci.organization_id,
        COALESCE(ci.name, ct.name),
        ct.description,
        ci.start_time,
        ci.end_time,
        COALESCE(ci.capacity, ct.capacity),
        COALESCE(ci.current_bookings, 0),
        COALESCE(ci.price_cents, ct.price_cents),
        CASE ci.status
            WHEN 'scheduled' THEN 'scheduled'
            WHEN 'active' THEN 'scheduled'
            WHEN 'completed' THEN 'completed'
            WHEN 'cancelled' THEN 'cancelled'
            ELSE 'scheduled'
        END,
        COALESCE(ci.location_id, ct.location_id),
        COALESCE(ci.instructor_id, ct.instructor_id),
        jsonb_build_object(
            'duration_minutes', ct.duration_minutes,
            'type', ct.type,
            'level', ct.level,
            'tags', ct.tags,
            'images', ct.images,
            'notes', ci.notes,
            'weather_conditions', ci.weather_conditions,
            'metadata', ci.metadata
        ),
        ci.created_at,
        ci.updated_at
    FROM public.class_instances ci
    JOIN public.class_templates ct ON ct.id = ci.template_id
    WHERE NOT EXISTS (
        SELECT 1 FROM public.class_events ce WHERE ce.id = ci.id
    );

    -- Migrate registrations
    INSERT INTO public.registrations (
        id,
        event_id,
        profile_id,
        organization_id,
        status,
        booked_at,
        cancel_reason,
        metadata
    )
    SELECT 
        cr.id,
        cr.class_instance_id,
        cr.customer_id,
        cr.organization_id,
        CASE cr.status
            WHEN 'confirmed' THEN 'confirmed'
            WHEN 'cancelled' THEN 'cancelled'
            WHEN 'no_show' THEN 'no_show'
            WHEN 'checked_in' THEN 'confirmed'
            ELSE 'confirmed'
        END,
        cr.registered_at,
        cr.cancellation_reason,
        jsonb_build_object(
            'payment_required', cr.payment_required,
            'payment_status', cr.payment_status,
            'price_paid_cents', cr.price_paid_cents,
            'booking_source', cr.booking_source,
            'checked_in_at', cr.checked_in_at,
            'notes', cr.notes,
            'metadata', cr.metadata
        )
    FROM public.class_registrations cr
    WHERE NOT EXISTS (
        SELECT 1 FROM public.registrations r WHERE r.id = cr.id
    );

    -- Migrate waitlists
    INSERT INTO public.event_waitlists (
        id,
        event_id,
        profile_id,
        organization_id,
        position,
        added_at,
        notified_at,
        promoted_at,
        expires_at
    )
    SELECT 
        w.id,
        w.class_instance_id,
        w.customer_id,
        w.organization_id,
        w.position,
        w.added_at,
        w.notified_at,
        w.promoted_at,
        w.expires_at
    FROM public.waitlists w
    WHERE NOT EXISTS (
        SELECT 1 FROM public.event_waitlists ew WHERE ew.id = w.id
    );

END $$;

-- =====================================================
-- STEP 8: COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.class_series IS 'Recurring class definitions with RRULE patterns';
COMMENT ON TABLE public.class_events IS 'Individual bookable class occurrences (partitioned by month)';
COMMENT ON TABLE public.registrations IS 'Customer bookings for specific events';
COMMENT ON TABLE public.booking_holds IS 'Temporary reservations during checkout process';
COMMENT ON TABLE public.event_waitlists IS 'Queue for full events with position tracking';
COMMENT ON TABLE public.outbox_events IS 'Async event queue for emails, webhooks, search indexing';
COMMENT ON TABLE public.rate_limits IS 'Token bucket rate limiting for API endpoints';

COMMENT ON COLUMN public.class_events.reg_count IS 'Denormalized registration count for fast capacity checks';
COMMENT ON COLUMN public.class_events.waitlist_count IS 'Denormalized waitlist count';
COMMENT ON COLUMN public.registrations.idempotency_key IS 'Ensures booking retries are safe';
COMMENT ON COLUMN public.class_series.rrule IS 'RFC5545 recurrence rule (NULL for one-off events)';
