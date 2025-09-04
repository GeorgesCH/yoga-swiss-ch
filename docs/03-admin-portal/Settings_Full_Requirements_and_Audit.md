# Settings — Full Requirements & Audit (YogaSwiss)

Centralized configuration for **brand ▸ studio ▸ location** with robust security, compliance, and integrations. Everything is **RBAC + RLS** aware and multi‑locale for Switzerland (de‑CH, fr‑CH with **tu**, it‑CH, en‑CH).

---

## Navigation Mapping (Admin → Settings)
1. **General Settings**
2. **System Health**
3. **API & Integrations**
4. **Compliance & Legal**
5. **Security**

Each section defines **fields, behaviors, acceptance**, and **audit gaps**.

---

## 1) General Settings

### Organization & Branding
- Brand/studio names, legal names, addresses, VAT IDs, IBANs (per studio).
- Locale defaults (de‑CH, fr‑CH _tu_, it‑CH, en‑CH), currency (CHF), time zone (Europe/Zurich).
- Brand kit: logos, colors, typography; email sender names; SMS sender; link domain.
- Public URLs, custom domains for pages/funnels; city pages & SEO defaults.

### Policies & Content
- Cancellation, late/no‑show, refunds; waiver of liability (HTML + versioning, linkable).
- Terms & Privacy URLs; cookie policy.
- Transactional templates: booking confirmation, reminders, waitlist, receipts/invoices.
- Shipping profiles (if Shop): rates, carriers, free‑over thresholds.

### Commerce & Taxes
- Revenue categories and accounting codes; tax classes and VAT mode (inclusive/exclusive).
- Payment settings per channel (web, POS, mobile); surcharge policy (if legal).
- QR‑Bill settings per studio (creditor IBAN, reference type, address block).

### Feature Flags
- Enable/disable modules per tenant: Online Studio, Corporate, Dynamic Pricing, Affiliates, Funnels.

### Acceptance
- Changing settings updates downstream calculators (VAT, eligibility) immediately; templates render correctly in all locales.

---

## 2) System Health

### Observability
- Job queues (emails/SMS/journeys/dunning) metrics & backlogs; webhook success rates.
- Realtime status (Supabase); DB connections; edge function health; cache hit rate.
- Scheduled jobs: payout import, CAMT.053, analytics materializations (last run, duration, next run).

### Incident Tools
- Pause/resume non‑critical jobs; maintenance mode per studio; test/sandbox mode.
- Error budget & SLO dashboards; alert routing (Slack/email).

### Acceptance
- Health page loads for roles with permission; shows green/yellow/red status with links to logs; pausing a job drains safely.

---

## 3) API & Integrations

### Keys & Access
- API keys per studio with scopes; rotation & expiry; IP allowlists; per‑key rate limits.
- OAuth clients for external apps; consent screens; revoke & audit.

### Webhooks
- Event catalog (order.created, payment.captured, registration.updated, wallet.changed, etc.).
- Secrets/algorithms, retry policy, DLQ; replay with signature verified; per‑tenant delivery logs.

### Third‑Party Connectors
- Payments: Stripe, Datatrans/Wallee (TWINT).
- Messaging: Brevo/Sendgrid, Twilio/MessageBird, WhatsApp Business.
- Analytics: GA4/Meta (with consent layer); server‑side events.
- Conferencing/Calendars: Zoom, Google Calendar (if used).
- Accounting: Bexio, Abacus, Sage, Banana.
- Storage/CDN: Supabase Storage buckets with policies.

### Acceptance
- Test webhooks deliver with signature; connectors validate credentials; rate limits enforced and logged.

---

## 4) Compliance & Legal

### Privacy & Consent
- Consent ledger per channel & purpose with IP/UA/timestamp; double opt‑in options.
- Data retention policies (logs, marketing, finance); auto‑purge jobs with exceptions for legal retention.
- Data Subject Requests: export & delete with tracked fulfillment and redaction.
- Audit logs for all sensitive actions (impersonation, exports, policy changes).

### Legal Docs
- Waiver management (versioned); terms/privacy/cookie policy links per locale.
- Email footers: mailing address, unsubscribe for marketing.

### Acceptance
- Unsubscribe applies immediately; DSARs complete within SLA; consent proof exportable.

---

## 5) Security

### Identity & Access
- **RBAC matrix**: owner, studio_manager, front_desk, accountant, marketer, instructor, guest/contractor, read‑only auditor.
- **Impersonation with consent** for support; masked PII by default; full audit trail.
- **MFA/Passkeys** required for high‑privilege roles; session lifetime controls; device/session list with revoke.
- SSO (SAML/OIDC) option for enterprise studios.

### Data & Infrastructure
- RLS policy tests; least‑privilege for keys; secret vault; key rotation reminders.
- Encryption at rest/in transit; signed URLs for storage; webhook secrets; CSP headers.
- Backups (point‑in‑time), restore drills; disaster recovery plan with RTO/RPO targets.
- IP allowlists for admin; rate limiting & bot protection for public endpoints.

### Acceptance
- Quarterly access review & attestation; impersonation requires consent; MFA enforced; backups verified; RLS tests pass.

---

## Audit — Gap Checklist (to implement/verify)
- [ ] Locale kit complete (de‑CH, fr‑CH *tu*, it‑CH, en‑CH) for all templates.  
- [ ] QR‑Bill settings per studio and invoice template hooks.  
- [ ] Feature flags per tenant for optional modules.  
- [ ] Health dashboard with queues/webhooks/SLOs and pause controls.  
- [ ] API keys with scopes, rotation, IP allowlists, per‑key rate limiting.  
- [ ] Webhook DLQ + replay; signed delivery logs.  
- [ ] Consent ledger + DSAR tooling; auto retention/purge jobs.  
- [ ] Impersonation with consent + full audit; MFA/Passkeys enforcement; SSO option.  
- [ ] RLS test harness and scheduled access reviews (attestations).  

