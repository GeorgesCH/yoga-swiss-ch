import React, { useState, useEffect, ReactNode, useMemo, createContext, useContext } from 'react';

// Swiss locales
export type SwissLocale = 'de-CH' | 'fr-CH' | 'it-CH' | 'en-CH';
export const DEFAULT_LOCALE: SwissLocale = 'de-CH';

export interface I18nContextType {
  locale: SwissLocale;
  setLocale: (locale: SwissLocale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number) => string;
  formatDateTime: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number) => string;
  isLoading: boolean;
  error: string | null;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface ComprehensiveI18nProviderProps {
  children: ReactNode;
  initialLocale?: SwissLocale;
}

// Simple nested value getter
function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj);
}

// Swiss locale validation
function isValidLocale(locale: string): locale is SwissLocale {
  return ['de-CH', 'fr-CH', 'it-CH', 'en-CH'].includes(locale);
}

// Load translations dynamically
async function loadTranslations(locale: SwissLocale): Promise<Record<string, any>> {
  try {
    // Try dynamic import first (more reliable in Vite)
    try {
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
    } catch (importError) {
      console.warn(`Dynamic import failed for ${locale}, trying fetch:`, importError);
      
      // Fallback to fetch
      const response = await fetch(`/locales/${locale}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${locale}`);
      }
      return await response.json();
    }
  } catch (error) {
    console.warn(`Could not load translations for ${locale}:`, error);
    // Return fallback minimal translations
    return {
      common: {
        loading: locale === 'de-CH' ? 'Lädt...' : 
                 locale === 'fr-CH' ? 'Chargement...' :
                 locale === 'it-CH' ? 'Caricamento...' : 'Loading...',
        error: locale === 'de-CH' ? 'Fehler' : 
               locale === 'fr-CH' ? 'Erreur' :
               locale === 'it-CH' ? 'Errore' : 'Error',
        save: locale === 'de-CH' ? 'Speichern' : 
              locale === 'fr-CH' ? 'Enregistrer' :
              locale === 'it-CH' ? 'Salva' : 'Save',
        cancel: locale === 'de-CH' ? 'Abbrechen' : 
                locale === 'fr-CH' ? 'Annuler' :
                locale === 'it-CH' ? 'Annulla' : 'Cancel'
      }
    };
  }
}

// Create translator function
function createTranslator(
  translations: Record<string, any>,
  fallbackTranslations?: Record<string, any>
) {
  return function t(key: string, params?: Record<string, string | number>): string {
    // Get translation from primary locale
    let translation = getNestedValue(translations, key);
    
    // If not found, try fallback
    if (!translation && fallbackTranslations) {
      translation = getNestedValue(fallbackTranslations, key);
    }
    
    // If still not found, return the key itself
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    // Handle parameterized translations
    if (params && typeof translation === 'string') {
      return Object.entries(params).reduce((str, [paramKey, value]) => {
        return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
      }, translation);
    }
    
    return translation;
  };
}

// Swiss-specific formatters
function formatSwissCurrency(amount: number, locale: SwissLocale): string {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formatter.format(amount);
  } catch (error) {
    return `CHF ${amount.toFixed(2)}`;
  }
}

function formatSwissDateTime(date: Date, locale: SwissLocale, options?: Intl.DateTimeFormatOptions): string {
  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Zurich',
      ...options
    };
    const formatter = new Intl.DateTimeFormat(locale, defaultOptions);
    return formatter.format(date);
  } catch (error) {
    return date.toLocaleDateString();
  }
}

function formatSwissNumber(number: number, locale: SwissLocale): string {
  try {
    const formatter = new Intl.NumberFormat(locale);
    return formatter.format(number);
  } catch (error) {
    return number.toString();
  }
}

export function ComprehensiveI18nProvider({ children, initialLocale }: ComprehensiveI18nProviderProps) {
  const [locale, setLocaleState] = useState<SwissLocale>(() => {
    // Try to get locale from localStorage or URL or use initial/default
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('yogaswiss-locale');
        if (saved && isValidLocale(saved)) {
          return saved;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const urlLocale = urlParams.get('locale');
        if (urlLocale && isValidLocale(urlLocale)) {
          return urlLocale;
        }
      } catch (error) {
        console.warn('Could not read locale from storage:', error);
      }
    }
    
    return initialLocale || DEFAULT_LOCALE;
  });
  
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [fallbackTranslations, setFallbackTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load translations when locale changes
  useEffect(() => {
    let isCancelled = false;
    
    async function load() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load primary translations
        const primaryTranslations = await loadTranslations(locale);
        
        if (isCancelled) return;
        
        setTranslations(primaryTranslations);
        
        // Load fallback translations if not English
        if (locale !== 'en-CH') {
          const fallback = await loadTranslations('en-CH');
          if (!isCancelled) {
            setFallbackTranslations(fallback);
          }
        } else {
          setFallbackTranslations({});
        }
        
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load translations');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }
    
    load();
    
    return () => {
      isCancelled = true;
    };
  }, [locale]);

  // Handle locale change
  const setLocale = useMemo(() => {
    return (newLocale: SwissLocale) => {
      if (isValidLocale(newLocale) && newLocale !== locale) {
        setLocaleState(newLocale);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('yogaswiss-locale', newLocale);
          } catch (error) {
            console.warn('Could not save locale to localStorage:', error);
          }
        }
        
        // Update HTML lang attribute
        if (typeof document !== 'undefined') {
          document.documentElement.lang = newLocale;
        }
      }
    };
  }, [locale]);

  // Create translator
  const t = useMemo(() => {
    return createTranslator(translations, fallbackTranslations);
  }, [translations, fallbackTranslations]);

  // Format functions
  const formatCurrency = useMemo(() => {
    return (amount: number) => formatSwissCurrency(amount, locale);
  }, [locale]);

  const formatDateTime = useMemo(() => {
    return (date: Date, options?: Intl.DateTimeFormatOptions) => 
      formatSwissDateTime(date, locale, options);
  }, [locale]);

  const formatNumber = useMemo(() => {
    return (number: number) => formatSwissNumber(number, locale);
  }, [locale]);

  const contextValue: I18nContextType = useMemo(() => ({
    locale,
    setLocale,
    t,
    formatCurrency,
    formatDateTime,
    formatNumber,
    isLoading,
    error,
  }), [locale, setLocale, t, formatCurrency, formatDateTime, formatNumber, isLoading, error]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

// Custom hook to use i18n context
export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a ComprehensiveI18nProvider');
  }
  return context;
}

// Convenience hooks
export function useLocale(): [SwissLocale, (locale: SwissLocale) => void] {
  const { locale, setLocale } = useTranslation();
  return [locale, setLocale];
}

export function useT() {
  const { t } = useTranslation();
  return t;
}

export function useFormatters() {
  const { formatCurrency, formatDateTime, formatNumber } = useTranslation();
  return { formatCurrency, formatDateTime, formatNumber };
}

// Swiss-specific utilities
export const SWISS_LOCALES: SwissLocale[] = ['de-CH', 'fr-CH', 'it-CH', 'en-CH'];

export const SWISS_LOCALE_NAMES = {
  'de-CH': 'Deutsch',
  'fr-CH': 'Français', 
  'it-CH': 'Italiano',
  'en-CH': 'English'
} as const;

export const SWISS_LOCALE_FLAGS = {
  'de-CH': '🇩🇪',
  'fr-CH': '🇫🇷',
  'it-CH': '🇮🇹', 
  'en-CH': '🇬🇧'
} as const;

export { isValidLocale };
export type { SwissLocale };