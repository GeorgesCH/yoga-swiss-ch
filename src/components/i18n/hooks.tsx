import { useI18n } from '../../utils/i18n/index';

// Helper hook for just the translator
export function useTranslation() {
  const { t } = useI18n();
  return { t };
}

// Helper hook for formatting
export function useFormatting() {
  const { formatCurrency, formatDateTime, formatNumber } = useI18n();
  return { formatCurrency, formatDateTime, formatNumber };
}