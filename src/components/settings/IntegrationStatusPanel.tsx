import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Shield, 
  Mail, 
  CreditCard,
  Image,
  Zap,
  Globe,
  Lock,
  Eye,
  Clock,
  Activity,
  Settings,
  AlertCircle,
  Wifi,
  Server
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface IntegrationCheck {
  id: string;
  name: string;
  category: 'core' | 'payments' | 'communications' | 'storage' | 'security' | 'features';
  status: 'healthy' | 'warning' | 'error' | 'checking';
  lastChecked: Date;
  details: string;
  metrics?: {
    responseTime?: number;
    uptime?: number;
    errorRate?: number;
  };
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive';
  }>;
}

export function IntegrationStatusPanel() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [checks, setChecks] = useState<IntegrationCheck[]>([]);

  // Mock integration checks - in real app, these would call actual services
  const initializeChecks = (): IntegrationCheck[] => [
    // Core Database
    {
      id: 'supabase-db',
      name: 'Supabase Database',
      category: 'core',
      status: 'healthy',
      lastChecked: new Date(),
      details: 'All tables accessible, RLS policies active',
      metrics: { responseTime: 45, uptime: 99.9, errorRate: 0.1 }
    },
    {
      id: 'supabase-auth',
      name: 'Supabase Auth',
      category: 'security',
      status: 'healthy',
      lastChecked: new Date(),
      details: 'Authentication service operational',
      metrics: { responseTime: 120, uptime: 99.8, errorRate: 0.2 }
    },
    {
      id: 'supabase-storage',
      name: 'Supabase Storage',
      category: 'storage',
      status: 'healthy',
      lastChecked: new Date(),
      details: 'All buckets accessible, signed URLs working',
      metrics: { responseTime: 200, uptime: 99.5, errorRate: 0.3 }
    },
    {
      id: 'supabase-realtime',
      name: 'Supabase Realtime',
      category: 'features',
      status: 'warning',
      lastChecked: new Date(),
      details: 'Some channels experiencing delays',
      metrics: { responseTime: 500, uptime: 98.5, errorRate: 1.2 }
    },
    
    // Payments
    {
      id: 'stripe-payments',
      name: 'Stripe Payments',
      category: 'payments',
      status: 'healthy',
      lastChecked: new Date(),
      details: 'Payment processing operational',
      metrics: { responseTime: 150, uptime: 99.9, errorRate: 0.1 }
    },
    {
      id: 'twint-integration',
      name: 'TWINT Integration',
      category: 'payments',
      status: 'error',
      lastChecked: new Date(),
      details: 'API endpoint unreachable',
      metrics: { responseTime: 0, uptime: 85.2, errorRate: 15.0 },
      actions: [
        {
          label: 'Retry Connection',
          action: () => toast.info('Retrying TWINT connection...'),
        },
        {
          label: 'Check API Status',
          action: () => window.open('https://status.twint.ch', '_blank'),
        }
      ]
    },
    {
      id: 'qr-bill-generator',
      name: 'Swiss QR-Bill Generator',
      category: 'payments',
      status: 'healthy',
      lastChecked: new Date(),
      details: 'PDF generation service operational',
      metrics: { responseTime: 800, uptime: 99.2, errorRate: 0.5 }
    },

    // Communications
    {
      id: 'resend-email',
      name: 'Resend Email Service',
      category: 'communications',
      status: 'healthy',
      lastChecked: new Date(),
      details: 'Email delivery operational, SPF/DKIM configured',
      metrics: { responseTime: 300, uptime: 99.7, errorRate: 0.2 }
    },
    {
      id: 'sms-service',
      name: 'SMS Service',
      category: 'communications',
      status: 'warning',
      lastChecked: new Date(),
      details: 'Delivery delays for international numbers',
      metrics: { responseTime: 1200, uptime: 97.8, errorRate: 2.1 }
    },

    // Classes & Schedule
    {
      id: 'classes-management',
      name: 'Classes Management',
      category: 'features',
      status: 'healthy',
      lastChecked: new Date(),
      details: 'Class CRUD operations working',
      metrics: { responseTime: 80, uptime: 99.8, errorRate: 0.1 }
    },
    {
      id: 'registration-system',
      name: 'Registration System',
      category: 'features',
      status: 'healthy',
      lastChecked: new Date(),
      details: 'Booking and waitlist management operational',
      metrics: { responseTime: 150, uptime: 99.5, errorRate: 0.3 }
    },

    // Storage & Assets
    {
      id: 'image-optimization',
      name: 'Image Optimization',
      category: 'storage',
      status: 'healthy',
      lastChecked: new Date(),
      details: 'Image transforms and fallbacks working',
      metrics: { responseTime: 250, uptime: 99.1, errorRate: 0.8 }
    },

    // Security
    {
      id: 'rls-policies',
      name: 'Row Level Security',
      category: 'security',
      status: 'healthy',
      lastChecked: new Date(),
      details: 'All RLS policies active and tested',
      metrics: { responseTime: 30, uptime: 100, errorRate: 0 }
    },
    {
      id: 'rate-limiting',
      name: 'Rate Limiting',
      category: 'security',
      status: 'healthy',
      lastChecked: new Date(),
      details: 'API rate limits enforced',
      metrics: { responseTime: 10, uptime: 99.9, errorRate: 0.1 }
    }
  ];

  useEffect(() => {
    setChecks(initializeChecks());
  }, []);

  const runIntegrationAudit = async () => {
    setIsRefreshing(true);
    toast.info('Running integration audit...');
    
    try {
      // Simulate audit process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update checks with new statuses
      const updatedChecks = checks.map(check => ({
        ...check,
        lastChecked: new Date(),
        status: Math.random() > 0.8 ? 'warning' : 'healthy' as any
      }));
      
      setChecks(updatedChecks);
      setLastUpdate(new Date());
      toast.success('Integration audit completed');
    } catch (error) {
      toast.error('Audit failed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'warning':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'checking':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core':
        return <Database className="h-4 w-4" />;
      case 'payments':
        return <CreditCard className="h-4 w-4" />;
      case 'communications':
        return <Mail className="h-4 w-4" />;
      case 'storage':
        return <Image className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'features':
        return <Zap className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const categoryGroups = checks.reduce((groups, check) => {
    if (!groups[check.category]) {
      groups[check.category] = [];
    }
    groups[check.category].push(check);
    return groups;
  }, {} as Record<string, IntegrationCheck[]>);

  const overallStatus = checks.every(c => c.status === 'healthy') ? 'healthy' :
                      checks.some(c => c.status === 'error') ? 'error' : 'warning';

  const healthyCount = checks.filter(c => c.status === 'healthy').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const errorCount = checks.filter(c => c.status === 'error').length;
  const healthPercentage = (healthyCount / checks.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Integration Status</h2>
          <p className="text-muted-foreground">
            Monitor the health of all system integrations and services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(overallStatus)}>
            {getStatusIcon(overallStatus)}
            <span className="ml-1 capitalize">{overallStatus}</span>
          </Badge>
          <Button 
            onClick={runIntegrationAudit} 
            disabled={isRefreshing}
            variant="outline"
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isRefreshing ? 'Auditing...' : 'Run Audit'}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-green-600">{healthyCount}</div>
            <p className="text-sm text-muted-foreground">Healthy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-orange-600">{warningCount}</div>
            <p className="text-sm text-muted-foreground">Warnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-red-600">{errorCount}</div>
            <p className="text-sm text-muted-foreground">Errors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold">{healthPercentage.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Health Score</p>
            <Progress value={healthPercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* System Status Alert */}
      {errorCount > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{errorCount} critical issue{errorCount > 1 ? 's' : ''} detected.</strong> 
            {' '}Some features may be unavailable. Please check the details below.
          </AlertDescription>
        </Alert>
      )}

      {warningCount > 0 && errorCount === 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{warningCount} warning{warningCount > 1 ? 's' : ''} detected.</strong> 
            {' '}System performance may be degraded.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Status */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {checks.map((check) => (
              <Card key={check.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(check.category)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{check.name}</h4>
                          {getStatusIcon(check.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{check.details}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>Last checked: {check.lastChecked.toLocaleTimeString()}</span>
                          {check.metrics?.responseTime && (
                            <span>Response: {check.metrics.responseTime}ms</span>
                          )}
                          {check.metrics?.uptime && (
                            <span>Uptime: {check.metrics.uptime}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {check.actions && check.actions.length > 0 && (
                        <div className="flex gap-1">
                          {check.actions.map((action, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant={action.variant || "outline"}
                              onClick={action.action}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                      <Badge className={getStatusColor(check.status)}>
                        {check.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {Object.entries(categoryGroups).map(([category, categoryChecks]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  {getCategoryIcon(category)}
                  {category}
                  <Badge variant="outline">
                    {categoryChecks.filter(c => c.status === 'healthy').length}/{categoryChecks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryChecks.map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(check.status)}
                      <span>{check.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {check.metrics?.responseTime && `${check.metrics.responseTime}ms`}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checks
                    .filter(c => c.metrics?.responseTime)
                    .sort((a, b) => (b.metrics?.responseTime || 0) - (a.metrics?.responseTime || 0))
                    .map((check) => (
                      <div key={check.id} className="flex items-center justify-between">
                        <span className="text-sm">{check.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500" 
                              style={{ width: `${Math.min((check.metrics?.responseTime || 0) / 1000 * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {check.metrics?.responseTime}ms
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uptime Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checks
                    .filter(c => c.metrics?.uptime)
                    .sort((a, b) => (a.metrics?.uptime || 0) - (b.metrics?.uptime || 0))
                    .map((check) => (
                      <div key={check.id} className="flex items-center justify-between">
                        <span className="text-sm">{check.name}</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={check.metrics?.uptime || 0} 
                            className="w-24 h-2"
                          />
                          <span className="text-sm font-medium w-12 text-right">
                            {check.metrics?.uptime}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Manual audit completed</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {lastUpdate.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>Automatic health check</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(Date.now() - 300000).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span>TWINT service degradation detected</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(Date.now() - 1800000).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}