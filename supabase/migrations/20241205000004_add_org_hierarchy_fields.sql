-- Add organization hierarchy fields to existing organizations table
-- This migration adds the missing type and parent_id fields to support the hierarchy constraint

-- Create org_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE org_type AS ENUM ('brand', 'studio');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add type column to organizations table with proper enum type
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS type org_type DEFAULT 'studio'::org_type;

-- Add parent_id column to organizations table  
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.organizations(id);

-- Add a simple constraint (complex hierarchy validation will be done at application level)
ALTER TABLE public.organizations
ADD CONSTRAINT check_org_type_valid
CHECK (type IN ('brand', 'studio'));

-- Update the create_organization_owner RPC function to support hierarchy
CREATE OR REPLACE FUNCTION public.create_organization_owner(
  p_name text, 
  p_slug text, 
  p_type text, 
  p_parent_org_id uuid DEFAULT NULL,
  p_locale text DEFAULT 'de-CH', 
  p_timezone text DEFAULT 'Europe/Zurich', 
  p_currency text DEFAULT 'CHF'
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE 
  v_org_id uuid;
BEGIN
  -- Insert the organization
  INSERT INTO public.organizations (name, slug, type, parent_id, locale, timezone, settings)
  VALUES (p_name, p_slug, p_type::org_type, p_parent_org_id, p_locale, p_timezone, jsonb_build_object('currency', p_currency, 'status','active'))
  RETURNING id INTO v_org_id;
  
  -- Add the creator as owner
  INSERT INTO public.organization_members (organization_id, user_id, role, is_active)
  VALUES (v_org_id, auth.uid(), 'owner', true);
  
  RETURN v_org_id;
END; $$;

-- Update the get_user_organizations RPC function to return type and parent_id
CREATE OR REPLACE FUNCTION public.get_user_organizations(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  id uuid, 
  name text, 
  slug text, 
  type text, 
  parent_id uuid,
  primary_locale text, 
  timezone text, 
  currency text, 
  status text, 
  role text,
  member_status text, 
  created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id, 
    o.name, 
    o.slug, 
    o.type::text, 
    o.parent_id,
    o.locale as primary_locale, 
    o.timezone,
    COALESCE(o.settings->>'currency','CHF') as currency,
    COALESCE(o.settings->>'status','active') as status,
    m.role::text,
    CASE WHEN m.is_active THEN 'active' ELSE 'inactive' END as member_status,
    o.created_at
  FROM public.organizations o
  JOIN public.organization_members m ON m.organization_id = o.id
  WHERE m.user_id = p_user_id AND m.is_active = true;
END; $$;
