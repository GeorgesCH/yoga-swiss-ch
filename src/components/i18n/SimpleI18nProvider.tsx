import React, { useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  SwissLocale, 
  DEFAULT_LOCALE, 
  I18nContextType,
  I18nContext,
  formatCurrency as formatCurrencyUtil,
  formatDateTime as formatDateTimeUtil,
  formatNumber as formatNumberUtil,
  isValidLocale
} from '../../utils/i18n/index';

// Static translations embedded directly to avoid import issues
const STATIC_TRANSLATIONS = {
  'de-CH': {
    meta: {
      title: "YogaSwiss - Schweizer Yoga Studio Management",
      description: "Die führende Studio-Management-Plattform für Schweizer Yoga-Studios. Mit TWINT, QR-Rechnungen und 4-sprachiger Unterstützung.",
      keywords: "Yoga, Studio, Management, Schweiz, TWINT, QR-Rechnung"
    },
    common: {
      save: "Speichern",
      cancel: "Abbrechen",
      loading: "Lädt...",
      error: "Fehler",
      success: "Erfolgreich"
    },
    navigation: {
      overview: "Übersicht",
      schedule: "Stundenplan",
      customers: "Kunden",
      finance: "Finanzen",
      settings: "Einstellungen"
    }
  },
  'en-CH': {
    meta: {
      title: "YogaSwiss - Swiss Yoga Studio Management",
      description: "The leading studio management platform for Swiss yoga studios. With TWINT, QR-bills and 4-language support.",
      keywords: "Yoga, Studio, Management, Switzerland, TWINT, QR-bill"
    },
    common: {
      save: "Save",
      cancel: "Cancel", 
      loading: "Loading...",
      error: "Error",
      success: "Success"
    },
    navigation: {
      overview: "Overview",
      schedule: "Schedule",
      customers: "Customers", 
      finance: "Finance",
      settings: "Settings"
    }
  },
  'fr-CH': {
    meta: {
      title: "YogaSwiss - Gestion Studio de Yoga Suisse",
      description: "La plateforme de gestion de studio leader pour les studios de yoga suisses. Avec TWINT, factures QR et support 4 langues.",
      keywords: "Yoga, Studio, Gestion, Suisse, TWINT, facture QR"
    },
    common: {
      save: "Enregistrer",
      cancel: "Annuler",
      loading: "Chargement...",
      error: "Erreur", 
      success: "Succès"
    },
    navigation: {
      overview: "Aperçu",
      schedule: "Horaire",
      customers: "Clients",
      finance: "Finance",
      settings: "Paramètres"
    }
  },
  'it-CH': {
    meta: {
      title: "YogaSwiss - Gestione Studio Yoga Svizzero",
      description: "La piattaforma leader per la gestione di studi yoga svizzeri. Con TWINT, fatture QR e supporto per 4 lingue.",
      keywords: "Yoga, Studio, Gestione, Svizzera, TWINT, fattura QR"
    },
    common: {
      save: "Salva",
      cancel: "Annulla",
      loading: "Caricamento...",
      error: "Errore",
      success: "Successo"
    },
    navigation: {
      overview: "Panoramica",
      schedule: "Programma", 
      customers: "Clienti",
      finance: "Finanza",
      settings: "Impostazioni"
    }
  },
  'gsw': {
    meta: {
      title: "YogaSwiss - Schwiizer Yoga Studio Management",
      description: "D'füehrendi Studio-Management-Plattform für Schwiizer Yoga-Studios.",
      keywords: "Yoga, Studio, Management, Schwiz, TWINT"
    },
    common: {
      save: "Speichere",
      cancel: "Abbräche",
      loading: "Ladet...",
      error: "Fähler",
      success: "Super!"
    },
    navigation: {
      overview: "Übersicht",
      schedule: "Stundeplan",
      customers: "Chunde", 
      finance: "Gäld",
      settings: "Ystellige"
    }
  }
} as const;

interface SimpleI18nProviderProps {
  children: ReactNode;
  initialLocale?: SwissLocale;
}

// Simple nested value getter
function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj);
}

// Simple translator function
function createSimpleTranslator(
  locale: SwissLocale,
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
      return key;
    }
    
    // Handle parameterized translations
    if (params && typeof translation === 'string') {
      return Object.entries(params).reduce((str, [paramKey, value]) => {
        return str.replace(new RegExp(`{${paramKey}}`, 'g'), String(value));
      }, translation);
    }
    
    return translation;
  };
}

export function SimpleI18nProvider({ children, initialLocale }: SimpleI18nProviderProps) {
  const [locale, setLocale] = useState<SwissLocale>(initialLocale || DEFAULT_LOCALE);

  // Get translations for current locale
  const translations = useMemo(() => {
    return STATIC_TRANSLATIONS[locale] || STATIC_TRANSLATIONS[DEFAULT_LOCALE];
  }, [locale]);

  // Get fallback translations
  const fallbackTranslations = useMemo(() => {
    if (locale !== 'en-CH') {
      return STATIC_TRANSLATIONS['en-CH'];
    }
    return undefined;
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
        return `CHF ${amount.toFixed(2)}`;
      }
    };
  }, [locale]);

  const formatDateTime = useMemo(() => {
    return (date: Date, options?: Intl.DateTimeFormatOptions) => {
      try {
        return formatDateTimeUtil(date, locale, options);
      } catch (error) {
        return date.toLocaleDateString();
      }
    };
  }, [locale]);

  const formatNumber = useMemo(() => {
    return (number: number) => {
      try {
        return formatNumberUtil(number, locale);
      } catch (error) {
        return number.toString();
      }
    };
  }, [locale]);

  // Handle locale change
  const handleSetLocale = useMemo(() => {
    return (newLocale: SwissLocale) => {
      if (isValidLocale(newLocale)) {
        setLocale(newLocale);
        
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('yogaswiss-locale', newLocale);
          } catch (error) {
            console.warn('Could not save locale to localStorage:', error);
          }
        }
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

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}