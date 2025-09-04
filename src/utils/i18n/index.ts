import { createContext, useContext } from 'react';

// Swiss locale types - exactly as specified
export type SwissLocale = 'de-CH' | 'fr-CH' | 'it-CH' | 'en-CH';
export type OptionalDialect = 'gsw'; // Schwiizerdütsch for short UI strings only

// Main locales with optional dialect fallback
export type SupportedLocale = SwissLocale | OptionalDialect;

// Default locale
export const DEFAULT_LOCALE: SwissLocale = 'de-CH';

// All supported locales
export const SWISS_LOCALES: SwissLocale[] = ['de-CH', 'fr-CH', 'it-CH', 'en-CH'];

// Swiss formatting configuration
export const SWISS_FORMATTING = {
  currency: {
    style: 'currency',
    currency: 'CHF',
    // Swiss uses apostrophe for thousands separator
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  dateTime: {
    timeZone: 'Europe/Zurich',
    dateStyle: 'short' as const,
    timeStyle: 'short' as const,
  },
  number: {
    // Swiss number formatting with apostrophe
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }
} as const;

// Tone configuration - informal tone for FR/DE/IT
export const TONE_CONFIG = {
  'de-CH': 'informal', // Use 'du'
  'fr-CH': 'informal', // Use 'tu' (never 'vous')
  'it-CH': 'informal', // Use 'tu'  
  'en-CH': 'neutral',  // Standard English
  'gsw': 'informal',   // Schwiizerdütsch is always informal
} as const;

// Format currency with Swiss formatting (CHF 1'234.50)
export function formatCurrency(amount: number, locale: SwissLocale): string {
  return new Intl.NumberFormat(locale, SWISS_FORMATTING.currency).format(amount);
}

// Format date/time with Swiss timezone
export function formatDateTime(date: Date, locale: SwissLocale, options?: Intl.DateTimeFormatOptions): string {
  const formatOptions = {
    ...SWISS_FORMATTING.dateTime,
    ...options,
  };
  return new Intl.DateTimeFormat(locale, formatOptions).format(date);
}

// Format numbers with Swiss formatting
export function formatNumber(number: number, locale: SwissLocale): string {
  return new Intl.NumberFormat(locale, SWISS_FORMATTING.number).format(number);
}

// Get language code from locale (de-CH -> de)
export function getLanguageFromLocale(locale: SupportedLocale): string {
  if (locale === 'gsw') return 'de'; // Fallback for dialect
  return locale.split('-')[0];
}

// Get display name for locale
export function getLocaleDisplayName(locale: SwissLocale, displayLocale: SwissLocale): string {
  return new Intl.DisplayNames([displayLocale], { type: 'language' }).of(locale) || locale;
}

// Validate if locale is supported
export function isValidLocale(locale: string): locale is SupportedLocale {
  return SWISS_LOCALES.includes(locale as SwissLocale) || locale === 'gsw';
}

// Get route prefix for locale
export function getLocalePrefix(locale: SwissLocale): string {
  const prefixMap: Record<SwissLocale, string> = {
    'de-CH': '/de',
    'fr-CH': '/fr', 
    'it-CH': '/it',
    'en-CH': '/en',
  };
  return prefixMap[locale];
}

// Extract locale from pathname
export function getLocaleFromPath(pathname: string): SwissLocale | null {
  const pathMap: Record<string, SwissLocale> = {
    '/de': 'de-CH',
    '/fr': 'fr-CH',
    '/it': 'it-CH', 
    '/en': 'en-CH',
  };
  
  for (const [path, locale] of Object.entries(pathMap)) {
    if (pathname.startsWith(path)) {
      return locale;
    }
  }
  
  return null;
}

// Context types
export interface I18nContextType {
  locale: SwissLocale;
  setLocale: (locale: SwissLocale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number) => string;
  formatDateTime: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number) => string;
}

// Context
export const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Hook - now returns English-only functionality without requiring context
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    // Return English-only fallback to prevent breaking changes
    return {
      locale: 'en-CH' as SwissLocale,
      setLocale: () => {}, // No-op
      t: (key: string) => key, // Return key as-is 
      formatCurrency: (amount: number) => formatCurrency(amount, 'en-CH'),
      formatDateTime: (date: Date, options?: Intl.DateTimeFormatOptions) => formatDateTime(date, 'en-CH', options),
      formatNumber: (number: number) => formatNumber(number, 'en-CH')
    };
  }
  return context;
}

// Helper for pluralization using ICU message format
export function pluralize(count: number, key: string, t: (key: string) => string): string {
  if (count === 0) return t(`${key}.zero`);
  if (count === 1) return t(`${key}.one`);
  return t(`${key}.other`);
}