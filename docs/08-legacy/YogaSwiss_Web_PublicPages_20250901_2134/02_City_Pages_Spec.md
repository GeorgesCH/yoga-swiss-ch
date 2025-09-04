# City Pages — Activities by City (Indoor & Outdoor)

Discoverable, SEO-first hubs for each Swiss city (e.g., Geneva, Zürich, Lausanne).

---

## 1) URLs & Routing
- Directory: `/cities` (grid with search & map).
- City page: `/ch/{city-slug}` (canonical for language), aliases `/cities/{slug}`.
- Sub-areas (optional): `/ch/{city}/{neighborhood}`.

---

## 2) Page Structure
- **Hero**: city name, summary, image/map; quick chips (Today, This Week, Outdoor, Workshops).
- **Filters**: date range, time of day, style/tags, level, language, price, indoor/outdoor.
- **Map + List** (sticky): clustering; pins for studios, outdoor spots.
- **Upcoming Classes** (paginated infinite scroll).
- **Outdoor in {City}**: curated section (lake/park/mountain/rooftop).
- **Top Studios** and **Top Instructors** in the city.
- **Passes/Memberships valid in {City}** (from Pricing).
- **City Guide** SEO content with internal links and FAQ rich snippets.

---

## 3) Data & SEO
- City metadata: name (i18n), canton, lat/lng, bounding box.
- Structured data: `Place`, `Event`, `Organization` for listings.
- `hreflang` for FR/DE/IT/EN; canonical per locale; UTM cleaned.
- Load listings via paginated API; support SSR for first page.

---

## 4) Edge Cases
- No supply: show nearby cities within 30–50km.
- Weather alerts (if outdoor heavy): banner with policy link.

---

## 5) Acceptance Criteria
- First contentful listings within 1s after SSR; scroll keeps filters & URL in sync.
