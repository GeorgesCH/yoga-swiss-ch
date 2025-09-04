import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Database,
  Shield,
  Code,
  Activity,
  Settings
} from 'lucide-react';
import { verifySupabaseSetup } from '../utils/supabase/setup-verification';
import { supabase } from '../utils/supabase/client';
import { getSupabaseProjectId, getSupabaseAnonKey, getSupabaseUrl } from '../utils/supabase/env';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  duration?: number;
}

export function SupabaseIntegrationTest() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState('quick');

  const runQuickTests = async () => {
    setRunning(true);
    const testResults: TestResult[] = [];

    // Test 1: Configuration
    const startTime = Date.now();
    try {
      const url = getSupabaseUrl();
      const anonKey = getSupabaseAnonKey();
      const projectId = getSupabaseProjectId();

      if (url && anonKey && projectId) {
        testResults.push({
          name: 'Configuration Check',
          status: 'success',
          message: 'All environment variables are configured',
          duration: Date.now() - startTime
        });
      } else {
        testResults.push({
          name: 'Configuration Check',
          status: 'error',
          message: 'Missing required environment variables',
          duration: Date.now() - startTime
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Configuration Check',
        status: 'error',
        message: 'Configuration check failed',
        details: error,
        duration: Date.now() - startTime
      });
    }

    // Test 2: Database Connection
    const dbTestStart = Date.now();
    try {
      // Test via auth service first (more reliable)
      const { error: authError } = await supabase.auth.getSession();
      
      if (!authError) {
        testResults.push({
          name: 'Database Connection',
          status: 'success',
          message: 'Database connection successful via auth service',
          duration: Date.now() - dbTestStart
        });
      } else {
        // Fallback to application table test
        const { error: tableError } = await supabase
          .from('orgs')
          .select('count', { count: 'exact', head: true })
          .limit(0);

        if (!tableError || tableError.code === '42P01') {
          testResults.push({
            name: 'Database Connection',
            status: 'success',
            message: tableError?.code === '42P01' ? 'Database connected (tables need setup)' : 'Database connection successful',
            duration: Date.now() - dbTestStart
          });
        } else {
          testResults.push({
            name: 'Database Connection',
            status: 'error',
            message: `Database connection failed: ${tableError.message}`,
            duration: Date.now() - dbTestStart
          });
        }
      }
    } catch (error) {
      testResults.push({
        name: 'Database Connection',
        status: 'error',
        message: 'Database connection test failed',
        details: error,
        duration: Date.now() - dbTestStart
      });
    }

    // Test 3: Authentication Service
    const authTestStart = Date.now();
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        testResults.push({
          name: 'Authentication Service',
          status: 'warning',
          message: `Auth service issue: ${error.message}`,
          duration: Date.now() - authTestStart
        });
      } else {
        testResults.push({
          name: 'Authentication Service',
          status: 'success',
          message: 'Authentication service is accessible',
          duration: Date.now() - authTestStart
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Authentication Service',
        status: 'error',
        message: 'Authentication service test failed',
        details: error,
        duration: Date.now() - authTestStart
      });
    }

    // Test 4: Edge Functions
    const functionsTestStart = Date.now();
    try {
      const projectId = getSupabaseProjectId();
      const anonKey = getSupabaseAnonKey();
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f0b2daa4/health`, {
        headers: {
          'Authorization': `Bearer ${anonKey}`
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        testResults.push({
          name: 'Edge Functions',
          status: 'success',
          message: 'Edge functions are accessible',
          details: data,
          duration: Date.now() - functionsTestStart
        });
      } else {
        testResults.push({
          name: 'Edge Functions',
          status: 'warning',
          message: `Edge functions returned HTTP ${response.status}`,
          duration: Date.now() - functionsTestStart
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Edge Functions',
        status: 'warning',
        message: 'Edge functions are not available',
        details: error,
        duration: Date.now() - functionsTestStart
      });
    }

    setResults(testResults);
    setRunning(false);
  };

  const runComprehensiveTests = async () => {
    setRunning(true);
    
    try {
      const setupResult = await verifySupabaseSetup();
      
      const testResults: TestResult[] = setupResult.steps.map(step => ({
        name: step.name,
        status: step.status === 'success' ? 'success' : 
                step.status === 'error' ? 'error' : 'warning',
        message: step.error || 'Test completed successfully',
        details: step
      }));

      setResults(testResults);
    } catch (error) {
      setResults([{
        name: 'Comprehensive Test Suite',
        status: 'error',
        message: 'Failed to run comprehensive tests',
        details: error
      }]);
    }
    
    setRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <XCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Supabase Integration Test
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick">Quick Test</TabsTrigger>
            <TabsTrigger value="comprehensive">Comprehensive</TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  onClick={runQuickTests}
                  disabled={running}
                  className="flex-1"
                >
                  {running ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Quick Test
                    </>
                  )}
                </Button>
              </div>

              {results.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600">{successCount} passed</span>
                    {warningCount > 0 && <span className="text-yellow-600">{warningCount} warnings</span>}
                    {errorCount > 0 && <span className="text-red-600">{errorCount} failed</span>}
                  </div>

                  {results.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{result.name}</span>
                          <Badge className={`${getStatusColor(result.status)} text-xs`}>
                            {result.status}
                          </Badge>
                          {result.duration && (
                            <span className="text-xs text-muted-foreground">
                              {result.duration}ms
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comprehensive" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  onClick={runComprehensiveTests}
                  disabled={running}
                  className="flex-1"
                >
                  {running ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running Comprehensive Tests...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Run Full Verification
                    </>
                  )}
                </Button>
              </div>

              {results.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600">{successCount} passed</span>
                    {warningCount > 0 && <span className="text-yellow-600">{warningCount} warnings</span>}
                    {errorCount > 0 && <span className="text-red-600">{errorCount} failed</span>}
                  </div>

                  {results.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{result.name}</span>
                          <Badge className={`${getStatusColor(result.status)} text-xs`}>
                            {result.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.message}
                        </div>
                        {result.details && typeof result.details === 'object' && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer">Show details</summary>
                            <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {results.length > 0 && (
          <Alert className="mt-4">
            <Database className="h-4 w-4" />
            <AlertDescription>
              {errorCount > 0 ? (
                `Found ${errorCount} critical issues that may affect functionality.`
              ) : warningCount > 0 ? (
                `Found ${warningCount} warnings. Some features may have limited functionality.`
              ) : (
                'All tests passed! Your Supabase integration is working correctly.'
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}