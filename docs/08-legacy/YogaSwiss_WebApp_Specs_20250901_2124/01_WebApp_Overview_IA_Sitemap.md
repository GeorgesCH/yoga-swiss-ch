# Web App — Overview, Information Architecture & Sitemap

Consumer-facing website for discovery, booking, and self-service (students/customers). Multilingual (FR/DE/IT/EN), CHF-first; GDPR/nLPD-compliant; responsive; SEO-ready; accessible (WCAG 2.1 AA).

---

## 1) Objectives
- Make it effortless to **discover**, **book**, and **re-book** classes, workshops, and appointments.
- Provide **self-service** for registrations, payments, wallets, invoices, memberships.
- Serve **public pages** for studios & instructors that rank on search engines (structured data).
- Deeply integrate with **Marketing** (funnels, widgets), **Finance**, **Products**, **Online Studio**.

---

## 2) Primary Sections & Top Navigation
- **Home** (`/`): hero search, featured classes, studios, instructors, content.
- **Explore** (`/explore`): faceted search (map/list), filters by date/time, location, level, language, tags.
- **Schedule** (`/schedule`): calendar-like exploration (day/week).
- **Studios** (`/studios`) and **Instructors** (`/instructors`): directories + profiles.
- **Online Studio** (`/online`): VOD & livestream library, courses/challenges.
- **Pricing** (`/pricing`): passes, memberships, gift cards.
- **About / FAQ** (`/about`, `/faq`) ; **Blog/Guides** (optional).

**Account** (authed):
- **My Account** (`/account`): profile & preferences.
- **My Bookings** (`/account/bookings`): upcoming/past, waitlists, transfers.
- **Wallet & Payments** (`/account/wallet`), **Payment Methods**, **Invoices**.
- **Memberships & Passes** (`/account/memberships`).
- **Loyalty & Referrals** (`/account/rewards`).
- **Notifications & Inbox** (`/account/inbox`).
- **Privacy** (`/account/privacy`): consents, data export/delete.

---

## 3) Sitemap (abridged)
- `/`
- `/explore` + query params + `/explore/map`
- `/classes/{slug-or-id}` (class template) → `/classes/{slug}/occurrences/{occId}`
- `/workshops/{slug}` / `/events/{slug}`
- `/appointments/{serviceSlug}` (if enabled)
- `/studios`, `/studios/{slug}`
- `/instructors`, `/instructors/{slug}`
- `/online`, `/online/videos/{id}`, `/courses/{id}`
- `/pricing`, `/gift-cards`
- `/checkout` (guarded), `/order/{id}` (success)
- `/auth/login`, `/auth/signup`, `/auth/reset`, `/auth/magic`
- `/account/*` pages as listed above
- Legal: `/terms`, `/privacy`, `/refunds`, `/cookies` (with CMP).

---

## 4) Global UX Systems
- **Header** with locale & currency switcher; auth state; sticky booking cart.
- **Footer** with social, policies, contact.
- **Search bar** omnibox (class, studio, instructor, tags).
- **Toasts** (success/error), **modals** (login, filters), **skeletons** for loading.
- **i18n**: all text in translation files; number/date formatting per locale.
- **Accessibility**: focus order, skip links, keyboard traps prevention, color contrast.
