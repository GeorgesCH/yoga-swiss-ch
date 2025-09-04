import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Settings, BarChart3, CreditCard, MessageSquare, Package, 
  Mountain, RefreshCw, ClipboardList, UserCheck, Home, ChevronDown, Building2,
  Clock, Receipt, Megaphone, UserCog, Shield, Bell, Wallet, Smartphone, FileText,
  Activity, Globe, Zap, CalendarClock, CalendarPlus, Code2, Palette
} from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

import { OrgHierarchySwitcher } from './auth/OrgHierarchySwitcher';
import { useMultiTenantAuth } from './auth/MultiTenantAuthProvider';

import { UserAccountMenu } from './UserAccountMenu';
import { CompactLanguageSwitcher } from './i18n/EnhancedLanguageSwitcher';
import { useTranslation } from './i18n/ComprehensiveI18nProvider';

interface DashboardShellProps {
  children: React.ReactNode;
  currentPage?: string; // Optional, derived from URL now
  onPageChange?: (page: string) => void; // Optional, using router navigation now
}

interface NavigationItem {
  name: string;
  key: string;
  icon: React.ElementType;
  badge?: string;
  children?: NavigationItem[];
}

export function DashboardShell({ children, currentPage = 'dashboard', onPageChange }: DashboardShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['people', 'classes', 'shop', 'marketing', 'finance', 'settings', 'community']);

  const { currentOrg, locations, hasPermission } = useMultiTenantAuth();
  const { t } = useTranslation();

  // Get current page from URL
  const getCurrentPageFromUrl = (): string => {
    const path = location.pathname;
    const adminPath = path.replace(/^\/admin/, '') || '/';
    
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

    return pathToPage[adminPath] || currentPage || 'dashboard';
  };

  // Handle navigation using router instead of callback
  const handleNavigate = (page: string) => {
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

    if (pageToPath[page]) {
      navigate(pageToPath[page]);
    } else {
      // Fallback to dashboard
      navigate('/admin/dashboard');
    }
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupKey) 
        ? prev.filter(key => key !== groupKey)
        : [...prev, groupKey]
    );
  };

  const navigation: NavigationItem[] = [
    { 
      name: t('navigation.overview') || 'Overview', 
      key: 'dashboard', 
      icon: Home
    },
    {
      name: 'People',
      key: 'people',
      icon: Users,
      children: [
        { name: t('navigation.customers') || 'Customers', key: 'customers', icon: Users },
        { name: t('navigation.instructors') || 'Instructors', key: 'instructors', icon: UserCog },
        { name: 'Staff Management', key: 'staff', icon: UserCheck },
        { name: 'Customer Wallets', key: 'customer-wallet', icon: Wallet },
        { name: 'Communications', key: 'communications', icon: MessageSquare },
      ]
    },
    {
      name: 'Classes',
      key: 'classes',
      icon: Calendar,
      children: [
        { name: 'Class Schedule', key: 'schedule', icon: Calendar },
        { name: 'Booking Engine', key: 'booking-engine', icon: CalendarPlus },
        { name: 'Advanced Scheduling', key: 'advanced-scheduling', icon: CalendarClock },
        { name: 'Recurring Classes', key: 'recurring-classes', icon: RefreshCw },
        { name: 'Registrations', key: 'registrations', icon: ClipboardList, badge: '3' },
        { name: 'Registration System', key: 'comprehensive-registration', icon: UserCheck },
        { name: 'Cancellation & Refunds', key: 'cancellation-refund', icon: RefreshCw },
        { name: 'Locations & Resources', key: 'locations', icon: MapPin },
        { name: 'Outdoor Locations', key: 'outdoor-locations', icon: Mountain },
        { name: 'Retreat Management', key: 'retreats', icon: Mountain },
        { name: 'Programs & Services', key: 'programs-admin', icon: ClipboardList },
      ]
    },
    {
      name: 'Shop',
      key: 'shop',
      icon: Package,
      children: [
        { name: 'Products', key: 'products', icon: Package },
        { name: 'Pricing & Packages', key: 'pricing', icon: Receipt },
        { name: 'Inventory', key: 'inventory', icon: Package },
      ]
    },
    {
      name: 'Marketing',
      key: 'marketing',
      icon: Megaphone,
      children: [
        { name: 'Campaign Management', key: 'marketing', icon: Megaphone },
        { name: 'Customer Segments', key: 'segments', icon: Users },
        { name: 'Analytics & Reports', key: 'analytics', icon: FileText },
        { name: 'Business Growth', key: 'business-growth', icon: BarChart3 },
        { name: 'Automations', key: 'automations', icon: Zap },
      ]
    },
    {
      name: 'Finance',
      key: 'finance',
      icon: CreditCard,
      children: [
        { name: 'Finance Overview', key: 'finance', icon: Receipt },
        { name: 'Payments & Billing', key: 'payments', icon: CreditCard },
        { name: 'Swiss Payments', key: 'swiss-payments', icon: Smartphone },
        { name: 'Wallet Management', key: 'wallets', icon: Wallet },
        { name: 'Financial Reports', key: 'finance-reports', icon: FileText },
      ]
    },
    {
      name: 'Community',
      key: 'community',
      icon: MessageSquare,
      children: [
        { name: 'Messaging & Inbox', key: 'community-messaging', icon: MessageSquare },
        { name: 'Class Integration', key: 'community-class-integration', icon: Users },
        { name: 'Notifications', key: 'community-notifications', icon: Bell },
        { name: 'Moderation Queue', key: 'moderation-queue', icon: Shield },
      ]
    },
    {
      name: 'Settings',
      key: 'settings',
      icon: Settings,
      children: [
        { name: 'General Settings', key: 'settings', icon: Settings },
        { name: 'Brand Management', key: 'brand-management', icon: Palette },
        { name: 'System Health', key: 'system-health', icon: Activity },
        { name: 'API & Integrations', key: 'integrations', icon: Globe },
        { name: 'Compliance & Legal', key: 'compliance', icon: Shield },
        { name: 'Security', key: 'security', icon: Shield },
        { name: 'Database Setup', key: 'database-init', icon: RefreshCw },
        { name: 'Developer Tools', key: 'developer-tools', icon: Code2 },
      ]
    },
  ];

  const renderNavigationItem = (item: NavigationItem, depth = 0) => {
    const currentActivePage = getCurrentPageFromUrl();
    const isActive = currentActivePage === item.key;
    const isExpanded = expandedGroups.includes(item.key);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <Collapsible key={item.key} open={isExpanded} onOpenChange={() => toggleGroup(item.key)}>
          <div className="flex">
            <button
              onClick={() => handleNavigate(item.key)}
              className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                depth > 0 ? 'ml-4' : ''
              } ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.name}</span>
              {item.badge && (
                <Badge variant="destructive" className="h-5 text-xs px-1">
                  {item.badge}
                </Badge>
              )}
            </button>
            <CollapsibleTrigger asChild>
              <button className="px-2 py-2 text-muted-foreground hover:text-foreground">
                <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-1 mt-1">
            {item.children?.map(child => renderNavigationItem(child, depth + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <button
        key={item.key}
        onClick={() => handleNavigate(item.key)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          depth > 0 ? 'ml-4' : ''
        } ${
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        <item.icon className="h-4 w-4" />
        <span className="flex-1 text-left">{item.name}</span>
        {item.badge && (
          <Badge variant="destructive" className="h-5 text-xs px-1">
            {item.badge}
          </Badge>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-forest to-forest-light flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">YS</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-semibold text-foreground">YogaSwiss</span>
                <div className="text-xs text-muted-foreground">Switzerland #1 Yoga Platform</div>
              </div>
            </div>

            {/* Organization Hierarchy Switcher */}
            <OrgHierarchySwitcher />
            
            {/* Production Mode Indicator */}
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
              🇨🇭 Supabase Online
            </Badge>

            {/* Context Filters */}
            <div className="hidden lg:flex items-center gap-2">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-36">
                  <MapPin className="h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <Clock className="h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7days">7 Days</SelectItem>
                  <SelectItem value="30days">30 Days</SelectItem>
                  <SelectItem value="90days">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions & Alerts */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <CompactLanguageSwitcher />

            {/* Status Indicators */}
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">
                CHF 2,450 Payout Pending
              </Badge>
            </div>

            {/* Quick Actions */}
            <Button size="sm" className="hidden sm:flex">
              <Calendar className="h-4 w-4 mr-2" />
              {t('common.create') || 'Create'}
            </Button>

            {/* User Account Menu */}
            <UserAccountMenu onPageChange={handleNavigate} />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 border-r border-border bg-card h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-4 space-y-2">
            <div className="space-y-1">
              {navigation.map(item => renderNavigationItem(item))}
            </div>

            <Separator className="my-4" />

            {/* Quick Stats */}
            <div className="px-3 py-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">Today's Overview</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Classes</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Bookings</span>
                  <span className="font-medium text-green-600">142</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-medium">CHF 3,240</span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Support */}
            <div className="px-3 py-2">
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                <Shield className="h-3 w-3 mr-2" />
                Help & Support
              </Button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}