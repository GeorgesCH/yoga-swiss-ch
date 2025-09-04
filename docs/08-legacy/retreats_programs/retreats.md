# Retreats Module – Lithuania Retreat Specification

## Overview

This document specifies the requirements for hosting retreats in the YogaSwiss platform and illustrates them using the **Lithuania retreat** (The Baltic Experience) offered by Ice & Yoga.  Retreats differ from standard classes because they are multi‑day events with accommodation, meals and activities.  They require custom booking flows, deposits, room types and personalized forms.

## Retreat Example: The Baltic Experience (Lithuania)

- **Name**: The Baltic Experience 2026.  
- **Location**: Labanoras Forest, Lithuania【709919619612595†screenshot】.  Participants stay in cosy houses surrounded by pine forest and a lakeside sauna【286135768145831†L152-L170】.
- **Dates**: Two sessions are offered in March 2026: Tuesday 3 March – Sunday 8 March (women only) and Tuesday 10 March – Sunday 15 March【709919619612595†screenshot】.
- **Group Size**: 10–13 people for a personalised experience【709919619612595†screenshot】.
- **Included Activities**: 
  - Daily **yoga and meditation**: Vinyasa flow in the morning and Yin/Restorative or Nidra in the evening, practised in a Yogashala with large windows and a fireplace【286135768145831†L65-L82】.
  - **Breathwork & Ice Bath** workshop: Guided by a certified instructor; reduces muscle soreness and boosts immunity; the frozen lake may be used for a cold dip【286135768145831†L65-L82】.
  - **Traditional sauna ritual** (Lithuanian *pirtis*) with a cold plunge【286135768145831†L152-L170】.
  - **Journaling & vision board** sessions, guided forest walk, and live music.
  - **Nourishing vegetarian/vegan cuisine** prepared by a Swiss chef; three meals and snacks included【286135768145831†L88-L102】.
  - **Transport** from Vilnius city centre to the retreat and return【709919619612595†screenshot】.
- **Accommodation**: Twin or shared rooms in cosy houses near the forest; sauna and lake access【286135768145831†L152-L170】.  Room types and pricing (double, single, dormitory, etc.) must be specified with capacity limits.

## Retreat Booking Flow

1. **Retreat Landing Page** – Presents high‑level information (dates, location, inclusions, itinerary, photos, hosts and pricing).  The page must be translated into de‑CH, fr‑CH (using *tu*), it‑CH and en‑CH.
2. **Booking Request Form** – A multi‑step form collects applicant information and preferences.  In the Lithuania retreat the form includes:
   - **Contact Details**: first name, last name, date of birth, street address, city, postal code, country, email and phone number【951103447534954†screenshot】.
   - **Retreat Date**: choose one of the available retreat weeks.
   - **Room Type**: select single, double, or dorm room with price difference and indication if the booking is for women only.
   - **About You**: health information (e.g., injuries, dietary restrictions, allergies), yoga experience, motivations and goals, and emergency contact.  The operator can add custom questions for each retreat.
   - **Consent & Policies**: acceptance of liability waiver, cancellation policy, privacy policy and marketing consent.
   - **Summary & Submission**: show selected options and price; require deposit payment (e.g., CHF 500) to hold a space and confirm booking.  Remaining balance is invoiced later.
3. **Payment & Confirmation** – After the request is submitted, the organiser reviews the application (can approve, waitlist or decline).  If approved, the customer receives payment instructions for the deposit via card, TWINT or QR‑bill.  Full payment is due by a specified date.  Customers receive an invoice with VAT details and a credit‑note process for cancellations.
4. **Custom Fields & Eligibility** – Some retreats may require screening (e.g., only women, pregnancy restrictions).  The booking form must support conditional logic (e.g., questions appear based on previous answers) and allow custom fields.  The organiser can toggle whether a booking is auto‑approved or manually reviewed.
5. **Waitlists** – If a retreat is sold out, applicants can join a waitlist.  When a space becomes available, the applicant is notified and given a window to confirm with payment.
6. **Room Allocation** – The admin dashboard allows managers to assign participants to room types and track occupancy.  Automatic allocation or manual assignments are both supported.  Room assignments must respect gender preferences and booking requests.

## Admin Dashboard Requirements for Retreats

- **Retreat Management**: Create, edit and publish retreat pages with dates, location, itinerary, hosts, pricing, capacity, room types and policies.  Set deposit amount and payment deadlines.
- **Booking Pipeline**: View all requests with status (pending, waitlisted, confirmed, cancelled).  Approve or decline applicants; send personalised messages via integrated communications.  Take payments via card, TWINT or bank transfer; track remaining balance.  Generate invoices and receipts with Swiss VAT and optional QR‑bill.
- **Rooming & Logistics**: Manage room assignments, transport lists, dietary requirements and special requests.  Print participant manifests and arrival/departure details.  Define backup dates or locations if weather or political events require changes.
- **Custom Forms**: Define multi‑step forms per retreat with fields for personal details, health information, motivations and consents.  Specify required fields and validations.  Provide ability to export form responses.  Ensure sensitive data is accessible only to authorised staff.
- **Financials**: Retreat payments integrate with the Finance module for orders, invoices and refunds.  Deposit payments are non‑refundable unless the retreat is cancelled or the spot is filled.  Remaining balance can be split into instalments.  VAT and revenue recognition follow Swiss law.
- **Email/SMS Templates**: Send booking confirmation, payment reminders, pre‑departure information (what to pack, itinerary), and post‑retreat feedback surveys.  Templates must support multiple languages.

## Acceptance Criteria

- The booking request form collects all necessary data and supports custom questions for health and goals.  Sensitive data is stored securely and visible only to authorised staff.
- Retreat pages display essential information: dates, location, included activities, pricing and room options, itinerary and hosts.  Information is consistent across all languages.
- Admins can review, approve or decline applications, manage waitlists and process deposits and final payments.  Customers receive invoices with VAT breakdown and QR‑bill when paying by bank transfer.
- Room types and capacities are enforced; waitlist promotes applicants automatically when spaces open.
- Retreat bookings are integrated with customer profiles; communication history and payments are visible in the admin dashboard.  Refunds and cancellations update liabilities and invoices correctly.

## Citations

Details about the Lithuania retreat were gathered from Ice & Yoga’s official page.  
The included activities and accommodations are described on the retreat website【709919619612595†screenshot】【286135768145831†L65-L82】.  The nourishing vegetarian/vegan cuisine and lodging in cosy houses with a sauna and forest surroundings are highlighted【286135768145831†L88-L102】【286135768145831†L152-L170】.  The booking request form collects personal details such as name, date of birth, address, email and phone and includes subsequent steps for dates, room types and personal information【951103447534954†screenshot】.

