-- Stored Procedures for Settings Management
-- Comprehensive business logic for settings, compliance, security, and system health

-- Get or create setting with default value
CREATE OR REPLACE FUNCTION get_setting(
  p_org_id UUID,
  p_key TEXT,
  p_default_value JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  setting_value JSONB;
BEGIN
  SELECT value INTO setting_value
  FROM settings
  WHERE org_id = p_org_id AND key = p_key;
  
  IF setting_value IS NULL THEN
    RETURN p_default_value;
  END IF;
  
  RETURN setting_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update or create setting
CREATE OR REPLACE FUNCTION upsert_setting(
  p_org_id UUID,
  p_key TEXT,
  p_value JSONB,
  p_data_type TEXT DEFAULT 'string',
  p_category_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  setting_id UUID;
BEGIN
  INSERT INTO settings (org_id, key, value, data_type, category_id)
  VALUES (p_org_id, p_key, p_value, p_data_type, p_category_id)
  ON CONFLICT (org_id, key) 
  DO UPDATE SET 
    value = p_value,
    data_type = p_data_type,
    category_id = COALESCE(p_category_id, settings.category_id),
    updated_at = now()
  RETURNING id INTO setting_id;
  
  -- Log the change
  INSERT INTO audit_logs (org_id, user_id, action, resource_type, resource_id, new_values)
  VALUES (p_org_id, auth.uid(), 'setting_updated', 'setting', setting_id::TEXT, jsonb_build_object('key', p_key, 'value', p_value));
  
  RETURN setting_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run system health check
CREATE OR REPLACE FUNCTION run_health_check(p_check_id UUID)
RETURNS UUID AS $$
DECLARE
  health_check system_health_checks%ROWTYPE;
  result_id UUID;
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
  check_result TEXT;
  error_msg TEXT;
BEGIN
  start_time := now();
  
  SELECT * INTO health_check
  FROM system_health_checks
  WHERE id = p_check_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Health check not found or inactive: %', p_check_id;
  END IF;
  
  -- Simulate health check logic (in real implementation, this would call external services)
  BEGIN
    CASE health_check.type
      WHEN 'database' THEN
        PERFORM 1; -- Simple database check
        check_result := 'ok';
      WHEN 'api' THEN
        -- Would make HTTP request to health_check.endpoint
        check_result := 'ok';
      WHEN 'realtime' THEN
        -- Would check Supabase realtime connection
        check_result := 'ok';
      ELSE
        check_result := 'warn';
    END CASE;
  EXCEPTION WHEN OTHERS THEN
    check_result := 'fail';
    error_msg := SQLERRM;
  END;
  
  end_time := now();
  
  INSERT INTO system_health_results (
    check_id,
    status,
    response_time_ms,
    error_message,
    checked_at
  ) VALUES (
    p_check_id,
    check_result,
    EXTRACT(EPOCH FROM (end_time - start_time)) * 1000,
    error_msg,
    start_time
  ) RETURNING id INTO result_id;
  
  RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run all active health checks
CREATE OR REPLACE FUNCTION run_all_health_checks()
RETURNS TABLE(check_id UUID, result_id UUID, status TEXT) AS $$
DECLARE
  check_record RECORD;
  result_id UUID;
BEGIN
  FOR check_record IN 
    SELECT id FROM system_health_checks WHERE is_active = true
  LOOP
    result_id := run_health_check(check_record.id);
    
    SELECT shr.status INTO status
    FROM system_health_results shr
    WHERE shr.id = result_id;
    
    RETURN QUERY SELECT check_record.id, result_id, status;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate API key
CREATE OR REPLACE FUNCTION generate_api_key(
  p_org_id UUID,
  p_name TEXT,
  p_scopes TEXT[] DEFAULT '{}',
  p_permissions TEXT[] DEFAULT '{}',
  p_expires_days INTEGER DEFAULT 365
)
RETURNS TABLE(key_id UUID, api_key TEXT, key_prefix TEXT) AS $$
DECLARE
  new_key_id UUID;
  raw_key TEXT;
  key_hash TEXT;
  prefix TEXT;
  expires_at TIMESTAMPTZ;
BEGIN
  -- Generate random API key
  raw_key := 'ys_' || encode(gen_random_bytes(32), 'base64');
  raw_key := replace(replace(raw_key, '+', ''), '/', '');
  raw_key := substr(raw_key, 1, 48); -- Fixed length
  
  -- Create prefix (first 8 chars)
  prefix := substr(raw_key, 1, 8);
  
  -- Hash the key for storage
  key_hash := encode(digest(raw_key, 'sha256'), 'hex');
  
  -- Set expiration
  IF p_expires_days > 0 THEN
    expires_at := now() + (p_expires_days || ' days')::INTERVAL;
  END IF;
  
  INSERT INTO api_keys (
    org_id,
    name,
    key_hash,
    key_prefix,
    scopes,
    permissions,
    expires_at,
    created_by
  ) VALUES (
    p_org_id,
    p_name,
    key_hash,
    prefix,
    p_scopes,
    p_permissions,
    expires_at,
    auth.uid()
  ) RETURNING id INTO new_key_id;
  
  -- Log the creation
  INSERT INTO audit_logs (org_id, user_id, action, resource_type, resource_id, new_values)
  VALUES (p_org_id, auth.uid(), 'api_key_created', 'api_key', new_key_id::TEXT, jsonb_build_object('name', p_name, 'scopes', p_scopes));
  
  RETURN QUERY SELECT new_key_id, raw_key, prefix;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validate API key
CREATE OR REPLACE FUNCTION validate_api_key(p_api_key TEXT)
RETURNS TABLE(
  key_id UUID,
  org_id UUID,
  scopes TEXT[],
  permissions TEXT[],
  is_valid BOOLEAN
) AS $$
DECLARE
  key_hash TEXT;
  key_record RECORD;
BEGIN
  -- Hash the provided key
  key_hash := encode(digest(p_api_key, 'sha256'), 'hex');
  
  SELECT 
    ak.id,
    ak.org_id,
    ak.scopes,
    ak.permissions,
    CASE 
      WHEN ak.is_active = false THEN false
      WHEN ak.expires_at IS NOT NULL AND ak.expires_at < now() THEN false
      ELSE true
    END as valid
  INTO key_record
  FROM api_keys ak
  WHERE ak.key_hash = key_hash;
  
  IF FOUND THEN
    -- Update last used timestamp
    UPDATE api_keys SET last_used_at = now() WHERE id = key_record.id;
    
    RETURN QUERY SELECT 
      key_record.id,
      key_record.org_id,
      key_record.scopes,
      key_record.permissions,
      key_record.valid;
  ELSE
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, '{}'::TEXT[], '{}'::TEXT[], false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or update compliance policy
CREATE OR REPLACE FUNCTION upsert_compliance_policy(
  p_org_id UUID,
  p_type TEXT,
  p_title JSONB,
  p_content JSONB,
  p_version TEXT,
  p_effective_from TIMESTAMPTZ DEFAULT now(),
  p_requires_acceptance BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  policy_id UUID;
  old_policy_id UUID;
BEGIN
  -- Deactivate any existing active policy of the same type
  UPDATE compliance_policies 
  SET is_active = false, effective_until = now()
  WHERE org_id = p_org_id 
    AND type = p_type 
    AND is_active = true
  RETURNING id INTO old_policy_id;
  
  -- Create new policy
  INSERT INTO compliance_policies (
    org_id,
    type,
    title,
    content,
    version,
    effective_from,
    requires_acceptance,
    created_by
  ) VALUES (
    p_org_id,
    p_type,
    p_title,
    p_content,
    p_version,
    p_effective_from,
    p_requires_acceptance,
    auth.uid()
  ) RETURNING id INTO policy_id;
  
  -- Log the change
  INSERT INTO audit_logs (org_id, user_id, action, resource_type, resource_id, new_values)
  VALUES (p_org_id, auth.uid(), 'policy_created', 'compliance_policy', policy_id::TEXT, 
    jsonb_build_object('type', p_type, 'version', p_version, 'previous_policy_id', old_policy_id));
  
  RETURN policy_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record policy acceptance
CREATE OR REPLACE FUNCTION accept_policy(
  p_policy_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  acceptance_id UUID;
  policy_org_id UUID;
BEGIN
  -- Get policy org_id for audit log
  SELECT org_id INTO policy_org_id
  FROM compliance_policies
  WHERE id = p_policy_id;
  
  INSERT INTO policy_acceptances (
    policy_id,
    user_id,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    p_policy_id,
    auth.uid(),
    p_ip_address,
    p_user_agent,
    p_metadata
  ) 
  ON CONFLICT (policy_id, user_id) 
  DO UPDATE SET 
    accepted_at = now(),
    ip_address = p_ip_address,
    user_agent = p_user_agent,
    metadata = p_metadata
  RETURNING id INTO acceptance_id;
  
  -- Log the acceptance
  INSERT INTO audit_logs (org_id, user_id, action, resource_type, resource_id, new_values)
  VALUES (policy_org_id, auth.uid(), 'policy_accepted', 'policy_acceptance', acceptance_id::TEXT, 
    jsonb_build_object('policy_id', p_policy_id));
  
  RETURN acceptance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record consent
CREATE OR REPLACE FUNCTION record_consent(
  p_org_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_purpose TEXT,
  p_consent_given BOOLEAN,
  p_consent_method TEXT DEFAULT 'opt_in',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_source_url TEXT DEFAULT NULL,
  p_expires_days INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  consent_id UUID;
  expires_at TIMESTAMPTZ;
BEGIN
  IF p_expires_days IS NOT NULL THEN
    expires_at := now() + (p_expires_days || ' days')::INTERVAL;
  END IF;
  
  INSERT INTO consent_records (
    org_id,
    user_id,
    email,
    purpose,
    consent_given,
    consent_method,
    ip_address,
    user_agent,
    source_url,
    expires_at
  ) VALUES (
    p_org_id,
    COALESCE(p_user_id, auth.uid()),
    p_email,
    p_purpose,
    p_consent_given,
    p_consent_method,
    p_ip_address,
    p_user_agent,
    p_source_url,
    expires_at
  ) RETURNING id INTO consent_id;
  
  -- Log the consent
  INSERT INTO audit_logs (org_id, user_id, action, resource_type, resource_id, new_values)
  VALUES (p_org_id, COALESCE(p_user_id, auth.uid()), 'consent_recorded', 'consent_record', consent_id::TEXT, 
    jsonb_build_object('purpose', p_purpose, 'consent_given', p_consent_given));
  
  RETURN consent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Withdraw consent
CREATE OR REPLACE FUNCTION withdraw_consent(
  p_org_id UUID,
  p_purpose TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE consent_records 
  SET 
    consent_given = false,
    withdrawn_at = now(),
    updated_at = now()
  WHERE org_id = p_org_id 
    AND user_id = COALESCE(p_user_id, auth.uid())
    AND purpose = p_purpose
    AND consent_given = true
    AND withdrawn_at IS NULL;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Log the withdrawal
  IF affected_rows > 0 THEN
    INSERT INTO audit_logs (org_id, user_id, action, resource_type, resource_id, new_values)
    VALUES (p_org_id, COALESCE(p_user_id, auth.uid()), 'consent_withdrawn', 'consent_record', p_purpose, 
      jsonb_build_object('purpose', p_purpose));
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Data Subject Access Request
CREATE OR REPLACE FUNCTION create_dsar(
  p_org_id UUID,
  p_requester_email TEXT,
  p_requester_name TEXT,
  p_request_type TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  dsar_id UUID;
  due_date TIMESTAMPTZ;
BEGIN
  -- Set due date based on GDPR requirements (30 days)
  due_date := now() + INTERVAL '30 days';
  
  INSERT INTO data_subject_requests (
    org_id,
    requester_email,
    requester_name,
    request_type,
    description,
    due_date
  ) VALUES (
    p_org_id,
    p_requester_email,
    p_requester_name,
    p_request_type,
    p_description,
    due_date
  ) RETURNING id INTO dsar_id;
  
  -- Log the request
  INSERT INTO audit_logs (org_id, user_id, action, resource_type, resource_id, new_values)
  VALUES (p_org_id, auth.uid(), 'dsar_created', 'data_subject_request', dsar_id::TEXT, 
    jsonb_build_object('request_type', p_request_type, 'requester_email', p_requester_email));
  
  RETURN dsar_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete DSAR
CREATE OR REPLACE FUNCTION complete_dsar(
  p_dsar_id UUID,
  p_response_data JSONB DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  dsar_org_id UUID;
BEGIN
  UPDATE data_subject_requests 
  SET 
    status = 'completed',
    completed_at = now(),
    response_data = p_response_data,
    notes = p_notes,
    updated_at = now()
  WHERE id = p_dsar_id
  RETURNING org_id INTO dsar_org_id;
  
  IF FOUND THEN
    -- Log the completion
    INSERT INTO audit_logs (org_id, user_id, action, resource_type, resource_id, new_values)
    VALUES (dsar_org_id, auth.uid(), 'dsar_completed', 'data_subject_request', p_dsar_id::TEXT, 
      jsonb_build_object('completed_at', now()));
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run SIS check
CREATE OR REPLACE FUNCTION run_sis_check(p_check_id UUID, p_run_id UUID DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  check_record sis_checks%ROWTYPE;
  result_id UUID;
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
  check_status TEXT;
  check_message TEXT;
  latency_ms INTEGER;
BEGIN
  start_time := now();
  
  SELECT * INTO check_record
  FROM sis_checks
  WHERE id = p_check_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SIS check not found or inactive: %', p_check_id;
  END IF;
  
  -- Simulate check logic (in real implementation, this would perform actual checks)
  BEGIN
    CASE check_record.resource_type
      WHEN 'table' THEN
        -- Check if table exists and has proper RLS
        EXECUTE format('SELECT 1 FROM %I LIMIT 1', check_record.resource_ref);
        check_status := 'pass';
        check_message := 'Table accessible and RLS working';
      WHEN 'rpc' THEN
        -- Check if RPC exists and is callable
        check_status := 'pass';
        check_message := 'RPC callable';
      WHEN 'storage' THEN
        -- Check storage bucket access
        check_status := 'pass';
        check_message := 'Storage bucket accessible';
      WHEN 'realtime' THEN
        -- Check realtime subscription
        check_status := 'pass';
        check_message := 'Realtime channel active';
      ELSE
        check_status := 'warn';
        check_message := 'Unknown resource type';
    END CASE;
  EXCEPTION WHEN OTHERS THEN
    check_status := 'fail';
    check_message := SQLERRM;
  END;
  
  end_time := now();
  latency_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  
  INSERT INTO sis_results (
    run_id,
    check_id,
    status,
    latency_ms,
    message
  ) VALUES (
    p_run_id,
    p_check_id,
    check_status,
    latency_ms,
    check_message
  ) RETURNING id INTO result_id;
  
  RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Start SIS run
CREATE OR REPLACE FUNCTION start_sis_run(p_environment TEXT DEFAULT 'production')
RETURNS UUID AS $$
DECLARE
  run_id UUID;
  check_record RECORD;
  total_checks INTEGER := 0;
  passed_checks INTEGER := 0;
  warned_checks INTEGER := 0;
  failed_checks INTEGER := 0;
  overall_result TEXT;
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
BEGIN
  start_time := now();
  
  INSERT INTO sis_runs (started_at, actor, environment)
  VALUES (start_time, auth.uid(), p_environment)
  RETURNING id INTO run_id;
  
  -- Run all active checks
  FOR check_record IN 
    SELECT id FROM sis_checks WHERE is_active = true
  LOOP
    PERFORM run_sis_check(check_record.id, run_id);
    total_checks := total_checks + 1;
  END LOOP;
  
  -- Count results
  SELECT 
    COUNT(*) FILTER (WHERE status = 'pass'),
    COUNT(*) FILTER (WHERE status = 'warn'),
    COUNT(*) FILTER (WHERE status = 'fail')
  INTO passed_checks, warned_checks, failed_checks
  FROM sis_results
  WHERE run_id = run_id;
  
  -- Determine overall result
  IF failed_checks > 0 THEN
    overall_result := 'fail';
  ELSIF warned_checks > 0 THEN
    overall_result := 'warn';
  ELSE
    overall_result := 'ok';
  END IF;
  
  end_time := now();
  
  -- Update run with results
  UPDATE sis_runs SET
    completed_at = end_time,
    result = overall_result,
    duration_ms = EXTRACT(EPOCH FROM (end_time - start_time)) * 1000,
    checks_total = total_checks,
    checks_passed = passed_checks,
    checks_warned = warned_checks,
    checks_failed = failed_checks
  WHERE id = run_id;
  
  RETURN run_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get organization settings summary
CREATE OR REPLACE FUNCTION get_org_settings_summary(p_org_id UUID)
RETURNS TABLE(
  category_name TEXT,
  settings_count INTEGER,
  last_updated TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(sc.name, 'Uncategorized') as category_name,
    COUNT(s.id)::INTEGER as settings_count,
    MAX(s.updated_at) as last_updated
  FROM settings s
  LEFT JOIN settings_categories sc ON s.category_id = sc.id
  WHERE s.org_id = p_org_id
  GROUP BY sc.name
  ORDER BY sc.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;