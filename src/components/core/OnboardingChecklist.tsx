import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Check, Clock, AlertCircle, ArrowRight, Play, ExternalLink } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'optional';
  category: 'essential' | 'recommended' | 'advanced';
  estimatedTime: string;
  action?: {
    type: 'internal' | 'external';
    label: string;
    url?: string;
    onClick?: () => void;
  };
}

export function OnboardingChecklist() {
  const { t } = useLanguage();
  const [expandedCategory, setExpandedCategory] = useState<string>('essential');

  const onboardingSteps: OnboardingStep[] = [
    // Essential Steps
    {
      id: 'studio-info',
      title: 'Studio Information',
      description: 'Add your studio name, address, contact details and business hours',
      status: 'completed',
      category: 'essential',
      estimatedTime: '5 min',
      action: {
        type: 'internal',
        label: 'Review Settings',
        onClick: () => console.log('Navigate to settings')
      }
    },
    {
      id: 'locations-setup',
      title: 'Setup Locations & Studios',
      description: 'Configure your studio spaces, rooms and outdoor locations',
      status: 'completed',
      category: 'essential',
      estimatedTime: '10 min',
      action: {
        type: 'internal',
        label: 'Manage Locations',
        onClick: () => console.log('Navigate to locations')
      }
    },
    {
      id: 'payment-setup',
      title: 'Payment Processing',
      description: 'Connect TWINT, Stripe and other payment methods',
      status: 'in-progress',
      category: 'essential',
      estimatedTime: '15 min',
      action: {
        type: 'internal',
        label: 'Configure Payments',
        onClick: () => console.log('Navigate to payment settings')
      }
    },
    {
      id: 'class-types',
      title: 'Create Class Types',
      description: 'Setup your yoga styles, pricing and capacity limits',
      status: 'pending',
      category: 'essential',
      estimatedTime: '20 min',
      action: {
        type: 'internal',
        label: 'Create Classes',
        onClick: () => console.log('Navigate to class creation')
      }
    },
    {
      id: 'first-schedule',
      title: 'Build Your Schedule',
      description: 'Create your first week of classes and recurring sessions',
      status: 'pending',
      category: 'essential',
      estimatedTime: '30 min',
      action: {
        type: 'internal',
        label: 'Build Schedule',
        onClick: () => console.log('Navigate to schedule')
      }
    },

    // Recommended Steps
    {
      id: 'instructor-profiles',
      title: 'Instructor Profiles',
      description: 'Add instructor bios, photos and specializations',
      status: 'pending',
      category: 'recommended',
      estimatedTime: '15 min',
      action: {
        type: 'internal',
        label: 'Add Instructors',
        onClick: () => console.log('Navigate to instructors')
      }
    },
    {
      id: 'booking-widget',
      title: 'Booking Widget',
      description: 'Embed the booking widget on your website',
      status: 'optional',
      category: 'recommended',
      estimatedTime: '10 min',
      action: {
        type: 'external',
        label: 'Get Widget Code',
        url: 'https://docs.yogaswiss.ch/widget'
      }
    },
    {
      id: 'email-templates',
      title: 'Email Templates',
      description: 'Customize confirmation, reminder and cancellation emails',
      status: 'pending',
      category: 'recommended',
      estimatedTime: '25 min',
      action: {
        type: 'internal',
        label: 'Edit Templates',
        onClick: () => console.log('Navigate to email templates')
      }
    },
    {
      id: 'mobile-app',
      title: 'Mobile App Setup',
      description: 'Configure your branded iOS and Android apps',
      status: 'optional',
      category: 'recommended',
      estimatedTime: '20 min',
      action: {
        type: 'external',
        label: 'Download Guide',
        url: 'https://docs.yogaswiss.ch/mobile-app'
      }
    },

    // Advanced Steps
    {
      id: 'api-integration',
      title: 'API Integration',
      description: 'Connect with your existing tools and systems',
      status: 'optional',
      category: 'advanced',
      estimatedTime: '45 min',
      action: {
        type: 'external',
        label: 'API Documentation',
        url: 'https://docs.yogaswiss.ch/api'
      }
    },
    {
      id: 'custom-domain',
      title: 'Custom Domain',
      description: 'Setup booking.yourstudio.ch for branded experience',
      status: 'optional',
      category: 'advanced',
      estimatedTime: '15 min',
      action: {
        type: 'internal',
        label: 'Configure Domain',
        onClick: () => console.log('Navigate to domain settings')
      }
    },
    {
      id: 'analytics-setup',
      title: 'Analytics & Reports',
      description: 'Connect Google Analytics and setup automated reports',
      status: 'optional',
      category: 'advanced',
      estimatedTime: '30 min',
      action: {
        type: 'internal',
        label: 'Setup Analytics',
        onClick: () => console.log('Navigate to analytics')
      }
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'optional':
        return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'completed': 'bg-green-100 text-green-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'pending': 'bg-orange-100 text-orange-800',
      'optional': 'bg-gray-100 text-gray-800'
    };

    const labels = {
      'completed': 'Complete',
      'in-progress': 'In Progress',
      'pending': 'Pending',
      'optional': 'Optional'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const calculateProgress = (category: string) => {
    const categorySteps = onboardingSteps.filter(step => step.category === category);
    const completedSteps = categorySteps.filter(step => step.status === 'completed');
    return Math.round((completedSteps.length / categorySteps.length) * 100);
  };

  const getTotalProgress = () => {
    const essentialSteps = onboardingSteps.filter(step => step.category === 'essential');
    const completedEssential = essentialSteps.filter(step => step.status === 'completed');
    return Math.round((completedEssential.length / essentialSteps.length) * 100);
  };

  const categories = [
    {
      key: 'essential',
      title: 'Essential Setup',
      description: 'Critical steps to get your studio running',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      progress: calculateProgress('essential')
    },
    {
      key: 'recommended',
      title: 'Recommended Setup',
      description: 'Enhance your studio\'s professional appearance',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      progress: calculateProgress('recommended')
    },
    {
      key: 'advanced',
      title: 'Advanced Features',
      description: 'Power user features and integrations',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      progress: calculateProgress('advanced')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Setup Progress</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete essential steps to start accepting bookings
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{getTotalProgress()}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={getTotalProgress()} className="h-2" />
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card 
            key={category.key}
            className={`cursor-pointer transition-all hover:shadow-md ${
              expandedCategory === category.key ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setExpandedCategory(category.key)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`${category.bgColor} p-2 rounded-lg`}>
                  <div className={`w-2 h-2 rounded-full ${category.color.replace('text-', 'bg-')}`} />
                </div>
                <Badge variant="outline">{category.progress}%</Badge>
              </div>
              <h3 className="font-semibold">{category.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
              <Progress value={category.progress} className="h-1 mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Steps List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {categories.find(c => c.key === expandedCategory)?.title} Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {onboardingSteps
              .filter(step => step.category === expandedCategory)
              .map((step, index) => (
                <div key={step.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    {getStatusIcon(step.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{step.title}</h4>
                      {getStatusBadge(step.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {step.estimatedTime}
                      </span>
                    </div>
                  </div>

                  {step.action && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={step.action.onClick}
                      className="flex items-center gap-2"
                    >
                      {step.action.type === 'external' ? (
                        <ExternalLink className="w-3 h-3" />
                      ) : (
                        <ArrowRight className="w-3 h-3" />
                      )}
                      {step.action.label}
                    </Button>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}