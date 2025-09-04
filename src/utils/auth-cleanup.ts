/**
 * Utility to clean up potential duplicate auth storage keys
 * that might cause multiple GoTrueClient instances
 */

export const cleanupDuplicateAuthStorage = () => {
  if (typeof window === 'undefined') return;

  // Common Supabase storage keys that might cause conflicts
  const commonKeys = [
    'sb-supabase-auth-token',
    'supabase.auth.token',
    'sb-auth-token',
    'auth-token',
    'sb-okvreiyhuxjosgauqaqq-auth-token' // Project-specific key
  ];

  // Our specific key
  const ourKey = 'yogaswiss-auth-token';

  let removedCount = 0;

  // Remove any conflicting keys except our own
  commonKeys.forEach(key => {
    if (key !== ourKey && localStorage.getItem(key)) {
      console.log(`[YogaSwiss] Removing duplicate auth storage key: ${key}`);
      localStorage.removeItem(key);
      removedCount++;
    }
  });

  // Also clean up any sessionStorage keys
  commonKeys.forEach(key => {
    if (key !== ourKey && sessionStorage.getItem(key)) {
      console.log(`[YogaSwiss] Removing duplicate session storage key: ${key}`);
      sessionStorage.removeItem(key);
      removedCount++;
    }
  });

  // Clean up any other Supabase keys that might conflict
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('sb-') && key !== ourKey && key.includes('auth')) {
      console.log(`[YogaSwiss] Removing additional auth storage key: ${key}`);
      localStorage.removeItem(key);
      removedCount++;
      i--; // Adjust index since we removed an item
    }
  }

  if (removedCount === 0) {
    console.log('[YogaSwiss] No duplicate auth storage keys found');
  } else {
    console.log(`[YogaSwiss] Cleaned up ${removedCount} duplicate auth storage keys`);
  }
};

// Auto-cleanup on import
if (typeof window !== 'undefined') {
  cleanupDuplicateAuthStorage();
}