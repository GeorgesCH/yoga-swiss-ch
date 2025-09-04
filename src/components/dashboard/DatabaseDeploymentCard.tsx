import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Database, CheckCircle2, XCircle, Clock, AlertTriangle, 
  RefreshCw, Settings, GitBranch, TrendingUp, ExternalLink
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

interface DatabaseDeploymentCardProps {
  onNavigateToSettings?: () => void;
}

export function DatabaseDeploymentCard({ onNavigateToSettings }: DatabaseDeploymentCardProps) {
  const { session } = useAuth();
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeploymentStatus();
  }, []);

  const loadDeploymentStatus = async () => {
    setLoading(true);
    try {
      // Simulate API call to get deployment status
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock deployment status
      setDeploymentStatus({
        version: 'v2.1.0',
        timestamp: '2024-01-15T10:30:00Z',
        status: 'completed',
        components: {
          database: 'healthy',
          functions: 'deployed',
          auth: 'configured',
          storage: 'ready'
        },
        progress: 100
      });

      setSystemHealth({
        overall: 'healthy',
        uptime: '99.9%',
        responseTime: '120ms',
        lastCheck: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to load deployment status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'healthy':
      case 'deployed':
      case 'configured':
      case 'ready':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'running':
      case 'deploying':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'healthy':
      case 'deployed':
      case 'configured':
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'running':
      case 'deploying':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-CH', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Platform Status</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={loadDeploymentStatus}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-8 bg-muted rounded animate-pulse" />
          </div>
        ) : (
          <>
            {/* Latest Deployment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">YogaSwiss {deploymentStatus?.version}</span>
                </div>
                <Badge className={getStatusColor(deploymentStatus?.status)}>
                  {deploymentStatus?.status}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Deployed: {deploymentStatus?.timestamp ? formatTimestamp(deploymentStatus.timestamp) : 'Unknown'}
              </p>
            </div>

            {/* System Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>System Health</span>
                <span>{deploymentStatus?.progress || 0}%</span>
              </div>
              <Progress value={deploymentStatus?.progress || 0} className="h-2" />
            </div>

            {/* Component Status */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2 text-xs">
                {getStatusIcon(deploymentStatus?.components?.database)}
                <span>Database</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                {getStatusIcon(deploymentStatus?.components?.functions)}
                <span>Functions</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                {getStatusIcon(deploymentStatus?.components?.auth)}
                <span>Auth</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                {getStatusIcon(deploymentStatus?.components?.storage)}
                <span>Storage</span>
              </div>
            </div>

            {/* System Metrics */}
            {systemHealth && (
              <div className="pt-2 border-t space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className="font-medium">{systemHealth.uptime}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="font-medium">{systemHealth.responseTime}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={onNavigateToSettings}
              >
                <Settings className="w-3 h-3 mr-1" />
                Manage
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('/settings?tab=database-deployment', '_blank')}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>

            {/* Swiss Quality Indicator */}
            <div className="text-center">
              <div className="inline-flex items-center text-xs text-muted-foreground">
                🇨🇭 Swiss Quality Platform
                <TrendingUp className="w-3 h-3 ml-1" />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}