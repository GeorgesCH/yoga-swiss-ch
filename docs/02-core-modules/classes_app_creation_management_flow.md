# Classes App — Creation & Management Flow (Web Admin + Instructor)

A complete, user‑friendly spec for creating and managing **classes, workshops, courses/series, private sessions, and events**. Designed for Web (studio admin, front‑desk, instructors) and Mobile (instructor lite quick actions).

> Goals: fastest creation flow, zero confusion, safe defaults, and powerful advanced options. Reflects best of Eversports/Mindbody/bsport/Arketa while adding Swiss‑friendly details (multi‑language, credits, memberships, payment plans, cancellation policies, TWINT readiness).

---

## 1) Content Types (what you can create)
- **Class (drop‑in)** — single session. Easiest checkout.
- **Workshop** — one or few sessions, special pricing, often limited seats.
- **Course / Series** — recurring set (e.g., 8‑week series); allow full‑series booking, optional drop‑ins.
- **Private Class (1:1 or small private)** — unlisted; only via shareable link or POS; optional location privacy.
- **Event / Retreat** — multi‑day; deposit and payment plan support; custom questions.
- **Template** — reusable defaults (name, description, images, pricing rules, teacher pay, policies). Linked or detachable.

> **Linked vs Detached**: Classes created from a template follow template updates unless *Detach from template* is toggled (one‑off override).

---

## 2) Creation Flow Overview (Wizard)
**Three simple steps + optional Review**. Every field has sensible defaults and inline help.

**Step 1 — Basic Info**  →  **Step 2 — Scheduling**  →  **Step 3 — Pricing & Access**  →  **Review & Publish**

A mini‑summary panel on the right updates live (title, date/time, price, capacity, teacher, visibility).

Keyboard‑friendly; all actions autosave drafts.

---

## 3) Step 1 — Basic Info
**1.1 Type & Template**
- *Type*: Class / Workshop / Course / Private / Event.
- *Start from*: **Blank** or **Template** (search/select). Toggle **Detach from template**.

**1.2 Identity & Visibility**
- *Name* (75 char limit) — live character counter.
- *Internal label* (for schedule color & filtering; hidden from students).
- *Visibility*: **Public** (listed on schedule) / **Unlisted** (shareable link; not indexed) / **Private** (only staff & link with token).
- *Tags* (used for filtering & reporting): multi‑select.
- *Language(s)* for description (FR/DE/IT/EN) with per‑locale fields.

**1.3 Description & Media**
- *Short description* (one‑liner) + *Full description* (rich text; bullets; emojis ok).
- *Banner image* (landscape ~2:1; shown on booking page, plugin, app).
- *Host portrait* (1:1; optional for teacher bio card).
- *Theme color* (calendar color chip; not customer‑facing).

**1.4 Delivery & Locations**
- *Class location*: **In‑person** / **Online** / **Hybrid**.
  - **In‑person**: choose Location → Room (capacity) → Map preview.
  - **Online**: virtual platform (Zoom/Meet/Teams/Custom URL). Link hidden until booked.
  - **Hybrid**: system creates two linked occurrences (in‑person & online) sharing template; inventory tracked separately.
- *Private location flag*: **Manually send location** (don’t reveal address; organizer will message attendees).

**1.5 Teachers & Staff**
- *Primary teacher* (required), *Additional teachers* (optional).
- *Eligible substitute teachers* (multi‑select) with notify toggle.
- *Default teacher pay rate* (inherits from template; override per class): per hour / per class / per attendee / % revenue (+ min/max).

**1.6 Options (opt‑in)**
- *Enable waitlist* — FIFO with auto‑promote window.
- *Spot selection* — seat map; customers pick a spot when booking.
- *Collect phone for SMS* — consent aware.
- *Custom questions* — per class (e.g., injuries, experience).
- *Attachments* — PDF welcome pack, etc.

---

## 4) Step 2 — Scheduling
**2.1 Mode**
- **One‑off** — single date/time.
- **One‑off from template** — choose template → override fields → (optional) Detach.
- **Recurring** — RRULE (e.g., Tue/Thu 09:00), end by date or count; rolling generation window (e.g., 90 days ahead).
- **Course/Series** — specific list of session dates (bulk add by day of week) + rule: *enroll whole series* and/or *allow drop‑ins*.
- **Workshop/Event** — single or multi‑day (with start/end per day if needed).
- **Private** — invite‑only; optionally generate multiple slots.

**2.2 Time & Capacity**
- *Start time*, *Duration* (minutes), auto compute *End time*.
- *Time zone* (default from location).
- *Capacity*: number or ∞ if empty.
- *Sales cutoff*: minutes before start (can be negative to allow booking into class start, e.g., **-10** = 10 min after start).
- *Booking window*: open sales X days ahead (defaults immediate).

**2.3 Exceptions & Overrides**
- Add/skip specific dates (holidays), change room or teacher for a date, change capacity, or cancel one occurrence.
- *Substitute workflow*: request → notify pool → approval.

---

## 5) Step 3 — Pricing & Access
**Price model** (single select, mirrors industry options):
- **Free** — price CHF 0; optional donations (toggle).
- **Paid (Fixed price)** — set price per ticket.
- **Sliding Scale / Customers pick price** — set **min**/**suggested**/**max**; optional “pay what you can”.
- **Package & Subscription Only** — no cash price; requires valid pass/credits or active membership; show purchase upsell.
- **Deposit + Balance** (Workshops/Events) — amount now, remainder due policy & date; supports **Payment Plan** (e.g., 3 x monthly).

**Currency** defaults to org currency (CHF); taxes per org tax rate.

**Credits**
- *Price in class credits*: e.g., **1** credit; can set fractional (0.5) for short classes.
- *Which passes apply*: choose eligible passes/packages & memberships.

**Optional payment settings**
- Allow **Book now, pay later** (pay at studio/POS). Attendance blocked if unpaid unless staff overrides.
- **Discount codes** allowed?
- **Ticket tiers** (0..N): name, price/credits, quantity; early bird/late pricing windows.
- **Add‑ons**: mat rental, towel, equipment (with inventory & price).
- **Eligibility**: open to all / members only / tag‑restricted / age‑restricted; allow booking for **children**.

**Policy & Docs**
- *Cancellation policy*: cutoff (hours), penalties (late cancel fee, no‑show fee, credit return rules), automatic application.
- *Waiver/consent* attachment (must accept to book).
- *Welcome message* (email/SMS template) and *reminders* schedule.

---

## 6) Review & Publish
- Human‑readable summary: who/what/where/when/how much.
- **Preview booking page** and **Test checkout** (sandbox payment) before publishing.
- Publish states: **Draft** → **Scheduled** → **Live**. Can schedule publish at a date.
- Shareable **link**, **QR poster** (auto‑generated), and **embed code** for websites.

---

## 7) Instructor & Admin Management (Classes App)
**7.1 Classes list**
- Filters: type, visibility, status (draft/scheduled/live/cancelled/completed), teacher, location, tag, capacity %, date range.
- Views: calendar (day/week/month), agenda, table.
- Bulk actions: publish/unpublish, copy week, duplicate, cancel with message & refund/credit automation, change teacher, change room/capacity, export roster.

**7.2 Roster management**
- Register/Unregister; mark **present / late / no‑show**; waitlist position; comp seats.
- Scan to check‑in (QR); geofence for self check‑in (mobile).
- Notes: first‑timer flag; injury; VIP; customer tags.

**7.3 Waitlist**
- FIFO with **offer window** (e.g., 60 min). Auto‑promote on seat free; capture payment automatically if allowed or send pay‑link.
- Manual promote/demote; audit trail of messages and time stamps.

**7.4 Substitutions**
- Teacher requests sub; manager approves; attendees notified of teacher change; roster preserved.

**7.5 Templates**
- Create **Service template** with: name, description, images, default duration & price/credits, eligible products, policies, default teachers & pay rates, tags, default location.
- **Linking rules**: choose which fields remain locked to template.
- **Versioning**: editing a template prompts *Apply to all future occurrences?*; show impact summary.

**7.6 Workshops/Events specifics**
- Deposit/payment plans; custom questions; refund windows; ticket tiers; attachments; travel info.

**7.7 Private classes**
- Unlisted; optional **manual location**; direct pay link; POS only; attendee whitelist.

**7.8 Spot selection**
- Room map editor (grid/rows); name seats; block seats; ADA row; price modifiers (optional premium spots). Seat hold timer during checkout.

**7.9 Safety & Compliance**
- Healthcare/insurer codes (optional); attendance export; privacy controls; parental consent when booking for child.

---

## 8) UX Details & Microcopy
- **Capacity**: “Leave empty for unlimited.”
- **Sales cutoff**: “Set a negative number to allow booking X minutes after class starts.”
- **Detach**: “If detached, template changes won’t update this class.”
- **Hybrid help**: “Create two linked listings (in‑person & online) so inventory is accurate.”
- **Waitlist**: show user their position; email/push when promoted.
- **Pricing chip**: shows “Free / Paid / Sliding scale / Credits only”.
- **Errors** are inline and actionable (e.g., “Add a teacher to publish”).

---

## 9) Validation & Edge Cases
- Start < End; duration 10–600 min; capacity ≥ 1 unless unlimited.
- Prevent double‑booking of a room/teacher overlap unless override with warning.
- Timezone & DST safe: occurrences use absolute `timestamptz`.
- If visibility **Private**, skip SEO features and search indexing.
- If **Package & Subscription Only**, ensure at least one eligible pass/subscription is enabled or show upsell.
- When **Book now, pay later**, prohibit self check‑in until marked paid (staff override allowed).
- Sliding scale must define min ≤ suggested ≤ max.
- If spot selection enabled, capacity follows seat count; cancelling seat frees it correctly.

---

## 10) Data Model Mapping (high level)
- `class_templates` (type, defaults, policies, teacher defaults, pay rules, images, tags, language blocks).
- `class_instances` (template_id, schedule mode, recurrence rule, location/room, teachers, capacity, visibility, options).
- `class_occurrences` (start_at, end_at, status, seatmap jsonb, slug, online_url_release_at, sales_cutoff, booking_window).
- `pricing_rules` (model enum: free/fixed/sliding/credits_only/deposit_plan; price, min/suggested/max, credits, deposit, plan jsonb).
- `eligibility_rules` (memberships/passes/tags/age/children_allowed).
- `policies` (cancel_cutoff_hrs, late_fee, no_show_fee, refund_rules jsonb).
- `waitlists`, `registrations`, `attendance`, `substitutions`, `communications`.

---

## 11) Instructor Lite (Mobile) Focus
- **Quick create**: New one‑off class from template → pick time/room/capacity → price/credits → publish.
- **Today**: tap class → roster → check‑in/swipe; add walk‑in; message attendees.
- **Edits**: limited to time/room/capacity/teacher notes; deeper edits on web.

---

## 12) Acceptance Criteria
- Create a weekly recurring class from template in **< 40 seconds** with keyboard only.
- Publish shows on public schedule immediately and supports deep link and QR.
- Waitlist auto‑promotion processes within **60 seconds** of seat becoming available.
- Sliding scale flow permits custom amount within min–max; refunds respect original paid amount.
- Credits‑only class enforces entitlement; upsell path to buy pass works.
- Cancellation inside/outside cutoff applies right policy and sends correct communications.
- Spot selection never double‑sells a seat; seat holds expire after 5 minutes of inactivity.

---

## 13) Nice‑to‑Have (v2)
- Instructor availability & smart suggestions for times.
- Visual room heatmap occupancy over time.
- AI assistant to draft class descriptions from a few prompts.
- Calendar ICS feeds per instructor and per class series.



---

## 2) Public‑Facing Settings — Detailed Requirements
**Purpose.** Control how the studio appears on public pages, marketplace, embeds, and apps. All fields support FR/DE/IT/EN localized text.

### 2.1 Fields & Validation
- **Profile photo**
  - Upload PNG/JPG/GIF; recommended square (min 512×512). Max 10 MB.
  - Crop tool (1:1); server stores original + responsive variants.
  - Storage path: `public-assets/{org_id}/brand/profile.*`.
- **Brand logo**
  - Landscape recommended 250×100; SVG/PNG/JPG; transparent bg preferred.
  - Used in emails, booking, invoices.
- **Public display name**
  - String (max 80). Examples: studio name or instructor name.
  - Unique within marketplace; can match legal name but not required.
- **Scheduling URL (vanity)**
  - Preview: `yogaswiss.app/{slug}` (or custom domain if configured).
  - Slug constraints: lowercase, a–z 0–9, hyphens, 3–32 chars.
  - **Availability check** with debounce; reserve on save.
  - **Redirects**: when slug changes, system writes redirect from old → new and updates share links. Old slug kept for 180 days (configurable). Warn user that embeds will keep working via redirect.
  - Conflict handling: if old slug belongs to deleted org, allow reclaim.
- **About (short + long)**
  - Short: max 160 chars (used in cards & SEO description).
  - Long: rich text (H2, lists, links). Per‑language tabs. Sanitized HTML.
- **Website URL**
  - Validated as https://; used in email footers & profile buttons.
- **Region**
  - Country and canton/State; used for default tax, currency (CHF), phone code, time zone suggestions.
- **Mailing address**
  - Address autocomplete (Google/Mapkit). Store normalized fields, `place_id`, and geocode. Used for email footers/compliance and invoice sender address.
- **Social links**
  - Instagram (username or url), Facebook, TikTok, YouTube, Spotify, LinkedIn, WhatsApp (link), Custom.
  - Validation: strip @, standardize to canonical URLs. Toggle to show/hide each.
- **Contact**
  - Public email, phone (E.164), and contact form toggle.
- **Business hours (optional)**
  - Per location or global; used on profile and Google rich snippets.
- **SEO & Sharing**
  - Meta title/description overrides; OG image (defaults to banner); robots toggle; schema.org type (LocalBusiness/HealthClub).
- **Languages shown**
  - Choose which locales to expose on public pages; default based on org.

### 2.2 UX & Behavior
- Autosave draft as user types; explicit **Save** button that also triggers validation and publishing to public profile.
- “View public page” button opens new tab.
- Live preview card shows how it will look in the marketplace.
- **Audit trail**: any change appended to `events` with old/new.

### 2.3 Data Model
- `organizations`: `display_name`, `slug`, `about_short`, `about_long_i18n jsonb`, `website_url`, `region`, `address jsonb`, `social jsonb`, `public_email`, `public_phone`, `seo jsonb`, `locales_enabled text[]`.
- Storage references for `logo_url`, `profile_photo_url`, `og_image_url`.
- `redirects` table for slug changes (old_slug, new_slug, org_id, expires_at).

### 2.4 Acceptance Criteria
- Changing slug maintains old links through redirect and updates sitemap within 1 hour.
- Invalid social usernames are rejected with friendly message.
- Public page reflects saved changes within 10 seconds (ISR revalidate or realtime invalidate cache).

---

## 3) Locations & Rooms — Detailed Requirements
**Purpose.** Manage places where sessions occur: physical locations, rooms, and franchise structures. Supports online‑only studios.

### 3.1 Create Location (Flow)
- **Types**
  - **Physical location** (full address, own schedule & inventory).
  - **Room within a location** (child resource; inherits address).
  - **Franchise location** (org under a corporate parent; gated by plan/contact sales).
- **Plan gating**
  - Base plan includes 1 physical location. Adding more prompts an **Upgrade** modal (show plan prices) or allows purchase as add‑on.
- **Fields**
  - Name (e.g., “Beverly Hills”).
  - Description (public & internal optional fields).
  - Address (autocomplete + manual edit); lat/lng; `place_id`.
  - Time zone (default from address).
  - Capacity default (used for new rooms without explicit capacity).
  - Amenities (checkboxes & custom tags): showers, mats, lockers, parking, wheelchair access, etc.
  - Access instructions (private text shown after booking).
  - Photos (gallery) for public page.
  - Contact for the site (optional override of org contact).
  - **Price** — only shown if plan requires an add‑on; otherwise hidden. (We don’t charge per room in product; this is plan logic.)
- **Online‑only**
  - If studio is virtual, can skip physical address; location becomes “Virtual” with default tz.

**Room within location**
- Parent selector (existing location required).
- Room name, description, capacity, **seat map** (if spot selection), default color, visibility (show room name to clients).

**Franchise location**
- CTA to **Contact Sales** (collect info); backend flag creates child org with corporate link and SSO options.

### 3.2 Zoom/Virtual Platform Integration
- For online or hybrid classes, choose platform per location default (can override per class).
- OAuth connect (Zoom/Google/Teams); store refresh tokens securely.

### 3.3 Policies per Location (optional overrides)
- Open/close booking windows, cancellation cutoff, late/no‑show penalties, check‑in methods, safety waivers.
- If not set, inherit org policies.

### 3.4 Data Model
- `locations` (org_id, name, address jsonb, tz, amenities jsonb, photos[], instructions, contact jsonb, is_virtual bool).
- `rooms` (location_id, name, capacity, seatmap jsonb, color, visible_to_clients bool).
- `org_plans` (plan, seats, locations_limit, add_on_price) and `org_add_ons` for extra locations purchased.
- `franchise_links` (parent_org_id, child_org_id, role, created_at).

### 3.5 Acceptance Criteria
- Creating a physical location geocodes and stores normalized address; map pin displays.
- Creating a room updates calendar resources immediately and blocks double‑booking.
- Hybrid classes can select different room for in‑person and default online link; inventory tracked separately.

---

## 4) Global Settings — Detailed Toggles & Behavior
> Mirrors common competitor options and adds Swiss‑specific needs. Stored under `organizations.settings jsonb` with typed schema and server‑side validation.

### 4.1 Email & Timezone
- **Email timezone**: affects timestamps in confirmations & ICS; default from org tz.
- **Transactional templates**: subject/body per language; variables documented; preview & test send.

### 4.2 Policies
- **Cancellation policy (hours)**: default applies unless product/class overrides. Range 0–168.
- **Late Cancel / No‑Show policy overview**: rich text shown pre‑booking; link in booking page and emails.
- **Waiver of liability**: HTML/Markdown; versioned; unique **public link** for pre‑sign; signature stored with IP/time/device.

### 4.3 Payments, Wallet & Refunds
- **Enable Pay with Account**: allow using wallet balance at checkout (not for subscriptions). Can go negative (creates receivable) if toggled.
- **Refund to Account Credit**: refunds convert to wallet credit by default; staff can opt to original method if allowed.
- **Block booking when subscription fails**: if dunning state, entitlement not valid until paid.
- **Action on subscription cancellation**: choose action (end of term / immediate revoke / prorated refund) + automation (survey, discount).

### 4.4 Reservation Management
- **Unpaid reservation resolver**: automatically cancel/pay‑link unpaid holds 12–72h before start (org chooses window).
- **Block double booking**: prevent same person booking same occurrence twice (still allow multi‑seat for guests if enabled).
- **Show spots remaining**: toggle on checkout; can show ranges (e.g., “< 5 spots”) for privacy.
- **Multiple credits per booking**: enable per offering types.

### 4.5 Check‑In
- **Enable client self check‑in**: by QR/geofence/time window.
- **Auto check‑in from email**: when clicking livestream join within ±30 min of start.
- **Show room name to clients** after booking.

### 4.6 Communication
- **One‑click unsubscribe** for transactional emails where legally allowed; always keep service‑critical emails.
- **Disable confirmation emails** per category (group classes / appointments / purchases) — **clients still get their emails**; this only stops admin CC.

### 4.7 Client Experience
- **Book for a guest**: allow buying for friends; requires marking which passes/subscriptions permit guest use.
- **Prompt default location in branded app** for multi‑location studios.
- **Client records**: enable notes & documents (physio reports etc.) with retention policy.
- **Timezone display**: show session times in user’s local timezone on web/app.

### 4.8 Legal & Compliance
- **Require signed liability waiver** prior to booking; reset all agreements (bulk) if policy updated (with re‑consent flow).
- **Tax‑inclusive pricing**: org‑level default; price display reflects VAT inclusion/exclusion; invoices note tax mode.

### 4.9 Staff & Access
- **Restrict Front‑Desk/Guest roles** from adding free/unpaid attendees unless permission granted.
- Role matrix editor shows which capabilities each role has; audit changes.

### 4.10 Shipping (Retail)
- **Flat rate shipping price** in CHF/EUR; per‑country overrides (optional). Applied to retail orders only.

### 4.11 Save & Audit
- All setting changes: optimistic UI with toast; persist transactionally; append to `events` (who, what, before/after).

---

## 5) Language Customization & Content
- Global content dictionary overrides for labels seen by clients (e.g., “Mat” vs “Spot”).
- Email/SMS template localization with fallbacks.
- Class & product descriptions support per‑language content; public pages display available locales and let users switch.

---

## 6) Subscriptions Management (Org Level)
- Default billing provider (Stripe/SEPA/TWINT integration where available).
- Dunning strategy: retries schedule, email cadence, grace periods.
- Pause/Resume policies; maximum pause length.
- Upgrade/downgrade proration rules; grandfathering.
- Shared family memberships (allow booking for dependents).

---

## 7) Taxes (CH/EU Ready)
- VAT rates per product category (reduced rates for wellness where applicable).
- Tax inclusive/exclusive default and per product override.
- Swiss **QR‑bill** invoice toggle & payer details; invoice numbering scheme.
- Export for accountants: SAF‑T/ISO CSVs with tax breakdown.

---

## 8) Revenue Categories
- Editable list of categories (e.g., Classes, Workshops, Retail, Gift Cards, Subscriptions).
- Mapping rules: each product/service assigned to a category; reports group by category.

---

## 9) FAQs
- Manage FAQ entries shown on studio public page and booking confirmations.
- Per locale; order via drag‑and‑drop; rich text answers.

---

## 10) Search in Settings (Global)
- Sticky search bar filters settings by keyword (“logo”, “TWINT”, “refund”).
- Deep links to specific setting via URL hash (e.g., `/settings/business#slug`).

---

## 11) Permissions & RLS
- Only `owner/admin` can edit business, taxes, subscriptions. Managers may edit locations & rooms.
- Changes scoped by `org_id`; events record `actor_user_id` for audit.

---

## 12) Acceptance Criteria
- Editing **Public Facing Settings** updates the public page within 10s and regenerates SEO.
- Changing **Scheduling URL** keeps old links working via redirect and updates all embeds.
- Creating a **Room** enforces no double‑booking, and capacity reflects seat map when enabled.
- Enabling **Tax‑inclusive pricing** changes receipts and invoice math accordingly.
- Toggling **Book for a guest** reveals guest field at checkout and guest use flags on passes/subscriptions.
- All toggles persist, survive refresh, and produce expected checkout/booking behavior in tests.

