import { useState, useEffect } from 'react';
import { useMultiTenantAuth } from './auth/MultiTenantAuthProvider';
import { supabase } from '../utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import {
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Search,
  HardDrive,
  Building2,
  Loader2
} from 'lucide-react';

interface RecoveryData {
  kvOrganizations: any[];
  supabaseTablesExist: boolean;
  compatibilityViewsExist: boolean;
  authFunctionsExist: boolean;
  userHasAuth: boolean;
  canRecover: boolean;
  databaseStatus?: any;
}

export function OrganizationRecoveryManager() {
  const { user, refreshOrgs } = useMultiTenantAuth();
  const [recovery, setRecovery] = useState<RecoveryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const checkRecoveryStatus = async () => {
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      console.log('[Recovery] Checking organization recovery status...');
      
      // Get auth token properly
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Check database setup status first
      let databaseStatus = null;
      try {
        const statusResponse = await fetch(`https://okvreiyhuxjosgauqaqq.supabase.co/functions/v1/make-server-f0b2daa4/setup/status`);
        if (statusResponse.ok) {
          databaseStatus = await statusResponse.json();
        }
      } catch (error) {
        console.log('[Recovery] Database status check failed:', error);
      }

      // Check if we can access the backend API
      const apiResponse = await fetch(`https://okvreiyhuxjosgauqaqq.supabase.co/functions/v1/make-server-f0b2daa4/orgs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const apiData = apiResponse.ok ? await apiResponse.json() : null;
      console.log('[Recovery] API response:', { status: apiResponse.status, data: apiData });

      // Check normalized schema tables
      let supabaseTablesExist = false;
      try {
        const { error } = await supabase.from('organizations').select('id').limit(1);
        supabaseTablesExist = !error || !error.message.includes('does not exist');
      } catch (error) {
        console.log('[Recovery] Normalized schema check failed:', error);
      }

      // Check compatibility views
      let compatibilityViewsExist = false;
      try {
        const { error } = await supabase.from('orgs').select('id').limit(1);
        compatibilityViewsExist = !error || !error.message.includes('does not exist');
      } catch (error) {
        console.log('[Recovery] Compatibility views check failed:', error);
      }

      // Check auth functions
      let authFunctionsExist = false;
      try {
        const { error } = await supabase.rpc('get_user_organizations', { p_user_id: user.id });
        authFunctionsExist = !error || !error.message.includes('function') || error.message.includes('permission');
      } catch (error) {
        console.log('[Recovery] Auth functions check failed:', error);
      }

      // Check for data in different storage locations
      const recoveryData: RecoveryData = {
        kvOrganizations: apiData?.orgs || [],
        supabaseTablesExist,
        compatibilityViewsExist,
        authFunctionsExist,
        userHasAuth: !!user,
        canRecover: false,
        databaseStatus
      };

      // Determine if recovery is possible
      recoveryData.canRecover = recoveryData.userHasAuth && (!supabaseTablesExist || !compatibilityViewsExist || recoveryData.kvOrganizations.length === 0);

      setRecovery(recoveryData);
      console.log('[Recovery] Recovery analysis:', recoveryData);

    } catch (error) {
      console.error('[Recovery] Status check failed:', error);
      setMessage('Failed to check recovery status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const runDatabaseSetup = async () => {
    setRecovering(true);
    setMessage(null);

    try {
      console.log('[Recovery] Checking database setup status...');

      // First check status
      const statusResponse = await fetch(`https://okvreiyhuxjosgauqaqq.supabase.co/functions/v1/make-server-f0b2daa4/setup/status`);
      const statusResult = await statusResponse.json();
      
      if (statusResponse.ok && statusResult.ready) {
        setMessage('Database is already properly set up!');
        
        // Refresh data
        setTimeout(async () => {
          await checkRecoveryStatus();
          await refreshOrgs();
        }, 1000);
        return;
      }

      // If not ready, call setup endpoint for instructions
      const setupResponse = await fetch(`https://okvreiyhuxjosgauqaqq.supabase.co/functions/v1/make-server-f0b2daa4/setup/database`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const setupResult = await setupResponse.json();
      console.log('[Recovery] Database setup result:', setupResult);

      if (setupResult.status === 'ready') {
        setMessage('Database setup completed successfully!');
        
        // Wait a moment for tables to be ready
        setTimeout(async () => {
          await checkRecoveryStatus();
          await refreshOrgs();
        }, 2000);
      } else if (setupResult.status === 'needs_setup') {
        setMessage(`Manual migration required. Please run the SQL migrations in Supabase SQL Editor:\n1. 20241204000001_complete_normalized_schema.sql\n2. 20241204000002_compatibility_and_auth.sql`);
      } else {
        setMessage(`Database setup status: ${setupResult.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Recovery] Database setup failed:', error);
      setMessage('Database setup check failed. Please try again.');
    } finally {
      setRecovering(false);
    }
  };

  const createSampleOrganization = async () => {
    setRecovering(true);
    setMessage(null);

    try {
      console.log('[Recovery] Creating sample organization...');

      const orgData = {
        name: 'Your Yoga Studio',
        slug: `your-studio-${Date.now()}`,
        type: 'studio',
        settings: {
          languages: ['en', 'de'],
          default_language: 'en',
          vat_rate: 7.7,
          twint_enabled: false,
          qr_bill_enabled: false,
          stripe_enabled: false
        }
      };

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const createResponse = await fetch(`https://okvreiyhuxjosgauqaqq.supabase.co/functions/v1/make-server-f0b2daa4/orgs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orgData)
      });

      const createResult = await createResponse.json();
      console.log('[Recovery] Organization creation result:', createResult);

      if (createResponse.ok) {
        setMessage('Sample organization created successfully!');
        
        // Refresh data
        setTimeout(async () => {
          await checkRecoveryStatus();
          await refreshOrgs();
        }, 1000);
      } else {
        setMessage(`Organization creation failed: ${createResult.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Recovery] Organization creation failed:', error);
      setMessage('Organization creation failed. Please try again.');
    } finally {
      setRecovering(false);
    }
  };

  const cleanupStuckData = async () => {
    setRecovering(true);
    setMessage(null);

    try {
      console.log('[Recovery] Cleaning up stuck organization data...');

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const cleanupResponse = await fetch(`https://okvreiyhuxjosgauqaqq.supabase.co/functions/v1/make-server-f0b2daa4/orgs/cleanup`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const cleanupResult = await cleanupResponse.json();
      console.log('[Recovery] Cleanup result:', cleanupResult);

      if (cleanupResponse.ok) {
        setMessage(`Cleanup completed. Removed ${cleanupResult.cleanedCount} orphaned entries.`);
        
        // Refresh data
        setTimeout(async () => {
          await checkRecoveryStatus();
          await refreshOrgs();
        }, 1000);
      } else {
        setMessage(`Cleanup failed: ${cleanupResult.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Recovery] Cleanup failed:', error);
      setMessage('Cleanup failed. Please try again.');
    } finally {
      setRecovering(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkRecoveryStatus();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Organization Recovery Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recovery Status */}
        {recovery && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <HardDrive className={`w-4 h-4 ${recovery.supabaseTablesExist ? 'text-green-600' : 'text-red-600'}`} />
                <div className="text-sm">
                  <div className="font-medium">Schema Tables</div>
                  <div className="text-muted-foreground">
                    {recovery.supabaseTablesExist ? 'Ready' : 'Missing'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <Database className={`w-4 h-4 ${recovery.compatibilityViewsExist ? 'text-green-600' : 'text-red-600'}`} />
                <div className="text-sm">
                  <div className="font-medium">Legacy Views</div>
                  <div className="text-muted-foreground">
                    {recovery.compatibilityViewsExist ? 'Ready' : 'Missing'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <Building2 className={`w-4 h-4 ${recovery.kvOrganizations.length > 0 ? 'text-green-600' : 'text-orange-600'}`} />
                <div className="text-sm">
                  <div className="font-medium">Organizations</div>
                  <div className="text-muted-foreground">
                    {recovery.kvOrganizations.length} found
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <CheckCircle className={`w-4 h-4 ${recovery.userHasAuth ? 'text-green-600' : 'text-red-600'}`} />
                <div className="text-sm">
                  <div className="font-medium">Authentication</div>
                  <div className="text-muted-foreground">
                    {recovery.userHasAuth ? 'Valid' : 'Invalid'}
                  </div>
                </div>
              </div>
            </div>

            {/* Recovery Actions */}
            <div className="space-y-3">
              {!recovery.supabaseTablesExist && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Normalized database schema is missing. Run migrations to create the required tables.
                  </AlertDescription>
                </Alert>
              )}

              {!recovery.compatibilityViewsExist && recovery.supabaseTablesExist && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Compatibility views are missing. Run the auth migration to create legacy API support.
                  </AlertDescription>
                </Alert>
              )}

              {recovery.kvOrganizations.length === 0 && recovery.supabaseTablesExist && recovery.compatibilityViewsExist && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No organizations found. You may need to create a new organization or clean up stuck data.
                  </AlertDescription>
                </Alert>
              )}

              {recovery.databaseStatus && !recovery.databaseStatus.ready && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Database status: {recovery.databaseStatus.message || 'Incomplete setup detected'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={checkRecoveryStatus}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking Status...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Check Recovery Status
              </>
            )}
          </Button>

          {recovery && (!recovery.supabaseTablesExist || !recovery.compatibilityViewsExist) && (
            <Button
              onClick={runDatabaseSetup}
              disabled={recovering}
              className="w-full"
            >
              {recovering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting Up Database...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Setup Database Schema
                </>
              )}
            </Button>
          )}

          {recovery && recovery.supabaseTablesExist && recovery.compatibilityViewsExist && recovery.kvOrganizations.length === 0 && (
            <Button
              onClick={createSampleOrganization}
              disabled={recovering}
              className="w-full"
            >
              {recovering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Organization...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Create Sample Organization
                </>
              )}
            </Button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={cleanupStuckData}
              disabled={recovering}
              variant="outline"
              className="w-full"
            >
              {recovering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cleaning...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clean Up Data
                </>
              )}
            </Button>

            <Button
              onClick={refreshOrgs}
              variant="secondary"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Organizations
            </Button>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Debug Info */}
        {recovery && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">Debug Information</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
              {JSON.stringify(recovery, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}