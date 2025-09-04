import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  category: 'setup' | 'legal' | 'payments' | 'branding' | 'content' | 'team' | 'launch';
}

interface OnboardingContextType {
  currentStep: number;
  totalSteps: number;
  steps: OnboardingStep[];
  completedSteps: number;
  progressPercentage: number;
  nextIncompleteStep: OnboardingStep | null;
  currentStepData: OnboardingStep | null;
  goToStep: (stepIndex: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  markStepCompleted: (stepId: string) => void;
  markStepIncomplete: (stepId: string) => void;
  canLaunch: boolean;
  isOnboardingComplete: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { currentOrg } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Studio onboarding steps based on requirements
  const studioSteps: OnboardingStep[] = [
    {
      id: 'org-setup',
      title: 'Studio Information',
      description: 'Complete your studio profile with name, location, and basic settings',
      completed: false,
      required: true,
      category: 'setup'
    },
    {
      id: 'legal-compliance',
      title: 'Legal & Compliance',
      description: 'Set up company details, VAT ID, data processing notice, and waivers',
      completed: false,
      required: true,
      category: 'legal'
    },
    {
      id: 'payment-setup',
      title: 'Payment Methods',
      description: 'Connect Stripe, enable TWINT, set up QR-bill banking details',
      completed: false,
      required: true,
      category: 'payments'
    },
    {
      id: 'branding',
      title: 'Branding & Domain',
      description: 'Upload logo, set brand colors, configure your public domain',
      completed: false,
      required: false,
      category: 'branding'
    },
    {
      id: 'locations',
      title: 'Locations & Resources',
      description: 'Add studio locations, rooms, outdoor spots, and equipment',
      completed: false,
      required: true,
      category: 'setup'
    },
    {
      id: 'policies',
      title: 'Studio Policies',
      description: 'Configure cancellation, no-show, waitlist, and membership policies',
      completed: false,
      required: true,
      category: 'setup'
    },
    {
      id: 'catalog',
      title: 'Class Catalog',
      description: 'Create your first class templates, memberships, and pricing',
      completed: false,
      required: true,
      category: 'content'
    },
    {
      id: 'team-invites',
      title: 'Team & Instructors',
      description: 'Invite managers, instructors, and front desk staff',
      completed: false,
      required: false,
      category: 'team'
    },
    {
      id: 'data-import',
      title: 'Import Data',
      description: 'Import existing customers, schedules, and passes (optional)',
      completed: false,
      required: false,
      category: 'content'
    },
    {
      id: 'testing',
      title: 'System Testing',
      description: 'Test payments, bookings, invoices, and email notifications',
      completed: false,
      required: true,
      category: 'launch'
    },
    {
      id: 'go-live',
      title: 'Go Live',
      description: 'Publish your studio and start accepting bookings',
      completed: false,
      required: true,
      category: 'launch'
    }
  ];

  // Instructor onboarding steps
  const instructorSteps: OnboardingStep[] = [
    {
      id: 'accept-invite',
      title: 'Accept Invitation',
      description: 'Accept your invitation to join the studio',
      completed: false,
      required: true,
      category: 'setup'
    },
    {
      id: 'profile-setup',
      title: 'Complete Profile',
      description: 'Add your bio, photos, specialties, and qualifications',
      completed: false,
      required: true,
      category: 'setup'
    },
    {
      id: 'availability',
      title: 'Set Availability',
      description: 'Configure your teaching schedule and availability preferences',
      completed: false,
      required: true,
      category: 'setup'
    },
    {
      id: 'notification-preferences',
      title: 'Notifications',
      description: 'Choose how you want to be notified about classes and changes',
      completed: false,
      required: false,
      category: 'setup'
    },
    {
      id: 'privacy-consent',
      title: 'Privacy & Access',
      description: 'Review your data access permissions and customer privacy settings',
      completed: false,
      required: true,
      category: 'legal'
    },
    {
      id: 'first-assignment',
      title: 'First Class Assignment',
      description: 'Get assigned to your first class or recurring series',
      completed: false,
      required: true,
      category: 'content'
    }
  ];

  // Customer onboarding steps
  const customerSteps: OnboardingStep[] = [
    {
      id: 'verify-email',
      title: 'Verify Email',
      description: 'Check your email and click the verification link',
      completed: false,
      required: true,
      category: 'setup'
    },
    {
      id: 'privacy-consent',
      title: 'Privacy & Waivers',
      description: 'Accept privacy policy and liability waivers for your studio',
      completed: false,
      required: true,
      category: 'legal'
    },
    {
      id: 'communication-preferences',
      title: 'Communication Preferences',
      description: 'Choose how studios can contact you (email, SMS, push, WhatsApp)',
      completed: false,
      required: true,
      category: 'setup'
    },
    {
      id: 'first-booking',
      title: 'Make Your First Booking',
      description: 'Book your first class or purchase a membership',
      completed: false,
      required: false,
      category: 'content'
    }
  ];

  // Mock step completion state
  const [steps, setSteps] = useState<OnboardingStep[]>(() => {
    // In real implementation, this would be loaded from currentOrg or user role
    const userRole = currentOrg?.role || 'owner';
    
    switch (userRole) {
      case 'owner':
        return studioSteps;
      case 'instructor':
        return instructorSteps;
      default:
        return customerSteps;
    }
  });

  useEffect(() => {
    // Load onboarding progress from API/storage
    // For now, simulate some completed steps
    if (currentOrg?.status === 'active') {
      setSteps(prev => prev.map(step => ({
        ...step,
        completed: Math.random() > 0.7 // Random completion for demo
      })));
    }
  }, [currentOrg]);

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
  const nextIncompleteStep = steps.find(step => !step.completed) || null;
  const currentStepData = steps[currentStep] || null;
  const requiredSteps = steps.filter(step => step.required);
  const completedRequiredSteps = requiredSteps.filter(step => step.completed).length;
  const canLaunch = completedRequiredSteps === requiredSteps.length;
  const isOnboardingComplete = canLaunch && steps.find(step => step.id === 'go-live')?.completed;

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const markStepCompleted = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
  };

  const markStepIncomplete = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: false } : step
    ));
  };

  const value: OnboardingContextType = {
    currentStep,
    totalSteps,
    steps,
    completedSteps,
    progressPercentage,
    nextIncompleteStep,
    currentStepData,
    goToStep,
    nextStep,
    previousStep,
    markStepCompleted,
    markStepIncomplete,
    canLaunch,
    isOnboardingComplete
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

export type { OnboardingStep, OnboardingContextType };