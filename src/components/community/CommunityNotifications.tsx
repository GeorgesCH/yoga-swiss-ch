import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Bell, 
  MessageSquare, 
  Calendar, 
  Users, 
  Clock, 
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Heart,
  BookOpen,
  UserPlus,
  MessageCircle,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Monitor,
  Star,
  Flag,
  Zap,
  Target
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'message' | 'class' | 'community' | 'system' | 'engagement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  source: string;
  avatar_url?: string;
  metadata?: {
    class_id?: string;
    thread_id?: string;
    user_id?: string;
    action_url?: string;
  };
}

interface NotificationSettings {
  in_app: boolean;
  email: boolean;
  push: boolean;
  sound: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  notification_types: {
    new_messages: boolean;
    class_reminders: boolean;
    community_updates: boolean;
    instructor_responses: boolean;
    engagement_milestones: boolean;
    system_alerts: boolean;
  };
}

export function CommunityNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>({
    in_app: true,
    email: true,
    push: true,
    sound: true,
    quiet_hours_enabled: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
    notification_types: {
      new_messages: true,
      class_reminders: true,
      community_updates: true,
      instructor_responses: true,
      engagement_milestones: true,
      system_alerts: true
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    loadNotificationSettings();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Demo notifications for yoga studio community
      const demoNotifications: Notification[] = [
        {
          id: 'notif-1',
          type: 'message',
          priority: 'medium',
          title: 'New message in Morning Hatha Flow',
          message: 'Sarah Kumar replied to your question about proper breathing techniques',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          read: false,
          actionable: true,
          source: 'community',
          avatar_url: null,
          metadata: {
            thread_id: 'thread-hatha-discussion',
            user_id: 'instructor-sarah'
          }
        },
        {
          id: 'notif-2',
          type: 'class',
          priority: 'high',
          title: 'Class starting in 30 minutes',
          message: 'Your Sunset Vinyasa class with Marcus Thompson begins at 6:30 PM',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          read: false,
          actionable: true,
          source: 'scheduling',
          avatar_url: null,
          metadata: {
            class_id: 'class-vinyasa-sunset'
          }
        },
        {
          id: 'notif-3',
          type: 'community',
          priority: 'low',
          title: 'Welcome new community member!',
          message: 'Emma joined the Alpine Yoga Retreat discussion. Say hello! 👋',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          read: true,
          actionable: true,
          source: 'community',
          avatar_url: null,
          metadata: {
            thread_id: 'thread-retreat-discussion',
            user_id: 'student-emma'
          }
        },
        {
          id: 'notif-4',
          type: 'engagement',
          priority: 'medium',
          title: 'Community milestone reached! 🎉',
          message: 'Your Power Morning class discussion reached 100 messages this week!',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          actionable: false,
          source: 'analytics',
          avatar_url: null,
          metadata: {
            thread_id: 'thread-power-discussion'
          }
        },
        {
          id: 'notif-5',
          type: 'message',
          priority: 'low',
          title: 'Question in Prenatal Gentle Yoga',
          message: 'A student asked about modifications for the third trimester',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: true,
          actionable: true,
          source: 'community',
          avatar_url: null,
          metadata: {
            thread_id: 'thread-prenatal-discussion'
          }
        },
        {
          id: 'notif-6',
          type: 'system',
          priority: 'low',
          title: 'Weekly community report ready',
          message: 'Your community engagement report for this week is now available',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          read: true,
          actionable: true,
          source: 'system',
          avatar_url: null,
          metadata: {
            action_url: '/analytics/community'
          }
        }
      ];

      setNotifications(demoNotifications);
      setUnreadCount(demoNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      // Settings would be loaded from backend
      console.log('Loading notification settings...');
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const updateNotificationSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNotificationType = (type: keyof NotificationSettings['notification_types'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notification_types: {
        ...prev.notification_types,
        [type]: value
      }
    }));
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === 'urgent' ? 'text-red-600' : 
                     priority === 'high' ? 'text-orange-600' :
                     priority === 'medium' ? 'text-blue-600' : 'text-gray-600';

    switch (type) {
      case 'message':
        return <MessageSquare className={`h-5 w-5 ${iconClass}`} />;
      case 'class':
        return <Calendar className={`h-5 w-5 ${iconClass}`} />;
      case 'community':
        return <Users className={`h-5 w-5 ${iconClass}`} />;
      case 'engagement':
        return <Heart className={`h-5 w-5 ${iconClass}`} />;
      case 'system':
        return <Settings className={`h-5 w-5 ${iconClass}`} />;
      default:
        return <Bell className={`h-5 w-5 ${iconClass}`} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
      case 'high':
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-xs">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs opacity-60">Low</Badge>;
      default:
        return null;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notifications...</p>
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
            <Bell className="h-7 w-7 text-primary" />
            Community Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground mt-1">
            Stay connected with your yoga community
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Notification Tabs */}
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs ml-1">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Notification Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground text-center">
                  You're all caught up! When community activity happens, you'll see it here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedNotifications).map(([date, dayNotifications]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>
                  <div className="space-y-2">
                    {dayNotifications.map((notification) => (
                      <Card 
                        key={notification.id} 
                        className={`transition-all hover:shadow-sm cursor-pointer ${
                          !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                        }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getNotificationIcon(notification.type, notification.priority)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                                  {notification.title}
                                </h4>
                                {getPriorityBadge(notification.priority)}
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTimeAgo(notification.timestamp)}</span>
                                  <span>•</span>
                                  <span className="capitalize">{notification.source}</span>
                                </div>
                                {notification.actionable && (
                                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                                    View
                                  </Button>
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Notification Preferences</h3>
            <p className="text-muted-foreground">
              Choose how you want to receive notifications from your yoga community
            </p>
          </div>

          <div className="grid gap-6">
            {/* Delivery Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Delivery Methods
                </CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">In-app notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Show notifications in the YogaSwiss app
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.in_app}
                    onCheckedChange={(checked) => updateNotificationSetting('in_app', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">Email notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Send notifications to your email address
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.email}
                    onCheckedChange={(checked) => updateNotificationSetting('email', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-purple-600" />
                    <div>
                      <div className="font-medium">Push notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Send push notifications to your device
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.push}
                    onCheckedChange={(checked) => updateNotificationSetting('push', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {settings.sound ? (
                      <Volume2 className="h-4 w-4 text-orange-600" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-gray-600" />
                    )}
                    <div>
                      <div className="font-medium">Sound notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Play sound when notifications arrive
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.sound}
                    onCheckedChange={(checked) => updateNotificationSetting('sound', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Notification Types
                </CardTitle>
                <CardDescription>
                  Control which types of notifications you receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">New messages</div>
                      <div className="text-sm text-muted-foreground">
                        When someone replies in your class discussions
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notification_types.new_messages}
                    onCheckedChange={(checked) => updateNotificationType('new_messages', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">Class reminders</div>
                      <div className="text-sm text-muted-foreground">
                        Reminders about upcoming yoga classes
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notification_types.class_reminders}
                    onCheckedChange={(checked) => updateNotificationType('class_reminders', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-purple-600" />
                    <div>
                      <div className="font-medium">Community updates</div>
                      <div className="text-sm text-muted-foreground">
                        New members, community events, and announcements
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notification_types.community_updates}
                    onCheckedChange={(checked) => updateNotificationType('community_updates', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-orange-600" />
                    <div>
                      <div className="font-medium">Instructor responses</div>
                      <div className="text-sm text-muted-foreground">
                        When instructors answer your questions
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notification_types.instructor_responses}
                    onCheckedChange={(checked) => updateNotificationType('instructor_responses', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-yellow-600" />
                    <div>
                      <div className="font-medium">Engagement milestones</div>
                      <div className="text-sm text-muted-foreground">
                        Community achievements and participation goals
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notification_types.engagement_milestones}
                    onCheckedChange={(checked) => updateNotificationType('engagement_milestones', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-red-600" />
                    <div>
                      <div className="font-medium">System alerts</div>
                      <div className="text-sm text-muted-foreground">
                        Important system updates and maintenance notices
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notification_types.system_alerts}
                    onCheckedChange={(checked) => updateNotificationType('system_alerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quiet Hours
                </CardTitle>
                <CardDescription>
                  Set quiet hours to reduce notifications during specific times
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enable quiet hours</div>
                    <div className="text-sm text-muted-foreground">
                      Reduce notifications during your specified hours
                    </div>
                  </div>
                  <Switch
                    checked={settings.quiet_hours_enabled}
                    onCheckedChange={(checked) => updateNotificationSetting('quiet_hours_enabled', checked)}
                  />
                </div>
                {settings.quiet_hours_enabled && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-sm font-medium">Start time</label>
                      <input
                        type="time"
                        value={settings.quiet_hours_start}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          quiet_hours_start: e.target.value
                        }))}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End time</label>
                      <input
                        type="time"
                        value={settings.quiet_hours_end}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          quiet_hours_end: e.target.value
                        }))}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline">Reset to Defaults</Button>
            <Button>Save Settings</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}