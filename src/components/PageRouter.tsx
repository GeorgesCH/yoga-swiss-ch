import React from 'react';
import { OnboardingProvider } from './onboarding/OnboardingProvider';
import { OnboardingWizard } from './onboarding/OnboardingWizard';
import { KPICards } from './dashboard/KPICards';
import { TodayOverview } from './dashboard/TodayOverview';
import { RevenueChart } from './dashboard/RevenueChart';
import { ProductsAndCustomers } from './dashboard/ProductsAndCustomers';
import { ClassesManagement } from './schedule/ClassesManagement';
import { CreateClassPage } from './CreateClassPage';
import { RecurringClassManagement } from './RecurringClassManagement';
import { CustomerManagement } from './customers/CustomerManagement';
import { RegistrationManagement } from './registrations/RegistrationManagement';
import { MarketingManagement } from './MarketingManagement';
import { ProductsManagement } from './operations/ProductsManagement';
import { PricingManagement } from './shop/PricingManagement';
import { InventoryManagement } from './shop/InventoryManagement';
import { FinanceManagement } from './FinanceManagement';
import { PeopleManagement } from './people/PeopleManagement';
import { ClassesOverview } from './classes/ClassesOverview';
import { ShopOverview } from './shop/ShopOverview';
import { MarketingOverview } from './marketing/MarketingOverview';
import { FinanceOverview } from './finance/FinanceOverview';
import { SettingsOverview } from './settings/SettingsOverview';
import { WalletManagement } from './finance/WalletManagement';
import { SwissPaymentIntegration } from './finance/SwissPaymentIntegration';
import { SettingsManagement } from './settings/SettingsManagement';
import { SafeCommunityMessaging } from './community/SafeCommunityMessaging';
import { CommunityClassIntegration } from './community/CommunityClassIntegration';
import { CommunityNotifications } from './community/CommunityNotifications';
import { ModerationQueue } from './community/ModerationQueue';
import { RetreatManagement } from './retreats/RetreatManagement';
import { EnhancedRetreatManagement } from './retreats/EnhancedRetreatManagement';
import { CreateRetreatWizard } from './retreats/CreateRetreatWizard';
import { ProgramManagementDashboard } from './programs/ProgramManagementDashboard';
import { ProgramDirectory } from './programs/ProgramDirectory';
import { ProgramProgressTracker } from './programs/ProgramProgressTracker';
import { DynamicRetreatLanding } from './retreats/DynamicRetreatLanding';
import { GlobalRetreatsDirectory } from './retreats/GlobalRetreatsDirectory';
import { DynamicRetreatsAdmin } from './retreats/DynamicRetreatsAdmin';
import { DeveloperTools } from './developer/DeveloperTools';
import { InstructorManagement } from './instructors/InstructorManagement';
import { LocationsManagement } from './locations/LocationsManagement';
import { CommunicationsManagement } from './communications/CommunicationsManagement';
import { SystemHealthMonitoring } from './system/SystemHealthMonitoring';
import { IntegrationsManagement } from './integrations/IntegrationsManagement';
import { ComplianceManagement } from './compliance/ComplianceManagement';
import { BusinessGrowth } from './analytics/BusinessGrowth';
import { AnalyticsReports } from './analytics/AnalyticsReports';
import { AutomationsManagement } from './automations/AutomationsManagement';
import { StaffManagement } from './staff/StaffManagement';
import { SecuritySettings } from './settings/SecuritySettings';
import { BrandManagement } from './settings/BrandManagement';
import { BookingEngine } from './core/BookingEngine';
import { AdvancedScheduleManager } from './core/AdvancedScheduleManager';
import { ComprehensiveRegistrationSystem } from './core/ComprehensiveRegistrationSystem';
import { CancellationRefundSystem } from './core/CancellationRefundSystem';
import { CustomerWalletManager } from './core/CustomerWalletManager';
import { ProgramBookingFlow } from './programs/ProgramBookingFlow';
import { DatabaseInitializationPage } from './DatabaseInitializationPage';

import { useAuth } from './auth/ProductionAuthProvider';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Settings, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';

interface PageRouterProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  selectedTemplate: any;
  setSelectedTemplate: (template: any) => void;
  showCreateRetreat: boolean;
  setShowCreateRetreat: (show: boolean) => void;
  editingRetreat: string | null;
  setEditingRetreat: (id: string | null) => void;
}

export function PageRouter({
  currentPage,
  setCurrentPage,
  selectedTemplate,
  setSelectedTemplate,
  showCreateRetreat,
  setShowCreateRetreat,
  editingRetreat,
  setEditingRetreat
}: PageRouterProps) {

  const { currentOrg } = useAuth();

  switch (currentPage) {
    case 'dashboard':
      return (
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Here's what's happening at your studio today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Studio Active
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage('onboarding')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Setup
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <KPICards />

          {/* Today Overview */}
          <TodayOverview />

          {/* Revenue & Bookings Charts */}
          <RevenueChart />

          {/* Products & Customers */}
          <ProductsAndCustomers />
        </div>
      );

    case 'schedule':
      return (
        <ClassesManagement 
          onCreateClass={() => setCurrentPage('create-class')}
          onEditClass={(template) => {
            setSelectedTemplate(template);
            setCurrentPage('create-class');
          }}
        />
      );

    case 'create-class':
      return (
        <CreateClassPage 
          onBack={() => {
            setCurrentPage('schedule');
            setSelectedTemplate(undefined);
          }}
          templateToEdit={selectedTemplate}
        />
      );

    case 'recurring-classes':
      return <RecurringClassManagement />;

    case 'customers':
      return <CustomerManagement />;

    case 'registrations':
      return <RegistrationManagement />;

    case 'products':
      return <ProductsManagement />;

    case 'wallets':
      return <WalletManagement />;

    case 'payments':
      return <SwissPaymentIntegration />;

    case 'retreats':
      if (showCreateRetreat || editingRetreat) {
        return (
          <CreateRetreatWizard
            onCancel={() => {
              setShowCreateRetreat(false);
              setEditingRetreat(null);
            }}
            onComplete={() => {
              setShowCreateRetreat(false);
              setEditingRetreat(null);
            }}
            editingRetreat={editingRetreat}
          />
        );
      }
      return (
        <EnhancedRetreatManagement
          onCreateRetreat={() => setShowCreateRetreat(true)}
          onEditRetreat={(id) => setEditingRetreat(id)}
        />
      );

    // Outdoor locations page disabled in production until backend is ready

    case 'onboarding':
      return (
        <OnboardingProvider>
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Setup & Onboarding</h1>
                <p className="text-muted-foreground">
                  Complete your studio setup and onboarding process
                </p>
              </div>
              <div className="flex items-center gap-3">
                {currentOrg?.status === 'active' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Setup Complete
                  </Badge>
                )}
                {currentOrg?.status === 'setup_incomplete' && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Setup Required
                  </Badge>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage('dashboard')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>

            {/* Onboarding Content */}
            <OnboardingWizard embedded />
          </div>
        </OnboardingProvider>
      );

    case 'instructors':
      return <InstructorManagement />;

    case 'staff':
      return <StaffManagement />;

    case 'locations':
      return <LocationsManagement />;

    case 'analytics':
      return <AnalyticsReports onPageChange={setCurrentPage} />;

    case 'business-growth':
      return <BusinessGrowth onPageChange={setCurrentPage} />;

    case 'communications':
      return <CommunicationsManagement />;

    case 'system-health':
      return <SystemHealthMonitoring />;

    case 'integrations':
      return <IntegrationsManagement />;

    case 'automations':
      return <AutomationsManagement />;

    case 'compliance':
      return <ComplianceManagement />;

    case 'booking-engine':
      return <BookingEngine />;

    case 'advanced-scheduling':
      return <AdvancedScheduleManager />;

    case 'comprehensive-registration':
      return <ComprehensiveRegistrationSystem />;

    case 'cancellation-refund':
      return <CancellationRefundSystem />;

    case 'customer-wallet':
      return <CustomerWalletManager />;

    // New consolidated overview pages
    case 'people':
      return <PeopleManagement onPageChange={setCurrentPage} />;

    case 'classes':
      return <ClassesOverview 
        onPageChange={setCurrentPage}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        showCreateRetreat={showCreateRetreat}
        setShowCreateRetreat={setShowCreateRetreat}
        editingRetreat={editingRetreat}
        setEditingRetreat={setEditingRetreat}
      />;

    case 'shop':
      return <ShopOverview onPageChange={setCurrentPage} orgId={currentOrg?.id || ''} />;

    case 'marketing':
      return <MarketingOverview onPageChange={setCurrentPage} />;

    case 'finance':
      return <FinanceOverview onPageChange={setCurrentPage} />;

    case 'settings':
      return <SettingsOverview onPageChange={setCurrentPage} />;

    // New routes for reorganized menu structure
    case 'swiss-payments':
      return <SwissPaymentIntegration />;

    case 'segments':
      return <MarketingManagement />;

    case 'pricing':
      return <PricingManagement orgId={currentOrg?.id || ''} />;

    case 'inventory':
      return <InventoryManagement />;

    case 'finance-reports':
      return <FinanceManagement />;

    case 'general-settings':
      return <SettingsManagement />;

    case 'security':
      return <SecuritySettings />;

    case 'brand-management':
      return <BrandManagement />;

    // Community pages
    case 'community-messaging':
      return <SafeCommunityMessaging />;

    case 'community-class-integration':
      return <CommunityClassIntegration />;

    case 'community-notifications':
      return <CommunityNotifications />;

    case 'moderation-queue':
      return <ModerationQueue />;

    // Programs routes
    case 'programs-admin':
      return <ProgramManagementDashboard onPageChange={setCurrentPage} />;

    case 'programs-directory':
      return <ProgramDirectory />;

    case 'programs-progress':
      return <ProgramProgressTracker />;

    case 'programs-booking':
      return <ProgramBookingFlow 
        program={{
          id: 'program-demo',
          title: 'EVOLVE Personal Coaching Program',
          summary: 'Transform your practice with personalized 1-on-1 coaching',
          category: 'personal_training',
          delivery_mode: 'hybrid',
          session_length_min: 60,
          is_multi_session: true,
          instructor: {
            id: 'instructor-1',
            name: 'Sarah Kumar',
            title: 'Senior Yoga Instructor & Life Coach',
            rating: 4.9,
            image: '/api/placeholder/150/150'
          },
          selected_variant: {
            id: 'variant-1',
            name: '4-Session Transformation Package',
            sessions_count: 4,
            price: 480.00,
            currency: 'CHF',
            description: 'Comprehensive coaching package with personalized approach',
            includes: ['Initial assessment', '4 coaching sessions', 'Progress tracking', 'Take-home materials']
          },
          intake_form: {
            required: true,
            fields: [
              { type: 'text', name: 'experience_level', label: 'Yoga Experience Level', required: true },
              { type: 'textarea', name: 'goals', label: 'What are your main goals?', required: true },
              { type: 'textarea', name: 'challenges', label: 'Current challenges or limitations', required: false },
              { type: 'select', name: 'focus_area', label: 'Primary Focus Area', required: true, 
                options: ['Flexibility', 'Strength', 'Balance', 'Meditation', 'Stress Relief'] }
            ]
          }
        }}
        onComplete={(bookingData) => {
          console.log('Booking completed:', bookingData);
          alert('Booking completed! You will receive a confirmation email shortly.');
        }}
        onCancel={() => {
          setCurrentPage('programs-directory');
        }}
      />;

    // Dynamic retreats routes
    case 'retreats-admin':
      return <DynamicRetreatsAdmin />;

    case 'retreats-directory':
      return <GlobalRetreatsDirectory />;

    case 'retreat-landing':
      return <DynamicRetreatLanding slug="baltic-experience-lithuania" />;

    // Developer Tools
    case 'developer-tools':
      return <DeveloperTools />;

    // Database Initialization
    case 'database-init':
      return <DatabaseInitializationPage />;

    default:
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Page In Development</h2>
            <p className="text-muted-foreground">
              This feature is coming soon! Check back later.
            </p>
          </div>
        </div>
      );
  }
}
