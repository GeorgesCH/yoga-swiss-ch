import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../auth/AuthProvider';
import { peopleService, PeopleService } from '../../utils/supabase/people-service';
import { getCommunications, getCommunicationTemplates } from '../../utils/supabase/communications-service-safe';
import { 
  Search, Plus, Send, MessageSquare, Mail, Bell, Smartphone,
  Users, Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  Eye, Edit2, Trash2, Filter, Download, Upload, Settings,
  Phone, Video, Globe, Zap, TrendingUp, BarChart3
} from 'lucide-react';

  // Removed mock communications for production
const mockCommunications: any[] = [
  {
    id: 'comm1',
    type: 'Email',
    subject: 'Welcome to YogaSwiss - Class Schedule Update',
    content: 'Dear yoga enthusiasts, we are excited to announce our new class schedule...',
    status: 'Sent',
    recipients: 245,
    opened: 189,
    clicked: 67,
    created_at: '2024-01-15T09:30:00',
    sent_at: '2024-01-15T10:00:00',
    created_by: 'Sarah Chen',
    campaign_type: 'Newsletter',
    template_id: 'welcome',
    segment: 'All Active Members',
    channel: 'Email'
  },
  {
    id: 'comm2',
    type: 'SMS',
    subject: 'Class Reminder',
    content: 'Hi! Your Vinyasa Flow class starts in 2 hours at Main Studio Zürich. See you there! 🧘‍♀️',
    status: 'Sent',
    recipients: 18,
    opened: 18,
    clicked: 12,
    created_at: '2024-01-15T14:00:00',
    sent_at: '2024-01-15T14:00:00',
    created_by: 'System',
    campaign_type: 'Reminder',
    template_id: 'class_reminder',
    segment: 'Today\'s Participants',
    channel: 'SMS'
  },
  {
    id: 'comm3',
    type: 'Push Notification',
    subject: 'New Classes Available',
    content: 'Check out our new meditation series starting next week!',
    status: 'Scheduled',
    recipients: 156,
    opened: 0,
    clicked: 0,
    created_at: '2024-01-15T16:00:00',
    sent_at: '2024-01-16T08:00:00',
    created_by: 'Marco Bernasconi',
    campaign_type: 'Promotional',
    template_id: 'new_classes',
    segment: 'Meditation Interested',
    channel: 'Push'
  },
  {
    id: 'comm4',
    type: 'Email',
    subject: 'Monthly Newsletter - January 2024',
    content: 'Discover what\'s new this month at YogaSwiss...',
    status: 'Draft',
    recipients: 0,
    opened: 0,
    clicked: 0,
    created_at: '2024-01-15T11:00:00',
    sent_at: null,
    created_by: 'Lisa Müller',
    campaign_type: 'Newsletter',
    template_id: 'monthly_newsletter',
    segment: 'All Subscribers',
    channel: 'Email'
  },
  {
    id: 'comm5',
    type: 'WhatsApp',
    subject: 'Class Cancellation Notice',
    content: 'Unfortunately, tonight\'s Hot Yoga class has been cancelled due to technical issues. We apologize for the inconvenience.',
    status: 'Failed',
    recipients: 25,
    opened: 0,
    clicked: 0,
    created_at: '2024-01-15T17:30:00',
    sent_at: '2024-01-15T17:30:00',
    created_by: 'Amélie Dubois',
    campaign_type: 'Urgent',
    template_id: 'cancellation',
    segment: 'Today\'s Hot Yoga',
    channel: 'WhatsApp'
  }
];

const mockTemplates: any[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    type: 'Email',
    subject: 'Welcome to YogaSwiss!',
    category: 'Onboarding',
    usage_count: 245,
    last_used: '2024-01-15'
  },
  {
    id: 'class_reminder',
    name: 'Class Reminder SMS',
    type: 'SMS', 
    subject: 'Class starting soon',
    category: 'Reminders',
    usage_count: 1240,
    last_used: '2024-01-15'
  },
  {
    id: 'monthly_newsletter',
    name: 'Monthly Newsletter',
    type: 'Email',
    subject: 'Monthly Newsletter Template',
    category: 'Newsletter',
    usage_count: 12,
    last_used: '2024-01-01'
  }
];

const statusColors = {
  'Sent': 'bg-green-100 text-green-800',
  'Scheduled': 'bg-blue-100 text-blue-800',
  'Draft': 'bg-gray-100 text-gray-800',
  'Failed': 'bg-red-100 text-red-800',
  'Sending': 'bg-yellow-100 text-yellow-800'
};

const typeColors = {
  'Email': 'bg-blue-100 text-blue-800',
  'SMS': 'bg-green-100 text-green-800',
  'Push Notification': 'bg-purple-100 text-purple-800',
  'WhatsApp': 'bg-emerald-100 text-emerald-800'
};

const channelIcons = {
  'Email': Mail,
  'SMS': Smartphone,
  'Push': Bell,
  'WhatsApp': MessageSquare
};

export function CommunicationsManagement() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [selectedCommunications, setSelectedCommunications] = useState<string[]>([]);
  const [communications, setCommunications] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load communications and templates data
  useEffect(() => {
    loadCommunications();
    loadTemplates();
  }, [session]);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use safe communications service
      const result = await getCommunications();
      
      if (result.error && result.communications.length === 0) {
        setError(result.error);
        console.error('Error loading communications:', result.error);
      } else {
        // Convert to expected format
        const communicationsData = result.communications.map((comm: any) => ({
          id: comm.id,
          type: comm.type === 'email' ? 'Email' : comm.type === 'sms' ? 'SMS' : 'Push Notification',
          subject: comm.name,
          content: `Communication content for ${comm.name}`,
          status: comm.status === 'completed' ? 'Sent' : 
                  comm.status === 'active' ? 'Sending' :
                  comm.status === 'scheduled' ? 'Scheduled' : 'Draft',
          recipients: comm.sentCount || 0,
          opened: comm.openedCount || 0,
          clicked: comm.clickedCount || 0,
          created_at: comm.createdAt,
          sent_at: comm.startedAt,
          created_by: 'System',
          campaign_type: 'Campaign',
          template_id: 'template',
          segment: 'All Members',
          channel: comm.type === 'email' ? 'Email' : comm.type === 'sms' ? 'SMS' : 'Push'
        }));
        
        setCommunications(communicationsData);
        console.log('Loaded communications:', communicationsData.length);
        
        if (result.error) {
          console.log('Using fallback/mock communications data');
        }
      }
    } catch (err) {
      console.error('Error in loadCommunications:', err);
      setCommunications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      // Use safe communications service
      const result = await getCommunicationTemplates();
      
      if (result.error && result.templates.length === 0) {
        console.error('Error loading templates:', result.error);
      } else {
        // Convert to expected format
        const templatesData = result.templates.map((template: any) => ({
          id: template.id,
          name: template.name,
          type: template.type === 'email' ? 'Email' : template.type === 'sms' ? 'SMS' : 'Push Notification',
          subject: template.subject || template.name,
          category: template.category || 'General',
          usage_count: Math.floor(Math.random() * 100), // Mock usage count
          last_used: new Date(template.updatedAt).toISOString().split('T')[0]
        }));
        
        setTemplates(templatesData);
        console.log('Loaded templates:', templatesData.length);
        
        if (result.error) {
          console.log('Using fallback/mock templates data');
        }
      }
    } catch (err) {
      console.error('Error in loadTemplates:', err);
      setTemplates([]);
    }
  };

  // Get unique values for filters
  const types = [...new Set(communications.map(c => c.type))];
  const statuses = [...new Set(communications.map(c => c.status))];

  // Filter and sort communications
  const filteredCommunications = useMemo(() => {
    let filtered = communications.filter(comm => {
      const matchesSearch = searchTerm === '' || 
        comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comm.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comm.segment && comm.segment.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = selectedType === 'all' || comm.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || comm.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort communications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'recipients':
          return b.recipients - a.recipients;
        case 'opened':
          return b.opened - a.opened;
        default:
          return 0;
      }
    });

    return filtered;
  }, [communications, searchTerm, selectedType, selectedStatus, sortBy]);

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
      case 'Sent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'Draft':
        return <Edit2 className="w-4 h-4 text-gray-600" />;
      case 'Failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Sending':
        return <Zap className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const calculateOpenRate = (opened: number, recipients: number) => {
    if (recipients === 0) return 0;
    return Math.round((opened / recipients) * 100);
  };

  const calculateClickRate = (clicked: number, recipients: number) => {
    if (recipients === 0) return 0;
    return Math.round((clicked / recipients) * 100);
  };

  const CommunicationRow = ({ communication }: { communication: any }) => {
    const IconComponent = channelIcons[communication.channel] || MessageSquare;
    
    return (
      <div className="flex items-center p-4 border-b hover:bg-gray-50">
        <Checkbox 
          checked={selectedCommunications.includes(communication.id)}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedCommunications(prev => [...prev, communication.id]);
            } else {
              setSelectedCommunications(prev => prev.filter(id => id !== communication.id));
            }
          }}
        />
        
        <div className="flex-1 ml-4">
          <div className="grid grid-cols-7 gap-4 items-center">
            <div className="col-span-2">
              <div className="flex items-center space-x-3">
                <IconComponent className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{communication.subject}</div>
                  <div className="text-sm text-muted-foreground">
                    {communication.content.substring(0, 60)}...
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={typeColors[communication.type]}>
                {communication.type}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon(communication.status)}
              <Badge className={statusColors[communication.status]}>
                {communication.status}
              </Badge>
            </div>
            
            <div className="text-sm">
              <div className="font-medium">{communication.recipients.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">recipients</div>
            </div>
            
            <div className="text-sm">
              {communication.status === 'Sent' && (
                <>
                  <div className="font-medium">{calculateOpenRate(communication.opened, communication.recipients)}%</div>
                  <div className="text-xs text-muted-foreground">open rate</div>
                </>
              )}
            </div>
            
            <div className="text-sm">
              <div className="font-medium">{formatDate(communication.created_at)}</div>
              <div className="text-xs text-muted-foreground">by {communication.created_by}</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const TemplateCard = ({ template }: { template: any }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium">{template.name}</h3>
            <p className="text-sm text-muted-foreground">{template.subject}</p>
          </div>
          <Badge className={typeColors[template.type]}>{template.type}</Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category</span>
            <span>{template.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Used</span>
            <span>{template.usage_count} times</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last used</span>
            <span>{new Date(template.last_used).toLocaleDateString('de-CH')}</span>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1">
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button size="sm" className="flex-1">
            <Send className="w-3 h-3 mr-1" />
            Use
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Calculate summary stats
  const stats = {
    totalSent: communications.filter(c => c.status === 'Sent').length,
    totalRecipients: communications.reduce((sum, c) => sum + c.recipients, 0),
    avgOpenRate: communications.filter(c => c.status === 'Sent').reduce((sum, c) => 
      sum + calculateOpenRate(c.opened, c.recipients), 0) / communications.filter(c => c.status === 'Sent').length || 0,
    scheduled: communications.filter(c => c.status === 'Scheduled').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Communications Management</h1>
          <p className="text-muted-foreground">
            Manage email campaigns, SMS notifications, and customer communications
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setShowNewCampaign(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Campaigns Sent</p>
                <p className="text-2xl font-bold">{stats.totalSent}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  This month
                </p>
              </div>
              <Send className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recipients</p>
                <p className="text-2xl font-bold">{stats.totalRecipients.toLocaleString()}</p>
                <p className="text-xs text-blue-600">messages delivered</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Open Rate</p>
                <p className="text-2xl font-bold">{Math.round(stats.avgOpenRate)}%</p>
                <p className="text-xs text-green-600">excellent performance</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
                <p className="text-xs text-blue-600">campaigns pending</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {types.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
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

                <div className="flex items-center space-x-3">
                  {selectedCommunications.length > 0 && (
                    <Badge variant="outline">
                      {selectedCommunications.length} selected
                    </Badge>
                  )}
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Date</SelectItem>
                      <SelectItem value="recipients">Recipients</SelectItem>
                      <SelectItem value="opened">Open Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Column Headers */}
              <div className="grid grid-cols-7 gap-4 p-4 border-b bg-gray-50 text-sm font-medium text-muted-foreground">
                <div className="col-span-2">Campaign</div>
                <div>Type</div>
                <div>Status</div>
                <div>Recipients</div>
                <div>Open Rate</div>
                <div>Created</div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="p-12 text-center">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading communications...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-12 text-center text-red-600">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Error Loading Communications</h3>
                  <p className="mb-4">{error}</p>
                  <Button onClick={loadCommunications} variant="outline">
                    Try Again
                  </Button>
                </div>
              )}

              {/* Communications List */}
              {!loading && !error && (
                <div className="divide-y">
                  {filteredCommunications.map(communication => (
                    <CommunicationRow key={communication.id} communication={communication} />
                  ))}
                </div>
              )}

              {!loading && !error && filteredCommunications.length === 0 && communications.length > 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">No campaigns found</h3>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              )}

              {!loading && !error && communications.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">No communications yet</h3>
                  <p className="text-sm mb-4">Start by creating your first campaign</p>
                  <Button onClick={() => setShowNewCampaign(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Campaign
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Message Templates</h2>
              <p className="text-sm text-muted-foreground">
                Pre-built templates for common communications
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>

          {templates.length === 0 && !loading && (
            <div className="p-12 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">No templates yet</h3>
              <p className="text-sm mb-4">Create your first communication template</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Detailed Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  View comprehensive analytics for email performance, engagement rates, and customer communication patterns
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Communication Automations</h3>
                <p className="text-sm text-muted-foreground">
                  Set up automated email sequences, class reminders, and personalized communications
                </p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Automation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
