# YogaSwiss — Supabase + React / React Native

World‑class, full‑feature alternative to **Eversports**, **Mindbody**, **bsport**, and **Arketa** — optimized for Switzerland (CH) & EU. This single spec is implementation‑ready for an AI build agent and a human team. It includes: target personas, feature parity, detailed web & mobile flows, database & RLS, RPCs, storage, analytics, Swiss payments (TWINT, QR‑bill), Edge Functions, CI/CD, and acceptance criteria.

---

## 0) Product Vision & Principles
**Vision.** The operating system for yoga & wellbeing studios in Switzerland: delightful booking for students, powerful tools for studios, transparent pricing, and strict privacy.

**Pillars.**
1) Booking that never fails • 2) Pro‑grade admin • 3) Growth engine • 4) Trust & compliance (GDPR+nLPD) • 5) Performance & reliability.

**Personas.** Student, Instructor, Front‑Desk, Studio Owner/Admin, Accountant, Super‑Admin.

---

## 1) Competitive Parity & Differentiators
**Parity (must‑haves).** Marketplace search, studio pages, schedules, drop‑ins/passes/subscriptions, waitlist, cancellations/penalties, POS, multi‑location, instructor payroll, CRM/segments, automations, reports, on‑demand video, Zoom, branded apps/widgets.

**Differentiators (CH‑first).** TWINT at checkout; Swiss **QR‑bill** invoices; multilingual (FR/DE/IT/EN); CHF VAT handling; transparent marketplace fees; best‑in‑class instructor payroll & exports; open data (CSV/API); accessibility (WCAG 2.2 AA).

---

## 2) Platforms Overview
- **Web (Next.js)**: Public SEO + marketplace + full studio admin.
- **Mobile (React Native / Expo)**: Students (discovery, booking, wallet, check‑in, notifications) and **Instructor Lite** (today’s classes, rosters, check‑ins, sub requests). Role‑aware UI.

---

## 3) Roles & Access
- **Student**: discover, book, pay, manage bookings, wallet, video access.
- **Instructor**: see teaching schedule, rosters, take attendance, request subs, view earnings.
- **Front‑Desk**: calendar, quick sell, check‑in kiosk, manage waitlists.
- **Owner/Admin**: everything + finance, payroll, automations, analytics.
- **Accountant**: read‑only finance & exports.
- **Super‑Admin** (platform): tenant ops, moderation, support.

RLS enforces tenant isolation by `org_id` and user‑to‑org membership.

---

## 4) Web — Pages, Views, Interactions (SEO + Consumer)
### 4.1 Public
- **Home / Search**: location/date/style filters, map view, SEO blocks (city + style landing pages).
- **Studio page**: brand, amenities, locations switcher, instructors, reviews, schedule embed, policies, referral link.
- **Class detail**: description, level, capacity left, teacher bio, map, similar classes; **Book**.
- **Pricing**: drop‑in, packs, subscriptions, vouchers, gift cards.
- **Checkout**: Apple/Google Pay, card, **TWINT**; coupon/voucher; invoice option (B2B); confirmation + ICS.
- **Account**: profile, bookings, passes/subscriptions, invoices (PDF with **QR‑bill**), payment methods, notifications, data export/delete.

### 4.2 Web Admin (Studio)
- **Dashboard**: today’s classes, occupancy, revenue, alerts.
- **Schedule**: day/week/month; create class/workshop/course/1‑1; copy week; substitute; publish.
- **Classes/Products**: templates, categories, images; passes, subscriptions, coupons, vouchers, gift cards.
- **Registrations**: roster, waitlist FIFO, check‑in, bulk actions, messages.
- **Customers (CRM)**: profiles, tags/segments, notes, consent, imports/exports.
- **Instructors/Staff**: roles/permissions, availability, substitution workflow, rates.
- **Finance**: orders, transactions, settlements, payouts, refunds, invoices; tax rates; **QR‑bill** generator.
- **Automations/Comms**: emails/SMS/WhatsApp, triggers (reminder, winback, post‑class), templates, two‑way inbox.
- **Videos**: library, access rules, pay‑per‑view vs membership, thumbnails, CDN URLs.
- **Reports**: revenue/attendance/LTV/churn/payroll; CSV exports; scheduled email reports.
- **Settings**: branding, domains, languages, payment provider, policies, webhooks, feature flags.

### 4.3 Super‑Admin (Platform)
- Tenants list, billing, abuse/moderation queue, data tools, support console.

---

## 5) Mobile — Screens & Flows
### 5.1 Student
- **Onboarding/Auth**: email/phone + social; locale; consent.
- **Discover**: nearby/soonest; filters; favorites; deep links.
- **Class**: quick detail → **2‑tap booking** (saved method or pass); upsell packs/subscriptions.
- **Wallet**: passes (credits + expiry), subscriptions, vouchers, gift cards.
- **My schedule**: upcoming/past; cancel; add to calendar; join livestream.
- **Notifications**: reminders, waitlist in, instructor change, receipts.
- **Self check‑in**: geofence or QR scan; offline fallback.
- **Video**: on‑demand player; DRM’d signed URLs; resume playback.
- **Profile**: info, methods, language, notification prefs, privacy, data export.

### 5.2 Instructor Lite
- **Today**: classes teaching, quick stats.
- **Roster**: check‑in / no‑show; notes; first‑timer flag.
- **Schedule**: week list; request substitute.
- **Messages**: optional class broadcast.
- **My stats**: taught count; estimated earnings (if enabled).
- **Security**: faceID/PIN for staff mode.

---

## 6) Data Model (Supabase / Postgres)
> All tables: `id uuid pk`, `created_at timestamptz default now()`, `updated_at timestamptz` via trigger. Partition big tables (occurrences, events) monthly. Enums explicit.

**Tenancy**
- `organizations` (slug, currency='CHF', vat_number, brand, features jsonb, owner_id)
- `memberships` (user_id, org_id, role enum: owner/admin/manager/instructor/staff/accountant/support, status)

**Identity & CRM**
- `user_profiles` (id=auth.users.id, display_name, avatar_url, locale, default_org_id, tz, marketing_opt_in)
- `customers` (user_id?, email, first/last, phone, address jsonb, notes, consent_marketing, consent_whatsapp)
- `customer_orgs` (customer_id, org_id, tags text[], source, gdpr_status, blocked)

**Catalog & Scheduling**
- `class_templates` (org_id, name, description, duration_min, level, category, image, default_price, max_participants, is_active)
- `class_instances` (org_id, template_id, instructor_id, location_id?, virtual_platform_id?, start_date, start_time, end_time, capacity, is_recurring, recurrence_rule text RFC5545, recurrence_until date, notes)
- `class_occurrences` (org_id, instance_id, start_at timestamptz, end_at timestamptz, status enum, slug unique, is_public bool, room, language)
- `waitlists` (occurrence_id, customer_id, joined_at, position, status: waiting/offered/expired/enrolled)
- `attendance` (occurrence_id, customer_id, check_in_at, status: present/no_show/late_cancel, by_staff_id)
- `substitutions` (occurrence_id, original_instructor_id, substitute_instructor_id, approved_by_id, reason)
- `locations` (org_id, address fields, geo, rooms jsonb)
- `virtual_platforms` (org_id, type: zoom/meet/teams/other, url, meeting_id, passcode)

**Commerce & Wallets**
- `products` (org_id, type: dropin/pass/subscription/event/retreat/gift_card/bundle, title, image, description, is_active)
- `prices` (product_id, currency, unit_amount, billing_cycle?, trial_days, vat_rate_id, sale_window)
- `orders` (org_id, customer_id, totals, status, external_ref, metadata)
- `order_items` (order_id, product_id, occurrence_id?, qty, unit_amount, tax_amount, discount_amount, grant_credits int)
- `wallets` (org_id, customer_id, balance_money, credits, credits_expires_at, last_activity_at)
- `transactions` (order_id, org_id, customer_id, amount, currency, method: card/twint/cash/wallet/gift/refund, status, processor_id, idempotency_key, is_marketplace, fee_amount)
- `invoices` (org_id, invoice_number, customer_id, order_id, due_date, status, pdf_url, **qr_bill_payload** text)
- `refunds` (transaction_id, amount, reason, processed_at, status)
- `tax_rates` (org_id, name, rate)
- `payout_accounts` (org_id, provider: stripe_connect/datatrans/wallee, account_id, status, default)

**Messaging & Automation**
- `communications` (org_id, type: email/whatsapp/push, to_customer_id, subject, body, template_key, data jsonb, status, external_id, sent_at, error)
- `notification_preferences` (user_id, type, email_enabled, push_enabled, whatsapp_enabled, quiet_hours jsonb)
- `automations` (org_id, trigger: signup/first_booking/class_reminder/winback/abandoned_cart/post_class_survey, filter jsonb, template_key, delay)
- `webhooks` (org_id, destination_url, events text[], secret, status, last_delivery_at)

**Audit & Analytics**
- `events` (org_id?, actor_user_id, verb, entity_table, entity_id, data jsonb) — append‑only.
- Materialized views for KPIs: revenue_daily, bookings_daily, LTV, churn, instructor_payouts.

---

## 7) RLS Policies (Patterns + SQL)
- On `*` with `org_id`: `USING (exists(select 1 from memberships m where m.org_id = org_id and m.user_id = auth.uid()))`.
- Student self‑access via join to `customers.user_id = auth.uid()`.
- Public discovery via `view public_occurrences` exposing limited columns where `is_public=true`.

**Policies module** (`supabase/04_policies.sql`) — implemented:
```sql
create or replace function is_member(p_org uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from memberships m
    where m.org_id = p_org and m.user_id = auth.uid()
  );
$$;

-- Customers
create policy customer_self_select on customers for select using (auth.uid() = user_id);
create policy customer_self_update on customers for update using (auth.uid() = user_id);

-- Instructors
create policy instructor_self on instructors for all using (auth.uid() = user_id);

-- Orgs
create policy business_owner_manage on organizations for all using (owner_id = auth.uid());

-- Classes
create policy classes_manage on class_templates for all using (is_member(org_id));
create policy occurrences_view on class_occurrences for select using (true);

-- Registrations
create policy reg_customer on registrations for select using (
  customer_id in (select id from customers where user_id = auth.uid())
);
create policy reg_org_manage on registrations for all using (
  is_member((select org_id from class_occurrences co
             join class_instances ci on co.instance_id = ci.id
             join class_templates ct on ci.template_id = ct.id
             where co.id = registrations.occurrence_id))
);

-- Orders & Wallets
create policy orders_customer on orders for select using (
  customer_id in (select id from customers where user_id = auth.uid())
);
create policy orders_org_manage on orders for all using (is_member(org_id));
create policy wallets_customer on wallets for select using (
  customer_id in (select id from customers where user_id = auth.uid())
);
create policy wallets_org_manage on wallets for all using (is_member(org_id));
```

---

## 8) RPCs (Business Logic)
**RPCs module** (`supabase/05_rpcs.sql`) — starter functions:
```sql
-- Book occurrence (extend with entitlement)
create or replace function book_occurrence(p_occurrence uuid)
returns uuid language plpgsql as $$
declare v_cust uuid; v_reg uuid; v_org uuid; begin
  select id into v_cust from customers where user_id = auth.uid();
  if not found then raise exception 'No customer profile'; end if;

  select ct.org_id into v_org
  from class_occurrences co
  join class_instances ci on co.instance_id = ci.id
  join class_templates ct on ci.template_id = ct.id
  where co.id = p_occurrence;

  -- TODO entitlement: subscription/credits/wallet

  insert into registrations(occurrence_id, customer_id, status, payment_status)
  values (p_occurrence, v_cust, 'confirmed','pending')
  returning id into v_reg;
  return v_reg;
end $$;

-- Cancel with policy hooks
create or replace function cancel_registration(p_reg uuid)
returns boolean language plpgsql as $$
declare v_occ timestamptz; v_cust uuid; begin
  select co.start_at, r.customer_id into v_occ, v_cust
  from registrations r join class_occurrences co on r.occurrence_id = co.id
  where r.id = p_reg;

  if v_cust not in (select id from customers where user_id = auth.uid()) then
    raise exception 'Not allowed'; end if;

  update registrations set status='cancelled' where id=p_reg;
  -- TODO: apply late cancel penalty
  return true;
end $$;

-- Wallet credit
create or replace function wallet_credit(p_org uuid, amount decimal)
returns boolean language plpgsql as $$
declare v_cust uuid; begin
  select id into v_cust from customers where user_id = auth.uid();
  update wallets set balance_money = balance_money + amount
  where customer_id = v_cust and org_id = p_org;
  return true;
end $$;
```

**Next RPCs (to add)**
- `book_with_entitlement(occurrence_id, payment_intent_id?)` – atomic: reserve seat → charge or debit credits → finalize registration → emit event.
- `promote_from_waitlist(occurrence_id)` – FIFO with expiry window.
- `apply_policy(registration_id, kind: late_cancel|no_show)` – compute penalty and create transaction/refund.
- `grant_pass(customer_id, product_id)` – admin.
- `search_public_occurrences(q text, from, to, filters jsonb)` – FTS + trgm.

---

## 9) Storage & Policies
**Buckets**: `public-assets`, `private-assets`, `videos` — path prefix `{org_id}/...`.

**Storage policies module** (`supabase/06_storage_policies.sql`) — implemented:
```sql
create or replace function path_org(path text)
returns uuid language sql immutable as $$
  select nullif(split_part(path, '/', 1), '')::uuid;
$$;

create policy storage_public_read on storage.objects for select using (bucket_id='public-assets');
create policy storage_public_write on storage.objects for all using (
  bucket_id='public-assets' and is_member(path_org(name))
);

create policy storage_private_rw on storage.objects for all using (
  bucket_id='private-assets' and is_member(path_org(name))
);

create policy storage_videos_rw on storage.objects for all using (
  bucket_id='videos' and is_member(path_org(name))
);
```

Signed URLs for private/videos; CDN cache headers; image sizing via transformations.

---

## 10) Analytics & Reporting
**Materialized views** (`supabase/07_analytics_views.sql`) — starter:
```sql
create materialized view if not exists mv_revenue_daily as
select org_id, date_trunc('day', created_at) as day, sum(amount) as revenue
from transactions where status='paid'
group by 1,2;

create or replace function refresh_analytics()
returns void language plpgsql as $$
begin
  refresh materialized view concurrently mv_revenue_daily;
end $$;

select cron.schedule('analytics-refresh','5 2 * * *', $$ select refresh_analytics(); $$);
```

**Planned views**: occupancy by class/time, funnel (views→add‑to‑cart→paid), cohorts (first booking month), churn (subscription), instructor payouts.

---

## 11) Swiss Payments & Invoicing
- **Stripe** for cards + Apple/Google Pay; **TWINT** via Stripe plugin or Datatrans/Wallee Edge integration.
- **Stripe Connect** for marketplace payouts (studio bank accounts).
- **Swiss QR‑bill**: Edge Function creates PDF (SwissQR payload + QR image), stores to `invoices.pdf_url`.
- **SEPA** optional for EU subscriptions.

**Edge Functions**
- `/payments/stripe/webhook` – verify signature, fulfill orders, grant entitlements, send receipts.
- `/payments/twint/webhook` – if direct provider.
- `/invoices/pdf` – generate **QR‑bill** PDF.
- `/calendar/ics/:token` – personal & class feeds.

---

## 12) Messaging, Automations & AI Assistant
- **Comms**: Email (Brevo/Resend), SMS/WhatsApp (Meta Cloud API), Push (Expo). Templates: MJML/Handlebars.
- **Automations**: declarative rows `(trigger, filter, template, delay)` executed by worker + pg_cron, emitting communications.
- **AI Assistant (optional v2)**: chat widget + WhatsApp; trained on studio schedule, pricing, FAQs; can answer and **book/waitlist**. Admin can tune tone of voice.

---

## 13) Search & SEO
- FTS with `pg_trgm`; geo filters; cached SSR pages for city/style; schema.org markup; Open Graph.
- Reserve with Google deep links.

---

## 14) CI/CD & Quality
- Monorepo (Turborepo + pnpm): `web`, `mobile`, `edge`, `db`, `ui`, `types`.
- Types from DB: `supabase gen types typescript` → shared package.
- Tests: Vitest/Jest, Playwright (web), Detox (mobile), pgTAP optional (RPCs).
- Sentry + OpenTelemetry traces; PostHog product analytics.
- Environments: dev → staging → prod. Seed & snapshot scripts.

---

## 15) Task Lists (Implementation‑Ready for AI Agents)
### 15.1 Web – Public/SEO
1. Scaffold Next.js app router, i18n (FR/DE/IT/EN), Tailwind + shadcn.
2. Build **Search** page (filters + map) with SSR + ISR; FTS RPC; URL‑encoded filters.
3. Build **Studio** page (tabs: About, Schedule, Instructors, Pricing, Reviews; SEO metadata).
4. Build **Class detail** with similar classes; server actions to create checkout session.
5. Implement **Checkout**: Stripe + Apple/Google Pay + **TWINT**; vouchers/coupons; receipts + ICS.
6. Account area: bookings, passes/subscriptions, invoices (download **QR‑bill** PDFs), methods, preferences.
7. Reviews: post‑class prompt + moderation.

### 15.2 Web – Admin
1. Dashboard widgets (today, occupancy, revenue, alerts) using MV + TanStack Query.
2. Calendar CRUD: create templates/instances; recurrence RRULE; substitutes; copy week; publish.
3. Registrations & waitlists: roster view; FIFO; manual/auto promote; bulk messages.
4. Products & pricing: passes/subscriptions/gift cards; coupons/vouchers; constraints.
5. CRM: profiles, tags, segments, imports/exports; consent log; GDPR tools.
6. Finance: orders/transactions/refunds; payouts; tax rates; invoice UI; QR‑bill trigger.
7. Automations: builder UI (trigger/filter/template/delay); logs; test send; throttling.
8. Videos: upload to `videos` bucket; signed URLs; access rules; analytics (views).
9. Settings: branding, domain, languages, policies, webhooks; Connect onboarding.

### 15.3 Mobile – Student
1. Expo app scaffold; auth; deep links; push.
2. Discover & schedule list with fast cache; pull‑to‑refresh.
3. 2‑tap booking & Apple/Google Pay; passes/subscription upsell.
4. My Schedule + cancellations + add to calendar; waitlist join/accept.
5. Wallet (passes, credits, vouchers) + reminders.
6. Self check‑in (geofence + QR); offline queue.
7. Video player with signed URLs; background audio; resume.

### 15.4 Mobile – Instructor Lite
1. Role switch; secure staff session (biometric/PIN).
2. Today & roster; check‑ins/no‑shows; quick notes; offline sync.
3. Sub request flow; notifications for changes.
4. My stats (optional earnings).

### 15.5 Edge & Integrations
1. Stripe/TWINT webhooks → fulfill order → grant entitlements → events.
2. QR‑bill PDF function; storage upload; attach to invoice.
3. ICS feeds (user + class) with signed tokens.
4. Zoom integration: create/join links on registration; hide link until booked.
5. Reserve with Google feed.

### 15.6 DB & Ops
1. Create schemas, enums, tables with indexes & partitions.
2. Enable RLS; apply policies module.
3. Implement RPCs: booking, cancel + penalties, waitlist promotion, search.
4. Materialized views & cron refresh; CSV exports.
5. Backups (PITR + nightly logical dump to S3); disaster recovery runbook.

---

## 16) Acceptance Criteria (Samples)
- **Booking SLA**: p95 < 500ms from CH/EU edge; 2‑tap mobile flow completes in < 10s including payment.
- **Waitlist**: when seat frees, first in queue auto‑enrolled (or notified) within 60s; audit trail recorded.
- **Policies**: late cancel/no‑show penalties applied correctly per org rules; emails sent; refunds/charges reconcile.
- **Payments**: TWINT and Apple/Google Pay succeed on real devices; receipts delivered; invoices carry valid **QR‑bill**.
- **RLS**: tenant leakage tests pass; public view exposes only allowed columns.
- **Accessibility**: key flows WCAG 2.2 AA; keyboard + screen reader happy path verified.

---

## 17) Included SQL Modules (ready to run)
- `04_policies.sql` — policies & helpers (included above).
- `05_rpcs.sql` — booking/cancel/wallet (included above) + placeholders for entitlement/waitlist/penalties.
- `06_storage_policies.sql` — buckets & path security (included above).
- `07_analytics_views.sql` — revenue MV + cron (included above).

**Next modules to add**
- `08_edge_invoices` — Swiss QR‑bill PDF generator.
- `09_edge_calendar` — ICS feeds for users/classes.
- `10_search_indices` — FTS + trgm + geo indices.
- `11_reports` — views for dashboards (occupancy, cohorts, churn, instructor_payouts).

---

## 18) Roadmap Phases
- **P0 Foundations (2–3w)**: Tenancy, auth, RLS, orgs/memberships, schedule core, Stripe + TWINT basics.
- **P1 Booking & Wallet (3–4w)**: Recurrence, occurrences, registrations, passes/subscriptions, waitlist, policies, reminders.
- **P2 Commerce & CRM (3–4w)**: Coupons/vouchers/gifts, CRM/segments, automations, invoices + QR‑bill, videos.
- **P3 Analytics & Marketplace (3–4w)**: Dashboards, exports, marketplace SEO pages, Stripe Connect payouts.
- **P4 Mobile polish & AI (ongoing)**: Offline, deep links, app stores, AI assistant beta.

---

## 19) Notes
This spec is intentionally explicit so an AI agent can execute tasks in order with minimal clarification while following best practices for Supabase, Next.js, and Expo.



---

## 20) Dashboard Specifications (Admin, Studio, Instructor, Onboarding)
This section defines **complete, implementation‑ready specs** for all dashboards across Web (admin/studio/front‑desk) and Mobile (instructor lite), plus the **Onboarding dashboard**. It covers widgets, interactions, drill‑downs, data sources, refresh semantics, RLS constraints, empty states, and acceptance criteria.

### 20.1 Shared Dashboard Framework
**Purpose.** Provide a consistent shell for role‑aware dashboards with fast loading, saved views, and drill‑downs.

**UI shell & layout**
- Header: org switcher, location selector, date range picker (Today, 7/30/90 days, custom), search.
- Left nav: Overview, Schedule, Registrations, Products, Customers, Finance, Marketing, Reports, Settings.
- Content: responsive grid of **widgets** (cards and charts). Drag to reorder, resize (1x,2x,3x). Save as **View** per user.
- Top alerts bar: payments webhook failures, payout issues, data import errors.

**Global interactions**
- **Filters**: org, locations[], instructors[], product types, channels (in‑person/online), tags.
- **Saved views**: per‑user presets (JSON in `user_profiles` → `dashboard_views` jsonb).
- **Drill‑downs**: click any number → opens context drawer or routes to filtered page (e.g., Finance › Orders with same filters).
- **Real‑time**: Supabase Realtime for occurrence seats left, check‑ins, new orders.
- **Refresh**: auto every 60s for “Today” metrics; historical widgets query MV refreshed by `pg_cron`.
- **Perf**: p95 < 400 ms for widget queries with indexes/MVs; lazy‑load below fold; skeletons + optimistic updates.
- **i18n & a11y**: FR/DE/IT/EN strings; charts include accessible labels; keyboard nav.

**Widget types**
- **KPI card** (delta vs prior period).
- **Timeseries** (area/line) with brush.
- **Category bar** (top 10 by revenue/attendance).
- **Table** with sort/paginate and CSV export.
- **Funnel** (views → add‑to‑cart → pay → attended).
- **Map** (by location demand) optional.

**Data sources** (examples; more in §20.6)
- `mv_revenue_daily`, `mv_bookings_daily`, `mv_occupancy_daily`, `mv_new_customers`, `mv_instructor_payouts`.
- Live tables joined for “today”: `transactions`, `registrations`, `attendance`, `class_occurrences`.

---

### 20.2 Studio Owner / Admin Dashboard (Web)
**Audience.** Org owner, admin, manager. Full control. Location filter defaults to “All locations”.

#### 20.2.1 Top KPIs row
- **Today’s revenue (CHF)** — sum paid `transactions` today, net & gross with fees tooltip.
- **Bookings today** — count confirmed `registrations` with occurrence today.
- **Occupancy today** — (checked‑in + confirmed) / capacity across today’s occurrences.
- **New customers** — distinct first‑time purchasers today (`orders` where first order flag). 
- **Late cancels / no‑shows** — counts today with policy type.
- **Pending payouts** — next Stripe/Datatrans payout estimate; warning if delayed.

_Interactions_: click → opens Finance/Registrations views filtered to today.

#### 20.2.2 Today at a glance (composite)
- **Upcoming classes** (next 8 hours): list with start time, teacher, capacity left, waitlist length, livestream badge.
- Row actions: **Open roster**, **Message attendees**, **Substitute**, **Check‑in kiosk**.
- **Waitlist queue**: per class top 5 with auto‑promote status; action **Promote now**/**Notify**.
- **Alerts**: payment webhook failures, Zoom link missing, overbook warnings.

#### 20.2.3 Revenue & Bookings (trend)
- **Revenue timeseries** (last 30/90 days) stacked by channel (online/in‑person/marketplace).
- **Bookings timeseries** stacked by product type (drop‑in/pass/subscription/event).
- **MRR** widget (if subscriptions enabled): current MRR, new, churned, expansion.

#### 20.2.4 Products & Sales performance
- **Top products** (bar): revenue and units; click → product detail.
- **Coupon effectiveness**: redemptions, lift vs baseline.
- **Gift card liability**: outstanding value by expiry month.

#### 20.2.5 Customers & Growth
- **New vs returning** bookings chart.
- **Segments** table: e.g., first‑timers this month, at‑risk (no visit 60d), high‑value (LTV>500 CHF). Quick actions: **Send campaign**, **Export CSV**.
- **NPS / Reviews** snippets with moderation shortcuts.

#### 20.2.6 Staff & Payroll
- **Instructor hours & headcount** in period; payout estimate by rule (per class/per head/rev share).
- **Substitution activity**: outstanding requests, average time to fill.

#### 20.2.7 Operations & Compliance
- **Capacity & occupancy heatmap** by hour/day.
- **Policy outcomes**: late cancel/no‑show rate by template and by instructor.
- **Data health**: missing tax rates, orphan products, unpriced templates, invalid VAT.

**Empty states**: show guided checklists (e.g., “No classes today — create your first class”).

**Errors**: red banner with retry; widget‑level error details with correlation ID (Sentry).

---

### 20.3 Front‑Desk Dashboard (Web, Kiosk‑friendly)
**Audience.** Receptionists and studio helpers. Minimal clicks, large touch targets. Optional **Kiosk mode** (fullscreen, PIN‑lock).

**Primary widgets**
- **Now & Next classes** (15‑minute window): tap into **Roster**.
- **Check‑in panel**: search by name/QR scan → mark present; handle walk‑ins.
- **Quick sell**: Drop‑in / Pass / Membership / Gift card; apply coupon; accept **TWINT**, card, cash.
- **Waitlist monitor**: seats freed; action **Promote**/**Notify**.
- **Issues**: unpaid bookings, required waivers, first‑timer alerts.

**Flows**
- **Walk‑in sale + check‑in**: create customer → sell product → auto register to class → mark present.
- **Refund or exchange**: open last order → refund → return credits or money depending on policy.
- **QR poster**: scan to self check‑in; front‑desk sees instant confirmation via Realtime.

**Performance**: all actions p95 < 300 ms; offline note buffer if network flaky.

---

### 20.4 Instructor Dashboard (Web) & Instructor Lite (Mobile)
**Audience.** Teachers; limited finance visibility (only their classes, optionally their payouts).

**Widgets**
- **Today’s classes**: start time, location, roster count, capacity left, livestream.
- **Next class card** pinned with countdown and quick actions.
- **Roster & Attendance**: mark present/no‑show; add notes (injury, first timer); export roster.
- **Messages**: send announcement to booked attendees (email/push) with templates.
- **My schedule** week view with sub request; status of past requests.
- **Earnings** (if enabled): classes taught, estimated payout; export period PDF.
- **Ratings/feedback** (optional): latest comments post‑class.

**Actions**
- Start class → opens roster in check‑in mode.
- Close class → finalizes attendance; triggers post‑class automation.
- Request sub → select reason and candidate; notify manager.

**Mobile specifics**
- Offline queue for check‑ins; biometric lock for staff mode; quick swipe actions.

---

### 20.5 Onboarding Dashboard (Studio & Instructor)
**Goal.** Guide new orgs/teachers from zero to first booking & payout in < 1 day.

**Checklist (Studio)**
1. **Create organization** (name, currency CHF, languages).
2. **Connect payments** (Stripe Connect; optional Datatrans/Wallee for TWINT). Status card shows verification/KYC.
3. **Add locations** (address, capacity, rooms); verify map pin.
4. **Invite staff & instructors** (roles, permissions).
5. **Set policies** (cancellation window, late/no‑show fees, waitlist rules).
6. **Create products** (drop‑in, pass, membership, gift card, vouchers; tax rates).
7. **Create class templates** (duration, level, image, price default).
8. **Schedule first week** (recurrence, instructors, rooms; publish).
9. **Embed & links** (booking widget code, deep links, Google Reserve feed toggle).
10. **Automations** (reminders, first‑timer welcome, review prompts).
11. **Import customers** (CSV wizard; dedupe; consent mapping).
12. **Test checkout** (sandbox; Apple/Google Pay; **TWINT** test if configured).

**Checklist (Instructor only)**
- Complete profile, bio, photo; connect to studio; set availability; accept policies; app install + push enabled.

**Progress tracking**
- Progress ring with % complete; each item stores state in `onboarding_steps` jsonb per org/instructor; context help tooltips; quick actions.

**Sample data**
- “Create sample week” generator for demos; easily purge later.

**Exit criteria**
- Payment account enabled; at least 1 public class published; successful test booking; first payout date calculated.

---

### 20.6 Data & Query Contracts (per Widget)
Below are representative SQL/MV sources. All queries must include `org_id` filter and optional `location_id[]`, time window, and role checks via RLS.

**Today’s revenue**
```sql
select coalesce(sum(amount),0) as revenue
from transactions
where org_id = $1 and status='paid' and created_at >= date_trunc('day', now() at time zone $tz);
```

**Bookings today**
```sql
select count(*)
from registrations r
join class_occurrences co on co.id = r.occurrence_id
where co.org_id=$1 and r.status='confirmed'
  and co.start_at::date = (now() at time zone $tz)::date;
```

**Occupancy today**
```sql
select
  sum(least(coalesce(reg.confirmed,0), co.capacity))::int as booked,
  sum(co.capacity)::int as capacity
from class_occurrences co
left join (
  select occurrence_id, count(*) as confirmed
  from registrations where status='confirmed'
  group by 1
) reg on reg.occurrence_id = co.id
where co.org_id=$1 and co.start_at::date = (now() at time zone $tz)::date;
```

**Waitlist**
```sql
select occurrence_id, count(*) filter (where status='waiting') as waiting,
       min(position) as next_position
from waitlists wl
join class_occurrences co on co.id = wl.occurrence_id
where co.org_id=$1 and co.start_at >= now() - interval '2 hours'
  and co.start_at < now() + interval '1 day'
group by 1 order by min(position);
```

**Revenue timeseries (MV)**
```sql
create materialized view if not exists mv_revenue_daily as
select org_id, date_trunc('day', created_at) as day, sum(amount) as revenue
from transactions where status='paid'
group by 1,2;
```
Refresh: `cron.schedule('analytics-refresh','5 2 * * *', $$ select refresh_analytics(); $$);`

**Instructor payout estimate**
Use `mv_instructor_payouts` (sum by rule). Drill‑down to per‑class report.

**Data health**
Query for null tax rates, products without prices, templates without schedules.

---

### 20.7 Notifications, Jobs & Realtime
- Realtime channels: `occurrence:{id}` for roster/attendance, `org:{id}:orders` for new orders.
- Jobs: `pg_cron` for MV refresh; Edge webhooks for Stripe/TWINT; nightly **occurrence extension**; **waitlist auto‑promote** worker.
- Alerts pipeline: failures in webhooks create `communications` to admins; dashboard alerts stream.

---

### 20.8 Access Control & Audit
- All dashboard reads pass through RLS helpers (`is_member(org_id)`); instructors see only occurrences where they teach.
- Impersonation for support recorded in `events` table with reason.

---

### 20.9 Dashboard QA & Acceptance Criteria
- **KPI accuracy**: sums reconcile with Finance › Transactions for same filters.
- **Drill‑down consistency**: navigating from a widget preserves filters and dates.
- **Realtime**: new paid order increments KPIs within 5s; check‑in shows on other clients within 2s.
- **Permissions**: instructor cannot view org‑wide revenue; front‑desk cannot export customer list.
- **Performance**: First Contentful Paint < 2s on typical admin laptop; widget p95 < 400 ms.
- **i18n**: all labels and currency/number formats match locale.

---

### 20.10 Implementation Tasks (AI‑agent ready)
1. **Create dashboard shell** (Next.js): header filters, widget grid, saved views; store in `user_profiles.dashboard_views`.
2. **Build KPI widgets**: Today’s revenue/bookings/occupancy/new customers/penalties/payouts with Realtime increments.
3. **Today composite**: upcoming classes list, waitlist module, alerts; actions wired to routes.
4. **Trends**: revenue & bookings timeseries via MVs; MRR if subscriptions enabled.
5. **Products & sales**: top products table; coupons panel; gift‑card liability calc.
6. **Customers & growth**: new vs returning chart; segments table with bulk actions.
7. **Staff & payroll**: instructor hours/payout estimate views; substitution board.
8. **Operations**: occupancy heatmap; policy outcomes; data health checks.
9. **Front‑desk mode**: kiosk style, QR scanner, quick sell, walk‑in flow; offline notes.
10. **Instructor dashboard** (web) and **mobile lite**: today/roster/attendance/messaging/stats.
11. **Onboarding dashboard**: checklist engine; progress jsonb; sample data generator; exit checks.
12. **Testing**: Playwright for UI flows; pgTAP for MVs/RPC correctness; load tests for “Today” queries.
13. **Monitoring**: Sentry span names per widget; PostHog events for interactions; uptime alerts for webhooks.

