import React, { useState, useEffect } from 'react';
import { usePortal } from '../PortalProvider';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Calendar } from '../../ui/calendar';
import { ClassCard, type ClassData } from '../../ui/class-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { 
  Calendar as CalendarIcon,
  Clock, 
  MapPin,
  Users,
  Star,
  Heart,
  Filter,
  ChevronLeft,
  ChevronRight,
  List,
  Grid3X3,
  X,
  User,
  Building
} from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

interface SchedulePageProps {
  onPageChange: (page: string) => void;
  initialFilters?: {
    instructor?: string;
    studio?: string;
  };
}

export function SchedulePage({ onPageChange, initialFilters }: SchedulePageProps) {
  const { 
    currentLocation, 
    addToCart 
  } = usePortal();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [filters, setFilters] = useState({
    instructor: (initialFilters?.instructor && typeof initialFilters.instructor === 'string') ? initialFilters.instructor : 'all-instructors',
    studio: (initialFilters?.studio && typeof initialFilters.studio === 'string') ? initialFilters.studio : 'all-studios',
    level: 'all-levels',
    style: 'all-styles',
    language: 'all-languages'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Generate mock schedule data
  const generateScheduleData = (): ClassData[] => {
    const scheduleData: ClassData[] = [];
    const now = new Date();
    
    // Generate 7 days worth of classes
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeek);
      date.setDate(date.getDate() + i);
      
      const dailyClasses: ClassData[] = [
        {
          id: `${i}-1`,
          name: 'Sunrise Vinyasa',
          instructor: {
            id: 'instructor-1',
            name: 'Sarah Miller',
            avatar: '/placeholder-instructor-1.jpg',
            rating: 4.8
          },
          studio: {
            name: 'Flow Studio Zürich',
            location: 'Bahnhofstrasse 45, 8001 Zürich',
            distance: 0.8
          },
          schedule: {
            date: new Date(date),
            time: '07:00',
            duration: 60
          },
          pricing: {
            price: 28,
            currency: 'CHF'
          },
          capacity: {
            total: 20,
            booked: 12
          },
          details: {
            level: 'All Levels',
            style: 'Vinyasa',
            language: 'English',
            isHotRoom: false
          },
          image: '/placeholder-yoga-1.jpg',
          tags: ['Morning', 'Flow', 'Energizing']
        },
        {
          id: `${i}-2`,
          name: 'Power Yoga',
          instructor: {
            id: 'instructor-2',
            name: 'Marc Dubois',
            avatar: '/placeholder-instructor-2.jpg',
            rating: 4.9
          },
          studio: {
            name: 'Heat Studio',
            location: 'Löwenstrasse 12, 8001 Zürich',
            distance: 1.2
          },
          schedule: {
            date: new Date(date),
            time: '12:00',
            duration: 75
          },
          pricing: {
            price: 32,
            currency: 'CHF'
          },
          capacity: {
            total: 25,
            booked: 20
          },
          details: {
            level: 'Intermediate',
            style: 'Power Yoga',
            language: 'German',
            isHotRoom: true
          },
          image: '/placeholder-yoga-2.jpg',
          tags: ['Strength', 'Power', 'Hot']
        },
        {
          id: `${i}-3`,
          name: 'Yin & Meditation',
          instructor: {
            id: 'instructor-3',
            name: 'Lisa Chen',
            avatar: '/placeholder-instructor-3.jpg',
            rating: 4.7
          },
          studio: {
            name: 'Zen Space',
            location: 'Seestrasse 23, 8001 Zürich',
            distance: 0.5
          },
          schedule: {
            date: new Date(date),
            time: '18:30',
            duration: 90
          },
          pricing: {
            price: 25,
            currency: 'CHF'
          },
          capacity: {
            total: 15,
            booked: 3
          },
          details: {
            level: 'Beginner',
            style: 'Yin',
            language: 'English',
            isHotRoom: false
          },
          image: '/placeholder-yoga-3.jpg',
          tags: ['Relaxing', 'Restorative', 'Meditation']
        }
      ];
      
      scheduleData.push(...dailyClasses);
    }
    
    return scheduleData;
  };

  const [scheduleData] = useState(() => {
    try {
      const data = generateScheduleData();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error generating schedule data:', error);
      return [];
    }
  });

  // Initialize filters from URL or props
  useEffect(() => {
    if (initialFilters && typeof initialFilters === 'object') {
      const safeFilters = {
        instructor: (initialFilters.instructor && typeof initialFilters.instructor === 'string') ? initialFilters.instructor : 'all-instructors',
        studio: (initialFilters.studio && typeof initialFilters.studio === 'string') ? initialFilters.studio : 'all-studios'
      };
      
      // Only update if we have valid filter values
      const hasValidFilters = Object.values(safeFilters).some(value => 
        value !== 'all-instructors' && 
        value !== 'all-studios'
      );
      
      if (hasValidFilters) {
        setFilters(prev => ({
          ...prev,
          ...safeFilters
        }));
        setShowFilters(true); // Show filters if we have initial filters
      }
    }
  }, [initialFilters]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getDayName = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long'
    }).format(date);
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Ensure all filter values are safe strings
  const safeFilters = {
    instructor: (filters.instructor && typeof filters.instructor === 'string') ? filters.instructor : 'all-instructors',
    studio: (filters.studio && typeof filters.studio === 'string') ? filters.studio : 'all-studios',
    level: (filters.level && typeof filters.level === 'string') ? filters.level : 'all-levels',
    style: (filters.style && typeof filters.style === 'string') ? filters.style : 'all-styles',
    language: (filters.language && typeof filters.language === 'string') ? filters.language : 'all-languages'
  };

  const getClassesForDate = (date: Date) => {
    if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
      return [];
    }
    
    return scheduleData.filter(class_ => {
      // Date filter
      const matchesDate = class_.schedule.date.toDateString() === date.toDateString();
      if (!matchesDate) return false;
      
      // Apply filters with null checks using safeFilters
      if (safeFilters.instructor !== 'all-instructors' && (!class_.instructor?.name || !class_.instructor.name.toLowerCase().includes(safeFilters.instructor.toLowerCase()))) {
        return false;
      }
      
      if (safeFilters.studio !== 'all-studios' && (!class_.studio?.name || !class_.studio.name.toLowerCase().includes(safeFilters.studio.toLowerCase()))) {
        return false;
      }
      
      if (safeFilters.level !== 'all-levels' && class_.details?.level !== safeFilters.level) {
        return false;
      }
      
      if (safeFilters.style !== 'all-styles' && class_.details?.style !== safeFilters.style) {
        return false;
      }
      
      if (safeFilters.language !== 'all-languages' && class_.details?.language !== safeFilters.language) {
        return false;
      }
      
      return true;
    });
  };

  const clearFilters = () => {
    try {
      setFilters({
        instructor: 'all-instructors',
        studio: 'all-studios',
        level: 'all-levels',
        style: 'all-styles',
        language: 'all-languages'
      });
    } catch (error) {
      console.error('Error clearing filters:', error);
      // Force reset with a fresh state
      setFilters({
        instructor: 'all-instructors',
        studio: 'all-studios',
        level: 'all-levels',
        style: 'all-styles',
        language: 'all-languages'
      });
    }
  };

  const hasActiveFilters = Object.values(safeFilters).some(filter => 
    filter !== 'all-instructors' && 
    filter !== 'all-studios' && 
    filter !== 'all-levels' && 
    filter !== 'all-styles' && 
    filter !== 'all-languages'
  );

  // Get unique values for filter dropdowns with comprehensive null checks and error handling
  const safeScheduleData = Array.isArray(scheduleData) ? scheduleData : [];
  
  // Safely extract unique values with error boundaries
  const getUniqueValues = (accessor: (item: any) => string, label: string) => {
    try {
      const values = safeScheduleData
        .filter(c => {
          try {
            const value = accessor(c);
            return value && typeof value === 'string' && value.trim().length > 0;
          } catch {
            return false;
          }
        })
        .map(accessor)
        .filter(value => value && typeof value === 'string' && value.trim().length > 0);
      
      return Array.from(new Set(values));
    } catch (error) {
      console.error(`Error extracting unique ${label}:`, error);
      return [];
    }
  };
  
  const uniqueInstructors = getUniqueValues(c => c?.instructor?.name, 'instructors');
  const uniqueStudios = getUniqueValues(c => c?.studio?.name, 'studios');
  const uniqueLevels = getUniqueValues(c => c?.details?.level, 'levels');
  const uniqueStyles = getUniqueValues(c => c?.details?.style, 'styles');
  const uniqueLanguages = getUniqueValues(c => c?.details?.language, 'languages');

  const handleBookClass = (classData: ClassData) => {
    addToCart({
      id: classData.id,
      type: 'class',
      name: classData.name,
      date: classData.schedule.date,
      time: classData.schedule.time,
      price: classData.pricing.price,
      quantity: 1,
      instructorName: classData.instructor.name,
      studioName: classData.studio.name
    });
  };

  const handleViewClassDetails = (classId: string) => {
    onPageChange(`class-detail-${classId}`);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Full-Width Hero Section */}
      <section className="relative h-[50vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1588286840104-8957b019727f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwY2xhc3MlMjBzdHVkaW8lMjBpbnN0cnVjdG9yfGVufDF8fHx8MTc1Njc5MzMxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Yoga class schedule"
            className="w-full h-full object-cover"
          />
          {/* Elegant Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl text-white">
              <div className="space-y-4">
                <div className="overline">Book Your Practice</div>
                <h1 className="font-serif text-4xl lg:text-5xl font-bold leading-tight">
                  Class Schedule
                </h1>
                <p className="text-lg text-white/90 max-w-xl leading-relaxed">
                  {hasActiveFilters ? 'Filtered results' : 'Find and book your perfect class in'} {currentLocation?.name}
                  {safeFilters.instructor !== 'all-instructors' && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {safeFilters.instructor}
                    </span>
                  )}
                  {safeFilters.studio !== 'all-studios' && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {safeFilters.studio}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold">
                Available Classes
              </h2>
              <p className="text-muted-foreground">
                Find your perfect practice time
              </p>
            </div>
          
            <div className="flex items-center gap-2">
              <div className="hidden md:flex border rounded-lg p-1">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                variant={hasActiveFilters ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {Object.values(filters).filter(f => f !== '').length}
                  </Badge>
                )}
              </Button>
              
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Instructor Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instructor</label>
                  {uniqueInstructors.length > 0 ? (
                    <Select
                      value={safeFilters.instructor}
                      onValueChange={(value) => {
                        try {
                          setFilters(prev => ({ ...prev, instructor: value || "all-instructors" }));
                        } catch (error) {
                          console.error('Error setting instructor filter:', error);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All instructors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-instructors">All instructors</SelectItem>
                        {uniqueInstructors.map((instructor) => {
                          if (!instructor || typeof instructor !== 'string' || instructor.trim() === '') {
                            return null;
                          }
                          const safeValue = instructor.trim();
                          const safeKey = `instructor-${safeValue.replace(/[^a-zA-Z0-9-_]/g, '-')}-${instructor.length}`;
                          
                          return (
                            <SelectItem key={safeKey} value={safeValue}>
                              {safeValue}
                            </SelectItem>
                          );
                        }).filter(Boolean)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="px-3 py-2 border rounded-md text-sm text-muted-foreground bg-muted/50">
                      No instructors available
                    </div>
                  )}
                </div>

                {/* Studio Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Studio</label>
                  {uniqueStudios.length > 0 ? (
                    <Select
                      value={safeFilters.studio}
                      onValueChange={(value) => {
                        try {
                          setFilters(prev => ({ ...prev, studio: value || "all-studios" }));
                        } catch (error) {
                          console.error('Error setting studio filter:', error);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All studios" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-studios">All studios</SelectItem>
                        {uniqueStudios.map((studio) => {
                          if (!studio || typeof studio !== 'string' || studio.trim() === '') {
                            return null;
                          }
                          const safeValue = studio.trim();
                          const safeKey = `studio-${safeValue.replace(/[^a-zA-Z0-9-_]/g, '-')}-${studio.length}`;
                          
                          return (
                            <SelectItem key={safeKey} value={safeValue}>
                              {safeValue}
                            </SelectItem>
                          );
                        }).filter(Boolean)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="px-3 py-2 border rounded-md text-sm text-muted-foreground bg-muted/50">
                      No studios available
                    </div>
                  )}
                </div>

                {/* Level Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Level</label>
                  {uniqueLevels.length > 0 ? (
                    <Select
                      value={safeFilters.level}
                      onValueChange={(value) => {
                        try {
                          setFilters(prev => ({ ...prev, level: value || "all-levels" }));
                        } catch (error) {
                          console.error('Error setting level filter:', error);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-levels">All levels</SelectItem>
                        {uniqueLevels.map((level) => {
                          if (!level || typeof level !== 'string' || level.trim() === '') {
                            return null;
                          }
                          const safeValue = level.trim();
                          const safeKey = `level-${safeValue.replace(/[^a-zA-Z0-9-_]/g, '-')}-${level.length}`;
                          
                          return (
                            <SelectItem key={safeKey} value={safeValue}>
                              {safeValue}
                            </SelectItem>
                          );
                        }).filter(Boolean)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="px-3 py-2 border rounded-md text-sm text-muted-foreground bg-muted/50">
                      No levels available
                    </div>
                  )}
                </div>

                {/* Style Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Style</label>
                  {uniqueStyles.length > 0 ? (
                    <Select
                      value={safeFilters.style}
                      onValueChange={(value) => {
                        try {
                          setFilters(prev => ({ ...prev, style: value || "all-styles" }));
                        } catch (error) {
                          console.error('Error setting style filter:', error);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All styles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-styles">All styles</SelectItem>
                        {uniqueStyles.map((style) => {
                          if (!style || typeof style !== 'string' || style.trim() === '') {
                            return null;
                          }
                          const safeValue = style.trim();
                          const safeKey = `style-${safeValue.replace(/[^a-zA-Z0-9-_]/g, '-')}-${style.length}`;
                          
                          return (
                            <SelectItem key={safeKey} value={safeValue}>
                              {safeValue}
                            </SelectItem>
                          );
                        }).filter(Boolean)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="px-3 py-2 border rounded-md text-sm text-muted-foreground bg-muted/50">
                      No styles available
                    </div>
                  )}
                </div>

                {/* Language Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  {uniqueLanguages.length > 0 ? (
                    <Select
                      value={safeFilters.language}
                      onValueChange={(value) => {
                        try {
                          setFilters(prev => ({ ...prev, language: value || "all-languages" }));
                        } catch (error) {
                          console.error('Error setting language filter:', error);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All languages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-languages">All languages</SelectItem>
                        {uniqueLanguages.map((language) => {
                          if (!language || typeof language !== 'string' || language.trim() === '') {
                            return null;
                          }
                          const safeValue = language.trim();
                          const safeKey = `language-${safeValue.replace(/[^a-zA-Z0-9-_]/g, '-')}-${language.length}`;
                          
                          return (
                            <SelectItem key={safeKey} value={safeValue}>
                              {safeValue}
                            </SelectItem>
                          );
                        }).filter(Boolean)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="px-3 py-2 border rounded-md text-sm text-muted-foreground bg-muted/50">
                      No languages available
                    </div>
                  )}
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {safeFilters.instructor !== 'all-instructors' && (
                    <Badge variant="secondary" className="gap-1">
                      <User className="h-3 w-3" />
                      {safeFilters.instructor}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilters(prev => ({ ...prev, instructor: 'all-instructors' }))}
                      />
                    </Badge>
                  )}
                  {safeFilters.studio !== 'all-studios' && (
                    <Badge variant="secondary" className="gap-1">
                      <Building className="h-3 w-3" />
                      {safeFilters.studio}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilters(prev => ({ ...prev, studio: 'all-studios' }))}
                      />
                    </Badge>
                  )}
                  {safeFilters.level !== 'all-levels' && (
                    <Badge variant="secondary" className="gap-1">
                      Level: {safeFilters.level}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilters(prev => ({ ...prev, level: 'all-levels' }))}
                      />
                    </Badge>
                  )}
                  {safeFilters.style !== 'all-styles' && (
                    <Badge variant="secondary" className="gap-1">
                      Style: {safeFilters.style}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilters(prev => ({ ...prev, style: 'all-styles' }))}
                      />
                    </Badge>
                  )}
                  {safeFilters.language !== 'all-languages' && (
                    <Badge variant="secondary" className="gap-1">
                      Language: {safeFilters.language}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilters(prev => ({ ...prev, language: 'all-languages' }))}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'calendar' | 'list')} className="space-y-6">
          <TabsList className="hidden">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Week
              </Button>
              
              <h3 className="font-medium">
                {formatDate(getWeekDates()[0])} - {formatDate(getWeekDates()[6])}
              </h3>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateWeek('next')}
              >
                Next Week
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-4">
              {getWeekDates().map((date, index) => {
                const classesForDay = getClassesForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div key={index} className="space-y-2">
                    <div className={`text-center p-3 rounded-lg ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <div className="text-sm font-medium">{getDayName(date)}</div>
                      <div className="text-lg font-semibold">{date.getDate()}</div>
                    </div>
                    
                    <div className="space-y-2">
                      {classesForDay.map((class_) => (
                        <Card key={class_.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                          <div className="space-y-1">
                            <div className="text-sm font-medium truncate">{class_.name}</div>
                            <div className="text-xs text-muted-foreground">{class_.schedule.time}</div>
                            <div className="text-xs text-muted-foreground truncate">{class_.instructor.name}</div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium">{formatPrice(class_.pricing.price)}</span>
                              <span className="text-xs text-muted-foreground">
                                {class_.capacity.total - class_.capacity.booked} spots
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                      
                      {classesForDay.length === 0 && (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          No classes
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            {scheduleData.length > 0 ? (
              scheduleData.map((class_) => (
                <ClassCard
                  key={class_.id}
                  classData={class_}
                  onBook={() => handleBookClass(class_)}
                  onViewDetails={() => handleViewClassDetails(class_.id)}
                  showDate={true}
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <div className="space-y-2">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="font-medium">No classes found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or check back later for new classes.
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}