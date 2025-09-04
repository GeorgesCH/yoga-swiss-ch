# Apply Production Database Migrations

## Issue
The YogaSwiss application is showing "Database not ready" errors because the required database schema hasn't been applied to the production Supabase instance.

## Solution
Apply the database migrations directly to the production Supabase instance.

## Steps

### 1. Access Supabase Dashboard
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your YogaSwiss project: `okvreiyhuxjosgauqaqq`

### 2. Open SQL Editor
1. In the left sidebar, click on "SQL Editor"
2. Click "New query" to create a new SQL script

### 3. Apply the Migration Script
1. Copy the entire contents of `scripts/apply-production-migrations.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute the script

### 4. Verify Migration Success
The script will create:
- Core tables: `organizations`, `profiles`, `organization_members`
- Compatibility views: `orgs`, `org_users`, `user_profiles`
- RLS policies for security
- Auth triggers for new user registration
- Functions for organization creation

At the end, you should see:
```
Schema migration completed successfully
organization_count: 0
org_view_count: 0
Tables and views created successfully
```

### 5. Test the Application
1. Go back to your YogaSwiss application
2. Refresh the page
3. The "Database not ready" errors should be resolved
4. Try creating an organization - it should work now

## What This Fixes

1. **Database Schema**: Creates all required tables and relationships
2. **Compatibility Layer**: Provides `orgs` and `org_users` views that the client expects
3. **Security**: Sets up Row Level Security (RLS) policies
4. **Auth Integration**: Automatically creates user profiles when users sign up
5. **Organization Creation**: Enables the `/orgs` endpoint to work properly

## Troubleshooting

If you encounter issues:

1. **Permission Errors**: Make sure you're signed in as the project owner
2. **Syntax Errors**: Check that the entire script was copied correctly
3. **Existing Tables**: The script uses `CREATE IF NOT EXISTS` so it's safe to run multiple times
4. **RLS Errors**: The script drops existing policies before creating new ones

## After Migration

Once the migration is complete:
- The application will detect that the database is ready
- Users can sign up and create organizations
- All core functionality will be available
- The 500 errors on organization creation will be resolved

## Security Note

This migration:
- Enables Row Level Security (RLS) on all tables
- Ensures users can only see their own data
- Allows organization owners/admins to manage their organizations
- Follows Swiss data protection requirements
