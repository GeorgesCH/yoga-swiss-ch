// Demo data seeding utility for the frontend
import { getSupabaseProjectId, getSupabaseAnonKey } from './supabase/env';

const serverUrl = `https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4`;

export interface SeedStatus {
  success: boolean;
  counts: Record<string, number>;
  demoUsers: number;
  isSeeded: boolean;
}

export interface SeedResult {
  success: boolean;
  message: string;
  data?: {
    orgs: number;
    users: number;
    locations: number;
    templates: number;
    products: number;
    occurrences: number;
    orders: number;
    user_mappings: Record<string, string>;
  };
  error?: string;
}

// Check if demo data is already seeded
export async function checkSeedStatus(): Promise<SeedStatus> {
  try {
    const response = await fetch(`${serverUrl}/seed/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to check seed status:', error);
    return {
      success: false,
      counts: {},
      demoUsers: 0,
      isSeeded: false
    };
  }
}

// Seed demo data
export async function seedDemoData(): Promise<SeedResult> {
  try {
    console.log('🌱 Starting demo data seeding...');
    
    const response = await fetch(`${serverUrl}/seed/demo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Demo data seeded successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to seed demo data:', error);
    return {
      success: false,
      message: `Failed to seed demo data: ${error.message}`,
      error: error.message
    };
  }
}

// Reset demo data (clean slate)
export async function resetDemoData(): Promise<SeedResult> {
  try {
    console.log('🧹 Resetting demo data...');
    
    const response = await fetch(`${serverUrl}/seed/reset`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Demo data reset successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to reset demo data:', error);
    return {
      success: false,
      message: `Failed to reset demo data: ${error.message}`,
      error: error.message
    };
  }
}

// Auto-seed demo data if not already seeded
export async function autoSeedIfNeeded(): Promise<boolean> {
  try {
    const status = await checkSeedStatus();
    
    if (!status.isSeeded) {
      console.log('🌱 Demo data not found, auto-seeding...');
      const result = await seedDemoData();
      return result.success;
    }
    
    console.log('✅ Demo data already seeded');
    return true;
  } catch (error) {
    console.error('❌ Auto-seed failed:', error);
    return false;
  }
}

// Test Swiss payment methods
export async function testSwissPayments() {
  try {
    console.log('💳 Testing Swiss payment methods...');
    
    // Test TWINT payment creation
    const twintResponse = await fetch(`${serverUrl}/payments/twint/create-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 35.00,
        currency: 'CHF',
        orderId: 'test_order_123',
        customerId: 'test_customer',
        orgId: 'studio_zrh'
      }),
    });

    const twintResult = await twintResponse.json();
    console.log('✅ TWINT test result:', twintResult);

    // Test QR-Bill generation
    const qrBillResponse = await fetch(`${serverUrl}/payments/qr-bill/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: 'test_order_123',
        customerId: 'test_customer',
        orgId: 'studio_zrh'
      }),
    });

    const qrBillResult = await qrBillResponse.json();
    console.log('✅ QR-Bill test result:', qrBillResult);

    return { twint: twintResult, qrBill: qrBillResult };
  } catch (error) {
    console.error('❌ Payment tests failed:', error);
    return null;
  }
}

// Test Swiss localization
export async function testSwissLocalization() {
  try {
    console.log('🇨🇭 Testing Swiss localization...');
    
    const locales = ['de-CH', 'fr-CH', 'it-CH', 'en-CH'];
    const results: Record<string, any> = {};

    for (const locale of locales) {
      const response = await fetch(`${serverUrl}/locales/${locale}/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        results[locale] = await response.json();
      }
    }

    console.log('✅ Localization test results:', results);
    return results;
  } catch (error) {
    console.error('❌ Localization tests failed:', error);
    return null;
  }
}

// Complete system health check
export async function runSystemHealthCheck() {
  console.log('🔍 Running YogaSwiss system health check...');
  
  const results = {
    server_health: null as any,
    seed_status: null as any,
    localization: null as any,
    payments: null as any,
    timestamp: new Date().toISOString()
  };

  try {
    // 1. Check server health
    const healthResponse = await fetch(`${serverUrl}/health`);
    results.server_health = await healthResponse.json();
    console.log('✅ Server health:', results.server_health.status);

    // 2. Check seed status
    results.seed_status = await checkSeedStatus();
    console.log('📊 Seed status:', results.seed_status.isSeeded ? 'Ready' : 'Needs seeding');

    // 3. Test localization
    results.localization = await testSwissLocalization();
    console.log('🌍 Localization:', results.localization ? 'Working' : 'Failed');

    // 4. Test payments
    results.payments = await testSwissPayments();
    console.log('💳 Payments:', results.payments ? 'Working' : 'Failed');

    console.log('🎉 System health check completed!');
    return results;
  } catch (error) {
    console.error('❌ System health check failed:', error);
    return { ...results, error: error.message };
  }
}
