import React, { useState } from 'react';
import { 
  Plus, Search, Filter, MoreHorizontal, Play, Pause, Calendar,
  Clock, Users, Mail, Smartphone, Bell, Zap, Settings, Target,
  TrendingUp, CheckCircle, AlertTriangle, Activity, RefreshCw,
  MessageSquare, CreditCard, UserCheck, Timer, MapPin, Star
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

interface Automation {
  id: string;
  name: string;
  description: string;
  type: 'customer' | 'marketing' | 'operations' | 'finance';
  trigger: string;
  status: 'active' | 'paused' | 'draft';
  executions: number;
  successRate: number;
  lastRun: string;
  created: string;
  tags: string[];
  actions: AutomationAction[];
}

interface AutomationAction {
  id: string;
  type: 'email' | 'sms' | 'push' | 'webhook' | 'discount' | 'reminder' | 'payment';
  description: string;
  delay?: string;
  conditions?: string[];
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  popularity: number;
  estimatedImpact: string;
  setup: string[];
}

export function AutomationsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null);

  // Mock data for automations
  const automations: Automation[] = [
    {
      id: '1',
      name: 'Welcome Series for New Members',
      description: 'Automated onboarding sequence for new customer registrations',
      type: 'customer',
      trigger: 'New customer registration',
      status: 'active',
      executions: 847,
      successRate: 94.2,
      lastRun: '2024-01-15T10:30:00Z',
      created: '2024-01-01T00:00:00Z',
      tags: ['onboarding', 'email', 'high-priority'],
      actions: [
        { id: '1', type: 'email', description: 'Send welcome email with studio info', delay: 'immediate' },
        { id: '2', type: 'email', description: 'Send first class booking reminder', delay: '1 day' },
        { id: '3', type: 'sms', description: 'SMS with studio location and parking info', delay: '1 hour before first class' }
      ]
    },
    {
      id: '2',
      name: 'Class Reminder Notifications',
      description: 'Automated reminders sent before scheduled classes',
      type: 'operations',
      trigger: 'Class booking confirmed',
      status: 'active',
      executions: 2143,
      successRate: 97.8,
      lastRun: '2024-01-15T09:15:00Z',
      created: '2023-12-15T00:00:00Z',
      tags: ['reminders', 'sms', 'push'],
      actions: [
        { id: '1', type: 'push', description: 'Push notification 24h before class', delay: '24 hours before' },
        { id: '2', type: 'sms', description: 'SMS reminder 2h before class', delay: '2 hours before' }
      ]
    },
    {
      id: '3',
      name: 'Re-engagement Campaign',
      description: 'Target inactive customers with special offers',
      type: 'marketing',
      trigger: 'No booking for 30 days',
      status: 'active',
      executions: 156,
      successRate: 23.5,
      lastRun: '2024-01-14T20:00:00Z',
      created: '2024-01-10T00:00:00Z',
      tags: ['retention', 'discount', 'email'],
      actions: [
        { id: '1', type: 'email', description: 'Send "We miss you" email with 20% discount', delay: 'immediate' },
        { id: '2', type: 'discount', description: 'Create 20% discount code valid for 7 days', delay: 'immediate' },
        { id: '3', type: 'email', description: 'Follow-up reminder 3 days later', delay: '3 days' }
      ]
    },
    {
      id: '4',
      name: 'Failed Payment Recovery',
      description: 'Automatic retry and customer notification for failed payments',
      type: 'finance',
      trigger: 'Payment failed',
      status: 'active',
      executions: 89,
      successRate: 76.4,
      lastRun: '2024-01-15T11:45:00Z',
      created: '2023-11-20T00:00:00Z',
      tags: ['payments', 'recovery', 'twint'],
      actions: [
        { id: '1', type: 'payment', description: 'Retry payment automatically', delay: '2 hours' },
        { id: '2', type: 'email', description: 'Notify customer of failed payment', delay: 'immediate' },
        { id: '3', type: 'sms', description: 'SMS reminder to update payment method', delay: '1 day' }
      ]
    },
    {
      id: '5',
      name: 'Instructor Schedule Conflicts',
      description: 'Alert system for instructor double-booking or conflicts',
      type: 'operations',
      trigger: 'Schedule conflict detected',
      status: 'paused',
      executions: 23,
      successRate: 100,
      lastRun: '2024-01-12T16:20:00Z',
      created: '2024-01-05T00:00:00Z',
      tags: ['scheduling', 'alerts', 'instructors'],
      actions: [
        { id: '1', type: 'email', description: 'Alert studio manager', delay: 'immediate' },
        { id: '2', type: 'push', description: 'Push notification to instructor', delay: 'immediate' }
      ]
    }
  ];

  // Automation templates
  const templates: AutomationTemplate[] = [
    {
      id: 'welcome-sequence',
      name: 'Customer Welcome Sequence',
      description: 'Complete onboarding flow for new customers',
      category: 'Customer Experience',
      icon: UserCheck,
      popularity: 95,
      estimatedImpact: 'High',
      setup: ['Configure welcome email template', 'Set up SMS templates', 'Define onboarding schedule']
    },
    {
      id: 'birthday-campaign',
      name: 'Birthday Special Offers',
      description: 'Automated birthday wishes with exclusive discounts',
      category: 'Marketing',
      icon: Star,
      popularity: 87,
      estimatedImpact: 'Medium',
      setup: ['Create birthday email template', 'Set discount parameters', 'Configure scheduling']
    },
    {
      id: 'waitlist-notifications',
      name: 'Waitlist Management',
      description: 'Automatic notifications when spots become available',
      category: 'Operations',
      icon: Clock,
      popularity: 92,
      estimatedImpact: 'High',
      setup: ['Configure waitlist triggers', 'Set notification templates', 'Define priority rules']
    },
    {
      id: 'membership-renewal',
      name: 'Membership Renewal Reminders',
      description: 'Automated reminders before membership expiration',
      category: 'Finance',
      icon: RefreshCw,
      popularity: 88,
      estimatedImpact: 'High',
      setup: ['Set renewal timeline', 'Configure reminder templates', 'Set up payment links']
    },
    {
      id: 'feedback-collection',
      name: 'Post-Class Feedback Collection',
      description: 'Automatic feedback requests after class completion',
      category: 'Quality',
      icon: MessageSquare,
      popularity: 76,
      estimatedImpact: 'Medium',
      setup: ['Create feedback forms', 'Set timing parameters', 'Configure follow-up actions']
    },
    {
      id: 'weather-notifications',
      name: 'Weather-Based Class Alerts',
      description: 'Automatic notifications for outdoor class weather conditions',
      category: 'Operations',
      icon: MapPin,
      popularity: 69,
      estimatedImpact: 'Medium',
      setup: ['Connect weather API', 'Set weather thresholds', 'Configure notification templates']
    }
  ];

  const filteredAutomations = automations.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         automation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || automation.status === statusFilter;
    const matchesType = typeFilter === 'all' || automation.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Paused</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <Users className="h-4 w-4" />;
      case 'marketing':
        return <Target className="h-4 w-4" />;
      case 'operations':
        return <Settings className="h-4 w-4" />;
      case 'finance':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <Smartphone className="h-4 w-4" />;
      case 'push':
        return <Bell className="h-4 w-4" />;
      case 'webhook':
        return <Zap className="h-4 w-4" />;
      case 'discount':
        return <Target className="h-4 w-4" />;
      case 'reminder':
        return <Clock className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Automation Management</h1>
          <p className="text-muted-foreground">
            Create and manage automated workflows for your Swiss yoga studio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Zap className="h-4 w-4 mr-2" />
                Browse Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Automation Templates</DialogTitle>
                <DialogDescription>
                  Choose from pre-built automation templates designed for Swiss yoga studios
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <template.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-sm">{template.name}</CardTitle>
                            <CardDescription className="text-xs">{template.category}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {template.popularity}% use this
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={`text-xs ${
                          template.estimatedImpact === 'High' ? 'bg-green-100 text-green-700' :
                          template.estimatedImpact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {template.estimatedImpact} Impact
                        </Badge>
                        <span className="text-xs text-muted-foreground">{template.setup.length} setup steps</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowTemplateDialog(false);
                          setShowCreateDialog(true);
                        }}
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Automation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedTemplate ? `Create: ${selectedTemplate.name}` : 'Create New Automation'}
                </DialogTitle>
                <DialogDescription>
                  {selectedTemplate ? selectedTemplate.description : 'Build a custom automation workflow for your studio'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedTemplate && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Setup Steps:</h4>
                    <ul className="space-y-1">
                      {selectedTemplate.setup.map((step, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="automation-name">Automation Name</Label>
                    <Input 
                      id="automation-name" 
                      placeholder="Enter automation name"
                      defaultValue={selectedTemplate?.name || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="automation-type">Type</Label>
                    <Select defaultValue={selectedTemplate?.category.toLowerCase() || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer Experience</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="automation-description">Description</Label>
                  <Textarea 
                    id="automation-description" 
                    placeholder="Describe what this automation does"
                    defaultValue={selectedTemplate?.description || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="automation-trigger">Trigger Event</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new-customer">New Customer Registration</SelectItem>
                      <SelectItem value="booking-confirmed">Class Booking Confirmed</SelectItem>
                      <SelectItem value="payment-failed">Payment Failed</SelectItem>
                      <SelectItem value="no-activity">No Activity (Custom Period)</SelectItem>
                      <SelectItem value="birthday">Customer Birthday</SelectItem>
                      <SelectItem value="membership-expiring">Membership Expiring</SelectItem>
                      <SelectItem value="class-cancelled">Class Cancelled</SelectItem>
                      <SelectItem value="waitlist-spot">Waitlist Spot Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => {
                    setShowCreateDialog(false);
                    setSelectedTemplate(null);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    setShowCreateDialog(false);
                    setSelectedTemplate(null);
                  }}>
                    Create Automation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Automations</p>
                <p className="text-2xl font-semibold">12</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Play className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-semibold">3,258</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-semibold">94.2%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Saved</p>
                <p className="text-2xl font-semibold">18.5h</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Timer className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="automations" className="w-full">
        <TabsList>
          <TabsTrigger value="automations">Active Automations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search automations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Automations List */}
          <div className="space-y-4">
            {filteredAutomations.map((automation) => (
              <Card key={automation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        {getTypeIcon(automation.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{automation.name}</h3>
                          {getStatusBadge(automation.status)}
                          <div className="flex items-center gap-1">
                            {automation.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{automation.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Trigger:</span>
                            <p className="font-medium">{automation.trigger}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Executions:</span>
                            <p className="font-medium">{automation.executions.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Success Rate:</span>
                            <p className="font-medium text-green-600">{automation.successRate}%</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last Run:</span>
                            <p className="font-medium">
                              {new Date(automation.lastRun).toLocaleDateString('de-CH')}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-xs text-muted-foreground mb-2">Actions ({automation.actions.length}):</p>
                          <div className="flex items-center gap-2">
                            {automation.actions.map((action) => (
                              <div key={action.id} className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs">
                                {getActionIcon(action.type)}
                                <span>{action.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Switch checked={automation.status === 'active'} />
                        <Label className="text-sm">
                          {automation.status === 'active' ? 'Active' : 'Paused'}
                        </Label>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Automation</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>View Analytics</DropdownMenuItem>
                          <Separator />
                          <DropdownMenuItem className="text-destructive">
                            Delete Automation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Execution Performance</CardTitle>
                <CardDescription>Success rates by automation type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Customer Automations</span>
                    <div className="flex items-center gap-2">
                      <Progress value={94} className="w-20" />
                      <span className="text-sm font-medium">94%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Marketing Automations</span>
                    <div className="flex items-center gap-2">
                      <Progress value={87} className="w-20" />
                      <span className="text-sm font-medium">87%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Operations Automations</span>
                    <div className="flex items-center gap-2">
                      <Progress value={96} className="w-20" />
                      <span className="text-sm font-medium">96%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Finance Automations</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-20" />
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Impact</CardTitle>
                <CardDescription>Time and cost savings from automations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-800">Time Saved</p>
                      <p className="text-lg font-semibold text-green-900">72.5 hours</p>
                    </div>
                    <Timer className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Cost Savings</p>
                      <p className="text-lg font-semibold text-blue-900">CHF 2,890</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Customer Engagement</p>
                      <p className="text-lg font-semibold text-purple-900">+34%</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>Configure global settings for your automation system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Global Automation</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable all automations globally
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Execution Limits</Label>
                  <p className="text-sm text-muted-foreground">
                    Maximum automations per customer per day
                  </p>
                </div>
                <Select defaultValue="5">
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="unlimited">∞</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Failed Automation Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify administrators of automation failures
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Smart Scheduling</Label>
                  <p className="text-sm text-muted-foreground">
                    Optimize automation timing based on customer preferences
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}