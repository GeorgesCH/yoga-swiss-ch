import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Enable CORS for all routes
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Initialize Supabase client with service role
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper function to verify authentication
const verifyAuth = async (request: Request) => {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  const orgId = request.headers.get('X-Org-ID');
  
  if (!accessToken) {
    return { user: null, orgUser: null, error: 'No access token provided' };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { user: null, orgUser: null, error: error?.message || 'Invalid token' };
  }

  // If org access is required, verify user belongs to org
  let orgUser = null;
  if (orgId) {
    orgUser = await kv.get(`org_user:${orgId}:${user.id}`);
    if (!orgUser || orgUser.status !== 'active') {
      return { user, orgUser: null, error: 'Access denied to organization' };
    }
  }
  
  return { user, orgUser, error: null };
};

// =====================================================
// DYNAMIC RETREATS SYSTEM API
// Scalable system for any retreat abroad with lead generation
// =====================================================

// Helper functions
const generateSlug = (title: string, existingSlugs: string[] = []): string => {
  let baseSlug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

const formatCurrency = (amount: number, currency: string = 'CHF') => {
  return new Intl.NumberFormat('de-CH', { 
    style: 'currency', 
    currency: currency 
  }).format(amount);
};

// =====================================================
// PUBLIC RETREAT DIRECTORY
// =====================================================

// Get all published retreats (public landing pages)
app.get('/retreats/public', async (c) => {
  try {
    const destination = c.req.query('destination');
    const type = c.req.query('type');
    const minPrice = parseInt(c.req.query('min_price') || '0');
    const maxPrice = parseInt(c.req.query('max_price') || '999999');
    const startDate = c.req.query('start_date');
    const endDate = c.req.query('end_date');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    // Demo retreats data for various destinations
    const demoRetreats = [
      {
        id: 'retreat-lithuania-baltic',
        title: {
          en: 'The Baltic Experience - Lithuania Forest Retreat',
          de: 'Das Baltische Erlebnis - Litauen Waldretreat',
          fr: 'L\'Expérience Baltique - Retraite en Forêt Lituanienne',
          it: 'L\'Esperienza Baltica - Ritiro nella Foresta Lituana'
        },
        slug: 'baltic-experience-lithuania',
        destination: {
          name: { en: 'Lithuania', de: 'Litauen', fr: 'Lituanie', it: 'Lituania' },
          country_code: 'LT',
          region: { en: 'Baltic States', de: 'Baltikum', fr: 'États Baltes', it: 'Stati Baltici' }
        },
        description: {
          en: 'Immerse yourself in the pristine Labanoras Forest with daily yoga, ice baths, sauna rituals, and nourishing cuisine.',
          de: 'Tauchen Sie ein in den unberührten Labanoras-Wald mit täglichem Yoga, Eisbädern, Sauna-Ritualen und nahrhafter Küche.',
          fr: 'Plongez dans la forêt pristine de Labanoras avec du yoga quotidien, des bains glacés, des rituels de sauna et une cuisine nourrissante.',
          it: 'Immergiti nella foresta incontaminata di Labanoras con yoga quotidiano, bagni di ghiaccio, rituali di sauna e cucina nutriente.'
        },
        type: 'wellness',
        style_tags: ['yoga', 'ice_bath', 'breathwork', 'sauna', 'forest_bathing'],
        duration_days: 6,
        duration_nights: 5,
        min_participants: 10,
        max_participants: 13,
        base_price: 2450.00,
        currency: 'CHF',
        deposit_amount: 500.00,
        early_bird_discount: 10,
        early_bird_deadline: '2024-12-31',
        hero_image_url: '/api/placeholder/1200/600',
        gallery_urls: [
          '/api/placeholder/800/600',
          '/api/placeholder/800/600',
          '/api/placeholder/800/600'
        ],
        sessions: [
          {
            id: 'session-lit-1',
            name: { en: 'Women\'s Only Session', de: 'Nur für Frauen', fr: 'Session Femmes Uniquement', it: 'Solo Donne' },
            start_date: '2024-03-03',
            end_date: '2024-03-08',
            status: 'open',
            current_bookings: 8,
            spots_remaining: 5
          },
          {
            id: 'session-lit-2', 
            name: { en: 'Mixed Group Session', de: 'Gemischte Gruppe', fr: 'Session Mixte', it: 'Gruppo Misto' },
            start_date: '2024-03-10',
            end_date: '2024-03-15',
            status: 'filling_up',
            current_bookings: 11,
            spots_remaining: 2
          }
        ],
        includes: [
          'accommodation', 'all_meals', 'yoga_classes', 'meditation', 
          'breathwork', 'ice_bath', 'sauna', 'transport', 'materials'
        ],
        featured: true,
        rating: 4.9,
        review_count: 127,
        lead_magnet: {
          title: { en: 'Free Baltic Retreat Packing Guide', de: 'Kostenlose Packliste für Baltikum-Retreat' },
          type: 'guide'
        }
      },
      {
        id: 'retreat-bali-sanctuary',
        title: {
          en: 'Bali Sacred Waters - Traditional Healing Retreat',
          de: 'Bali Heilige Wasser - Traditionelles Heilungsretreat',
          fr: 'Eaux Sacrées de Bali - Retraite de Guérison Traditionnelle',
          it: 'Acque Sacre di Bali - Ritiro di Guarigione Tradizionale'
        },
        slug: 'bali-sacred-waters',
        destination: {
          name: { en: 'Bali, Indonesia', de: 'Bali, Indonesien', fr: 'Bali, Indonésie', it: 'Bali, Indonesia' },
          country_code: 'ID',
          region: { en: 'Southeast Asia', de: 'Südostasien', fr: 'Asie du Sud-Est', it: 'Sud-est asiatico' }
        },
        description: {
          en: 'Journey into Bali\'s spiritual heart with water ceremonies, temple visits, traditional healing, and transformative yoga practices.',
          de: 'Reisen Sie ins spirituelle Herz Balis mit Wasser-Zeremonien, Tempelbesuchen, traditioneller Heilung und transformativen Yoga-Praktiken.',
          fr: 'Voyagez au cœur spirituel de Bali avec des cérémonies de l\'eau, des visites de temples, des guérisons traditionnelles et des pratiques de yoga transformatrices.',
          it: 'Viaggia nel cuore spirituale di Bali con cerimonie dell\'acqua, visite ai templi, guarigione tradizionale e pratiche yoga trasformative.'
        },
        type: 'spiritual',
        style_tags: ['traditional_healing', 'water_ceremony', 'temple_visits', 'balinese_culture', 'spiritual_yoga'],
        duration_days: 8,
        duration_nights: 7,
        min_participants: 8,
        max_participants: 12,
        base_price: 3200.00,
        currency: 'CHF',
        deposit_amount: 800.00,
        early_bird_discount: 15,
        early_bird_deadline: '2024-11-30',
        hero_image_url: '/api/placeholder/1200/600',
        gallery_urls: [
          '/api/placeholder/800/600',
          '/api/placeholder/800/600',
          '/api/placeholder/800/600'
        ],
        sessions: [
          {
            id: 'session-bali-1',
            start_date: '2024-04-15',
            end_date: '2024-04-22',
            status: 'open',
            current_bookings: 6,
            spots_remaining: 6
          }
        ],
        includes: [
          'eco_lodge_accommodation', 'vegetarian_meals', 'yoga_classes', 'meditation', 
          'healing_ceremonies', 'temple_visits', 'cultural_activities', 'airport_transfer'
        ],
        featured: true,
        rating: 4.8,
        review_count: 89,
        lead_magnet: {
          title: { en: 'Balinese Healing Practices Guide', de: 'Leitfaden für balinesische Heilpraktiken' },
          type: 'guide'
        }
      },
      {
        id: 'retreat-costa-rica-jungle',
        title: {
          en: 'Costa Rica Jungle Awakening - Adventure & Yoga',
          de: 'Costa Rica Dschungel-Erwachen - Abenteuer & Yoga',
          fr: 'Éveil de la Jungle du Costa Rica - Aventure & Yoga',
          it: 'Risveglio della Giungla del Costa Rica - Avventura & Yoga'
        },
        slug: 'costa-rica-jungle-awakening',
        destination: {
          name: { en: 'Costa Rica', de: 'Costa Rica', fr: 'Costa Rica', it: 'Costa Rica' },
          country_code: 'CR',
          region: { en: 'Central America', de: 'Mittelamerika', fr: 'Amérique Centrale', it: 'America Centrale' }
        },
        description: {
          en: 'Connect with nature in the Costa Rican rainforest through adventure yoga, wildlife encounters, and sustainable living practices.',
          de: 'Verbinden Sie sich mit der Natur im costaricanischen Regenwald durch Abenteuer-Yoga, Tierbegegnungen und nachhaltige Lebenspraktiken.',
          fr: 'Connectez-vous avec la nature dans la forêt tropicale du Costa Rica à travers le yoga d\'aventure, les rencontres avec la faune et les pratiques de vie durable.',
          it: 'Connettiti con la natura nella foresta pluviale del Costa Rica attraverso yoga d\'avventura, incontri con la fauna selvatica e pratiche di vita sostenibile.'
        },
        type: 'adventure',
        style_tags: ['adventure_yoga', 'wildlife', 'sustainability', 'rainforest', 'eco_conscious'],
        duration_days: 7,
        duration_nights: 6,
        min_participants: 8,
        max_participants: 14,
        base_price: 2890.00,
        currency: 'CHF',
        deposit_amount: 600.00,
        hero_image_url: '/api/placeholder/1200/600',
        sessions: [
          {
            id: 'session-cr-1',
            start_date: '2024-05-20',
            end_date: '2024-05-26',
            status: 'open',
            current_bookings: 5,
            spots_remaining: 9
          }
        ],
        includes: [
          'eco_lodge_accommodation', 'organic_meals', 'adventure_activities', 
          'yoga_classes', 'wildlife_tours', 'sustainability_workshops'
        ],
        featured: false,
        rating: 4.7,
        review_count: 56
      }
    ];

    let filteredRetreats = demoRetreats;

    // Apply filters
    if (destination) {
      filteredRetreats = filteredRetreats.filter(r => 
        r.destination.country_code.toLowerCase() === destination.toLowerCase() ||
        r.destination.name.en.toLowerCase().includes(destination.toLowerCase())
      );
    }
    
    if (type) {
      filteredRetreats = filteredRetreats.filter(r => r.type === type);
    }
    
    if (minPrice || maxPrice) {
      filteredRetreats = filteredRetreats.filter(r => 
        r.base_price >= minPrice && r.base_price <= maxPrice
      );
    }

    const total = filteredRetreats.length;
    const paginatedRetreats = filteredRetreats.slice(offset, offset + limit);

    return c.json({
      retreats: paginatedRetreats,
      total,
      limit,
      offset,
      has_more: offset + limit < total,
      filters: {
        destinations: [
          { code: 'LT', name: 'Lithuania', count: 1 },
          { code: 'ID', name: 'Indonesia (Bali)', count: 1 },
          { code: 'CR', name: 'Costa Rica', count: 1 }
        ],
        types: [
          { value: 'wellness', label: 'Wellness', count: 1 },
          { value: 'spiritual', label: 'Spiritual', count: 1 },
          { value: 'adventure', label: 'Adventure', count: 1 }
        ],
        price_ranges: [
          { min: 0, max: 2000, label: 'Under CHF 2,000', count: 0 },
          { min: 2000, max: 3000, label: 'CHF 2,000 - 3,000', count: 2 },
          { min: 3000, max: 5000, label: 'CHF 3,000 - 5,000', count: 1 }
        ]
      }
    });

  } catch (error) {
    console.error('Error fetching public retreats:', error);
    return c.json({ error: 'Failed to fetch retreats' }, 500);
  }
});

// Get retreat details by slug (public landing page)
app.get('/retreats/public/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const lang = c.req.query('lang') || 'en';

    // Demo retreat details based on slug
    const retreatDetails: any = {
      'baltic-experience-lithuania': {
        id: 'retreat-lithuania-baltic',
        title: {
          en: 'The Baltic Experience - Lithuania Forest Retreat',
          de: 'Das Baltische Erlebnis - Litauen Waldretreat',
          fr: 'L\'Expérience Baltique - Retraite en Forêt Lituanienne',
          it: 'L\'Esperienza Baltica - Ritiro nella Foresta Lituana'
        },
        subtitle: {
          en: 'A transformative journey in the pristine Labanoras Forest',
          de: 'Eine transformative Reise im unberührten Labanoras-Wald',
          fr: 'Un voyage transformateur dans la forêt pristine de Labanoras',
          it: 'Un viaggio trasformativo nella foresta incontaminata di Labanoras'
        },
        slug: 'baltic-experience-lithuania',
        long_description_md: {
          en: `# The Baltic Experience: Lithuania Forest Retreat

## Discover the Magic of Labanoras Forest

Join us for an extraordinary 6-day journey into the heart of Lithuania's pristine Labanoras Forest. This transformative retreat combines ancient Baltic traditions with modern wellness practices, offering a perfect blend of adventure, relaxation, and personal growth.

### What Makes This Retreat Special

- **Pristine Natural Setting**: Stay in cozy houses surrounded by pine forest and a crystal-clear lake
- **Authentic Lithuanian Experience**: Traditional sauna (*pirtis*) rituals and local cultural immersion  
- **Holistic Wellness Program**: Daily yoga, breathwork, ice baths, and meditation
- **Nourishing Cuisine**: Vegetarian/vegan meals prepared by our Swiss chef
- **Small Group Experience**: Maximum 13 participants for personalized attention
- **Expert Guidance**: Led by certified instructors with deep knowledge of Baltic traditions

### Daily Schedule

**Day 1: Arrival & Welcome**
- Airport pickup from Vilnius
- Welcome ceremony and forest walk
- Settling into accommodation
- Evening gentle yoga and meditation

**Day 2-5: Full Program Days**
- 7:00 AM - Morning meditation
- 8:00 AM - Energizing Vinyasa flow
- 9:30 AM - Nourishing breakfast
- 11:00 AM - Workshop (breathwork, journaling, vision boards)
- 1:00 PM - Lunch and rest time
- 4:00 PM - Forest activities or ice bath workshop
- 6:00 PM - Traditional sauna ritual
- 7:30 PM - Dinner
- 8:30 PM - Evening Yin/Restorative yoga or Nidra

**Day 6: Integration & Departure**
- Final morning practice
- Closing ceremony
- Transport back to Vilnius

### What's Included

- 5 nights accommodation in forest houses
- All meals (vegetarian/vegan cuisine)
- Daily yoga and meditation sessions
- Breathwork and ice bath workshops
- Traditional Lithuanian sauna rituals
- Forest walks and nature activities
- Journaling and vision board materials
- Transport from/to Vilnius city center
- All materials and props

### Investment in Yourself

This retreat is more than a vacation—it's an investment in your wellbeing and personal growth. You'll return home with:

- Renewed energy and clarity
- Practical tools for stress management
- Deeper connection to nature and yourself
- New friendships and community
- Unforgettable memories of Lithuania's natural beauty`,
          de: `# Das Baltische Erlebnis: Litauen Waldretreat

## Entdecken Sie die Magie des Labanoras-Waldes

Begleiten Sie uns auf einer außergewöhnlichen 6-tägigen Reise ins Herz des unberührten Labanoras-Waldes in Litauen. Dieses transformative Retreat verbindet alte baltische Traditionen mit modernen Wellness-Praktiken und bietet eine perfekte Mischung aus Abenteuer, Entspannung und persönlichem Wachstum.`
        },
        destination: {
          id: 'dest-lithuania',
          name: { en: 'Lithuania', de: 'Litauen', fr: 'Lituanie', it: 'Lituania' },
          country_code: 'LT',
          region: { en: 'Baltic States', de: 'Baltikum', fr: 'États Baltes', it: 'Stati Baltici' }
        },
        venue: {
          name: { en: 'Labanoras Forest Houses', de: 'Labanoras Waldhäuser' },
          description: {
            en: 'Cozy forest houses with lake access, traditional sauna, and yoga shala with fireplace',
            de: 'Gemütliche Waldhäuser mit Seezugang, traditioneller Sauna und Yoga-Shala mit Kamin'
          },
          amenities: ['yoga_shala', 'sauna', 'lake_access', 'fireplace', 'forest_setting', 'organic_garden'],
          room_types: [
            { type: 'twin', name: { en: 'Twin Room', de: 'Doppelzimmer' }, capacity: 2, price_modifier: 0 },
            { type: 'single', name: { en: 'Single Room', de: 'Einzelzimmer' }, capacity: 1, price_modifier: 300 },
            { type: 'shared', name: { en: 'Shared Room', de: 'Geteiltes Zimmer' }, capacity: 3, price_modifier: -200 }
          ]
        },
        type: 'wellness',
        style_tags: ['yoga', 'ice_bath', 'breathwork', 'sauna', 'forest_bathing'],
        difficulty_level: 'all_levels',
        duration_days: 6,
        duration_nights: 5,
        min_participants: 10,
        max_participants: 13,
        
        // Pricing
        base_price: 2450.00,
        currency: 'CHF',
        vat_rate: 0, // No VAT for retreats abroad
        deposit_amount: 500.00,
        early_bird_discount: 10,
        early_bird_deadline: '2024-12-31',
        
        lead_instructors: ['instructor-sarah', 'instructor-elena'],
        supporting_team: [
          {
            name: 'Rasa Vitaite',
            role: 'Local Guide & Cultural Expert',
            bio: { en: 'Native Lithuanian with deep knowledge of Baltic traditions and forest wisdom' },
            image: '/api/placeholder/150/150'
          },
          {
            name: 'Marco Bernasconi',
            role: 'Swiss Chef',
            bio: { en: 'Specializes in plant-based cuisine using local, organic ingredients' },
            image: '/api/placeholder/150/150'
          }
        ],
        
        includes: [
          'accommodation', 'all_meals', 'yoga_classes', 'meditation', 
          'breathwork', 'ice_bath', 'sauna', 'transport', 'materials'
        ],
        excludes: [
          'flights', 'travel_insurance', 'personal_expenses', 'alcoholic_beverages'
        ],
        
        daily_schedule: [
          {
            day: 1,
            theme: 'Arrival & Welcome',
            activities: [
              { time: '15:00', activity: 'Airport pickup', location: 'Vilnius Airport' },
              { time: '17:00', activity: 'Welcome & settling in', location: 'Forest Houses' },
              { time: '18:30', activity: 'Dinner', location: 'Main House' },
              { time: '20:00', activity: 'Gentle welcome yoga', location: 'Yoga Shala' }
            ]
          },
          // More days...
        ],
        
        sessions: [
          {
            id: 'session-lit-women',
            name: { en: 'Women\'s Only Session', de: 'Nur für Frauen' },
            start_date: '2024-03-03',
            end_date: '2024-03-08',
            status: 'open',
            max_participants: 13,
            current_bookings: 8,
            restrictions: { gender: 'female_only' },
            special_features: [
              'women_circle_ceremonies',
              'sisterhood_bonding',
              'female_empowerment_workshops'
            ]
          },
          {
            id: 'session-lit-mixed',
            name: { en: 'Mixed Group Session', de: 'Gemischte Gruppe' },
            start_date: '2024-03-10',
            end_date: '2024-03-15',
            status: 'filling_up',
            max_participants: 13,
            current_bookings: 11,
            special_offer_text: { en: 'Only 2 spots remaining!' }
          }
        ],
        
        booking_form_config: {
          steps: [
            {
              step: 1,
              title: { en: 'Personal Information', de: 'Persönliche Angaben' },
              fields: [
                { name: 'first_name', type: 'text', required: true, label: { en: 'First Name', de: 'Vorname' } },
                { name: 'last_name', type: 'text', required: true, label: { en: 'Last Name', de: 'Nachname' } },
                { name: 'email', type: 'email', required: true, label: { en: 'Email Address', de: 'E-Mail-Adresse' } },
                { name: 'phone', type: 'tel', required: true, label: { en: 'Phone Number', de: 'Telefonnummer' } },
                { name: 'date_of_birth', type: 'date', required: true, label: { en: 'Date of Birth', de: 'Geburtsdatum' } },
                { name: 'country', type: 'select', required: true, label: { en: 'Country of Residence', de: 'Wohnsitzland' } }
              ]
            },
            {
              step: 2,
              title: { en: 'Retreat Selection', de: 'Retreat-Auswahl' },
              fields: [
                { name: 'session_preference', type: 'radio', required: true, label: { en: 'Preferred Session', de: 'Bevorzugte Session' } },
                { name: 'room_type', type: 'radio', required: true, label: { en: 'Room Type', de: 'Zimmertyp' } },
                { name: 'dietary_requirements', type: 'checkbox', required: false, label: { en: 'Dietary Requirements', de: 'Ernährungsanforderungen' } }
              ]
            },
            {
              step: 3,
              title: { en: 'About You', de: 'Über Sie' },
              fields: [
                { name: 'yoga_experience', type: 'select', required: true, label: { en: 'Yoga Experience', de: 'Yoga-Erfahrung' } },
                { name: 'health_conditions', type: 'textarea', required: false, label: { en: 'Health Conditions or Injuries', de: 'Gesundheitszustand oder Verletzungen' } },
                { name: 'motivation', type: 'textarea', required: true, label: { en: 'Why do you want to join this retreat?', de: 'Warum möchten Sie an diesem Retreat teilnehmen?' } },
                { name: 'emergency_contact', type: 'object', required: true, label: { en: 'Emergency Contact', de: 'Notfallkontakt' } }
              ]
            },
            {
              step: 4,
              title: { en: 'Final Details', de: 'Abschließende Details' },
              fields: [
                { name: 'arrival_flight', type: 'text', required: false, label: { en: 'Arrival Flight Details', de: 'Ankunftsflug-Details' } },
                { name: 'departure_flight', type: 'text', required: false, label: { en: 'Departure Flight Details', de: 'Abflug-Details' } },
                { name: 'special_requests', type: 'textarea', required: false, label: { en: 'Special Requests or Questions', de: 'Besondere Wünsche oder Fragen' } }
              ]
            }
          ]
        },
        
        testimonials: [
          {
            name: 'Anna Müller',
            location: 'Zurich, Switzerland',
            text: { 
              en: 'The Lithuania retreat was life-changing. The combination of yoga, ice baths, and forest connection created the perfect healing environment. I returned home with clarity and peace I hadn\'t felt in years.',
              de: 'Das Litauen-Retreat war lebensverändernd. Die Kombination aus Yoga, Eisbädern und Waldverbindung schuf die perfekte Heilungsumgebung. Ich kehrte mit einer Klarheit und einem Frieden nach Hause zurück, die ich seit Jahren nicht gespürt hatte.'
            },
            image: '/api/placeholder/100/100',
            rating: 5,
            retreat_year: 2023
          }
        ],
        
        faq: [
          {
            question: { en: 'What should I pack for Lithuania?', de: 'Was soll ich für Litauen einpacken?' },
            answer: {
              en: 'We\'ll send you a detailed packing list, but essentials include warm layers, waterproof jacket, comfortable yoga clothes, and swimwear for ice baths.',
              de: 'Wir senden Ihnen eine detaillierte Packliste, aber wesentliche Dinge sind warme Schichten, wasserdichte Jacke, bequeme Yoga-Kleidung und Badebekleidung für Eisbäder.'
            }
          },
          {
            question: { en: 'Do I need yoga experience?', de: 'Brauche ich Yoga-Erfahrung?' },
            answer: {
              en: 'All levels are welcome! Our experienced instructors will provide modifications for beginners and challenges for advanced practitioners.',
              de: 'Alle Levels sind willkommen! Unsere erfahrenen Lehrer bieten Anpassungen für Anfänger und Herausforderungen für Fortgeschrittene.'
            }
          }
        ],
        
        lead_magnet: {
          id: 'lead-baltic-guide',
          title: { en: 'Free Baltic Retreat Preparation Guide', de: 'Kostenlose Baltikum-Retreat Vorbereitungsanleitung' },
          description: {
            en: 'Everything you need to know to prepare for your Baltic retreat experience, including packing lists, travel tips, and pre-retreat practices.',
            de: 'Alles, was Sie wissen müssen, um sich auf Ihr Baltikum-Retreat-Erlebnis vorzubereiten, einschließlich Packlisten, Reisetipps und Vor-Retreat-Praktiken.'
          },
          type: 'guide',
          file_url: '/downloads/baltic-retreat-guide.pdf'
        },
        
        seo_title: {
          en: 'Lithuania Forest Retreat - The Baltic Experience | YogaSwiss',
          de: 'Litauen Waldretreat - Das Baltische Erlebnis | YogaSwiss'
        },
        seo_description: {
          en: 'Join our transformative 6-day Lithuania retreat in Labanoras Forest. Yoga, ice baths, sauna rituals, and forest connection. March 2024 dates available.',
          de: 'Nehmen Sie an unserem transformativen 6-tägigen Litauen-Retreat im Labanoras-Wald teil. Yoga, Eisbäder, Sauna-Rituale und Waldverbindung. März 2024 Termine verfügbar.'
        },
        seo_keywords: ['lithuania retreat', 'forest yoga', 'ice bath retreat', 'baltic experience', 'wellness retreat'],
        
        featured: true,
        rating: 4.9,
        review_count: 127,
        completion_rate: 98,
        satisfaction_score: 4.8
      }
    };

    const retreat = retreatDetails[slug];

    if (!retreat) {
      return c.json({ error: 'Retreat not found' }, 404);
    }

    return c.json({ retreat });

  } catch (error) {
    console.error('Error fetching retreat details:', error);
    return c.json({ error: 'Failed to fetch retreat details' }, 500);
  }
});

// =====================================================
// LEAD GENERATION & APPLICATIONS
// =====================================================

// Submit lead magnet opt-in
app.post('/retreats/:retreatId/lead-capture', async (c) => {
  try {
    const retreatId = c.req.param('retreatId');
    const leadData = await c.req.json();

    // Create lead record
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const lead = {
      id: leadId,
      retreat_id: retreatId,
      email: leadData.email,
      first_name: leadData.first_name,
      last_name: leadData.last_name,
      phone: leadData.phone,
      country: leadData.country,
      source: 'landing_page',
      utm_campaign: leadData.utm_campaign,
      utm_source: leadData.utm_source,
      utm_medium: leadData.utm_medium,
      lead_data: leadData,
      interests: leadData.interests || [],
      budget_range: leadData.budget_range,
      preferred_dates: leadData.preferred_dates,
      marketing_consent: leadData.marketing_consent || false,
      privacy_policy_accepted: leadData.privacy_policy_accepted || false,
      status: 'new',
      created_at: new Date().toISOString()
    };

    await kv.set(`retreat_lead:${leadId}`, lead);

    // Trigger lead magnet delivery (would integrate with email service)
    const emailData = {
      to: leadData.email,
      template: 'lead_magnet_delivery',
      data: {
        first_name: leadData.first_name,
        retreat_title: 'The Baltic Experience',
        download_url: '/downloads/baltic-retreat-guide.pdf'
      }
    };

    // Add to email sequence
    const sequenceData = {
      lead_id: leadId,
      sequence_type: 'retreat_nurture',
      current_step: 1,
      started_at: new Date().toISOString()
    };

    await kv.set(`email_sequence:${leadId}`, sequenceData);

    return c.json({ 
      success: true, 
      lead_id: leadId,
      message: 'Lead captured successfully',
      download_url: '/downloads/baltic-retreat-guide.pdf'
    });

  } catch (error) {
    console.error('Error capturing lead:', error);
    return c.json({ error: 'Failed to capture lead' }, 500);
  }
});

// Submit retreat application
app.post('/retreats/:retreatId/apply', async (c) => {
  try {
    const retreatId = c.req.param('retreatId');
    const applicationData = await c.req.json();

    // Create application
    const applicationId = `application_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const application = {
      id: applicationId,
      retreat_id: retreatId,
      session_id: applicationData.session_id,
      customer_id: applicationData.customer_id,
      status: 'submitted',
      room_type: applicationData.room_type,
      room_preference: applicationData.room_preference,
      total_price: applicationData.total_price,
      currency: 'CHF',
      deposit_amount: applicationData.deposit_amount,
      remaining_balance: applicationData.total_price - applicationData.deposit_amount,
      lead_source: applicationData.lead_source || 'direct',
      application_data: applicationData.form_data,
      dietary_requirements: applicationData.dietary_requirements || [],
      medical_conditions: applicationData.medical_conditions,
      emergency_contact: applicationData.emergency_contact,
      arrival_flight_info: applicationData.arrival_flight_info,
      departure_flight_info: applicationData.departure_flight_info,
      travel_insurance: applicationData.travel_insurance || false,
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    await kv.set(`retreat_application:${applicationId}`, application);

    // Create notification for admin
    const notification = {
      id: `notification_${Date.now()}_retreat`,
      type: 'retreat_application',
      priority: 'medium',
      title: 'New Retreat Application',
      message: `New application for Lithuania Baltic Experience retreat`,
      timestamp: new Date().toISOString(),
      read: false,
      metadata: {
        application_id: applicationId,
        retreat_id: retreatId,
        customer_email: applicationData.form_data.email
      }
    };

    await kv.set(`notification:${notification.id}`, notification);

    return c.json({ 
      success: true, 
      application_id: applicationId,
      status: 'submitted',
      message: 'Application submitted successfully. We will review and respond within 48 hours.',
      next_steps: [
        'Application review (24-48 hours)',
        'Approval notification via email', 
        'Deposit payment instructions',
        'Final details and preparation guide'
      ]
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    return c.json({ error: 'Failed to submit application' }, 500);
  }
});

// Get user's retreat applications
app.get('/retreats/my-applications', async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: authError || 'Authentication required' }, 401);
    }

    // Get all applications for user
    const applicationKeys = await kv.getByPrefix(`retreat_application:`);
    const userApplications = applicationKeys
      .filter(item => item.value.customer_id === user.id)
      .map(item => item.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ applications: userApplications });

  } catch (error) {
    console.error('Error fetching user applications:', error);
    return c.json({ error: 'Failed to fetch applications' }, 500);
  }
});

// =====================================================
// ADMIN ENDPOINTS
// =====================================================

// Get all applications for organization (admin)
app.get('/admin/retreats/:retreatId/applications', async (c) => {
  try {
    const { user, orgUser, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !orgUser) {
      return c.json({ error: authError || 'Admin access required' }, 401);
    }

    const retreatId = c.req.param('retreatId');
    const status = c.req.query('status') || 'all';

    // Get all applications for retreat
    const applicationKeys = await kv.getByPrefix(`retreat_application:`);
    let applications = applicationKeys
      .filter(item => item.value.retreat_id === retreatId)
      .map(item => item.value);

    if (status !== 'all') {
      applications = applications.filter(app => app.status === status);
    }

    // Sort by submission date
    applications.sort((a, b) => new Date(b.submitted_at || b.created_at).getTime() - new Date(a.submitted_at || a.created_at).getTime());

    return c.json({ applications });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return c.json({ error: 'Failed to fetch applications' }, 500);
  }
});

// Approve/reject application (admin)
app.put('/admin/applications/:applicationId/review', async (c) => {
  try {
    const { user, orgUser, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !orgUser) {
      return c.json({ error: authError || 'Admin access required' }, 401);
    }

    const applicationId = c.req.param('applicationId');
    const { status, admin_notes, room_assignment } = await c.req.json();

    const application = await kv.get(`retreat_application:${applicationId}`);
    if (!application) {
      return c.json({ error: 'Application not found' }, 404);
    }

    // Update application
    application.status = status;
    application.admin_notes = admin_notes;
    application.reviewed_at = new Date().toISOString();
    
    if (status === 'approved') {
      application.approved_at = new Date().toISOString();
    }

    await kv.set(`retreat_application:${applicationId}`, application);

    return c.json({ success: true, application });

  } catch (error) {
    console.error('Error reviewing application:', error);
    return c.json({ error: 'Failed to review application' }, 500);
  }
});

// Create new retreat (admin)
app.post('/admin/retreats', async (c) => {
  try {
    const { user, orgUser, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !orgUser) {
      return c.json({ error: authError || 'Admin access required' }, 401);
    }

    const retreatData = await c.req.json();
    const retreatId = `retreat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const retreat = {
      id: retreatId,
      org_id: orgUser.org_id,
      title: retreatData.title,
      slug: retreatData.slug || generateSlug(retreatData.title),
      description: retreatData.description,
      destination_country: retreatData.destination_country,
      type: retreatData.type,
      duration_days: retreatData.duration_days,
      base_price: retreatData.base_price,
      currency: 'CHF',
      status: 'draft',
      visibility: 'private',
      created_at: new Date().toISOString(),
      created_by: user.id
    };

    await kv.set(`retreat:${retreatId}`, retreat);

    return c.json({ success: true, retreat_id: retreatId, retreat });

  } catch (error) {
    console.error('Error creating retreat:', error);
    return c.json({ error: 'Failed to create retreat' }, 500);
  }
});

// Simple health check
app.get('/retreats/health', (c) => {
  return c.json({ 
    status: 'Dynamic Global Retreats service is running', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: ['lead_generation', 'multi_language', 'dynamic_forms', 'global_destinations']
  });
});

export default app;
