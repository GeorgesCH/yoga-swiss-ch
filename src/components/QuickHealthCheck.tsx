import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Activity, Database, RefreshCw } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface HealthStatus {
  database: boolean;
  responseTime: number;
  timestamp: string;
  error?: string;
}

export function QuickHealthCheck() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const runHealthCheck = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      console.log('🔍 Running quick health check...');
      
      // Test KV store table (guaranteed to exist)
      const { data, error } = await supabase
        .from('kv_store_f0b2daa4')
        .select('key')
        .limit(1);
      
      const responseTime = Date.now() - startTime;
      const connected = !error;
      
      if (connected) {
        console.log('✅ Database connection successful');
      } else {
        console.error('❌ Database connection failed:', error);
      }
      
      setStatus({
        database: connected,
        responseTime,
        timestamp: new Date().toISOString(),
        error: error?.message
      });
      
    } catch (err) {
      const responseTime = Date.now() - startTime;
      console.error('❌ Health check failed:', err);
      
      setStatus({
        database: false,
        responseTime,
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Quick Health Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runHealthCheck}
          disabled={loading}
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Checking...' : 'Test Connection'}
        </Button>
        
        {status && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database:</span>
              <Badge variant={status.database ? 'default' : 'destructive'} className="flex items-center gap-1">
                {status.database ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {status.database ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Response Time:</span>
              <span className="text-sm font-medium">{status.responseTime}ms</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Checked:</span>
              <span className="text-sm font-medium">
                {new Date(status.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            {status.error && (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Error:</strong> {status.error}
                </AlertDescription>
              </Alert>
            )}
            
            {!status.database && (
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Troubleshooting:</strong>
                  <ul className="list-disc list-inside mt-1 text-xs">
                    <li>Check internet connection</li>
                    <li>Verify Supabase project status</li>
                    <li>Ensure API keys are correct</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}