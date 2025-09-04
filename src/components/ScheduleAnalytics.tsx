import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Clock, MapPin, Star, Filter, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { useLanguage } from './LanguageProvider';
import { useMultiTenantAuth } from './auth/MultiTenantAuthProvider';
import { classesService } from '../utils/supabase/classes-service';

interface AnalyticsProps {
  dateRange: 'week' | 'month' | 'quarter' | 'year';
  onDateRangeChange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
}

export function ScheduleAnalytics({ dateRange, onDateRangeChange }: AnalyticsProps) {
  const { t } = useLanguage();
  const { currentOrg } = useMultiTenantAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realAnalytics, setRealAnalytics] = useState<any>(null);

  useEffect(() => {
    if (currentOrg?.id) {
      loadAnalyticsData();
    }
  }, [currentOrg, dateRange]);

  const loadAnalyticsData = async () => {
    if (!currentOrg?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Load analytics data
      const [analyticsData, occupancyData, revenueData] = await Promise.all([
        classesService.getClassAnalytics(
          currentOrg.id,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ),
        classesService.getOccupancyAnalytics(currentOrg.id),
        classesService.getRevenueAnalytics(
          currentOrg.id,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        )
      ]);

      setRealAnalytics({
        totalClasses: analyticsData?.total_classes || 0,
        totalParticipants: analyticsData?.total_bookings || 0,
        avgOccupancy: Math.round(analyticsData?.average_occupancy || 0),
        totalRevenue: (revenueData?.total_revenue_cents || 0) / 100,
        cancellationRate: analyticsData?.cancellation_rate || 0,
        occupancyData,
        revenueData
      });

    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Use real data if available, otherwise fallback to mock
  const overviewStats = realAnalytics || {
    totalClasses: 156,
    totalParticipants: 2340,
    avgOccupancy: 87,
    totalRevenue: 58500,
    growthRate: 12.5,
    topInstructor: 'Sarah Müller',
    topClass: 'Vinyasa Flow',
    cancellationRate: 3.2
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading schedule analytics...</p>
        </div>
      </div>
    );
  }

  const weeklyData = [
    { name: 'Mon', classes: 8, participants: 140, revenue: 3500, occupancy: 85 },
    { name: 'Tue', classes: 12, participants: 180, revenue: 4500, occupancy: 90 },
    { name: 'Wed', classes: 10, participants: 165, revenue: 4125, occupancy: 88 },
    { name: 'Thu', classes: 14, participants: 210, revenue: 5250, occupancy: 92 },
    { name: 'Fri', classes: 11, participants: 175, revenue: 4375, occupancy: 89 },
    { name: 'Sat', classes: 16, participants: 220, revenue: 5500, occupancy: 95 },
    { name: 'Sun', classes: 13, participants: 195, revenue: 4875, occupancy: 91 }
  ];

  const instructorPerformance = [
    { name: 'Sarah Müller', classes: 24, participants: 420, revenue: 10500, rating: 4.9, occupancy: 95 },
    { name: 'Marcus Weber', classes: 18, participants: 315, revenue: 7875, rating: 4.8, occupancy: 92 },
    { name: 'Lisa Chen', classes: 22, participants: 385, revenue: 9625, rating: 4.7, occupancy: 88 },
    { name: 'Marie Dubois', classes: 20, participants: 350, revenue: 8750, rating: 4.6, occupancy: 85 }
  ];

  const classTypeDistribution = [
    { name: 'Vinyasa', value: 35, color: '#8884d8' },
    { name: 'Hatha', value: 25, color: '#82ca9d' },
    { name: 'Power Yoga', value: 20, color: '#ffc658' },
    { name: 'Yin', value: 15, color: '#ff7c7c' },
    { name: 'Others', value: 5, color: '#8dd1e1' }
  ];

  const timeSlotAnalysis = [
    { time: '06:00', classes: 2, occupancy: 65 },
    { time: '07:00', classes: 4, occupancy: 75 },
    { time: '08:00', classes: 6, occupancy: 85 },
    { time: '09:00', classes: 8, occupancy: 92 },
    { time: '10:00', classes: 6, occupancy: 88 },
    { time: '11:00', classes: 4, occupancy: 80 },
    { time: '12:00', classes: 5, occupancy: 82 },
    { time: '17:00', classes: 7, occupancy: 90 },
    { time: '18:00', classes: 9, occupancy: 95 },
    { time: '19:00', classes: 8, occupancy: 93 },
    { time: '20:00', classes: 5, occupancy: 87 }
  ];

  const monthlyTrends = [
    { month: 'Jan', classes: 145, participants: 2100, revenue: 52500 },
    { month: 'Feb', classes: 152, participants: 2250, revenue: 56250 },
    { month: 'Mar', classes: 156, participants: 2340, revenue: 58500 },
    { month: 'Apr', classes: 148, participants: 2180, revenue: 54500 },
    { month: 'May', classes: 162, participants: 2450, revenue: 61250 },
    { month: 'Jun', classes: 158, participants: 2380, revenue: 59500 }
  ];

  const locationMetrics = [
    { location: 'Studio A', utilization: 92, avgOccupancy: 88, topClass: 'Vinyasa Flow' },
    { location: 'Studio B', utilization: 87, avgOccupancy: 85, topClass: 'Hatha Yoga' },
    { location: 'Online', utilization: 95, avgOccupancy: 91, topClass: 'Power Yoga' }
  ];

  const waitlistAnalysis = {
    totalWaitlists: 45,
    avgWaitTime: 2.3,
    conversionRate: 78,
    topWaitlistedClasses: [
      { name: 'Power Yoga', waitlist: 12, conversion: 85 },
      { name: 'Vinyasa Flow', waitlist: 8, conversion: 90 },
      { name: 'Hot Yoga', waitlist: 6, conversion: 70 }
    ]
  };

  const formatCurrency = (value: number) => `CHF ${value.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value}%`;

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={loadAnalyticsData}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Schedule Analytics</h2>
          <p className="text-muted-foreground">
            Insights and performance metrics for your class schedule
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.totalClasses}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{overviewStats.growthRate}% from last {dateRange}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.totalParticipants.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2% from last {dateRange}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Occupancy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.avgOccupancy}%</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -2.1% from last {dateRange}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overviewStats.totalRevenue)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.3% from last {dateRange}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="instructors">Instructors</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Schedule Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="participants" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Class Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Class Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={classTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {classTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Location Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Location Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {locationMetrics.map((location) => (
                  <div key={location.location} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{location.location}</h4>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Utilization:</span>
                        <Badge variant="outline">{location.utilization}%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg. Occupancy:</span>
                        <span>{location.avgOccupancy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Top Class:</span>
                        <span className="font-medium">{location.topClass}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Time Slot Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSlotAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="occupancy" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Best Performing Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Saturday</div>
                <div className="text-sm text-muted-foreground">95% avg occupancy</div>
                <div className="text-xs text-green-600 mt-1">+5% vs weekday average</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Most Popular Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6:00 PM</div>
                <div className="text-sm text-muted-foreground">95% avg occupancy</div>
                <div className="text-xs text-blue-600 mt-1">Peak evening slot</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cancellation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewStats.cancellationRate}%</div>
                <div className="text-sm text-muted-foreground">Below industry avg</div>
                <div className="text-xs text-green-600 mt-1">-0.8% vs last month</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>6-Month Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="participants" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="classes" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Growth Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Growth Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Month-over-Month Growth:</span>
                  <Badge className="bg-green-100 text-green-700">+12.5%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>New Customer Acquisition:</span>
                  <Badge className="bg-blue-100 text-blue-700">+18.3%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Customer Retention:</span>
                  <Badge className="bg-purple-100 text-purple-700">87.2%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Revenue Growth:</span>
                  <Badge className="bg-green-100 text-green-700">+15.7%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Peak Season:</span>
                  <div className="font-medium">January - March</div>
                  <div className="text-xs text-green-600">New Year resolutions drive +25% bookings</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Low Season:</span>
                  <div className="font-medium">July - August</div>
                  <div className="text-xs text-orange-600">Summer holidays reduce bookings by -15%</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Growth Opportunity:</span>
                  <div className="font-medium">Weekend Workshops</div>
                  <div className="text-xs text-blue-600">High demand, low supply</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="instructors" className="space-y-6">
          {/* Instructor Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Instructor Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {instructorPerformance.map((instructor) => (
                  <div key={instructor.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="font-semibold">{instructor.name}</div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{instructor.rating}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{instructor.occupancy}% avg occupancy</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Classes:</span>
                        <div className="font-medium">{instructor.classes}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Participants:</span>
                        <div className="font-medium">{instructor.participants}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Revenue:</span>
                        <div className="font-medium">{formatCurrency(instructor.revenue)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist" className="space-y-6">
          {/* Waitlist Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Waitlists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{waitlistAnalysis.totalWaitlists}</div>
                <div className="text-sm text-muted-foreground">Active entries</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Avg Wait Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{waitlistAnalysis.avgWaitTime} days</div>
                <div className="text-sm text-muted-foreground">Until promotion</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{waitlistAnalysis.conversionRate}%</div>
                <div className="text-sm text-muted-foreground">Waitlist to booking</div>
              </CardContent>
            </Card>
          </div>

          {/* Top Waitlisted Classes */}
          <Card>
            <CardHeader>
              <CardTitle>Most Waitlisted Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {waitlistAnalysis.topWaitlistedClasses.map((cls, index) => (
                  <div key={cls.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <div className="font-medium">{cls.name}</div>
                        <div className="text-sm text-muted-foreground">{cls.waitlist} waiting</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{cls.conversion}%</div>
                      <div className="text-sm text-muted-foreground">conversion</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}