# Marketing — Funnels, Campaigns, Leads (Full Requirements & Spec)

A complete, privacy‑respecting growth stack tightly integrated with **Classes, Shop, Finance, Wallets, and Multi‑Tenant RBAC**. Built to match or exceed Eversports/Mindbody/Arketa and modern funnel tools (ClickFunnels‑style), while honoring Swiss revDSG/GDPR.

---

## Objectives
- Acquire, nurture, and retain customers with **measurable revenue lift**.
- Build **funnels** that combine landing pages, offers, automations, and checkout.
- Use **segments & journeys** that react to class behavior, purchases, and intent.
- Provide **first‑party attribution** from click → view → book/pay → retain.
- Keep **consent, locale, and RLS** at the core (brand ▸ studio ▸ instructor).

---

## Scope & Channels
- **Email** (ESP), **SMS** (Twilio/MessageBird), **Push** (mobile), **WhatsApp Business**, **In‑app banners**, **On‑site popups**, **Ads audiences** (Meta/Google via hashed sync), **Direct mail export** (CSV gated).
- **Landing pages** & **funnels** builder with A/B tests, timers, order bumps, and post‑purchase upsells.
- **Forms**: lead capture, waitlist, quiz, referral, and survey.

---

## Roles & Permissions (RBAC + RLS)
- **Marketer**: segments, templates, campaigns, funnels, leads; no finance PII exports.
- **Studio Manager**: can approve budget, coupons, and schedule sends for their studio only.
- **Owner/Brand Admin**: cross‑studio aggregates; feature flags; can enable ad sync.
- **Accountant**: read‑only revenue attribution; no message send rights.
- **Instructor**: may post class announcements (transactional) to enrolled students only.
- **Support (impersonation)**: consent needed; all actions logged; PII masked by default.

All audience lists and campaign stats are **scoped** to the active tenant (brand/studio) with RLS; exports require `marketing.export` permission.

---

## Data Model (Supabase‑style, high‑level)
- `segments(id, tenant_id, name, definition_json, live_count, refreshed_at)`  
- `audiences(id, tenant_id, segment_id, sync_target, status, last_synced_at)`  — ad syncs (Meta/Google), or webhook destinations.  
- `funnels(id, tenant_id, name, status, goal_type, goal_object_id, locale, theme, domain)`  
- `funnel_steps(id, funnel_id, type, order_index, content_json, form_id, offer_id, test_group)`  
- `landing_pages(id, tenant_id, slug, content_json, seo_json, publish_at, locale, theme)`  
- `forms(id, tenant_id, schema_json, double_opt_in, webhook_url)` + `form_submissions(form_id, lead_id, data_json, utm_json, session_id)`  
- `leads(id, tenant_id, person_id?, email, phone, locale, source, status, owner_id, score, tags[], consent_json, created_at)`  
- `lead_activities(id, lead_id, type, ts, data_json)` — views, clicks, form submit, call, note.  
- `campaigns(id, tenant_id, name, type, channel, status, audience_segment_id, schedule_json, ab_test_json, holdout_pct, budget_json)`  
- `messages(id, campaign_id, journey_node_id?, channel, subject, body_template_id, rendered_size, send_at, delivery_status, open_at, click_at, bounce_type, complaint_at, unsubscribe_at, conversion_order_id)`  
- `journeys(id, tenant_id, name, status, entry_triggers_json, quiet_hours_json, frequency_caps_json, version, published_at)`  
- `journey_nodes(id, journey_id, type, config_json, position)` — trigger/action/branch/wait/exit.  
- `templates(id, tenant_id, type, locale, design_json, legal_footer_id, version)`  
- `offers(id, tenant_id, type(coupon|gift_card|bundle|referral_reward), rules_json, budget, start_at, end_at)`  
- `referrals(id, tenant_id, referrer_customer_id, code, share_url, rule_json, balance, fraud_status)`  
- `attribution_events(id, tenant_id, person_id?, session_id, event, ts, utm_json, url, referrer, user_agent, order_id?)`  
- `experiments(id, tenant_id, name, scope(campaign|page|price), status, hypothesis, variants_json, primary_metric)`  
- `suppression_lists(id, tenant_id, type, value, reason, added_at)`  
- `domain_settings(id, tenant_id, sending_domain, dkim_status, spf_status, dmarc_policy, link_domain)`  
- `webhooks(id, tenant_id, target_url, secret, events[])`  
- `audit_logs(...)`

All **RLS‑enabled**. PII masking views for roles without `customers.view_contact`.

---

## Segmentation & Audiences

### Segment Builder
- Visual builder with filters across **profile**, **behavior**, and **finance**:
  - Profile: locale, city/region, tags, referral source, corporate membership.
  - Behavior: classes attended, last booking date, no‑show count, waitlists joined, device type.
  - Finance: spend/LTV, membership state, wallet credit balance, gift card holder.
  - Marketing: consent per channel, last open/click, domain engagement risk.
- Real‑time **count preview** and **sample**; computed SQL visible (read‑only).
- Save, version, and share segments across studios within a brand if allowed.

### Audience Sync
- Sync a segment to **Meta/Google** via hashed email/phone with consent; scheduled refresh.
- Webhooks to external CRMs (HubSpot, Pipedrive) respecting consent and RLS.

**Acceptance**
- Segment counts stable across refreshes; audience sync avoids sending non‑consenting records; audit entries created.

---

## Funnels (ClickFunnels‑style)

### Builder
- Step types: **Opt‑in**, **Sales page**, **Order form/checkout**, **Bump/upsell**, **Thank you/booking**, **Webinar/live** (for workshops), **Quiz**.  
- Drag‑and‑drop blocks: hero, video, countdown, testimonials, FAQ, pricing tables, class widgets, calendar embed, form, map.  
- **Themes** inherit brand styles; multi‑locale content; custom domain per brand.

### Commerce
- Offers attached to steps (coupon auto‑apply, bundle kit, membership trial).
- **Order bumps** and **post‑purchase one‑click upsells** for passes/retreat deposits.
- **Timers** (evergreen or fixed) with signed tokens to prevent spoofing.

### Testing
- A/B on copy, layout, and price with automatic winner selection by **revenue**.
- **Holdout/control** per funnel to validate incremental lift.

**Acceptance**
- Opt‑ins create leads with consent; orders flow to Finance; A/B winner picked by revenue; timers can’t be bypassed; analytics show step drop‑off.

---

## Campaigns

### Types
- **Blast** (newsletter/announcement)  
- **Recurring campaign** (weekly digest)  
- **Transactional** (booking confirmation, reminder, class change, waitlist) — *always on; bypass marketing consent*  
- **Triggered** (behavioral) — configured via **Journeys**  
- **Ad campaigns** — audience sync + UTMs + conversion tracking

### Controls
- **A/B** (subject, from name, content); **multivariate** (layout + CTA).  
- **Send‑time optimization** per timezone; **quiet hours** and **frequency caps**.  
- **Holdout** percentage; geo/language targeting; device targeting (optional).  
- **Pre‑flight checks**: broken links, missing alt, spam words, image/text ratio, unsub and address block.

### Content
- Templates with **dynamic blocks** (e.g., “Next 5 classes in Lausanne you can attend with your pass”).  
- Variables: `{{first_name}}`, `{{class_name}}`, `{{studio_url}}`, localized date/time.  
- Conditional sections (if member, if credits < N, if weather=rain suggest online).  
- Legal footer with mailing address, privacy, and **one‑click unsubscribe** (marketing only).

**Acceptance**
- Campaign can only send to consenting users; pre‑flight passes; UTMs appended; revenue attribution shown; quiet hours respected.

---

## Journeys (Automations)

### Triggers
- Sign‑up, email verified, first booking, no bookings for X days, birthday, membership lapsing or failed payment (dunning), waitlist promoted, post‑class attendance, purchase of pass/membership, refund issued, retreat inquiry.

### Actions
- Send email/SMS/push/WhatsApp, add tag, add/remove from segment, set task for staff, grant coupon or trial, call webhook/Zapier, wait (time or until event), branch (if/else), update lead status/score.

### Orchestration
- **Quiet hours** and **frequency caps** per channel.  
- **Exit rules** (e.g., leave journey when purchase happens).  
- **Versioning**: edit without disrupting active contacts; draft → test (simulator) → publish.  
- **Simulation/sanity**: run a fake contact through and preview payloads.

**Acceptance**
- No duplicate sends; re‑entry rules honored; dunning recovers payments; every action logged to `lead_activities` and `audit_logs`.

---

## Leads CRM

### Capture
- Sources: forms, imports, referrals, POS kiosk, chat widget, corporate portals, QR codes at studio, API.  
- Deduplication on email/phone; merge tool with survivorship rules.

### Fields & Consent
- Name, locale, region, interests, corporate employer, attribution fields (UTM), custom fields (JSON schema).  
- **Consent ledger** per channel (email/SMS/WhatsApp/push) and purpose.

### Pipeline
- Status: `new → contacted → qualified → booked → enrolled → won/lost`.  
- **Owner** (staff) and **studio** affinity; task list with reminders; SLA timers.  
- **Lead scoring**: rules + model inputs (opens, clicks, pageviews, form fields, LTV look‑alike).

### Views
- Kanban, list, calendar of tasks, and **360° timeline** (messages, bookings, orders).  
- Bulk actions: tag, assign, send template, export (permission‑gated).

**Acceptance**
- No cross‑studio visibility; tasks & notes audited; merge history retained; scoring reproducible.

---

## Landing Pages, Forms, Popups

- **Page builder** with sections, hero/video/testimonials/FAQ/map, SEO meta, OpenGraph, **hreflang**.  
- **Forms**: multi‑step, quiz scoring, file uploads, CAPTCHA, double opt‑in.  
- **Popups/bars**: trigger rules (exit intent, scroll %, timer, city, device), per‑page targeting, suppression after conversion.  
- **Widgets**: schedule embed, class card, instructor card, product block; inherit brand theme.

**Acceptance**
- Pages are fast (Core Web Vitals), localized, and indexable; forms push to `leads` with consent and UTMs; popups obey suppression and consent.

---

## Offers: Coupons, Gift Cards, Referrals

- Coupons: %/CHF off, item or order level, eligibility matrix, stack policy, usage caps, channel limits, start/end, budget.  
- Gift Cards: fixed/custom, branding, message, **liability** tracked; balance email to holder.  
- Referrals: unique link, reward rules (wallet credit/free class/membership discount), cooldowns, device fingerprint, fraud review queue.

**Acceptance**
- Offer rules enforced at checkout; redemptions deducted; referral balance updated only after **qualified conversion** (e.g., first paid booking).

---

## Attribution & Analytics

- Capture **UTMs** and session data client‑side; server‑side **conversion events** on order/registration.  
- Models: **last‑click**, **first‑touch**, and **position‑based**; dedupe same‑session.  
- Dashboards: revenue by campaign/journey/funnel, open/click, unsubscribe, bounce/complaints, funnel step drop‑off, LTV by cohort/channel, churn prediction for memberships.  
- **Holdout measurement** to show incremental lift.  
- Export of **customer‑level attribution** (permission‑gated).

**Acceptance**
- Revenue numbers reconcile to Finance orders; attribution windows configurable (e.g., 7‑day click/1‑day view).

---

## Deliverability & Compliance

- **Domain authentication**: SPF, DKIM, DMARC; branded link domain/shortener.  
- Bounce/complaint processing; suppression lists; list hygiene (sunset policy).  
- Seed tests; do‑not‑track respect; **double opt‑in** optional per form/locale.  
- Transactional vs marketing separation; **one‑click unsubscribe** for marketing only.  
- Data subject rights: export/delete with fulfillment logs; retention policies; audit of all changes.

**Acceptance**
- No marketing send to suppressed users; domain health dashboard; DKIM/SPF/DMARC all “pass”; unsub applied instantly.

---

## Localization & Personalization

- Locales: **de‑CH, fr‑CH (use _tu_), it‑CH, en‑CH**.  
- Date/time/currency formatting per locale; sender name and reply‑to per studio.  
- Dynamic content by **city**, **outdoor vs indoor preferences**, **pass balance**, **language**.

**Acceptance**
- Content renders correctly for all locales; tokens resolved; fallback language used if translation missing.

---

## Integrations
- ESP (Brevo/Sendgrid), SMS (Twilio/MessageBird), WhatsApp Business API, Push (mobile app).  
- Ads: Meta CAPI/GA4 server‑side events with consent gates.  
- Webhooks/Zapier for CRM tasks; Slack for alerts (e.g., lead assigned, funnel milestone).

---

## API / RPC Sketch
- `create_segment(definition)` / `refresh_segment(id)`  
- `sync_audience(segment_id, target)`  
- `create_funnel(payload)` / `publish_funnel(id)`  
- `track_web_event(session_id, event, utm)`  
- `create_campaign(payload)` / `schedule_campaign(id)` / `cancel_campaign(id)`  
- `send_preview(campaign_id, to)`  
- `upsert_journey(draft)` / `publish_journey(id)`  
- `enqueue_message(campaign_id|journey_node_id, channel, audience)`  
- `record_conversion(order_id, source_event_id)`  
- `upsert_lead(payload)` / `assign_lead(lead_id, owner_id)` / `set_lead_status(lead_id, status)`  
- All guarded by **RLS** and `marketing.*` permissions; APIs add **UTM/link** metadata automatically.

---

## UI/UX (Admin Navigation)

1. **Funnels** — builder, A/B, analytics (step drop‑off, revenue).  
2. **Campaigns** — blast/recurring with A/B & holdout, calendar, approvals.  
3. **Journeys** — visual automation canvas; simulator; version control.  
4. **Segments & Audiences** — live counts; ad syncs; refresh logs.  
5. **Leads** — pipeline board, tasks, scoring, merge, 360° timeline.  
6. **Templates** — email/SMS/push/WhatsApp; blocks; shared brand kit.  
7. **Pages & Forms** — landing pages, popups, widgets; SEO and domain settings.  
8. **Offers** — coupons, gift cards, referral programs; budgets.  
9. **Analytics** — revenue attribution, cohort/LTV, campaign & journey performance.  
10. **Settings** — domains (SPF/DKIM/DMARC), suppression, quiet hours, frequency caps, integrations, feature flags.

---

## Acceptance Criteria (Agent‑checkable)

- [ ] Segments compute stable counts and exclude non‑consenting contacts.  
- [ ] Funnels create leads, attribute orders, and support A/B with winner by **revenue**.  
- [ ] Campaigns honor quiet hours/frequency caps; UTMs appended; pre‑flight must pass.  
- [ ] Journeys never double‑send; exit and re‑entry rules respected; dunning reduces failed renewals.  
- [ ] Leads pipeline supports assignment, tasks, and scoring; merges retain history.  
- [ ] Offers apply at checkout with correct rules; referral rewards trigger only on qualified events.  
- [ ] Attribution dashboards reconcile with Finance orders within tolerance.  
- [ ] Deliverability: DKIM/SPF/DMARC pass; bounces/complaints suppress further sends.  
- [ ] Localization renders **de‑CH/fr‑CH(it _tu_)/it‑CH/en‑CH** correctly with date/time tokens.  
- [ ] RLS blocks cross‑studio visibility; exports gated and watermarked.

---

## Implementation Checklist (for AI agent)

- [ ] Tables & RLS from the data model; PII masking views.  
- [ ] Segment engine + scheduler; audience sync jobs.  
- [ ] Funnel builder + renderer; timers; A/B infra; ecommerce hooks.  
- [ ] Campaign service with pre‑flight, STO, quiet hours, holdout.  
- [ ] Journey orchestration engine (state machine + queues).  
- [ ] Template system (multilingual, dynamic blocks, conditionals).  
- [ ] Leads CRM (pipeline, tasks, scoring, merge) + 360° timeline.  
- [ ] Offers (coupons/gift cards/referrals) with budgets and fraud checks.  
- [ ] Attribution pipeline (client + server events), GA4/Meta CAPI bridges.  
- [ ] Deliverability: domain setup, bounce/complaint webhooks, suppression.  
- [ ] Admin UIs; analytics dashboards; exports (permission‑gated).  
- [ ] Test suite: consent/RLS, journey dedupe, A/B math, attribution reconciliation.

---

**Outcome:** A modern, compliant marketing engine that generates measurable bookings and revenue, integrates natively with your classes and shop, and remains safe under strict Swiss and EU privacy rules.


---

## Addendum — Admin Navigation Coverage & Required Enhancements

This addendum maps directly to your **Marketing** nav (Campaign Management, Customer Segments, Analytics & Reports, Business Growth, Automations) and lists **must‑have gaps** so the AI agent can complete them.

### 1) Campaign Management — Enhancements
**New capabilities**
- **Creative/Asset Library**: brand kits (logos, colors, typography), reusable blocks, rights/expiry dates; search by tags and locale; versioning and approvals.
- **Budget & Pacing**: per‑campaign daily/total budget; import ad costs from Meta/Google; soft/hard caps with alerts; ROI guardrails.
- **SMS Guardrails**: per‑country quiet hours, STOP/HELP processing, link shortener with branded domain, throughput management.
- **Content QA**: locale coverage report (de‑CH, fr‑CH (_tu_), it‑CH, en‑CH), broken‑link scanner, image alt audit, reading‑level hints.
- **Approval Workflow**: draft → review → approved → scheduled; role‑based approvers; audit trail.

**Acceptance**
- Campaign cannot schedule if missing required locale variants or failing QA gates (unless override with reason).
- Costs ingested display CAC/ROAS/MER alongside revenue; budgets enforce pacing with alerts.

**Implementation**
- Tables: `assets`, `asset_versions`, `campaign_budgets(cost_import_source)`, `sms_policies`.
- Jobs: nightly ad‑cost import; QA scanner; pacing monitor (alerts to Slack).

---

### 2) Customer Segments — Enhancements
**New capabilities**
- **Predictive Segments**: churn‑risk, high‑LTV look‑alike using recency/frequency/monetary + attendance + engagement. Stored as `segment_snapshot.score` with thresholds.
- **Event‑Driven Segments**: weather feed for outdoor fans; dynamic segments based on upcoming holiday/blackout.
- **Corporate Entitlements**: filters for company, subsidy balance, eligibility window.

**Acceptance**
- Predictive labels refresh nightly; training data documented; human‑readable explanations per lead (top features).
- Event‑driven segments update within 15 min of trigger (e.g., weather change).

**Implementation**
- Tables: `segment_models`, `segment_scores(entity_id, score, label)`; webhook connector for weather.
- Jobs: model scoring nightly; event listeners for triggers.

---

### 3) Analytics & Reports — Enhancements
**New capabilities**
- **Ad Cost Ingestion** for CAC/ROAS/MER; currency‑normalized; per studio/brand.
- **Cohort Retention** by acquisition channel, class type, membership plan; curves and survival metrics.
- **MMM‑lite**: weekly channel contribution with Bayesian shrinkage; confidence intervals.
- **Creative Performance**: by template/block variant; heatmaps for clicks.
- **Warehouse Exports**: dbt‑ready marts (Segments, Sends, Journeys, Orders, Attribution, Costs).

**Acceptance**
- Revenue in dashboards reconciles to Finance within ±0.5%; cohorts and ROAS downloadable (permission‑gated).

**Implementation**
- Tables: `ad_costs(platform, campaign_id, adset_id, date, spend, clicks, impressions)`.
- Jobs: nightly ETL; dbt models; report views with materialization schedule.

---

### 4) Business Growth — Enhancements
**New capabilities**
- **Affiliate/Partner Program**: partner accounts, tracked links, commission plans, auto‑payout via Finance; fraud checks.
- **Pricing Experiments**: discount ladders and dynamic‑pricing guardrails; experiment assignment persisted; profit impact in analytics.
- **Reviews & NPS**: post‑class prompts; syndication reminders for Google/Apple Maps; UGC rights capture.
- **Local SEO Ops**: city‑page generator, schema validator, editorial planner, backlink tracking (notes).

**Acceptance**
- Affiliate payouts reconcile to orders and show in Finance; experiments never break min price; NPS response rate and star ratings tracked; schema passes validators.

**Implementation**
- Tables: `affiliates`, `affiliate_links`, `partner_payouts`; `pricing_experiments`; `reviews`, `nps_surveys`.
- Jobs: payout scheduler; experiment analyzer; schema audit cron.

---

### 5) Automations — Enhancements
**New capabilities**
- **Abandoned Booking**: detect checkout starts without payment; reminders with deep link to resume; expire holds.
- **Expiring Credits**: rolling checks for passes ending in N days; staggered reminders; incentive rules.
- **Multi‑Armed Bandit**: explore subject lines/send times under frequency caps.
- **Reliability**: retries with exponential backoff, **dead‑letter queue (DLQ)**, Slack/Pager alerts.
- **Weather‑Triggered**: when outdoor class risk detected → auto message + switch to backup occurrence (ties to Classes module).

**Acceptance**
- No duplicate reminders; DLQ empty or actioned within SLO; weather flow updates affected classes and notifies only enrolled students.

**Implementation**
- Tables: `abandons(session_id, last_step_at)`, `dlq(events)`.
- Jobs: abandon detector (5‑min cadence), credit‑expiry notifier (daily), bandit explorer, weather watcher.

---

### Cross‑Cutting SLOs & Compliance
- **SLOs**: 99.9% delivery enqueue success, 99% < 60s from trigger to send; attribution pipeline < 5 min lag.
- **Privacy**: consent proof logs (IP + UA + timestamp), retention policies, data subject tooling; one‑click unsubscribe only for marketing.
- **RBAC/RLS**: all views/actions scoped to brand/studio; exports watermarked & audited.

---

### Gap Checklist (agent must implement)
- [ ] Asset library/brand kits with versioning & rights expiry.  
- [ ] Ad‑cost ingestion + budget/pacing; CAC/ROAS/MER.  
- [ ] Predictive + event‑driven segments; corporate entitlement filters.  
- [ ] Cohort retention, MMM‑lite, creative performance; warehouse/dbt exports.  
- [ ] Affiliate program with tracked links and automated payouts.  
- [ ] Reviews/NPS to Maps prompts with UGC rights.  
- [ ] Pricing experiment framework tied to Finance margins.  
- [ ] Abandoned booking & expiring‑credits journeys.  
- [ ] Bandit exploration; retries, DLQ, Slack alerts.  
- [ ] Weather‑triggered automations integrated with Classes (outdoor → backup).

