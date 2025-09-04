# Brand / Studio / Instructor — Hierarchy & Admin UX

World-class multi-org design with privacy-first defaults and role-aware controls. Brand → Studio → Location/Room. Instructor is a person who can belong to many Studios (and Brands).

## Concepts
- **Org**: container with `type ∈ {brand, studio}`; Studio may have `parent_org_id` → Brand.
- **Studio**: owns customers, wallets, products, locations, finance.
- **Instructor**: user with memberships (`org_users`) in multiple orgs; optional location scope.
- **Location/Room**: belong to a Studio.

```sql
create table orgs (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('brand','studio')) not null,
  parent_org_id uuid references orgs(id),
  name text not null,
  slug text unique not null,
  currency text default 'CHF',
  timezone text default 'Europe/Zurich',
  settings jsonb default '{}'
);

create table org_users (
  org_id uuid references orgs(id),
  user_id uuid,
  role text check (role in ('owner','manager','front_desk','instructor','accountant','marketer')) not null,
  location_scope uuid[],
  primary key (org_id, user_id)
);
```

## Access Model
- **Brand Owner/Manager**: roll-ups across Studios, shared defaults & templates.
- **Studio Owner/Manager**: full control of that Studio only.
- **Instructor**: lite panel (schedule, subs, availability, messages, earnings); masked rosters by default.
- **Front Desk**: POS, check-in, rosters, limited customer edits.
- **Accountant**: finance & exports only.
- **Marketer**: pages, SEO, campaigns; no finance or medical data.

## Admin Dashboard — Navigation & Context
- **Global org switcher** (search + recents).
- Context pill shows Brand → Studio → Location path.
- Sections (role-aware): Schedule, Products & Services, Customers, Finance, Marketing, Content/Online Studio, Analytics, Settings.

## Settings with Inheritance
- Brand sets defaults (payments, VAT, policies, documents, languages, revenue categories).
- Studio may **override**; UI labels **Inherited** vs **Overridden** with reset.
- Location can override capacity, spot maps, outdoor/backup rules.

## Catalog & Schedule
- Brand publishes shared templates (classes, packs, memberships, gift cards, retail).
- Studio can adopt/fork templates.
- Recurrence editor: edit one/forward/all; conflict checks (room/resource/instructor).
- Substitution workflow: instructor requests → manager approves → payroll updates.

## People & Privacy
- Customers belong to the Studio where they booked. Cross-Studio visibility inside a Brand requires consent or anonymized analytics.
- Instructors see **masked rosters** unless Studio enables sharing or student consents.
- Merge customers only within the same Studio; never cross-Studio automerge.

## Finance & Reports
- Brand: roll-up sales, attendance, payouts, VAT; drill down to Studio.
- Studio: full orders/payments/refunds/payouts; **QR-bill**, **TWINT**; instructor earnings & payroll close.
- Instructor: earnings for their classes only.

## Marketing & Pages
- Brand: theme and shared blocks; parent campaigns.
- Studio: public studio/location pages, instructor profiles, offers/coupons/gift cards.
- Segments & journeys with quiet hours and consent tracking.

## Analytics & Forecasting
- Brand: KPIs with Studio drilldown.
- Studio: KPIs with instructor/room breakdown; yield/occupancy heatmaps; staffing/pricing suggestions.

## Instructor “Lite” Dashboard
- My Schedule, My Classes/Occurrences, Sub Requests, Availability, Messages, Earnings.
- No access to Settings or Studio finance; masked attendee details by default.

## Safety & Audit
- 2FA for owners/managers; session TTL; IP allowlist (optional).
- Audit trail: refunds, exports, role changes, PII access; exports require reason and are watermarked.
- RLS everywhere: `org_id` scope; Brand read-through is read-only unless elevated.
