import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Users, MapPin, Star, Heart, Share2, Info,
  CreditCard, Wallet, Gift, AlertCircle, CheckCircle, X, Plus,
  User, Phone, Mail, Zap, Tag, Package, Eye, ChevronRight,
  ArrowLeft, ArrowRight, Search, Filter, SortAsc, RefreshCw,
  Smartphone, Ban
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
import { ScrollArea } from '../ui/scroll-area';
import { supabaseService } from './SupabaseIntegrationService';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';

interface ClassInstance {
  id: string;
  templateId: string;
  name: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    specialties: string[];
  };
  startTime: string;
  endTime: string;
  duration: number;
  location: {
    id: string;
    name: string;
    address: string;
    capacity: number;
  };
  type: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  price: number;
  currency: 'CHF';
  capacity: number;
  bookedCount: number;
  waitlistCount: number;
  description: string;
  equipment: string[];
  tags: string[];
  isOutdoor: boolean;
  weatherDependent: boolean;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'full';
  cancellationDeadline: string;
  refundPolicy: string;
  requirements?: string[];
  benefits?: string[];
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  walletBalance: number;
  credits: number;
  membershipType?: string;
  membershipExpiry?: string;
  preferences: {
    favoriteInstructors: string[];
    preferredLevel: string;
    preferredTypes: string[];
    notifications: boolean;
  };
}

interface Booking {
  id: string;
  classId: string;
  customerId: string;
  status: 'confirmed' | 'waitlisted' | 'cancelled' | 'completed' | 'no-show';
  bookingTime: string;
  paymentMethod: 'cash' | 'card' | 'twint' | 'credits' | 'membership';
  amount: number;
  notes?: string;
  checkedIn: boolean;
  checkedInTime?: string;
}

export function BookingEngine() {
  const { currentOrg, user } = useMultiTenantAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassInstance | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingStep, setBookingStep] = useState<'select' | 'customer' | 'payment' | 'confirm'>('select');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [classInstances, setClassInstances] = useState<ClassInstance[]>([]);
  const [customerWallet, setCustomerWallet] = useState<any>(null);
  const [customerPasses, setCustomerPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load classes from Supabase
  const loadClasses = async () => {
    if (!currentOrg) return;
    
    setLoading(true);
    try {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const data = await supabaseService.getClassOccurrences(currentOrg.id, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        instructorId: selectedLocation === 'all' ? undefined : selectedLocation,
        status: 'scheduled'
      });

      // Transform Supabase data to match our interface
      const transformedClasses: ClassInstance[] = data?.map((occurrence: any) => ({
        id: occurrence.id,
        templateId: occurrence.template_id,
        name: occurrence.template?.name || 'Unknown Class',
        instructor: {
          id: occurrence.instructor_id,
          name: occurrence.instructor?.full_name || 'Unknown Instructor',
          avatar: occurrence.instructor?.avatar_url,
          rating: 4.8, // TODO: Calculate from feedback
          specialties: occurrence.template?.tags || []
        },
        startTime: occurrence.start_time,
        endTime: occurrence.end_time,
        duration: occurrence.template?.duration_minutes || 60,
        location: {
          id: occurrence.location_id,
          name: occurrence.location?.name || 'Unknown Location',
          address: occurrence.location?.address || '',
          capacity: occurrence.capacity
        },
        type: occurrence.template?.category || 'class',
        level: occurrence.template?.level || 'all_levels',
        price: occurrence.price,
        currency: 'CHF',
        capacity: occurrence.capacity,
        bookedCount: occurrence.booked_count,
        waitlistCount: occurrence.waitlist_count,
        description: occurrence.template?.description?.en || occurrence.template?.description?.de || '',
        equipment: occurrence.template?.equipment_needed || [],
        tags: occurrence.template?.tags || [],
        isOutdoor: occurrence.location?.type === 'outdoor',
        weatherDependent: occurrence.location?.weather_dependent || false,
        status: occurrence.status,
        cancellationDeadline: new Date(new Date(occurrence.start_time).getTime() - 2 * 60 * 60 * 1000).toISOString(),
        refundPolicy: 'Full refund up to 2 hours before class'
      })) || [];

      setClassInstances(transformedClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for classes (fallback)
  const mockClassInstances: ClassInstance[] = [
    {
      id: '1',
      templateId: 'template-1',
      name: 'Morning Flow',
      instructor: {
        id: 'inst-1',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
        rating: 4.9,
        specialties: ['Vinyasa', 'Meditation', 'Prenatal']
      },
      startTime: `${selectedDate}T08:00:00Z`,
      endTime: `${selectedDate}T09:15:00Z`,
      duration: 75,
      location: {
        id: 'loc-1',
        name: 'Studio A',
        address: 'Bahnhofstrasse 1, 8001 Zürich',
        capacity: 20
      },
      type: 'Vinyasa',
      level: 'All Levels',
      price: 28.00,
      currency: 'CHF',
      capacity: 20,
      bookedCount: 16,
      waitlistCount: 2,
      description: 'Start your day with an energizing flow sequence that awakens the body and mind. Perfect for all levels.',
      equipment: ['Mat', 'Blocks'],
      tags: ['morning', 'energizing', 'flow'],
      isOutdoor: false,
      weatherDependent: false,
      status: 'confirmed',
      cancellationDeadline: `${selectedDate}T06:00:00Z`,
      refundPolicy: 'Full refund up to 12 hours before class',
      benefits: ['Increased flexibility', 'Stress relief', 'Better posture']
    },
    {
      id: '2',
      templateId: 'template-2',
      name: 'Power Yoga',
      instructor: {
        id: 'inst-2',
        name: 'David Kumar',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        rating: 4.8,
        specialties: ['Ashtanga', 'Power Yoga', 'Advanced']
      },
      startTime: `${selectedDate}T18:00:00Z`,
      endTime: `${selectedDate}T19:30:00Z`,
      duration: 90,
      location: {
        id: 'loc-1',
        name: 'Studio A',
        address: 'Bahnhofstrasse 1, 8001 Zürich',
        capacity: 20
      },
      type: 'Ashtanga',
      level: 'Advanced',
      price: 38.00,
      currency: 'CHF',
      capacity: 15,
      bookedCount: 14,
      waitlistCount: 5,
      description: 'Dynamic, challenging sequence for experienced practitioners looking to deepen their practice.',
      equipment: ['Mat', 'Towel'],
      tags: ['power', 'strength', 'advanced'],
      isOutdoor: false,
      weatherDependent: false,
      status: 'confirmed',
      cancellationDeadline: `${selectedDate}T16:00:00Z`,
      refundPolicy: 'Full refund up to 2 hours before class',
      requirements: ['Previous yoga experience recommended', 'Good physical fitness']
    },
    {
      id: '3',
      templateId: 'template-3',
      name: 'Outdoor Sunrise Yoga',
      instructor: {
        id: 'inst-3',
        name: 'Maya Patel',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        rating: 4.7,
        specialties: ['Hatha', 'Outdoor', 'Mindfulness']
      },
      startTime: `${selectedDate}T06:30:00Z`,
      endTime: `${selectedDate}T07:45:00Z`,
      duration: 75,
      location: {
        id: 'loc-outdoor-1',
        name: 'Lake Zurich Park',
        address: 'Seefeld, 8008 Zürich',
        capacity: 25
      },
      type: 'Hatha',
      level: 'Beginner',
      price: 32.00,
      currency: 'CHF',
      capacity: 25,
      bookedCount: 8,
      waitlistCount: 0,
      description: 'Greet the sunrise with gentle yoga overlooking beautiful Lake Zurich. Weather permitting.',
      equipment: ['Mat', 'Blanket'],
      tags: ['outdoor', 'sunrise', 'nature', 'gentle'],
      isOutdoor: true,
      weatherDependent: true,
      status: 'confirmed',
      cancellationDeadline: `${selectedDate}T04:30:00Z`,
      refundPolicy: 'Full refund for weather cancellations'
    }
  ];

  // Mock customer data
  const customers: Customer[] = [
    {
      id: 'cust-1',
      firstName: 'Emma',
      lastName: 'Weber',
      email: 'emma.weber@email.ch',
      phone: '+41 79 123 4567',
      walletBalance: 45.50,
      credits: 3,
      membershipType: 'Premium Monthly',
      membershipExpiry: '2024-02-15',
      preferences: {
        favoriteInstructors: ['inst-1'],
        preferredLevel: 'All Levels',
        preferredTypes: ['Vinyasa', 'Restorative'],
        notifications: true
      }
    }
  ];

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    setTimeSlots(slots);
  };

  useEffect(() => {
    generateTimeSlots();
    if (currentOrg) {
      loadClasses();
    }
  }, [currentOrg, selectedDate]);

  // Load customer wallet and passes when customer is selected
  useEffect(() => {
    if (selectedCustomer && currentOrg) {
      loadCustomerWalletAndPasses();
    }
  }, [selectedCustomer, currentOrg]);

  const loadCustomerWalletAndPasses = async () => {
    if (!selectedCustomer || !currentOrg) return;

    try {
      const [wallet, passes] = await Promise.all([
        supabaseService.getCustomerWallet(selectedCustomer.id, currentOrg.id),
        supabaseService.getCustomerPasses(selectedCustomer.id, currentOrg.id)
      ]);

      setCustomerWallet(wallet);
      setCustomerPasses(passes || []);
    } catch (error) {
      console.error('Error loading customer data:', error);
    }
  };

  const filteredClasses = (classInstances.length > 0 ? classInstances : mockClassInstances).filter(classInstance => {
    const matchesSearch = classInstance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classInstance.instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classInstance.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || classInstance.location.id === selectedLocation;
    const matchesLevel = selectedLevel === 'all' || classInstance.level === selectedLevel;
    const matchesType = selectedType === 'all' || classInstance.type === selectedType;
    const matchesAvailable = !showOnlyAvailable || classInstance.bookedCount < classInstance.capacity;
    
    return matchesSearch && matchesLocation && matchesLevel && matchesType && matchesAvailable;
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('de-CH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const getAvailabilityStatus = (classInstance: ClassInstance) => {
    const available = classInstance.capacity - classInstance.bookedCount;
    if (available <= 0) return { status: 'full', color: 'text-red-600', text: 'Full' };
    if (available <= 3) return { status: 'low', color: 'text-orange-600', text: `${available} spots left` };
    return { status: 'available', color: 'text-green-600', text: `${available} spots available` };
  };

  const handleBookClass = (classInstance: ClassInstance) => {
    setSelectedClass(classInstance);
    setBookingStep('select');
    setShowBookingDialog(true);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setBookingStep('payment');
  };

  const processBooking = async () => {
    if (!selectedClass || !selectedCustomer || !currentOrg) return;
    
    setIsProcessing(true);
    
    try {
      // Create booking via Supabase service
      const booking = await supabaseService.createBooking({
        occurrenceId: selectedClass.id,
        customerId: selectedCustomer.id,
        orgId: currentOrg.id,
        paymentMethod,
        amount: selectedClass.price,
        notes: bookingNotes
      });

      setBookingStep('confirm');
      
      // Refresh class data to update counts
      await loadClasses();
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setShowBookingDialog(false);
        setSelectedClass(null);
        setSelectedCustomer(null);
        setPaymentMethod('');
        setBookingNotes('');
        setBookingStep('select');
      }, 3000);
      
    } catch (error) {
      console.error('Error processing booking:', error);
      alert('Error processing booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelClass = async (classInstance: ClassInstance, reason: string) => {
    if (!currentOrg) return;

    try {
      await supabaseService.cancelClassOccurrence(classInstance.id, reason, true);
      await loadClasses(); // Refresh the list
      setShowCancelDialog(false);
      alert('Class cancelled successfully. Customers have been notified and refunds are being processed.');
    } catch (error) {
      console.error('Error cancelling class:', error);
      alert('Error cancelling class. Please try again.');
    }
  };

  const renderClassCard = (classInstance: ClassInstance) => {
    const availability = getAvailabilityStatus(classInstance);
    const isFullyBooked = classInstance.bookedCount >= classInstance.capacity;
    
    return (
      <Card key={classInstance.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-lg">{classInstance.name}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {classInstance.type}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    classInstance.level === 'Beginner' ? 'bg-green-50 text-green-700' :
                    classInstance.level === 'Intermediate' ? 'bg-yellow-50 text-yellow-700' :
                    classInstance.level === 'Advanced' ? 'bg-red-50 text-red-700' :
                    'bg-blue-50 text-blue-700'
                  }`}
                >
                  {classInstance.level}
                </Badge>
                {classInstance.isOutdoor && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    Outdoor
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(classInstance.startTime)} - {formatTime(classInstance.endTime)}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {classInstance.location.name}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {classInstance.bookedCount}/{classInstance.capacity}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={classInstance.instructor.avatar} alt={classInstance.instructor.name} />
                  <AvatarFallback>
                    {classInstance.instructor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{classInstance.instructor.name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{classInstance.instructor.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-semibold mb-1">
                {formatCurrency(classInstance.price)}
              </div>
              <div className={`text-sm font-medium ${availability.color}`}>
                {availability.text}
              </div>
              {classInstance.waitlistCount > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {classInstance.waitlistCount} on waitlist
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {classInstance.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {classInstance.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {classInstance.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{classInstance.tags.length - 3}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedClass(classInstance);
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
              <Button 
                size="sm"
                disabled={isFullyBooked && classInstance.waitlistCount >= 10}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookClass(classInstance);
                }}
              >
                {isFullyBooked ? 'Join Waitlist' : 'Book Now'}
              </Button>
              {user?.role === 'instructor' || user?.role === 'manager' || user?.role === 'owner' ? (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClass(classInstance);
                    setShowCancelDialog(true);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              ) : null}
            </div>
          </div>

          {classInstance.weatherDependent && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <AlertCircle className="h-3 w-3" />
                Weather dependent - check updates before class
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderTimeSlotView = () => {
    const groupedClasses = timeSlots.reduce((acc, slot) => {
      const [hour, minute] = slot.split(':');
      const slotClasses = filteredClasses.filter(c => {
        const classHour = new Date(c.startTime).getHours();
        const classMinute = new Date(c.startTime).getMinutes();
        return classHour === parseInt(hour) && Math.abs(classMinute - parseInt(minute)) < 30;
      });
      
      if (slotClasses.length > 0) {
        acc[slot] = slotClasses;
      }
      return acc;
    }, {} as Record<string, ClassInstance[]>);

    return (
      <div className="space-y-4">
        {Object.entries(groupedClasses).map(([timeSlot, classes]) => (
          <div key={timeSlot} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">{timeSlot}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map(renderClassCard)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Class Booking Engine</h1>
          <p className="text-muted-foreground">
            Complete booking system for classes, workshops, and events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}>
            {viewMode === 'calendar' ? 'List View' : 'Calendar View'}
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Walk-in Booking
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search Classes</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Class name, instructor, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              <Label htmlFor="location">Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="loc-1">Studio A</SelectItem>
                  <SelectItem value="loc-outdoor-1">Lake Zurich Park</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Vinyasa">Vinyasa</SelectItem>
                  <SelectItem value="Hatha">Hatha</SelectItem>
                  <SelectItem value="Ashtanga">Ashtanga</SelectItem>
                  <SelectItem value="Restorative">Restorative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="available-only"
                checked={showOnlyAvailable}
                onCheckedChange={setShowOnlyAvailable}
              />
              <Label htmlFor="available-only" className="text-sm">Show only available classes</Label>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredClasses.length} classes found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Display */}
      {viewMode === 'calendar' ? (
        renderTimeSlotView()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map(renderClassCard)}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {bookingStep === 'select' && 'Book Class'}
              {bookingStep === 'customer' && 'Select Customer'}
              {bookingStep === 'payment' && 'Payment Method'}
              {bookingStep === 'confirm' && 'Booking Confirmed'}
            </DialogTitle>
            <DialogDescription>
              {selectedClass && `${selectedClass.name} with ${selectedClass.instructor.name}`}
            </DialogDescription>
          </DialogHeader>

          {selectedClass && (
            <div className="space-y-6">
              {bookingStep === 'select' && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-2">{selectedClass.name}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Instructor:</span>
                        <p className="font-medium">{selectedClass.instructor.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time:</span>
                        <p className="font-medium">
                          {formatTime(selectedClass.startTime)} - {formatTime(selectedClass.endTime)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <p className="font-medium">{selectedClass.location.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Price:</span>
                        <p className="font-medium">{formatCurrency(selectedClass.price)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setBookingStep('customer')}>
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {bookingStep === 'customer' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Select Customer</h3>
                    {customers.map((customer) => (
                      <Card key={customer.id} className="cursor-pointer hover:shadow-md" onClick={() => handleCustomerSelect(customer)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{customer.firstName} {customer.lastName}</h4>
                              <p className="text-sm text-muted-foreground">{customer.email}</p>
                              {customer.membershipType && (
                                <Badge variant="outline" className="mt-1">
                                  {customer.membershipType}
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {formatCurrency(customer.walletBalance)} wallet
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {customer.credits} credits
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setBookingStep('select')}>
                      Back
                    </Button>
                    <Button variant="outline">
                      Add New Customer
                    </Button>
                  </div>
                </div>
              )}

              {bookingStep === 'payment' && selectedCustomer && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Payment Method</h3>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {selectedCustomer.membershipType && (
                        <Card className={`cursor-pointer ${paymentMethod === 'membership' ? 'ring-2 ring-primary' : ''}`} 
                              onClick={() => setPaymentMethod('membership')}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5" />
                                <div>
                                  <p className="font-medium">Use Membership</p>
                                  <p className="text-xs text-muted-foreground">{selectedCustomer.membershipType}</p>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-700">Free</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {customerWallet && customerWallet.balance >= selectedClass.price && (
                        <Card className={`cursor-pointer ${paymentMethod === 'wallet' ? 'ring-2 ring-primary' : ''}`}
                              onClick={() => setPaymentMethod('wallet')}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Wallet className="h-5 w-5" />
                                <div>
                                  <p className="font-medium">Wallet Balance</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatCurrency(customerWallet.balance)} available
                                  </p>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-700">
                                {formatCurrency(selectedClass.price)}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {customerPasses.filter(p => p.credits_total && (p.credits_total - p.credits_used) > 0).map((pass) => (
                        <Card key={pass.id} className={`cursor-pointer ${paymentMethod === `pass-${pass.id}` ? 'ring-2 ring-primary' : ''}`}
                              onClick={() => setPaymentMethod(`pass-${pass.id}`)}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5" />
                                <div>
                                  <p className="font-medium">{pass.product?.name?.en || 'Class Pass'}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {pass.credits_total - pass.credits_used} credits remaining
                                  </p>
                                </div>
                              </div>
                              <Badge className="bg-blue-100 text-blue-700">1 Credit</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <Card className={`cursor-pointer ${paymentMethod === 'twint' ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => setPaymentMethod('twint')}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Smartphone className="h-5 w-5" />
                              <div>
                                <p className="font-medium">TWINT</p>
                                <p className="text-xs text-muted-foreground">Swiss mobile payment</p>
                              </div>
                            </div>
                            <Badge variant="outline">{formatCurrency(selectedClass.price)}</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className={`cursor-pointer ${paymentMethod === 'card' ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => setPaymentMethod('card')}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-5 w-5" />
                              <div>
                                <p className="font-medium">Credit/Debit Card</p>
                                <p className="text-xs text-muted-foreground">Visa, Mastercard, etc.</p>
                              </div>
                            </div>
                            <Badge variant="outline">{formatCurrency(selectedClass.price)}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="booking-notes">Notes (optional)</Label>
                      <Textarea
                        id="booking-notes"
                        placeholder="Special requirements, dietary restrictions, etc."
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setBookingStep('customer')}>
                      Back
                    </Button>
                    <Button 
                      onClick={processBooking} 
                      disabled={!paymentMethod || isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Complete Booking'}
                    </Button>
                  </div>
                </div>
              )}

              {bookingStep === 'confirm' && (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-600">Booking Confirmed!</h3>
                  <p className="text-muted-foreground">
                    Your booking for {selectedClass.name} has been confirmed.
                    A confirmation email has been sent to {selectedCustomer?.email}.
                  </p>
                  <div className="p-4 bg-muted/50 rounded-lg text-left">
                    <h4 className="font-semibold mb-2">Booking Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Class:</strong> {selectedClass.name}</p>
                      <p><strong>Time:</strong> {formatTime(selectedClass.startTime)} - {formatTime(selectedClass.endTime)}</p>
                      <p><strong>Instructor:</strong> {selectedClass.instructor.name}</p>
                      <p><strong>Location:</strong> {selectedClass.location.name}</p>
                      <p><strong>Payment:</strong> {paymentMethod}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Class Cancellation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this class? All customers will be notified and refunds will be processed automatically.
            </DialogDescription>
          </DialogHeader>

          {selectedClass && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedClass.name}</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Time:</strong> {formatTime(selectedClass.startTime)} - {formatTime(selectedClass.endTime)}</p>
                  <p><strong>Instructor:</strong> {selectedClass.instructor.name}</p>
                  <p><strong>Bookings:</strong> {selectedClass.bookedCount} confirmed</p>
                  <p><strong>Revenue Impact:</strong> {formatCurrency(selectedClass.bookedCount * selectedClass.price)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancel-reason">Cancellation Reason</Label>
                <Select onValueChange={(value) => {
                  if (value === 'emergency') {
                    handleCancelClass(selectedClass, 'Instructor emergency');
                  } else if (value === 'illness') {
                    handleCancelClass(selectedClass, 'Instructor illness');
                  } else if (value === 'technical') {
                    handleCancelClass(selectedClass, 'Technical issues');
                  } else if (value === 'weather') {
                    handleCancelClass(selectedClass, 'Weather conditions');
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="illness">Instructor Illness</SelectItem>
                    <SelectItem value="technical">Technical Issues</SelectItem>
                    <SelectItem value="weather">Weather Conditions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                  Keep Class
                </Button>
                <Button variant="destructive" onClick={() => setShowCancelDialog(false)}>
                  Cancel Class
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}