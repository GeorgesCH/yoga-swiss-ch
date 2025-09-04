import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, 
  BarChart3, 
  Mail, 
  Zap, 
  Users, 
  FileText, 
  Target, 
  Gift,
  ExternalLink,
  TrendingUp,
  Send,
  Eye,
  MousePointer,
  DollarSign
} from 'lucide-react';
import { FunnelManagement } from './marketing/FunnelManagement';
import { CampaignManagement } from './marketing/CampaignManagement';
import { JourneyManagement } from './marketing/JourneyManagement';
import { SegmentManagement } from './marketing/SegmentManagement';
import { MarketingAnalytics } from './marketing/MarketingAnalytics';
import { MarketingTemplates } from './marketing/MarketingTemplates';

export function MarketingManagement() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for the overview
  const marketingMetrics = {
    totalContacts: 2847,
    emailsSent: 15420,
    openRate: 24.8,
    clickRate: 3.2,
    totalRevenue: 45600,
    activeJourneys: 8,
    activeFunnels: 3,
    segments: 12
  };

  const recentCampaigns = [
    {
      id: 1,
      name: 'New Year Yoga Challenge',
      type: 'Newsletter',
      status: 'Completed',
      sent: 2847,
      opened: 706,
      clicked: 91,
      revenue: 3400,
      sentAt: '2025-01-02'
    },
    {
      id: 2,
      name: 'Weekend Workshop Promo',
      type: 'Promotional',
      status: 'Completed',
      sent: 1234,
      opened: 370,
      clicked: 67,
      revenue: 1850,
      sentAt: '2025-01-15'
    },
    {
      id: 3,
      name: 'Meditation Series Launch',
      type: 'Journey',
      status: 'Active',
      sent: 456,
      opened: 137,
      clicked: 23,
      revenue: 890,
      sentAt: '2025-01-20'
    }
  ];

  const activeFunnels = [
    {
      id: 1,
      name: 'New Student Onboarding',
      visits: 234,
      conversions: 23,
      conversionRate: 9.8,
      revenue: 2300
    },
    {
      id: 2,
      name: 'Workshop Registration',
      visits: 156,
      conversions: 18,
      conversionRate: 11.5,
      revenue: 1800
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingMetrics.totalContacts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingMetrics.emailsSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingMetrics.openRate}%</div>
            <p className="text-xs text-muted-foreground">
              Industry avg: 22.1%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Attribution</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {marketingMetrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with key marketing activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => setActiveTab('campaigns')}
            >
              <Mail className="h-6 w-6" />
              Create Campaign
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => setActiveTab('funnels')}
            >
              <Target className="h-6 w-6" />
              Build Funnel
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => setActiveTab('journeys')}
            >
              <Zap className="h-6 w-6" />
              Create Journey
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => setActiveTab('segments')}
            >
              <Users className="h-6 w-6" />
              Manage Segments
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Your latest email campaigns and their performance</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('campaigns')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{campaign.name}</h4>
                      <Badge 
                        variant={campaign.status === 'Active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{campaign.sent} sent</span>
                      <span>{((campaign.opened / campaign.sent) * 100).toFixed(1)}% opened</span>
                      <span>CHF {campaign.revenue}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {campaign.sentAt}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Funnels */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Funnels</CardTitle>
              <CardDescription>Performance of your conversion funnels</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('funnels')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeFunnels.map((funnel) => (
                <div key={funnel.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <h4 className="font-medium">{funnel.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{funnel.visits} visits</span>
                      <span>{funnel.conversions} conversions</span>
                      <span className="text-green-600 font-medium">{funnel.conversionRate}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">CHF {funnel.revenue}</div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Marketing system health and compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Email Deliverability</span>
              </div>
              <span className="text-sm text-muted-foreground">98.2%</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">GDPR Compliance</span>
              </div>
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Active Journeys</span>
              </div>
              <span className="text-sm text-muted-foreground">{marketingMetrics.activeJourneys}</span>
            </div>
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
          <h1 className="text-3xl font-bold">Marketing</h1>
          <p className="text-muted-foreground">
            Grow your studio with funnels, campaigns, and automated journeys
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <TrendingUp className="h-3 w-3 mr-1" />
            24.8% Open Rate
          </Badge>
          <Button onClick={() => setActiveTab('campaigns')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnels">Funnels</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="journeys">Journeys</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="funnels" className="space-y-6">
          <FunnelManagement />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <CampaignManagement />
        </TabsContent>

        <TabsContent value="journeys" className="space-y-6">
          <JourneyManagement />
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <SegmentManagement />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <MarketingTemplates />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <MarketingAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}