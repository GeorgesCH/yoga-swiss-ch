-- =============================================
-- Compatibility layer + Auth & onboarding flows
-- =============================================

-- 1) Legacy endpoint compatibility (UI expects orgs / org_users)
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

-- Optional: pre-embedded org JSON if you don't want to rely on PostgREST embedding
CREATE OR REPLACE VIEW public.org_users_with_org AS
SELECT
  m.user_id,
  m.role::text AS role,
  CASE WHEN m.is_active THEN 'active' ELSE 'inactive' END AS status,
  to_jsonb(o.*) - 'settings' AS orgs
FROM public.organization_members m
JOIN public.organizations o ON o.id = m.organization_id
WHERE m.is_active;

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

-- 2) RLS policies for org visibility and memberships
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- profiles: a user can read/update their own profile
CREATE POLICY profiles_select_self
  ON public.profiles FOR SELECT
  USING (id = auth.uid());
CREATE POLICY profiles_update_self
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());
CREATE POLICY profiles_insert_self
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- organizations: a user can see orgs where they are a member
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
CREATE POLICY org_members_select_self
  ON public.organization_members FOR SELECT
  USING (user_id = auth.uid());

-- organization_members: owner/admin can see all rows in their org
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

-- instructors: can see instructors in orgs they belong to
CREATE POLICY instructors_select_when_member
  ON public.instructors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = instructors.organization_id
        AND m.user_id = auth.uid()
        AND m.is_active
    )
  );

-- instructors: owner/admin/manager can modify
CREATE POLICY instructors_modify_admin
  ON public.instructors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = instructors.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner','admin','manager')
        AND m.is_active
    )
  );

-- locations: can see locations in orgs they belong to
CREATE POLICY locations_select_when_member
  ON public.locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = locations.organization_id
        AND m.user_id = auth.uid()
        AND m.is_active
    )
  );

-- locations: owner/admin/manager can modify
CREATE POLICY locations_modify_admin
  ON public.locations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = locations.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner','admin','manager')
        AND m.is_active
    )
  );

-- class_templates: can see templates in orgs they belong to
CREATE POLICY class_templates_select_when_member
  ON public.class_templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = class_templates.organization_id
        AND m.user_id = auth.uid()
        AND m.is_active
    )
  );

-- class_templates: owner/admin/manager/instructor can modify
CREATE POLICY class_templates_modify_staff
  ON public.class_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = class_templates.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner','admin','manager','instructor')
        AND m.is_active
    )
  );

-- class_occurrences: can see occurrences in orgs they belong to
CREATE POLICY class_occurrences_select_when_member
  ON public.class_occurrences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = class_occurrences.organization_id
        AND m.user_id = auth.uid()
        AND m.is_active
    )
  );

-- class_occurrences: owner/admin/manager/instructor can modify
CREATE POLICY class_occurrences_modify_staff
  ON public.class_occurrences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = class_occurrences.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner','admin','manager','instructor')
        AND m.is_active
    )
  );

-- registrations: customers can see their own, staff can see all in their org
CREATE POLICY registrations_select_customer
  ON public.registrations FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY registrations_select_staff
  ON public.registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = registrations.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner','admin','manager','instructor','staff')
        AND m.is_active
    )
  );

-- registrations: customers can insert their own, staff can manage
CREATE POLICY registrations_insert_customer
  ON public.registrations FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY registrations_modify_staff
  ON public.registrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = registrations.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner','admin','manager','instructor','staff')
        AND m.is_active
    )
  );

-- 3) Auth triggers: create a profile row when a new auth user signs up
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

-- 4) Onboarding RPCs
-- Create an organization and set current user as owner (and instructor), transactional
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

  INSERT INTO public.instructors (organization_id, profile_id)
  VALUES (v_org_id, auth.uid())
  ON CONFLICT DO NOTHING;

  RETURN v_org_id; END; $$;

-- Request to join an organization as instructor (pending until approved)
CREATE OR REPLACE FUNCTION public.request_membership(p_org_id uuid, p_role user_role DEFAULT 'instructor')
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role, is_active)
  VALUES (p_org_id, auth.uid(), p_role, false)
  ON CONFLICT (organization_id, user_id) DO NOTHING;
END; $$;

-- Approve a membership (owner/admin only)
CREATE OR REPLACE FUNCTION public.approve_org_member(p_org_id uuid, p_user_id uuid, p_role user_role)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.organization_members me
    WHERE me.organization_id = p_org_id
      AND me.user_id = auth.uid()
      AND me.role IN ('owner','admin')
      AND me.is_active
  ) THEN RAISE EXCEPTION 'Not authorized'; END IF;

  INSERT INTO public.organization_members (organization_id, user_id, role, is_active)
  VALUES (p_org_id, p_user_id, p_role, true)
  ON CONFLICT (organization_id, user_id) DO UPDATE
  SET role = EXCLUDED.role, is_active = true;
END; $$;

-- Get user's organizations
CREATE OR REPLACE FUNCTION public.get_user_organizations(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
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

-- 5) RLS policies for compatibility views
-- Allow access to the compatibility views based on the underlying table policies
CREATE POLICY orgs_view_policy ON public.orgs FOR SELECT USING (true);
CREATE POLICY org_users_view_policy ON public.org_users FOR SELECT USING (true);
CREATE POLICY org_users_with_org_view_policy ON public.org_users_with_org FOR SELECT USING (true);
CREATE POLICY user_profiles_view_policy ON public.user_profiles FOR SELECT USING (true);

-- Enable RLS on compatibility views
ALTER VIEW public.orgs SET (security_barrier = on);
ALTER VIEW public.org_users SET (security_barrier = on);
ALTER VIEW public.org_users_with_org SET (security_barrier = on);
ALTER VIEW public.user_profiles SET (security_barrier = on);