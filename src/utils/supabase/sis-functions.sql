-- =====================================================
-- SIS Business Logic Functions
-- Health checks, monitoring, and community messaging
-- =====================================================

-- =====================================================
-- SIS RUNNER FUNCTIONS
-- =====================================================

-- Main SIS runner function (called nightly or on-demand)
CREATE OR REPLACE FUNCTION run_sis_checks(
  p_organization_id UUID DEFAULT NULL,
  p_environment TEXT DEFAULT 'production'
)
RETURNS JSONB AS $$
DECLARE
  run_id BIGINT;
  check_record RECORD;
  result_status TEXT;
  result_message TEXT;
  result_latency INTEGER;
  total_checks INTEGER := 0;
  passed_checks INTEGER := 0;
  failed_checks INTEGER := 0;
  warning_checks INTEGER := 0;
  start_time TIMESTAMPTZ;
  overall_result TEXT;
BEGIN
  start_time := NOW();
  
  -- Create run record
  INSERT INTO sis_runs (
    organization_id,
    actor,
    environment,
    started_at
  ) VALUES (
    p_organization_id,
    auth.uid(),
    p_environment,
    start_time
  ) RETURNING id INTO run_id;
  
  -- Execute all checks for this organization
  FOR check_record IN 
    SELECT * FROM sis_checks 
    WHERE (p_organization_id IS NULL OR organization_id = p_organization_id OR organization_id IS NULL)
    ORDER BY severity DESC, id
  LOOP
    total_checks := total_checks + 1;
    
    -- Execute the check based on type
    SELECT status, message, latency_ms 
    INTO result_status, result_message, result_latency
    FROM execute_sis_check(check_record);
    
    -- Record result
    INSERT INTO sis_results (
      run_id,
      check_id,
      status,
      latency_ms,
      message
    ) VALUES (
      run_id,
      check_record.id,
      result_status,
      result_latency,
      result_message
    );
    
    -- Update counters
    CASE result_status
      WHEN 'ok' THEN passed_checks := passed_checks + 1;
      WHEN 'warn' THEN warning_checks := warning_checks + 1;
      WHEN 'fail' THEN failed_checks := failed_checks + 1;
    END CASE;
  END LOOP;
  
  -- Determine overall result
  overall_result := CASE
    WHEN failed_checks > 0 THEN 'fail'
    WHEN warning_checks > 0 THEN 'warn'
    ELSE 'ok'
  END;
  
  -- Update run record
  UPDATE sis_runs SET
    completed_at = NOW(),
    result = overall_result,
    duration_ms = EXTRACT(epoch FROM (NOW() - start_time)) * 1000,
    checks_total = total_checks,
    checks_passed = passed_checks,
    checks_failed = failed_checks,
    checks_warning = warning_checks
  WHERE id = run_id;
  
  RETURN jsonb_build_object(
    'run_id', run_id,
    'result', overall_result,
    'total_checks', total_checks,
    'passed_checks', passed_checks,
    'failed_checks', failed_checks,
    'warning_checks', warning_checks,
    'duration_ms', EXTRACT(epoch FROM (NOW() - start_time)) * 1000
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute individual SIS check
CREATE OR REPLACE FUNCTION execute_sis_check(check_record sis_checks)
RETURNS TABLE(status TEXT, message TEXT, latency_ms INTEGER) AS $$
DECLARE
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
  result_status TEXT := 'ok';
  result_message TEXT := 'Check passed';
  expectation JSONB;
  test_result BOOLEAN;
  error_msg TEXT;
BEGIN
  start_time := NOW();
  expectation := check_record.expectation_json;
  
  BEGIN
    -- Execute check based on resource type
    CASE check_record.resource_type
      WHEN 'table' THEN
        SELECT * INTO test_result, error_msg FROM check_table_health(check_record.resource_ref, expectation);
      WHEN 'rpc' THEN
        SELECT * INTO test_result, error_msg FROM check_rpc_health(check_record.resource_ref, expectation);
      WHEN 'view' THEN
        SELECT * INTO test_result, error_msg FROM check_view_health(check_record.resource_ref, expectation);
      WHEN 'storage' THEN
        SELECT * INTO test_result, error_msg FROM check_storage_health(check_record.resource_ref, expectation);
      WHEN 'realtime' THEN
        SELECT * INTO test_result, error_msg FROM check_realtime_health(check_record.resource_ref, expectation);
      ELSE
        test_result := false;
        error_msg := 'Unknown resource type: ' || check_record.resource_type;
    END CASE;
    
    IF NOT test_result THEN
      result_status := CASE check_record.severity
        WHEN 'critical' THEN 'fail'
        WHEN 'high' THEN 'fail'
        ELSE 'warn'
      END;
      result_message := COALESCE(error_msg, 'Check failed');
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    result_status := 'fail';
    result_message := 'Check execution error: ' || SQLERRM;
  END;
  
  end_time := NOW();
  
  RETURN QUERY SELECT 
    result_status,
    result_message,
    EXTRACT(epoch FROM (end_time - start_time))::INTEGER * 1000;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INDIVIDUAL CHECK FUNCTIONS
-- =====================================================

-- Check table health
CREATE OR REPLACE FUNCTION check_table_health(
  table_name TEXT,
  expectation JSONB
)
RETURNS TABLE(success BOOLEAN, error_message TEXT) AS $$
DECLARE
  row_count INTEGER;
  policy_test BOOLEAN := true;
  expected_policy TEXT;
BEGIN
  -- Basic table existence and accessibility
  BEGIN
    EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(table_name) INTO row_count;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT false, 'Table inaccessible: ' || SQLERRM;
    RETURN;
  END;
  
  -- Check specific expectations
  IF expectation ? 'expects' THEN
    CASE expectation->>'expects'
      WHEN 'data_within_24h' THEN
        EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(table_name) || 
                ' WHERE created_at >= NOW() - INTERVAL ''24 hours''' INTO row_count;
        IF row_count = 0 THEN
          RETURN QUERY SELECT false, 'No recent data (24h)';
          RETURN;
        END IF;
      WHEN 'readable_by_staff' THEN
        -- This would require more complex role testing
        NULL;
      WHEN ' >=1_active ' THEN
        EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(table_name) || 
                ' WHERE is_active = true' INTO row_count;
        IF row_count = 0 THEN
          RETURN QUERY SELECT false, 'No active records found';
          RETURN;
        END IF;
    END CASE;
  END IF;
  
  -- Check RLS policies if specified
  IF expectation ? 'policy' THEN
    expected_policy := expectation->>'policy';
    -- This would require implementing specific policy tests
    -- For now, just verify RLS is enabled
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = table_name 
      AND rowsecurity = true
    ) THEN
      RETURN QUERY SELECT false, 'RLS not enabled on table';
      RETURN;
    END IF;
  END IF;
  
  RETURN QUERY SELECT true, 'Table health check passed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check RPC health
CREATE OR REPLACE FUNCTION check_rpc_health(
  function_name TEXT,
  expectation JSONB
)
RETURNS TABLE(success BOOLEAN, error_message TEXT) AS $$
DECLARE
  function_exists BOOLEAN;
  test_result JSONB;
BEGIN
  -- Check if function exists
  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = function_name
  ) INTO function_exists;
  
  IF NOT function_exists THEN
    RETURN QUERY SELECT false, 'Function does not exist: ' || function_name;
    RETURN;
  END IF;
  
  -- For sandbox/test functions, we could execute with test parameters
  IF expectation ? 'sandbox' AND (expectation->>'sandbox')::boolean THEN
    -- This would require implementing safe test calls for each function
    -- For now, just verify the function signature
    NULL;
  END IF;
  
  RETURN QUERY SELECT true, 'RPC health check passed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check view health
CREATE OR REPLACE FUNCTION check_view_health(
  view_name TEXT,
  expectation JSONB
)
RETURNS TABLE(success BOOLEAN, error_message TEXT) AS $$
DECLARE
  row_count INTEGER;
BEGIN
  -- Basic view accessibility
  BEGIN
    EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(view_name) INTO row_count;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT false, 'View inaccessible: ' || SQLERRM;
    RETURN;
  END;
  
  RETURN QUERY SELECT true, 'View health check passed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check storage health  
CREATE OR REPLACE FUNCTION check_storage_health(
  bucket_name TEXT,
  expectation JSONB
)
RETURNS TABLE(success BOOLEAN, error_message TEXT) AS $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  -- Check if bucket exists
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = bucket_name
  ) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    RETURN QUERY SELECT false, 'Storage bucket does not exist: ' || bucket_name;
    RETURN;
  END IF;
  
  -- Additional storage checks could be implemented here
  RETURN QUERY SELECT true, 'Storage health check passed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check realtime health
CREATE OR REPLACE FUNCTION check_realtime_health(
  table_name TEXT,
  expectation JSONB
)
RETURNS TABLE(success BOOLEAN, error_message TEXT) AS $$
BEGIN
  -- Check if table is enabled for realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = table_name
  ) THEN
    RETURN QUERY SELECT false, 'Table not enabled for realtime: ' || table_name;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT true, 'Realtime health check passed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMUNITY MESSAGING FUNCTIONS
-- =====================================================

-- Create a new thread
CREATE OR REPLACE FUNCTION create_thread(
  p_organization_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_context_id UUID DEFAULT NULL,
  p_visibility TEXT DEFAULT 'roster',
  p_initial_members UUID[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  thread_id UUID;
  member_id UUID;
BEGIN
  -- Create the thread
  INSERT INTO threads (
    organization_id,
    type,
    title,
    context_id,
    created_by,
    visibility
  ) VALUES (
    p_organization_id,
    p_type,
    p_title,
    p_context_id,
    auth.uid(),
    p_visibility
  ) RETURNING id INTO thread_id;
  
  -- Add the creator as owner
  INSERT INTO thread_members (thread_id, user_id, role)
  VALUES (thread_id, auth.uid(), 'owner');
  
  -- Add initial members if provided
  IF p_initial_members IS NOT NULL THEN
    FOREACH member_id IN ARRAY p_initial_members
    LOOP
      INSERT INTO thread_members (thread_id, user_id, role)
      VALUES (thread_id, member_id, 'member')
      ON CONFLICT (thread_id, user_id) DO NOTHING;
    END LOOP;
  END IF;
  
  RETURN thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Send a message in a thread
CREATE OR REPLACE FUNCTION send_message(
  p_thread_id UUID,
  p_body TEXT,
  p_attachments JSONB DEFAULT '[]',
  p_reply_to_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  message_id UUID;
  is_member BOOLEAN;
  thread_locked BOOLEAN;
BEGIN
  -- Check if user is a member of the thread
  SELECT EXISTS (
    SELECT 1 FROM thread_members 
    WHERE thread_id = p_thread_id AND user_id = auth.uid()
  ) INTO is_member;
  
  IF NOT is_member THEN
    RAISE EXCEPTION 'User is not a member of this thread';
  END IF;
  
  -- Check if thread is locked
  SELECT locked INTO thread_locked FROM threads WHERE id = p_thread_id;
  
  IF thread_locked THEN
    RAISE EXCEPTION 'Thread is locked';
  END IF;
  
  -- Create the message
  INSERT INTO thread_messages (
    thread_id,
    sender_id,
    body,
    attachments,
    reply_to_id
  ) VALUES (
    p_thread_id,
    auth.uid(),
    p_body,
    p_attachments,
    p_reply_to_id
  ) RETURNING id INTO message_id;
  
  -- Update thread members' last_read_at for the sender
  UPDATE thread_members 
  SET last_read_at = NOW()
  WHERE thread_id = p_thread_id AND user_id = auth.uid();
  
  RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Join a thread
CREATE OR REPLACE FUNCTION join_thread(
  p_thread_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  target_user UUID;
  thread_org UUID;
  user_org UUID;
  thread_visibility TEXT;
BEGIN
  target_user := COALESCE(p_user_id, auth.uid());
  
  -- Get thread details
  SELECT organization_id, visibility 
  INTO thread_org, thread_visibility
  FROM threads WHERE id = p_thread_id;
  
  -- Check if user belongs to the same organization
  SELECT om.organization_id INTO user_org
  FROM organization_members om
  WHERE om.user_id = target_user AND om.organization_id = thread_org;
  
  IF user_org IS NULL THEN
    RAISE EXCEPTION 'User not in thread organization';
  END IF;
  
  -- Check visibility permissions
  IF thread_visibility = 'private' THEN
    -- Only allow if user is staff or invited
    IF NOT user_has_roles_in_org(thread_org, ARRAY['owner', 'studio_manager']) THEN
      RAISE EXCEPTION 'Cannot join private thread';
    END IF;
  END IF;
  
  -- Add user to thread
  INSERT INTO thread_members (thread_id, user_id, role)
  VALUES (p_thread_id, target_user, 'member')
  ON CONFLICT (thread_id, user_id) DO NOTHING;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Flag a message for moderation
CREATE OR REPLACE FUNCTION flag_message(
  p_message_id UUID,
  p_reason TEXT
)
RETURNS UUID AS $$
DECLARE
  moderation_id UUID;
  message_org UUID;
BEGIN
  -- Get organization from message
  SELECT t.organization_id INTO message_org
  FROM thread_messages tm
  JOIN threads t ON tm.thread_id = t.id
  WHERE tm.id = p_message_id;
  
  -- Create moderation entry
  INSERT INTO moderation_queue (
    organization_id,
    message_id,
    reason,
    reporter_id
  ) VALUES (
    message_org,
    p_message_id,
    p_reason,
    auth.uid()
  ) RETURNING id INTO moderation_id;
  
  -- Flag the message
  UPDATE thread_messages 
  SET flagged = true, flag_reason = p_reason
  WHERE id = p_message_id;
  
  RETURN moderation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Get SIS health summary for organization
CREATE OR REPLACE FUNCTION get_sis_health_summary(p_organization_id UUID)
RETURNS JSONB AS $$
DECLARE
  latest_run RECORD;
  result JSONB;
BEGIN
  -- Get the latest SIS run
  SELECT * INTO latest_run
  FROM sis_runs
  WHERE organization_id = p_organization_id
  ORDER BY started_at DESC
  LIMIT 1;
  
  IF latest_run IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'unknown',
      'message', 'No SIS runs found',
      'last_run_at', null
    );
  END IF;
  
  result := jsonb_build_object(
    'status', latest_run.result,
    'last_run_at', latest_run.started_at,
    'duration_ms', latest_run.duration_ms,
    'checks_total', latest_run.checks_total,
    'checks_passed', latest_run.checks_passed,
    'checks_failed', latest_run.checks_failed,
    'checks_warning', latest_run.checks_warning
  );
  
  -- Add health score
  IF latest_run.checks_total > 0 THEN
    result := result || jsonb_build_object(
      'health_score', 
      ROUND((latest_run.checks_passed::DECIMAL / latest_run.checks_total) * 100, 1)
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get unread message count for user
CREATE OR REPLACE FUNCTION get_unread_message_count(p_user_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  target_user UUID;
  unread_count INTEGER;
BEGIN
  target_user := COALESCE(p_user_id, auth.uid());
  
  SELECT COUNT(*) INTO unread_count
  FROM thread_messages tm
  JOIN thread_members tmem ON tm.thread_id = tmem.thread_id
  WHERE tmem.user_id = target_user
  AND tm.created_at > tmem.last_read_at
  AND tm.sender_id != target_user
  AND tm.deleted_at IS NULL;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;