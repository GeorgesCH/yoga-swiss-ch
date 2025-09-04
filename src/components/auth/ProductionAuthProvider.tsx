import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase/client';

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
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: string; success?: boolean; needsConfirmation?: boolean; message?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  switchOrg: (orgId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  databaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Production-ready AuthProvider for YogaSwiss
 * - No development bypasses
 * - No mock data
 * - Proper email confirmation required
 * - Swiss GDPR compliance
 * - Secure session management
 */
export function ProductionAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Org | null>(null);
  const [userOrgs, setUserOrgs] = useState<(Org & { role: OrgUser['role']; status: OrgUser['status'] })[]>([]);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [databaseReady, setDatabaseReady] = useState(false);

  // Check if database is ready (has required tables)
  const checkDatabaseStatus = async () => {
    try {
      console.log('[ProductionAuth] Checking database status...');
      
      // Test critical tables
      const { data, error } = await supabase
        .from('orgs')
        .select('id')
        .limit(1);

      if (error) {
        console.log('[ProductionAuth] Database not ready:', error.message);
        if (error.code === 'PGRST204' || error.message.includes('does not exist')) {
          console.log('[ProductionAuth] Database schema not initialized');
          setDatabaseReady(false);
          return false;
        }
      }
      
      console.log('[ProductionAuth] Database is ready');
      setDatabaseReady(true);
      return true;
    } catch (err) {
      console.log('[ProductionAuth] Database check failed:', err);
      setDatabaseReady(false);
      return false;
    }
  };

  // Load user organizations from database
  const loadUserOrganizations = async (userId: string) => {
    if (!databaseReady) {
      console.log('[ProductionAuth] Database not ready, skipping org load');
      return;
    }

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
        .eq('user_id', userId)
        .eq('is_active', true);

      if (orgsError) {
        console.warn('[ProductionAuth] Database query failed (tables may not exist):', orgsError.message);
        setUserOrgs([]);
        setCurrentOrg(null);
        return;
      }

      if (orgsData && orgsData.length > 0) {
        const userOrgsData = orgsData.map(item => ({
          ...item.orgs,
          role: item.role,
          status: item.status
        }));
        setUserOrgs(userOrgsData);
        
        // Set current org to first active org or get from localStorage
        const storedOrgId = localStorage.getItem('yogaswiss_current_org_id');
        const storedOrg = userOrgsData.find(org => org.id === storedOrgId);
        setCurrentOrg(storedOrg || userOrgsData[0] || null);
        
        console.log(`[ProductionAuth] Loaded ${userOrgsData.length} organizations for user`);
      } else {
        console.log('[ProductionAuth] No organizations found for user');
        setUserOrgs([]);
        setCurrentOrg(null);
      }
    } catch (dbError) {
      console.warn('[ProductionAuth] Database query failed (tables may not exist):', dbError);
      setUserOrgs([]);
      setCurrentOrg(null);
    }
  };

  useEffect(() => {
    let isCanceled = false;

    const initializeAuth = async () => {
      try {
        console.log('[ProductionAuth] Initializing authentication...');
        
        // Check database status
        const dbReady = await checkDatabaseStatus();
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[ProductionAuth] Session check failed:', error);
          return;
        }

        if (session?.user && !isCanceled) {
          console.log('[ProductionAuth] Found existing session:', {
            userId: session.user.id,
            email: session.user.email,
            emailConfirmed: !!session.user.email_confirmed_at,
            role: session.user.user_metadata?.role
          });
          
          setSession(session);
          
          // Create user object from session
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            profile: {
              id: session.user.id,
              display_name: session.user.user_metadata?.firstName 
                ? `${session.user.user_metadata.firstName} ${session.user.user_metadata.lastName || ''}`.trim()
                : session.user.email?.split('@')[0] || 'User',
              locale: 'en',
              firstName: session.user.user_metadata?.firstName,
              lastName: session.user.user_metadata?.lastName,
              role: session.user.user_metadata?.role || 'customer',
              created_at: session.user.created_at
            }
          };
          
          setUser(userData);

          // Load organizations for studio/admin users
          if (userData.profile?.role && userData.profile.role !== 'customer') {
            await loadUserOrganizations(session.user.id);
          }
        } else {
          console.log('[ProductionAuth] No existing session found');
        }
      } catch (error) {
        console.error('[ProductionAuth] Initialization failed:', error);
      } finally {
        if (!isCanceled) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isCanceled) return;
      
      console.log('[ProductionAuth] Auth state change:', event, {
        hasSession: !!session,
        hasUser: !!session?.user,
        email: session?.user?.email,
        emailConfirmed: !!session?.user?.email_confirmed_at
      });
      
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setCurrentOrg(null);
        setUserOrgs([]);
        setSession(null);
        localStorage.removeItem('yogaswiss_current_org_id');
      } else if (session?.user) {
        setSession(session);
        
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          profile: {
            id: session.user.id,
            display_name: session.user.user_metadata?.firstName 
              ? `${session.user.user_metadata.firstName} ${session.user.user_metadata.lastName || ''}`.trim()
              : session.user.email?.split('@')[0] || 'User',
            locale: 'en',
            firstName: session.user.user_metadata?.firstName,
            lastName: session.user.user_metadata?.lastName,
            role: session.user.user_metadata?.role || 'customer',
            created_at: session.user.created_at
          }
        };
        
        setUser(userData);

        // Load organizations for studio/admin users
        if (userData.profile?.role && userData.profile.role !== 'customer') {
          await loadUserOrganizations(session.user.id);
        }
      }
      
      if (!isCanceled) {
        setLoading(false);
      }
    });

    // Fallback timeout
    const fallbackTimeout = setTimeout(() => {
      if (!isCanceled) {
        console.log('[ProductionAuth] Fallback timeout reached');
        setLoading(false);
      }
    }, 10000);

    return () => {
      isCanceled = true;
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log(`[ProductionAuth] Attempting sign in for: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log(`[ProductionAuth] Sign in error: ${error.message}`);
        
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Invalid email or password. Please check your credentials and try again.' };
        } else if (error.message.includes('Email not confirmed')) {
          return { error: 'Please check your email and click the confirmation link before signing in.' };
        } else if (error.message.includes('Too many requests')) {
          return { error: 'Too many sign-in attempts. Please wait a few minutes before trying again.' };
        } else {
          return { error: `Sign in failed: ${error.message}` };
        }
      }

      console.log(`[ProductionAuth] Sign in successful for: ${email}`);
      return {};
    } catch (error) {
      console.error(`[ProductionAuth] Sign in failed:`, error);
      return { error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true);
      console.log(`[ProductionAuth] Attempting signup for: ${email}, role: ${metadata?.role}`);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: metadata?.firstName || '',
            lastName: metadata?.lastName || '',
            role: metadata?.role || 'customer',
            language: 'en',
            orgName: metadata?.orgName,
            orgSlug: metadata?.orgSlug,
            phone: metadata?.phone,
            marketingEmails: metadata?.marketingEmails || false
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.log(`[ProductionAuth] Signup error: ${error.message}`);
        
        if (error.message.includes('already registered')) {
          return { error: 'An account with this email already exists. Please sign in instead.' };
        } else if (error.message.includes('Password should be')) {
          return { error: 'Password does not meet security requirements. Please choose a stronger password.' };
        } else {
          return { error: `Account creation failed: ${error.message}` };
        }
      }

      console.log(`[ProductionAuth] Signup successful for: ${email}`, {
        userId: data?.user?.id,
        needsConfirmation: !data?.session && data?.user && !data?.user?.email_confirmed_at
      });

      // Production mode - require email confirmation
      if (!data?.session && data?.user && !data?.user?.email_confirmed_at) {
        return { 
          success: true, 
          needsConfirmation: true, 
          message: 'Please check your email and click the confirmation link to complete registration.' 
        };
      }

      // User is immediately signed in (auto-confirm enabled)
      if (data?.session && data?.user) {
        return { success: true, needsConfirmation: false };
      }

      return { success: true };
    } catch (error) {
      console.error(`[ProductionAuth] Signup failed:`, error);
      return { error: 'An unexpected error occurred during account creation. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('[ProductionAuth] Signing out user');
      await supabase.auth.signOut();
      // State will be cleared by auth state change listener
    } catch (error) {
      console.error('[ProductionAuth] Sign out failed:', error);
      // Force clear state
      setUser(null);
      setCurrentOrg(null);
      setUserOrgs([]);
      setSession(null);
      localStorage.removeItem('yogaswiss_current_org_id');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log(`[ProductionAuth] Sending password reset for: ${email}`);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) {
        console.log(`[ProductionAuth] Password reset error: ${error.message}`);
        return { error: error.message };
      }
      
      console.log(`[ProductionAuth] Password reset email sent to: ${email}`);
      return {};
    } catch (error) {
      console.error(`[ProductionAuth] Password reset failed:`, error);
      return { error: 'Failed to send password reset email. Please try again.' };
    }
  };

  const switchOrg = async (orgId: string) => {
    const org = userOrgs.find(o => o.id === orgId);
    if (org) {
      console.log(`[ProductionAuth] Switching to organization: ${org.name}`);
      setCurrentOrg(org);
      localStorage.setItem('yogaswiss_current_org_id', orgId);
    }
  };

  const refreshSession = async () => {
    try {
      console.log('[ProductionAuth] Refreshing session');
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('[ProductionAuth] Session refresh failed:', error);
      } else {
        console.log('[ProductionAuth] Session refreshed successfully');
      }
    } catch (error) {
      console.error('[ProductionAuth] Session refresh error:', error);
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
    throw new Error('useAuth must be used within a ProductionAuthProvider');
  }
  return context;
}

export type { User, Org, OrgUser, AuthContextType };