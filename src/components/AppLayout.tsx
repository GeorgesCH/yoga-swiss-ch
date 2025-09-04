import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/ProductionAuthProvider';
import { useMultiTenantAuth } from './auth/MultiTenantAuthProvider';
import { getLocaleFromPath, isValidLocale, type SwissLocale } from '../utils/i18n';
import { ProductionAuthSystem } from './auth/ProductionAuthSystem';
import { OnboardingProvider } from './onboarding/OnboardingProvider';
import { OnboardingWizard } from './onboarding/OnboardingWizard';
import { DashboardShell } from './DashboardShell';
import { PortalApp } from './portal/PortalApp';
import { PageRouter } from './PageRouter';
import { AdminRouter } from './AdminRouter';
import { CommunityMessaging } from './community/CommunityMessaging';
import { ModerationQueue } from './community/ModerationQueue';



import { NoOrganizationState } from './NoOrganizationState';
import { DevEnvironmentIndicator } from './DevEnvironmentIndicator';
import { CorsWorkaroundBanner } from './CorsWorkaroundBanner';


interface AppLayoutProps {}

export function AppLayout({}: AppLayoutProps = {}) {
  const { user, currentOrg, loading } = useAuth();
  const { 
    currentOrg: mtCurrentOrg, 
    hasPermission, 
    isOwnerOrManager,
    loading: mtLoading 
  } = useMultiTenantAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [selectedTemplate, setSelectedTemplate] = useState(undefined);
  const [appMode, setAppMode] = useState<'admin' | 'portal'>('portal');
  const [showCreateRetreat, setShowCreateRetreat] = useState(false);
  const [editingRetreat, setEditingRetreat] = useState<string | null>(null);
  const [showStudioAuth, setShowStudioAuth] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [demoMode, setDemoMode] = useState(false);



  // Detect admin mode from URL and validate locale
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      setAppMode('admin');
    } else {
      setAppMode('portal');
      
      // Validate locale for portal routes
      const locale = getLocaleFromPath(location.pathname);
      if (!locale && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/integration-test')) {
        // Redirect to default locale if no locale is specified
        navigate('/de', { replace: true });
        return;
      }
    }
  }, [location.pathname, navigate]);

  // Auto-transition from studio auth to admin dashboard when user becomes authenticated
  useEffect(() => {
    if (user && appMode === 'admin' && showStudioAuth) {
      console.log('[AppLayout] User authenticated, switching from studio auth to admin dashboard');
      setShowStudioAuth(false);
    }
  }, [user, appMode, showStudioAuth]);

  // Debug logging
  console.log('[AppLayout] App state:', { 
    user: !!user, 
    currentOrg, 
    mtCurrentOrg,
    appMode, 
    showStudioAuth, 
    debugMode,
    demoMode, 
    loading, 
    mtLoading,
    combinedLoading: loading || mtLoading
  });

  // Show loading state if either provider is still loading
  const isLoading = loading || mtLoading;
  if (isLoading) {
    console.log('[AppLayout] Still loading:', { loading, mtLoading });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading YogaSwiss...</p>
          
          
        </div>
      </div>
    );
  }

  // Handle instructor/studio registration/login flow
  const handleStudioRegistration = () => {
    console.log('Switching to studio auth mode');
    setShowStudioAuth(true);
    setAppMode('admin');
  };

  // Show instructor/studio auth flow
  if (showStudioAuth && !user) {
    return (
      <div className="relative">

        <ProductionAuthSystem 
          mode="studio"
          onSuccess={() => {
            console.log('Studio auth successful, staying in admin mode');
            setShowStudioAuth(false);
            // Ensure we stay in admin mode after successful authentication
            setAppMode('admin');
          }}
          onBack={() => {
            setShowStudioAuth(false);
            setAppMode('portal');
          }}
        />
      </div>
    );
  }

  // Show customer portal by default (no auth required)
  if (appMode === 'portal' && !showStudioAuth) {
    return (
      <div className="relative">

        <PortalApp onStudioRegistration={handleStudioRegistration} />
      </div>
    );
  }

  // Show auth page if not authenticated in admin mode
  if (!user) {
    return (
      <div className="relative">

        <div className="min-h-screen p-6">
          <ProductionAuthSystem 
            onSuccess={() => {
              console.log('Admin auth successful');
            }}
            onBack={() => {
              setAppMode('portal');
            }}
          />
        </div>
      </div>
    );
  }

  // Show no organization state if user is authenticated but has no org
  if (user && mtCurrentOrg === null && !mtLoading) {
    return (
      <div className="relative">

        <NoOrganizationState />
      </div>
    );
  }

  // Show onboarding for incomplete setups
  if (currentOrg?.status === 'setup_incomplete' && !location.pathname.includes('/onboarding')) {
    return (
      <OnboardingProvider>
        <div className="min-h-screen bg-muted/10 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold mb-2">Welcome to YogaSwiss!</h1>
              <p className="text-muted-foreground">
                Let's set up your {currentOrg.role === 'owner' ? 'studio' : 'account'} to get started.
              </p>
            </div>
            <OnboardingWizard embedded />
          </div>
        </div>
      </OnboardingProvider>
    );
  }

  return (
    <div className="relative">

      <DashboardShell>

        <CorsWorkaroundBanner />
        <AdminRouter
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          showCreateRetreat={showCreateRetreat}
          setShowCreateRetreat={setShowCreateRetreat}
          editingRetreat={editingRetreat}
          setEditingRetreat={setEditingRetreat}
        />
      </DashboardShell>
      <DevEnvironmentIndicator />
    </div>
  );
}