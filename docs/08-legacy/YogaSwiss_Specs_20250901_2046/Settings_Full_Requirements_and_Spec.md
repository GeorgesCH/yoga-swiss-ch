# Settings — Full Requirements and Spec

All configuration for brand, public profile, locations and rooms, staff, messaging, subscriptions, taxes, language, revenue categories, FAQs, feature toggles, and compliance.

## Information Architecture
* Business and Identity
* Public Facing
* Locations and Rooms
* Staff and Access
* Messaging
* Subscriptions
* Taxes
* Language and Locale
* Revenue Categories
* FAQs
* Client Experience and Reservation
* Check in
* Legal and Compliance
* Shipping and Retail
* Search and Audit

## Public Facing
* Profile photo and brand logo with size guidance and crops
* Vanity URL with safe redirects when changed
* About in short and long form with localization in FR, DE, IT, and EN
* Website link, social links, contact email and phone
* SEO fields and optional search engine controls
* Languages shown on public pages

## Locations and Rooms
* Physical location with address autocomplete and map, time zone, amenities, access notes, photos, contact
* Room within location with capacity and optional seat map
* Virtual platform defaults per location such as Zoom or Meet
* Outdoor locations with meeting point pin, geofence check in, weather rules, season dates, permits, and backup indoor room

## Staff and Access
* Roles for owner, manager, front desk, instructor
* Permissions matrix editor and audit

## Messaging
* Transactional templates with preview and test send
* Email timezone selection for message timestamps
* Toggles for one click unsubscribe for transactional email where legal, and for admin copy suppressions

## Subscriptions
* Default provider and dunning strategy with retries and grace
* Pause and resume rules and upgrade or downgrade proration

## Taxes
* VAT rates by category, inclusive or exclusive mode
* Swiss QR bill settings and invoice numbering

## Language and Locale
* Default UI language and enabled locales for public pages
* Content dictionary overrides for common labels

## Revenue Categories
* Editable categories such as Classes, Workshops, Retail, Gift Cards, Subscriptions
* Mapping rules from products and items

## FAQs
* Manage entries per locale with rich text and sort order

## Client Experience and Reservation
* Booking windows, sales cutoff, show spots remaining, double booking block, guest booking
* Book now pay later and unpaid hold resolver
* Multiple credits per booking when enabled

## Check in
* Client self check in by QR or geofence or email link for livestream
* Show room name to client after booking

## Legal and Compliance
* Liability waiver required toggle with versioning and reset for all clients
* Tax inclusive pricing toggle that changes display and invoice math

## Shipping and Retail
* Flat shipping price per country and optional overrides

## Search and Audit
* Global search for settings
* Every change stored with actor and before and after values

## Permissions and RLS
* Owners and managers can edit all settings
* Location managers can edit their locations and rooms
