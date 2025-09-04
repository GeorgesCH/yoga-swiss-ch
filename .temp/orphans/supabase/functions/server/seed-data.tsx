// Demo seed data for YogaSwiss platform - Server version

export const DEMO_ORGS = [
  {
    id: 'brand_demo',
    name: 'YogaSwiss Brand',
    type: 'brand' as const,
    parent_id: null,
    slug: 'yogaswiss-brand',
    description: 'Switzerland\'s leading yoga studio management platform',
    website: 'https://yogaswiss.ch',
    email: 'info@yogaswiss.ch',
    phone: '+41 44 123 45 67',
    address: 'Bahnhofstrasse 1',
    city: 'Zürich',
    postal_code: '8001',
    country: 'CH',
    timezone: 'Europe/Zurich',
    default_locale: 'de-CH' as const,
    currency: 'CHF',
    vat_rate: 7.7,
    payment_methods: ['twint', 'credit_card', 'apple_pay', 'google_pay', 'qr_bill'],
    features: ['multi_language', 'swiss_payments', 'outdoor_classes', 'weather_integration'],
    settings: {
      autoReminders: true,
      autoWaitlistPromotion: true,
      feedbackRequest: true
    },
    is_active: true
  },
  {
    id: 'studio_zrh',
    name: 'Zurich Flow Studio',
    type: 'studio' as const,
    parent_id: 'brand_demo',
    slug: 'zurich-flow-studio',
    description: 'Modern yoga studio in the heart of Zurich',
    website: 'https://zurichflow.yogaswiss.ch',
    email: 'info@zurichflow.ch',
    phone: '+41 44 987 65 43',
    address: 'Limmatquai 142',
    city: 'Zürich',
    postal_code: '8001',
    country: 'CH',
    timezone: 'Europe/Zurich',
    default_locale: 'de-CH' as const,
    currency: 'CHF',
    vat_rate: 7.7,
    payment_methods: ['twint', 'credit_card', 'apple_pay', 'google_pay', 'qr_bill'],
    features: ['outdoor_classes', 'weather_integration', 'online_classes'],
    settings: {},
    is_active: true
  },
  {
    id: 'studio_ge',
    name: 'Geneva Calm Studio',
    type: 'studio' as const,
    parent_id: 'brand_demo',
    slug: 'geneva-calm-studio',
    description: 'Studio de yoga paisible au cœur de Genève',
    website: 'https://genevacalm.yogaswiss.ch',
    email: 'info@genevacalm.ch',
    phone: '+41 22 123 45 67',
    address: 'Rue du Rhône 65',
    city: 'Genève',
    postal_code: '1204',
    country: 'CH',
    timezone: 'Europe/Zurich',
    default_locale: 'fr-CH' as const,
    currency: 'CHF',
    vat_rate: 7.7,
    payment_methods: ['twint', 'credit_card', 'apple_pay', 'google_pay', 'qr_bill'],
    features: ['multi_language'],
    settings: {},
    is_active: true
  }
];

export const DEMO_USERS = [
  {
    email: 'owner@yogaswiss-demo.ch',
    password: 'Demo!Owner2025',
    full_name: 'Maria Schneider',
    role: 'owner' as const,
    org_id: 'brand_demo',
    user_metadata: {
      title: 'Brand Owner',
      phone: '+41 79 123 45 67'
    }
  },
  {
    email: 'manager.zrh@yogaswiss-demo.ch',
    password: 'Demo!Mgr2025',
    full_name: 'Thomas Müller',
    role: 'manager' as const,
    org_id: 'studio_zrh',
    user_metadata: {
      title: 'Studio Manager',
      phone: '+41 79 234 56 78'
    }
  },
  {
    email: 'instructor@yogaswiss-demo.ch',
    password: 'Demo!Teach2025',
    full_name: 'Sophie Laurent',
    role: 'instructor' as const,
    org_id: 'studio_zrh',
    user_metadata: {
      title: 'Senior Yoga Instructor',
      phone: '+41 79 345 67 89',
      certifications: ['RYT-500', 'Yin Yoga Certified'],
      bio: 'Experienced yoga instructor with 8+ years of teaching'
    }
  },
  {
    email: 'frontdesk.zrh@yogaswiss-demo.ch',
    password: 'Demo!FD2025',
    full_name: 'Lisa Weber',
    role: 'front_desk' as const,
    org_id: 'studio_zrh',
    user_metadata: {
      title: 'Front Desk Coordinator',
      phone: '+41 79 456 78 90'
    }
  },
  {
    email: 'accounting@yogaswiss-demo.ch',
    password: 'Demo!Acct2025',
    full_name: 'Robert Zimmermann',
    role: 'accountant' as const,
    org_id: 'brand_demo',
    user_metadata: {
      title: 'Financial Controller',
      phone: '+41 79 567 89 01'
    }
  },
  {
    email: 'customer@yogaswiss-demo.ch',
    password: 'Demo!Cust2025',
    full_name: 'Anna Meier',
    role: 'customer' as const,
    org_id: 'studio_zrh',
    user_metadata: {
      phone: '+41 79 678 90 12',
      emergency_contact: {
        name: 'Peter Meier',
        phone: '+41 79 789 01 23',
        relationship: 'Partner'
      }
    }
  }
];

export const DEMO_LOCATIONS = [
  {
    id: 'location_zrh_kreis6',
    org_id: 'studio_zrh',
    name: 'Studio Kreis 6',
    type: 'room' as const,
    capacity: 20,
    address: 'Limmatquai 142, 8001 Zürich',
    coordinates: { lat: 47.3769, lng: 8.5417 },
    weather_dependent: false,
    equipment: ['yoga_mats', 'blocks', 'straps', 'bolsters', 'blankets'],
    amenities: ['changing_room', 'lockers', 'shower', 'tea_station'],
    accessibility_features: ['wheelchair_accessible', 'elevator'],
    booking_rules: {
      advance_booking_hours: 2,
      cancellation_hours: 4,
      waitlist_enabled: true
    },
    is_active: true
  },
  {
    id: 'location_zrh_outdoor',
    org_id: 'studio_zrh',
    name: 'Seefeld Park (Outdoor)',
    type: 'outdoor' as const,
    capacity: 15,
    address: 'Seefeld Park, 8008 Zürich',
    coordinates: { lat: 47.3567, lng: 8.5536 },
    weather_dependent: true,
    backup_location_id: 'location_zrh_kreis6',
    equipment: ['portable_mats', 'ground_cover'],
    amenities: ['lake_view', 'fresh_air', 'natural_setting'],
    accessibility_features: ['flat_surface'],
    booking_rules: {
      advance_booking_hours: 4,
      cancellation_hours: 6,
      weather_check_hours: 2
    },
    is_active: true
  },
  {
    id: 'location_ge_main',
    org_id: 'studio_ge',
    name: 'Studio Principal Geneva',
    type: 'room' as const,
    capacity: 18,
    address: 'Rue du Rhône 65, 1204 Genève',
    coordinates: { lat: 46.2044, lng: 6.1432 },
    weather_dependent: false,
    equipment: ['yoga_mats', 'blocks', 'straps', 'meditation_cushions'],
    amenities: ['changing_room', 'lockers', 'herbal_tea'],
    accessibility_features: ['wheelchair_accessible'],
    booking_rules: {
      advance_booking_hours: 2,
      cancellation_hours: 4,
      waitlist_enabled: true
    },
    is_active: true
  }
];

export const DEMO_CLASS_TEMPLATES = [
  {
    id: 'template_vinyasa_60',
    org_id: 'studio_zrh',
    name: 'Vinyasa Flow 60',
    type: 'class' as const,
    category: 'Vinyasa',
    level: 'intermediate' as const,
    duration_minutes: 60,
    description: {
      'de-CH': 'Dynamische Vinyasa-Praxis mit fließenden Bewegungen und bewusster Atmung',
      'fr-CH': 'Pratique Vinyasa dynamique avec mouvements fluides et respiration consciente',
      'it-CH': 'Pratica Vinyasa dinamica con movimenti fluidi e respiro consapevole',
      'en-CH': 'Dynamic Vinyasa practice with flowing movements and conscious breathing'
    },
    default_price: 35.00,
    default_capacity: 20,
    instructor_pay_rate: 80.00,
    instructor_pay_type: 'fixed' as const,
    requirements: {
      'de-CH': 'Grundkenntnisse in Yoga empfohlen',
      'fr-CH': 'Connaissances de base en yoga recommandées',
      'it-CH': 'Conoscenze di base dello yoga raccomandate',
      'en-CH': 'Basic yoga knowledge recommended'
    },
    benefits: {
      'de-CH': 'Stärkt Körper und Geist, verbessert Flexibilität',
      'fr-CH': 'Renforce le corps et l\'esprit, améliore la flexibilité',
      'it-CH': 'Rafforza corpo e mente, migliora la flessibilità',
      'en-CH': 'Strengthens body and mind, improves flexibility'
    },
    equipment_needed: ['yoga_mat'],
    tags: ['dynamic', 'strength', 'flexibility', 'breath'],
    is_featured: true,
    is_active: true
  },
  {
    id: 'template_yin_75',
    org_id: 'studio_zrh',
    name: 'Yin Yoga 75',
    type: 'class' as const,
    category: 'Yin',
    level: 'all_levels' as const,
    duration_minutes: 75,
    description: {
      'de-CH': 'Ruhige, meditative Praxis mit längeren Haltungen für tiefe Entspannung',
      'fr-CH': 'Pratique calme et méditative avec postures prolongées pour relaxation profonde',
      'it-CH': 'Pratica calma e meditativa con posture prolungate per rilassamento profondo',
      'en-CH': 'Calm, meditative practice with longer holds for deep relaxation'
    },
    default_price: 38.00,
    default_capacity: 16,
    instructor_pay_rate: 85.00,
    instructor_pay_type: 'fixed' as const,
    equipment_needed: ['yoga_mat', 'bolster', 'blocks', 'blanket'],
    tags: ['restorative', 'meditation', 'relaxation', 'stress_relief'],
    is_featured: true,
    is_active: true
  },
  {
    id: 'template_private_60',
    org_id: 'studio_zrh',
    name: 'Private Session 60',
    type: 'private' as const,
    category: 'Personal',
    level: 'all_levels' as const,
    duration_minutes: 60,
    description: {
      'de-CH': 'Persönliche Yoga-Session angepasst an individuelle Bedürfnisse',
      'fr-CH': 'Séance de yoga personnelle adaptée aux besoins individuels',
      'it-CH': 'Sessione di yoga personale adattata alle esigenze individuali',
      'en-CH': 'Personal yoga session tailored to individual needs'
    },
    default_price: 120.00,
    default_capacity: 1,
    instructor_pay_rate: 60.00,
    instructor_pay_type: 'percentage' as const,
    equipment_needed: ['yoga_mat'],
    tags: ['personal', 'customized', 'one_on_one'],
    is_featured: false,
    is_active: true
  },
  {
    id: 'template_workshop_backbends',
    org_id: 'studio_zrh',
    name: 'Workshop: Heart Opening & Backbends',
    type: 'workshop' as const,
    category: 'Workshop',
    level: 'intermediate' as const,
    duration_minutes: 120,
    description: {
      'de-CH': 'Intensiver Workshop zu Herzöffnung und Rückbeugen für Fortgeschrittene',
      'fr-CH': 'Atelier intensif d\'ouverture du cœur et flexions arrière pour avancés',
      'it-CH': 'Workshop intensivo di apertura del cuore e piegamenti all\'indietro per avanzati',
      'en-CH': 'Intensive workshop on heart opening and backbends for advanced practitioners'
    },
    default_price: 65.00,
    default_capacity: 12,
    instructor_pay_rate: 40.00,
    instructor_pay_type: 'percentage' as const,
    equipment_needed: ['yoga_mat', 'blocks', 'strap', 'wheel'],
    tags: ['workshop', 'backbends', 'heart_opening', 'advanced'],
    is_featured: true,
    is_active: true
  }
];

export const DEMO_PRODUCTS = [
  {
    id: 'product_drop_in',
    org_id: 'studio_zrh',
    name: {
      'de-CH': 'Einzelstunde',
      'fr-CH': 'Cours unique',
      'it-CH': 'Lezione singola',
      'en-CH': 'Drop-in Class'
    },
    description: {
      'de-CH': 'Einzelne Yoga-Stunde ohne Verpflichtung',
      'fr-CH': 'Cours de yoga unique sans engagement',
      'it-CH': 'Lezione di yoga singola senza impegno',
      'en-CH': 'Single yoga class without commitment'
    },
    type: 'drop_in' as const,
    price: 35.00,
    credits: null,
    validity_days: null,
    is_unlimited: false,
    is_recurring: false,
    is_gift_eligible: true,
    is_active: true,
    sort_order: 1
  },
  {
    id: 'product_pack_10',
    org_id: 'studio_zrh',
    name: {
      'de-CH': '10er-Abo',
      'fr-CH': 'Forfait 10 cours',
      'it-CH': 'Pacchetto 10 lezioni',
      'en-CH': '10-Class Package'
    },
    description: {
      'de-CH': '10 Yoga-Stunden zum Vorzugspreis, 4 Monate gültig',
      'fr-CH': '10 cours de yoga à prix préférentiel, valable 4 mois',
      'it-CH': '10 lezioni di yoga a prezzo preferenziale, valido 4 mesi',
      'en-CH': '10 yoga classes at a preferential rate, valid for 4 months'
    },
    type: 'package' as const,
    price: 320.00,
    credits: 10,
    validity_days: 120,
    is_unlimited: false,
    is_recurring: false,
    is_gift_eligible: true,
    is_active: true,
    sort_order: 2
  },
  {
    id: 'product_unlimited_monthly',
    org_id: 'studio_zrh',
    name: {
      'de-CH': 'Unlimited Monatsabo',
      'fr-CH': 'Abonnement mensuel illimité',
      'it-CH': 'Abbonamento mensile illimitato',
      'en-CH': 'Unlimited Monthly Membership'
    },
    description: {
      'de-CH': 'Unbegrenzte Teilnahme an allen regulären Kursen',
      'fr-CH': 'Participation illimitée à tous les cours réguliers',
      'it-CH': 'Partecipazione illimitata a tutti i corsi regolari',
      'en-CH': 'Unlimited access to all regular classes'
    },
    type: 'membership' as const,
    price: 149.00,
    credits: null,
    validity_days: 30,
    is_unlimited: true,
    is_recurring: true,
    recurring_interval: 'monthly' as const,
    is_gift_eligible: false,
    is_active: true,
    sort_order: 3
  },
  {
    id: 'product_gift_card_100',
    org_id: 'studio_zrh',
    name: {
      'de-CH': 'Geschenkkarte CHF 100',
      'fr-CH': 'Carte cadeau CHF 100',
      'it-CH': 'Buono regalo CHF 100',
      'en-CH': 'Gift Card CHF 100'
    },
    description: {
      'de-CH': 'Geschenkkarte im Wert von CHF 100 für Yoga-Kurse',
      'fr-CH': 'Carte cadeau d\'une valeur de CHF 100 pour cours de yoga',
      'it-CH': 'Buono regalo del valore di CHF 100 per corsi di yoga',
      'en-CH': 'Gift card worth CHF 100 for yoga classes'
    },
    type: 'gift_card' as const,
    price: 100.00,
    credits: null,
    validity_days: 365,
    is_unlimited: false,
    is_recurring: false,
    is_gift_eligible: false,
    is_active: true,
    sort_order: 4
  }
];

// Generate some sample class occurrences for the next 2 weeks
export function generateDemoClassOccurrences() {
  const occurrences = [];
  const now = new Date();
  const scheduleTemplates = [
    { templateId: 'template_vinyasa_60', locationId: 'location_zrh_kreis6', days: [1, 3, 5], time: '18:00' },
    { templateId: 'template_yin_75', locationId: 'location_zrh_kreis6', days: [0, 2], time: '19:30' },
    { templateId: 'template_vinyasa_60', locationId: 'location_zrh_outdoor', days: [6], time: '09:00' },
  ];

  for (let day = 0; day < 14; day++) {
    const currentDate = new Date(now);
    currentDate.setDate(now.getDate() + day);
    const dayOfWeek = currentDate.getDay();

    scheduleTemplates.forEach(schedule => {
      if (schedule.days.includes(dayOfWeek)) {
        const [hour, minute] = schedule.time.split(':').map(Number);
        const startTime = new Date(currentDate);
        startTime.setHours(hour, minute, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 60); // Default 60 minutes

        occurrences.push({
          id: `occurrence_${schedule.templateId}_${startTime.getTime()}`,
          template_id: schedule.templateId,
          org_id: 'studio_zrh',
          instructor_id: 'instructor@yogaswiss-demo.ch', // Will be converted to actual user ID
          location_id: schedule.locationId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          price: 35.00,
          capacity: 20,
          booked_count: Math.floor(Math.random() * 15), // Random bookings
          waitlist_count: Math.floor(Math.random() * 3),
          status: 'scheduled' as const,
          weather_backup_used: false
        });
      }
    });
  }

  return occurrences;
}

// Sample finance data
export const DEMO_ORDERS = [
  {
    id: 'order_001',
    customer_id: 'customer@yogaswiss-demo.ch', // Will be converted to actual user ID
    org_id: 'studio_zrh',
    status: 'completed' as const,
    items: [
      { product_id: 'product_pack_10', quantity: 1, price: 320.00, name: '10er-Abo' }
    ],
    subtotal: 298.13,
    tax_amount: 21.87,
    total_amount: 320.00,
    currency: 'CHF',
    payment_method: 'twint' as const,
    payment_status: 'completed' as const,
    notes: 'Demo order - 10-class package'
  },
  {
    id: 'order_002',
    customer_id: 'customer@yogaswiss-demo.ch',
    org_id: 'studio_zrh',
    status: 'completed' as const,
    items: [
      { product_id: 'product_drop_in', quantity: 1, price: 35.00, name: 'Drop-in Class' }
    ],
    subtotal: 32.52,
    tax_amount: 2.48,
    total_amount: 35.00,
    currency: 'CHF',
    payment_method: 'credit_card' as const,
    payment_status: 'completed' as const,
    notes: 'Demo order - single class'
  },
  {
    id: 'order_003',
    customer_id: 'customer@yogaswiss-demo.ch',
    org_id: 'studio_zrh',
    status: 'refunded' as const,
    items: [
      { product_id: 'product_unlimited_monthly', quantity: 1, price: 149.00, name: 'Unlimited Monthly' }
    ],
    subtotal: 138.33,
    tax_amount: 10.67,
    total_amount: 149.00,
    currency: 'CHF',
    payment_method: 'credit_card' as const,
    payment_status: 'refunded' as const,
    notes: 'Demo order - partial refund processed'
  }
];