-- =====================================================
-- YogaSwiss Auth Functions Migration
-- Migration: 20241203000001.3_auth_functions
-- Core authentication and authorization functions
-- =====================================================

-- =====================================================
-- AUTH FUNCTIONS
-- =====================================================

-- Function to check if user has roles in organization
CREATE OR REPLACE FUNCTION user_has_roles_in_org(org_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- If no roles specified, return false
    IF array_length(allowed_roles, 1) IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get user's role in the organization
    SELECT role INTO user_role
    FROM organization_members
    WHERE organization_id = org_id
    AND user_id = auth.uid();
    
    -- If user is not a member, return false
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user's role is in the allowed roles
    RETURN user_role = ANY(allowed_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is self
CREATE OR REPLACE FUNCTION user_is_self(user_id_to_check UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN user_id_to_check = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
