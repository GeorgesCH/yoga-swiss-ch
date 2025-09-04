import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  CheckCircle, Circle, ArrowRight, ArrowLeft, Star, AlertCircle, 
  Building, Shield, CreditCard, Palette, MapPin, FileText, 
  BookOpen, Users, Upload, TestTube, Rocket, Clock, Play,
  User, Settings, Bell, Lock, Calendar
} from 'lucide-react';
import { useOnboarding } from './OnboardingProvider';
import { useAuth } from '../auth/AuthProvider';

const categoryIcons = {
  setup: Building,
  legal: Shield,
  payments: CreditCard,
  branding: Palette,
  content: BookOpen,
  team: Users,
  launch: Rocket
};

const stepIcons = {
  'org-setup': Building,
  'legal-compliance': Shield,
  'payment-setup': CreditCard,
  'branding': Palette,
  'locations': MapPin,
  'policies': FileText,
  'catalog': BookOpen,
  'team-invites': Users,
  'data-import': Upload,
  'testing': TestTube,
  'go-live': Rocket,
  // Instructor steps
  'accept-invite': Users,
  'profile-setup': User,
  'availability': Calendar,
  'notification-preferences': Bell,
  'privacy-consent': Lock,
  'first-assignment': BookOpen,
  // Customer steps
  'verify-email': CheckCircle,
  'communication-preferences': Settings
};

interface OnboardingWizardProps {
  onClose?: () => void;
  embedded?: boolean;
}

export function OnboardingWizard({ onClose, embedded = false }: OnboardingWizardProps) {
  const { currentOrg } = useAuth();
  const {
    steps,
    currentStep,
    currentStepData,
    completedSteps,
    totalSteps,
    progressPercentage,
    nextIncompleteStep,
    canLaunch,
    isOnboardingComplete,
    goToStep,
    nextStep,
    previousStep,
    markStepCompleted
  } = useOnboarding();

  const [showStepDetail, setShowStepDetail] = useState(false);
  const [selectedStep, setSelectedStep] = useState<typeof steps[0] | null>(null);

  const handleStepClick = (step: typeof steps[0], index: number) => {
    setSelectedStep(step);
    goToStep(index);
    if (!embedded) {
      setShowStepDetail(true);
    }
  };

  const handleCompleteStep = (stepId: string) => {
    markStepCompleted(stepId);
    setShowStepDetail(false);
    
    // Auto-advance to next incomplete step
    const nextStep = steps.find(s => !s.completed);
    if (nextStep) {
      const nextIndex = steps.findIndex(s => s.id === nextStep.id);
      goToStep(nextIndex);
    }
  };

  const getStepStatus = (step: typeof steps[0]) => {
    if (step.completed) return 'completed';
    if (step.required) return 'required';
    return 'optional';
  };

  const getStepIcon = (step: typeof steps[0]) => {
    const IconComponent = stepIcons[step.id as keyof typeof stepIcons] || Circle;
    
    if (step.completed) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    
    return <IconComponent className="h-5 w-5 text-muted-foreground" />;
  };

  const groupedSteps = steps.reduce((acc, step, index) => {
    if (!acc[step.category]) {
      acc[step.category] = [];
    }
    acc[step.category].push({ ...step, index });
    return acc;
  }, {} as Record<string, (typeof steps[0] & { index: number })[]>);

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">Y</span>
          </div>
          <h2 className="text-xl font-semibold">
            {currentOrg?.role === 'owner' ? 'Studio Setup' : 
             currentOrg?.role === 'instructor' ? 'Instructor Onboarding' : 
             'Get Started'}
          </h2>
        </div>
        <p className="text-muted-foreground">
          {isOnboardingComplete ? 
            'Congratulations! Your setup is complete.' :
            `Complete ${totalSteps - completedSteps} more steps to finish setup`
          }
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{completedSteps} of {totalSteps} completed</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span>Completed ({completedSteps})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            <span>Required ({steps.filter(s => s.required && !s.completed).length})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
            <span>Optional ({steps.filter(s => !s.required && !s.completed).length})</span>
          </div>
        </div>
      </div>

      {/* Next Step CTA */}
      {nextIncompleteStep && !isOnboardingComplete && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  {getStepIcon(nextIncompleteStep)}
                </div>
                <div>
                  <h4 className="font-medium">Next: {nextIncompleteStep.title}</h4>
                  <p className="text-sm text-muted-foreground">{nextIncompleteStep.description}</p>
                </div>
              </div>
              <Button 
                onClick={() => {
                  const index = steps.findIndex(s => s.id === nextIncompleteStep.id);
                  handleStepClick(nextIncompleteStep, index);
                }}
                size="sm"
              >
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Launch Status */}
      {canLaunch && !isOnboardingComplete && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Ready to Launch!</h4>
                <p className="text-sm text-green-700">
                  All required steps are complete. You can now go live with your studio.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps by Category */}
      <div className="space-y-6">
        {Object.entries(groupedSteps).map(([category, categorySteps]) => {
          const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons] || Circle;
          const categoryCompleted = categorySteps.filter(s => s.completed).length;
          const categoryTotal = categorySteps.length;
          
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium capitalize">{category.replace('_', ' ')}</h3>
                <Badge variant="outline" className="text-xs">
                  {categoryCompleted}/{categoryTotal}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {categorySteps.map((step) => (
                  <Card 
                    key={step.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      step.completed ? 'bg-green-50 border-green-200' : 
                      step.required ? 'border-orange-200' : ''
                    }`}
                    onClick={() => handleStepClick(step, step.index)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStepIcon(step)}
                          <div>
                            <h4 className="font-medium">{step.title}</h4>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {step.required && !step.completed && (
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                              Required
                            </Badge>
                          )}
                          {step.completed && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Complete
                            </Badge>
                          )}
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {!embedded && (
        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            {isOnboardingComplete ? (
              <Button>
                <Rocket className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            ) : canLaunch ? (
              <Button onClick={() => {
                const goLiveStep = steps.find(s => s.id === 'go-live');
                if (goLiveStep) {
                  const index = steps.findIndex(s => s.id === 'go-live');
                  handleStepClick(goLiveStep, index);
                }
              }}>
                <Rocket className="h-4 w-4 mr-2" />
                Launch Studio
              </Button>
            ) : (
              <span className="text-sm text-muted-foreground">
                Complete required steps to launch
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <>
      {content}
      
      {/* Step Detail Dialog */}
      <Dialog open={showStepDetail} onOpenChange={setShowStepDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedStep && getStepIcon(selectedStep)}
              {selectedStep?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedStep && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedStep.description}</p>
              
              {/* Step-specific content would go here */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium mb-2">What you'll do:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Configure your settings</li>
                  <li>• Review and save your preferences</li>
                  <li>• Test the configuration</li>
                </ul>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  {selectedStep.required ? (
                    <Badge variant="destructive">Required</Badge>
                  ) : (
                    <Badge variant="outline">Optional</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    ~5-10 minutes
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowStepDetail(false)}
                  >
                    Close
                  </Button>
                  {!selectedStep.completed ? (
                    <Button onClick={() => handleCompleteStep(selectedStep.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  ) : (
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Settings
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}