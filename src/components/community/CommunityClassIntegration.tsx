import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  MessageSquare, 
  Users, 
  Bell, 
  Settings, 
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Zap,
  UserPlus,
  MessageCircle,
  ThumbsUp,
  Star,
  Target
} from 'lucide-react';

interface ClassThread {
  id: string;
  class_id: string;
  class_name: string;
  instructor_name: string;
  thread_id: string;
  thread_title: string;
  auto_created: boolean;
  participant_count: number;
  message_count: number;
  last_activity: string;
  engagement_score: number;
  status: 'active' | 'archived' | 'pending';
}

interface IntegrationSettings {
  auto_create_threads: boolean;
  notify_on_class_discussion: boolean;
  notify_instructors_on_questions: boolean;
  auto_add_class_roster: boolean;
  send_welcome_message: boolean;
  archive_after_class: boolean;
  engagement_tracking: boolean;
}

interface CommunityMetrics {
  total_class_threads: number;
  active_discussions: number;
  daily_messages: number;
  instructor_response_rate: number;
  student_satisfaction: number;
  community_growth: number;
}

export function CommunityClassIntegration() {
  const [classThreads, setClassThreads] = useState<ClassThread[]>([]);
  const [settings, setSettings] = useState<IntegrationSettings>({
    auto_create_threads: true,
    notify_on_class_discussion: true,
    notify_instructors_on_questions: true,
    auto_add_class_roster: true,
    send_welcome_message: true,
    archive_after_class: false,
    engagement_tracking: true
  });
  const [metrics, setMetrics] = useState<CommunityMetrics>({
    total_class_threads: 0,
    active_discussions: 0,
    daily_messages: 0,
    instructor_response_rate: 0,
    student_satisfaction: 0,
    community_growth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClassThreads();
    loadCommunityMetrics();
  }, []);

  const loadClassThreads = async () => {
    try {
      setLoading(true);
      
      // Demo data for yoga class community integration
      const demoThreads: ClassThread[] = [
        {
          id: 'ct-1',
          class_id: 'class-morning-hatha',
          class_name: 'Morning Hatha Flow',
          instructor_name: 'Sarah Kumar',
          thread_id: 'thread-hatha-discussion',
          thread_title: 'Morning Hatha Flow - Class Discussion',
          auto_created: true,
          participant_count: 18,
          message_count: 42,
          last_activity: new Date(Date.now() - 3600000).toISOString(),
          engagement_score: 8.5,
          status: 'active'
        },
        {
          id: 'ct-2',
          class_id: 'class-vinyasa-sunset',
          class_name: 'Sunset Vinyasa',
          instructor_name: 'Marcus Thompson',
          thread_id: 'thread-vinyasa-discussion',
          thread_title: 'Sunset Vinyasa - Practice & Questions',
          auto_created: true,
          participant_count: 22,
          message_count: 67,
          last_activity: new Date(Date.now() - 1800000).toISOString(),
          engagement_score: 9.2,
          status: 'active'
        },
        {
          id: 'ct-3',
          class_id: 'class-restorative-evening',
          class_name: 'Restorative Evening',
          instructor_name: 'Elena Zimmerman',
          thread_id: 'thread-restorative-discussion',
          thread_title: 'Restorative Evening - Relaxation Tips',
          auto_created: true,
          participant_count: 15,
          message_count: 28,
          last_activity: new Date(Date.now() - 7200000).toISOString(),
          engagement_score: 7.8,
          status: 'active'
        },
        {
          id: 'ct-4',
          class_id: 'class-power-morning',
          class_name: 'Power Morning Session',
          instructor_name: 'David Chen',
          thread_id: 'thread-power-discussion',
          thread_title: 'Power Morning - Strength & Flow',
          auto_created: false,
          participant_count: 25,
          message_count: 89,
          last_activity: new Date(Date.now() - 900000).toISOString(),
          engagement_score: 9.7,
          status: 'active'
        },
        {
          id: 'ct-5',
          class_id: 'class-prenatal-gentle',
          class_name: 'Prenatal Gentle Yoga',
          instructor_name: 'Anna Müller',
          thread_id: 'thread-prenatal-discussion',
          thread_title: 'Prenatal Gentle - Safe Practice Tips',
          auto_created: true,
          participant_count: 12,
          message_count: 34,
          last_activity: new Date(Date.now() - 5400000).toISOString(),
          engagement_score: 8.9,
          status: 'active'
        }
      ];

      setClassThreads(demoThreads);
    } catch (error) {
      console.error('Error loading class threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCommunityMetrics = async () => {
    try {
      // Demo metrics for yoga studio community
      setMetrics({
        total_class_threads: 15,
        active_discussions: 8,
        daily_messages: 47,
        instructor_response_rate: 94.5,
        student_satisfaction: 4.7,
        community_growth: 23.4
      });
    } catch (error) {
      console.error('Error loading community metrics:', error);
    }
  };

  const updateSetting = (key: keyof IntegrationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const createClassThread = async (classId: string) => {
    try {
      // This would create a new thread for the class
      console.log('Creating thread for class:', classId);
      // Refresh the list
      loadClassThreads();
    } catch (error) {
      console.error('Error creating class thread:', error);
    }
  };

  const archiveClassThread = async (threadId: string) => {
    try {
      setClassThreads(prev => 
        prev.map(thread => 
          thread.id === threadId 
            ? { ...thread, status: 'archived' }
            : thread
        )
      );
    } catch (error) {
      console.error('Error archiving thread:', error);
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEngagementBadge = (score: number) => {
    if (score >= 9) return { variant: 'default' as const, text: 'Excellent' };
    if (score >= 7) return { variant: 'secondary' as const, text: 'Good' };
    return { variant: 'destructive' as const, text: 'Needs Attention' };
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community integration...</p>
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
            <MessageSquare className="h-7 w-7 text-primary" />
            Community-Class Integration
          </h2>
          <p className="text-muted-foreground mt-1">
            Seamlessly connect your yoga classes with community discussions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="h-3 w-3 mr-1" />
            Active Integration
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Community Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Threads</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_class_threads}</div>
            <p className="text-xs text-muted-foreground">Total active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discussions</CardTitle>
            <MessageCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_discussions}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Messages</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.daily_messages}</div>
            <p className="text-xs text-muted-foreground">Today's activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.instructor_response_rate}%</div>
            <p className="text-xs text-muted-foreground">Instructor replies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.student_satisfaction}/5</div>
            <p className="text-xs text-muted-foreground">Student rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{metrics.community_growth}%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="threads" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="threads" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Class Threads
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Integration Settings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="threads" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Active Class Discussions</h3>
              <p className="text-muted-foreground">Manage community threads for your yoga classes</p>
            </div>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Create Thread
            </Button>
          </div>

          <div className="grid gap-4">
            {classThreads.filter(thread => thread.status === 'active').map((thread) => (
              <Card key={thread.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{thread.class_name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span>{thread.instructor_name}</span>
                          {thread.auto_created && (
                            <Badge variant="outline" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Auto-created
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        {...getEngagementBadge(thread.engagement_score)}
                        className="text-xs"
                      >
                        {thread.engagement_score}/10
                      </Badge>
                      <Button variant="ghost" size="sm">
                        View Thread
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {thread.participant_count}
                      </div>
                      <div className="text-xs text-muted-foreground">Participants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {thread.message_count}
                      </div>
                      <div className="text-xs text-muted-foreground">Messages</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${getEngagementColor(thread.engagement_score)}`}>
                        {thread.engagement_score}/10
                      </div>
                      <div className="text-xs text-muted-foreground">Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {formatTimeAgo(thread.last_activity)}
                      </div>
                      <div className="text-xs text-muted-foreground">Last activity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Integration Settings</h3>
            <p className="text-muted-foreground mb-6">
              Configure how the community system integrates with your class management
            </p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Automatic Thread Creation</CardTitle>
                <CardDescription>
                  Automatically create discussion threads when new classes are scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enable auto-creation</div>
                    <div className="text-sm text-muted-foreground">
                      Create threads 24 hours before class starts
                    </div>
                  </div>
                  <Switch
                    checked={settings.auto_create_threads}
                    onCheckedChange={(checked) => updateSetting('auto_create_threads', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Settings</CardTitle>
                <CardDescription>
                  Configure when instructors and students receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Class discussion notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Notify when new messages are posted
                    </div>
                  </div>
                  <Switch
                    checked={settings.notify_on_class_discussion}
                    onCheckedChange={(checked) => updateSetting('notify_on_class_discussion', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Instructor question alerts</div>
                    <div className="text-sm text-muted-foreground">
                      Alert instructors when students ask questions
                    </div>
                  </div>
                  <Switch
                    checked={settings.notify_instructors_on_questions}
                    onCheckedChange={(checked) => updateSetting('notify_instructors_on_questions', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Roster Management</CardTitle>
                <CardDescription>
                  Automatically manage thread membership based on class registrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto-add class roster</div>
                    <div className="text-sm text-muted-foreground">
                      Add registered students to class threads
                    </div>
                  </div>
                  <Switch
                    checked={settings.auto_add_class_roster}
                    onCheckedChange={(checked) => updateSetting('auto_add_class_roster', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Send welcome message</div>
                    <div className="text-sm text-muted-foreground">
                      Send automated welcome when students join
                    </div>
                  </div>
                  <Switch
                    checked={settings.send_welcome_message}
                    onCheckedChange={(checked) => updateSetting('send_welcome_message', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thread Lifecycle</CardTitle>
                <CardDescription>
                  Manage how threads behave before and after classes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Archive after class</div>
                    <div className="text-sm text-muted-foreground">
                      Archive threads 48 hours after class ends
                    </div>
                  </div>
                  <Switch
                    checked={settings.archive_after_class}
                    onCheckedChange={(checked) => updateSetting('archive_after_class', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Engagement tracking</div>
                    <div className="text-sm text-muted-foreground">
                      Track community engagement metrics
                    </div>
                  </div>
                  <Switch
                    checked={settings.engagement_tracking}
                    onCheckedChange={(checked) => updateSetting('engagement_tracking', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Community Analytics</h3>
            <p className="text-muted-foreground">
              Insights into your yoga community engagement and growth
            </p>
          </div>

          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Your community engagement has increased by 23.4% this month! The Morning Hatha Flow and 
              Sunset Vinyasa classes show the highest participation rates.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Performing Classes</CardTitle>
                <CardDescription>Classes with highest community engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {classThreads
                    .sort((a, b) => b.engagement_score - a.engagement_score)
                    .slice(0, 5)
                    .map((thread, index) => (
                      <div key={thread.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{thread.class_name}</div>
                            <div className="text-xs text-muted-foreground">{thread.instructor_name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getEngagementColor(thread.engagement_score)}`}>
                            {thread.engagement_score}/10
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {thread.message_count} messages
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Instructor Activity</CardTitle>
                <CardDescription>Community engagement by instructors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Sarah Kumar', responses: 24, rate: 96 },
                    { name: 'Marcus Thompson', responses: 31, rate: 94 },
                    { name: 'Elena Zimmerman', responses: 18, rate: 92 },
                    { name: 'David Chen', responses: 42, rate: 98 },
                    { name: 'Anna Müller', responses: 19, rate: 90 }
                  ].map((instructor) => (
                    <div key={instructor.name} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{instructor.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {instructor.responses} responses this week
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{instructor.rate}%</div>
                        <div className="text-xs text-muted-foreground">Response rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}