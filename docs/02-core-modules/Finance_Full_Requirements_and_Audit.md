# Finance — Full Requirements & Audit (YogaSwiss)

Money flow from **checkout → payment → payout** with Swiss VAT, TWINT, QR‑Bill, multi‑wallets, and clean accounting exports. Scoped for **brand ▸ studio ▸ location** with strict RLS and role‑based permissions.

---

## Objectives
- Exact, reconcilable math for orders, taxes, payments, refunds, payouts, earnings, and liabilities.
- Swiss‑grade documents (invoices with VAT & QR‑Bill) and reporting (VAT, payout, liability).
- Fast operations for admins and front desk; zero‑leakage privacy across tenants.

---

## Navigation Mapping (Admin → Finance)
1. **Finance Overview** — real‑time KPIs, alerts, reconciliation status.
2. **Payments & Billing** — payment methods, capture/refund, dunning, subscriptions.
3. **Swiss Payments** — TWINT, QR‑Bill (ISO 20022), bank transfer flows.
4. **Wallet Management** — passes, memberships, credits, ledgers, entitlements.
5. **Financial Reports** — sales, VAT, payout, liability, COGS/margins (with Shop).

Each section below defines **data model, workflows, UI/UX, permissions, acceptance**, and **audit gaps**.

---

## Core Data Model (Supabase‑style, high level)
- `orders(id, tenant_ids, customer_id, channel, status, currency, subtotal, tax_total, total, created_at)`  
- `order_items(id, order_id, type(registration|retail|membership|pass|fee|gift_card), quantity, unit_price, tax_rate, revenue_category, studio_id, location_id, instructor_id, linked_object_id)`  
- `payments(id, order_id, method(card|twint|cash|bank|wallet|gift_card|qr_bill), provider, provider_ref, amount, fee_amount, net_amount, currency, status(auth|captured|failed|refunded|chargeback), captured_at)`  
- `refunds(id, order_id, payment_id?, amount, reason, status, processed_at)`  
- `payouts(id, provider, period_start, period_end, arrival_date, gross, fees, refunds, chargebacks, net, status)` + `payout_items(payout_id, payment_id, amount, fee, order_id)`  
- `invoices(id, order_id, number, tax_mode(inclusive|exclusive), vat_id, pdf_url, qr_bill_url, status)`  
- `earnings(id, instructor_id, class_occurrence_id?, basis(per_head|per_class|percent|custom), gross, adjustments_json, payable_amount, period_id)`  
- `wallets(id, customer_id, studio_id, instructor_id, currency, balance, credits, credits_expiry, rules_json)` + `wallet_ledger(wallet_id, ts, kind(credit|debit|expiry|refund|transfer), amount, credits_delta, ref)`  
- `gift_cards(id, code, initial_amount, balance, expiry_at, purchaser_id, recipient_id, status)`  
- `reconciliation(id, source(bank|provider|pos_cash), file_id, date, status, diffs_json)`  
- `tax_rates(id, tenant_id, name, rate, region, valid_from, valid_to)`  
- `revenue_categories(id, tenant_id, name, accounting_code)`  
- `audit_logs(...)` for all critical finance actions.

All tables **RLS‑enabled**: row scope by brand/studio/location; role checks in policies.

---

## 1) Finance Overview

### KPIs
- Gross sales, net revenue, refunds, average order value; by day/week range.
- Payouts due / received; variance vs expected; unresolved chargebacks.
- Liabilities: gift card balance, pass credit liability, deferred revenue (memberships).
- Dunning funnel: failed renewals, recovered within 7 days.
- Alerts: negative wallet balances, sales tax mismatch, payout mismatch.

### UI/UX
- Time picker, filters (studio, location, channel), drill‑through to orders/payouts.
- Trend charts + tiles; export current view (CSV).

### Acceptance
- Totals reconcile to detailed reports within ±0.5%; drill‑through reaches the exact rows.

### Permissions
- Owner/Accountant full; Studio Manager limited to their studio; Instructor no access.

---

## 2) Payments & Billing

### Methods
- **Card** (Stripe) with Apple/Google Pay, 3DS/SCA.
- **TWINT** (Datatrans/Wallee) with webhook status updates.
- **Wallet** & **Gift Card** redemption.
- **Bank transfer** (mark as paid) and **Cash** (POS).
- **Subscriptions** (memberships) with billing cycles, proration, **dunning policy** (retry schedule, grace lock), freezes, upgrades/downgrades.

### Workflows
- **Capture**: auth at checkout → capture on confirmation (instant for classes); delayed capture allowed for retreats.
- **Refund**: full/partial; line‑level selection; auto liability updates for passes/gift cards; memo & reason codes.
- **Chargeback**: webhook creates dispute; flag order; create reserve; notify finance.
- **Dunning**: on failed renewal → retries, notify, grace access, then lock; upon recovery → restore access.

### UI/UX
- Payments list with filters (method, provider, status); action drawer (refund, resend receipt).
- Subscriptions tab: status, next bill date, pause/freeze, change plan, payment source, history.
- Payment settings: allowed methods by channel; surcharge/fee policies (if legal).

### Acceptance
- Payment status mirrors provider logs; refunds reverse revenue/liability correctly; dunning transitions update access state.

### Permissions
- Owner/Accountant manage all; Studio Manager limited; Front Desk can refund cash/pos only (policy).

---

## 3) Swiss Payments

### TWINT
- Provider connectors (Datatrans/Wallee); webhook signature verification; **idempotent** updates.
- In‑app QR codes for POS; validity window; status polling with fallback.

### QR‑Bill / ISO 20022
- Generate invoice PDFs with **Swiss QR‑Bill** (QR code payload), embedded into invoice.
- Customer reference and payment part included; **pain.001** (optional) for outbound bank transfers.
- Bank statement import **CAMT.053** for reconciliation.
- Settings per studio: creditor account (IBAN), reference type, logo/address block.

### Acceptance
- QR‑Bill validates with Swiss standard test suite; CAMT.053 imports match paid invoices.

### Permissions
- Only Owner/Accountant can configure bank & QR‑Bill credentials.

---

## 4) Wallet Management

### Model
- **Multi‑wallet per customer**, scoped by **studio and/or instructor**. Credits/money cannot cross tenants unless an explicit **transfer** is granted.
- Credit types: `class_credit`, `event_credit`, `retreat_credit`, `retail_value`; mapping to eligibility matrix.
- **Expiry** on credits; activation on first use; **freeze** and **transfer** rules; household sharing option.

### Workflows
- Purchase pass → **wallet credit** + `wallet_ledger` entry.
- Booking consumes credits using priority: earliest‑expiring first; membership benefits before paid credits (configurable).
- Cancellation & refund → restore credits per policy (late/no‑show fees supported).
- Corporate entitlements: employer bucket attached to wallet; post‑booking **invoice employer** if enabled.

### UI/UX
- Wallet list per customer (by studio/instructor); balance, expiry, ledger.
- Admin tools: adjust credits, transfer (with fee), freeze/unfreeze, merge wallets (within same tenant).

### Acceptance
- Ledgers sum exactly to each balance; eligibility engine blocks booking when insufficient; restores on refunds/cancellations.

### Permissions
- Studio Manager & Front Desk (limited) for their studio's wallets; Instructor can **view** own class eligibility (no global wallet edits).

---

## 5) Financial Reports

### Core Reports
- **Sales** by day/product/service/location/channel.
- **VAT** report (rates, taxable base, VAT amount) — export CSV/PDF.
- **Payout** report matching provider statements.
- **Liability**: gift card balance, pass credit liability, deferred revenue.
- **Instructor earnings**: per period, approval flow, export CSV/PDF.
- **COGS & Margins** (with Shop): FIFO valuation, gross margin %, inventory turns.
- **A/R**: negative wallet balances; unpaid invoices (QR‑Bill).

### Exports & Integrations
- Accounting: **Bexio, Abacus, Sage, Banana**; generic CSV; DATEV (optional).  
- Warehouse export (parquet/CSV) for BI; GA4 revenue events (server‑side, consent‑gated).

### Acceptance
- Report totals reconcile with orders/payments/payouts within ±0.5%; VAT totals equal line math; exports import cleanly.

### Permissions
- Exports gated by `finance.export`; watermarked with tenant & user id; audit logged.

---

## Roles & RLS
- **Owner/Brand Admin**: full finance; cross‑studio aggregates.
- **Studio Manager**: only their studio’s orders, payments, wallets, earnings.
- **Front Desk**: POS payments, cash drawer, basic refunds (policy).
- **Accountant**: all reports & exports; cannot edit product pricing.
- **Instructor**: earnings page only for own classes; no customer finance PII.

Row‑Level Security enforced across all tables with tenant filters and role checks.

---

## Monitoring & SLOs
- Webhook success ≥ 99.9%; reconciliation lag < 15 min; invoice generation < 5s P95.
- Dunning queue processing: 99% < 60s from event; payout import daily by 07:00 CET.
- Alerts: reconciliation mismatches, negative balances, expired certificates/keys.

---

## Test Plan (high level)
- Unit: VAT calc inclusive/exclusive; refund math; wallet eligibility & expiry; payout aggregation.
- Integration: Stripe/TWINT webhooks idempotency; QR‑Bill PDF validation; CAMT.053 import.
- E2E: purchase pass → book → cancel → refund; subscription fail → dunning recover → access restore.
- RLS Tests: cross‑tenant reads blocked; instructor earnings only own classes.

---

## Audit — Gap Checklist (to implement/verify)
- [ ] CAMT.053 import & reconciliation UI with diffs.
- [ ] QR‑Bill generator with invoice template & IBAN settings per studio.
- [ ] TWINT connector (Datatrans/Wallee) with signed webhooks.
- [ ] Wallet ledger + eligibility engine + corporate entitlements.
- [ ] Instructor earnings rules & close period flow.
- [ ] Accounting exports for Bexio/Abacus/Sage/Banana.
- [ ] Chargeback workflow & reserves.
- [ ] Dunning policies (retries, grace, lock) with notifications.
- [ ] RLS for all finance tables; export watermarking & audit logs.
