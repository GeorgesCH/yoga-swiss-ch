# Admin Shell & Supabase Integration Status — Requirements & Spec

This file defines **the shared shell** for the admin (header/footer/layout) and a **built‑in Supabase Integration Status** system that verifies each page/section/component is wired to Supabase correctly (Auth, RLS, RPC, Storage, Realtime). It’s designed to be tenant‑safe (brand ▸ studio ▸ location) and multilingual (de‑CH, fr‑CH _tu_, it‑CH, en‑CH).

---

## 1) Admin Shell (Header, Footer, Layout)

### 1.1 Header (Global Top Bar)
**Always visible.**

- **Brand switcher** (Brand ▸ Studio ▸ Location).
  - Breadcrumb style: `Brand • Studio • Location` with quick switch.
  - Permission‑aware (shows only accessible tenants).
- **Global search** (⌘/Ctrl‑K).
  - Search entities: classes, customers, instructors, orders, invoices, campaigns, products, wallets, payouts, journeys.
  - Fuzzy + scoped filters; copy deep links.
- **Locale switcher**: de‑CH / fr‑CH (_tu_) / it‑CH / en‑CH.
- **Date context** (Today: Europe/Zurich), quick time‑range switch for pages with analytics.
- **Create new** (+) menu (contextual): class, workshop, pass, membership, instructor, coupon, campaign.
- **Notifications/alerts** bell:
  - Queues stalled, webhook errors, payout mismatches, failed dunning, RLS violations, feature‑flag notices.
- **User menu** (avatar):
  - Profile, API keys (scoped), sessions/devices, impersonation (if allowed), sign out.
- **System status** chip:
  - Realtime connected / Webhooks healthy / Queue depth / DB latency (color coded).

**Accessibility**
- Keyboard first, ARIA roles, focus states, high contrast mode.
- Screen reader labels for switchers and alerts.

### 1.2 Left Navigation (Primary)
- Section groups (collapsible): **Dashboard**, **Classes**, **Shop**, **Marketing**, **Finance**, **Settings**.
- Pins/reorder per user; persisted to profile.
- Feature flags hide items user cannot access.

### 1.3 Content Frame
- Page title + **context chips** (tenant, filters, date range).
- **Tab bar** for sub‑sections (e.g., Finance → Overview / Payments / Swiss Payments / Wallets / Reports).
- Right rail (optional): help, shortcuts, recent activity.

### 1.4 Footer
- Build info: git sha, schema migration version, Supabase project ref.
- Legal links: Terms, Privacy, Imprint.
- Support: status page, docs, Slack/Email.
- Language toggle (secondary).

### 1.5 Empty/Error states
- Clear guidance, primary CTA, sample imports, and links to docs.
- Retain filters on recoverable errors.

---

## 2) Supabase Integration Status (SIS)

A first‑party **diagnostics dashboard** + **automated checks** proving each page/section/component is correctly integrated with Supabase and RLS.

### 2.1 Goals
- Detect mis‑wiring early (wrong table, missing RLS, bad RPC payload).
- Give **non‑engineers** a pass/fail heatmap per area.
- Provide **actionable remediation** (which policy, which RPC, which bucket).

### 2.2 Where it lives
- `Settings → System Health → Supabase Integration Status` (read‑only for most; editable for admins).
- Small **status chip** in the header opens the panel.

### 2.3 What it checks (high level)
- **Auth**: can current role fetch only allowed rows? session refresh works? email templates localized?
- **RLS**: policies exist and deny cross‑tenant rows; masked PII views for low roles.
- **Tables**: presence, required columns, indexes.
- **RPC/Functions**: callable with role; returns expected shape; timeouts.
- **Realtime**: subscriptions receive inserts/updates for scoped tables.
- **Storage**: buckets exist; policy checks (signed URLs / public), upload test (stub).
- **Edge Functions**: reachable; auth header handling; rate limits.
- **Webhooks**: last success, retry queue size.
- **Migrations**: local schema hash vs expected (drift detection).

### 2.4 Status badges (3 levels)
- **OK** (green): last run < 24h, all checks passed.
- **WARN** (amber): degraded (slow queries, partial locale coverage, near quota).
- **FAIL** (red): check failed; page shows limited functionality.

### 2.5 Inventory (pages & components) — Coverage Map
Use this as the canonical list the agent must keep in sync. Each item links to the test set.

#### Dashboard
- Overview KPIs
- Alerts feed
- Recent activity

#### Classes
- Class Schedule
- Booking Engine
- Advanced Scheduling
- Recurring Classes
- Registrations
- Registration System
- Cancellation & Refunds
- Locations & Resources
- Outdoor Locations
- Retreat Management

#### Shop
- Products
- Pricing & Packages
- Inventory

#### Marketing
- Campaign Management
- Customer Segments
- Analytics & Reports
- Business Growth
- Automations

#### Finance
- Finance Overview
- Payments & Billing
- Swiss Payments
- Wallet Management
- Financial Reports

#### Settings
- General Settings
- System Health
- API & Integrations
- Compliance & Legal
- Security

> The inventory should be stored in `sis_inventory` with fields: `area`, `page`, `component`, `resource_type(table|rpc|storage|realtime|edge)`, `resource_ref`, `criticality`, `owner_role`.

### 2.6 Check definitions (schema)
- `sis_checks(id, area, page, component, name, resource_type, resource_ref, expectation_json, severity)`
- `sis_runs(id, started_at, actor, environment, result(ok|warn|fail), duration_ms)`
- `sis_results(run_id, check_id, status, latency_ms, sample_count, message)`
- `sis_inventory(area, page, component, resource_type, resource_ref, criticality, owner_role)`

### 2.7 Example checks (brief)
- **Classes → Registrations → RLS**
  - Resource: `class_registrations` (table)
  - Expectation: `auth.uid()` can read only rows where `customer.user_id = auth.uid()` or instructor/business policy.
- **Finance → Swiss Payments → QR‑Bill**
  - Resource: `invoices` (RPC `generate_qr_bill`)
  - Expectation: returns PDF link; IBAN matches studio settings; QR payload validates.
- **Marketing → Journeys → Realtime**
  - Resource: `journey_nodes` channel
  - Expectation: receives insert within 3s (test insert throttled in sandbox).
- **Settings → API & Integrations → Webhooks**
  - Resource: webhook endpoint
  - Expectation: 2xx with valid signature; DLQ size < threshold.

### 2.8 Runtime behavior
- Manual run by admin; scheduled nightly runs; on‑demand for current page.
- Results cached for 24h; per‑tenant storage.
- Slack/email alerts for **FAIL** or repeated **WARN**.

### 2.9 CI enforcement
- PR must include updated `sis_inventory` when routes/components are added.
- A CI script runs **headless checks** against staging Supabase with test tenants/users:
  - users: `owner@…`, `studio_manager@…`, `front_desk@…`, `instructor@…`, `marketer@…`, `auditor@…`.
- Drift detection: compare `pg_dump --schema-only` hash to expected.

### 2.10 Minimal test SNIPPETS (pseudo‑TS)
```ts
// Auth & RLS probe (read-only sample)
const r = await supabase.from("class_registrations")
  .select("id").limit(1);
assert(!r.error, "RLS read failed");

// RPC probe with role
const { data, error } = await supabase.rpc("generate_invoice_preview", { order_id });
assert(!error && data?.pdf_url, "RPC failed");

// Realtime probe
const chan = supabase.channel("test-journeys");
let got = false;
chan.on("postgres_changes", { event: "INSERT", table: "journey_nodes" }, () => { got = true; });
await chan.subscribe();
await supabase.from("journey_nodes").insert({ /* test row */ });
await sleep(3000);
assert(got, "Realtime insert not received");
```

---

## 3) Shell ↔ SIS Integration

- Header **status chip** shows SIS summary for the active tenant (OK/WARN/FAIL); click opens drawer with failing checks.
- Page **guard** reads SIS; if hard dependency is FAIL, shows safe fallback message and docs link.
- Footer displays **migration version** and **Supabase project ref**; mismatch triggers WARN.

---

## 4) Telemetry & Privacy

- All SIS calls hit **test schemas** where possible; no customer PII needed.
- Logs go to `audit_logs` with actor, tenant, and redacted payloads.
- Rate‑limited to avoid cost spikes.

---

## 5) Acceptance Criteria (agent‑checkable)

- [ ] Header provides tenant switch, global search, locale, create menu, alerts, user menu.  
- [ ] Footer shows build info, legal links, support, migration version.  
- [ ] SIS inventory exists for every page/component in this spec.  
- [ ] Nightly SIS runs store results; header chip reflects status.  
- [ ] RLS checks prove cross‑tenant isolation for each role.  
- [ ] RPC/Realtime/Storage checks run and report latency.  
- [ ] CI fails if new pages lack SIS coverage or schema drifts.  
- [ ] All copy is localized (de‑CH, fr‑CH **tu**, it‑CH, en‑CH).

---

## 6) To‑Do (gaps to implement)
- `sis_*` tables + policies; admin UI.  
- Inventory seeding script from route manifest.  
- Role test users & fixtures per tenant.  
- Realtime sandbox tables/channels.  
- CI job for schema hash and SIS headless run.  
- Slack/email alert wiring.  
- Docs page for common failures & fixes.
