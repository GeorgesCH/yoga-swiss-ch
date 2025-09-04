# YogaSwiss Database Deployment Guide

## 🇨🇭 Swiss Studio Management Platform Setup

This guide helps you deploy the normalized YogaSwiss database schema to your Supabase project.

## Quick Deployment Steps

### 1. Open Supabase SQL Editor
- Go to your [Supabase Dashboard](https://supabase.com/dashboard)
- Navigate to your YogaSwiss project
- Click on "SQL Editor" in the sidebar

### 2. Run Schema Migrations (In Order)

#### Step 1: Normalized Schema
Copy and paste this SQL into the SQL Editor and run it:

```sql
-- YogaSwiss Normalized Schema v2.1.0
-- Creates the complete multi-tenant database structure

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
CREATE TYPE user_role AS ENUM ('owner','admin','manager','instructor','staff','customer');
CREATE TYPE class_status AS ENUM ('scheduled','canceled','completed');
CREATE TYPE payment_status AS ENUM ('pending','authorized','captured','refunded','failed','canceled');
CREATE TYPE payment_method AS ENUM ('card','cash','bank_transfer','wallet','other');
CREATE TYPE campaign_type AS ENUM ('email','sms','push','webhook');
CREATE TYPE campaign_status AS ENUM ('draft','scheduled','sending','completed','canceled');

-- Core: Organizations and People
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  logo_url text,
  brand_colors jsonb NOT NULL DEFAULT '{}'::jsonb,
  locale text NOT NULL DEFAULT 'de-CH',
  timezone text NOT NULL DEFAULT 'Europe/Zurich',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  first_name text,
  last_name text,
  phone text,
  date_of_birth date,
  gender text,
  photo_url text,
  bio text,
  emergency_contact jsonb,
  medical_notes text,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  role user_role NOT NULL DEFAULT 'customer',
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  invited_by uuid REFERENCES public.profiles(id),
  invited_at timestamptz,
  joined_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (organization_id, user_id)
);

-- Continue with full schema...
-- (The complete SQL is available in the admin interface)
```

#### Step 2: Compatibility Layer & Auth
After Step 1 completes successfully, run this:

```sql
-- YogaSwiss Compatibility Layer v2.1.0
-- Creates views and functions for existing frontend

CREATE OR REPLACE VIEW public.orgs AS
SELECT
  o.id,
  o.name,
  o.slug,
  o.locale AS primary_locale,
  o.timezone,
  COALESCE(o.settings->>'currency','CHF') AS currency,
  COALESCE(o.settings->>'status','active') AS status,
  o.created_at
FROM public.organizations o;

CREATE OR REPLACE VIEW public.org_users AS
SELECT
  m.id,
  m.organization_id AS org_id,
  m.user_id,
  m.role::text AS role,
  CASE WHEN m.is_active THEN 'active' ELSE 'inactive' END AS status,
  m.is_active,
  m.joined_at
FROM public.organization_members m;

-- Auth functions and RLS policies...
-- (The complete SQL is available in the admin interface)
```

### 3. Verify Setup
- Return to your YogaSwiss admin panel
- Click "Refresh Status" on the database setup page
- Verify all components show as "Ready"

## What Gets Deployed

### ✅ Normalized Schema
- **Organizations**: Multi-tenant studio management
- **Profiles**: User management without organization coupling
- **Organization Members**: Role-based access control
- **Instructors**: Specialized instructor profiles per organization
- **Locations & Rooms**: Physical and virtual spaces
- **Class Templates & Occurrences**: Unified scheduling system
- **Registrations & Waitlists**: Customer booking management
- **Products & Orders**: E-commerce functionality
- **Payments & Invoices**: Swiss payment integration
- **Marketing & Analytics**: Customer engagement tools

### 🔄 Compatibility Layer
- **Legacy API Views**: `orgs`, `org_users`, `user_profiles`
- **Authentication Functions**: Organization onboarding RPCs
- **Row Level Security**: Multi-tenant data isolation
- **Auth Triggers**: Automatic profile creation

### 🔐 Security Features
- **RLS Policies**: Organization-scoped data access
- **Role-based Permissions**: Owner, admin, manager, instructor, staff, customer
- **Swiss Data Protection**: GDPR-compliant data handling
- **Multi-tenant Isolation**: Complete data separation between organizations

## Troubleshooting

### Common Issues

**Error: "relation does not exist"**
- Ensure Step 1 completed successfully before running Step 2
- Check for any syntax errors in the SQL

**Error: "permission denied"**
- Verify you're running the SQL as a database owner
- Check your Supabase project permissions

**Error: "already exists"**
- Some tables may already exist from previous attempts
- You can safely ignore these errors or drop existing tables first

### Need Help?

1. **Admin Interface**: Use the "Database Deployment Guide" in your admin panel for complete SQL scripts
2. **Status Check**: Use the "Refresh Status" button to verify deployment
3. **Recovery Tools**: Use the "Recovery" tab if you encounter data inconsistencies

## Swiss Quality Standards

This deployment follows Swiss engineering principles:
- 🏔️ **Reliability**: Robust error handling and data consistency
- ⚡ **Performance**: Optimized indexes and query patterns  
- 🔒 **Security**: Multi-layered protection and data isolation
- 📊 **Scalability**: Designed for growing Swiss yoga businesses
- 🇨🇭 **Compliance**: Swiss privacy and business regulations

---

**YogaSwiss v2.1.0** - Switzerland's #1 Yoga Studio Management Platform