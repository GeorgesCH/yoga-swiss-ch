-- YogaSwiss Production Database Migration Script
-- This script applies all necessary migrations to the production Supabase instance
-- Run this in the Supabase SQL Editor at https://supabase.com/dashboard

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================================================
-- CORE SCHEMA - From 20241204000001_complete_normalized_schema.sql
-- =============================================================================

-- Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner','admin','manager','instructor','staff','customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE class_status AS ENUM ('scheduled','canceled','completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending','authorized','captured','refunded','failed','canceled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('card','cash','bank_transfer','wallet','other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_type AS ENUM ('email','sms','push','webhook');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM ('draft','scheduled','sending','completed','canceled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Utility trigger to maintain updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- Core: Organizations and People
CREATE TABLE IF NOT EXISTS public.organizations (
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

DROP TRIGGER IF EXISTS organizations_set_updated_at ON public.organizations;
CREATE TRIGGER organizations_set_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS public.profiles (
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

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS public.organization_members (
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

-- =============================================================================
-- COMPATIBILITY LAYER - From 20241204000002_compatibility_and_auth.sql
-- =============================================================================

-- Legacy endpoint compatibility (UI expects orgs / org_users)
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

-- Legacy user_profiles compatibility view
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.phone,
  p.date_of_birth,
  p.gender,
  p.photo_url,
  p.bio,
  COALESCE(p.first_name || ' ' || p.last_name, split_part(p.email, '@', 1)) AS display_name,
  p.emergency_contact,
  p.medical_notes,
  p.preferences,
  p.created_at,
  p.updated_at
FROM public.profiles p;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- profiles: a user can read/update their own profile
DROP POLICY IF EXISTS profiles_select_self ON public.profiles;
CREATE POLICY profiles_select_self
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
CREATE POLICY profiles_update_self
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;
CREATE POLICY profiles_insert_self
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- organizations: a user can see orgs where they are a member
DROP POLICY IF EXISTS orgs_select_when_member ON public.organizations;
CREATE POLICY orgs_select_when_member
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = organizations.id
        AND m.user_id = auth.uid()
        AND m.is_active
    )
  );

-- organization_members: user can see their own membership rows
DROP POLICY IF EXISTS org_members_select_self ON public.organization_members;
CREATE POLICY org_members_select_self
  ON public.organization_members FOR SELECT
  USING (user_id = auth.uid());

-- organization_members: owner/admin can see all rows in their org
DROP POLICY IF EXISTS org_members_select_admin ON public.organization_members;
CREATE POLICY org_members_select_admin
  ON public.organization_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members me
      WHERE me.organization_id = organization_members.organization_id
        AND me.user_id = auth.uid()
        AND me.role IN ('owner','admin')
        AND me.is_active
    )
  );

-- organization_members: owner/admin can modify membership
DROP POLICY IF EXISTS org_members_modify_admin ON public.organization_members;
CREATE POLICY org_members_modify_admin
  ON public.organization_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members me
      WHERE me.organization_id = organization_members.organization_id
        AND me.user_id = auth.uid()
        AND me.role IN ('owner','admin')
        AND me.is_active
    )
  );

-- =============================================================================
-- AUTH TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Auth trigger: create a profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create an organization and set current user as owner, transactional
CREATE OR REPLACE FUNCTION public.create_organization_owner(
  p_name text,
  p_slug text,
  p_locale text DEFAULT 'de-CH',
  p_timezone text DEFAULT 'Europe/Zurich',
  p_currency text DEFAULT 'CHF'
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_org_id uuid; BEGIN
  INSERT INTO public.organizations (name, slug, locale, timezone, settings)
  VALUES (p_name, p_slug, p_locale, p_timezone, jsonb_build_object('currency', p_currency, 'status','active'))
  RETURNING id INTO v_org_id;

  INSERT INTO public.organization_members (organization_id, user_id, role, is_active)
  VALUES (v_org_id, auth.uid(), 'owner', true)
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role, is_active = true;

  RETURN v_org_id; 
END; $$;

-- =============================================================================
-- RLS POLICIES FOR COMPATIBILITY VIEWS
-- =============================================================================

-- Allow access to the compatibility views based on the underlying table policies
DROP POLICY IF EXISTS orgs_view_policy ON public.orgs;
CREATE POLICY orgs_view_policy ON public.orgs FOR SELECT USING (true);

DROP POLICY IF EXISTS org_users_view_policy ON public.org_users;
CREATE POLICY org_users_view_policy ON public.org_users FOR SELECT USING (true);

DROP POLICY IF EXISTS user_profiles_view_policy ON public.user_profiles;
CREATE POLICY user_profiles_view_policy ON public.user_profiles FOR SELECT USING (true);

-- Enable RLS on compatibility views
ALTER VIEW public.orgs SET (security_barrier = on);
ALTER VIEW public.org_users SET (security_barrier = on);
ALTER VIEW public.user_profiles SET (security_barrier = on);

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Verify the schema is working
SELECT 'Schema migration completed successfully' as status;
SELECT COUNT(*) as organization_count FROM public.organizations;
SELECT COUNT(*) as org_view_count FROM public.orgs;
SELECT 'Tables and views created successfully' as result;
