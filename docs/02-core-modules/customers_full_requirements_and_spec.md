# Customers — Full Requirements & Spec (CRM)

An exhaustive, implementation‑ready specification for managing **customers (students)**, dependents, accounts, consents, wallets, memberships/passes, communications, and analytics. Includes data model, RLS, flows (import/merge/export), UI, and QA. Web Admin + Mobile Student.

> Swiss/EU ready: GDPR/nLPD, multilingual (FR/DE/IT/EN), VAT notes, QR‑bill invoices, TWINT/account credit.

---

## 1) Personas & Roles
- **Customer** (student): owns an account; may have **dependents** (children) and/or be part of a **household**.
- **Staff/Admin**: manage profiles, notes, entitlements, refunds.
- **Instructor**: read‑only access to roster‑relevant fields.

---

## 2) Profile Data Model
- `customers` (id, org_id?, user_id?, first_name, last_name, email, phone E.164, birth_date, gender optional, address jsonb, language, tags text[], created_at)
- `dependents` (id, guardian_customer_id, first_name, last_name, birth_date, notes)
- `consents` (customer_id, type: marketing/sms/waiver/terms, version, accepted_at, ip, user_agent, locale)
- `wallets` (customer_id, balance, credits, credits_expiry, currency)
- `memberships` (id, customer_id, product_id, status, start_at, end_at, renewal, pause windows, dunning state)
- `passes` (id, customer_id, product_id, credits_total, credits_used, expires_at)
- `orders`, `payments`, `refunds`, `invoices` (links)
- `communications` (id, customer_id, type email/sms/push/whatsapp, template, status, opened_at, clicked_at)
- `notes` (id, customer_id, author_id, visibility: staff_only/instructor_visible, body, pinned)
- `documents` (id, customer_id, kind: waiver/medical/attachment, storage_url, expires_at)
- `segments` (id, org_id, name, definition jsonb, is_dynamic)

**Indexes**: `customers (email)`, `customers (phone)`, trigram for fuzzy search; unique per org when applicable.

---

## 3) Creation & Onboarding
- **Self‑signup** (web/app): email + password or social; choose language; accept terms/waiver; optional marketing consent.
- **Front‑desk create**: minimal (first, last, email/phone); send invite to complete profile.
- **Import wizard**: CSV/XLSX with mapping, validation (duplicate detection), and dry‑run; consent import with proof.

---

## 4) Identity & Duplicate Management
- Unique key strategy: email OR phone; soft duplicates allowed across orgs; global hash for cross‑org linking.
- **Merge** flow:
  - Pick primary → pull in orders, registrations, memberships, notes, wallet; combine tags and consents.
  - Keep audit: who merged, when, source IDs.
  - Update foreign keys in a transaction; emit `events`.

---

## 5) Wallet & Credits
- Balance currency (CHF); allow negative if **Pay with Account** is enabled.
- Credit buckets: **class credits** separate from money balance; expiry per pass.
- Transactions ledger (credit/debit) with reasons (purchase, refund, goodwill, penalty reversal).

---

## 6) Entitlements
- **Memberships**: renewal, pause, upgrade/downgrade, dunning; access rules by product tags (e.g., Yin only, Online only).
- **Passes/Packages**: credits count, expiry, extension rules, shareability (family/guest settings).
- **Gift cards/Vouchers**: stored value with code; redeem to wallet or as payment at checkout.

---

## 7) Preferences & Consents
- Marketing opt‑in by channel; transactional emails always on.
- Language preference (FR/DE/IT/EN) for UI and emails.
- Privacy exports/deletion (GDPR/nLPD): self‑service **Download my data** and **Request deletion**; 30‑day window; anonymize on delete (keep financial records with pseudonym).

---

## 8) Health & Safety (Optional)
- Injury flags, medical notes; visibility to instructors; retention policy (e.g., 12 months after last visit) with auto‑purge.
- Liability waiver signature storage (file or hash); versioning & re‑consent on updates.

---

## 9) CRM & Segmentation
- Tags (freeform + enforced sets like “First‑timer”, “VIP”, “Corporate”).
- Dynamic segments using builder (last visit, spend, city, membership status, class tags, NPS, churn score).
- Saved segments feed marketing campaigns; export CSV.

---

## 10) Timeline & Activity
- Unified timeline: registrations, check‑ins, payments/refunds, communications, notes, membership events.
- Filterable; exportable subset.

---

## 11) UI (Web Admin)
- **Customer list**: global search (name, email, phone); filters (tags, last visit, memberships, city, spent, at‑risk, language); bulk actions (message, tag, export).
- **Customer detail** (tabs):
  - Overview (KPIs: visits, spend, last/next booking, current entitlements)
  - Registrations (upcoming/past; actions cancel/move/refund)
  - Wallet (balance, credits; adjust; history)
  - Memberships & Passes (grant, pause, change; rules)
  - Orders & Invoices (download QR‑bill PDFs; resend receipts)
  - Communications (send email/SMS/WhatsApp; deliverability)
  - Notes & Documents (pin, restrict to staff; upload attachments)
  - Consents & Privacy

**Mobile (Student)**
- Profile & wallet, memberships, passes, bookings, receipts, privacy controls.

---

## 12) Integrations
- Payments: Stripe, TWINT (via provider), SEPA.
- Messaging: Brevo/Sendgrid, WhatsApp Business, SMS.
- Maps/geocode for addresses; what3words optional.
- Accounting export (CSV/Datev/SAGE) with customer codes.

---

## 13) RLS & Permissions
- Customer sees only own profile and dependents.
- Instructor sees roster‑relevant fields (name, check‑in state, injury flag) for classes they teach.
- Front‑desk/manager see org‑scoped customers for assigned locations.
- All changes audited with actor and before/after snapshot.

---

## 14) Analytics & KPIs
- New vs returning, retention cohorts, LTV, churn risk, NPS, average visits per member, voucher breakage.
- Materialized views: `mv_customers_daily`, `mv_retention_cohorts`, `mv_customer_ltv`.

---

## 15) Automations
- Welcome series for first booking; win‑back at 30/60/90d; birthday perk; failed dunning alerts; review prompts post‑class.
- Triggers based on segment entry/exit.

---

## 16) QA & Acceptance Criteria
- Merge preserves all linked data and updates FKs transactionally.
- Export delivers a compliant, complete data package within minutes; delete request anonymizes PII while keeping financial ledgers.
- Wallet math is exact; credits increase/decrease on purchases/cancels and respect expiry.
- Consent records are immutable and versioned; re‑consent flow works on update.

---

## 17) Import/Export & API
- CSV import with mapping, validation, dedupe suggestions, and dry‑run report.
- REST/GraphQL: list, detail, search, segments, wallet adjustments, grant entitlements; all RLS‑enforced.

---

## 18) Error Handling & Edge Cases
- Duplicate email across orgs: allowed; within same org prompts merge.
- Household booking: guardian pays; dependent is attendee; age restrictions enforced.
- Guest booking uses temporary attendee record unless converted to full customer.
- Bounced emails flag deliverability and suggest phone/SMS contact.

