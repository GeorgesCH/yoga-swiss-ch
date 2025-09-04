// Environment variables for Supabase integration (production-only)
// Centralized, strict access to required configuration. No local fallbacks.

// Safe environment variable access
const getEnvVar = (key: string): string | undefined => {
  try {
    // Try import.meta.env first (Vite)
    let hasImportMeta = false;
    try {
      hasImportMeta = typeof window !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env !== undefined;
    } catch (e) {
      hasImportMeta = false;
    }
    
    if (hasImportMeta && import.meta.env) {
      return import.meta.env[key];
    }
    
    // Try process.env (Node.js/Server)
    let hasProcess = false;
    try {
      hasProcess = typeof process !== 'undefined' && process.env !== undefined;
    } catch (e) {
      hasProcess = false;
    }
    
    if (hasProcess && process.env) {
      return process.env[key];
    }
    
    return undefined;
  } catch (error) {
    console.warn(`Error accessing environment variable ${key}:`, error);
    return undefined;
  }
};

// Production-only getters for environment variables
export const getSupabaseUrl = (): string => {
  const url = getEnvVar('VITE_SUPABASE_URL');
  if (!url) throw new Error('VITE_SUPABASE_URL is not set - production environment required');
  if (!url.includes('supabase.co')) throw new Error('Invalid Supabase URL - must be production instance');
  return url;
};

export const getSupabaseAnonKey = (): string => {
  const key = getEnvVar('VITE_SUPABASE_ANON_KEY');
  if (!key) throw new Error('VITE_SUPABASE_ANON_KEY is not set - production environment required');
  return key;
};

export const getSupabaseProjectId = (): string => {
  const explicit = getEnvVar('VITE_SUPABASE_PROJECT_ID');
  if (explicit) return explicit;
  // Derive from URL (https://<project-id>.supabase.co)
  const url = getSupabaseUrl();
  try {
    const host = new URL(url).host; // <project-id>.supabase.co
    const sub = host.split('.')[0];
    if (!sub) throw new Error('Missing subdomain');
    return sub;
  } catch {
    throw new Error('Unable to derive project id from VITE_SUPABASE_URL');
  }
};

// For server-side operations (Edge Functions only)
export const getSupabaseServiceRoleKey = (): string | undefined => {
  // Never expose service role key to the browser. Use edge functions only.
  return undefined;
};

// Backward compatibility exports
export const EFFECTIVE_SUPABASE_URL = getSupabaseUrl();
export const EFFECTIVE_SUPABASE_ANON_KEY = getSupabaseAnonKey();
export const EFFECTIVE_PROJECT_ID = getSupabaseProjectId();

// Swiss configuration constants - English only
export const SWISS_CONFIG = {
  VAT_RATE: 7.7,
  CURRENCY: 'CHF',
  TIMEZONE: 'Europe/Zurich',
  LANGUAGE: 'en' as const, // English only
  PAYMENT_METHODS: ['twint', 'credit_card', 'apple_pay', 'google_pay', 'qr_bill'] as const
};

// Validate production environment
export function validateSupabaseEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  let url: string | undefined;
  let anonKey: string | undefined;
  let projectId: string | undefined;
  
  try { url = getEnvVar('VITE_SUPABASE_URL'); } catch {}
  try { anonKey = getEnvVar('VITE_SUPABASE_ANON_KEY'); } catch {}
  try { projectId = getEnvVar('VITE_SUPABASE_PROJECT_ID'); } catch {}
  
  if (!anonKey) {
    errors.push('Missing Supabase anonymous key');
  }
  
  if (!url || !url.includes('supabase.co')) {
    errors.push('Invalid Supabase URL format - must be production instance');
  }
  
  // Ensure we're not using local development URLs
  if (url && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    errors.push('Local development URLs not allowed - use production Supabase instance');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Production environment detection
export function isProduction(): boolean {
  try {
    // Check environment variables
    const nodeEnv = getEnvVar('NODE_ENV');
    if (nodeEnv === 'production') return true;
    
    const viteEnv = getEnvVar('VITE_NODE_ENV');  
    if (viteEnv === 'production') return true;
    
    // Check if we're running on production domain
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return !hostname.includes('localhost') && 
             !hostname.includes('127.0.0.1') &&
             !hostname.includes('vercel.app') &&
             !hostname.includes('netlify.app');
    }
    
    return true; // Default to production
  } catch {
    return true;
  }
}

// Production configuration logging
export function logSupabaseConfig() {
  try {
    const url = getSupabaseUrl();
    const projectIdValue = getSupabaseProjectId();
    const anonKey = getSupabaseAnonKey();
    const hasCustomUrl = getEnvVar('VITE_SUPABASE_URL');
    
    console.log('[YogaSwiss] Production Supabase Configuration:', {
      url,
      projectId: projectIdValue,
      hasAnonKey: Boolean(anonKey),
      usingEnvVars: Boolean(hasCustomUrl),
      environment: 'production',
      swiss: SWISS_CONFIG
    });
  } catch (error) {
    console.warn('[YogaSwiss] Failed to log configuration:', error);
  }
}
