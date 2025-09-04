-- Fix the get_user_organizations RPC to include type and parent_id fields
-- This is needed for the organization hierarchy functionality

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
    o.type,
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
