import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { 
  Bug, 
  User, 
  Database, 
  Shield, 
  Mail, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Trash2,
  Settings
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

// Using the imported supabase client directly
import { useAuth } from './ProductionAuthProvider';
import { useMultiTenantAuth } from './MultiTenantAuthProvider';
import { toast } from 'sonner@2.0.3';

interface AuthDebugPanelProps {
  onClose: () => void;
}

export function AuthDebugPanel({ onClose }: AuthDebugPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [bypassEnabled, setBypassEnabled] = useState(
    localStorage.getItem('yogaswiss-bypass-email-confirmation') === 'true'
  );
  
  const { user, session, databaseReady, loading: authLoading } = useAuth();
  const { user: mtUser, currentOrg, loading: mtLoading } = useMultiTenantAuth();

  const handleCreateTestAccount = async (email: string) => {
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'password123',
        options: {
          data: {
            firstName: email.split('@')[0],
            lastName: 'TestUser',
            role: 'owner',
            language: 'en'
          }
        }
      });

      if (error) {
        setResult({ type: 'error', message: error.message });
      } else {
        setResult({ 
          type: 'success', 
          message: `Account created for ${email}. Check email for confirmation or use bypass.` 
        });
      }
    } catch (error) {
      setResult({ type: 'error', message: `Error: ${error}` });
    } finally {
      setLoading(false);
    }
  };

  const handleClearAuth = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      toast.success('Authentication cleared');
      setResult({ type: 'success', message: 'Authentication state cleared' });
    } catch (error) {
      setResult({ type: 'error', message: `Clear failed: ${error}` });
    }
  };

  const handleCheckSession = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setResult({ type: 'error', message: error.message });
      } else {
        setResult({ 
          type: 'info', 
          message: `Session: ${data.session ? 'Active' : 'None'} ${data.session?.user?.email_confirmed_at ? '(Confirmed)' : '(Unconfirmed)'}` 
        });
      }
    } catch (error) {
      setResult({ type: 'error', message: `Check failed: ${error}` });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBypass = (enabled: boolean) => {
    setBypassEnabled(enabled);
    if (enabled) {
      localStorage.setItem('yogaswiss-bypass-email-confirmation', 'true');
      toast.success('Email confirmation bypass enabled');
      setResult({ 
        type: 'success', 
        message: 'Email confirmation bypass enabled. You can now sign in with unconfirmed emails.' 
      });
    } else {
      localStorage.removeItem('yogaswiss-bypass-email-confirmation');
      toast.success('Email confirmation bypass disabled');
      setResult({ 
        type: 'info', 
        message: 'Email confirmation bypass disabled. Normal email confirmation required.' 
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-blue-500" />
              <CardTitle>Authentication Debug Panel</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
          </div>
          <CardDescription>
            Comprehensive authentication debugging tools for development
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="status" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="session">Session</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Authentication Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">User:</span>
                      <Badge variant={user ? 'default' : 'secondary'}>
                        {user ? 'Authenticated' : 'Not Signed In'}
                      </Badge>
                    </div>
                    {user && (
                      <>
                        <div className="text-xs text-muted-foreground">
                          Email: {user.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Role: {user.profile?.role || 'Unknown'}
                        </div>
                      </>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Loading:</span>
                      <Badge variant={authLoading || mtLoading ? 'destructive' : 'default'}>
                        {authLoading || mtLoading ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Organization Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Org:</span>
                      <Badge variant={currentOrg ? 'default' : 'secondary'}>
                        {currentOrg ? 'Set' : 'None'}
                      </Badge>
                    </div>
                    {currentOrg && (
                      <div className="text-xs text-muted-foreground">
                        Name: {currentOrg.name}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Database Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database:</span>
                      <Badge variant={databaseReady ? 'default' : 'destructive'}>
                        {databaseReady ? 'Ready' : 'Fallback Mode'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Session Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Session:</span>
                      <Badge variant={session ? 'default' : 'secondary'}>
                        {session ? 'Active' : 'None'}
                      </Badge>
                    </div>
                    {session?.user && (
                      <div className="text-xs text-muted-foreground">
                        Confirmed: {session.user.email_confirmed_at ? 'Yes' : 'No'}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Development Bypass
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm font-medium">Email Confirmation Bypass</span>
                        <div className="text-xs text-muted-foreground">
                          {bypassEnabled 
                            ? 'Allows sign in with unconfirmed emails in development' 
                            : 'Requires proper email confirmation'
                          }
                        </div>
                      </div>
                      <Switch 
                        checked={bypassEnabled}
                        onCheckedChange={handleToggleBypass}
                      />
                    </div>
                    {bypassEnabled && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          <strong>Development Mode:</strong> Email confirmation is bypassed. 
                          This allows you to sign in with accounts that haven't confirmed their email addresses.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              {result && (
                <Alert variant={result.type === 'error' ? 'destructive' : 'default'}>
                  {result.type === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : result.type === 'error' ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => handleCreateTestAccount('test@example.com')}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Create Test Account
                </Button>

                <Button
                  onClick={() => handleCreateTestAccount('studio@yogaswiss.ch')}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Create Demo Account
                </Button>

                <Button
                  onClick={handleCheckSession}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Session
                </Button>

                <Button
                  onClick={handleClearAuth}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Auth
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="database" className="space-y-4">
              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  Database connection status and debugging information
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span>Database Ready:</span>
                  <Badge variant={databaseReady ? 'default' : 'destructive'}>
                    {databaseReady ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {databaseReady 
                    ? 'Database schema is initialized and tables are accessible.'
                    : 'Running in fallback mode. Database schema may not be initialized or tables are missing.'
                  }
                </div>
              </div>
            </TabsContent>

            <TabsContent value="session" className="space-y-4">
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  Current session and user data details
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                {session?.user ? (
                  <div className="p-3 bg-muted rounded text-xs space-y-2">
                    <div><strong>User ID:</strong> {session.user.id}</div>
                    <div><strong>Email:</strong> {session.user.email}</div>
                    <div><strong>Confirmed:</strong> {session.user.email_confirmed_at || 'Not confirmed'}</div>
                    <div><strong>Created:</strong> {session.user.created_at}</div>
                    <div><strong>Metadata:</strong></div>
                    <pre className="text-xs overflow-auto bg-background p-2 rounded border">
                      {JSON.stringify(session.user.user_metadata, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No active session found
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}