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
  Zap, 
  HardDrive,
  Activity,
  Clock,
  Settings,
  Eye,
  Server
} from 'lucide-react';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { supabase } from '../../utils/supabase/client';

interface SISCheck {
  id: string;
  check_name: string;
  check_type: 'schema' | 'rls' | 'data' | 'function' | 'storage' | 'realtime';
  status: 'pass' | 'fail' | 'warning';
  details: any;
  error_message?: string;
  checked_at: string;
}

interface SISSummary {
  id: string;
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  warning_checks: number;
  overall_status: 'healthy' | 'warning' | 'critical' | 'unknown';
  last_check_at: string;
}

export function SupabaseIntegrationStatusDashboard() {
  const { currentOrg } = useMultiTenantAuth();
  const [summary, setSummary] = useState<SISSummary | null>(null);
  const [checks, setChecks] = useState<SISCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (currentOrg?.id) {
      loadSISData();
    }
  }, [currentOrg]);

  const loadSISData = async () => {
    if (!currentOrg?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Load SIS summary
      const { data: summaryData, error: summaryError } = await supabase
        .from('sis_summaries')
        .select('*')
        .eq('organization_id', currentOrg.id)
        .single();

      if (summaryError && summaryError.code !== 'PGRST116') {
        throw summaryError;
      }

      setSummary(summaryData);

      // Load SIS checks
      const { data: checksData, error: checksError } = await supabase
        .from('sis_checks')
        .select('*')
        .eq('organization_id', currentOrg.id)
        .order('checked_at', { ascending: false })
        .limit(100);

      if (checksError) {
        throw checksError;
      }

      setChecks(checksData || []);

    } catch (err) {
      console.error('Error loading SIS data:', err);
      setError('Failed to load integration status');
    } finally {
      setLoading(false);
    }
  };

  const runSISChecks = async () => {
    if (!currentOrg?.id) return;

    try {
      setRunning(true);
      setError(null);

      // Call the SIS check function
      const { data, error } = await supabase.rpc('run_sis_checks', {
        p_organization_id: currentOrg.id
      });

      if (error) {
        throw error;
      }

      // Reload data after checks complete
      await loadSISData();

    } catch (err) {
      console.error('Error running SIS checks:', err);
      setError('Failed to run integration checks');
    } finally {
      setRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'fail':
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'fail':
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'schema':
        return <Database className="h-4 w-4" />;
      case 'rls':
        return <Shield className="h-4 w-4" />;
      case 'function':
        return <Zap className="h-4 w-4" />;
      case 'storage':
        return <HardDrive className="h-4 w-4" />;
      case 'realtime':
        return <Activity className="h-4 w-4" />;
      case 'data':
        return <Server className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const groupedChecks = checks.reduce((groups, check) => {
    if (!groups[check.check_type]) {
      groups[check.check_type] = [];
    }
    groups[check.check_type].push(check);
    return groups;
  }, {} as Record<string, SISCheck[]>);

  const healthScore = summary ? Math.round((summary.passed_checks / summary.total_checks) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading integration status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Supabase Integration Status</h1>
          <p className="text-muted-foreground">
            Monitor the health and status of your Supabase integration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={loadSISData}
            disabled={loading || running}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={runSISChecks}
            disabled={loading || running}
          >
            <Activity className={`h-4 w-4 mr-2 ${running ? 'animate-pulse' : ''}`} />
            {running ? 'Running Checks...' : 'Run Checks'}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Health Score</p>
                <p className="text-2xl font-bold">{healthScore}%</p>
              </div>
              <div className={`p-2 rounded-full ${
                healthScore >= 90 ? 'bg-green-100' :
                healthScore >= 70 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                {getStatusIcon(summary?.overall_status || 'unknown')}
              </div>
            </div>
            <div className="mt-4">
              <Progress value={healthScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Checks</p>
                <p className="text-2xl font-bold">{summary?.total_checks || 0}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last checked: {summary?.last_check_at ? new Date(summary.last_check_at).toLocaleString() : 'Never'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Passed</p>
                <p className="text-2xl font-bold text-green-600">{summary?.passed_checks || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Issues</p>
                <p className="text-2xl font-bold text-red-600">
                  {(summary?.failed_checks || 0) + (summary?.warning_checks || 0)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary?.failed_checks || 0} critical, {summary?.warning_checks || 0} warnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      {summary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(summary.overall_status)}
                  Overall Status: {summary.overall_status.charAt(0).toUpperCase() + summary.overall_status.slice(1)}
                </CardTitle>
                <CardDescription>
                  Integration health summary and recommendations
                </CardDescription>
              </div>
              <Badge className={`${
                summary.overall_status === 'healthy' ? 'bg-green-100 text-green-700' :
                summary.overall_status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                summary.overall_status === 'critical' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {summary.overall_status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {summary.overall_status === 'healthy' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All systems are operational. Your Supabase integration is working correctly.
                </AlertDescription>
              </Alert>
            )}

            {summary.overall_status === 'warning' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Some non-critical issues detected. Review the warnings below and address them when possible.
                </AlertDescription>
              </Alert>
            )}

            {summary.overall_status === 'critical' && (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Critical issues detected that may affect functionality. Please address these immediately.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Checks */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="rls">Security</TabsTrigger>
          <TabsTrigger value="function">Functions</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Check Types Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(groupedChecks).map(([type, typeChecks]) => {
                  const passed = typeChecks.filter(c => c.status === 'pass').length;
                  const failed = typeChecks.filter(c => c.status === 'fail').length;
                  const warnings = typeChecks.filter(c => c.status === 'warning').length;
                  const total = typeChecks.length;

                  return (
                    <div key={type} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(type)}
                        <h4 className="font-medium capitalize">{type}</h4>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Total:</span>
                          <span>{total}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Passed:</span>
                          <span className="text-green-600">{passed}</span>
                        </div>
                        {warnings > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-yellow-600">Warnings:</span>
                            <span className="text-yellow-600">{warnings}</span>
                          </div>
                        )}
                        {failed > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-red-600">Failed:</span>
                            <span className="text-red-600">{failed}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {['schema', 'rls', 'function', 'storage', 'data'].map(checkType => (
          <TabsContent key={checkType} value={checkType} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {getTypeIcon(checkType)}
                  <CardTitle className="capitalize">{checkType} Checks</CardTitle>
                </div>
                <CardDescription>
                  {checkType === 'schema' && 'Database schema and table structure verification'}
                  {checkType === 'rls' && 'Row Level Security policies and access controls'}
                  {checkType === 'function' && 'Stored procedures and database functions'}
                  {checkType === 'storage' && 'File storage buckets and policies'}
                  {checkType === 'data' && 'Data integrity and consistency checks'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupedChecks[checkType]?.map((check) => (
                    <div key={check.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(check.status)}
                          <h4 className="font-medium">{check.check_name}</h4>
                        </div>
                        <Badge className={`${
                          check.status === 'pass' ? 'bg-green-100 text-green-700' :
                          check.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {check.status}
                        </Badge>
                      </div>

                      {check.error_message && (
                        <div className="text-sm text-red-600 mb-2">
                          {check.error_message}
                        </div>
                      )}

                      {check.details && (
                        <div className="text-sm text-muted-foreground">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(check.details, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mt-2">
                        Checked: {new Date(check.checked_at).toLocaleString()}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No {checkType} checks run yet. Click "Run Checks" to perform verification.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}