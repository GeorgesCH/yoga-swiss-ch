import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Webhook, 
  Zap, 
  Globe, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Mail,
  BarChart3,
  CreditCard,
  Users,
  MessageSquare,
  FileText,
  Key,
  Activity
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: 'crm' | 'email' | 'analytics' | 'payment' | 'calendar' | 'communication' | 'accounting';
  description: string;
  status: 'connected' | 'available' | 'coming_soon';
  icon: React.ComponentType<any>;
  provider: string;
  isPopular?: boolean;
  features: string[];
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  lastTriggered?: string;
  successCount: number;
  errorCount: number;
}

const integrations: Integration[] = [
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'email',
    description: 'Email marketing and automation platform',
    status: 'connected',
    icon: Mail,
    provider: 'Mailchimp',
    isPopular: true,
    features: ['Email campaigns', 'Automation', 'Segmentation', 'Analytics']
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'payment',
    description: 'Payment processing and billing',
    status: 'connected',
    icon: CreditCard,
    provider: 'Stripe',
    isPopular: true,
    features: ['Payment processing', 'Subscriptions', 'Invoicing', 'Reporting']
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    category: 'calendar',
    description: 'Sync classes with Google Calendar',
    status: 'connected',
    icon: Calendar,
    provider: 'Google',
    features: ['Calendar sync', 'Event creation', 'Reminders']
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    category: 'analytics',
    description: 'Website and booking analytics',
    status: 'available',
    icon: BarChart3,
    provider: 'Google',
    isPopular: true,
    features: ['Traffic analysis', 'Conversion tracking', 'E-commerce tracking']
  },
  {
    id: 'facebook-pixel',
    name: 'Facebook Pixel',
    category: 'analytics',
    description: 'Track conversions for Facebook ads',
    status: 'available',
    icon: Activity,
    provider: 'Meta',
    features: ['Conversion tracking', 'Audience building', 'Ad optimization']
  },
  {
    id: 'whatsapp-business',
    name: 'WhatsApp Business',
    category: 'communication',
    description: 'Send booking confirmations via WhatsApp',
    status: 'available',
    icon: MessageSquare,
    provider: 'Meta',
    features: ['Automated messages', 'Booking confirmations', 'Customer support']
  },
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'communication',
    description: 'SMS notifications and communication',
    status: 'connected',
    icon: MessageSquare,
    provider: 'Twilio',
    features: ['SMS notifications', 'Voice calls', 'Verification']
  },
  {
    id: 'xero',
    name: 'Xero',
    category: 'accounting',
    description: 'Accounting and bookkeeping integration',
    status: 'coming_soon',
    icon: FileText,
    provider: 'Xero',
    features: ['Invoice sync', 'Expense tracking', 'Financial reporting']
  }
];

export function IntegrationsSettings() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: '1',
      name: 'Booking Created',
      url: 'https://api.example.com/booking-created',
      events: ['booking.created', 'booking.confirmed'],
      status: 'active',
      lastTriggered: '2024-01-15 14:30',
      successCount: 1247,
      errorCount: 3
    },
    {
      id: '2',
      name: 'Customer Updated',
      url: 'https://crm.example.com/customer-sync',
      events: ['customer.created', 'customer.updated'],
      status: 'error',
      lastTriggered: '2024-01-15 12:15',
      successCount: 892,
      errorCount: 15
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

  const getIntegrationIcon = (integration: Integration) => {
    return integration.icon;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'available':
        return <Badge variant="outline">Available</Badge>;
      case 'coming_soon':
        return <Badge className="bg-yellow-100 text-yellow-800">Coming Soon</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getWebhookStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'email': return Mail;
      case 'payment': return CreditCard;
      case 'calendar': return Calendar;
      case 'analytics': return BarChart3;
      case 'communication': return MessageSquare;
      case 'accounting': return FileText;
      case 'crm': return Users;
      default: return Globe;
    }
  };

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All', icon: Globe },
    { id: 'email', name: 'Email Marketing', icon: Mail },
    { id: 'payment', name: 'Payments', icon: CreditCard },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
    { id: 'accounting', name: 'Accounting', icon: FileText }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Integrations & Webhooks</h2>
          <p className="text-muted-foreground">
            Connect external tools and APIs to extend your studio's capabilities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </Button>
          <Button onClick={() => setIsWebhookDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Webhook
          </Button>
        </div>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="integrations">App Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          {/* Category Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => {
              const Icon = getIntegrationIcon(integration);
              return (
                <Card key={integration.id} className="relative">
                  {integration.isPopular && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-orange-100 text-orange-800 text-xs">Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{integration.provider}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Features</Label>
                      <div className="flex flex-wrap gap-1">
                        {integration.features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {integration.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{integration.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {getStatusBadge(integration.status)}
                      <div className="flex gap-2">
                        {integration.status === 'connected' ? (
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Button>
                        ) : integration.status === 'available' ? (
                          <Button size="sm">
                            Connect
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            Coming Soon
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Custom Integration */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Integration</CardTitle>
              <CardDescription>Don't see what you need? Build a custom integration using our API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">YogaSwiss API</p>
                  <p className="text-sm text-muted-foreground">
                    Full REST API access to build custom integrations and workflows
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    View API Docs
                  </Button>
                  <Button>
                    Get API Key
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Endpoints</CardTitle>
              <CardDescription>Configure webhooks to receive real-time notifications about events</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">{webhook.name}</TableCell>
                      <TableCell className="font-mono text-sm max-w-xs truncate">
                        {webhook.url}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.slice(0, 2).map((event) => (
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getWebhookStatusIcon(webhook.status)}
                          <span className="text-sm capitalize">{webhook.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-green-600">{webhook.successCount} success</p>
                          <p className="text-red-600">{webhook.errorCount} errors</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedWebhook(webhook);
                              setIsWebhookDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Events</CardTitle>
              <CardDescription>Events that can trigger webhook notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  'booking.created',
                  'booking.cancelled',
                  'booking.confirmed',
                  'customer.created',
                  'customer.updated',
                  'payment.succeeded',
                  'payment.failed',
                  'class.created',
                  'class.updated',
                  'waitlist.joined',
                  'waitlist.promoted',
                  'subscription.created'
                ].map((event) => (
                  <div key={event} className="p-3 border rounded-lg">
                    <code className="text-sm font-mono">{event}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for accessing YogaSwiss programmatically</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Production API Key</p>
                  <p className="text-sm text-muted-foreground font-mono">ys_live_••••••••••••••••••••••••••••••••</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Test API Key</p>
                  <p className="text-sm text-muted-foreground font-mono">ys_test_••••••••••••••••••••••••••••••••</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Keep your API keys secure</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Never expose API keys in client-side code or public repositories. 
                      Use environment variables and rotate keys regularly.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Usage</CardTitle>
              <CardDescription>Monitor your API usage and limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">1,247</div>
                  <div className="text-sm text-muted-foreground">Requests today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">98.5%</div>
                  <div className="text-sm text-muted-foreground">Success rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">45ms</div>
                  <div className="text-sm text-muted-foreground">Avg response time</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Monthly limit</span>
                  <span>15,420 / 50,000 requests</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '31%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Marketplace</CardTitle>
              <CardDescription>Discover and install new integrations from our marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Marketplace Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Browse and install third-party integrations built by the YogaSwiss community
                </p>
                <Button variant="outline">
                  Join Beta Program
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Webhook Dialog */}
      <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedWebhook ? 'Edit Webhook' : 'Add Webhook'}
            </DialogTitle>
            <DialogDescription>
              Configure webhook endpoint to receive event notifications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-name">Name</Label>
              <Input 
                id="webhook-name" 
                placeholder="e.g., Booking Notifications"
                defaultValue={selectedWebhook?.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Endpoint URL</Label>
              <Input 
                id="webhook-url" 
                placeholder="https://your-app.com/webhooks/yogaswiss"
                defaultValue={selectedWebhook?.url}
              />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {[
                  'booking.created',
                  'booking.cancelled',
                  'booking.confirmed',
                  'customer.created',
                  'customer.updated',
                  'payment.succeeded',
                  'payment.failed',
                  'class.created',
                  'class.updated'
                ].map((event) => (
                  <label key={event} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="rounded border-border"
                      defaultChecked={selectedWebhook?.events.includes(event)}
                    />
                    <span className="text-sm font-mono">{event}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setIsWebhookDialogOpen(false);
                setSelectedWebhook(null);
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Handle save logic here
                setIsWebhookDialogOpen(false);
                setSelectedWebhook(null);
              }}>
                {selectedWebhook ? 'Update' : 'Create'} Webhook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}