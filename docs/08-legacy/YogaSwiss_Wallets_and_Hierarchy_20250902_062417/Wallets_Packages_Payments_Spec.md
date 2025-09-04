# Wallets, Packages & Payments — Full Spec

> Switzerland-ready (CHF, VAT incl./excl., **TWINT**, **Swiss QR-bill**). Designed for **Supabase + React + React Native**. Privacy by default (RLS), idempotent finance, multi-tenant at Studio/Instructor org scope.

## Executive summary (50-word wallet model)
Model **wallets per org per user**: `wallets(id, user_id, org_id, kind{customer|gift|promotion}, owner_type{studio|instructor}, balance, credits)`. Enforce RLS by `org_id`. Orders, packages, passes reference `wallet_id`. Use **ledger entries** + materialized balances, idempotent RPCs, async events. Scale with partitioned tables, queues, caching, reconciliation jobs, and alerts.

## Objects & Relationships
| Object | Purpose | Key FKs |
|---|---|---|
| **wallets** | Monetary & credit store **scoped to an org** (Studio/Instructor) for one user | `user_id`, `org_id`, `owner_type`, `kind` |
| **wallet_ledger** | Immutable double-entry style rows (credit/debit) | `wallet_id`, `order_id?`, `payment_id?`, `reason` |
| **packages** | **Packs** (credits) & **Memberships** (time-based) product definitions | `org_id`, pricing, rules |
| **passes** | Purchased instance of a package (credits/allowance + expiry) | `package_id`, `wallet_id` |
| **orders / order_items** | Commercial intent and lines (registrations, passes, retail) | `org_id`, `customer_id`, `wallet_id?` |
| **payments** | Captures/settlements (card/TWINT/cash/bank/account_credit) | `order_id`, provider refs |
| **refunds** | Partial or full returns (original method or wallet credit) | `payment_id`, `order_id` |
| **invoices / credit_notes** | Legal docs (VAT, **QR-bill**) | `order_id` |
| **reconciliation** | Matching provider payouts & bank statements | `payment_id`, `payout_id` |

**Multi-wallet:** a user can hold **many wallets** (one per Studio/Instructor). **Never mix** balances across orgs. Use `unique(user_id, org_id, kind)` to cap duplicates where desired.

## Core Schemas (SQL-ish)
```sql
create table wallets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  owner_type text check (owner_type in ('studio','instructor')) not null,
  user_id uuid not null,
  kind text not null default 'customer' check (kind in ('customer','gift','promotion')),
  currency text not null default 'CHF',
  balance_cents bigint not null default 0,
  credits int not null default 0,
  status text not null default 'active' check (status in ('active','frozen','closed')),
  created_at timestamptz default now(),
  unique (org_id, user_id, kind)
);

create table wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid references wallets(id) on delete cascade,
  ts timestamptz not null default now(),
  entry_type text not null check (entry_type in ('debit','credit')),
  amount_cents bigint not null default 0,
  credits_delta int not null default 0,
  reason text not null,
  order_id uuid,
  payment_id uuid,
  pass_id uuid,
  metadata jsonb default '{}',
  constraint nonzero check (amount_cents <> 0 or credits_delta <> 0)
);

create table packages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  kind text not null check (kind in ('pack','membership','gift_card')),
  name text not null,
  description text,
  price_cents bigint not null,
  tax_mode text not null check (tax_mode in ('inclusive','exclusive')),
  vat_rate numeric(5,2) default 0.0,
  credits int,
  duration_days int,
  shareable bool default false,
  transferable bool default false,
  per_org_only bool default true,
  renewal_kind text check (renewal_kind in ('manual','auto')) default 'manual',
  is_active bool default true
);

create table passes (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references packages(id),
  wallet_id uuid references wallets(id),
  starts_at timestamptz,
  expires_at timestamptz,
  remaining_credits int,
  status text not null default 'active' check (status in ('active','expired','frozen','used','refunded'))
);
```

## RLS (conceptual)
- `wallets`, `wallet_ledger`, `passes` → **select/update** only when `org_id = auth.org_id()` and user is wallet owner or org staff with finance permissions. Instructors do **not** see arbitrary customer wallets unless explicitly granted (masked by default).

## Flows
**Pay with account credit** → debit wallet (idempotent), create `payment(method=account_credit)`; allow split tender.  
**Use pack credits** → consume from FIFO non-expired passes; ledger `credits_delta=-N`.  
**Membership booking** → validate active; dunning policy may block or warn.  
**Refunds** → wallet credit by default (if allowed), else original method; restore credits if eligible; issue credit note.

## Payments & Providers
Stripe (cards & wallets), **TWINT** (Datatrans/Wallee), **QR-bill** for bank transfer; webhooks with retries, reconciliation imports (payouts, CAMT.053).

## Scalability & Safety
Partition `wallet_ledger` (by month/org); materialize balances; idempotent RPCs; jobs (expiry, dunning, payout import, audit); alerts (negative wallet, recon mismatch).

## Admin Dashboard
Wallets per customer (per org), manual adjust with reason & audit; packages CRUD; passes list/freeze/extend; payments view; reports: wallet & gift card liability, pass breakage, VAT, reconciliation.

## Acceptance
Ledger is truth; no cross-org leaks; refunds/liabilities audited; exports validate.
