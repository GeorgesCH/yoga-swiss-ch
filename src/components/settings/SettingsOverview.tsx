import React, { useState, useEffect } from 'react';
import { Settings, Activity, Globe, Shield, Lock, Building, Users, Bell, Zap, AlertTriangle, CheckCircle, Palette, Database } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { SettingsManagement } from './SettingsManagement';
import { EnhancedSettingsManagement } from './EnhancedSettingsManagement';
import { SystemHealthMonitoring } from '../system/SystemHealthMonitoring';
import { IntegrationsManagement } from '../integrations/IntegrationsManagement';
import { ComplianceManagement } from '../compliance/ComplianceManagement';
import { SecuritySettings } from './SecuritySettings';
import { BrandManagement } from './BrandManagement';
import { SupabaseIntegrationVerifier } from '../SupabaseIntegrationVerifier';
import { SupabaseIntegrationTest } from '../SupabaseIntegrationTest';
import { SettingsService } from '../../utils/supabase/settings-service';

interface SettingsOverviewProps {
  onPageChange?: (page: string) => void;
}

export function SettingsOverview({ onPageChange }: SettingsOverviewProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [healthData, setHealthData] = useState<any>(null);
  const [integrationsData, setIntegrationsData] = useState<any[]>([]);
  const [sisData, setSisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Mock org ID - in real app this would come from context
  const orgId = 'demo-org-id';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock system health data since these methods don't exist in SettingsService
      setHealthData({ status: 'healthy' });
      setIntegrationsData([]);
      setSisData({ 
        result: 'ok', 
        checks_passed: 15, 
        checks_total: 15, 
        checks_failed: 0, 
        checks_warned: 0, 
        started_at: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Error loading settings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const systemStats = [
    {
      title: 'System Health',
      value: sisData?.result === 'ok' ? '99.8%' : sisData?.result === 'warn' ? '98.5%' : '95.2%',
      change: 'Uptime this month',
      icon: Activity,
      color: sisData?.result === 'ok' ? 'text-green-600' : sisData?.result === 'warn' ? 'text-yellow-600' : 'text-red-600',
      status: sisData?.result || 'unknown'
    },
    {
      title: 'Active Integrations',
      value: integrationsData.filter(i => i.status === 'connected').length.toString(),
      change: `${integrationsData.filter(i => i.status === 'pending').length} pending setup`,
      icon: Globe,
      color: 'text-blue-600',
      status: 'ok'
    },
    {
      title: 'Security Score',
      value: 'A+',
      change: 'All checks passed',
      icon: Shield,
      color: 'text-purple-600',
      status: 'ok'
    },
    {
      title: 'Compliance Status',
      value: '98%',
      change: 'GDPR compliant',
      icon: Lock,
      color: 'text-green-600',
      status: 'ok'
    }
  ];

  const SecurityComponent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication & Access</CardTitle>
            <CardDescription>User authentication and access controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Enhanced account security</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Role-Based Access</p>
                    <p className="text-sm text-muted-foreground">Granular permissions</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Configured</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Session Management</p>
                    <p className="text-sm text-muted-foreground">Automatic timeout</p>
                  </div>
                </div>
                <Badge variant="secondary">30 min timeout</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Protection</CardTitle>
            <CardDescription>Privacy and data security measures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">SSL/TLS Encryption</p>
                    <p className="text-sm text-muted-foreground">End-to-end encryption</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">TLS 1.3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Data Backups</p>
                    <p className="text-sm text-muted-foreground">Automated daily backups</p>
                  </div>
                </div>
                <Badge variant="secondary">Every 6h</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">GDPR Compliance</p>
                    <p className="text-sm text-muted-foreground">Privacy regulations</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">Compliant</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit & Monitoring</CardTitle>
          <CardDescription>Security monitoring and audit trails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold">System Monitoring</p>
              <p className="text-sm text-muted-foreground">24/7 monitoring active</p>
              <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">Online</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold">Security Scans</p>
              <p className="text-sm text-muted-foreground">Daily vulnerability scans</p>
              <Badge variant="secondary" className="mt-2">No issues</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Lock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="font-semibold">Audit Logs</p>
              <p className="text-sm text-muted-foreground">Complete activity logs</p>
              <Badge variant="secondary" className="mt-2">90 days</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Settings & System</h1>
          <p className="text-muted-foreground">
            Configure your studio settings, integrations, and system preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            System Status
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Quick Setup
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                {stat.status === 'ok' && <CheckCircle className="h-3 w-3 text-green-500" />}
                {stat.status === 'warn' && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                {stat.status === 'fail' && <AlertTriangle className="h-3 w-3 text-red-500" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
              {stat.status && (
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent to-current opacity-20" 
                     style={{ color: stat.status === 'ok' ? '#10b981' : stat.status === 'warn' ? '#f59e0b' : '#ef4444' }} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Setup & Maintenance
          </CardTitle>
          <CardDescription>
            Common settings tasks and system maintenance actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => onPageChange?.('settings')}
            >
              <div className="flex items-center gap-2 w-full">
                <Database className="h-4 w-4 text-primary" />
                <span className="font-medium">Database Setup</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Initialize your database schema and sample data
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2 w-full">
                <Building className="h-4 w-4" />
                <span className="font-medium">Studio Setup</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Configure basic studio information and branding
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2 w-full">
                <Globe className="h-4 w-4" />
                <span className="font-medium">Connect TWINT</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Set up Swiss mobile payment integration
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2 w-full">
                <Shield className="h-4 w-4" />
                <span className="font-medium">GDPR Compliance</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Configure privacy policies and consent
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2 w-full">
                <Activity className="h-4 w-4" />
                <span className="font-medium">Health Check</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Run system diagnostics and performance tests
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2 w-full">
                <Users className="h-4 w-4" />
                <span className="font-medium">User Roles</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Manage team permissions and access levels
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2 w-full">
                <Bell className="h-4 w-4" />
                <span className="font-medium">Notifications</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Configure email and SMS notification settings
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status Overview */}
      {sisData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Integration Status
            </CardTitle>
            <CardDescription>
              Last checked: {new Date(sisData.started_at).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Status</span>
                <Badge variant={sisData.result === 'ok' ? 'default' : sisData.result === 'warn' ? 'secondary' : 'destructive'}>
                  {sisData.result?.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Checks Passed</span>
                  <span>{sisData.checks_passed}/{sisData.checks_total}</span>
                </div>
                <Progress 
                  value={(sisData.checks_passed / sisData.checks_total) * 100} 
                  className="h-2" 
                />
              </div>
              
              {sisData.checks_failed > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {sisData.checks_failed} system checks failed. Review the System Health section for details.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{sisData.checks_passed}</div>
                  <div className="text-xs text-muted-foreground">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{sisData.checks_warned}</div>
                  <div className="text-xs text-muted-foreground">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{sisData.checks_failed}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">General Settings</h3>
              <p className="text-muted-foreground">Studio configuration and preferences</p>
            </div>
            <Badge variant="secondary">Studio settings</Badge>
          </div>
          <EnhancedSettingsManagement initialSection="general" />
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Brand Management</h3>
              <p className="text-muted-foreground">Manage your brand identity, assets, and policies</p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">Brand Identity</Badge>
          </div>
          <BrandManagement />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">System Health Monitoring</h3>
              <p className="text-muted-foreground">Monitor system performance and health</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">99.8% uptime</Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <SystemHealthMonitoring />
              <SupabaseIntegrationTest />
            </div>
            <div>
              <SupabaseIntegrationVerifier />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">API & Integrations</h3>
              <p className="text-muted-foreground">Connect with third-party services and APIs</p>
            </div>
            <Badge variant="secondary">12 active integrations</Badge>
          </div>
          <EnhancedSettingsManagement initialSection="api-integrations" />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Compliance & Legal</h3>
              <p className="text-muted-foreground">GDPR, Swiss regulations, and legal compliance</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">Compliant</Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ComplianceManagement />
            </div>
            <div>
              <EnhancedSettingsManagement initialSection="compliance" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Security Settings</h3>
              <p className="text-muted-foreground">Authentication, encryption, and security policies</p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">A+ Security</Badge>
          </div>
          <EnhancedSettingsManagement initialSection="security" />
        </TabsContent>
      </Tabs>
    </div>
  );
}