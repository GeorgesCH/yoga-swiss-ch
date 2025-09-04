import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle, Loader2, Wifi, AlertTriangle } from 'lucide-react';
import { checkApiHealth, type ApiHealthStatus } from '../utils/supabase/api-health';

export function ApiConnectionTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<ApiHealthStatus | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const status = await checkApiHealth();
      setHealthStatus(status);
    } catch (error) {
      setHealthStatus({
        isHealthy: false,
        endpoint: 'Unknown',
        error: 'Failed to test connection',
        responseTime: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (healthStatus?.isHealthy) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (healthStatus && !healthStatus.isHealthy) return <XCircle className="w-4 h-4 text-red-600" />;
    return <Wifi className="w-4 h-4 text-gray-500" />;
  };

  const getStatusBadge = () => {
    if (isLoading) return <Badge variant="secondary">Testing...</Badge>;
    if (healthStatus?.isHealthy) return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
    if (healthStatus && !healthStatus.isHealthy) return <Badge className="bg-red-100 text-red-800">Offline</Badge>;
    return <Badge variant="outline">Unknown</Badge>;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            {getStatusIcon()}
            API Connection
          </span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {healthStatus && (
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Endpoint:</span>
              <span className="font-mono text-xs">{healthStatus.endpoint}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Response Time:</span>
              <span>{healthStatus.responseTime}ms</span>
            </div>
            {healthStatus.error && (
              <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-red-700">{healthStatus.error}</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        <Button 
          onClick={testConnection} 
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Wifi className="w-3 h-3 mr-2" />
              Test Connection
            </>
          )}
        </Button>

        {!healthStatus?.isHealthy && healthStatus && (
          <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded border border-yellow-200">
            <strong>Note:</strong> Backend is offline. Features are disabled until the connection is restored.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
