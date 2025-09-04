import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageRouter } from './PageRouter';

interface AdminRouterProps {
  selectedTemplate?: any;
  setSelectedTemplate: (template: any) => void;
  showCreateRetreat: boolean;
  setShowCreateRetreat: (show: boolean) => void;
  editingRetreat: string | null;
  setEditingRetreat: (id: string | null) => void;
}

export function AdminRouter({
  selectedTemplate,
  setSelectedTemplate,
  showCreateRetreat,
  setShowCreateRetreat,
  editingRetreat,
  setEditingRetreat
}: AdminRouterProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Get current page from URL path
  const getCurrentPageFromPath = (): string => {
    const path = location.pathname;
    
    // Remove /admin prefix and get the page
    const adminPath = path.replace(/^\/admin/, '') || '/';
    
    // Handle dynamic routes
    if (adminPath.startsWith('/retreat/')) {
      const retreatId = adminPath.replace('/retreat/', '');
      if (retreatId) {
        setEditingRetreat(retreatId);
        return 'retreat-management';
      }
    }
    
    // Redirect /admin to /admin/dashboard
    if (adminPath === '/' && path === '/admin') {
      navigate('/admin/dashboard', { replace: true });
      return 'dashboard';
    }
    
    // Map URL paths to page keys
    const pathToPage: Record<string, string> = {
      '/': 'dashboard',
      '/dashboard': 'dashboard',
      '/schedule': 'schedule',
      '/create-class': 'create-class',
      '/customers': 'customers',
      '/instructors': 'instructors',
      '/staff': 'staff',
      '/customer-wallet': 'customer-wallet',
      '/communications': 'communications',
      '/products': 'products',
      '/packages': 'packages',
      '/orders': 'orders',
      '/invoices': 'invoices',
      '/inventory': 'inventory',
      '/marketing': 'marketing',
      '/campaigns': 'campaigns',
      '/leads': 'leads',
      '/analytics': 'analytics',
      '/finance-reports': 'finance-reports',
      '/general-settings': 'general-settings',
      '/security': 'security',
      '/brand-management': 'brand-management',
      '/locations': 'locations',
      '/booking-engine': 'booking-engine',
      '/advanced-scheduler': 'advanced-scheduler',
      '/registrations': 'registrations',
      '/cancellations': 'cancellations',
      '/community-messaging': 'community-messaging',
      '/community-class-integration': 'community-class-integration',
      '/community-notifications': 'community-notifications',
      '/moderation-queue': 'moderation-queue',
      '/programs-admin': 'programs-admin',
      '/programs-directory': 'programs-directory',
      '/programs-progress': 'programs-progress',
      '/programs-booking': 'programs-booking',
      '/retreat-management': 'retreat-management',
      '/retreats-admin': 'retreats-admin',
      '/retreats-directory': 'retreats-directory',
      '/retreat-landing': 'retreat-landing',
      '/developer-tools': 'developer-tools',
      '/database-init': 'database-init',
      '/onboarding': 'onboarding'
    };

    return pathToPage[adminPath] || 'dashboard';
  };

  // Handle page changes by updating URL
  const handlePageChange = (page: string) => {
    // Map page keys to URL paths
    const pageToPath: Record<string, string> = {
      'dashboard': '/admin/dashboard',
      'schedule': '/admin/schedule',
      'create-class': '/admin/create-class',
      'customers': '/admin/customers',
      'instructors': '/admin/instructors',
      'staff': '/admin/staff',
      'customer-wallet': '/admin/customer-wallet',
      'communications': '/admin/communications',
      'products': '/admin/products',
      'packages': '/admin/packages',
      'orders': '/admin/orders',
      'invoices': '/admin/invoices',
      'inventory': '/admin/inventory',
      'marketing': '/admin/marketing',
      'campaigns': '/admin/campaigns',
      'leads': '/admin/leads',
      'analytics': '/admin/analytics',
      'finance-reports': '/admin/finance-reports',
      'general-settings': '/admin/general-settings',
      'security': '/admin/security',
      'brand-management': '/admin/brand-management',
      'locations': '/admin/locations',
      'booking-engine': '/admin/booking-engine',
      'advanced-scheduler': '/admin/advanced-scheduler',
      'registrations': '/admin/registrations',
      'cancellations': '/admin/cancellations',
      'community-messaging': '/admin/community-messaging',
      'community-class-integration': '/admin/community-class-integration',
      'community-notifications': '/admin/community-notifications',
      'moderation-queue': '/admin/moderation-queue',
      'programs-admin': '/admin/programs-admin',
      'programs-directory': '/admin/programs-directory',
      'programs-progress': '/admin/programs-progress',
      'programs-booking': '/admin/programs-booking',
      'retreat-management': '/admin/retreat-management',
      'retreats-admin': '/admin/retreats-admin',
      'retreats-directory': '/admin/retreats-directory',
      'retreat-landing': '/admin/retreat-landing',
      'developer-tools': '/admin/developer-tools',
      'database-init': '/admin/database-init',
      'onboarding': '/admin/onboarding'
    };

    // Handle dynamic routes
    if (page.startsWith('retreat-detail-')) {
      const retreatId = page.replace('retreat-detail-', '');
      navigate(`/admin/retreat/${retreatId}`);
    } else if (pageToPath[page]) {
      navigate(pageToPath[page]);
    } else {
      // Fallback to dashboard
      navigate('/admin/dashboard');
    }
  };

  const currentPage = getCurrentPageFromPath();

  return (
    <PageRouter
      currentPage={currentPage}
      setCurrentPage={handlePageChange}
      selectedTemplate={selectedTemplate}
      setSelectedTemplate={setSelectedTemplate}
      showCreateRetreat={showCreateRetreat}
      setShowCreateRetreat={setShowCreateRetreat}
      editingRetreat={editingRetreat}
      setEditingRetreat={setEditingRetreat}
    />
  );
}
