import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Star,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  X,
  Info,
  CreditCard,
  Wallet
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';

interface Booking {
  id: string;
  classId: string;
  className: string;
  instructor: string;
  studio: string;
  date: Date;
  time: string;
  duration: number;
  price: number;
  status: 'confirmed' | 'waitlist' | 'cancelled';
  canReschedule: boolean;
  rescheduleDeadline: Date;
  creditsUsed: number;
  paymentMethod: string;
}

interface AvailableClass {
  id: string;
  name: string;
  instructor: string;
  studio: string;
  date: Date;
  time: string;
  duration: number;
  price: number;
  spotsLeft: number;
  totalSpots: number;
  waitlistAvailable: boolean;
  level: string;
  style: string;
  isCompatible: boolean;
  priceDifference: number;
}

interface RescheduleBookingManagerProps {
  bookingId: string;
  onClose: () => void;
  onRescheduleComplete: (newBooking: Booking) => void;
}

export function RescheduleBookingManager({ 
  bookingId, 
  onClose, 
  onRescheduleComplete 
}: RescheduleBookingManagerProps) {
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<AvailableClass | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [studioFilter, setStudioFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [timeOfDayFilter, setTimeOfDayFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [step, setStep] = useState<'search' | 'confirm'>('search');

  // Mock current booking - in real app, fetch based on bookingId
  useEffect(() => {
    const mockBooking: Booking = {
      id: bookingId,
      classId: 'class-1',
      className: 'Vinyasa Flow',
      instructor: 'Sarah Miller',
      studio: 'Flow Studio Zürich',
      date: new Date(2024, 11, 15),
      time: '18:30',
      duration: 75,
      price: 32.00,
      status: 'confirmed',
      canReschedule: true,
      rescheduleDeadline: new Date(2024, 11, 15, 12, 30), // 6 hours before class
      creditsUsed: 25,
      paymentMethod: 'credits'
    };
    setCurrentBooking(mockBooking);
  }, [bookingId]);

  // Mock available classes - in real app, fetch from API
  useEffect(() => {
    if (selectedDate) {
      setIsLoading(true);
      setTimeout(() => {
        const mockClasses: AvailableClass[] = [
          {
            id: 'class-2',
            name: 'Vinyasa Flow',
            instructor: 'Sarah Miller',
            studio: 'Flow Studio Zürich',
            date: selectedDate,
            time: '08:00',
            duration: 75,
            price: 32.00,
            spotsLeft: 8,
            totalSpots: 20,
            waitlistAvailable: false,
            level: 'All Levels',
            style: 'Vinyasa',
            isCompatible: true,
            priceDifference: 0
          },
          {
            id: 'class-3',
            name: 'Hot Yoga Power',
            instructor: 'Lisa Chen',
            studio: 'Heat Studio Basel',
            date: selectedDate,
            time: '19:00',
            duration: 90,
            price: 35.00,
            spotsLeft: 3,
            totalSpots: 18,
            waitlistAvailable: true,
            level: 'Intermediate',
            style: 'Hot Yoga',
            isCompatible: true,
            priceDifference: 3.00
          },
          {
            id: 'class-4',
            name: 'Yin & Meditation',
            instructor: 'Peter Schmidt',
            studio: 'Zen Space',
            date: selectedDate,
            time: '20:00',
            duration: 60,
            price: 28.00,
            spotsLeft: 12,
            totalSpots: 15,
            waitlistAvailable: false,
            level: 'All Levels',
            style: 'Yin',
            isCompatible: true,
            priceDifference: -4.00
          },
          {
            id: 'class-5',
            name: 'Power Yoga',
            instructor: 'Anna Müller',
            studio: 'Power Studio',
            date: selectedDate,
            time: '12:00',
            duration: 60,
            price: 38.00,
            spotsLeft: 0,
            totalSpots: 16,
            waitlistAvailable: true,
            level: 'Advanced',
            style: 'Power',
            isCompatible: false,
            priceDifference: 6.00
          }
        ];
        setAvailableClasses(mockClasses);
        setIsLoading(false);
      }, 1000);
    }
  }, [selectedDate]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (time: string) => {
    return time;
  };

  const isRescheduleAllowed = (booking: Booking) => {
    return booking.canReschedule && new Date() < booking.rescheduleDeadline;
  };

  const getTimeOfDay = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const filteredClasses = availableClasses.filter(classItem => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.studio.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStudio = studioFilter === 'all' || classItem.studio === studioFilter;
    const matchesLevel = levelFilter === 'all' || classItem.level === levelFilter;
    const matchesTimeOfDay = timeOfDayFilter === 'all' || getTimeOfDay(classItem.time) === timeOfDayFilter;
    
    return matchesSearch && matchesStudio && matchesLevel && matchesTimeOfDay;
  });

  const handleReschedule = async () => {
    if (!currentBooking || !selectedClass) return;
    
    setIsRescheduling(true);
    try {
      // Mock reschedule API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBooking: Booking = {
        ...currentBooking,
        classId: selectedClass.id,
        className: selectedClass.name,
        instructor: selectedClass.instructor,
        studio: selectedClass.studio,
        date: selectedClass.date,
        time: selectedClass.time,
        duration: selectedClass.duration,
        price: selectedClass.price
      };
      
      toast.success('Class rescheduled successfully!');
      onRescheduleComplete(newBooking);
      onClose();
    } catch (error) {
      toast.error('Failed to reschedule class. Please try again.');
    } finally {
      setIsRescheduling(false);
    }
  };

  const getAvailabilityBadge = (classItem: AvailableClass) => {
    if (classItem.spotsLeft === 0) {
      return <Badge className="bg-red-100 text-red-700">Full - Waitlist Available</Badge>;
    } else if (classItem.spotsLeft <= 3) {
      return <Badge className="bg-orange-100 text-orange-700">{classItem.spotsLeft} spots left</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-700">{classItem.spotsLeft} spots available</Badge>;
    }
  };

  if (!currentBooking) {
    return <div>Loading booking details...</div>;
  }

  const timeRemaining = currentBooking.rescheduleDeadline.getTime() - new Date().getTime();
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));
  const minutesRemaining = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <div className="space-y-6">
      {/* Header with current booking */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Reschedule Class</h2>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
        
        {!isRescheduleAllowed(currentBooking) ? (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              This booking cannot be rescheduled. The reschedule deadline has passed.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              You have {hoursRemaining}h {minutesRemaining}m remaining to reschedule this booking.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Current Booking</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{currentBooking.className}</p>
                  <p>with {currentBooking.instructor}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{formatDate(currentBooking.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{currentBooking.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{currentBooking.studio}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary">{currentBooking.status}</Badge>
                <div className="text-sm text-muted-foreground mt-1">
                  {formatPrice(currentBooking.price)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center gap-2 ${step === 'search' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === 'search' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            1
          </div>
          <span>Search & Select</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center gap-2 ${step === 'confirm' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === 'confirm' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            2
          </div>
          <span>Confirm</span>
        </div>
      </div>

      {step === 'search' && (
        <div className="space-y-6">
          {/* Date picker and filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {selectedDate ? formatDate(selectedDate) : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Class or instructor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Studio</Label>
                  <Select value={studioFilter} onValueChange={setStudioFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Studios</SelectItem>
                      <SelectItem value="Flow Studio Zürich">Flow Studio Zürich</SelectItem>
                      <SelectItem value="Heat Studio Basel">Heat Studio Basel</SelectItem>
                      <SelectItem value="Zen Space">Zen Space</SelectItem>
                      <SelectItem value="Power Studio">Power Studio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Level</Label>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="All Levels">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Time of Day</Label>
                  <Select value={timeOfDayFilter} onValueChange={setTimeOfDayFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Time</SelectItem>
                      <SelectItem value="morning">Morning (6-12)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12-17)</SelectItem>
                      <SelectItem value="evening">Evening (17-22)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available classes */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Loading available classes...</p>
              </div>
            ) : filteredClasses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No classes found</h3>
                  <p className="text-muted-foreground">
                    Try selecting a different date or adjusting your filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredClasses.map((classItem) => (
                <Card 
                  key={classItem.id} 
                  className={`cursor-pointer transition-all ${
                    selectedClass?.id === classItem.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:shadow-md'
                  } ${!classItem.isCompatible ? 'opacity-60' : ''}`}
                  onClick={() => classItem.isCompatible && setSelectedClass(classItem)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{classItem.name}</h3>
                          <Badge variant="outline">{classItem.style}</Badge>
                          <Badge variant="outline">{classItem.level}</Badge>
                          {!classItem.isCompatible && (
                            <Badge className="bg-orange-100 text-orange-700">
                              Requires Approval
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>with {classItem.instructor}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(classItem.time)} ({classItem.duration} min)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{classItem.studio}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        {getAvailabilityBadge(classItem)}
                        <div className="text-sm">
                          <div className="font-medium">{formatPrice(classItem.price)}</div>
                          {classItem.priceDifference !== 0 && (
                            <div className={`text-xs ${
                              classItem.priceDifference > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {classItem.priceDifference > 0 ? '+' : ''}{formatPrice(classItem.priceDifference)} difference
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {selectedClass && (
            <div className="flex justify-end">
              <Button onClick={() => setStep('confirm')}>
                Continue to Confirmation
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 'confirm' && selectedClass && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Confirm Reschedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From/To comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-red-600">Current Booking</h4>
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="space-y-2">
                      <p className="font-medium">{currentBooking.className}</p>
                      <p className="text-sm text-muted-foreground">with {currentBooking.instructor}</p>
                      <div className="text-sm">
                        <p>{formatDate(currentBooking.date)}</p>
                        <p>{currentBooking.time} ({currentBooking.duration} min)</p>
                        <p>{currentBooking.studio}</p>
                      </div>
                      <p className="text-sm font-medium">{formatPrice(currentBooking.price)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-green-600">New Booking</h4>
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="space-y-2">
                      <p className="font-medium">{selectedClass.name}</p>
                      <p className="text-sm text-muted-foreground">with {selectedClass.instructor}</p>
                      <div className="text-sm">
                        <p>{formatDate(selectedClass.date)}</p>
                        <p>{selectedClass.time} ({selectedClass.duration} min)</p>
                        <p>{selectedClass.studio}</p>
                      </div>
                      <p className="text-sm font-medium">{formatPrice(selectedClass.price)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Price difference */}
              {selectedClass.priceDifference !== 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Price Adjustment</h4>
                  <div className="flex justify-between items-center">
                    <span>Price difference:</span>
                    <span className={`font-medium ${
                      selectedClass.priceDifference > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {selectedClass.priceDifference > 0 ? '+' : ''}{formatPrice(selectedClass.priceDifference)}
                    </span>
                  </div>
                  {selectedClass.priceDifference > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Additional payment required. Credits will be used if available.
                    </p>
                  )}
                  {selectedClass.priceDifference < 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Credit difference will be added to your wallet.
                    </p>
                  )}
                </div>
              )}
              
              {/* Availability warning */}
              {selectedClass.spotsLeft <= 3 && selectedClass.spotsLeft > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-orange-800">
                    Only {selectedClass.spotsLeft} spots remaining in this class. Complete your reschedule quickly to secure your spot.
                  </AlertDescription>
                </Alert>
              )}
              
              {selectedClass.spotsLeft === 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    This class is full. You will be placed on the waitlist and notified if a spot becomes available.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('search')}>
                  Back to Selection
                </Button>
                <Button 
                  onClick={handleReschedule}
                  disabled={isRescheduling}
                  className="flex-1"
                >
                  {isRescheduling ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Rescheduling...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Reschedule
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}