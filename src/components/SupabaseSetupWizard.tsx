import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Database,
  Play,
  Settings,
  Zap,
  FileText,
  Terminal
} from 'lucide-react';
import { verifySupabaseSetup, type SetupResult } from '../utils/supabase/setup-verification';
import { getSupabaseProjectId, getSupabaseAnonKey, getSupabaseUrl } from '../utils/supabase/env';

export function SupabaseSetupWizard() {
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const runSetup = async () => {
    setIsRunning(true);
    try {
      const result = await verifySupabaseSetup();
      setSetupResult(result);
      if (result.success) {
        setActiveTab('success');
      } else {
        setActiveTab('issues');
      }
    } catch (error) {
      console.error('Setup verification failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStepIcon = (status: string) => {
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
        return <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const ConfigurationOverview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Current Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Supabase URL</div>
              <div className="text-xs text-muted-foreground break-all">
                {getSupabaseUrl()}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Project ID</div>
              <div className="text-xs text-muted-foreground">
                {getSupabaseProjectId()}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Anonymous Key</div>
              <div className="text-xs text-muted-foreground">
                {getSupabaseAnonKey() ? '••••••••••••••••••••••••••••••••' : 'Not configured'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Environment</div>
              <div className="text-xs text-muted-foreground">
                {process.env.NODE_ENV || 'development'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Run a comprehensive verification of your Supabase integration to ensure all services are working correctly.
            </div>
            
            <Button 
              onClick={runSetup} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Setup Verification...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Setup Verification
                </>
              )}
            </Button>

            {setupResult && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Status</span>
                  <Badge variant={setupResult.success ? 'default' : 'destructive'}>
                    {setupResult.success ? 'Success' : 'Issues Found'}
                  </Badge>
                </div>
                <Progress 
                  value={(setupResult.summary.completed / setupResult.summary.total) * 100} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {setupResult.summary.completed}/{setupResult.summary.total} checks completed
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SetupSteps = () => (
    <div className="space-y-4">
      {setupResult?.steps.map((step, index) => (
        <Card key={step.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getStepIcon(step.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{step.name}</h4>
                  {step.required && (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                
                {step.error && (
                  <Alert className="mb-2">
                    <AlertTriangle className="h-3 w-3" />
                    <AlertDescription className="text-xs">
                      {step.error}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      step.status === 'success' ? 'default' : 
                      step.status === 'error' ? 'destructive' : 
                      step.status === 'warning' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                  </Badge>
                  {step.status === 'running' && (
                    <span className="text-xs text-muted-foreground">In progress...</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const TroubleshootingGuide = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Common Issues
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-medium text-sm">Database Connection Failed</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Check your Supabase URL and anonymous key in the environment variables.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-medium text-sm">Missing Tables</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Run the database migrations through the Supabase SQL editor to create required tables.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-sm">Edge Functions Unavailable</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Deploy the Edge Functions from the /supabase/functions/ directory.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Quick Fixes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded border">
              <div className="text-sm font-medium mb-1">1. Verify Environment Variables</div>
              <div className="text-xs text-muted-foreground">
                Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are properly set
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border">
              <div className="text-sm font-medium mb-1">2. Check Network Connectivity</div>
              <div className="text-xs text-muted-foreground">
                Verify you can access your Supabase project dashboard
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border">
              <div className="text-sm font-medium mb-1">3. Review Browser Console</div>
              <div className="text-xs text-muted-foreground">
                Check for CORS errors or authentication issues in browser dev tools
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Supabase Setup Wizard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="steps">Setup Steps</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ConfigurationOverview />
          </TabsContent>

          <TabsContent value="steps" className="mt-6">
            {setupResult ? (
              <SetupSteps />
            ) : (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Run the setup verification to see detailed steps
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="issues" className="mt-6">
            {setupResult && (setupResult.errors.length > 0 || setupResult.warnings.length > 0) ? (
              <div className="space-y-4">
                {setupResult.errors.length > 0 && (
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-2">Errors ({setupResult.errors.length})</div>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {setupResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {setupResult.warnings.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-2">Warnings ({setupResult.warnings.length})</div>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {setupResult.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : setupResult?.success ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  No issues found. Your Supabase integration is working perfectly!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Run the setup verification to check for issues
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="help" className="mt-6">
            <TroubleshootingGuide />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}