import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { 
  Plus,
  Play,
  Pause,
  Edit,
  Copy,
  BarChart3,
  Clock,
  Users,
  Zap,
  Mail,
  Calendar,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  GitBranch,
  Timer,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Trash2,
  MoreHorizontal,
  Settings,
  Share
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { JourneyBuilder } from './JourneyBuilder';

export function JourneyManagement() {
  const [selectedJourney, setSelectedJourney] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingJourney, setEditingJourney] = useState<any>(null);
  const [previewingJourney, setPreviewingJourney] = useState<any>(null);
  const [deletingJourney, setDeletingJourney] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock journey data
  const [journeys, setJourneys] = useState([
    {
      id: 1,
      name: 'New Student Onboarding',
      description: 'Welcome sequence for first-time visitors and trial class attendees',
      status: 'Active',
      trigger: 'Trial class booking',
      enrolled: 156,
      completed: 89,
      avgCompletionTime: '5.2 days',
      goalConversions: 67,
      conversionRate: 42.9,
      revenue: 6700,
      createdAt: '2024-12-15',
      updatedAt: '2025-01-28',
      steps: [
        { type: 'delay', duration: '1 hour' },
        { type: 'email', name: 'Welcome Email' },
        { type: 'delay', duration: '1 day' },
        { type: 'condition', name: 'Attended Trial?' },
        { type: 'email', name: 'Follow-up' },
        { type: 'delay', duration: '3 days' },
        { type: 'email', name: 'Package Offer' }
      ]
    },
    {
      id: 2,
      name: 'Win-Back Campaign',
      description: 'Re-engage customers who haven\'t attended classes in 30+ days',
      status: 'Active',
      trigger: 'No class attendance for 30 days',
      enrolled: 89,
      completed: 34,
      avgCompletionTime: '12.5 days',
      goalConversions: 23,
      conversionRate: 25.8,
      revenue: 2300,
      createdAt: '2024-11-20',
      updatedAt: '2025-01-25',
      steps: [
        { type: 'email', name: 'We Miss You' },
        { type: 'delay', duration: '3 days' },
        { type: 'email', name: 'Special Offer' },
        { type: 'delay', duration: '7 days' },
        { type: 'condition', name: 'Booked Class?' },
        { type: 'email', name: 'Final Attempt' }
      ]
    },
    {
      id: 3,
      name: 'Workshop Promotion',
      description: 'Promote upcoming workshops to interested segments',
      status: 'Scheduled',
      trigger: 'Workshop announced',
      enrolled: 0,
      completed: 0,
      avgCompletionTime: '0 days',
      goalConversions: 0,
      conversionRate: 0,
      revenue: 0,
      createdAt: '2025-01-28',
      updatedAt: '2025-01-30',
      scheduledAt: '2025-02-05',
      steps: [
        { type: 'email', name: 'Workshop Announcement' },
        { type: 'delay', duration: '3 days' },
        { type: 'condition', name: 'Registered?' },
        { type: 'email', name: 'Early Bird Reminder' },
        { type: 'delay', duration: '7 days' },
        { type: 'email', name: 'Last Chance' }
      ]
    },
    {
      id: 4,
      name: 'Membership Renewal',
      description: 'Automated renewal reminders and special offers',
      status: 'Paused',
      trigger: 'Membership expires in 7 days',
      enrolled: 234,
      completed: 178,
      avgCompletionTime: '6.8 days',
      goalConversions: 156,
      conversionRate: 66.7,
      revenue: 15600,
      createdAt: '2024-10-10',
      updatedAt: '2025-01-15',
      steps: [
        { type: 'email', name: 'Renewal Reminder' },
        { type: 'delay', duration: '2 days' },
        { type: 'condition', name: 'Renewed?' },
        { type: 'email', name: 'Special Renewal Rate' },
        { type: 'delay', duration: '1 day' },
        { type: 'email', name: 'Expires Today' }
      ]
    },
    {
      id: 5,
      name: 'Birthday Campaign',
      description: 'Birthday wishes with special class credit',
      status: 'Active',
      trigger: 'Customer birthday',
      enrolled: 45,
      completed: 41,
      avgCompletionTime: '1.2 days',
      goalConversions: 31,
      conversionRate: 68.9,
      revenue: 930,
      createdAt: '2024-09-01',
      updatedAt: '2025-01-20',
      steps: [
        { type: 'email', name: 'Birthday Wishes' },
        { type: 'delay', duration: '7 days' },
        { type: 'condition', name: 'Used Credit?' },
        { type: 'email', name: 'Reminder to Use Credit' }
      ]
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-50 text-green-700 border-green-200';
      case 'Paused': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Scheduled': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Draft': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'Completed': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <Play className="h-4 w-4" />;
      case 'Paused': return <Pause className="h-4 w-4" />;
      case 'Scheduled': return <Clock className="h-4 w-4" />;
      case 'Draft': return <Edit className="h-4 w-4" />;
      case 'Completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleCreateJourney = (formData: any) => {
    const newJourney = {
      id: Math.max(...journeys.map((j: any) => j.id)) + 1,
      name: formData.name,
      description: formData.description,
      status: 'Draft',
      trigger: formData.trigger,
      enrolled: 0,
      completed: 0,
      avgCompletionTime: '0 days',
      goalConversions: 0,
      conversionRate: 0,
      revenue: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      steps: []
    };
    
    setJourneys([...journeys, newJourney]);
    setShowCreateDialog(false);
    setSelectedJourney(newJourney.id.toString());
  };

  const handleEditJourney = (formData: any) => {
    if (!editingJourney) return;
    
    const updatedJourneys = journeys.map((journey: any) => 
      journey.id === editingJourney.id 
        ? { 
            ...journey, 
            ...formData,
            updatedAt: new Date().toISOString().split('T')[0] 
          }
        : journey
    );
    
    setJourneys(updatedJourneys);
    setShowEditDialog(false);
    setEditingJourney(null);
  };

  const handleDeleteJourney = () => {
    if (!deletingJourney) return;
    
    setJourneys(journeys.filter((journey: any) => journey.id !== deletingJourney.id));
    setShowDeleteDialog(false);
    setDeletingJourney(null);
  };

  const handleDuplicateJourney = (journey: any) => {
    const duplicatedJourney = {
      ...journey,
      id: Math.max(...journeys.map((j: any) => j.id)) + 1,
      name: `${journey.name} (Copy)`,
      status: 'Draft',
      enrolled: 0,
      completed: 0,
      goalConversions: 0,
      conversionRate: 0,
      revenue: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setJourneys([...journeys, duplicatedJourney]);
  };

  const handleToggleStatus = (journey: any) => {
    const newStatus = journey.status === 'Active' ? 'Paused' : 'Active';
    const updatedJourneys = journeys.map((j: any) => 
      j.id === journey.id 
        ? { ...j, status: newStatus }
        : j
    );
    setJourneys(updatedJourneys);
  };

  const openPreview = (journey: any) => {
    setPreviewingJourney(journey);
    setShowPreviewDialog(true);
  };

  const openEdit = (journey: any) => {
    setEditingJourney(journey);
    setShowEditDialog(true);
  };

  const openDelete = (journey: any) => {
    setDeletingJourney(journey);
    setShowDeleteDialog(true);
  };

  const filteredJourneys = journeys.filter((journey: any) => {
    const matchesSearch = journey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         journey.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || journey.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalStats = journeys.reduce((acc, journey) => ({
    enrolled: acc.enrolled + journey.enrolled,
    completed: acc.completed + journey.completed,
    revenue: acc.revenue + journey.revenue,
    conversions: acc.conversions + journey.goalConversions
  }), { enrolled: 0, completed: 0, revenue: 0, conversions: 0 });

  if (selectedJourney) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedJourney(null)}
          >
            ← Back to Journeys
          </Button>
        </div>
        <JourneyBuilder journeyId={selectedJourney} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Journeys</h2>
          <p className="text-muted-foreground">
            Create automated marketing workflows that respond to customer behavior
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
            Create Journey
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search journeys..."
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
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredJourneys.length} journeys</span>
          <span>•</span>
          <span>{totalStats.enrolled} total enrolled</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Journeys</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {journeys.filter(j => j.status === 'Active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.enrolled.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All-time participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStats.enrolled > 0 ? ((totalStats.completed / totalStats.enrolled) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across all journeys
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Journey Revenue</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {totalStats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Attribution all-time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Journeys List */}
      <div className="space-y-4">
        {filteredJourneys.map((journey) => (
          <Card key={journey.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{journey.name}</h3>
                    <Badge className={`text-xs ${getStatusColor(journey.status)}`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(journey.status)}
                        {journey.status}
                      </div>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{journey.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Trigger: {journey.trigger}</span>
                    <span>Steps: {journey.steps?.length || 0}</span>
                    <span>Updated: {new Date(journey.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openPreview(journey)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedJourney(journey.id.toString())}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Journey
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(journey)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDuplicateJourney(journey)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(journey)}>
                        {journey.status === 'Active' ? (
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => openDelete(journey)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedJourney(journey.id.toString())}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {journey.status === 'Active' ? (
                    <Button size="sm" variant="outline" onClick={() => handleToggleStatus(journey)}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : journey.status === 'Paused' ? (
                    <Button size="sm" onClick={() => handleToggleStatus(journey)}>
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  ) : null}
                </div>
              </div>

              {/* Journey Visualization */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-muted/30 rounded-lg overflow-x-auto">
                {journey.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      {step.type === 'email' && <Mail className="h-3 w-3 text-blue-500" />}
                      {step.type === 'delay' && <Timer className="h-3 w-3 text-gray-500" />}
                      {step.type === 'condition' && <GitBranch className="h-3 w-3 text-purple-500" />}
                      <span className="text-xs font-medium truncate max-w-20">
                        {step.name || step.duration || step.type}
                      </span>
                    </div>
                    {index < journey.steps.length - 1 && (
                      <div className="h-px w-4 bg-border"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Performance Metrics */}
              {journey.status !== 'Draft' && journey.enrolled > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{journey.enrolled}</div>
                    <div className="text-xs text-muted-foreground">Enrolled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{journey.completed}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {journey.conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Goal Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">CHF {journey.revenue.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{journey.avgCompletionTime}</div>
                    <div className="text-xs text-muted-foreground">Avg. Time</div>
                  </div>
                </div>
              )}

              {/* Scheduled Journey Info */}
              {journey.status === 'Scheduled' && journey.scheduledAt && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      Scheduled to start: {new Date(journey.scheduledAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty States */}
      {filteredJourneys.length === 0 && journeys.length > 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No Journeys Found</CardTitle>
            <CardDescription className="mb-4 max-w-md mx-auto">
              Try adjusting your search criteria or filters to find what you're looking for.
            </CardDescription>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {filteredJourneys.length === 0 && journeys.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Zap className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No Journeys Yet</CardTitle>
            <CardDescription className="mb-4 max-w-md mx-auto">
              Create your first journey to automatically engage customers based on their behavior and preferences.
            </CardDescription>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Journey
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <JourneyFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateJourney}
        title="Create New Journey"
        description="Start with a template or build a custom automation workflow."
      />

      {/* Edit Dialog */}
      {editingJourney && (
        <JourneyFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSubmit={handleEditJourney}
          title="Edit Journey"
          description="Update your journey settings and configuration."
          initialData={{
            name: editingJourney.name,
            description: editingJourney.description,
            trigger: editingJourney.trigger
          }}
        />
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewingJourney?.name}</DialogTitle>
            <DialogDescription>
              Preview of your journey configuration and performance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewingJourney && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm text-muted-foreground">{previewingJourney.description}</p>
                  </div>
                  <div>
                    <Label>Trigger</Label>
                    <p className="text-sm">{previewingJourney.trigger}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(previewingJourney.status)}>
                      {previewingJourney.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Steps</Label>
                    <p className="text-sm">{previewingJourney.steps?.length || 0} steps configured</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Enrolled</Label>
                      <p className="text-2xl font-bold">{previewingJourney.enrolled}</p>
                    </div>
                    <div>
                      <Label>Completed</Label>
                      <p className="text-2xl font-bold">{previewingJourney.completed}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Conversion Rate</Label>
                      <p className="text-2xl font-bold text-green-600">{previewingJourney.conversionRate}%</p>
                    </div>
                    <div>
                      <Label>Revenue</Label>
                      <p className="text-2xl font-bold">CHF {previewingJourney.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <Label>Avg. Completion Time</Label>
                    <p className="text-lg font-semibold">{previewingJourney.avgCompletionTime}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
            {previewingJourney && (
              <Button onClick={() => {
                setShowPreviewDialog(false);
                setSelectedJourney(previewingJourney.id.toString());
              }}>
                Edit Journey
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journey</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingJourney?.name}"? This action cannot be undone and will stop the journey for all enrolled customers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJourney} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Journey Form Dialog Component
interface JourneyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  title: string;
  description: string;
  initialData?: any;
}

function JourneyFormDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  title, 
  description, 
  initialData 
}: JourneyFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      description: '',
      trigger: ''
    });
  };

  // Reset form when initialData changes
  useState(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        trigger: initialData.trigger || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        trigger: ''
      });
    }
  });

  const templates = [
    {
      name: 'New Student Onboarding',
      description: 'Welcome sequence for first-time visitors and trial class attendees',
      trigger: 'Trial class booking',
      icon: <Users className="h-6 w-6" />
    },
    {
      name: 'Win-Back Campaign',
      description: 'Re-engage customers who haven\'t attended classes recently',
      trigger: 'No class attendance for 30 days',
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      name: 'Event Promotion',
      description: 'Promote workshops and special events to interested segments',
      trigger: 'Workshop announced',
      icon: <Calendar className="h-6 w-6" />
    },
    {
      name: 'Custom Journey',
      description: 'Build from scratch with your own triggers and steps',
      trigger: 'Custom trigger',
      icon: <Zap className="h-6 w-6" />
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        {!initialData ? (
          // Template selection for new journeys
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-24 flex-col gap-3 p-4"
                  onClick={() => {
                    setFormData({
                      name: template.name,
                      description: template.description,
                      trigger: template.trigger
                    });
                    onSubmit({
                      name: template.name,
                      description: template.description,
                      trigger: template.trigger
                    });
                  }}
                >
                  {template.icon}
                  <div className="text-center">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{template.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          // Form for editing existing journeys
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="journey-name">Journey Name</Label>
              <Input 
                id="journey-name" 
                placeholder="e.g., New Student Onboarding"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="journey-description">Description</Label>
              <Textarea 
                id="journey-description" 
                placeholder="Brief description of your journey's purpose..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="journey-trigger">Trigger</Label>
              <Select 
                value={formData.trigger} 
                onValueChange={(value) => setFormData({ ...formData, trigger: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trial class booking">Trial class booking</SelectItem>
                  <SelectItem value="Membership purchase">Membership purchase</SelectItem>
                  <SelectItem value="No class attendance for 30 days">No class attendance for 30 days</SelectItem>
                  <SelectItem value="Workshop announced">Workshop announced</SelectItem>
                  <SelectItem value="Membership expires in 7 days">Membership expires in 7 days</SelectItem>
                  <SelectItem value="Customer birthday">Customer birthday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? 'Update' : 'Create'} Journey
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}