# Finance — Full Requirements and Spec

Money flow from checkout to payout with Swiss VAT, QR bill, TWINT, and clean accounting exports.

## Scope
* Exact math for orders, taxes, payments, refunds, payouts, and earnings
* Clear documents for clients and studios
* Easy reconciliation with payment providers and banks

## Money Objects
* Order and OrderItem for commercial intent and lines
* Payment for charges and status
* Refund for partial or full returns
* Payout for settlements from providers
* Earning for instructor payroll
* Reconciliation entries for bank statement matching

## Data Model at a Glance
* orders with org_id, customer_id, currency, subtotal, tax_total, total, status, channel
* order_items with type registration or product or add_on or retail, unit_price, tax_rate, revenue_category, location_id
* payments with method card or twint or cash or bank or account_credit, fee_amount and net_amount, provider, status
* refunds with amount, reason, status
* invoices with number, tax_mode inclusive or exclusive, vat_id, pdf_url, qr_bill_url
* payouts and payout_items for provider settlements
* earnings per instructor and class based on rule: per head, per class, or percent share
* reconciliation links bank lines to orders and payouts

## Taxes and Revenue Recognition
* VAT per item with org default mode inclusive or exclusive
* Revenue categories drive reporting for classes, workshops, retail, gift cards, and subscriptions
* Deferred revenue for passes and gift cards. Recognize on redemption or breakage
* Membership revenue recognized on billing date. Daily proration can arrive later

## Payments and Providers
* Stripe for cards and Apple or Google Pay
* Datatrans or Wallee for TWINT
* Manual cash and bank transfer, plus account credit
* Webhooks update status and handle Secure Customer Auth flows
* Chargeback handling flags disputes and reserves funds

## Invoices and Receipts
* Instant PDF with VAT breakdown and org details
* Optional Swiss QR bill on the same PDF
* Numbering scheme YYYY ORG sequential, immutable, with credit notes for cancellations

## Payouts and Instructor Payroll
* Payout timeline by provider with arrival date and fees
* Rules per class for instructor earnings. Per class, per attendee, or percent of revenue, with min and max
* Close period flow to approve and export CSV or PDF and mark paid

## Reconciliation
* Auto reconcile with webhooks
* Bank import CAMT.053 or CSV and match to payouts and transfers
* Cash drawer for retail with open and close and over or short logging

## Refunds and Credits
* Default to account credit when allowed, else original method
* Fees for late cancel and no show applied by policy
* Studio initiated cancellations waive penalties

## Reports and Analytics
* Sales by day, by product, by location, tax report, payout report, instructor earnings, gift card liability, pass breakage, accounts receivable for negative wallets

## Admin Experience
* Orders list with quick refund and resend invoice
* Payments view with provider, fees, disputes
* Payouts with drilldown to items and export
* Earnings and payroll with approval and export
* Tax and accounting exports for DATEV or SAGE and generic CSV

## RPCs and Jobs
* create_order, capture_payment, issue_refund
* compute_earnings and close_payroll
* nightly refresh for materialized views and payout import

## Permissions
* Finance is restricted to owners and managers. Instructors see only their earnings

## Quality and Acceptance
* Totals match line math for all VAT modes
* Payout totals equal the sum of net captured payments less fees
* Refunds update liabilities for passes and gift cards with full audit
* Exports load cleanly into accounting tools
