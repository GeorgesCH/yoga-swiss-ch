-- =====================================================
-- YogaSwiss Seed Data Migration
-- Migration: 20241203000004_seed_data
-- Initial demo data for YogaSwiss platform
-- =====================================================

-- =====================================================
-- DEMO ORGANIZATION
-- =====================================================

INSERT INTO organizations (id, name, slug, description, settings, logo_url, brand_colors, locale, timezone) 
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'YogaSwiss Demo Studio', 
  'demo-studio',
  'A demonstration yoga studio showcasing the YogaSwiss platform capabilities',
  '{"timezone": "Europe/Zurich", "currency": "CHF", "tax_rate": 0.077, "booking_window_hours": 24, "cancellation_hours": 24}',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop&crop=center',
  '{"primary": "#123C2E", "secondary": "#E6D9C7", "accent": "#1C4E73"}',
  'de-CH',
  'Europe/Zurich'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  settings = EXCLUDED.settings,
  updated_at = NOW();

-- =====================================================
-- DEMO LOCATIONS
-- =====================================================

INSERT INTO locations (id, organization_id, name, type, address, capacity, amenities, images, weather_dependent, is_active) VALUES
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Zürich Hauptstudio', 'studio', 
   '{"street": "Bahnhofstrasse 123", "city": "Zürich", "postal_code": "8001", "country": "Switzerland"}', 
   30, '["heated_floors", "sound_system", "props", "changing_rooms", "showers"]',
   ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'],
   false, true),
   
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Seefeld Zweigstelle', 'studio',
   '{"street": "Seestrasse 45", "city": "Zürich", "postal_code": "8008", "country": "Switzerland"}',
   20, '["natural_light", "wooden_floors", "meditation_corner", "tea_station"]',
   ARRAY['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'],
   false, true),
   
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Zürichsee Outdoor', 'outdoor',
   '{"street": "Seeuferweg 12", "city": "Küsnacht", "postal_code": "8700", "country": "Switzerland"}',
   40, '["lake_view", "fresh_air", "natural_setting", "backup_indoor_space"]',
   ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'],
   true, true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  updated_at = NOW();

-- =====================================================
-- DEMO ROOMS
-- =====================================================

INSERT INTO rooms (id, location_id, name, capacity, amenities, equipment, is_active) VALUES
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222221', 'Hauptraum', 30, 
   '["mirrors", "sound_system", "heating"]', 
   ARRAY['yoga_mats', 'blocks', 'straps', 'blankets'], true),
   
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222221', 'Meditationsraum', 15,
   '["quiet", "dim_lighting", "cushions"]',
   ARRAY['meditation_cushions', 'blankets', 'essential_oils'], true),
   
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Studio Seefeld', 20,
   '["lake_view", "natural_light"]',
   ARRAY['yoga_mats', 'props', 'blocks'], true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  capacity = EXCLUDED.capacity,
  amenities = EXCLUDED.amenities;

-- =====================================================
-- DEMO CLASS TEMPLATES
-- =====================================================

INSERT INTO class_templates (id, organization_id, name, description, type, level, duration_minutes, capacity, price_cents, location_id, room_id, images, tags, is_active) VALUES
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 
   'Vinyasa Flow Morgen', 
   'Energetischer Vinyasa Flow am Morgen mit Fokus auf Kraft und Flexibilität. Perfekt um den Tag zu beginnen.',
   'vinyasa', 'intermediate', 75, 25, 3500, 
   '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333331',
   ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'],
   ARRAY['morgen', 'kraft', 'energie'], true),
   
  ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111',
   'Yin Yoga Abend',
   'Ruhige Yin Yoga Praxis mit langen, passiven Haltungen. Ideal zur Entspannung nach einem langen Tag.',
   'yin', 'beginner', 60, 20, 2800,
   '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333332',
   ARRAY['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'],
   ARRAY['entspannung', 'abend', 'ruhe'], true),
   
  ('44444444-4444-4444-4444-444444444443', '11111111-1111-1111-1111-111111111111',
   'Outdoor Yoga am See',
   'Yoga in der Natur mit Blick auf den Zürichsee. Bei schlechtem Wetter findet die Stunde drinnen statt.',
   'outdoor', 'all_levels', 60, 30, 3200,
   '22222222-2222-2222-2222-222222222223', NULL,
   ARRAY['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'],
   ARRAY['outdoor', 'natur', 'see'], true),
   
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111',
   'Meditation & Atemarbeit',
   'Geführte Meditation kombiniert mit bewussten Atemtechniken für innere Ruhe und Klarheit.',
   'meditation', 'beginner', 45, 15, 2200,
   '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333332',
   ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'],
   ARRAY['meditation', 'atem', 'entspannung'], true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  updated_at = NOW();

-- =====================================================
-- DEMO CLASS INSTANCES (Next 7 days)
-- =====================================================

-- Generate class instances for the next 7 days
INSERT INTO class_instances (id, template_id, organization_id, start_time, end_time, instructor_id, location_id, room_id, capacity, price_cents, status) 
SELECT 
  uuid_generate_v4(),
  ct.id,
  ct.organization_id,
  (CURRENT_DATE + (day_offset || ' days')::INTERVAL + time_slot)::TIMESTAMPTZ,
  (CURRENT_DATE + (day_offset || ' days')::INTERVAL + time_slot + (ct.duration_minutes || ' minutes')::INTERVAL)::TIMESTAMPTZ,
  NULL, -- No instructors assigned yet
  ct.location_id,
  ct.room_id,
  ct.capacity,
  ct.price_cents,
  'scheduled'
FROM class_templates ct
CROSS JOIN LATERAL (VALUES (0), (1), (2), (3), (4), (5), (6)) AS days(day_offset)
CROSS JOIN LATERAL (
  VALUES 
    ('07:00'::TIME), ('08:30'::TIME), ('10:00'::TIME), 
    ('17:30'::TIME), ('19:00'::TIME), ('20:30'::TIME)
) AS times(time_slot)
WHERE ct.organization_id = '11111111-1111-1111-1111-111111111111'
AND ct.is_active = true
-- Only create morning classes for outdoor yoga (weather dependent)
AND NOT (ct.type = 'outdoor' AND time_slot > '12:00'::TIME)
-- Only create evening slots for Yin and meditation
AND NOT (ct.type IN ('yin', 'meditation') AND time_slot < '17:00'::TIME)
-- Limit to avoid too many instances
AND day_offset < 7
ON CONFLICT DO NOTHING;

-- =====================================================
-- DEMO PRODUCTS (Class Packs & Retail)
-- =====================================================

INSERT INTO products (id, organization_id, name, description, type, category, price_cents, credit_count, validity_days, class_types, images, is_active) VALUES
  ('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111',
   '{"de": "5er Karte Vinyasa", "en": "5-Class Vinyasa Pass"}',
   '{"de": "Flexibler 5er Block für alle Vinyasa Stunden", "en": "Flexible 5-class pass for all Vinyasa classes"}',
   'class_pack', 'passes', 15000, 5, 90, ARRAY['vinyasa'],
   ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop'],
   true),
   
  ('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111',
   '{"de": "10er Karte Unlimited", "en": "10-Class Unlimited Pass"}',
   '{"de": "10er Block für alle Klassen - beste Preis-Leistung!", "en": "10-class pass for all classes - best value!"}',
   'class_pack', 'passes', 28000, 10, 120, ARRAY['vinyasa', 'yin', 'outdoor', 'meditation'],
   ARRAY['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop'],
   true),
   
  ('55555555-5555-5555-5555-555555555553', '11111111-1111-1111-1111-111111111111',
   '{"de": "Yoga Matte Premium", "en": "Premium Yoga Mat"}',
   '{"de": "Hochwertige rutschfeste Yoga Matte aus nachhaltigem Material", "en": "High-quality non-slip yoga mat from sustainable materials"}',
   'retail', 'equipment', 8900, NULL, NULL, NULL,
   ARRAY['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop'],
   true),
   
  ('55555555-5555-5555-5555-555555555554', '11111111-1111-1111-1111-111111111111',
   '{"de": "Geschenkgutschein CHF 50", "en": "Gift Voucher CHF 50"}',
   '{"de": "Perfektes Geschenk für Yoga-Liebhaber", "en": "Perfect gift for yoga lovers"}',
   'gift_card', 'vouchers', 5000, NULL, 365, NULL,
   ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop'],
   true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  updated_at = NOW();

-- =====================================================
-- DEMO SYSTEM ALERTS
-- =====================================================

INSERT INTO system_alerts (id, organization_id, alert_type, severity, title, message, is_read, metadata) VALUES
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 
   'system_info', 'medium', 'Database Setup Complete',
   'YogaSwiss Demo Studio has been successfully set up with sample data. You can now start exploring the platform features.',
   false, '{"source": "migration", "version": "1.0"}'),
   
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111',
   'business_info', 'low', 'Welcome to YogaSwiss',
   'Your Swiss yoga studio management platform is ready! Check out the demo classes and try booking a session.',
   false, '{"type": "welcome", "demo": true}'),
   
  (uuid_generate_v4(), NULL,
   'platform_info', 'low', 'YogaSwiss Platform Initialized',
   'Switzerland #1 Yoga Platform is now running with complete database schema and demo data.',
   false, '{"platform": "yogaswiss", "environment": "demo"}')