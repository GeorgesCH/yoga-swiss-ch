import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Heart,
  Globe,
  TreePine,
  Waves,
  Mountain,
  CheckCircle,
  ArrowRight,
  Download,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Share2,
  Gift,
  Target,
  Award,
  Leaf,
  Sparkles,
  BookOpen,
  Camera,
  Coffee,
  Utensils,
  Bed,
  Car,
  Plane,
  Shield,
  Euro,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Quote,
  PlayCircle,
  X
} from 'lucide-react';

interface Retreat {
  id: string;
  title: { [lang: string]: string };
  subtitle: { [lang: string]: string };
  slug: string;
  long_description_md: { [lang: string]: string };
  destination: {
    name: { [lang: string]: string };
    country_code: string;
    region: { [lang: string]: string };
  };
  venue: {
    name: { [lang: string]: string };
    description: { [lang: string]: string };
    amenities: string[];
    room_types: Array<{
      type: string;
      name: { [lang: string]: string };
      capacity: number;
      price_modifier: number;
    }>;
  };
  type: string;
  style_tags: string[];
  duration_days: number;
  duration_nights: number;
  base_price: number;
  currency: string;
  deposit_amount: number;
  early_bird_discount: number;
  early_bird_deadline: string;
  lead_instructors: string[];
  supporting_team: Array<{
    name: string;
    role: string;
    bio: { [lang: string]: string };
    image: string;
  }>;
  includes: string[];
  excludes: string[];
  sessions: Array<{
    id: string;
    name?: { [lang: string]: string };
    start_date: string;
    end_date: string;
    status: string;
    current_bookings: number;
    max_participants: number;
    restrictions?: any;
    special_features?: string[];
  }>;
  testimonials: Array<{
    name: string;
    location: string;
    text: { [lang: string]: string };
    image: string;
    rating: number;
    retreat_year: number;
  }>;
  faq: Array<{
    question: { [lang: string]: string };
    answer: { [lang: string]: string };
  }>;
  lead_magnet: {
    title: { [lang: string]: string };
    description: { [lang: string]: string };
    type: string;
    file_url: string;
  };
  featured: boolean;
  rating: number;
  review_count: number;
}

interface DynamicRetreatLandingProps {
  slug: string;
  language?: 'en' | 'de' | 'fr' | 'it';
}

export function DynamicRetreatLanding({ slug, language = 'en' }: DynamicRetreatLandingProps) {
  const [retreat, setRetreat] = useState<Retreat | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);
  const [showLeadMagnet, setShowLeadMagnet] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: '',
    marketing_consent: false
  });
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingFormData, setBookingFormData] = useState<any>({});

  useEffect(() => {
    loadRetreat();
  }, [slug]);

  const loadRetreat = async () => {
    try {
      setLoading(true);
      
      // Demo retreat data (would normally fetch from API)
      const demoRetreat: Retreat = {
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
          en: `Join us for an extraordinary 6-day journey into the heart of Lithuania's pristine Labanoras Forest. This transformative retreat combines ancient Baltic traditions with modern wellness practices, offering a perfect blend of adventure, relaxation, and personal growth.

**What makes this retreat special:**
- Pristine natural setting with cozy forest houses
- Traditional Lithuanian sauna (*pirtis*) rituals
- Daily yoga, breathwork, and ice bath workshops
- Nourishing vegetarian/vegan cuisine
- Maximum 13 participants for personalized attention
- Expert guidance from certified instructors

You'll return home with renewed energy, practical stress management tools, deeper nature connection, new friendships, and unforgettable memories of Lithuania's natural beauty.`,
          de: 'Begleiten Sie uns auf einer außergewöhnlichen 6-tägigen Reise ins Herz des unberührten Labanoras-Waldes in Litauen. Dieses transformative Retreat verbindet alte baltische Traditionen mit modernen Wellness-Praktiken.'
        },
        destination: {
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
            { type: 'shared', name: { en: 'Shared Room (3 people)', de: 'Geteiltes Zimmer (3 Personen)' }, capacity: 3, price_modifier: -200 }
          ]
        },
        type: 'wellness',
        style_tags: ['yoga', 'ice_bath', 'breathwork', 'sauna', 'forest_bathing'],
        duration_days: 6,
        duration_nights: 5,
        base_price: 2450.00,
        currency: 'CHF',
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
        sessions: [
          {
            id: 'session-lit-women',
            name: { en: 'Women\'s Only Session', de: 'Nur für Frauen' },
            start_date: '2024-03-03',
            end_date: '2024-03-08',
            status: 'open',
            current_bookings: 8,
            max_participants: 13,
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
            current_bookings: 11,
            max_participants: 13
          }
        ],
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
          },
          {
            name: 'Thomas Weber',
            location: 'Basel, Switzerland',
            text: {
              en: 'An incredible journey of self-discovery. The ice bath workshops pushed me beyond my comfort zone while the forest yoga brought deep peace. The small group created genuine connections.',
              de: 'Eine unglaubliche Reise der Selbstentdeckung. Die Eisbad-Workshops brachten mich über meine Komfortzone hinaus, während das Waldyoga tiefen Frieden brachte.'
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
          },
          {
            question: { en: 'Is travel insurance required?', de: 'Ist eine Reiseversicherung erforderlich?' },
            answer: {
              en: 'Yes, comprehensive travel insurance including medical coverage is mandatory for all participants.',
              de: 'Ja, eine umfassende Reiseversicherung einschließlich medizinischer Abdeckung ist für alle Teilnehmer obligatorisch.'
            }
          }
        ],
        lead_magnet: {
          title: { en: 'Free Baltic Retreat Preparation Guide', de: 'Kostenlose Baltikum-Retreat Vorbereitungsanleitung' },
          description: {
            en: 'Everything you need to know to prepare for your Baltic retreat experience, including packing lists, travel tips, and pre-retreat practices.',
            de: 'Alles, was Sie wissen müssen, um sich auf Ihr Baltikum-Retreat-Erlebnis vorzubereiten, einschließlich Packlisten, Reisetipps und Vor-Retreat-Praktiken.'
          },
          type: 'guide',
          file_url: '/downloads/baltic-retreat-guide.pdf'
        },
        featured: true,
        rating: 4.9,
        review_count: 127
      };

      setRetreat(demoRetreat);
    } catch (error) {
      console.error('Error loading retreat:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', { 
      style: 'currency', 
      currency: 'CHF' 
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'de' ? 'de-CH' : 'en-CH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getIncludeIcon = (item: string) => {
    switch (item) {
      case 'accommodation': return Bed;
      case 'all_meals': return Utensils;
      case 'yoga_classes': return Heart;
      case 'meditation': return Target;
      case 'breathwork': return Waves;
      case 'ice_bath': return Sparkles;
      case 'sauna': return TreePine;
      case 'transport': return Car;
      case 'materials': return BookOpen;
      default: return CheckCircle;
    }
  };

  const getIncludeLabel = (item: string) => {
    const labels = {
      en: {
        accommodation: '5 nights forest accommodation',
        all_meals: 'All organic meals & snacks',
        yoga_classes: 'Daily yoga & movement',
        meditation: 'Guided meditation sessions',
        breathwork: 'Breathwork workshops',
        ice_bath: 'Ice bath experiences',
        sauna: 'Traditional sauna rituals',
        transport: 'Vilnius airport transfers',
        materials: 'All props & materials'
      },
      de: {
        accommodation: '5 Nächte Waldunterkunft',
        all_meals: 'Alle Bio-Mahlzeiten & Snacks',
        yoga_classes: 'Tägliches Yoga & Bewegung',
        meditation: 'Geführte Meditationssitzungen',
        breathwork: 'Atemarbeit-Workshops',
        ice_bath: 'Eisbad-Erfahrungen',
        sauna: 'Traditionelle Sauna-Rituale',
        transport: 'Transfers vom Flughafen Vilnius',
        materials: 'Alle Hilfsmittel & Materialien'
      }
    };

    return labels[language]?.[item as keyof typeof labels.en] || item;
  };

  const handleLeadCapture = async () => {
    try {
      console.log('Capturing lead:', leadFormData);
      // Would call API to capture lead
      setShowLeadMagnet(false);
      
      // Show success message and trigger download
      alert(`Thank you ${leadFormData.first_name}! Your guide will be emailed to you shortly.`);
      
      // Reset form
      setLeadFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        country: '',
        marketing_consent: false
      });
    } catch (error) {
      console.error('Error capturing lead:', error);
    }
  };

  const calculatePrice = (basePrice: number, roomType: string) => {
    if (!retreat) return basePrice;
    
    const roomConfig = retreat.venue.room_types.find(rt => rt.type === roomType);
    const modifier = roomConfig?.price_modifier || 0;
    const price = basePrice + modifier;
    
    // Apply early bird discount if applicable
    const isEarlyBird = new Date() < new Date(retreat.early_bird_deadline);
    return isEarlyBird ? price * (1 - retreat.early_bird_discount / 100) : price;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading retreat details...</p>
        </div>
      </div>
    );
  }

  if (!retreat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Retreat Not Found</h1>
          <p className="text-muted-foreground">The retreat you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-screen bg-gradient-to-b from-black/40 to-black/60" 
           style={{
             backgroundImage: 'url(/api/placeholder/1920/1080)',
             backgroundSize: 'cover',
             backgroundPosition: 'center'
           }}>
        <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
          <div className="max-w-4xl">
            <Badge className="mb-4 bg-primary/20 text-white border-white/30">
              {retreat.destination.region[language]} • {retreat.duration_days} Days
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {retreat.title[language]}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              {retreat.subtitle[language]}
            </p>
            
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{retreat.rating}</span>
                <span className="text-white/80">({retreat.review_count} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Max {retreat.sessions[0]?.max_participants} participants</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{retreat.destination.name[language]}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
                onClick={() => setShowBookingForm(true)}
              >
                Book Your Transformation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-black px-8 py-6 text-lg"
                onClick={() => setShowLeadMagnet(true)}
              >
                <Download className="mr-2 h-5 w-5" />
                Free Preparation Guide
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Price Box */}
        <div className="absolute bottom-8 right-8 hidden lg:block">
          <Card className="bg-white/95 backdrop-blur">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Starting from</div>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(calculatePrice(retreat.base_price, 'shared'))}
                </div>
                {new Date() < new Date(retreat.early_bird_deadline) && (
                  <Badge className="bg-green-100 text-green-800 mt-2">
                    {retreat.early_bird_discount}% Early Bird Savings
                  </Badge>
                )}
                <Button className="w-full mt-4" onClick={() => setShowBookingForm(true)}>
                  Reserve Your Spot
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="program">Program</TabsTrigger>
            <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
            <TabsTrigger value="testimonials">Reviews</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-6">About This Retreat</h2>
                    <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
                      {retreat.long_description_md[language].split('\n').map((paragraph, index) => {
                        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                          return <p key={index} className="font-semibold text-foreground">{paragraph.slice(2, -2)}</p>;
                        }
                        if (paragraph.startsWith('- ')) {
                          return <li key={index} className="ml-4">{paragraph.slice(2)}</li>;
                        }
                        return <p key={index} className="mb-4">{paragraph}</p>;
                      })}
                    </div>

                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Experience Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {retreat.style_tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="capitalize">
                            {tag.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* What's Included */}
                <Card className="mt-8">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold mb-6">What's Included</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {retreat.includes.map((item) => {
                        const IconComponent = getIncludeIcon(item);
                        return (
                          <div key={item} className="flex items-center gap-3">
                            <IconComponent className="h-5 w-5 text-green-600" />
                            <span>{getIncludeLabel(item)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                {/* Available Sessions */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Available Sessions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {retreat.sessions.map((session) => (
                      <div key={session.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">
                            {session.name ? session.name[language] : `Session ${session.id}`}
                          </h4>
                          <Badge 
                            variant={session.status === 'open' ? 'default' : 'secondary'}
                            className={
                              session.status === 'open' ? 'bg-green-100 text-green-800' :
                              session.status === 'filling_up' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {session.status === 'open' ? 'Available' : 
                             session.status === 'filling_up' ? 'Filling Up' : 'Sold Out'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {formatDate(session.start_date)} - {formatDate(session.end_date)}
                        </div>
                        <div className="text-sm">
                          {session.max_participants - session.current_bookings} spots remaining
                        </div>
                        <Progress 
                          value={(session.current_bookings / session.max_participants) * 100} 
                          className="mt-2 h-2"
                        />
                        {session.special_features && session.special_features.length > 0 && (
                          <div className="mt-2">
                            {session.special_features.map((feature) => (
                              <Badge key={feature} variant="outline" className="text-xs mr-1">
                                {feature.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Lead Magnet CTA */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Gift className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">{retreat.lead_magnet.title[language]}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {retreat.lead_magnet.description[language]}
                    </p>
                    <Button 
                      onClick={() => setShowLeadMagnet(true)}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Get Free Guide
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="program">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Daily Program</h2>
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5, 6].map((day) => (
                    <div key={day} className="border-l-4 border-primary/20 pl-6">
                      <h3 className="font-semibold text-lg mb-2">Day {day}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Morning</div>
                          <div className="font-medium">Sunrise Meditation & Vinyasa Flow</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Afternoon</div>
                          <div className="font-medium">
                            {day === 1 ? 'Welcome & Forest Walk' :
                             day === 2 ? 'Breathwork Workshop' :
                             day === 3 ? 'Ice Bath Experience' :
                             day === 4 ? 'Sauna Ritual & Lake Time' :
                             day === 5 ? 'Vision Board Session' :
                             'Integration & Departure'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accommodation">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Accommodation</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-4">{retreat.venue.name[language]}</h3>
                      <p className="text-muted-foreground mb-6">
                        {retreat.venue.description[language]}
                      </p>
                      
                      <h4 className="font-medium mb-3">Amenities</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {retreat.venue.amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="capitalize">{amenity.replace('_', ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <img 
                        src="/api/placeholder/500/300" 
                        alt="Accommodation"
                        className="rounded-lg w-full h-64 object-cover"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-6">Room Options & Pricing</h3>
                  <div className="grid gap-4">
                    {retreat.venue.room_types.map((roomType) => {
                      const price = calculatePrice(retreat.base_price, roomType.type);
                      const isEarlyBird = new Date() < new Date(retreat.early_bird_deadline);
                      
                      return (
                        <div key={roomType.type} className="p-6 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{roomType.name[language]}</h4>
                              <p className="text-sm text-muted-foreground">
                                Capacity: {roomType.capacity} person{roomType.capacity > 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">
                                {formatCurrency(price)}
                              </div>
                              {isEarlyBird && roomType.price_modifier === 0 && (
                                <div className="text-sm text-muted-foreground line-through">
                                  {formatCurrency(retreat.base_price)}
                                </div>
                              )}
                              <div className="text-sm text-muted-foreground">
                                Deposit: {formatCurrency(retreat.deposit_amount)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="testimonials">
            <div className="space-y-6">
              {retreat.testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {testimonial.name} • {testimonial.location}
                          </span>
                        </div>
                        <Quote className="h-5 w-5 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground italic">
                          {testimonial.text[language]}
                        </p>
                        <div className="text-xs text-muted-foreground mt-2">
                          Retreat participant {testimonial.retreat_year}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="faq">
            <div className="space-y-4">
              {retreat.faq.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{item.question[language]}</h3>
                    <p className="text-muted-foreground">{item.answer[language]}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Life?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join us in the pristine forests of Lithuania for an unforgettable wellness journey.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => setShowBookingForm(true)}
              className="px-8 py-6 text-lg"
            >
              Apply for Your Spot
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setShowLeadMagnet(true)}
              className="px-8 py-6 text-lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Free Guide
            </Button>
          </div>
        </div>
      </div>

      {/* Lead Magnet Modal */}
      <Dialog open={showLeadMagnet} onOpenChange={setShowLeadMagnet}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {retreat.lead_magnet.title[language]}
            </DialogTitle>
            <p className="text-center text-muted-foreground text-sm">
              {retreat.lead_magnet.description[language]}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input 
                  value={leadFormData.first_name}
                  onChange={(e) => setLeadFormData({...leadFormData, first_name: e.target.value})}
                  placeholder="Your first name"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input 
                  value={leadFormData.last_name}
                  onChange={(e) => setLeadFormData({...leadFormData, last_name: e.target.value})}
                  placeholder="Your last name"
                />
              </div>
            </div>
            <div>
              <Label>Email Address</Label>
              <Input 
                type="email"
                value={leadFormData.email}
                onChange={(e) => setLeadFormData({...leadFormData, email: e.target.value})}
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <Label>Country</Label>
              <Select value={leadFormData.country} onValueChange={(value) => setLeadFormData({...leadFormData, country: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CH">Switzerland</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="AT">Austria</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="IT">Italy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="marketing"
                checked={leadFormData.marketing_consent}
                onCheckedChange={(checked) => setLeadFormData({...leadFormData, marketing_consent: checked as boolean})}
              />
              <label htmlFor="marketing" className="text-sm">
                I'd like to receive updates about future retreats and wellness tips
              </label>
            </div>
            <Button onClick={handleLeadCapture} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Get My Free Guide
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}