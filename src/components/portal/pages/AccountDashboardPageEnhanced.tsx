import React, { useState } from 'react';
import { usePortal } from '../PortalProvider';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Progress } from '../../ui/progress';
import { 
  Calendar,
  Clock,
  MapPin,
  Star,
  Heart,
  CreditCard,
  Gift,
  Settings,
  Bell,
  Download,
  QrCode,
  Users,
  Zap,
  Award,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Receipt,
  Timer
} from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { OrderHistoryManager } from '../OrderHistoryManager';
import { RescheduleBookingManager } from '../RescheduleBookingManager';
import { EnhancedCancellationManager } from '../EnhancedCancellationManager';
import { toast } from 'sonner@2.0.3';

export function AccountDashboardPageEnhanced({ onPageChange }: { onPageChange: (page: string) => void }) {
  const { currentLocation, customerProfile, isAuthenticated, logout } = usePortal();
  const [activeTab, setActiveTab] = useState('overview');
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (!isAuthenticated || !customerProfile) {
    onPageChange('login');
    return null;
  }

  // Use actual user data from context
  const userProfile = {
    firstName: customerProfile.firstName,
    lastName: customerProfile.lastName,
    email: customerProfile.email,
    phone: customerProfile.phone || '+41 76 123 45 67',
    memberSince: new Date(2023, 0, 15),
    membershipType: customerProfile.membershipStatus || 'Free Plan',
    creditsBalance: customerProfile.creditsBalance,
    image: customerProfile.profileImage || '/placeholder-user.jpg',
    totalClasses: 87,
    streakDays: 12,
    favoriteStyle: customerProfile.preferences.favoriteStyles[0] || 'Hatha',
    level: customerProfile.preferences.levelExperience || 'Beginner'
  };

  const handleLogout = () => {
    logout();
    onPageChange('home');
  };

  const upcomingBookings = [
    {
      id: '1',
      className: 'Vinyasa Flow',
      instructor: 'Marc Dubois',
      studio: 'Flow Studio Zürich',
      date: new Date(2024, 11, 16),
      time: '18:30',
      duration: 75,
      status: 'confirmed' as const,
      image: '/placeholder-yoga-1.jpg',
      address: 'Bahnhofstrasse 45, 8001 Zürich',
      price: 32.00,
      canReschedule: true,
      canCancel: true,
      rescheduleDeadline: new Date(2024, 11, 16, 12, 30), // 6 hours before
      paymentMethod: 'credits' as const,
      paymentDetails: { creditsUsed: 25 },
      cancellationPolicy: {
        freeUntil: new Date(2024, 11, 16, 6, 30),
        creditRefundUntil: new Date(2024, 11, 16, 16, 30),
        noRefundAfter: new Date(2024, 11, 16, 18, 0),
        lateFeePenalty: 50
      }
    },
    {
      id: '2',
      className: 'Morning Yin Yoga',
      instructor: 'Lisa Chen',
      studio: 'Zen Space',
      date: new Date(2024, 11, 17),
      time: '08:00',
      duration: 90,
      status: 'confirmed' as const,
      image: '/placeholder-yoga-2.jpg',
      address: 'Limmatquai 12, 8001 Zürich',
      price: 28.00,
      canReschedule: true,
      canCancel: true,
      rescheduleDeadline: new Date(2024, 11, 17, 2, 0),
      paymentMethod: 'card' as const,
      paymentDetails: { cardLast4: '4242', brand: 'Visa' },
      cancellationPolicy: {
        freeUntil: new Date(2024, 11, 16, 20, 0),
        creditRefundUntil: new Date(2024, 11, 17, 6, 0),
        noRefundAfter: new Date(2024, 11, 17, 7, 30),
        lateFeePenalty: 25
      }
    },
    {
      id: '3',
      className: 'Power Yoga Workshop',
      instructor: 'Anna Müller',
      studio: 'Heat Yoga Basel',
      date: new Date(2024, 11, 18),
      time: '14:00',
      duration: 120,
      status: 'waitlist' as const,
      image: '/placeholder-yoga-3.jpg',
      address: 'Steinenvorstadt 28, 4051 Basel',
      price: 45.00,
      canReschedule: false,
      canCancel: true,
      rescheduleDeadline: new Date(2024, 11, 18, 8, 0),
      paymentMethod: 'membership' as const,
      paymentDetails: { membershipType: 'Premium' },
      cancellationPolicy: {
        freeUntil: new Date(2024, 11, 17, 14, 0),
        creditRefundUntil: new Date(2024, 11, 18, 12, 0),
        noRefundAfter: new Date(2024, 11, 18, 13, 30),
        lateFeePenalty: 75
      }
    }
  ];

  const classHistory = [
    {
      id: '1',
      name: 'Hot Yoga Power',
      instructor: 'Sophie Laurent',
      studio: 'Heat Studio',
      date: new Date(2024, 11, 12),
      time: '19:30',
      rating: 5,
      review: 'Amazing class! Sophie\'s guidance was perfect.',
      attended: true
    },
    {
      id: '2',
      name: 'Yin & Meditation',
      instructor: 'Peter Schmidt',
      studio: 'Mindful Space',
      date: new Date(2024, 11, 10),
      time: '20:00',
      rating: 4,
      review: null,
      attended: true
    },
    {
      id: '3',
      name: 'Prenatal Flow',
      instructor: 'Marie Dupont',
      studio: 'Mother & Baby',
      date: new Date(2024, 11, 8),
      time: '10:00',
      rating: null,
      review: null,
      attended: false,
      cancelReason: 'Cancelled 2 hours before'
    }
  ];

  const favoriteStudios = [
    {
      id: '1',
      name: 'Flow Studio Zürich',
      address: 'Bahnhofstrasse 45, 8001 Zürich',
      rating: 4.9,
      classesAttended: 23,
      image: '/placeholder-studio-1.jpg'
    },
    {
      id: '2',
      name: 'Zen Space',
      address: 'Limmatquai 12, 8001 Zürich',
      rating: 4.8,
      classesAttended: 18,
      image: '/placeholder-studio-2.jpg'
    }
  ];

  const favoriteInstructors = [
    {
      id: '1',
      name: 'Marc Dubois',
      specialties: ['Vinyasa', 'Power Yoga'],
      rating: 4.9,
      classesAttended: 15,
      image: '/placeholder-instructor-1.jpg'
    },
    {
      id: '2',
      name: 'Lisa Chen',
      specialties: ['Yin', 'Meditation'],
      rating: 4.8,
      classesAttended: 12,
      image: '/placeholder-instructor-2.jpg'
    }
  ];

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
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700">Confirmed</Badge>;
      case 'waitlist':
        return <Badge className="bg-yellow-100 text-yellow-700">Waitlist</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const canRescheduleBooking = (booking: any) => {
    return booking.canReschedule && new Date() < booking.rescheduleDeadline;
  };

  const canCancelBooking = (booking: any) => {
    return booking.canCancel && new Date() < booking.cancellationPolicy.noRefundAfter;
  };

  const getTimeUntilDeadline = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 24) {
      return `${hours}h ${minutes}m`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
  };

  const handleRescheduleComplete = (newBooking: any) => {
    toast.success('Class rescheduled successfully!');
    setRescheduleBookingId(null);
    // In real app, refresh booking data
  };

  const handleCancellationComplete = (refundType: string, amount: number) => {
    toast.success(`Booking cancelled. ${amount > 0 ? `${formatPrice(amount)} refund processed.` : ''}`);
    setCancelBookingId(null);
    // In real app, refresh booking data
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const selectedBookingForCancel = cancelBookingId ? upcomingBookings.find(b => b.id === cancelBookingId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={userProfile.image} alt={userProfile.firstName} />
            <AvatarFallback>
              {userProfile.firstName[0]}{userProfile.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome back, {userProfile.firstName}! 👋
            </h1>
            <p className="text-muted-foreground">
              Member since {formatDate(userProfile.memberSince)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge>{userProfile.membershipType}</Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onPageChange('profile-settings')}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
          <Button onClick={() => onPageChange('profile-settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Profile Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 mx-auto text-primary mb-2" />
                <div className="text-2xl font-semibold">{userProfile.totalClasses}</div>
                <p className="text-sm text-muted-foreground">Classes taken</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="h-6 w-6 mx-auto text-orange-500 mb-2" />
                <div className="text-2xl font-semibold">{userProfile.streakDays}</div>
                <p className="text-sm text-muted-foreground">Day streak</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CreditCard className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                <div className="text-2xl font-semibold">{userProfile.creditsBalance}</div>
                <p className="text-sm text-muted-foreground">Credits available</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                <div className="text-2xl font-semibold">{userProfile.level}</div>
                <p className="text-sm text-muted-foreground">Current level</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Goal (16/20 classes)</span>
                  <span>80%</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">4.8</div>
                  <p className="text-sm text-muted-foreground">Avg. rating given</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{userProfile.favoriteStyle}</div>
                  <p className="text-sm text-muted-foreground">Favorite style</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">92%</div>
                  <p className="text-sm text-muted-foreground">Attendance rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Classes Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Next Classes</span>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('bookings')}>
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBookings.slice(0, 2).map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={booking.image}
                        alt={booking.className}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{booking.className}</h4>
                      <p className="text-sm text-muted-foreground">
                        {booking.instructor} • {booking.studio}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(booking.date)} at {booking.time}
                      </div>
                      {/* Time until deadline */}
                      {(canRescheduleBooking(booking) || canCancelBooking(booking)) && (
                        <div className="text-xs text-muted-foreground mt-1">
                          <Timer className="h-3 w-3 inline mr-1" />
                          {canRescheduleBooking(booking) && getTimeUntilDeadline(booking.rescheduleDeadline) && (
                            <span>Reschedule: {getTimeUntilDeadline(booking.rescheduleDeadline)} left</span>
                          )}
                          {canRescheduleBooking(booking) && canCancelBooking(booking) && <span> • </span>}
                          {canCancelBooking(booking) && getTimeUntilDeadline(booking.cancellationPolicy.freeUntil) && (
                            <span>Free cancel: {getTimeUntilDeadline(booking.cancellationPolicy.freeUntil)} left</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      {getStatusBadge(booking.status)}
                      <Button size="sm" variant="outline">
                        <QrCode className="h-3 w-3 mr-1" />
                        QR Code
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upcoming Bookings</h2>
            <Button onClick={() => onPageChange('explore')}>
              <Plus className="h-4 w-4 mr-2" />
              Book New Class
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {upcomingBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-32 h-32 flex-shrink-0">
                      <ImageWithFallback
                        src={booking.image}
                        alt={booking.className}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{booking.className}</h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          <p className="text-muted-foreground">
                            with {booking.instructor}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(booking.date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {booking.time} ({booking.duration}min)
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {booking.studio}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.address}</p>
                          <div className="text-sm text-muted-foreground">
                            <strong>Price:</strong> {formatPrice(booking.price)} 
                            {booking.paymentMethod === 'credits' && ` (${booking.paymentDetails.creditsUsed} credits)`}
                          </div>
                          
                          {/* Deadline information */}
                          <div className="space-y-1">
                            {canRescheduleBooking(booking) && getTimeUntilDeadline(booking.rescheduleDeadline) && (
                              <div className="text-xs text-blue-600 flex items-center">
                                <Timer className="h-3 w-3 mr-1" />
                                Reschedule deadline: {getTimeUntilDeadline(booking.rescheduleDeadline)} left
                              </div>
                            )}
                            {canCancelBooking(booking) && getTimeUntilDeadline(booking.cancellationPolicy.freeUntil) && (
                              <div className="text-xs text-green-600 flex items-center">
                                <Timer className="h-3 w-3 mr-1" />
                                Free cancellation: {getTimeUntilDeadline(booking.cancellationPolicy.freeUntil)} left
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <QrCode className="h-4 w-4 mr-2" />
                              QR Code
                            </Button>
                            {canRescheduleBooking(booking) && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setRescheduleBookingId(booking.id)}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reschedule
                              </Button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {canCancelBooking(booking) && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setCancelBookingId(booking.id)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            )}
                          </div>
                          {(!canRescheduleBooking(booking) && !canCancelBooking(booking)) && (
                            <div className="text-xs text-muted-foreground">
                              <Timer className="h-3 w-3 inline mr-1" />
                              Deadlines passed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Class History</h2>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export History
            </Button>
          </div>

          <div className="space-y-4">
            {classHistory.map((classItem) => (
              <Card key={classItem.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{classItem.name}</h4>
                        {classItem.attended ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        {classItem.instructor} • {classItem.studio}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatDate(classItem.date)} at {classItem.time}</span>
                        <span>{classItem.attended ? 'Attended' : 'Missed'}</span>
                      </div>
                      {!classItem.attended && classItem.cancelReason && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {classItem.cancelReason}
                        </p>
                      )}
                      {classItem.review && (
                        <div className="mt-2">
                          <p className="text-sm italic">"{classItem.review}"</p>
                        </div>
                      )}
                    </div>
                    
                    {classItem.attended && (
                      <div className="text-right space-y-2">
                        {classItem.rating && (
                          <div className="flex items-center gap-1">
                            {renderStars(classItem.rating)}
                          </div>
                        )}
                        <div className="space-x-2">
                          {!classItem.rating && (
                            <Button size="sm" variant="outline">
                              Rate Class
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Book Again
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <OrderHistoryManager />
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Favorite Studios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Favorite Studios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {favoriteStudios.map((studio) => (
                  <div key={studio.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={studio.image}
                        alt={studio.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{studio.name}</h4>
                      <p className="text-sm text-muted-foreground">{studio.address}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {studio.rating}
                        </div>
                        <span className="text-muted-foreground">
                          {studio.classesAttended} classes
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Schedule
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Favorite Instructors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Favorite Instructors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {favoriteInstructors.map((instructor) => (
                  <div key={instructor.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={instructor.image} alt={instructor.name} />
                      <AvatarFallback>{instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">{instructor.name}</h4>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {instructor.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {instructor.rating}
                        </div>
                        <span className="text-muted-foreground">
                          {instructor.classesAttended} classes
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Follow
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Credits Balance */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Credits & Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-3xl font-semibold text-blue-600">
                      {userProfile.creditsBalance}
                    </div>
                    <p className="text-sm text-muted-foreground">Credits Available</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ≈ {formatPrice(userProfile.creditsBalance * 1.2)} value
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Buy More Credits
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Gift className="h-4 w-4 mr-2" />
                      Gift Credits
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t space-y-2">
                  <h4 className="font-medium">Recent Transactions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Vinyasa Flow - Flow Studio</span>
                      <span className="text-red-600">-25 credits</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Credits Purchase</span>
                      <span className="text-green-600">+100 credits</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hot Yoga - Heat Studio</span>
                      <span className="text-red-600">-30 credits</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Membership Status */}
            <Card>
              <CardHeader>
                <CardTitle>Membership</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {userProfile.membershipType}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Active since {formatDate(userProfile.memberSince)}
                  </p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Next billing:</span>
                    <span>Jan 15, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>CHF 89.00</span>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t">
                  <Button variant="outline" className="w-full" size="sm">
                    Change Plan
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    Billing Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reschedule Dialog */}
      {rescheduleBookingId && (
        <RescheduleBookingManager
          bookingId={rescheduleBookingId}
          onClose={() => setRescheduleBookingId(null)}
          onRescheduleComplete={handleRescheduleComplete}
        />
      )}

      {/* Enhanced Cancellation Dialog */}
      {cancelBookingId && selectedBookingForCancel && (
        <EnhancedCancellationManager
          booking={selectedBookingForCancel}
          isOpen={!!cancelBookingId}
          onClose={() => setCancelBookingId(null)}
          onCancellationComplete={handleCancellationComplete}
        />
      )}
    </div>
  );
}