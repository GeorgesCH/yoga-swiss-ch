import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Plus,
  Mail,
  Timer,
  GitBranch,
  Users,
  Calendar,
  Zap,
  Settings,
  Play,
  Pause,
  Save,
  Eye,
  Trash2,
  Copy,
  ArrowDown,
  ArrowRight,
  Clock,
  Target,
  Filter,
  Bell,
  Gift,
  DollarSign,
  Heart,
  MessageSquare,
  Phone,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface JourneyBuilderProps {
  journeyId: string;
}

interface JourneyStep {
  id: string;
  type: 'trigger' | 'delay' | 'email' | 'sms' | 'condition' | 'action' | 'goal';
  name: string;
  description?: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: string[];
}

export function JourneyBuilder({ journeyId }: JourneyBuilderProps) {
  const [activeTab, setActiveTab] = useState('canvas');
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [showAddStepDialog, setShowAddStepDialog] = useState(false);
  const [journeyStatus, setJourneyStatus] = useState('Draft');

  // Mock journey data
  const [journeyData, setJourneyData] = useState({
    id: journeyId,
    name: journeyId === 'new' ? 'New Journey' : 'New Student Onboarding',
    description: 'Welcome sequence for first-time visitors and trial class attendees',
    isActive: journeyId !== 'new',
    stats: {
      enrolled: 156,
      active: 89,
      completed: 67,
      conversionRate: 42.9,
      avgTime: '5.2 days',
      revenue: 6700
    },
    steps: [
      {
        id: 'trigger-1',
        type: 'trigger' as const,
        name: 'Trial Class Booking',
        description: 'Customer books their first trial class',
        config: {
          triggerType: 'event',
          event: 'class_booking',
          conditions: {
            classType: 'trial',
            isFirstBooking: true
          }
        },
        position: { x: 100, y: 100 },
        connections: ['delay-1']
      },
      {
        id: 'delay-1',
        type: 'delay' as const,
        name: 'Wait 1 Hour',
        description: 'Let the customer settle before first contact',
        config: {
          duration: 1,
          unit: 'hours'
        },
        position: { x: 100, y: 200 },
        connections: ['email-1']
      },
      {
        id: 'email-1',
        type: 'email' as const,
        name: 'Welcome Email',
        description: 'Introduction and what to expect',
        config: {
          template: 'welcome-trial',
          subject: 'Welcome to YogaSwiss! Your trial class is confirmed 🧘‍♀️',
          fromName: 'YogaSwiss Team',
          fromEmail: 'hello@yogaswiss.ch'
        },
        position: { x: 100, y: 300 },
        connections: ['delay-2']
      },
      {
        id: 'delay-2',
        type: 'delay' as const,
        name: 'Wait 1 Day',
        description: 'Give time for class attendance',
        config: {
          duration: 1,
          unit: 'days'
        },
        position: { x: 100, y: 400 },
        connections: ['condition-1']
      },
      {
        id: 'condition-1',
        type: 'condition' as const,
        name: 'Attended Trial?',
        description: 'Check if customer attended their trial class',
        config: {
          conditionType: 'event_occurred',
          event: 'class_attendance',
          timeframe: '24_hours'
        },
        position: { x: 100, y: 500 },
        connections: ['email-2', 'email-3']
      },
      {
        id: 'email-2',
        type: 'email' as const,
        name: 'Post-Class Follow-up',
        description: 'For students who attended',
        config: {
          template: 'post-trial-attended',
          subject: 'How was your first yoga class? 🌟',
          condition: 'attended'
        },
        position: { x: 50, y: 600 },
        connections: ['delay-3']
      },
      {
        id: 'email-3',
        type: 'email' as const,
        name: 'Missed Class Follow-up',
        description: 'For students who didn\'t attend',
        config: {
          template: 'trial-no-show',
          subject: 'We missed you! Let\'s reschedule your trial class',
          condition: 'not_attended'
        },
        position: { x: 150, y: 600 },
        connections: ['delay-4']
      },
      {
        id: 'delay-3',
        type: 'delay' as const,
        name: 'Wait 2 Days',
        config: { duration: 2, unit: 'days' },
        position: { x: 50, y: 700 },
        connections: ['email-4']
      },
      {
        id: 'delay-4',
        type: 'delay' as const,
        name: 'Wait 1 Day',
        config: { duration: 1, unit: 'days' },
        position: { x: 150, y: 700 },
        connections: ['email-4']
      },
      {
        id: 'email-4',
        type: 'email' as const,
        name: 'Package Offer',
        description: 'Special pricing for starter package',
        config: {
          template: 'starter-package-offer',
          subject: 'Special offer: 5 classes for just CHF 89!'
        },
        position: { x: 100, y: 800 },
        connections: ['goal-1']
      },
      {
        id: 'goal-1',
        type: 'goal' as const,
        name: 'Package Purchase',
        description: 'Customer purchases a class package',
        config: {
          goalType: 'purchase',
          productId: 'starter-package',
          value: 89
        },
        position: { x: 100, y: 900 },
        connections: []
      }
    ] as JourneyStep[]
  });

  const stepTypes = [
    {
      type: 'trigger',
      name: 'Trigger',
      description: 'Start the journey when something happens',
      icon: <Zap className="h-5 w-5" />,
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    },
    {
      type: 'delay',
      name: 'Wait',
      description: 'Add a time delay',
      icon: <Timer className="h-5 w-5" />,
      color: 'bg-gray-50 border-gray-200 text-gray-700'
    },
    {
      type: 'email',
      name: 'Send Email',
      description: 'Send an email message',
      icon: <Mail className="h-5 w-5" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    {
      type: 'sms',
      name: 'Send SMS',
      description: 'Send a text message',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      type: 'condition',
      name: 'If/Then',
      description: 'Branch based on conditions',
      icon: <GitBranch className="h-5 w-5" />,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-700'
    },
    {
      type: 'action',
      name: 'Action',
      description: 'Perform an action',
      icon: <Target className="h-5 w-5" />,
      color: 'bg-orange-50 border-orange-200 text-orange-700'
    },
    {
      type: 'goal',
      name: 'Goal',
      description: 'Track conversions',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700'
    }
  ];

  const getStepTypeConfig = (type: string) => {
    return stepTypes.find(st => st.type === type) || stepTypes[0];
  };

  const addStep = (type: string, afterStepId?: string) => {
    const newStep: JourneyStep = {
      id: `${type}-${Date.now()}`,
      type: type as any,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      config: {},
      position: { x: 100, y: 100 },
      connections: []
    };

    if (afterStepId) {
      const afterStep = journeyData.steps.find(s => s.id === afterStepId);
      if (afterStep) {
        newStep.position = { 
          x: afterStep.position.x, 
          y: afterStep.position.y + 100 
        };
        // Update connections
        afterStep.connections.push(newStep.id);
      }
    }

    setJourneyData({
      ...journeyData,
      steps: [...journeyData.steps, newStep]
    });
    setSelectedStep(newStep.id);
    setShowAddStepDialog(false);
  };

  const removeStep = (stepId: string) => {
    setJourneyData({
      ...journeyData,
      steps: journeyData.steps.filter(s => s.id !== stepId)
    });
    if (selectedStep === stepId) {
      setSelectedStep(null);
    }
  };

  const duplicateStep = (stepId: string) => {
    const step = journeyData.steps.find(s => s.id === stepId);
    if (step) {
      const newStep = {
        ...step,
        id: `${step.type}-${Date.now()}`,
        name: `${step.name} (Copy)`,
        position: { x: step.position.x + 50, y: step.position.y + 50 },
        connections: []
      };
      setJourneyData({
        ...journeyData,
        steps: [...journeyData.steps, newStep]
      });
    }
  };

  const renderStepSettings = () => {
    const step = journeyData.steps.find(s => s.id === selectedStep);
    if (!step) return null;

    switch (step.type) {
      case 'trigger':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select defaultValue={step.config.triggerType || 'event'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Event occurs</SelectItem>
                  <SelectItem value="schedule">Date/Time</SelectItem>
                  <SelectItem value="segment">Segment entry</SelectItem>
                  <SelectItem value="tag">Tag added</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {step.config.triggerType === 'event' && (
              <>
                <div className="space-y-2">
                  <Label>Event</Label>
                  <Select defaultValue={step.config.event}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class_booking">Class Booking</SelectItem>
                      <SelectItem value="membership_purchase">Membership Purchase</SelectItem>
                      <SelectItem value="class_attendance">Class Attendance</SelectItem>
                      <SelectItem value="profile_created">Profile Created</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Additional Conditions</Label>
                  <div className="space-y-2 p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="first-time" />
                      <Label htmlFor="first-time">First time only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="trial-class" />
                      <Label htmlFor="trial-class">Trial classes only</Label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input 
                  type="number" 
                  defaultValue={step.config.duration || 1}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select defaultValue={step.config.unit || 'hours'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Smart Timing</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="optimal-time" />
                  <Label htmlFor="optimal-time">Send at optimal time for recipient</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="business-hours" />
                  <Label htmlFor="business-hours">Only during business hours</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Template</Label>
              <Select defaultValue={step.config.template}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome-trial">Welcome - Trial</SelectItem>
                  <SelectItem value="welcome-member">Welcome - Member</SelectItem>
                  <SelectItem value="post-trial-attended">Post Trial - Attended</SelectItem>
                  <SelectItem value="trial-no-show">Trial No-Show</SelectItem>
                  <SelectItem value="starter-package-offer">Starter Package Offer</SelectItem>
                  <SelectItem value="membership-renewal">Membership Renewal</SelectItem>
                  <SelectItem value="win-back">Win-Back Campaign</SelectItem>
                  <SelectItem value="birthday-wishes">Birthday Wishes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input 
                defaultValue={step.config.subject}
                placeholder="Enter subject line"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>From Name</Label>
                <Input defaultValue={step.config.fromName || 'YogaSwiss Team'} />
              </div>
              <div className="space-y-2">
                <Label>From Email</Label>
                <Input defaultValue={step.config.fromEmail || 'hello@yogaswiss.ch'} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Track Opens</Label>
                <Switch defaultChecked />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Track Clicks</Label>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Condition Type</Label>
              <Select defaultValue={step.config.conditionType || 'event_occurred'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event_occurred">Event occurred</SelectItem>
                  <SelectItem value="tag_has">Has tag</SelectItem>
                  <SelectItem value="field_equals">Field equals</SelectItem>
                  <SelectItem value="date_passed">Date passed</SelectItem>
                  <SelectItem value="email_opened">Email opened</SelectItem>
                  <SelectItem value="email_clicked">Email clicked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {step.config.conditionType === 'event_occurred' && (
              <div className="space-y-2">
                <Label>Event</Label>
                <Select defaultValue={step.config.event}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class_attendance">Class Attendance</SelectItem>
                    <SelectItem value="membership_purchase">Membership Purchase</SelectItem>
                    <SelectItem value="package_purchase">Package Purchase</SelectItem>
                    <SelectItem value="email_opened">Email Opened</SelectItem>
                    <SelectItem value="link_clicked">Link Clicked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select defaultValue={step.config.timeframe || '24_hours'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_hour">Within 1 hour</SelectItem>
                  <SelectItem value="24_hours">Within 24 hours</SelectItem>
                  <SelectItem value="3_days">Within 3 days</SelectItem>
                  <SelectItem value="7_days">Within 7 days</SelectItem>
                  <SelectItem value="30_days">Within 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'goal':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Goal Type</Label>
              <Select defaultValue={step.config.goalType || 'purchase'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="booking">Class Booking</SelectItem>
                  <SelectItem value="signup">Newsletter Signup</SelectItem>
                  <SelectItem value="engagement">Email Engagement</SelectItem>
                  <SelectItem value="custom">Custom Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {step.config.goalType === 'purchase' && (
              <>
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select defaultValue={step.config.productId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter-package">Starter Package</SelectItem>
                      <SelectItem value="monthly-unlimited">Monthly Unlimited</SelectItem>
                      <SelectItem value="annual-membership">Annual Membership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Goal Value (CHF)</Label>
                  <Input 
                    type="number" 
                    defaultValue={step.config.value || 0}
                    placeholder="0.00"
                  />
                </div>
              </>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Step Name</Label>
              <Input defaultValue={step.name} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea defaultValue={step.description} rows={3} />
            </div>
          </div>
        );
    }
  };

  const renderJourneyCanvas = () => (
    <div className="space-y-4">
      {/* Canvas Toolbar */}
      <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showAddStepDialog} onOpenChange={setShowAddStepDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Journey Step</DialogTitle>
                <DialogDescription>
                  Choose the type of step to add to your journey
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stepTypes.map((stepType) => (
                  <Button
                    key={stepType.type}
                    variant="outline"
                    className={`h-20 flex-col gap-2 p-4 ${stepType.color}`}
                    onClick={() => addStep(stepType.type)}
                  >
                    {stepType.icon}
                    <div className="text-center">
                      <div className="font-medium">{stepType.name}</div>
                      <div className="text-xs opacity-70">{stepType.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Journey Canvas */}
      <Card className="min-h-[600px]">
        <CardContent className="p-6">
          <div className="space-y-6">
            {journeyData.steps.map((step, index) => {
              const stepConfig = getStepTypeConfig(step.type);
              
              return (
                <div key={step.id} className="space-y-4">
                  {/* Step Card */}
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedStep === step.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedStep(step.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg border ${stepConfig.color}`}>
                          {stepConfig.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{step.name}</h4>
                              {step.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {step.description}
                                </p>
                              )}
                              <Badge variant="outline" className="text-xs mt-2">
                                {stepConfig.name}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateStep(step.id);
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              {step.type !== 'trigger' && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeStep(step.id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Connection Arrow */}
                  {index < journeyData.steps.length - 1 && (
                    <div className="flex justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <ArrowDown className="h-4 w-4 text-muted-foreground" />
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => setShowAddStepDialog(true)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Step
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{journeyData.name}</h3>
          <p className="text-muted-foreground">{journeyData.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant={journeyStatus === 'Active' ? 'default' : 'secondary'}
            className="text-sm"
          >
            {journeyStatus === 'Active' ? (
              <Play className="h-3 w-3 mr-1" />
            ) : (
              <Pause className="h-3 w-3 mr-1" />
            )}
            {journeyStatus}
          </Badge>
          
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          {journeyStatus === 'Draft' ? (
            <Button size="sm" onClick={() => setJourneyStatus('Active')}>
              <Play className="h-4 w-4 mr-2" />
              Activate
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setJourneyStatus('Paused')}>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
        </div>
      </div>

      {/* Performance Stats */}
      {journeyData.isActive && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{journeyData.stats.enrolled}</div>
              <div className="text-xs text-muted-foreground">Enrolled</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{journeyData.stats.active}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{journeyData.stats.completed}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{journeyData.stats.conversionRate}%</div>
              <div className="text-xs text-muted-foreground">Goal Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{journeyData.stats.avgTime}</div>
              <div className="text-xs text-muted-foreground">Avg Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">CHF {journeyData.stats.revenue}</div>
              <div className="text-xs text-muted-foreground">Revenue</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Journey Canvas */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="canvas">Canvas</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
            </TabsList>

            <TabsContent value="canvas">
              {renderJourneyCanvas()}
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="font-medium mb-2">Journey Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    Detailed analytics will appear here once the journey is active
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="testing">
              <Card>
                <CardContent className="p-6 text-center">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="font-medium mb-2">A/B Testing</h4>
                  <p className="text-sm text-muted-foreground">
                    Set up A/B tests for different journey variations
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          {selectedStep ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {journeyData.steps.find(s => s.id === selectedStep)?.name}
                </CardTitle>
                <CardDescription>
                  Configure this step's settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderStepSettings()}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">Select a Step</h4>
                <p className="text-sm text-muted-foreground">
                  Click on any step to configure its settings
                </p>
              </CardContent>
            </Card>
          )}

          {/* Journey Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Journey Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Journey Name</Label>
                <Input defaultValue={journeyData.name} />
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea defaultValue={journeyData.description} rows={3} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Send emails immediately</Label>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Respect unsubscribes</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}