-- =====================================================
-- Core Booking RPCs Migration
-- Migration: 20250904000002_core_booking_rpcs
-- Atomic, idempotent booking operations with concurrency safety
-- =====================================================

-- =====================================================
-- STEP 1: BOOK EVENT RPC
-- =====================================================

CREATE OR REPLACE FUNCTION public.book_event(
  p_event_id uuid,
  p_profile_id uuid,
  p_idem text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE 
  v_reg_id uuid; 
  v_org uuid;
  v_capacity int;
  v_current_count int;
BEGIN
  -- Fast path: check if already booked with same idempotency key
  SELECT id INTO v_reg_id 
  FROM public.registrations 
  WHERE idempotency_key = p_idem;
  
  IF v_reg_id IS NOT NULL THEN 
    RETURN v_reg_id; 
  END IF;

  -- Check if user already registered for this event
  SELECT id INTO v_reg_id 
  FROM public.registrations 
  WHERE event_id = p_event_id AND profile_id = p_profile_id;
  
  IF v_reg_id IS NOT NULL THEN
    RAISE EXCEPTION 'User already registered for this event';
  END IF;

  -- Atomic capacity check and increment
  UPDATE public.class_events
  SET reg_count = reg_count + 1
  WHERE id = p_event_id
    AND status = 'scheduled'
    AND (capacity IS NULL OR reg_count < capacity)
  RETURNING organization_id, capacity, reg_count INTO v_org, v_capacity, v_current_count;

  IF NOT FOUND THEN 
    -- Check if event exists and get details for better error message
    SELECT organization_id, capacity, reg_count, status 
    INTO v_org, v_capacity, v_current_count
    FROM public.class_events 
    WHERE id = p_event_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Event not found';
    ELSIF v_capacity IS NOT NULL AND v_current_count >= v_capacity THEN
      RAISE EXCEPTION 'Event is full (capacity: %, current: %)', v_capacity, v_current_count;
    ELSE
      RAISE EXCEPTION 'Event not bookable (status or other constraint)';
    END IF;
  END IF;

  -- Insert registration
  INSERT INTO public.registrations (
    event_id, 
    profile_id, 
    organization_id, 
    idempotency_key,
    status,
    booked_at
  )
  VALUES (
    p_event_id, 
    p_profile_id, 
    v_org, 
    p_idem,
    'confirmed',
    now()
  )
  ON CONFLICT (event_id, profile_id) DO NOTHING
  RETURNING id INTO v_reg_id;

  IF v_reg_id IS NULL THEN
    -- Concurrent registration by same user; revert increment
    UPDATE public.class_events 
    SET reg_count = reg_count - 1 
    WHERE id = p_event_id;
    
    SELECT id INTO v_reg_id 
    FROM public.registrations 
    WHERE event_id = p_event_id AND profile_id = p_profile_id;
    
    RETURN v_reg_id;
  END IF;

  -- Emit outbox event for async processing
  INSERT INTO public.outbox_events (organization_id, type, payload)
  VALUES (v_org, 'registration.created', jsonb_build_object(
    'registration_id', v_reg_id,
    'event_id', p_event_id,
    'profile_id', p_profile_id,
    'booked_at', now()
  ));

  RETURN v_reg_id;
END$$;

-- =====================================================
-- STEP 2: CANCEL REGISTRATION RPC
-- =====================================================

CREATE OR REPLACE FUNCTION public.cancel_registration(
  p_registration_id uuid,
  p_reason text DEFAULT NULL,
  p_actor_id uuid DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE 
  v_event_id uuid;
  v_profile_id uuid;
  v_org_id uuid;
  v_current_status text;
BEGIN
  -- Get registration details and update status atomically
  UPDATE public.registrations
  SET 
    status = 'cancelled',
    cancel_reason = p_reason,
    metadata = metadata || jsonb_build_object(
      'cancelled_at', now(),
      'cancelled_by', COALESCE(p_actor_id, auth.uid())
    )
  WHERE id = p_registration_id
    AND status = 'confirmed'
  RETURNING event_id, profile_id, organization_id, status 
  INTO v_event_id, v_profile_id, v_org_id, v_current_status;

  IF NOT FOUND THEN
    -- Check if registration exists but not cancellable
    SELECT event_id, profile_id, organization_id, status
    INTO v_event_id, v_profile_id, v_org_id, v_current_status
    FROM public.registrations
    WHERE id = p_registration_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Registration not found';
    ELSE
      RAISE EXCEPTION 'Registration cannot be cancelled (current status: %)', v_current_status;
    END IF;
  END IF;

  -- Decrement event registration count
  UPDATE public.class_events
  SET reg_count = GREATEST(0, reg_count - 1)
  WHERE id = v_event_id;

  -- Emit outbox events
  INSERT INTO public.outbox_events (organization_id, type, payload)
  VALUES 
    (v_org_id, 'registration.cancelled', jsonb_build_object(
      'registration_id', p_registration_id,
      'event_id', v_event_id,
      'profile_id', v_profile_id,
      'reason', p_reason,
      'cancelled_at', now()
    )),
    (v_org_id, 'waitlist.check_promotion', jsonb_build_object(
      'event_id', v_event_id,
      'triggered_by', 'cancellation'
    ));

  RETURN true;
END$$;

-- =====================================================
-- STEP 3: JOIN WAITLIST RPC
-- =====================================================

CREATE OR REPLACE FUNCTION public.join_waitlist(
  p_event_id uuid,
  p_profile_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE 
  v_waitlist_id uuid;
  v_org_id uuid;
  v_position int;
  v_capacity int;
  v_reg_count int;
BEGIN
  -- Check if event exists and get details
  SELECT organization_id, capacity, reg_count
  INTO v_org_id, v_capacity, v_reg_count
  FROM public.class_events
  WHERE id = p_event_id AND status = 'scheduled';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found or not available for waitlist';
  END IF;

  -- Check if event actually needs waitlist (has capacity and is full)
  IF v_capacity IS NULL OR v_reg_count < v_capacity THEN
    RAISE EXCEPTION 'Event is not full, book directly instead of joining waitlist';
  END IF;

  -- Check if user already registered or on waitlist
  IF EXISTS (
    SELECT 1 FROM public.registrations 
    WHERE event_id = p_event_id AND profile_id = p_profile_id
  ) THEN
    RAISE EXCEPTION 'User already registered for this event';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.event_waitlists 
    WHERE event_id = p_event_id AND profile_id = p_profile_id
  ) THEN
    RAISE EXCEPTION 'User already on waitlist for this event';
  END IF;

  -- Get next position in waitlist
  SELECT COALESCE(MAX(position), 0) + 1
  INTO v_position
  FROM public.event_waitlists
  WHERE event_id = p_event_id;

  -- Add to waitlist
  INSERT INTO public.event_waitlists (
    event_id,
    profile_id,
    organization_id,
    position,
    added_at
  )
  VALUES (
    p_event_id,
    p_profile_id,
    v_org_id,
    v_position,
    now()
  )
  RETURNING id INTO v_waitlist_id;

  -- Update waitlist count on event
  UPDATE public.class_events
  SET waitlist_count = waitlist_count + 1
  WHERE id = p_event_id;

  -- Emit outbox event
  INSERT INTO public.outbox_events (organization_id, type, payload)
  VALUES (v_org_id, 'waitlist.joined', jsonb_build_object(
    'waitlist_id', v_waitlist_id,
    'event_id', p_event_id,
    'profile_id', p_profile_id,
    'position', v_position,
    'added_at', now()
  ));

  RETURN v_waitlist_id;
END$$;

-- =====================================================
-- STEP 4: PROMOTE WAITLIST RPC
-- =====================================================

CREATE OR REPLACE FUNCTION public.promote_waitlist(
  p_event_id uuid,
  p_hold_duration_minutes int DEFAULT 15
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE 
  v_waitlist_id uuid;
  v_profile_id uuid;
  v_org_id uuid;
  v_capacity int;
  v_reg_count int;
  v_hold_id uuid;
BEGIN
  -- Check event capacity
  SELECT organization_id, capacity, reg_count
  INTO v_org_id, v_capacity, v_reg_count
  FROM public.class_events
  WHERE id = p_event_id AND status = 'scheduled';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found or not scheduled';
  END IF;

  -- Check if there's capacity available
  IF v_capacity IS NOT NULL AND v_reg_count >= v_capacity THEN
    RAISE EXCEPTION 'Event is still full, cannot promote from waitlist';
  END IF;

  -- Get next person in waitlist with row locking to prevent races
  SELECT id, profile_id
  INTO v_waitlist_id, v_profile_id
  FROM public.event_waitlists
  WHERE event_id = p_event_id
    AND promoted_at IS NULL
  ORDER BY position
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No one on waitlist to promote';
  END IF;

  -- Create booking hold
  INSERT INTO public.booking_holds (
    event_id,
    profile_id,
    organization_id,
    expires_at
  )
  VALUES (
    p_event_id,
    v_profile_id,
    v_org_id,
    now() + (p_hold_duration_minutes || ' minutes')::interval
  )
  ON CONFLICT (event_id, profile_id) 
  DO UPDATE SET expires_at = now() + (p_hold_duration_minutes || ' minutes')::interval
  RETURNING id INTO v_hold_id;

  -- Mark waitlist entry as promoted
  UPDATE public.event_waitlists
  SET 
    promoted_at = now(),
    expires_at = now() + (p_hold_duration_minutes || ' minutes')::interval
  WHERE id = v_waitlist_id;

  -- Emit outbox event for notification
  INSERT INTO public.outbox_events (organization_id, type, payload)
  VALUES (v_org_id, 'waitlist.promoted', jsonb_build_object(
    'waitlist_id', v_waitlist_id,
    'hold_id', v_hold_id,
    'event_id', p_event_id,
    'profile_id', v_profile_id,
    'expires_at', now() + (p_hold_duration_minutes || ' minutes')::interval,
    'hold_duration_minutes', p_hold_duration_minutes
  ));

  RETURN v_hold_id;
END$$;

-- =====================================================
-- STEP 5: GENERATE EVENTS FROM SERIES RPC
-- =====================================================

CREATE OR REPLACE FUNCTION public.generate_events_rolling(
  p_series_id uuid,
  p_until_date date
) RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE 
  v_series record;
  v_generated_count int := 0;
  v_current_date date;
  v_event_start timestamptz;
  v_event_end timestamptz;
  v_event_id uuid;
BEGIN
  -- Get series details
  SELECT *
  INTO v_series
  FROM public.class_series
  WHERE id = p_series_id AND status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Series not found or not active';
  END IF;

  -- Simple daily generation (extend this for full RRULE support)
  v_current_date := GREATEST(v_series.start_date, CURRENT_DATE);
  
  WHILE v_current_date <= LEAST(p_until_date, COALESCE(v_series.end_date, p_until_date)) LOOP
    -- Calculate event times (this is simplified - extend for complex scheduling)
    v_event_start := (v_current_date + time '09:00')::timestamptz AT TIME ZONE v_series.timezone;
    v_event_end := v_event_start + (v_series.default_duration_mins || ' minutes')::interval;
    
    -- Check if event already exists for this date
    IF NOT EXISTS (
      SELECT 1 FROM public.class_events
      WHERE series_id = p_series_id
        AND date_trunc('day', start_at AT TIME ZONE v_series.timezone) = v_current_date
    ) THEN
      -- Create event
      INSERT INTO public.class_events (
        series_id,
        organization_id,
        title,
        description,
        start_at,
        end_at,
        capacity,
        price_cents,
        location_id,
        instructor_id,
        snapshot
      )
      VALUES (
        p_series_id,
        v_series.organization_id,
        v_series.template_name,
        v_series.metadata->>'description',
        v_event_start,
        v_event_end,
        v_series.default_capacity,
        v_series.default_price_cents,
        v_series.location_id,
        v_series.instructor_id,
        v_series.metadata || jsonb_build_object(
          'duration_minutes', v_series.default_duration_mins,
          'generated_at', now()
        )
      )
      RETURNING id INTO v_event_id;
      
      v_generated_count := v_generated_count + 1;
    END IF;
    
    v_current_date := v_current_date + 1;
  END LOOP;

  RETURN v_generated_count;
END$$;

-- =====================================================
-- STEP 6: BATCH GENERATE FOR ALL SERIES
-- =====================================================

CREATE OR REPLACE FUNCTION public.generate_events_for_all(
  p_until_date date DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE 
  v_series record;
  v_generated int;
  v_total_generated int := 0;
  v_results jsonb := '[]'::jsonb;
  v_target_date date;
BEGIN
  v_target_date := COALESCE(p_until_date, CURRENT_DATE + interval '120 days');
  
  FOR v_series IN 
    SELECT id, template_name, organization_id
    FROM public.class_series
    WHERE status = 'active'
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
  LOOP
    BEGIN
      SELECT public.generate_events_rolling(v_series.id, v_target_date)
      INTO v_generated;
      
      v_total_generated := v_total_generated + v_generated;
      
      v_results := v_results || jsonb_build_object(
        'series_id', v_series.id,
        'series_name', v_series.template_name,
        'organization_id', v_series.organization_id,
        'generated_count', v_generated,
        'status', 'success'
      );
    EXCEPTION WHEN OTHERS THEN
      v_results := v_results || jsonb_build_object(
        'series_id', v_series.id,
        'series_name', v_series.template_name,
        'organization_id', v_series.organization_id,
        'generated_count', 0,
        'status', 'error',
        'error', SQLERRM
      );
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'total_generated', v_total_generated,
    'target_date', v_target_date,
    'processed_at', now(),
    'results', v_results
  );
END$$;

-- =====================================================
-- STEP 7: CLEANUP EXPIRED HOLDS
-- =====================================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_holds()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE 
  v_cleaned_count int;
BEGIN
  -- Remove expired holds
  WITH deleted AS (
    DELETE FROM public.booking_holds
    WHERE expires_at < now()
    RETURNING event_id, profile_id, organization_id
  )
  SELECT count(*) INTO v_cleaned_count FROM deleted;

  -- Also clean up expired waitlist promotions that weren't converted
  UPDATE public.event_waitlists
  SET 
    promoted_at = NULL,
    expires_at = NULL
  WHERE expires_at < now()
    AND promoted_at IS NOT NULL;

  RETURN v_cleaned_count;
END$$;

-- =====================================================
-- STEP 8: WAITLIST PROMOTION TICK (FOR CRON)
-- =====================================================

CREATE OR REPLACE FUNCTION public.promote_waitlists_tick()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE 
  v_event record;
  v_promoted_count int := 0;
  v_hold_id uuid;
  v_results jsonb := '[]'::jsonb;
BEGIN
  -- Find events with available capacity and waitlists
  FOR v_event IN
    SELECT 
      ce.id,
      ce.organization_id,
      ce.capacity,
      ce.reg_count,
      ce.waitlist_count,
      ce.title
    FROM public.class_events ce
    WHERE ce.status = 'scheduled'
      AND ce.start_at > now() + interval '1 hour'  -- At least 1 hour before event
      AND ce.capacity IS NOT NULL
      AND ce.reg_count < ce.capacity
      AND ce.waitlist_count > 0
      AND EXISTS (
        SELECT 1 FROM public.event_waitlists ew
        WHERE ew.event_id = ce.id
          AND ew.promoted_at IS NULL
      )
  LOOP
    BEGIN
      -- Try to promote one person
      SELECT public.promote_waitlist(v_event.id, 15) INTO v_hold_id;
      
      IF v_hold_id IS NOT NULL THEN
        v_promoted_count := v_promoted_count + 1;
        
        v_results := v_results || jsonb_build_object(
          'event_id', v_event.id,
          'event_title', v_event.title,
          'hold_id', v_hold_id,
          'status', 'promoted'
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_results := v_results || jsonb_build_object(
        'event_id', v_event.id,
        'event_title', v_event.title,
        'status', 'error',
        'error', SQLERRM
      );
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'promoted_count', v_promoted_count,
    'processed_at', now(),
    'results', v_results
  );
END$$;

-- =====================================================
-- STEP 9: GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions to authenticated users for booking functions
GRANT EXECUTE ON FUNCTION public.book_event(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_registration(uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_waitlist(uuid, uuid) TO authenticated;

-- Grant execute permissions to service role for admin functions
GRANT EXECUTE ON FUNCTION public.promote_waitlist(uuid, int) TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_events_rolling(uuid, date) TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_events_for_all(date) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_holds() TO service_role;
GRANT EXECUTE ON FUNCTION public.promote_waitlists_tick() TO service_role;

-- =====================================================
-- STEP 10: COMMENTS
-- =====================================================

COMMENT ON FUNCTION public.book_event IS 'Atomically book an event with capacity enforcement and idempotency';
COMMENT ON FUNCTION public.cancel_registration IS 'Cancel a registration and trigger waitlist promotion check';
COMMENT ON FUNCTION public.join_waitlist IS 'Add user to event waitlist with position tracking';
COMMENT ON FUNCTION public.promote_waitlist IS 'Promote next person from waitlist with timed hold';
COMMENT ON FUNCTION public.generate_events_rolling IS 'Generate future events for a series up to target date';
COMMENT ON FUNCTION public.generate_events_for_all IS 'Batch generate events for all active series';
COMMENT ON FUNCTION public.cleanup_expired_holds IS 'Remove expired booking holds';
COMMENT ON FUNCTION public.promote_waitlists_tick IS 'Cron job to promote waitlists for events with capacity';
