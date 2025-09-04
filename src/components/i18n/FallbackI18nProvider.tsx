import React, { ReactNode, useMemo } from 'react';
import { 
  SwissLocale, 
  DEFAULT_LOCALE, 
  I18nContextType,
  I18nContext,
} from '../../utils/i18n/index';

interface FallbackI18nProviderProps {
  children: ReactNode;
  locale?: SwissLocale;
}

export function FallbackI18nProvider({ children, locale = DEFAULT_LOCALE }: FallbackI18nProviderProps) {
  // Create a minimal context value for emergency fallback
  const contextValue: I18nContextType = useMemo(() => ({
    locale,
    setLocale: () => {
      console.warn('FallbackI18nProvider: setLocale not implemented');
    },
    t: (key: string) => key, // Just return the key as fallback
    formatCurrency: (amount: number) => `CHF ${amount.toFixed(2)}`,
    formatDateTime: (date: Date) => date.toLocaleDateString(),
    formatNumber: (number: number) => number.toString(),
  }), [locale]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}