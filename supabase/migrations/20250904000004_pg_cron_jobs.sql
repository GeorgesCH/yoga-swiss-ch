-- =====================================================
-- pg_cron Jobs Configuration Migration
-- Migration: 20250904000004_pg_cron_jobs
-- Automated scheduled tasks for the scalable events system
-- =====================================================

-- =====================================================
-- STEP 1: ENABLE PG_CRON EXTENSION
-- =====================================================

-- Note: pg_cron extension should already be enabled from the first migration
-- This is just a safety check
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- =====================================================
-- STEP 2: DAILY EVENT GENERATION JOB
-- =====================================================

-- Generate events for all active series daily at 2:15 AM
SELECT cron.schedule(
  'events_generate_daily',
  '15 2 * * *',
  $$
  SELECT public.generate_events_for_all(CURRENT_DATE + interval '120 days');
  $$
);

-- =====================================================
-- STEP 3: WAITLIST PROMOTION JOB
-- =====================================================

-- Check and promote waitlists every minute
SELECT cron.schedule(
  'waitlist_promote_minute',
  '* * * * *',
  $$
  SELECT public.promote_waitlists_tick();
  $$
);

-- =====================================================
-- STEP 4: CLEANUP EXPIRED HOLDS JOB
-- =====================================================

-- Clean up expired booking holds every 5 minutes
SELECT cron.schedule(
  'cleanup_expired_holds',
  '*/5 * * * *',
  $$
  SELECT public.cleanup_expired_holds();
  $$
);

-- =====================================================
-- STEP 5: MATERIALIZED VIEW REFRESH JOBS
-- =====================================================

-- Fast refresh of event search view every 5 minutes during business hours
SELECT cron.schedule(
  'refresh_events_fast',
  '*/5 6-22 * * *',
  $$
  SELECT public.refresh_recent_events_mv();
  $$
);

-- Full refresh of all materialized views nightly at 3:00 AM
SELECT cron.schedule(
  'refresh_all_views_nightly',
  '0 3 * * *',
  $$
  SELECT public.refresh_all_materialized_views();
  $$
);

-- =====================================================
-- STEP 6: PARTITION MAINTENANCE JOB
-- =====================================================

-- Maintain partitions monthly on the 1st at 4:00 AM
SELECT cron.schedule(
  'maintain_partitions_monthly',
  '0 4 1 * *',
  $$
  SELECT public.maintain_partitions();
  $$
);

-- =====================================================
-- STEP 7: OUTBOX PROCESSING JOB
-- =====================================================

-- Process outbox events every 30 seconds
SELECT cron.schedule(
  'process_outbox_events',
  '*/30 * * * * *',
  $$
  SELECT public.process_outbox_events();
  $$
);

-- =====================================================
-- STEP 8: ANALYTICS AGGREGATION JOB
-- =====================================================

-- Update analytics hourly
SELECT cron.schedule(
  'update_analytics_hourly',
  '0 * * * *',
  $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.org_analytics_mv;
  $$
);

-- =====================================================
-- STEP 9: AUDIT LOG CLEANUP JOB
-- =====================================================

-- Clean up old audit logs weekly (keep 90 days)
SELECT cron.schedule(
  'cleanup_audit_logs_weekly',
  '0 5 * * 0',
  $$
  DELETE FROM public.audit_logs 
  WHERE created_at < now() - interval '90 days';
  $$
);

-- =====================================================
-- STEP 10: WEBHOOK DELIVERY CLEANUP JOB
-- =====================================================

-- Clean up old webhook deliveries weekly (keep 30 days)
SELECT cron.schedule(
  'cleanup_webhook_deliveries_weekly',
  '0 6 * * 0',
  $$
  DELETE FROM public.webhook_deliveries 
  WHERE created_at < now() - interval '30 days';
  $$
);

-- =====================================================
-- STEP 11: RATE LIMIT CLEANUP JOB
-- =====================================================

-- Clean up old rate limit entries daily
SELECT cron.schedule(
  'cleanup_rate_limits_daily',
  '0 1 * * *',
  $$
  DELETE FROM public.rate_limits 
  WHERE updated_at < now() - interval '24 hours';
  $$
);

-- =====================================================
-- STEP 12: OUTBOX PROCESSING FUNCTION
-- =====================================================

-- Function to process outbox events (called by cron)
CREATE OR REPLACE FUNCTION public.process_outbox_events()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event record;
  v_processed_count int := 0;
  v_error_count int := 0;
  v_results jsonb := '[]'::jsonb;
BEGIN
  -- Process up to 100 unprocessed events
  FOR v_event IN
    SELECT id, organization_id, type, payload, created_at
    FROM public.outbox_events
    WHERE processed_at IS NULL
    ORDER BY created_at
    LIMIT 100
    FOR UPDATE SKIP LOCKED
  LOOP
    BEGIN
      -- Mark as processed immediately to avoid reprocessing
      UPDATE public.outbox_events
      SET processed_at = now()
      WHERE id = v_event.id;
      
      -- Process based on event type
      CASE v_event.type
        WHEN 'registration.created' THEN
          -- Trigger email confirmation
          PERFORM public.send_registration_confirmation(v_event.payload);
          
        WHEN 'registration.cancelled' THEN
          -- Trigger cancellation email and refund processing
          PERFORM public.send_cancellation_confirmation(v_event.payload);
          
        WHEN 'waitlist.joined' THEN
          -- Send waitlist confirmation
          PERFORM public.send_waitlist_confirmation(v_event.payload);
          
        WHEN 'waitlist.promoted' THEN
          -- Send promotion notification with booking link
          PERFORM public.send_waitlist_promotion(v_event.payload);
          
        WHEN 'payment.succeeded' THEN
          -- Send payment confirmation
          PERFORM public.send_payment_confirmation(v_event.payload);
          
        WHEN 'payment.failed' THEN
          -- Send payment failure notification
          PERFORM public.send_payment_failure(v_event.payload);
          
        WHEN 'cache.invalidate' THEN
          -- Handle cache invalidation (could trigger external cache clear)
          PERFORM public.handle_cache_invalidation(v_event.payload);
          
        ELSE
          -- Log unknown event type
          RAISE NOTICE 'Unknown outbox event type: %', v_event.type;
      END CASE;
      
      v_processed_count := v_processed_count + 1;
      
      v_results := v_results || jsonb_build_object(
        'event_id', v_event.id,
        'type', v_event.type,
        'status', 'processed'
      );
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue processing other events
      v_error_count := v_error_count + 1;
      
      v_results := v_results || jsonb_build_object(
        'event_id', v_event.id,
        'type', v_event.type,
        'status', 'error',
        'error', SQLERRM
      );
      
      -- Optionally: implement retry logic with exponential backoff
      -- For now, we'll leave failed events marked as processed to avoid infinite loops
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'processed_count', v_processed_count,
    'error_count', v_error_count,
    'processed_at', now(),
    'results', v_results
  );
END $$;

-- =====================================================
-- STEP 13: PLACEHOLDER EMAIL FUNCTIONS
-- =====================================================

-- These are placeholder functions for email processing
-- In production, these would integrate with your email service provider

CREATE OR REPLACE FUNCTION public.send_registration_confirmation(payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Placeholder: integrate with email service (Brevo, SendGrid, etc.)
  RAISE NOTICE 'Sending registration confirmation for registration_id: %', payload->>'registration_id';
  -- TODO: Implement actual email sending logic
END $$;

CREATE OR REPLACE FUNCTION public.send_cancellation_confirmation(payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE NOTICE 'Sending cancellation confirmation for registration_id: %', payload->>'registration_id';
  -- TODO: Implement actual email sending logic
END $$;

CREATE OR REPLACE FUNCTION public.send_waitlist_confirmation(payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE NOTICE 'Sending waitlist confirmation for waitlist_id: %', payload->>'waitlist_id';
  -- TODO: Implement actual email sending logic
END $$;

CREATE OR REPLACE FUNCTION public.send_waitlist_promotion(payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE NOTICE 'Sending waitlist promotion for hold_id: %', payload->>'hold_id';
  -- TODO: Implement actual email sending logic with booking link
END $$;

CREATE OR REPLACE FUNCTION public.send_payment_confirmation(payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE NOTICE 'Sending payment confirmation for registration_id: %', payload->>'registration_id';
  -- TODO: Implement actual email sending logic
END $$;

CREATE OR REPLACE FUNCTION public.send_payment_failure(payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE NOTICE 'Sending payment failure notification for registration_id: %', payload->>'registration_id';
  -- TODO: Implement actual email sending logic
END $$;

CREATE OR REPLACE FUNCTION public.handle_cache_invalidation(payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE NOTICE 'Handling cache invalidation for table: %', payload->>'table';
  -- TODO: Implement cache invalidation logic (Redis, CDN, etc.)
END $$;

-- =====================================================
-- STEP 14: JOB MONITORING FUNCTIONS
-- =====================================================

-- Function to check cron job status
CREATE OR REPLACE FUNCTION public.get_cron_job_status()
RETURNS TABLE (
  jobname text,
  schedule text,
  active boolean,
  last_run timestamptz,
  next_run timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    jobname,
    schedule,
    active,
    last_run,
    next_run
  FROM cron.job
  ORDER BY jobname;
$$;

-- Function to get recent cron job run history
CREATE OR REPLACE FUNCTION public.get_cron_job_history(p_hours int DEFAULT 24)
RETURNS TABLE (
  jobname text,
  runid bigint,
  job_pid int,
  database text,
  username text,
  command text,
  status text,
  return_message text,
  start_time timestamptz,
  end_time timestamptz,
  duration interval
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    jobname,
    runid,
    job_pid,
    database,
    username,
    command,
    status,
    return_message,
    start_time,
    end_time,
    end_time - start_time as duration
  FROM cron.job_run_details
  WHERE start_time > now() - (p_hours || ' hours')::interval
  ORDER BY start_time DESC;
$$;

-- =====================================================
-- STEP 15: PERMISSIONS
-- =====================================================

-- Grant execute permissions for monitoring functions
GRANT EXECUTE ON FUNCTION public.get_cron_job_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cron_job_history(int) TO authenticated;

-- Grant execute permissions for processing functions to service role
GRANT EXECUTE ON FUNCTION public.process_outbox_events() TO service_role;

-- =====================================================
-- STEP 16: COMMENTS
-- =====================================================

COMMENT ON FUNCTION public.process_outbox_events IS 'Process queued outbox events for emails, webhooks, and cache invalidation';
COMMENT ON FUNCTION public.get_cron_job_status IS 'Get current status of all scheduled cron jobs';
COMMENT ON FUNCTION public.get_cron_job_history IS 'Get recent execution history of cron jobs';

-- =====================================================
-- STEP 17: INITIAL SETUP VERIFICATION
-- =====================================================

-- Log successful cron job setup
DO $$
BEGIN
  RAISE NOTICE 'pg_cron jobs configured successfully:';
  RAISE NOTICE '- events_generate_daily: Daily at 2:15 AM';
  RAISE NOTICE '- waitlist_promote_minute: Every minute';
  RAISE NOTICE '- cleanup_expired_holds: Every 5 minutes';
  RAISE NOTICE '- refresh_events_fast: Every 5 minutes (6 AM - 10 PM)';
  RAISE NOTICE '- refresh_all_views_nightly: Daily at 3:00 AM';
  RAISE NOTICE '- maintain_partitions_monthly: Monthly on 1st at 4:00 AM';
  RAISE NOTICE '- process_outbox_events: Every 30 seconds';
  RAISE NOTICE '- update_analytics_hourly: Every hour';
  RAISE NOTICE '- cleanup_audit_logs_weekly: Weekly on Sunday at 5:00 AM';
  RAISE NOTICE '- cleanup_webhook_deliveries_weekly: Weekly on Sunday at 6:00 AM';
  RAISE NOTICE '- cleanup_rate_limits_daily: Daily at 1:00 AM';
END $$;
