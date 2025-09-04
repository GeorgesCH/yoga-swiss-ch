# Finance — Full Requirements & Spec

Money flow from **checkout → payment → invoice → payout → reconciliation → reporting**, with **Swiss VAT**, **Swiss QR-bill**, **TWINT**, clean **accounting exports**, and airtight **auditability**.

> Scope: Web + Mobile; multi-tenant (org/studio), multi-location, multi-currency (CHF-first, EUR optional). Postgres + Supabase; RLS on all finance tables. GDPR/nLPD compliant.

---

## 0) Principles & Guardrails

- **Source of truth = database** (immutable financial snapshots on invoice/payout close).
- **Determinism**: per-line math, explicit rounding, idempotent writes.
- **Separation of concerns**: `Order` (commercial intent), `Payment` (cash movement), `Invoice` (legal doc), `Payout` (provider → bank), `Earning` (instructor payroll), `Recognition` (revenue timing).
- **Liabilities first**: passes/gift cards sale = liability; recognize on redemption or breakage.
- **Reconcile everything**: webhooks, bank files (CAMT.053), provider payouts; always tie back to cents.
- **Audit**: all mutations logged (who/when/why). No destructive deletes; use status/void + reversal docs.

---

## 1) Money Objects

- **Order** & **OrderItem** — intent + priced lines, taxes/discounts, linked to registrations/products.
- **Payment** — authorization/capture/refund events; provider-level fees + net.
- **Refund** — partial/full; original method or account credit.
- **Invoice** — legal PDF, numbering, VAT mode; optional **Swiss QR-bill**.
- **Payout** & **PayoutItem** — settlements from Stripe/Datatrans/Wallee to studio bank.
- **Earning** — instructor payroll per class/occurrence/service per configured rule.
- **Reconciliation** — bank/prov lines matched to payments, payouts, cash drawers.

---

## 2) Data Model (Postgres sketch)

> All tables include: `id uuid pk`, `org_id uuid`, `created_at timestamptz`, `updated_at timestamptz`, `created_by`, `updated_by`. RLS: `org_id = auth.org_id()`.

### 2.1 Orders

```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  currency text NOT NULL CHECK (currency IN ('CHF','EUR')),
  status text NOT NULL CHECK (status IN ('draft','pending','authorized','paid','partially_refunded','refunded','void')),
  channel text NOT NULL CHECK (channel IN ('web','mobile','front_desk','api','marketplace')),
  subtotal_amount numeric(12,2) NOT NULL DEFAULT 0,     -- excl tax
  discount_amount numeric(12,2) NOT NULL DEFAULT 0,     -- absolute
  tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,        -- subtotal - discounts + tax
  tax_mode text NOT NULL CHECK (tax_mode IN ('inclusive','exclusive')),  -- snapshot from org settings
  invoice_id uuid,                                      -- one-to-one if invoiced
  payable_by_date date,                                 -- if invoice on account
  notes text,
  meta jsonb DEFAULT '{}'
);
CREATE INDEX ON orders(org_id, customer_id, status);
```

```sql
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('registration','product','add_on','retail','gift_card','membership','pass_credit')),
  reference_id uuid,                 -- e.g., class_occurrence_id or product_id
  description text NOT NULL,         -- rendered to invoice
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL, -- pre-tax if exclusive, post-tax if inclusive (snapshot)
  discount_amount numeric(12,2) NOT NULL DEFAULT 0,
  tax_rate numeric(6,4) NOT NULL,    -- snapshot rate (e.g., 0.0810)
  tax_category text NOT NULL,        -- standard, reduced, exempt
  tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  line_total numeric(12,2) NOT NULL DEFAULT 0,    -- (qty*price - discount [+ tax])
  revenue_category text NOT NULL,    -- classes, workshops, memberships, retail, gift_cards, passes
  location_id uuid,
  instructor_id uuid,                -- optional for per-head earnings
  meta jsonb DEFAULT '{}'
);
CREATE INDEX ON order_items(order_id);
```

### 2.2 Payments & Refunds

```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  provider text NOT NULL CHECK (provider IN ('stripe','datatrans','wallee','manual_cash','manual_bank','account_credit')),
  method text NOT NULL CHECK (method IN ('card','apple_pay','google_pay','twint','cash','bank_transfer','sepa_dd','account_credit','gift_card')),
  status text NOT NULL CHECK (status IN ('requires_action','authorized','captured','failed','refunded','chargeback')),
  amount numeric(12,2) NOT NULL,           -- captured amount (gross)
  fee_amount numeric(12,2) NOT NULL DEFAULT 0,    -- provider fee
  net_amount numeric(12,2) NOT NULL DEFAULT 0,    -- amount - fee
  currency text NOT NULL,
  provider_ref text,                         -- payment_intent or transaction id
  idempotency_key text,                      -- to dedupe retries
  captured_at timestamptz,
  meta jsonb DEFAULT '{}'
);
CREATE UNIQUE INDEX ON payments(org_id, provider_ref);
CREATE UNIQUE INDEX ON payments(org_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
```

```sql
CREATE TABLE refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  payment_id uuid NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('pending','succeeded','failed')),
  amount numeric(12,2) NOT NULL,            -- refunded to customer (or wallet)
  destination text NOT NULL CHECK (destination IN ('original_method','account_credit')),
  reason text,                               -- customer_cancel, studio_cancel, no_show_fee, goodwill, chargeback
  provider_ref text,
  processed_at timestamptz,
  meta jsonb DEFAULT '{}'
);
CREATE INDEX ON refunds(order_id);
```

### 2.3 Invoices (Swiss-ready)

```sql
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  order_id uuid NOT NULL UNIQUE REFERENCES orders(id),
  number text UNIQUE NOT NULL,                      -- e.g., 2025-YST-000123
  status text NOT NULL CHECK (status IN ('issued','void','credit_note')),
  issue_date date NOT NULL,
  due_date date,
  tax_mode text NOT NULL CHECK (tax_mode IN ('inclusive','exclusive')),
  org_legal jsonb NOT NULL,                         -- name, address, VAT reg no., IBAN
  customer_legal jsonb NOT NULL,                    -- invoicee name, address, VAT id optional
  vat_breakdown jsonb NOT NULL,                     -- per rate {rate, net, tax, gross}
  totals jsonb NOT NULL,                            -- {subtotal, discount, tax, total}
  pdf_url text NOT NULL,
  qr_bill_url text,                                 -- link to Swiss QR-bill PDF/PNG if bank transfer allowed
  credit_note_of uuid,                              -- references invoices.id when reversing
  meta jsonb DEFAULT '{}'
);
```

### 2.4 Payouts & Provider Settlement

```sql
CREATE TABLE payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  provider text NOT NULL CHECK (provider IN ('stripe','datatrans','wallee')),
  provider_payout_id text UNIQUE,
  status text NOT NULL CHECK (status IN ('expected','in_transit','paid','failed')),
  currency text NOT NULL,
  gross_amount numeric(12,2) NOT NULL,
  fee_amount numeric(12,2) NOT NULL,
  net_amount numeric(12,2) NOT NULL,
  estimated_arrival date,
  arrived_at date,
  statement_descriptor text,
  meta jsonb DEFAULT '{}'
);

CREATE TABLE payout_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  payout_id uuid NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES payments(id),
  type text NOT NULL CHECK (type IN ('charge','refund','adjustment','fee')),
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL,
  provider_ref text,
  description text
);
CREATE INDEX ON payout_items(payout_id);
```

### 2.5 Instructor Earnings & Payroll

```sql
CREATE TABLE earning_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  scope text NOT NULL CHECK (scope IN ('class_template','instructor','global')),
  scope_ref uuid,                                 -- class_template_id or instructor_id
  rule_type text NOT NULL CHECK (rule_type IN ('per_head','per_class','percent_revenue')),
  amount numeric(12,2),                           -- CHF per head/class OR percent as 0-100
  min_amount numeric(12,2),                       -- optional floor
  max_amount numeric(12,2),                       -- optional cap
  include_taxes boolean NOT NULL DEFAULT false,   -- revenue basis
  include_discounts boolean NOT NULL DEFAULT true,
  revenue_categories text[] DEFAULT ARRAY['classes']::text[]
);

CREATE TABLE earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  instructor_id uuid NOT NULL,
  class_occurrence_id uuid,
  order_id uuid,
  order_item_id uuid,
  rule_id uuid,
  basis_amount numeric(12,2) NOT NULL,
  computed_amount numeric(12,2) NOT NULL,
  status text NOT NULL CHECK (status IN ('accrued','approved','paid','void')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  meta jsonb DEFAULT '{}'
);

CREATE TABLE payroll_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  name text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('open','closed','exported','paid'))
);
```

### 2.6 Reconciliation (Bank & Cash)

```sql
CREATE TABLE bank_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  source text NOT NULL CHECK (source IN ('camt053','csv','manual')),
  account_iban text,
  statement_date date NOT NULL,
  raw_file_url text,
  meta jsonb DEFAULT '{}'
);

CREATE TABLE bank_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  statement_id uuid REFERENCES bank_statements(id) ON DELETE CASCADE,
  posted_at date NOT NULL,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL,
  description text,
  counterparty text,
  end_to_end_id text,         -- for SEPA/QR references
  matched_entity text,        -- payments|payouts|invoice
  matched_id uuid,
  match_confidence numeric(4,3) DEFAULT 0.0
);
```

---

## 3) Calculations & Algorithms

### 3.1 Rounding & Precision

- **Price precision**: store to 0.01 in currency units.  
- **Per-line rounding**: compute line net/tax/gross, round to 0.01 using **banker’s rounding** (half-to-even).  
- **Invoice totals**: sum rounded lines → totals.  
- **Cash payments (CHF)**: if `method = cash`, round final payable to **0.05**; store `cash_rounding_adjustment` line in order.

### 3.2 VAT Modes

- **Exclusive**: `line_net = qty * unit_price - discount`; `tax = round(line_net * rate)`; `gross = line_net + tax`.
- **Inclusive**: `line_tax = round((gross * rate)/(1+rate))`; `line_net = gross - tax`. (Ensure discount applied to **gross**, then derive tax portion proportionally.)

### 3.3 Discounts & Coupons

- **Order-level discount**: allocate to lines **pro-rata by line_gross**; recompute tax accordingly.
- **Item-level discount**: applied before VAT math (exclusive) or on gross then back out tax (inclusive).
- **Free class voucher**: line price → 0; track benefit as promotion (not refund).

### 3.4 Gift Cards & Pass Credits

- **Gift card sale**: `order_item.type='gift_card'` → **no VAT**, credit liability: `gift_card_balance += amount`.
- **Gift card redemption**: reduce liability; VAT applies on **underlying items**.
- **Pass sale**: liability **deferred revenue** with `credits` quantity; recognize **on redemption**.  
- **Breakage**: on expiry, move remaining liability to revenue using configured % or hard expiry date.

### 3.5 Memberships (Subscriptions)

- **Recognition**: default on **billing date**; option to recognize **daily prorated** to match period.  
- **Pauses/Upgrades**: compute proration credit/debit next invoice.  
- **Dunning**: failed charge → grace period; if canceled, reverse future revenue recognition entries.

### 3.6 Refunds

- **Partial**: refund by amount or by items; allocate VAT and discounts proportionally to refunded portion.
- **Destination**: default **account credit** if allowed; otherwise **original method**.
- **Policy Fees**: late cancel / no-show fees create **fee lines** (revenue category: penalties) with VAT policy; refunds deduct fees first.
- **Credit Notes**: for invoice reversals → generate `invoice.status='credit_note'` referencing original.

### 3.7 Instructor Earnings

Compute per occurrence using applicable **rule** precedence: `class_template` > `instructor` > `global`.

- **per_head**: `computed = min(max(attendees * amount, min_amount), max_amount)`; attendees exclude free/comp if policy says so.
- **per_class**: flat `amount` (apply min/max if set).
- **percent_revenue**: `basis = SUM(order_item.line_total for eligible categories)`; include/exclude taxes/discounts per rule; `computed = clamp(basis * pct/100, min, max)`.

Attendee-based earnings update when **cancellations** or **waitlist promotions** occur.

---

## 4) Payments & Providers

### 4.1 Stripe (cards + Apple/Google Pay)

- **Create PaymentIntent** with `amount`, `currency`, `customer`, `setup_future_usage` when allowed.  
- **Idempotency key** on checkout session.  
- **Webhooks**:
  - `payment_intent.succeeded` → mark `payments.status='captured'`, set fees (from balance transaction), net, `captured_at`.
  - `payment_intent.payment_failed` → `failed`.
  - `charge.refunded` / `charge.dispute.*` → create `refund` / mark `chargeback`.
- **Metadata**: `order_id`, `org_id`, `order_items`, `customer_id`.

### 4.2 TWINT (Datatrans or Wallee)

- **Init** transaction; show QR or app handoff; poll/ webhook completion.
- **Statuses**: authorized → capture; expired → fail; canceled by user → fail.
- **Fees** attributed on `payments.fee_amount`, `net_amount`.
- **Provider refs** stored per transaction for payout mapping.

### 4.3 Manual Methods

- **Cash**: front desk records `payment(method=cash)`; opens **cash drawer** session; end-of-day Z report reconciles.  
- **Bank transfer / QR-bill**: issue invoice with **Swiss QR**; mark `orders.status='pending'` until bank line matches reference; then mark paid.

### 4.4 Chargebacks

- Create `refund` with `reason='chargeback'`; place amount in **reserve** (negative wallet or flagged liability).  
- Link evidence kit and deadlines to order; webhook status updates.

---

## 5) Invoices & Swiss QR-bill

### 5.1 Numbering

- `YYYY-<ORG3>-NNNNNN` (e.g., `2025-YST-000123`), **sequential per org per year**.  
- `credit_note` shares same sequence, flagged via `status`. Numbers **immutable**.

### 5.2 PDF Contents

- **Header**: seller legal name, address, VAT ID, contact; buyer details incl. VAT ID (if given).  
- **Lines**: description, qty, unit price, discount, tax rate, tax amount, line total.  
- **Totals**: subtotal, discount, VAT per rate, grand total; currency; payment terms.  
- **Policy snapshot** (cancel/refund), **QR ticket** link if applicable.  
- Footer: registration & bank, `invoice.number`, `issue_date`, `due_date`.

### 5.3 Swiss QR-bill

- Generate QR payment part with:
  - **IBAN/QR-IBAN**, creditor name/address, amount, currency (CHF/EUR).
  - **Reference**: QRR/SCOR/Non; include `invoice.number` and `order_id`.
  - **Debtor** (customer) details when available.
- Include tear-off or full payment part per Swiss spec. Store `qr_bill_url` (PNG/PDF).

---

## 6) Payouts & Settlement

- Ingest **provider payout reports** (Stripe balance transactions, Datatrans/Wallee settlements).  
- Create `payouts` and `payout_items` for each component:
  - **charges** (+), **refunds** (-), **fees** (-), **adjustments** (+/-).
- Compute: `gross - fees = net` and verify equals provider net.  
- **Bank arrival date** snapshot; reconcile to **bank_lines** by amount & descriptor.

---

## 7) Reconciliation

### 7.1 Auto (Webhooks)

- Payments captured via provider → mark `orders.status='paid'` once `sum(captured payments) >= order.total_amount`.

### 7.2 Bank Import (CAMT.053/CSV)

- Parse statements into `bank_statements` + `bank_lines`.  
- **Matching algorithm**:
  1. **Strong**: match payout net to `payout.net_amount` ± tolerance and descriptor/IBAN.
  2. **Strong**: match invoice QR reference to `invoice.number`.
  3. **Medium**: amount & date proximity to single `payment`.
  4. Manual match with reason code (kept in audit).
- Update `matched_entity`, `matched_id`, `match_confidence`.

### 7.3 Cash Drawer

- Open/close shifts per location/user; record **float**, **sales**, **refunds**, **over/short**.  
- Daily Z summary exports and locks period.

---

## 8) Refunds & Credits

- Policy-driven defaults:
  - **Studio cancel** → full refund to **original method** unless asked to wallet.
  - **Customer cancel in window** → refund less fee or to wallet credit.
  - **No-show** → no refund; optional **penalty line**.
- Partial refunds: select lines/amount; system allocates taxes & discounts proportionally.  
- Gift cards: refund restores **card balance** (liability), not cash, unless regulation requires otherwise.  
- **Audit**: who issued, why, links to policy, customer view message.

---

## 9) Revenue Recognition

- **Classes/Workshops/Retail**: **at delivery date** (occurrence date / fulfillment).  
- **Memberships**: at **billing date** (option: daily accrual).  
- **Passes**: at **redemption**; **breakage** on expiry.  
- **Gift cards**: at **redemption**; **breakage** on expiry.  
- Maintain `recognition_entries` (date, amount, category) for reports; totals reconcile to invoiced revenue over time.

---

## 10) Reports & Analytics

- **Sales** by day/week/month, by product, location, instructor; net vs gross; channel mix.  
- **Tax report**: per VAT rate, net, tax, gross; export CSV.  
- **Payout report**: by provider, period; gross/fee/net; link to bank lines.  
- **Instructor earnings**: accruals, approvals, paid; per instructor/period.  
- **Liabilities**: gift card outstanding, pass outstanding, customer wallet balance; **breakage** realized.  
- **A/R**: negative wallets and on-account invoices outstanding (aging).  
- **Refunds**: by reason; penalties collected.

---

## 11) Admin UX (Web)

- **Orders list**: search by customer/email/invoice; quick actions: refund, resend invoice, view history.  
- **Order detail**: items (with tax), payments, refunds, invoice PDF/QR-bill, audit trail.  
- **Payments**: filter by provider/method/status; fees & disputes dashboard.  
- **Payouts**: list & detail drilldown; export CSV; verify reconciliation status.  
- **Payroll**: rule manager → preview → approve → export (CSV/PDF) → mark paid; period locks.  
- **Taxes & exports**: VAT settings, revenue categories; exports for DATEV/SAGE/generic CSV.  
- **Cash**: open/close drawer; Z reports; variance logs.

---

## 12) APIs, RPCs & Webhooks

### 12.1 RPCs

- `create_order(payload)` → drafts order + items; returns totals.  
- `capture_payment(order_id, payment_payload)` → creates PaymentIntent/TWINT tx; returns client secret/QR + db row.  
- `issue_refund(payment_id, amount, destination, reason)` → provider call + refund row + credit note generation.  
- `compute_earnings(period_start, period_end)` → populate `earnings`.  
- `close_payroll(period_id)` → lock & mark approved; generate exports.  
- `evaluate_tax(order_id)` → recompute VAT per mode/rate; return breakdown.  
- `post_recognition(date)` → materialize recognition entries (if not realtime).  

> All RPCs **idempotent** (idempotency key), transactionally safe.

### 12.2 Webhooks (ingress)

- Stripe: `payment_intent.succeeded`, `charge.refunded`, `charge.dispute.*`, `payout.paid`.  
- Datatrans/Wallee: transaction status updates, settlements.  
- QR-bill callback (optional) if bank provides; otherwise rely on bank import.

### 12.3 Events (egress/internal)

- `order.paid`, `invoice.issued`, `refund.completed`, `payout.received`, `payroll.closed`.

---

## 13) Jobs & Schedules

- **Nightly**: materialized views refresh; payout imports; revenue recognition; breakage.  
- **Hourly**: retry stuck payments; reconcile webhook gaps; dunning notices.  
- **On-demand**: regenerate invoices (layout only; numbers immutable), rebuild PDFs if branding changed (keep original as legal snapshot).

---

## 14) Permissions & RLS

- **Owners/Finance managers**: full finance scope.  
- **Front desk**: create cash payments, view today’s orders for their location, no exports.  
- **Instructors**: view **own earnings** only; no customer PII beyond class roster.  
- **RLS**: restrict by `org_id` + role; additionally by `location_id` for front desk views.

---

## 15) Quality & Acceptance Criteria

- **Math**: sum of line math (rounded per-line) equals invoice totals for both modes (inclusive/exclusive).  
- **Payouts**: Σ(net captured payments − provider fees − refunds − adjustments) == Σ(payouts.net) for period.  
- **Refunds**: liabilities (passes/gift cards) adjust correctly with complete audit trail.  
- **Documents**: invoice PDFs render in ≤ 2s, QR-bill scannable by Swiss standard apps.  
- **Reconciliation**: ≥ 98% auto-match on payouts; ≥ 90% auto-match on QR-bill references.  
- **Exports**: load without errors in DATEV/SAGE/generic CSV templates.  
- **Security**: idempotent RPCs; no duplicate charges; all mutations audited.

---

## 16) Edge Cases & Policies

- **Currency mismatch**: order currency determines payment currency; reject mixed-currency basket.  
- **Partial fulfillment**: multi-occurrence orders issue one invoice; revenue recognized per occurrence date.  
- **Price change after add-to-cart**: show banner; recompute before payment.  
- **Seat lost at pay**: reduce qty; reprice; keep session.  
- **Provider outage**: fallback to bank transfer (invoice with QR-bill) if allowed; queue confirmation on receipt.  
- **Cash rounding** (CHF): only on cash method; add rounding adjustment line.

---

## 17) Example Calculations

### 17.1 VAT Exclusive Example
- Yin Class drop-in: 1 × CHF 30.00, VAT 8.1% (example rate).  
- Discount: CHF 5.00 coupon.  
- Line net = 30.00 − 5.00 = 25.00  
- Tax = round(25.00 × 0.081) = 2.03  
- Total = 27.03

### 17.2 VAT Inclusive Example
- Workshop ticket gross CHF 108.10, VAT 8.1%, no discount.  
- Tax = round(108.10 × 0.081 / 1.081) = 8.10  
- Net = 100.00

### 17.3 Pass Sale & Redemption
- Sell 10-class pass CHF 250.00 → liability +250.00 (no VAT if treated as multi-purpose voucher).  
- Redeem 1 class (list price CHF 30.00, VAT 8.1%): recognize revenue 27.75 net + 2.25 VAT (proportional or list-price based per policy).

---

## 18) Swiss QR-bill Payload (high level)

- **Account**: IBAN/QR-IBAN of studio.  
- **Creditor**: studio name+address.  
- **Amount**: invoice total.  
- **Currency**: CHF/EUR.  
- **Reference**: `QRR` with `RF` or ISO ref embedding `invoice.number`.  
- **Additional**: message “Invoice {number} / Order {short-id}”.

---

## 19) Export Mappings (Accounting)

- **DATEV/SAGE CSV** columns: date, doc no., account, contra account, amount, tax code, cost center (location), text (customer/invoice).  
- **Chart of Accounts mapping**:
  - Sales: 3200 (example) classes/workshops; 3400 retail; 2090 gift card liability; 2085 pass liability; 3950 penalties; 1000 cash; 1020 bank.
  - VAT codes: standard/reduced/exempt mapped per `tax_category`.

> Actual account numbers configurable per org.

---

## 20) Implementation Checklist

- [ ] Create tables & indexes; enable RLS.  
- [ ] Implement RPCs with idempotency; wrap in transactions.  
- [ ] Provider adapters (Stripe, Datatrans/Wallee) + webhooks.  
- [ ] Swiss QR-bill generator & PDF pipeline.  
- [ ] Payout importers & reconciliation engine.  
- [ ] Earnings engine & payroll UI.  
- [ ] Reports & exports (DATEV/SAGE/CSV).  
- [ ] Admin screens (orders, payments, payouts, payroll, tax).  
- [ ] E2E tests: order → payment → invoice → refund → payout → reports.  
- [ ] Monitoring & alerts on payout mismatches, webhook lag, export failures.

---

## 21) Mermaid Flows (for engineers)

```mermaid
flowchart LR
  A[Checkout] --> B[Create Order]
  B --> C[Payment Intent / TWINT Tx]
  C -->|Webhook success| D[Mark Payment Captured]
  D --> E[Issue Invoice + PDF/QR]
  E --> F[Recognize Revenue (rules)]
  D --> G[Provider Payouts]
  G --> H[Bank Import]
  H --> I[Reconcile Payouts]
  D --> J[Instructor Earnings Accrue]
  K[Refund Request] --> L[Issue Refund + Credit Note] --> I
```

---

## 22) Non-Functional

- **Performance**: order pricing RPC ≤ 150ms P95; payout import 10k items/min.  
- **Reliability**: at-least-once webhook handling + dedupe; no data loss on retries.  
- **Security**: CSP, TLS, KMS for PDF/QR storage; rotate provider secrets.  
- **Observability**: logs (structured), traces on RPCs, metrics (mismatch counters).  

---

This finance spec covers the **end-to-end money lifecycle** with Swiss specifics (VAT, QR-bill, TWINT), precise math, and the operational tools to reconcile, report, and pay instructors confidently.
