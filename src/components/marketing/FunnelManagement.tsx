import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Plus, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Settings,
  BarChart3,
  Search,
  Filter,
  Download,
  Upload,
  Play,
  Pause,
  MoreHorizontal,
  Save,
  Share,
  Calendar,
  Users
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { FunnelBuilder } from './FunnelBuilder';

interface Funnel {
  id: number;
  name: string;
  status: 'Active' | 'Paused' | 'Draft';
  steps: number;
  visits: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
  description: string;
  template?: string;
  category: string;
  tags: string[];
  url?: string;
  isPublished: boolean;
}

interface FunnelFormData {
  name: string;
  description: string;
  template: string;
  category: string;
  tags: string[];
}

export function FunnelManagement() {
  const [selectedFunnel, setSelectedFunnel] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<Funnel | null>(null);
  const [previewingFunnel, setPreviewingFunnel] = useState<Funnel | null>(null);
  const [deletingFunnel, setDeletingFunnel] = useState<Funnel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock data for funnels - enhanced with more properties
  const [funnels, setFunnels] = useState<Funnel[]>([
    {
      id: 1,
      name: 'New Student Onboarding',
      status: 'Active',
      steps: 5,
      visits: 1234,
      conversions: 123,
      conversionRate: 10.0,
      revenue: 12300,
      createdAt: '2025-01-15',
      updatedAt: '2025-01-28',
      description: 'Convert visitors into new yoga students with free trial offer',
      template: 'lead-generation',
      category: 'onboarding',
      tags: ['trial', 'students', 'conversion'],
      url: 'https://yogaswiss.ch/trial-signup',
      isPublished: true
    },
    {
      id: 2,
      name: 'Workshop Registration',
      status: 'Active',
      steps: 4,
      visits: 856,
      conversions: 98,
      conversionRate: 11.4,
      revenue: 9800,
      createdAt: '2025-01-10',
      updatedAt: '2025-01-25',
      description: 'Drive registrations for premium workshops and masterclasses',
      template: 'workshop-registration',
      category: 'events',
      tags: ['workshops', 'events', 'premium'],
      url: 'https://yogaswiss.ch/workshops',
      isPublished: true
    },
    {
      id: 3,
      name: 'Membership Upgrade',
      status: 'Draft',
      steps: 3,
      visits: 0,
      conversions: 0,
      conversionRate: 0,
      revenue: 0,
      createdAt: '2025-01-28',
      updatedAt: '2025-01-28',
      description: 'Upsell existing customers to premium membership tiers',
      template: 'membership-signup',
      category: 'upsell',
      tags: ['membership', 'upgrade', 'retention'],
      isPublished: false
    },
    {
      id: 4,
      name: 'Teacher Training Program',
      status: 'Paused',
      steps: 6,
      visits: 234,
      conversions: 12,
      conversionRate: 5.1,
      revenue: 12000,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-20',
      description: '200-hour yoga teacher certification program enrollment',
      template: 'product-sales',
      category: 'education',
      tags: ['teacher-training', 'certification', 'education'],
      url: 'https://yogaswiss.ch/teacher-training',
      isPublished: true
    }
  ]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'events', label: 'Events' },
    { value: 'upsell', label: 'Upsell' },
    { value: 'education', label: 'Education' },
    { value: 'retention', label: 'Retention' }
  ];

  const templates = [
    { value: 'blank', label: 'Blank Funnel' },
    { value: 'lead-generation', label: 'Lead Generation' },
    { value: 'product-sales', label: 'Product Sales' },
    { value: 'workshop-registration', label: 'Workshop Registration' },
    { value: 'membership-signup', label: 'Membership Signup' },
    { value: 'event-promotion', label: 'Event Promotion' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-50 text-green-700 border-green-200';
      case 'Paused': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Draft': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredFunnels = funnels.filter(funnel => {
    const matchesSearch = funnel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         funnel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         funnel.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || funnel.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'all' || funnel.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateFunnel = (formData: FunnelFormData) => {
    const newFunnel: Funnel = {
      id: Math.max(...funnels.map(f => f.id)) + 1,
      name: formData.name,
      description: formData.description,
      template: formData.template,
      category: formData.category,
      tags: formData.tags,
      status: 'Draft',
      steps: 1,
      visits: 0,
      conversions: 0,
      conversionRate: 0,
      revenue: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isPublished: false
    };
    
    setFunnels([...funnels, newFunnel]);
    setShowCreateDialog(false);
    setSelectedFunnel(newFunnel.id.toString());
  };

  const handleEditFunnel = (formData: FunnelFormData) => {
    if (!editingFunnel) return;
    
    const updatedFunnels = funnels.map(funnel => 
      funnel.id === editingFunnel.id 
        ? { 
            ...funnel, 
            ...formData,
            updatedAt: new Date().toISOString().split('T')[0] 
          }
        : funnel
    );
    
    setFunnels(updatedFunnels);
    setShowEditDialog(false);
    setEditingFunnel(null);
  };

  const handleDeleteFunnel = () => {
    if (!deletingFunnel) return;
    
    setFunnels(funnels.filter(funnel => funnel.id !== deletingFunnel.id));
    setShowDeleteDialog(false);
    setDeletingFunnel(null);
  };

  const handleDuplicateFunnel = (funnel: Funnel) => {
    const duplicatedFunnel: Funnel = {
      ...funnel,
      id: Math.max(...funnels.map(f => f.id)) + 1,
      name: `${funnel.name} (Copy)`,
      status: 'Draft',
      visits: 0,
      conversions: 0,
      conversionRate: 0,
      revenue: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isPublished: false
    };
    
    setFunnels([...funnels, duplicatedFunnel]);
  };

  const handleToggleStatus = (funnel: Funnel) => {
    const newStatus = funnel.status === 'Active' ? 'Paused' : 'Active';
    const updatedFunnels = funnels.map(f => 
      f.id === funnel.id 
        ? { ...f, status: newStatus as 'Active' | 'Paused' | 'Draft' }
        : f
    );
    setFunnels(updatedFunnels);
  };

  const openPreview = (funnel: Funnel) => {
    setPreviewingFunnel(funnel);
    setShowPreviewDialog(true);
  };

  const openEdit = (funnel: Funnel) => {
    setEditingFunnel(funnel);
    setShowEditDialog(true);
  };

  const openDelete = (funnel: Funnel) => {
    setDeletingFunnel(funnel);
    setShowDeleteDialog(true);
  };

  if (selectedFunnel) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedFunnel(null)}
          >
            ← Back to Funnels
          </Button>
        </div>
        <FunnelBuilder funnelId={selectedFunnel} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Funnels</h2>
          <p className="text-muted-foreground">
            Build multi-step conversion experiences to turn visitors into customers
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
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Funnel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search funnels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Funnels</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{funnels.length}</div>
            <p className="text-xs text-muted-foreground">
              {funnels.filter(f => f.status === 'Active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {funnels.reduce((sum, f) => sum + f.visits, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {funnels.length > 0 ? (funnels.reduce((sum, f) => sum + f.conversionRate, 0) / funnels.length).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              +2.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              CHF {funnels.reduce((sum, f) => sum + f.revenue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Attribution last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funnels List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFunnels.map((funnel) => (
          <Card key={funnel.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{funnel.name}</CardTitle>
                    {funnel.isPublished && (
                      <Badge variant="outline" className="text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Live
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{funnel.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(funnel.status)}>
                    {funnel.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openPreview(funnel)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedFunnel(funnel.id.toString())}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Funnel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(funnel)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDuplicateFunnel(funnel)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(funnel)}>
                        {funnel.status === 'Active' ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      {funnel.url && (
                        <DropdownMenuItem onClick={() => window.open(funnel.url, '_blank')}>
                          <Share className="h-4 w-4 mr-2" />
                          Open URL
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => openDelete(funnel)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{funnel.visits.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Visits</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{funnel.conversions}</div>
                  <div className="text-sm text-muted-foreground">Conversions</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-semibold">{funnel.conversionRate}%</span>
                    {funnel.conversionRate > 8 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Conversion Rate</div>
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-semibold">CHF {funnel.revenue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Revenue</div>
                </div>
              </div>

              {/* Steps Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Funnel Steps</span>
                  <span>{funnel.steps} steps</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: funnel.steps }, (_, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="h-2 w-8 bg-primary rounded-sm" />
                      {i < funnel.steps - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {funnel.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {funnel.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{funnel.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  Updated {funnel.updatedAt}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => openPreview(funnel)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedFunnel(funnel.id.toString())}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDuplicateFunnel(funnel)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredFunnels.length === 0 && funnels.length > 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No Funnels Found</CardTitle>
            <CardDescription className="mb-4 max-w-md mx-auto">
              Try adjusting your search criteria or filters to find what you're looking for.
            </CardDescription>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {filteredFunnels.length === 0 && funnels.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No Funnels Yet</CardTitle>
            <CardDescription className="mb-4 max-w-md mx-auto">
              Create your first funnel to start converting visitors into customers with optimized multi-step experiences.
            </CardDescription>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Funnel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <FunnelFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateFunnel}
        title="Create New Funnel"
        description="Set up a new conversion funnel to guide visitors through your marketing process."
        templates={templates}
        categories={categories}
      />

      {/* Edit Dialog */}
      {editingFunnel && (
        <FunnelFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSubmit={handleEditFunnel}
          title="Edit Funnel"
          description="Update your funnel settings and configuration."
          templates={templates}
          categories={categories}
          initialData={{
            name: editingFunnel.name,
            description: editingFunnel.description,
            template: editingFunnel.template || '',
            category: editingFunnel.category,
            tags: editingFunnel.tags
          }}
        />
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewingFunnel?.name}</DialogTitle>
            <DialogDescription>
              Preview of your funnel configuration and steps
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewingFunnel && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm text-muted-foreground">{previewingFunnel.description}</p>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <p className="text-sm">{previewingFunnel.category}</p>
                  </div>
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {previewingFunnel.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {previewingFunnel.url && (
                    <div>
                      <Label>URL</Label>
                      <p className="text-sm text-blue-600">{previewingFunnel.url}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Visits</Label>
                      <p className="text-2xl font-bold">{previewingFunnel.visits.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label>Conversions</Label>
                      <p className="text-2xl font-bold">{previewingFunnel.conversions}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Conversion Rate</Label>
                      <p className="text-2xl font-bold text-green-600">{previewingFunnel.conversionRate}%</p>
                    </div>
                    <div>
                      <Label>Revenue</Label>
                      <p className="text-2xl font-bold">CHF {previewingFunnel.revenue.toLocaleString()}</p>
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
            {previewingFunnel && (
              <Button onClick={() => {
                setShowPreviewDialog(false);
                setSelectedFunnel(previewingFunnel.id.toString());
              }}>
                Edit Funnel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Funnel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingFunnel?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFunnel} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Reusable Form Dialog Component
interface FunnelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FunnelFormData) => void;
  title: string;
  description: string;
  templates: Array<{ value: string; label: string }>;
  categories: Array<{ value: string; label: string }>;
  initialData?: Partial<FunnelFormData>;
}

function FunnelFormDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  title, 
  description, 
  templates, 
  categories,
  initialData 
}: FunnelFormDialogProps) {
  const [formData, setFormData] = useState<FunnelFormData>({
    name: '',
    description: '',
    template: '',
    category: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  // Reset form when dialog opens/closes or initialData changes
  useState(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        template: initialData.template || '',
        category: initialData.category || '',
        tags: initialData.tags || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        template: '',
        category: '',
        tags: []
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      description: '',
      template: '',
      category: '',
      tags: []
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
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="funnel-name">Funnel Name</Label>
            <Input 
              id="funnel-name" 
              placeholder="e.g., New Student Onboarding"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="funnel-description">Description</Label>
            <Textarea 
              id="funnel-description" 
              placeholder="Brief description of your funnel's purpose..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="funnel-template">Template</Label>
            <Select 
              value={formData.template} 
              onValueChange={(value) => setFormData({ ...formData, template: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a template or start blank" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="funnel-category">Category</Label>
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
                {formData.tags.map((tag, index) => (
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
              {initialData ? 'Update' : 'Create'} Funnel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}