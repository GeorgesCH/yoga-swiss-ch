-- =============================================
-- YogaSwiss Brand Management Seed Data
-- Sample brands for testing and demonstration
-- =============================================

-- Insert demo brands
INSERT INTO brands (id, slug, name, tagline, locale_default, theme, content, is_active, created_by) VALUES
-- YogaSwiss Default Brand
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'yogaswiss',
    'YogaSwiss',
    'Discover your inner peace in the heart of Switzerland',
    'en',
    '{
        "color": {
            "primary": "#2B5D31",
            "secondary": "#E8B86D", 
            "accent": "#A8C09A",
            "onPrimary": "#FFFFFF",
            "surface": "#FAFAFA",
            "onSurface": "#1C1C1C"
        },
        "typography": {
            "brandFont": "Inter:600",
            "bodyFont": "Inter:400"
        },
        "radius": { "sm": 8, "md": 12, "lg": 16 },
        "elevation": { "card": 8 },
        "email": { "headerBg": "#2B5D31" }
    }'::jsonb,
    '{
        "about": "YogaSwiss brings together ancient wisdom and modern wellness in the beautiful Swiss landscape. Our mission is to make yoga accessible to everyone while honoring traditional practices.",
        "short_bio": "Switzerland''s premier yoga community",
        "mission": "To create a supportive community where everyone can explore yoga, mindfulness, and holistic wellness.",
        "social_links": {
            "instagram": "https://instagram.com/yogaswiss",
            "facebook": "https://facebook.com/yogaswiss"
        },
        "contact_info": {
            "email": "hello@yogaswiss.ch",
            "phone": "+41 44 123 45 67",
            "website": "https://yogaswiss.ch"
        }
    }'::jsonb,
    true,
    null
),

-- Zen Studio Zurich
(
    '550e8400-e29b-41d4-a716-446655440001',
    'zen-studio-zurich',
    'Zen Studio Zürich',
    'Find your center in the heart of the city',
    'de',
    '{
        "color": {
            "primary": "#4A5568",
            "secondary": "#ED8936", 
            "accent": "#38B2AC",
            "onPrimary": "#FFFFFF",
            "surface": "#F7FAFC",
            "onSurface": "#2D3748"
        },
        "typography": {
            "brandFont": "Playfair Display:600",
            "bodyFont": "Source Sans Pro:400"
        },
        "radius": { "sm": 4, "md": 8, "lg": 12 },
        "elevation": { "card": 4 },
        "email": { "headerBg": "#4A5568" }
    }'::jsonb,
    '{
        "about": "Mitten im Herzen von Zürich bietet das Zen Studio einen Rückzugsort vom hektischen Stadtleben. Unsere erfahrenen Lehrer führen Sie durch transformative Yoga-Praktiken.",
        "short_bio": "Urban sanctuary for mindful movement",
        "mission": "Creating space for inner peace and personal growth in urban environments.",
        "social_links": {
            "instagram": "https://instagram.com/zenstudiozurich"
        },
        "contact_info": {
            "email": "info@zenstudio.ch",
            "phone": "+41 44 987 65 43"
        }
    }'::jsonb,
    true,
    null
),

-- Alpine Yoga Retreat
(
    '550e8400-e29b-41d4-a716-446655440002',
    'alpine-yoga-retreat',
    'Alpine Yoga Retreat',
    'Breathe deep, reach high',
    'en',
    '{
        "color": {
            "primary": "#2C5282",
            "secondary": "#F6AD55", 
            "accent": "#68D391",
            "onPrimary": "#FFFFFF",
            "surface": "#EDF2F7",
            "onSurface": "#1A202C"
        },
        "typography": {
            "brandFont": "Montserrat:700",
            "bodyFont": "Open Sans:400"
        },
        "radius": { "sm": 6, "md": 10, "lg": 14 },
        "elevation": { "card": 12 },
        "email": { "headerBg": "#2C5282" }
    }'::jsonb,
    '{
        "about": "Experience yoga like never before surrounded by the majestic Swiss Alps. Our retreat center offers immersive programs that combine traditional yoga with mountain adventure.",
        "short_bio": "Mountain yoga experiences",
        "mission": "Connecting people with nature through transformative yoga experiences in alpine settings.",
        "social_links": {
            "instagram": "https://instagram.com/alpineyogaretreat",
            "facebook": "https://facebook.com/alpineyogaretreat"
        },
        "contact_info": {
            "email": "retreats@alpineyoga.ch",
            "phone": "+41 81 555 12 34",
            "website": "https://alpineyoga.ch"
        }
    }'::jsonb,
    true,
    null
),

-- Flow & Glow Geneva
(
    '550e8400-e29b-41d4-a716-446655440003',
    'flow-glow-geneva',
    'Flow & Glow Geneva',
    'Illuminate your practice',
    'fr',
    '{
        "color": {
            "primary": "#6B46C1",
            "secondary": "#F59E0B", 
            "accent": "#EC4899",
            "onPrimary": "#FFFFFF",
            "surface": "#F9FAFB",
            "onSurface": "#111827"
        },
        "typography": {
            "brandFont": "Poppins:600",
            "bodyFont": "Nunito:400"
        },
        "radius": { "sm": 8, "md": 16, "lg": 24 },
        "elevation": { "card": 6 },
        "email": { "headerBg": "#6B46C1" }
    }'::jsonb,
    '{
        "about": "Flow & Glow Geneva apporte une touche moderne au yoga traditionnel. Nos cours dynamiques et notre communauté chaleureuse vous accompagnent dans votre parcours de bien-être.",
        "short_bio": "Yoga moderne et bienveillant",
        "mission": "Rendre le yoga accessible et joyeux pour tous les corps et tous les niveaux.",
        "social_links": {
            "instagram": "https://instagram.com/flowglowgeneva",
            "tiktok": "https://tiktok.com/@flowglowgeneva"
        },
        "contact_info": {
            "email": "bonjour@flowglow.ch",
            "phone": "+41 22 345 67 89"
        }
    }'::jsonb,
    true,
    null
),

-- Mindful Movement Basel
(
    '550e8400-e29b-41d4-a716-446655440004',
    'mindful-movement-basel',
    'Mindful Movement Basel',
    'Bewusstsein in Bewegung',
    'de',
    '{
        "color": {
            "primary": "#059669",
            "secondary": "#D97706", 
            "accent": "#7C3AED",
            "onPrimary": "#FFFFFF",
            "surface": "#ECFDF5",
            "onSurface": "#064E3B"
        },
        "typography": {
            "brandFont": "Merriweather:700",
            "bodyFont": "Lato:400"
        },
        "radius": { "sm": 2, "md": 6, "lg": 10 },
        "elevation": { "card": 2 },
        "email": { "headerBg": "#059669" }
    }'::jsonb,
    '{
        "about": "Mindful Movement Basel vereint Yoga, Pilates und Achtsamkeit zu einem ganzheitlichen Bewegungskonzept. Unser Studio bietet Raum für bewusste Körperarbeit und mentale Klarheit.",
        "short_bio": "Ganzheitliche Bewegung und Achtsamkeit",
        "mission": "Körper, Geist und Seele in Einklang zu bringen durch achtsame Bewegung.",
        "social_links": {
            "instagram": "https://instagram.com/mindfulbasel",
            "youtube": "https://youtube.com/mindfulbasel"
        },
        "contact_info": {
            "email": "hallo@mindfulbasel.ch",
            "phone": "+41 61 234 56 78"
        }
    }'::jsonb,
    true,
    null
)
ON CONFLICT (id) DO NOTHING;

-- Insert brand assets (mock entries - in real app these would be uploaded files)
INSERT INTO brand_assets (id, brand_id, kind, storage_path, width, height, mime_type, alt_text, description) VALUES
-- YogaSwiss Assets
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'logo_primary', 'brand-assets/yogaswiss/logo_primary.svg', 200, 80, 'image/svg+xml', 'YogaSwiss Logo', 'Primary brand logo'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567891', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'favicon', 'brand-assets/yogaswiss/favicon.png', 32, 32, 'image/png', 'YogaSwiss Favicon', 'Browser favicon'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567892', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'og_image', 'brand-assets/yogaswiss/og_image.jpg', 1200, 630, 'image/jpeg', 'YogaSwiss Social Share', 'Social media sharing image'),

-- Zen Studio Assets
('b1b2c3d4-e5f6-7890-abcd-ef1234567890', '550e8400-e29b-41d4-a716-446655440001', 'logo_primary', 'brand-assets/zen-studio/logo_primary.svg', 180, 60, 'image/svg+xml', 'Zen Studio Zürich Logo', 'Primary studio logo'),
('b1b2c3d4-e5f6-7890-abcd-ef1234567891', '550e8400-e29b-41d4-a716-446655440001', 'hero', 'brand-assets/zen-studio/hero.jpg', 1920, 1080, 'image/jpeg', 'Zen Studio Interior', 'Studio space hero image'),

-- Alpine Yoga Assets
('c1b2c3d4-e5f6-7890-abcd-ef1234567890', '550e8400-e29b-41d4-a716-446655440002', 'logo_primary', 'brand-assets/alpine-yoga/logo_primary.svg', 220, 100, 'image/svg+xml', 'Alpine Yoga Retreat Logo', 'Mountain retreat logo'),
('c1b2c3d4-e5f6-7890-abcd-ef1234567891', '550e8400-e29b-41d4-a716-446655440002', 'hero', 'brand-assets/alpine-yoga/hero.jpg', 1920, 1080, 'image/jpeg', 'Alpine Mountain View', 'Mountain landscape for hero'),

-- Flow & Glow Assets
('d1b2c3d4-e5f6-7890-abcd-ef1234567890', '550e8400-e29b-41d4-a716-446655440003', 'logo_primary', 'brand-assets/flow-glow/logo_primary.svg', 160, 160, 'image/svg+xml', 'Flow & Glow Geneva Logo', 'Circular brand logo'),
('d1b2c3d4-e5f6-7890-abcd-ef1234567891', '550e8400-e29b-41d4-a716-446655440003', 'logo_square', 'brand-assets/flow-glow/logo_square.svg', 100, 100, 'image/svg+xml', 'Flow & Glow Square Logo', 'Square logo for social media'),

-- Mindful Movement Assets
('e1b2c3d4-e5f6-7890-abcd-ef1234567890', '550e8400-e29b-41d4-a716-446655440004', 'logo_primary', 'brand-assets/mindful-basel/logo_primary.svg', 240, 80, 'image/svg+xml', 'Mindful Movement Basel Logo', 'Minimalist text logo')
ON CONFLICT (id) DO NOTHING;

-- Insert brand members (ownership relationships)
INSERT INTO brand_members (id, brand_id, member_type, member_id, role, is_active) VALUES
-- YogaSwiss platform brand - owned by system
('m1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'org', 'yogaswiss-platform', 'owner', true),

-- Studios owning their brands (using placeholder studio IDs)
('m1b2c3d4-e5f6-7890-abcd-ef1234567891', '550e8400-e29b-41d4-a716-446655440001', 'studio', 'studio-zen-zurich-001', 'owner', true),
('m1b2c3d4-e5f6-7890-abcd-ef1234567892', '550e8400-e29b-41d4-a716-446655440002', 'studio', 'studio-alpine-retreat-001', 'owner', true),
('m1b2c3d4-e5f6-7890-abcd-ef1234567893', '550e8400-e29b-41d4-a716-446655440003', 'studio', 'studio-flow-glow-001', 'owner', true),
('m1b2c3d4-e5f6-7890-abcd-ef1234567894', '550e8400-e29b-41d4-a716-446655440004', 'studio', 'studio-mindful-basel-001', 'owner', true)
ON CONFLICT (brand_id, member_type, member_id) DO NOTHING;

-- Insert brand policies
INSERT INTO brand_policies (id, brand_id, kind, title, content_md, locale, version, is_published, published_at, summary) VALUES
-- YogaSwiss Policies
(
    'p1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'cancellation',
    'Cancellation Policy',
    '# Cancellation Policy

## Free Cancellation
- **24 hours or more before class**: Full refund or credit
- **12-24 hours before class**: 50% refund or credit
- **Less than 12 hours**: No refund, credit may be issued at instructor discretion

## Late Arrivals
- Please arrive 5-10 minutes before class start
- Entry may be denied after class begins for safety reasons
- Late arrivals forfeit their spot after 10 minutes

## No-Shows
- No refund for missed classes without proper cancellation
- Passes and credits expire according to terms of purchase

## Special Circumstances
- Medical emergencies: Contact us for case-by-case review
- Weather cancellations: Full refund or credit issued',
    'en',
    1,
    true,
    NOW(),
    '24-hour free cancellation policy with graduated fees for shorter notice'
),

(
    'p1b2c3d4-e5f6-7890-abcd-ef1234567891',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'waiver',
    'Liability Waiver',
    '# Liability Waiver and Release

## Assumption of Risk
I understand that yoga includes physical movements and there is a risk of injury. I voluntarily participate in yoga activities with full knowledge of potential risks.

## Medical Clearance
I represent that I am in good physical condition and have consulted with a physician if I have any medical conditions that might affect my participation.

## Release of Liability
I hereby release YogaSwiss, its instructors, and staff from any claims, demands, or causes of action arising from my participation in yoga activities.

## Photography Consent
I consent to photography during classes for marketing purposes, unless I opt out by informing the instructor.

## Emergency Medical Treatment
I give permission for staff to seek emergency medical treatment on my behalf if necessary.',
    'en',
    1,
    true,
    NOW(),
    'Standard liability waiver for yoga classes and activities'
),

-- Zen Studio Policies (German)
(
    'p1b2c3d4-e5f6-7890-abcd-ef1234567892',
    '550e8400-e29b-41d4-a716-446655440001',
    'cancellation',
    'Stornierungsrichtlinie',
    '# Stornierungsrichtlinie

## Kostenlose Stornierung
- **24 Stunden oder mehr vor dem Kurs**: Vollständige Rückerstattung oder Gutschrift
- **12-24 Stunden vor dem Kurs**: 50% Rückerstattung oder Gutschrift  
- **Weniger als 12 Stunden**: Keine Rückerstattung

## Verspätungen
- Bitte 5-10 Minuten vor Kursbeginn eintreffen
- Einlass kann nach Kursbeginn aus Sicherheitsgründen verweigert werden

## Nicht-Erscheinen
- Keine Rückerstattung bei verpassten Kursen ohne ordnungsgemäße Stornierung',
    'de',
    1,
    true,
    NOW(),
    '24-Stunden kostenlose Stornierung mit gestaffelten Gebühren'
),

-- Alpine Yoga Policies
(
    'p1b2c3d4-e5f6-7890-abcd-ef1234567893',
    '550e8400-e29b-41d4-a716-446655440002',
    'cancellation',
    'Retreat Cancellation Policy',
    '# Retreat Cancellation Policy

## Cancellation Timeline
- **60+ days before retreat**: Full refund minus CHF 100 processing fee
- **30-59 days before**: 75% refund
- **14-29 days before**: 50% refund
- **Less than 14 days**: No refund, credit for future retreat

## Transfer Policy
- Retreat bookings may be transferred to another person up to 30 days before
- Transfer fee of CHF 50 applies

## Weather and Force Majeure
- Alpine weather may affect outdoor activities
- Alternative indoor programs will be provided
- No refunds for weather-related program modifications',
    'en',
    1,
    true,
    NOW(),
    'Specialized cancellation policy for multi-day retreat programs'
),

-- Flow & Glow Policies (French)
(
    'p1b2c3d4-e5f6-7890-abcd-ef1234567894',
    '550e8400-e29b-41d4-a716-446655440003',
    'cancellation',
    'Politique d''Annulation',
    '# Politique d''Annulation

## Annulation Gratuite
- **24 heures ou plus avant le cours**: Remboursement complet ou crédit
- **12-24 heures avant**: 50% de remboursement ou crédit
- **Moins de 12 heures**: Pas de remboursement

## Retards
- Merci d''arriver 5-10 minutes avant le début du cours
- L''entrée peut être refusée après le début du cours

## Absences
- Pas de remboursement pour les cours manqués sans annulation appropriée',
    'fr',
    1,
    true,
    NOW(),
    'Politique d''annulation 24h avec frais échelonnés pour les préavis courts'
)
ON CONFLICT (id) DO NOTHING;

-- Create sample brand analytics entries
INSERT INTO brand_analytics (id, brand_id, event_type, entity_type, entity_id, page_path, user_id, value, metadata) VALUES
-- YogaSwiss analytics
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'page_view', 'brand', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '/b/yogaswiss', null, 0, '{"source": "direct"}'::jsonb),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'brand_follow', 'brand', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '/b/yogaswiss', null, 0, '{"source": "page"}'::jsonb),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'booking_start', 'studio', 'studio-001', '/checkout', null, 45.00, '{"items": 1}'::jsonb),

-- Other brand analytics
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'page_view', 'brand', '550e8400-e29b-41d4-a716-446655440001', '/b/zen-studio-zurich', null, 0, '{"source": "search"}'::jsonb),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'page_view', 'brand', '550e8400-e29b-41d4-a716-446655440002', '/b/alpine-yoga-retreat', null, 0, '{"source": "social"}'::jsonb),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'brand_follow', 'brand', '550e8400-e29b-41d4-a716-446655440003', '/b/flow-glow-geneva', null, 0, '{"source": "page"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Update brand versions to trigger cache busting
UPDATE brands SET version = 1, updated_at = NOW() WHERE version = 0 OR version IS NULL;