
# Programs as Appointments — Admin + Customer Web Portal & Supabase Integration
_As of 2025-09-02 22:00 _

## 1) Scope & Goals
Enable instructors/studios to sell **individual programs** (coaching, private yoga/dance, Reiki) as **true 1:1** services with single or multi‑session options, custom intake, milestones, messaging, and clean finance. Covers **admin/instructor tools**, **customer web portal**, **Supabase** schema/RLS/RPCs, and cross‑module integrations (Finance, Marketing, Messaging/Inbox, Analytics, Settings, Resources).

## 2) Personas & Permissions (Multi‑tenant)
- **Owner/Manager**: all programs, pricing, policies, payouts.
- **Instructor**: own programs, availability, bookings, progress.
- **Front Desk**: create/reschedule, collect payments.
- **Marketer**: landing pages, segments, journeys.
- **Accountant**: invoices, payouts, refunds.
- **Customer**: discover, book, pay, reschedule, message, intake.
- **Auditor (RO)**: read dashboards only.
RLS: tenant‑scoped; instructors see only own bookings/earnings; customers only their data; impersonation with consent + audit log.

## 3) Information Architecture (Routes)
- `/programs` — directory (filters: category, delivery, price, language).
- `/programs/[slug]` — SEO page: overview, pricing variants, availability picker.
- `/book/program/[slug]` — wizard: time → intake → payment.
- `/account/programs` — customer dashboard.
- `/account/programs/[bookingId]` — booking detail.
- `/admin/programs` — list/manage.
- `/admin/programs/new` — create wizard.
- `/admin/programs/[id]` — edit tabs.
- `/admin/programs/bookings` — pipeline.
- `/instructor/today` — sessions today.

## 4) Supabase Data Model (all with tenant_id, timestamps, RLS)
### Catalog
- `programs(id, tenant_id, instructor_id, title, slug, summary, long_description_md, category, delivery_mode, session_length_min, is_multi_session, default_sessions_count, visibility, media_banner_url, thumbnail_url, tags text[], locale, is_active)`
- `program_variants(id, program_id, name, currency, price, credit_price, vat_rate, deposit_amount, pay_plan_json, sku, is_active)`
- `program_intake_forms(id, program_id, form_schema_json, is_required, gdpr_consent_required)`
- `program_milestones(id, program_id, order_idx, name, description_md, due_day_offset)`
- `program_resources(id, program_id, resource_type, resource_id, required bool)`  # room/zoom

### Booking & Delivery
- `program_bookings(id, tenant_id, program_id, variant_id, customer_id, instructor_id, status, order_id, total_price, discount_id, source, private_link_token, consent_version, timezone)`
  - status: reserved | confirmed | in_progress | completed | cancelled | on_hold
- `program_sessions(id, booking_id, ordinal, starts_at, ends_at, timezone, location_id, meeting_url, status, check_in_at, notes_private_md)`
  - status: scheduled | done | missed | rescheduled | cancelled
- `program_progress(id, booking_id, milestone_id, completed_at, notes_md, artifact_url)`
- `program_booking_answers(booking_id, form_version, answers_jsonb)`
Storage: `media-programs` (banners), `program-files` (homework). Messaging via `threads` + `thread_messages` (Community Inbox).

### Availability & Resources (reuse Appointments)
- `instructor_availability(id, instructor_id, weekday, start_time, end_time, time_zone, is_active)`
- `availability_exceptions(id, instructor_id, date, available bool, notes)`
- `resources(id, tenant_id, type, name, capacity, external_ref)`
- `blackouts(id, tenant_id, scope, starts_at, ends_at, reason)`

### Finance Links
Use shared `orders`, `order_items(type='program')`, `payments`, `refunds`, `invoices`, `earnings`.

## 5) RLS (outline)
- `programs`: public read where `visibility='public' AND is_active`; staff read within tenant; instructors update own rows; managers update all.
- `program_bookings/sessions/progress/answers`: customer = owner; instructor = matching `instructor_id`; manager/accountant per tenant; column‑level views for finance only.
- Storage: signed URLs; path prefix `tenant_id/…` enforced by policies.

## 6) RPCs / Triggers
- `reserve_program_slot(program_id, customer_id, instructor_id, starts_at, variant_id, source)`
- `confirm_program_booking(hold_id, order_id)`
- `generate_program_sessions(booking_id, cadence json)`
- `reschedule_program_session(session_id, new_start)`
- `cancel_program_booking(booking_id, cause)`
- `complete_program_milestone(booking_id, milestone_id, artifact_url, notes)`
Triggers: create DM thread on confirm; close booking when last session done; emit Realtime events on `program_sessions` and `thread_messages`.

## 7) Customer Web Portal — UX
1. **Programs directory**: cards with image, duration, from‑price, delivery, language, rating.
2. **Program page**: hero, “what you’ll get”, outcomes, instructor bio, testimonials, FAQs, policies, picker with timezone.
3. **Booking wizard**: pick time → intake (schema‑driven) → pay (card/TWINT/QR‑bill; credits if eligible) → confirmation + .ics + Zoom.
4. **Account › My Programs**: calendar of sessions; reschedule within policy; message instructor; files upload; milestone progress; invoices; add extra session.
5. **Internationalization**: de‑CH, fr‑CH (tutoiement), it‑CH, en‑CH; WCAG AA.

## 8) Admin/Instructor — UX
- **Create Wizard**: Basics → Pricing/Plans → Availability/Resources → Intake Builder → Milestones → Policies → Preview → Publish.
- **Bookings Pipeline**: filters; bulk message; export.
- **Booking Detail**: sessions list, reschedule, payments, notes, progress, docs, DM.
- **Availability**: weekly rules, buffers, exceptions, Zoom mapping.
- **Reports**: revenue by program/variant, show‑rate, reschedule rate, conversion.

## 9) Integrations
- **Finance**: orders, VAT, invoices (Swiss QR), wallets; earnings per session/%.
- **Marketing**: UTM attribution; segments; journeys (post‑session, win‑back); referrals.
- **Community Inbox**: thread per booking; email/SMS digests; moderation.
- **Analytics**: events `program_view`, `started_checkout`, `booked`; dashboards.
- **Settings**: defaults for reschedule, deposit, no‑show fees; consent versions.
- **Search/SEO**: meta schema; sitemap; OG images.

## 10) Integration Matrix (Supabase)
| Component | Tables/Views | RPCs | Storage | Realtime |
|---|---|---|---|---|
| Directory | `programs` (public view) | – | media | – |
| Program page | `programs`, `program_variants` | – | media | – |
| Booking wizard | – | reserve/confirm | – | `programs:tenant:*` |
| Account › Programs | `program_bookings`, `program_sessions`, `invoices` | reschedule/cancel | `program-files` | `program_sessions` |
| Admin editor | `programs`, `program_variants`, `program_intake_forms`, `program_milestones` | – | media | – |
| Pipeline | `program_bookings` | cancel | – | – |

## 11) Acceptance
- No double‑booking; advisory locks proven under load.
- RLS prevents cross‑tenant leakage; instructor limited to own.
- Payment plan dunning moves to `on_hold` and locks scheduling.
- Realtime updates ≤2s; all flows localized.

## 12) Seed & Test
Seed 1 tenant, 2 instructors, 2 programs (single & multi), 4 variants, availability blocks; run end‑to‑end with sandbox payments and sample intake.
