import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { 
  Plus,
  Mail,
  Target,
  Users,
  Calendar,
  Gift,
  Heart,
  TrendingUp,
  Zap,
  FileText,
  Copy,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Star,
  Clock,
  Send,
  BarChart3,
  Settings,
  Filter,
  Search,
  MoreHorizontal,
  Play,
  Save
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';

interface EmailTemplate {
  id: string;
  name: string;
  type: 'newsletter' | 'promotional' | 'welcome' | 'event' | 'winback' | 'birthday' | 'renewal' | 'reminder';
  description: string;
  subject: string;
  previewText: string;
  category: string;
  isPopular: boolean;
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
  tags: string[];
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  steps: number;
  estimatedTime: string;
  category: string;
  isPopular: boolean;
  usageCount: number;
  conversionRate?: number;
  tags: string[];
}

export function MarketingTemplates() {
  const [activeTab, setActiveTab] = useState('email-templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | AutomationTemplate | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<EmailTemplate | AutomationTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<EmailTemplate | AutomationTemplate | null>(null);
  const [createTemplateType, setCreateTemplateType] = useState<'email' | 'automation'>('email');

  // Mock email templates - using state for CRUD operations
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Welcome New Students',
      type: 'welcome',
      description: 'Warm welcome message for first-time trial students',
      subject: 'Welcome to YogaSwiss! Your journey begins now 🧘‍♀️',
      previewText: 'We\'re excited to have you join our yoga community...',
      category: 'onboarding',
      isPopular: true,
      usageCount: 145,
      lastUsed: '2025-01-30',
      createdAt: '2024-11-15',
      tags: ['welcome', 'trial', 'onboarding']
    },
    {
      id: '2',
      name: 'New Year Challenge Promotion',
      type: 'promotional',
      description: 'Promote the 30-day yoga challenge with special pricing',
      subject: 'Transform Your Year: Join Our 30-Day Yoga Challenge',
      previewText: 'Start your wellness journey with our proven 30-day program...',
      category: 'challenges',
      isPopular: true,
      usageCount: 89,
      lastUsed: '2025-01-02',
      createdAt: '2024-12-20',
      tags: ['challenge', 'promotion', 'new-year']
    },
    {
      id: '3',
      name: 'Workshop Invitation',
      type: 'event',
      description: 'Invite students to upcoming workshops and special events',
      subject: 'Special Workshop: Advanced Vinyasa with Master Teacher',
      previewText: 'Join us for an intensive workshop to deepen your practice...',
      category: 'events',
      isPopular: false,
      usageCount: 34,
      lastUsed: '2025-01-15',
      createdAt: '2024-10-05',
      tags: ['workshop', 'advanced', 'special-event']
    },
    {
      id: '4',
      name: 'Birthday Celebration',
      type: 'birthday',
      description: 'Personal birthday wishes with special class credit',
      subject: 'Happy Birthday! 🎉 Here\'s a special gift for you',
      previewText: 'It\'s your special day! Celebrate with a complimentary class...',
      category: 'personal',
      isPopular: true,
      usageCount: 78,
      lastUsed: '2025-01-28',
      createdAt: '2024-09-01',
      tags: ['birthday', 'personal', 'gift']
    },
    {
      id: '5',
      name: 'Win-Back Campaign',
      type: 'winback',
      description: 'Re-engage students who haven\'t attended in 30+ days',
      subject: 'We miss you! Come back with this special offer',
      previewText: 'Your yoga mat is waiting for you. Here\'s 50% off your next class...',
      category: 'retention',
      isPopular: false,
      usageCount: 23,
      lastUsed: '2025-01-20',
      createdAt: '2024-11-01',
      tags: ['winback', 'retention', 'discount']
    },
    {
      id: '6',
      name: 'Membership Renewal Reminder',
      type: 'renewal',
      description: 'Remind members about upcoming renewal with benefits',
      subject: 'Your membership expires soon - Renew now to keep your benefits',
      previewText: 'Don\'t lose access to your favorite classes and member perks...',
      category: 'membership',
      isPopular: true,
      usageCount: 156,
      lastUsed: '2025-01-25',
      createdAt: '2024-08-15',
      tags: ['renewal', 'membership', 'reminder']
    },
    {
      id: '7',
      name: 'Class Reminder',
      type: 'reminder',
      description: 'Automated reminder 24 hours before booked classes',
      subject: 'Reminder: Your yoga class is tomorrow at {{class_time}}',
      previewText: 'Looking forward to seeing you in {{class_name}} tomorrow...',
      category: 'automation',
      isPopular: true,
      usageCount: 892,
      lastUsed: '2025-01-31',
      createdAt: '2024-07-10',
      tags: ['reminder', 'automation', 'booking']
    },
    {
      id: '8',
      name: 'Weekly Newsletter',
      type: 'newsletter',
      description: 'Weekly update with new classes, tips, and community news',
      subject: 'This Week in Yoga: New Classes & Wellness Tips',
      previewText: 'Discover what\'s new this week at YogaSwiss...',
      category: 'communication',
      isPopular: false,
      usageCount: 52,
      lastUsed: '2025-01-27',
      createdAt: '2024-06-01',
      tags: ['newsletter', 'weekly', 'tips']
    }
  ]);

  // Mock automation templates - using state for CRUD operations
  const [automationTemplates, setAutomationTemplates] = useState<AutomationTemplate[]>([
    {
      id: '1',
      name: 'New Student Onboarding',
      description: 'Complete 7-day welcome sequence for trial students',
      triggerType: 'Trial class booking',
      steps: 5,
      estimatedTime: '7 days',
      category: 'onboarding',
      isPopular: true,
      usageCount: 45,
      conversionRate: 42.5,
      tags: ['welcome', 'trial', 'conversion']
    },
    {
      id: '2',
      name: 'Win-Back Sequence',
      description: 'Re-engage inactive members with progressive offers',
      triggerType: 'No attendance for 30 days',
      steps: 4,
      estimatedTime: '14 days',
      category: 'retention',
      isPopular: true,
      usageCount: 23,
      conversionRate: 28.3,
      tags: ['retention', 'winback', 'offers']
    },
    {
      id: '3',
      name: 'Birthday Campaign',
      description: 'Automated birthday wishes with special gifts',
      triggerType: 'Customer birthday',
      steps: 2,
      estimatedTime: '2 days',
      category: 'personal',
      isPopular: false,
      usageCount: 12,
      conversionRate: 65.4,
      tags: ['birthday', 'personal', 'loyalty']
    },
    {
      id: '4',
      name: 'Membership Renewal',
      description: 'Automated renewal reminders and incentives',
      triggerType: 'Membership expires in 7 days',
      steps: 3,
      estimatedTime: '7 days',
      category: 'membership',
      isPopular: true,
      usageCount: 67,
      conversionRate: 78.9,
      tags: ['renewal', 'membership', 'retention']
    },
    {
      id: '5',
      name: 'Workshop Promotion',
      description: 'Multi-step promotion for special workshops',
      triggerType: 'Workshop announced',
      steps: 4,
      estimatedTime: '21 days',
      category: 'events',
      isPopular: false,
      usageCount: 8,
      conversionRate: 34.6,
      tags: ['workshop', 'events', 'promotion']
    }
  ]);

  // CRUD operations
  const handleCreateEmailTemplate = (formData: any) => {
    const newTemplate: EmailTemplate = {
      id: (Math.max(...emailTemplates.map(t => parseInt(t.id))) + 1).toString(),
      name: formData.name,
      type: formData.type,
      description: formData.description,
      subject: formData.subject,
      previewText: formData.previewText,
      category: formData.category,
      isPopular: false,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      tags: formData.tags
    };
    
    setEmailTemplates([...emailTemplates, newTemplate]);
    setShowCreateDialog(false);
  };

  const handleCreateAutomationTemplate = (formData: any) => {
    const newTemplate: AutomationTemplate = {
      id: (Math.max(...automationTemplates.map(t => parseInt(t.id))) + 1).toString(),
      name: formData.name,
      description: formData.description,
      triggerType: formData.triggerType,
      steps: formData.steps,
      estimatedTime: formData.estimatedTime,
      category: formData.category,
      isPopular: false,
      usageCount: 0,
      tags: formData.tags
    };
    
    setAutomationTemplates([...automationTemplates, newTemplate]);
    setShowCreateDialog(false);
  };

  const handleEditTemplate = (formData: any) => {
    if (!editingTemplate) return;
    
    if ('subject' in editingTemplate) {
      // Email template
      const updatedTemplates = emailTemplates.map(template => 
        template.id === editingTemplate.id 
          ? { ...template, ...formData }
          : template
      );
      setEmailTemplates(updatedTemplates);
    } else {
      // Automation template
      const updatedTemplates = automationTemplates.map(template => 
        template.id === editingTemplate.id 
          ? { ...template, ...formData }
          : template
      );
      setAutomationTemplates(updatedTemplates);
    }
    
    setShowEditDialog(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = () => {
    if (!deletingTemplate) return;
    
    if ('subject' in deletingTemplate) {
      // Email template
      setEmailTemplates(emailTemplates.filter(t => t.id !== deletingTemplate.id));
    } else {
      // Automation template
      setAutomationTemplates(automationTemplates.filter(t => t.id !== deletingTemplate.id));
    }
    
    setShowDeleteDialog(false);
    setDeletingTemplate(null);
  };

  const handleDuplicateTemplate = (template: EmailTemplate | AutomationTemplate) => {
    if ('subject' in template) {
      // Email template
      const duplicated: EmailTemplate = {
        ...template,
        id: (Math.max(...emailTemplates.map(t => parseInt(t.id))) + 1).toString(),
        name: `${template.name} (Copy)`,
        usageCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setEmailTemplates([...emailTemplates, duplicated]);
    } else {
      // Automation template
      const duplicated: AutomationTemplate = {
        ...template,
        id: (Math.max(...automationTemplates.map(t => parseInt(t.id))) + 1).toString(),
        name: `${template.name} (Copy)`,
        usageCount: 0
      };
      setAutomationTemplates([...automationTemplates, duplicated]);
    }
  };

  const openPreview = (template: EmailTemplate | AutomationTemplate) => {
    setPreviewingTemplate(template);
    setShowPreviewDialog(true);
  };

  const openEdit = (template: EmailTemplate | AutomationTemplate) => {
    setEditingTemplate(template);
    setShowEditDialog(true);
  };

  const openDelete = (template: EmailTemplate | AutomationTemplate) => {
    setDeletingTemplate(template);
    setShowDeleteDialog(true);
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'retention', label: 'Retention' },
    { value: 'events', label: 'Events' },
    { value: 'membership', label: 'Membership' },
    { value: 'personal', label: 'Personal' },
    { value: 'automation', label: 'Automation' },
    { value: 'communication', label: 'Communication' }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'newsletter': return <Mail className="h-4 w-4" />;
      case 'promotional': return <Target className="h-4 w-4" />;
      case 'welcome': return <Users className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'winback': return <Gift className="h-4 w-4" />;
      case 'birthday': return <Heart className="h-4 w-4" />;
      case 'renewal': return <TrendingUp className="h-4 w-4" />;
      case 'reminder': return <Zap className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'newsletter': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'promotional': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'welcome': return 'bg-green-50 text-green-700 border-green-200';
      case 'event': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'winback': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'birthday': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'renewal': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'reminder': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredEmailTemplates = emailTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredAutomationTemplates = automationTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Marketing Templates</h2>
          <p className="text-muted-foreground">
            Pre-built email templates and automation workflows for your studio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Choose what type of template you want to create
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full h-16 flex-col gap-2"
                  onClick={() => {
                    setCreateTemplateType('email');
                    setShowCreateDialog(false);
                    setShowEditDialog(true);
                    setEditingTemplate(null);
                  }}
                >
                  <Mail className="h-6 w-6" />
                  <span className="font-medium">Email Template</span>
                  <span className="text-xs text-muted-foreground">Create a reusable email design</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-16 flex-col gap-2"
                  onClick={() => {
                    setCreateTemplateType('automation');
                    setShowCreateDialog(false);
                    setShowEditDialog(true);
                    setEditingTemplate(null);
                  }}
                >
                  <Zap className="h-6 w-6" />
                  <span className="font-medium">Automation Workflow</span>
                  <span className="text-xs text-muted-foreground">Build an automated sequence</span>
                </Button>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md text-sm"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email-templates">Email Templates</TabsTrigger>
          <TabsTrigger value="automation-templates">Automation Templates</TabsTrigger>
        </TabsList>

        {/* Email Templates */}
        <TabsContent value="email-templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmailTemplates.map((template) => (
              <Card key={template.id} className="relative group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg border ${getTypeColor(template.type)}`}>
                        {getTypeIcon(template.type)}
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-lg leading-tight">
                          {template.name}
                          {template.isPopular && (
                            <Star className="inline h-4 w-4 ml-2 text-yellow-500 fill-yellow-500" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className={`text-xs ${getTypeColor(template.type)}`}
                    >
                      {template.type}
                    </Badge>
                    {template.isPopular && (
                      <Badge variant="secondary" className="text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Subject Line Preview */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Subject Line:</div>
                    <div className="text-sm text-muted-foreground italic">
                      "{template.subject}"
                    </div>
                  </div>

                  {/* Preview Text */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Preview:</div>
                    <div className="text-sm text-muted-foreground">
                      {template.previewText}
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <div className="text-sm text-muted-foreground">Used</div>
                      <div className="font-medium">{template.usageCount} times</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Last Used</div>
                      <div className="font-medium">{template.lastUsed || 'Never'}</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => openPreview(template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openDelete(template)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button size="sm" variant="ghost" onClick={() => openPreview(template)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDuplicateTemplate(template)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button size="sm">
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Automation Templates */}
        <TabsContent value="automation-templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAutomationTemplates.map((template) => (
              <Card key={template.id} className="relative group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {template.name}
                        {template.isPopular && (
                          <Star className="inline h-4 w-4 ml-2 text-yellow-500 fill-yellow-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    {template.isPopular && (
                      <Badge variant="secondary" className="text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Trigger */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Trigger:</div>
                    <div className="text-sm text-muted-foreground">
                      {template.triggerType}
                    </div>
                  </div>

                  {/* Workflow Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Steps</div>
                      <div className="font-medium">{template.steps}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="font-medium">{template.estimatedTime}</div>
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <div className="text-sm text-muted-foreground">Used</div>
                      <div className="font-medium">{template.usageCount} times</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Conversion</div>
                      <div className="font-medium text-green-600">
                        {template.conversionRate ? `${template.conversionRate}%` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => openPreview(template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openDelete(template)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button size="sm" variant="ghost" onClick={() => openPreview(template)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDuplicateTemplate(template)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(template)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button size="sm">
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit/Create Dialog */}
      <TemplateFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={editingTemplate ? handleEditTemplate : (createTemplateType === 'email' ? handleCreateEmailTemplate : handleCreateAutomationTemplate)}
        title={editingTemplate ? 'Edit Template' : 'Create New Template'}
        description={editingTemplate ? 'Update your template settings.' : 'Create a new template for your marketing campaigns.'}
        templateType={editingTemplate ? ('subject' in editingTemplate ? 'email' : 'automation') : createTemplateType}
        categories={categories}
        initialData={editingTemplate}
      />

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewingTemplate?.name}</DialogTitle>
            <DialogDescription>
              Preview of your template configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewingTemplate && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm text-muted-foreground">{previewingTemplate.description}</p>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <p className="text-sm">{previewingTemplate.category}</p>
                  </div>
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {previewingTemplate.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {'subject' in previewingTemplate && (
                    <>
                      <div>
                        <Label>Subject Line</Label>
                        <p className="text-sm italic">"{previewingTemplate.subject}"</p>
                      </div>
                      <div>
                        <Label>Preview Text</Label>
                        <p className="text-sm text-muted-foreground">{previewingTemplate.previewText}</p>
                      </div>
                    </>
                  )}
                  {'triggerType' in previewingTemplate && (
                    <>
                      <div>
                        <Label>Trigger</Label>
                        <p className="text-sm">{previewingTemplate.triggerType}</p>
                      </div>
                      <div>
                        <Label>Steps</Label>
                        <p className="text-sm">{previewingTemplate.steps}</p>
                      </div>
                      <div>
                        <Label>Estimated Time</Label>
                        <p className="text-sm">{previewingTemplate.estimatedTime}</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Usage</Label>
                    <p className="text-2xl font-bold">{previewingTemplate.usageCount} times</p>
                  </div>
                  {'conversionRate' in previewingTemplate && previewingTemplate.conversionRate && (
                    <div>
                      <Label>Conversion Rate</Label>
                      <p className="text-2xl font-bold text-green-600">{previewingTemplate.conversionRate}%</p>
                    </div>
                  )}
                  <div>
                    <Label>Created</Label>
                    <p className="text-sm">{'createdAt' in previewingTemplate ? previewingTemplate.createdAt : 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Popularity</Label>
                    <div className="flex items-center gap-2">
                      {previewingTemplate.isPopular && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                      <span className="text-sm">{previewingTemplate.isPopular ? 'Popular' : 'Standard'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
            {previewingTemplate && (
              <Button onClick={() => {
                setShowPreviewDialog(false);
                openEdit(previewingTemplate);
              }}>
                Edit Template
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTemplate?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Template Form Dialog Component
interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  title: string;
  description: string;
  templateType: 'email' | 'automation';
  categories: Array<{ value: string; label: string }>;
  initialData?: any;
}

function TemplateFormDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  title, 
  description, 
  templateType,
  categories,
  initialData 
}: TemplateFormDialogProps) {
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    category: '',
    tags: [],
    // Email specific
    type: 'newsletter',
    subject: '',
    previewText: '',
    // Automation specific
    triggerType: '',
    steps: 1,
    estimatedTime: ''
  });
  const [tagInput, setTagInput] = useState('');

  // Reset form when initialData changes
  useState(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || '',
        tags: initialData.tags || [],
        type: initialData.type || 'newsletter',
        subject: initialData.subject || '',
        previewText: initialData.previewText || '',
        triggerType: initialData.triggerType || '',
        steps: initialData.steps || 1,
        estimatedTime: initialData.estimatedTime || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        tags: [],
        type: 'newsletter',
        subject: '',
        previewText: '',
        triggerType: '',
        steps: 1,
        estimatedTime: ''
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      description: '',
      category: '',
      tags: [],
      type: 'newsletter',
      subject: '',
      previewText: '',
      triggerType: '',
      steps: 1,
      estimatedTime: ''
    });
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag: string) => tag !== tagToRemove)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input 
                  id="template-name" 
                  placeholder={templateType === 'email' ? 'e.g., Welcome Email' : 'e.g., Onboarding Sequence'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Textarea 
                  id="template-description" 
                  placeholder="Brief description of the template..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.value !== 'all').map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {templateType === 'email' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email-type">Email Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="winback">Win-back</SelectItem>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="renewal">Renewal</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject-line">Subject Line</Label>
                    <Input 
                      id="subject-line" 
                      placeholder="e.g., Welcome to YogaSwiss!"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preview-text">Preview Text</Label>
                    <Textarea 
                      id="preview-text" 
                      placeholder="Short preview text that appears in email clients..."
                      rows={2}
                      value={formData.previewText}
                      onChange={(e) => setFormData({ ...formData, previewText: e.target.value })}
                    />
                  </div>
                </>
              )}

              {templateType === 'automation' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="trigger-type">Trigger Type</Label>
                    <Input 
                      id="trigger-type" 
                      placeholder="e.g., Trial class booking"
                      value={formData.triggerType}
                      onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="steps-count">Number of Steps</Label>
                    <Input 
                      id="steps-count" 
                      type="number"
                      min="1"
                      value={formData.steps}
                      onChange={(e) => setFormData({ ...formData, steps: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimated-time">Estimated Time</Label>
                    <Input 
                      id="estimated-time" 
                      placeholder="e.g., 7 days"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                    <button 
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}