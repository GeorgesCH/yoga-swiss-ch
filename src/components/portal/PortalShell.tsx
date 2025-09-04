import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePortal } from './PortalProvider';
import { useTranslation, SWISS_LOCALES, SWISS_LOCALE_NAMES } from '../i18n/ComprehensiveI18nProvider';
import { getLocaleFromPath, type SwissLocale } from '../../utils/i18n';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, VisuallyHidden } from '../ui/sheet';
import { Separator } from '../ui/separator';
import { 
  MapPin, 
  ShoppingCart, 
  User, 
  Menu, 
  Globe,
  Heart,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  MoreHorizontal,
  Users,
  Building,
  Languages,
  GraduationCap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { LuxuryFooter } from '../ui/luxury-footer';

interface PortalShellProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  onStudioRegistration?: () => void;
}

export function PortalShell({ children, currentPage, onPageChange, onStudioRegistration }: PortalShellProps) {
  const { 
    currentLocation, 
    setCurrentLocation,
    locations,
    cart,
    cartTotal,
    isAuthenticated,
    customerProfile,
    logout
  } = usePortal();
  
  // Use translation system
  const { t, locale, setLocale, formatCurrency } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get current locale from URL
  const currentLocale = getLocaleFromPath(location.pathname) || 'de-CH';

  // Sync i18n locale with URL locale
  useEffect(() => {
    const urlLocale = getLocaleFromPath(location.pathname);
    if (urlLocale && urlLocale !== locale) {
      setLocale(urlLocale);
    }
  }, [location.pathname, locale, setLocale]);
  
  // Helper function to build URL with locale prefix
  const buildUrl = (path: string) => {
    const localePrefix = currentLocale.split('-')[0]; // Get 'de' from 'de-CH'
    return `/${localePrefix}${path}`;
  };

  // Handle locale switching
  const handleLocaleChange = (newLocale: SwissLocale) => {
    // Get current path without locale prefix
    const pathWithoutLocale = location.pathname.replace(/^\/[a-z]{2}/, '') || '/';
    
    // Build new URL with new locale
    const newLocalePrefix = newLocale.split('-')[0]; // Get 'de' from 'de-CH'
    const newUrl = `/${newLocalePrefix}${pathWithoutLocale}`;
    
    // Navigate to new URL
    navigate(newUrl);
    
    // Update locale in i18n system
    setLocale(newLocale);
  };

  const navigationItems = [
    { id: 'studios', label: t('portal.navigation.studios'), href: buildUrl('/studios') },
    { id: 'instructors', label: t('portal.navigation.instructors'), href: buildUrl('/instructors') },
    { id: 'retreats', label: t('portal.navigation.retreats'), href: buildUrl('/retreats') },
    { id: 'outdoor', label: t('portal.navigation.outdoor'), href: buildUrl('/outdoor') }
  ];

  const accountItems = [
    { id: 'bookings', label: t('portal.navigation.bookings'), icon: Calendar, href: buildUrl('/bookings') },
    { id: 'wallet', label: t('portal.navigation.wallet'), icon: CreditCard, href: buildUrl('/wallet') },
    { id: 'favorites', label: t('portal.account.favorites'), icon: Heart, href: buildUrl('/favorites') },
    { id: 'account', label: t('portal.navigation.settings'), icon: Settings, href: buildUrl('/account') }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Rounded Sticky Header */}
      <div className="sticky top-0 z-50 w-full px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-background/95 backdrop-blur-xl border border-border/40 rounded-3xl shadow-xl shadow-black/5">
            <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[var(--champagne)]/50 to-transparent rounded-t-3xl" />
            <div className="px-8 py-5">
              <div className="flex h-14 items-center justify-between">
                {/* Logo with Serif Font - Left Aligned */}
                <div className="flex items-center justify-start flex-1">
                  <button 
                    onClick={() => onPageChange('home')}
                    className="group transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <div className="flex flex-col items-start">
                      <span 
                        className="text-2xl font-bold text-foreground tracking-tight"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        YogaSwiss
                      </span>
                      <span className="text-xs text-muted-foreground font-medium -mt-1">
                        {t('portal.hero.subtitle', 'Switzerland #1 Yoga Platform')}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Desktop Navigation - Centered */}
                <nav className="hidden lg:flex items-center gap-10">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.id}
                      to={item.href}
                      className={`text-sm font-medium transition-all duration-300 hover:text-[var(--champagne)] relative group ${
                        location.pathname === item.href 
                          ? 'text-[var(--champagne)]' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      {item.label}
                      {location.pathname === item.href && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[var(--champagne)] rounded-full"></div>
                      )}
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[var(--champagne)]/80 rounded-full transition-all duration-300 group-hover:w-4"></div>
                    </Link>
                  ))}
                </nav>

                {/* Right side items */}
                <div className="flex items-center gap-5 flex-1 justify-end">
                  {/* Join Button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary hover:text-primary rounded-2xl px-4 py-2 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                      >
                        <Users className="h-4 w-4" />
                        <span className="hidden md:inline font-medium">{t('portal.navigation.join_community', 'Join')}</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 rounded-2xl">
                      <div className="px-4 py-3 bg-gradient-to-r from-primary/5 to-accent/5">
                        <p className="text-sm font-semibold text-foreground">{t('portal.community.title', 'Join YogaSwiss')}</p>
                        <p className="text-xs text-muted-foreground">{t('portal.community.subtitle', 'Grow your yoga business')}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onStudioRegistration?.()}
                        className="py-3 cursor-pointer rounded-xl m-1"
                      >
                        <Building className="h-5 w-5 mr-3 text-primary" />
                        <div className="flex flex-col">
                          <span className="font-medium">{t('portal.community.studio_register', 'Register Your Studio')}</span>
                          <span className="text-xs text-muted-foreground">{t('portal.community.studio_description', 'Manage bookings & payments')}</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onStudioRegistration?.()}
                        className="py-3 cursor-pointer rounded-xl m-1"
                      >
                        <GraduationCap className="h-5 w-5 mr-3 text-primary" />
                        <div className="flex flex-col">
                          <span className="font-medium">{t('portal.community.instructor_join', 'Join as Instructor')}</span>
                          <span className="text-xs text-muted-foreground">{t('portal.community.instructor_description', 'Teach yoga across Switzerland')}</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Language Selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2 hover:bg-accent rounded-2xl px-3 py-2 transition-all duration-300">
                        <Languages className="h-4 w-4 text-muted-foreground" />
                        <span className="hidden sm:inline font-medium text-sm">{SWISS_LOCALE_NAMES[currentLocale]}</span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                      {Object.entries(SWISS_LOCALE_NAMES).map(([code, name]) => (
                        <DropdownMenuItem
                          key={code}
                          onClick={() => handleLocaleChange(code as SwissLocale)}
                          className={`rounded-xl m-1 transition-all duration-200 ${
                            currentLocale === code 
                              ? 'bg-primary/10 text-primary border border-primary/20' 
                              : 'hover:bg-secondary/10 hover:text-primary'
                          }`}
                        >
                          <span className="text-sm font-medium">{name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Location Selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2 hover:bg-accent rounded-2xl px-3 py-2 transition-all duration-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="hidden lg:inline font-medium">{currentLocation?.name}</span>
                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 rounded-2xl">
                      <div className="px-3 py-2 bg-gradient-to-r from-accent/5 to-primary/5">
                        <p className="text-sm font-medium">{t('portal.navigation.cities', 'Cities')}</p>
                        <p className="text-xs text-muted-foreground">{t('portal.navigation.select_location', 'Select your location')}</p>
                      </div>
                      <DropdownMenuSeparator />
                      {locations.map((location) => (
                                                <DropdownMenuItem
                          key={location.id}
                          onClick={() => setCurrentLocation(location)}
                          className={`rounded-xl m-1 transition-all duration-200 ${
                            currentLocation?.id === location.id 
                              ? 'bg-primary/10 text-primary border border-primary/20' 
                              : 'hover:bg-secondary/10 hover:text-primary'
                          }`}
                        >
                        <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-medium">{location.name}</span>
                          <span className="text-xs text-muted-foreground">{location.canton}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="rounded-xl m-1">
                      <Globe className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span>{t('portal.navigation.detect_location', 'Detect location')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Enhanced Shopping Cart */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative hover:bg-accent/80 transition-all duration-300 group rounded-2xl p-3 hover:shadow-lg hover:shadow-primary/10 border border-transparent hover:border-primary/20"
                  onClick={() => onPageChange('cart')}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <ShoppingCart className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                      {cart.length > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 text-[10px] bg-primary text-primary-foreground border-2 border-background animate-pulse rounded-full flex items-center justify-center font-bold">
                          {cart.length}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground font-medium group-hover:text-primary transition-colors duration-300">{t('portal.navigation.cart', 'Cart')}</span>
                      <span className="text-sm font-bold -mt-0.5 text-foreground group-hover:text-primary transition-colors duration-300">{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>
                </Button>

                <Separator orientation="vertical" className="h-8" />

                {/* User Account */}
                {isAuthenticated && customerProfile ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-14 px-4 hover:bg-accent rounded-2xl transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                            <AvatarImage src={customerProfile.profileImage} alt={customerProfile.firstName} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {customerProfile.firstName[0]}{customerProfile.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="hidden sm:flex flex-col items-start">
                            <span className="text-sm font-medium">{customerProfile.firstName}</span>
                            <span className="text-xs text-muted-foreground">{customerProfile.creditsBalance} {t('portal.navigation.credits', 'credits')}</span>
                          </div>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72 rounded-2xl" align="end" forceMount>
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-accent/5">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={customerProfile.profileImage} alt={customerProfile.firstName} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {customerProfile.firstName[0]}{customerProfile.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="font-medium">{customerProfile.firstName} {customerProfile.lastName}</p>
                          <p className="text-sm text-muted-foreground truncate">{customerProfile.email}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">{customerProfile.creditsBalance} {t('portal.navigation.credits', 'credits')}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      {accountItems.map((item) => (
                        <DropdownMenuItem
                          key={item.id}
                          onClick={() => onPageChange(item.id)}
                          className="py-3 rounded-xl m-1"
                        >
                          <item.icon className="mr-3 h-4 w-4 text-muted-foreground" />
                          <span>{item.label}</span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        logout();
                        onPageChange('home');
                      }} className="py-3 text-destructive focus:text-destructive rounded-lg m-1">
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>{t('portal.account.logout', 'Log out')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => onPageChange('login')} className="hover:bg-accent rounded-xl">
                      {t('auth.login.cta', 'Log in')}
                    </Button>
                    <Button size="sm" onClick={() => onPageChange('signup')} className="bg-[var(--champagne)] text-[var(--forest)] hover:bg-[var(--champagne-dark)] rounded-xl">
                      {t('auth.signup.cta', 'Sign up')}
                    </Button>
                  </div>
                )}

                {/* Mobile Menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="lg:hidden ml-2 rounded-xl">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    {/* Accessibility Title and Description */}
                    <VisuallyHidden>
                      <SheetTitle>{t('portal.navigation.mobile_menu', 'Navigation Menu')}</SheetTitle>
                      <SheetDescription>
                        {t('portal.navigation.mobile_menu_description', 'Mobile navigation menu for YogaSwiss platform. Access account settings, explore classes, and navigate through the platform.')}
                      </SheetDescription>
                    </VisuallyHidden>
                    
                    <div className="flex flex-col gap-6">
                      {/* Mobile Header */}
                      <div className="flex items-center gap-3 pb-4 border-b">
                        <div>
                          <h2 className="font-bold" style={{ fontFamily: 'var(--font-serif)' }}>YogaSwiss</h2>
                          <p className="text-sm text-muted-foreground">{t('portal.hero.subtitle', 'Switzerland #1 Yoga Platform')}</p>
                        </div>
                      </div>
                      
                      {/* Navigation */}
                      <nav className="flex flex-col gap-1">
                        <h3 className="font-medium text-sm text-muted-foreground mb-2">{t('common.navigation', 'Navigation')}</h3>
                        {navigationItems.map((item) => (
                          <Link
                            key={item.id}
                            to={item.href}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors h-11 ${
                              location.pathname === item.href 
                                ? 'bg-accent text-accent-foreground' 
                                : 'hover:bg-accent/50'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </nav>
                      
                      {isAuthenticated && (
                        <>
                          <Separator />
                          <div className="flex flex-col gap-1">
                            <h3 className="font-medium text-sm text-muted-foreground mb-2">{t('portal.navigation.account', 'Account')}</h3>
                            {accountItems.map((item) => (
                              <Link
                                key={item.id}
                                to={item.href}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors h-11 ${
                                  location.pathname === item.href 
                                    ? 'bg-accent text-accent-foreground' 
                                    : 'hover:bg-accent/50'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <item.icon className="mr-3 h-4 w-4" />
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                      
                      <Separator />
                      
                      {/* Studio Management Section */}
                      <div className="flex flex-col gap-1">
                        <h3 className="font-medium text-sm text-muted-foreground mb-2">{t('portal.community.title', 'Join YogaSwiss')}</h3>
                        <Button
                          variant="ghost"
                          className="justify-start h-11 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                          onClick={() => {
                            onStudioRegistration?.();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <Building className="mr-3 h-4 w-4" />
                          {t('portal.community.studio_register', 'Register Your Studio')}
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start h-11 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                          onClick={() => {
                            onStudioRegistration?.();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <GraduationCap className="mr-3 h-4 w-4" />
                          {t('portal.community.instructor_join', 'Join as Instructor')}
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      <LuxuryFooter onPageChange={onPageChange} onStudioRegistration={onStudioRegistration} />
    </div>
  </div>
  );
}
