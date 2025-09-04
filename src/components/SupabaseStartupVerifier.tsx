import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Database,
  Wifi,
  Shield
} from 'lucide-react';
import { getSupabaseHealth } from '../utils/supabase/setup-verification';

interface StartupStatus {
  connected: boolean;
  authenticated: boolean;
  schemaReady: boolean;
  functionsReady: boolean;
}

interface SupabaseStartupVerifierProps {
  onComplete?: (status: StartupStatus) => void;
  showMinimal?: boolean;
}

export function SupabaseStartupVerifier({ onComplete, showMinimal = false }: SupabaseStartupVerifierProps) {
  const [status, setStatus] = useState<StartupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyStartup();
  }, []);

  const verifyStartup = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Running startup verification...');
      const healthStatus = await getSupabaseHealth();
      
      console.log('📊 Startup verification result:', healthStatus);
      setStatus(healthStatus);
      
      if (onComplete) {
        onComplete(healthStatus);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Startup verification failed';
      console.error('❌ Startup verification error:', errorMessage);
      setError(errorMessage);
      
      // Set fallback status
      const fallbackStatus = {
        connected: false,
        authenticated: false,
        schemaReady: false,
        functionsReady: false
      };
      setStatus(fallbackStatus);
      
      if (onComplete) {
        onComplete(fallbackStatus);
      }
    } finally {
      setLoading(false);
    }
  };

  const getOverallHealth = (): 'healthy' | 'degraded' | 'critical' => {
    if (!status) return 'critical';
    
    if (!status.connected) return 'critical';
    if (!status.authenticated) return 'degraded';
    if (!status.schemaReady || !status.functionsReady) return 'degraded';
    
    return 'healthy';
  };

  const getHealthColor = (health: 'healthy' | 'degraded' | 'critical') => {
    switch (health) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const overallHealth = getOverallHealth();
  const healthyChecks = status ? Object.values(status).filter(Boolean).length : 0;
  const totalChecks = 4;
  const progress = (healthyChecks / totalChecks) * 100;

  if (showMinimal && !loading && status) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Database className="h-4 w-4" />
        <Badge className={getHealthColor(overallHealth)}>
          Supabase: {overallHealth.charAt(0).toUpperCase() + overallHealth.slice(1)}
        </Badge>
        <span className="text-muted-foreground">
          {healthyChecks}/{totalChecks} services
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying Supabase Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-center py-4">
              <div className="text-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Checking system health...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" />
            Supabase Status
          </CardTitle>
          <Badge className={getHealthColor(overallHealth)}>
            {overallHealth.charAt(0).toUpperCase() + overallHealth.slice(1)}
          </Badge>
        </div>
        
        <div className="mt-3">
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">
            {healthyChecks}/{totalChecks} services operational
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {status && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-3 w-3" />
                <span className="text-sm">Database</span>
              </div>
              {status.connected ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                <span className="text-sm">Authentication</span>
              </div>
              {status.authenticated ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-3 w-3" />
                <span className="text-sm">Schema</span>
              </div>
              {status.schemaReady ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-3 w-3" />
                <span className="text-sm">Edge Functions</span>
              </div>
              {status.functionsReady ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
            </div>
          </div>
        )}

        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {status && overallHealth === 'critical' && (
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Critical services are down. Production app will not start until backend is available.
            </AlertDescription>
          </Alert>
        )}

        {status && overallHealth === 'degraded' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Some services are limited. Core functionality available.
            </AlertDescription>
          </Alert>
        )}

        {status && overallHealth === 'healthy' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              All systems operational. YogaSwiss ready to use.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
