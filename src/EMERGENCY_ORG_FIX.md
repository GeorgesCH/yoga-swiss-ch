# 🚨 Emergency Organization Fix

## Problem
Users getting 404 errors when trying to access organizations, and created organizations disappear.

## Quick Diagnosis
Run this in your Supabase SQL Editor to check what's wrong:

```sql
-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('organizations', 'organization_members', 'profiles', 'orgs', 'org_users', 'user_profiles');

-- 2. Check if RPC functions exist  
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_user_organizations', 'create_organization_owner');

-- 3. Check if there are any organizations at all
SELECT COUNT(*) as org_count FROM organizations;

-- 4. Check if there are any organization members
SELECT COUNT(*) as member_count FROM organization_members;

-- 5. Check current user (replace with your user ID)
SELECT id, email FROM auth.users LIMIT 5;
```

## Quick Fix Options

### Option 1: Create Test Organization Manually
If the tables exist but are empty, create a test org:

```sql
-- Replace 'your-email@example.com' with your actual email
DO $$
DECLARE 
    user_id UUID;
    org_id UUID;
BEGIN
    -- Get your user ID
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = 'your-email@example.com';
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'User not found with that email';
        RETURN;
    END IF;
    
    -- Create organization
    INSERT INTO organizations (name, slug, locale, timezone, settings)
    VALUES ('Test Studio', 'test-studio-' || EXTRACT(EPOCH FROM NOW())::bigint, 'de-CH', 'Europe/Zurich', '{"currency": "CHF", "status": "active"}')
    RETURNING id INTO org_id;
    
    -- Add user as owner
    INSERT INTO organization_members (organization_id, user_id, role, is_active)
    VALUES (org_id, user_id, 'owner', true);
    
    -- Also create instructor record
    INSERT INTO instructors (organization_id, profile_id)
    VALUES (org_id, user_id)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created organization % with ID %', 'Test Studio', org_id;
END $$;
```

### Option 2: Reset Database Schema
If tables are missing or corrupted, run the migration files in order:

1. `20241203000001_yogaswiss_complete_init.sql`
2. `20241203000002_rls_policies.sql` 
3. `20241203000003_core_functions.sql`
4. `20241204000001_complete_normalized_schema.sql`
5. `20241204000002_compatibility_and_auth.sql`

### Option 3: Check RLS Policies
RLS might be blocking access. Check:

```sql
-- Check if your user has a profile
SELECT * FROM profiles WHERE id = auth.uid();

-- Check organization_members for your user
SELECT * FROM organization_members WHERE user_id = auth.uid();

-- Check organizations your user should see
SELECT o.*, m.role 
FROM organizations o
JOIN organization_members m ON m.organization_id = o.id
WHERE m.user_id = auth.uid() AND m.is_active = true;
```

## Debug Server Logs
Check the server logs for more specific error messages:
- Look for RPC function errors
- Check for authentication issues
- Watch for database connection problems

## Test the Fix
1. Refresh the YogaSwiss app
2. Try creating a new organization
3. Check if existing organizations appear
4. Verify the organization doesn't disappear after creation

## If Still Broken
If none of these work:
1. Check Supabase project status
2. Verify database deployment completed
3. Check if environment variables are correct
4. Consider restoring from a backup

---

**Priority**: Fix the database schema and RLS policies first, then test organization creation.