// Demo UUID Helper for YogaSwiss Application
// Provides consistent demo UUIDs and validation utilities

export const DEMO_UUIDS = {
  // Demo Organizations
  DEMO_ORG_PRIMARY: '00000000-0000-0000-0000-000000000001',
  DEMO_ORG_SECONDARY: '00000000-0000-0000-0000-000000000002',
  TEST_ORG: '00000000-0000-0000-0000-000000000003',
  
  // Demo Users (matching existing system users)
  SUPER_ADMIN: '11111111-1111-1111-1111-111111111111',
  ADMIN_USER: '22222222-2222-2222-2222-222222222222',
  INSTRUCTOR_1: '33333333-3333-3333-3333-333333333333',
  FRONT_DESK: '44444444-4444-4444-4444-444444444444',
  ACCOUNTING: '55555555-5555-5555-5555-555555555555',
  MARKETING: '66666666-6666-6666-6666-666666666666',
  INSTRUCTOR_2: '77777777-7777-7777-7777-777777777777',
  INSTRUCTOR_3: '88888888-8888-8888-8888-888888888888',
  
  // Demo Customers
  CUSTOMER_1: 'c0000000-0000-0000-0000-000000000001',
  CUSTOMER_2: 'c0000000-0000-0000-0000-000000000002',
  CUSTOMER_3: 'c0000000-0000-0000-0000-000000000003',
  
  // Demo Locations
  LOCATION_STUDIO_A: 'l0000000-0000-0000-0000-000000000001',
  LOCATION_STUDIO_B: 'l0000000-0000-0000-0000-000000000002',
  LOCATION_OUTDOOR: 'l0000000-0000-0000-0000-000000000003',
} as const;

// Map of non-UUID demo IDs to proper UUIDs
export const DEMO_ID_MAP: Record<string, string> = {
  'demo-org-id': DEMO_UUIDS.DEMO_ORG_PRIMARY,
  'org-demo-1': DEMO_UUIDS.DEMO_ORG_PRIMARY,
  'org-demo-2': DEMO_UUIDS.DEMO_ORG_SECONDARY,
  'test-org-id': DEMO_UUIDS.TEST_ORG,
  'dev-org-id': DEMO_UUIDS.TEST_ORG,
  
  // Legacy instructor IDs
  'instructor-1': DEMO_UUIDS.INSTRUCTOR_1,
  'instructor-2': DEMO_UUIDS.INSTRUCTOR_2,
  'instructor-3': DEMO_UUIDS.INSTRUCTOR_3,
};

/**
 * Validates if a string is a proper UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Converts a demo ID to a proper UUID, or returns the original if already valid
 */
export function normalizeToUUID(id: string): string {
  if (isValidUUID(id)) {
    return id;
  }
  
  const mappedUUID = DEMO_ID_MAP[id];
  if (mappedUUID) {
    console.log(`[DemoUUID] Normalized "${id}" to "${mappedUUID}"`);
    return mappedUUID;
  }
  
  console.warn(`[DemoUUID] Unknown demo ID: "${id}". Cannot normalize to UUID.`);
  return id; // Return original if no mapping found
}

/**
 * Validates and normalizes an organization ID for database queries
 */
export function validateOrganizationId(orgId?: string): string | null {
  if (!orgId) return null;
  
  if (isValidUUID(orgId)) {
    return orgId;
  }
  
  const normalized = normalizeToUUID(orgId);
  if (isValidUUID(normalized)) {
    return normalized;
  }
  
  console.warn(`[DemoUUID] Invalid organization ID format: "${orgId}". Skipping organization filter.`);
  return null;
}

/**
 * Get demo organization data with proper UUIDs
 */
export function getDemoOrganization() {
  return {
    id: DEMO_UUIDS.DEMO_ORG_PRIMARY,
    type: 'studio' as const,
    parent_org_id: null,
    name: 'YogaSwiss Demo Studio',
    slug: 'yogaswiss-demo',
    currency: 'CHF',
    timezone: 'Europe/Zurich',
    settings: {
      languages: ['de', 'en', 'fr'],
      default_language: 'de',
      vat_rate: 7.7,
      twint_enabled: true,
      qr_bill_enabled: true,
      stripe_enabled: false
    },
    status: 'active' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    role: 'owner' as const,
    permissions: {
      schedule: true,
      customers: true,
      finance: true,
      marketing: true,
      settings: true,
      analytics: true,
      wallet_management: true,
      user_management: true
    },
    location_scope: []
  };
}

/**
 * Generate demo-safe HTTP headers with proper UUIDs
 */
export function getDemoAuthHeaders(accessToken?: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || 'demo-anon-key'}`,
    'X-Org-ID': DEMO_UUIDS.DEMO_ORG_PRIMARY
  };
}