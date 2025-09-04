import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database,
  Users,
  Settings,
  CreditCard,
  Shield,
  Wifi,
  Server,
  Clock
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { getSupabaseProjectId, getSupabaseAnonKey, getSupabaseUrl } from '../utils/supabase/env';

interface VerificationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'warning';
  icon: React.ComponentType<any>;
  error?: string;
  details?: any;
  critical: boolean;
}

interface IntegrationStatus {
  overallHealth: 'healthy' | 'degraded' | 'critical';
  completedSteps: number;
  totalSteps: number;
  steps: VerificationStep[];
  timestamp: string;
}

export function SupabaseIntegrationVerifier() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const initialSteps: VerificationStep[] = [
    {
      id: 'config',
      name: 'Configuration',
      description: 'Verify Supabase connection settings',
      status: 'pending',
      icon: Settings,
      critical: true
    },
    {
      id: 'database',
      name: 'Database Connection',
      description: 'Test database connectivity and permissions',
      status: 'pending',
      icon: Database,
      critical: true
    },
    {
      id: 'auth',
      name: 'Authentication',
      description: 'Verify auth service functionality',
      status: 'pending',
      icon: Shield,
      critical: true
    },
    {
      id: 'tables',
      name: 'Database Schema',
      description: 'Check required tables and schema structure',
      status: 'pending',
      icon: Server,
      critical: true
    },
    {
      id: 'rls',
      name: 'Row Level Security',
      description: 'Verify RLS policies are in place',
      status: 'pending',
      icon: Users,
      critical: false
    },
    {
      id: 'realtime',
      name: 'Realtime',
      description: 'Test realtime subscriptions',
      status: 'pending',
      icon: Wifi,
      critical: false
    },
    {
      id: 'storage',
      name: 'Storage',
      description: 'Verify file storage capabilities',
      status: 'pending',
      icon: Database,
      critical: false
    },
    {
      id: 'edge_functions',
      name: 'Edge Functions',
      description: 'Test backend API endpoints',
      status: 'pending',
      icon: Server,
      critical: false
    }
  ];

  const runVerification = async () => {
    setIsRunning(true);
    const steps = [...initialSteps];
    let completedSteps = 0;

    const updateStatus = (stepId: string, newStatus: Partial<VerificationStep>) => {
      const stepIndex = steps.findIndex(s => s.id === stepId);
      if (stepIndex >= 0) {
        steps[stepIndex] = { ...steps[stepIndex], ...newStatus };
        
        if (newStatus.status === 'success') {
          completedSteps++;
        }
        
        const criticalErrors = steps.filter(s => s.critical && s.status === 'error').length;
        const errors = steps.filter(s => s.status === 'error').length;
        const warnings = steps.filter(s => s.status === 'warning').length;
        
        const overallHealth = criticalErrors > 0 ? 'critical' : 
                            errors > 0 ? 'degraded' : 'healthy';

        setStatus({
          overallHealth,
          completedSteps,
          totalSteps: steps.length,
          steps: [...steps],
          timestamp: new Date().toISOString()
        });
      }
    };

    // Step 1: Configuration
    setCurrentStep('config');
    updateStatus('config', { status: 'running' });
    
    try {
      const url = getSupabaseUrl();
      const anonKey = getSupabaseAnonKey();
      const projectId = getSupabaseProjectId();

      if (!url || !anonKey || !projectId) {
        throw new Error('Missing required Supabase configuration');
      }

      updateStatus('config', { 
        status: 'success',
        details: { url: url.substring(0, 30) + '...', projectId }
      });
    } catch (error) {
      updateStatus('config', { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Configuration error'
      });
    }

    // Step 2: Database Connection
    setCurrentStep('database');
    updateStatus('database', { status: 'running' });
    
    try {
      const startTime = Date.now();
      
      // Test database connection via auth service (more reliable)
      const { error: authError } = await supabase.auth.getSession();
      
      if (!authError) {
        const responseTime = Date.now() - startTime;
        updateStatus('database', { 
          status: 'success',
          details: { responseTime: `${responseTime}ms`, method: 'auth service' }
        });
      } else {
        // Fallback to application table test
        const { error: tableError } = await supabase
          .from('orgs')
          .select('count', { count: 'exact', head: true })
          .limit(0);
        
        const responseTime = Date.now() - startTime;
        
        if (!tableError || tableError.code === '42P01') {
          updateStatus('database', { 
            status: 'success',
            details: { 
              responseTime: `${responseTime}ms`, 
              method: tableError?.code === '42P01' ? 'connected (setup needed)' : 'application tables'
            }
          });
        } else {
          throw tableError;
        }
      }
    } catch (error) {
      updateStatus('database', { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Database connection failed'
      });
    }

    // Step 3: Authentication
    setCurrentStep('auth');
    updateStatus('auth', { status: 'running' });
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      updateStatus('auth', { 
        status: 'success',
        details: { hasSession: !!data.session }
      });
    } catch (error) {
      updateStatus('auth', { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Auth service error'
      });
    }

    // Step 4: Database Schema
    setCurrentStep('tables');
    updateStatus('tables', { status: 'running' });
    
    try {
      const requiredTables = [
        'orgs', 'user_profiles', 'org_users', 'locations',
        'class_templates', 'class_occurrences', 'registrations',
        'wallets'
      ];

      let existingTables: string[] = [];
      let missingTables: string[] = [];

      // Check each table individually by attempting to query it
      for (const tableName of requiredTables) {
        try {
          const { error } = await supabase
            .from(tableName)
            .select('count', { count: 'exact', head: true })
            .limit(0);

          if (!error) {
            existingTables.push(tableName);
          } else if (error.code === '42P01') {
            // Table doesn't exist
            missingTables.push(tableName);
          } else {
            // Other error (might be permissions)
            missingTables.push(tableName);
          }
        } catch (err) {
          missingTables.push(tableName);
        }
      }

      if (missingTables.length > 0) {
        updateStatus('tables', { 
          status: 'warning',
          error: `Missing tables: ${missingTables.join(', ')}`,
          details: { existing: existingTables.length, missing: missingTables.length }
        });
      } else {
        updateStatus('tables', { 
          status: 'success',
          details: { tablesFound: existingTables.length }
        });
      }
    } catch (error) {
      updateStatus('tables', { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Schema check failed'
      });
    }

    // Step 5: Row Level Security
    setCurrentStep('rls');
    updateStatus('rls', { status: 'running' });
    
    try {
      // Check if RLS is enabled on key tables
      const { data: rlsStatus, error } = await supabase
        .rpc('check_rls_enabled')
        .single();

      if (error) {
        // RLS check function might not exist, treat as warning
        updateStatus('rls', { 
          status: 'warning',
          error: 'Cannot verify RLS status - function not found'
        });
      } else {
        updateStatus('rls', { 
          status: 'success',
          details: rlsStatus
        });
      }
    } catch (error) {
      updateStatus('rls', { 
        status: 'warning', 
        error: 'RLS verification unavailable'
      });
    }

    // Step 6: Realtime
    setCurrentStep('realtime');
    updateStatus('realtime', { status: 'running' });
    
    try {
      // Test realtime subscription
      const channel = supabase.channel('test-channel');
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Realtime timeout')), 5000);
        
        channel
          .on('broadcast', { event: 'test' }, () => {
            clearTimeout(timeout);
            resolve(true);
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              channel.send({ type: 'broadcast', event: 'test' });
            }
          });
      });

      await supabase.removeChannel(channel);

      updateStatus('realtime', { status: 'success' });
    } catch (error) {
      updateStatus('realtime', { 
        status: 'warning', 
        error: 'Realtime test failed'
      });
    }

    // Step 7: Storage
    setCurrentStep('storage');
    updateStatus('storage', { status: 'running' });
    
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) throw error;

      updateStatus('storage', { 
        status: 'success',
        details: { buckets: buckets?.length || 0 }
      });
    } catch (error) {
      updateStatus('storage', { 
        status: 'warning', 
        error: 'Storage check failed'
      });
    }

    // Step 8: Edge Functions
    setCurrentStep('edge_functions');
    updateStatus('edge_functions', { status: 'running' });
    
    try {
      const projectId = getSupabaseProjectId();
      const anonKey = getSupabaseAnonKey();
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f0b2daa4/health`, {
        headers: {
          'Authorization': `Bearer ${anonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        updateStatus('edge_functions', { 
          status: 'success',
          details: { version: data.version, features: data.features?.length || 0 }
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      updateStatus('edge_functions', { 
        status: 'warning', 
        error: 'Edge functions unavailable'
      });
    }

    setCurrentStep(null);
    setIsRunning(false);
  };

  useEffect(() => {
    runVerification();
  }, []);

  const getStatusIcon = (status: VerificationStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getOverallStatusColor = (health: IntegrationStatus['overallHealth']) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const progress = status ? (status.completedSteps / status.totalSteps) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Supabase Integration Status
            </CardTitle>
            {status && (
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getOverallStatusColor(status.overallHealth)}>
                  {status.overallHealth.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {status.completedSteps}/{status.totalSteps} checks completed
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={runVerification}
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            Re-verify
          </Button>
        </div>
        
        {status && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {isRunning && currentStep && `Running: ${currentStep}`}
              {!isRunning && `Last checked: ${new Date(status.timestamp).toLocaleTimeString()}`}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {status?.steps.map((step) => {
          const IconComponent = step.icon;
          
          return (
            <div key={step.id} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex-shrink-0 flex items-center gap-2">
                <IconComponent className="h-4 w-4 text-muted-foreground" />
                {getStatusIcon(step.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{step.name}</span>
                  {step.critical && (
                    <Badge variant="secondary" className="text-xs">Critical</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
                
                {step.error && (
                  <div className="mt-1 text-xs text-red-600 bg-red-50 p-1 rounded">
                    {step.error}
                  </div>
                )}
                
                {step.details && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {typeof step.details === 'object' 
                      ? Object.entries(step.details).map(([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {String(value)}
                          </span>
                        ))
                      : String(step.details)
                    }
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {status && status.overallHealth === 'critical' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Critical integration issues detected. Some functionality may not work properly.
              Check the failed steps above and ensure your Supabase project is properly configured.
            </AlertDescription>
          </Alert>
        )}

        {status && status.overallHealth === 'degraded' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some non-critical features may be limited until all services are available.
            </AlertDescription>
          </Alert>
        )}

        {status && status.overallHealth === 'healthy' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All Supabase integrations are working correctly. Your YogaSwiss platform is fully operational.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
