-- =====================================================
-- YogaSwiss Complete Database Initialization Script
-- Run this script to set up the complete Supabase database
-- =====================================================

-- This script combines all the components for easy deployment

-- Step 1: Create the complete schema
\i '/utils/supabase/core-schema.sql'

-- Step 2: Set up RLS policies
\i '/utils/supabase/rls-policies-complete.sql'

-- Step 3: Create business logic functions
\i '/utils/supabase/core-functions.sql'

-- Step 4: Configure storage
\i '/utils/supabase/storage-config.sql'

-- Step 5: Insert seed data for development
INSERT INTO organizations (id, name, slug, description, settings) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Demo Yoga Studio',
  'demo-studio',
  'A demonstration yoga studio for testing',
  jsonb_build_object(
    'timezone', 'Europe/Zurich',
    'currency', 'CHF',
    'default_language', 'de'
  )
) ON CONFLICT (id) DO NOTHING;

-- Create demo locations
INSERT INTO locations (id, organization_id, name, type, capacity, address, is_active) VALUES
(
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Studio A',
  'studio',
  20,
  jsonb_build_object(
    'street', 'Bahnhofstrasse 1',
    'city', 'Zürich',
    'postal_code', '8001',
    'country', 'CH'
  ),
  true
),
(
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Online Studio',
  'online',
  50,
  jsonb_build_object(
    'platform', 'Zoom',
    'url', 'https://zoom.us/j/demo'
  ),
  true
) ON CONFLICT (id) DO NOTHING;

-- Create demo class templates
INSERT INTO class_templates (id, organization_id, name, description, type, level, duration_minutes, capacity, price_cents, location_id, is_active) VALUES
(
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'Morning Vinyasa Flow',
  'Energizing flow to start your day',
  'yoga',
  'intermediate',
  75,
  15,
  2800,
  '22222222-2222-2222-2222-222222222222',
  true
),
(
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  'Evening Yin Yoga',
  'Relaxing practice to end the day',
  'yoga',
  'beginner',
  60,
  12,
  2500,
  '22222222-2222-2222-2222-222222222222',
  true
) ON CONFLICT (id) DO NOTHING;

-- Create demo products
INSERT INTO products (id, organization_id, name, description, type, price_cents, credit_count, validity_days, is_active) VALUES
(
  '66666666-6666-6666-6666-666666666666',
  '11111111-1111-1111-1111-111111111111',
  jsonb_build_object('en', '10 Class Package', 'de', '10er Karten'),
  jsonb_build_object('en', 'Ten classes to use within 3 months', 'de', 'Zehn Stunden innerhalb von 3 Monaten'),
  'class_pack',
  25000,
  10,
  90,
  true
),
(
  '77777777-7777-7777-7777-777777777777',
  '11111111-1111-1111-1111-111111111111',
  jsonb_build_object('en', 'Monthly Unlimited', 'de', 'Monats-Abo'),
  jsonb_build_object('en', 'Unlimited classes for one month', 'de', 'Unlimitierte Stunden für einen Monat'),
  'membership',
  14900,
  NULL,
  30,
  true
) ON CONFLICT (id) DO NOTHING;

-- Run initial SIS checks
SELECT run_sis_checks('11111111-1111-1111-1111-111111111111');

-- Enable realtime for critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE class_instances;
ALTER PUBLICATION supabase_realtime ADD TABLE class_registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE waitlists;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE organization_members;

-- Create indexes for performance (if not already created)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_class_instances_org_time 
ON class_instances(organization_id, start_time);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_class_registrations_customer_org 
ON class_registrations(customer_id, organization_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_org_status 
ON payments(organization_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_status 
ON orders(customer_id, status);

-- Set up webhook endpoints (would be configured in Supabase dashboard)
-- INSERT INTO webhook_deliveries (webhook_url, event_type, payload) VALUES ...

NOTIFY setup_complete, 'YogaSwiss database initialization completed successfully';