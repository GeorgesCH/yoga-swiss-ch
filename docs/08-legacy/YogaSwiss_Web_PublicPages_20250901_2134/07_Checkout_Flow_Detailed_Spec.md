# Checkout Flow — Detailed UX & System Requirements

A reliable, fast, and transparent checkout for classes, passes, memberships, workshops, and gift cards.

---

## 1) States & Steps
- **Cart**: line items with quantity/attendees; edit; coupon/gift card entry; corporate badge if eligible.
- **Details**: attendee info (self/guest/child), invoice fields (optional), policy snippet.
- **Payment**: methods based on item type & locale (card, Apple/Google Pay, **TWINT**, SEPA for recurring, wallet).
- **Review & Pay**: summary (net, tax, total today; future installments), terms checkbox, pay button.
- **Success**: confirmation number, QR tickets, add-to-calendar, referral CTA, recommended upsell.

## 2) Special Logic
- **Credits**: apply pass credits; show remaining; mixed payment allowed.
- **Membership**: if included, mark CHF 0 due; start/renew dates; dunning fallback.
- **Order Bump**: add-on (mat rental, intro offer); one tap add.
- **1-Click Upsell** after success with stored token; downsell fallback.
- **Corporate**: consume company wallet or create invoice; show policy (caps, blackout).

## 3) Payments & Compliance
- SCA/3DS flows; retries; webhook reconciliation; idempotent keys.
- VAT inclusive/exclusive display; refund destinations (card/wallet) per policy.
- PDF invoice generation; store legal snapshot of policies accepted.

## 4) Errors & Recovery
- Price changed or seat sold: informative banner; recalc and retry.
- Payment failed: keep cart, show retry + alternate method; dunning for subscriptions.

## 5) Acceptance
- Checkout completion rate improved ≥ 10% vs baseline; median time to pay < 90s.
