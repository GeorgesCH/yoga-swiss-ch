import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Mail, 
  MousePointer, 
  Users, 
  DollarSign,
  Eye,
  Send,
  Target,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, Area, AreaChart } from 'recharts';

export function MarketingAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock analytics data
  const emailPerformanceData = [
    { date: '2025-01-01', sent: 1200, delivered: 1176, opened: 294, clicked: 35, bounced: 24 },
    { date: '2025-01-08', sent: 1350, delivered: 1323, opened: 330, clicked: 42, bounced: 27 },
    { date: '2025-01-15', sent: 1100, delivered: 1078, opened: 270, clicked: 38, bounced: 22 },
    { date: '2025-01-22', sent: 1450, delivered: 1421, opened: 355, clicked: 46, bounced: 29 },
    { date: '2025-01-29', sent: 1250, delivered: 1225, opened: 306, clicked: 41, bounced: 25 }
  ];

  const campaignTypes = [
    { name: 'Newsletter', value: 45, color: '#8B5CF6' },
    { name: 'Promotional', value: 25, color: '#06B6D4' },
    { name: 'Welcome Series', value: 15, color: '#10B981' },
    { name: 'Win-back', value: 10, color: '#F59E0B' },
    { name: 'Event', value: 5, color: '#EF4444' }
  ];

  const revenueData = [
    { month: 'Aug', revenue: 12500, campaigns: 8 },
    { month: 'Sep', revenue: 15200, campaigns: 12 },
    { month: 'Oct', revenue: 18800, campaigns: 15 },
    { month: 'Nov', revenue: 22100, campaigns: 18 },
    { month: 'Dec', revenue: 28500, campaigns: 22 },
    { month: 'Jan', revenue: 32400, campaigns: 25 }
  ];

  const segmentPerformance = [
    { segment: 'VIP Members', contacts: 234, openRate: 42.3, clickRate: 8.7, revenue: 12500 },
    { segment: 'New Students', contacts: 78, openRate: 38.9, clickRate: 6.2, revenue: 3400 },
    { segment: 'Weekend Warriors', contacts: 342, openRate: 28.1, clickRate: 4.3, revenue: 8900 },
    { segment: 'At-Risk', contacts: 156, openRate: 15.8, clickRate: 2.1, revenue: 890 }
  ];

  const topCampaigns = [
    { name: 'New Year Challenge', type: 'Promotional', sent: 2847, openRate: 35.2, clickRate: 7.8, revenue: 15600 },
    { name: 'Weekend Workshop Series', type: 'Event', sent: 1234, openRate: 41.7, clickRate: 9.2, revenue: 8900 },
    { name: 'Welcome to YogaSwiss', type: 'Welcome', sent: 456, openRate: 52.3, clickRate: 12.4, revenue: 4200 },
    { name: 'Meditation Monday', type: 'Newsletter', sent: 1890, openRate: 28.6, clickRate: 4.1, revenue: 2100 }
  ];

  const calculateMetrics = () => {
    const totalSent = emailPerformanceData.reduce((sum, d) => sum + d.sent, 0);
    const totalDelivered = emailPerformanceData.reduce((sum, d) => sum + d.delivered, 0);
    const totalOpened = emailPerformanceData.reduce((sum, d) => sum + d.opened, 0);
    const totalClicked = emailPerformanceData.reduce((sum, d) => sum + d.clicked, 0);
    const totalBounced = emailPerformanceData.reduce((sum, d) => sum + d.bounced, 0);

    return {
      deliveryRate: ((totalDelivered / totalSent) * 100),
      openRate: ((totalOpened / totalDelivered) * 100),
      clickRate: ((totalClicked / totalOpened) * 100),
      bounceRate: ((totalBounced / totalSent) * 100),
      totalRevenue: revenueData[revenueData.length - 1].revenue
    };
  };

  const metrics = calculateMetrics();

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.deliveryRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.openRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +0.8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.clickRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-500" />
              -0.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.bounceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-green-500" />
              -0.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +24.5% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Email Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Email Performance Trend</CardTitle>
          <CardDescription>Track email metrics over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={emailPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="opened" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Opened"
              />
              <Line 
                type="monotone" 
                dataKey="clicked" 
                stroke="#06B6D4" 
                strokeWidth={2}
                name="Clicked"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Types</CardTitle>
            <CardDescription>Distribution of campaign types sent</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={campaignTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({name, value}) => `${name} (${value}%)`}
                >
                  {campaignTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Attribution */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
            <CardDescription>Revenue attributed to marketing campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSegmentAnalytics = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Segment Performance</CardTitle>
          <CardDescription>Compare how different customer segments respond to campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {segmentPerformance.map((segment, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">{segment.segment}</div>
                  <div className="text-sm text-muted-foreground">{segment.contacts} contacts</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{segment.openRate}%</div>
                  <div className="text-xs text-muted-foreground">Open Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{segment.clickRate}%</div>
                  <div className="text-xs text-muted-foreground">Click Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">CHF {segment.revenue}</div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">CHF {(segment.revenue / segment.contacts).toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">Per Contact</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCampaignAnalytics = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Campaigns</CardTitle>
          <CardDescription>Your best campaigns by engagement and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCampaigns.map((campaign, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-border rounded-lg">
                <div className="md:col-span-2">
                  <div className="font-medium">{campaign.name}</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {campaign.type}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="font-bold">{campaign.sent}</div>
                  <div className="text-xs text-muted-foreground">Sent</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{campaign.openRate}%</div>
                  <div className="text-xs text-muted-foreground">Open Rate</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{campaign.clickRate}%</div>
                  <div className="text-xs text-muted-foreground">Click Rate</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">CHF {campaign.revenue}</div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Marketing Analytics</h2>
          <p className="text-muted-foreground">
            Track performance and optimize your marketing efforts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="campaigns">
          {renderCampaignAnalytics()}
        </TabsContent>

        <TabsContent value="segments">
          {renderSegmentAnalytics()}
        </TabsContent>

        <TabsContent value="revenue">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Attribution</CardTitle>
                <CardDescription>Revenue generated from marketing activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsBarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8B5CF6" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}