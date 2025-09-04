# TODO — Settings Audit & Gaps

Prioritized list of missing pieces and tasks to reach parity with Eversports / bsport / Mindbody / Arketa and to exceed them.

## Legend
- **P0** — Blocker/critical
- **P1** — High impact
- **P2** — Nice to have

---

## A) Architecture & Data (P0)

- [ ] **Versioned settings** tables (`org_settings_versions`, etc.) with JSON schema validation & diffs.
- [ ] **Effective settings resolver** with precedence (Template > Instructor > Room > Location > Org > System) + cache layer.
- [ ] **Audit log** for all settings writes (actor, ip, ua, before/after).

## B) General & Public (P1)

- [ ] Custom **domain mapping** UI with DNS checks & SSL issuance.
- [ ] **SEO** per org: OG images, hreflang, canonical domain, sitemap toggle.
- [ ] City/Region **geotag** for marketplace & city pages.

## C) Locations & Outdoor (P0)

- [ ] Outdoor fields (meeting point, backup, weather policy) + **backup auto‑move** flow.
- [ ] Holiday/closure calendar per location, inherited to schedule.
- [ ] **Spot maps** editor (grid designer) and seat labels.

## D) Subscriptions (P0)

- [ ] Central dunning settings: retry schedule, grace, **block booking** toggle, **action on cancellation**.
- [ ] Pause policy setup + proration options.
- [ ] Test harness for failure simulations.

## E) Taxes & Invoicing (P0)

- [ ] VAT mode toggle + per‑category rates; cash rounding controls.
- [ ] Invoice numbering scheme editor + **credit note** config.
- [ ] **Swiss QR‑bill** settings (IBAN/QR‑IBAN, reference type) and PDF preview.

## F) Language & Copy (P1)

- [ ] Copy overrides per locale (key/value) with search; export/import JSON for translators.
- [ ] Email template localization with test‑send.

## G) Policies (P0)

- [ ] Global booking windows, sales cutoff defaults, waitlist promotion rules.
- [ ] Late/no‑show fee settings with VAT category & revenue mapping.
- [ ] **Per‑template overrides** editor with impact preview.

## H) Payments & Providers (P0)

- [ ] Stripe connect + Apple/Google Pay toggles.
- [ ] **TWINT** (Datatrans/Wallee) connection and environment toggles.
- [ ] Offline methods (cash/bank/QR‑bill/account credit) + cashier permissions.
- [ ] **Tips** configuration.

## I) Docs & Branding (P1)

- [ ] PDF themes (invoice/receipt) with legal footers & brand variants.
- [ ] Email sender domain (DKIM) wizard; test deliverability.

## J) Reservation & Check‑in (P1)

- [ ] Unpaid reservation resolver window (12–72h) scheduler.
- [ ] Double‑booking prevention (cross‑resource and per‑client).
- [ ] Kiosk/QR check‑in settings; **auto check‑in from livestream link** window.

## K) Communications (P1)

- [ ] Quiet hours & frequency caps; confirmation toggle per channel/type.
- [ ] One‑click unsubscribe behavior **reviewed for compliance** (transactional vs marketing).

## L) Client Experience (P2)

- [ ] Guest/child booking toggles + per‑product eligibility.
- [ ] Custom questions builder (per template/workshop) with export to CSV.
- [ ] Shipping/billing address collection toggles; **flat shipping rate**.

## M) Security & Access (P0)

- [ ] 2FA requirement for admins; session TTL; IP allowlist.
- [ ] **Masked roster** default for contractors (already in onboarding spec); mirrored toggle here.
- [ ] Exports permission gates and watermarking.

## N) Integrations & Webhooks (P1)

- [ ] ESP (Brevo/Sendgrid), SMS (Twilio/MessageBird), WhatsApp Business connectors.
- [ ] GA4/Meta pixel + consent mode; allowed origins for widgets.
- [ ] Webhook endpoints config with rotate‑secret.

## O) Data & Privacy (P0)

- [ ] Data retention timers; DSAR export; anonymization policies.
- [ ] Consent versioning with IP/UA & per‑channel/per‑org scope.
- [ ] Cookie banner content + region rules.

## P) POS & Retail (P1)

- [ ] Cash drawer config; receipt footer; barcode defaults; low‑stock alerts.

## Q) Marketplace & SEO (P2)

- [ ] Marketplace listing preferences; featured weight; instructor listing permissions.

## R) Loyalty & Referrals (P2)

- [ ] Points/tier rules and referral rewards settings.

## S) Dynamic Pricing & Experiments (P2)

- [ ] Min/max bounds; rules (occupancy/lead‑time); A/B holdback; experiment reporting.

## T) Observability & Alerts (P1)

- [ ] Daily KPI email; payout mismatch; webhook lag; export failures; Slack/email targets.

## U) Advanced & Feature Flags (P1)

- [ ] Per‑org feature flags; staging/production environment toggles; kill switches.

---

## Cross‑Cutting Tasks

- [ ] **Settings search** across keys/labels; deep link to editor.
- [ ] **Reset to default** and **show inheritance path** chips.
- [ ] **Preview/Test**: simulate a checkout/email/invoice with current settings.
- [ ] **Access logs** export for compliance.

---

## Acceptance for “Settings v1”

- [ ] General, Public‑Facing, Locations, Policies, Taxes, Payments, Docs, Security implemented with versioning & audit.
- [ ] Checkout honors cancel window, sales cutoff, and payment toggles.
- [ ] Invoices render with QR‑bill when enabled.
- [ ] RLS prevents cross‑org reads; changes are reversible; SDK resolved values match UI.

---

## Nice Extras (post‑v1)

- [ ] Bulk apply overrides to a set of templates/locations.
- [ ] Scheduled settings (e.g., holiday pricing window).
- [ ] Import settings from competitor exports (mapping tool).
