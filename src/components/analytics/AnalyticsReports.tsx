import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { DateRange } from 'react-day-picker';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar as CalendarIcon,
  Users,
  CreditCard,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
  Share2,
  Mail,
  Printer,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  MapPin,
  Zap,
  Globe,
  Building2,
  UserCheck,
  Wallet,
  Minus
} from 'lucide-react';

interface AnalyticsReportsProps {
  onPageChange?: (page: string) => void;
}

export function AnalyticsReports({ onPageChange }: AnalyticsReportsProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedReport, setSelectedReport] = useState('overview');
  const [timeframe, setTimeframe] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for analytics
  const revenueData = [
    { month: 'Jan', revenue: 45000, classes: 320, members: 890, retention: 85 },
    { month: 'Feb', revenue: 48000, classes: 340, members: 920, retention: 87 },
    { month: 'Mar', revenue: 52000, classes: 380, members: 980, retention: 88 },
    { month: 'Apr', revenue: 49000, classes: 360, members: 950, retention: 86 },
    { month: 'May', revenue: 55000, classes: 400, members: 1020, retention: 89 },
    { month: 'Jun', revenue: 58000, classes: 420, members: 1080, retention: 91 }
  ];

  const classPopularityData = [
    { name: 'Vinyasa Flow', sessions: 180, revenue: 14400, rating: 4.8 },
    { name: 'Hot Yoga', sessions: 160, revenue: 16000, rating: 4.7 },
    { name: 'Yin Yoga', sessions: 140, revenue: 10500, rating: 4.9 },
    { name: 'Power Yoga', sessions: 120, revenue: 12600, rating: 4.6 },
    { name: 'Prenatal', sessions: 80, revenue: 8800, rating: 4.9 },
    { name: 'Meditation', sessions: 70, revenue: 5250, rating: 4.8 }
  ];

  const membershipData = [
    { name: 'Monthly Unlimited', value: 45, color: '#3b82f6' },
    { name: 'Class Packages', value: 30, color: '#10b981' },
    { name: 'Drop-in', value: 15, color: '#f59e0b' },
    { name: 'Annual', value: 10, color: '#8b5cf6' }
  ];

  const hourlyDistribution = [
    { hour: '6:00', classes: 8, attendance: 85 },
    { hour: '7:00', classes: 12, attendance: 92 },
    { hour: '8:00', classes: 15, attendance: 88 },
    { hour: '9:00', classes: 18, attendance: 90 },
    { hour: '10:00', classes: 14, attendance: 86 },
    { hour: '11:00', classes: 10, attendance: 78 },
    { hour: '12:00', classes: 16, attendance: 89 },
    { hour: '17:00', classes: 20, attendance: 95 },
    { hour: '18:00', classes: 25, attendance: 98 },
    { hour: '19:00', classes: 22, attendance: 96 },
    { hour: '20:00', classes: 18, attendance: 91 }
  ];

  const kpiMetrics = {
    totalRevenue: { value: 58000, change: 12.5, trend: 'up' },
    totalMembers: { value: 1080, change: 8.3, trend: 'up' },
    classAttendance: { value: 94.2, change: 2.1, trend: 'up' },
    retentionRate: { value: 91, change: 4.2, trend: 'up' },
    avgClassSize: { value: 16.8, change: -1.2, trend: 'down' },
    instructorRating: { value: 4.7, change: 0.1, trend: 'up' },
    conversionRate: { value: 23.5, change: 3.8, trend: 'up' },
    lifetimeValue: { value: 890, change: 15.2, trend: 'up' }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    setIsLoading(true);
    // Simulate export
    setTimeout(() => {
      setIsLoading(false);
      console.log(`Exporting ${selectedReport} report as ${format}`);
    }, 2000);
  };

  const handleScheduleReport = () => {
    console.log('Schedule automated report');
  };

  const KPICard = ({ title, icon: Icon, value, change, trend, format = 'number' }: any) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{title}</span>
          </div>
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-semibold">
            {format === 'currency' ? formatCurrency(value) : 
             format === 'percentage' ? `${value}%` : 
             format === 'rating' ? `${value}/5` : 
             value.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {trend === 'up' ? '+' : ''}{change}% from last period
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive business insights and performance analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                Select Dates
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Export Options */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExportReport('pdf')}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? 'Exporting...' : 'Export'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleScheduleReport}>
              <Mail className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Monthly Revenue"
          icon={CreditCard}
          value={kpiMetrics.totalRevenue.value}
          change={kpiMetrics.totalRevenue.change}
          trend={kpiMetrics.totalRevenue.trend}
          format="currency"
        />
        <KPICard
          title="Active Members"
          icon={Users}
          value={kpiMetrics.totalMembers.value}
          change={kpiMetrics.totalMembers.change}
          trend={kpiMetrics.totalMembers.trend}
        />
        <KPICard
          title="Attendance Rate"
          icon={Target}
          value={kpiMetrics.classAttendance.value}
          change={kpiMetrics.classAttendance.change}
          trend={kpiMetrics.classAttendance.trend}
          format="percentage"
        />
        <KPICard
          title="Retention Rate"
          icon={UserCheck}
          value={kpiMetrics.retentionRate.value}
          change={kpiMetrics.retentionRate.change}
          trend={kpiMetrics.retentionRate.trend}
          format="percentage"
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={selectedReport} onValueChange={setSelectedReport}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="instructors">Instructors</TabsTrigger>
          <TabsTrigger value="predictions">Forecasting</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue & Growth Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="revenue" orientation="left" />
                    <YAxis yAxisId="retention" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value as number) : `${value}%`,
                        name === 'revenue' ? 'Revenue' : 'Retention Rate'
                      ]}
                    />
                    <Legend />
                    <Bar yAxisId="revenue" dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Line yAxisId="retention" type="monotone" dataKey="retention" stroke="#10b981" strokeWidth={3} name="Retention Rate" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Peak Hours</span>
                    <span className="font-medium">6-8 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Most Popular Class</span>
                    <span className="font-medium">Vinyasa Flow</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Class Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.7</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Customer LTV</span>
                    <span className="font-medium">{formatCurrency(890)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">This Month Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Revenue Target</span>
                      <span>{formatCurrency(58000)} / {formatCurrency(60000)}</span>
                    </div>
                    <Progress value={96.7} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>New Members</span>
                      <span>48 / 50</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Class Capacity</span>
                      <span>94.2% / 95%</span>
                    </div>
                    <Progress value={99.2} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Membership Distribution */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Membership Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={membershipData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {membershipData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Peak Hours Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="classes" 
                      stackId="1" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Total Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Revenue Sources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Class Bookings</span>
                    <span className="font-medium">{formatCurrency(35000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Memberships</span>
                    <span className="font-medium">{formatCurrency(18000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Packages</span>
                    <span className="font-medium">{formatCurrency(4200)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Retail & Products</span>
                    <span className="font-medium">{formatCurrency(800)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">TWINT</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">45%</span>
                      <Badge variant="secondary">🇨🇭</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Credit Card</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bank Transfer</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cash</span>
                    <span className="font-medium">5%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Class Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classPopularityData.map((classItem, index) => (
                  <div key={classItem.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{classItem.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{classItem.sessions} sessions</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{classItem.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(classItem.revenue)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(classItem.revenue / classItem.sessions)} avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Member Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="members" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Member Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-semibold text-blue-600">68%</div>
                    <div className="text-sm text-muted-foreground">Female</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-semibold text-purple-600">32%</div>
                    <div className="text-sm text-muted-foreground">Male</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Age 25-35</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Age 35-45</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Age 45+</span>
                    <span className="font-medium">25%</span>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. Monthly Visits</span>
                    <span className="font-medium">12.3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Member Satisfaction</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.6/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Instructors Tab */}
        <TabsContent value="instructors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Instructor Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Sarah Miller', classes: 85, rating: 4.9, revenue: 12750, specialty: 'Vinyasa' },
                  { name: 'Marc Dubois', classes: 72, rating: 4.8, revenue: 11520, specialty: 'Hot Yoga' },
                  { name: 'Anna Müller', classes: 68, rating: 4.7, revenue: 10880, specialty: 'Yin Yoga' },
                  { name: 'Lisa Chen', classes: 65, rating: 4.8, revenue: 10400, specialty: 'Power Yoga' },
                  { name: 'Sophie Laurent', classes: 45, rating: 4.9, revenue: 7200, specialty: 'Prenatal' }
                ].map((instructor, index) => (
                  <div key={instructor.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-medium">
                        {instructor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-medium">{instructor.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{instructor.specialty}</span>
                          <span>{instructor.classes} classes</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{instructor.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(instructor.revenue)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(instructor.revenue / instructor.classes)} per class
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecasting Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Next Month Prediction</span>
                    <span className="font-semibold text-green-600">{formatCurrency(62000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Q3 Forecast</span>
                    <span className="font-semibold">{formatCurrency(185000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Annual Projection</span>
                    <span className="font-semibold">{formatCurrency(720000)}</span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Growth Opportunities</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Expand morning classes (+15% revenue)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Launch corporate packages (+8% revenue)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">Address retention in 35+ age group</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Capacity Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Current Utilization</span>
                    <span className="font-semibold">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Optimal Utilization</span>
                    <span className="font-semibold text-green-600">96-98%</span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Add 2 evening slots</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">Adjust lunch break timing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Weekend workshop potential</span>
                      </div>
                    </div>
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