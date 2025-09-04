import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Database, CheckCircle2, XCircle, Clock, AlertTriangle, 
  RefreshCw, Settings, Zap, Server, GitBranch, Package,
  ExternalLink, Loader2, CheckCircle
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { getSupabaseHealth } from '../utils/supabase/setup-verification';

export interface DatabaseStatusProps {
  onStatusChange?: (isInitialized: boolean) => void;
  showCompact?: boolean;
  onSetupClick?: () => void;
}

export function DatabaseSetupStatus({ showCompact = false, onStatusChange, onSetupClick }: DatabaseStatusProps) {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>(null);
  const [initializationProgress, setInitializationProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(!showCompact);
  const [deploymentInfo, setDeploymentInfo] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkDatabaseStatus();
    loadDeploymentInfo();
  }, []);

  const loadDeploymentInfo = () => {
    // Mock latest deployment information
    setDeploymentInfo({
      version: 'v2.1.0',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'completed',
      components: {
        schema: 'v2.1.0 - Enhanced RLS policies',
        functions: 'v1.2.0 - CORS fixes applied',
        auth: 'v1.1.0 - Development bypass enabled',
        storage: 'v1.0.0 - Asset buckets configured'
      }
    });
  };

  const checkDatabaseStatus = async () => {
    setLoading(true);
    setIsChecking(true);
    try {
      // First check using the health verification
      const healthStatus = await getSupabaseHealth();
      setHealth(healthStatus);
      
      // Also check critical tables
      const criticalTables = [
        'orgs',
        'user_profiles', 
        'customers',
        'instructors',
        'classes'
      ];

      const checks = await Promise.allSettled(
        criticalTables.map(tableName =>
          supabase.from(tableName).select('id').limit(1)
        )
      );

      // Check if all critical tables are accessible
      const failedChecks = checks.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && result.value.error)
      );

      const tablesInitialized = failedChecks.length === 0;
      setIsInitialized(tablesInitialized);

      if (!tablesInitialized) {
        const sampleError = checks.find(result => 
          result.status === 'fulfilled' && result.value.error
        );
        
        if (sampleError && sampleError.status === 'fulfilled') {
          const errorData = (sampleError.value as any).error;
          if (errorData?.code === 'PGRST204' || errorData?.message?.includes('does not exist')) {
            setError('YogaSwiss database schema is not deployed. Please run initialization.');
          } else {
            setError('Database access issues detected.');
          }
        } else {
          setError('Could not verify YogaSwiss database status.');
        }
      }
      
      // Calculate initialization progress based on latest deployment components
      let progress = 0;
      if (healthStatus?.isHealthy) progress += 25;
      if (healthStatus?.auth?.isConfigured) progress += 25;
      if (tablesInitialized || healthStatus?.database?.hasRequiredTables) progress += 25;
      if (healthStatus?.functions?.isDeployed) progress += 25;
      
      setInitializationProgress(progress);
      onStatusChange?.(progress === 100 && tablesInitialized);
      
    } catch (error) {
      console.error('Failed to check database status:', error);
      setHealth({ isHealthy: false, error: 'Failed to connect to YogaSwiss backend' });
      setIsInitialized(false);
      setError('Database connection failed');
      onStatusChange?.(false);
    } finally {
      setLoading(false);
      setIsChecking(false);
    }
  };

  const handleSetupClick = () => {
    if (onSetupClick) {
      onSetupClick();
    } else {
      // For now, show instructions since we need proper routing
      alert(
        'YogaSwiss Database Setup Required\n\n' +
        'To initialize your Swiss yoga studio platform:\n\n' +
        '1. Ensure your Supabase project is connected\n' +
        '2. Run the database initialization script\n' +
        '3. Deploy the latest YogaSwiss schema\n' +
        '4. Verify all multi-tenant tables are created\n\n' +
        'Run: ./cli-init.sh\n\nSee the setup documentation for detailed steps.'
      );
    }
  };

  const getStatusIcon = (status: boolean | undefined) => {
    if (status === undefined) return <Clock className="w-4 h-4 text-yellow-600" />;
    return status ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusColor = (status: boolean | undefined) => {
    if (status === undefined) return 'bg-yellow-100 text-yellow-800';
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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

  // Loading state
  if (isChecking) {
    if (showCompact) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking YogaSwiss database...</span>
        </div>
      );
    }

    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-medium text-blue-800">Checking YogaSwiss Platform Status</h3>
              <p className="text-sm text-blue-700 mt-1">
                Verifying Swiss studio management system...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state - fully initialized
  if (isInitialized === true && initializationProgress === 100) {
    if (showCompact) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-700">
          <CheckCircle className="h-4 w-4" />
          <span>YogaSwiss ready</span>
        </div>
      );
    }

    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-medium text-green-800">YogaSwiss Platform Ready</h3>
              <p className="text-sm text-green-700 mt-1">
                Your Swiss yoga studio management platform is fully operational.
              </p>
              {deploymentInfo && (
                <p className="text-xs text-green-600 mt-1">
                  🇨🇭 {deploymentInfo.version} • Deployed {formatTimestamp(deploymentInfo.timestamp)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact view for partial initialization or errors
  if (showCompact) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">YogaSwiss Platform</span>
              <Badge className={getStatusColor(health?.isHealthy)}>
                {health?.isHealthy && isInitialized ? 'Ready' : 'Setup Required'}
              </Badge>
            </div>
            
            {deploymentInfo && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center">
                  <GitBranch className="w-3 h-3 mr-1" />
                  {deploymentInfo.version}
                </span>
                <span>{formatTimestamp(deploymentInfo.timestamp)}</span>
              </div>
            )}
            
            <Progress value={initializationProgress} className="w-full" />
            <div className="text-xs text-muted-foreground">
              {initializationProgress}% system ready • Swiss Studio Platform
            </div>

            {!isInitialized && (
              <Button 
                size="sm" 
                variant="outline"
                className="w-full text-xs"
                onClick={handleSetupClick}
              >
                Setup Database
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full view for setup required
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">YogaSwiss Platform Status</h2>
          <p className="text-sm text-muted-foreground">
            Swiss yoga studio management platform initialization
          </p>
        </div>
        <Button variant="outline" onClick={checkDatabaseStatus} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      {/* Latest Deployment Info */}
      {deploymentInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Latest Deployment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <GitBranch className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{deploymentInfo.version}</span>
                  <Badge className="bg-green-100 text-green-800">
                    {deploymentInfo.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Deployed: {formatTimestamp(deploymentInfo.timestamp)}
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Database Schema:</span>
                  <span>{deploymentInfo.components.schema}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Edge Functions:</span>
                  <span>{deploymentInfo.components.functions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Authentication:</span>
                  <span>{deploymentInfo.components.auth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage:</span>
                  <span>{deploymentInfo.components.storage}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Required Alert */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-yellow-800">YogaSwiss Database Setup Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your Swiss studio management database needs to be initialized to access real data.
              </p>
              {error && (
                <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                  <strong>Issue:</strong> {error}
                </div>
              )}
              <div className="mt-3">
                <code className="bg-yellow-100 px-2 py-1 rounded text-xs text-yellow-800 font-mono">
                  ./cli-init.sh
                </code>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button 
                size="sm" 
                variant="outline"
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                onClick={handleSetupClick}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Setup Guide
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                onClick={checkDatabaseStatus}
              >
                Recheck
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Initialization Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Platform Readiness</span>
                <span>{initializationProgress}%</span>
              </div>
              <Progress value={initializationProgress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-1">
                {initializationProgress === 100 
                  ? 'YogaSwiss platform is fully operational' 
                  : 'Completing Swiss studio platform initialization...'
                }
              </p>
            </div>

            {/* Component Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="text-center p-3 border rounded-lg">
                {getStatusIcon(health?.database?.hasRequiredTables || isInitialized)}
                <p className="text-xs mt-1">Database</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                {getStatusIcon(health?.auth?.isConfigured)}
                <p className="text-xs mt-1">Authentication</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                {getStatusIcon(health?.functions?.isDeployed)}
                <p className="text-xs mt-1">API Functions</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                {getStatusIcon(health?.storage?.isConfigured)}
                <p className="text-xs mt-1">Storage</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Swiss Platform Footer */}
      <div className="text-center text-xs text-muted-foreground">
        🇨🇭 YogaSwiss Platform • Swiss-first yoga studio management • Built for Swiss quality standards
      </div>
    </div>
  );
}

// Simplified hook version for use in components
export function useDatabaseStatus() {
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { error } = await supabase
          .from('orgs')
          .select('id')
          .limit(1);

        setIsInitialized(!error);
      } catch {
        setIsInitialized(false);
      }
    };

    checkStatus();
  }, []);

  return isInitialized;
}