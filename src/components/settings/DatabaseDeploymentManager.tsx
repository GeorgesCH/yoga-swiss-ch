import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Database, CheckCircle2, XCircle, Clock, AlertTriangle, 
  RefreshCw, Settings, History, Server, Zap, PlayCircle,
  GitBranch, Package, FileText, Monitor, Activity
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

interface DeploymentStatus {
  id: string;
  name: string;
  status: 'completed' | 'running' | 'failed' | 'pending';
  timestamp: string;
  duration?: string;
  description: string;
  version?: string;
  details?: string[];
}

interface DatabaseTable {
  name: string;
  status: 'exists' | 'missing' | 'error';
  rowCount?: number;
  lastUpdated?: string;
}

interface EdgeFunction {
  name: string;
  status: 'deployed' | 'missing' | 'error';
  version?: string;
  lastDeployed?: string;
}

export function DatabaseDeploymentManager() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deploymentHistory, setDeploymentHistory] = useState<DeploymentStatus[]>([]);
  const [databaseTables, setDatabaseTables] = useState<DatabaseTable[]>([]);
  const [edgeFunctions, setEdgeFunctions] = useState<EdgeFunction[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock deployment history with latest YogaSwiss deployments
  const mockDeploymentHistory: DeploymentStatus[] = [
    {
      id: '1',
      name: 'Database Schema v2.1.0',
      status: 'completed',
      timestamp: '2024-01-15T10:30:00Z',
      duration: '2m 45s',
      description: 'Core YogaSwiss schema with enhanced RLS policies',
      version: 'v2.1.0',
      details: [
        'Core tables: orgs, users, user_profiles, org_users',
        'People management: customers, instructors, staff',
        'Classes & Bookings: classes, registrations, payments',
        'Enhanced RLS policies for multi-tenant security',
        'Swiss payment integration tables'
      ]
    },
    {
      id: '2',
      name: 'Edge Functions Deployment',
      status: 'completed',
      timestamp: '2024-01-15T10:25:00Z',
      duration: '1m 30s',
      description: 'YogaSwiss API Edge Functions with CORS fixes',
      version: 'v1.2.0',
      details: [
        'People API (customers, instructors)',
        'Classes API (booking, scheduling)',
        'Payments API (Swiss integrations)',
        'Marketing API (campaigns, segments)',
        'CORS configuration updated'
      ]
    },
    {
      id: '3',
      name: 'Authentication Enhancement',
      status: 'completed',
      timestamp: '2024-01-15T10:20:00Z',
      duration: '45s',
      description: 'Enhanced auth with development fallbacks',
      version: 'v1.1.0',
      details: [
        'Development mode authentication bypass',
        'Enhanced token validation',
        'Multi-tenant organization support',
        'Email confirmation improvements'
      ]
    },
    {
      id: '4',
      name: 'Storage Configuration',
      status: 'completed',
      timestamp: '2024-01-15T10:15:00Z',
      duration: '30s',
      description: 'Storage buckets for assets and documents',
      version: 'v1.0.0',
      details: [
        'Class images and videos bucket',
        'Instructor profile images',
        'Marketing assets storage',
        'Document storage with RLS'
      ]
    }
  ];

  // Mock database tables status
  const mockDatabaseTables: DatabaseTable[] = [
    { name: 'orgs', status: 'exists', rowCount: 5, lastUpdated: '2024-01-15T10:30:00Z' },
    { name: 'users', status: 'exists', rowCount: 1, lastUpdated: '2024-01-15T10:30:00Z' },
    { name: 'user_profiles', status: 'exists', rowCount: 1, lastUpdated: '2024-01-15T10:30:00Z' },
    { name: 'org_users', status: 'exists', rowCount: 1, lastUpdated: '2024-01-15T10:30:00Z' },
    { name: 'customers', status: 'exists', rowCount: 25, lastUpdated: '2024-01-15T10:30:00Z' },
    { name: 'instructors', status: 'exists', rowCount: 8, lastUpdated: '2024-01-15T10:30:00Z' },
    { name: 'classes', status: 'exists', rowCount: 45, lastUpdated: '2024-01-15T10:30:00Z' },
    { name: 'registrations', status: 'exists', rowCount: 156, lastUpdated: '2024-01-15T10:30:00Z' },
    { name: 'payments', status: 'exists', rowCount: 89, lastUpdated: '2024-01-15T10:30:00Z' },
    { name: 'marketing_campaigns', status: 'exists', rowCount: 3, lastUpdated: '2024-01-15T10:30:00Z' }
  ];

  // Mock edge functions status
  const mockEdgeFunctions: EdgeFunction[] = [
    { name: 'make-server-f0b2daa4', status: 'deployed', version: 'v1.2.0', lastDeployed: '2024-01-15T10:25:00Z' },
    { name: 'auth-handler', status: 'deployed', version: 'v1.1.0', lastDeployed: '2024-01-15T10:20:00Z' },
    { name: 'payment-processor', status: 'deployed', version: 'v1.0.0', lastDeployed: '2024-01-15T10:15:00Z' },
    { name: 'email-service', status: 'deployed', version: 'v1.0.0', lastDeployed: '2024-01-15T10:10:00Z' }
  ];

  useEffect(() => {
    loadDeploymentStatus();
  }, []);

  const loadDeploymentStatus = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDeploymentHistory(mockDeploymentHistory);
      setDatabaseTables(mockDatabaseTables);
      setEdgeFunctions(mockEdgeFunctions);
      
      // Mock system health
      setSystemHealth({
        database: 'healthy',
        storage: 'healthy',
        auth: 'healthy',
        functions: 'healthy',
        lastCheck: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to load deployment status:', error);
    } finally {
      setLoading(false);
    }
  };

  const runDatabaseMigration = async () => {
    setLoading(true);
    try {
      // Simulate migration
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Add new deployment to history
      const newDeployment: DeploymentStatus = {
        id: Date.now().toString(),
        name: 'Manual Database Migration',
        status: 'completed',
        timestamp: new Date().toISOString(),
        duration: '3m 0s',
        description: 'Manual database schema update and migration',
        version: 'v2.1.1',
        details: [
          'Schema validation completed',
          'RLS policies updated',
          'Stored procedures refreshed',
          'Seed data applied'
        ]
      };
      
      setDeploymentHistory(prev => [newDeployment, ...prev]);
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'exists':
      case 'deployed':
      case 'healthy':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'running':
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
      case 'error':
      case 'missing':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'exists':
      case 'deployed':
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'running':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'error':
      case 'missing':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Database Deployment Manager</h1>
          <p className="text-muted-foreground">
            Monitor and manage YogaSwiss database deployments and system health
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={loadDeploymentStatus} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={runDatabaseMigration} disabled={loading}>
            <PlayCircle className="w-4 h-4 mr-2" />
            Run Migration
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Database</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(systemHealth?.database)}
                  <span className="text-sm font-medium">
                    {systemHealth?.database || 'Unknown'}
                  </span>
                </div>
              </div>
              <Database className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Edge Functions</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(systemHealth?.functions)}
                  <span className="text-sm font-medium">
                    {edgeFunctions.filter(f => f.status === 'deployed').length}/{edgeFunctions.length} Active
                  </span>
                </div>
              </div>
              <Zap className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Storage</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(systemHealth?.storage)}
                  <span className="text-sm font-medium">
                    {systemHealth?.storage || 'Unknown'}
                  </span>
                </div>
              </div>
              <Server className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Authentication</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(systemHealth?.auth)}
                  <span className="text-sm font-medium">
                    {systemHealth?.auth || 'Unknown'}
                  </span>
                </div>
              </div>
              <Settings className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Deployment History</TabsTrigger>
          <TabsTrigger value="tables">Database Tables</TabsTrigger>
          <TabsTrigger value="functions">Edge Functions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Latest Deployment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GitBranch className="w-5 h-5" />
                  <span>Latest Deployment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deploymentHistory[0] && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{deploymentHistory[0].name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {deploymentHistory[0].description}
                        </p>
                      </div>
                      <Badge className={getStatusColor(deploymentHistory[0].status)}>
                        {deploymentHistory[0].status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Deployed: {formatTimestamp(deploymentHistory[0].timestamp)}</p>
                      <p>Duration: {deploymentHistory[0].duration}</p>
                      <p>Version: {deploymentHistory[0].version}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>System Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Database Tables</span>
                    <span className="text-sm font-medium">
                      {databaseTables.filter(t => t.status === 'exists').length}/{databaseTables.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Edge Functions</span>
                    <span className="text-sm font-medium">
                      {edgeFunctions.filter(f => f.status === 'deployed').length}/{edgeFunctions.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Records</span>
                    <span className="text-sm font-medium">
                      {databaseTables.reduce((sum, table) => sum + (table.rowCount || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Last Health Check</span>
                    <span className="text-sm font-medium">
                      {systemHealth?.lastCheck ? formatTimestamp(systemHealth.lastCheck) : 'Never'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" onClick={runDatabaseMigration} disabled={loading}>
                  <Database className="w-4 h-4 mr-2" />
                  Run Migration
                </Button>
                <Button variant="outline" onClick={loadDeploymentStatus} disabled={loading}>
                  <Monitor className="w-4 h-4 mr-2" />
                  Health Check
                </Button>
                <Button variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Deploy Functions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Deployment History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {deploymentHistory.map((deployment) => (
                    <div key={deployment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(deployment.status)}
                          <div>
                            <h4 className="font-medium">{deployment.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {deployment.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(deployment.status)}>
                            {deployment.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {deployment.version}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        <span>Deployed: {formatTimestamp(deployment.timestamp)}</span>
                        {deployment.duration && <span className="ml-4">Duration: {deployment.duration}</span>}
                      </div>

                      {deployment.details && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Details:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {deployment.details.map((detail, index) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle2 className="w-3 h-3 text-green-600 mr-2 flex-shrink-0" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Database Tables</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {databaseTables.map((table) => (
                  <div key={table.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(table.status)}
                      <div>
                        <h4 className="font-medium">{table.name}</h4>
                        {table.lastUpdated && (
                          <p className="text-xs text-muted-foreground">
                            Last updated: {formatTimestamp(table.lastUpdated)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(table.status)}>
                        {table.status}
                      </Badge>
                      {table.rowCount !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {table.rowCount.toLocaleString()} rows
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="functions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Edge Functions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {edgeFunctions.map((func) => (
                  <div key={func.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(func.status)}
                      <div>
                        <h4 className="font-medium">{func.name}</h4>
                        {func.lastDeployed && (
                          <p className="text-xs text-muted-foreground">
                            Last deployed: {formatTimestamp(func.lastDeployed)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(func.status)}>
                        {func.status}
                      </Badge>
                      {func.version && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {func.version}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {loading && (
        <Alert>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <AlertDescription>
            Processing deployment operation... This may take a few minutes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}