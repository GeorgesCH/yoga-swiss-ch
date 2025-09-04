-- Trimmed, normalized schema for a multi-tenant studio platform
-- Focus: template + occurrence as the single source of truth for scheduling
-- Uses gen_random_uuid(); requires pgcrypto

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
CREATE TYPE user_role AS ENUM ('owner','admin','manager','instructor','staff','customer');
CREATE TYPE class_status AS ENUM ('scheduled','canceled','completed');
CREATE TYPE payment_status AS ENUM ('pending','authorized','captured','refunded','failed','canceled');
CREATE TYPE payment_method AS ENUM ('card','cash','bank_transfer','wallet','other');
CREATE TYPE campaign_type AS ENUM ('email','sms','push','webhook');
CREATE TYPE campaign_status AS ENUM ('draft','scheduled','sending','completed','canceled');

-- Utility trigger to maintain updated_at
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
CREATE TRIGGER organizations_set_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

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
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

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

-- Instructors are role-wrapped profiles, scoped to org
CREATE TABLE public.instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  profile_id uuid NOT NULL REFERENCES public.profiles(id),
  specialties text[] NOT NULL DEFAULT '{}',
  certifications text[] NOT NULL DEFAULT '{}',
  experience_years int,
  bio text,
  photo_url text,
  hourly_rate numeric,
  availability jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, organization_id)
);
CREATE TRIGGER instructors_set_updated_at
BEFORE UPDATE ON public.instructors
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Places
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  name text NOT NULL,
  slug text,
  address text,
  city text,
  postal_code text,
  country text NOT NULL DEFAULT 'Switzerland',
  latitude numeric(9,6),
  longitude numeric(9,6),
  amenities text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  capacity int,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, organization_id),
  UNIQUE (organization_id, slug)
);
CREATE TRIGGER locations_set_updated_at
BEFORE UPDATE ON public.locations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id),
  name text NOT NULL,
  capacity int NOT NULL DEFAULT 20,
  amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
  equipment text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (location_id, name)
);

-- Classes: template + occurrence is the single source of truth
CREATE TABLE public.class_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  name text NOT NULL,
  description text,
  duration_minutes int NOT NULL,
  difficulty_level text,
  category text,
  tags text[] NOT NULL DEFAULT '{}',
  image_url text,
  instructor_id uuid REFERENCES public.instructors(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, organization_id)
);
CREATE TRIGGER class_templates_set_updated_at
BEFORE UPDATE ON public.class_templates
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.class_occurrences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  instructor_id uuid,
  location_id uuid,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  slug text,
  price_cents int NOT NULL,
  capacity int NOT NULL,
  booked_count int NOT NULL DEFAULT 0,
  waitlist_count int NOT NULL DEFAULT 0,
  status class_status NOT NULL DEFAULT 'scheduled',
  cancellation_reason text,
  notes text,
  meeting_url text,
  weather_backup_used boolean NOT NULL DEFAULT false,
  instructor_notes text,
  actual_instructor_id uuid,
  actual_location_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (start_time < end_time),
  -- Org consistency via composite FKs
  FOREIGN KEY (template_id, organization_id) REFERENCES public.class_templates(id, organization_id),
  FOREIGN KEY (instructor_id) REFERENCES public.instructors(id),
  FOREIGN KEY (location_id) REFERENCES public.locations(id),
  FOREIGN KEY (actual_instructor_id) REFERENCES public.instructors(id),
  FOREIGN KEY (actual_location_id) REFERENCES public.locations(id),
  UNIQUE (id, organization_id)
);
CREATE TRIGGER class_occurrences_set_updated_at
BEFORE UPDATE ON public.class_occurrences
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_class_occurrences_org_time ON public.class_occurrences(organization_id, start_time);
CREATE INDEX idx_class_occurrences_status ON public.class_occurrences(status);

CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  class_occurrence_id uuid NOT NULL REFERENCES public.class_occurrences(id),
  profile_id uuid NOT NULL REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'confirmed',
  booking_date timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_occurrence_id, profile_id)
);
CREATE TRIGGER registrations_set_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.waitlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  class_occurrence_id uuid NOT NULL REFERENCES public.class_occurrences(id),
  customer_id uuid NOT NULL REFERENCES public.profiles(id),
  position int NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  notified_at timestamptz,
  promoted_at timestamptz,
  expires_at timestamptz,
  UNIQUE (class_occurrence_id, customer_id)
);

CREATE TABLE public.timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid NOT NULL REFERENCES public.instructors(id),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  total_hours numeric NOT NULL,
  class_occurrence_id uuid REFERENCES public.class_occurrences(id),
  notes text,
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.customer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  customer_id uuid NOT NULL REFERENCES public.profiles(id),
  class_occurrence_id uuid REFERENCES public.class_occurrences(id),
  rating int CHECK (rating BETWEEN 1 AND 5),
  comment text,
  category text,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Catalog and Commerce
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  name jsonb NOT NULL,
  description jsonb NOT NULL DEFAULT '{}'::jsonb,
  type text NOT NULL,
  category text,
  sku text,
  price_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'CHF',
  tax_class text NOT NULL DEFAULT 'standard',
  credit_count int,
  validity_days int,
  class_types text[] DEFAULT '{}',
  billing_interval text,
  billing_period int NOT NULL DEFAULT 1,
  images text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  inventory_tracking boolean NOT NULL DEFAULT false,
  max_quantity_per_order int,
  channel_flags text[] NOT NULL DEFAULT '{web}',
  visibility text NOT NULL DEFAULT 'public',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  customer_id uuid NOT NULL REFERENCES public.profiles(id),
  order_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  subtotal_cents int NOT NULL DEFAULT 0,
  tax_amount_cents int NOT NULL DEFAULT 0,
  discount_amount_cents int NOT NULL DEFAULT 0,
  total_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'CHF',
  shipping_address jsonb,
  billing_address jsonb,
  shipping_method text,
  shipping_cost_cents int NOT NULL DEFAULT 0,
  customer_email text,
  customer_phone text,
  customer_notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER orders_set_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  product_name text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  unit_price_cents int NOT NULL,
  total_price_cents int NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  customer_id uuid NOT NULL REFERENCES public.profiles(id),
  order_id uuid REFERENCES public.orders(id),
  invoice_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft',
  billing_address jsonb,
  due_date date NOT NULL,
  issued_date date NOT NULL DEFAULT CURRENT_DATE,
  paid_date date,
  subtotal_cents int NOT NULL DEFAULT 0,
  tax_amount_cents int NOT NULL DEFAULT 0,
  total_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'CHF',
  vat_number text,
  qr_code_data text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER invoices_set_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  description text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  unit_price_cents int NOT NULL,
  total_price_cents int NOT NULL,
  tax_rate numeric,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  customer_id uuid NOT NULL REFERENCES public.profiles(id),
  order_id uuid REFERENCES public.orders(id),
  invoice_id uuid REFERENCES public.invoices(id),
  amount_cents int NOT NULL,
  currency text NOT NULL DEFAULT 'CHF',
  method payment_method,
  status payment_status NOT NULL DEFAULT 'pending',
  transaction_id text,
  gateway_response jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (order_id IS NOT NULL OR invoice_id IS NOT NULL)
);
CREATE UNIQUE INDEX payments_transaction_id_unique
  ON public.payments(transaction_id)
  WHERE transaction_id IS NOT NULL;

-- Marketing and CRM
CREATE TABLE public.segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  name text NOT NULL,
  description text,
  criteria jsonb NOT NULL,
  last_calculated_at timestamptz,
  member_count int NOT NULL DEFAULT 0,
  is_dynamic boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);
CREATE TRIGGER segments_set_updated_at
BEFORE UPDATE ON public.segments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  name text NOT NULL,
  type campaign_type NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  subject text,
  content jsonb,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  sent_count int NOT NULL DEFAULT 0,
  delivered_count int NOT NULL DEFAULT 0,
  opened_count int NOT NULL DEFAULT 0,
  clicked_count int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER campaigns_set_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.campaign_segments (
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  segment_id uuid NOT NULL REFERENCES public.segments(id) ON DELETE CASCADE,
  PRIMARY KEY (campaign_id, segment_id)
);

CREATE TABLE public.journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  name text NOT NULL,
  description text,
  trigger_event text NOT NULL,
  steps jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER journeys_set_updated_at
BEFORE UPDATE ON public.journeys
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  user_id uuid REFERENCES public.profiles(id),
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  page_url text,
  user_agent text,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_analytics_events_org_type_time
  ON public.analytics_events(organization_id, event_type, created_at DESC);

-- Resources and Programs
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  location_id uuid REFERENCES public.locations(id),
  name text NOT NULL,
  type text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  is_bookable boolean NOT NULL DEFAULT false,
  rental_price_cents int NOT NULL DEFAULT 0,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'series',
  duration_weeks int NOT NULL,
  sessions_per_week int NOT NULL DEFAULT 1,
  price_cents int NOT NULL,
  capacity int NOT NULL DEFAULT 20,
  start_date date NOT NULL,
  instructor_id uuid REFERENCES public.instructors(id),
  location_id uuid REFERENCES public.locations(id),
  images text[] NOT NULL DEFAULT '{}',
  curriculum jsonb NOT NULL DEFAULT '{}'::jsonb,
  requirements jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER programs_set_updated_at
BEFORE UPDATE ON public.programs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.program_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  program_id uuid NOT NULL REFERENCES public.programs(id),
  customer_id uuid NOT NULL REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, customer_id)
);

CREATE TABLE public.retreats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  name text NOT NULL,
  description text,
  location_id uuid REFERENCES public.locations(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  capacity int NOT NULL DEFAULT 20,
  price_cents int NOT NULL,
  deposit_required_cents int NOT NULL DEFAULT 0,
  images text[] NOT NULL DEFAULT '{}',
  itinerary jsonb NOT NULL DEFAULT '{}'::jsonb,
  requirements jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER retreats_set_updated_at
BEFORE UPDATE ON public.retreats
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.retreat_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retreat_id uuid NOT NULL REFERENCES public.retreats(id),
  customer_id uuid NOT NULL REFERENCES public.profiles(id),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  status text NOT NULL DEFAULT 'pending',
  deposit_paid_cents int NOT NULL DEFAULT 0,
  total_paid_cents int NOT NULL DEFAULT 0,
  special_requirements text,
  emergency_contact jsonb,
  dietary_restrictions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER retreat_registrations_set_updated_at
BEFORE UPDATE ON public.retreat_registrations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Wallets and Finance Ops
CREATE TABLE public.customer_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  customer_id uuid NOT NULL REFERENCES public.profiles(id),
  balance_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'CHF',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, customer_id)
);
CREATE TRIGGER customer_wallets_set_updated_at
BEFORE UPDATE ON public.customer_wallets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.customer_wallets(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount_cents int NOT NULL CHECK (amount_cents > 0),
  description text,
  reference_type text,
  reference_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Growth
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id),
  referred_id uuid NOT NULL REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'pending',
  reward_type text,
  reward_value_cents int NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Payouts
CREATE TABLE public.earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  instructor_id uuid NOT NULL REFERENCES public.instructors(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  base_amount_cents int NOT NULL DEFAULT 0,
  bonus_amount_cents int NOT NULL DEFAULT 0,
  total_amount_cents int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER earnings_set_updated_at
BEFORE UPDATE ON public.earnings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.instructor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid NOT NULL REFERENCES public.instructors(id),
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Namespaced key value store
CREATE TABLE public.kv_store (
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  namespace text NOT NULL DEFAULT 'default',
  key text NOT NULL,
  value jsonb NOT NULL,
  PRIMARY KEY (organization_id, namespace, key)
);

-- Helpful indexes
CREATE INDEX idx_registrations_org_class ON public.registrations(organization_id, class_occurrence_id);
CREATE INDEX idx_orders_org_status_time ON public.orders(organization_id, status, created_at DESC);
CREATE INDEX idx_payments_org_status_time ON public.payments(organization_id, status, processed_at DESC);
CREATE INDEX idx_segments_org ON public.segments(organization_id);
CREATE INDEX idx_campaigns_org_status ON public.campaigns(organization_id, status);

-- Enable pg_trgm for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_profiles_email_trgm ON public.profiles USING gin (email gin_trgm_ops);