import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Users, Clock, MapPin, Video, Copy, Edit, MoreHorizontal, Eye, UserCheck, AlertTriangle, Filter, Download, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { BulkActionsDialog } from './BulkActionsDialog';
import { ClassInstanceForm } from './ClassInstanceForm';
import { ClassDetailDialog } from './ClassDetailDialog';
import { WaitlistManagerDialog } from './WaitlistManagerDialog';
import { InstructorScheduleDialog } from './InstructorScheduleDialog';
import { AdvancedScheduleFilters, ScheduleFilters } from './AdvancedScheduleFilters';
import { useLanguage } from './LanguageProvider';

interface ClassOccurrence {
  id: string;
  template_name: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
    phone?: string;
  };
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  capacity: number;
  booked: number;
  waitlist: number;
  location: string;
  room?: string;
  is_online?: boolean;
  online_url?: string;
  language: 'de' | 'fr' | 'it' | 'en';
  status: 'scheduled' | 'cancelled' | 'completed';
  price_chf: number;
  category: string;
  level: string;
  description?: string;
  participants: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    booking_date: string;
    booking_status: 'confirmed' | 'pending' | 'cancelled' | 'no_show';
    payment_status: 'paid' | 'pending' | 'failed' | 'refunded';
    payment_method: 'credit_card' | 'twint' | 'cash' | 'package' | 'membership';
    special_requirements?: string;
    attendance_status?: 'attended' | 'absent' | 'late';
    arrival_time?: string;
    checkin_method?: 'manual' | 'qr_code' | 'mobile_app';
  }>;
  waitlist_participants: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    booking_date: string;
    booking_status: 'confirmed' | 'pending' | 'cancelled' | 'no_show';
    payment_status: 'paid' | 'pending' | 'failed' | 'refunded';
    payment_method: 'credit_card' | 'twint' | 'cash' | 'package' | 'membership';
    special_requirements?: string;
  }>;
  special_instructions?: string;
  equipment_needed?: string[];
  cancellation_reason?: string;
  revenue_total: number;
  revenue_instructor: number;
  revenue_studio: number;
}

interface ScheduleCalendarProps {
  onCreateClass?: () => void;
}

export function FixedScheduleCalendar({ onCreateClass }: ScheduleCalendarProps) {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState<{ type: 'copy_week' | 'bulk_edit' | 'bulk_cancel' } | null>(null);
  const [showClassForm, setShowClassForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassOccurrence | null>(null);
  const [showClassDetail, setShowClassDetail] = useState(false);
  const [showWaitlistManager, setShowWaitlistManager] = useState(false);
  const [showInstructorSchedule, setShowInstructorSchedule] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
  const [filters, setFilters] = useState<ScheduleFilters>({
    search: '',
    locations: [],
    instructors: [],
    categories: [],
    levels: [],
    languages: [],
    timeRange: {},
    dateRange: {},
    priceRange: {},
    capacityRange: {},
    occupancyRange: {},
    status: [],
    paymentMethods: [],
    contentTypes: [],
  });

  // Mock data for demonstration - Enhanced with more comprehensive data
  const mockClasses: ClassOccurrence[] = [
    {
      id: '1',
      template_name: 'Vinyasa Flow Morgen',
      instructor: { 
        id: 'sarah-1',
        name: 'Sarah Müller', 
        avatar: '/avatars/sarah.jpg',
        email: 'sarah@yogastudio.ch',
        phone: '+41 79 123 4567'
      },
      date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '10:30',
      duration_minutes: 90,
      capacity: 20,
      booked: 18,
      waitlist: 3,
      location: 'Studio A',
      room: 'Hauptraum',
      language: 'de',
      status: 'scheduled',
      price_chf: 25,
      category: 'Vinyasa',
      level: 'All Levels',
      description: 'Dynamic Vinyasa flow for an energizing start to your day',
      participants: Array.from({length: 18}, (_, i) => ({
        id: `participant-${i}`,
        name: `Participant ${i + 1}`,
        email: `participant${i + 1}@email.com`,
        booking_date: '2024-01-15',
        booking_status: 'confirmed' as const,
        payment_status: 'paid' as const,
        payment_method: 'credit_card' as const
      })),
      waitlist_participants: Array.from({length: 3}, (_, i) => ({
        id: `waitlist-${i}`,
        name: `Waitlist ${i + 1}`,
        email: `waitlist${i + 1}@email.com`,
        booking_date: '2024-01-16',
        booking_status: 'confirmed' as const,
        payment_status: 'pending' as const,
        payment_method: 'twint' as const
      })),
      revenue_total: 450,
      revenue_instructor: 150,
      revenue_studio: 300
    },
    {
      id: '2',
      template_name: 'Hatha Yoga',
      instructor: { 
        id: 'marcus-1',
        name: 'Marcus Weber', 
        avatar: '/avatars/marcus.jpg',
        email: 'marcus@yogastudio.ch',
        phone: '+41 79 234 5678'
      },
      date: new Date().toISOString().split('T')[0],
      start_time: '10:30',
      end_time: '11:30',
      duration_minutes: 60,
      capacity: 15,
      booked: 12,
      waitlist: 0,
      location: 'Studio B',
      room: 'Ruheraum',
      language: 'de',
      status: 'scheduled',
      price_chf: 20,
      category: 'Hatha',
      level: 'Beginner',
      description: 'Gentle Hatha Yoga class focused on relaxation and mindfulness',
      participants: Array.from({length: 12}, (_, i) => ({
        id: `participant-hatha-${i}`,
        name: `Hatha Participant ${i + 1}`,
        email: `hatha${i + 1}@email.com`,
        booking_date: '2024-01-15',
        booking_status: 'confirmed' as const,
        payment_status: 'paid' as const,
        payment_method: 'package' as const
      })),
      waitlist_participants: [],
      revenue_total: 240,
      revenue_instructor: 80,
      revenue_studio: 160
    }
  ];

  // Mock data for filter options
  const availableOptions = {
    locations: [
      { id: 'studio-a', name: 'Studio A' },
      { id: 'studio-b', name: 'Studio B' },
      { id: 'online', name: 'Online' }
    ],
    instructors: [
      { id: 'sarah-1', name: 'Sarah Müller' },
      { id: 'marcus-1', name: 'Marcus Weber' },
      { id: 'lisa-1', name: 'Lisa Chen' },
      { id: 'marie-1', name: 'Marie Dubois' }
    ],
    categories: ['Vinyasa', 'Hatha', 'Power Yoga', 'Yin', 'Ashtanga', 'Restorative'],
    levels: ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
  };

  // Date helper functions
  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Start on Monday
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);
    
    // Start from Monday of the first week
    startDate.setDate(firstDay.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));
    
    // End on Sunday of the last week
    endDate.setDate(lastDay.getDate() + (7 - lastDay.getDay()) % 7);
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (currentDay <= endDate) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-CH', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  const formatMonthHeader = (date: Date) => {
    return new Intl.DateTimeFormat('de-CH', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatDayNumber = (date: Date) => {
    return date.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  // Navigation functions
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'week') {
      navigateWeek(direction);
    } else if (viewMode === 'month') {
      navigateMonth(direction);
    } else {
      navigateDay(direction);
    }
  };

  const getDateHeader = () => {
    if (viewMode === 'week') {
      return `${formatDate(getWeekDays()[0])} - ${formatDate(getWeekDays()[6])}`;
    } else if (viewMode === 'month') {
      return formatMonthHeader(currentDate);
    } else {
      return formatDate(currentDate);
    }
  };

  const getLanguageFlag = (lang: string) => {
    const flags = { de: '🇩🇪', fr: '🇫🇷', it: '🇮🇹', en: '🇬🇧' };
    return flags[lang as keyof typeof flags] || '🇩🇪';
  };

  // Event handlers
  const handleBulkAction = (actionType: 'copy_week' | 'bulk_edit' | 'bulk_cancel') => {
    setBulkAction({ type: actionType });
    setShowBulkActions(true);
  };

  const handleCreateClass = () => {
    if (onCreateClass) {
      onCreateClass();
    } else {
      setShowClassForm(true);
    }
  };

  const handleClassClick = (classOccurrence: ClassOccurrence) => {
    setSelectedClass(classOccurrence);
    setShowClassDetail(true);
  };

  const handleEditClass = (classId: string) => {
    console.log('Editing class:', classId);
    setShowClassDetail(false);
    setShowClassForm(true);
  };

  const handleInstructorClick = (instructor: any) => {
    setSelectedInstructor(instructor);
    setShowInstructorSchedule(true);
  };

  // Filter classes based on current filters
  const filteredClasses = mockClasses.filter(cls => {
    if (filters.search && !cls.template_name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !cls.instructor.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.locations.length > 0 && !filters.locations.some(loc => 
      cls.location.toLowerCase().includes(loc.toLowerCase()) || 
      availableOptions.locations.find(l => l.id === loc)?.name.toLowerCase() === cls.location.toLowerCase()
    )) {
      return false;
    }
    
    if (filters.instructors.length > 0 && !filters.instructors.includes(cls.instructor.id)) {
      return false;
    }
    
    if (filters.categories.length > 0 && !filters.categories.includes(cls.category)) {
      return false;
    }
    
    if (filters.levels.length > 0 && !filters.levels.includes(cls.level)) {
      return false;
    }
    
    if (filters.languages.length > 0 && !filters.languages.includes(cls.language)) {
      return false;
    }
    
    if (filters.status.length > 0 && !filters.status.includes(cls.status)) {
      return false;
    }
    
    return true;
  });

  const getClassesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredClasses.filter(cls => cls.date === dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Advanced Filters */}
      <AdvancedScheduleFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableOptions={availableOptions}
      />

      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[200px] text-center">
              {getDateHeader()}
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            {t('schedule.today')}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex border rounded-lg">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="rounded-none first:rounded-l-lg last:rounded-r-lg"
              >
                {mode === 'day' ? t('schedule.day') : mode === 'week' ? t('schedule.week') : t('schedule.month')}
              </Button>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                {t('schedule.actions')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleBulkAction('copy_week')}>
                <Copy className="h-4 w-4 mr-2" />
                {t('schedule.copy_week')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('bulk_edit')}>
                <Edit className="h-4 w-4 mr-2" />
                {t('schedule.bulk_edit')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowWaitlistManager(true)}>
                <Users className="h-4 w-4 mr-2" />
                Manage Waitlists
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Schedule
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Send className="h-4 w-4 mr-2" />
                Send Reminders
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                {t('schedule.create_template_from_week')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleCreateClass}>
            <Plus className="h-4 w-4 mr-2" />
            {t('schedule.new_appointment')}
          </Button>
        </div>
      </div>

      {/* Month View */}
      {viewMode === 'month' && (
        <Card>
          <CardContent className="p-0">
            {/* Month header with weekday names */}
            <div className="grid grid-cols-7 border-b">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="p-4 border-r last:border-r-0 text-center bg-muted/30">
                  <span className="text-sm font-medium">{day}</span>
                </div>
              ))}
            </div>
            
            {/* Month calendar grid */}
            <div className="grid grid-cols-7">
              {getMonthDays().map((date, index) => {
                const dayClasses = getClassesForDate(date);
                const isOtherMonth = !isCurrentMonth(date);
                const isTodayDate = isToday(date);
                
                return (
                  <div 
                    key={index} 
                    className={`min-h-[120px] border-r border-b last:border-r-0 p-2 ${
                      isOtherMonth ? 'bg-muted/20' : ''
                    } ${isTodayDate ? 'bg-blue-50' : ''}`}
                  >
                    <div className={`text-sm mb-2 ${
                      isOtherMonth ? 'text-muted-foreground' : 
                      isTodayDate ? 'font-semibold text-blue-600' : ''
                    }`}>
                      {formatDayNumber(date)}
                    </div>
                    
                    <div className="space-y-1">
                      {dayClasses.slice(0, 3).map((cls) => {
                        const occupancyRate = (cls.booked / cls.capacity) * 100;
                        const isNearFull = occupancyRate >= 90;
                        
                        return (
                          <div
                            key={cls.id}
                            className="text-xs p-1 bg-primary/10 border border-primary/20 rounded cursor-pointer hover:bg-primary/20 transition-colors"
                            onClick={() => handleClassClick(cls)}
                          >
                            <div className="font-medium truncate">
                              {cls.start_time} {cls.template_name}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Users className="h-3 w-3" />
                              <span className={`${isNearFull ? 'text-orange-600 font-medium' : ''}`}>
                                {cls.booked}/{cls.capacity}
                              </span>
                              {cls.is_online && <Video className="h-3 w-3 text-blue-500" />}
                              <span>{getLanguageFlag(cls.language)}</span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {dayClasses.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayClasses.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-8 border-b">
              <div className="p-4 border-r bg-muted/30">
                <span className="text-sm font-medium">{t('schedule.time')}</span>
              </div>
              {getWeekDays().map((day, index) => (
                <div key={index} className="p-4 border-r last:border-r-0 text-center bg-muted/30">
                  <div className="font-medium">{formatDate(day)}</div>
                </div>
              ))}
            </div>

            <div className="relative">
              {getTimeSlots().slice(0, 20).map((time) => (
                <div key={time} className="grid grid-cols-8 border-b last:border-b-0 min-h-[60px]">
                  <div className="p-2 border-r bg-muted/10 flex items-center">
                    <span className="text-sm text-muted-foreground">{time}</span>
                  </div>
                  {getWeekDays().map((day, dayIndex) => (
                    <div key={dayIndex} className="border-r last:border-r-0 p-1 relative">
                      {/* Render classes for this time slot and day */}
                      {filteredClasses
                        .filter(cls => cls.start_time === time && cls.date === day.toISOString().split('T')[0])
                        .map((cls) => {
                          const occupancyRate = (cls.booked / cls.capacity) * 100;
                          const isNearFull = occupancyRate >= 90;
                          const hasWaitlist = cls.waitlist > 0;
                          
                          return (
                            <div
                              key={cls.id}
                              className="absolute inset-1 bg-primary/10 border border-primary/20 rounded p-2 cursor-pointer hover:bg-primary/20 transition-colors group"
                              style={{ zIndex: 10 }}
                              onClick={() => handleClassClick(cls)}
                            >
                              <div className="text-xs font-medium truncate">
                                {cls.template_name}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Avatar className="h-4 w-4" onClick={(e) => {
                                  e.stopPropagation();
                                  handleInstructorClick(cls.instructor);
                                }}>
                                  <AvatarImage src={cls.instructor.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {cls.instructor.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground truncate">
                                  {cls.instructor.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span className={`text-xs ${isNearFull ? 'text-orange-600 font-medium' : ''}`}>
                                    {cls.booked}/{cls.capacity}
                                  </span>
                                </div>
                                {cls.is_online && <Video className="h-3 w-3 text-blue-500" />}
                                {hasWaitlist && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                                <span className="text-xs">{getLanguageFlag(cls.language)}</span>
                              </div>
                              
                              {/* Status indicators */}
                              <div className="absolute top-1 right-1 flex gap-1">
                                {cls.status === 'cancelled' && (
                                  <Badge className="text-xs px-1 bg-red-100 text-red-700">
                                    Cancelled
                                  </Badge>
                                )}
                                {isNearFull && (
                                  <Badge className="text-xs px-1 bg-orange-100 text-orange-700">
                                    Full
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Quick actions on hover */}
                              <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-5 w-5 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClass(cls.id);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-5 w-5 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleClassClick(cls);
                                    }}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day View - List Format */}
      {viewMode === 'day' && (
        <div className="grid gap-4">
          {filteredClasses
            .filter(cls => cls.date === currentDate.toISOString().split('T')[0])
            .map((cls) => {
              const occupancyRate = (cls.booked / cls.capacity) * 100;
              const isNearFull = occupancyRate >= 90;
              
              return (
                <Card 
                  key={cls.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleClassClick(cls)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{cls.start_time}</div>
                          <div className="text-sm text-muted-foreground">{cls.duration_minutes}min</div>
                        </div>
                        <div>
                          <h3 className="font-semibold">{cls.template_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {cls.instructor.name} • {cls.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {cls.booked}/{cls.capacity} participants
                          </div>
                          <div className="text-sm text-muted-foreground">
                            CHF {cls.price_chf}
                          </div>
                        </div>
                        <Badge className={`${isNearFull ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          {isNearFull ? 'Nearly Full' : 'Available'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      {/* Dialogs */}
      {showClassDetail && selectedClass && (
        <ClassDetailDialog
          classOccurrence={selectedClass}
          open={showClassDetail}
          onOpenChange={setShowClassDetail}
          onEdit={handleEditClass}
          onCancel={(id, reason) => console.log('Cancel:', id, reason)}
          onDuplicate={(id) => console.log('Duplicate:', id)}
        />
      )}

      {showClassForm && (
        <ClassInstanceForm
          open={showClassForm}
          onOpenChange={setShowClassForm}
          onSave={(data) => console.log('Save:', data)}
        />
      )}

      {showWaitlistManager && (
        <WaitlistManagerDialog
          open={showWaitlistManager}
          onOpenChange={setShowWaitlistManager}
          entries={[]}
          onPromote={(id) => console.log('Promote:', id)}
          onRemove={(id) => console.log('Remove:', id)}
          onNotify={(ids) => console.log('Notify:', ids)}
          onAutoPromote={(id, auto) => console.log('Auto-promote:', id, auto)}
        />
      )}

      {showInstructorSchedule && selectedInstructor && (
        <InstructorScheduleDialog
          instructor={selectedInstructor}
          open={showInstructorSchedule}
          onOpenChange={setShowInstructorSchedule}
          onAssignClass={(id) => console.log('Assign:', id)}
          onEditAssignment={(id) => console.log('Edit assignment:', id)}
          onRemoveAssignment={(id) => console.log('Remove assignment:', id)}
        />
      )}

      {showBulkActions && bulkAction && (
        <BulkActionsDialog
          open={showBulkActions}
          onOpenChange={setShowBulkActions}
          action={bulkAction}
          onConfirm={(action, data) => console.log('Bulk action:', action, data)}
        />
      )}
    </div>
  );
}