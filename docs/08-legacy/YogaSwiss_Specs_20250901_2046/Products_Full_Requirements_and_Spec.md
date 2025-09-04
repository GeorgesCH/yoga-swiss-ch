# Products — Full Requirements and Spec

A complete specification for all sellable items. Optimized for studios in Switzerland and Europe with CHF first, VAT modes, TWINT, and multilingual content in FR, DE, IT, and EN.

## Scope and Goals
* One catalog for every sellable thing
* Clear rules for where and how a product can be used
* Transparent taxes and invoices for Switzerland and the EU
* Simple setup for admins and clear selection for students

## Product Types and Glossary
* Drop in ticket. One time access to a single class or event occurrence
* Pass or package. Credits that can be used on eligible classes and events, with expiry
* Membership or subscription. Recurring entitlement with billing and dunning rules
* Course or series enrollment. A product that enrolls a learner into a set of dates
* Workshop or event ticket. Often special pricing, deposit, and optional payment plan
* Gift card. Stored value with a code and balance
* Coupon or voucher. A code that grants a discount under conditions
* Add on. Upsell such as mat or towel rental or equipment
* Retail. Physical or digital items that can be sold in the same cart

## Data Model at a Glance
* products. id, org_id, type, name_i18n, description_i18n, status draft or active or archived, tax_class, images, tags, visibility public or unlisted or private
* prices. product_id, pricing_model fixed or sliding or deposit_plan, amount, currency, min, max, suggested, tax_included, active_from, active_to
* product_eligibility. class_tags, location_ids, instructor_ids, weekdays, online_only, in_person_only, age_min, age_max, members_only
* passes. product_id, credits_total, credits_per_checkin, validity_days, shareable_family
* memberships. product_id, cycle monthly or quarterly or yearly, access_rules, pause_rules, dunning_rules
* gift_cards. code, initial_value, balance, expires_at, purchaser_id, recipient_email, message
* coupons. code, percent_off or amount_off, applies_to, min_spend, max_redemptions, per_user_limit, start_at, end_at, new_customer_only
* add_ons. product_id, inventory_qty, sku, options
* bundles. product_id, includes and quantities, constraints
* All tables indexed by org_id and protected with RLS

## Pricing and Taxes
* Fixed price, Sliding scale with min, suggested, and max, or Deposit with a payment plan
* VAT mode can be inclusive or exclusive at org level and can be overridden per product
* Early bird and late pricing windows per product or per occurrence
* Regional price overrides when needed. Default is CHF

## Eligibility and Usage Rules
* Restrict by class tags, location, instructor, weekday, delivery in person or online or hybrid, age, and guest usage
* Override credit cost per class template. For example hot class uses two credits
* Membership access matrix includes or excludes tags, sets weekly or monthly caps, and specifies online only or in person only

## Catalog Lifecycle and Visibility
* States are draft, active, archived. Only active is purchasable
* Versioning through price rows. New purchases use the most recent active price
* Visibility is public or unlisted or private. Unlisted is shareable by link

## Checkout and Redemption
* Drop in creates the registration instantly
* Pass purchase creates credits for the wallet and or a pass row
* Membership purchase starts a subscription with renewal and pause rules
* Gift card sends a code to the recipient and can be redeemed to wallet or at checkout
* Coupon entry at checkout. Stacking rules are configurable. One coupon per order is the default
* Add ons appear contextually and decrement inventory on purchase

## Refunds and Adjustments
* Default path is refund to account credit if enabled. Otherwise refund to original payment method
* Pass refunds return unused credits. Used credits can convert to money value pro rata
* Membership refunds can be immediate or end of term, with or without proration
* Gift cards are not refundable by default. Balance and liability are tracked

## Admin Experience
* Catalog list with filters by type, status, tags
* Product editor with tabs: Basics, Pricing, Eligibility, Images, Policies, Advanced
* Membership editor: cycle, access, pauses, dunning, upgrade path, preview of next invoice
* Pass editor: credits, expiry, overrides per tag or template
* Coupon editor: conditions and redemptions analytics
* Gift card console: issue, resend, adjust, view audit
* Inventory for add ons with low stock alerts

## Student Experience
* Clear product cards that show eligibility and price including tax mode
* Upsells for passes or memberships when a class requires them

## RPCs and Triggers
* grant_pass, grant_membership, redeem_credit, apply_coupon with full validation
* Cannot delete a product with linked orders. Archive instead. Price rows are immutable once used

## Analytics and Reporting
* Sales by product and type, add on attach rate, pass breakage, membership churn, customer lifetime value by product, coupon return on investment

## Quality and Acceptance
* Changing eligibility updates accepted classes within seconds
* Sliding scale only accepts amounts within bounds and taxes compute correctly for the chosen mode
* Refund flows update credits and balances with a full audit trail
* Coupon limits and redemptions are enforced and reported
