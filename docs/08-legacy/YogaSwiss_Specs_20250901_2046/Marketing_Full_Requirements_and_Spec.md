# Marketing — Full Requirements and Spec

Marketing that respects privacy and increases bookings with clear attribution.

## Objectives
* Grow new and repeat bookings
* Use segments and journeys that react to customer behavior
* Measure results in money, not only opens and clicks

## Components
* Segments with a visual builder and live counts
* Campaigns for one off blasts with A B tests and send time optimization
* Journeys for triggered flows such as welcome, win back, post class, dunning, birthday
* Offers such as coupons and gift cards
* Referrals with unique links and rewards
* Landing pages for workshops and programs with forms
* Embeddable widgets for schedule and lead capture

## Data Model at a Glance
* segments with definition json and refresh time
* campaigns with type blast or journey, channel email or sms or push, status, audience segment, schedule, A B test data
* messages with delivery state and open or click or unsubscribe timestamps
* referrals with referrer, code, share url, reward rule and balances
* landing_pages with slug, content, seo, locale, publish time
* attribution_events with UTM style fields, first touch and last touch, and optional order link

## Segmentation
* Filter by behavior and profile. Examples include location, tags, spend, classes attended, interests, membership status, language, and consent
* Save and reuse segments, export to CSV or to ad platforms with consent

## Journeys
* Triggers include signup, first booking, no booking for X days, birthday, membership lapsing, waitlist promoted, post class
* Actions include email, sms, push, WhatsApp, add tag, grant coupon, webhook
* Branching by open or click or book, quiet hours, frequency caps

## Campaigns
* A B content and subject. Winner by open or click or book rate
* Send time optimization per timezone and locale
* Link tracking with UTM and short links for sms

## Templates and Content
* Multilingual blocks with variables such as first_name and class_name and studio_url
* Legal footers with mailing address, privacy link, and unsubscribe link

## Referrals
* Unique link per customer with dashboard of invitees and conversions
* Rewards can be wallet credit, free class credit, membership discount, or gift card
* Anti fraud with device fingerprint and cooldown windows

## Landing Pages and Widgets
* Drag and drop builder for pages with forms that create leads
* Schedule and product widgets that inherit brand theme

## Analytics
* Funnel from send to open to click to view to add to cart to book
* Revenue attribution with last click and multi touch
* Journey step performance and complaint rates

## Integrations
* ESP such as Brevo or Sendgrid
* SMS via Twilio or MessageBird
* WhatsApp Business
* Google Analytics and Meta Pixel through a privacy aware layer

## Privacy and RLS
* Respect marketing consent per channel. Transactional messages always go out
* One click unsubscribe for email and respected suppression lists

## Quality and Acceptance
* Segment counts are stable and journeys do not double send
* A B reports show winners and attribution matches order sources
* Unsubscribes are applied immediately and consent is versioned with IP and user agent
