import type { SwissLocale, SupportedLocale } from './index';

// Translation cache
const translationCache = new Map<SupportedLocale, Record<string, any>>();

// Load translation data for a locale
export async function loadTranslations(locale: SupportedLocale): Promise<Record<string, any>> {
  // Check cache first
  if (translationCache.has(locale)) {
    return translationCache.get(locale)!;
  }

  try {
    let translations: Record<string, any>;
    
    // Dynamic import based on locale
    switch (locale) {
      case 'de-CH':
        translations = (await import('../../locales/de-CH.json')).default;
        break;
      case 'fr-CH':
        translations = (await import('../../locales/fr-CH.json')).default;
        break;
      case 'it-CH':
        translations = (await import('../../locales/it-CH.json')).default;
        break;
      case 'en-CH':
        translations = (await import('../../locales/en-CH.json')).default;
        break;
      case 'gsw':
        translations = (await import('../../locales/gsw.json')).default;
        break;
      default:
        // Fallback to German
        translations = (await import('../../locales/de-CH.json')).default;
    }

    // Cache the loaded translations
    translationCache.set(locale, translations);
    return translations;
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error);
    
    // Fallback to German if available
    if (locale !== 'de-CH') {
      return loadTranslations('de-CH');
    }
    
    // Ultimate fallback - empty object
    return {};
  }
}

// Get nested translation value using dot notation
export function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj);
}

// Translation function with fallback logic
export function createTranslator(
  locale: SupportedLocale,
  translations: Record<string, any>,
  fallbackTranslations?: Record<string, any>
) {
  return function t(key: string, params?: Record<string, string | number>): string {
    // Get translation from primary locale
    let translation = getNestedValue(translations, key);
    
    // If not found and locale is gsw, fallback to de-CH
    if (!translation && locale === 'gsw' && fallbackTranslations) {
      translation = getNestedValue(fallbackTranslations, key);
    }
    
    // If still not found, try to get from fallback translations
    if (!translation && fallbackTranslations) {
      translation = getNestedValue(fallbackTranslations, key);
    }
    
    // If still not found, return the key itself
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in locale: ${locale}`);
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

// Preload all translations for performance
export async function preloadAllTranslations(): Promise<void> {
  const locales: SupportedLocale[] = ['de-CH', 'fr-CH', 'it-CH', 'en-CH', 'gsw'];
  
  await Promise.allSettled(
    locales.map(locale => loadTranslations(locale))
  );
  
  console.log('[YogaSwiss] All translations preloaded');
}

// Clear translation cache (useful for development)
export function clearTranslationCache(): void {
  translationCache.clear();
}