import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Building2, Shield, Globe, Database, Key, Users, 
  FileText, Settings, Activity, AlertTriangle, 
  CheckCircle, ArrowLeft, Save
} from 'lucide-react';
import { GeneralSettings } from './GeneralSettings';
import { ApiKeysManagement } from './ApiKeysManagement';
import { SupabaseIntegrationStatus } from './SupabaseIntegrationStatus';
import { SecuritySettings } from './SecuritySettings';
import { SupabaseSetupWizard } from '../SupabaseSetupWizard';
import { SettingsService } from '../../utils/supabase/settings-service';

interface EnhancedSettingsManagementProps {
  onBack?: () => void;
  initialSection?: string;
}

export function EnhancedSettingsManagement({ 
  onBack, 
  initialSection = 'general' 
}: EnhancedSettingsManagementProps) {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [orgSettings, setOrgSettings] = useState<any>({});
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Mock org ID - in real app this would come from auth context
  const orgId = 'demo-org-id';

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load organization settings
      const settingsResult = await SettingsService.getOrgSettings(orgId);
      setOrgSettings(settingsResult || {});

      // Mock system health for status indicators
      setSystemHealth({ status: 'healthy', checks: [] });
    } catch (error) {
      console.error('Error loading settings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const settingsSections = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Organization info, branding, and basic configuration',
      icon: Building2,
      status: 'complete',
      priority: 'high'
    },
    {
      id: 'system-health',
      title: 'System Health',
      description: 'Monitor system performance and health checks',
      icon: Activity,
      status: systemHealth ? 'healthy' : 'unknown',
      priority: 'high'
    },
    {
      id: 'api-integrations',
      title: 'API & Integrations',
      description: 'API keys, webhooks, and third-party integrations',
      icon: Globe,
      status: 'partial',
      priority: 'medium'
    },
    {
      id: 'compliance',
      title: 'Compliance & Legal',
      description: 'GDPR, privacy policies, and legal compliance',
      icon: FileText,
      status: 'compliant',
      priority: 'high'
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Authentication, permissions, and security policies',
      icon: Shield,
      status: 'secure',
      priority: 'high'
    },
    {
      id: 'supabase-status',
      title: 'Supabase Integration Status',
      description: 'Database connectivity and integration health',
      icon: Database,
      status: 'connected',
      priority: 'critical'
    },
    {
      id: 'supabase-setup',
      title: 'Supabase Setup Wizard',
      description: 'Comprehensive setup verification and troubleshooting',
      icon: Settings,
      status: 'ready',
      priority: 'medium'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
      case 'healthy':
      case 'connected':
      case 'compliant':
      case 'secure':
        return 'bg-green-100 text-green-800';
      case 'partial':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'incomplete':
      case 'unhealthy':
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
      case 'healthy':
      case 'connected':
      case 'compliant':
      case 'secure':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCurrentSection = () => {
    return settingsSections.find(section => section.id === activeSection);
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings orgId={orgId} />;
      case 'system-health':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">System Health Monitoring</h2>
            <p className="text-sm text-muted-foreground">
              Monitor system performance, uptime, and health metrics
            </p>
            {/* System health content would go here */}
            <Card>
              <CardContent className="p-12 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">System Health Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive system monitoring and health checks
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case 'api-integrations':
        return <ApiKeysManagement orgId={orgId} />;
      case 'compliance':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Compliance & Legal</h2>
            <p className="text-sm text-muted-foreground">
              Manage GDPR compliance, privacy policies, and legal requirements
            </p>
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Compliance Management</h3>
                <p className="text-sm text-muted-foreground">
                  GDPR compliance, data protection, and legal documentation
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case 'security':
        return <SecuritySettings />;
      case 'supabase-status':
        return <SupabaseIntegrationStatus />;
      case 'supabase-setup':
        return <SupabaseSetupWizard />;
      default:
        return (
          <Card>
            <CardContent className="p-12 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Settings Section</h3>
              <p className="text-sm text-muted-foreground">
                This settings section is ready for configuration
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-3 gap-6 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-semibold">Settings Management</h1>
            <p className="text-muted-foreground">
              Configure your studio settings and system preferences
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {getCurrentSection()?.title}
          </Badge>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Settings Navigation */}
        <div className="w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Settings Sections</CardTitle>
              <CardDescription>Configure different aspects of your studio</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted transition-colors rounded-md ${
                      activeSection === section.id ? 'bg-muted border-r-2 border-primary' : ''
                    }`}
                  >
                    <section.icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{section.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{section.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusIcon(section.status)}
                      <Badge variant="outline" className={`text-xs ${getStatusColor(section.status)}`}>
                        {section.status}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Key className="h-4 w-4 mr-2" />
                Generate API Key
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Database className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Security Audit
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export Settings
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Database</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>API Health</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Integrations</span>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  <span className="text-yellow-600">2 Warnings</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Security</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Secure</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
}