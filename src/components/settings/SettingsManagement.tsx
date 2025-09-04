import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Building2, 
  Globe, 
  MapPin, 
  CreditCard, 
  Languages, 
  Receipt, 
  FileText, 
  BookOpen, 
  MessageSquare, 
  Users, 
  Shield, 
  Webhook, 
  Database, 
  ShoppingCart, 
  Search, 
  Gift, 
  TrendingUp, 
  Bell, 
  Flag,
  Save,
  RotateCcw,
  History,
  Settings,
  Eye,
  Copy,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit
} from 'lucide-react';
import { useLanguage } from '../LanguageProvider';
import { LocationsSettings } from './LocationsSettings';
import { SecuritySettings } from './SecuritySettings';
import { CommunicationsSettings } from './CommunicationsSettings';
import { SettingsOverview } from './SettingsOverview';
import { LanguageSettings } from './LanguageSettings';
import { DocumentsSettings } from './DocumentsSettings';
import { IntegrationsSettings } from './IntegrationsSettings';
import { PrivacySettings } from './PrivacySettings';
import { POSSettings } from './POSSettings';
import { SupabaseIntegrationStatusDashboard } from './SupabaseIntegrationStatusDashboard';
import { CompleteSISdashboard } from './CompleteSISDashboard';
import { BrandManagement } from './BrandManagement';
import { DatabaseInitializer } from '../DatabaseInitializer';
import { DatabaseDeploymentManager } from './DatabaseDeploymentManager';

interface SettingsGroup {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  priority: 'high' | 'medium' | 'low';
}

const settingsGroups: SettingsGroup[] = [
  { id: 'general', name: 'General Business', description: 'Legal identity, contact, currency, timezone', icon: Building2, priority: 'high' },
  { id: 'branding', name: 'Brand & Identity', description: 'Logo, colors, themes, and brand assets', icon: Flag, priority: 'high' },
  { id: 'public', name: 'Public-Facing', description: 'Studio appearance on website and app', icon: Globe, priority: 'high' },
  { id: 'locations', name: 'Locations & Rooms', description: 'Physical, outdoor, and online spaces', icon: MapPin, priority: 'high' },
  { id: 'subscriptions', name: 'Subscriptions', description: 'Membership defaults and policies', icon: CreditCard, priority: 'high' },
  { id: 'taxes', name: 'Taxes & Invoicing', description: 'Swiss VAT, QR-bills, invoice settings', icon: Receipt, priority: 'high' },
  { id: 'database-deployment', name: 'Database Deployments', description: 'Manage YogaSwiss database deployments and system health', icon: Database, priority: 'high' },
  { id: 'database-init', name: 'Database Setup', description: 'Initialize your database schema and sample data', icon: Database, priority: 'high' },
  { id: 'supabase-status', name: 'Integration Status', description: 'Monitor Supabase integration health and performance', icon: Database, priority: 'high' },
  { id: 'language', name: 'Language & Copy', description: 'Localization and custom text', icon: Languages, priority: 'medium' },
  { id: 'revenue', name: 'Revenue Categories', description: 'Reporting and accounting mapping', icon: FileText, priority: 'medium' },
  { id: 'policies', name: 'Policies', description: 'Cancellation, booking, and refund rules', icon: BookOpen, priority: 'high' },
  { id: 'payments', name: 'Payments & Providers', description: 'TWINT, Stripe, payment methods', icon: CreditCard, priority: 'high' },
  { id: 'documents', name: 'Documents & Branding', description: 'PDF templates and email design', icon: FileText, priority: 'medium' },
  { id: 'reservation', name: 'Reservation & Check-in', description: 'Booking flow and attendance', icon: BookOpen, priority: 'medium' },
  { id: 'communications', name: 'Communications', description: 'Email, SMS, and notifications', icon: MessageSquare, priority: 'medium' },
  { id: 'client', name: 'Client Experience', description: 'Booking interface and features', icon: Users, priority: 'medium' },
  { id: 'security', name: 'Security & Access', description: 'Roles, permissions, and data access', icon: Shield, priority: 'high' },
  { id: 'integrations', name: 'Integrations & Webhooks', description: 'External tools and APIs', icon: Webhook, priority: 'medium' },
  { id: 'privacy', name: 'Data & Privacy', description: 'GDPR compliance and data handling', icon: Database, priority: 'high' },
  { id: 'pos', name: 'POS & Retail', description: 'Point of sale and product management', icon: ShoppingCart, priority: 'low' },
  { id: 'marketplace', name: 'Marketplace & SEO', description: 'Discovery and search optimization', icon: Search, priority: 'low' },
  { id: 'loyalty', name: 'Loyalty & Referrals', description: 'Rewards and growth programs', icon: Gift, priority: 'low' },
  { id: 'pricing', name: 'Dynamic Pricing', description: 'Revenue optimization and experiments', icon: TrendingUp, priority: 'low' },
  { id: 'alerts', name: 'Observability & Alerts', description: 'Monitoring and notifications', icon: Bell, priority: 'medium' },
  { id: 'advanced', name: 'Advanced & Feature Flags', description: 'Beta features and experiments', icon: Flag, priority: 'low' }
];

export function SettingsManagement() {
  const [selectedGroup, setSelectedGroup] = useState('overview');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');
  const [settingsHistory, setSettingsHistory] = useState(false);
  const { t } = useLanguage();

  const currentGroup = settingsGroups.find(g => g.id === selectedGroup);

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Legal Information</CardTitle>
          <CardDescription>Company details and legal identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" placeholder="Yoga Zen Zürich GmbH" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat-id">VAT ID</Label>
              <Input id="vat-id" placeholder="CHE-123.456.789" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" placeholder="Bahnhofstrasse 1&#10;8001 Zürich&#10;Switzerland" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input id="email" type="email" placeholder="info@yogazen.ch" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+41 44 123 45 67" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Localization</CardTitle>
          <CardDescription>Currency, timezone, and language settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select defaultValue="CHF">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select defaultValue="europe-zurich">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="europe-zurich">Europe/Zurich</SelectItem>
                  <SelectItem value="europe-geneva">Europe/Geneva</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary-locale">Primary Language</Label>
              <Select defaultValue="de">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsContent = () => {
    switch (selectedGroup) {
      case 'overview':
        return <SettingsOverview onNavigateToGroup={setSelectedGroup} />;
      case 'general':
        return renderGeneralSettings();
      case 'branding':
        return <BrandManagement />;
      case 'locations':
        return <LocationsSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'communications':
        return <CommunicationsSettings />;
      case 'language':
        return <LanguageSettings />;
      case 'documents':
        return <DocumentsSettings />;
      case 'integrations':
        return <IntegrationsSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'pos':
        return <POSSettings />;
      case 'database-deployment':
        return <DatabaseDeploymentManager />;
      case 'database-init':
        return <DatabaseInitializer />;
      case 'supabase-status':
        return <CompleteSISdashboard />;
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{currentGroup?.name}</CardTitle>
              <CardDescription>{currentGroup?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Settings Configuration</h3>
                <p className="text-muted-foreground">
                  This settings group is ready for configuration. 
                  <br />Contact support for custom setup requirements.
                </p>
                <Button className="mt-4" variant="outline">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Settings Management</h1>
          <p className="text-muted-foreground">
            Configure your studio settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => setSettingsHistory(!settingsHistory)}>
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {selectedGroup === 'overview' ? (
        /* Overview Mode - Full Width */
        <div className="w-full">
          {renderSettingsContent()}
        </div>
      ) : (
        /* Settings Detail Mode - Sidebar + Content */
        <div className="flex gap-6">
          {/* Back to Overview + Settings Navigation */}
          <div className="w-80">
            <div className="space-y-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedGroup('overview')}
                className="w-full justify-start"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Back to Overview
              </Button>
              
              <Card>
                <CardHeader>
                  <CardTitle>Settings Groups</CardTitle>
                  <CardDescription>Configure different aspects of your studio</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {settingsGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => setSelectedGroup(group.id)}
                        className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted transition-colors ${
                          selectedGroup === group.id ? 'bg-muted border-r-2 border-primary' : ''
                        }`}
                      >
                        <group.icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{group.name}</p>
                          <p className="text-xs text-muted-foreground">{group.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {renderSettingsContent()}
          </div>
        </div>
      )}
    </div>
  );
}