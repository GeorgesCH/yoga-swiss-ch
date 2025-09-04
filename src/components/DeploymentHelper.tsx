import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Terminal, 
  Database, 
  Cloud, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface DeploymentHelperProps {
  onClose: () => void;
}

export function DeploymentHelper({ onClose }: DeploymentHelperProps) {
  const [checking, setChecking] = useState(false);
  const [edgeFunctionStatus, setEdgeFunctionStatus] = useState<'unknown' | 'deployed' | 'not-deployed'>('unknown');
  const [databaseStatus, setDatabaseStatus] = useState<'unknown' | 'ready' | 'not-ready'>('unknown');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const checkDeploymentStatus = async () => {
    setChecking(true);
    
    try {
      // Check if Edge Function is deployed
      const healthResponse = await fetch('https://okvreiyhuxjosgauqaqq.supabase.co/functions/v1/make-server-f0b2daa4/health');
      if (healthResponse.ok) {
        setEdgeFunctionStatus('deployed');
      } else {
        setEdgeFunctionStatus('not-deployed');
      }
    } catch (error) {
      setEdgeFunctionStatus('not-deployed');
    }
    
    // For database status, we'd need to check table existence
    // For now, we'll assume it needs setup
    setDatabaseStatus('not-ready');
    
    setChecking(false);
  };

  const deploymentSteps = [
    {
      title: '1. Install Supabase CLI',
      description: 'Make sure you have the Supabase CLI installed',
      commands: [
        'npm install -g supabase',
        'supabase --version'
      ],
      status: 'pending'
    },
    {
      title: '2. Login to Supabase',
      description: 'Authenticate with your Supabase account',
      commands: [
        'supabase login'
      ],
      status: 'pending'
    },
    {
      title: '3. Link to your project',
      description: 'Connect to your Supabase project',
      commands: [
        'supabase link --project-ref okvreiyhuxjosgauqaqq'
      ],
      status: 'pending'
    },
    {
      title: '4. Deploy Edge Function',
      description: 'Deploy the backend API to Supabase',
      commands: [
        'supabase functions deploy make-server-f0b2daa4'
      ],
      status: edgeFunctionStatus === 'deployed' ? 'completed' : 'pending'
    },
    {
      title: '5. Run Database Migrations',
      description: 'Set up the database schema',
      commands: [
        'supabase db push'
      ],
      status: databaseStatus === 'ready' ? 'completed' : 'pending'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-6 h-6 text-blue-600" />
              <CardTitle>Backend Deployment Guide</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
          <p className="text-muted-foreground">
            Follow these steps to deploy your YogaSwiss backend to Supabase and connect live data.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5" />
                    <span className="font-medium">Edge Function</span>
                  </div>
                  <Badge variant={edgeFunctionStatus === 'deployed' ? 'default' : 'secondary'}>
                    {edgeFunctionStatus === 'deployed' ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Deployed
                      </>
                    ) : edgeFunctionStatus === 'not-deployed' ? (
                      <>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Not Deployed
                      </>
                    ) : (
                      'Unknown'
                    )}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    <span className="font-medium">Database Schema</span>
                  </div>
                  <Badge variant={databaseStatus === 'ready' ? 'default' : 'secondary'}>
                    {databaseStatus === 'ready' ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ready
                      </>
                    ) : databaseStatus === 'not-ready' ? (
                      <>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Setup Needed
                      </>
                    ) : (
                      'Unknown'
                    )}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={checkDeploymentStatus} 
              disabled={checking}
              className="flex items-center gap-2"
            >
              {checking ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Check Status
            </Button>
          </div>

          {/* Deployment Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Deployment Steps</h3>
            
            {deploymentSteps.map((step, index) => (
              <Card key={index} className={step.status === 'completed' ? 'border-green-200 bg-green-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                      <h4 className="font-medium">{step.title}</h4>
                    </div>
                    <Badge variant={step.status === 'completed' ? 'default' : 'secondary'}>
                      {step.status === 'completed' ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                  
                  <div className="space-y-2">
                    {step.commands.map((command, cmdIndex) => (
                      <div key={cmdIndex} className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded p-2 font-mono text-sm">
                          {command}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(command)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Resources */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Helpful Resources
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <a href="https://supabase.com/docs/guides/cli" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase CLI Documentation</a></li>
                <li>• <a href="https://supabase.com/docs/guides/functions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Edge Functions Guide</a></li>
                <li>• <a href="https://supabase.com/docs/guides/database/migrations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Database Migrations</a></li>
              </ul>
            </CardContent>
          </Card>

          {/* CORS Fix Note */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">CORS Issue Fixed!</h4>
                <p className="text-sm text-green-700">
                  The Edge Function has been updated to allow the required X-Org-ID header. After deploying the updated function, the CORS errors should be resolved.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Development Note</h4>
                <p className="text-sm text-blue-700">
                  Until the backend is deployed, the application will use demo data for development purposes. 
                  All functionality will work normally, but data won't persist between sessions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}