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

interface RobustI18nProviderProps {
  children: ReactNode;
  initialLocale?: SwissLocale;
}

// Simple nested value getter
function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  try {
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
  } catch {
    return undefined;
  }
}

// Simple translator function
function createSimpleTranslator(
  locale: SwissLocale,
  translations: Record<string, any>,
  fallbackTranslations?: Record<string, any>
) {
  return function t(key: string, params?: Record<string, string | number>): string {
    try {
      // Get translation from primary locale
      let translation = getNestedValue(translations, key);
      
      // If not found, try fallback
      if (!translation && fallbackTranslations) {
        translation = getNestedValue(fallbackTranslations, key);
      }
      
      // If still not found, return the key itself
      if (!translation || typeof translation !== 'string') {
        return key;
      }
      
      // Handle parameterized translations
      if (params && typeof translation === 'string') {
        return Object.entries(params).reduce((str, [paramKey, value]) => {
          return str.replace(new RegExp(`{${paramKey}}`, 'g'), String(value));
        }, translation);
      }
      
      return translation;
    } catch (error) {
      console.warn('Translation error for key:', key, error);
      return key;
    }
  };
}

// Load translations with dynamic import instead of fetch
async function loadTranslationsWithFetch(locale: SwissLocale): Promise<Record<string, any>> {
  try {
    // Use dynamic import (more reliable in Vite)
    switch (locale) {
      case 'de-CH':
        return (await import('../../locales/de-CH.json')).default;
      case 'fr-CH':
        return (await import('../../locales/fr-CH.json')).default;
      case 'it-CH':
        return (await import('../../locales/it-CH.json')).default;
      case 'en-CH':
        return (await import('../../locales/en-CH.json')).default;
      case 'gsw':
        return (await import('../../locales/gsw.json')).default;
      default:
        return (await import('../../locales/en-CH.json')).default;
    }
  } catch (error) {
    console.warn(`Could not load translations for ${locale}:`, error);
    return {};
  }
}

export function RobustI18nProvider({ children, initialLocale }: RobustI18nProviderProps) {
  const [locale, setLocale] = useState<SwissLocale>(() => {
    try {
      if (initialLocale) return initialLocale;
      
      // Try to get from localStorage first
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('yogaswiss-locale');
        if (stored && isValidLocale(stored)) {
          return stored as SwissLocale;
        }
        
        // Try to detect from current path
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
    let mounted = true;

    async function loadLocaleTranslations() {
      setIsLoading(true);
      
      try {
        // Load primary translations
        const primaryTranslations = await loadTranslationsWithFetch(locale);
        if (mounted) {
          setTranslations(primaryTranslations);
        }
        
        // Load fallback translations (English for non-English locales)
        if (locale !== 'en-CH') {
          const englishTranslations = await loadTranslationsWithFetch('en-CH');
          if (mounted) {
            setFallbackTranslations(englishTranslations);
          }
        } else if (mounted) {
          setFallbackTranslations({});
        }
        
      } catch (error) {
        console.error('Failed to load translations:', error);
        if (mounted) {
          // Set minimal fallback translations
          setTranslations({
            common: {
              loading: 'Loading...',
              error: 'Error',
              save: 'Save',
              cancel: 'Cancel'
            }
          });
          setFallbackTranslations({});
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadLocaleTranslations();

    return () => {
      mounted = false;
    };
  }, [locale]);

  // Create translator function
  const t = useMemo(() => {
    return createSimpleTranslator(locale, translations, fallbackTranslations);
  }, [locale, translations, fallbackTranslations]);

  // Format functions
  const formatCurrency = useMemo(() => {
    return (amount: number) => {
      try {
        return formatCurrencyUtil(amount, locale);
      } catch (error) {
        console.warn('Currency formatting error:', error);
        return `CHF ${amount.toFixed(2)}`;
      }
    };
  }, [locale]);

  const formatDateTime = useMemo(() => {
    return (date: Date, options?: Intl.DateTimeFormatOptions) => {
      try {
        return formatDateTimeUtil(date, locale, options);
      } catch (error) {
        console.warn('DateTime formatting error:', error);
        return date.toLocaleDateString();
      }
    };
  }, [locale]);

  const formatNumber = useMemo(() => {
    return (number: number) => {
      try {
        return formatNumberUtil(number, locale);
      } catch (error) {
        console.warn('Number formatting error:', error);
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