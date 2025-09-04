import React, { useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  SwissLocale, 
  DEFAULT_LOCALE, 
  I18nContextType,
  I18nContext,
  formatCurrency as formatCurrencyUtil,
  formatDateTime as formatDateTimeUtil,
  formatNumber as formatNumberUtil,
  isValidLocale,
  getLocaleFromPath
} from '../../utils/i18n/index';
import { loadTranslations, createTranslator } from '../../utils/i18n/loader';

// Using I18nContext from utils/i18n/index.ts to avoid duplication

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: SwissLocale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  // Detect locale from URL or use initial/default
  const [locale, setLocale] = useState<SwissLocale>(() => {
    try {
      if (initialLocale) return initialLocale;
      
      // Try to detect from current path
      if (typeof window !== 'undefined') {
        const detectedLocale = getLocaleFromPath(window.location.pathname);
        if (detectedLocale) return detectedLocale;
      }
      
      return DEFAULT_LOCALE;
    } catch (error) {
      console.error('Error initializing locale:', error);
      return DEFAULT_LOCALE;
    }
  });

  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [fallbackTranslations, setFallbackTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations when locale changes
  useEffect(() => {
    async function loadLocaleTranslations() {
      setIsLoading(true);
      
      try {
        // Load primary translations
        const primaryTranslations = await loadTranslations(locale);
        setTranslations(primaryTranslations || {});
        
        // Load fallback translations (German for gsw, English for others)
        if (locale === 'gsw') {
          try {
            const germanTranslations = await loadTranslations('de-CH');
            setFallbackTranslations(germanTranslations || {});
          } catch (error) {
            console.warn('Could not load German fallback translations:', error);
            setFallbackTranslations({});
          }
        } else if (locale !== 'en-CH') {
          try {
            const englishTranslations = await loadTranslations('en-CH');
            setFallbackTranslations(englishTranslations || {});
          } catch (error) {
            console.warn('Could not load English fallback translations:', error);
            setFallbackTranslations({});
          }
        } else {
          setFallbackTranslations({});
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
        
        // Load default locale as fallback
        if (locale !== DEFAULT_LOCALE) {
          try {
            const defaultTranslations = await loadTranslations(DEFAULT_LOCALE);
            setTranslations(defaultTranslations || {});
          } catch (fallbackError) {
            console.error('Failed to load default locale fallback:', fallbackError);
            setTranslations({});
          }
        } else {
          setTranslations({});
        }
        setFallbackTranslations({});
      } finally {
        setIsLoading(false);
      }
    }

    loadLocaleTranslations();
  }, [locale]);

  // Update URL when locale changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const currentLocale = getLocaleFromPath(currentPath);
      
      if (currentLocale !== locale) {
        // Remove any existing locale prefix
        const pathWithoutLocale = currentPath.replace(/^\/(de-ch|fr-ch|it-ch|en-ch)/, '');
        
        // Add new locale prefix
        const newPath = locale === DEFAULT_LOCALE 
          ? pathWithoutLocale || '/'
          : `/${locale.toLowerCase()}${pathWithoutLocale || '/'}`;
        
        // Update URL without triggering navigation
        window.history.replaceState({}, '', newPath);
        
        // Update page title and meta
        updatePageMeta();
      }
    }
  }, [locale]);

  // Update page meta information
  const updatePageMeta = () => {
    if (typeof window !== 'undefined' && translations.meta) {
      document.title = translations.meta.title || 'YogaSwiss';
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && translations.meta.description) {
        metaDescription.setAttribute('content', translations.meta.description);
      }
      
      // Update meta keywords
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords && translations.meta.keywords) {
        metaKeywords.setAttribute('content', translations.meta.keywords);
      }
      
      // Update lang attribute
      document.documentElement.lang = locale;
    }
  };

  // Create translator function with error handling
  const t = useMemo(() => {
    try {
      return createTranslator(locale, translations, fallbackTranslations);
    } catch (error) {
      console.error('Failed to create translator:', error);
      return (key: string) => key; // Fallback that just returns the key
    }
  }, [locale, translations, fallbackTranslations]);

  // Format functions with locale and error handling
  const formatCurrency = useMemo(() => {
    return (amount: number) => {
      try {
        return formatCurrencyUtil(amount, locale);
      } catch (error) {
        console.error('Error formatting currency:', error);
        return `CHF ${amount.toFixed(2)}`;
      }
    };
  }, [locale]);

  const formatDateTime = useMemo(() => {
    return (date: Date, options?: Intl.DateTimeFormatOptions) => {
      try {
        return formatDateTimeUtil(date, locale, options);
      } catch (error) {
        console.error('Error formatting date/time:', error);
        return date.toLocaleDateString();
      }
    };
  }, [locale]);

  const formatNumber = useMemo(() => {
    return (number: number) => {
      try {
        return formatNumberUtil(number, locale);
      } catch (error) {
        console.error('Error formatting number:', error);
        return number.toString();
      }
    };
  }, [locale]);

  // Handle locale change
  const handleSetLocale = useMemo(() => {
    return (newLocale: SwissLocale) => {
      try {
        if (isValidLocale(newLocale)) {
          setLocale(newLocale);
          
          // Store preference in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('yogaswiss-locale', newLocale);
          }
        }
      } catch (error) {
        console.error('Error setting locale:', error);
      }
    };
  }, []);

  const contextValue: I18nContextType = useMemo(() => ({
    locale,
    setLocale: handleSetLocale,
    t,
    formatCurrency,
    formatDateTime,
    formatNumber,
  }), [locale, handleSetLocale, t, formatCurrency, formatDateTime, formatNumber]);

  // Show loading state while translations are loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading translations...</p>
        </div>
      </div>
    );
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}