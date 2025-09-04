# Competitor Driven Feature Spec and Task Breakdown for YogaSwiss

This file turns the architecture into a concrete, exhaustive task plan for web and mobile. It is modeled to at least match Eversports, Mindbody, bsport and Arketa and add Switzerland specific strengths. Intended users are studio owners and managers, instructors and students. Platforms are Web for SEO and admin, Mobile for students plus a light staff view.

---

## Executive summary

* Goal
  * Deliver a delightful booking experience for students and a powerful yet simple back office for studios
  * Win Switzerland with TWINT, Swiss QR bill invoicing, multilingual FR DE IT EN, GDPR and nLPD
* Strategy
  * Ship a thin web marketplace for discovery and a deep studio admin
  * Ship a fast mobile experience for students with push, wallet and self check in, plus a light instructor roster tool
* Success criteria
  * Time to first booking under one minute for a new student with Apple Pay or TWINT on mobile
  * Admin can schedule a recurring class in under forty seconds
  * Ninety nine point nine percent monthly availability target

---

## Roles and platforms

* Roles
  * Student
  * Instructor
  * Studio owner or manager
  * Front desk staff
  * Accountant
  * Super admin
* Platforms
  * Web public site for SEO and booking, plus studio admin dashboard
  * Mobile app for iOS and Android for students and a light instructor view

---

## Competitor parity and differentiators

* Parity checklist we must cover
  * Discovery and SEO pages
  * Booking for classes courses workshops private sessions and events
  * Memberships passes packages subscriptions and vouchers
  * Waitlist with auto promote and notifications
  * Cancellation and no show rules with penalties
  * Online and in person payments with recurring billing
  * Branded widgets and optional branded apps
  * CRM segmentation and automations by email SMS and push
  * Analytics and payroll
  * Video on demand and live stream links
* Differentiators for Switzerland
  * TWINT and SEPA direct debit
  * Swiss QR bill PDF on invoices
  * Four languages FR DE IT EN on web and mobile
  * Fine grained RLS and privacy, self service export and delete
  * Instructor payroll that supports revenue share and per head pay

---

## Web app public site pages and views

* Home
  * Hero with search by city style date
  * Featured studios and featured classes
  * Content blocks for trust and Swiss specifics
* SEO category pages
  * City pages such as Yoga in Zurich, Pilates in Geneva
  * Style pages such as Vinyasa, Yin, Prenatal
  * Instructor list pages per city
  * Internal linking between categories studios and instructors
* Global search
  * Autocomplete for studios instructors styles and cities
  * Filters for date range time window level language price in person or online distance
  * Sort by soonest price rating and distance
* Studio profile
  * About photos amenities map and social links
  * Team with instructor bios and links to their pages
  * Schedule component with tabs for classes courses workshops
  * Reviews and rating with moderation queue
* Instructor profile
  * Bio credentials photos schedule and related studios
* Class detail
  * Description teacher location capacity remaining and policy snippet
  * Book now and add to calendar
  * Similar classes and upsell to pass or membership
* Account portal for students
  * Upcoming bookings and cancellations within policy
  * Purchases memberships passes invoices and receipts
  * Payment methods referral link favorites and notification settings
* Legal and help
  * Privacy policy terms cancellation policy FAQ and contact

---

## Mobile app student screens

* Onboarding and auth
  * Language picker FR DE IT EN
  * Sign up and sign in with email and social login
  * Biometric unlock on return
* Discover and search
  * Nearby classes now and tonight using location
  * Save filters and favorite studios and instructors
* Class card and detail
  * Two tap booking using saved payment or pass
  * Join waitlist with position shown when policy allows
* Wallet and payments
  * Apple Pay or Google Pay and saved card
  * Passes credit balance expiry reminders
  * Membership management upgrade or cancel when policy allows
* My schedule
  * Upcoming and past classes with cancel button and add to calendar
  * Self check in when within geofence or by scanning a QR code
* Video library optional
  * On demand catalog with access based on membership or purchase
  * Live stream join button twenty minutes before start
* Notifications
  * Reminders for classes, waitlist promotions, policy outcomes and receipts
* Support
  * In app help with AI assistant and contact studio

---

## Mobile app instructor light screens

* Today view
  * List of classes they teach with headcount and location
  * Tap into roster to check in attendees and mark no show
* Schedule
  * Week list of upcoming classes
  * Request a substitute for a class with reason
* Class roster
  * Search attendee, notes such as first visit or injury flag
  * Add walk in attendee with quick sale handoff to desk or mark unpaid
* Earnings optional
  * Month to date classes and estimated pay
* Messaging optional
  * Send message to booked attendees for an upcoming class

---

## Admin dashboard modules and views

* Dashboard
  * Today at a glance classes check ins revenue alerts
  * Quick actions create class send campaign issue refund
* Schedule manager
  * Calendar day week and agenda with drag and drop
  * Create class, course or appointment from template
  * Recurrence via RRULE and rolling generation window
  * Substitute workflow and bulk copy week
* Products and pricing
  * Memberships passes packages gift cards vouchers and coupons
  * Price lists tax rates and Swiss VAT inclusive tracking
  * Intro offers and newcomer deals
* Checkout and POS
  * Take payment card cash TWINT bank transfer
  * Sell drop in pass membership gift card
  * Issue invoice with QR bill
* Registrations and roster
  * Per occurrence roster with check in kiosk mode and QR poster
  * Waitlist view with auto promote rules and manual override
  * Policy actions late cancel and no show with penalties
* CRM
  * Clients list with tags segments visits purchases consents
  * Import export and merge duplicates
  * Lead inbox with sources and pipeline
* Staff and instructors
  * Roles and permissions per org and location
  * Pay rules per class per hour per attendee and revenue share
  * Availability calendar and substitution approvals
* Finance
  * Orders transactions payouts settlements refunds
  * Invoices and dunning with email and WhatsApp reminders
  * Reconciliation exports for accounting
* Marketing and automations
  * Email SMS and push campaigns with templates and A or B tests
  * Workflows for welcome winback birthday and abandoned cart
  * Google reviews prompts after attendance
* Settings
  * Branding domains languages payment providers tax and policies
  * Webhooks API keys and feature flags

---

## Switzerland specific compliance checklist

* Payments
  * TWINT via Stripe or Datatrans and SEPA for recurring
* Invoicing
  * Swiss QR bill payload and PDF with correct reference types
* Privacy
  * GDPR and nLPD consent logs export and delete tools
* Languages and locales
  * Full FR DE IT EN coverage for UI copies emails and PDFs

---

## Data model summary for parity

* Core
  * Organizations memberships locations rooms instructors customers
  * Class templates instances occurrences registrations waitlists attendance
* Commerce
  * Products prices coupons vouchers gift cards carts orders order items
  * Wallets transactions invoices refunds settlements payouts
* Content
  * Videos and live links storage objects with signed URL policy
* Messaging
  * Communications templates preferences automations webhooks
* Analytics
  * Materialized views for revenue bookings retention churn LTV payroll

---

## Key RPCs and triggers to implement

* book_occurrence student flow with entitlement checks and idempotency
* cancel_registration with penalty policy and refunds or credit returns
* join_waitlist and auto promote worker with notifications
* grant_pass and grant_membership admin actions
* create_invoice and render_pdf with QR bill and storage upload
* fulfill_order on payment webhook to grant entitlements
* nightly_extend_occurrences via cron for rolling windows
* refresh_analytics for materialized views via cron

---

## Storage and access rules

* Buckets public assets private assets and videos
* All object names start with org id folder, RLS checks membership for write
* Signed URL only for private and video delivery

---

## AI assistant scope and user stories

* Student asks for classes tonight and is booked into a class in chat
* Student asks for policy details parking and directions answered from knowledge base
* Lead writes from Instagram DM import to CRM and start a welcome sequence
* Admin toggles assistant tone of voice and canned answers

---

## Analytics and KPIs

* Revenue daily weekly monthly by org location product and channel
* Occupancy per occurrence and per template plus waitlist fill rate
* Retention cohorts, churn for memberships, reactivation rate
* Instructor payout report per period and rule set
* Campaign impact bookings per send and revenue per segment

---

## QA and acceptance criteria examples

* Booking on mobile new user with Apple Pay or TWINT takes under sixty seconds measured from app open
* Creating a weekly recurring class series takes under forty seconds and produces occurrences for the next ninety days
* Late cancel inside cutoff applies penalty within one minute and sends notification
* Waitlist auto promotion fills freed seats within thirty seconds of cancellation
* QR bill PDF validates with Swiss reference scanners

---

## Delivery plan and workstreams

* Foundations two to three weeks
  * Tenancy auth RLS orgs memberships locations instructors customers
  * Web and mobile shells plus Stripe and TWINT baseline
* Classes and booking three to four weeks
  * Templates recurrence occurrences registrations waitlist policies
  * Mobile student flow and instructor roster
* Commerce and CRM three to four weeks
  * Passes memberships checkout invoices QR bill CRM segments automations
* Analytics and marketplace three to four weeks
  * Dashboards exports SEO pages and instructor payroll
* Polishing ongoing
  * Accessibility localization performance hardening and app store submission

---

## Open questions for product

* Do we run a public marketplace or only white label studio booking
* Which providers for TWINT and SEPA in production Stripe Datatrans or Wallee
* Do studios want visual spot selection and map of mat positions
* Which loyalty or referral model points cash credit or free class

