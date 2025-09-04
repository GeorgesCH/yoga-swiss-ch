# Homepage — Full Requirements & Spec

A high-converting, SEO-friendly entry point for guests and a personalized hub for logged-in customers.

---

## 1) Objectives
- Help visitors **find and book** a class/workshop/appointment quickly.
- Showcase **cities**, **outdoor** offerings, **studios**, **instructors**, and **online** content.
- Personalize for logged-in users: next classes, credits, recommendations.
- Achieve **Core Web Vitals** and **WCAG 2.1 AA**; multilingual (FR/DE/IT/EN).

---

## 2) Above the Fold
- **Search Bar** (omni): placeholder “Try ‘Yin Yoga Geneva Friday evening’”
  - Entity types: classes, studios, instructors, cities, tags.
  - Geolocate (ask permission) → default city.
- **Location Switcher**: city dropdown (top Swiss cities), “Near me” chip.
- **Primary CTAs**: Explore Schedule, Online Studio, Pricing.
- **Hero**: rotating visuals; if logged-in: “Welcome, {first_name}” + upcoming booking card.

---

## 3) Content Sections (configurable order; A/B testable)
1. **Today Near You**: 6–12 tiles; filters: now/this evening/tomorrow morning.
2. **Popular Categories**: style chips (Vinyasa, Yin, Prenatal, Hot) → tag landings.
3. **Outdoor Spotlight**: lake/park/mountain seasonal carousel (only if city has supply).
4. **Workshops & Events**: next 4 with price and date; “See all” link.
5. **Top Studios**: logo, rating, proximity; “View schedule”.
6. **Instructors You’ll Love**: follow suggestions (language, style).
7. **Online Studio Picks**: new releases; continue watching (authed).
8. **Membership Deals**: banners from Pricing; gift card promo during holidays.
9. **Corporate Programs**: CTA for companies (leads form).
10. **Newsletter Opt-in**: consent-aware; minimal fields.
11. **SEO Text Block**: 300–600 words, city-aware; collapsible on mobile.
12. **App Install Banner** (if PWA/Store app).

---

## 4) Footer
- Quick links: Cities, Studios, Instructors, Online, Pricing, Help/FAQ.
- Policies: Terms, Privacy, Refunds, Cookies; social links.
- Language & currency selector.

---

## 5) Personalization Logic
- Use last city, last styles, instructors followed, and availability windows.
- Respect privacy: show personalization toggle; anonymous has generic defaults.

---

## 6) Metrics & Acceptance
- Click-through to Explore ≥ 35% of home page sessions.
- LCP < 2.5s; INP < 200ms; CLS < 0.1 (P75).
- i18n + RTL-ready if needed; complete keyboard navigation.
