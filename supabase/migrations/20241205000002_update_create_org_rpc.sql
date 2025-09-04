-- Update the create_organization_owner RPC to support organization hierarchy
-- Add support for type (brand/studio) and parent_org_id parameters

CREATE OR REPLACE FUNCTION public.create_organization_owner(
  p_name text,
  p_slug text,
  p_type text DEFAULT 'studio',
  p_parent_org_id uuid DEFAULT NULL,
  p_locale text DEFAULT 'de-CH',
  p_timezone text DEFAULT 'Europe/Zurich',
  p_currency text DEFAULT 'CHF'
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE 
  v_org_id uuid;
  v_parent_type text;
BEGIN
  -- Validate type parameter
  IF p_type NOT IN ('brand', 'studio') THEN
    RAISE EXCEPTION 'Type must be either "brand" or "studio"';
  END IF;

  -- If parent_org_id is provided, validate the parent exists and is a brand
  IF p_parent_org_id IS NOT NULL THEN
    SELECT type INTO v_parent_type 
    FROM public.organizations 
    WHERE id = p_parent_org_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Parent organization not found';
    END IF;
    
    -- Enforce constraint: studios can only be children of brands
    IF p_type = 'studio' AND v_parent_type != 'brand' THEN
      RAISE EXCEPTION 'Studios can only be children of brands, not other studios';
    END IF;
  END IF;

  -- Create the organization
  INSERT INTO public.organizations (
    name, 
    slug, 
    type,
    parent_id,
    locale, 
    timezone, 
    settings
  )
  VALUES (
    p_name, 
    p_slug, 
    p_type,
    p_parent_org_id,
    p_locale, 
    p_timezone, 
    jsonb_build_object(
      'currency', p_currency, 
      'status', 'active',
      'languages', ARRAY['de', 'en'],
      'default_language', 'de',
      'vat_rate', 7.7,
      'twint_enabled', false,
      'qr_bill_enabled', false,
      'stripe_enabled', false
    )
  )
  RETURNING id INTO v_org_id;

  -- Add user as owner
  INSERT INTO public.organization_members (organization_id, user_id, role, is_active)
  VALUES (v_org_id, auth.uid(), 'owner', true)
  ON CONFLICT (organization_id, user_id) DO UPDATE SET 
    role = EXCLUDED.role, 
    is_active = true;

  -- Add user as instructor (for studios)
  IF p_type = 'studio' THEN
    INSERT INTO public.instructors (organization_id, profile_id)
    VALUES (v_org_id, auth.uid())
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_org_id;
END; $$;
