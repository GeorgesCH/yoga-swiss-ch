-- Row Level Security (RLS) Policies for Classes Module
-- Ensures proper data isolation and permissions for multi-tenant YogaSwiss platform

-- ==================== CLASS TEMPLATES ====================

-- Enable RLS
ALTER TABLE class_templates ENABLE ROW LEVEL SECURITY;

-- Policy for reading class templates
CREATE POLICY "Users can read templates from their org" ON class_templates
    FOR SELECT
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.is_active = true
        )
    );

-- Policy for creating class templates
CREATE POLICY "Managers and owners can create templates" ON class_templates
    FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'manager')
            AND ou.is_active = true
        )
    );

-- Policy for updating class templates  
CREATE POLICY "Managers and owners can update templates" ON class_templates
    FOR UPDATE
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'manager')
            AND ou.is_active = true
        )
    )
    WITH CHECK (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'manager')
            AND ou.is_active = true
        )
    );

-- Policy for deleting class templates
CREATE POLICY "Only owners can delete templates" ON class_templates
    FOR DELETE
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role = 'owner'
            AND ou.is_active = true
        )
    );

-- ==================== CLASS INSTANCES ====================

ALTER TABLE class_instances ENABLE ROW LEVEL SECURITY;

-- Policy for reading class instances
CREATE POLICY "Users can read instances from their org" ON class_instances
    FOR SELECT
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.is_active = true
        )
    );

-- Policy for creating class instances
CREATE POLICY "Managers and owners can create instances" ON class_instances
    FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'manager')
            AND ou.is_active = true
        )
    );

-- Policy for updating class instances
CREATE POLICY "Managers and owners can update instances" ON class_instances
    FOR UPDATE
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'manager')
            AND ou.is_active = true
        )
    );

-- ==================== CLASS OCCURRENCES ====================

ALTER TABLE class_occurrences ENABLE ROW LEVEL SECURITY;

-- Policy for reading class occurrences
CREATE POLICY "Users can read occurrences from their org" ON class_occurrences
    FOR SELECT
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.is_active = true
        )
    );

-- Policy for instructors to read only their own occurrences
CREATE POLICY "Instructors can read their assigned occurrences" ON class_occurrences
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role = 'instructor'
            AND ou.org_id = class_occurrences.org_id
            AND ou.is_active = true
            AND (
                class_occurrences.instructor_id = auth.uid() 
                OR class_occurrences.actual_instructor_id = auth.uid()
            )
        )
    );

-- Policy for creating class occurrences
CREATE POLICY "Managers and owners can create occurrences" ON class_occurrences
    FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'manager')
            AND ou.is_active = true
        )
    );

-- Policy for updating class occurrences
CREATE POLICY "Staff can update occurrences" ON class_occurrences
    FOR UPDATE
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'manager', 'front_desk')
            AND ou.is_active = true
        )
        -- Instructors can update their own occurrence notes
        OR (
            EXISTS (
                SELECT 1 
                FROM org_users ou 
                WHERE ou.user_id = auth.uid() 
                AND ou.role = 'instructor'
                AND ou.org_id = class_occurrences.org_id
                AND ou.is_active = true
                AND (
                    class_occurrences.instructor_id = auth.uid() 
                    OR class_occurrences.actual_instructor_id = auth.uid()
                )
            )
        )
    );

-- ==================== REGISTRATIONS ====================

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Policy for reading registrations
CREATE POLICY "Users can read registrations from their org" ON registrations
    FOR SELECT
    USING (
        -- Customers can read their own registrations
        (customer_id = auth.uid())
        OR
        -- Staff can read all registrations from their org
        (
            org_id IN (
                SELECT ou.org_id 
                FROM org_users ou 
                WHERE ou.user_id = auth.uid() 
                AND ou.role IN ('owner', 'manager', 'front_desk')
                AND ou.is_active = true
            )
        )
        OR
        -- Instructors can read registrations for their classes only
        (
            EXISTS (
                SELECT 1 
                FROM org_users ou 
                JOIN class_occurrences co ON co.org_id = ou.org_id
                WHERE ou.user_id = auth.uid() 
                AND ou.role = 'instructor'
                AND ou.is_active = true
                AND co.id = registrations.occurrence_id
                AND (co.instructor_id = auth.uid() OR co.actual_instructor_id = auth.uid())
            )
        )
    );

-- Policy for creating registrations (bookings)
CREATE POLICY "Authorized users can create registrations" ON registrations
    FOR INSERT
    WITH CHECK (
        -- Customers can register for themselves
        (customer_id = auth.uid())
        OR
        -- Staff can register customers
        (
            org_id IN (
                SELECT ou.org_id 
                FROM org_users ou 
                WHERE ou.user_id = auth.uid() 
                AND ou.role IN ('owner', 'manager', 'front_desk')
                AND ou.is_active = true
            )
        )
    );

-- Policy for updating registrations
CREATE POLICY "Authorized users can update registrations" ON registrations
    FOR UPDATE
    USING (
        -- Customers can update their own registrations (limited fields)
        (customer_id = auth.uid())
        OR
        -- Staff can update all registrations
        (
            org_id IN (
                SELECT ou.org_id 
                FROM org_users ou 
                WHERE ou.user_id = auth.uid() 
                AND ou.role IN ('owner', 'manager', 'front_desk')
                AND ou.is_active = true
            )
        )
        OR
        -- Instructors can update attendance and notes for their classes
        (
            EXISTS (
                SELECT 1 
                FROM org_users ou 
                JOIN class_occurrences co ON co.org_id = ou.org_id
                WHERE ou.user_id = auth.uid() 
                AND ou.role = 'instructor'
                AND ou.is_active = true
                AND co.id = registrations.occurrence_id
                AND (co.instructor_id = auth.uid() OR co.actual_instructor_id = auth.uid())
            )
        )
    );

-- ==================== WAITLIST ENTRIES ====================

ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Policy for reading waitlist entries
CREATE POLICY "Users can read waitlist entries" ON waitlist_entries
    FOR SELECT
    USING (
        -- Customers can read their own waitlist entries
        (customer_id = auth.uid())
        OR
        -- Staff can read all waitlist entries from their org
        (
            org_id IN (
                SELECT ou.org_id 
                FROM org_users ou 
                WHERE ou.user_id = auth.uid() 
                AND ou.role IN ('owner', 'manager', 'front_desk')
                AND ou.is_active = true
            )
        )
    );

-- Policy for creating waitlist entries
CREATE POLICY "Authorized users can join waitlist" ON waitlist_entries
    FOR INSERT
    WITH CHECK (
        -- Customers can join waitlist for themselves
        (customer_id = auth.uid())
        OR
        -- Staff can add customers to waitlist
        (
            org_id IN (
                SELECT ou.org_id 
                FROM org_users ou 
                WHERE ou.user_id = auth.uid() 
                AND ou.role IN ('owner', 'manager', 'front_desk')
                AND ou.is_active = true
            )
        )
    );

-- ==================== PRICING RULES ====================

ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

-- Policy for reading pricing rules
CREATE POLICY "Users can read pricing rules from their org" ON pricing_rules
    FOR SELECT
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.is_active = true
        )
    );

-- Policy for managing pricing rules
CREATE POLICY "Managers and owners can manage pricing rules" ON pricing_rules
    FOR ALL
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'manager')
            AND ou.is_active = true
        )
    )
    WITH CHECK (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'manager')
            AND ou.is_active = true
        )
    );

-- ==================== SEAT MAPS AND ASSIGNMENTS ====================

ALTER TABLE seat_maps ENABLE ROW LEVEL SECURITY;

-- Policy for seat maps
CREATE POLICY "Users can read seat maps from their org" ON seat_maps
    FOR SELECT
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.is_active = true
        )
    );

CREATE POLICY "Managers can manage seat maps" ON seat_maps
    FOR ALL
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'manager')
            AND ou.is_active = true
        )
    );

ALTER TABLE seat_assignments ENABLE ROW LEVEL SECURITY;

-- Policy for seat assignments
CREATE POLICY "Users can manage seat assignments" ON seat_assignments
    FOR ALL
    USING (
        -- Customer can manage their own seat assignments
        EXISTS (
            SELECT 1 FROM registrations r 
            WHERE r.id = seat_assignments.registration_id 
            AND r.customer_id = auth.uid()
        )
        OR
        -- Staff can manage all seat assignments in their org
        EXISTS (
            SELECT 1 FROM registrations r 
            JOIN org_users ou ON ou.org_id = r.org_id
            WHERE r.id = seat_assignments.registration_id 
            AND ou.user_id = auth.uid()
            AND ou.role IN ('owner', 'manager', 'front_desk')
            AND ou.is_active = true
        )
    );

-- ==================== RESOURCES ====================

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Policy for resources
CREATE POLICY "Users can read resources from their org" ON resources
    FOR SELECT
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.is_active = true
        )
    );

CREATE POLICY "Managers can manage resources" ON resources
    FOR ALL
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'manager')
            AND ou.is_active = true
        )
    );

-- ==================== POLICIES ====================

ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

-- Policy for policies (cancellation, refund, etc.)
CREATE POLICY "Users can read policies from their org" ON policies
    FOR SELECT
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.is_active = true
        )
    );

CREATE POLICY "Managers can manage policies" ON policies
    FOR ALL
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'manager')
            AND ou.is_active = true
        )
    );

-- ==================== VIRTUAL SESSIONS ====================

ALTER TABLE virtual_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for virtual sessions
CREATE POLICY "Users can read virtual sessions from their org" ON virtual_sessions
    FOR SELECT
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.is_active = true
        )
    );

CREATE POLICY "Staff can manage virtual sessions" ON virtual_sessions
    FOR ALL
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'manager', 'instructor')
            AND ou.is_active = true
        )
    );

-- ==================== NOTIFICATIONS ====================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy for notifications
CREATE POLICY "Users can read their own notifications" ON notifications
    FOR SELECT
    USING (
        customer_id = auth.uid()
        OR
        -- Staff can read all notifications for their org
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'manager', 'marketer')
            AND ou.is_active = true
        )
    );

-- Policy for creating notifications
CREATE POLICY "Authorized users can create notifications" ON notifications
    FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'manager', 'front_desk', 'instructor', 'marketer')
            AND ou.is_active = true
        )
    );

-- ==================== AUDIT LOGS ====================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy for audit logs
CREATE POLICY "Authorized users can read audit logs" ON audit_logs
    FOR SELECT
    USING (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'manager')
            AND ou.is_active = true
        )
    );

-- Policy for creating audit logs (system only)
CREATE POLICY "System can create audit logs" ON audit_logs
    FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT ou.org_id 
            FROM org_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.is_active = true
        )
    );

-- ==================== EXPORT PERMISSIONS ====================

-- Function to check if user can export data
CREATE OR REPLACE FUNCTION can_export_data(p_org_id UUID, p_resource_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
    has_export_permission BOOLEAN := false;
BEGIN
    -- Get user role in the organization
    SELECT ou.role INTO user_role
    FROM org_users ou
    WHERE ou.user_id = auth.uid() 
    AND ou.org_id = p_org_id 
    AND ou.is_active = true;

    IF user_role IS NULL THEN
        RETURN false;
    END IF;

    -- Check export permissions based on role and resource type
    CASE user_role
        WHEN 'owner' THEN
            has_export_permission := true;
        WHEN 'manager' THEN
            has_export_permission := p_resource_type NOT IN ('customer_pii', 'financial_detailed');
        WHEN 'accountant' THEN
            has_export_permission := p_resource_type IN ('financial', 'orders', 'revenue');
        WHEN 'marketer' THEN
            has_export_permission := p_resource_type IN ('customer_segments', 'class_analytics');
        WHEN 'instructor' THEN
            has_export_permission := p_resource_type IN ('my_classes', 'my_rosters');
        ELSE
            has_export_permission := false;
    END CASE;

    RETURN has_export_permission;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;