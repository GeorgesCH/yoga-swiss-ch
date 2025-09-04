# Auth, Signup, Login & Account Security

Authentication and account safety for students/customers. Integrates Supabase Auth.

---

## 1) Flows
- **Sign up**: email+password, social (Apple/Google), **magic link**; optional referral code.
- **Login**: email+password, social, magic link; device remembrance with refresh tokens.
- **Password reset**: email link; per-locale templates.
- **2FA (optional)**: TOTP via authenticator app; recovery codes.
- **SSO (Corporate)**: OIDC/SAML when company entitlements apply.
- **Email verification**: required for booking (configurable).
- **Session management**: list devices; revoke sessions.

---

## 2) Pages & URLs
- `/auth/signup`, `/auth/login`, `/auth/reset`, `/auth/verify`, `/auth/magic`.
- `/account/security`: change password, enable 2FA, view devices.

---

## 3) Edge Cases
- Rate limits & captcha on brute-force.
- Locked account on multiple failed attempts; unlock email.
- Email already used → pro tips (login or reset).

---

## 4) Acceptance Criteria
- All auth actions localized; tokens refresh seamlessly.
- 2FA flow works across web & mobile deep links.
