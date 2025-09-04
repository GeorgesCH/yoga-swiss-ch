-- Marketing Module Stored Procedures for YogaSwiss
-- Complex business logic and operations

-- ==================== SEGMENTS & AUDIENCE MANAGEMENT ====================

-- Refresh segment count and members
CREATE OR REPLACE FUNCTION refresh_segment_count(p_segment_id UUID)
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id UUID;
    v_tenant_id UUID;
    v_definition JSONB;
    v_query TEXT;
    v_count INTEGER;
BEGIN
    -- Get segment details
    SELECT org_id, tenant_id, definition_json 
    INTO v_org_id, v_tenant_id, v_definition
    FROM segments 
    WHERE id = p_segment_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Segment not found';
    END IF;
    
    -- Build dynamic query based on segment definition
    v_query := build_segment_query(v_org_id, v_definition);
    
    -- Execute count query
    EXECUTE 'SELECT COUNT(*) FROM (' || v_query || ') AS segment_members'
    INTO v_count;
    
    -- Update segment
    UPDATE segments 
    SET live_count = v_count, refreshed_at = NOW()
    WHERE id = p_segment_id;
    
    RETURN v_count;
END;
$$;

-- Preview segment members
CREATE OR REPLACE FUNCTION preview_segment(
    p_org_id UUID,
    p_definition JSONB,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    person_id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    locale TEXT,
    tags TEXT[],
    score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_query TEXT;
BEGIN
    -- Build query
    v_query := build_segment_query(p_org_id, p_definition, p_limit);
    
    -- Return results
    RETURN QUERY EXECUTE v_query;
END;
$$;

-- Build segment query from definition
CREATE OR REPLACE FUNCTION build_segment_query(
    p_org_id UUID,
    p_definition JSONB,
    p_limit INTEGER DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_base_query TEXT;
    v_where_clauses TEXT[];
    v_joins TEXT[];
    v_final_query TEXT;
    v_profile_filters JSONB;
    v_behavior_filters JSONB;
    v_finance_filters JSONB;
    v_marketing_filters JSONB;
BEGIN
    -- Base query
    v_base_query := '
        SELECT DISTINCT 
            p.id as person_id,
            p.email,
            p.first_name,
            p.last_name,
            p.locale,
            COALESCE(l.tags, ARRAY[]::TEXT[]) as tags,
            COALESCE(l.score, 0) as score
        FROM people p
        LEFT JOIN leads l ON l.person_id = p.id
    ';
    
    -- Always filter by org
    v_where_clauses := ARRAY['p.org_id = ''' || p_org_id || ''''];
    
    -- Extract filter groups
    v_profile_filters := p_definition -> 'profile_filters';
    v_behavior_filters := p_definition -> 'behavior_filters';
    v_finance_filters := p_definition -> 'finance_filters';
    v_marketing_filters := p_definition -> 'marketing_filters';
    
    -- Profile filters
    IF v_profile_filters IS NOT NULL THEN
        IF v_profile_filters ? 'locale' THEN
            v_where_clauses := array_append(v_where_clauses, 
                'p.locale = ANY(''' || (v_profile_filters ->> 'locale')::TEXT || ''')');
        END IF;
        
        IF v_profile_filters ? 'city' THEN
            v_where_clauses := array_append(v_where_clauses, 
                'p.city = ANY(''' || (v_profile_filters ->> 'city')::TEXT || ''')');
        END IF;
        
        IF v_profile_filters ? 'tags' THEN
            v_where_clauses := array_append(v_where_clauses, 
                'l.tags && ''' || (v_profile_filters ->> 'tags')::TEXT || '''');
        END IF;
        
        IF v_profile_filters ? 'source' THEN
            v_where_clauses := array_append(v_where_clauses, 
                'l.source = ANY(''' || (v_profile_filters ->> 'source')::TEXT || ''')');
        END IF;
        
        IF (v_profile_filters ->> 'corporate_membership')::BOOLEAN = true THEN
            v_joins := array_append(v_joins, 'JOIN memberships m ON m.customer_id = p.id AND m.type = ''corporate''');
        END IF;
    END IF;
    
    -- Behavior filters
    IF v_behavior_filters IS NOT NULL THEN
        IF v_behavior_filters ? 'classes_attended_min' OR v_behavior_filters ? 'classes_attended_max' THEN
            v_joins := array_append(v_joins, 'LEFT JOIN (
                SELECT customer_id, COUNT(*) as classes_count
                FROM registrations 
                WHERE status = ''attended'' 
                GROUP BY customer_id
            ) reg_stats ON reg_stats.customer_id = p.id');
            
            IF v_behavior_filters ? 'classes_attended_min' THEN
                v_where_clauses := array_append(v_where_clauses, 
                    'COALESCE(reg_stats.classes_count, 0) >= ' || (v_behavior_filters ->> 'classes_attended_min'));
            END IF;
            
            IF v_behavior_filters ? 'classes_attended_max' THEN
                v_where_clauses := array_append(v_where_clauses, 
                    'COALESCE(reg_stats.classes_count, 0) <= ' || (v_behavior_filters ->> 'classes_attended_max'));
            END IF;
        END IF;
        
        IF v_behavior_filters ? 'last_booking_days_ago' THEN
            v_joins := array_append(v_joins, 'LEFT JOIN (
                SELECT customer_id, MAX(booked_at) as last_booking
                FROM registrations 
                GROUP BY customer_id
            ) last_booking ON last_booking.customer_id = p.id');
            
            v_where_clauses := array_append(v_where_clauses, 
                'last_booking.last_booking <= NOW() - INTERVAL ''' || 
                (v_behavior_filters ->> 'last_booking_days_ago') || ' days''');
        END IF;
        
        IF v_behavior_filters ? 'no_show_count_max' THEN
            v_joins := array_append(v_joins, 'LEFT JOIN (
                SELECT customer_id, COUNT(*) as no_show_count
                FROM registrations 
                WHERE status = ''no_show'' 
                GROUP BY customer_id
            ) no_show_stats ON no_show_stats.customer_id = p.id');
            
            v_where_clauses := array_append(v_where_clauses, 
                'COALESCE(no_show_stats.no_show_count, 0) <= ' || (v_behavior_filters ->> 'no_show_count_max'));
        END IF;
    END IF;
    
    -- Finance filters
    IF v_finance_filters IS NOT NULL THEN
        IF v_finance_filters ? 'spend_min' OR v_finance_filters ? 'spend_max' THEN
            v_joins := array_append(v_joins, 'LEFT JOIN (
                SELECT customer_id, SUM(total_amount) as total_spend
                FROM orders 
                WHERE status IN (''paid'', ''completed'')
                GROUP BY customer_id
            ) spend_stats ON spend_stats.customer_id = p.id');
            
            IF v_finance_filters ? 'spend_min' THEN
                v_where_clauses := array_append(v_where_clauses, 
                    'COALESCE(spend_stats.total_spend, 0) >= ' || (v_finance_filters ->> 'spend_min'));
            END IF;
            
            IF v_finance_filters ? 'spend_max' THEN
                v_where_clauses := array_append(v_where_clauses, 
                    'COALESCE(spend_stats.total_spend, 0) <= ' || (v_finance_filters ->> 'spend_max'));
            END IF;
        END IF;
        
        IF v_finance_filters ? 'membership_status' THEN
            v_joins := array_append(v_joins, 'JOIN memberships mem ON mem.customer_id = p.id');
            v_where_clauses := array_append(v_where_clauses, 
                'mem.status = ANY(''' || (v_finance_filters ->> 'membership_status')::TEXT || ''')');
        END IF;
        
        IF v_finance_filters ? 'wallet_balance_min' THEN
            v_joins := array_append(v_joins, 'LEFT JOIN wallets w ON w.customer_id = p.id');
            v_where_clauses := array_append(v_where_clauses, 
                'COALESCE(w.balance, 0) >= ' || (v_finance_filters ->> 'wallet_balance_min'));
        END IF;
        
        IF (v_finance_filters ->> 'gift_card_holder')::BOOLEAN = true THEN
            v_joins := array_append(v_joins, 'JOIN gift_cards gc ON gc.recipient_id = p.id AND gc.balance > 0');
        END IF;
    END IF;
    
    -- Marketing filters
    IF v_marketing_filters IS NOT NULL THEN
        IF v_marketing_filters ? 'consent_email' THEN
            IF (v_marketing_filters ->> 'consent_email')::BOOLEAN = true THEN
                v_where_clauses := array_append(v_where_clauses, 
                    '(l.consent_json -> ''email'' ->> ''granted'')::BOOLEAN = true');
            END IF;
        END IF;
        
        IF v_marketing_filters ? 'consent_sms' THEN
            IF (v_marketing_filters ->> 'consent_sms')::BOOLEAN = true THEN
                v_where_clauses := array_append(v_where_clauses, 
                    '(l.consent_json -> ''sms'' ->> ''granted'')::BOOLEAN = true');
            END IF;
        END IF;
        
        IF v_marketing_filters ? 'last_open_days_ago' THEN
            v_joins := array_append(v_joins, 'LEFT JOIN (
                SELECT recipient_id, MAX(open_at) as last_open
                FROM messages 
                WHERE open_at IS NOT NULL
                GROUP BY recipient_id
            ) email_activity ON email_activity.recipient_id = p.id');
            
            v_where_clauses := array_append(v_where_clauses, 
                'email_activity.last_open <= NOW() - INTERVAL ''' || 
                (v_marketing_filters ->> 'last_open_days_ago') || ' days''');
        END IF;
    END IF;
    
    -- Build final query
    v_final_query := v_base_query;
    
    -- Add joins
    IF array_length(v_joins, 1) > 0 THEN
        v_final_query := v_final_query || ' ' || array_to_string(v_joins, ' ');
    END IF;
    
    -- Add where clause
    IF array_length(v_where_clauses, 1) > 0 THEN
        v_final_query := v_final_query || ' WHERE ' || array_to_string(v_where_clauses, ' AND ');
    END IF;
    
    -- Add limit if specified
    IF p_limit IS NOT NULL THEN
        v_final_query := v_final_query || ' LIMIT ' || p_limit;
    END IF;
    
    RETURN v_final_query;
END;
$$;

-- Sync audience to ad platform
CREATE OR REPLACE FUNCTION sync_audience_to_ads(
    p_segment_id UUID,
    p_platform TEXT,
    p_audience_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_audience_id UUID;
    v_org_id UUID;
    v_tenant_id UUID;
    v_member_count INTEGER;
    v_hashed_emails TEXT[];
BEGIN
    -- Get segment details
    SELECT org_id, tenant_id, live_count
    INTO v_org_id, v_tenant_id, v_member_count
    FROM segments 
    WHERE id = p_segment_id;
    
    -- Create or update audience record
    INSERT INTO audiences (
        org_id,
        tenant_id,
        segment_id,
        sync_target,
        status
    ) VALUES (
        v_org_id,
        v_tenant_id,
        p_segment_id,
        p_platform,
        'syncing'
    )
    ON CONFLICT (segment_id, sync_target) 
    DO UPDATE SET 
        status = 'syncing',
        last_synced_at = NOW()
    RETURNING id INTO v_audience_id;
    
    -- Get consenting member emails (hashed for privacy)
    SELECT array_agg(encode(digest(p.email, 'sha256'), 'hex'))
    INTO v_hashed_emails
    FROM people p
    JOIN leads l ON l.person_id = p.id
    WHERE p.org_id = v_org_id
    AND (l.consent_json -> 'email' ->> 'granted')::BOOLEAN = true
    AND p.id IN (
        -- Get segment members using the segment definition
        SELECT person_id FROM (
            SELECT person_id FROM preview_segment(v_org_id, 
                (SELECT definition_json FROM segments WHERE id = p_segment_id),
                NULL
            )
        ) AS members
    );
    
    -- Here you would call the external API (Meta/Google)
    -- For now, we'll simulate success and update the record
    
    UPDATE audiences 
    SET 
        status = 'synced',
        sync_count = array_length(v_hashed_emails, 1),
        last_synced_at = NOW()
    WHERE id = v_audience_id;
    
    RETURN v_audience_id;
END;
$$;

-- ==================== CAMPAIGN MANAGEMENT ====================

-- Run pre-flight checks before sending campaign
CREATE OR REPLACE FUNCTION run_campaign_preflight_checks(p_campaign_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_campaign campaigns%ROWTYPE;
    v_segment segments%ROWTYPE;
    v_template templates%ROWTYPE;
    v_errors TEXT[] := '{}';
    v_warnings TEXT[] := '{}';
    v_recipient_count INTEGER;
BEGIN
    -- Get campaign details
    SELECT * INTO v_campaign FROM campaigns WHERE id = p_campaign_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Campaign not found';
    END IF;
    
    -- Check segment exists and has members
    IF v_campaign.audience_segment_id IS NOT NULL THEN
        SELECT * INTO v_segment FROM segments WHERE id = v_campaign.audience_segment_id;
        
        IF NOT FOUND THEN
            v_errors := array_append(v_errors, 'Segment not found');
        ELSIF v_segment.live_count = 0 THEN
            v_errors := array_append(v_errors, 'Segment has no members');
        END IF;
    ELSE
        v_errors := array_append(v_errors, 'No audience segment specified');
    END IF;
    
    -- Check template exists and is active
    IF v_campaign.template_id IS NOT NULL THEN
        SELECT * INTO v_template FROM templates WHERE id = v_campaign.template_id;
        
        IF NOT FOUND THEN
            v_errors := array_append(v_errors, 'Template not found');
        ELSIF NOT v_template.is_active THEN
            v_errors := array_append(v_errors, 'Template is not active');
        END IF;
        
        -- Check for broken links in template
        IF v_template.content ~ 'http://[^s]' THEN
            v_warnings := array_append(v_warnings, 'Template contains non-HTTPS links');
        END IF;
        
        -- Check for missing alt text
        IF v_template.content ~ '<img[^>]*(?!alt=)[^>]*>' THEN
            v_warnings := array_append(v_warnings, 'Template contains images without alt text');
        END IF;
        
        -- Check spam words
        IF v_template.content ~* 'FREE|URGENT|LIMITED TIME|ACT NOW|CLICK HERE' THEN
            v_warnings := array_append(v_warnings, 'Template contains potential spam trigger words');
        END IF;
    ELSE
        v_errors := array_append(v_errors, 'No template specified');
    END IF;
    
    -- Check domain authentication
    IF v_campaign.channel = 'email' THEN
        IF NOT EXISTS (
            SELECT 1 FROM domain_settings 
            WHERE org_id = v_campaign.org_id 
            AND dkim_status = 'verified' 
            AND spf_status = 'verified'
        ) THEN
            v_warnings := array_append(v_warnings, 'Domain authentication not fully verified');
        END IF;
    END IF;
    
    -- Check budget constraints
    IF v_campaign.budget_json IS NOT NULL THEN
        DECLARE
            v_max_spend DECIMAL := (v_campaign.budget_json ->> 'max_spend')::DECIMAL;
            v_cost_per_send DECIMAL := COALESCE((v_campaign.budget_json ->> 'cost_per_send')::DECIMAL, 0);
            v_estimated_cost DECIMAL;
        BEGIN
            IF v_segment.live_count IS NOT NULL THEN
                v_estimated_cost := v_segment.live_count * v_cost_per_send;
                IF v_estimated_cost > v_max_spend THEN
                    v_errors := array_append(v_errors, 
                        'Estimated cost (' || v_estimated_cost || ') exceeds budget (' || v_max_spend || ')');
                END IF;
            END IF;
        END;
    END IF;
    
    -- Count final recipients (after suppressions)
    IF v_campaign.audience_segment_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_recipient_count
        FROM (
            SELECT person_id FROM preview_segment(
                v_campaign.org_id,
                v_segment.definition_json,
                NULL
            )
        ) members
        JOIN people p ON p.id = members.person_id
        LEFT JOIN suppression_lists sl ON (
            sl.org_id = v_campaign.org_id 
            AND sl.type = v_campaign.channel
            AND sl.value = CASE 
                WHEN v_campaign.channel = 'email' THEN p.email
                WHEN v_campaign.channel = 'sms' THEN p.phone
                ELSE p.email
            END
        )
        WHERE sl.id IS NULL; -- Not suppressed
        
        IF v_recipient_count = 0 THEN
            v_errors := array_append(v_errors, 'No eligible recipients after applying suppressions');
        END IF;
    END IF;
    
    RETURN jsonb_build_object(
        'passed', array_length(v_errors, 1) = 0,
        'errors', v_errors,
        'warnings', v_warnings,
        'recipient_count', v_recipient_count
    );
END;
$$;

-- Send campaign preview
CREATE OR REPLACE FUNCTION send_campaign_preview(
    p_campaign_id UUID,
    p_recipient_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_campaign campaigns%ROWTYPE;
    v_template templates%ROWTYPE;
    v_rendered_content TEXT;
    v_message_id UUID;
BEGIN
    -- Get campaign and template
    SELECT * INTO v_campaign FROM campaigns WHERE id = p_campaign_id;
    SELECT * INTO v_template FROM templates WHERE id = v_campaign.template_id;
    
    -- Render template with sample data
    SELECT content INTO v_rendered_content 
    FROM render_template(
        v_campaign.template_id,
        jsonb_build_object(
            'first_name', 'Preview',
            'last_name', 'User',
            'studio_name', 'YogaSwiss Studio',
            'class_name', 'Morning Vinyasa',
            'preview_mode', true
        )
    );
    
    -- Create preview message record
    INSERT INTO messages (
        campaign_id,
        recipient_type,
        recipient_id,
        channel,
        subject,
        content,
        send_at,
        delivery_status
    ) VALUES (
        p_campaign_id,
        'preview',
        (SELECT get_current_user_id()),
        v_campaign.channel,
        '[PREVIEW] ' || v_template.subject,
        v_rendered_content,
        NOW(),
        'preview_sent'
    ) RETURNING id INTO v_message_id;
    
    -- Here you would actually send the email via your ESP
    -- For now, we'll simulate success
    
    UPDATE messages 
    SET sent_at = NOW(), delivery_status = 'sent'
    WHERE id = v_message_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message_id', v_message_id,
        'sent_to', p_recipient_email
    );
END;
$$;

-- ==================== JOURNEY AUTOMATION ====================

-- Enroll lead in journey
CREATE OR REPLACE FUNCTION enroll_lead_in_journey(
    p_lead_id UUID,
    p_journey_id UUID,
    p_entry_node_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_enrollment_id UUID;
    v_journey journeys%ROWTYPE;
BEGIN
    -- Get journey details
    SELECT * INTO v_journey FROM journeys WHERE id = p_journey_id;
    
    IF NOT FOUND OR v_journey.status != 'published' THEN
        RAISE EXCEPTION 'Journey not found or not published';
    END IF;
    
    -- Check if lead is already enrolled
    IF EXISTS (
        SELECT 1 FROM journey_enrollments 
        WHERE journey_id = p_journey_id 
        AND lead_id = p_lead_id 
        AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Lead already enrolled in this journey';
    END IF;
    
    -- Create enrollment
    INSERT INTO journey_enrollments (
        journey_id,
        lead_id,
        current_node_id,
        status,
        enrolled_at
    ) VALUES (
        p_journey_id,
        p_lead_id,
        p_entry_node_id,
        'active',
        NOW()
    ) RETURNING id INTO v_enrollment_id;
    
    -- Update journey stats
    UPDATE journeys 
    SET enrollments_count = enrollments_count + 1
    WHERE id = p_journey_id;
    
    -- Process first journey step
    PERFORM process_journey_node(v_enrollment_id, p_entry_node_id);
    
    RETURN v_enrollment_id;
END;
$$;

-- Process journey node
CREATE OR REPLACE FUNCTION process_journey_node(
    p_enrollment_id UUID,
    p_node_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_node journey_nodes%ROWTYPE;
    v_enrollment journey_enrollments%ROWTYPE;
    v_lead leads%ROWTYPE;
    v_journey journeys%ROWTYPE;
    v_config JSONB;
BEGIN
    -- Get enrollment, node, lead, and journey details
    SELECT * INTO v_enrollment FROM journey_enrollments WHERE id = p_enrollment_id;
    SELECT * INTO v_node FROM journey_nodes WHERE id = p_node_id;
    SELECT * INTO v_lead FROM leads WHERE id = v_enrollment.lead_id;
    SELECT * INTO v_journey FROM journeys WHERE id = v_enrollment.journey_id;
    
    v_config := v_node.config_json;
    
    -- Process based on node type
    CASE v_node.type
        WHEN 'action' THEN
            CASE v_config ->> 'action_type'
                WHEN 'send_email' THEN
                    PERFORM queue_journey_message(
                        v_enrollment.lead_id,
                        p_node_id,
                        'email',
                        v_config ->> 'template_id',
                        v_config
                    );
                    
                WHEN 'send_sms' THEN
                    PERFORM queue_journey_message(
                        v_enrollment.lead_id,
                        p_node_id,
                        'sms',
                        v_config ->> 'template_id',
                        v_config
                    );
                    
                WHEN 'add_tag' THEN
                    UPDATE leads 
                    SET tags = array_append(tags, v_config ->> 'tag')
                    WHERE id = v_enrollment.lead_id;
                    
                WHEN 'update_score' THEN
                    UPDATE leads 
                    SET score = score + (v_config ->> 'score_change')::INTEGER
                    WHERE id = v_enrollment.lead_id;
                    
                WHEN 'grant_offer' THEN
                    -- Create personalized offer/coupon
                    PERFORM create_personalized_offer(
                        v_enrollment.lead_id,
                        v_config ->> 'offer_template_id'
                    );
                    
                WHEN 'webhook' THEN
                    -- Queue webhook call
                    PERFORM queue_webhook_call(
                        v_config ->> 'webhook_url',
                        jsonb_build_object(
                            'lead_id', v_enrollment.lead_id,
                            'journey_id', v_enrollment.journey_id,
                            'node_id', p_node_id,
                            'data', v_config -> 'webhook_data'
                        )
                    );
            END CASE;
            
        WHEN 'wait' THEN
            -- Schedule next step
            DECLARE
                v_wait_duration INTERVAL;
                v_next_node_id UUID;
            BEGIN
                CASE v_config ->> 'wait_type'
                    WHEN 'duration' THEN
                        v_wait_duration := (v_config ->> 'duration')::INTERVAL;
                        
                    WHEN 'until_time' THEN
                        v_wait_duration := (v_config ->> 'until_time')::TIMESTAMPTZ - NOW();
                        
                    WHEN 'until_event' THEN
                        -- Set up event listener (simplified here)
                        RETURN;
                END CASE;
                
                -- Get next node
                SELECT id INTO v_next_node_id
                FROM journey_nodes 
                WHERE journey_id = v_enrollment.journey_id
                AND (position ->> 'x')::INTEGER > (v_node.position ->> 'x')::INTEGER
                ORDER BY (position ->> 'x')::INTEGER
                LIMIT 1;
                
                IF v_next_node_id IS NOT NULL THEN
                    -- Schedule next step using pg_cron or similar
                    INSERT INTO scheduled_journey_steps (
                        enrollment_id,
                        node_id,
                        execute_at
                    ) VALUES (
                        p_enrollment_id,
                        v_next_node_id,
                        NOW() + v_wait_duration
                    );
                END IF;
            END;
            
        WHEN 'branch' THEN
            -- Evaluate condition and choose path
            DECLARE
                v_condition_result BOOLEAN;
                v_true_node_id UUID;
                v_false_node_id UUID;
            BEGIN
                -- Evaluate condition (simplified)
                v_condition_result := evaluate_journey_condition(
                    v_enrollment.lead_id,
                    v_config -> 'condition'
                );
                
                v_true_node_id := (v_config ->> 'true_node_id')::UUID;
                v_false_node_id := (v_config ->> 'false_node_id')::UUID;
                
                IF v_condition_result THEN
                    PERFORM process_journey_node(p_enrollment_id, v_true_node_id);
                ELSE
                    PERFORM process_journey_node(p_enrollment_id, v_false_node_id);
                END IF;
            END;
            
        WHEN 'exit' THEN
            -- Complete enrollment
            UPDATE journey_enrollments 
            SET status = 'completed', completed_at = NOW()
            WHERE id = p_enrollment_id;
            
            -- Update journey stats
            UPDATE journeys 
            SET completions_count = completions_count + 1
            WHERE id = v_enrollment.journey_id;
    END CASE;
    
    -- Update current position
    UPDATE journey_enrollments 
    SET current_node_id = p_node_id
    WHERE id = p_enrollment_id;
END;
$$;

-- Queue journey message
CREATE OR REPLACE FUNCTION queue_journey_message(
    p_lead_id UUID,
    p_node_id UUID,
    p_channel TEXT,
    p_template_id UUID,
    p_config JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_lead leads%ROWTYPE;
    v_template templates%ROWTYPE;
    v_message_id UUID;
    v_send_at TIMESTAMPTZ;
    v_rendered_content TEXT;
BEGIN
    -- Get lead and template
    SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;
    SELECT * INTO v_template FROM templates WHERE id = p_template_id;
    
    -- Check consent
    IF p_channel = 'email' AND NOT (v_lead.consent_json -> 'email' ->> 'granted')::BOOLEAN THEN
        RAISE EXCEPTION 'Lead has not consented to email marketing';
    END IF;
    
    IF p_channel = 'sms' AND NOT (v_lead.consent_json -> 'sms' ->> 'granted')::BOOLEAN THEN
        RAISE EXCEPTION 'Lead has not consented to SMS marketing';
    END IF;
    
    -- Render template
    SELECT content INTO v_rendered_content 
    FROM render_template(
        p_template_id,
        jsonb_build_object(
            'first_name', v_lead.first_name,
            'last_name', v_lead.last_name,
            'email', v_lead.email,
            'locale', v_lead.locale
        ) || COALESCE(p_config -> 'variables', '{}'::jsonb)
    );
    
    -- Determine send time (respecting quiet hours)
    v_send_at := calculate_optimal_send_time(v_lead.locale, p_config);
    
    -- Create message
    INSERT INTO messages (
        journey_node_id,
        recipient_type,
        recipient_id,
        channel,
        subject,
        content,
        send_at,
        delivery_status
    ) VALUES (
        p_node_id,
        'lead',
        p_lead_id,
        p_channel,
        v_template.subject,
        v_rendered_content,
        v_send_at,
        'queued'
    ) RETURNING id INTO v_message_id;
    
    RETURN v_message_id;
END;
$$;

-- ==================== TEMPLATE RENDERING ====================

-- Render template with variables
CREATE OR REPLACE FUNCTION render_template(
    p_template_id UUID,
    p_variables JSONB
)
RETURNS TABLE (content TEXT, subject TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_template templates%ROWTYPE;
    v_rendered_content TEXT;
    v_rendered_subject TEXT;
    v_key TEXT;
    v_value TEXT;
BEGIN
    -- Get template
    SELECT * INTO v_template FROM templates WHERE id = p_template_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template not found';
    END IF;
    
    -- Start with template content
    v_rendered_content := v_template.content;
    v_rendered_subject := v_template.subject;
    
    -- Replace variables
    FOR v_key, v_value IN SELECT * FROM jsonb_each_text(p_variables) LOOP
        v_rendered_content := REPLACE(v_rendered_content, '{{' || v_key || '}}', v_value);
        v_rendered_subject := REPLACE(v_rendered_subject, '{{' || v_key || '}}', v_value);
    END LOOP;
    
    -- Add default variables if not provided
    IF p_variables ->> 'unsubscribe_url' IS NULL THEN
        v_rendered_content := REPLACE(
            v_rendered_content,
            '{{unsubscribe_url}}',
            'https://yogaswiss.com/unsubscribe'
        );
    END IF;
    
    RETURN QUERY SELECT v_rendered_content, v_rendered_subject;
END;
$$;

-- ==================== ANALYTICS & ATTRIBUTION ====================

-- Get campaign analytics
CREATE OR REPLACE FUNCTION get_campaign_analytics(p_campaign_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_campaign campaigns%ROWTYPE;
    v_analytics JSONB;
    v_opens INTEGER;
    v_clicks INTEGER;
    v_conversions INTEGER;
    v_revenue DECIMAL;
    v_unsubscribes INTEGER;
    v_bounces INTEGER;
BEGIN
    -- Get campaign
    SELECT * INTO v_campaign FROM campaigns WHERE id = p_campaign_id;
    
    -- Calculate metrics
    SELECT 
        COUNT(CASE WHEN open_at IS NOT NULL THEN 1 END),
        COUNT(CASE WHEN click_at IS NOT NULL THEN 1 END),
        COUNT(CASE WHEN conversion_order_id IS NOT NULL THEN 1 END),
        COALESCE(SUM(
            CASE WHEN conversion_order_id IS NOT NULL THEN
                (SELECT total_amount FROM orders WHERE id = conversion_order_id)
            END
        ), 0),
        COUNT(CASE WHEN unsubscribe_at IS NOT NULL THEN 1 END),
        COUNT(CASE WHEN bounce_type IS NOT NULL THEN 1 END)
    INTO v_opens, v_clicks, v_conversions, v_revenue, v_unsubscribes, v_bounces
    FROM messages 
    WHERE campaign_id = p_campaign_id;
    
    -- Build analytics object
    v_analytics := jsonb_build_object(
        'campaign_id', p_campaign_id,
        'sends', v_campaign.sends_count,
        'opens', v_opens,
        'clicks', v_clicks,
        'conversions', v_conversions,
        'revenue', v_revenue,
        'unsubscribes', v_unsubscribes,
        'bounces', v_bounces,
        'open_rate', CASE WHEN v_campaign.sends_count > 0 THEN 
            ROUND((v_opens::DECIMAL / v_campaign.sends_count) * 100, 2) 
            ELSE 0 END,
        'click_rate', CASE WHEN v_opens > 0 THEN 
            ROUND((v_clicks::DECIMAL / v_opens) * 100, 2) 
            ELSE 0 END,
        'conversion_rate', CASE WHEN v_clicks > 0 THEN 
            ROUND((v_conversions::DECIMAL / v_clicks) * 100, 2) 
            ELSE 0 END,
        'bounce_rate', CASE WHEN v_campaign.sends_count > 0 THEN 
            ROUND((v_bounces::DECIMAL / v_campaign.sends_count) * 100, 2) 
            ELSE 0 END,
        'cost', v_campaign.cost_total,
        'roi', CASE WHEN v_campaign.cost_total > 0 THEN 
            ROUND(((v_revenue - v_campaign.cost_total) / v_campaign.cost_total) * 100, 2)
            ELSE NULL END
    );
    
    RETURN v_analytics;
END;
$$;

-- Record attribution conversion
CREATE OR REPLACE FUNCTION record_conversion(
    p_order_id UUID,
    p_source_event_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order orders%ROWTYPE;
    v_attribution_data JSONB;
    v_last_click_event attribution_events%ROWTYPE;
    v_first_touch_event attribution_events%ROWTYPE;
BEGIN
    -- Get order
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;
    
    -- Find last click attribution
    SELECT * INTO v_last_click_event
    FROM attribution_events 
    WHERE person_id = v_order.customer_id
    AND event = 'click'
    AND ts <= v_order.created_at
    ORDER BY ts DESC 
    LIMIT 1;
    
    -- Find first touch attribution
    SELECT * INTO v_first_touch_event
    FROM attribution_events 
    WHERE person_id = v_order.customer_id
    ORDER BY ts ASC 
    LIMIT 1;
    
    -- Update messages with conversion
    IF v_last_click_event.id IS NOT NULL THEN
        UPDATE messages 
        SET conversion_order_id = p_order_id
        WHERE recipient_id = v_order.customer_id::TEXT
        AND click_at IS NOT NULL
        AND click_at = v_last_click_event.ts;
    END IF;
    
    -- Record conversion event
    INSERT INTO attribution_events (
        org_id,
        tenant_id,
        person_id,
        session_id,
        event,
        ts,
        order_id,
        revenue,
        data_json
    ) VALUES (
        v_order.org_id,
        v_order.tenant_id,
        v_order.customer_id,
        COALESCE(v_last_click_event.session_id, 'direct'),
        'conversion',
        NOW(),
        p_order_id,
        v_order.total_amount,
        jsonb_build_object(
            'last_click_event_id', v_last_click_event.id,
            'first_touch_event_id', v_first_touch_event.id,
            'utm_source', COALESCE(v_last_click_event.utm_json ->> 'source', v_first_touch_event.utm_json ->> 'source'),
            'utm_campaign', COALESCE(v_last_click_event.utm_json ->> 'campaign', v_first_touch_event.utm_json ->> 'campaign')
        )
    );
    
    v_attribution_data := jsonb_build_object(
        'order_id', p_order_id,
        'last_click_source', COALESCE(v_last_click_event.utm_json ->> 'source', 'direct'),
        'first_touch_source', COALESCE(v_first_touch_event.utm_json ->> 'source', 'direct'),
        'days_to_conversion', CASE WHEN v_first_touch_event.ts IS NOT NULL THEN
            EXTRACT(days FROM v_order.created_at - v_first_touch_event.ts)
            ELSE NULL END
    );
    
    RETURN v_attribution_data;
END;
$$;

-- ==================== HELPER FUNCTIONS ====================

-- Calculate optimal send time
CREATE OR REPLACE FUNCTION calculate_optimal_send_time(
    p_locale TEXT,
    p_config JSONB DEFAULT NULL
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_send_time TIMESTAMPTZ;
    v_timezone TEXT;
    v_quiet_start TIME;
    v_quiet_end TIME;
    v_optimal_hour INTEGER;
BEGIN
    -- Determine timezone from locale
    v_timezone := CASE 
        WHEN p_locale LIKE '%-CH' THEN 'Europe/Zurich'
        ELSE 'Europe/Zurich'
    END;
    
    -- Default quiet hours: 22:00 - 08:00
    v_quiet_start := COALESCE((p_config -> 'quiet_hours' ->> 'start')::TIME, '22:00'::TIME);
    v_quiet_end := COALESCE((p_config -> 'quiet_hours' ->> 'end')::TIME, '08:00'::TIME);
    
    -- Optimal send times by day of week (in locale timezone)
    v_optimal_hour := CASE EXTRACT(DOW FROM NOW() AT TIME ZONE v_timezone)
        WHEN 1 THEN 9  -- Monday: 9 AM
        WHEN 2 THEN 10 -- Tuesday: 10 AM
        WHEN 3 THEN 14 -- Wednesday: 2 PM
        WHEN 4 THEN 10 -- Thursday: 10 AM
        WHEN 5 THEN 9  -- Friday: 9 AM
        WHEN 6 THEN 11 -- Saturday: 11 AM
        WHEN 0 THEN 18 -- Sunday: 6 PM
    END;
    
    -- Calculate send time
    v_send_time := date_trunc('day', NOW() AT TIME ZONE v_timezone) + (v_optimal_hour || ' hours')::INTERVAL;
    v_send_time := v_send_time AT TIME ZONE v_timezone;
    
    -- If we're past the optimal time today, schedule for tomorrow
    IF v_send_time <= NOW() THEN
        v_send_time := v_send_time + '1 day'::INTERVAL;
    END IF;
    
    -- Ensure we're not in quiet hours
    WHILE (v_send_time AT TIME ZONE v_timezone)::TIME BETWEEN v_quiet_start AND v_quiet_end LOOP
        v_send_time := v_send_time + '1 hour'::INTERVAL;
    END LOOP;
    
    RETURN v_send_time;
END;
$$;

-- Evaluate journey condition
CREATE OR REPLACE FUNCTION evaluate_journey_condition(
    p_lead_id UUID,
    p_condition JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_condition_type TEXT;
    v_result BOOLEAN := false;
    v_lead leads%ROWTYPE;
BEGIN
    SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;
    v_condition_type := p_condition ->> 'type';
    
    CASE v_condition_type
        WHEN 'tag_has' THEN
            v_result := v_lead.tags && ARRAY[p_condition ->> 'tag'];
            
        WHEN 'score_gte' THEN
            v_result := v_lead.score >= (p_condition ->> 'value')::INTEGER;
            
        WHEN 'email_opened' THEN
            v_result := EXISTS (
                SELECT 1 FROM messages 
                WHERE recipient_id = p_lead_id::TEXT 
                AND open_at IS NOT NULL
                AND sent_at >= NOW() - (p_condition ->> 'within_days')::INTEGER * INTERVAL '1 day'
            );
            
        WHEN 'has_booked' THEN
            v_result := EXISTS (
                SELECT 1 FROM people p
                JOIN registrations r ON r.customer_id = p.id
                WHERE p.id = v_lead.person_id
                AND r.status IN ('confirmed', 'attended')
            );
            
        ELSE
            v_result := false;
    END CASE;
    
    RETURN v_result;
END;
$$;