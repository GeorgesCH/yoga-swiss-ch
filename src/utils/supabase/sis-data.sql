-- =====================================================
-- SIS Inventory and Checks Data
-- Import the CSV data from the specification
-- =====================================================

-- =====================================================
-- SIS INVENTORY DATA
-- =====================================================

INSERT INTO sis_inventory (area, page, component, resource_type, resource_ref, criticality, owner_role) VALUES
-- Dashboard
('Dashboard', 'Overview', 'KPI tiles view', 'table', 'mv_finance_kpis', 'P1', 'owner,studio_manager,accountant'),
('Dashboard', 'Overview', 'Recent activity feed', 'table', 'audit_logs', 'P2', 'owner,studio_manager'),
('Dashboard', 'Overview', 'Alerts widget', 'table', 'system_alerts', 'P1', 'owner,studio_manager,accountant'),

-- People
('People', 'Customers', 'List & filters', 'table', 'customers', 'P1', 'front_desk,studio_manager,owner,marketer'),
('People', 'Customers', 'Profile core', 'table', 'customers', 'P1', 'front_desk,studio_manager,owner'),
('People', 'Customers', 'Consents tab', 'table', 'consents', 'P1', 'front_desk,studio_manager,owner,marketer'),
('People', 'Customers', 'Wallets tab', 'table', 'wallets', 'P1', 'front_desk,studio_manager,owner,accountant'),
('People', 'Customers', 'Wallet ledger', 'table', 'wallet_transactions', 'P1', 'studio_manager,owner,accountant'),
('People', 'Instructors', 'List & profile', 'table', 'instructors', 'P1', 'owner,studio_manager'),
('People', 'Instructors', 'Availability', 'table', 'instructor_availability', 'P1', 'owner,studio_manager,instructor'),
('People', 'Instructors', 'Earnings tab', 'table', 'earnings', 'P1', 'owner,studio_manager,instructor,accountant'),
('People', 'Staff Management', 'Pay rates', 'table', 'pay_rules', 'P1', 'owner,studio_manager,accountant'),
('People', 'Staff Management', 'Timesheets', 'table', 'timesheets', 'P1', 'owner,studio_manager,accountant'),
('People', 'Customer Wallets', 'Balances', 'table', 'wallets', 'P1', 'owner,studio_manager,accountant,front_desk'),
('People', 'Customer Wallets', 'Adjustments', 'rpc', 'wallet_adjust', 'P1', 'owner,studio_manager,accountant'),
('People', 'Communications', 'Inbox', 'table', 'thread_messages', 'P2', 'owner,studio_manager,marketer,front_desk'),
('People', 'Communications', 'Templates', 'table', 'message_templates', 'P2', 'marketer,owner'),
('People', 'Payroll & Compensation', 'Pay rules', 'table', 'pay_rules', 'P1', 'owner,studio_manager,accountant'),
('People', 'Payroll & Compensation', 'Earnings compute', 'rpc', 'compute_earnings', 'P1', 'owner,studio_manager,accountant'),
('People', 'Payroll & Compensation', 'Period close', 'rpc', 'close_payroll', 'P1', 'owner,studio_manager,accountant'),
('People', 'Payroll & Compensation', 'Payout export', 'table', 'payouts', 'P1', 'accountant,owner'),

-- Classes
('Classes', 'Class Schedule', 'Calendar', 'table', 'class_instances', 'P1', 'owner,studio_manager,instructor,front_desk'),
('Classes', 'Booking Engine', 'Checkout', 'rpc', 'reserve_class_spot', 'P1', 'owner,studio_manager,front_desk'),
('Classes', 'Booking Engine', 'Capture payment', 'rpc', 'capture_payment', 'P1', 'owner,studio_manager,front_desk'),
('Classes', 'Advanced Scheduling', 'Bulk editor', 'table', 'class_instances', 'P2', 'owner,studio_manager'),
('Classes', 'Advanced Scheduling', 'Blackout dates', 'table', 'blackouts', 'P2', 'owner,studio_manager'),
('Classes', 'Recurring Classes', 'Generator', 'rpc', 'generate_class_occurrences', 'P1', 'owner,studio_manager'),
('Classes', 'Registrations', 'Roster', 'table', 'class_registrations', 'P1', 'owner,studio_manager,instructor,front_desk'),
('Classes', 'Registrations', 'Check-in', 'rpc', 'mark_attendance', 'P1', 'owner,studio_manager,front_desk'),
('Classes', 'Registration System', 'Policies', 'table', 'registration_policies', 'P2', 'owner,studio_manager'),
('Classes', 'Cancellation & Refunds', 'Refund wizard', 'rpc', 'cancel_class_registration', 'P1', 'owner,studio_manager,accountant'),
('Classes', 'Locations & Resources', 'Locations', 'table', 'locations', 'P1', 'owner,studio_manager'),
('Classes', 'Locations & Resources', 'Rooms', 'table', 'rooms', 'P2', 'owner,studio_manager'),
('Classes', 'Outdoor Locations', 'Weather policy', 'edge', 'weather_decision', 'P3', 'owner,studio_manager'),
('Classes', 'Retreat Management', 'Retreats', 'table', 'retreats', 'P2', 'owner,studio_manager'),
('Classes', 'Retreat Management', 'Retreat pricing', 'table', 'retreat_prices', 'P2', 'owner,studio_manager,accountant'),

-- Shop
('Shop', 'Products', 'Catalog', 'table', 'products', 'P2', 'owner,studio_manager'),
('Shop', 'Products', 'Media', 'storage', 'product-media', 'P2', 'owner,studio_manager'),
('Shop', 'Pricing & Packages', 'Class passes', 'table', 'products', 'P1', 'owner,studio_manager'),
('Shop', 'Pricing & Packages', 'Memberships', 'table', 'products', 'P1', 'owner,studio_manager'),
('Shop', 'Inventory', 'Stock ledger', 'table', 'inventory_ledger', 'P2', 'owner,studio_manager,accountant'),

-- Marketing
('Marketing', 'Campaign Management', 'Email/SMS builder', 'table', 'campaigns', 'P2', 'marketer,owner'),
('Marketing', 'Campaign Management', 'Sends queue', 'table', 'thread_messages', 'P2', 'marketer,owner'),
('Marketing', 'Customer Segments', 'Segment builder', 'table', 'segments', 'P2', 'marketer,owner'),
('Marketing', 'Analytics & Reports', 'Attribution views', 'table', 'mv_marketing_attribution', 'P3', 'marketer,owner'),
('Marketing', 'Business Growth', 'Referrals', 'table', 'referrals', 'P3', 'marketer,owner'),
('Marketing', 'Automations', 'Journeys', 'table', 'journeys', 'P2', 'marketer,owner'),

-- Finance
('Finance', 'Finance Overview', 'KPIs', 'table', 'mv_finance_kpis', 'P1', 'owner,studio_manager,accountant'),
('Finance', 'Payments & Billing', 'Payments', 'table', 'payments', 'P1', 'accountant,owner,studio_manager'),
('Finance', 'Payments & Billing', 'Provider webhooks', 'table', 'webhook_deliveries', 'P1', 'accountant,owner'),
('Finance', 'Swiss Payments', 'Invoices (QR)', 'table', 'invoices', 'P1', 'accountant,owner'),
('Finance', 'Swiss Payments', 'QR generator', 'rpc', 'generate_qr_bill', 'P1', 'accountant,owner'),
('Finance', 'Swiss Payments', 'Bank import', 'table', 'bank_imports', 'P1', 'accountant,owner'),
('Finance', 'Wallet Management', 'Wallets', 'table', 'wallets', 'P1', 'accountant,owner,studio_manager'),
('Finance', 'Wallet Management', 'Rules/eligibility', 'rpc', 'wallet_eligibility', 'P1', 'accountant,owner,studio_manager'),
('Finance', 'Financial Reports', 'VAT report', 'view', 'vw_tax_report', 'P1', 'accountant,owner'),
('Finance', 'Financial Reports', 'Payouts', 'table', 'payouts', 'P2', 'accountant,owner'),
('Finance', 'Financial Reports', 'Instructor earnings', 'table', 'earnings', 'P1', 'accountant,owner,studio_manager,instructor'),

-- Settings
('Settings', 'General Settings', 'Tenant prefs', 'table', 'organizations', 'P1', 'owner,studio_manager'),
('Settings', 'System Health', 'SIS dashboard', 'table', 'sis_runs', 'P1', 'owner'),
('Settings', 'API & Integrations', 'API keys', 'table', 'api_keys', 'P1', 'owner'),
('Settings', 'API & Integrations', 'Webhooks', 'table', 'webhooks', 'P1', 'owner'),
('Settings', 'Compliance & Legal', 'Consents', 'table', 'consents', 'P1', 'owner,marketer'),
('Settings', 'Compliance & Legal', 'DSAR', 'table', 'dsar_requests', 'P2', 'owner'),
('Settings', 'Security', 'Audit log', 'table', 'audit_logs', 'P1', 'owner'),
('Settings', 'Security', 'Impersonation', 'table', 'impersonation_sessions', 'P1', 'owner'),

-- Community
('Community', 'Messaging & Inbox', 'Threads', 'table', 'threads', 'P2', 'owner,studio_manager,instructor,front_desk,marketer'),
('Community', 'Messaging & Inbox', 'Messages', 'table', 'thread_messages', 'P1', 'owner,studio_manager,instructor,front_desk,marketer'),
('Community', 'Messaging & Inbox', 'Realtime channel', 'realtime', 'thread_messages', 'P1', 'owner,studio_manager,instructor,front_desk,marketer'),
('Community', 'Messaging & Inbox', 'Attachments', 'storage', 'media-messages', 'P2', 'owner,studio_manager,instructor,front_desk,marketer'),
('Community', 'Messaging & Inbox', 'Moderation queue', 'table', 'moderation_queue', 'P2', 'owner,studio_manager')

ON CONFLICT (area, page, component, resource_ref) DO UPDATE SET
  resource_type = EXCLUDED.resource_type,
  criticality = EXCLUDED.criticality,
  owner_role = EXCLUDED.owner_role,
  updated_at = NOW();

-- =====================================================
-- SIS CHECKS DATA
-- =====================================================

INSERT INTO sis_checks (id, area, page, component, name, resource_type, resource_ref, expectation_json, severity) VALUES
-- Critical infrastructure checks
(1, 'Classes', 'Booking Engine', 'Checkout', 'Reserve slot RPC returns hold id', 'rpc', 'reserve_class_spot', '{"expects":"hold_id","role":"front_desk|studio_manager","timeout_ms":1500}', 'critical'),
(2, 'Classes', 'Booking Engine', 'Checkout', 'Capture payment RPC succeeds in sandbox', 'rpc', 'capture_payment', '{"expects":"payment_id","role":"front_desk|studio_manager","sandbox":true}', 'critical'),
(3, 'Classes', 'Registrations', 'Roster', 'RLS: instructor reads own class only', 'table', 'class_registrations', '{"policy":"instructor_owns_instance","probe":"instructor_user"}', 'critical'),
(4, 'Classes', 'Recurring Classes', 'Generator', 'Generate occurrences within range', 'rpc', 'generate_class_occurrences', '{"expects":" >0_rows ","role":"studio_manager"}', 'high'),
(5, 'Finance', 'Swiss Payments', 'Invoices (QR)', 'QR bill payload validates', 'rpc', 'generate_qr_bill', '{"expects":"pdf_url&qr_payload_ok","role":"accountant"}', 'critical'),
(6, 'Finance', 'Payments & Billing', 'Webhooks', 'Recent deliveries < 5% failures', 'table', 'webhook_deliveries', '{"expects":"failure_rate<0.05","window":"24h"}', 'critical'),
(7, 'Finance', 'Wallet Management', 'Eligibility', 'Eligibility RPC enforces rules', 'rpc', 'wallet_eligibility', '{"expects":"eligible:true|false with reason","role":"front_desk"}', 'high'),
(8, 'People', 'Payroll & Compensation', 'Earnings compute', 'Earnings match roster x rules', 'rpc', 'compute_earnings', '{"expects":" >=0_rows & no_error ","role":"accountant"}', 'critical'),
(9, 'People', 'Customers', 'Consents', 'RLS: marketer sees consent only', 'table', 'consents', '{"policy":"tenant_scoped","probe":"marketer_user"}', 'high'),
(10, 'Settings', 'System Health', 'SIS dashboard', 'SIS nightly run exists', 'table', 'sis_runs', '{"expects":"row_in_24h"}', 'high'),
(11, 'Settings', 'Security', 'Audit log', 'Audit writes from impersonation', 'table', 'audit_logs', '{"expects":"impersonation_action_logged"}', 'high'),
(12, 'Marketing', 'Automations', 'Journeys', 'Realtime receives insert within 3s', 'realtime', 'journeys', '{"expects":"insert_event<=3000ms"}', 'high'),
(13, 'Shop', 'Pricing & Packages', 'Memberships', 'Subscription row with status=active', 'table', 'products', '{"expects":" >=1_active ","role":"studio_manager"}', 'high'),
(14, 'Community', 'Messaging & Inbox', 'Realtime channel', 'New message event received in 2s', 'realtime', 'thread_messages', '{"expects":"insert_event<=2000ms","role":"instructor|front_desk"}', 'high'),
(15, 'Community', 'Messaging & Inbox', 'Moderation queue', 'Flagged messages appear in queue', 'table', 'moderation_queue', '{"expects":" >=1_flagged_in_24h "}', 'medium'),

-- Additional system health checks
(16, 'Dashboard', 'Overview', 'KPI tiles view', 'Finance KPIs materialized view current', 'table', 'mv_finance_kpis', '{"expects":"data_within_24h","role":"accountant"}', 'high'),
(17, 'Dashboard', 'Overview', 'Alerts widget', 'System alerts accessible', 'table', 'system_alerts', '{"expects":"readable_by_staff","role":"studio_manager"}', 'high'),
(18, 'People', 'Customer Wallets', 'Adjustments', 'Wallet adjust RPC validates permissions', 'rpc', 'wallet_adjust', '{"expects":"permission_check_ok","role":"accountant"}', 'critical'),
(19, 'Classes', 'Cancellation & Refunds', 'Refund wizard', 'Cancel registration RPC processes refund', 'rpc', 'cancel_class_registration', '{"expects":"refund_processed","role":"studio_manager"}', 'critical'),
(20, 'Storage', 'Media', 'Product images', 'Product media storage accessible', 'storage', 'product-media', '{"expects":"upload_and_retrieve_ok","role":"studio_manager"}', 'medium'),

-- RLS and security checks
(21, 'Classes', 'Class Schedule', 'Calendar', 'RLS: staff see org classes only', 'table', 'class_instances', '{"policy":"org_scoped","probe":"cross_tenant_test"}', 'critical'),
(22, 'People', 'Customers', 'Profile core', 'RLS: customer data isolated by org', 'table', 'profiles', '{"policy":"customer_isolation","probe":"cross_org_test"}', 'critical'),
(23, 'Finance', 'Payments & Billing', 'Payments', 'RLS: payment data secured', 'table', 'payments', '{"policy":"payment_isolation","probe":"accountant_role"}', 'critical'),
(24, 'Community', 'Messaging & Inbox', 'Messages', 'RLS: thread messages member-only', 'table', 'thread_messages', '{"policy":"member_only","probe":"non_member_test"}', 'critical'),
(25, 'Settings', 'API & Integrations', 'API keys', 'API keys owner-only access', 'table', 'api_keys', '{"policy":"owner_only","probe":"non_owner_test"}', 'critical')

ON CONFLICT (id) DO UPDATE SET
  area = EXCLUDED.area,
  page = EXCLUDED.page,
  component = EXCLUDED.component,
  name = EXCLUDED.name,
  resource_type = EXCLUDED.resource_type,
  resource_ref = EXCLUDED.resource_ref,
  expectation_json = EXCLUDED.expectation_json,
  severity = EXCLUDED.severity,
  updated_at = NOW();

-- =====================================================
-- INITIAL SYSTEM CONFIGURATION
-- =====================================================

-- Create a sample organization if it doesn't exist (for development)
INSERT INTO organizations (id, name, slug, description, settings) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Demo Yoga Studio',
  'demo-studio',
  'A demonstration yoga studio for SIS testing',
  jsonb_build_object(
    'timezone', 'Europe/Zurich',
    'currency', 'CHF',
    'default_language', 'de',
    'sis_enabled', true,
    'sis_nightly_run', true
  )
) ON CONFLICT (id) DO NOTHING;

-- Create some sample message templates
INSERT INTO message_templates (organization_id, name, category, subject, body, variables, role_permissions) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Welcome Message',
  'welcome',
  'Welcome to {studio_name}!',
  'Hi {customer_name}, welcome to our yoga community! We''re excited to have you join us.',
  '["customer_name", "studio_name"]',
  '{"owner", "studio_manager", "front_desk"}'
),
(
  '11111111-1111-1111-1111-111111111111',
  'Class Reminder',
  'reminder',
  'Your class starts in 30 minutes',
  'Hi {customer_name}, your {class_name} class starts at {start_time}. See you soon!',
  '["customer_name", "class_name", "start_time", "location_name"]',
  '{"owner", "studio_manager", "front_desk", "instructor"}'
),
(
  '11111111-1111-1111-1111-111111111111',
  'Payment Reminder',
  'billing',
  'Payment reminder for your account',
  'Hi {customer_name}, we have an outstanding balance of CHF {amount} on your account. Please update your payment method.',
  '["customer_name", "amount", "due_date"]',
  '{"owner", "studio_manager", "accountant"}'
)
ON CONFLICT DO NOTHING;

-- Add some initial system alerts for testing
INSERT INTO system_alerts (organization_id, alert_type, severity, title, message) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'system_info',
  'medium',
  'SIS System Initialized',
  'Supabase Integration Status system has been successfully initialized and is ready for monitoring.'
)
ON CONFLICT DO NOTHING;