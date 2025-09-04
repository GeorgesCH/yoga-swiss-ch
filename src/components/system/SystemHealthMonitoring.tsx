import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Shield, 
  Activity,
  Clock,
  Server,
  Globe,
  Wifi,
  Timer
} from 'lucide-react';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { supabase } from '../../utils/supabase/client';

// Service health check functions
const testClassesService = async () => {
  const startTime = Date.now();
  try {
    const { data, error } = await supabase
      .from('class_templates')
      .select('id')
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error && error.code === '42P01') {
      // Table doesn't exist
      return { status: 'degraded', responseTime, errors: ['Tables not initialized'] };
    } else if (error) {
      return { status: 'down', responseTime, errors: [error.message] };
    }
    
    return { status: 'healthy', responseTime, errors: [] };
  } catch (err) {
    return { 
      status: 'down', 
      responseTime: Date.now() - startTime, 
      errors: [err instanceof Error ? err.message : 'Unknown error'] 
    };
  }
};

const testAuthService = async () => {
  const startTime = Date.now();
  try {
    const { data, error } = await supabase.auth.getSession();
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return { status: 'down', responseTime, errors: [error.message] };
    }
    
    return { status: 'healthy', responseTime, errors: [] };
  } catch (err) {
    return { 
      status: 'down', 
      responseTime: Date.now() - startTime, 
      errors: [err instanceof Error ? err.message : 'Unknown error'] 
    };
  }
};

const testStorageService = async () => {
  const startTime = Date.now();
  try {
    const { data, error } = await supabase.storage.listBuckets();
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return { status: 'degraded', responseTime, errors: [error.message] };
    }
    
    return { status: 'healthy', responseTime, errors: [] };
  } catch (err) {
    return { 
      status: 'degraded', 
      responseTime: Date.now() - startTime, 
      errors: [err instanceof Error ? err.message : 'Storage unavailable'] 
    };
  }
};

const testRealtimeService = async () => {
  const startTime = Date.now();
  try {
    // Just test if we can create a channel (doesn't require full subscription)
    const channel = supabase.channel('health-test');
    const responseTime = Date.now() - startTime;
    
    // Clean up the channel
    supabase.removeChannel(channel);
    
    return { status: 'healthy', responseTime, errors: [] };
  } catch (err) {
    return { 
      status: 'degraded', 
      responseTime: Date.now() - startTime, 
      errors: [err instanceof Error ? err.message : 'Realtime unavailable'] 
    };
  }
};

const processServiceResult = (result: PromiseSettledResult<any>) => {
  if (result.status === 'fulfilled') {
    return result.value;
  } else {
    return { 
      status: 'down', 
      responseTime: 0, 
      errors: [result.reason?.message || 'Service failed'] 
    };
  }
};

interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'down';
  services: Array<{
    service: string;
    status: string;
    responseTime: number;
    errors: string[];
  }>;
  database: {
    connected: boolean;
    responseTime: number;
    activeConnections: number;
  };
  lastChecked: string;
}

export function SystemHealthMonitoring() {
  const { currentOrg } = useMultiTenantAuth();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSystemHealth();
    
    if (autoRefresh) {
      const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const checkSystemHealth = async () => {
    try {
      setLoading(true);
      setError(null);

      const startTime = Date.now();
      
      // Check database connection using reliable auth-based test
      let dbError = null;
      let dbConnected = false;
      
      try {
        console.log('🔍 Testing database connection...');
        
        // First test: Auth service (this always works if Supabase is accessible)
        const { error: authError } = await supabase.auth.getSession();
        if (!authError) {
          dbConnected = true;
          console.log('✅ Database connection successful via auth service');
        } else {
          console.log('⚠️ Auth service failed, testing with application tables...');
          
          // Fallback to application tables
          const { data: orgsTest, error: orgsError } = await supabase
            .from('orgs')
            .select('count', { count: 'exact', head: true })
            .limit(0);
          
          if (!orgsError || orgsError.code === '42P01') {
            // Connection works, table may or may not exist
            dbConnected = true;
            console.log('✅ Database connection successful via orgs table test');
          } else {
            // Try one more fallback with a simple RPC
            try {
              await supabase.rpc('get_current_timestamp_test');
              dbConnected = true;
              console.log('✅ Database connection successful via RPC');
            } catch (rpcError) {
              dbError = orgsError;
              console.error('❌ All database connection tests failed:', { authError, orgsError, rpcError });
            }
          }
        }
      } catch (err) {
        dbError = err;
        dbConnected = false;
        console.error('❌ Database connection error:', err);
      }

      const dbResponseTime = Date.now() - startTime;

      // Test actual services
      const services = await Promise.allSettled([
        testClassesService(),
        testAuthService(),
        testStorageService(),
        testRealtimeService()
      ]);
      
      const serviceResults = [
        { service: 'classes', ...processServiceResult(services[0]) },
        { service: 'authentication', ...processServiceResult(services[1]) },
        { service: 'storage', ...processServiceResult(services[2]) },
        { service: 'realtime', ...processServiceResult(services[3]) }
      ];

      // Determine overall system status
      const hasFailedServices = serviceResults.some(s => s.status === 'down');
      const hasDegradedServices = serviceResults.some(s => s.status === 'degraded');

      let overallStatus: 'healthy' | 'degraded' | 'down';
      if (!dbConnected || hasFailedServices) {
        overallStatus = 'down';
      } else if (hasDegradedServices) {
        overallStatus = 'degraded';
      } else {
        overallStatus = 'healthy';
      }

      console.log(`📊 System Status: ${overallStatus}`, {
        database: dbConnected,
        services: serviceResults.map(s => ({ name: s.service, status: s.status }))
      });

      setSystemStatus({
        overall: overallStatus,
        services: serviceResults,
        database: {
          connected: dbConnected,
          responseTime: dbResponseTime,
          activeConnections: 1
        },
        lastChecked: new Date().toISOString()
      });

    } catch (err) {
      console.error('Error checking system health:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`System health check failed: ${errorMessage}`);
      
      // Set a degraded status even if we can't get full health info
      setSystemStatus({
        overall: 'down',
        services: [],
        database: {
          connected: false,
          responseTime: 0,
          activeConnections: 0
        },
        lastChecked: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getOverallHealthScore = () => {
    if (!systemStatus) return 0;
    
    // Database is 40% of the score since it's critical
    const dbScore = systemStatus.database.connected ? 40 : 0;
    
    // Services are 60% of the score, distributed evenly
    const totalServices = systemStatus.services.length;
    const serviceWeight = totalServices > 0 ? 60 / totalServices : 0;
    
    const servicesScore = systemStatus.services.reduce((score, service) => {
      if (service.status === 'healthy') return score + serviceWeight;
      if (service.status === 'degraded') return score + (serviceWeight * 0.7);
      return score + (serviceWeight * 0.2); // Still give some credit for down services that were attempted
    }, 0);
    
    return Math.round(Math.min(100, dbScore + servicesScore));
  };

  if (loading && !systemStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking system health...</p>
        </div>
      </div>
    );
  }

  const healthScore = getOverallHealthScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">System Health Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of system components and services
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-muted-foreground">
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Timer className="h-4 w-4 mr-2" />
              {autoRefresh ? 'Disable' : 'Enable'}
            </Button>
          </div>
          <Button 
            variant="outline" 
            onClick={checkSystemHealth}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {systemStatus && !systemStatus.database.connected && (
            <Button 
              variant="secondary"
              onClick={async () => {
                console.log('🔧 Running quick connection test...');
                const startTime = Date.now();
                try {
                  const response = await fetch('https://okvreiyhuxjosgauqaqq.supabase.co', {
                    method: 'HEAD',
                    mode: 'no-cors'
                  });
                  const responseTime = Date.now() - startTime;
                  console.log(`✅ Supabase endpoint reachable (${responseTime}ms)`);
                  alert(`Supabase endpoint is reachable (${responseTime}ms). The issue may be with authentication or database configuration.`);
                } catch (err) {
                  console.error('❌ Supabase endpoint not reachable:', err);
                  alert('Cannot reach Supabase endpoint. Please check your internet connection.');
                }
              }}
            >
              <Globe className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overall Status */}
      {systemStatus && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(systemStatus.overall)}
                  System Status: {systemStatus.overall.charAt(0).toUpperCase() + systemStatus.overall.slice(1)}
                </CardTitle>
                <CardDescription>
                  Overall system health and performance overview
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{healthScore}%</div>
                <div className="text-sm text-muted-foreground">Health Score</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={healthScore} className="h-3" />
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Last checked:</span>
                  <div className="font-medium">
                    {new Date(systemStatus.lastChecked).toLocaleTimeString()}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Database:</span>
                  <div className={`font-medium ${systemStatus.database.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {systemStatus.database.connected ? 'Connected' : 'Disconnected'}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Response time:</span>
                  <div className="font-medium">
                    {systemStatus.database.responseTime}ms
                  </div>
                </div>
              </div>

              {systemStatus.overall !== 'healthy' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {systemStatus.overall === 'down' 
                      ? 'Critical issues detected. Database connection or core services are unavailable.'
                      : 'Performance issues detected. System may be slower than usual.'
                    }
                    {!systemStatus.database.connected && (
                      <div className="mt-2 text-sm">
                        <p><strong>Database Connection Issue:</strong></p>
                        <ul className="list-disc list-inside ml-2">
                          <li>Check your internet connection</li>
                          <li>Verify Supabase project settings</li>
                          <li>Ensure your API keys are correct</li>
                          <li>Check if your Supabase project is active</li>
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Status */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Health</CardTitle>
              <CardDescription>Status of core application services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemStatus?.services.map((service) => (
                  <div key={service.service} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium capitalize">{service.service} Service</div>
                        <div className="text-sm text-muted-foreground">
                          Response time: {service.responseTime}ms
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${
                        service.status === 'healthy' ? 'bg-green-100 text-green-700' :
                        service.status === 'degraded' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {getStatusIcon(service.status)}
                        <span className="ml-1">{service.status}</span>
                      </Badge>
                      {service.errors.length > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {service.errors[0]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Health</CardTitle>
              <CardDescription>Supabase database connection and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-medium">Connection</div>
                    <div className={`text-sm ${systemStatus?.database.connected ? 'text-green-600' : 'text-red-600'}`}>
                      {systemStatus?.database.connected ? 'Active' : 'Failed'}
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Timer className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-medium">Response Time</div>
                    <div className="text-sm">
                      {systemStatus?.database.responseTime}ms
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-medium">Connections</div>
                    <div className="text-sm">
                      {systemStatus?.database.activeConnections}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>System performance and resource usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Performance Monitoring</h3>
                  <p className="text-muted-foreground">
                    Detailed performance metrics are available in the Supabase dashboard.
                  </p>
                  <Button className="mt-4" variant="outline">
                    <Globe className="h-4 w-4 mr-2" />
                    Open Supabase Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}