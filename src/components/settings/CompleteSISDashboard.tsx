import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
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
  Server,
  Globe,
  Wifi,
  Timer,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Filter,
  Search,
  Download,
  Play,
  Pause,
  Calendar
} from 'lucide-react';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { useSISHealth, useSISRunner, useSystemAlerts } from '../../utils/supabase/sis-hooks';
import { sisRunner, SISCheckResult } from '../../utils/supabase/sis-runner';

interface InventoryItem {
  id: string;
  area: string;
  page: string;
  component: string;
  resource_type: string;
  resource_ref: string;
  criticality: string;
  owner_role: string;
  updated_at: string;
}

export function CompleteSISdashboard() {
  const { currentOrg } = useMultiTenantAuth();
  const { health, loading: healthLoading, error: healthError, refresh: refreshHealth } = useSISHealth(true);
  const { runChecks, running, lastResult } = useSISRunner();
  const { alerts, loading: alertsLoading, resolveAlert } = useSystemAlerts();
  
  const [checkResults, setCheckResults] = useState<SISCheckResult[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [recentRuns, setRecentRuns] = useState<any[]>([]);
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterCriticality, setFilterCriticality] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showRunDetails, setShowRunDetails] = useState(false);

  useEffect(() => {
    if (currentOrg?.id) {
      loadInventory();
      loadRecentRuns();
    }
  }, [currentOrg]);

  useEffect(() => {
    if (lastResult) {
      loadCheckResults(lastResult.run_id);
    }
  }, [lastResult]);

  const loadInventory = async () => {
    if (!currentOrg?.id) return;

    try {
      const data = await sisRunner.getInventory(currentOrg.id);
      setInventory(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const loadRecentRuns = async () => {
    if (!currentOrg?.id) return;

    try {
      const data = await sisRunner.getRecentRuns(currentOrg.id, 20);
      setRecentRuns(data);
    } catch (error) {
      console.error('Error loading recent runs:', error);
    }
  };

  const loadCheckResults = async (runId: number) => {
    try {
      const data = await sisRunner.getRunDetails(runId);
      setCheckResults(data);
    } catch (error) {
      console.error('Error loading check results:', error);
    }
  };

  const handleRunChecks = async () => {
    try {
      await runChecks();
      await loadRecentRuns();
      await refreshHealth();
    } catch (error) {
      console.error('Error running checks:', error);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesArea = filterArea === 'all' || item.area === filterArea;
    const matchesCriticality = filterCriticality === 'all' || item.criticality === filterCriticality;
    const matchesSearch = !searchQuery || 
      item.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.resource_ref.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesArea && matchesCriticality && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warn':
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
      case 'ok':
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warn':
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'fail':
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'table':
        return <Database className="h-4 w-4" />;
      case 'rpc':
        return <Zap className="h-4 w-4" />;
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'storage':
        return <HardDrive className="h-4 w-4" />;
      case 'realtime':
        return <Wifi className="h-4 w-4" />;
      case 'edge':
        return <Globe className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'P1':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'P2':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'P3':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const areas = [...new Set(inventory.map(item => item.area))];
  const healthScore = health?.health_score || 0;

  if (healthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SIS dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            SIS Dashboard
          </h1>
          <p className="text-muted-foreground">
            Supabase Integration Status monitoring and health checks
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-muted-foreground">
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
          <Button 
            variant="outline" 
            onClick={refreshHealth}
            disabled={healthLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${healthLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleRunChecks}
            disabled={running}
          >
            <Activity className={`h-4 w-4 mr-2 ${running ? 'animate-pulse' : ''}`} />
            {running ? 'Running Checks...' : 'Run Checks'}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {healthError && (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>{healthError}</AlertDescription>
        </Alert>
      )}

      {/* Health Overview */}
      {health && (
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
                  {getStatusIcon(health.status)}
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
                  <p className="text-2xl font-bold">{health.checks_total}</p>
                </div>
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Last run: {health.last_run_at ? formatTime(health.last_run_at) : 'Never'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Passed</p>
                  <p className="text-2xl font-bold text-green-600">{health.checks_passed}</p>
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
                    {health.checks_failed + health.checks_warning}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {health.checks_failed} critical, {health.checks_warning} warnings
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Active System Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getStatusColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <span className="font-medium">{alert.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(alert.created_at)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="checks">Latest Checks</TabsTrigger>
          <TabsTrigger value="history">Run History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SIS Inventory</CardTitle>
                  <CardDescription>
                    Components and their Supabase resource dependencies
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search components..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={filterArea} onValueChange={setFilterArea}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Areas</SelectItem>
                      {areas.map(area => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterCriticality} onValueChange={setFilterCriticality}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="P1">P1 - Critical</SelectItem>
                      <SelectItem value="P2">P2 - Important</SelectItem>
                      <SelectItem value="P3">P3 - Nice to have</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredInventory.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getTypeIcon(item.resource_type)}
                          <div>
                            <h4 className="font-medium">{item.component}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.area} › {item.page}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCriticalityColor(item.criticality)}>
                            {item.criticality}
                          </Badge>
                          <Badge variant="outline">
                            {item.resource_type}: {item.resource_ref}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Owners: {item.owner_role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredInventory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No inventory items found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Latest Check Results</CardTitle>
              <CardDescription>
                Results from the most recent SIS health check run
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checkResults.map((result) => (
                  <div key={result.check_id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(result.status)}
                          <div>
                            <h4 className="font-medium">{result.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {result.resource_type}: {result.resource_ref}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(result.status)}>
                            {result.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {result.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(result.latency_ms)}
                          </span>
                        </div>
                        {result.message && (
                          <p className="text-sm text-muted-foreground">
                            {result.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {checkResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No check results available</p>
                    <p className="text-sm">Run health checks to see results</p>
                    <Button 
                      className="mt-4"
                      onClick={handleRunChecks}
                      disabled={running}
                    >
                      Run Checks Now
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Run History</CardTitle>
              <CardDescription>
                Historical SIS check runs and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentRuns.map((run) => (
                  <div 
                    key={run.id} 
                    className="border rounded-lg p-4 cursor-pointer hover:bg-accent"
                    onClick={() => {
                      setSelectedRun(run);
                      setShowRunDetails(true);
                      loadCheckResults(run.id);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(run.result)}
                        <div>
                          <p className="font-medium">
                            Run #{run.id} - {run.result?.toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(run.started_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {run.checks_passed}/{run.checks_total} passed
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(run.duration_ms || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {recentRuns.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No run history available</p>
                    <p className="text-sm">SIS checks will appear here after running</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SIS Analytics</CardTitle>
              <CardDescription>
                Performance trends and system reliability metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics coming soon</p>
                <p className="text-sm">Performance trends and reliability metrics will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SIS Configuration</CardTitle>
              <CardDescription>
                Configure SIS monitoring settings and schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configuration options coming soon</p>
                <p className="text-sm">Check schedules, alerts, and monitoring preferences</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Run Details Dialog */}
      <Dialog open={showRunDetails} onOpenChange={setShowRunDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Run Details #{selectedRun?.id}
            </DialogTitle>
            <DialogDescription>
              Detailed results from SIS health check run
            </DialogDescription>
          </DialogHeader>
          
          {selectedRun && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedRun.result)}
                    <span className="font-medium">{selectedRun.result?.toUpperCase()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{formatDuration(selectedRun.duration_ms || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="font-medium">
                    {selectedRun.checks_total > 0 
                      ? Math.round((selectedRun.checks_passed / selectedRun.checks_total) * 100)
                      : 0
                    }%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Started</p>
                  <p className="font-medium">{formatTime(selectedRun.started_at)}</p>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {checkResults.map((result) => (
                  <div key={result.check_id} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(result.latency_ms)}
                        </span>
                      </div>
                    </div>
                    {result.message && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}