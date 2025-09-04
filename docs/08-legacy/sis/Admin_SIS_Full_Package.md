# Admin SIS Full Package — Inventory, Checks, Tickets, Schema + Community Messaging
_As of 2025-09-02 21:26 UTC_

This single document consolidates:
1) **SIS Inventory** (what every admin page/component must talk to in Supabase)  
2) **SIS Checks** (pass/fail probes your runner executes)  
3) **Implementation Tickets** (agent-friendly backlog)  
4) **SIS SQL Schema** (tables for inventory/check results)  
5) **Community Messaging & Inbox** (spec + inventory + checks)

> Legend: P1 critical · P2 important · P3 nice to have. Roles are comma-separated short names (e.g., `owner,studio_manager`). Use **tenant-scoped RLS** everywhere.

---

## 1) SIS Inventory (CSV)
Short, machine-friendly list. Import into `sis_inventory` or copy/paste from here.

```csv
area,page,component,resource_type,resource_ref,criticality,owner_role
Dashboard,Overview,KPI tiles view,table,mv_finance_kpis,P1,owner,studio_manager,accountant
Dashboard,Overview,Recent activity feed,table,audit_logs,P2,owner,studio_manager
Dashboard,Overview,Alerts widget,table,system_alerts,P1,owner,studio_manager,accountant
People,Customers,List & filters,table,customers,P1,front_desk,studio_manager,owner,marketer
People,Customers,Profile core,table,customers,P1,front_desk,studio_manager,owner
People,Customers,Consents tab,table,consents,P1,front_desk,studio_manager,owner,marketer
People,Customers,Wallets tab,table,wallets,P1,front_desk,studio_manager,owner,accountant
People,Customers,Wallet ledger,table,wallet_ledger,P1,studio_manager,owner,accountant
People,Instructors,List & profile,table,instructors,P1,owner,studio_manager
People,Instructors,Availability,table,instructor_availability,P1,owner,studio_manager,instructor
People,Instructors,Earnings tab,table,earnings,P1,owner,studio_manager,instructor,accountant
People,Staff Management,Pay rates,table,pay_rules,P1,owner,studio_manager,accountant
People,Staff Management,Timesheets,table,timesheets,P1,owner,studio_manager,accountant
People,Customer Wallets,Balances,table,wallets,P1,owner,studio_manager,accountant,front_desk
People,Customer Wallets,Adjustments,rpc,wallet_adjust,P1,owner,studio_manager,accountant
People,Communications,Inbox,table,messages,P2,owner,studio_manager,marketer,front_desk
People,Communications,Templates,table,message_templates,P2,marketer,owner
Classes,Class Schedule,Calendar,table,class_occurrences,P1,owner,studio_manager,instructor,front_desk
Classes,Booking Engine,Checkout,rpc,reserve_slot,P1,owner,studio_manager,front_desk
Classes,Booking Engine,Capture payment,rpc,capture_payment,P1,owner,studio_manager,front_desk
Classes,Advanced Scheduling,Bulk editor,table,class_instances,P2,owner,studio_manager
Classes,Advanced Scheduling,Blackout dates,table,blackouts,P2,owner,studio_manager
Classes,Recurring Classes,Generator,rpc,generate_class_occurrences,P1,owner,studio_manager
Classes,Registrations,Roster,table,class_registrations,P1,owner,studio_manager,instructor,front_desk
Classes,Registrations,Check-in,rpc,mark_attendance,P1,owner,studio_manager,front_desk
Classes,Registration System,Policies,table,registration_policies,P2,owner,studio_manager
Classes,Cancellation & Refunds,Refund wizard,rpc,cancel_and_refund,P1,owner,studio_manager,accountant
Classes,Locations & Resources,Locations,table,locations,P1,owner,studio_manager
Classes,Locations & Resources,Rooms,table,rooms,P2,owner,studio_manager
Classes,Outdoor Locations,Weather policy,edge,weather_decision,P3,owner,studio_manager
Classes,Retreat Management,Retreats,table,retreats,P2,owner,studio_manager
Classes,Retreat Management,Retreat pricing,table,retreat_prices,P2,owner,studio_manager,accountant
Shop,Products,Catalog,table,products,P2,owner,studio_manager
Shop,Products,Media,storage,media-products,P2,owner,studio_manager
Shop,Pricing & Packages,Class passes,table,packages,P1,owner,studio_manager
Shop,Pricing & Packages,Memberships,table,subscriptions,P1,owner,studio_manager
Shop,Inventory,Stock ledger,table,inventory_ledger,P2,owner,studio_manager,accountant
Marketing,Campaign Management,Email/SMS builder,table,campaigns,P2,marketer,owner
Marketing,Campaign Management,Sends queue,table,messages,P2,marketer,owner
Marketing,Customer Segments,Segment builder,table,segments,P2,marketer,owner
Marketing,Analytics & Reports,Attribution views,table,mv_marketing_attribution,P3,marketer,owner
Marketing,Business Growth,Referrals,table,referrals,P3,marketer,owner
Marketing,Automations,Journeys,table,journeys,P2,marketer,owner
Finance,Finance Overview,KPIs,table,mv_finance_kpis,P1,owner,studio_manager,accountant
Finance,Payments & Billing,Payments,table,payments,P1,accountant,owner,studio_manager
Finance,Payments & Billing,Provider webhooks,table,webhook_deliveries,P1,accountant,owner
Finance,Swiss Payments,Invoices (QR),table,invoices,P1,accountant,owner
Finance,Swiss Payments,QR generator,rpc,generate_qr_bill,P1,accountant,owner
Finance,Swiss Payments,Bank import,table,bank_imports,P1,accountant,owner
Finance,Wallet Management,Wallets,table,wallets,P1,accountant,owner,studio_manager
Finance,Wallet Management,Rules/eligibility,rpc,wallet_eligibility,P1,accountant,owner,studio_manager
Finance,Financial Reports,VAT report,view,vw_tax_report,P1,accountant,owner
Finance,Financial Reports,Payouts,table,payouts,P2,accountant,owner
Finance,Financial Reports,Instructor earnings,table,earnings,P1,accountant,owner,studio_manager,instructor
Settings,General Settings,Tenant prefs,table,settings,P1,owner,studio_manager
Settings,System Health,SIS dashboard,table,sis_runs,P1,owner
Settings,API & Integrations,API keys,table,api_keys,P1,owner
Settings,API & Integrations,Webhooks,table,webhooks,P1,owner
Settings,Compliance & Legal,Consents,table,consents,P1,owner,marketer
Settings,Compliance & Legal,DSAR,table,dsar_requests,P2,owner
Settings,Security,Audit log,table,audit_logs,P1,owner
Settings,Security,Impersonation,table,impersonation_sessions,P1,owner
People,Payroll & Compensation,Pay rules,table,pay_rules,P1,owner,studio_manager,accountant
People,Payroll & Compensation,Earnings compute,rpc,compute_earnings,P1,owner,studio_manager,accountant
People,Payroll & Compensation,Period close,rpc,close_payroll,P1,owner,studio_manager,accountant
People,Payroll & Compensation,Payout export,table,payouts,P1,accountant,owner
Community,Messaging & Inbox,Threads,table,threads,P2,owner,studio_manager,instructor,front_desk,marketer
Community,Messaging & Inbox,Messages,table,thread_messages,P1,owner,studio_manager,instructor,front_desk,marketer
Community,Messaging & Inbox,Realtime channel,realtime,thread_messages,P1,owner,studio_manager,instructor,front_desk,marketer
Community,Messaging & Inbox,Attachments,storage,media-messages,P2,owner,studio_manager,instructor,front_desk,marketer
Community,Messaging & Inbox,Moderation queue,table,moderation_queue,P2,owner,studio_manager
```

---

## 2) SIS Checks (CSV)
Representative health checks your runner should execute.

```csv
id,area,page,component,name,resource_type,resource_ref,expectation_json,severity
1,Classes,Booking Engine,Checkout,Reserve slot RPC returns hold id,rpc,reserve_slot,"{""expects"":""hold_id"",""role"":""front_desk|studio_manager"",""timeout_ms"":1500}",critical
2,Classes,Booking Engine,Checkout,Capture payment RPC succeeds in sandbox,rpc,capture_payment,"{""expects"":""payment_id"",""role"":""front_desk|studio_manager"",""sandbox"":true}",critical
3,Classes,Registrations,Roster,RLS: instructor reads own class only,table,class_registrations,"{""policy"":""instructor_owns_instance"",""probe"":""instructor_user""}",critical
4,Classes,Recurring Classes,Generator,Generate occurrences within range,rpc,generate_class_occurrences,"{""expects"":"" >0_rows "",""role"":""studio_manager""}",high
5,Finance,Swiss Payments,Invoices (QR),QR bill payload validates,rpc,generate_qr_bill,"{""expects"":""pdf_url&qr_payload_ok"",""role"":""accountant""}",critical
6,Finance,Payments & Billing,Webhooks,Recent deliveries < 5% failures,table,webhook_deliveries,"{""expects"":""failure_rate<0.05"",""window"":""24h""}",critical
7,Finance,Wallet Management,Eligibility,Eligibility RPC enforces rules,rpc,wallet_eligibility,"{""expects"":""eligible:true|false with reason"",""role"":""front_desk""}",high
8,People,Payroll & Compensation,Earnings compute,Earnings match roster x rules,rpc,compute_earnings,"{""expects"":"" >=0_rows & no_error "",""role"":""accountant""}",critical
9,People,Customers,Consents,RLS: marketer sees consent only,table,consents,"{""policy"":""tenant_scoped"",""probe"":""marketer_user""}",high
10,Settings,System Health,SIS dashboard,SIS nightly run exists,table,sis_runs,"{""expects"":""row_in_24h""}",high
11,Settings,Security,Audit log,Audit writes from impersonation,table,audit_logs,"{""expects"":""impersonation_action_logged""}",high
12,Marketing,Automations,Journeys,Realtime receives insert within 3s,realtime,journeys,"{""expects"":""insert_event<=3000ms""}",high
13,Shop,Pricing & Packages,Memberships,Subscription row with status=active,table,subscriptions,"{""expects"":"" >=1_active "",""role"":""studio_manager""}",high
14,Community,Messaging & Inbox,Realtime channel,New message event received in 2s,realtime,thread_messages,"{""expects"":""insert_event<=2000ms"",""role"":""instructor|front_desk""}",high
15,Community,Messaging & Inbox,Moderation queue,Flagged messages appear in queue,table,moderation_queue,"{""expects"":"" >=1_flagged_in_24h ""}",medium
```

> Note: The JSON is double-braced here for Markdown display. Store as proper JSON in `sis_checks.expectation_json`.

---

## 3) Implementation Tickets (Agent Backlog)

### Conventions
- **Schema**: table/view + indexes + RLS + seeds  
- **RPC**: function body + tests + policy  
- **UI**: Supabase client wiring, empty/error states, i18n  
- **SIS**: probe added, nightly run green

### Dashboard
1. **Overview › KPI tiles view** — `table:mv_finance_kpis` — **P1**  
   - Schema/RLS; UI; SIS check green
2. **Overview › Recent activity feed** — `table:audit_logs` — **P2**
3. **Overview › Alerts widget** — `table:system_alerts` — **P1**

### People
1. **Customers › List & filters** — `table:customers` — **P1**
2. **Customers › Profile core** — `table:customers` — **P1**
3. **Customers › Consents tab** — `table:consents` — **P1**
4. **Customers › Wallets tab** — `table:wallets` — **P1**
5. **Customers › Wallet ledger** — `table:wallet_ledger` — **P1**
6. **Instructors › List & profile** — `table:instructors` — **P1**
7. **Instructors › Availability** — `table:instructor_availability` — **P1**
8. **Instructors › Earnings tab** — `table:earnings` — **P1**
9. **Staff Management › Pay rates** — `table:pay_rules` — **P1**
10. **Staff Management › Timesheets** — `table:timesheets` — **P1**
11. **Customer Wallets › Balances** — `table:wallets` — **P1**
12. **Customer Wallets › Adjustments** — `rpc:wallet_adjust` — **P1**
13. **Communications › Inbox** — `table:messages` — **P2**
14. **Communications › Templates** — `table:message_templates` — **P2**
15. **Payroll & Compensation › Pay rules** — `table:pay_rules` — **P1**
16. **Payroll & Compensation › Earnings compute** — `rpc:compute_earnings` — **P1**
17. **Payroll & Compensation › Period close** — `rpc:close_payroll` — **P1**
18. **Payroll & Compensation › Payout export** — `table:payouts` — **P1**

### Classes
1. **Class Schedule › Calendar** — `table:class_occurrences` — **P1**
2. **Booking Engine › Checkout** — `rpc:reserve_slot` — **P1**
3. **Booking Engine › Capture payment** — `rpc:capture_payment` — **P1**
4. **Advanced Scheduling › Bulk editor** — `table:class_instances` — **P2**
5. **Advanced Scheduling › Blackout dates** — `table:blackouts` — **P2**
6. **Recurring Classes › Generator** — `rpc:generate_class_occurrences` — **P1**
7. **Registrations › Roster** — `table:class_registrations` — **P1**
8. **Registrations › Check-in** — `rpc:mark_attendance` — **P1**
9. **Registration System › Policies** — `table:registration_policies` — **P2**
10. **Cancellation & Refunds › Refund wizard** — `rpc:cancel_and_refund` — **P1**
11. **Locations & Resources › Locations** — `table:locations` — **P1**
12. **Locations & Resources › Rooms** — `table:rooms` — **P2**
13. **Outdoor Locations › Weather policy** — `edge:weather_decision` — **P3**
14. **Retreat Management › Retreats** — `table:retreats` — **P2**
15. **Retreat Management › Retreat pricing** — `table:retreat_prices` — **P2**

### Shop
1. **Products › Catalog** — `table:products` — **P2**
2. **Products › Media** — `storage:media-products` — **P2**
3. **Pricing & Packages › Class passes** — `table:packages` — **P1**
4. **Pricing & Packages › Memberships** — `table:subscriptions` — **P1**
5. **Inventory › Stock ledger** — `table:inventory_ledger` — **P2**

### Marketing
1. **Campaign Management › Builder** — `table:campaigns` — **P2**
2. **Campaign Management › Sends** — `table:messages` — **P2**
3. **Customer Segments › Builder** — `table:segments` — **P2**
4. **Analytics & Reports › Attribution** — `table:mv_marketing_attribution` — **P3**
5. **Business Growth › Referrals** — `table:referrals` — **P3**
6. **Automations › Journeys** — `table:journeys` — **P2**

### Finance
1. **Overview › KPIs** — `table:mv_finance_kpis` — **P1**
2. **Payments & Billing › Payments** — `table:payments` — **P1**
3. **Payments & Billing › Webhooks** — `table:webhook_deliveries` — **P1**
4. **Swiss Payments › Invoices (QR)** — `table:invoices` — **P1**
5. **Swiss Payments › QR generator** — `rpc:generate_qr_bill` — **P1**
6. **Swiss Payments › Bank import** — `table:bank_imports` — **P1**
7. **Wallet Management › Wallets** — `table:wallets` — **P1**
8. **Wallet Management › Eligibility** — `rpc:wallet_eligibility` — **P1**
9. **Financial Reports › VAT report** — `view:vw_tax_report` — **P1**
10. **Financial Reports › Payouts** — `table:payouts` — **P2**
11. **Financial Reports › Instructor earnings** — `table:earnings` — **P1**

### Settings
1. **General Settings › Tenant prefs** — `table:settings` — **P1**
2. **System Health › SIS dashboard** — `table:sis_runs` — **P1**
3. **API & Integrations › API keys** — `table:api_keys` — **P1**
4. **API & Integrations › Webhooks** — `table:webhooks` — **P1**
5. **Compliance & Legal › Consents** — `table:consents` — **P1**
6. **Compliance & Legal › DSAR** — `table:dsar_requests` — **P2**
7. **Security › Audit log** — `table:audit_logs` — **P1**
8. **Security › Impersonation** — `table:impersonation_sessions` — **P1**

### Community (NEW)
1. **Messaging & Inbox › Threads** — `table:threads` — **P2**
2. **Messaging & Inbox › Messages** — `table:thread_messages` — **P1**
3. **Messaging & Inbox › Realtime channel** — `realtime:thread_messages` — **P1**
4. **Messaging & Inbox › Attachments** — `storage:media-messages` — **P2**
5. **Messaging & Inbox › Moderation queue** — `table:moderation_queue` — **P2**

---

## 4) SIS SQL Schema (paste into Supabase SQL editor)
```sql
create table if not exists sis_inventory(
  area text,
  page text,
  component text,
  resource_type text, -- table|rpc|view|storage|realtime|edge
  resource_ref text,
  criticality text,
  owner_role text
);

create table if not exists sis_checks(
  id bigint primary key,
  area text,
  page text,
  component text,
  name text,
  resource_type text,
  resource_ref text,
  expectation_json jsonb,
  severity text -- critical|high|medium|low
);

create table if not exists sis_runs(
  id bigserial primary key,
  started_at timestamptz default now(),
  actor uuid,
  environment text,
  result text, -- ok|warn|fail
  duration_ms integer
);

create table if not exists sis_results(
  run_id bigint references sis_runs(id) on delete cascade,
  check_id bigint references sis_checks(id) on delete cascade,
  status text, -- ok|warn|fail
  latency_ms integer,
  sample_count integer,
  message text
);
```

---

## 5) Community Messaging & Inbox — Requirements

### Goals
- Provide **safe, tenant-scoped** communications: 1:1 (front desk ↔ customer), group (class/retreat thread), and announcements.  
- Support **moderation**, **spam controls**, **attachments**, **push/email bridges**, and **Realtime** updates.

### Data Model
- `threads`: `id`, `tenant_id`, `type` (`class`, `retreat`, `direct`, `announcement`), `title`, `context_id`, `created_by`, `visibility` (`org`, `roster`, `staff`), `locked`, `created_at`
- `thread_members`: `thread_id`, `user_id` (auth.users), `role` (`owner`, `moderator`, `member`), `joined_at`, **RLS** ensures only members can read.
- `thread_messages`: `id`, `thread_id`, `sender_id`, `body`, `body_html`, `attachments` (json), `edited_at`, `deleted_at`, `created_at`
- `moderation_queue`: `message_id`, `reason`, `state` (`pending`, `approved`, `rejected`), `reviewed_by`, `notes`
- Storage bucket `media-messages` with signed URLs policy.
- Optional `email_bridge` for class announcements → email/SMS for recipients who opt in.

### Permissions & RLS
- **Tenant isolation** by `tenant_id` on threads and membership join table.
- **Members-only** read; staff roles can create announcements to `roster`.
- Instructors cannot DM customers outside rosters unless customer opted-in.
- Auditors/read-only cannot access message content (only metadata counts).

### Features
- **Inbox** with folders: All, Unread, Mentions, Moderation, Archived.
- **Composer**: attachments (images/pdf), @mentions, emoji, saved replies, templates.
- **Realtime** message stream, read receipts, typing indicators (rate-limited).
- **Class thread auto-creation** on first registration; auto-archive after period.
- **Moderation**: keyword lists, report message, quarantine pending review.
- **Bridges**: optional email/SMS digests; respect consents and quiet hours.
- **Search** across thread titles and message snippets (tenant-scoped).

### SIS Inventory (already included above)
- Threads / Messages / Realtime / Attachments / Moderation queue.

### SIS Checks (added above)
- Realtime latency, moderation presence, message write under RLS.

### Acceptance
- Non-members cannot fetch thread/messages (RLS proves 0 rows).  
- Message delivery realtime ≤2s; attachments served via signed URL.  
- Moderation toggles visibility without permanent data loss.  
- Opt-out removes user from thread members and halts bridges.

---

## 6) Acceptance & Rollout

- SIS nightly run turns **green** across P1 areas before GA.  
- Audit export proves cross-tenant privacy and role isolation.  
- Localization coverage report ≥ 99% strings for de‑CH, fr‑CH (*tu*), it‑CH, en‑CH.  
- A11y audit (axe) passes on critical screens.  
- Data import dry-run completes with dedupe/merge outcomes logged.

---

## 7) Next Steps (Agent)

1) Create `sis_*` tables, import **Inventory** and **Checks** CSV content.  
2) Implement P1 tickets per section; wire UI + RLS + RPC.  
3) Add SIS runner (nightly + on-demand), expose header status chip.  
4) Stand up Community Messaging with Realtime & Storage and moderation queue.  
5) Turn on feature flags per tenant; pilot with one studio; expand.
