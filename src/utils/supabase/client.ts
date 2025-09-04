import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './schemas';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey, validateSupabaseEnvironment } from './env';

// Create the client lazily to avoid module-load-time environment access issues
let _supabase: SupabaseClient<Database> | null = null;

const createSupabaseClient = (): SupabaseClient<Database> => {
  // Validate production environment on first access
  const validation = validateSupabaseEnvironment();
  if (!validation.isValid) {
    console.error('[YogaSwiss] Supabase configuration errors:', validation.errors);
    throw new Error('Supabase environment is not configured for production - local development not allowed');
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  // Ensure we're using production Supabase
  if (!supabaseUrl.includes('supabase.co')) {
    throw new Error('Local Supabase instances not allowed - use production instance only');
  }

  return createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'yogaswiss-auth-token',
        flowType: 'pkce', // Use PKCE flow for better security
      },
      global: {
        headers: {
          'x-application': 'yogaswiss-platform',
          'x-client-version': '1.0.0',
          'x-environment': 'production'
        }
      },
      db: {
        schema: 'public'
      },
      realtime: {
        channels: {
          // Configure realtime channels
          postgres_changes: {
            schema: 'public'
          }
        }
      }
    }
  );
};

// Export the singleton client
export const supabase: SupabaseClient<Database> = (() => {
  if (!_supabase) {
    _supabase = createSupabaseClient();
    console.log('[YogaSwiss] Production Supabase client initialized');
  }
  return _supabase;
})();

// Server-side client for admin operations (should only be used server-side)
export const createServerClient = () => {
  // Note: Service role key should only be used in server environment (Edge Functions)
  // For client-side, this will be undefined which is expected
  const serviceKey = getSupabaseServiceRoleKey();
  
  if (!serviceKey) {
    throw new Error('Service role key not available in client environment. Use regular client instead.');
  }
  
  const supabaseUrl = getSupabaseUrl();
  
  // Ensure production environment
  if (!supabaseUrl.includes('supabase.co')) {
    throw new Error('Local Supabase instances not allowed - use production instance only');
  }
  
  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'x-application': 'yogaswiss-platform-server',
        'x-client-version': '1.0.0',
        'x-environment': 'production'
      }
    }
  });
};

// Type exports for better TypeScript support
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Commonly used table types
export type Org = Tables<'orgs'>;
export type UserProfile = Tables<'user_profiles'>;
export type OrgUser = Tables<'org_users'>;
export type Location = Tables<'locations'>;
export type ClassTemplate = Tables<'class_templates'>;
export type ClassOccurrence = Tables<'class_occurrences'>;
export type Registration = Tables<'registrations'>;
export type Wallet = Tables<'wallets'>;
export type Pass = Tables<'passes'>;
export type Product = Tables<'products'>;
export type Order = Tables<'orders'>;
export type Invoice = Tables<'invoices'>;

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// User profile helpers
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    throw error;
  }
  
  return data;
};

export const createUserProfile = async (profile: Database['public']['Tables']['user_profiles']['Insert']) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert(profile)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (
  userId: string, 
  updates: Database['public']['Tables']['profiles']['Update']
) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Organization helpers
export const getUserOrganizations = async (userId: string) => {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq('user_id', userId)
    .eq('is_active', true);
    
  if (error) throw error;
  return data;
};

export const getOrganization = async (orgId: string) => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single();
    
  if (error) throw error;
  return data;
};

// Permission helpers
export const hasPermission = async (userId: string, orgId: string, permission: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('organization_members')
    .select('role, permissions')
    .eq('user_id', userId)
    .eq('organization_id', orgId)
    .eq('is_active', true)
    .single();
    
  if (error || !data) return false;
  
  // Check if user has the specific permission or is an owner/manager
  return data.permissions.includes(permission) || 
         ['owner', 'manager'].includes(data.role);
};

export const getUserRole = async (userId: string, orgId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', userId)
    .eq('organization_id', orgId)
    .eq('is_active', true)
    .single();
    
  if (error || !data) return null;
  return data.role;
};

// Real-time subscriptions
export const subscribeToScheduleChanges = (orgId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`schedule-changes-${orgId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'class_occurrences',
        filter: `organization_id=eq.${orgId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToRegistrationChanges = (orgId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`registration-changes-${orgId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'registrations',
        filter: `organization_id=eq.${orgId}`
      },
      callback
    )
    .subscribe();
};

// Storage helpers
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);
    
  if (error) throw error;
  return data;
};

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return data.publicUrl;
};

export const getSignedUrl = async (bucket: string, path: string, expiresIn = 3600) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
    
  if (error) throw error;
  return data.signedUrl;
};

// Error handling helper
export const handleSupabaseError = (error: any): string => {
  if (error?.message) {
    // Common Supabase error patterns
    if (error.message.includes('duplicate key')) {
      return 'This record already exists.';
    }
    if (error.message.includes('foreign key')) {
      return 'Cannot perform this action due to data relationships.';
    }
    if (error.message.includes('not found')) {
      return 'The requested record was not found.';
    }
    if (error.message.includes('permission denied')) {
      return 'You do not have permission to perform this action.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred.';
};
