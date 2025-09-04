# SIS Inventory → Implementation Tickets

This backlog maps each area to concrete tasks that satisfy checks in `SIS_Checks.csv`. Close a ticket only when the related check passes in SIS.

## Conventions
- **Schema**: create table/view, indexes, RLS, seed
- **RPC**: function body + tests + policy
- **UI**: wire to Supabase client, error/empty states, i18n
- **SIS**: add probe, include in nightly run

---
## Dashboard
1. **Overview › KPI tiles view** — `table:mv_finance_kpis` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
2. **Overview › Recent activity feed** — `table:audit_logs` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
3. **Overview › Alerts widget** — `table:system_alerts` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green

## People
1. **Customers › List & filters** — `table:customers` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
2. **Customers › Profile core** — `table:customers` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
3. **Customers › Consents tab** — `table:consents` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
4. **Customers › Wallets tab** — `table:wallets` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
5. **Customers › Wallet ledger** — `table:wallet_ledger` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
6. **Instructors › List & profile** — `table:instructors` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
7. **Instructors › Availability** — `table:instructor_availability` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
8. **Instructors › Earnings tab** — `table:earnings` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
9. **Staff Management › Pay rates** — `table:pay_rules` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
10. **Staff Management › Timesheets** — `table:timesheets` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
11. **Customer Wallets › Balances** — `table:wallets` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
12. **Customer Wallets › Adjustments** — `rpc:wallet_adjust` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
13. **Communications › Inbox** — `table:messages` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
14. **Communications › Templates** — `table:message_templates` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
15. **Payroll & Compensation › Pay rules** — `table:pay_rules` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
16. **Payroll & Compensation › Earnings compute** — `rpc:compute_earnings` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
17. **Payroll & Compensation › Period close** — `rpc:close_payroll` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
18. **Payroll & Compensation › Payout export** — `table:payouts` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green

## Classes
1. **Class Schedule › Calendar** — `table:class_occurrences` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
2. **Booking Engine › Checkout** — `rpc:reserve_slot` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
3. **Booking Engine › Capture payment** — `rpc:capture_payment` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
4. **Advanced Scheduling › Bulk editor** — `table:class_instances` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
5. **Advanced Scheduling › Blackout dates** — `table:blackouts` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
6. **Recurring Classes › Generator** — `rpc:generate_class_occurrences` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
7. **Registrations › Roster** — `table:class_registrations` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
8. **Registrations › Check-in** — `rpc:mark_attendance` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
9. **Registration System › Policies** — `table:registration_policies` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
10. **Cancellation & Refunds › Refund wizard** — `rpc:cancel_and_refund` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
11. **Locations & Resources › Locations** — `table:locations` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
12. **Locations & Resources › Rooms** — `table:rooms` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
13. **Outdoor Locations › Weather policy** — `edge:weather_decision` — **P3**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
14. **Retreat Management › Retreats** — `table:retreats` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
15. **Retreat Management › Retreat pricing** — `table:retreat_prices` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green

## Shop
1. **Products › Catalog** — `table:products` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
2. **Products › Media** — `storage:media-products` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
3. **Pricing & Packages › Class passes** — `table:packages` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
4. **Pricing & Packages › Memberships** — `table:subscriptions` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
5. **Inventory › Stock ledger** — `table:inventory_ledger` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green

## Marketing
1. **Campaign Management › Email/SMS builder** — `table:campaigns` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
2. **Campaign Management › Sends queue** — `table:messages` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
3. **Customer Segments › Segment builder** — `table:segments` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
4. **Analytics & Reports › Attribution views** — `table:mv_marketing_attribution` — **P3**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
5. **Business Growth › Referrals** — `table:referrals` — **P3**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
6. **Automations › Journeys** — `table:journeys` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green

## Finance
1. **Finance Overview › KPIs** — `table:mv_finance_kpis` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
2. **Payments & Billing › Payments** — `table:payments` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
3. **Payments & Billing › Provider webhooks** — `table:webhook_deliveries` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
4. **Swiss Payments › Invoices (QR)** — `table:invoices` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
5. **Swiss Payments › QR generator** — `rpc:generate_qr_bill` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
6. **Swiss Payments › Bank import** — `table:bank_imports` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
7. **Wallet Management › Wallets** — `table:wallets` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
8. **Wallet Management › Rules/eligibility** — `rpc:wallet_eligibility` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
9. **Financial Reports › VAT report** — `view:vw_tax_report` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
10. **Financial Reports › Payouts** — `table:payouts` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
11. **Financial Reports › Instructor earnings** — `table:earnings` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green

## Settings
1. **General Settings › Tenant prefs** — `table:settings` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
2. **System Health › SIS dashboard** — `table:sis_runs` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
3. **API & Integrations › API keys** — `table:api_keys` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
4. **API & Integrations › Webhooks** — `table:webhooks` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
5. **Compliance & Legal › Consents** — `table:consents` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
6. **Compliance & Legal › DSAR** — `table:dsar_requests` — **P2**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
7. **Security › Audit log** — `table:audit_logs` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green
8. **Security › Impersonation** — `table:impersonation_sessions` — **P1**
   - Schema/RLS
   - RPC (if applicable)
   - UI wiring (+i18n)
   - SIS check green

