-- Fix compatibility views and missing functions for YogaSwiss
-- This migration adds the missing pieces that the client code expects

-- 1. Create the missing user_has_roles_in_org function
CREATE OR REPLACE FUNCTION public.user_has_roles_in_org(p_org_id uuid, p_roles text[])
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = p_org_id
      AND user_id = auth.uid()
      AND role::text = ANY(p_roles)
      AND is_active = true
  );
END; $$;

-- 2. Create compatibility views that the client expects
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
  m.joined_at,
  m.permissions
FROM public.organization_members m;

-- 3. Create user_profiles compatibility view
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

-- 4. Create the create_organization_owner function
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

-- 5. Create auth trigger for new users
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

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.organizations TO anon, authenticated;
GRANT ALL ON public.organization_members TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.orgs TO anon, authenticated;
GRANT ALL ON public.org_users TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;

-- 7. Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 8. Grant function permissions
GRANT EXECUTE ON FUNCTION public.create_organization_owner(text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_roles_in_org(uuid, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
