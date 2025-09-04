# Products & Services — Full Requirements & Spec
Manage your **classes**, **workshops/events**, **courses/semesters**, **appointments (1:1)**, **memberships**, **passes/credits**, **gift cards**, **bundles/add‑ons**, and **retail merchandise** across locations (indoor/outdoor/online).

> Scope: SEO-first public catalog + Admin authoring + Teacher-light app. Multilingual (FR/DE/IT/EN). Pricing in CHF (EUR optional). Tight integration with **Finance**, **Registrations**, **Scheduling**, **Marketing**, **Loyalty**, and **Online Studio**.

---

## 0) Objectives
- A single **catalog system** for all sellable entities.
- Fast authoring (clone/templates), safe edits (versioned), clear policies (cancel/late/no-show).
- Accurate eligibility (memberships & passes), capacity rules, and inventory (retail).
- SEO pages that convert and are easy to maintain.

---

## 1) Catalog Concepts

- **Service** *(abstract)* — a bookable offer (class/workshop/appointment/course).
- **Class Template** — recurring class definition (style, level, duration, teacher, price, capacity).
- **Occurrence** — a scheduled session generated from a template/instance (Mon 18:00).
- **Workshop / Event** — one-off or multi-day special session(s) with richer content.
- **Course / Semester / Program** — series of sessions bought as a package; with make-up rules.
- **Appointment (1:1)** — service with **resources** (rooms/teachers/equipment) and time slots.
- **Membership** — recurring subscription granting entitlements/discounts.
- **Pass / Credit Pack** — prepaid credits valid for eligible services (liability until redemption).
- **Gift Card** — stored-value code redeemable across catalog (liability).
- **Bundle** — combined products (e.g., intro-offer: 3 classes + 1 workshop discount).
- **Add-on / Rental** — upsell (mat/towel/locker), fee (late/no-show), or donation.
- **Retail Product** — physical goods with variants (size/color), stock & barcode.

---

## 2) Data Model (Postgres sketch)

> All tables have `id uuid`, `org_id uuid`, timestamps, soft statuses (`draft/published/archived`), and RLS by `org_id`.

### 2.1 Services & Scheduling

```sql
CREATE TABLE service_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('class','workshop','course','appointment')),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  language text[] DEFAULT ARRAY['en'],
  tags text[] DEFAULT '{}',
  category text,                   -- e.g., Vinyasa, Yin, Prenatal
  level text,                      -- beginner/intermediate/all-levels
  default_duration_min int NOT NULL,
  default_price numeric(12,2) NOT NULL,
  currency text NOT NULL CHECK (currency IN ('CHF','EUR')),
  capacity int,
  waitlist_enabled boolean DEFAULT true,
  location_mode text NOT NULL CHECK (location_mode IN ('in_person','online','outdoor')),
  image_url text,
  policy_id uuid,                  -- cancellation/late/no-show policy
  seo jsonb DEFAULT '{}',
  status text NOT NULL CHECK (status IN ('draft','published','archived')),
  meta jsonb DEFAULT '{}'
);
```

```sql
CREATE TABLE class_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  template_id uuid NOT NULL REFERENCES service_templates(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL,
  location_id uuid,
  room_id uuid,
  start_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_recurring boolean DEFAULT false,
  recurrence_days int[] DEFAULT '{}',       -- 0..6
  recurrence_end_date date,
  capacity int,                              -- override
  price numeric(12,2),                       -- override
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
  meta jsonb DEFAULT '{}'
);

CREATE TABLE class_occurrences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  instance_id uuid NOT NULL REFERENCES class_instances(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  scheduled_start_time time NOT NULL,
  scheduled_end_time time NOT NULL,
  location_id uuid,
  room_id uuid,
  capacity int,
  status text NOT NULL CHECK (status IN ('scheduled','completed','cancelled','rescheduled')),
  cancellation_reason text,
  slug text UNIQUE NOT NULL,
  image_url text,
  meta jsonb DEFAULT '{}'
);
```

### 2.2 Workshops, Courses, Appointments

```sql
CREATE TABLE workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  template_id uuid REFERENCES service_templates(id),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  capacity int,
  price numeric(12,2) NOT NULL,
  location_id uuid,
  online_link text,
  instructors uuid[],
  status text CHECK (status IN ('draft','published','archived','cancelled')),
  meta jsonb DEFAULT '{}'
);
```

```sql
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  template_id uuid REFERENCES service_templates(id),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  sessions jsonb NOT NULL,         -- [{date,start,end,room}...]
  capacity int,
  price numeric(12,2) NOT NULL,
  make_up_policy jsonb DEFAULT '{}',
  status text CHECK (status IN ('draft','published','archived','cancelled'))
);
```

```sql
CREATE TABLE appointment_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  template_id uuid REFERENCES service_templates(id),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  duration_min int NOT NULL,
  base_price numeric(12,2) NOT NULL,
  resources_required jsonb DEFAULT '{}',     -- {room:true,equipment:['reformer']}
  policy_id uuid,
  status text CHECK (status IN ('draft','published','archived'))
);

CREATE TABLE resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('room','equipment','instructor')),
  name text NOT NULL,
  location_id uuid,
  capacity int,
  calendar jsonb DEFAULT '{}',  -- exceptions, closures
  status text DEFAULT 'active'
);
```

### 2.3 Pricing & Eligibility

```sql
CREATE TABLE price_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  applies_to text NOT NULL CHECK (applies_to IN ('template','instance','workshop','course','appointment')),
  ref_id uuid,                   -- link to the entity
  rule_type text NOT NULL CHECK (rule_type IN ('base','member','pass_credit','early_bird','last_minute','dynamic','corporate','child','senior','student')),
  condition jsonb DEFAULT '{}',  -- e.g., {before_days:14}, {spots<=:3}, {company_id:...}
  price numeric(12,2),           -- or null for derived
  credits int,                   -- if pass-based
  currency text CHECK (currency IN ('CHF','EUR')),
  start_at timestamptz,
  end_at timestamptz,
  priority int DEFAULT 100,
  stackable boolean DEFAULT false,
  status text DEFAULT 'active'
);
```

### 2.4 Memberships, Passes, Gift Cards, Bundles

```sql
CREATE TABLE memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly','quarterly','yearly')),
  price numeric(12,2) NOT NULL,
  currency text NOT NULL,
  entitlements jsonb NOT NULL,   -- {included:['classes','online'], limits:{per_week:3}, discounts:{workshops:20%}}
  pause_policy jsonb DEFAULT '{}',
  cancel_policy jsonb DEFAULT '{}',
  status text CHECK (status IN ('draft','published','archived'))
);
```

```sql
CREATE TABLE passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  credits int NOT NULL,
  price numeric(12,2) NOT NULL,
  currency text NOT NULL,
  expiration_days int,
  eligibility jsonb,           -- which services/locations
  transfer_allowed boolean DEFAULT false,
  status text CHECK (status IN ('draft','published','archived'))
);
```

```sql
CREATE TABLE gift_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  code text UNIQUE NOT NULL,
  initial_balance numeric(12,2) NOT NULL,
  balance numeric(12,2) NOT NULL,
  currency text NOT NULL,
  expires_at date,
  purchaser_customer_id uuid,
  recipient jsonb,             -- name/email/message
  status text CHECK (status IN ('active','redeemed','expired','void'))
);
```

```sql
CREATE TABLE bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  items jsonb NOT NULL,         -- [{type:'pass',id:..},{type:'workshop_discount',pct:50}]
  price numeric(12,2) NOT NULL,
  currency text NOT NULL,
  status text CHECK (status IN ('draft','published','archived'))
);
```

### 2.5 Retail & Inventory

```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  brand text,
  tax_category text NOT NULL,       -- standard/reduced/exempt
  revenue_category text NOT NULL DEFAULT 'retail',
  status text CHECK (status IN ('draft','published','archived'))
);

CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku text UNIQUE NOT NULL,
  option_values jsonb,                -- {size:'M',color:'Blue'}
  price numeric(12,2) NOT NULL,
  currency text NOT NULL,
  barcode text,
  weight_grams int,
  image_url text,
  status text DEFAULT 'active'
);

CREATE TABLE inventory_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  location_id uuid NOT NULL,
  quantity int NOT NULL DEFAULT 0,
  safety_stock int DEFAULT 0
);

CREATE TABLE inventory_moves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  variant_id uuid NOT NULL,
  location_id uuid,
  change int NOT NULL,               -- +receive, -sale, -adjustment
  reason text CHECK (reason IN ('receive','sale','refund','adjustment','transfer')),
  order_item_id uuid,
  note text
);
```

### 2.6 Policies, Translations, Media

```sql
CREATE TABLE policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  scope text CHECK (scope IN ('class','workshop','course','appointment','membership','pass','retail')),
  cancel_window_min int,
  late_cancel_fee numeric(12,2),
  no_show_fee numeric(12,2),
  refund_rules jsonb,
  text_md text NOT NULL
);

CREATE TABLE tags (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid, name text UNIQUE, kind text);
CREATE TABLE media (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid, url text, alt text, focal text, entity text, entity_id uuid);
CREATE TABLE translations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid, entity text, entity_id uuid, locale text, data jsonb);
```

---

## 3) Creation & Editing UX

- **Create from template** or start **blank**; **clone** existing.  
- **Detach from template** option for special instances.  
- **Draft → Preview → Publish** workflow with **change log**.  
- **Scheduling wizard**: recurring patterns (Mon/Tue), end date, exceptions, holiday skips, auto-waitlist.  
- **Bulk edit**: time shifts, instructor swaps, capacity changes with impact summary.  
- **Versioning**: store immutable snapshots for listed occurrences when policy dictates (registrations exist).

**Impact rules when editing recurring classes:**
- If **date/time** changes and no registrations → regenerate occurrences.  
- If registrations exist → update **future** empty occurrences; for affected ones:
  - Offer **migration** to new slot or **notify/cancel with policy**; preserve history.
- Removing a weekday (Tue) from Mon+Tue series:
  - **Future Tue occurrences** without registrations → delete.  
  - With registrations → keep but flag **orphaned**; prompt to **cancel & refund** or **convert to one-off**.

---

## 4) Pricing & Promotions

- **Base price** per template; override per instance/occurrence.  
- **Member pricing** / included access.  
- **Pass credits** required (e.g., 2 credits for a workshop).  
- **Early-bird** (N days before), **last-minute** (spots ≤ X), **time-of-day/day-of-week** rules.  
- **Corporate** rate cards (companies, cost centers).  
- **Child/Student/Senior** discounts (eligibility proof optional).  
- **Outdoor** surcharge/discount; **online** price variant.  
- **Coupons** stackability rules (global vs targeted).

---

## 5) Eligibility & Entitlements

- Template defines **eligible passes** and whether **memberships** include it.  
- Blackout rules: **no pass usage** on premium workshops; **only members** allowed for member events.  
- Age restrictions; **prerequisites** (e.g., “Intro workshop first”).  
- Max per week/month per customer (anti-abuse).

---

## 6) Capacity, Waitlists & Spot Selection

- Capacity at template/instance/occurrence; **room** capacity constraints.  
- **Waitlist** FIFO with promo rules (deadline, auto-charge).  
- **Spot maps** for mat selection; **equipment assignment** (reformer #3).  
- Group booking seats allocation; **hold timers** during checkout.

---

## 7) Outdoor & Online Specifics

- Outdoor: **meeting point map**, surface type, weather policy & backup location; **weather banner** day-of.  
- Online: **livestream link**, auto **check-in on join**, recording attachment policy.

---

## 8) Retail Merchandise & POS

- Variants with SKU/barcode; **receive stock**, **transfer**, **adjust** with reason.  
- **POS** mode: quick add to cart, cash/card/TWINT, **receipt print**; tax category per item.  
- **Inventory locks** on cart for short hold (optional).

---

## 9) SEO & Public Pages

- Per-entity **slug**, meta title/description, **structured data**: `Event` (classes/workshops), `Course`, `Product`, `Service`.  
- Canonicals & `hreflang` across FR/DE/IT/EN.  
- **City** and **Outdoor** hubs auto-populate listings.

---

## 10) Admin Screens (Web)

- **Catalog Overview**: KPIs, quick links, drafts needing publish.  
- **Classes & Schedule**: calendar/grid; filters; bulk actions.  
- **Workshops/Events**: list with states; upsell prompts.  
- **Courses/Semesters**: session editor; make-up manager.  
- **Appointments & Resources**: service builder; resource calendars; blackout dates; buffer times.  
- **Pricing & Discounts**: rule table with priorities and A/B flags.  
- **Memberships**: plan editor; entitlements; dunning preview.  
- **Passes & Gift Cards**: creation; liability view.  
- **Bundles & Add-ons**: composer; attach to checkout bumps.  
- **Retail**: products, variants, inventory, suppliers; **purchase orders** (optional).  
- **Policies & Translations**: editors with preview.  
- **Media**: upload, focal point, responsive crops.  

---

## 11) Teacher Light App (Mobile)

- Create **one-off class** from template; limited edits (time/capacity/instructor notes).  
- Mark **class completed**, note attendance, add walk-in (front desk fallback).  
- View **upcoming schedule**, see spots remaining, waitlist count.  
- Start **sub request** flow; see accepted subs.

---

## 12) APIs & RPCs

- `create_template(payload)` / `update_template(id, changes)` / `publish_template(id)`  
- `create_instance(template_id, schedule)` → generates occurrences  
- `bulk_edit_occurrences(filter, change)`  
- `upsert_price_rule(entity, rule)`  
- `link_eligibility(entity, passes[], memberships[])`  
- `inventory_adjust(variant_id, change, reason)`  
- `receive_purchase_order(po_payload)` (optional)  
- `compute_visibility(entity)` → SEO + eligibility check  

All RPCs idempotent; changes logged; authorization via RLS & policies.

---

## 13) Permissions & RLS

- **Owner/Admin**: full catalog.  
- **Studio Manager**: limited to location(s).  
- **Instructor**: can edit **their** classes (time/capacity) within bounds; cannot change price/policy.  
- **Front Desk**: POS retail, class roster view.  
- RLS on all tables by `org_id` and optionally by `location_id` / ownership.

---

## 14) Quality & Acceptance

- Publishing a template immediately updates public pages with correct eligibility and pricing.  
- Editing a recurring series with registrations triggers the **impact dialog** and preserves booked students with clear options.  
- Inventory stays non-negative except explicit adjustments.  
- SEO pages pass Lighthouse (SEO ≥ 95); structured data validates.  
- All text translatable; fallback to default locale where missing.

---

## 15) Edge Cases

- Instructor becomes unavailable: **sub request** and **bulk swap** future occurrences; notify registrants.  
- Capacity drop below booked seats: prevent unless **force** with path to **overbook** or **reallocate/waitlist**.  
- Outdoor weather cancel within cutoff: auto-cancel + policy refund + comms; if backup studio exists, auto-move with opt-out.  
- Courses: student misses a session → **make-up** rule applies; book eligible alternate within window.  
- Appointments: resource double-book conflict resolution with **atomic** slot holds.

---

## 16) Migration & Importers

- Import **services/classes** from Eversports/Mindbody/bsport/Arketa: CSV mappings for templates, schedules, passes, memberships, retail.  
- Slug redirect map to preserve SEO; media re-upload pipeline; tag translation seeding.

---

## 17) Implementation Checklist

- [ ] Tables & RLS created (services, scheduling, pricing, eligibility, retail).  
- [ ] Scheduling engine + impact-safe edits.  
- [ ] Pricing rules evaluator with priority/stacking.  
- [ ] Eligibility engine (membership/pass).  
- [ ] Appointment slots & resources allocator.  
- [ ] Retail inventory & POS flow.  
- [ ] Admin UIs + teacher-light mobile flows.  
- [ ] SEO pages & sitemaps.  
- [ ] E2E tests covering creation → publish → edit → register → checkout → refund → reports.

---

This spec defines a complete **Products & Services** system spanning classes, events, courses, appointments, memberships, passes, bundles, gift cards and retail — with robust scheduling, pricing, eligibility, SEO, and operational tooling to match and surpass competitors.
