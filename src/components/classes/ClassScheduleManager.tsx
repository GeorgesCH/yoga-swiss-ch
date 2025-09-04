import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Users, MapPin, Plus, Filter, Search, 
  MoreHorizontal, Edit, Copy, Trash2, Eye, Move, Ban,
  AlertCircle, CheckCircle, RefreshCw, Download
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { classesService } from '../../utils/supabase/classes-service';
import { classesServiceFallback } from '../../utils/supabase/classes-service-fallback';
import { toast } from 'sonner@2.0.3';

interface ClassOccurrence {
  id: string;
  template_id: string;
  template?: {
    name: string;
    type: string;
    category: string;
    level: string;
    description: Record<string, string>;
    color?: string;
  };
  instructor_id: string;
  instructor?: {
    full_name: string;
    avatar_url?: string;
  };
  location_id: string;
  location?: {
    name: string;
    type: string;
    address?: string;
  };
  start_time: string;
  end_time: string;
  price: number;
  capacity: number;
  booked_count: number;
  waitlist_count: number;
  status: 'scheduled' | 'cancelled' | 'completed' | 'moved';
  cancellation_reason?: string;
  weather_backup_used: boolean;
  slug: string;
}

interface ClassScheduleManagerProps {
  viewMode?: 'calendar' | 'list' | 'timeline';
}

export function ClassScheduleManager({ viewMode = 'calendar' }: ClassScheduleManagerProps) {
  const { currentOrg, user } = useMultiTenantAuth();
  const [activeView, setActiveView] = useState(viewMode);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInstructor, setFilterInstructor] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [occurrences, setOccurrences] = useState<ClassOccurrence[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState<ClassOccurrence | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [notifyCustomers, setNotifyCustomers] = useState(true);

  // Load occurrences
  const loadOccurrences = async () => {
    if (!currentOrg) return;
    
    setLoading(true);
    try {
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 7); // Load week before
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 14); // Load 2 weeks after

      let data;
      try {
        // Try the main service first
        data = await classesService.getClassOccurrences(currentOrg.id, {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          instructor_id: filterInstructor === 'all' ? undefined : filterInstructor,
          location_id: filterLocation === 'all' ? undefined : filterLocation,
          status: filterStatus === 'all' ? undefined : [filterStatus]
        });
      } catch (mainError) {
        console.log('Main service not available, using fallback service');
        // Use fallback service
        data = await classesServiceFallback.getClassOccurrences(currentOrg.id, {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          instructor_id: filterInstructor === 'all' ? undefined : filterInstructor,
          location_id: filterLocation === 'all' ? undefined : filterLocation,
          status: filterStatus === 'all' ? undefined : [filterStatus]
        });
      }

      setOccurrences(data || []);
    } catch (error) {
      console.error('Error loading occurrences:', error);
      toast.error('Failed to load class schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentOrg) {
      loadOccurrences();
    }
  }, [currentOrg, selectedDate, filterInstructor, filterLocation, filterStatus]);

  // Filter occurrences by search query
  const filteredOccurrences = occurrences.filter(occurrence => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      occurrence.template?.name?.toLowerCase().includes(searchLower) ||
      occurrence.instructor?.full_name?.toLowerCase().includes(searchLower) ||
      occurrence.location?.name?.toLowerCase().includes(searchLower) ||
      occurrence.template?.category?.toLowerCase().includes(searchLower)
    );
  });

  // Handle cancellation
  const handleCancelOccurrence = async () => {
    if (!selectedOccurrence || !cancellationReason.trim()) return;

    try {
      let result;
      try {
        // Try the main service first
        result = await classesService.cancelOccurrence(
          selectedOccurrence.id, 
          cancellationReason, 
          notifyCustomers
        );
      } catch (mainError) {
        console.log('Main service not available, using fallback service');
        // Use fallback service
        result = await classesServiceFallback.cancelOccurrence(
          selectedOccurrence.id, 
          cancellationReason, 
          notifyCustomers
        );
      }
      
      toast.success('Class cancelled successfully');
      setShowCancelDialog(false);
      setCancellationReason('');
      setSelectedOccurrence(null);
      loadOccurrences();
    } catch (error) {
      console.error('Error cancelling class:', error);
      toast.error('Failed to cancel class');
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('de-CH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'cancelled': return 'destructive';
      case 'completed': return 'secondary';
      case 'moved': return 'outline';
      default: return 'default';
    }
  };

  // Get occupancy status
  const getOccupancyStatus = (occurrence: ClassOccurrence) => {
    const occupancyRate = (occurrence.booked_count / occurrence.capacity) * 100;
    if (occupancyRate >= 100) return { color: 'text-red-600', text: 'Full' };
    if (occupancyRate >= 80) return { color: 'text-orange-600', text: 'Almost Full' };
    if (occupancyRate >= 50) return { color: 'text-yellow-600', text: 'Half Full' };
    return { color: 'text-green-600', text: 'Available' };
  };

  // Render occurrence card
  const renderOccurrenceCard = (occurrence: ClassOccurrence) => {
    const occupancy = getOccupancyStatus(occurrence);
    const occupancyRate = (occurrence.booked_count / occurrence.capacity) * 100;

    return (
      <Card key={occurrence.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {occurrence.template?.color && (
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: occurrence.template.color }}
                  />
                )}
                <CardTitle className="text-lg">{occurrence.template?.name}</CardTitle>
                <Badge variant="outline">{occurrence.template?.category}</Badge>
                <Badge 
                  variant="outline"
                  className={
                    occurrence.template?.level === 'beginner' ? 'bg-green-50 text-green-700' :
                    occurrence.template?.level === 'intermediate' ? 'bg-yellow-50 text-yellow-700' :
                    occurrence.template?.level === 'advanced' ? 'bg-red-50 text-red-700' :
                    'bg-blue-50 text-blue-700'
                  }
                >
                  {occurrence.template?.level}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(occurrence.start_time)} - {formatTime(occurrence.end_time)}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {occurrence.location?.name}
                  {occurrence.location?.type === 'outdoor' && ' (Outdoor)'}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {occurrence.booked_count}/{occurrence.capacity}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={occurrence.instructor?.avatar_url} />
                  <AvatarFallback>
                    {occurrence.instructor?.full_name?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{occurrence.instructor?.full_name}</p>
                </div>
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="text-lg font-semibold">
                {formatCurrency(occurrence.price)}
              </div>
              <Badge variant={getStatusVariant(occurrence.status)}>
                {occurrence.status}
              </Badge>
              <div className={`text-sm ${occupancy.color}`}>
                {occupancy.text}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Occupancy Progress */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Occupancy</span>
              <span>{occupancyRate.toFixed(0)}%</span>
            </div>
            <Progress value={occupancyRate} className="h-2" />
            {occurrence.waitlist_count > 0 && (
              <p className="text-xs text-muted-foreground">
                {occurrence.waitlist_count} on waitlist
              </p>
            )}
          </div>

          {/* Weather warning for outdoor classes */}
          {occurrence.location?.type === 'outdoor' && (
            <div className="mb-4 p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <AlertCircle className="h-3 w-3" />
                Weather dependent - backup plan available
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Roster
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Move className="h-4 w-4 mr-2" />
                  Move/Reschedule
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => {
                    setSelectedOccurrence(occurrence);
                    setShowCancelDialog(true);
                  }}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Cancel Class
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Class Schedule</h2>
          <p className="text-muted-foreground">
            Manage class occurrences, bookings, and attendance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Class
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Class, instructor, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="instructor">Instructor</Label>
              <Select value={filterInstructor} onValueChange={setFilterInstructor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Instructors</SelectItem>
                  <SelectItem value="instructor-1">Sarah Chen</SelectItem>
                  <SelectItem value="instructor-2">David Kumar</SelectItem>
                  <SelectItem value="instructor-3">Maya Patel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="studio-a">Studio A</SelectItem>
                  <SelectItem value="studio-b">Studio B</SelectItem>
                  <SelectItem value="outdoor-1">Lake Zurich Park</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={activeView === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('calendar')}
              >
                Calendar
              </Button>
              <Button
                variant={activeView === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('list')}
              >
                List
              </Button>
              <Button
                variant={activeView === 'timeline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('timeline')}
              >
                Timeline
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : filteredOccurrences.length > 0 ? (
              filteredOccurrences.map(renderOccurrenceCard)
            ) : (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Classes Found</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    {searchQuery 
                      ? 'No classes match your search criteria.'
                      : 'No classes scheduled for the selected date range.'
                    }
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Class
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {/* List view would show a table format */}
          <div className="text-center py-12">
            <p className="text-muted-foreground">List view coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          {/* Timeline view would show a chronological timeline */}
          <div className="text-center py-12">
            <p className="text-muted-foreground">Timeline view coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Class</DialogTitle>
            <DialogDescription>
              This will cancel the class and notify all registered customers.
              Refunds will be processed according to your cancellation policy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Cancellation Reason</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this class is being cancelled..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="notify"
                checked={notifyCustomers}
                onCheckedChange={setNotifyCustomers}
              />
              <Label htmlFor="notify">
                Notify customers and process automatic refunds
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelOccurrence}
              disabled={!cancellationReason.trim()}
            >
              Cancel Class
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}