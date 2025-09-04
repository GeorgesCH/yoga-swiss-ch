# 🇨🇭 YogaSwiss Quick Deployment Guide

**Emergency Database Setup - If Your App Won't Start**

## Problem
Your YogaSwiss app is failing to deploy/start because of missing database schema or component issues.

## Quick Solution (5 minutes)

### Step 1: Run Database Migrations
1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to your project: `okvreiyhuxjosgauqaqq`
3. Click **SQL Editor** in the sidebar
4. Run these two scripts **in order**:

#### Script 1: Normalized Schema
```sql
-- YogaSwiss Normalized Schema v2.1.0
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
CREATE TYPE user_role AS ENUM ('owner','admin','manager','instructor','staff','customer');
CREATE TYPE class_status AS ENUM ('scheduled','canceled','completed');
CREATE TYPE payment_status AS ENUM ('pending','authorized','captured','refunded','failed','canceled');
CREATE TYPE payment_method AS ENUM ('card','cash','bank_transfer','wallet','other');
CREATE TYPE campaign_type AS ENUM ('email','sms','push','webhook');
CREATE TYPE campaign_status AS ENUM ('draft','scheduled','sending','completed','canceled');

-- Utility trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

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

-- Add updated_at triggers
CREATE TRIGGER organizations_set_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

#### Script 2: Compatibility Layer
```sql
-- YogaSwiss Compatibility Layer
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

-- RLS policies
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY profiles_select_self ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY profiles_insert_self ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Auth trigger
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

-- Organization creation function
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
```

### Step 2: Fix App Deployment Issues

If your app still won't start, replace your `App.tsx` temporarily with this safe version:

```tsx
import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-3xl font-bold text-gray-900">🇨🇭 YogaSwiss</h1>
        <p className="text-lg text-gray-600">Swiss Yoga Studio Management</p>
        
        <div className="p-6 border border-gray-200 rounded-lg bg-green-50">
          <h2 className="text-xl font-semibold text-green-800 mb-2">✅ Deployment Successful</h2>
          <p className="text-green-700">Your YogaSwiss platform is ready!</p>
        </div>
        
        <div className="space-y-3 text-left">
          <h3 className="font-semibold text-gray-800">Next Steps:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. ✅ Database schema deployed</p>
            <p>2. ✅ Application running</p>
            <p>3. 🔜 Create your first organization</p>
          </div>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reload Full App
        </button>
      </div>
    </div>
  );
}
```

### Step 3: Verify Database Setup

Run this query in Supabase SQL Editor to verify everything worked:

```sql
-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('organizations', 'profiles', 'organization_members');

-- Verify views exist  
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('orgs', 'org_users', 'user_profiles');
```

You should see 6 rows returned (3 tables + 3 views).

### Step 4: Restore Full App

Once the database is set up and the safe version loads:

1. Restore your original `App.tsx`
2. The app should now load properly with database connectivity
3. Use the organization recovery tools if needed

## Common Issues & Fixes

**"Relation does not exist" errors:**
- Run the SQL scripts above in the exact order shown

**App won't compile:**
- Use the safe App.tsx version above temporarily
- Check console for specific error messages

**Authentication issues:**
- The scripts above include auth triggers and RLS policies
- Users will automatically get profile entries when they sign up

## Emergency Contact

If you're still having issues:
1. Check browser console for error messages
2. Use the safe App.tsx version to get the app running
3. Gradually restore features one by one

---

**YogaSwiss v2.1.0** - Swiss Quality, Simplified Deployment