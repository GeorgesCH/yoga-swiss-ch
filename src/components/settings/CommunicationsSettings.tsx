import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Bell, 
  Clock, 
  Volume, 
  VolumeX, 
  Send, 
  Eye, 
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Smartphone,
  Globe
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  type: 'booking_confirmation' | 'cancellation' | 'reminder' | 'welcome' | 'marketing';
  subject: string;
  isActive: boolean;
  lastModified: string;
}

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp';
  isEnabled: boolean;
  provider?: string;
  isConnected: boolean;
}

export function CommunicationsSettings() {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Booking Confirmation',
      type: 'booking_confirmation',
      subject: 'Your yoga class is confirmed!',
      isActive: true,
      lastModified: '2024-01-15'
    },
    {
      id: '2',
      name: 'Class Reminder',
      type: 'reminder',
      subject: 'Your class starts in 2 hours',
      isActive: true,
      lastModified: '2024-01-10'
    },
    {
      id: '3',
      name: 'Welcome Email',
      type: 'welcome',
      subject: 'Welcome to Yoga Zen Zürich!',
      isActive: true,
      lastModified: '2024-01-08'
    },
    {
      id: '4',
      name: 'Cancellation Notice',
      type: 'cancellation',
      subject: 'Class booking cancelled',
      isActive: true,
      lastModified: '2024-01-05'
    }
  ]);

  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'email',
      name: 'Email',
      type: 'email',
      isEnabled: true,
      provider: 'Brevo',
      isConnected: true
    },
    {
      id: 'sms',
      name: 'SMS',
      type: 'sms',
      isEnabled: true,
      provider: 'Twilio',
      isConnected: true
    },
    {
      id: 'push',
      name: 'Push Notifications',
      type: 'push',
      isEnabled: true,
      isConnected: true
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      type: 'whatsapp',
      isEnabled: false,
      provider: 'Meta',
      isConnected: false
    }
  ]);

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      case 'push': return Bell;
      case 'whatsapp': return Smartphone;
      default: return MessageSquare;
    }
  };

  const getTemplateTypeBadge = (type: string) => {
    switch (type) {
      case 'booking_confirmation':
        return <Badge className="bg-green-100 text-green-800">Transactional</Badge>;
      case 'reminder':
        return <Badge className="bg-blue-100 text-blue-800">Automation</Badge>;
      case 'welcome':
        return <Badge className="bg-purple-100 text-purple-800">Onboarding</Badge>;
      case 'marketing':
        return <Badge className="bg-orange-100 text-orange-800">Marketing</Badge>;
      default:
        return <Badge variant="secondary">System</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Communications</h2>
          <p className="text-muted-foreground">
            Manage email templates, notifications, and communication channels
          </p>
        </div>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Test Configuration
        </Button>
      </div>

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {channels.map((channel) => {
              const Icon = getChannelIcon(channel.type);
              return (
                <Card key={channel.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{channel.name}</CardTitle>
                          {channel.provider && (
                            <CardDescription>via {channel.provider}</CardDescription>
                          )}
                        </div>
                      </div>
                      <Switch checked={channel.isEnabled} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Connection Status</span>
                      <div className="flex items-center gap-2">
                        {channel.isConnected ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {channel.isConnected ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                    </div>

                    {channel.type === 'email' && (
                      <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium">Email Settings</div>
                        <div className="text-xs text-blue-700">
                          Sender: noreply@yogazen.ch<br />
                          DKIM: ✓ Configured<br />
                          Daily Limit: 10,000 emails
                        </div>
                      </div>
                    )}

                    {channel.type === 'sms' && (
                      <div className="space-y-2 p-3 bg-green-50 rounded-lg">
                        <div className="text-sm font-medium">SMS Settings</div>
                        <div className="text-xs text-green-700">
                          Sender ID: YOGAZEN<br />
                          Rate: CHF 0.08 per SMS<br />
                          Credits: 2,450 remaining
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      {!channel.isConnected && (
                        <Button size="sm" className="flex-1">
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize automated email communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">{template.subject}</p>
                        </div>
                        {getTemplateTypeBadge(template.type)}
                        {template.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="outline">Disabled</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Last modified: {template.lastModified}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Switch checked={template.isActive} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
              <CardDescription>Available variables for personalizing emails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  '{{customer.first_name}}',
                  '{{customer.last_name}}',
                  '{{class.name}}',
                  '{{class.date}}',
                  '{{class.time}}',
                  '{{class.instructor}}',
                  '{{location.name}}',
                  '{{location.address}}',
                  '{{studio.name}}',
                  '{{booking.confirmation_number}}',
                  '{{booking.total_amount}}',
                  '{{unsubscribe_link}}'
                ].map((variable) => (
                  <div key={variable} className="p-2 bg-muted rounded text-sm font-mono">
                    {variable}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>Configure when and how customers receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Booking Notifications</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Booking Confirmation', description: 'Sent immediately after booking', channels: ['email', 'sms'] },
                    { name: 'Class Reminder', description: '2 hours before class starts', channels: ['email', 'push'] },
                    { name: 'Cancellation Confirmation', description: 'When customer cancels booking', channels: ['email'] },
                    { name: 'Waitlist Promotion', description: 'When moved from waitlist to confirmed', channels: ['email', 'sms', 'push'] }
                  ].map((notification) => (
                    <div key={notification.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{notification.name}</p>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                          {notification.channels.map((channel) => {
                            const Icon = getChannelIcon(channel);
                            return (
                              <div key={channel} className="p-1 bg-muted rounded">
                                <Icon className="h-3 w-3" />
                              </div>
                            );
                          })}
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Marketing Notifications</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Weekly Class Schedule', description: 'Send upcoming class schedule every Sunday', channels: ['email'] },
                    { name: 'New Class Announcements', description: 'Notify about new classes and workshops', channels: ['email', 'push'] },
                    { name: 'Special Offers', description: 'Promotional campaigns and discounts', channels: ['email'] }
                  ].map((notification) => (
                    <div key={notification.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{notification.name}</p>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                          {notification.channels.map((channel) => {
                            const Icon = getChannelIcon(channel);
                            return (
                              <div key={channel} className="p-1 bg-muted rounded">
                                <Icon className="h-3 w-3" />
                              </div>
                            );
                          })}
                        </div>
                        <Switch />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Preferences</CardTitle>
              <CardDescription>General settings for all communications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Sending Behavior</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quiet-hours-start">Quiet Hours Start</Label>
                    <Input type="time" id="quiet-hours-start" defaultValue="22:00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quiet-hours-end">Quiet Hours End</Label>
                    <Input type="time" id="quiet-hours-end" defaultValue="08:00" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Non-urgent communications will not be sent during quiet hours
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Unsubscribe Settings</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow One-Click Unsubscribe</Label>
                    <p className="text-sm text-muted-foreground">Include unsubscribe links in all emails</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Granular Unsubscribe Options</Label>
                    <p className="text-sm text-muted-foreground">Let customers choose which email types to receive</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Frequency Limits</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marketing-frequency">Marketing Emails per Week</Label>
                    <Select defaultValue="2">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 email</SelectItem>
                        <SelectItem value="2">2 emails</SelectItem>
                        <SelectItem value="3">3 emails</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sms-frequency">SMS per Day</Label>
                    <Select defaultValue="3">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 SMS</SelectItem>
                        <SelectItem value="3">3 SMS</SelectItem>
                        <SelectItem value="5">5 SMS</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Reply Handling</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="reply-to">Reply-To Address</Label>
                    <Input id="reply-to" defaultValue="support@yogazen.ch" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-Reply to Customer Emails</Label>
                      <p className="text-sm text-muted-foreground">Send automatic acknowledgment of received emails</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>BCC to Studio Email</Label>
                      <p className="text-sm text-muted-foreground">Copy all outgoing emails to studio inbox</p>
                    </div>
                    <Switch />
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