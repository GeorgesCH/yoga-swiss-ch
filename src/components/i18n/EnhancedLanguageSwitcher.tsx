import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation, SwissLocale, SWISS_LOCALES, SWISS_LOCALE_NAMES, SWISS_LOCALE_FLAGS } from './ComprehensiveI18nProvider';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'dropdown' | 'popover' | 'mobile';
  showFlag?: boolean;
  showName?: boolean;
  className?: string;
}

export function EnhancedLanguageSwitcher({ 
  variant = 'default',
  showFlag = true,
  showName = true,
  className
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useTranslation();

  const currentLocaleInfo = {
    flag: SWISS_LOCALE_FLAGS[locale],
    name: SWISS_LOCALE_NAMES[locale]
  };

  if (variant === 'popover') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={className}
            aria-label="Change language"
          >
            <Globe className="w-4 h-4 mr-2" />
            {showFlag && <span className="mr-1">{currentLocaleInfo.flag}</span>}
            {showName && <span className="hidden sm:inline">{currentLocaleInfo.name}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="space-y-1">
            <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
              {t('settings.language') || 'Language'}
            </div>
            {SWISS_LOCALES.map((localeCode) => (
              <button
                key={localeCode}
                onClick={() => setLocale(localeCode)}
                className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${
                  locale === localeCode ? 'bg-accent text-accent-foreground' : ''
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{SWISS_LOCALE_FLAGS[localeCode]}</span>
                  <span>{SWISS_LOCALE_NAMES[localeCode]}</span>
                </span>
                {locale === localeCode && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  if (variant === 'compact') {
    return (
      <Select value={locale} onValueChange={(value: SwissLocale) => setLocale(value)}>
        <SelectTrigger className={`w-16 ${className || ''}`}>
          <SelectValue>
            <span>{currentLocaleInfo.flag}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SWISS_LOCALES.map((localeCode) => (
            <SelectItem key={localeCode} value={localeCode}>
              <span className="flex items-center gap-2">
                <span>{SWISS_LOCALE_FLAGS[localeCode]}</span>
                <span>{SWISS_LOCALE_NAMES[localeCode]}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={`gap-2 ${className || ''}`}>
            {showFlag && <span className="text-lg">{currentLocaleInfo.flag}</span>}
            {showName && <span className="hidden sm:inline">{currentLocaleInfo.name}</span>}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[200px]">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
            🇨🇭 {t('settings.language') || 'Language'}
          </div>
          {SWISS_LOCALES.map((localeCode) => (
            <DropdownMenuItem
              key={localeCode}
              onClick={() => setLocale(localeCode)}
              className={`flex items-center gap-3 ${locale === localeCode ? 'bg-accent' : ''}`}
            >
              <span className="text-lg">{SWISS_LOCALE_FLAGS[localeCode]}</span>
              <span className="font-medium">{SWISS_LOCALE_NAMES[localeCode]}</span>
              {locale === localeCode && (
                <span className="ml-auto text-xs text-primary">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`space-y-2 ${className || ''}`}>
        <div className="text-sm font-medium text-muted-foreground mb-3">
          <Globe className="w-4 h-4 inline mr-2" />
          {t('settings.language') || 'Language'}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SWISS_LOCALES.map((localeCode) => (
            <Button
              key={localeCode}
              variant={locale === localeCode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLocale(localeCode)}
              className="justify-start"
            >
              <span className="text-lg mr-2">{SWISS_LOCALE_FLAGS[localeCode]}</span>
              <span className="text-sm">{SWISS_LOCALE_NAMES[localeCode]}</span>
              {locale === localeCode && (
                <span className="ml-auto text-xs">✓</span>
              )}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Default select variant
  return (
    <Select value={locale} onValueChange={(value: SwissLocale) => setLocale(value)}>
      <SelectTrigger className={`w-36 ${className || ''}`}>
        <SelectValue>
          <span className="flex items-center gap-2">
            {showFlag && <span>{currentLocaleInfo.flag}</span>}
            {showName && <span className="text-sm">{currentLocaleInfo.name}</span>}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b mb-1">
          🇨🇭 Swiss Languages
        </div>
        {SWISS_LOCALES.map((localeCode) => (
          <SelectItem key={localeCode} value={localeCode}>
            <span className="flex items-center gap-2">
              <span>{SWISS_LOCALE_FLAGS[localeCode]}</span>
              <span>{SWISS_LOCALE_NAMES[localeCode]}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Swiss formatting components
export function SwissCurrency({ amount, className }: { amount: number; className?: string }) {
  const { formatCurrency } = useTranslation();
  return <span className={className}>{formatCurrency(amount)}</span>;
}

export function SwissDateTime({ 
  date, 
  options,
  className 
}: { 
  date: Date; 
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}) {
  const { formatDateTime } = useTranslation();
  return <span className={className}>{formatDateTime(date, options)}</span>;
}

export function SwissNumber({ number, className }: { number: number; className?: string }) {
  const { formatNumber } = useTranslation();
  return <span className={className}>{formatNumber(number)}</span>;
}

// Specialized variants
export function CompactLanguageSwitcher({ className }: { className?: string }) {
  return <EnhancedLanguageSwitcher variant="compact" className={className} />;
}

export function PopoverLanguageSwitcher({ className }: { className?: string }) {
  return <EnhancedLanguageSwitcher variant="popover" className={className} />;
}

export function DropdownLanguageSwitcher({ className }: { className?: string }) {
  return <EnhancedLanguageSwitcher variant="dropdown" className={className} />;
}

export function MobileLanguageSwitcher({ className }: { className?: string }) {
  return <EnhancedLanguageSwitcher variant="mobile" className={className} />;
}