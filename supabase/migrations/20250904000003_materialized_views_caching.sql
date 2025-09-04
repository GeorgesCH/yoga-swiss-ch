-- =====================================================
-- Materialized Views & Caching Migration
-- Migration: 20250904000003_materialized_views_caching
-- Optimized read performance with denormalized views
-- =====================================================

-- =====================================================
-- STEP 1: EVENT SEARCH MATERIALIZED VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.event_search_mv AS
SELECT 
  e.id AS event_id,
  e.organization_id,
  e.start_at,
  e.end_at,
  e.status,
  e.capacity,
  e.reg_count,
  e.waitlist_count,
  e.price_cents,
  e.title,
  e.description,
  e.location_id,
  e.instructor_id,
  s.template_name,
  s.timezone,
  o.slug AS org_slug,
  o.name AS org_name,
  o.brand_colors,
  l.name AS location_name,
  l.address AS location_address,
  l.coordinates AS location_coordinates,
  p.first_name || ' ' || p.last_name AS instructor_name,
  -- Full-text search vector
  setweight(to_tsvector('english', COALESCE(e.title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(e.description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(s.template_name, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(l.name, '')), 'D') AS search_vector,
  -- Computed fields
  CASE 
    WHEN e.capacity IS NULL THEN 'unlimited'
    WHEN e.reg_count >= e.capacity THEN 'full'
    WHEN e.reg_count >= (e.capacity * 0.8) THEN 'filling'
    ELSE 'available'
  END AS availability_status,
  -- Date/time helpers
  date_trunc('day', e.start_at AT TIME ZONE COALESCE(s.timezone, 'Europe/Zurich')) AS event_date,
  extract(hour from e.start_at AT TIME ZONE COALESCE(s.timezone, 'Europe/Zurich')) AS event_hour,
  extract(dow from e.start_at AT TIME ZONE COALESCE(s.timezone, 'Europe/Zurich')) AS day_of_week,
  -- Pricing helpers
  CASE 
    WHEN e.price_cents = 0 THEN 'free'
    WHEN e.price_cents < 2000 THEN 'budget'
    WHEN e.price_cents < 5000 THEN 'standard'
    ELSE 'premium'
  END AS price_tier
FROM public.class_events e
LEFT JOIN public.class_series s ON s.id = e.series_id
LEFT JOIN public.organizations o ON o.id = e.organization_id
LEFT JOIN public.locations l ON l.id = e.location_id
LEFT JOIN public.profiles p ON p.id = e.instructor_id
WHERE e.status = 'scheduled'
  AND e.start_at > now() - interval '1 hour'; -- Include recent past for check-ins

-- Indexes for the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_search_mv_event_id ON public.event_search_mv(event_id);
CREATE INDEX IF NOT EXISTS idx_event_search_mv_org_date ON public.event_search_mv(organization_id, event_date);
CREATE INDEX IF NOT EXISTS idx_event_search_mv_location_date ON public.event_search_mv(location_id, event_date) WHERE location_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_search_mv_instructor_date ON public.event_search_mv(instructor_id, event_date) WHERE instructor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_search_mv_availability ON public.event_search_mv(availability_status, event_date);
CREATE INDEX IF NOT EXISTS idx_event_search_mv_price_tier ON public.event_search_mv(price_tier, event_date);
CREATE INDEX IF NOT EXISTS idx_event_search_mv_search_vector ON public.event_search_mv USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_event_search_mv_city_date ON public.event_search_mv(location_city, event_date) WHERE location_city IS NOT NULL;

-- =====================================================
-- STEP 2: CUSTOMER DASHBOARD VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.customer_dashboard_mv AS
SELECT
  p.id AS customer_id,
  p.organization_id,
  p.first_name,
  p.last_name,
  p.email,
  p.avatar_url,
  -- Registration stats
  COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS confirmed_registrations,
  COUNT(r.id) FILTER (WHERE r.status = 'cancelled') AS cancelled_registrations,
  COUNT(r.id) FILTER (WHERE r.status = 'no_show') AS no_show_count,
  -- Upcoming events
  COUNT(r.id) FILTER (WHERE r.status = 'confirmed' AND e.start_at > now()) AS upcoming_events,
  MIN(e.start_at) FILTER (WHERE r.status = 'confirmed' AND e.start_at > now()) AS next_event_at,
  -- Waitlist info
  COUNT(w.id) AS active_waitlists,
  -- Wallet info
  COALESCE(SUM(wt.credit_balance), 0) AS total_wallet_balance,
  -- Activity metrics
  COUNT(r.id) FILTER (WHERE r.booked_at > now() - interval '30 days') AS bookings_last_30_days,
  COUNT(r.id) FILTER (WHERE r.booked_at > now() - interval '90 days') AS bookings_last_90_days,
  MAX(r.booked_at) AS last_booking_at,
  -- Spending
  COALESCE(SUM(e.price_cents) FILTER (WHERE r.status = 'confirmed'), 0) AS total_spent_cents
FROM public.profiles p
LEFT JOIN public.registrations r ON r.profile_id = p.id
LEFT JOIN public.class_events e ON e.id = r.event_id
LEFT JOIN public.event_waitlists w ON w.profile_id = p.id AND w.promoted_at IS NULL
LEFT JOIN public.wallets wt ON wt.customer_id = p.id AND wt.is_active = true
WHERE p.organization_id IS NOT NULL
GROUP BY p.id, p.organization_id, p.first_name, p.last_name, p.email, p.avatar_url;

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_dashboard_mv_customer_id ON public.customer_dashboard_mv(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_dashboard_mv_org ON public.customer_dashboard_mv(organization_id);
CREATE INDEX IF NOT EXISTS idx_customer_dashboard_mv_next_event ON public.customer_dashboard_mv(next_event_at) WHERE next_event_at IS NOT NULL;

-- =====================================================
-- STEP 3: INSTRUCTOR SCHEDULE VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.instructor_schedule_mv AS
SELECT
  p.id AS instructor_id,
  p.organization_id,
  p.first_name,
  p.last_name,
  p.avatar_url,
  e.id AS event_id,
  e.title AS event_title,
  e.start_at,
  e.end_at,
  e.capacity,
  e.reg_count,
  e.status,
  l.name AS location_name,
  l.city AS location_city,
  -- Roster info
  COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS confirmed_count,
  COUNT(r.id) FILTER (WHERE r.status = 'no_show') AS no_show_count,
  -- Revenue info
  e.price_cents * COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS revenue_cents,
  -- Time helpers
  date_trunc('day', e.start_at AT TIME ZONE 'Europe/Zurich') AS event_date,
  extract(hour from e.start_at AT TIME ZONE 'Europe/Zurich') AS event_hour
FROM public.profiles p
JOIN public.class_events e ON e.instructor_id = p.id
LEFT JOIN public.locations l ON l.id = e.location_id
LEFT JOIN public.registrations r ON r.event_id = e.id
WHERE e.status IN ('scheduled', 'completed')
  AND e.start_at > now() - interval '7 days' -- Include past week for reporting
GROUP BY p.id, p.organization_id, p.first_name, p.last_name, p.avatar_url,
         e.id, e.title, e.start_at, e.end_at, e.capacity, e.reg_count, e.status,
         l.name, l.city, e.price_cents;

CREATE INDEX IF NOT EXISTS idx_instructor_schedule_mv_instructor_date ON public.instructor_schedule_mv(instructor_id, event_date);
CREATE INDEX IF NOT EXISTS idx_instructor_schedule_mv_org_date ON public.instructor_schedule_mv(organization_id, event_date);
CREATE INDEX IF NOT EXISTS idx_instructor_schedule_mv_status ON public.instructor_schedule_mv(status, event_date);

-- =====================================================
-- STEP 4: ORGANIZATION ANALYTICS VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.org_analytics_mv AS
SELECT
  o.id AS organization_id,
  o.name AS org_name,
  o.slug AS org_slug,
  -- Event metrics
  COUNT(e.id) AS total_events,
  COUNT(e.id) FILTER (WHERE e.start_at > now()) AS upcoming_events,
  COUNT(e.id) FILTER (WHERE e.status = 'completed') AS completed_events,
  COUNT(e.id) FILTER (WHERE e.status = 'cancelled') AS cancelled_events,
  -- Registration metrics
  COUNT(r.id) AS total_registrations,
  COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS confirmed_registrations,
  COUNT(r.id) FILTER (WHERE r.status = 'cancelled') AS cancelled_registrations,
  COUNT(r.id) FILTER (WHERE r.status = 'no_show') AS no_show_registrations,
  -- Revenue metrics
  COALESCE(SUM(e.price_cents * e.reg_count), 0) AS total_revenue_cents,
  COALESCE(SUM(e.price_cents * e.reg_count) FILTER (WHERE e.start_at > now() - interval '30 days'), 0) AS revenue_last_30_days_cents,
  COALESCE(SUM(e.price_cents * e.reg_count) FILTER (WHERE e.start_at > now() - interval '7 days'), 0) AS revenue_last_7_days_cents,
  -- Capacity metrics
  COALESCE(AVG(CASE WHEN e.capacity > 0 THEN (e.reg_count::float / e.capacity) * 100 ELSE NULL END), 0) AS avg_capacity_utilization,
  -- Customer metrics
  COUNT(DISTINCT r.profile_id) AS unique_customers,
  COUNT(DISTINCT r.profile_id) FILTER (WHERE r.booked_at > now() - interval '30 days') AS active_customers_30_days,
  -- Waitlist metrics
  COUNT(w.id) AS total_waitlist_entries,
  COUNT(w.id) FILTER (WHERE w.promoted_at IS NOT NULL) AS promoted_waitlist_entries,
  -- Location metrics
  COUNT(DISTINCT e.location_id) AS active_locations,
  -- Instructor metrics
  COUNT(DISTINCT e.instructor_id) AS active_instructors,
  -- Time period
  now() AS calculated_at
FROM public.organizations o
LEFT JOIN public.class_events e ON e.organization_id = o.id
LEFT JOIN public.registrations r ON r.event_id = e.id
LEFT JOIN public.event_waitlists w ON w.event_id = e.id
GROUP BY o.id, o.name, o.slug;

CREATE UNIQUE INDEX IF NOT EXISTS idx_org_analytics_mv_org_id ON public.org_analytics_mv(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_analytics_mv_revenue ON public.org_analytics_mv(total_revenue_cents DESC);
CREATE INDEX IF NOT EXISTS idx_org_analytics_mv_customers ON public.org_analytics_mv(unique_customers DESC);

-- =====================================================
-- STEP 5: REFRESH FUNCTIONS
-- =====================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION public.refresh_all_materialized_views()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_time timestamptz;
  end_time timestamptz;
  result jsonb := '[]'::jsonb;
BEGIN
  -- Event search view (most critical)
  start_time := now();
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.event_search_mv;
  end_time := now();
  result := result || jsonb_build_object(
    'view', 'event_search_mv',
    'duration_ms', extract(epoch from (end_time - start_time)) * 1000,
    'refreshed_at', end_time
  );

  -- Customer dashboard view
  start_time := now();
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.customer_dashboard_mv;
  end_time := now();
  result := result || jsonb_build_object(
    'view', 'customer_dashboard_mv',
    'duration_ms', extract(epoch from (end_time - start_time)) * 1000,
    'refreshed_at', end_time
  );

  -- Instructor schedule view
  start_time := now();
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.instructor_schedule_mv;
  end_time := now();
  result := result || jsonb_build_object(
    'view', 'instructor_schedule_mv',
    'duration_ms', extract(epoch from (end_time - start_time)) * 1000,
    'refreshed_at', end_time
  );

  -- Organization analytics view
  start_time := now();
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.org_analytics_mv;
  end_time := now();
  result := result || jsonb_build_object(
    'view', 'org_analytics_mv',
    'duration_ms', extract(epoch from (end_time - start_time)) * 1000,
    'refreshed_at', end_time
  );

  RETURN jsonb_build_object(
    'total_views', 4,
    'completed_at', now(),
    'results', result
  );
END $$;

-- Function for fast refresh of recent data only
CREATE OR REPLACE FUNCTION public.refresh_recent_events_mv()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For high-frequency updates, we can refresh only recent partitions
  -- This is a simplified version - in production you'd refresh specific date ranges
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.event_search_mv;
END $$;

-- =====================================================
-- STEP 6: CACHE INVALIDATION TRIGGERS
-- =====================================================

-- Function to handle cache invalidation
CREATE OR REPLACE FUNCTION public.invalidate_event_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- In a real implementation, you'd send cache invalidation signals
  -- For now, we'll just log the need for refresh
  INSERT INTO public.outbox_events (organization_id, type, payload)
  VALUES (
    COALESCE(NEW.organization_id, OLD.organization_id),
    'cache.invalidate',
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'event_id', COALESCE(NEW.id, OLD.id),
      'invalidated_at', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END $$;

-- Triggers for cache invalidation
DROP TRIGGER IF EXISTS trigger_invalidate_event_cache ON public.class_events;
CREATE TRIGGER trigger_invalidate_event_cache
  AFTER INSERT OR UPDATE OR DELETE ON public.class_events
  FOR EACH ROW EXECUTE FUNCTION public.invalidate_event_cache();

DROP TRIGGER IF EXISTS trigger_invalidate_registration_cache ON public.registrations;
CREATE TRIGGER trigger_invalidate_registration_cache
  AFTER INSERT OR UPDATE OR DELETE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.invalidate_event_cache();

-- =====================================================
-- STEP 7: SEARCH FUNCTIONS
-- =====================================================

-- Enhanced event search function
CREATE OR REPLACE FUNCTION public.search_events(
  p_organization_id uuid DEFAULT NULL,
  p_query text DEFAULT NULL,
  p_location_city text DEFAULT NULL,
  p_date_from date DEFAULT NULL,
  p_date_to date DEFAULT NULL,
  p_availability_status text DEFAULT NULL,
  p_price_tier text DEFAULT NULL,
  p_instructor_id uuid DEFAULT NULL,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  event_id uuid,
  title text,
  description text,
  start_at timestamptz,
  end_at timestamptz,
  price_cents int,
  capacity int,
  reg_count int,
  availability_status text,
  location_name text,
  location_city text,
  instructor_name text,
  org_name text,
  search_rank real
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mv.event_id,
    mv.title,
    mv.description,
    mv.start_at,
    mv.end_at,
    mv.price_cents,
    mv.capacity,
    mv.reg_count,
    mv.availability_status,
    mv.location_name,
    mv.location_city,
    COALESCE(mv.instructor_first_name || ' ' || mv.instructor_last_name, '') AS instructor_name,
    mv.org_name,
    CASE 
      WHEN p_query IS NOT NULL THEN ts_rank(mv.search_vector, plainto_tsquery('simple', p_query))
      ELSE 1.0
    END AS search_rank
  FROM public.event_search_mv mv
  WHERE 
    (p_organization_id IS NULL OR mv.organization_id = p_organization_id)
    AND (p_query IS NULL OR mv.search_vector @@ plainto_tsquery('simple', p_query))
    AND (p_location_city IS NULL OR mv.location_city ILIKE '%' || p_location_city || '%')
    AND (p_date_from IS NULL OR mv.event_date >= p_date_from)
    AND (p_date_to IS NULL OR mv.event_date <= p_date_to)
    AND (p_availability_status IS NULL OR mv.availability_status = p_availability_status)
    AND (p_price_tier IS NULL OR mv.price_tier = p_price_tier)
    AND (p_instructor_id IS NULL OR mv.instructor_id = p_instructor_id)
  ORDER BY 
    CASE WHEN p_query IS NOT NULL THEN ts_rank(mv.search_vector, plainto_tsquery('simple', p_query)) END DESC,
    mv.start_at ASC
  LIMIT p_limit
  OFFSET p_offset;
END $$;

-- =====================================================
-- STEP 8: PERMISSIONS
-- =====================================================

-- Grant permissions for materialized views
GRANT SELECT ON public.event_search_mv TO authenticated, anon;
GRANT SELECT ON public.customer_dashboard_mv TO authenticated;
GRANT SELECT ON public.instructor_schedule_mv TO authenticated;
GRANT SELECT ON public.org_analytics_mv TO authenticated;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.search_events TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.refresh_all_materialized_views TO service_role;
GRANT EXECUTE ON FUNCTION public.refresh_recent_events_mv TO service_role;

-- =====================================================
-- STEP 9: COMMENTS
-- =====================================================

COMMENT ON MATERIALIZED VIEW public.event_search_mv IS 'Denormalized view for fast event search and discovery';
COMMENT ON MATERIALIZED VIEW public.customer_dashboard_mv IS 'Customer metrics and dashboard data';
COMMENT ON MATERIALIZED VIEW public.instructor_schedule_mv IS 'Instructor schedule and class roster information';
COMMENT ON MATERIALIZED VIEW public.org_analytics_mv IS 'Organization-level analytics and KPIs';

COMMENT ON FUNCTION public.refresh_all_materialized_views IS 'Refresh all materialized views with timing metrics';
COMMENT ON FUNCTION public.search_events IS 'Full-text search across events with filters and ranking';
