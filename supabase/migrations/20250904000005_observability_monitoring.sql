-- =====================================================
-- Observability & Monitoring Migration
-- Migration: 20250904000005_observability_monitoring
-- Comprehensive monitoring, alerting, and performance tracking
-- =====================================================

-- =====================================================
-- STEP 1: PERFORMANCE METRICS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_unit text NOT NULL, -- ms, count, percent, bytes, etc.
  tags jsonb DEFAULT '{}',
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_time ON public.performance_metrics(metric_name, recorded_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_org_time ON public.performance_metrics(organization_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_tags ON public.performance_metrics USING GIN(tags);

-- =====================================================
-- STEP 2: SYSTEM HEALTH CHECKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_name text NOT NULL,
  check_type text NOT NULL, -- database, api, external_service, business_logic
  status text NOT NULL, -- healthy, warning, critical, unknown
  response_time_ms numeric,
  error_message text,
  details jsonb DEFAULT '{}',
  checked_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_checks_name_time ON public.health_checks(check_name, checked_at);
CREATE INDEX IF NOT EXISTS idx_health_checks_status_time ON public.health_checks(status, checked_at);

-- =====================================================
-- STEP 3: ALERT RULES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  rule_name text NOT NULL,
  metric_name text NOT NULL,
  condition text NOT NULL, -- gt, lt, eq, contains
  threshold numeric NOT NULL,
  severity text NOT NULL, -- low, medium, high, critical
  notification_channels text[] DEFAULT '{}', -- email, slack, webhook
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- STEP 4: ALERTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  rule_id uuid REFERENCES public.alert_rules(id),
  alert_name text NOT NULL,
  severity text NOT NULL,
  status text DEFAULT 'active', -- active, acknowledged, resolved
  metric_value numeric,
  threshold numeric,
  message text,
  details jsonb DEFAULT '{}',
  triggered_at timestamptz DEFAULT now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  acknowledged_by uuid REFERENCES public.profiles(id),
  resolved_by uuid REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_alerts_org_status ON public.alerts(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity_time ON public.alerts(severity, triggered_at);
CREATE INDEX IF NOT EXISTS idx_alerts_rule ON public.alerts(rule_id);

-- =====================================================
-- STEP 5: BOOKING PERFORMANCE TRACKING FUNCTIONS
-- =====================================================

-- Function to record booking performance metrics
CREATE OR REPLACE FUNCTION public.record_booking_metrics(
  p_organization_id uuid,
  p_operation text,
  p_duration_ms numeric,
  p_success boolean,
  p_error_code text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Record operation duration
  INSERT INTO public.performance_metrics (
    organization_id, metric_name, metric_value, metric_unit, tags
  ) VALUES (
    p_organization_id,
    'booking_operation_duration',
    p_duration_ms,
    'ms',
    jsonb_build_object(
      'operation', p_operation,
      'success', p_success,
      'error_code', p_error_code
    )
  );

  -- Record success/failure count
  INSERT INTO public.performance_metrics (
    organization_id, metric_name, metric_value, metric_unit, tags
  ) VALUES (
    p_organization_id,
    'booking_operation_count',
    1,
    'count',
    jsonb_build_object(
      'operation', p_operation,
      'status', CASE WHEN p_success THEN 'success' ELSE 'error' END,
      'error_code', p_error_code
    )
  );
END $$;

-- =====================================================
-- STEP 6: HEALTH CHECK FUNCTIONS
-- =====================================================

-- Database connectivity health check
CREATE OR REPLACE FUNCTION public.health_check_database()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_time timestamptz;
  end_time timestamptz;
  duration_ms numeric;
  result jsonb;
BEGIN
  start_time := clock_timestamp();
  
  -- Simple query to test database responsiveness
  PERFORM count(*) FROM public.organizations LIMIT 1;
  
  end_time := clock_timestamp();
  duration_ms := extract(epoch from (end_time - start_time)) * 1000;
  
  -- Record health check
  INSERT INTO public.health_checks (
    check_name, check_type, status, response_time_ms, details
  ) VALUES (
    'database_connectivity',
    'database',
    CASE WHEN duration_ms < 100 THEN 'healthy' 
         WHEN duration_ms < 500 THEN 'warning'
         ELSE 'critical' END,
    duration_ms,
    jsonb_build_object('query_time_ms', duration_ms)
  );
  
  RETURN jsonb_build_object(
    'status', CASE WHEN duration_ms < 100 THEN 'healthy' 
                   WHEN duration_ms < 500 THEN 'warning'
                   ELSE 'critical' END,
    'response_time_ms', duration_ms,
    'timestamp', now()
  );
END $$;

-- Booking system health check
CREATE OR REPLACE FUNCTION public.health_check_booking_system()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_time timestamptz;
  end_time timestamptz;
  duration_ms numeric;
  active_events_count int;
  pending_registrations_count int;
  waitlist_count int;
  result jsonb;
  status text := 'healthy';
BEGIN
  start_time := clock_timestamp();
  
  -- Check active events
  SELECT count(*) INTO active_events_count
  FROM public.class_events
  WHERE status = 'scheduled' AND start_at > now();
  
  -- Check pending registrations (if any)
  SELECT count(*) INTO pending_registrations_count
  FROM public.registrations
  WHERE status = 'confirmed' AND booked_at > now() - interval '1 hour';
  
  -- Check waitlist size
  SELECT count(*) INTO waitlist_count
  FROM public.event_waitlists
  WHERE promoted_at IS NULL;
  
  end_time := clock_timestamp();
  duration_ms := extract(epoch from (end_time - start_time)) * 1000;
  
  -- Determine status based on metrics
  IF duration_ms > 1000 THEN
    status := 'critical';
  ELSIF waitlist_count > 1000 THEN
    status := 'warning';
  ELSIF duration_ms > 500 THEN
    status := 'warning';
  END IF;
  
  result := jsonb_build_object(
    'status', status,
    'response_time_ms', duration_ms,
    'active_events', active_events_count,
    'recent_registrations', pending_registrations_count,
    'total_waitlist', waitlist_count,
    'timestamp', now()
  );
  
  -- Record health check
  INSERT INTO public.health_checks (
    check_name, check_type, status, response_time_ms, details
  ) VALUES (
    'booking_system',
    'business_logic',
    status,
    duration_ms,
    result
  );
  
  RETURN result;
END $$;

-- =====================================================
-- STEP 7: ALERT EVALUATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.evaluate_alert_rules()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rule record;
  metric_value numeric;
  alert_triggered boolean;
  alerts_created int := 0;
  results jsonb := '[]'::jsonb;
BEGIN
  FOR rule IN
    SELECT * FROM public.alert_rules WHERE is_active = true
  LOOP
    -- Get latest metric value
    SELECT pm.metric_value INTO metric_value
    FROM public.performance_metrics pm
    WHERE pm.metric_name = rule.metric_name
      AND (rule.organization_id IS NULL OR pm.organization_id = rule.organization_id)
      AND pm.recorded_at > now() - interval '5 minutes'
    ORDER BY pm.recorded_at DESC
    LIMIT 1;
    
    IF metric_value IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Evaluate condition
    alert_triggered := CASE rule.condition
      WHEN 'gt' THEN metric_value > rule.threshold
      WHEN 'lt' THEN metric_value < rule.threshold
      WHEN 'eq' THEN metric_value = rule.threshold
      WHEN 'gte' THEN metric_value >= rule.threshold
      WHEN 'lte' THEN metric_value <= rule.threshold
      ELSE false
    END;
    
    IF alert_triggered THEN
      -- Check if alert already exists and is active
      IF NOT EXISTS (
        SELECT 1 FROM public.alerts
        WHERE rule_id = rule.id
          AND status = 'active'
          AND triggered_at > now() - interval '1 hour'
      ) THEN
        -- Create new alert
        INSERT INTO public.alerts (
          organization_id, rule_id, alert_name, severity,
          metric_value, threshold, message, details
        ) VALUES (
          rule.organization_id,
          rule.id,
          rule.rule_name,
          rule.severity,
          metric_value,
          rule.threshold,
          format('Alert: %s - Value %s %s threshold %s',
                 rule.rule_name, metric_value, rule.condition, rule.threshold),
          jsonb_build_object(
            'metric_name', rule.metric_name,
            'condition', rule.condition,
            'actual_value', metric_value,
            'threshold', rule.threshold
          )
        );
        
        alerts_created := alerts_created + 1;
      END IF;
    END IF;
    
    results := results || jsonb_build_object(
      'rule_id', rule.id,
      'rule_name', rule.rule_name,
      'metric_value', metric_value,
      'threshold', rule.threshold,
      'triggered', alert_triggered
    );
  END LOOP;
  
  RETURN jsonb_build_object(
    'alerts_created', alerts_created,
    'evaluated_at', now(),
    'rules_evaluated', jsonb_array_length(results),
    'results', results
  );
END $$;

-- =====================================================
-- STEP 8: PERFORMANCE ANALYTICS FUNCTIONS
-- =====================================================

-- Get booking performance summary
CREATE OR REPLACE FUNCTION public.get_booking_performance_summary(
  p_organization_id uuid DEFAULT NULL,
  p_hours int DEFAULT 24
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH metrics AS (
    SELECT 
      tags->>'operation' as operation,
      tags->>'status' as status,
      AVG(metric_value) as avg_duration,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) as p95_duration,
      COUNT(*) as operation_count
    FROM public.performance_metrics
    WHERE metric_name = 'booking_operation_duration'
      AND recorded_at > now() - (p_hours || ' hours')::interval
      AND (p_organization_id IS NULL OR organization_id = p_organization_id)
    GROUP BY tags->>'operation', tags->>'status'
  )
  SELECT jsonb_object_agg(
    operation || '_' || status,
    jsonb_build_object(
      'avg_duration_ms', round(avg_duration, 2),
      'p95_duration_ms', round(p95_duration, 2),
      'count', operation_count
    )
  ) INTO result
  FROM metrics;
  
  RETURN COALESCE(result, '{}'::jsonb);
END $$;

-- Get system health summary
CREATE OR REPLACE FUNCTION public.get_system_health_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH latest_checks AS (
    SELECT DISTINCT ON (check_name)
      check_name,
      status,
      response_time_ms,
      checked_at
    FROM public.health_checks
    ORDER BY check_name, checked_at DESC
  )
  SELECT jsonb_build_object(
    'overall_status', CASE 
      WHEN COUNT(*) FILTER (WHERE status = 'critical') > 0 THEN 'critical'
      WHEN COUNT(*) FILTER (WHERE status = 'warning') > 0 THEN 'warning'
      ELSE 'healthy'
    END,
    'checks', jsonb_object_agg(
      check_name,
      jsonb_build_object(
        'status', status,
        'response_time_ms', response_time_ms,
        'last_checked', checked_at
      )
    ),
    'summary', jsonb_build_object(
      'total_checks', COUNT(*),
      'healthy', COUNT(*) FILTER (WHERE status = 'healthy'),
      'warning', COUNT(*) FILTER (WHERE status = 'warning'),
      'critical', COUNT(*) FILTER (WHERE status = 'critical')
    )
  ) INTO result
  FROM latest_checks;
  
  RETURN COALESCE(result, '{}'::jsonb);
END $$;

-- =====================================================
-- STEP 9: DEFAULT ALERT RULES
-- =====================================================

-- Insert default alert rules for system monitoring
INSERT INTO public.alert_rules (
  rule_name, metric_name, condition, threshold, severity, notification_channels
) VALUES
  ('High Booking Response Time', 'booking_operation_duration', 'gt', 2000, 'warning', ARRAY['email']),
  ('Critical Booking Response Time', 'booking_operation_duration', 'gt', 5000, 'critical', ARRAY['email', 'slack']),
  ('High Booking Error Rate', 'booking_operation_count', 'gt', 10, 'warning', ARRAY['email']),
  ('Database Slow Response', 'database_response_time', 'gt', 500, 'warning', ARRAY['email']),
  ('Database Critical Response', 'database_response_time', 'gt', 1000, 'critical', ARRAY['email', 'slack'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 10: MONITORING DASHBOARD VIEWS
-- =====================================================

-- Real-time metrics view
CREATE OR REPLACE VIEW public.realtime_metrics AS
SELECT 
  metric_name,
  AVG(metric_value) as avg_value,
  MIN(metric_value) as min_value,
  MAX(metric_value) as max_value,
  COUNT(*) as sample_count,
  date_trunc('minute', recorded_at) as time_bucket
FROM public.performance_metrics
WHERE recorded_at > now() - interval '1 hour'
GROUP BY metric_name, date_trunc('minute', recorded_at)
ORDER BY time_bucket DESC;

-- Active alerts view
CREATE OR REPLACE VIEW public.active_alerts AS
SELECT 
  a.id,
  a.alert_name,
  a.severity,
  a.message,
  a.metric_value,
  a.threshold,
  a.triggered_at,
  ar.rule_name,
  ar.metric_name,
  o.name as organization_name
FROM public.alerts a
JOIN public.alert_rules ar ON ar.id = a.rule_id
LEFT JOIN public.organizations o ON o.id = a.organization_id
WHERE a.status = 'active'
ORDER BY 
  CASE a.severity 
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  a.triggered_at DESC;

-- =====================================================
-- STEP 11: LOAD TESTING SUPPORT FUNCTIONS
-- =====================================================

-- Function to simulate booking load
CREATE OR REPLACE FUNCTION public.simulate_booking_load(
  p_concurrent_users int DEFAULT 10,
  p_duration_seconds int DEFAULT 60,
  p_event_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_event_id uuid;
  test_user_id uuid;
  start_time timestamptz;
  end_time timestamptz;
  success_count int := 0;
  error_count int := 0;
  i int;
BEGIN
  -- Get or create test event
  IF p_event_id IS NULL THEN
    SELECT id INTO test_event_id
    FROM public.class_events
    WHERE status = 'scheduled'
      AND start_at > now() + interval '1 day'
      AND capacity > reg_count + p_concurrent_users
    LIMIT 1;
    
    IF test_event_id IS NULL THEN
      RAISE EXCEPTION 'No suitable test event found';
    END IF;
  ELSE
    test_event_id := p_event_id;
  END IF;
  
  start_time := now();
  
  -- Simulate concurrent bookings
  FOR i IN 1..p_concurrent_users LOOP
    BEGIN
      -- Create test user
      INSERT INTO public.profiles (id, email, first_name, last_name)
      VALUES (
        gen_random_uuid(),
        'loadtest' || i || '@example.com',
        'LoadTest',
        'User' || i
      )
      RETURNING id INTO test_user_id;
      
      -- Attempt booking
      PERFORM public.book_event(
        test_event_id,
        test_user_id,
        'loadtest-' || i || '-' || extract(epoch from now())
      );
      
      success_count := success_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
    END;
  END LOOP;
  
  end_time := now();
  
  -- Clean up test data
  DELETE FROM public.registrations 
  WHERE profile_id IN (
    SELECT id FROM public.profiles 
    WHERE email LIKE 'loadtest%@example.com'
  );
  
  DELETE FROM public.profiles 
  WHERE email LIKE 'loadtest%@example.com';
  
  RETURN jsonb_build_object(
    'test_duration_seconds', extract(epoch from (end_time - start_time)),
    'concurrent_users', p_concurrent_users,
    'successful_bookings', success_count,
    'failed_bookings', error_count,
    'success_rate_percent', round((success_count::numeric / p_concurrent_users) * 100, 2),
    'avg_response_time_ms', extract(epoch from (end_time - start_time)) * 1000 / p_concurrent_users,
    'event_id', test_event_id,
    'completed_at', end_time
  );
END $$;

-- =====================================================
-- STEP 12: PERMISSIONS
-- =====================================================

-- Grant permissions for monitoring functions
GRANT SELECT ON public.performance_metrics TO authenticated;
GRANT SELECT ON public.health_checks TO authenticated;
GRANT SELECT ON public.alerts TO authenticated;
GRANT SELECT ON public.alert_rules TO authenticated;
GRANT SELECT ON public.realtime_metrics TO authenticated;
GRANT SELECT ON public.active_alerts TO authenticated;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.health_check_database() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.health_check_booking_system() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_booking_performance_summary(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_system_health_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.evaluate_alert_rules() TO service_role;
GRANT EXECUTE ON FUNCTION public.record_booking_metrics(uuid, text, numeric, boolean, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.simulate_booking_load(int, int, uuid) TO service_role;

-- =====================================================
-- STEP 13: COMMENTS
-- =====================================================

COMMENT ON TABLE public.performance_metrics IS 'Time-series performance metrics for system monitoring';
COMMENT ON TABLE public.health_checks IS 'System health check results and status';
COMMENT ON TABLE public.alert_rules IS 'Configurable alert rules for automated monitoring';
COMMENT ON TABLE public.alerts IS 'Active and historical system alerts';

COMMENT ON FUNCTION public.health_check_database IS 'Check database connectivity and response time';
COMMENT ON FUNCTION public.health_check_booking_system IS 'Check booking system health and key metrics';
COMMENT ON FUNCTION public.evaluate_alert_rules IS 'Evaluate all active alert rules and create alerts';
COMMENT ON FUNCTION public.simulate_booking_load IS 'Load testing function for booking system performance';
