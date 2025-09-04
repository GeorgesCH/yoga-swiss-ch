import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PortalProvider } from './PortalProvider';
import { PortalShell } from './PortalShell';
import { RealTimeUpdates } from './RealTimeUpdates';
import { AuthProvider } from '../auth/AuthProvider';
import { getLocaleFromPath, isValidLocale, SWISS_LOCALES, type SwissLocale } from '../../utils/i18n';
import { useTranslation } from '../i18n/ComprehensiveI18nProvider';
import { LuxuryHomePage } from './pages/LuxuryHomePage';
import { LuxuryExplorePage } from './pages/LuxuryExplorePage';
import { SchedulePage } from './pages/SchedulePage';
import { OnlineStudioPage } from './pages/OnlineStudioPage';
import { PricingPage } from './pages/PricingPage';
import { StudiosPage } from './pages/StudiosPage';
import { InstructorsPage } from './pages/InstructorsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CityPage } from './pages/CityPage';
import { OutdoorPage } from './pages/OutdoorPage';
import { CustomerOnboardingPage } from './pages/CustomerOnboardingPage';
import { CustomerLoginPage } from './pages/CustomerLoginPage';
import { AccountDashboardPage } from './pages/AccountDashboardPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { StudioProfilePage } from './pages/StudioProfilePage';
import { InstructorProfilePage } from './pages/InstructorProfilePage';
import { RetreatsPage } from './pages/RetreatsPage';
import { RetreatDetailPage } from './pages/RetreatDetailPage';
import { RetreatCheckoutPage } from './pages/RetreatCheckoutPage';
import { TestConnectionPage } from './pages/TestConnectionPage';
import { ClassDetailPage } from './pages/ClassDetailPage';
import { BrandPage } from '../brands/BrandPage';
import { TeachersCirclePage } from './pages/TeachersCirclePage';
import { OrganiseRetreatPage } from './pages/OrganiseRetreatPage';


const OrderSuccessPage = ({ onPageChange }: { onPageChange: (page: string) => void }) => (
  <div className="max-w-2xl mx-auto py-12">
    <div className="text-center space-y-6">
      <div className="h-16 w-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your booking. You'll receive a confirmation email shortly with your class details and QR codes.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={() => onPageChange('account')}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          View My Bookings
        </button>
        <button 
          onClick={() => onPageChange('home')}
          className="px-6 py-2 border border-border rounded-md hover:bg-accent"
        >
          Continue Exploring
        </button>
      </div>
    </div>
  </div>
);

interface PortalAppProps {
  onStudioRegistration?: () => void;
}

export function PortalApp({ onStudioRegistration }: PortalAppProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [pageParams, setPageParams] = useState<any>({});
  const { setLocale } = useTranslation();

  // Get current locale from URL
  const currentLocale = getLocaleFromPath(location.pathname) || 'de-CH';

  // Sync i18n locale with URL locale
  useEffect(() => {
    const urlLocale = getLocaleFromPath(location.pathname);
    if (urlLocale && urlLocale !== currentLocale) {
      setLocale(urlLocale);
    }
  }, [location.pathname, currentLocale, setLocale]);
  
  // Determine current page from URL path (excluding locale prefix)
  const getCurrentPageFromPath = () => {
    const path = location.pathname;
    
    // Remove locale prefix from path for page detection
    const pathWithoutLocale = path.replace(/^\/[a-z]{2}/, '') || '/';
    
    // Handle dynamic routes
    if (pathWithoutLocale.startsWith('/city/')) return `city-${params.citySlug}`;
    if (pathWithoutLocale.startsWith('/studio/')) return `studio-${params.studioSlug}`;
    if (pathWithoutLocale.startsWith('/instructor/')) return `instructor-${params.instructorSlug}`;
    if (pathWithoutLocale.startsWith('/retreat/')) return `retreat-detail-${params.retreatSlug}`;
    if (pathWithoutLocale.startsWith('/class/')) return `class-detail-${params.classId}`;
    if (pathWithoutLocale.startsWith('/brand/')) return `brand-${params.brandSlug}`;
    
    // Handle static routes
    if (pathWithoutLocale === '/') return 'home';
    if (pathWithoutLocale === '/studios') return 'studios';
    if (pathWithoutLocale === '/instructors') return 'instructors';
    if (pathWithoutLocale === '/retreats') return 'retreats';
    if (pathWithoutLocale === '/outdoor') return 'outdoor';
    if (pathWithoutLocale === '/schedule') return 'schedule';
    if (pathWithoutLocale === '/online') return 'online';
    if (pathWithoutLocale === '/pricing') return 'pricing';
    if (pathWithoutLocale === '/checkout') return 'checkout';
    if (pathWithoutLocale === '/cart') return 'cart';
    if (pathWithoutLocale === '/login') return 'login';
    if (pathWithoutLocale === '/signup') return 'signup';
    if (pathWithoutLocale === '/onboarding') return 'onboarding';
    if (pathWithoutLocale === '/account') return 'account';
    if (pathWithoutLocale === '/bookings') return 'bookings';
    if (pathWithoutLocale === '/wallet') return 'wallet';
    if (pathWithoutLocale === '/favorites') return 'favorites';
    if (pathWithoutLocale === '/profile-settings') return 'profile-settings';
    if (pathWithoutLocale === '/teachers-circle') return 'teachers-circle';
    if (pathWithoutLocale === '/organise-retreats') return 'organise-retreats';
    if (pathWithoutLocale === '/order-success') return 'order-success';
    
    return 'home'; // default fallback
  };

  const currentPage = getCurrentPageFromPath();

  const handlePageChange = (page: string, params?: any) => {
    setPageParams(params || {});
    
    // Map page names to URL paths (without locale prefix)
    const pageToPath: Record<string, string> = {
      'home': '/',
      'studios': '/studios',
      'instructors': '/instructors',
      'retreats': '/retreats',
      'outdoor': '/outdoor',
      'schedule': '/schedule',
      'online': '/online',
      'pricing': '/pricing',
      'checkout': '/checkout',
      'cart': '/cart',
      'login': '/login',
      'signup': '/signup',
      'onboarding': '/onboarding',
      'account': '/account',
      'bookings': '/bookings',
      'wallet': '/wallet',
      'favorites': '/favorites',
      'profile-settings': '/profile-settings',
      'teachers-circle': '/teachers-circle',
      'organise-retreats': '/organise-retreats',
      'order-success': '/order-success'
    };

    // Helper function to build URL with locale prefix
    const buildUrl = (path: string) => {
      const localePrefix = currentLocale.split('-')[0]; // Get 'de' from 'de-CH'
      return `/${localePrefix}${path}`;
    };

    // Handle dynamic routes
    if (page.startsWith('city-')) {
      const citySlug = page.replace('city-', '');
      navigate(buildUrl(`/city/${citySlug}`));
    } else if (page.startsWith('studio-')) {
      const studioSlug = page.replace('studio-', '');
      navigate(buildUrl(`/studio/${studioSlug}`));
    } else if (page.startsWith('instructor-')) {
      const instructorSlug = page.replace('instructor-', '');
      navigate(buildUrl(`/instructor/${instructorSlug}`));
    } else if (page.startsWith('retreat-detail-')) {
      const retreatSlug = page.replace('retreat-detail-', '');
      navigate(buildUrl(`/retreat/${retreatSlug}`));
    } else if (page.startsWith('class-detail-')) {
      const classId = page.replace('class-detail-', '');
      navigate(buildUrl(`/class/${classId}`));
    } else if (page.startsWith('brand-')) {
      const brandSlug = page.replace('brand-', '');
      navigate(buildUrl(`/brand/${brandSlug}`));
    } else if (pageToPath[page]) {
      navigate(buildUrl(pageToPath[page]));
    } else {
      // Fallback to home
      navigate(buildUrl('/'));
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <LuxuryHomePage onPageChange={handlePageChange} />;
      case 'explore':
        return <LuxuryExplorePage onPageChange={handlePageChange} />;
      case 'schedule':
        return <SchedulePage onPageChange={handlePageChange} initialFilters={pageParams} />;
      case 'studios':
        return <StudiosPage onPageChange={handlePageChange} />;
      case 'instructors':
        return <InstructorsPage onPageChange={handlePageChange} />;
      case 'online':
        return <OnlineStudioPage onPageChange={handlePageChange} />;
      case 'pricing':
        return <PricingPage onPageChange={handlePageChange} />;
      case 'outdoor':
        return <OutdoorPage onPageChange={handlePageChange} pageParams={pageParams} />;
      case 'retreats':
        return <RetreatsPage onPageChange={handlePageChange} />;
      case 'checkout':
      case 'cart':
        return <CheckoutPage onPageChange={handlePageChange} />;
      case 'retreat-checkout':
        return <RetreatCheckoutPage onPageChange={handlePageChange} bookingData={pageParams.bookingData} />;
      case 'login':
        return <CustomerLoginPage onPageChange={handlePageChange} initialTab={pageParams.tab || 'signin'} />;
      case 'signup':
        return <CustomerLoginPage onPageChange={handlePageChange} initialTab="signup" />;
      case 'onboarding':
        return <CustomerOnboardingPage onPageChange={handlePageChange} />;
      case 'account':
      case 'bookings':
      case 'wallet':
      case 'favorites':
        return <AccountDashboardPage onPageChange={handlePageChange} />;
      case 'account-dashboard':
        return <AccountDashboardPage onPageChange={handlePageChange} />;
      case 'profile-settings':
        return <ProfileSettingsPage onPageChange={handlePageChange} />;
      case 'test-connection':
        return <TestConnectionPage />;
      case 'teachers-circle':
        return <TeachersCirclePage onPageChange={handlePageChange} />;
      case 'organise-retreats':
        return <OrganiseRetreatPage onPageChange={handlePageChange} />;
      case 'order-success':
        return <OrderSuccessPage onPageChange={handlePageChange} />;
      default:
        // Handle dynamic routes like city pages, studio profiles, etc.
        if (currentPage.startsWith('city-')) {
          const citySlug = currentPage.replace('city-', '');
          return <CityPage onPageChange={handlePageChange} citySlug={citySlug} />;
        }
        if (currentPage.startsWith('studio-')) {
          return <StudioProfilePage onPageChange={handlePageChange} />;
        }
        if (currentPage.startsWith('instructor-')) {
          return <InstructorProfilePage onPageChange={handlePageChange} />;
        }
        if (currentPage.startsWith('retreat-detail-')) {
          const retreatSlug = currentPage.replace('retreat-detail-', '');
          return <RetreatDetailPage onPageChange={handlePageChange} retreatSlug={retreatSlug} />;
        }
        if (currentPage.startsWith('class-detail-')) {
          const classId = currentPage.replace('class-detail-', '');
          return <ClassDetailPage classId={classId} onPageChange={handlePageChange} />;
        }
        if (currentPage.startsWith('brand-')) {
          const brandSlug = currentPage.replace('brand-', '');
          return <BrandPage brandSlug={brandSlug} onNavigate={handlePageChange} />;
        }
        return <LuxuryHomePage onPageChange={handlePageChange} />;
    }
  };

  return (
    <AuthProvider>
      <PortalProvider>
        <RealTimeUpdates>
          
          <PortalShell 
            currentPage={currentPage} 
            onPageChange={handlePageChange}
            onStudioRegistration={onStudioRegistration}
          >
            {renderCurrentPage()}
          </PortalShell>
        </RealTimeUpdates>
      </PortalProvider>
    </AuthProvider>
  );
}