// REMOVED: Language support has been removed from YogaSwiss
// Application is now English-only

// This file exists only to prevent import errors during cleanup
// Remove all imports of this component from your codebase

export type Language = 'en';

export function useLanguage() {
  // Silently return English-only support without console warnings
  return {
    language: 'en' as Language,
    setLanguage: () => {}, // No-op
    t: (key: string) => key // Return the key as-is since translations are removed
  };
}

// Deprecated - no longer needed
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}