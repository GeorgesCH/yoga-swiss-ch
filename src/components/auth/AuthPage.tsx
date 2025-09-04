import React, { useState, useEffect } from 'react';
import { AuthLayout } from './AuthLayout';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { SimpleSignUpForm } from './SimpleSignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { MagicLinkForm } from './MagicLinkForm';
import { CustomerOnboardingPage } from '../portal/pages/CustomerOnboardingPage';
import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'simple-signup' | 'onboarding' | 'forgot-password' | 'magic-link';

interface AuthPageProps {
  mode?: 'customer' | 'studio';
  onSuccess?: () => void;
}

export function AuthPage({ mode: userType = 'customer', onSuccess }: AuthPageProps) {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>(userType === 'studio' ? 'signup' : 'signin');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading && onSuccess) {
      onSuccess();
    }
  }, [user, loading, onSuccess]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if user just signed up and needs onboarding
  if (showOnboarding) {
    return (
      <CustomerOnboardingPage 
        onPageChange={(page) => {
          if (page === 'home' && onSuccess) {
            setShowOnboarding(false);
            onSuccess();
          }
        }}
      />
    );
  }

  const getAuthContent = () => {
    const isStudioMode = userType === 'studio';
    
    switch (mode) {
      case 'signin':
        return {
          title: isStudioMode ? 'Welcome back to YogaSwiss' : 'Welcome back',
          description: isStudioMode 
            ? 'Sign in to your YogaSwiss account to manage your studio and classes.'
            : 'Sign in to your YogaSwiss account to book classes and manage your bookings.',
          component: (
            <SignInForm
              mode={userType}
              onSwitchToSignUp={() => setMode(userType === 'customer' ? 'simple-signup' : 'signup')}
              onSwitchToForgotPassword={() => setMode('forgot-password')}
              onSwitchToMagicLink={() => setMode('magic-link')}
            />
          )
        };
      case 'simple-signup':
        return {
          title: '',
          description: '',
          component: (
            <SimpleSignUpForm
              onSwitchToSignIn={() => setMode('signin')}
              onSignUpSuccess={() => setShowOnboarding(true)}
            />
          ),
          hideLayout: true
        };
      case 'signup':
        return {
          title: isStudioMode ? 'Join YogaSwiss as a Studio' : 'Create your account',
          description: isStudioMode
            ? 'Set up your studio or instructor profile to start teaching with YogaSwiss.'
            : 'Create your account to book classes and connect with yoga studios.',
          component: (
            <SignUpForm
              mode={userType}
              onSwitchToSignIn={() => setMode('signin')}
            />
          )
        };
      case 'forgot-password':
        return {
          title: 'Reset password',
          description: 'We\'ll help you get back into your account.',
          component: (
            <ForgotPasswordForm
              onBack={() => setMode('signin')}
            />
          )
        };
      case 'magic-link':
        return {
          title: 'Magic Link',
          description: 'The secure, password-free way to sign in.',
          component: (
            <MagicLinkForm
              onBack={() => setMode('signin')}
            />
          )
        };
    }
  };

  const { title, description, component, hideLayout } = getAuthContent();

  // For simple signup, render without AuthLayout
  if (hideLayout) {
    return component;
  }

  return (
    <AuthLayout 
      title={title} 
      description={description}
      showFeatures={mode === 'signin' || mode === 'signup'}
    >
      {component}
    </AuthLayout>
  );
}