import React, { useState, ReactNode, useMemo } from 'react';
import { 
  SwissLocale, 
  DEFAULT_LOCALE, 
  I18nContextType,
  I18nContext,
  isValidLocale
} from '../../utils/i18n/index';

interface MinimalI18nProviderProps {
  children: ReactNode;
  initialLocale?: SwissLocale;
}

// Minimal translations for basic functionality
const MINIMAL_TRANSLATIONS = {
  'de-CH': {
    common: { loading: 'Lädt...', error: 'Fehler', save: 'Speichern', cancel: 'Abbrechen' },
    nav: { 
      overview: 'Übersicht', 
      schedule: 'Stundenplan', 
      customers: 'Kunden',
      registrations: 'Anmeldungen',
      products: 'Produkte',
      finance: 'Finanzen',
      marketing: 'Marketing',
      settings: 'Einstellungen'
    },
    dashboard: {
      title: 'Übersicht',
      subtitle: 'Verwalten Sie Ihr Yoga-Studio mit professionellen Tools',
      studio_active: 'Studio aktiv',
      setup: 'Einrichtung',
      to_overview: 'Zur Übersicht',
      page_in_development: 'Seite in Entwicklung',
      feature_coming_soon: 'Diese Funktion wird bald verfügbar sein.'
    },
    header: {
      all_locations: 'Alle Standorte',
      today: 'Heute',
      '7_days': '7 Tage',
      '30_days': '30 Tage',
      '90_days': '90 Tage',
      webhooks_failed: 'Webhooks fehlgeschlagen',
      payout_pending: 'Auszahlung ausstehend'
    },
    hero: {
      welcome_back: 'Willkommen zurück',
      upcoming_classes: 'kommende Kurse',
      credits_remaining: 'Credits verbleibend',
      my_bookings: 'Meine Buchungen',
      book_another_class: 'Weiteren Kurs buchen',
      find_perfect_yoga: 'Finde Dein perfektes',
      yoga_experience: 'Yoga-Erlebnis',
      discover_studios: 'Entdecke die schönsten Studios der Schweiz',
      search_placeholder: 'Versuche "Yin Yoga Zürich Freitagabend"',
      browse_classes: 'Kurse durchsuchen',
      online_studio: 'Online Studio',
      outdoor_classes: 'Outdoor Kurse',
      active_members: 'Aktive Mitglieder',
      rating: 'Bewertung',
      swiss_made: 'Stolz Swiss-Made',
      swiss_subtitle: 'Speziell für die Schweizer Yoga-Community entwickelt',
      swiss_first: 'Swiss-First',
      swiss_first_desc: 'Für die Schweiz gemacht',
      twint_cards: 'TWINT & Karten',
      all_payments: 'Alle Zahlungsmethoden',
      four_languages: '4 Sprachen',
      languages_short: 'DE/FR/IT/EN',
      qr_bills: 'QR-Rechnungen',
      swiss_invoicing: 'Schweizer Rechnungswesen'
    }
  },
  'en-CH': {
    common: { loading: 'Loading...', error: 'Error', save: 'Save', cancel: 'Cancel' },
    nav: { 
      overview: 'Overview', 
      schedule: 'Schedule', 
      customers: 'Customers',
      registrations: 'Registrations',
      products: 'Products',
      finance: 'Finance',
      marketing: 'Marketing',
      settings: 'Settings'
    },
    dashboard: {
      title: 'Overview',
      subtitle: 'Manage your yoga studio with professional tools',
      studio_active: 'Studio Active',
      setup: 'Setup',
      to_overview: 'To Overview',
      page_in_development: 'Page in Development',
      feature_coming_soon: 'This feature will be available soon.'
    },
    header: {
      all_locations: 'All Locations',
      today: 'Today',
      '7_days': '7 Days',
      '30_days': '30 Days',
      '90_days': '90 Days',
      webhooks_failed: 'Webhooks failed',
      payout_pending: 'Payout pending'
    },
    hero: {
      welcome_back: 'Welcome back',
      upcoming_classes: 'upcoming classes',
      credits_remaining: 'credits remaining',
      my_bookings: 'My Bookings',
      book_another_class: 'Book Another Class',
      find_perfect_yoga: 'Find Your Perfect',
      yoga_experience: 'Yoga Experience',
      discover_studios: 'Discover Switzerland\'s most beautiful studios',
      search_placeholder: 'Try "Yin Yoga Zurich Friday evening"',
      browse_classes: 'Browse Classes',
      online_studio: 'Online Studio',
      outdoor_classes: 'Outdoor Classes',
      active_members: 'Active Members',
      rating: 'Rating',
      swiss_made: 'Proudly Swiss-Made',
      swiss_subtitle: 'Built specifically for the Swiss yoga community',
      swiss_first: 'Swiss-First',
      swiss_first_desc: 'Built for Switzerland',
      twint_cards: 'TWINT & Cards',
      all_payments: 'All payment methods',
      four_languages: '4 Languages',
      languages_short: 'DE/FR/IT/EN',
      qr_bills: 'QR-Bills',
      swiss_invoicing: 'Swiss invoicing'
    }
  },
  'fr-CH': {
    common: { loading: 'Chargement...', error: 'Erreur', save: 'Enregistrer', cancel: 'Annuler' },
    nav: { 
      overview: 'Aperçu', 
      schedule: 'Planning', 
      customers: 'Clients',
      registrations: 'Inscriptions',
      products: 'Produits',
      finance: 'Finances',
      marketing: 'Marketing',
      settings: 'Paramètres'
    },
    dashboard: {
      title: 'Aperçu',
      subtitle: 'Gérez votre studio de yoga avec des outils professionnels',
      studio_active: 'Studio actif',
      setup: 'Configuration',
      to_overview: 'Vers l\'aperçu',
      page_in_development: 'Page en développement',
      feature_coming_soon: 'Cette fonctionnalité sera bientôt disponible.'
    },
    header: {
      all_locations: 'Tous les emplacements',
      today: 'Aujourd\'hui',
      '7_days': '7 jours',
      '30_days': '30 jours',
      '90_days': '90 jours',
      webhooks_failed: 'Webhooks échoués',
      payout_pending: 'Paiement en attente'
    },
    hero: {
      welcome_back: 'Content de te revoir',
      upcoming_classes: 'cours à venir',
      credits_remaining: 'crédits restants',
      my_bookings: 'Mes réservations',
      book_another_class: 'Réserver un autre cours',
      find_perfect_yoga: 'Trouve ton parfait',
      yoga_experience: 'Expérience Yoga',
      discover_studios: 'Découvre les plus beaux studios de Suisse',
      search_placeholder: 'Essaie "Yin Yoga Genève vendredi soir"',
      browse_classes: 'Parcourir les cours',
      online_studio: 'Studio en ligne',
      outdoor_classes: 'Cours en plein air',
      active_members: 'Membres actifs',
      rating: 'Note',
      swiss_made: 'Fièrement Swiss-Made',
      swiss_subtitle: 'Conçu spécifiquement pour la communauté yoga suisse',
      swiss_first: 'Swiss-First',
      swiss_first_desc: 'Fait pour la Suisse',
      twint_cards: 'TWINT & Cartes',
      all_payments: 'Tous moyens de paiement',
      four_languages: '4 Langues',
      languages_short: 'DE/FR/IT/EN',
      qr_bills: 'Factures QR',
      swiss_invoicing: 'Facturation suisse'
    }
  },
  'it-CH': {
    common: { loading: 'Caricamento...', error: 'Errore', save: 'Salva', cancel: 'Annulla' },
    nav: { 
      overview: 'Panoramica', 
      schedule: 'Programma', 
      customers: 'Clienti',
      registrations: 'Iscrizioni',
      products: 'Prodotti',
      finance: 'Finanze',
      marketing: 'Marketing',
      settings: 'Impostazioni'
    },
    dashboard: {
      title: 'Panoramica',
      subtitle: 'Gestisci il tuo studio di yoga con strumenti professionali',
      studio_active: 'Studio attivo',
      setup: 'Configurazione',
      to_overview: 'Alla panoramica',
      page_in_development: 'Pagina in sviluppo',
      feature_coming_soon: 'Questa funzionalità sarà presto disponibile.'
    },
    header: {
      all_locations: 'Tutte le posizioni',
      today: 'Oggi',
      '7_days': '7 giorni',
      '30_days': '30 giorni',
      '90_days': '90 giorni',
      webhooks_failed: 'Webhook falliti',
      payout_pending: 'Pagamento in sospeso'
    },
    hero: {
      welcome_back: 'Bentornato',
      upcoming_classes: 'corsi in arrivo',
      credits_remaining: 'crediti rimanenti',
      my_bookings: 'Le mie prenotazioni',
      book_another_class: 'Prenota un altro corso',
      find_perfect_yoga: 'Trova la tua perfetta',
      yoga_experience: 'Esperienza Yoga',
      discover_studios: 'Scopri i più bei studi della Svizzera',
      search_placeholder: 'Prova "Yin Yoga Ginevra venerdì sera"',
      browse_classes: 'Sfoglia i corsi',
      online_studio: 'Studio online',
      outdoor_classes: 'Corsi all\'aperto',
      active_members: 'Membri attivi',
      rating: 'Valutazione',
      swiss_made: 'Orgogliosamente Swiss-Made',
      swiss_subtitle: 'Costruito specificatamente per la comunità yoga svizzera',
      swiss_first: 'Swiss-First',
      swiss_first_desc: 'Fatto per la Svizzera',
      twint_cards: 'TWINT & Carte',
      all_payments: 'Tutti i metodi di pagamento',
      four_languages: '4 Lingue',
      languages_short: 'DE/FR/IT/EN',
      qr_bills: 'Fatture QR',
      swiss_invoicing: 'Fatturazione svizzera'
    }
  }
} as const;

function getNestedValue(obj: any, path: string): string | undefined {
  try {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  } catch {
    return undefined;
  }
}

export function MinimalI18nProvider({ children, initialLocale }: MinimalI18nProviderProps) {
  const [locale, setLocale] = useState<SwissLocale>(initialLocale || DEFAULT_LOCALE);

  const contextValue: I18nContextType = useMemo(() => {
    const translations = MINIMAL_TRANSLATIONS[locale] || MINIMAL_TRANSLATIONS[DEFAULT_LOCALE];
    
    return {
      locale,
      setLocale: (newLocale: SwissLocale) => {
        if (isValidLocale(newLocale)) {
          setLocale(newLocale);
        }
      },
      t: (key: string) => getNestedValue(translations, key) || key,
      formatCurrency: (amount: number) => `CHF ${amount.toFixed(2)}`,
      formatDateTime: (date: Date) => date.toLocaleDateString(locale),
      formatNumber: (number: number) => number.toLocaleString(locale),
    };
  }, [locale]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}