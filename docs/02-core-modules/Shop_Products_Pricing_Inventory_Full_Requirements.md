# Shop — Products, Pricing & Packages, Inventory (Full Requirements & Spec)

A complete commerce layer for YogaSwiss that powers **retail sales, class packages, memberships, gift cards, rentals, and digital items**, with multi‑tenant isolation (brand → studio → location), Swiss VAT, and clean finance exports. This spec is written so an AI agent can diff the build and auto‑complete missing features.

---

## Objectives
- Single catalog for **retail** and **services** (passes, memberships, add‑ons) shared across **web shop, class checkout, POS, and mobile**.
- Exact finance (orders → payments → refunds → payouts) with **Swiss VAT** and revenue categories.
- **Inventory you can trust** (multi‑location, FIFO, stocktakes, COGS, returns).
- Multi‑tenant privacy: studios manage only their products, stock, sales, and customers.
- Localized UX (de‑CH, fr‑CH with **tu**, it‑CH, en‑CH).

---

## Scope & Channels
- **Channels**: Public site, widgets, mobile app, **POS**, admin console, corporate portal.
- **Order types**: Retail shipment/pickup, in‑person POS, add‑on to class, digital delivery, subscription renewal.
- **Payment methods**: Card, **TWINT**, Apple/Google Pay, Swiss **QR‑Bill** (invoice), bank transfer, wallet credit, gift card, cash (POS).

---

## Catalog & Product Types

### Product types
1. **Retail** (merch, mats, apparel, drinks) — physical, shippable or pickup.  
2. **Class Packs / Passes** — credits (e.g., 5‑Class, 10‑Class). Attributes: number of credits, eligible services, expiry, transferability, shareable within household.  
3. **Memberships / Subscriptions** — unlimited or discounted access; billing cycle (monthly/quarterly/annual), start delay, proration, freezes, dunning rules, upgrade/downgrade, add‑ons.  
4. **Gift Cards** — store value; custom or fixed amounts; expiry rules per law; branding; message; balance tracking.  
5. **Digital items** — PDFs, on‑demand video bundles; license window; device limit.  
6. **Rentals** — mats/props; deposit rules; check‑out/check‑in flows.  
7. **Add‑ons** — water, towel, equipment rental; attachable to class checkout.  
8. **Fees & Donations** — service fees, late/no‑show fee lines; donation top‑ups.

### Shared catalog attributes
- Title, short/long description, images, video, **locale content**, tags, collections, SEO fields (slug, meta, OpenGraph).
- **Tax class** (VAT group), **revenue category**, accounting code.
- Visibility: public/unlisted/private; channel eligibility (web, POS, checkout add‑on).
- Inventory tracking on/off; sell when out of stock (backorder) toggle.
- Variants (size/color) with **SKU**, barcode/QR, weight, dimensions.
- Cross‑sell/upsell relationships and bundles/kits.

### Acceptance
- Every type can be created with defaults and published to selected channels.  
- Services (passes/memberships) integrate with **wallets and eligibility** rules.

---

## Pricing & Promotions

### Price model
- **Base price** in tenant currency (CHF); optional **price books** per channel/location/customer group (student/senior/corporate).
- **Tiered prices** (volume breaks) and **time‑boxed promos** (start/end).
- **Sliding scale** (min/max) and **pay‑what‑you‑want** with floor/ceiling.  
- **Member/non‑member** pricing; **corporate** negotiated rates (per contract).  
- **Bundles/kits** with bundle price and component allocation.

### Discounts & Coupons
- Single‑use / multi‑use codes; % or fixed; item‑level vs order‑level; include/exclude categories; stack policy; min basket; first‑purchase only; referral rewards.
- **Automatic discounts** (e.g., “buy 2 get 1”, early bird for events).

### Packages (Passes)
- Credit count, credit type(s) accepted, **applicability matrix** (class/template/category).  
- Expiry (days from purchase/activation), activation on **first use**, grace window.  
- Shareable: **household** and guest rules; transfer fee; freeze policy.
- Liability accounting: **deferred revenue** — recognize on redemption or breakage.

### Memberships (Subscriptions)
- Billing cycle, start date, **trial**, **proration** strategy, **freeze** (N days per year), **make‑good** for closures.  
- **Dunning**: retries, grace days, soft lock on failed payment; **access control** ties to bookings.  
- **Upgrades/downgrades**: immediate or next cycle; proration formula; commitment periods.  
- **Benefits**: included credits/month, % discounts on retail, free add‑ons, guest passes.

### Acceptance
- Price shown at checkout equals invoice lines with VAT; coupons apply according to rules; passes/memberships change **eligibility & pricing** in real time.

---

## Inventory Management (Multi‑Location)

### Core
- **Stock items** per variant **and location** with on‑hand, reserved, available, reorder level, reorder qty, bin/shelf.  
- **Stock moves**: receipts, issues (sales/consumption), transfers between locations, adjustments (reason‑coded), returns to supplier, write‑offs, consignment settlements.
- **Valuation**: **FIFO** with purchase price lots; record **COGS** on sale.  
- **Barcodes**: per variant; POS supports scanner; printable labels (PDF).  
- **Serial/lot tracking** (optional) for high value items.

### Purchasing
- **Suppliers** with lead times and price breaks.  
- **Purchase Orders** (PO) with statuses (draft/sent/received/closed), partial receipts, cost updates, landed cost allocation.
- **Replenishment**: low‑stock report & auto PO suggestions by reorder point.

### Stocktakes
- **Cycle counts** and full stocktake sessions; variance and approvals; audit trail.

### Returns
- Customer returns with reason codes → restock if sellable; **refund** or **exchange**; auto COGS reversal per valuation.

### Acceptance
- Inventory is accurate by location; transfers and POs adjust levels and valuation; reports reconcile to finance (COGS, margins).

---

## Orders, Fulfillment & Shipping

- Order life‑cycle: `draft → pending_payment → paid → picking → packed → shipped → delivered` (retail) or `fulfilled` (digital/passes).  
- Fulfillment: **pickup** or **shipping**; packing slips; label print; partial shipments; order notes; customer notifications.  
- Shipping: flat rate, table rate by weight/price; configurable **Swiss Post** service presets; free over threshold; **QR‑Bill** PDF attached for invoice flow.

### Acceptance
- Digital goods deliver instantly with secure links; passes/memberships **activate** as per rules; shipping fees taxed correctly per VAT class.

---

## Wallets, Passes & Eligibility

- **Wallets** per **studio/instructor** (multi‑wallets per user).  
- When a pass is purchased: add credits to the **correct wallet**; set `credits_expiry`; log ledger entries.  
- **Eligibility check** at class checkout: read wallet balances & membership state; consume credits according to **priority rules** (soonest‑expiring first).  
- **Corporate**: entitlement buckets by contract; verify at booking; invoice employer if applicable.

### Acceptance
- Booking engine never allows booking without sufficient entitlement; ledger is consistent after refunds, cancellations, and expiries.

---

## Finance & VAT (Hooks)

- Orders line‑itemized with tax class & **VAT mode** (inclusive/exclusive).  
- Payments store method (card, **TWINT**, cash, wallet, gift card), provider fees, and **net**.  
- Refunds handle retail vs service lines differently (liability release for passes).  
- Gift cards treated as **liability** until redeemed; breakage rules.  
- **Exports**: sales by revenue category, tax report, payouts, COGS/margins, inventory valuation, gift card liability, pass liability/breakage.

### Acceptance
- Totals reconcile to finance module; VAT report equals sum of taxable lines; payouts equal captured net by provider; inventory COGS equals sold qty × FIFO cost.

---

## Data Model (Supabase‑style, high level)

- `products(id, type, title, slug, description, tax_class, revenue_category, visibility, channel_flags, images, locale_content, created_at, updated_at)`  
- `product_variants(id, product_id, sku, barcode, attributes, weight, dimensions)`  
- `prices(id, product_id or variant_id, currency, amount, price_book, starts_at, ends_at)`  
- `price_rules(id, type, rule_json, starts_at, ends_at, channels)` (coupons/auto discounts/sliding scale/dynamic)  
- `packages(id, credits, credit_type, eligible_templates, expiry_days, activation_rule, shareable, transfer_fee)`  
- `memberships(id, billing_cycle, trial_days, benefits_json, freeze_policy_json, dunning_json)`  
- `gift_cards(id, code, initial_amount, balance, expiry_at, purchaser_id, recipient_id)`  
- `inventory_items(id, variant_id, location_id, on_hand, reserved, reorder_point, bin)`  
- `inventory_lots(id, variant_id, location_id, qty, unit_cost, received_at, po_id)`  
- `inventory_moves(id, variant_id, from_location_id, to_location_id, qty, reason, lot_id, order_id)`  
- `purchase_orders(id, supplier_id, status, expected_at, currency, total_cost)` + `po_items`  
- `orders(id, customer_id, channel, status, subtotal, tax_total, total, currency, studio_id, location_id)` + `order_items`  
- `payments(id, order_id, method, amount, fee_amount, net_amount, provider, status)`  
- `refunds(id, order_id, amount, reason, status)`  
- `shipments(id, order_id, method, tracking, status, label_url)`  
- `wallets(id, customer_id, studio_id, instructor_id, balance, credits, credits_expiry)` + `wallet_ledger`  
- `audits(...)` for all critical mutations.  
- All tables **RLS‑enabled** with tenant scope & role checks.

---

## Permissions (RBAC + RLS)

- **Owner/Brand Admin**: full catalog/price/inventory; finance exports.  
- **Studio Manager**: studio catalog, prices, inventory, orders, returns, suppliers.  
- **Front Desk/POS**: create POS orders & returns; limited discounts; no exports.  
- **Marketer**: coupons, bundles, collections; read sales (no PII export).  
- **Accountant**: refunds, reports, exports; no catalog edits.  
- **Instructor**: cannot access inventory; can sell add‑ons at check‑in if permitted.

---

## UI/UX (Admin Sections)

1. **Products**  
   - List with filters (type, channel, visibility, stock, tags).  
   - Product editor: content, images, SEO, variants, channels, tax, revenue category.  
   - Related products & bundles; preview public page.

2. **Pricing & Packages**  
   - Price books and rules; coupon manager; gift card settings.  
   - Pass and membership builders with eligibility matrices, benefits, freeze/dunning policies.  
   - Corporate pricing contracts (per company).

3. **Inventory**  
   - Stock by location; transfers; adjustments; stocktakes; low‑stock alerts.  
   - Purchase Orders (draft → received); supplier directory.  
   - Barcode print; label designer (PDF).

4. **Orders & Fulfillment**  
   - Order list; pick/pack/ship; returns/exchanges; packing slips; invoices.  
   - POS day summary with cash drawer open/close and over/short logging.

5. **Settings**  
   - Tax classes, revenue categories, shipping profiles, return policy, inventory valuation (FIFO), reorder thresholds, consignment options.

---

## Integrations & Cross‑Module Links
- **Classes**: passes/memberships eligibility; add‑ons at checkout; consumption affects wallet.  
- **Finance**: orders/payments/refunds/reports unify with classes and campaigns.  
- **Marketing**: product collections → landing pages; coupons in journeys; referral rewards gift cards.  
- **Campaigns/Retreats**: deposits, staged payments, add‑on upsells.  
- **Online Studio**: digital item access tied to purchase or membership.

---

## Analytics & KPIs
- Sales by day/category/channel/location.  
- Gross margin %, **COGS**, inventory turns, aging stock, shrink.  
- Pass liability & breakage, gift card breakage, membership churn/ARPU/LTV.  
- Coupon ROI; attach revenue per campaign/segment.  
- POS day book: payments by method; over/short.

---

## Acceptance Criteria (Agent‑checkable)

- Products of every type can be created, scheduled to publish, and sold through all eligible channels.  
- Price shown at checkout = invoiced total with VAT; coupons/price books apply correctly.  
- Pass purchase yields the correct wallet credits and eligibility; membership state gates bookings.  
- Inventory levels change on receipt/sale/return/transfer; FIFO cost feeds COGS; valuation report matches sales.  
- Orders flow through fulfillment states; shipping fees/taxes correct; pickup and digital delivery work.  
- Refunds adjust inventory and liabilities (passes/gift cards) with full audit.  
- RLS prevents cross‑tenant catalog & inventory visibility; exports gated.  
- Reports reconcile with the Finance module totals.

---

## Implementation Checklist (for AI agent)

- [ ] Tables & RLS for products, variants, prices, price_rules, packages, memberships, gift_cards, inventory, POs, orders, shipments, wallets, audits.  
- [ ] Pricing engine (price books, coupons, sliding scale).  
- [ ] Wallet integration (passes credits, membership benefits).  
- [ ] POS module (scanner, cash drawer, offline queue).  
- [ ] Inventory: transfers, stocktakes, valuation FIFO, low‑stock jobs.  
- [ ] Fulfillment: shipping profiles, labels, pickup workflow, digital delivery.  
- [ ] Finance hooks: invoices, VAT, refunds, exports; QR‑Bill generator.  
- [ ] Admin UI sections; public product pages; checkout integration.  
- [ ] Analytics materialized views and dashboards.  
- [ ] Test suite: concurrency, RLS, valuation, coupons, dunning, refunds.

---

**Outcome:** A robust, multi‑channel shop that handles everything from a 10‑class pass to a hoodie, with accurate stock and Swiss‑grade finance, ready to scale across brands, studios, and locations.
