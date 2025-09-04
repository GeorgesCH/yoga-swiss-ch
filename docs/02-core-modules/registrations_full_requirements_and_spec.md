# Registrations — Full Requirements & Spec

A complete, implementation‑ready specification for managing **registrations (bookings)** across classes, workshops, courses/series, private sessions, and events. Covers data model, flows, policies, waitlist, payments, check‑in, communications, RLS, and QA. Web (admin/front‑desk/instructor) + Mobile (student, instructor‑lite).

> Swiss‑ready: TWINT, account credit, VAT incl/excl, multilingual (FR/DE/IT/EN), GDPR/nLPD.

---

## 1) Concepts & Scope
- **Registration**: a customer’s reservation for a specific **occurrence** (date/time) of a class/workshop/course/event.
- **Ticket**: the priced unit attached to a registration (drop‑in price, credit use, membership entitlement, tier).
- **Attendee**: person checked in (may be the buyer or a guest/child).
- **Order**: commercial container for one or more tickets; produces payment(s)/invoice(s).
- **Eligibility**: rule set deciding if a registration is allowed (capacity, age, membership/pass, tag restrictions, booking window, sales cutoff).

---

## 2) Lifecycle & States
**Registration.status**
- `pending_payment` (hold/awaiting payment)
- `confirmed` (seat reserved)
- `waitlisted` (in queue)
- `canceled_by_client`
- `canceled_by_studio`
- `no_show`
- `refunded` (terminal; mirrors order)

**Attendance.status** (per occurrence)
- `present` | `late` | `no_show` | `excused`

**State rules**
- Move to `confirmed` only after: payment captured **or** valid membership/pass/credit deducted **or** comp.
- If `pending_payment` exceeds **hold window** (configurable, default 15 min online / 5 min POS), auto‑release seat.
- Studio‑initiated cancels never penalize the client (fees/credits return automatically).

---

## 3) Booking Flows
### 3.1 Student (Web/Mobile)
1) Pick occurrence → eligibility check (capacity, window, product restrictions).
2) Choose ticket option (price/credits/tier) + add‑ons; guest/child toggle if enabled.
3) Pay: Apple/Google Pay, card, TWINT, account credit (except subscriptions), or use pass/membership.
4) Success → **confirmed** + ICS email/push; wallet/membership debited; invoice issued.

**Edge**: Sliding scale → enter amount within min–max; Free → optional donation.

### 3.2 POS / Front‑Desk
- Quick create customer → choose ticket or comp → mark paid method → **confirmed** immediately; print/email receipt.

### 3.3 Waitlist
- Join waitlist when full; capture payment method **or** reserve on promote only (configurable).
- Auto‑promote rules: by FIFO; offer window (e.g., 60 min). If auto‑charge on promote, send receipt + confirmation.

### 3.4 Course/Series
- Book **entire series** (single order -> many registrations) or **allow drop‑ins** if enabled.
- If booking entire series, partial conflicts are shown; user may accept misses or pick alternate make‑ups if policy allows.

### 3.5 Private Sessions
- Unlisted; direct link; may require staff approval; payment up‑front or deposit.

---

## 4) Policies (Enforcement)
- **Cancellation cutoff** (per class/product or org default): hours before start.
- **Late cancel fee**: fixed CHF or credit policy; membership exemption optional.
- **No‑show fee**: fixed CHF or credit policy; staff may waive.
- **Book now, pay later**: allowed online if enabled; check‑in blocked if unpaid unless staff override.
- **Sales cutoff**: minutes before start (can be negative to allow booking after start).
- **Guest booking**: requires product eligibility for guests.

**Policy engine order**: entitlement → capacity → window/cutoff → payments → final commit.

---

## 5) Edits & Moves (see Recurring spec for series edits)
- Change ticket (price→pass): re‑price and issue refund/credit difference.
- Move to another occurrence: capacity check → move roster + seat (if spot selection) → carry payments; if price differs, charge/refund delta.
- Transfer ticket to another person: allowed if policy permits; keep order but change attendee; audit log.

---

## 6) Check‑In & Roster
- Methods: front‑desk roster, instructor app (offline queue), QR self check‑in, geofence, auto from livestream link.
- Check‑in rules: unpaid → blocked unless override; waiver unsigned → prompt to sign.
- Roster actions: mark present/late/no‑show, add note, comp seat, quick refund/cancel.

---

## 7) Payments & Refunds
- Payment methods: card, Apple/Google Pay, TWINT, bank transfer (manual), cash, account credit.
- Refund paths: to **account credit** (default if enabled) or to original method; partial refunds supported.
- Credits: decrement on book, return on eligible cancellation; expiry respected.
- Invoices: VAT incl/excl per org; Swiss QR‑bill PDF if enabled.

---

## 8) Communications
- Booking confirmation (email/push), reminders (configurable), waitlist promotion, cancellation/move notices, receipts/invoices.
- ICS calendar attachments on create/move; updates on reschedule.
- Multi‑language templates; variables documented.

---

## 9) Data Model (high level)
- `registrations` (id, org_id, customer_id, occurrence_id, status, source web/pos/app, entitlement_type price/pass/membership/comp, ticket_tier_id, credits_used, hold_expires_at, policy_snapshot jsonb, notes, created_at)
- `attendees` (id, registration_id, person_id [=customer or dependent], seat_id nullable, checkin_status, checkin_at)
- `orders` (id, org_id, customer_id, channel, currency, total, tax_total, status, metadata)
- `order_items` (order_id, registration_id?, product_id?, price, tax, quantity, type=registration/addon)
- `payments` (id, order_id, method, amount, status, provider_ref)
- `refunds` (id, payment_id?, order_id, amount, reason, status)
- `waitlists` (id, occurrence_id, customer_id, position, hold_expires_at, status)
- `eligibility_rules` (per class/product)

**Indexes**: `registrations (org_id, occurrence_id, status)`, `waitlists (occurrence_id, position)`, `attendees (registration_id)`; RLS by org and user relation.

---

## 10) RPCs & Triggers
- `book_occurrence(customer_id, occurrence_id, ticket_json)` → idempotent key prevents dupes; validates eligibility; handles payment intent; commits registration.
- `cancel_registration(registration_id, actor, reason)` → applies policy, returns credits/refunds, frees seat, notifies; blocks if past start unless override.
- `move_registration(registration_id, target_occurrence_id)` → capacity + price delta; seat carryover.
- `join_waitlist(customer_id, occurrence_id)`; `promote_waitlist(occurrence_id)` worker.
- `resolve_unpaid_holds()` cron: releases `pending_payment` after hold window.
- `compute_policy_snapshot(occurrence_id, customer_id)` used to cache applied rules.

---

## 11) RLS & Permissions
- Customers: select only own registrations and dependents.
- Instructors: registrations for occurrences they teach.
- Front‑desk/managers: org‑wide within assigned locations.
- Super admin: support impersonation (audited).

---

## 12) UI (Web)
- **Registrations list**: filters by date range, status, location, class, teacher, product, source; bulk actions (cancel, message, export, move).
- **Roster view**: quick check‑in, add walk‑in, waitlist panel, policy badges, outstanding balances.
- **Registration detail**: timeline (create, payments, moves), policy snapshot, communications, invoice links.

**Mobile (student)**: My bookings list, cancel/reschedule within policy, waitlist position, add to calendar, receipt.

---

## 13) Concurrency & Safety
- Use `FOR UPDATE SKIP LOCKED` on seat allocation; optimistic idempotency key per (customer_id, occurrence_id).
- Prevent double booking (same occurrence) unless guest seats enabled.
- Never hard‑delete with payments present; use `status` transitions with audit trail.

---

## 14) Analytics & Reporting
- KPIs: bookings, cancels, late/no‑show rate, utilization, revenue per registration, waitlist fill rate.
- MVs: `mv_bookings_daily`, `mv_occupancy_daily`, `mv_policy_outcomes`.

---

## 15) QA & Acceptance Criteria
- Booking → confirmation + ICS in < 30s; capacity decremented accurately with race‑free behavior.
- Cancellation before cutoff returns credits/refunds instantly; after cutoff applies fee rules.
- Waitlist auto‑promotes within 60s of seat becoming available.
- Moving a booked attendee preserves seat map when enabled.
- POS bookings work offline with queued sync, no duplicate charges.

---

## 16) Import/Export
- Import historical registrations from CSV (occurrence matching by slug/date/time; attendee merge by email/phone).
- Export lists with GDPR redaction if needed.

---

## 17) Audit & Events
- Every transition emits `events` with actor, old→new, reason; surfaced in registration detail.

