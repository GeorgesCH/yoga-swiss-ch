import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Users, 
  Calendar,
  Target,
  BarChart3,
  Eye,
  MousePointer,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Pause,
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  Settings,
  DollarSign,
  TrendingUp,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Filter,
  Monitor
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { marketingService } from '../../utils/supabase/marketing-service';
import { useAuth } from '../auth/AuthProvider';

interface Campaign {
  id: string;
  name: string;
  type: 'blast' | 'recurring' | 'triggered' | 'ad_campaign';
  channel: 'email' | 'sms' | 'push' | 'whatsapp' | 'banner';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  audience_segment_id?: string;
  template_id?: string;
  scheduled_at?: string;
  sends_count: number;
  opens_count: number;
  clicks_count: number;
  conversions_count: number;
  revenue_total: number;
  cost_total: number;
  budget_json?: {
    max_spend: number;
    cost_per_send: number;
    currency: 'CHF';
  };
  ab_test_json?: {
    variants: Array<{
      name: string;
      percentage: number;
      template_id?: string;
      subject_line?: string;
      from_name?: string;
    }>;
    metric: 'open_rate' | 'click_rate' | 'conversion_rate' | 'revenue';
    duration_hours?: number;
  };
  holdout_pct: number;
  created_at: string;
  updated_at: string;
}

interface CreateCampaignData {
  name: string;
  type: Campaign['type'];
  channel: Campaign['channel'];
  audience_segment_id?: string;
  template_id?: string;
  schedule_json?: {
    send_at?: string;
    timezone?: string;
    quiet_hours?: { start: string; end: string };
    frequency_cap?: { period: 'day' | 'week' | 'month'; limit: number };
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      days?: number[];
      time?: string;
    };
  };
  ab_test_enabled: boolean;
  ab_test_json?: Campaign['ab_test_json'];
  holdout_pct?: number;
  budget_json?: Campaign['budget_json'];
  utm_params?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export function CampaignManagement() {
  const { currentOrg } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    channel: ''
  });
  
  // Create campaign form data
  const [createForm, setCreateForm] = useState<CreateCampaignData>({
    name: '',
    type: 'blast',
    channel: 'email',
    ab_test_enabled: false,
    holdout_pct: 0
  });

  useEffect(() => {
    if (currentOrg) {
      loadCampaigns();
      loadSegments();
      loadTemplates();
    }
  }, [currentOrg]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await marketingService.getCampaigns(currentOrg.id, {
        status: filters.status ? [filters.status] : undefined,
        type: filters.type ? [filters.type] : undefined,
        channel: filters.channel ? [filters.channel] : undefined
      });
      setCampaigns(data || []);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSegments = async () => {
    try {
      const data = await marketingService.getSegments(currentOrg.id);
      setSegments(data || []);
    } catch (error) {
      console.error('Failed to load segments:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await marketingService.getTemplates(currentOrg.id);
      setTemplates(data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      await marketingService.createCampaign(currentOrg.id, createForm);
      setCreateDialogOpen(false);
      loadCampaigns();
      // Reset form
      setCreateForm({
        name: '',
        type: 'blast',
        channel: 'email',
        ab_test_enabled: false,
        holdout_pct: 0
      });
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleScheduleCampaign = async (campaign: Campaign, sendAt: string) => {
    try {
      await marketingService.scheduleCampaign(campaign.id, sendAt);
      loadCampaigns();
    } catch (error) {
      console.error('Failed to schedule campaign:', error);
    }
  };

  const handleSendPreview = async (campaign: Campaign, email: string) => {
    try {
      await marketingService.sendCampaignPreview(campaign.id, email);
      alert('Preview sent successfully!');
    } catch (error) {
      console.error('Failed to send preview:', error);
      alert('Failed to send preview');
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      paused: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getChannelIcon = (channel: Campaign['channel']) => {
    const icons = {
      email: Mail,
      sms: MessageSquare,
      push: Smartphone,
      whatsapp: MessageSquare,
      banner: Monitor
    };
    const Icon = icons[channel] || Mail;
    return <Icon className="h-4 w-4" />;
  };

  const calculateMetrics = (campaign: Campaign) => {
    const openRate = campaign.sends_count > 0 ? (campaign.opens_count / campaign.sends_count * 100) : 0;
    const clickRate = campaign.opens_count > 0 ? (campaign.clicks_count / campaign.opens_count * 100) : 0;
    const conversionRate = campaign.clicks_count > 0 ? (campaign.conversions_count / campaign.clicks_count * 100) : 0;
    const roi = campaign.cost_total > 0 ? ((campaign.revenue_total - campaign.cost_total) / campaign.cost_total * 100) : 0;
    
    return { openRate, clickRate, conversionRate, roi };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Campaign Management</h2>
          <p className="text-muted-foreground">
            Create, manage, and analyze your marketing campaigns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setPreviewDialogOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Megaphone className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Select value={filters.status} onValueChange={(value) => setFilters(f => ({ ...f, status: value }))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.type} onValueChange={(value) => setFilters(f => ({ ...f, type: value }))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="blast">Blast</SelectItem>
            <SelectItem value="recurring">Recurring</SelectItem>
            <SelectItem value="triggered">Triggered</SelectItem>
            <SelectItem value="ad_campaign">Ad Campaign</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.channel} onValueChange={(value) => setFilters(f => ({ ...f, channel: value }))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Channels</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="push">Push</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="banner">Banner</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={loadCampaigns}>
          Apply Filters
        </Button>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
          <CardDescription>
            Manage your marketing campaigns and track performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const metrics = calculateMetrics(campaign);
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {campaign.sends_count.toLocaleString()} sends
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {campaign.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChannelIcon(campaign.channel)}
                          <span className="capitalize">{campaign.channel}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Eye className="h-3 w-3" />
                            {metrics.openRate.toFixed(1)}%
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MousePointer className="h-3 w-3" />
                            {metrics.clickRate.toFixed(1)}%
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <ShoppingCart className="h-3 w-3" />
                            CHF {campaign.revenue_total.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {campaign.budget_json ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              CHF {campaign.cost_total} / CHF {campaign.budget_json.max_spend}
                            </div>
                            <Progress 
                              value={(campaign.cost_total / campaign.budget_json.max_spend) * 100} 
                              className="h-1"
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No budget</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              setSelectedCampaign(campaign);
                              setAnalyticsDialogOpen(true);
                            }}>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Analytics
                            </DropdownMenuItem>
                            {campaign.status === 'draft' && (
                              <DropdownMenuItem onClick={() => {
                                const sendAt = new Date();
                                sendAt.setMinutes(sendAt.getMinutes() + 10);
                                handleScheduleCampaign(campaign, sendAt.toISOString());
                              }}>
                                <Play className="h-4 w-4 mr-2" />
                                Schedule Now
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleSendPreview(campaign, 'test@example.com')}>
                              <Send className="h-4 w-4 mr-2" />
                              Send Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Set up a new marketing campaign with targeting, scheduling, and testing options.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basics" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="testing">A/B Testing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basics" className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Enter campaign name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Campaign Type</Label>
                  <Select value={createForm.type} onValueChange={(value: any) => setCreateForm(f => ({ ...f, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blast">Blast Campaign</SelectItem>
                      <SelectItem value="recurring">Recurring Campaign</SelectItem>
                      <SelectItem value="triggered">Triggered Campaign</SelectItem>
                      <SelectItem value="ad_campaign">Ad Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="channel">Channel</Label>
                  <Select value={createForm.channel} onValueChange={(value: any) => setCreateForm(f => ({ ...f, channel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="banner">In-App Banner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="audience" className="space-y-4">
              <div>
                <Label htmlFor="segment">Target Segment</Label>
                <Select 
                  value={createForm.audience_segment_id} 
                  onValueChange={(value) => setCreateForm(f => ({ ...f, audience_segment_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        {segment.name} ({segment.live_count} members)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="template">Message Template</Label>
                <Select 
                  value={createForm.template_id} 
                  onValueChange={(value) => setCreateForm(f => ({ ...f, template_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select message template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.filter(t => t.type === createForm.channel).map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="holdout">Holdout Percentage</Label>
                <Input
                  id="holdout"
                  type="number"
                  min="0"
                  max="20"
                  value={createForm.holdout_pct}
                  onChange={(e) => setCreateForm(f => ({ ...f, holdout_pct: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Percentage of audience to hold out for measurement (0-20%)
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="schedule" className="space-y-4">
              <div>
                <Label htmlFor="send-time">Send Time</Label>
                <Input
                  id="send-time"
                  type="datetime-local"
                  value={createForm.schedule_json?.send_at || ''}
                  onChange={(e) => setCreateForm(f => ({
                    ...f,
                    schedule_json: { ...f.schedule_json, send_at: e.target.value }
                  }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quiet Hours Start</Label>
                  <Input
                    type="time"
                    value={createForm.schedule_json?.quiet_hours?.start || '22:00'}
                    onChange={(e) => setCreateForm(f => ({
                      ...f,
                      schedule_json: {
                        ...f.schedule_json,
                        quiet_hours: {
                          ...f.schedule_json?.quiet_hours,
                          start: e.target.value,
                          end: f.schedule_json?.quiet_hours?.end || '08:00'
                        }
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label>Quiet Hours End</Label>
                  <Input
                    type="time"
                    value={createForm.schedule_json?.quiet_hours?.end || '08:00'}
                    onChange={(e) => setCreateForm(f => ({
                      ...f,
                      schedule_json: {
                        ...f.schedule_json,
                        quiet_hours: {
                          ...f.schedule_json?.quiet_hours,
                          start: f.schedule_json?.quiet_hours?.start || '22:00',
                          end: e.target.value
                        }
                      }
                    }))}
                  />
                </div>
              </div>
              
              {createForm.type === 'recurring' && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium">Recurring Settings</h4>
                  <div>
                    <Label>Frequency</Label>
                    <Select 
                      value={createForm.schedule_json?.recurring?.frequency || 'weekly'}
                      onValueChange={(value: any) => setCreateForm(f => ({
                        ...f,
                        schedule_json: {
                          ...f.schedule_json,
                          recurring: {
                            ...f.schedule_json?.recurring,
                            frequency: value
                          }
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="testing" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={createForm.ab_test_enabled}
                  onCheckedChange={(checked) => setCreateForm(f => ({ ...f, ab_test_enabled: checked }))}
                />
                <Label>Enable A/B Testing</Label>
              </div>
              
              {createForm.ab_test_enabled && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div>
                    <Label>Primary Metric</Label>
                    <Select 
                      value={createForm.ab_test_json?.metric || 'open_rate'}
                      onValueChange={(value: any) => setCreateForm(f => ({
                        ...f,
                        ab_test_json: {
                          ...f.ab_test_json,
                          metric: value,
                          variants: f.ab_test_json?.variants || [
                            { name: 'Variant A', percentage: 50 },
                            { name: 'Variant B', percentage: 50 }
                          ]
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open_rate">Open Rate</SelectItem>
                        <SelectItem value="click_rate">Click Rate</SelectItem>
                        <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Test Duration (hours)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="168"
                      value={createForm.ab_test_json?.duration_hours || 24}
                      onChange={(e) => setCreateForm(f => ({
                        ...f,
                        ab_test_json: {
                          ...f.ab_test_json,
                          duration_hours: parseInt(e.target.value) || 24,
                          metric: f.ab_test_json?.metric || 'open_rate',
                          variants: f.ab_test_json?.variants || [
                            { name: 'Variant A', percentage: 50 },
                            { name: 'Variant B', percentage: 50 }
                          ]
                        }
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Test Variants</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Input 
                          placeholder="Variant A name" 
                          value={createForm.ab_test_json?.variants?.[0]?.name || 'Variant A'}
                          onChange={(e) => {
                            const variants = [...(createForm.ab_test_json?.variants || [])];
                            variants[0] = { ...variants[0], name: e.target.value };
                            setCreateForm(f => ({
                              ...f,
                              ab_test_json: { ...f.ab_test_json, variants }
                            }));
                          }}
                        />
                        <Input 
                          placeholder="Subject line A" 
                          value={createForm.ab_test_json?.variants?.[0]?.subject_line || ''}
                          onChange={(e) => {
                            const variants = [...(createForm.ab_test_json?.variants || [])];
                            variants[0] = { ...variants[0], subject_line: e.target.value };
                            setCreateForm(f => ({
                              ...f,
                              ab_test_json: { ...f.ab_test_json, variants }
                            }));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Input 
                          placeholder="Variant B name" 
                          value={createForm.ab_test_json?.variants?.[1]?.name || 'Variant B'}
                          onChange={(e) => {
                            const variants = [...(createForm.ab_test_json?.variants || [])];
                            variants[1] = { ...variants[1], name: e.target.value };
                            setCreateForm(f => ({
                              ...f,
                              ab_test_json: { ...f.ab_test_json, variants }
                            }));
                          }}
                        />
                        <Input 
                          placeholder="Subject line B" 
                          value={createForm.ab_test_json?.variants?.[1]?.subject_line || ''}
                          onChange={(e) => {
                            const variants = [...(createForm.ab_test_json?.variants || [])];
                            variants[1] = { ...variants[1], subject_line: e.target.value };
                            setCreateForm(f => ({
                              ...f,
                              ab_test_json: { ...f.ab_test_json, variants }
                            }));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} disabled={!createForm.name || !createForm.audience_segment_id}>
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Analytics Dialog */}
      <Dialog open={analyticsDialogOpen} onOpenChange={setAnalyticsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Campaign Analytics</DialogTitle>
            <DialogDescription>
              Detailed performance metrics for {selectedCampaign?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Sends</p>
                        <p className="text-2xl font-bold">{selectedCampaign.sends_count.toLocaleString()}</p>
                      </div>
                      <Send className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Opens</p>
                        <p className="text-2xl font-bold">{selectedCampaign.opens_count.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {calculateMetrics(selectedCampaign).openRate.toFixed(1)}% rate
                        </p>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Clicks</p>
                        <p className="text-2xl font-bold">{selectedCampaign.clicks_count.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {calculateMetrics(selectedCampaign).clickRate.toFixed(1)}% rate
                        </p>
                      </div>
                      <MousePointer className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="text-2xl font-bold">CHF {selectedCampaign.revenue_total.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {calculateMetrics(selectedCampaign).roi > 0 ? '+' : ''}{calculateMetrics(selectedCampaign).roi.toFixed(1)}% ROI
                        </p>
                      </div>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* A/B Test Results */}
              {selectedCampaign.ab_test_json && (
                <Card>
                  <CardHeader>
                    <CardTitle>A/B Test Results</CardTitle>
                    <CardDescription>
                      Testing {selectedCampaign.ab_test_json.metric.replace('_', ' ')} across variants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedCampaign.ab_test_json.variants.map((variant, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{variant.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {variant.percentage}% of traffic • {variant.subject_line}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              {index === 0 ? '24.5%' : '22.1%'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {selectedCampaign.ab_test_json.metric.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <p className="text-sm font-medium text-green-800">
                            Variant A is winning with 95% confidence
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setAnalyticsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}