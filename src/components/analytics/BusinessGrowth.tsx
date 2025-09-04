import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { financeService } from '../../utils/supabase/finance-service';
import { peopleService } from '../../utils/supabase/people-service';
import { classesService } from '../../utils/supabase/classes-service';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  Target,
  Lightbulb,
  Users,
  CreditCard,
  MapPin,
  Globe,
  Building2,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  Star,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  BarChart3,
  PieChart,
  Settings,
  Rocket,
  Brain,
  Eye,
  Shield,
  Heart,
  Smartphone,
  Wifi,
  Mountain,
  Wallet
} from 'lucide-react';
import { AnalyticsReports } from './AnalyticsReports';

interface BusinessGrowthProps {
  onPageChange?: (page: string) => void;
}

export function BusinessGrowth({ onPageChange }: BusinessGrowthProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [loading, setLoading] = useState(true);
  const [realGrowthMetrics, setRealGrowthMetrics] = useState<any>(null);
  const { currentOrg } = useMultiTenantAuth();

  useEffect(() => {
    if (currentOrg?.id) {
      loadRealGrowthData();
    }
  }, [currentOrg]);

  const loadRealGrowthData = async () => {
    if (!currentOrg?.id) return;

    try {
      setLoading(true);
      
      // Get date ranges
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Load current month and last month financial data
      const [currentMonthData, lastMonthData, customersData] = await Promise.all([
        financeService.getFinancialSummary(
          currentOrg.id,
          startOfMonth.toISOString(),
          now.toISOString()
        ),
        financeService.getFinancialSummary(
          currentOrg.id,
          startOfLastMonth.toISOString(),
          endOfLastMonth.toISOString()
        ),
        peopleService.getCustomers()
      ]);

      // Calculate growth metrics
      const currentRevenue = (currentMonthData.data?.total_revenue_cents || 0) / 100;
      const lastRevenue = (lastMonthData.data?.total_revenue_cents || 0) / 100;
      const revenueGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

      const activeCustomers = customersData.customers?.filter(c => c.status === 'Active') || [];
      const totalCustomers = customersData.customers?.length || 0;

      setRealGrowthMetrics({
        monthlyGrowthRate: Math.max(revenueGrowth, 0),
        currentRevenue,
        lastRevenue,
        activeCustomers: activeCustomers.length,
        totalCustomers,
        conversionRate: totalCustomers > 0 ? (activeCustomers.length / totalCustomers) * 100 : 0,
        // Mock some other metrics until we have more data
        customerAcquisitionCost: 45,
        lifetimeValue: 890,
        retentionRate: 91,
        nps: 68
      });

    } catch (error) {
      console.error('Error loading growth data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showAnalytics) {
    return <AnalyticsReports onPageChange={onPageChange} />;
  }

  // Use real data if available, otherwise fall back to mock data
  const growthMetrics = realGrowthMetrics || {
    monthlyGrowthRate: 12.5,
    customerAcquisitionCost: 45,
    lifetimeValue: 890,
    conversionRate: 23.5,
    retentionRate: 91,
    marketShare: 8.3,
    nps: 68,
    organicGrowth: 34.2
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading business growth data...</p>
        </div>
      </div>
    );
  }

  const competitiveAnalysis = [
    { metric: 'Price Competitiveness', us: 85, competitor1: 78, competitor2: 82, market: 80 },
    { metric: 'Class Variety', us: 92, competitor1: 75, competitor2: 88, market: 82 },
    { metric: 'Instructor Quality', us: 94, competitor1: 85, competitor2: 79, market: 84 },
    { metric: 'Facility Quality', us: 88, competitor1: 92, competitor2: 85, market: 88 },
    { metric: 'Technology', us: 95, competitor1: 70, competitor2: 85, market: 83 },
    { metric: 'Customer Service', us: 91, competitor1: 83, competitor2: 77, market: 81 }
  ];

  const marketOpportunities = [
    {
      id: 1,
      title: 'Corporate Wellness Programs',
      potential: 'High',
      revenue: 25000,
      effort: 'Medium',
      timeline: '3-6 months',
      description: 'Partner with local businesses for employee wellness programs',
      status: 'opportunity',
      swissRelevance: 'High - Swiss corporate culture values work-life balance'
    },
    {
      id: 2,
      title: 'Online Class Platform',
      potential: 'Very High',
      revenue: 18000,
      effort: 'High',
      timeline: '6-12 months',
      description: 'Launch comprehensive online yoga platform for remote learners',
      status: 'in-progress',
      swissRelevance: 'Medium - Growing digital adoption post-COVID'
    },
    {
      id: 3,
      title: 'Premium Retreat Packages',
      potential: 'High',
      revenue: 35000,
      effort: 'High',
      timeline: '6-9 months',
      description: 'Luxury yoga retreats in Swiss Alps and lakeside locations',
      status: 'planning',
      swissRelevance: 'Very High - Perfect for Swiss tourism market'
    },
    {
      id: 4,
      title: 'Prenatal & Family Classes',
      potential: 'Medium',
      revenue: 12000,
      effort: 'Low',
      timeline: '2-3 months',
      description: 'Specialized programs for expecting mothers and families',
      status: 'opportunity',
      swissRelevance: 'High - Strong family support culture in Switzerland'
    },
    {
      id: 5,
      title: 'Senior Wellness Programs',
      potential: 'Medium',
      revenue: 15000,
      effort: 'Medium',
      timeline: '3-4 months',
      description: 'Gentle yoga and wellness programs for 55+ demographic',
      status: 'opportunity',
      swissRelevance: 'Very High - Aging population with high disposable income'
    }
  ];

  const growthGoals = [
    {
      id: 1,
      title: 'Increase Monthly Revenue by 25%',
      current: 58000,
      target: 72500,
      progress: 80,
      deadline: '2024-12-31',
      priority: 'high',
      strategies: [
        'Launch premium membership tier',
        'Expand corporate partnerships',
        'Introduce specialized workshops'
      ]
    },
    {
      id: 2,
      title: 'Grow Member Base to 1,500',
      current: 1080,
      target: 1500,
      progress: 72,
      deadline: '2024-12-31',
      priority: 'high',
      strategies: [
        'Referral incentive program',
        'Social media advertising',
        'Community partnerships'
      ]
    },
    {
      id: 3,
      title: 'Achieve 95% Customer Satisfaction',
      current: 91,
      target: 95,
      progress: 96,
      deadline: '2024-09-30',
      priority: 'medium',
      strategies: [
        'Enhanced instructor training',
        'Facility improvements',
        'Personalized member experience'
      ]
    },
    {
      id: 4,
      title: 'Expand to 3 New Locations',
      current: 1,
      target: 4,
      progress: 25,
      deadline: '2025-06-30',
      priority: 'high',
      strategies: [
        'Market research and site selection',
        'Franchise model development',
        'Brand standardization'
      ]
    }
  ];

  const swissMarketInsights = {
    marketSize: '450M CHF',
    growth: '8.5%',
    digitalAdoption: '76%',
    avgSpending: '1,200 CHF/year',
    topCities: ['Zürich', 'Geneva', 'Basel', 'Bern', 'Lausanne'],
    trends: [
      'Increased focus on mental wellness',
      'Outdoor activities gaining popularity',
      'Corporate wellness programs expanding',
      'Digital-physical hybrid experiences',
      'Sustainability consciousness rising'
    ]
  };

  const actionItems = [
    {
      id: 1,
      title: 'Launch Q4 Marketing Campaign',
      priority: 'High',
      assignee: 'Marketing Team',
      dueDate: '2024-10-01',
      status: 'in-progress',
      impact: 'Revenue Growth'
    },
    {
      id: 2,
      title: 'Implement Customer Feedback System',
      priority: 'Medium',
      assignee: 'Operations',
      dueDate: '2024-09-15',
      status: 'pending',
      impact: 'Customer Satisfaction'
    },
    {
      id: 3,
      title: 'Develop Corporate Partnership Package',
      priority: 'High',
      assignee: 'Business Development',
      dueDate: '2024-09-30',
      status: 'pending',
      impact: 'Market Expansion'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'opportunity': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Business Growth</h1>
          <p className="text-muted-foreground">
            Strategic insights and growth opportunities for your yoga business
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowAnalytics(true)}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            View Analytics & Reports
          </Button>
          <Button className="gap-2">
            <Target className="h-4 w-4" />
            Set New Goal
          </Button>
        </div>
      </div>

      {/* Growth KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm text-muted-foreground">Monthly Growth</span>
              </div>
              <Badge className="bg-green-100 text-green-700">
                +{growthMetrics.monthlyGrowthRate}%
              </Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold">{growthMetrics.monthlyGrowthRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">vs. last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">Customer LTV</span>
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold">{formatCurrency(growthMetrics.lifetimeValue)}</div>
              <p className="text-xs text-muted-foreground mt-1">+15.2% increase</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-muted-foreground">Conversion Rate</span>
              </div>
              <Badge className="bg-purple-100 text-purple-700">
                Excellent
              </Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold">{growthMetrics.conversionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Above industry avg</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                <span className="text-sm text-muted-foreground">NPS Score</span>
              </div>
              <Badge className="bg-green-100 text-green-700">
                Excellent
              </Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold">{growthMetrics.nps}</div>
              <p className="text-xs text-muted-foreground mt-1">Very strong loyalty</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="goals">Goals & Targets</TabsTrigger>
          <TabsTrigger value="competitive">Competitive</TabsTrigger>
          <TabsTrigger value="market">Swiss Market</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Growth Trajectory */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Growth Trajectory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={[
                    { month: 'Jan', revenue: 45000, members: 890, satisfaction: 85 },
                    { month: 'Feb', revenue: 48000, members: 920, satisfaction: 87 },
                    { month: 'Mar', revenue: 52000, members: 980, satisfaction: 88 },
                    { month: 'Apr', revenue: 49000, members: 950, satisfaction: 86 },
                    { month: 'May', revenue: 55000, members: 1020, satisfaction: 89 },
                    { month: 'Jun', revenue: 58000, members: 1080, satisfaction: 91 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="revenue" orientation="left" />
                    <YAxis yAxisId="members" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value as number) : value,
                        name === 'revenue' ? 'Revenue' : name === 'members' ? 'Members' : 'Satisfaction'
                      ]}
                    />
                    <Legend />
                    <Bar yAxisId="revenue" dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Line yAxisId="members" type="monotone" dataKey="members" stroke="#10b981" strokeWidth={3} name="Members" />
                    <Area yAxisId="members" type="monotone" dataKey="satisfaction" fill="#f59e0b" fillOpacity={0.3} name="Satisfaction" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Insights */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Strong Performance</span>
                    </div>
                    <p className="text-xs text-green-700">
                      Your retention rate is 15% above industry average
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Opportunity</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      Consider expanding morning class offerings
                    </p>
                  </div>

                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Watch</span>
                    </div>
                    <p className="text-xs text-orange-700">
                      Competition increasing in Zürich market
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Priority Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {actionItems.slice(0, 3).map((action) => (
                    <div key={action.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.assignee}</div>
                      </div>
                      <div className={`text-xs font-medium ${getPriorityColor(action.priority.toLowerCase())}`}>
                        {action.priority}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    View All Actions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Current Goals Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Active Growth Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {growthGoals.slice(0, 4).map((goal) => (
                  <div key={goal.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{goal.title}</h4>
                      <Badge 
                        className={
                          goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                          goal.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }
                      >
                        {goal.priority}
                      </Badge>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {typeof goal.current === 'number' && goal.current > 1000 ? 
                          formatCurrency(goal.current) : 
                          goal.current.toLocaleString()}
                      </span>
                      <span className="font-medium">
                        {goal.progress}% complete
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid gap-6">
            {marketOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{opportunity.title}</h3>
                        <Badge className={getStatusColor(opportunity.status)}>
                          {opportunity.status.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          🇨🇭 Swiss Relevance: {opportunity.swissRelevance}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{opportunity.description}</p>
                      <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                        {opportunity.swissRelevance}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(opportunity.revenue)}
                      </div>
                      <div className="text-xs text-muted-foreground">Revenue Potential</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className={`text-lg font-semibold ${
                        opportunity.potential === 'Very High' ? 'text-red-600' :
                        opportunity.potential === 'High' ? 'text-orange-600' :
                        'text-blue-600'
                      }`}>
                        {opportunity.potential}
                      </div>
                      <div className="text-xs text-muted-foreground">Market Potential</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className={`text-lg font-semibold ${
                        opportunity.effort === 'High' ? 'text-red-600' :
                        opportunity.effort === 'Medium' ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {opportunity.effort}
                      </div>
                      <div className="text-xs text-muted-foreground">Implementation Effort</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-600">
                        {opportunity.timeline}
                      </div>
                      <div className="text-xs text-muted-foreground">Timeline</div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Start Planning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Goal Progress Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {growthGoals.map((goal) => (
                  <div 
                    key={goal.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedGoal === goal.id.toString() ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedGoal(selectedGoal === goal.id.toString() ? null : goal.id.toString())}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{goal.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={
                            goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                            goal.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }
                        >
                          {goal.priority}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {goal.progress}%</span>
                        <span>
                          {typeof goal.current === 'number' && goal.current > 1000 ? 
                            `${formatCurrency(goal.current)} / ${formatCurrency(goal.target)}` :
                            `${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}`
                          }
                        </span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>

                    {selectedGoal === goal.id.toString() && (
                      <div className="mt-4 pt-4 border-t">
                        <h5 className="font-medium mb-2">Strategies:</h5>
                        <ul className="space-y-1">
                          {goal.strategies.map((strategy, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <ArrowRight className="h-3 w-3" />
                              {strategy}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Goal Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Goals</span>
                    <span className="font-medium">{growthGoals.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">On Track</span>
                    <span className="font-medium text-green-600">
                      {growthGoals.filter(g => g.progress >= 70).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">At Risk</span>
                    <span className="font-medium text-orange-600">
                      {growthGoals.filter(g => g.progress < 50).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average Progress</span>
                    <span className="font-medium">
                      {Math.round(growthGoals.reduce((acc, g) => acc + g.progress, 0) / growthGoals.length)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {growthGoals
                    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                    .slice(0, 3)
                    .map((goal) => (
                      <div key={goal.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{goal.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(goal.deadline).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`text-xs font-medium ${
                          goal.progress >= 80 ? 'text-green-600' :
                          goal.progress >= 50 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {goal.progress}%
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Competitive Analysis Tab */}
        <TabsContent value="competitive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Competitive Positioning Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={competitiveAnalysis}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="YogaSwiss" dataKey="us" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                  <Radar name="Competitor 1" dataKey="competitor1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} />
                  <Radar name="Competitor 2" dataKey="competitor2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                  <Radar name="Market Average" dataKey="market" stroke="#6b7280" fill="#6b7280" fillOpacity={0.1} strokeWidth={1} strokeDasharray="5 5" />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Competitive Advantages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Superior Technology Platform</div>
                    <div className="text-sm text-muted-foreground">95% score vs 83% market average</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Exceptional Instructor Quality</div>
                    <div className="text-sm text-muted-foreground">94% score vs 84% market average</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Diverse Class Offerings</div>
                    <div className="text-sm text-muted-foreground">92% score vs 82% market average</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Outstanding Customer Service</div>
                    <div className="text-sm text-muted-foreground">91% score vs 81% market average</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-medium">Facility Quality</div>
                    <div className="text-sm text-muted-foreground">88% - opportunity to match market leader (92%)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-medium">Price Competitiveness</div>
                    <div className="text-sm text-muted-foreground">Consider premium positioning vs aggressive pricing</div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <h4 className="font-medium">Recommended Actions:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      Invest in facility upgrades and amenities
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      Develop value-based pricing strategy
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      Monitor competitor technology developments
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Swiss Market Tab */}
        <TabsContent value="market" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Swiss Wellness Market Overview
                  <Badge variant="outline" className="ml-2">🇨🇭</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-2xl font-semibold text-red-600">{swissMarketInsights.marketSize}</div>
                    <div className="text-sm text-muted-foreground">Market Size</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl font-semibold text-green-600">{swissMarketInsights.growth}</div>
                    <div className="text-sm text-muted-foreground">Annual Growth</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-2xl font-semibold text-blue-600">{swissMarketInsights.digitalAdoption}</div>
                    <div className="text-sm text-muted-foreground">Digital Adoption</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="text-2xl font-semibold text-purple-600">{swissMarketInsights.avgSpending}</div>
                    <div className="text-sm text-muted-foreground">Avg. Spending</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Key Market Trends</h4>
                  <div className="space-y-2">
                    {swissMarketInsights.trends.map((trend, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{trend}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Top Markets</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {swissMarketInsights.topCities.map((city, index) => (
                      <div key={city} className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium text-sm">{city}</div>
                        <div className="text-xs text-muted-foreground">#{index + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    🇨🇭 Swiss Advantages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-green-600" />
                    <span className="text-sm">High disposable income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Strong wellness culture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mountain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Outdoor lifestyle preference</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Corporate wellness focus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">TWINT payment adoption</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Market Position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Market Share</span>
                    <span className="font-medium">{growthMetrics.marketShare}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rank in Zürich</span>
                    <span className="font-medium">#3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Growth Rate</span>
                    <span className="font-medium text-green-600">+{growthMetrics.monthlyGrowthRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Brand Recognition</span>
                    <span className="font-medium">78%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Swiss Market Expansion Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Short Term (6 months)</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Launch German-language classes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Implement TWINT payment integration
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Partner with local wellness centers
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Medium Term (12 months)</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      Open second location in Geneva
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      Develop corporate wellness packages
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      Launch outdoor summer programs
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Long Term (24 months)</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      Expand to Basel and Bern
                    </li>
                    <li className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      Launch premium retreat destinations
                    </li>
                    <li className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      Develop franchise model
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}