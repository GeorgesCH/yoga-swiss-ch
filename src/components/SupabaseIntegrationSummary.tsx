import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database,
  Activity,
  Shield,
  Wifi,
  Server,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { getSupabaseHealth } from '../utils/supabase/setup-verification';
import { getSupabaseProjectId, getSupabaseUrl } from '../utils/supabase/env';

interface IntegrationSummaryProps {
  showActions?: boolean;
  compact?: boolean;
}

export function SupabaseIntegrationSummary({ showActions = true, compact = false }: IntegrationSummaryProps) {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    checkHealth();
    
    // Refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const healthStatus = await getSupabaseHealth();
      setHealth(healthStatus);
      setLastChecked(new Date());
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
    if (!health) return 'unknown';
    
    const { connected, authenticated, schemaReady, functionsReady } = health;
    
    if (!connected) return 'critical';
    if (!authenticated || !schemaReady) return 'degraded';
    if (!functionsReady) return 'partial';
    
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'partial':
      case 'degraded':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'All Systems Operational';
      case 'partial':
        return 'Limited Functionality';
      case 'degraded':
        return 'Reduced Performance';
      case 'critical':
        return 'Service Unavailable';
      default:
        return 'Status Unknown';
    }
  };

  const services = [
    {
      name: 'Database',
      icon: Database,
      status: health?.connected,
      description: 'PostgreSQL connection'
    },
    {
      name: 'Authentication',
      icon: Shield,
      status: health?.authenticated,
      description: 'Auth service'
    },
    {
      name: 'Schema',
      icon: Server,
      status: health?.schemaReady,
      description: 'Database tables'
    },
    {
      name: 'Edge Functions',
      icon: Wifi,
      status: health?.functionsReady,
      description: 'Backend APIs'
    }
  ];

  const overallStatus = getOverallStatus();

  if (loading) {
    return (
      <Card className={compact ? 'w-full' : ''}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Checking Supabase status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Supabase</span>
            </div>
            <Badge className={getStatusColor(overallStatus)}>
              {getStatusText(overallStatus)}
            </Badge>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {services.map((service) => (
              <div key={service.name} className="flex items-center gap-1">
                {service.status ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-600" />
                )}
                <span className="text-muted-foreground">{service.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Supabase Integration Summary
          </CardTitle>
          <Badge className={getStatusColor(overallStatus)}>
            {getStatusText(overallStatus)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Service Status Grid */}
        <div className="grid grid-cols-2 gap-4">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div key={service.name} className="flex items-center gap-3 p-3 border rounded-lg">
                <IconComponent className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{service.name}</span>
                    {service.status ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{service.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Messages */}
        {overallStatus === 'critical' && (
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Database connection failed. Check your Supabase configuration and network connectivity.
            </AlertDescription>
          </Alert>
        )}

        {overallStatus === 'degraded' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some services are not available. Core functionality may be limited.
            </AlertDescription>
          </Alert>
        )}

        {overallStatus === 'partial' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Backend functions are not available. Using local functionality where possible.
            </AlertDescription>
          </Alert>
        )}

        {overallStatus === 'healthy' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All Supabase services are operational. Your platform is fully functional.
            </AlertDescription>
          </Alert>
        )}

        {/* Project Information */}
        <div className="border-t pt-4">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project ID:</span>
              <span className="font-mono text-xs">{getSupabaseProjectId()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Region:</span>
              <span className="text-xs">Auto-detected</span>
            </div>
            {lastChecked && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Checked:</span>
                <span className="text-xs">{lastChecked.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkHealth}
              disabled={loading}
            >
              <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(getSupabaseUrl().replace('/rest/v1', ''), '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              Dashboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}