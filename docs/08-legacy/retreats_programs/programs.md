# Programs as Appointments – Feature Specification

## Overview

This module adds **individual programs** that instructors can sell as 1‑to‑1 services.  Programs may be single sessions (e.g., Reiki or private yoga) or multi‑session packages (e.g., EVOLVE coaching, SPLIT flexibility training).  Unlike group classes, programs use appointment booking with instructor availability and resources and support custom intake forms, progress tracking and payment plans.

## Key Concepts

- **Program** – A definition of a 1‑to‑1 service offered by an instructor.  Programs have titles, category (coaching, mobility, Reiki, private class), delivery mode (in‑person, online or hybrid), session length, optional multi‑session count and description.  Each program belongs to a tenant (studio or independent instructor).  Examples are EVOLVE (holistic coaching), SPLIT (grand écart training), Reiki 1:1, and private dance/yoga classes【445894657166358†screenshot】.
- **Variant** – Pricing tier for a program.  A program can have multiple variants (e.g., 4‑session EVOLVE pack vs. 8‑session pack).  Each variant defines currency, price, VAT rate, deposit amount and optional payment plan schedule.  Variants may also specify how many class credits can be used.
- **Booking** – A customer reservation for a program.  Bookings store the chosen variant, instructor, price, session schedule and status (reserved, confirmed, in‑progress, completed, cancelled).  Bookings may use payment plans or deposits.
- **Session** – Individual occurrences within a program booking.  Single‑session programs create one session; multi‑session programs create multiple sessions automatically or allow the customer to schedule each session individually.  Sessions track date, start/end times, location/meeting URL and status.
- **Intake Form & Milestones** – Programs can include a custom form to collect health information or goals and can define milestones (e.g., assessments or homework) with due dates.  Customers can upload assignments and the instructor can log progress.

## Data Model

Define the following tables (all with `org_id` for tenant isolation and Row Level Security):

- `programs(id, org_id, instructor_id, title, slug, summary, long_description_md, category, delivery_mode, session_length_min, is_multi_session, default_sessions_count, visibility, media_banner_url, thumbnail_url, tags, is_active)`.
- `program_variants(program_id, name, currency, price, credit_price, vat_rate, deposit_amount, pay_plan_json)`.
- `program_intake_forms(program_id, form_schema_json, is_required)`.
- `program_milestones(program_id, order_idx, name, description_md, due_day_offset)`.
- `program_bookings(id, program_id, variant_id, customer_id, instructor_id, status, order_id, total_price, source, private_link_token)`.
- `program_sessions(booking_id, starts_at, ends_at, timezone, location_id, meeting_url, status, check_in_at, notes_private_md)`.
- `program_progress(booking_id, milestone_id, completed_at, artifact_url, notes_md)`.

Associations ensure that bookings and sessions stay within a tenant.  RLS policies restrict customers to their own bookings, instructors to bookings they conduct and managers to their studio’s bookings.

## Booking & Checkout Flow

1. **Program landing page** – Customers view program details, instructor profile and available variants.  If `visibility=public` the page is indexed by search and accessible to anyone; `by_link` makes it accessible only via a unique link.
2. **Time selection** – Customers pick a time slot from the instructor’s availability.  For multi‑session programs they schedule the first session and then either accept the default cadence (e.g., weekly) or schedule subsequent sessions individually.
3. **Intake form** – If required, customers complete the custom form (health information, goals, prior experience, etc.).  Inputs are stored in `program_intake_forms` and included in the booking record.
4. **Payment** – The checkout process is similar to class bookings.  Customers can pay in full or pay a deposit and set up a payment plan.  Payments support cards, Apple/Google Pay, TWINT and Swiss QR‑bill, and can use package credits if allowed.  On successful payment, the booking status becomes `confirmed`.
5. **Confirmation & communications** – After confirmation the customer receives a confirmation email with session details, calendar attachments and a link to manage the booking.  The system also creates a **program thread** in the community messaging module so the customer and instructor can communicate privately.

## Instructor & Admin Experience

- **Program management** – In the admin dashboard, instructors or studio managers can create and edit programs.  A multi‑step wizard allows them to specify pricing, availability rules, intake forms, milestones, payment plans and policies (refund and reschedule rules).
- **Bookings dashboard** – A pipeline view shows program bookings by status (reserved, confirmed, in‑progress, completed).  Administrators can view and edit session schedules, record no‑shows and reschedule sessions.  They can also process refunds or apply credits.
- **Earnings** – Instructor earnings for programs follow the same payroll rules used for group classes (per session fee, percentage of revenue, or a flat amount).  When a booking is completed, earnings are computed and paid in the next payroll period.

## Customer Experience

- **Program page** – Rich description with images, itinerary, expected outcomes, host biography, testimonials and FAQs.  Prices and available variants are clearly listed.
- **Manage booking** – Customers can reschedule sessions, view progress and milestones, message the instructor, upload homework and download invoices.
- **Cancellation & refunds** – Customers can cancel or reschedule sessions subject to studio policies.  Refunds are pro‑rated by the number of sessions used; late cancellation or no‑show fees may apply.

## Integration with Other Modules

- **Availability & scheduling** – Uses the same instructor availability engine as appointments.  Sessions cannot conflict with existing classes or other appointments.
- **Finance** – Program orders create `orders` and `order_items` with VAT based on the `program_variants`.  Payment plans are stored in `payment_plans` and dunning processes apply if payments fail.  Invoices include line items for each session or package.
- **Marketing & Funnels** – Programs are integrated into marketing campaigns, segments and automations.  Landing pages can be created in the funnel builder; referral codes and coupons can be applied to program purchases.
- **Community messaging** – Each program booking has a private message thread between instructor and customer.  This uses the community module’s messaging and inbox system.

## Acceptance Criteria

- Customers can view and book individual programs with availability respecting instructor calendars.
- Payment and invoicing follow the finance rules for deposits, payment plans and refunds.
- Multi‑session programs allow scheduling of all sessions or one at a time; progress can be tracked.
- Instructors have an intuitive admin interface to manage programs and bookings.  Customer PII and booking details are restricted to appropriate roles via RLS.
- Program bookings appear in the customer’s portal with clear management actions and communications.

