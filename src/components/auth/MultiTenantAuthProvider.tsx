import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import { getSupabaseProjectId, getSupabaseAnonKey } from '../../utils/supabase/env';
import { apiClient } from '../../utils/api/optimized-client';
// Production mode - no bypass utilities

// Multi-tenant organization hierarchy types
interface User {
  id: string;
  email: string;
  profile?: {
    id: string;
    display_name?: string;
    locale: 'de' | 'fr' | 'it' | 'en';
    firstName?: string;
    lastName?: string;
    created_at: string;
  };
}

interface Org {
  id: string;
  type: 'brand' | 'studio';
  parent_org_id?: string;
  name: string;
  slug: string;
  currency: string;
  timezone: string;
  settings: {
    languages: string[];
    default_language: string;
    vat_rate: number;
    twint_enabled: boolean;
    qr_bill_enabled: boolean;
    stripe_enabled: boolean;
    inherit_payment_settings?: boolean;
    inherit_policies?: boolean;
  };
  status: 'active' | 'setup_incomplete' | 'suspended' | 'archived';
  created_at: string;
  updated_at: string;
  // Additional fields from API response
  role?: OrgRole;
  permissions?: OrgPermissions;
  location_scope?: string[];
  parent?: Org;
}

interface Location {
  id: string;
  org_id: string;
  name: string;
  type: 'studio' | 'outdoor' | 'online';
  address?: {
    street: string;
    city: string;
    postal_code: string;
    canton: string;
    country: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  capacity?: number;
  status: 'active' | 'maintenance' | 'closed';
}

type OrgRole = 'owner' | 'manager' | 'front_desk' | 'instructor' | 'accountant' | 'marketer';

interface OrgPermissions {
  schedule: boolean;
  customers: boolean;
  finance: boolean;
  marketing: boolean;
  settings: boolean;
  analytics: boolean;
  wallet_management?: boolean;
  user_management?: boolean;
}

interface MultiTenantAuthContextType {
  user: User | null;
  currentOrg: Org | null;
  userOrgs: Org[];
  locations: Location[];
  loading: boolean;
  orgSwitching: boolean;
  
  // Authentication methods
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  
  // Organization methods
  switchOrg: (orgId: string) => Promise<void>;
  createOrg: (orgData: CreateOrgData) => Promise<{ org?: Org; error?: string }>;
  refreshOrgs: () => Promise<void>;
  
  // Permission helpers
  hasPermission: (permission: keyof OrgPermissions) => boolean;
  isOwnerOrManager: () => boolean;
  canAccessLocation: (locationId: string) => boolean;
  
  // Utility methods
  refreshSession: () => Promise<void>;
  getOrgContext: () => { org: Org | null; role: OrgRole | null; permissions: OrgPermissions | null };
}

interface CreateOrgData {
  name: string;
  slug: string;
  type: 'brand' | 'studio';
  parent_org_id?: string;
  default_language?: string;
  settings?: Partial<Org['settings']>;
}

const MultiTenantAuthContext = createContext<MultiTenantAuthContextType | undefined>(undefined);

// Production mode - real API calls only

// Default permissions for different roles
const DEFAULT_PERMISSIONS: Record<OrgRole, OrgPermissions> = {
  owner: {
    schedule: true,
    customers: true,
    finance: true,
    marketing: true,
    settings: true,
    analytics: true,
    wallet_management: true,
    user_management: true
  },
  manager: {
    schedule: true,
    customers: true,
    finance: true,
    marketing: true,
    settings: false,
    analytics: true,
    wallet_management: true,
    user_management: false
  },
  front_desk: {
    schedule: true,
    customers: true,
    finance: false,
    marketing: false,
    settings: false,
    analytics: false
  },
  instructor: {
    schedule: true, // Own schedule only
    customers: false, // Masked by default
    finance: false,
    marketing: false,
    settings: false,
    analytics: false
  },
  accountant: {
    schedule: false,
    customers: false,
    finance: true,
    marketing: false,
    settings: false,
    analytics: true,
    wallet_management: true
  },
  marketer: {
    schedule: false,
    customers: true, // No PII access
    finance: false,
    marketing: true,
    settings: false,
    analytics: true
  }
};

export function MultiTenantAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Org | null>(null);
  const [userOrgs, setUserOrgs] = useState<Org[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgSwitching, setOrgSwitching] = useState(false);
  
  // Using the imported supabase client directly

  // Helper to make authenticated API calls
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      console.log(`[MultiTenantAuthProvider] Making API call to: ${endpoint}`);
      
      // Production mode - use standard API calls only
      
      // Standard API call with Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Handle invalid session errors
      if (sessionError && sessionError.message.includes('invalid claim')) {
        console.log('[MultiTenantAuthProvider] Invalid session detected, clearing auth');
        await supabase.auth.signOut();
        return {
          ok: false,
          status: 401,
          json: async () => ({ error: 'Session invalid' })
        };
      }
      
      // For authenticated endpoints, require a valid session
      if (!session?.access_token) {
        console.log('[MultiTenantAuthProvider] No valid session found for authenticated endpoint');
        return {
          ok: false,
          status: 401,
          json: async () => ({ error: 'Authentication required' })
        };
      }
      
      const token = session.access_token;
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(currentOrg?.id && { 'X-Org-ID': currentOrg.id }),
        ...options.headers
      };

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log(`[MultiTenantAuthProvider] API call to ${endpoint} completed with status: ${response.status}`);
      return response;
    } catch (error) {
      console.error(`[MultiTenantAuthProvider] API call to ${endpoint} failed:`, error);
      throw error;
    }
  };

  // Load user's organizations
  const loadUserOrgs = async (userId: string) => {
    try {
      console.log('[MultiTenantAuthProvider] Loading user organizations...');
      
      // Production mode - load organizations from API only
      
      // Use optimized API client with caching
      const data = await apiClient.getOrganizations();
      console.log(`[MultiTenantAuthProvider] Loaded ${data.orgs?.length || 0} organizations from API`);
      setUserOrgs(data.orgs || []);
        
      // Set current org if not set (prefer saved or first org)
      if (!currentOrg && data.orgs?.length > 0) {
          const savedOrgId = localStorage.getItem('yogaswiss_current_org');
          const orgToSet = savedOrgId 
            ? data.orgs.find((org: Org) => org.id === savedOrgId) || data.orgs[0]
            : data.orgs[0];
          
          if (orgToSet) {
            console.log(`[MultiTenantAuthProvider] Setting current org to: ${orgToSet.name}`);
            // Set current org directly without using switchOrg to avoid circular dependency
            setCurrentOrg(orgToSet);
            localStorage.setItem('yogaswiss_current_org', orgToSet.id);
            
            // Load locations for this org (but don't wait for it to complete)
            loadLocations(orgToSet.id).catch(locationError => {
              console.log('[MultiTenantAuthProvider] Error loading locations:', locationError);
            });
          }
        }
    } catch (error) {
      console.log('[MultiTenantAuthProvider] Error loading organizations:', error);
      // Set empty state - user needs to create or join an organization
      setUserOrgs([]);
      setCurrentOrg(null);
      localStorage.removeItem('yogaswiss_current_org');
    }
  };

  // Load locations for current org
  const loadLocations = async (orgId: string) => {
    try {
      console.log(`[MultiTenantAuthProvider] Loading locations for org: ${orgId}`);
      const response = await apiCall(`/orgs/${orgId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[MultiTenantAuthProvider] Loaded ${data.locations?.length || 0} locations`);
        setLocations(data.locations || []);
      } else {
        console.log(`[MultiTenantAuthProvider] Failed to load locations, status: ${response.status}`);
      }
    } catch (error) {
      console.log('[MultiTenantAuthProvider] Error loading locations:', error);
      // Don't fail silently, but also don't prevent the app from loading
      setLocations([]);
    }
  };

  // Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[MultiTenantAuthProvider] Initializing auth...');
        
        // Production mode - no bypass authentication
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[MultiTenantAuthProvider] Session check failed:', error);
        } else if (session?.user) {
          console.log('[MultiTenantAuthProvider] Found existing session, setting user');
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            profile: {
              id: session.user.id,
              display_name: session.user.user_metadata?.firstName 
                ? `${session.user.user_metadata.firstName} ${session.user.user_metadata.lastName || ''}`.trim()
                : session.user.email?.split('@')[0],
              locale: session.user.user_metadata?.language || 'en',
              firstName: session.user.user_metadata?.firstName,
              lastName: session.user.user_metadata?.lastName,
              created_at: session.user.created_at
            }
          };
          
          setUser(userData);
          
          // Load organizations for non-customer users
          if (session.user.user_metadata?.role !== 'customer') {
            console.log('[MultiTenantAuthProvider] Loading user orgs for admin user');
            // Don't wait for org loading to complete, do it in the background
            loadUserOrgs(session.user.id).catch(error => {
              console.log('[MultiTenantAuthProvider] Error loading orgs during initialization:', error);
            });
          }
        } else {
          console.log('[MultiTenantAuthProvider] No existing session found');
        }
      } catch (error) {
        console.error('[MultiTenantAuthProvider] Auth initialization failed:', error);
      } finally {
        console.log('[MultiTenantAuthProvider] Auth initialization complete, setting loading to false');
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setCurrentOrg(null);
        setUserOrgs([]);
        setLocations([]);
        localStorage.removeItem('yogaswiss_current_org');
      } else if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          profile: {
            id: session.user.id,
            display_name: session.user.user_metadata?.firstName 
              ? `${session.user.user_metadata.firstName} ${session.user.user_metadata.lastName || ''}`.trim()
              : session.user.email?.split('@')[0],
            locale: session.user.user_metadata?.language || 'en',
            firstName: session.user.user_metadata?.firstName,
            lastName: session.user.user_metadata?.lastName,
            created_at: session.user.created_at
          }
        };
        
        setUser(userData);
        
        if (session.user.user_metadata?.role !== 'customer') {
          // Don't wait for org loading to complete, do it in the background
          loadUserOrgs(session.user.id).catch(error => {
            console.log('[MultiTenantAuthProvider] Error loading orgs during auth change:', error);
          });
        }
      }
    });

    // Fallback timeout to ensure loading never persists indefinitely
    const fallbackTimeout = setTimeout(() => {
      console.log('[MultiTenantAuthProvider] Fallback timeout reached, forcing loading to false');
      setLoading(false);
    }, 5000); // 5 second fallback

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log(`Authentication error during signin: ${error.message}`);
        
        // Production mode - require proper email confirmation
        if (error.message.includes('Email not confirmed') || 
            error.message.includes('not confirmed') || 
            error.message.includes('email_not_confirmed') || 
            error.message.includes('confirm your email')) {
          console.log(`[MultiTenantAuthProvider] Email not confirmed for ${email}`);
          return { error: 'Email confirmation required. Please check your email and click the confirmation link.' };
        }
        
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.log(`Sign in failed: ${error}`);
      return { error: 'Sign in failed' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true);
      
      // For admin/studio signup, use Supabase directly
      if (metadata?.role && metadata.role !== 'customer') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              firstName: metadata.firstName || '',
              lastName: metadata.lastName || '',
              role: metadata.role,
              language: metadata.locale || 'en',
              orgName: metadata.orgName,
              orgSlug: metadata.orgSlug
            }
          }
        });

        if (error) {
          console.log(`Authentication error during signup: ${error.message}`);
          return { error: error.message };
        }

        // Production mode - require proper email confirmation
        if (!data?.session && data?.user && !data?.user?.email_confirmed_at) {
          return { error: 'Please check your email and click the confirmation link to complete registration.' };
        }

        return {};
      } else {
        // For customer signup, use the backend API
        const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getSupabaseAnonKey()}`
          },
          body: JSON.stringify({
            email,
            password,
            firstName: metadata?.firstName || '',
            lastName: metadata?.lastName || '',
            language: metadata?.locale || 'en'
          })
        });

        const result = await response.json();
        
        if (!response.ok) {
          return { error: result.error || 'Sign up failed' };
        }

        // Sign in the user after successful signup
        return await signIn(email, password);
      }
    } catch (error) {
      console.log(`Sign up failed: ${error}`);
      return { error: 'Sign up failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('yogaswiss_current_org');
    } catch (error) {
      console.error('Sign out failed:', error);
      // Force clear state even if signOut fails
      setUser(null);
      setCurrentOrg(null);
      setUserOrgs([]);
      setLocations([]);
      localStorage.removeItem('yogaswiss_current_org');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      console.log(`Password reset failed: ${error}`);
      return { error: 'Password reset failed' };
    }
  };

  const switchOrg = async (orgId: string) => {
    setOrgSwitching(true);
    try {
      const org = userOrgs.find(o => o.id === orgId);
      if (org) {
        setCurrentOrg(org);
        localStorage.setItem('yogaswiss_current_org', orgId);
        
        // Load locations for this org
        await loadLocations(orgId);
      }
    } catch (error) {
      console.log('Error switching organization:', error);
    } finally {
      setOrgSwitching(false);
    }
  };

  const createOrg = async (orgData: CreateOrgData) => {
    try {
      console.log('[MultiTenantAuthProvider] Creating organization:', orgData);
      
      // Check if user is authenticated
      if (!user) {
        console.error('[MultiTenantAuthProvider] No user found - authentication required');
        return { error: 'You must be signed in to create an organization. Please sign in and try again.' };
      }
      
      // Production mode - create organization through API only
      
      // Standard API call
      const response = await apiCall('/orgs', {
        method: 'POST',
        body: JSON.stringify(orgData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('[MultiTenantAuthProvider] Organization creation failed:', response.status, result);
        
        // Handle specific error cases
        if (response.status === 401) {
          return { error: 'Authentication required. Please sign in and try again.' };
        } else if (response.status === 400) {
          if (result.error?.includes('slug') || result.error?.includes('duplicate')) {
            return { error: `URL "${orgData.slug}" is already taken. Please choose a different one.` };
          } else if (result.error?.includes('name')) {
            return { error: 'Organization name is invalid or already exists.' };
          }
        } else if (response.status === 500) {
          return { error: 'Server error occurred. Please try again in a moment.' };
        }
        
        return { error: result.error || `Failed to create organization (${response.status})` };
      }

      console.log('[MultiTenantAuthProvider] Organization created successfully:', result.org);
      
      // Refresh organizations list
      await refreshOrgs();
      
      return { org: result.org };
    } catch (error) {
      console.error('[MultiTenantAuthProvider] Error creating organization:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { error: 'Request timed out. Please try again.' };
        } else if (error.message.includes('Failed to fetch')) {
          return { error: 'Network error. Please check your connection and try again.' };
        }
      }
      
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  };

  const refreshOrgs = async () => {
    if (user) {
      await loadUserOrgs(user.id);
    }
  };

  const refreshSession = async () => {
    try {
      await supabase.auth.refreshSession();
    } catch (error) {
      console.log('Session refresh failed:', error);
    }
  };

  // Permission helpers
  const hasPermission = (permission: keyof OrgPermissions): boolean => {
    if (!currentOrg?.role) return false;
    
    const permissions = currentOrg.permissions || DEFAULT_PERMISSIONS[currentOrg.role];
    return permissions[permission] || false;
  };

  const isOwnerOrManager = (): boolean => {
    return currentOrg?.role === 'owner' || currentOrg?.role === 'manager';
  };

  const canAccessLocation = (locationId: string): boolean => {
    if (!currentOrg?.location_scope || currentOrg.location_scope.length === 0) {
      // No location restrictions - can access all
      return true;
    }
    
    return currentOrg.location_scope.includes(locationId);
  };

  const getOrgContext = () => ({
    org: currentOrg,
    role: currentOrg?.role || null,
    permissions: currentOrg?.permissions || null
  });

  const value: MultiTenantAuthContextType = {
    user,
    currentOrg,
    userOrgs,
    locations,
    loading,
    orgSwitching,
    signIn,
    signUp,
    signOut,
    resetPassword,
    switchOrg,
    createOrg,
    refreshOrgs,
    hasPermission,
    isOwnerOrManager,
    canAccessLocation,
    refreshSession,
    getOrgContext
  };

  return (
    <MultiTenantAuthContext.Provider value={value}>
      {children}
    </MultiTenantAuthContext.Provider>
  );
}

export function useMultiTenantAuth() {
  const context = useContext(MultiTenantAuthContext);
  if (context === undefined) {
    throw new Error('useMultiTenantAuth must be used within a MultiTenantAuthProvider');
  }
  return context;
}

export type { 
  User, 
  Org, 
  Location, 
  OrgRole, 
  OrgPermissions, 
  CreateOrgData,
  MultiTenantAuthContextType 
};
