import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Users, MapPin, Plus, Edit, Trash2, Copy, 
  ChevronLeft, ChevronRight, Filter, Search, Settings, AlertTriangle,
  CheckCircle, X, RotateCcw, Zap, Bell, Eye, MoreHorizontal,
  CalendarDays, CalendarClock, CalendarPlus, CalendarX, Repeat,
  User, Star, Activity, TrendingUp, BarChart3, PieChart
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';

interface ClassSchedule {
  id: string;
  name: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
    phone: string;
    specialties: string[];
  };
  startTime: string;
  endTime: string;
  duration: number;
  location: {
    id: string;
    name: string;
    capacity: number;
  };
  type: string;
  level: string;
  price: number;
  capacity: number;
  bookedCount: number;
  waitlistCount: number;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  recurrence: {
    type: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
  };
  equipment: string[];
  description: string;
  notes?: string;
  cancellationReason?: string;
  isOutdoor: boolean;
  weatherDependent: boolean;
  autoConfirm: boolean;
  minParticipants: number;
  maxWaitlist: number;
  tags: string[];
}

interface ConflictCheck {
  type: 'instructor' | 'location' | 'capacity';
  severity: 'warning' | 'error';
  message: string;
  conflictingId?: string;
}

interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  schedule: Partial<ClassSchedule>[];
  category: 'weekly' | 'workshop-series' | 'retreat' | 'custom';
}

export function AdvancedScheduleManager() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSchedule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterInstructor, setFilterInstructor] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [conflicts, setConflicts] = useState<ConflictCheck[]>([]);
  const [showConflicts, setShowConflicts] = useState(false);
  const [scheduleStats, setScheduleStats] = useState({
    totalClasses: 0,
    totalBookings: 0,
    averageCapacity: 0,
    revenue: 0
  });

  // Mock data for classes
  const classes: ClassSchedule[] = [
    {
      id: '1',
      name: 'Morning Flow',
      instructor: {
        id: 'inst-1',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
        email: 'sarah@yogaswiss.ch',
        phone: '+41 79 123 4567',
        specialties: ['Vinyasa', 'Meditation', 'Prenatal']
      },
      startTime: '2024-01-15T08:00:00Z',
      endTime: '2024-01-15T09:15:00Z',
      duration: 75,
      location: {
        id: 'studio-a',
        name: 'Studio A',
        capacity: 20
      },
      type: 'Vinyasa',
      level: 'All Levels',
      price: 28.00,
      capacity: 20,
      bookedCount: 18,
      waitlistCount: 3,
      status: 'confirmed',
      recurrence: {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
        endDate: '2024-06-15'
      },
      equipment: ['Mat', 'Blocks'],
      description: 'Start your day with an energizing flow sequence.',
      isOutdoor: false,
      weatherDependent: false,
      autoConfirm: true,
      minParticipants: 5,
      maxWaitlist: 10,
      tags: ['morning', 'energizing', 'popular']
    },
    {
      id: '2',
      name: 'Power Yoga',
      instructor: {
        id: 'inst-2',
        name: 'David Kumar',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        email: 'david@yogaswiss.ch',
        phone: '+41 78 234 5678',
        specialties: ['Ashtanga', 'Power Yoga', 'Advanced']
      },
      startTime: '2024-01-15T18:00:00Z',
      endTime: '2024-01-15T19:30:00Z',
      duration: 90,
      location: {
        id: 'studio-a',
        name: 'Studio A',
        capacity: 20
      },
      type: 'Ashtanga',
      level: 'Advanced',
      price: 38.00,
      capacity: 15,
      bookedCount: 14,
      waitlistCount: 5,
      status: 'confirmed',
      recurrence: {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1, 4], // Monday, Thursday
        endDate: '2024-06-15'
      },
      equipment: ['Mat', 'Towel'],
      description: 'Dynamic, challenging sequence for experienced practitioners.',
      isOutdoor: false,
      weatherDependent: false,
      autoConfirm: true,
      minParticipants: 8,
      maxWaitlist: 8,
      tags: ['power', 'strength', 'advanced']
    },
    {
      id: '3',
      name: 'Restorative Evening',
      instructor: {
        id: 'inst-3',
        name: 'Maya Patel',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        email: 'maya@yogaswiss.ch',
        phone: '+41 76 345 6789',
        specialties: ['Restorative', 'Yin', 'Mindfulness']
      },
      startTime: '2024-01-16T19:30:00Z',
      endTime: '2024-01-16T20:45:00Z',
      duration: 75,
      location: {
        id: 'studio-b',
        name: 'Studio B',
        capacity: 15
      },
      type: 'Restorative',
      level: 'All Levels',
      price: 32.00,
      capacity: 15,
      bookedCount: 12,
      waitlistCount: 0,
      status: 'confirmed',
      recurrence: {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [2, 6], // Tuesday, Saturday
        endDate: '2024-06-15'
      },
      equipment: ['Mat', 'Bolsters', 'Blankets'],
      description: 'Deeply relaxing practice to unwind after a long day.',
      isOutdoor: false,
      weatherDependent: false,
      autoConfirm: true,
      minParticipants: 3,
      maxWaitlist: 5,
      tags: ['restorative', 'relaxing', 'evening']
    }
  ];

  // Mock schedule templates
  const scheduleTemplates: ScheduleTemplate[] = [
    {
      id: 'template-1',
      name: 'Standard Weekly Schedule',
      description: 'Complete weekly schedule with morning, afternoon, and evening classes',
      category: 'weekly',
      schedule: [
        {
          name: 'Morning Flow',
          startTime: '08:00',
          duration: 75,
          type: 'Vinyasa',
          level: 'All Levels',
          recurrence: { type: 'weekly', interval: 1, daysOfWeek: [1, 3, 5] }
        },
        {
          name: 'Power Yoga',
          startTime: '18:00',
          duration: 90,
          type: 'Ashtanga',
          level: 'Advanced',
          recurrence: { type: 'weekly', interval: 1, daysOfWeek: [1, 4] }
        }
      ]
    },
    {
      id: 'template-2',
      name: 'Beginner Workshop Series',
      description: '4-week beginner-friendly workshop series',
      category: 'workshop-series',
      schedule: [
        {
          name: 'Beginner Fundamentals',
          startTime: '10:00',
          duration: 90,
          type: 'Hatha',
          level: 'Beginner',
          recurrence: { type: 'weekly', interval: 1, daysOfWeek: [6] }
        }
      ]
    }
  ];

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('de-CH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const checkConflicts = (newClass: Partial<ClassSchedule>) => {
    const conflicts: ConflictCheck[] = [];
    
    classes.forEach(existingClass => {
      if (existingClass.id === newClass.id) return;
      
      // Check instructor conflicts
      if (newClass.instructor?.id === existingClass.instructor.id) {
        const newStart = new Date(newClass.startTime || '');
        const newEnd = new Date(newClass.endTime || '');
        const existingStart = new Date(existingClass.startTime);
        const existingEnd = new Date(existingClass.endTime);
        
        if (newStart < existingEnd && newEnd > existingStart) {
          conflicts.push({
            type: 'instructor',
            severity: 'error',
            message: `Instructor ${existingClass.instructor.name} is already teaching "${existingClass.name}" at this time`,
            conflictingId: existingClass.id
          });
        }
      }
      
      // Check location conflicts
      if (newClass.location?.id === existingClass.location.id) {
        const newStart = new Date(newClass.startTime || '');
        const newEnd = new Date(newClass.endTime || '');
        const existingStart = new Date(existingClass.startTime);
        const existingEnd = new Date(existingClass.endTime);
        
        if (newStart < existingEnd && newEnd > existingStart) {
          conflicts.push({
            type: 'location',
            severity: 'error',
            message: `${existingClass.location.name} is already booked for "${existingClass.name}" at this time`,
            conflictingId: existingClass.id
          });
        }
      }
    });
    
    return conflicts;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getCapacityStatus = (bookedCount: number, capacity: number) => {
    const percentage = (bookedCount / capacity) * 100;
    if (percentage >= 100) return { color: 'text-red-600', text: 'Full' };
    if (percentage >= 80) return { color: 'text-orange-600', text: 'Almost Full' };
    if (percentage >= 50) return { color: 'text-yellow-600', text: 'Filling Up' };
    return { color: 'text-green-600', text: 'Available' };
  };

  const calculateStats = () => {
    const totalClasses = classes.length;
    const totalBookings = classes.reduce((sum, c) => sum + c.bookedCount, 0);
    const averageCapacity = totalClasses > 0 ? (totalBookings / classes.reduce((sum, c) => sum + c.capacity, 0)) * 100 : 0;
    const revenue = classes.reduce((sum, c) => sum + (c.bookedCount * c.price), 0);
    
    setScheduleStats({
      totalClasses,
      totalBookings,
      averageCapacity,
      revenue
    });
  };

  useEffect(() => {
    calculateStats();
  }, [classes]);

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.instructor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || classItem.status === filterStatus;
    const matchesInstructor = filterInstructor === 'all' || classItem.instructor.id === filterInstructor;
    const matchesLocation = filterLocation === 'all' || classItem.location.id === filterLocation;
    
    return matchesSearch && matchesStatus && matchesInstructor && matchesLocation;
  });

  const duplicateClass = (classItem: ClassSchedule) => {
    const duplicated: ClassSchedule = {
      ...classItem,
      id: `${classItem.id}-copy-${Date.now()}`,
      name: `${classItem.name} (Copy)`,
      bookedCount: 0,
      waitlistCount: 0,
      status: 'scheduled'
    };
    // Add to classes array
    console.log('Duplicating class:', duplicated);
  };

  const cancelClass = (classId: string, reason: string) => {
    // Update class status and add cancellation reason
    console.log('Cancelling class:', classId, 'Reason:', reason);
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    const timeSlots = Array.from({ length: 16 }, (_, i) => {
      const hour = i + 6; // 6 AM to 9 PM
      return `${hour.toString().padStart(2, '0')}:00`;
    });

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Week header */}
          <div className="grid grid-cols-8 gap-1 mb-4">
            <div className="p-2"></div>
            {weekDays.map((day, index) => (
              <div key={index} className="p-2 text-center border rounded-lg">
                <div className="font-semibold">
                  {day.toLocaleDateString('de-CH', { weekday: 'short' })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {day.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })}
                </div>
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="grid grid-cols-8 gap-1">
            {timeSlots.map((timeSlot) => (
              <React.Fragment key={timeSlot}>
                <div className="p-2 text-sm text-muted-foreground text-right">
                  {timeSlot}
                </div>
                {weekDays.map((day, dayIndex) => {
                  const dayClasses = filteredClasses.filter(c => {
                    const classDate = new Date(c.startTime);
                    const classHour = classDate.getHours();
                    return classDate.toDateString() === day.toDateString() && 
                           classHour === parseInt(timeSlot.split(':')[0]);
                  });

                  return (
                    <div key={`${timeSlot}-${dayIndex}`} className="p-1 min-h-[60px] border border-border rounded">
                      {dayClasses.map((classItem) => (
                        <div
                          key={classItem.id}
                          className="p-2 mb-1 bg-primary/10 border border-primary/20 rounded cursor-pointer hover:bg-primary/20 transition-colors"
                          onClick={() => setEditingClass(classItem)}
                        >
                          <div className="text-xs font-medium truncate">
                            {classItem.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {classItem.instructor.name}
                          </div>
                          <div className="text-xs">
                            {classItem.bookedCount}/{classItem.capacity}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-4">
      {filteredClasses.map((classItem) => {
        const capacityStatus = getCapacityStatus(classItem.bookedCount, classItem.capacity);
        
        return (
          <Card key={classItem.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedClasses.includes(classItem.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedClasses([...selectedClasses, classItem.id]);
                      } else {
                        setSelectedClasses(selectedClasses.filter(id => id !== classItem.id));
                      }
                    }}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{classItem.name}</CardTitle>
                      <Badge className={getStatusColor(classItem.status)}>
                        {classItem.status}
                      </Badge>
                      <Badge variant="outline">{classItem.type}</Badge>
                      <Badge variant="outline">{classItem.level}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Time:</span>
                        <p className="font-medium">
                          {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Instructor:</span>
                        <p className="font-medium">{classItem.instructor.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <p className="font-medium">{classItem.location.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Capacity:</span>
                        <p className={`font-medium ${capacityStatus.color}`}>
                          {classItem.bookedCount}/{classItem.capacity} ({capacityStatus.text})
                        </p>
                      </div>
                    </div>

                    {classItem.waitlistCount > 0 && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                          {classItem.waitlistCount} on waitlist
                        </Badge>
                      </div>
                    )}

                    {classItem.recurrence.type !== 'none' && (
                      <div className="mt-2 flex items-center gap-2">
                        <Repeat className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Repeats {classItem.recurrence.type}
                          {classItem.recurrence.endDate && ` until ${formatDate(new Date(classItem.recurrence.endDate))}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {formatCurrency(classItem.price)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Revenue: {formatCurrency(classItem.bookedCount * classItem.price)}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingClass(classItem)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Class
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateClass(classItem)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Bookings
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="h-4 w-4 mr-2" />
                        Manage Waitlist
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Bell className="h-4 w-4 mr-2" />
                        Send Notifications
                      </DropdownMenuItem>
                      <Separator />
                      <DropdownMenuItem 
                        className="text-orange-600"
                        onClick={() => cancelClass(classItem.id, 'Manual cancellation')}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Class
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Advanced Schedule Manager</h1>
          <p className="text-muted-foreground">
            Comprehensive scheduling with conflict detection and automation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowTemplateDialog(true)}>
            <CalendarPlus className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button variant="outline" onClick={() => setShowConflicts(true)}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Conflicts ({conflicts.length})
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Class
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-semibold">{scheduleStats.totalClasses}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-semibold">{scheduleStats.totalBookings}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Capacity</p>
                <p className="text-2xl font-semibold">{scheduleStats.averageCapacity.toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-semibold">{formatCurrency(scheduleStats.revenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() - 7);
                setCurrentDate(newDate);
              }}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h2 className="text-lg font-semibold">
                {currentDate.toLocaleDateString('de-CH', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
              
              <Button variant="outline" size="sm" onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() + 7);
                setCurrentDate(newDate);
              }}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Day
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterInstructor} onValueChange={setFilterInstructor}>
              <SelectTrigger>
                <SelectValue placeholder="Instructor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Instructors</SelectItem>
                <SelectItem value="inst-1">Sarah Chen</SelectItem>
                <SelectItem value="inst-2">David Kumar</SelectItem>
                <SelectItem value="inst-3">Maya Patel</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="studio-a">Studio A</SelectItem>
                <SelectItem value="studio-b">Studio B</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              {selectedClasses.length > 0 && (
                <Button variant="outline" size="sm">
                  Bulk Actions ({selectedClasses.length})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Display */}
      {viewMode === 'week' ? renderWeekView() : renderListView()}

      {/* Create/Edit Class Dialog */}
      <Dialog open={showCreateDialog || !!editingClass} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingClass(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClass ? 'Edit Class' : 'Create New Class'}
            </DialogTitle>
            <DialogDescription>
              Configure class details, recurrence, and settings
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class-name">Class Name</Label>
                  <Input id="class-name" defaultValue={editingClass?.name} />
                </div>
                <div>
                  <Label htmlFor="class-type">Type</Label>
                  <Select defaultValue={editingClass?.type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vinyasa">Vinyasa</SelectItem>
                      <SelectItem value="Hatha">Hatha</SelectItem>
                      <SelectItem value="Ashtanga">Ashtanga</SelectItem>
                      <SelectItem value="Restorative">Restorative</SelectItem>
                      <SelectItem value="Yin">Yin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="class-level">Level</Label>
                  <Select defaultValue={editingClass?.level}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="All Levels">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="class-price">Price (CHF)</Label>
                  <Input id="class-price" type="number" defaultValue={editingClass?.price} />
                </div>
              </div>
              
              <div>
                <Label htmlFor="class-description">Description</Label>
                <Textarea id="class-description" defaultValue={editingClass?.description} rows={3} />
              </div>
            </TabsContent>
            
            <TabsContent value="schedule" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input id="start-time" type="time" />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" type="number" defaultValue={editingClass?.duration} />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" type="number" defaultValue={editingClass?.capacity} />
                </div>
              </div>
              
              <div>
                <Label>Recurrence</Label>
                <Select defaultValue={editingClass?.recurrence.type || 'none'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-confirm">Auto-confirm bookings</Label>
                  <Switch id="auto-confirm" defaultChecked={editingClass?.autoConfirm} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="outdoor">Outdoor class</Label>
                  <Switch id="outdoor" defaultChecked={editingClass?.isOutdoor} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="weather-dependent">Weather dependent</Label>
                  <Switch id="weather-dependent" defaultChecked={editingClass?.weatherDependent} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-participants">Minimum Participants</Label>
                  <Input id="min-participants" type="number" defaultValue={editingClass?.minParticipants} />
                </div>
                <div>
                  <Label htmlFor="max-waitlist">Maximum Waitlist</Label>
                  <Input id="max-waitlist" type="number" defaultValue={editingClass?.maxWaitlist} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="conflicts" className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Conflict Detection
                </h4>
                {conflicts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No conflicts detected</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conflicts.map((conflict, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        conflict.severity === 'error' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
                      }`}>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                            conflict.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
                          }`} />
                          <p className={`text-sm ${
                            conflict.severity === 'error' ? 'text-red-700' : 'text-yellow-700'
                          }`}>
                            {conflict.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setEditingClass(null);
            }}>
              Cancel
            </Button>
            <Button disabled={conflicts.some(c => c.severity === 'error')}>
              {editingClass ? 'Update Class' : 'Create Class'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Templates Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Schedule Templates</DialogTitle>
            <DialogDescription>
              Use pre-built templates to quickly create schedule patterns
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduleTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline">{template.category}</Badge>
                    <p className="text-sm text-muted-foreground">
                      {template.schedule.length} classes included
                    </p>
                  </div>
                  <Button size="sm" className="w-full mt-3">
                    Apply Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}