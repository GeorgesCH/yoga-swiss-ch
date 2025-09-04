# YogaSwiss Platform — Supabase + React/React Native Architecture & Requirements

> World‑class, full‑feature alternative to Eversports, Mindbody, bsport & Arketa — optimized for Switzerland (CH) and EU.

---

## 0) Product Vision & Principles

**Vision.** Be the most trusted operating system for yoga & wellbeing studios in Switzerland: delightful booking for students, powerful tools for studios, transparent pricing, and EU/CH‑grade privacy.

**Product pillars.**
1. **Booking that never fails** (fast, mobile‑first, frictionless checkout, wallets/passes/subscriptions).
2. **Pro‑grade admin** (recurring schedules, waitlists, instructor payroll, analytics, payouts).
3. **Growth engine** (CRM, automations, referrals, gift cards, marketplace, branded apps).
4. **Trust & compliance** (GDPR + nLPD, Swiss VAT/QR‑bill, strong RLS, audit trails).
5. **Performance & reliability** (99.9% target, real‑time updates, graceful offline on mobile).

**Personas.** Studio Owner, Front‑Desk Staff, Instructor, Student, Accountant, Super‑Admin.

---

## 1) Competitive Parity & Differentiators

**Parity checklist** (drawn from Eversports, Bsport, Mindbody, Arketa): 
- Scheduling (group/private/recurring), memberships & passes, online payments, branded web/app, client CRM, email/automations, reporting, marketplace exposure, staff management, attendance, waitlists, packages, coupons, gift cards, POS, video/VOD, retreats, corporate programs.

**Differentiators.**
- Switzerland‑first: TWINT, Swiss QR‑bill invoicing, multilingual (FR/DE/IT/EN), CHF‑native VAT.
- Transparent pricing (low fees), fast checkout, wallet credits, no‑show/cancellation automation.
- Instructor payroll & substitution workflows, staff time‑tracking, cross‑location memberships.
- Open data: easy CSV import/export; API and webhooks; vendor lock‑in resistance.
- AI assistant for customer queries and marketing copy, saving staff 10+ hrs/week.
- Accessibility (WCAG 2.2 AA), SEO‑optimized landing pages, Reserve with Google integration.

---

## 2) High‑Level System Architecture

**Stack overview.**
- **Database/Backend:** Supabase (Postgres 15+), RLS, PostgREST, Realtime, Storage, pg_cron, pg_net.
- **Edge compute:** Supabase Edge Functions (Deno) for webhooks, PDFs, ICS, imports, AI assistant.
- **Web app:** Next.js, TypeScript, Tailwind + shadcn/ui, TanStack Query, React Hook Form, Zod, next‑intl.
- **Mobile app:** React Native (Expo), Expo Router, NativeWind/Tailwind, Zustand/TanStack Query, push via Expo.
- **Analytics/Observability:** Sentry, PostHog, OpenTelemetry, Supabase logs.
- **Payments:** Stripe (Cards/Apple Pay/Google Pay), TWINT, Datatrans/Wallee integration, Stripe Connect payouts.
- **Messaging:** Brevo/Resend email, WhatsApp Business API, push via Expo.
- **Search:** Postgres FTS + pg_trgm; optional pgvector.

**Monorepo.** Turborepo + pnpm with packages: `ui`, `types`, `config`, `mobile`, `web`, `edge`, `scripts`.

**Environments.** `dev` → `staging` → `prod`.

---

## 3) Multi‑Tenant Model & Access Control

**Organizations (tenants)** own studios/locations. Users can belong to multiple orgs with roles.

- `organizations` — tenant root (branding, VAT, features).
- `memberships` — (user_id, org_id, role: owner/admin/manager/instructor/staff/accountant).
- `locations`, `instructors`, `customers`, `customer_orgs` (GDPR consent based).

**RLS.** Tenant isolation via `org_id`. Policies check `memberships`. Public views expose only allowed data.

---

## 4) Domain Model (Modules & Tables)

Major modules: Identity & CRM, Scheduling, Attendance, Commerce, Payments, Registrations/Policies, Messaging/Automation, Analytics/Admin. 

Includes: recurrence engine with `RRULE`, waitlists, substitutions, loyalty/points, instructor payroll, refunds, penalties, automations (winback, reminders, abandoned cart), AI assistant logs.

---

## 5) Key Flows

### Booking & Checkout (students)
- Discover → Book class → If credits available: auto confirm; else → select drop‑in/pass/subscription.
- Pay via Stripe/TWINT. 
- Grant entitlements, confirm registration, send calendar `.ics`, notify.
- Waitlist: join, see position, auto‑promotion with notifications.
- Cancellation: before cutoff refund; after cutoff apply penalty.

### Admin & Staff
- Create classes/events/courses/retreats; manage recurring patterns.
- Manage memberships, passes, vouchers, gift cards.
- Handle substitutions, instructor time‑tracking, payroll exports.
- Marketing automations: email/SMS/push, AI‑generated copy/images.
- Analytics dashboards: revenue, retention, occupancy, churn.

### Instructor (mobile light mode)
- View own schedule & rosters.
- Check‑in attendees, mark no‑shows.
- Request subs, view pay stats.
- Communicate with class attendees.

---

## 6) Web Platform — Consumer Booking (SEO)

- **Home/Search:** SEO landing pages per city/style; filters (date, type, location).
- **Studio Profile:** branding, amenities, instructors, reviews, schedule, map.
- **Booking:** class detail → book → pay/pass → confirmation.
- **Account:** bookings, passes, invoices, profile, preferences.
- **Reviews/Referrals:** leave reviews, referral program, invite friends.
- **Corporate/Gift Cards:** landing pages.

## 7) Web Platform — Studio Admin

- **Dashboard:** KPIs, alerts.
- **Schedule:** calendar (day/week/month), drag‑drop, recurring, workshops, courses.
- **CRM:** clients with tags/segments, import/export, notes.
- **Staff:** add instructors/staff, roles/permissions, substitution workflow.
- **Pricing:** memberships, passes, vouchers, retail items, intro offers.
- **Attendance:** rosters, check‑in, self check‑in kiosk/QR.
- **Financials:** sales log, POS, invoices, recurring billing, payouts.
- **Reports:** revenue, attendance, churn, payroll, marketing metrics.
- **Marketing:** campaigns, workflows, AI assistant integration.
- **Integrations:** Zoom, Reserve with Google, Mailchimp, ClassPass, QuickBooks.
- **Multi‑location:** cross‑org reporting, shared memberships.
- **Security:** audit logs, 2FA, GDPR compliance.

---

## 8) Mobile App — Student

- **Onboarding:** sign‑up/login, saved auth.
- **Discover & Book:** schedule, filters, favorites, fast checkout (Apple/Google Pay).
- **My Schedule:** upcoming/past bookings, cancellations, calendar integration.
- **Wallet:** passes, memberships, loyalty points.
- **Waitlist:** join, see position, notifications.
- **Check‑in:** geo or QR.
- **Community:** friends, see friends’ bookings, invite.
- **Digital Content:** video library, livestream join, recordings.
- **Loyalty/Referrals:** points, referral credits, badges.
- **Profile:** info, billing, subscriptions, notifications, privacy.
- **Support:** FAQ, chat (AI assistant), contact studio.

## 9) Mobile App — Instructor/Staff

- **Login mode:** staff vs student.
- **Today’s Classes:** list + roster.
- **Roster view:** check‑in/out, notes, offline caching.
- **Schedule:** week/month view, request subs.
- **Push alerts:** cancellations, subs, class updates.
- **Stats:** class count, pay estimate.
- **Messaging:** class announcements to attendees.

---

## 10) Swiss‑Specific

- Payments: Stripe + TWINT, Datatrans/Wallee fallback.
- Invoices: Swiss QR‑bill PDF with payload.
- Compliance: GDPR + nLPD, VAT breakdowns, consent logs.

---

## 11) AI Assistant

- 24/7 chatbot for client queries (schedule, policies, bookings).
- Books/cancels via conversational interface.
- Learns studio tone/voice.
- Integrated with web/mobile chat and WhatsApp.
- Admin interface to train FAQs.

---

## 12) Roadmap Phases

- **Phase 0:** Foundations: auth, orgs, RLS, Stripe.
- **Phase 1:** Classes & booking engine, passes, wallets.
- **Phase 2:** CRM, subscriptions, automations, QR‑bill.
- **Phase 3:** Analytics, marketplace SEO, instructor payroll, Connect payouts.
- **Phase 4:** Mobile offline support, branded apps, AI assistant rollout.

---

**End of updated architecture.md**

