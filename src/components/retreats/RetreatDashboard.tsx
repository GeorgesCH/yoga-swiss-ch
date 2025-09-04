import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Calendar, 
  MapPin, 
  Users, 
  SwissFranc, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Heart,
  Mountain,
  Plane,
  Camera,
  MessageSquare,
  UserCheck,
  CreditCard,
  FileText,
  Star,
  Globe,
  Zap,
  Target,
  Award,
  Activity
} from 'lucide-react';

interface Retreat {
  id: string;
  title: string;
  slug: string;
  summary: string;
  country: string;
  region: string;
  city: string;
  start_date: string;
  end_date: string;
  capacity_total: number;
  spots_remaining: number;
  price_from: number;
  currency: string;
  featured: boolean;
  availability_status: 'available' | 'almost_full' | 'full' | 'cancelled';
  registration_status: 'upcoming' | 'open' | 'closing_soon' | 'closed';
  applications_count: number;
  confirmed_bookings: number;
  waitlist_count: number;
  revenue_generated: number;
  languages: string[];
}

interface Application {
  id: string;
  retreat_id: string;
  customer_name: string;
  customer_email: string;
  status: 'submitted' | 'under_review' | 'approved' | 'waitlist' | 'rejected';
  room_type: string;
  submitted_at: string;
  total_amount: number;
  has_special_requirements: boolean;
}

export function RetreatDashboard() {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRetreat, setSelectedRetreat] = useState<string | null>(null);

  useEffect(() => {
    loadRetreats();
    loadApplications();
  }, []);

  const loadRetreats = async () => {
    try {
      setLoading(true);

      // Demo retreats with comprehensive data
      const demoRetreats: Retreat[] = [
        {
          id: 'retreat-alpine-yoga-2024',
          title: 'Alpine Yoga Retreat - Jungfrau Region',
          slug: 'alpine-yoga-jungfrau-2024',
          summary: 'Transform your practice surrounded by the majestic Swiss Alps',
          country: 'CH',
          region: 'Bernese Oberland',
          city: 'Interlaken',
          start_date: '2024-07-15T00:00:00Z',
          end_date: '2024-07-21T00:00:00Z',
          capacity_total: 16,
          spots_remaining: 4,
          price_from: 1850.00,
          currency: 'CHF',
          featured: true,
          availability_status: 'almost_full',
          registration_status: 'open',
          applications_count: 18,
          confirmed_bookings: 12,
          waitlist_count: 2,
          revenue_generated: 22200.00,
          languages: ['de-CH', 'en-CH']
        },
        {
          id: 'retreat-ticino-wellness-2024',
          title: 'Ticino Wellness & Yoga Retreat',
          slug: 'ticino-wellness-yoga-2024',
          summary: 'Mediterranean charm meets mindful yoga practice',
          country: 'CH',
          region: 'Ticino',
          city: 'Ascona',
          start_date: '2024-08-12T00:00:00Z',
          end_date: '2024-08-18T00:00:00Z',
          capacity_total: 12,
          spots_remaining: 7,
          price_from: 1650.00,
          currency: 'CHF',
          featured: false,
          availability_status: 'available',
          registration_status: 'open',
          applications_count: 8,
          confirmed_bookings: 5,
          waitlist_count: 0,
          revenue_generated: 8250.00,
          languages: ['it-CH', 'de-CH']
        },
        {
          id: 'retreat-lithuania-ice-yoga-2024',
          title: 'Ice & Fire Yoga - Lithuania Adventure',
          slug: 'lithuania-ice-fire-yoga-2024',
          summary: 'Experience the power of contrasts in beautiful Lithuania',
          country: 'LT',
          region: 'Vilnius',
          city: 'Trakai',
          start_date: '2024-09-22T00:00:00Z',
          end_date: '2024-09-28T00:00:00Z',
          capacity_total: 14,
          spots_remaining: 8,
          price_from: 1450.00,
          currency: 'CHF',
          featured: true,
          availability_status: 'available',
          registration_status: 'open',
          applications_count: 12,
          confirmed_bookings: 6,
          waitlist_count: 1,
          revenue_generated: 8700.00,
          languages: ['en-CH', 'de-CH']
        }
      ];

      setRetreats(demoRetreats);
    } catch (error) {
      console.error('Error loading retreats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      // Demo applications
      const demoApplications: Application[] = [
        {
          id: 'app-1',
          retreat_id: 'retreat-alpine-yoga-2024',
          customer_name: 'Emma Müller',
          customer_email: 'emma.muller@email.com',
          status: 'submitted',
          room_type: 'Shared Twin Room',
          submitted_at: new Date(Date.now() - 3600000).toISOString(),
          total_amount: 1850.00,
          has_special_requirements: true
        },
        {
          id: 'app-2',
          retreat_id: 'retreat-alpine-yoga-2024',
          customer_name: 'David Chen',
          customer_email: 'david.chen@email.com',
          status: 'under_review',
          room_type: 'Private Single Room',
          submitted_at: new Date(Date.now() - 7200000).toISOString(),
          total_amount: 2450.00,
          has_special_requirements: false
        },
        {
          id: 'app-3',
          retreat_id: 'retreat-ticino-wellness-2024',
          customer_name: 'Sophie Laurent',
          customer_email: 'sophie.laurent@email.com',
          status: 'approved',
          room_type: 'Shared Triple Room',
          submitted_at: new Date(Date.now() - 86400000).toISOString(),
          total_amount: 1650.00,
          has_special_requirements: true
        }
      ];

      setApplications(demoApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { variant: 'default' as const, text: 'Available', color: 'text-green-600' },
      almost_full: { variant: 'secondary' as const, text: 'Almost Full', color: 'text-orange-600' },
      full: { variant: 'destructive' as const, text: 'Full', color: 'text-red-600' },
      cancelled: { variant: 'outline' as const, text: 'Cancelled', color: 'text-gray-600' }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
  };

  const getApplicationStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { variant: 'secondary' as const, text: 'New', icon: Clock },
      under_review: { variant: 'default' as const, text: 'Reviewing', icon: Activity },
      approved: { variant: 'default' as const, text: 'Approved', icon: CheckCircle },
      waitlist: { variant: 'secondary' as const, text: 'Waitlist', icon: Users },
      rejected: { variant: 'destructive' as const, text: 'Rejected', icon: AlertCircle }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CH', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateProgress = (retreat: Retreat) => {
    return ((retreat.capacity_total - retreat.spots_remaining) / retreat.capacity_total) * 100;
  };

  const totalRevenue = retreats.reduce((sum, retreat) => sum + retreat.revenue_generated, 0);
  const totalBookings = retreats.reduce((sum, retreat) => sum + retreat.confirmed_bookings, 0);
  const pendingApplications = applications.filter(app => ['submitted', 'under_review'].includes(app.status)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading retreat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <Mountain className="h-7 w-7 text-primary" />
            Retreat Management Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your transformative yoga retreats and wellness experiences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Globe className="h-3 w-3 mr-1" />
            Switzerland Focus
          </Badge>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Create Retreat
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <SwissFranc className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+23% from last quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Across all retreats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApplications}</div>
            <p className="text-xs text-muted-foreground">Require review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Retreats</CardTitle>
            <Mountain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retreats.length}</div>
            <p className="text-xs text-muted-foreground">Currently published</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="retreats" className="flex items-center gap-2">
            <Mountain className="h-4 w-4" />
            Retreats
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Applications
            {pendingApplications > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {pendingApplications}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Community
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Retreat Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Retreat Performance
                </CardTitle>
                <CardDescription>Booking progress and revenue by retreat</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {retreats.map((retreat) => {
                    const progress = calculateProgress(retreat);
                    const statusBadge = getStatusBadge(retreat.availability_status);
                    
                    return (
                      <div key={retreat.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium">{retreat.title}</h4>
                            <Badge {...statusBadge} className="text-xs">
                              {statusBadge.text}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {retreat.confirmed_bookings}/{retreat.capacity_total}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={progress} className="flex-1" />
                          <div className="text-sm font-medium">
                            CHF {retreat.revenue_generated.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDate(retreat.start_date)} - {formatDate(retreat.end_date)}</span>
                          <span>{retreat.city}, {retreat.country}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Applications
                </CardTitle>
                <CardDescription>Latest retreat applications requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applications.slice(0, 5).map((application) => {
                    const statusConfig = getApplicationStatusBadge(application.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <StatusIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{application.customer_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {application.room_type} • CHF {application.total_amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge {...statusConfig} className="text-xs mb-1">
                            {statusConfig.text}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {new Date(application.submitted_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  View All Applications
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Success Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Customer Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">4.9/5</div>
                  <div className="flex">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Based on 127 reviews</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-500" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98%</div>
                <p className="text-xs text-muted-foreground mt-1">Participants completing retreats</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Return Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">34%</div>
                <p className="text-xs text-muted-foreground mt-1">Book multiple retreats</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retreats" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Active Retreats</h3>
              <p className="text-muted-foreground">Manage your current and upcoming retreat offerings</p>
            </div>
            <Button size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Create New Retreat
            </Button>
          </div>

          <div className="grid gap-6">
            {retreats.map((retreat) => {
              const progress = calculateProgress(retreat);
              const statusBadge = getStatusBadge(retreat.availability_status);

              return (
                <Card key={retreat.id} className="transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <Mountain className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{retreat.title}</CardTitle>
                            {retreat.featured && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {retreat.city}, {retreat.country}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(retreat.start_date)} - {formatDate(retreat.end_date)}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge {...statusBadge} className="mb-2">
                          {statusBadge.text}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {retreat.spots_remaining} spots left
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">
                          {retreat.confirmed_bookings}
                        </div>
                        <div className="text-xs text-muted-foreground">Confirmed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-orange-600">
                          {retreat.waitlist_count}
                        </div>
                        <div className="text-xs text-muted-foreground">Waitlist</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          CHF {retreat.revenue_generated.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">
                          {Math.round(progress)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Capacity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-indigo-600">
                          {retreat.applications_count}
                        </div>
                        <div className="text-xs text-muted-foreground">Applications</div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Booking Progress</span>
                        <span>{retreat.confirmed_bookings}/{retreat.capacity_total}</span>
                      </div>
                      <Progress value={progress} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {retreat.languages.map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Community
                        </Button>
                        <Button size="sm">
                          <Camera className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have {pendingApplications} applications that require review. Respond within 48 hours to maintain high service standards.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {applications.map((application) => {
              const statusConfig = getApplicationStatusBadge(application.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={application.id} className="transition-all hover:shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={`/api/placeholder/40/40`} />
                          <AvatarFallback>
                            {application.customer_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{application.customer_name}</h4>
                            <Badge {...statusConfig}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.text}
                            </Badge>
                            {application.has_special_requirements && (
                              <Badge variant="outline" className="text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Special Requirements
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {application.customer_email} • {application.room_type}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Submitted {new Date(application.submitted_at).toLocaleDateString('en-CH', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold mb-1">
                          CHF {application.total_amount.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          {application.status === 'submitted' && (
                            <>
                              <Button variant="outline" size="sm">
                                Reject
                              </Button>
                              <Button size="sm">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            </>
                          )}
                          {application.status === 'approved' && (
                            <Button variant="outline" size="sm">
                              <CreditCard className="h-4 w-4 mr-1" />
                              Payment
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Retreat Communities
                </CardTitle>
                <CardDescription>Active discussions and participant engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {retreats.map((retreat) => (
                    <div key={retreat.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{retreat.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {retreat.confirmed_bookings} participants • {Math.floor(Math.random() * 50) + 20} messages
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Open
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Community Engagement
                </CardTitle>
                <CardDescription>Participant interaction and satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Daily Messages</span>
                    <span className="font-semibold">34</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Rate</span>
                    <span className="font-semibold">96%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Satisfaction Score</span>
                    <span className="font-semibold">4.9/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Participants</span>
                    <span className="font-semibold">78%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}