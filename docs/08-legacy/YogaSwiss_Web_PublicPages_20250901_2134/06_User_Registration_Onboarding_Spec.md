# User Registration & Onboarding (Student/Customer)

Simple sign-up that sets preferences for a better first booking experience.

---

## 1) Flows
- **Create account**: email+password or social (Apple/Google) or magic link.
- **Fast lane at checkout**: minimal account creation inline (email + consent) → complete later.
- **Corporate SSO**: if domain matches a company, offer SSO; link to company plan.

## 2) Onboarding (optional steps, skippable)
- Choose **language** & **city** (default from geolocation).
- Pick **interests** (styles), **availability windows** (morning/evening/weekend).
- Notification preferences (email/push/SMS) + **marketing consent** checkbox.
- Save payment method (optional) for faster booking (tokenized).

## 3) Edge Cases
- Email already used: suggest login/reset; merge guest cart on login.
- Under 16 flow (if enabled): require guardian consent.

## 4) Acceptance
- Completion < 60s; all consents timestamped; preferences immediately tailor Explore/Home.
