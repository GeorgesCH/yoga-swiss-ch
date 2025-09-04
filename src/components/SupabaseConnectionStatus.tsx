import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database,
  Wifi,
  Activity,
  Clock
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { getRealtimeHealth } from '../utils/supabase/realtime-config';
import { checkServiceHealth } from '../utils/supabase/enhanced-services';

interface ConnectionStatus {
  database: {
    connected: boolean;
    responseTime: number;
    error?: string;
  };
  auth: {
    connected: boolean;
    user: any;
    error?: string;
  };
  realtime: {
    connected: boolean;
    subscriptions: number;
    error?: string;
  };
  services: {
    status: 'healthy' | 'degraded' | 'down';
    errors: string[];
  };
  lastChecked: string;
}

interface SupabaseConnectionStatusProps {
  compact?: boolean;
  showDetails?: boolean;
}

export function SupabaseConnectionStatus({ compact = false, showDetails = false }: SupabaseConnectionStatusProps) {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullStatus, setShowFullStatus] = useState(showDetails);

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    setLoading(true);
    
    try {
      const startTime = Date.now();
      
      // Test database connection
      const { data: dbTest, error: dbError } = await supabase
        .from('organizations')
        .select('id')
        .limit(1);
      
      const dbResponseTime = Date.now() - startTime;
      
      // Test auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      // Check realtime
      const realtimeHealth = getRealtimeHealth();
      
      // Check services
      const servicesHealth = await checkServiceHealth();
      const hasFailedServices = servicesHealth.some(s => s.status === 'down');
      const hasDegradedServices = servicesHealth.some(s => s.status === 'degraded');
      
      const servicesStatus = hasFailedServices ? 'down' : 
                           hasDegradedServices ? 'degraded' : 'healthy';
      
      const servicesErrors = servicesHealth
        .filter(s => s.errors.length > 0)
        .flatMap(s => s.errors);

      setStatus({
        database: {
          connected: !dbError,
          responseTime: dbResponseTime,
          error: dbError?.message
        },
        auth: {
          connected: !authError,
          user: user,
          error: authError?.message
        },
        realtime: {
          connected: realtimeHealth.connected,
          subscriptions: realtimeHealth.subscriptions,
          error: realtimeHealth.errors.length > 0 ? realtimeHealth.errors[0] : undefined
        },
        services: {
          status: servicesStatus,
          errors: servicesErrors
        },
        lastChecked: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error checking Supabase connection:', error);
      setStatus({
        database: { connected: false, responseTime: 0, error: 'Connection failed' },
        auth: { connected: false, user: null, error: 'Auth check failed' },
        realtime: { connected: false, subscriptions: 0, error: 'Realtime check failed' },
        services: { status: 'down', errors: ['Service check failed'] },
        lastChecked: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const getOverallStatus = (): 'healthy' | 'degraded' | 'down' => {
    if (!status) return 'down';
    
    const criticalIssues = !status.database.connected || status.services.status === 'down';
    const minorIssues = !status.realtime.connected || status.services.status === 'degraded';
    
    if (criticalIssues) return 'down';
    if (minorIssues) return 'degraded';
    return 'healthy';
  };

  const getStatusIcon = (statusType: 'healthy' | 'degraded' | 'down') => {
    switch (statusType) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (statusType: 'healthy' | 'degraded' | 'down') => {
    switch (statusType) {
      case 'healthy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'down':
        return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const overallStatus = getOverallStatus();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          className={`${getStatusColor(overallStatus)} border`}
          onClick={() => setShowFullStatus(!showFullStatus)}
        >
          {getStatusIcon(overallStatus)}
          <span className="ml-1 capitalize">{overallStatus}</span>
        </Badge>
        
        {loading && (
          <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
        )}
        
        {showFullStatus && status && (
          <div className="absolute top-full right-0 mt-2 w-80 z-50">
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Supabase Status</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={checkConnection}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Database className="h-3 w-3" />
                    <span className={status.database.connected ? 'text-green-600' : 'text-red-600'}>
                      DB: {status.database.connected ? 'OK' : 'Failed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="h-3 w-3" />
                    <span className={status.realtime.connected ? 'text-green-600' : 'text-red-600'}>
                      RT: {status.realtime.connected ? 'OK' : 'Failed'}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Response: {status.database.responseTime}ms
                </div>
                
                {(status.database.error || status.realtime.error || status.services.errors.length > 0) && (
                  <Alert>
                    <AlertTriangle className="h-3 w-3" />
                    <AlertDescription className="text-xs">
                      {status.database.error || status.realtime.error || status.services.errors[0]}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(overallStatus)}
              Supabase Connection Status
            </CardTitle>
            <CardDescription>
              Real-time monitoring of Supabase services
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkConnection}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status && (
          <>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <Database className={`h-6 w-6 mx-auto mb-2 ${status.database.connected ? 'text-green-600' : 'text-red-600'}`} />
                <div className="font-medium text-sm">Database</div>
                <div className={`text-xs ${status.database.connected ? 'text-green-600' : 'text-red-600'}`}>
                  {status.database.connected ? 'Connected' : 'Failed'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {status.database.responseTime}ms
                </div>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <Activity className={`h-6 w-6 mx-auto mb-2 ${status.auth.connected ? 'text-green-600' : 'text-red-600'}`} />
                <div className="font-medium text-sm">Auth</div>
                <div className={`text-xs ${status.auth.connected ? 'text-green-600' : 'text-red-600'}`}>
                  {status.auth.connected ? 'Active' : 'Failed'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {status.auth.user ? 'Signed in' : 'Guest'}
                </div>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <Wifi className={`h-6 w-6 mx-auto mb-2 ${status.realtime.connected ? 'text-green-600' : 'text-red-600'}`} />
                <div className="font-medium text-sm">Realtime</div>
                <div className={`text-xs ${status.realtime.connected ? 'text-green-600' : 'text-red-600'}`}>
                  {status.realtime.connected ? 'Connected' : 'Failed'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {status.realtime.subscriptions} subs
                </div>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <CheckCircle className={`h-6 w-6 mx-auto mb-2 ${
                  status.services.status === 'healthy' ? 'text-green-600' :
                  status.services.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                }`} />
                <div className="font-medium text-sm">Services</div>
                <div className={`text-xs capitalize ${
                  status.services.status === 'healthy' ? 'text-green-600' :
                  status.services.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {status.services.status}
                </div>
              </div>
            </div>
            
            {(status.database.error || status.auth.error || status.realtime.error || status.services.errors.length > 0) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {status.database.error && <div>Database: {status.database.error}</div>}
                    {status.auth.error && <div>Auth: {status.auth.error}</div>}
                    {status.realtime.error && <div>Realtime: {status.realtime.error}</div>}
                    {status.services.errors.map((error, index) => (
                      <div key={index}>Services: {error}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="text-xs text-muted-foreground text-center">
              Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}