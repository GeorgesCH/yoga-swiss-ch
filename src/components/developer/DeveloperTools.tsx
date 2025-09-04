import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Code2, 
  Database, 
  Settings, 
  Bug, 
  TestTube,
  Activity,
  FileText,
  AlertCircle
} from 'lucide-react';
import { DemoSeederButton } from '../DemoSeederButton';


export function DeveloperTools() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Developer Tools</h1>
          <p className="text-muted-foreground">
            Development utilities and system management tools for YogaSwiss
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Code2 className="h-3 w-3 mr-1" />
            Development Mode
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            🇨🇭 Swiss Ready
          </Badge>
        </div>
      </div>

      {/* Developer Tools Tabs */}
      <Tabs defaultValue="demo-data" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo-data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Demo Data
          </TabsTrigger>
          <TabsTrigger value="system-info" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Info
          </TabsTrigger>
          <TabsTrigger value="debug-tools" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Debug Tools
          </TabsTrigger>
        </TabsList>

        {/* Demo Data Management */}
        <TabsContent value="demo-data" className="space-y-6">
          <DemoSeederButton />
        </TabsContent>



        {/* System Information */}
        <TabsContent value="system-info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment:</span>
                  <Badge variant="outline">
                    {import.meta.env.MODE || 'development'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">React Version:</span>
                  <span className="font-mono text-sm">18.x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Build Time:</span>
                  <span className="font-mono text-sm">{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User Agent:</span>
                  <span className="font-mono text-xs truncate max-w-32" title={typeof window !== 'undefined' && navigator ? navigator.userAgent : 'N/A'}>
                    {typeof window !== 'undefined' && navigator ? navigator.userAgent.split(' ')[0] : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">App Name:</span>
                  <span className="font-medium">YogaSwiss</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform:</span>
                  <span className="font-mono text-sm">Web Application</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Features:</span>
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className="text-xs">Multi-tenant</Badge>
                    <Badge variant="secondary" className="text-xs">Swiss Payments</Badge>
                    <Badge variant="secondary" className="text-xs">Supabase</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supabase:</span>
                  <Badge variant={import.meta.env.VITE_SUPABASE_URL ? 'default' : 'destructive'}>
                    {import.meta.env.VITE_SUPABASE_URL ? 'Connected' : 'Not Configured'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project ID:</span>
                  <span className="font-mono text-xs">
                    {import.meta.env.VITE_SUPABASE_URL ? 
                      import.meta.env.VITE_SUPABASE_URL.split('//')[1]?.split('.')[0] || 'Unknown' : 
                      'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Debug Mode:</span>
                  <Badge variant="secondary">
                    {import.meta.env.MODE === 'development' ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🇨🇭 Swiss Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <Badge variant="outline">CHF</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT Rate:</span>
                  <span className="font-mono">7.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TWINT Support:</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">QR-Bills:</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Debug Tools */}
        <TabsContent value="debug-tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Browser Console
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Open your browser's developer console to see debug logs and error messages.
                </p>
                <div className="bg-muted p-3 rounded font-mono text-xs">
                  <div className="text-blue-600">[AppLayout] App state: ...</div>
                  <div className="text-green-600">[Auth] User authenticated</div>
                  <div className="text-purple-600">[Supabase] Connection established</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Error Boundary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  The application is wrapped with an ErrorBoundary to catch and handle React errors gracefully.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Active</Badge>
                  <span className="text-sm text-muted-foreground">
                    Integrated at app level
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Local Storage & Session Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auth Session:</span>
                    <Badge variant={typeof window !== 'undefined' && localStorage.getItem('sb-auth-token') ? 'default' : 'secondary'}>
                      {typeof window !== 'undefined' && localStorage.getItem('sb-auth-token') ? 'Active' : 'None'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Org:</span>
                    <span className="font-mono text-xs">
                      {typeof window !== 'undefined' ? localStorage.getItem('yogaswiss-current-org') || 'None' : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Theme:</span>
                    <span className="font-mono text-xs">
                      {typeof window !== 'undefined' ? localStorage.getItem('theme') || 'system' : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}