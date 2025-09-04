
# Retreats & Festivals — Admin + Customer Web Portal & Supabase Integration
_As of 2025-09-02 22:00 _

## 1) Scope
Support complex, multi‑day retreats/festivals (Switzerland or abroad) with custom **applications**, **rooms & prices**, **deposits & balances**, logistics, cohort messaging, and Swiss finance. Modeled on real cases like **Ice & Yoga — Lithuania** with rich content and an approval‑based booking flow.

## 2) IA (Routes)
- `/retreats` — browse by date/country/theme/language.
- `/retreats/[slug]` — rich page with tabs (Essentials, Location, Prices & Rooms, Program, Impressions, FAQ, Hosts).
- `/retreats/[slug]/apply` — multi‑step application.
- `/retreats/[slug]/checkout` — deposit/balance after approval.
- `/account/retreats` — status, payments, itinerary, roommate, docs, messages.
- `/admin/retreats` — list/manage.
- `/admin/retreats/new` — create.
- `/admin/retreats/[id]` — edit tabs: Content • Dates/Capacity • Rooms/Prices • Add‑ons/Discounts • Application Form • Policies • Logistics • Publish.
- `/admin/retreats/[id]/bookings` — approvals pipeline, rooming board, manifests.

## 3) Supabase Data Model (tenant‑scoped)
### Catalog
- `retreats(id, tenant_id, title, slug, summary, long_description_md, country, region, city, start_date, end_date, languages text[], host_brand_id, hosts jsonb, capacity_total, min_age, included_md, not_included_md, policies_md, visibility, is_active, seo_json)`
- `retreat_sections(id, retreat_id, kind, content_md, order_idx)`
- `retreat_media(id, retreat_id, kind, url, caption, order_idx)`

### Prices, Rooms, Add‑ons
- `retreat_room_types(id, retreat_id, name, occupancy, currency, price, vat_rate, inventory, gender_policy, shareable bool)`
- `retreat_addons(id, retreat_id, name, price, currency, vat_rate, type, inventory)`
- `retreat_discounts(id, retreat_id, code, type, value, rules_json)`

### Applications & Bookings
- `retreat_forms(id, retreat_id, form_schema_json, requires_approval bool)`
- `retreat_applications(id, retreat_id, customer_id, status, answers_jsonb, consents_jsonb, room_type_id, roommate_pref text, medical_notes, dietary, passport_last4, travel_insurance bool, arrival_info jsonb, departure_info jsonb)`
  - status: draft | submitted | approved | waitlist | rejected | withdrawn
- `retreat_bookings(id, application_id, order_id, status, deposit_amount, balance_due_at, currency, amount_total)`
  - status: reserved | confirmed | cancelled | completed
- `retreat_room_allocations(id, retreat_id, booking_id, room_type_id, bed_index, roommate_group)`
- `retreat_itineraries(id, retreat_id, day, title, description_md, starts_at, ends_at, location)`
- Views: `retreat_manifest_views` (rosters with flags; export).

### Finance
Shared `orders`, `order_items(type in ('retreat_deposit','retreat_balance','retreat_addon'))`, `payments`, `refunds`, `invoices`, `payouts`. Multi‑currency with stored `fx_rate` and CHF view.

### Messaging & Storage
Cohort thread + per‑booking thread (Community Inbox). Storage buckets: `media-retreats`, `retreat-docs` (packing list, waivers).

## 4) RLS
- Public: published retreats only.
- Customer: own application/booking.
- Manager: all for tenant.
- Co‑host instructor: assigned retreat only.
- Messaging: thread‑membership enforced.

## 5) RPCs / Jobs
- `submit_retreat_application(retreat_id, customer_id, answers_jsonb)`
- `approve_retreat_application(application_id, room_type_id, price_locked)`
- `capture_retreat_balance(booking_id)`
- `assign_room(booking_id, room_type_id, roommate_group)`
- `auto_pair_roommates(retreat_id)`
- `update_travel_info(booking_id, arrival_json, departure_json)`
- Nightly: dunning for balances; waitlist auto‑promotion.
- Triggers: create cohort thread on approval; send itinerary reminders.

## 6) Customer Web Portal — UX
- **Retreat page**: hero + gallery; tabs; Google Map; hosts; inclusions; price table; remaining spots; CTA Apply.
- **Application wizard**: Contact → Rooming → Health & Safety → Travel → Consents. Save draft; resume via magic link.
- **Approval email** + secure checkout for **deposit**; show balance schedule.
- **Dashboard**: application status, invoices, travel info form, roommate pairing, downloadable docs, cohort messaging, itinerary by day.
- **Cancellations**: policy tiers; refunds/credits calculated; wallet option if allowed.
- **International**: de‑CH, fr‑CH (tu), it‑CH, en‑CH.

## 7) Admin/Brand/Studio — UX
- Create/Edit: content & SEO, dates/capacity, rooms/prices, add‑ons/discounts, form builder, policies (cancellation/transfer), logistics (itinerary, transfers, packing list), publish.
- Approvals pipeline: scorecards, bulk actions, templated replies.
- Rooming board: kanban by room type; drag‑drop; gender/occupancy validation; waitlist promotions.
- Manifests: travel roster, dietary/allergy list, medical flags, waiver status; CSV/PDF.
- Finance: deposits vs balances, payment plans, refunds, payouts.
- Messaging: cohort announcements, per‑booking DM, scheduled sequences.

## 8) Integrations
- **Finance**: Swiss VAT; QR‑bill; TWINT/Card; gift cards/credits; payouts.
- **Marketing**: funnels (lead → application → approval → paid); UTM → revenue; segments.
- **Inbox**: cohort & DM threads; moderation; email/SMS digests.
- **Analytics**: conversion, approval rate, room utilization, rev by room/add‑on.
- **Settings**: legal docs, consent versions, cancellation tiers, roommate rules.

## 9) Integration Matrix (Supabase)
| Component | Tables/Views | RPCs | Storage | Realtime |
|---|---|---|---|---|
| Directory | `retreats` (published view) | – | media | – |
| Detail page | `retreats`, `retreat_sections`, `retreat_room_types`, `retreat_media` | – | media | – |
| Application | `retreat_forms`, `retreat_applications` | submit | `retreat-docs` | – |
| Approval/Checkout | `retreat_bookings`, `orders`, `invoices` | approve/capture | docs | – |
| Customer dashboard | `retreat_applications`, `retreat_bookings`, `invoices`, `retreat_itineraries` | update_travel | docs | cohort thread |
| Admin approvals | `retreat_applications` | approve | – | – |
| Rooming | `retreat_room_allocations` | assign/auto_pair | – | – |
| Manifests | `retreat_manifest_views` | – | export | – |

## 10) Acceptance
- Application requires consent; approval triggers deposit invoice + cohort thread.
- Room allocation enforces occupancy/gender; waitlist promotion works.
- Refunds follow policy and update liabilities; Swiss docs correct.
- Customer portal accurate and realtime for messages/updates.
- No cross‑tenant leakage.

## 11) Seed & Test
Seed 1 retreat with 3 room types, 2 add‑ons, form schema; submit 3 applications; approve 2; allocate rooms; process deposit & balance in sandbox; export manifests.
