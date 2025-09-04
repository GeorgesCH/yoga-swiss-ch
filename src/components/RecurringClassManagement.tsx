import { useState } from 'react';
import { Calendar, Clock, Users, MapPin, Edit3, Trash2, Copy, AlertTriangle, Plus, MoreHorizontal, Filter, ChevronDown, Split, RefreshCw, X, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { useLanguage } from './LanguageProvider';
import { RecurringClassSeriesForm } from './RecurringClassSeriesForm';
import { RecurringClassBulkActions } from './RecurringClassBulkActions';

// Core data models
interface RecurrenceSeries {
  id: string;
  name: string;
  description?: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
  };
  location: {
    id: string;
    name: string;
    room?: string;
  };
  recurrence_rule: string; // RRULE format
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  capacity: number;
  price_chf: number;
  category: string;
  level: string;
  language: 'de' | 'fr' | 'it' | 'en';
  status: 'active' | 'paused' | 'ended';
  created_at: string;
  total_occurrences: number;
  completed_occurrences: number;
  upcoming_occurrences: number;
  total_revenue: number;
}

interface ClassOccurrence {
  id: string;
  series_id: string;
  series_name: string;
  date: string;
  start_time: string;
  end_time: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  location: {
    id: string;
    name: string;
    room?: string;
  };
  capacity: number;
  booked: number;
  waitlist: number;
  status: 'scheduled' | 'cancelled' | 'completed';
  is_exception: boolean; // True if this occurrence has been modified from series defaults
  cancellation_reason?: string;
  price_chf: number;
  revenue_total: number;
  has_registrations: boolean;
  has_payments: boolean;
}

interface EditScope {
  type: 'this_only' | 'this_and_following' | 'entire_series';
  label: string;
  description: string;
}

interface ImpactPreview {
  affected_occurrences: number;
  affected_clients: number;
  revenue_at_risk: number;
  waitlist_affected: number;
  registrations_to_move: number;
  refunds_required: number;
}

export function RecurringClassManagement() {
  const { t } = useLanguage();
  const [selectedSeries, setSelectedSeries] = useState<RecurrenceSeries | null>(null);
  const [showCreateSeries, setShowCreateSeries] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showImpactPreview, setShowImpactPreview] = useState(false);
  const [editScope, setEditScope] = useState<EditScope | null>(null);
  const [selectedOccurrences, setSelectedOccurrences] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'cancel' | 'edit' | null>(null);
  const [viewMode, setViewMode] = useState<'series' | 'occurrences'>('series');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    instructor: '',
    location: '',
    status: '',
    category: ''
  });

  // Mock data for recurring series
  const mockSeries: RecurrenceSeries[] = [
    {
      id: 'series-1',
      name: 'Monday Morning Vinyasa',
      description: 'Energizing Vinyasa flow to start your week',
      instructor: {
        id: 'sarah-1',
        name: 'Sarah Müller',
        avatar: '/avatars/sarah.jpg',
        email: 'sarah@yogastudio.ch'
      },
      location: {
        id: 'studio-a',
        name: 'Studio A',
        room: 'Main Room'
      },
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
      start_date: '2024-01-08',
      end_date: '2024-06-24',
      start_time: '09:00',
      end_time: '10:30',
      duration_minutes: 90,
      capacity: 20,
      price_chf: 25,
      category: 'Vinyasa',
      level: 'All Levels',
      language: 'de',
      status: 'active',
      created_at: '2024-01-01',
      total_occurrences: 25,
      completed_occurrences: 8,
      upcoming_occurrences: 17,
      total_revenue: 4500
    },
    {
      id: 'series-2',
      name: 'Hatha Flow Evening',
      description: 'Gentle evening practice for relaxation',
      instructor: {
        id: 'marcus-1',
        name: 'Marcus Weber',
        avatar: '/avatars/marcus.jpg',
        email: 'marcus@yogastudio.ch'
      },
      location: {
        id: 'studio-b',
        name: 'Studio B',
        room: 'Quiet Room'
      },
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=TU,TH',
      start_date: '2024-01-09',
      end_date: '2024-05-30',
      start_time: '18:30',
      end_time: '19:45',
      duration_minutes: 75,
      capacity: 15,
      price_chf: 22,
      category: 'Hatha',
      level: 'Beginner',
      language: 'de',
      status: 'active',
      created_at: '2024-01-01',
      total_occurrences: 34,
      completed_occurrences: 12,
      upcoming_occurrences: 22,
      total_revenue: 6800
    }
  ];

  // Mock data for class occurrences
  const mockOccurrences: ClassOccurrence[] = [
    {
      id: 'occ-1',
      series_id: 'series-1',
      series_name: 'Monday Morning Vinyasa',
      date: '2024-03-04',
      start_time: '09:00',
      end_time: '10:30',
      instructor: {
        id: 'sarah-1',
        name: 'Sarah Müller',
        avatar: '/avatars/sarah.jpg'
      },
      location: {
        id: 'studio-a',
        name: 'Studio A',
        room: 'Main Room'
      },
      capacity: 20,
      booked: 18,
      waitlist: 3,
      status: 'scheduled',
      is_exception: false,
      price_chf: 25,
      revenue_total: 450,
      has_registrations: true,
      has_payments: true
    },
    {
      id: 'occ-2',
      series_id: 'series-1',
      series_name: 'Monday Morning Vinyasa',
      date: '2024-03-11',
      start_time: '09:00',
      end_time: '10:30',
      instructor: {
        id: 'sarah-1',
        name: 'Sarah Müller',
        avatar: '/avatars/sarah.jpg'
      },
      location: {
        id: 'studio-a',
        name: 'Studio A',
        room: 'Main Room'
      },
      capacity: 20,
      booked: 15,
      waitlist: 1,
      status: 'scheduled',
      is_exception: false,
      price_chf: 25,
      revenue_total: 375,
      has_registrations: true,
      has_payments: true
    }
  ];

  const editScopes: EditScope[] = [
    {
      type: 'this_only',
      label: 'Only this occurrence',
      description: 'Changes apply to this single class only'
    },
    {
      type: 'this_and_following',
      label: 'This and following',
      description: 'Creates a new series starting from this date'
    },
    {
      type: 'entire_series',
      label: 'Entire series',
      description: 'Changes apply to all future classes in the series'
    }
  ];

  // Mock data for instructors and locations
  const mockInstructors = [
    { id: 'sarah-1', name: 'Sarah Müller' },
    { id: 'marcus-1', name: 'Marcus Weber' },
    { id: 'lisa-1', name: 'Lisa Chen' }
  ];

  const mockLocations = [
    { id: 'studio-a', name: 'Studio A', rooms: ['Main Room', 'Small Room'] },
    { id: 'studio-b', name: 'Studio B', rooms: ['Quiet Room', 'Hot Room'] },
    { id: 'outdoor-1', name: 'Lake Zurich' }
  ];

  const handleSeriesEdit = (series: RecurrenceSeries) => {
    setSelectedSeries(series);
    setShowEditDialog(true);
  };

  const handleSeriesCancel = (series: RecurrenceSeries) => {
    setSelectedSeries(series);
    setShowCancelDialog(true);
  };

  const handleBulkCancel = () => {
    if (selectedOccurrences.length > 0) {
      setBulkAction('cancel');
      setShowBulkActions(true);
    }
  };

  const handleCreateSeries = (formData: any) => {
    console.log('Creating series:', formData);
    // Handle series creation
  };

  const handleBulkAction = (action: string, data: any) => {
    console.log('Bulk action:', action, data);
    // Handle bulk actions
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'ended': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatRecurrenceRule = (rule: string) => {
    // Simple RRULE parser for display
    if (rule.includes('BYDAY=MO')) return 'Every Monday';
    if (rule.includes('BYDAY=TU,TH')) return 'Tuesdays & Thursdays';
    if (rule.includes('FREQ=WEEKLY')) return 'Weekly';
    if (rule.includes('FREQ=DAILY')) return 'Daily';
    return 'Custom pattern';
  };

  const filteredSeries = mockSeries.filter(series => {
    if (filters.search && !series.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.instructor && series.instructor.id !== filters.instructor) {
      return false;
    }
    if (filters.location && series.location.id !== filters.location) {
      return false;
    }
    if (filters.status && series.status !== filters.status) {
      return false;
    }
    if (filters.category && series.category !== filters.category) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Recurring Classes</h1>
          <p className="text-muted-foreground">
            Manage class series, recurring patterns, and bulk operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setViewMode(viewMode === 'series' ? 'occurrences' : 'series')}
          >
            {viewMode === 'series' ? 'View Occurrences' : 'View Series'}
          </Button>
          <Button onClick={() => setShowCreateSeries(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Series
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Search series..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <Label>Instructor</Label>
              <Select value={filters.instructor} onValueChange={(value) => setFilters({ ...filters, instructor: value || '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="All instructors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sarah-1">Sarah Müller</SelectItem>
                  <SelectItem value="marcus-1">Marcus Weber</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Select value={filters.location} onValueChange={(value) => setFilters({ ...filters, location: value || '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio-a">Studio A</SelectItem>
                  <SelectItem value="studio-b">Studio B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value || '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value || '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vinyasa">Vinyasa</SelectItem>
                  <SelectItem value="Hatha">Hatha</SelectItem>
                  <SelectItem value="Power Yoga">Power Yoga</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Series View */}
      {viewMode === 'series' && (
        <div className="space-y-4">
          {filteredSeries.map((series) => (
            <Card key={series.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{series.name}</h3>
                          <Badge className={getStatusColor(series.status)}>
                            {series.status}
                          </Badge>
                          {series.description && (
                            <span className="text-sm text-muted-foreground">
                              {series.description}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <RefreshCw className="h-4 w-4" />
                            {formatRecurrenceRule(series.recurrence_rule)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {series.start_time} - {series.end_time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {series.location.name}
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSeriesEdit(series)}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Series
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate Series
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Split className="h-4 w-4 mr-2" />
                            Split Series
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleSeriesCancel(series)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancel Series
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Instructor & Details Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={series.instructor.avatar} />
                            <AvatarFallback>
                              {series.instructor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{series.instructor.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{series.category} • {series.level}</span>
                          <span>{series.capacity} spots</span>
                          <span>CHF {series.price_chf}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress & Stats Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 max-w-md">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Series Progress</span>
                          <span className="text-sm text-muted-foreground">
                            {series.completed_occurrences} / {series.total_occurrences}
                          </span>
                        </div>
                        <Progress 
                          value={(series.completed_occurrences / series.total_occurrences) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{series.upcoming_occurrences}</div>
                          <div className="text-muted-foreground">Upcoming</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">CHF {series.total_revenue.toLocaleString()}</div>
                          <div className="text-muted-foreground">Revenue</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Occurrences View */}
      {viewMode === 'occurrences' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Class Occurrences</CardTitle>
              <div className="flex items-center gap-2">
                {selectedOccurrences.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedOccurrences.length} selected
                    </span>
                    <Button variant="outline" size="sm" onClick={handleBulkCancel}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Cancel Selected
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockOccurrences.map((occurrence) => (
                <div key={occurrence.id} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/30">
                  <Checkbox
                    checked={selectedOccurrences.includes(occurrence.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedOccurrences([...selectedOccurrences, occurrence.id]);
                      } else {
                        setSelectedOccurrences(selectedOccurrences.filter(id => id !== occurrence.id));
                      }
                    }}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{occurrence.series_name}</span>
                          {occurrence.is_exception && (
                            <Badge variant="outline" className="text-xs">
                              Modified
                            </Badge>
                          )}
                          <Badge className={getStatusColor(occurrence.status)}>
                            {occurrence.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{new Date(occurrence.date).toLocaleDateString()}</span>
                          <span>{occurrence.start_time} - {occurrence.end_time}</span>
                          <span>{occurrence.location.name}</span>
                          <span>{occurrence.booked}/{occurrence.capacity} booked</span>
                          {occurrence.waitlist > 0 && (
                            <span className="text-orange-600">{occurrence.waitlist} waitlist</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">CHF {occurrence.revenue_total}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit Occurrence
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="h-4 w-4 mr-2" />
                              Manage Attendees
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog with Scope Selection */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="edit-series-description">
          <DialogHeader>
            <DialogTitle>Edit Recurring Series</DialogTitle>
            <DialogDescription id="edit-series-description">
              Choose the scope of your changes to {selectedSeries?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This series has {selectedSeries?.upcoming_occurrences} upcoming classes with active registrations.
                Choose carefully how you want to apply changes.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {editScopes.map((scope) => (
                <div
                  key={scope.type}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    editScope?.type === scope.type ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'
                  }`}
                  onClick={() => setEditScope(scope)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${
                      editScope?.type === scope.type ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`}>
                      {editScope?.type === scope.type && (
                        <div className="w-full h-full rounded-full bg-primary-foreground scale-50" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{scope.label}</div>
                      <div className="text-sm text-muted-foreground">{scope.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {editScope && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Preview Impact</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Affected Classes:</span>
                    <span className="ml-2 font-medium">
                      {editScope.type === 'this_only' ? '1' : 
                       editScope.type === 'this_and_following' ? '12' : '17'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Affected Clients:</span>
                    <span className="ml-2 font-medium">
                      {editScope.type === 'this_only' ? '18' : 
                       editScope.type === 'this_and_following' ? '145' : '238'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button disabled={!editScope} onClick={() => {
              setShowEditDialog(false);
              setShowImpactPreview(true);
            }}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Impact Preview Dialog */}
      <Dialog open={showImpactPreview} onOpenChange={setShowImpactPreview}>
        <DialogContent className="max-w-3xl" aria-describedby="impact-preview-description">
          <DialogHeader>
            <DialogTitle>Impact Preview</DialogTitle>
            <DialogDescription id="impact-preview-description">
              Review the impact of your changes before applying them
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-semibold text-blue-600">17</div>
                  <div className="text-sm text-muted-foreground">Classes Affected</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-semibold text-green-600">238</div>
                  <div className="text-sm text-muted-foreground">Clients Impacted</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-semibold text-orange-600">CHF 4,250</div>
                  <div className="text-sm text-muted-foreground">Revenue at Risk</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-semibold text-purple-600">23</div>
                  <div className="text-sm text-muted-foreground">Waitlist Spots</div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Studio-initiated change policy</strong> will apply - no client penalties, 
                automatic refunds/credits, and priority rebooking options.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h4 className="font-medium">Client Resolution Options</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox defaultChecked />
                  <span className="text-sm">Auto-move to equivalent time slots (when available)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox defaultChecked />
                  <span className="text-sm">Offer credit to studio wallet (preferred)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox />
                  <span className="text-sm">Process refunds to original payment method</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox defaultChecked />
                  <span className="text-sm">Send rebook links for manual selection</span>
                </div>
              </div>
            </div>

            <div>
              <Label>Notification Message</Label>
              <Textarea 
                placeholder="Optional message to include with the change notification..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImpactPreview(false)}>
              Back
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Series Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent aria-describedby="cancel-series-description">
          <DialogHeader>
            <DialogTitle>Cancel Series</DialogTitle>
            <DialogDescription id="cancel-series-description">
              This will cancel all remaining classes in "{selectedSeries?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action will cancel {selectedSeries?.upcoming_occurrences} upcoming classes
                and affect {selectedSeries?.upcoming_occurrences ? selectedSeries.upcoming_occurrences * 15 : 0} client bookings.
              </AlertDescription>
            </Alert>

            <div>
              <Label>Cancellation Reason</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instructor_unavailable">Instructor Unavailable</SelectItem>
                  <SelectItem value="location_unavailable">Location Unavailable</SelectItem>
                  <SelectItem value="low_demand">Low Demand</SelectItem>
                  <SelectItem value="schedule_change">Schedule Change</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Additional Message (Optional)</Label>
              <Textarea 
                placeholder="Additional message for affected clients..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive">
              Cancel Series
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Series Form */}
      <RecurringClassSeriesForm
        isOpen={showCreateSeries}
        onClose={() => setShowCreateSeries(false)}
        onSave={handleCreateSeries}
        instructors={mockInstructors}
        locations={mockLocations}
      />

      {/* Bulk Actions Dialog */}
      <RecurringClassBulkActions
        isOpen={showBulkActions}
        onClose={() => setShowBulkActions(false)}
        selectedSeriesIds={[]}
        selectedOccurrenceIds={selectedOccurrences}
        onAction={handleBulkAction}
      />
    </div>
  );
}