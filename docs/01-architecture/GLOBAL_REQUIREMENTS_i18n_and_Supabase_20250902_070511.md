# Global Requirements — 4‑Language (Swiss) + Full Supabase Connectivity

**Instruction for the AI agent:** implement **complete Swiss localization** and **end‑to‑end Supabase wiring** for web + mobile. This is **mandatory** and blocking for release.

---

## 1) Languages & Locales (Switzerland)

### 1.1 Locales (must be these exact tags)
- **de‑CH** — Swiss German (informal **du** tone; Swiss formats)
- **fr‑CH** — Swiss French (**use “tu”** everywhere; never “vous”)
- **it‑CH** — Swiss Italian (informal **tu**)
- **en‑CH** — English with Swiss number/date/currency formats

**Optional dialect:** `gsw` (Schwiizerdütsch) for short UI strings only; fallback to **de‑CH** per key.

### 1.2 Formatting & tone
- Currency: `Intl.NumberFormat('<locale>', { style:'currency', currency:'CHF' })` → **CHF 1’234.50** (apostrophe thousands).
- Date/Time: `Intl.DateTimeFormat('<locale>', { timeZone:'Europe/Zurich' })`.
- Plurals/lists: ICU messages (no manual concatenation).
- **Tone rules:** keep friendly, direct; FR must always be **tu**; DE/IT informal (*du/tu*).
- Inputs: Swiss phone, postcode, address validation.

### 1.3 i18n implementation
- Choose one: **i18next**, **@lingui**, or **next‑intl** (App Router).
- Files: `/locales/{de-CH|fr-CH|it-CH|en-CH}/*.json`.
- Keys: `auth.login.cta`, `checkout.pay_with_twint`, `classes.next_session_on`, etc.
- Routing & SEO: locale prefixes (`/de-ch`, `/fr-ch`, `/it-ch`, `/en-ch`), **hreflang** + x‑default, localized meta/og.
- QA: no hardcoded strings; screenshots per locale for Home, Search, Class, Checkout, Account; visual regression on FR/DE expansion.

---

## 2) Supabase — Auth, DB, RLS, Storage, Realtime

### 2.1 Client configuration
- Web & mobile use `@supabase/supabase-js` singletons.
- Env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **Server only**: `SUPABASE_SERVICE_ROLE_KEY` (never shipped to clients).
- Auth redirect URLs configured for web & deep links for mobile.

### 2.2 Auth & roles
- Email+password + magic links (optional providers later).
- On signup, create `user_profiles` and **org membership** in `org_users` with role:
  - `customer`, `instructor`, `manager` (studio), `owner` (brand/studio), `front_desk`, `accountant`, `marketer`.
- Session persistence (web) and token refresh (mobile).

### 2.3 Database & RLS
- Tables per existing specs: **orgs (brand/studio)**, **locations**, **classes/occurrences**, **registrations**, **wallets/passes/packages**, **orders/payments/refunds/invoices**, **marketing**, **videos**, etc.
- **Enable RLS everywhere**. Policies:
  - Customers: self read/update; studio staff by `org_id` scope.
  - Instructors: masked rosters by default; explicit unmask permission.
  - Finance: managers/accountants only.
  - Sensitive PII (medical/dietary in retreats): lead/ops only, audited.
- Critical writes via **RPCs** (idempotent; audited).

### 2.4 Storage
- Buckets: `avatars/`, `brand-logos/`, `class-images/`, `documents/`, `videos/`.
- Public for marketing assets; signed URLs for private files.
- Size/type validation on upload.

### 2.5 Realtime & jobs
- Realtime channels: schedule/registrations/waitlist.
- Cron/Edge functions: pass expiry, membership dunning, payout imports, reconciliation, analytics MV refresh.

---

## 3) Seeded Tenants & Test Accounts (Non‑Prod)

### 3.1 Orgs & locations
- **Brand**: YogaSwiss Brand (`brand_demo`)
- **Studios**:  
  - Zurich Flow Studio (`studio_zrh`) → Locations: *Kreis 6*, *Outdoor — Seefeld Park (with indoor backup)*  
  - Geneva Calm Studio (`studio_ge`)

### 3.2 Users & roles (Supabase Auth)
- Brand Owner — `owner@yogaswiss-demo.ch` / `Demo!Owner2025`
- Studio Manager (Zurich) — `manager.zrh@yogaswiss-demo.ch` / `Demo!Mgr2025`
- Instructor — `instructor@yogaswiss-demo.ch` / `Demo!Teach2025`
- Front Desk (Zurich) — `frontdesk.zrh@yogaswiss-demo.ch` / `Demo!FD2025`
- Accountant (Brand) — `accounting@yogaswiss-demo.ch` / `Demo!Acct2025`
- Customer — `customer@yogaswiss-demo.ch` / `Demo!Cust2025`

> Enforce 2FA on Owner/Manager where supported.

### 3.3 Catalog & schedule
- Services: *Vinyasa 60*, *Yin 75*, *Private 60*, *Workshop: Backbends*.
- Recurring series (12 weeks) + waitlist.
- Outdoor sample with backup room and weather toggle.

### 3.4 Wallets & passes
- Customer wallets in both studios; **5 credits** seeded in Zurich.
- Products: **Pack 10**, **Membership Unlimited Monthly**, **Gift Card CHF 100**; create one **pass** per relevant purchase.

### 3.5 Finance
- Stripe **test mode**, TWINT **sandbox**, invoice with **Swiss QR‑bill**.
- Seed at least 3 orders (drop‑in, pack, membership) and 1 **partial refund**.
- Include a sample payout import and successful reconciliation.

### 3.6 Seed command
- `npm run seed:demo` → idempotent; creates orgs, users, data. Separate `dev` vs `stage` seeds.

---

## 4) Work Orders (Definition of Done)

**WO‑1 — i18n wiring**: replace strings, add keys in 4 locales (+ optional `gsw`), routing + hreflang, screenshots per locale.  
**Done when**: no hardcoded strings; Lighthouse SEO/Internationalization pass; currency/date formatting correct.

**WO‑2 — Auth & RLS**: login/logout/reset, first‑login provisioning, route guards, RLS policies validated.  
**Done when**: each test user sees only scoped data; forbidden paths return 403; audits written.

**WO‑3 — Seed & reset**: idempotent seeds; one command to bootstrap demo.  
**Done when**: clean environment usable after `seed:demo`.

**WO‑4 — Payments**: Stripe test + TWINT sandbox + QR‑bill invoices; refund and credit notes.  
**Done when**: happy and unhappy paths succeed; reconciliation totals match providers.

**WO‑5 — Realtime & jobs**: waitlist promotion, expiry, dunning.  
**Done when**: events propagate; notifications sent; logs visible.

---

## 5) Acceptance Criteria

- Full site available in **de‑CH, fr‑CH (tu), it‑CH, en‑CH** with correct **CHF 1’234.50** formatting and **Europe/Zurich** timezone.  
- Supabase auth, RLS, storage, and realtime function end‑to‑end; seeded tenants/accounts log in.  
- Checkout works with Stripe test, TWINT sandbox, and **QR‑bill** PDF invoices.  
- Finance and reconciliation reports are consistent with provider data.

---

## 6) Deliverables

- i18n provider/wrapper, locale JSON files, localized meta/SEO.  
- Supabase SQL migrations (tables, RLS, RPCs), seed scripts, `.env.example`.  
- E2E tests per locale and per role (Playwright/Cypress).  
- Short demo video showing FR **tu** tone and Swiss formats in checkout and invoices.
