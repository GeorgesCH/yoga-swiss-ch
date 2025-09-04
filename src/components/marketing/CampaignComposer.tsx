import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Save,
  Send,
  Eye,
  Calendar,
  Users,
  Settings,
  Image,
  Type,
  Layout,
  Link,
  BarChart3,
  TestTube,
  Clock,
  Smartphone,
  Monitor,
  Palette,
  Wand2,
  Plus,
  Trash2,
  GripVertical,
  Copy,
  Mail,
  Target,
  Gift,
  Heart,
  TrendingUp,
  Zap
} from 'lucide-react';

interface CampaignComposerProps {
  campaignId: string;
}

interface EmailBlock {
  id: string;
  type: 'header' | 'text' | 'image' | 'cta' | 'schedule' | 'spacer';
  content: any;
  settings: any;
}

export function CampaignComposer({ campaignId }: CampaignComposerProps) {
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('compose');

  // Mock campaign data
  const [campaignData, setCampaignData] = useState({
    id: campaignId === 'new' ? null : campaignId,
    name: campaignId === 'new' ? 'New Campaign' : 'New Year Yoga Challenge',
    subject: 'Transform Your Year with 30 Days of Yoga 🧘‍♀️',
    preheader: 'Join thousands who are starting their wellness journey',
    audience: 'all-subscribers',
    audienceSize: 2847,
    scheduledAt: null,
    abTest: {
      enabled: false,
      variants: ['A', 'B'],
      testMetric: 'open-rate',
      sampleSize: 20,
      duration: 60
    },
    blocks: [
      {
        id: '1',
        type: 'header' as const,
        content: {
          logo: '/images/logo.png',
          title: 'YogaSwiss',
          subtitle: 'Your Journey to Wellness'
        },
        settings: {
          backgroundColor: '#f8f9fa',
          textColor: '#1a1a1a'
        }
      },
      {
        id: '2',
        type: 'text' as const,
        content: {
          html: '<h1>New Year, New You: 30-Day Yoga Challenge</h1><p>Dear {{firstName}},</p><p>The new year is the perfect time to commit to your wellness journey. Join our 30-Day Yoga Challenge and discover the transformative power of daily practice.</p>'
        },
        settings: {
          padding: '20px',
          textAlign: 'left'
        }
      },
      {
        id: '3',
        type: 'image' as const,
        content: {
          src: '/images/yoga-challenge.jpg',
          alt: '30-Day Yoga Challenge',
          caption: 'Transform your practice in just 30 days'
        },
        settings: {
          width: '100%',
          alignment: 'center'
        }
      },
      {
        id: '4',
        type: 'cta' as const,
        content: {
          text: 'Join the Challenge',
          url: 'https://yogaswiss.ch/30-day-challenge',
          buttonText: 'Start Today'
        },
        settings: {
          buttonColor: '#007bff',
          buttonTextColor: '#ffffff',
          alignment: 'center'
        }
      }
    ] as EmailBlock[]
  });

  const audiences = [
    { value: 'all-subscribers', label: 'All Subscribers', size: 2847 },
    { value: 'active-members', label: 'Active Members', size: 1234 },
    { value: 'new-leads', label: 'New Leads (Last 30 days)', size: 456 },
    { value: 'advanced-practitioners', label: 'Advanced Practitioners', size: 789 },
    { value: 'workshop-interested', label: 'Workshop Interested', size: 567 }
  ];

  const blockTemplates = [
    {
      type: 'text',
      name: 'Text Block',
      icon: <Type className="h-4 w-4" />,
      description: 'Add rich text content'
    },
    {
      type: 'image',
      name: 'Image',
      icon: <Image className="h-4 w-4" />,
      description: 'Add images and photos'
    },
    {
      type: 'cta',
      name: 'Call to Action',
      icon: <Link className="h-4 w-4" />,
      description: 'Add buttons and links'
    },
    {
      type: 'schedule',
      name: 'Class Schedule',
      icon: <Calendar className="h-4 w-4" />,
      description: 'Show upcoming classes'
    },
    {
      type: 'spacer',
      name: 'Spacer',
      icon: <Layout className="h-4 w-4" />,
      description: 'Add white space'
    }
  ];

  const addBlock = (type: string, afterId?: string) => {
    const newBlock: EmailBlock = {
      id: `block-${Date.now()}`,
      type: type as any,
      content: getDefaultContent(type),
      settings: getDefaultSettings(type)
    };

    if (afterId) {
      const index = campaignData.blocks.findIndex(b => b.id === afterId);
      const newBlocks = [...campaignData.blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setCampaignData({ ...campaignData, blocks: newBlocks });
    } else {
      setCampaignData({ 
        ...campaignData, 
        blocks: [...campaignData.blocks, newBlock] 
      });
    }
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return { html: '<p>Add your text content here...</p>' };
      case 'image':
        return { src: '', alt: '', caption: '' };
      case 'cta':
        return { text: 'Click here', url: '', buttonText: 'Learn More' };
      case 'schedule':
        return { showDays: 7, location: 'all' };
      case 'spacer':
        return { height: 20 };
      default:
        return {};
    }
  };

  const getDefaultSettings = (type: string) => {
    switch (type) {
      case 'text':
        return { padding: '20px', textAlign: 'left' };
      case 'image':
        return { width: '100%', alignment: 'center' };
      case 'cta':
        return { buttonColor: '#007bff', buttonTextColor: '#ffffff', alignment: 'center' };
      default:
        return {};
    }
  };

  const removeBlock = (blockId: string) => {
    setCampaignData({
      ...campaignData,
      blocks: campaignData.blocks.filter(b => b.id !== blockId)
    });
  };

  const duplicateBlock = (blockId: string) => {
    const block = campaignData.blocks.find(b => b.id === blockId);
    if (block) {
      const newBlock = {
        ...block,
        id: `block-${Date.now()}`
      };
      const index = campaignData.blocks.findIndex(b => b.id === blockId);
      const newBlocks = [...campaignData.blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setCampaignData({ ...campaignData, blocks: newBlocks });
    }
  };

  const handleSendTest = () => {
    setShowTestDialog(false);
    console.log('Sending test email...');
  };

  const renderBlockPreview = (block: EmailBlock) => {
    switch (block.type) {
      case 'header':
        return (
          <div className="bg-gray-50 p-4 text-center border-b">
            <div className="font-bold text-lg">{block.content.title}</div>
            <div className="text-sm text-muted-foreground">{block.content.subtitle}</div>
          </div>
        );
      
      case 'text':
        return (
          <div 
            className="p-4"
            dangerouslySetInnerHTML={{ __html: block.content.html }}
          />
        );
      
      case 'image':
        return (
          <div className="p-4 text-center">
            <div className="bg-gray-200 h-32 rounded flex items-center justify-center">
              <Image className="h-8 w-8 text-gray-400" />
            </div>
            {block.content.caption && (
              <div className="text-sm text-muted-foreground mt-2">{block.content.caption}</div>
            )}
          </div>
        );
      
      case 'cta':
        return (
          <div className="p-4 text-center">
            <div className="mb-2">{block.content.text}</div>
            <Button 
              style={{ 
                backgroundColor: block.settings.buttonColor,
                color: block.settings.buttonTextColor 
              }}
            >
              {block.content.buttonText}
            </Button>
          </div>
        );
      
      case 'schedule':
        return (
          <div className="p-4">
            <div className="font-medium mb-2">Upcoming Classes</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Vinyasa Flow</span>
                <span>Today 9:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span>Yin Yoga</span>
                <span>Today 7:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Power Yoga</span>
                <span>Tomorrow 8:00 AM</span>
              </div>
            </div>
          </div>
        );
      
      case 'spacer':
        return (
          <div style={{ height: `${block.content.height}px` }} className="bg-gray-50">
          </div>
        );
      
      default:
        return <div className="p-4 text-center text-muted-foreground">Unknown block type</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{campaignData.name}</h3>
          <p className="text-muted-foreground">
            Design and configure your email campaign
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Send Test
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Send Test Email</DialogTitle>
                <DialogDescription>
                  Send a test version of your campaign to verify everything looks correct.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-emails">Test Email Addresses</Label>
                  <Textarea 
                    id="test-emails"
                    placeholder="Enter email addresses (one per line)"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowTestDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendTest}>
                    Send Test
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Email Builder */}
            <div className="lg:col-span-3 space-y-4">
              {/* Campaign Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Email Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject Line</Label>
                      <Input 
                        id="subject"
                        value={campaignData.subject}
                        onChange={(e) => setCampaignData({
                          ...campaignData,
                          subject: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preheader">Preheader Text</Label>
                      <Input 
                        id="preheader"
                        value={campaignData.preheader}
                        onChange={(e) => setCampaignData({
                          ...campaignData,
                          preheader: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="ab-test"
                        checked={campaignData.abTest.enabled}
                        onCheckedChange={(checked) => setCampaignData({
                          ...campaignData,
                          abTest: { ...campaignData.abTest, enabled: checked }
                        })}
                      />
                      <Label htmlFor="ab-test">Enable A/B Testing</Label>
                    </div>
                    {campaignData.abTest.enabled && (
                      <Badge variant="outline">
                        <TestTube className="h-3 w-3 mr-1" />
                        Subject Line Test
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Preview Controls */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Label>Preview:</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPreviewDevice('desktop')}
                        >
                          <Monitor className="h-4 w-4 mr-2" />
                          Desktop
                        </Button>
                        <Button
                          variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPreviewDevice('mobile')}
                        >
                          <Smartphone className="h-4 w-4 mr-2" />
                          Mobile
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Wand2 className="h-4 w-4 mr-2" />
                      AI Optimize
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Email Preview */}
              <Card>
                <CardContent className="p-0">
                  <div className={`mx-auto bg-white border ${previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-2xl'}`}>
                    {campaignData.blocks.map((block, index) => (
                      <div key={block.id} className="group relative">
                        {renderBlockPreview(block)}
                        
                        {/* Block Controls */}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="sm" variant="secondary" onClick={() => duplicateBlock(block.id)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => removeBlock(block.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {/* Add Block Button */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-white shadow-md"
                            onClick={() => addBlock('text', block.id)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Block Library */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add Blocks</CardTitle>
                  <CardDescription>Drag blocks to add them to your email</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {blockTemplates.map((template) => (
                    <Button
                      key={template.type}
                      variant="outline"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => addBlock(template.type)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-1">
                          {template.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">{template.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Email Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Newsletter
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Promotional
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Welcome Series
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Event Invitation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input 
                    id="campaign-name"
                    value={campaignData.name}
                    onChange={(e) => setCampaignData({
                      ...campaignData,
                      name: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender-name">Sender Name</Label>
                  <Input id="sender-name" defaultValue="YogaSwiss Team" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender-email">Sender Email</Label>
                  <Input id="sender-email" defaultValue="hello@yogaswiss.ch" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reply-to">Reply To</Label>
                  <Input id="reply-to" defaultValue="hello@yogaswiss.ch" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>A/B Testing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-ab">Enable A/B Testing</Label>
                  <Switch 
                    id="enable-ab"
                    checked={campaignData.abTest.enabled}
                    onCheckedChange={(checked) => setCampaignData({
                      ...campaignData,
                      abTest: { ...campaignData.abTest, enabled: checked }
                    })}
                  />
                </div>
                
                {campaignData.abTest.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="test-metric">Test Metric</Label>
                      <Select defaultValue="open-rate">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open-rate">Open Rate</SelectItem>
                          <SelectItem value="click-rate">Click Rate</SelectItem>
                          <SelectItem value="conversion">Conversion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sample-size">Sample Size (%)</Label>
                      <Input 
                        id="sample-size" 
                        type="number" 
                        defaultValue="20" 
                        min="10" 
                        max="50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test-duration">Test Duration (hours)</Label>
                      <Input 
                        id="test-duration" 
                        type="number" 
                        defaultValue="24" 
                        min="1" 
                        max="168" 
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Audience</CardTitle>
              <CardDescription>
                Choose who will receive this campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {audiences.map((audience) => (
                  <div
                    key={audience.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      campaignData.audience === audience.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    onClick={() => setCampaignData({
                      ...campaignData,
                      audience: audience.value,
                      audienceSize: audience.size
                    })}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{audience.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {audience.size.toLocaleString()} contacts
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Badge variant="outline">
                          {audience.size.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Campaign</CardTitle>
              <CardDescription>
                Choose when to send your campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input type="radio" id="send-now" name="schedule" defaultChecked />
                  <Label htmlFor="send-now">Send immediately</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" id="send-later" name="schedule" />
                  <Label htmlFor="send-later">Schedule for later</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-date">Date</Label>
                    <Input id="schedule-date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule-time">Time</Label>
                    <Input id="schedule-time" type="time" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" id="send-optimal" name="schedule" />
                  <Label htmlFor="send-optimal">Send at optimal time for each recipient</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}