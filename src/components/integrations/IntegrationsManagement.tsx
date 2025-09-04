import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Search, Plus, Settings, Zap, CheckCircle, XCircle, 
  AlertTriangle, Globe, Key, Webhook, Database, Mail,
  Calendar, CreditCard, MessageSquare, Phone, Video,
  BarChart3, Shield, Clock, TrendingUp, Activity,
  RefreshCw, Edit2, Trash2, Eye, Copy
} from 'lucide-react';

// Mock data for integrations
const mockIntegrations = [
  {
    id: 'int1',
    name: 'TWINT Payment Gateway',
    provider: 'TWINT',
    category: 'Payments',
    status: 'Connected',
    type: 'Official',
    description: 'Swiss mobile payment solution for seamless transactions',
    connectedAt: '2023-08-15T10:30:00',
    lastSync: '2024-01-15T14:22:00',
    apiCalls: 15420,
    monthlyLimit: 50000,
    version: 'v2.1',
    webhooks: 3,
    apiKey: 'tw_live_xxxxxxxxxxxx',
    healthScore: 98,
    features: ['Payments', 'Refunds', 'Webhooks', 'Analytics']
  },
  {
    id: 'int2',
    name: 'PostFinance Payment',
    provider: 'PostFinance',
    category: 'Payments',
    status: 'Connected',
    type: 'Official',
    description: 'Swiss banking payment gateway integration',
    connectedAt: '2023-06-20T09:15:00',
    lastSync: '2024-01-15T14:18:00',
    apiCalls: 8950,
    monthlyLimit: 25000,
    version: 'v1.8',
    webhooks: 2,
    apiKey: 'pf_live_xxxxxxxxxxxx',
    healthScore: 95,
    features: ['Payments', 'QR-Bills', 'Bank Transfers']
  },
  {
    id: 'int3',
    name: 'WhatsApp Business API',
    provider: 'Meta',
    category: 'Communications',
    status: 'Connected',
    type: 'Official',
    description: 'Send automated WhatsApp messages to customers',
    connectedAt: '2023-09-10T16:45:00',
    lastSync: '2024-01-15T14:20:00',
    apiCalls: 2340,
    monthlyLimit: 10000,
    version: 'v16.0',
    webhooks: 1,
    apiKey: 'wa_live_xxxxxxxxxxxx',
    healthScore: 92,
    features: ['Messages', 'Templates', 'Media', 'Status']
  },
  {
    id: 'int4',
    name: 'Google Calendar',
    provider: 'Google',
    category: 'Calendar',
    status: 'Connected',
    type: 'OAuth',
    description: 'Sync class schedules with Google Calendar',
    connectedAt: '2023-07-05T11:20:00',
    lastSync: '2024-01-15T14:15:00',
    apiCalls: 5680,
    monthlyLimit: 100000,
    version: 'v3',
    webhooks: 0,
    apiKey: 'goog_oauth_xxxxxxxxxxxx',
    healthScore: 99,
    features: ['Events', 'Calendars', 'Notifications']
  },
  {
    id: 'int5',
    name: 'Mailchimp',
    provider: 'Mailchimp',
    category: 'Email Marketing',
    status: 'Warning',
    type: 'Official',
    description: 'Email marketing and automation platform',
    connectedAt: '2023-05-12T14:30:00',
    lastSync: '2024-01-15T10:30:00',
    apiCalls: 890,
    monthlyLimit: 5000,
    version: 'v3.0',
    webhooks: 2,
    apiKey: 'mc_live_xxxxxxxxxxxx',
    healthScore: 78,
    features: ['Campaigns', 'Lists', 'Automation', 'Reports']
  },
  {
    id: 'int6',
    name: 'Zoom Integration',
    provider: 'Zoom',
    category: 'Video',
    status: 'Disconnected',
    type: 'OAuth',
    description: 'Host online yoga classes via Zoom',
    connectedAt: null,
    lastSync: null,
    apiCalls: 0,
    monthlyLimit: 2000,
    version: 'v2',
    webhooks: 0,
    apiKey: null,
    healthScore: 0,
    features: ['Meetings', 'Webinars', 'Recordings']
  }
];

const mockWebhooks = [
  {
    id: 'wh1',
    name: 'Payment Success',
    url: 'https://api.yogaswiss.ch/webhooks/payment/success',
    integration: 'TWINT Payment Gateway',
    events: ['payment.completed', 'payment.refunded'],
    status: 'Active',
    lastTriggered: '2024-01-15T14:22:00',
    totalCalls: 3420,
    successRate: 99.8
  },
  {
    id: 'wh2',
    name: 'WhatsApp Messages',
    url: 'https://api.yogaswiss.ch/webhooks/whatsapp/messages',
    integration: 'WhatsApp Business API',
    events: ['message.received', 'message.delivered'],
    status: 'Active',
    lastTriggered: '2024-01-15T14:20:00',
    totalCalls: 890,
    successRate: 95.5
  },
  {
    id: 'wh3',
    name: 'Email Campaign',
    url: 'https://api.yogaswiss.ch/webhooks/mailchimp/campaign',
    integration: 'Mailchimp',
    events: ['campaign.sent', 'campaign.opened'],
    status: 'Failed',
    lastTriggered: '2024-01-15T10:30:00',
    totalCalls: 45,
    successRate: 67.2
  }
];

const statusColors = {
  'Connected': 'bg-green-100 text-green-800',
  'Warning': 'bg-yellow-100 text-yellow-800',
  'Disconnected': 'bg-red-100 text-red-800',
  'Connecting': 'bg-blue-100 text-blue-800'
};

const categoryColors = {
  'Payments': 'bg-green-100 text-green-800',
  'Communications': 'bg-blue-100 text-blue-800',
  'Calendar': 'bg-purple-100 text-purple-800',
  'Email Marketing': 'bg-orange-100 text-orange-800',
  'Video': 'bg-indigo-100 text-indigo-800',
  'Analytics': 'bg-pink-100 text-pink-800'
};

const categoryIcons = {
  'Payments': CreditCard,
  'Communications': MessageSquare,
  'Calendar': Calendar,
  'Email Marketing': Mail,
  'Video': Video,
  'Analytics': BarChart3
};

export function IntegrationsManagement() {
  const [activeTab, setActiveTab] = useState('integrations');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showNewIntegration, setShowNewIntegration] = useState(false);

  // Get unique values for filters
  const categories = [...new Set(mockIntegrations.map(i => i.category))];
  const statuses = [...new Set(mockIntegrations.map(i => i.status))];

  // Filter integrations
  const filteredIntegrations = useMemo(() => {
    return mockIntegrations.filter(integration => {
      const matchesSearch = searchTerm === '' || 
        integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || integration.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedStatus]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'Disconnected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Connecting':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-blue-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const IntegrationCard = ({ integration }: { integration: any }) => {
    const IconComponent = categoryIcons[integration.category] || Globe;
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">{integration.name}</h3>
                <p className="text-sm text-muted-foreground">{integration.provider}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(integration.status)}
              <Badge className={statusColors[integration.status]}>
                {integration.status}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Category</span>
              <Badge className={categoryColors[integration.category]}>
                {integration.category}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Health Score</span>
              <span className={`font-medium ${getHealthScoreColor(integration.healthScore)}`}>
                {integration.healthScore}%
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">API Usage</span>
              <span>
                {integration.apiCalls.toLocaleString()} / {integration.monthlyLimit.toLocaleString()}
              </span>
            </div>

            {integration.lastSync && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Sync</span>
                <span>{formatDate(integration.lastSync)}</span>
              </div>
            )}
          </div>

          <div className="flex space-x-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1">
              <Settings className="w-4 h-4 mr-1" />
              Configure
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-1" />
              Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const WebhookRow = ({ webhook }: { webhook: any }) => (
    <div className="flex items-center p-4 border-b hover:bg-gray-50">
      <div className="flex-1">
        <div className="grid grid-cols-6 gap-4 items-center">
          <div>
            <div className="font-medium">{webhook.name}</div>
            <div className="text-sm text-muted-foreground">{webhook.integration}</div>
          </div>
          
          <div className="text-sm">
            <div className="font-mono text-xs bg-gray-100 p-1 rounded">
              {webhook.url.replace('https://api.yogaswiss.ch', '...')}
            </div>
          </div>
          
          <div>
            <div className="flex flex-wrap gap-1">
              {webhook.events.slice(0, 2).map(event => (
                <Badge key={event} variant="outline" className="text-xs">
                  {event}
                </Badge>
              ))}
              {webhook.events.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{webhook.events.length - 2}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {webhook.status === 'Active' ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <Badge className={webhook.status === 'Active' ? statusColors.Connected : statusColors.Disconnected}>
              {webhook.status}
            </Badge>
          </div>
          
          <div className="text-sm">
            <div className="font-medium">{webhook.successRate}%</div>
            <div className="text-xs text-muted-foreground">{webhook.totalCalls} calls</div>
          </div>
          
          <div className="text-sm">
            {webhook.lastTriggered ? formatDate(webhook.lastTriggered) : 'Never'}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 ml-4">
        <Button variant="outline" size="sm">
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm">
          <Copy className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" className="text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // Calculate summary stats
  const stats = {
    total: mockIntegrations.length,
    connected: mockIntegrations.filter(i => i.status === 'Connected').length,
    totalApiCalls: mockIntegrations.reduce((sum, i) => sum + i.apiCalls, 0),
    avgHealthScore: mockIntegrations.reduce((sum, i) => sum + i.healthScore, 0) / mockIntegrations.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">API & Integrations</h1>
          <p className="text-muted-foreground">
            Manage third-party integrations, APIs, and webhook configurations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </Button>
          <Button onClick={() => setShowNewIntegration(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Integrations</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-green-600">{stats.connected} connected</p>
              </div>
              <Globe className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Calls (Month)</p>
                <p className="text-2xl font-bold">{stats.totalApiCalls.toLocaleString()}</p>
                <p className="text-xs text-blue-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +18% from last month
                </p>
              </div>
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Health Score</p>
                <p className="text-2xl font-bold">{Math.round(stats.avgHealthScore)}%</p>
                <p className="text-xs text-green-600">Excellent performance</p>
              </div>
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Webhooks</p>
                <p className="text-2xl font-bold">{mockWebhooks.filter(w => w.status === 'Active').length}</p>
                <p className="text-xs text-blue-600">real-time events</p>
              </div>
              <Webhook className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search integrations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map(integration => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No integrations found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Webhook Endpoints</CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Column Headers */}
              <div className="grid grid-cols-6 gap-4 p-4 border-b bg-gray-50 text-sm font-medium text-muted-foreground">
                <div>Name</div>
                <div>Endpoint</div>
                <div>Events</div>
                <div>Status</div>
                <div>Success Rate</div>
                <div>Last Triggered</div>
              </div>

              {/* Webhooks List */}
              <div className="divide-y">
                {mockWebhooks.map(webhook => (
                  <WebhookRow key={webhook.id} webhook={webhook} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">API Key Management</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate and manage API keys for secure access to YogaSwiss APIs
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate API Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Marketplace</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Integration Marketplace</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover and install new integrations to extend YogaSwiss functionality
                </p>
                <Button>
                  <Search className="w-4 h-4 mr-2" />
                  Browse Marketplace
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}