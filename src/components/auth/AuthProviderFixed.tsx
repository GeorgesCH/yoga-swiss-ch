import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import { getSupabaseProjectId, getSupabaseAnonKey } from '../../utils/supabase/env';
import { DEMO_UUIDS } from '../../utils/demo-uuid-helper';

// Swiss yoga platform user types
interface User {
  id: string;
  email: string;
  profile?: {
    id: string;
    display_name?: string;
    locale: 'en'; // English only
    firstName?: string;
    lastName?: string;
    role?: 'owner' | 'manager' | 'instructor' | 'customer';
    created_at: string;
  };
}

interface Org {
  id: string;
  name: string;
  slug: string;
  type?: 'brand' | 'studio';
  parent_org_id?: string;
  primary_locale: 'en'; // English only
  timezone: string;
  currency: string;
  status: 'active' | 'setup_incomplete' | 'suspended';
  created_at: string;
}

interface OrgUser {
  org_id: string;
  user_id: string;
  role: 'owner' | 'manager' | 'instructor' | 'front_desk' | 'accountant' | 'marketer';
  status: 'active' | 'pending' | 'suspended';
  joined_at: string;
}

interface AuthContextType {
  user: User | null;
  currentOrg: Org | null;
  userOrgs: (Org & { role: OrgUser['role']; status: OrgUser['status'] })[];
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  switchOrg: (orgId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  databaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for development when database isn't ready
const mockUser: User = {
  id: DEMO_UUIDS.SUPER_ADMIN,
  email: 'studio@yogaswiss.ch',
  profile: {
    id: DEMO_UUIDS.SUPER_ADMIN,
    display_name: 'Studio Owner',
    locale: 'en',
    firstName: 'Studio',
    lastName: 'Owner',
    role: 'owner',
    created_at: '2024-01-01T00:00:00Z'
  }
};

const mockOrgs: (Org & { role: OrgUser['role']; status: OrgUser['status']; type: 'brand' | 'studio'; parent_org_id?: string })[] = [
  {
    id: DEMO_UUIDS.DEMO_ORG_PRIMARY,
    name: 'YogaZen Brand',
    slug: 'yogazen-brand',
    type: 'brand',
    primary_locale: 'en',
    timezone: 'Europe/Zurich',
    currency: 'CHF',
    status: 'active',
    role: 'owner',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'demo-studio-1',
    name: 'YogaZen Zürich Studio',
    slug: 'yogazen-zurich',
    type: 'studio',
    parent_org_id: DEMO_UUIDS.DEMO_ORG_PRIMARY,
    primary_locale: 'en',
    timezone: 'Europe/Zurich',
    currency: 'CHF',
    status: 'active',
    role: 'owner',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'demo-studio-2',
    name: 'Independent Yoga Studio',
    slug: 'independent-studio',
    type: 'studio',
    primary_locale: 'en',
    timezone: 'Europe/Zurich',
    currency: 'CHF',
    status: 'active',
    role: 'owner',
    created_at: '2024-01-01T00:00:00Z'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Org | null>(null);
  const [userOrgs, setUserOrgs] = useState<(Org & { role: OrgUser['role']; status: OrgUser['status'] })[]>([]);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [databaseReady, setDatabaseReady] = useState(false);

  // Check if database is ready (has required tables)
  const checkDatabaseStatus = async () => {
    try {
      console.log('[AuthProvider] Checking database status...');
      
      // Try a simple query to test table existence
      const { data, error } = await supabase
        .from('orgs')
        .select('id')
        .limit(1);

      if (error) {
        console.log('[AuthProvider] Database not ready:', error.message);
        // Check if it's a missing table error (PGRST204)
        if (error.code === 'PGRST204' || error.message.includes('does not exist')) {
          console.log('[AuthProvider] Database schema not initialized, using fallback mode');
          setDatabaseReady(false);
          return false;
        }
      }
      
      console.log('[AuthProvider] Database is ready');
      setDatabaseReady(true);
      return true;
    } catch (err) {
      console.log('[AuthProvider] Database check failed:', err);
      setDatabaseReady(false);
      return false;
    }
  };

  useEffect(() => {
    let isCanceled = false;

    // Check for existing Supabase session
    const checkAuth = async () => {
      try {
        console.log('[AuthProvider] Checking auth session...');
        
        // First check database status
        const dbReady = await checkDatabaseStatus();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthProvider] Session check failed:', error);
        } else if (session?.user) {
          if (isCanceled) return;
          
          console.log('[AuthProvider] Found existing session, setting user');
          setSession(session);
          
          // Set user from session
          const userData = {
            id: session.user.id,
            email: session.user.email || '',
            profile: {
              id: session.user.id,
              display_name: session.user.user_metadata?.firstName 
                ? `${session.user.user_metadata.firstName} ${session.user.user_metadata.lastName || ''}`.trim()
                : session.user.email?.split('@')[0],
              locale: 'en' as const,
              firstName: session.user.user_metadata?.firstName,
              lastName: session.user.user_metadata?.lastName,
              role: session.user.user_metadata?.role || 'customer',
              created_at: session.user.created_at
            }
          };
          
          setUser(userData);

          // For admin users, load organizations
          if (session.user.user_metadata?.role && session.user.user_metadata.role !== 'customer') {
            console.log('[AuthProvider] Loading organizations for admin user');
            
            if (dbReady) {
              // Try to load real organizations from database
              try {
                const { data: orgsData, error: orgsError } = await supabase
                  .from('org_users')
                  .select(`
                    role,
                    status,
                    orgs (
                      id,
                      name,
                      slug,
                      primary_locale,
                      timezone,
                      currency,
                      status,
                      created_at
                    )
                  `)
                  .eq('user_id', session.user.id)
                  .eq('is_active', true);

                if (!orgsError && orgsData && orgsData.length > 0) {
                  const userOrgsData = orgsData.map(item => ({
                    ...item.orgs,
                    role: item.role,
                    status: item.status
                  }));
                  setUserOrgs(userOrgsData);
                  setCurrentOrg(userOrgsData[0]);
                } else {
                  // Fallback to mock data
                  setUserOrgs(mockOrgs);
                  setCurrentOrg(mockOrgs[0]);
                }
              } catch (dbError) {
                console.log('[AuthProvider] Database query failed, using mock data:', dbError);
                setUserOrgs(mockOrgs);
                setCurrentOrg(mockOrgs[0]);
              }
            } else {
              // Database not ready, use mock data
              setUserOrgs(mockOrgs);
              setCurrentOrg(mockOrgs[0]);
            }
          }
        } else {
          console.log('[AuthProvider] No existing session found');
        }
      } catch (error) {
        console.error('[AuthProvider] Auth check failed:', error);
      } finally {
        if (!isCanceled) {
          console.log('[AuthProvider] Auth check complete, setting loading to false');
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Fallback timeout to ensure loading never persists indefinitely
    const fallbackTimeout = setTimeout(() => {
      if (!isCanceled) {
        console.log('[AuthProvider] Fallback timeout reached, forcing loading to false');
        setLoading(false);
      }
    }, 5000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isCanceled) return;
      
      console.log('[AuthProvider] Auth state change:', event, !!session?.user);
      
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setCurrentOrg(null);
        setUserOrgs([]);
        setSession(null);
      } else if (session?.user) {
        setSession(session);
        const userData = {
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
            role: session.user.user_metadata?.role || 'customer',
            created_at: session.user.created_at
          }
        };
        console.log('[AuthProvider] Setting user data:', userData);
        setUser(userData);

        // For admin users, load mock orgs
        if (session.user.user_metadata?.role && session.user.user_metadata.role !== 'customer') {
          console.log('[AuthProvider] Loading mock orgs for admin user');
          setUserOrgs(mockOrgs);
          setCurrentOrg(mockOrgs[0]);
        }
      }
    });

    return () => {
      isCanceled = true;
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log(`[AuthProvider] Attempting to sign in user: ${email}`);
      
      // Use Supabase for authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log(`[AuthProvider] Authentication error during signin: ${error.message}`);
        return { error: error.message };
      }

      console.log(`[AuthProvider] Sign in successful for user: ${email}`);
      // User state will be set by the auth state change listener
      return {};
    } catch (error) {
      console.log(`[AuthProvider] Sign in failed: ${error}`);
      return { error: 'Sign in failed' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true);
      console.log(`[AuthProvider] Attempting signup for: ${email}, role: ${metadata?.role}`);
      
      // Use Supabase auth directly for all signups (simplified approach)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: metadata?.firstName || metadata?.ownerName || metadata?.instructorName || '',
            lastName: metadata?.lastName || '',
            role: metadata?.role || 'customer',
            language: metadata?.locale || 'en',
            orgName: metadata?.orgName,
            orgSlug: metadata?.orgSlug,
            inviteCode: metadata?.inviteCode
          }
        }
      });

      if (error) {
        console.log(`[AuthProvider] Signup error: ${error.message}`);
        return { error: error.message };
      }

      console.log(`[AuthProvider] Signup successful for: ${email}`, {
        userId: data?.user?.id,
        needsConfirmation: !data?.session && data?.user && !data?.user?.email_confirmed_at
      });

      // If email confirmation is required, inform the user
      if (!data?.session && data?.user && !data?.user?.email_confirmed_at) {
        return { error: 'Please check your email and click the confirmation link to complete registration.' };
      }

      return {};
    } catch (error) {
      console.error(`[AuthProvider] Signup failed:`, error);
      return { error: 'Sign up failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // State will be cleared by the auth state change listener
    } catch (error) {
      console.error('[AuthProvider] Sign out failed:', error);
      // Force clear state even if signOut fails
      setUser(null);
      setCurrentOrg(null);
      setUserOrgs([]);
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
      console.log(`[AuthProvider] Password reset failed: ${error}`);
      return { error: 'Password reset failed' };
    }
  };

  const switchOrg = async (orgId: string) => {
    const org = userOrgs.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem('yogaswiss_auth', JSON.stringify({
        userId: user?.id,
        currentOrgId: orgId
      }));
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('[AuthProvider] Session refresh failed:', error);
      } else {
        console.log('[AuthProvider] Session refreshed successfully');
      }
    } catch (error) {
      console.error('[AuthProvider] Session refresh error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    currentOrg,
    userOrgs,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    switchOrg,
    refreshSession,
    databaseReady
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type { User, Org, OrgUser, AuthContextType };