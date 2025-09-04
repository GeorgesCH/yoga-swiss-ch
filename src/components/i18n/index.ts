// Main providers - use in order of preference
export { ComprehensiveI18nProvider } from './ComprehensiveI18nProvider';
export { MinimalI18nProvider } from './MinimalI18nProvider';
export { SimpleI18nProvider } from './SimpleI18nProvider';
export { RobustI18nProvider } from './RobustI18nProvider';
export { I18nProvider } from './I18nProvider';

// Error handling
export { I18nErrorBoundary } from './I18nErrorBoundary';
export { FallbackI18nProvider } from './FallbackI18nProvider';

// Hooks and utilities
export { 
  useTranslation, 
  useLocale, 
  useT, 
  useFormatters,
  type SwissLocale,
  SWISS_LOCALES,
  SWISS_LOCALE_NAMES,
  SWISS_LOCALE_FLAGS,
  DEFAULT_LOCALE
} from './ComprehensiveI18nProvider';

// Components
export { LanguageSwitcher } from './LanguageSwitcher';
export { 
  EnhancedLanguageSwitcher,
  CompactLanguageSwitcher,
  PopoverLanguageSwitcher,
  DropdownLanguageSwitcher,
  MobileLanguageSwitcher,
  SwissCurrency,
  SwissDateTime,
  SwissNumber
} from './EnhancedLanguageSwitcher';
export { SEOHead } from './SEOHead';