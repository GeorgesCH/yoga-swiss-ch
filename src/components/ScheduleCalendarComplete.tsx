import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Users, Clock, MapPin, Video, Copy, Edit, MoreHorizontal, Eye, UserCheck, AlertTriangle, Filter, Download, Send, Mountain, TreePine, Waves, Building, CloudSun } from 'lucide-react';
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

export function ScheduleCalendar({ onCreateClass }: ScheduleCalendarProps) {
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

  // Enhanced mock data with outdoor locations
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
      id: '5',
      template_name: 'Morning Lake Yoga',
      instructor: { 
        id: 'sarah-1',
        name: 'Sarah Müller', 
        avatar: '/avatars/sarah.jpg',
        email: 'sarah@yogastudio.ch',
        phone: '+41 79 123 4567'
      },
      date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      start_time: '07:00',
      end_time: '08:30',
      duration_minutes: 90,
      capacity: 15,
      booked: 12,
      waitlist: 2,
      location: 'Lake Zurich',
      room: 'East Shore',
      language: 'de',
      status: 'scheduled',
      price_chf: 35,
      category: 'Vinyasa',
      level: 'All Levels',
      description: 'Sunrise yoga session by the beautiful Lake Zurich',
      participants: Array.from({length: 12}, (_, i) => ({
        id: `participant-lake-${i}`,
        name: `Lake Participant ${i + 1}`,
        email: `lake${i + 1}@email.com`,
        booking_date: '2024-01-15',
        booking_status: 'confirmed' as const,
        payment_status: 'paid' as const,
        payment_method: 'credit_card' as const
      })),
      waitlist_participants: Array.from({length: 2}, (_, i) => ({
        id: `waitlist-lake-${i}`,
        name: `Lake Waitlist ${i + 1}`,
        email: `lakewaitlist${i + 1}@email.com`,
        booking_date: '2024-01-16',
        booking_status: 'confirmed' as const,
        payment_status: 'pending' as const,
        payment_method: 'twint' as const
      })),
      revenue_total: 420,
      revenue_instructor: 140,
      revenue_studio: 280
    },
    {
      id: '6',
      template_name: 'Mountain Meditation',
      instructor: { 
        id: 'marcus-1',
        name: 'Marcus Weber', 
        avatar: '/avatars/marcus.jpg',
        email: 'marcus@yogastudio.ch',
        phone: '+41 79 234 5678'
      },
      date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Day after tomorrow
      start_time: '16:00',
      end_time: '17:30',
      duration_minutes: 90,
      capacity: 12,
      booked: 10,
      waitlist: 0,
      location: 'Uetliberg',
      room: 'Summit Platform',
      language: 'en',
      status: 'scheduled',
      price_chf: 40,
      category: 'Meditation',
      level: 'All Levels',
      description: 'Guided meditation with panoramic views of Zurich',
      participants: Array.from({length: 10}, (_, i) => ({
        id: `participant-mountain-${i}`,
        name: `Mountain Participant ${i + 1}`,
        email: `mountain${i + 1}@email.com`,
        booking_date: '2024-01-15',
        booking_status: 'confirmed' as const,
        payment_status: 'paid' as const,
        payment_method: 'package' as const
      })),
      waitlist_participants: [],
      revenue_total: 400,
      revenue_instructor: 120,
      revenue_studio: 280
    }
  ];

  // Mock data for filter options - Including outdoor locations
  const availableOptions = {
    locations: [
      { id: 'studio-a', name: 'Studio A' },
      { id: 'studio-b', name: 'Studio B' },
      { id: 'online', name: 'Online' },
      { id: 'lake-zurich', name: 'Lake Zurich' },
      { id: 'uetliberg', name: 'Uetliberg' },
      { id: 'park-outdoor', name: 'City Park' },
      { id: 'rooftop-studio', name: 'Rooftop Studio' }
    ],
    instructors: [
      { id: 'sarah-1', name: 'Sarah Müller' },
      { id: 'marcus-1', name: 'Marcus Weber' },
      { id: 'lisa-1', name: 'Lisa Chen' },
      { id: 'marie-1', name: 'Marie Dubois' }
    ],
    categories: ['Vinyasa', 'Hatha', 'Power Yoga', 'Yin', 'Ashtanga', 'Restorative', 'Meditation'],
    levels: ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
  };

  // Helper functions
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

  const getLanguageFlag = (lang: string) => {
    const flags = { de: '🇩🇪', fr: '🇫🇷', it: '🇮🇹', en: '🇬🇧' };
    return flags[lang as keyof typeof flags] || '🇩🇪';
  };

  const getLocationIcon = (location: string) => {
    const lowerLocation = location.toLowerCase();
    if (lowerLocation.includes('lake') || lowerLocation.includes('river')) {
      return <Waves className="h-3 w-3 text-blue-500" />;
    } else if (lowerLocation.includes('mountain') || lowerLocation.includes('berg') || lowerLocation.includes('hill')) {
      return <Mountain className="h-3 w-3 text-green-600" />;
    } else if (lowerLocation.includes('park') || lowerLocation.includes('forest') || lowerLocation.includes('garden')) {
      return <TreePine className="h-3 w-3 text-green-500" />;
    } else if (lowerLocation.includes('rooftop') || lowerLocation.includes('terrace')) {
      return <Building className="h-3 w-3 text-gray-600" />;
    } else if (lowerLocation.includes('online')) {
      return <Video className="h-3 w-3 text-blue-500" />;
    } else {
      return <MapPin className="h-3 w-3 text-gray-500" />;
    }
  };

  // Event handlers
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

  // Get classes for a specific date
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (viewMode === 'week') navigateWeek('prev');
                else if (viewMode === 'month') navigateMonth('prev');
                else navigateDay('prev');
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[200px] text-center">
              {viewMode === 'week' && (
                `${formatDate(getWeekDays()[0])} - ${formatDate(getWeekDays()[6])}`
              )}
              {viewMode === 'month' && formatMonthHeader(currentDate)}
              {viewMode === 'day' && formatDate(currentDate)}
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (viewMode === 'week') navigateWeek('next');
                else if (viewMode === 'month') navigateMonth('next');
                else navigateDay('next');
              }}
            >
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
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                {t('schedule.copy_week')}
              </DropdownMenuItem>
              <DropdownMenuItem>
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
              {getTimeSlots().slice(0, 20).map((time, timeIndex) => (
                <div key={time} className="grid grid-cols-8 border-b last:border-b-0 min-h-[60px]">
                  <div className="p-2 border-r bg-muted/10 flex items-center">
                    <span className="text-sm text-muted-foreground">{time}</span>
                  </div>
                  {getWeekDays().map((day, dayIndex) => (
                    <div key={dayIndex} className="border-r last:border-r-0 p-1 relative">
                      {/* Render classes for this time slot and day */}
                      {filteredClasses
                        .filter(cls => cls.start_time === time && cls.date === day.toISOString().split('T')[0])
                        .map((cls, clsIndex) => {
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
                                <Avatar className="h-4 w-4">
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
                                {getLocationIcon(cls.location)}
                                {hasWaitlist && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                                <span className="text-xs">{getLanguageFlag(cls.language)}</span>
                              </div>
                              
                              {/* Status indicators */}
                              {cls.status === 'cancelled' && (
                                <Badge className="text-xs px-1 bg-red-100 text-red-700 absolute top-1 right-1">
                                  Cancelled
                                </Badge>
                              )}
                              {isNearFull && (
                                <Badge className="text-xs px-1 bg-orange-100 text-orange-700 absolute top-1 right-1">
                                  Full
                                </Badge>
                              )}
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

      {/* Month View */}
      {viewMode === 'month' && (
        <Card>
          <CardContent className="p-0">
            {/* Month Header */}
            <div className="grid grid-cols-7 border-b">
              {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
                <div key={day} className="p-4 text-center bg-muted/30 border-r last:border-r-0">
                  <span className="text-sm font-medium">{day}</span>
                </div>
              ))}
            </div>

            {/* Month Grid */}
            <div className="grid grid-cols-7">
              {getMonthDays().map((day, index) => {
                const dayClasses = getClassesForDate(day);
                const isCurrentMonthDay = isCurrentMonth(day);
                const isTodayDay = isToday(day);
                
                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border-r border-b last:border-r-0 p-2 ${
                      !isCurrentMonthDay ? 'bg-muted/20 text-muted-foreground' : ''
                    } ${isTodayDay ? 'bg-primary/5' : ''}`}
                  >
                    <div className={`flex items-center justify-between mb-2 ${isTodayDay ? 'font-semibold' : ''}`}>
                      <span className={`text-sm ${isTodayDay ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                        {formatDayNumber(day)}
                      </span>
                    </div>
                    
                    {/* Classes for this day */}
                    <div className="space-y-1">
                      {dayClasses.slice(0, 3).map((cls) => {
                        const occupancyRate = (cls.booked / cls.capacity) * 100;
                        const isNearFull = occupancyRate >= 90;
                        
                        return (
                          <div
                            key={cls.id}
                            className="text-xs p-1 rounded bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                            onClick={() => handleClassClick(cls)}
                          >
                            <div className="flex items-center gap-1">
                              <span className="font-medium truncate flex-1">
                                {cls.start_time} {cls.template_name}
                              </span>
                              {getLocationIcon(cls.location)}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Users className="h-2 w-2" />
                              <span className={isNearFull ? 'text-orange-600' : ''}>
                                {cls.booked}/{cls.capacity}
                              </span>
                              <span>{getLanguageFlag(cls.language)}</span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Show more indicator */}
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

      {/* Day View */}
      {viewMode === 'day' && (
        <Card>
          <CardContent className="p-0">
            <div className="border-b bg-muted/30 p-4">
              <h3 className="font-medium">{formatDate(currentDate)}</h3>
            </div>
            
            <div className="relative">
              {getTimeSlots().map((time) => {
                const dayClasses = getClassesForDate(currentDate).filter(cls => cls.start_time === time);
                
                return (
                  <div key={time} className="flex border-b last:border-b-0 min-h-[80px]">
                    <div className="w-20 p-4 border-r bg-muted/10 flex items-center">
                      <span className="text-sm text-muted-foreground">{time}</span>
                    </div>
                    <div className="flex-1 p-2 relative">
                      {dayClasses.map((cls) => {
                        const occupancyRate = (cls.booked / cls.capacity) * 100;
                        const isNearFull = occupancyRate >= 90;
                        const hasWaitlist = cls.waitlist > 0;
                        
                        return (
                          <div
                            key={cls.id}
                            className="bg-primary/10 border border-primary/20 rounded p-3 cursor-pointer hover:bg-primary/20 transition-colors"
                            onClick={() => handleClassClick(cls)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{cls.template_name}</h4>
                              <div className="flex items-center gap-2">
                                {getLocationIcon(cls.location)}
                                <span className="text-sm text-muted-foreground">{cls.location}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={cls.instructor.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {cls.instructor.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{cls.instructor.name}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span className={isNearFull ? 'text-orange-600 font-medium' : ''}>
                                  {cls.booked}/{cls.capacity}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{cls.start_time} - {cls.end_time}</span>
                              </div>
                              
                              <span>{getLanguageFlag(cls.language)}</span>
                              
                              {hasWaitlist && (
                                <div className="flex items-center gap-1 text-orange-600">
                                  <AlertTriangle className="h-4 w-4" />
                                  <span>{cls.waitlist} waitlist</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      {showClassDetail && selectedClass && (
        <ClassDetailDialog
          classOccurrence={selectedClass}
          isOpen={showClassDetail}
          onClose={() => setShowClassDetail(false)}
          onEdit={() => console.log('Edit class')}
          onCancel={() => console.log('Cancel class')}
          onDuplicate={() => console.log('Duplicate class')}
        />
      )}

      {showWaitlistManager && (
        <WaitlistManagerDialog
          isOpen={showWaitlistManager}
          onClose={() => setShowWaitlistManager(false)}
          waitlistEntries={[]}
          onPromote={() => console.log('Promote')}
          onRemove={() => console.log('Remove')}
          onNotify={() => console.log('Notify')}
          onUpdateAutoPromote={() => console.log('Update auto-promote')}
        />
      )}

      {showClassForm && (
        <ClassInstanceForm
          isOpen={showClassForm}
          onClose={() => setShowClassForm(false)}
          onSave={() => console.log('Save class')}
          templates={[]}
          instructors={availableOptions.instructors}
          locations={availableOptions.locations}
        />
      )}
    </div>
  );
}