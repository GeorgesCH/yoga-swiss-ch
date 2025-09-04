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
import { 
  Plus,
  ArrowDown,
  Settings,
  Eye,
  Save,
  Play,
  Pause,
  Copy,
  Trash2,
  FileText,
  CreditCard,
  Gift,
  ThumbsUp,
  MousePointer,
  Smartphone,
  Monitor,
  BarChart3
} from 'lucide-react';

interface FunnelBuilderProps {
  funnelId: string;
}

interface FunnelStep {
  id: string;
  type: 'optin' | 'sales' | 'checkout' | 'upsell' | 'downsell' | 'thankyou';
  name: string;
  description: string;
  pageUrl: string;
  settings: Record<string, any>;
  performance: {
    views: number;
    conversions: number;
    conversionRate: number;
  };
}

export function FunnelBuilder({ funnelId }: FunnelBuilderProps) {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Mock funnel data
  const [funnelData, setFunnelData] = useState({
    id: funnelId,
    name: 'New Student Onboarding',
    status: 'Active',
    steps: [
      {
        id: '1',
        type: 'optin' as const,
        name: 'Free Class Signup',
        description: 'Capture leads with free trial class offer',
        pageUrl: '/funnel/new-student/optin',
        settings: {
          headline: 'Get Your First Yoga Class Free',
          subheadline: 'Join thousands who started their yoga journey with us',
          buttonText: 'Claim Free Class',
          doubleOptIn: true,
          requiredFields: ['email', 'firstName'],
          optionalFields: ['phone']
        },
        performance: {
          views: 1234,
          conversions: 456,
          conversionRate: 37.0
        }
      },
      {
        id: '2',
        type: 'sales' as const,
        name: 'Class Package Offer',
        description: 'Present starter package with discount',
        pageUrl: '/funnel/new-student/offer',
        settings: {
          headline: 'Special Offer: 5-Class Package for Just CHF 89',
          product: 'starter-package',
          originalPrice: 150,
          discountPrice: 89,
          countdown: true,
          testimonials: true,
          guarantee: '30-day money back'
        },
        performance: {
          views: 456,
          conversions: 123,
          conversionRate: 27.0
        }
      },
      {
        id: '3',
        type: 'checkout' as const,
        name: 'Payment & Registration',
        description: 'Secure checkout with order bump',
        pageUrl: '/funnel/new-student/checkout',
        settings: {
          orderBump: {
            enabled: true,
            product: 'yoga-mat',
            price: 35,
            title: 'Add Premium Yoga Mat for CHF 35'
          },
          paymentMethods: ['card', 'twint', 'paypal'],
          requiredFields: ['email', 'firstName', 'lastName', 'phone']
        },
        performance: {
          views: 123,
          conversions: 89,
          conversionRate: 72.4
        }
      },
      {
        id: '4',
        type: 'upsell' as const,
        name: '1-Month Unlimited Pass',
        description: 'One-click upsell to unlimited monthly pass',
        pageUrl: '/funnel/new-student/upsell',
        settings: {
          headline: 'Upgrade to Unlimited Classes This Month',
          product: 'monthly-unlimited',
          price: 120,
          discountPrice: 99,
          oneClick: true,
          countdown: true,
          timer: 600 // 10 minutes
        },
        performance: {
          views: 89,
          conversions: 23,
          conversionRate: 25.8
        }
      },
      {
        id: '5',
        type: 'thankyou' as const,
        name: 'Welcome & Next Steps',
        description: 'Confirmation and onboarding instructions',
        pageUrl: '/funnel/new-student/welcome',
        settings: {
          headline: 'Welcome to YogaSwiss! 🧘‍♀️',
          nextSteps: [
            'Check your email for booking instructions',
            'Download our mobile app',
            'Join our community Facebook group'
          ],
          referralCTA: true,
          calendarIntegration: true
        },
        performance: {
          views: 89,
          conversions: 89,
          conversionRate: 100
        }
      }
    ] as FunnelStep[]
  });

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'optin': return <FileText className="h-5 w-5" />;
      case 'sales': return <MousePointer className="h-5 w-5" />;
      case 'checkout': return <CreditCard className="h-5 w-5" />;
      case 'upsell': return <Gift className="h-5 w-5" />;
      case 'downsell': return <Gift className="h-5 w-5" />;
      case 'thankyou': return <ThumbsUp className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'optin': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'sales': return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'checkout': return 'bg-green-50 border-green-200 text-green-700';
      case 'upsell': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'downsell': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'thankyou': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const handleAddStep = (afterStepId: string, stepType: string) => {
    const newStep: FunnelStep = {
      id: `${Date.now()}`,
      type: stepType as any,
      name: `New ${stepType.charAt(0).toUpperCase() + stepType.slice(1)} Step`,
      description: `Configure your ${stepType} step`,
      pageUrl: `/funnel/${funnelId}/${stepType}-${Date.now()}`,
      settings: {},
      performance: {
        views: 0,
        conversions: 0,
        conversionRate: 0
      }
    };

    const stepIndex = funnelData.steps.findIndex(s => s.id === afterStepId);
    const newSteps = [...funnelData.steps];
    newSteps.splice(stepIndex + 1, 0, newStep);
    
    setFunnelData({ ...funnelData, steps: newSteps });
    setSelectedStep(newStep.id);
  };

  const renderStepSettings = (step: FunnelStep) => {
    switch (step.type) {
      case 'optin':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Headline</Label>
              <Input value={step.settings.headline || ''} placeholder="Enter your compelling headline" />
            </div>
            <div className="space-y-2">
              <Label>Subheadline</Label>
              <Input value={step.settings.subheadline || ''} placeholder="Supporting text" />
            </div>
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input value={step.settings.buttonText || 'Get Started'} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Double Opt-in</Label>
              <Switch checked={step.settings.doubleOptIn || false} />
            </div>
            <div className="space-y-2">
              <Label>Required Fields</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose required fields" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email only</SelectItem>
                  <SelectItem value="email-name">Email + Name</SelectItem>
                  <SelectItem value="email-name-phone">Email + Name + Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'sales':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Headline</Label>
              <Input value={step.settings.headline || ''} placeholder="Your sales headline" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Original Price (CHF)</Label>
                <Input type="number" value={step.settings.originalPrice || ''} />
              </div>
              <div className="space-y-2">
                <Label>Sale Price (CHF)</Label>
                <Input type="number" value={step.settings.discountPrice || ''} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Countdown Timer</Label>
              <Switch checked={step.settings.countdown || false} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Testimonials</Label>
              <Switch checked={step.settings.testimonials || false} />
            </div>
            <div className="space-y-2">
              <Label>Money-back Guarantee</Label>
              <Input value={step.settings.guarantee || ''} placeholder="e.g., 30-day money back" />
            </div>
          </div>
        );

      case 'checkout':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Order Bump</Label>
              <div className="space-y-2 p-3 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label>Enable Order Bump</Label>
                  <Switch checked={step.settings.orderBump?.enabled || false} />
                </div>
                {step.settings.orderBump?.enabled && (
                  <>
                    <Input placeholder="Order bump title" value={step.settings.orderBump?.title || ''} />
                    <Input type="number" placeholder="Price (CHF)" value={step.settings.orderBump?.price || ''} />
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Methods</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="card" defaultChecked />
                  <Label htmlFor="card">Credit/Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="twint" defaultChecked />
                  <Label htmlFor="twint">TWINT</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="paypal" />
                  <Label htmlFor="paypal">PayPal</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'upsell':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Upsell Headline</Label>
              <Input value={step.settings.headline || ''} placeholder="Your upsell offer headline" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Regular Price (CHF)</Label>
                <Input type="number" value={step.settings.price || ''} />
              </div>
              <div className="space-y-2">
                <Label>Upsell Price (CHF)</Label>
                <Input type="number" value={step.settings.discountPrice || ''} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>One-Click Purchase</Label>
              <Switch checked={step.settings.oneClick || false} />
            </div>
            <div className="space-y-2">
              <Label>Timer Duration (seconds)</Label>
              <Input type="number" value={step.settings.timer || 600} placeholder="600" />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Page Title</Label>
              <Input value={step.name} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={step.description} rows={3} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{funnelData.name}</h3>
          <p className="text-muted-foreground">
            Configure your funnel steps and optimize conversions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Steps */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">Funnel Steps</h4>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewDevice(previewDevice === 'desktop' ? 'mobile' : 'desktop')}
              >
                {previewDevice === 'desktop' ? (
                  <Smartphone className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {funnelData.steps.map((step, index) => (
              <div key={step.id} className="space-y-3">
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedStep === step.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedStep(step.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg border ${getStepColor(step.type)}`}>
                        {getStepIcon(step.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium truncate">{step.name}</h5>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{step.performance.views} views</span>
                              <span>{step.performance.conversions} conversions</span>
                              <span className="font-medium text-green-600">
                                {step.performance.conversionRate.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Step {index + 1}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Add Step Button */}
                {index < funnelData.steps.length - 1 && (
                  <div className="flex justify-center">
                    <div className="relative">
                      <ArrowDown className="h-4 w-4 text-muted-foreground" />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute -right-16 -top-2 text-xs"
                        onClick={() => {
                          // Show step type selector
                          handleAddStep(step.id, 'sales');
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Step
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Settings Panel */}
        <div className="space-y-4">
          {selectedStep ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {funnelData.steps.find(s => s.id === selectedStep)?.name}
                </CardTitle>
                <CardDescription>
                  Configure this step's settings and content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="settings" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="settings" className="space-y-4">
                    {renderStepSettings(funnelData.steps.find(s => s.id === selectedStep)!)}
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="text-center p-4 border border-border rounded-lg">
                        <div className="text-2xl font-bold">
                          {funnelData.steps.find(s => s.id === selectedStep)?.performance.views}
                        </div>
                        <div className="text-sm text-muted-foreground">Views</div>
                      </div>
                      <div className="text-center p-4 border border-border rounded-lg">
                        <div className="text-2xl font-bold">
                          {funnelData.steps.find(s => s.id === selectedStep)?.performance.conversions}
                        </div>
                        <div className="text-sm text-muted-foreground">Conversions</div>
                      </div>
                      <div className="text-center p-4 border border-border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {funnelData.steps.find(s => s.id === selectedStep)?.performance.conversionRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Conversion Rate</div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">Select a Step</h4>
                <p className="text-sm text-muted-foreground">
                  Click on any step to configure its settings and content
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Funnel
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Play className="h-4 w-4 mr-2" />
                Publish Changes
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Preview Funnel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}