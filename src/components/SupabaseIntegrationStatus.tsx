import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database,
  Shield,
  Wifi,
  Server,
  RefreshCw,
  Settings,
  ExternalLink,
  Activity
} from 'lucide-react';
import { getSupabaseHealth } from '../utils/supabase/setup-verification';
import { getSupabaseProjectId, getSupabaseUrl } from '../utils/supabase/env';

interface IntegrationStatusProps {
  className?: string;
  showActions?: boolean;
  showDetails?: boolean;
}

export function SupabaseIntegrationStatus({ 
  className = '', 
  showActions = true, 
  showDetails = true 
}: IntegrationStatusProps) {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    checkHealth();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const healthStatus = await getSupabaseHealth();
      setHealth(healthStatus);
      setLastChecked(new Date());
      console.log('📊 Supabase health check result:', healthStatus);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth({
        connected: false,
        authenticated: false,
        schemaReady: false,
        functionsReady: false
      });
    } finally {
      setLoading(false);
    }
  };

  const getOverallStatus = () => {
    if (!health) return { status: 'unknown', color: 'gray', text: 'Unknown' };
    
    const { connected, authenticated, schemaReady, functionsReady } = health;
    
    if (!connected) {
      return { status: 'critical', color: 'red', text: 'Critical' };
    }
    
    if (!authenticated || !schemaReady) {
      return { status: 'degraded', color: 'yellow', text: 'Degraded' };
    }
    
    if (!functionsReady) {
      return { status: 'partial', color: 'blue', text: 'Partial' };
    }
    
    return { status: 'healthy', color: 'green', text: 'Healthy' };
  };

  const getStatusColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'yellow':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'blue':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'red':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const services = [
    {
      name: 'Database',
      key: 'connected',
      icon: Database,
      description: 'PostgreSQL connection and queries'
    },
    {
      name: 'Authentication',
      key: 'authenticated',
      icon: Shield,
      description: 'User auth and session management'
    },
    {
      name: 'Schema',
      key: 'schemaReady',
      icon: Server,
      description: 'Database tables and structure'
    },
    {
      name: 'Edge Functions',
      key: 'functionsReady',
      icon: Wifi,
      description: 'Backend API endpoints'
    }
  ];

  const overallStatus = getOverallStatus();
  const healthyServices = health ? services.filter(s => health[s.key]).length : 0;
  const totalServices = services.length;
  const healthPercentage = (healthyServices / totalServices) * 100;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Supabase Integration
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColorClasses(overallStatus.color)} text-xs`}>
              {overallStatus.text}
            </Badge>
            
            {loading && (
              <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="mt-2">
          <Progress value={healthPercentage} className="h-1.5" />
          <div className="text-xs text-muted-foreground mt-1">
            {healthyServices}/{totalServices} services operational
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Service Status */}
        {showDetails && (
          <div className="grid grid-cols-2 gap-2">
            {services.map((service) => {
              const IconComponent = service.icon;
              const isHealthy = health?.[service.key] || false;
              
              return (
                <div key={service.key} className="flex items-center gap-2 text-xs">
                  <IconComponent className="h-3 w-3 text-muted-foreground" />
                  <span className="flex-1 truncate">{service.name}</span>
                  {isHealthy ? (
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Status Message */}
        {overallStatus.status === 'critical' && (
          <Alert>
            <XCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Database connection failed. Check your Supabase configuration and network connection.
            </AlertDescription>
          </Alert>
        )}

        {overallStatus.status === 'degraded' && health && !health.schemaReady && (
          <Alert>
            <AlertTriangle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              <strong>Database tables missing.</strong> Go to Settings → Database Setup to initialize your schema.
            </AlertDescription>
          </Alert>
        )}

        {overallStatus.status === 'degraded' && health && health.schemaReady && (
          <Alert>
            <AlertTriangle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Some services unavailable. Core functionality may be limited.
            </AlertDescription>
          </Alert>
        )}

        {overallStatus.status === 'partial' && (
          <Alert>
            <AlertTriangle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Backend functions unavailable. Using local functionality.
            </AlertDescription>
          </Alert>
        )}

        {overallStatus.status === 'healthy' && showDetails && (
          <Alert>
            <CheckCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              All systems operational. Platform fully functional.
            </AlertDescription>
          </Alert>
        )}

        {/* Project Info */}
        {showDetails && (
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <div className="flex justify-between">
              <span>Project:</span>
              <span className="font-mono">{getSupabaseProjectId()}</span>
            </div>
            {lastChecked && (
              <div className="flex justify-between">
                <span>Last check:</span>
                <span>{lastChecked.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkHealth}
              disabled={loading}
              className="h-7 text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(getSupabaseUrl().replace('/rest/v1', ''), '_blank')}
              className="h-7 text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Dashboard
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // This would navigate to settings/system-health
                console.log('Navigate to system health settings');
              }}
              className="h-7 text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}