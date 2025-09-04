import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { RetreatDashboard } from './RetreatDashboard';
import { RetreatApplicationManager } from './RetreatApplicationManager';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Mountain,
  Users,
  Calendar,
  TrendingUp,
  MessageSquare,
  Bell,
  Settings,
  Plus,
  FileText,
  CreditCard,
  Activity,
  Star,
  Globe,
  Zap,
  Target,
  Award
} from 'lucide-react';

interface EnhancedRetreatManagementProps {
  onCreateRetreat?: () => void;
  onEditRetreat?: (retreatId: string) => void;
}

export function EnhancedRetreatManagement({ onCreateRetreat, onEditRetreat }: EnhancedRetreatManagementProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'application',
      title: 'New retreat application',
      message: 'Emma Müller applied for Alpine Yoga Retreat',
      timestamp: '2 minutes ago',
      urgent: true
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment received',
      message: 'CHF 1,850 deposit for David Chen',
      timestamp: '1 hour ago',
      urgent: false
    },
    {
      id: '3',
      type: 'community',
      title: 'Community milestone',
      message: 'Alpine Retreat discussion reached 50 messages',
      timestamp: '3 hours ago',
      urgent: false
    }
  ]);

  const urgentCount = notifications.filter(n => n.urgent).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            <Mountain className="h-7 w-7 text-primary" />
            Enhanced Retreat Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete retreat lifecycle management with community integration and intelligent automation
          </p>
        </div>
        <div className="flex items-center gap-3">
          {urgentCount > 0 && (
            <Alert className="w-auto">
              <Bell className="h-4 w-4" />
              <AlertDescription>
                {urgentCount} urgent notification{urgentCount > 1 ? 's' : ''} require attention
              </AlertDescription>
            </Alert>
          )}
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Zap className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm" onClick={onCreateRetreat}>
            <Plus className="h-4 w-4 mr-2" />
            Create Retreat
          </Button>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Applications
            {urgentCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {urgentCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Community
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <RetreatDashboard />
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <RetreatApplicationManager />
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Retreat Communities
                </CardTitle>
                <CardDescription>
                  Active discussion threads and participant engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Alpine Yoga Retreat', participants: 12, messages: 89, engagement: 'high' },
                    { name: 'Ticino Wellness Retreat', participants: 8, messages: 34, engagement: 'medium' },
                    { name: 'Lithuania Adventure', participants: 6, messages: 23, engagement: 'low' }
                  ].map((community) => (
                    <div key={community.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{community.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {community.participants} participants • {community.messages} messages
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          community.engagement === 'high' ? 'default' :
                          community.engagement === 'medium' ? 'secondary' : 'outline'
                        } className="text-xs">
                          {community.engagement}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest notifications and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-3 border rounded-lg ${
                      notification.urgent ? 'border-orange-200 bg-orange-50' : ''
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{notification.title}</div>
                          <div className="text-xs text-muted-foreground">{notification.message}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{notification.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">CHF 47,200</div>
                <p className="text-xs text-muted-foreground">+18% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Pending Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">CHF 12,450</div>
                <p className="text-xs text-muted-foreground">8 outstanding balances</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">Applications to bookings</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule Management</CardTitle>
              <CardDescription>
                Track deposits, installments, and final payments across all retreats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { customer: 'Emma Müller', retreat: 'Alpine Yoga', amount: 'CHF 1,155', due: '2024-06-15', status: 'pending', type: 'Balance' },
                  { customer: 'David Chen', retreat: 'Alpine Yoga', amount: 'CHF 675', due: '2024-05-20', status: 'paid', type: 'Deposit' },
                  { customer: 'Sophie Laurent', retreat: 'Ticino Wellness', amount: 'CHF 1,015', due: '2024-07-10', status: 'overdue', type: 'Balance' }
                ].map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium text-sm">{payment.customer}</div>
                        <div className="text-xs text-muted-foreground">{payment.retreat} • {payment.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium text-sm">{payment.amount}</div>
                        <div className="text-xs text-muted-foreground">Due: {payment.due}</div>
                      </div>
                      <Badge variant={
                        payment.status === 'paid' ? 'default' :
                        payment.status === 'overdue' ? 'destructive' : 'secondary'
                      }>
                        {payment.status}
                      </Badge>
                      {payment.status !== 'paid' && (
                        <Button variant="outline" size="sm">
                          Send Reminder
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.9/5</div>
                <p className="text-xs text-muted-foreground">Avg retreat rating</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Repeat Guests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">34%</div>
                <p className="text-xs text-muted-foreground">Return for more retreats</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-500" />
                  International
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">67%</div>
                <p className="text-xs text-muted-foreground">Non-Swiss participants</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-500" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98%</div>
                <p className="text-xs text-muted-foreground">Finish full retreat</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>
                Detailed analytics and business intelligence for your retreat operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Top Performing Retreats</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Alpine Yoga Retreat', score: 9.2, bookings: 12 },
                      { name: 'Lithuania Adventure', score: 8.8, bookings: 8 },
                      { name: 'Ticino Wellness', score: 8.5, bookings: 6 }
                    ].map((retreat) => (
                      <div key={retreat.name} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{retreat.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {retreat.score}/10
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {retreat.bookings} bookings
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Revenue Trends</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm">Q1 2024</span>
                      <span className="font-medium text-green-700">CHF 89,400</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="text-sm">Q4 2023</span>
                      <span className="font-medium text-blue-700">CHF 76,200</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                      <span className="text-sm">Growth Rate</span>
                      <span className="font-medium text-purple-700">+17.3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Intelligent Automation
              </CardTitle>
              <CardDescription>
                AI-powered workflows to streamline your retreat management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Active Automations</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Auto-approve qualified applications', status: 'active', description: 'Automatically approve applications meeting criteria' },
                      { name: 'Payment reminder sequence', status: 'active', description: 'Send payment reminders at optimal intervals' },
                      { name: 'Community thread creation', status: 'active', description: 'Create discussion threads for approved participants' },
                      { name: 'Welcome message automation', status: 'active', description: 'Send personalized welcome messages to new participants' }
                    ].map((automation) => (
                      <div key={automation.name} className="flex items-start justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{automation.name}</div>
                          <div className="text-xs text-muted-foreground">{automation.description}</div>
                        </div>
                        <Badge variant="default" className="text-xs">
                          {automation.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Automation Impact</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-sm text-green-800">Time Saved</div>
                      <div className="text-2xl font-bold text-green-700">23.5 hours</div>
                      <div className="text-xs text-green-600">This month</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-sm text-blue-800">Applications Processed</div>
                      <div className="text-2xl font-bold text-blue-700">47</div>
                      <div className="text-xs text-blue-600">Automatically approved</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="font-medium text-sm text-purple-800">Response Rate</div>
                      <div className="text-2xl font-bold text-purple-700">94%</div>
                      <div className="text-xs text-purple-600">Automated messages</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}