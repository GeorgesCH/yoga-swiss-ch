import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { supabase } from '../../utils/supabase/client';
import { RefreshCw, User, Mail, Database, CheckCircle, XCircle } from 'lucide-react';

export function AuthStatusDebugger() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      // Try a simple database query to test connectivity
      let dbStatus = 'unknown';
      let dbError = null;
      try {
        const { data, error } = await supabase.from('orgs').select('id').limit(1);
        if (error) {
          dbStatus = 'error';
          dbError = error.message;
        } else {
          dbStatus = 'connected';
        }
      } catch (err) {
        dbStatus = 'error';
        dbError = String(err);
      }

      setAuthStatus({
        session: {
          exists: !!session,
          user_id: session?.user?.id,
          email: session?.user?.email,
          confirmed: session?.user?.email_confirmed_at,
          role: session?.user?.user_metadata?.role,
          created_at: session?.user?.created_at,
          error: sessionError?.message
        },
        user: {
          exists: !!user,
          email: user?.email,
          confirmed: user?.email_confirmed_at,
          metadata: user?.user_metadata,
          error: userError?.message
        },
        database: {
          status: dbStatus,
          error: dbError
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setAuthStatus({
        error: String(error),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const getStatusBadge = (status: any) => {
    if (status === true || status === 'connected') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    }
    if (status === false || status === 'error') {
      return <Badge variant="destructive">Error</Badge>;
    }
    if (status === null || status === undefined) {
      return <Badge variant="secondary">None</Badge>;
    }
    return <Badge variant="outline">{String(status)}</Badge>;
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Authentication Status
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={checkAuthStatus}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {authStatus ? (
          <>
            {/* Session Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Session Status
                </h4>
                {getStatusBadge(authStatus.session?.exists)}
              </div>
              
              {authStatus.session && (
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <div><strong>User ID:</strong> {authStatus.session.user_id || 'None'}</div>
                  <div><strong>Email:</strong> {authStatus.session.email || 'None'}</div>
                  <div><strong>Email Confirmed:</strong> {authStatus.session.confirmed ? 
                    <Badge className="ml-1 bg-green-100 text-green-800">YES</Badge> : 
                    <Badge variant="destructive" className="ml-1">NO</Badge>
                  }</div>
                  <div><strong>Role:</strong> {authStatus.session.role || 'None'}</div>
                  {authStatus.session.error && (
                    <div className="text-red-600"><strong>Error:</strong> {authStatus.session.error}</div>
                  )}
                </div>
              )}
            </div>

            {/* Database Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Database Connection
                </h4>
                {getStatusBadge(authStatus.database?.status)}
              </div>
              
              {authStatus.database?.error && (
                <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">
                  <strong>Database Error:</strong> {authStatus.database.error}
                </div>
              )}
            </div>

            {/* User Details */}
            {authStatus.user?.exists && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  User Details
                </h4>
                
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <div><strong>Email:</strong> {authStatus.user.email}</div>
                  <div><strong>Confirmed At:</strong> {authStatus.user.confirmed || 'Not confirmed'}</div>
                  {authStatus.user.metadata && (
                    <div>
                      <strong>Metadata:</strong>
                      <pre className="mt-1 text-xs bg-background p-2 rounded border overflow-auto">
                        {JSON.stringify(authStatus.user.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground border-t pt-3">
              Last checked: {new Date(authStatus.timestamp).toLocaleString()}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              {loading ? 'Checking authentication status...' : 'Click refresh to check status'}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="border-t pt-4 space-y-2">
          <h5 className="font-medium text-sm">Quick Actions:</h5>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => supabase.auth.signOut()}
            >
              Sign Out
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}