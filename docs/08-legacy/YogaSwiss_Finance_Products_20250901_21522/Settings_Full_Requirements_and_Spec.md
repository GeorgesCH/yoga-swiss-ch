# Settings — Full Requirements & Spec

A single, coherent **settings system** for a multi‑tenant yoga platform (studios, instructors, customers) that powers the **web app**, **mobile app**, **checkout**, **invoicing**, **marketing**, **analytics**, and **API**. Privacy‑first, Swiss‑ready, and battle‑tested for multi‑studio operations.

> Scope: Org (studio/brand), Location, Room/Resource, Instructor, Product/Template, Channel (web/mobile/email), Environment (staging/production).  
> Tech: Postgres (Supabase) with RLS; evented audit log; versioned settings; JSON schema validation; TypeScript SDK with zod types.

---

## 0) Principles

- **Org boundary = privacy boundary.** Settings are **scoped** to `org_id` and may be overridden per **location**, **room**, **resource**, **instructor**, or **product/template**.
- **Declarative & versioned.** Each change produces a new **settings version** with diff & who/when/why.
- **Fail‑safe defaults.** When in doubt, default to **safer**, more private behavior.
- **Live yet cacheable.** Settings are cached (edge) and **invalidated** on change; SDK provides `getSetting(path)` with strong typing.
- **UI mirrors hierarchy.** Admin sees where a value comes from (inherited vs overridden) with a one‑click **“reset to default”**.

---

## 1) Settings Map (Top‑Level Groups)

1. **General Business**
2. **Public‑Facing**
3. **Locations & Rooms**
4. **Subscriptions (Memberships)**
5. **Taxes & Invoicing**
6. **Language & Copy**
7. **Revenue Categories**
8. **Policies (Cancel/Late/No‑Show/Waitlist/Booking Windows)**
9. **Payments & Providers**
10. **Documents & Branding (PDF/Email)**
11. **Reservation & Check‑in**
12. **Communications (Transactional/Marketing)**
13. **Client Experience**
14. **Security & Access**
15. **Integrations & Webhooks**
16. **Data & Privacy**
17. **POS & Retail**
18. **Marketplace & SEO**
19. **Loyalty & Referrals**
20. **Dynamic Pricing & Experiments**
21. **Observability & Alerts**
22. **Advanced & Feature Flags**

Each group below lists **data schema**, **UI fields**, **API paths**, and **behaviors**.

---

## 2) General Business

**Purpose:** Legal identity, contact, currency, timezone, brand basics.

**Schema (excerpt):**
```json
{
  "legal": {
    "company_name": "string",
    "address": { "line1": "", "line2": "", "postal_code": "", "city": "", "canton": "", "country": "Switzerland" },
    "email": "string",
    "phone": "string",
    "vat_id": "string|null"
  },
  "timezone": "Europe/Zurich",
  "email_timezone_display": "Europe/Zurich",
  "currency_default": "CHF",
  "languages_enabled": ["fr","de","it","en"],
  "primary_locale": "fr",
  "support": { "email": "string", "url": "string" }
}
```

**UI:** Company details; timezone; currency; locales; support contact.  
**API:** `settings.general.*`  
**Behaviors:** Invoice pulls legal block; email templates use `email_timezone_display`.

---

## 3) Public‑Facing

**Purpose:** How the studio appears on the website/app.

**Fields:**
- **Profile photo**, **cover**, **favicon**; **Brand colors/typography**.
- **Public name** (page title), **slug/scheduling URL** (`/org/{slug}`), **custom domain** (CNAME support).
- **About** (multilingual), **website URL**.
- **Region/City** (for city pages), **geo** (lat/long).  
- **Mailing address** (for email footer compliance).  
- **Social** links (Instagram, Facebook, TikTok, Spotify, YouTube).  
- **SEO**: meta title/description, Open Graph, `hreflang`, sitemap toggle.

**API:** `settings.public.*`  
**Behaviors:** Public pages and widgets pick up branding; SEO tags rendered server‑side.

---

## 4) Locations & Rooms

**Purpose:** Physical, **outdoor**, and online places.

**Fields:**
- **Location**: name, description, address, **outdoor flag**, **meeting point**, **backup location**, **weather policy**, opening hours, closures/holidays, amenities, access instructions, photos, **map pin**.
- **Rooms**: name, capacity, spot map (grid), equipment list.
- **Virtual**: livestream provider, default link policy, auto check‑in on join.

**API:** `settings.locations.*`  
**Behaviors:** Recurring classes select location/room; **outdoor** renders weather banner and backup logic.

---

## 5) Subscriptions (Memberships)

**Purpose:** Default rules for **dunning**, **pauses**, **grace**, proration.

**Fields:**
- Retry schedule (e.g., 0h/24h/72h/168h), **max attempts**, **grace days**.
- Block booking on failed subscription (toggle).
- On cancellation: **end‑of‑term** vs **immediate + credit**; optional **actions** (revoke benefits, send survey).
- Pause policy: min/max days, fee, notice window.
- Proration policy for upgrades/downgrades.

**API:** `settings.subscriptions.*`  
**Behaviors:** Billing engine reads defaults unless plan overrides.

---

## 6) Taxes & Invoicing

**Purpose:** Swiss VAT, tax modes, invoice style, **QR‑bill**.

**Fields:**
- VAT mode: **inclusive/exclusive**, default **rates per revenue category** (standard/reduced/exempt).
- Rounding: **banker’s**; cash rounding (0.05) for cash POS.
- Invoice numbering scheme: `YYYY-<ORG>-NNNNNN`, credit note prefix.
- **QR‑bill**: creditor IBAN/QR‑IBAN, reference format (QRR/SCOR), display on PDF.
- Customer VAT ID capture (B2B).

**API:** `settings.tax.*`, `settings.invoice.*`  
**Behaviors:** Finance service consumes tax mode/rates; PDF pipeline renders legal/QR.

---

## 7) Language & Copy

**Purpose:** Localize all UI/Emails/Docs.

**Fields:**
- Languages enabled; **default locale**; **copy overrides** (key/value per locale); date/time formats.
- Translations for **policies**, **email templates**, **checkout labels**.

**API:** `settings.i18n.*`  
**Behaviors:** Frontend i18n provider uses overrides; falls back to default locale.

---

## 8) Revenue Categories

**Purpose:** Reporting & accounting mapping.

**Fields:** List with code, name, tax category, GL account mapping.  
**API:** `settings.revenue_categories.*`  
**Behaviors:** Order items map to categories; reports group by these.

---

## 9) Policies

**Purpose:** Global defaults with per‑product overrides.

**Fields:**
- **Cancellation window** (minutes), **late cancel fee**, **no‑show fee**, **refund behavior** (wallet/original), **sales cutoff** (minutes before/after start), **advance booking window**.  
- **Waitlist**: max size, auto‑promote rules (charge immediately vs hold-to-confirm), promotion window.  
- **Booking for children/guests**, **custom questions**, **attachments**, **healthcare provider codes** (optional).

**API:** `settings.policies.*`  
**Behaviors:** Checkout & roster apply these; violations blocked or require override permission.

---

## 10) Payments & Providers

**Purpose:** Connect payment rails.

**Fields:**
- Stripe connect; Apple/Google Pay toggles; capture strategy (auto/manual).  
- **TWINT** via Datatrans or Wallee; merchant IDs, signatures.  
- Offline methods: cash, bank transfer (QR‑bill), account credit.  
- **Tips** (suggested percents/fixed), surcharge rules (where legal).

**API:** `settings.payments.*`  
**Behaviors:** Provider adapters read config; PCI‑safe (client side tokens).

---

## 11) Documents & Branding

**Purpose:** PDF/email look & feel.

**Fields:** Invoice/receipt templates, headers/footers, legal lines; email sender, DKIM domain; **unsubscribe** controls; logo variants (light/dark); **OG** images.  
**API:** `settings.docs.*`  
**Behaviors:** Document service composes PDFs; email service merges templates.

---

## 12) Reservation & Check‑in

**Purpose:** Hold/seat logic and attendance.

**Fields:** Unpaid reservation resolver (12–72h), hold timers, prevent double booking, show spots remaining, **spot selection** toggle, kiosk mode, QR entry.  
**Check‑in:** enable client check‑in, **auto check‑in from livestream email click** (±30m).  
**API:** `settings.reservation.*`, `settings.checkin.*`.

---

## 13) Communications

**Purpose:** Transactional/marketing channels.

**Fields:** Disable confirmations (group/appointment/purchase), one‑click unsubscribe for transactional (if enabled), reply‑to, BCC to studio, **quiet hours**, frequency caps.  
**API:** `settings.comms.*`  
**Behaviors:** Message service respects consent & quiet hours; audit proof of send.

---

## 14) Client Experience

**Purpose:** Frictionless booking with controls.

**Fields:** Book for **guest/child**, prompt default location in branded app, track client records (PBs/injuries), show **room name**, timezone display.  
**Addresses:** request shipping/billing; **flat shipping rate**.  
**Welcome message** per product; **custom questions** builder.  
**API:** `settings.client.*`

---

## 15) Security & Access

**Purpose:** Team, roles, PII controls.

**Fields:** Role matrix; custom roles; **masked roster as default** for contractors; require 2FA for admins; session TTL; IP allowlist for dashboard; export permissions; data access approvals; audit log retention.  
**API:** `settings.security.*`  
**Behaviors:** Enforced via RLS + middleware claims.

---

## 16) Integrations & Webhooks

**Purpose:** External tools.

**Fields:** ESP (Brevo/Sendgrid), SMS (Twilio/MessageBird), WhatsApp Business; GA4/Meta Pixel (with consent mode), webhook endpoints with secrets; **API keys** + scopes; allowed origins for JS widgets; ICS feeds.  
**API:** `settings.integrations.*`

---

## 17) Data & Privacy

**Purpose:** Compliance (GDPR/nLPD).

**Fields:** Data retention (inactive customer purge), DSAR export window, anonymization policies, privacy policy text, **consent versioning**, cookie banner text.  
**API:** `settings.privacy.*`  
**Behaviors:** Background jobs enforce retention; consent attached to events.

---

## 18) POS & Retail

**Purpose:** Front desk operations.

**Fields:** Cash drawer enable; opening float; receipt footer; POS users; tax defaults for retail; stock threshold alerts; barcode rules.  
**Shipping:** enable shipping, **flat rate** or carrier calc, pickup windows.  
**API:** `settings.pos.*`

---

## 19) Marketplace & SEO

**Purpose:** Discovery.

**Fields:** City coverage, marketplace listing toggle, featured weight, revenue share, instructor listing permission, canonical domain.  
**API:** `settings.marketplace.*`

---

## 20) Loyalty & Referrals

**Purpose:** Growth loops.

**Fields:** Points earn/spend rules, tiers, birthday bonus; referral rewards (wallet, credits, discount), anti‑fraud cooling.  
**API:** `settings.loyalty.*`, `settings.referrals.*`

---

## 21) Dynamic Pricing & Experiments

**Purpose:** Revenue optimization.

**Fields:** Enable dynamic pricing; min/max bounds; rules (demand/lead time/occupancy); A/B experiments toggles; holdback % for control.  
**API:** `settings.pricing.*`, `settings.experiments.*`

---

## 22) Observability & Alerts

**Purpose:** Operational health.

**Fields:** Daily KPIs email, payout mismatch alerts, webhook lag alerts, failed export alerts; Slack/Email destinations.  
**API:** `settings.alerts.*`

---

## 23) Advanced & Feature Flags

**Purpose:** Gradual rollout.

**Fields:** Per‑org feature flags, beta enrollment, kill switches.  
**API:** `settings.flags.*`

---

## 24) Storage & Structure (DB)

- `org_settings` (current effective JSON), `org_settings_versions` (history with diffs).  
- `location_settings`, `room_settings`, `instructor_settings`, `template_settings` for overrides.  
- **Validation** via JSON Schema per group; migrations handled by `settings_schema_versions`.  
- **Audit** in `settings_audit` with actor, ip, user agent.

---

## 25) SDK & API

- `GET /orgs/:id/settings?paths=public,policies` returns merged view.  
- `PATCH /orgs/:id/settings` accepts partial updates with schema validation; writes version row.  
- **TypeScript SDK**: `getSetting('payments.twint.enabled')` with typed return; `onSettingsChange(cb)` via realtime channel.

---

## 26) UI/UX

- **Hierarchy indicator**: “Inherited from Org / Overridden at Location”.  
- **Diff viewer** for versions.  
- **Test mode**: simulate checkout with current settings (preview).  
- **Search** (global) over settings keys & labels.  
- **Permissions** gate write access per group.

---

## 27) Acceptance Criteria

- Changes are versioned, reversible, and auditable.  
- Effective settings resolve correctly with precedence: `Template > Instructor > Room > Location > Org > System Default`.  
- Checkout behavior immediately reflects policy/payment toggles after cache invalidation (< 30s).  
- Email/PDFs render with correct branding and legal blocks in all locales.  
- RLS prevents cross‑org reads/writes.

---

## 28) Example Precedence Case

- Org cancel window = 12h; Location override = 6h; Template override = 2h.  
- A class using that template at the overridden location applies **2h** (highest precedence).

---

## 29) Migration Notes

- Seed defaults for all new orgs; create v1 snapshot.  
- Backfill legacy boolean flags into structured groups.  
- Provide importers for Arketa/Eversports/Mindbody equivalents.

---

## 30) What’s Out of Scope (here)

- Finance math (covered in Finance spec).  
- Scheduling engine specifics (covered in Products & Services).  
- Marketing journeys logic (covered in Marketing spec).

---

This Settings spec defines the **hierarchy, data shapes, behaviors, and UX** to safely power every surface of the product while keeping privacy and Swiss compliance at the core.
