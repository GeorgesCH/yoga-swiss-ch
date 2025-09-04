import React, { useState } from 'react';
import { Megaphone, Users, FileText, BarChart3, Zap, Target, Mail, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MarketingManagement } from '../MarketingManagement';
import { AnalyticsReports } from '../analytics/AnalyticsReports';
import { BusinessGrowth } from '../analytics/BusinessGrowth';
import { AutomationsManagement } from '../automations/AutomationsManagement';

interface MarketingOverviewProps {
  onPageChange?: (page: string) => void;
}

export function MarketingOverview({ onPageChange }: MarketingOverviewProps) {
  const [activeTab, setActiveTab] = useState('campaigns');

  const marketingStats = [
    {
      title: 'Active Campaigns',
      value: '5',
      change: '+2 this week',
      icon: Megaphone,
      color: 'text-blue-600'
    },
    {
      title: 'Email Open Rate',
      value: '42.3%',
      change: '+5.2% from last month',
      icon: Mail,
      color: 'text-green-600'
    },
    {
      title: 'Customer Segments',
      value: '12',
      change: '3 highly engaged',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Conversion Rate',
      value: '8.7%',
      change: '+1.4% improvement',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  const SegmentsComponent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              High Value Customers
            </CardTitle>
            <CardDescription>Customers with high lifetime value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Members</span>
                <span className="font-semibold">247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg. Monthly Spend</span>
                <span className="font-semibold">CHF 180</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Engagement Rate</span>
                <span className="font-semibold text-green-600">92%</span>
              </div>
              <div className="pt-2">
                <Button size="sm" className="w-full">Target Campaign</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              New Students
            </CardTitle>
            <CardDescription>Recently joined members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Members</span>
                <span className="font-semibold">89</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Joined This Month</span>
                <span className="font-semibold">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Retention Rate</span>
                <span className="font-semibold text-orange-600">67%</span>
              </div>
              <div className="pt-2">
                <Button size="sm" variant="outline" className="w-full">Onboard</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-red-600" />
              At-Risk Customers
            </CardTitle>
            <CardDescription>Members with declining engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Members</span>
                <span className="font-semibold">34</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Last Visit</span>
                <span className="font-semibold">30+ days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Risk Level</span>
                <span className="font-semibold text-red-600">High</span>
              </div>
              <div className="pt-2">
                <Button size="sm" variant="destructive" className="w-full">Re-engage</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Corporate Clients
            </CardTitle>
            <CardDescription>Business and corporate accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Companies</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Employee Members</span>
                <span className="font-semibold">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Monthly Revenue</span>
                <span className="font-semibold text-blue-600">CHF 4,200</span>
              </div>
              <div className="pt-2">
                <Button size="sm" variant="outline" className="w-full">Expand</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              Premium Members
            </CardTitle>
            <CardDescription>Elite and unlimited membership holders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Members</span>
                <span className="font-semibold">124</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg. Classes/Month</span>
                <span className="font-semibold">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Satisfaction</span>
                <span className="font-semibold text-purple-600">4.8/5</span>
              </div>
              <div className="pt-2">
                <Button size="sm" variant="outline" className="w-full">Reward</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-yellow-600" />
              Referral Champions
            </CardTitle>
            <CardDescription>Top referrers and ambassadors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Members</span>
                <span className="font-semibold">42</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Referrals Made</span>
                <span className="font-semibold">87</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Success Rate</span>
                <span className="font-semibold text-yellow-600">73%</span>
              </div>
              <div className="pt-2">
                <Button size="sm" className="w-full">Reward</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Marketing Management</h1>
          <p className="text-muted-foreground">
            Drive growth with campaigns, analytics, and customer insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            Export Data
          </Button>
          <Button size="sm">
            <Megaphone className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {marketingStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Marketing Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="segments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Segments
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Growth
          </TabsTrigger>
          <TabsTrigger value="automations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Campaign Management</h3>
              <p className="text-muted-foreground">Create and manage marketing campaigns</p>
            </div>
            <Badge variant="secondary">5 active campaigns</Badge>
          </div>
          <MarketingManagement />
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Customer Segments</h3>
              <p className="text-muted-foreground">Target specific customer groups with personalized campaigns</p>
            </div>
            <Badge variant="secondary">12 segments</Badge>
          </div>
          <SegmentsComponent />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Analytics & Reports</h3>
              <p className="text-muted-foreground">Deep insights into marketing performance</p>
            </div>
            <Badge variant="secondary">Real-time data</Badge>
          </div>
          <AnalyticsReports onPageChange={onPageChange} />
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Business Growth</h3>
              <p className="text-muted-foreground">Track growth metrics and identify opportunities</p>
            </div>
            <Badge variant="secondary">Growth dashboard</Badge>
          </div>
          <BusinessGrowth onPageChange={onPageChange} />
        </TabsContent>

        <TabsContent value="automations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Marketing Automations</h3>
              <p className="text-muted-foreground">Automate marketing workflows and communications</p>
            </div>
            <Badge variant="secondary">8 active workflows</Badge>
          </div>
          <AutomationsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}