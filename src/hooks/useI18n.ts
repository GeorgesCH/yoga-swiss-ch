// Re-export i18n hooks for easy importing
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
} from '../components/i18n/ComprehensiveI18nProvider';

// Convenience re-exports
export { 
  SwissCurrency,
  SwissDateTime,
  SwissNumber,
  EnhancedLanguageSwitcher as LanguageSwitcher,
  CompactLanguageSwitcher,
  PopoverLanguageSwitcher,
  DropdownLanguageSwitcher,
  MobileLanguageSwitcher
} from '../components/i18n/EnhancedLanguageSwitcher';