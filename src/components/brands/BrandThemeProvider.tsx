import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrandService, Brand, BrandTheme } from '../../utils/supabase/brands-service';

// =============================================
// BRAND THEME CONTEXT
// =============================================

interface BrandThemeContextType {
  currentBrand: Brand | null;
  theme: BrandTheme | null;
  isLoading: boolean;
  setBrand: (brandId: string | null) => Promise<void>;
  setBrandBySlug: (slug: string) => Promise<void>;
  setBrandByEntity: (entityType: string, entityId: string, overrideBrandId?: string) => Promise<void>;
  clearBrand: () => void;
  previewMode: boolean;
  setPreviewMode: (enabled: boolean) => void;
}

const BrandThemeContext = createContext<BrandThemeContextType | undefined>(undefined);

export function useBrandTheme() {
  const context = useContext(BrandThemeContext);
  if (!context) {
    throw new Error('useBrandTheme must be used within a BrandThemeProvider');
  }
  return context;
}

// =============================================
// BRAND THEME PROVIDER
// =============================================

interface BrandThemeProviderProps {
  children: React.ReactNode;
  defaultBrandId?: string;
  fallbackTheme?: Partial<BrandTheme>;
}

export function BrandThemeProvider({ 
  children, 
  defaultBrandId,
  fallbackTheme
}: BrandThemeProviderProps) {
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [theme, setTheme] = useState<BrandTheme | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [appliedVersion, setAppliedVersion] = useState<number>(0);

  // Default fallback theme
  const defaultTheme: BrandTheme = {
    color: {
      primary: '#030213',
      secondary: '#F3B61F',
      accent: '#2ECC71',
      onPrimary: '#FFFFFF',
      surface: '#FFFFFF',
      onSurface: '#111111'
    },
    typography: {
      brandFont: 'Inter:600',
      bodyFont: 'Inter:400'
    },
    radius: {
      sm: 8,
      md: 12,
      lg: 20
    },
    elevation: {
      card: 8
    },
    email: {
      headerBg: '#030213'
    },
    ...fallbackTheme
  };

  // Load brand and apply theme
  const setBrand = async (brandId: string | null) => {
    if (!brandId) {
      clearBrand();
      return;
    }

    setIsLoading(true);
    try {
      const brand = await BrandService.getBrand(brandId);
      if (brand) {
        setCurrentBrand(brand);
        setTheme(brand.theme);
        applyThemeToDOM(brand.theme, brand.version);
        
        // Track brand view (don't await to avoid blocking)
        BrandService.trackEvent(brand.id, 'page_view', {
          pagePath: window.location.pathname,
          referrer: document.referrer
        }).catch(err => console.warn('Failed to track brand event:', err));
      }
    } catch (error) {
      console.error('Failed to load brand:', error);
      // Fall back to default theme
      setTheme(defaultTheme);
      applyThemeToDOM(defaultTheme);
    } finally {
      setIsLoading(false);
    }
  };

  // Load brand by slug
  const setBrandBySlug = async (slug: string) => {
    setIsLoading(true);
    try {
      const brand = await BrandService.getBrandBySlug(slug);
      if (brand) {
        setCurrentBrand(brand);
        setTheme(brand.theme);
        applyThemeToDOM(brand.theme, brand.version);
        
        // Track brand view (don't await to avoid blocking)
        BrandService.trackEvent(brand.id, 'page_view', {
          pagePath: window.location.pathname,
          referrer: document.referrer
        }).catch(err => console.warn('Failed to track brand event:', err));
      }
    } catch (error) {
      console.error('Failed to load brand by slug:', error);
      setTheme(defaultTheme);
      applyThemeToDOM(defaultTheme);
    } finally {
      setIsLoading(false);
    }
  };

  // Load brand by entity (studio, instructor, class, etc.)
  const setBrandByEntity = async (
    entityType: string, 
    entityId: string, 
    overrideBrandId?: string
  ) => {
    setIsLoading(true);
    try {
      const brand = await BrandService.resolveEntityBrand(
        entityType as any,
        entityId,
        overrideBrandId
      );
      
      if (brand) {
        setCurrentBrand(brand);
        setTheme(brand.theme);
        applyThemeToDOM(brand.theme, brand.version);
        
        // Track brand view with entity context (don't await to avoid blocking)
        BrandService.trackEvent(brand.id, 'page_view', {
          entityType,
          entityId,
          pagePath: window.location.pathname,
          referrer: document.referrer
        }).catch(err => console.warn('Failed to track brand event:', err));
      } else {
        // No brand found, use default
        setTheme(defaultTheme);
        applyThemeToDOM(defaultTheme);
      }
    } catch (error) {
      console.error('Failed to resolve entity brand:', error);
      setTheme(defaultTheme);
      applyThemeToDOM(defaultTheme);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear current brand and revert to default
  const clearBrand = () => {
    setCurrentBrand(null);
    setTheme(defaultTheme);
    applyThemeToDOM(defaultTheme);
  };

  // Apply theme to DOM
  const applyThemeToDOM = (brandTheme: BrandTheme, version?: number) => {
    const root = document.documentElement;
    
    // Only apply if this is a newer version or first application
    if (version && version <= appliedVersion) {
      return;
    }
    
    // Remove existing brand data attribute
    root.removeAttribute('data-brand');
    root.removeAttribute('data-brand-version');
    
    // Generate CSS variables
    const cssVars = BrandService.generateCSSVariables(brandTheme);
    
    // Apply as CSS custom properties
    const style = root.style;
    
    // Colors
    Object.entries(brandTheme.color).forEach(([key, value]) => {
      const cssVar = `--brand-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      style.setProperty(cssVar, value);
    });
    
    // Typography
    if (brandTheme.typography.brandFont) {
      style.setProperty('--brand-font', brandTheme.typography.brandFont);
    }
    if (brandTheme.typography.bodyFont) {
      style.setProperty('--brand-body-font', brandTheme.typography.bodyFont);
    }
    
    // Radius
    Object.entries(brandTheme.radius).forEach(([key, value]) => {
      style.setProperty(`--brand-radius-${key}`, `${value}px`);
    });
    
    // Elevation
    if (brandTheme.elevation.card) {
      style.setProperty('--brand-elevation-card', `${brandTheme.elevation.card}px`);
    }
    
    // Email
    if (brandTheme.email.headerBg) {
      style.setProperty('--brand-email-header-bg', brandTheme.email.headerBg);
    }
    
    // Set data attributes for CSS targeting
    if (currentBrand) {
      root.setAttribute('data-brand', currentBrand.slug);
      if (version) {
        root.setAttribute('data-brand-version', version.toString());
        setAppliedVersion(version);
      }
    }
    
    // Add preview mode class
    if (previewMode) {
      root.classList.add('brand-preview-mode');
    } else {
      root.classList.remove('brand-preview-mode');
    }
  };

  // Load default brand on mount
  useEffect(() => {
    if (defaultBrandId) {
      setBrand(defaultBrandId);
    } else {
      // Apply default theme
      setTheme(defaultTheme);
      applyThemeToDOM(defaultTheme);
    }
  }, [defaultBrandId]);

  // Re-apply theme when preview mode changes
  useEffect(() => {
    if (theme) {
      applyThemeToDOM(theme, currentBrand?.version);
    }
  }, [previewMode]);

  // Listen for brand updates (version changes)
  useEffect(() => {
    if (!currentBrand) return;

    const checkForUpdates = async () => {
      try {
        const updated = await BrandService.getBrand(currentBrand.id);
        if (updated && updated.version > currentBrand.version) {
          setCurrentBrand(updated);
          setTheme(updated.theme);
          applyThemeToDOM(updated.theme, updated.version);
        }
      } catch (error) {
        console.error('Failed to check for brand updates:', error);
      }
    };

    // Check for updates every 30 seconds
    const interval = setInterval(checkForUpdates, 30000);
    return () => clearInterval(interval);
  }, [currentBrand]);

  const value: BrandThemeContextType = {
    currentBrand,
    theme,
    isLoading,
    setBrand,
    setBrandBySlug,
    setBrandByEntity,
    clearBrand,
    previewMode,
    setPreviewMode
  };

  return (
    <BrandThemeContext.Provider value={value}>
      {children}
    </BrandThemeContext.Provider>
  );
}

// =============================================
// BRAND AWARE COMPONENTS
// =============================================

// Hook to get brand-aware styling
export function useBrandStyles() {
  const { theme, currentBrand } = useBrandTheme();
  
  const getBrandStyle = (property: string, fallback?: string) => {
    if (!theme) return fallback;
    
    // Map common style properties to brand theme
    switch (property) {
      case 'primaryColor':
        return theme.color.primary;
      case 'secondaryColor':
        return theme.color.secondary;
      case 'accentColor':
        return theme.color.accent;
      case 'backgroundColor':
        return theme.color.surface;
      case 'textColor':
        return theme.color.onSurface;
      case 'primaryTextColor':
        return theme.color.onPrimary;
      case 'borderRadius':
        return `${theme.radius.md}px`;
      case 'borderRadiusSmall':
        return `${theme.radius.sm}px`;
      case 'borderRadiusLarge':
        return `${theme.radius.lg}px`;
      case 'brandFont':
        return theme.typography.brandFont;
      case 'bodyFont':
        return theme.typography.bodyFont;
      default:
        return fallback;
    }
  };

  const getBrandClassName = (baseClass: string = '') => {
    if (!currentBrand) return baseClass;
    return `${baseClass} brand-${currentBrand.slug}`.trim();
  };

  return {
    getBrandStyle,
    getBrandClassName,
    theme,
    brand: currentBrand
  };
}

// Higher-order component for brand-aware styling
export function withBrandTheme<P extends object>(
  Component: React.ComponentType<P>
) {
  return function BrandAwareComponent(props: P) {
    const brandStyles = useBrandStyles();
    
    return (
      <Component 
        {...props} 
        brandStyles={brandStyles}
      />
    );
  };
}

// =============================================
// BRAND PREVIEW OVERLAY
// =============================================

interface BrandPreviewOverlayProps {
  children: React.ReactNode;
}

export function BrandPreviewOverlay({ children }: BrandPreviewOverlayProps) {
  const { previewMode, currentBrand, setPreviewMode } = useBrandTheme();
  
  if (!previewMode) {
    return <>{children}</>;
  }
  
  return (
    <div className="relative">
      {/* Preview Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-2 text-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>
            Brand Preview Mode {currentBrand && `- ${currentBrand.name}`}
          </span>
        </div>
        <button 
          onClick={() => setPreviewMode(false)}
          className="px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
        >
          Exit Preview
        </button>
      </div>
      
      {/* Content with top padding to account for banner */}
      <div className="pt-10">
        {children}
      </div>
    </div>
  );
}

// =============================================
// UTILITY HOOKS
// =============================================

// Hook to resolve brand from URL or context
export function useBrandFromContext() {
  const { setBrandBySlug, setBrandByEntity } = useBrandTheme();
  
  useEffect(() => {
    const path = window.location.pathname;
    
    // Check for brand page URLs (/b/{slug})
    const brandMatch = path.match(/^\/b\/([^\/]+)/);
    if (brandMatch) {
      setBrandBySlug(brandMatch[1]);
      return;
    }
    
    // Check for studio URLs (/studios/{slug})
    const studioMatch = path.match(/^\/studios\/([^\/]+)/);
    if (studioMatch) {
      // In real app, resolve studio slug to ID
      setBrandByEntity('studio', studioMatch[1]);
      return;
    }
    
    // Check for instructor URLs (/instructors/{slug})
    const instructorMatch = path.match(/^\/instructors\/([^\/]+)/);
    if (instructorMatch) {
      setBrandByEntity('instructor', instructorMatch[1]);
      return;
    }
    
    // Could add more URL patterns as needed
  }, [setBrandBySlug, setBrandByEntity]);
}

// Hook for tracking brand analytics
export function useBrandAnalytics() {
  const { currentBrand } = useBrandTheme();
  
  const track = async (
    eventType: string, 
    context?: Record<string, any>
  ) => {
    if (!currentBrand) return;
    
    await BrandService.trackEvent(currentBrand.id, eventType, {
      pagePath: window.location.pathname,
      referrer: document.referrer,
      ...context
    });
  };
  
  return { track };
}