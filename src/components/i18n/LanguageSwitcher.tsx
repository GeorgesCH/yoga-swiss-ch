import React from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useI18n } from '../../utils/i18n/index';
import { SwissLocale, SWISS_LOCALES, getLocaleDisplayName } from '../../utils/i18n';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'mobile';
  showIcon?: boolean;
  className?: string;
}

export function LanguageSwitcher({ 
  variant = 'default', 
  showIcon = true,
  className = '' 
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  const localeConfig: Record<SwissLocale, { flag: string; name: string; nativeName: string }> = {
    'de-CH': { flag: '🇩🇪', name: 'German', nativeName: 'Deutsch (Schweiz)' },
    'fr-CH': { flag: '🇫🇷', name: 'French', nativeName: 'Français (Suisse)' },
    'it-CH': { flag: '🇮🇹', name: 'Italian', nativeName: 'Italiano (Svizzera)' },
    'en-CH': { flag: '🇬🇧', name: 'English', nativeName: 'English (Switzerland)' },
  };

  const currentConfig = localeConfig[locale];

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={`px-2 ${className}`}>
            <span className="text-lg">{currentConfig.flag}</span>
            <span className="ml-1 text-xs font-medium">
              {locale.split('-')[0].toUpperCase()}
            </span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[200px]">
          {SWISS_LOCALES.map((loc) => {
            const config = localeConfig[loc];
            return (
              <DropdownMenuItem
                key={loc}
                onClick={() => setLocale(loc)}
                className={`flex items-center gap-3 ${loc === locale ? 'bg-accent' : ''}`}
              >
                <span className="text-lg">{config.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{config.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{config.name}</span>
                </div>
                {loc === locale && (
                  <span className="ml-auto text-xs text-primary">✓</span>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="text-sm font-medium text-muted-foreground mb-2">
          {showIcon && <Globe className="w-4 h-4 inline mr-2" />}
          Language / Sprache
        </div>
        {SWISS_LOCALES.map((loc) => {
          const config = localeConfig[loc];
          return (
            <Button
              key={loc}
              variant={loc === locale ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLocale(loc)}
              className="w-full justify-start"
            >
              <span className="text-lg mr-3">{config.flag}</span>
              <span>{config.nativeName}</span>
              {loc === locale && (
                <span className="ml-auto text-xs">✓</span>
              )}
            </Button>
          );
        })}
      </div>
    );
  }

  // Default variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`gap-2 ${className}`}>
          {showIcon && <Globe className="w-4 h-4" />}
          <span className="text-lg">{currentConfig.flag}</span>
          <span className="hidden sm:inline">{currentConfig.nativeName}</span>
          <span className="sm:hidden">{locale.split('-')[0].toUpperCase()}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[250px]">
        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
          Choose Language / Sprache wählen
        </div>
        {SWISS_LOCALES.map((loc) => {
          const config = localeConfig[loc];
          return (
            <DropdownMenuItem
              key={loc}
              onClick={() => setLocale(loc)}
              className={`flex items-center gap-3 ${loc === locale ? 'bg-accent' : ''}`}
            >
              <span className="text-lg">{config.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{config.nativeName}</span>
                <span className="text-xs text-muted-foreground">{config.name}</span>
              </div>
              {loc === locale && (
                <span className="ml-auto text-xs text-primary font-medium">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
        <div className="border-t mt-1 pt-1">
          <div className="px-2 py-1 text-xs text-muted-foreground">
            🇨🇭 Swiss localized • Europe/Zurich timezone
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Currency display component with Swiss formatting
export function SwissCurrency({ amount, className }: { amount: number; className?: string }) {
  const { formatCurrency } = useI18n();
  return <span className={className}>{formatCurrency(amount)}</span>;
}

// Date display component with Swiss formatting
export function SwissDate({ 
  date, 
  options,
  className 
}: { 
  date: Date; 
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}) {
  const { formatDateTime } = useI18n();
  return <span className={className}>{formatDateTime(date, options)}</span>;
}

// Number display component with Swiss formatting
export function SwissNumber({ number, className }: { number: number; className?: string }) {
  const { formatNumber } = useI18n();
  return <span className={className}>{formatNumber(number)}</span>;
}