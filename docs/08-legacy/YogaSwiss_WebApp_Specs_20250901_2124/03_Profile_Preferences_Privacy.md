# Profile, Preferences & Privacy

Customers can manage personal info, consents, preferences, and data rights.

---

## 1) Pages
- `/account` (profile): name, avatar, pronouns, preferred language, time zone.
- `/account/preferences`: class interests/tags, preferred locations, notification preferences per channel.
- `/account/privacy`: consent center, data export (ZIP), delete account request.
- `/account/children` (dependents): manage child profiles (for family bookings).

---

## 2) Data Points
- Personal: first/last name, phone, birthday (optional), address (for invoices).
- Preferences: yoga styles, level, instructor follows, reminder timing, default view.
- Consents: email/sms/push/WhatsApp; marketing categories; timestamp + IP (immutable).

---

## 3) Acceptance Criteria
- Data updates respect RLS (only owner).
- Export bundles: profile.json, bookings.csv, invoices.pdf, consents.json.
