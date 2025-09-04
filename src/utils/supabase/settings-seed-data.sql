-- Seed Data for Settings Management System
-- This file contains initial data for settings categories, feature flags, and SIS inventory

-- Insert settings categories
INSERT INTO settings_categories (id, name, slug, description, icon, priority, is_active) VALUES
  (gen_random_uuid(), 'Organization', 'organization', 'Legal entity, contact information, and basic setup', 'building', 1, true),
  (gen_random_uuid(), 'Branding', 'branding', 'Visual identity, logos, colors, and brand elements', 'palette', 2, true),
  (gen_random_uuid(), 'Localization', 'localization', 'Languages, currency, timezone, and regional settings', 'globe', 3, true),
  (gen_random_uuid(), 'Features', 'features', 'Platform features and module configurations', 'zap', 4, true),
  (gen_random_uuid(), 'Payments', 'payments', 'Payment providers, methods, and processing settings', 'credit-card', 5, true),
  (gen_random_uuid(), 'Taxes', 'taxes', 'VAT rates, tax calculations, and invoicing settings', 'receipt', 6, true),
  (gen_random_uuid(), 'Policies', 'policies', 'Booking, cancellation, and business policies', 'book-open', 7, true),
  (gen_random_uuid(), 'Communications', 'communications', 'Email, SMS, and notification settings', 'message-square', 8, true),
  (gen_random_uuid(), 'Security', 'security', 'Authentication, permissions, and security policies', 'shield', 9, true),
  (gen_random_uuid(), 'Compliance', 'compliance', 'GDPR, privacy, and regulatory compliance', 'file-text', 10, true);

-- Insert integration providers
INSERT INTO integration_providers (id, name, type, description, logo_url, config_schema, is_active) VALUES
  (gen_random_uuid(), 'TWINT', 'payment', 'Swiss mobile payment solution', NULL, 
   '{"merchant_id": {"type": "string", "required": true}, "api_key": {"type": "string", "required": true}}', true),
  (gen_random_uuid(), 'PostFinance', 'payment', 'Swiss banking payment gateway', NULL,
   '{"pspid": {"type": "string", "required": true}, "sha_in": {"type": "string", "required": true}}', true),
  (gen_random_uuid(), 'Datatrans', 'payment', 'Swiss payment processing platform', NULL,
   '{"merchant_id": {"type": "string", "required": true}, "hmac_key": {"type": "string", "required": true}}', true),
  (gen_random_uuid(), 'Stripe', 'payment', 'International payment processing', NULL,
   '{"publishable_key": {"type": "string", "required": true}, "secret_key": {"type": "string", "required": true}}', true),
  (gen_random_uuid(), 'WhatsApp Business', 'messaging', 'WhatsApp Business API for customer communication', NULL,
   '{"phone_number_id": {"type": "string", "required": true}, "access_token": {"type": "string", "required": true}}', true),
  (gen_random_uuid(), 'Twilio', 'messaging', 'SMS and voice communication platform', NULL,
   '{"account_sid": {"type": "string", "required": true}, "auth_token": {"type": "string", "required": true}}', true),
  (gen_random_uuid(), 'SendGrid', 'messaging', 'Email delivery and marketing platform', NULL,
   '{"api_key": {"type": "string", "required": true}, "from_email": {"type": "string", "required": true}}', true),
  (gen_random_uuid(), 'Mailchimp', 'messaging', 'Email marketing and automation', NULL,
   '{"api_key": {"type": "string", "required": true}, "server_prefix": {"type": "string", "required": true}}', true),
  (gen_random_uuid(), 'Google Calendar', 'calendar', 'Calendar synchronization and scheduling', NULL,
   '{"client_id": {"type": "string", "required": true}, "client_secret": {"type": "string", "required": true}}', true),
  (gen_random_uuid(), 'Zoom', 'calendar', 'Video conferencing and online classes', NULL,
   '{"api_key": {"type": "string", "required": true}, "api_secret": {"type": "string", "required": true}}', true),
  (gen_random_uuid(), 'Google Analytics', 'analytics', 'Web analytics and tracking', NULL,
   '{"tracking_id": {"type": "string", "required": true}, "measurement_id": {"type": "string", "required": true}}', true),
  (gen_random_uuid(), 'Meta Pixel', 'analytics', 'Facebook and Instagram advertising analytics', NULL,
   '{"pixel_id": {"type": "string", "required": true}, "access_token": {"type": "string", "required": true}}', true),
  (gen_random_uuid(), 'Bexio', 'accounting', 'Swiss accounting and business management', NULL,
   '{"client_id": {"type": "string", "required": true}, "client_secret": {"type": "string", "required": true}}', true),
  (gen_random_uuid(), 'Abacus', 'accounting', 'Swiss ERP and accounting software', NULL,
   '{"api_endpoint": {"type": "string", "required": true}, "api_key": {"type": "string", "required": true}}', true);

-- Insert feature flags
INSERT INTO feature_flags (id, name, description, type, default_value, is_active) VALUES
  (gen_random_uuid(), 'online_booking', 'Enable online class booking for customers', 'boolean', 'true', true),
  (gen_random_uuid(), 'mobile_app', 'Enable mobile app access and features', 'boolean', 'true', true),
  (gen_random_uuid(), 'waitlist_management', 'Automatic waitlist management for full classes', 'boolean', 'true', true),
  (gen_random_uuid(), 'packages_memberships', 'Enable packages and membership sales', 'boolean', 'true', true),
  (gen_random_uuid(), 'workshops_events', 'Enable workshop and special event management', 'boolean', 'true', true),
  (gen_random_uuid(), 'retail_products', 'Enable retail product sales and inventory', 'boolean', 'false', true),
  (gen_random_uuid(), 'marketing_tools', 'Enable email marketing and customer engagement tools', 'boolean', 'true', true),
  (gen_random_uuid(), 'advanced_analytics', 'Enable detailed reporting and business intelligence', 'boolean', 'false', true),
  (gen_random_uuid(), 'twint_payments', 'Enable TWINT mobile payments (Switzerland)', 'boolean', 'true', true),
  (gen_random_uuid(), 'qr_bill_invoicing', 'Enable Swiss QR-bill invoicing', 'boolean', 'true', true),
  (gen_random_uuid(), 'multi_language', 'Enable multi-language support (DE/FR/IT/EN)', 'boolean', 'true', true),
  (gen_random_uuid(), 'gdpr_compliance', 'Enable GDPR compliance tools and features', 'boolean', 'true', true),
  (gen_random_uuid(), 'corporate_wellness', 'Enable corporate wellness program features', 'boolean', 'false', true),
  (gen_random_uuid(), 'dynamic_pricing', 'Enable dynamic pricing and revenue optimization', 'boolean', 'false', true),
  (gen_random_uuid(), 'affiliate_program', 'Enable affiliate and referral programs', 'boolean', 'false', true);

-- Insert system health checks
INSERT INTO system_health_checks (id, name, type, endpoint, expected_response, timeout_seconds, is_active) VALUES
  (gen_random_uuid(), 'Database Connection', 'database', NULL, '{"status": "connected"}', 10, true),
  (gen_random_uuid(), 'Supabase Auth', 'api', 'https://supabase.co/rest/v1', '{"status": 200}', 30, true),
  (gen_random_uuid(), 'Supabase Realtime', 'realtime', NULL, '{"connected": true}', 15, true),
  (gen_random_uuid(), 'Supabase Storage', 'storage', NULL, '{"accessible": true}', 20, true),
  (gen_random_uuid(), 'Payment Gateway Health', 'api', NULL, '{"status": "operational"}', 30, true),
  (gen_random_uuid(), 'Email Service', 'api', NULL, '{"status": "active"}', 25, true),
  (gen_random_uuid(), 'SMS Service', 'api', NULL, '{"status": "ready"}', 25, true),
  (gen_random_uuid(), 'Webhook Delivery', 'webhook', NULL, '{"delivery_rate": ">95%"}', 20, true);

-- Insert SIS (Supabase Integration Status) inventory
INSERT INTO sis_inventory (id, area, page, component, resource_type, resource_ref, criticality, owner_role, description) VALUES
  -- Dashboard
  (gen_random_uuid(), 'Dashboard', 'Overview', 'KPICards', 'table', 'class_occurrences', 'high', 'manager', 'Class statistics and metrics'),
  (gen_random_uuid(), 'Dashboard', 'Overview', 'RevenueChart', 'table', 'orders', 'high', 'accountant', 'Revenue tracking and analytics'),
  (gen_random_uuid(), 'Dashboard', 'TodayOverview', 'TodayClasses', 'rpc', 'get_todays_classes', 'critical', 'front_desk', 'Today''s class schedule'),
  
  -- Classes
  (gen_random_uuid(), 'Classes', 'Schedule', 'ClassCalendar', 'table', 'class_occurrences', 'critical', 'instructor', 'Class schedule display'),
  (gen_random_uuid(), 'Classes', 'Schedule', 'BookingEngine', 'rpc', 'book_class', 'critical', 'customer', 'Class booking functionality'),
  (gen_random_uuid(), 'Classes', 'Management', 'ClassTemplates', 'table', 'class_templates', 'high', 'manager', 'Class template management'),
  (gen_random_uuid(), 'Classes', 'Registrations', 'RegistrationList', 'table', 'registrations', 'critical', 'front_desk', 'Customer registrations'),
  (gen_random_uuid(), 'Classes', 'Cancellation', 'RefundSystem', 'rpc', 'process_refund', 'high', 'manager', 'Cancellation and refund processing'),
  
  -- People
  (gen_random_uuid(), 'People', 'Customers', 'CustomerManagement', 'table', 'user_profiles', 'critical', 'front_desk', 'Customer data management'),
  (gen_random_uuid(), 'People', 'Instructors', 'InstructorProfiles', 'table', 'org_users', 'high', 'manager', 'Instructor management'),
  (gen_random_uuid(), 'People', 'Wallets', 'WalletManager', 'table', 'wallets', 'high', 'accountant', 'Customer wallet management'),
  
  -- Shop
  (gen_random_uuid(), 'Shop', 'Products', 'ProductCatalog', 'table', 'products', 'medium', 'manager', 'Product catalog management'),
  (gen_random_uuid(), 'Shop', 'Pricing', 'PricingManagement', 'rpc', 'calculate_pricing', 'high', 'manager', 'Dynamic pricing calculations'),
  (gen_random_uuid(), 'Shop', 'Inventory', 'InventoryTracking', 'table', 'inventory', 'medium', 'manager', 'Product inventory tracking'),
  
  -- Marketing
  (gen_random_uuid(), 'Marketing', 'Campaigns', 'CampaignManager', 'table', 'marketing_campaigns', 'medium', 'marketer', 'Marketing campaign management'),
  (gen_random_uuid(), 'Marketing', 'Segments', 'CustomerSegments', 'rpc', 'get_customer_segments', 'medium', 'marketer', 'Customer segmentation'),
  (gen_random_uuid(), 'Marketing', 'Analytics', 'MarketingReports', 'table', 'marketing_analytics', 'low', 'marketer', 'Marketing performance analytics'),
  
  -- Finance
  (gen_random_uuid(), 'Finance', 'Orders', 'OrderManagement', 'table', 'orders', 'critical', 'accountant', 'Order processing and management'),
  (gen_random_uuid(), 'Finance', 'Payments', 'PaymentProcessing', 'rpc', 'process_payment', 'critical', 'accountant', 'Payment processing functionality'),
  (gen_random_uuid(), 'Finance', 'SwissPayments', 'TWINTIntegration', 'api', 'twint_api', 'high', 'accountant', 'TWINT payment integration'),
  (gen_random_uuid(), 'Finance', 'SwissPayments', 'QRBillGeneration', 'rpc', 'generate_qr_bill', 'high', 'accountant', 'Swiss QR-bill generation'),
  (gen_random_uuid(), 'Finance', 'Reports', 'FinancialReports', 'rpc', 'generate_financial_report', 'medium', 'accountant', 'Financial reporting'),
  
  -- Settings
  (gen_random_uuid(), 'Settings', 'General', 'OrganizationSettings', 'table', 'settings', 'high', 'owner', 'Organization configuration'),
  (gen_random_uuid(), 'Settings', 'Security', 'RoleManagement', 'table', 'roles', 'critical', 'owner', 'Role and permission management'),
  (gen_random_uuid(), 'Settings', 'API', 'ApiKeyManagement', 'table', 'api_keys', 'high', 'owner', 'API key management'),
  (gen_random_uuid(), 'Settings', 'Integrations', 'WebhookManagement', 'table', 'webhooks', 'medium', 'manager', 'Webhook configuration'),
  (gen_random_uuid(), 'Settings', 'Compliance', 'GDPRCompliance', 'table', 'compliance_policies', 'critical', 'owner', 'GDPR compliance management');

-- Insert SIS checks
INSERT INTO sis_checks (id, area, page, component, name, resource_type, resource_ref, expectation_json, severity, is_active) VALUES
  -- Database connectivity checks
  (gen_random_uuid(), 'System', 'Database', 'Connection', 'Database Connection Test', 'table', 'orgs', 
   '{"query": "SELECT 1", "expected_result": "success"}', 'critical', true),
  (gen_random_uuid(), 'System', 'Database', 'RLS', 'Row Level Security Check', 'table', 'user_profiles', 
   '{"test": "rls_isolation", "expected": "tenant_isolated"}', 'critical', true),
  
  -- Authentication and authorization
  (gen_random_uuid(), 'Auth', 'Authentication', 'Login', 'User Authentication Test', 'rpc', 'authenticate_user', 
   '{"test_user": "test@example.com", "expected": "authenticated"}', 'critical', true),
  (gen_random_uuid(), 'Auth', 'Authorization', 'Permissions', 'Permission Check Test', 'rpc', 'check_permissions', 
   '{"test_permission": "customers.read", "expected": "authorized"}', 'critical', true),
  
  -- API endpoints
  (gen_random_uuid(), 'Classes', 'Schedule', 'ClassAPI', 'Class Schedule API Test', 'rpc', 'get_class_schedule', 
   '{"date_range": "today", "expected": "class_list"}', 'high', true),
  (gen_random_uuid(), 'Classes', 'Booking', 'BookingAPI', 'Class Booking API Test', 'rpc', 'book_class', 
   '{"test_booking": true, "expected": "booking_success"}', 'critical', true),
  
  -- Payment processing
  (gen_random_uuid(), 'Finance', 'Payments', 'PaymentAPI', 'Payment Processing Test', 'rpc', 'process_payment', 
   '{"test_payment": {"amount": 100, "method": "stripe"}, "expected": "payment_processed"}', 'critical', true),
  (gen_random_uuid(), 'Finance', 'SwissPayments', 'TWINT', 'TWINT Integration Test', 'api', 'twint_api', 
   '{"test_transaction": true, "expected": "twint_available"}', 'high', true),
  
  -- Storage and files
  (gen_random_uuid(), 'Storage', 'Files', 'Upload', 'File Upload Test', 'storage', 'public/test', 
   '{"test_upload": true, "expected": "upload_success"}', 'medium', true),
  (gen_random_uuid(), 'Storage', 'Images', 'Resize', 'Image Processing Test', 'storage', 'images/profile', 
   '{"test_resize": true, "expected": "resize_success"}', 'medium', true),
  
  -- Realtime functionality
  (gen_random_uuid(), 'Realtime', 'Notifications', 'PushNotifications', 'Push Notification Test', 'realtime', 'notifications', 
   '{"test_notification": true, "expected": "notification_delivered"}', 'medium', true),
  (gen_random_uuid(), 'Realtime', 'LiveUpdates', 'ClassUpdates', 'Live Class Updates Test', 'realtime', 'class_updates', 
   '{"test_update": true, "expected": "update_received"}', 'high', true),
  
  -- Webhook delivery
  (gen_random_uuid(), 'Webhooks', 'Delivery', 'PaymentWebhooks', 'Payment Webhook Delivery Test', 'webhook', 'payment_webhooks', 
   '{"test_webhook": true, "expected": "webhook_delivered"}', 'high', true),
  (gen_random_uuid(), 'Webhooks', 'Security', 'SignatureValidation', 'Webhook Signature Validation Test', 'webhook', 'webhook_signatures', 
   '{"test_signature": true, "expected": "signature_valid"}', 'high', true);

-- Insert sample email templates
INSERT INTO email_templates (id, org_id, name, type, subject, html_content, text_content, variables, is_active) VALUES
  (gen_random_uuid(), 'demo-org-id', 'booking_confirmation', 'transactional', 
   '{"en": "Class Booking Confirmation", "de": "Klassenbuchung Bestätigung", "fr": "Confirmation de réservation", "it": "Conferma prenotazione"}',
   '{"en": "<h1>Booking Confirmed</h1><p>Your class {{class_name}} is confirmed for {{date}} at {{time}}.</p>", "de": "<h1>Buchung bestätigt</h1><p>Ihre Klasse {{class_name}} ist bestätigt für {{date}} um {{time}}.</p>"}',
   '{"en": "Your class {{class_name}} is confirmed for {{date}} at {{time}}.", "de": "Ihre Klasse {{class_name}} ist bestätigt für {{date}} um {{time}}."}',
   '["class_name", "date", "time", "instructor", "location"]', true),
  
  (gen_random_uuid(), 'demo-org-id', 'class_reminder', 'transactional',
   '{"en": "Class Reminder - Tomorrow", "de": "Klassenergrinnerung - Morgen", "fr": "Rappel de cours - Demain", "it": "Promemoria lezione - Domani"}',
   '{"en": "<h1>Class Reminder</h1><p>Don''t forget your {{class_name}} class tomorrow at {{time}}!</p>", "de": "<h1>Klassenerinnerung</h1><p>Vergessen Sie nicht Ihre {{class_name}} Klasse morgen um {{time}}!</p>"}',
   '{"en": "Don''t forget your {{class_name}} class tomorrow at {{time}}!", "de": "Vergessen Sie nicht Ihre {{class_name}} Klasse morgen um {{time}}!"}',
   '["class_name", "time", "instructor", "location", "preparation_notes"]', true),
  
  (gen_random_uuid(), 'demo-org-id', 'welcome_new_customer', 'marketing',
   '{"en": "Welcome to {{studio_name}}!", "de": "Willkommen bei {{studio_name}}!", "fr": "Bienvenue chez {{studio_name}}!", "it": "Benvenuto da {{studio_name}}!"}',
   '{"en": "<h1>Welcome!</h1><p>We''re excited to have you join our yoga community at {{studio_name}}.</p>", "de": "<h1>Willkommen!</h1><p>Wir freuen uns, Sie in unserer Yoga-Gemeinschaft bei {{studio_name}} begrüßen zu dürfen.</p>"}',
   '{"en": "We''re excited to have you join our yoga community at {{studio_name}}.", "de": "Wir freuen uns, Sie in unserer Yoga-Gemeinschaft bei {{studio_name}} begrüßen zu dürfen."}',
   '["customer_name", "studio_name", "first_class_offer", "contact_info"]', true);

-- Insert sample compliance policies
INSERT INTO compliance_policies (id, org_id, type, title, content, version, effective_from, requires_acceptance, created_by) VALUES
  (gen_random_uuid(), 'demo-org-id', 'privacy', 
   '{"en": "Privacy Policy", "de": "Datenschutzerklärung", "fr": "Politique de confidentialité", "it": "Informativa sulla privacy"}',
   '{"en": "<h1>Privacy Policy</h1><p>This privacy policy explains how we collect, use, and protect your personal data in accordance with GDPR and Swiss data protection laws.</p>", "de": "<h1>Datenschutzerklärung</h1><p>Diese Datenschutzerklärung erklärt, wie wir Ihre persönlichen Daten gemäß DSGVO und Schweizer Datenschutzgesetzen sammeln, verwenden und schützen.</p>"}',
   'v1.0', now(), true, NULL),
   
  (gen_random_uuid(), 'demo-org-id', 'terms',
   '{"en": "Terms of Service", "de": "Nutzungsbedingungen", "fr": "Conditions d''utilisation", "it": "Termini di servizio"}',
   '{"en": "<h1>Terms of Service</h1><p>These terms govern your use of our yoga studio services and booking platform.</p>", "de": "<h1>Nutzungsbedingungen</h1><p>Diese Bedingungen regeln Ihre Nutzung unserer Yoga-Studio-Dienste und Buchungsplattform.</p>"}',
   'v1.0', now(), true, NULL),
   
  (gen_random_uuid(), 'demo-org-id', 'cancellation',
   '{"en": "Cancellation Policy", "de": "Stornierungsrichtlinie", "fr": "Politique d''annulation", "it": "Politica di cancellazione"}',
   '{"en": "<h1>Cancellation Policy</h1><p>Classes can be cancelled up to 12 hours before the scheduled start time without penalty.</p>", "de": "<h1>Stornierungsrichtlinie</h1><p>Klassen können bis zu 12 Stunden vor dem geplanten Beginn ohne Strafe storniert werden.</p>"}',
   'v1.0', now(), false, NULL);

-- Insert default security settings for demo org
INSERT INTO security_settings (id, org_id, setting_key, setting_value) VALUES
  (gen_random_uuid(), 'demo-org-id', 'require_2fa', 'false'),
  (gen_random_uuid(), 'demo-org-id', 'enforce_strong_passwords', 'true'),
  (gen_random_uuid(), 'demo-org-id', 'session_timeout_hours', '4'),
  (gen_random_uuid(), 'demo-org-id', 'ip_restriction_enabled', 'false'),
  (gen_random_uuid(), 'demo-org-id', 'mask_customer_data', 'true'),
  (gen_random_uuid(), 'demo-org-id', 'require_export_approval', 'true'),
  (gen_random_uuid(), 'demo-org-id', 'log_data_access', 'true'),
  (gen_random_uuid(), 'demo-org-id', 'data_retention_years', '7'),
  (gen_random_uuid(), 'demo-org-id', 'auto_purge_inactive', 'false'),
  (gen_random_uuid(), 'demo-org-id', 'consent_version_tracking', 'true');