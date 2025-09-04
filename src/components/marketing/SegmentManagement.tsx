import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Target,
  Plus,
  Sparkles,
  TrendingUp,
  Calendar,
  MapPin,
  Tag,
  DollarSign,
  CreditCard,
  Building2,
  Mail,
  MessageSquare,
  Smartphone,
  Eye,
  MousePointer,
  RefreshCw,
  Play,
  Settings,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  FileDown,
  AlertCircle,
  CheckCircle,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { marketingService } from '../../utils/supabase/marketing-service';
import { useAuth } from '../auth/AuthProvider';

interface Segment {
  id: string;
  name: string;
  description?: string;
  definition_json: SegmentDefinition;
  live_count: number;
  refreshed_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SegmentDefinition {
  profile_filters?: {
    locale?: string[];
    city?: string[];
    region?: string[];
    tags?: string[];
    source?: string[];
    corporate_membership?: boolean;
  };
  behavior_filters?: {
    classes_attended_min?: number;
    classes_attended_max?: number;
    last_booking_days_ago?: number;
    no_show_count_max?: number;
    waitlists_joined_min?: number;
    device_type?: string[];
  };
  finance_filters?: {
    spend_min?: number;
    spend_max?: number;
    ltv_min?: number;
    ltv_max?: number;
    membership_status?: string[];
    wallet_balance_min?: number;
    gift_card_holder?: boolean;
  };
  marketing_filters?: {
    consent_email?: boolean;
    consent_sms?: boolean;
    consent_push?: boolean;
    consent_whatsapp?: boolean;
    last_open_days_ago?: number;
    last_click_days_ago?: number;
    domain_risk_score_max?: number;
  };
}

interface SegmentPreview {
  person_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  locale: string;
  tags: string[];
  score: number;
}

const PREDEFINED_SEGMENTS = [
  {
    name: 'High Value Customers',
    description: 'Customers with high lifetime value and engagement',
    definition: {
      finance_filters: { ltv_min: 500 },
      behavior_filters: { classes_attended_min: 10, no_show_count_max: 2 },
      marketing_filters: { consent_email: true }
    }
  },
  {
    name: 'New Students (Last 30 Days)',
    description: 'Recently joined members who need onboarding',
    definition: {
      behavior_filters: { classes_attended_max: 3 },
      marketing_filters: { consent_email: true }
    }
  },
  {
    name: 'At-Risk Customers',
    description: 'Members with declining engagement',
    definition: {
      behavior_filters: { last_booking_days_ago: 30, classes_attended_min: 3 },
      marketing_filters: { consent_email: true }
    }
  },
  {
    name: 'Corporate Clients',
    description: 'Business and corporate account members',
    definition: {
      profile_filters: { corporate_membership: true },
      marketing_filters: { consent_email: true }
    }
  },
  {
    name: 'Premium Members',
    description: 'Elite and unlimited membership holders',
    definition: {
      finance_filters: { membership_status: ['premium', 'unlimited'] },
      marketing_filters: { consent_email: true }
    }
  },
  {
    name: 'Referral Champions',
    description: 'Top referrers and brand ambassadors',
    definition: {
      behavior_filters: { classes_attended_min: 15 },
      marketing_filters: { consent_email: true, consent_sms: true }
    }
  }
];

export function SegmentManagement() {
  const { currentOrg } = useAuth();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [segmentPreview, setSegmentPreview] = useState<SegmentPreview[]>([]);
  const [previewCount, setPreviewCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create segment form
  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');
  const [segmentDefinition, setSegmentDefinition] = useState<SegmentDefinition>({});
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (currentOrg) {
      loadSegments();
    }
  }, [currentOrg]);

  const loadSegments = async () => {
    try {
      setLoading(true);
      const data = await marketingService.getSegments(currentOrg.id);
      setSegments(data || []);
    } catch (error) {
      console.error('Failed to load segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSegment = async () => {
    if (!segmentName || !currentOrg) return;

    try {
      await marketingService.createSegment(currentOrg.id, segmentName, segmentDefinition);
      setCreateDialogOpen(false);
      loadSegments();
      // Reset form
      setSegmentName('');
      setSegmentDescription('');
      setSegmentDefinition({});
      setActiveTab('profile');
    } catch (error) {
      console.error('Failed to create segment:', error);
    }
  };

  const handlePreviewSegment = async (definition: SegmentDefinition) => {
    if (!currentOrg) return;

    try {
      const preview = await marketingService.getSegmentPreview(currentOrg.id, definition, 50);
      setSegmentPreview(preview || []);
      setPreviewCount(preview?.length || 0);
    } catch (error) {
      console.error('Failed to preview segment:', error);
    }
  };

  const handleRefreshSegment = async (segmentId: string) => {
    try {
      await marketingService.refreshSegment(segmentId);
      loadSegments();
    } catch (error) {
      console.error('Failed to refresh segment:', error);
    }
  };

  const handleUsePredefinedSegment = (predefined: typeof PREDEFINED_SEGMENTS[0]) => {
    setSegmentName(predefined.name);
    setSegmentDescription(predefined.description);
    setSegmentDefinition(predefined.definition);
  };

  const updateProfileFilter = (key: keyof NonNullable<SegmentDefinition['profile_filters']>, value: any) => {
    setSegmentDefinition(prev => ({
      ...prev,
      profile_filters: {
        ...prev.profile_filters,
        [key]: value
      }
    }));
  };

  const updateBehaviorFilter = (key: keyof NonNullable<SegmentDefinition['behavior_filters']>, value: any) => {
    setSegmentDefinition(prev => ({
      ...prev,
      behavior_filters: {
        ...prev.behavior_filters,
        [key]: value
      }
    }));
  };

  const updateFinanceFilter = (key: keyof NonNullable<SegmentDefinition['finance_filters']>, value: any) => {
    setSegmentDefinition(prev => ({
      ...prev,
      finance_filters: {
        ...prev.finance_filters,
        [key]: value
      }
    }));
  };

  const updateMarketingFilter = (key: keyof NonNullable<SegmentDefinition['marketing_filters']>, value: any) => {
    setSegmentDefinition(prev => ({
      ...prev,
      marketing_filters: {
        ...prev.marketing_filters,
        [key]: value
      }
    }));
  };

  const getFilterSummary = (definition: SegmentDefinition) => {
    const filters = [];
    
    if (definition.profile_filters) {
      if (definition.profile_filters.locale?.length) filters.push(`Locale: ${definition.profile_filters.locale.join(', ')}`);
      if (definition.profile_filters.city?.length) filters.push(`City: ${definition.profile_filters.city.join(', ')}`);
      if (definition.profile_filters.corporate_membership) filters.push('Corporate members');
    }
    
    if (definition.behavior_filters) {
      if (definition.behavior_filters.classes_attended_min) filters.push(`≥${definition.behavior_filters.classes_attended_min} classes`);
      if (definition.behavior_filters.last_booking_days_ago) filters.push(`Inactive ${definition.behavior_filters.last_booking_days_ago}+ days`);
    }
    
    if (definition.finance_filters) {
      if (definition.finance_filters.spend_min) filters.push(`Spend ≥CHF ${definition.finance_filters.spend_min}`);
      if (definition.finance_filters.ltv_min) filters.push(`LTV ≥CHF ${definition.finance_filters.ltv_min}`);
    }
    
    if (definition.marketing_filters) {
      const consents = [];
      if (definition.marketing_filters.consent_email) consents.push('Email');
      if (definition.marketing_filters.consent_sms) consents.push('SMS');
      if (definition.marketing_filters.consent_push) consents.push('Push');
      if (consents.length) filters.push(`Consent: ${consents.join(', ')}`);
    }
    
    return filters.length > 0 ? filters.join(' • ') : 'No filters applied';
  };

  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    segment.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Customer Segments</h2>
          <p className="text-muted-foreground">
            Target specific customer groups with personalized campaigns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setPreviewDialogOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Target className="h-4 w-4 mr-2" />
            New Segment
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search segments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                  <div className="flex justify-between">
                    <div className="h-8 bg-muted rounded w-16"></div>
                    <div className="h-8 bg-muted rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          filteredSegments.map((segment) => (
            <Card key={segment.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{segment.name}</CardTitle>
                    {segment.description && (
                      <CardDescription className="mt-1">
                        {segment.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handlePreviewSegment(segment.definition_json)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Members
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRefreshSegment(segment.id)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Count
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Play className="h-4 w-4 mr-2" />
                        Create Campaign
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileDown className="h-4 w-4 mr-2" />
                        Export List
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
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Member Count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Members</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">{segment.live_count.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Filter Summary */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">FILTERS</p>
                    <p className="text-sm leading-relaxed">
                      {getFilterSummary(segment.definition_json)}
                    </p>
                  </div>

                  {/* Status & Last Refresh */}
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant={segment.is_active ? 'default' : 'secondary'}>
                      {segment.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {segment.refreshed_at && (
                      <span className="text-xs text-muted-foreground">
                        Updated {new Date(segment.refreshed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Target className="h-3 w-3 mr-1" />
                      Target
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Segment Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Customer Segment</DialogTitle>
            <DialogDescription>
              Build targeted segments using customer data, behavior, and preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="segment-name">Segment Name</Label>
                <Input
                  id="segment-name"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                  placeholder="Enter segment name"
                />
              </div>
              <div>
                <Label htmlFor="segment-description">Description (optional)</Label>
                <Input
                  id="segment-description"
                  value={segmentDescription}
                  onChange={(e) => setSegmentDescription(e.target.value)}
                  placeholder="Describe this segment"
                />
              </div>
            </div>

            {/* Predefined Templates */}
            <div>
              <Label className="text-base font-medium">Quick Start Templates</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {PREDEFINED_SEGMENTS.map((predefined, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto p-3"
                    onClick={() => handleUsePredefinedSegment(predefined)}
                  >
                    <div>
                      <div className="font-medium">{predefined.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {predefined.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Filter Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">
                  <Users className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="behavior">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Behavior
                </TabsTrigger>
                <TabsTrigger value="finance">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Finance
                </TabsTrigger>
                <TabsTrigger value="marketing">
                  <Mail className="h-4 w-4 mr-2" />
                  Marketing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Location (Locale)</Label>
                    <div className="space-y-2">
                      {['de-CH', 'fr-CH', 'it-CH', 'en-CH'].map((locale) => (
                        <div key={locale} className="flex items-center space-x-2">
                          <Checkbox
                            checked={segmentDefinition.profile_filters?.locale?.includes(locale) || false}
                            onCheckedChange={(checked) => {
                              const current = segmentDefinition.profile_filters?.locale || [];
                              updateProfileFilter('locale', 
                                checked 
                                  ? [...current, locale]
                                  : current.filter(l => l !== locale)
                              );
                            }}
                          />
                          <Label>{locale}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Cities</Label>
                    <Input
                      placeholder="e.g., Zurich, Geneva, Basel"
                      value={segmentDefinition.profile_filters?.city?.join(', ') || ''}
                      onChange={(e) => updateProfileFilter('city', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Tags</Label>
                  <Input
                    placeholder="e.g., vip, new-member, instructor-friend"
                    value={segmentDefinition.profile_filters?.tags?.join(', ') || ''}
                    onChange={(e) => updateProfileFilter('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  />
                </div>
                
                <div>
                  <Label>Registration Source</Label>
                  <Input
                    placeholder="e.g., website, referral, social-media"
                    value={segmentDefinition.profile_filters?.source?.join(', ') || ''}
                    onChange={(e) => updateProfileFilter('source', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={segmentDefinition.profile_filters?.corporate_membership || false}
                    onCheckedChange={(checked) => updateProfileFilter('corporate_membership', checked)}
                  />
                  <Label>Corporate Members Only</Label>
                </div>
              </TabsContent>

              <TabsContent value="behavior" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Classes Attended (Min)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={segmentDefinition.behavior_filters?.classes_attended_min || ''}
                      onChange={(e) => updateBehaviorFilter('classes_attended_min', parseInt(e.target.value) || undefined)}
                    />
                  </div>
                  <div>
                    <Label>Classes Attended (Max)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={segmentDefinition.behavior_filters?.classes_attended_max || ''}
                      onChange={(e) => updateBehaviorFilter('classes_attended_max', parseInt(e.target.value) || undefined)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Days Since Last Booking</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g., 30 for inactive 30+ days"
                    value={segmentDefinition.behavior_filters?.last_booking_days_ago || ''}
                    onChange={(e) => updateBehaviorFilter('last_booking_days_ago', parseInt(e.target.value) || undefined)}
                  />
                </div>
                
                <div>
                  <Label>Max No-Shows</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g., 3 to exclude frequent no-shows"
                    value={segmentDefinition.behavior_filters?.no_show_count_max || ''}
                    onChange={(e) => updateBehaviorFilter('no_show_count_max', parseInt(e.target.value) || undefined)}
                  />
                </div>
                
                <div>
                  <Label>Waitlists Joined (Min)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g., 2 for engaged members"
                    value={segmentDefinition.behavior_filters?.waitlists_joined_min || ''}
                    onChange={(e) => updateBehaviorFilter('waitlists_joined_min', parseInt(e.target.value) || undefined)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="finance" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Spend (Min CHF)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={segmentDefinition.finance_filters?.spend_min || ''}
                      onChange={(e) => updateFinanceFilter('spend_min', parseFloat(e.target.value) || undefined)}
                    />
                  </div>
                  <div>
                    <Label>Total Spend (Max CHF)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={segmentDefinition.finance_filters?.spend_max || ''}
                      onChange={(e) => updateFinanceFilter('spend_max', parseFloat(e.target.value) || undefined)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Lifetime Value (Min CHF)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={segmentDefinition.finance_filters?.ltv_min || ''}
                      onChange={(e) => updateFinanceFilter('ltv_min', parseFloat(e.target.value) || undefined)}
                    />
                  </div>
                  <div>
                    <Label>Lifetime Value (Max CHF)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={segmentDefinition.finance_filters?.ltv_max || ''}
                      onChange={(e) => updateFinanceFilter('ltv_max', parseFloat(e.target.value) || undefined)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Membership Status</Label>
                  <div className="space-y-2">
                    {['active', 'paused', 'expired', 'premium', 'unlimited'].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          checked={segmentDefinition.finance_filters?.membership_status?.includes(status) || false}
                          onCheckedChange={(checked) => {
                            const current = segmentDefinition.finance_filters?.membership_status || [];
                            updateFinanceFilter('membership_status', 
                              checked 
                                ? [...current, status]
                                : current.filter(s => s !== status)
                            );
                          }}
                        />
                        <Label className="capitalize">{status}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Minimum Wallet Balance (CHF)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={segmentDefinition.finance_filters?.wallet_balance_min || ''}
                    onChange={(e) => updateFinanceFilter('wallet_balance_min', parseFloat(e.target.value) || undefined)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={segmentDefinition.finance_filters?.gift_card_holder || false}
                    onCheckedChange={(checked) => updateFinanceFilter('gift_card_holder', checked)}
                  />
                  <Label>Gift Card Holders Only</Label>
                </div>
              </TabsContent>

              <TabsContent value="marketing" className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Marketing Consent</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={segmentDefinition.marketing_filters?.consent_email || false}
                        onCheckedChange={(checked) => updateMarketingFilter('consent_email', checked)}
                      />
                      <Mail className="h-4 w-4" />
                      <Label>Email Marketing Consent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={segmentDefinition.marketing_filters?.consent_sms || false}
                        onCheckedChange={(checked) => updateMarketingFilter('consent_sms', checked)}
                      />
                      <MessageSquare className="h-4 w-4" />
                      <Label>SMS Marketing Consent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={segmentDefinition.marketing_filters?.consent_push || false}
                        onCheckedChange={(checked) => updateMarketingFilter('consent_push', checked)}
                      />
                      <Smartphone className="h-4 w-4" />
                      <Label>Push Notification Consent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={segmentDefinition.marketing_filters?.consent_whatsapp || false}
                        onCheckedChange={(checked) => updateMarketingFilter('consent_whatsapp', checked)}
                      />
                      <MessageSquare className="h-4 w-4" />
                      <Label>WhatsApp Marketing Consent</Label>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Days Since Last Email Open</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g., 30 for re-engagement"
                      value={segmentDefinition.marketing_filters?.last_open_days_ago || ''}
                      onChange={(e) => updateMarketingFilter('last_open_days_ago', parseInt(e.target.value) || undefined)}
                    />
                  </div>
                  <div>
                    <Label>Days Since Last Click</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g., 60 for dormant users"
                      value={segmentDefinition.marketing_filters?.last_click_days_ago || ''}
                      onChange={(e) => updateMarketingFilter('last_click_days_ago', parseInt(e.target.value) || undefined)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Maximum Domain Risk Score</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g., 70 to exclude risky domains"
                    value={segmentDefinition.marketing_filters?.domain_risk_score_max || ''}
                    onChange={(e) => updateMarketingFilter('domain_risk_score_max', parseInt(e.target.value) || undefined)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Lower scores indicate better deliverability (0-100)
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Preview Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-medium">Segment Preview</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePreviewSegment(segmentDefinition)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview ({previewCount} members)
                </Button>
              </div>
              
              {segmentPreview.length > 0 && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Locale</TableHead>
                        <TableHead>Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {segmentPreview.slice(0, 10).map((member, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {member.first_name} {member.last_name}
                          </TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>{member.locale}</TableCell>
                          <TableCell>{member.score}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateSegment}
              disabled={!segmentName}
            >
              Create Segment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Segment Preview</DialogTitle>
            <DialogDescription>
              Sample members from your segment
            </DialogDescription>
          </DialogHeader>
          
          {segmentPreview.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min(segmentPreview.length, 10)} of {previewCount} members
                </p>
                <Badge variant="secondary">
                  {previewCount.toLocaleString()} total members
                </Badge>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Locale</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segmentPreview.slice(0, 10).map((member, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {member.first_name} {member.last_name}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.locale}</TableCell>
                      <TableCell>{member.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No preview available. Create a segment to see member data.</p>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}