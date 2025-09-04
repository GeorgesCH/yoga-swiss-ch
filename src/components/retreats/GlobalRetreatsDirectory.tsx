import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { 
  Search, 
  Filter, 
  MapPin,
  Calendar,
  Users,
  Star,
  Clock,
  Globe,
  Mountain,
  TreePine,
  Waves,
  Heart,
  Target,
  Award,
  Sparkles,
  Euro,
  Eye,
  BookOpen,
  TrendingUp,
  Compass,
  Map,
  SlidersHorizontal
} from 'lucide-react';

interface Retreat {
  id: string;
  title: { [lang: string]: string };
  slug: string;
  destination: {
    name: { [lang: string]: string };
    country_code: string;
    region: { [lang: string]: string };
  };
  description: { [lang: string]: string };
  type: string;
  style_tags: string[];
  duration_days: number;
  duration_nights: number;
  min_participants: number;
  max_participants: number;
  base_price: number;
  currency: string;
  deposit_amount: number;
  early_bird_discount?: number;
  early_bird_deadline?: string;
  hero_image_url: string;
  gallery_urls?: string[];
  sessions: Array<{
    id: string;
    name?: { [lang: string]: string };
    start_date: string;
    end_date: string;
    status: string;
    current_bookings: number;
    spots_remaining: number;
  }>;
  includes: string[];
  featured: boolean;
  rating: number;
  review_count: number;
  lead_magnet?: {
    title: { [lang: string]: string };
    type: string;
  };
}

interface Filters {
  destination?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  duration?: string;
}

export function GlobalRetreatsDirectory() {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [filteredRetreats, setFilteredRetreats] = useState<Retreat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [language] = useState<'en' | 'de' | 'fr' | 'it'>('en');

  useEffect(() => {
    loadRetreats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [retreats, searchQuery, filters, priceRange, sortBy]);

  const loadRetreats = async () => {
    try {
      setLoading(true);

      // Demo retreats data for global destinations
      const demoRetreats: Retreat[] = [
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
            de: 'Tauchen Sie ein in den unberührten Labanoras-Wald mit täglichem Yoga, Eisbädern, Sauna-Ritualen und nahrhafter Küche.'
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
          hero_image_url: '/api/placeholder/800/600',
          gallery_urls: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
          sessions: [
            {
              id: 'session-lit-1',
              name: { en: 'Women\'s Only Session', de: 'Nur für Frauen' },
              start_date: '2024-03-03',
              end_date: '2024-03-08',
              status: 'open',
              current_bookings: 8,
              spots_remaining: 5
            },
            {
              id: 'session-lit-2', 
              name: { en: 'Mixed Group Session', de: 'Gemischte Gruppe' },
              start_date: '2024-03-10',
              end_date: '2024-03-15',
              status: 'filling_up',
              current_bookings: 11,
              spots_remaining: 2
            }
          ],
          includes: ['accommodation', 'all_meals', 'yoga_classes', 'meditation', 'breathwork', 'ice_bath', 'sauna', 'transport', 'materials'],
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
            de: 'Reisen Sie ins spirituelle Herz Balis mit Wasser-Zeremonien, Tempelbesuchen, traditioneller Heilung und transformativen Yoga-Praktiken.'
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
          hero_image_url: '/api/placeholder/800/600',
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
          includes: ['eco_lodge_accommodation', 'vegetarian_meals', 'yoga_classes', 'meditation', 'healing_ceremonies', 'temple_visits'],
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
            de: 'Verbinden Sie sich mit der Natur im costaricanischen Regenwald durch Abenteuer-Yoga, Tierbegegnungen und nachhaltige Lebenspraktiken.'
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
          hero_image_url: '/api/placeholder/800/600',
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
          includes: ['eco_lodge_accommodation', 'organic_meals', 'adventure_activities', 'yoga_classes', 'wildlife_tours'],
          featured: false,
          rating: 4.7,
          review_count: 56
        },
        {
          id: 'retreat-morocco-desert',
          title: {
            en: 'Sahara Desert Soul Journey - Morocco Retreat',
            de: 'Sahara Wüsten-Seelenreise - Marokko Retreat',
            fr: 'Voyage de l\'Âme au Sahara - Retraite Maroc',
            it: 'Viaggio dell\'Anima nel Sahara - Ritiro Marocco'
          },
          slug: 'sahara-desert-soul-journey',
          destination: {
            name: { en: 'Morocco', de: 'Marokko', fr: 'Maroc', it: 'Marocco' },
            country_code: 'MA',
            region: { en: 'North Africa', de: 'Nordafrika', fr: 'Afrique du Nord', it: 'Nord Africa' }
          },
          description: {
            en: 'Experience the profound silence of the Sahara with desert yoga, camel trekking, Berber culture immersion, and stargazing meditation.',
            de: 'Erleben Sie die tiefe Stille der Sahara mit Wüsten-Yoga, Kamelreiten, berberischer Kulturimmersion und Sterne-Meditation.'
          },
          type: 'spiritual',
          style_tags: ['desert_yoga', 'camel_trekking', 'berber_culture', 'stargazing', 'silence_retreat'],
          duration_days: 7,
          duration_nights: 6,
          min_participants: 8,
          max_participants: 12,
          base_price: 2750.00,
          currency: 'CHF',
          deposit_amount: 650.00,
          hero_image_url: '/api/placeholder/800/600',
          sessions: [
            {
              id: 'session-ma-1',
              start_date: '2024-04-02',
              end_date: '2024-04-08',
              status: 'open',
              current_bookings: 4,
              spots_remaining: 8
            }
          ],
          includes: ['desert_camp_accommodation', 'traditional_meals', 'camel_trekking', 'yoga_classes', 'berber_guides'],
          featured: false,
          rating: 4.6,
          review_count: 34
        },
        {
          id: 'retreat-iceland-fire-ice',
          title: {
            en: 'Iceland Fire & Ice - Nordic Wellness Retreat',
            de: 'Island Feuer & Eis - Nordisches Wellness Retreat',
            fr: 'Islande Feu et Glace - Retraite Bien-être Nordique',
            it: 'Islanda Fuoco e Ghiaccio - Ritiro Benessere Nordico'
          },
          slug: 'iceland-fire-ice-wellness',
          destination: {
            name: { en: 'Iceland', de: 'Island', fr: 'Islande', it: 'Islanda' },
            country_code: 'IS',
            region: { en: 'Nordic Countries', de: 'Nordische Länder', fr: 'Pays Nordiques', it: 'Paesi Nordici' }
          },
          description: {
            en: 'Harness the power of Iceland\'s dramatic landscapes with hot spring yoga, glacier meditation, Northern Lights viewing, and geothermal wellness.',
            de: 'Nutzen Sie die Kraft der dramatischen Landschaften Islands mit Heißquelle-Yoga, Gletscher-Meditation, Nordlicht-Beobachtung und geothermischem Wellness.'
          },
          type: 'wellness',
          style_tags: ['hot_springs', 'glacier_meditation', 'northern_lights', 'geothermal_wellness', 'nordic_traditions'],
          duration_days: 5,
          duration_nights: 4,
          min_participants: 8,
          max_participants: 12,
          base_price: 3450.00,
          currency: 'CHF',
          deposit_amount: 750.00,
          hero_image_url: '/api/placeholder/800/600',
          sessions: [
            {
              id: 'session-is-1',
              start_date: '2024-02-15',
              end_date: '2024-02-19',
              status: 'filling_up',
              current_bookings: 10,
              spots_remaining: 2
            }
          ],
          includes: ['luxury_accommodation', 'gourmet_meals', 'hot_spring_access', 'yoga_classes', 'guided_tours'],
          featured: true,
          rating: 4.9,
          review_count: 78
        }
      ];

      setRetreats(demoRetreats);
      setFilteredRetreats(demoRetreats);
    } catch (error) {
      console.error('Error loading retreats:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...retreats];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(retreat => 
        retreat.title[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
        retreat.description[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
        retreat.destination.name[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
        retreat.style_tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Destination filter
    if (filters.destination && filters.destination !== 'all') {
      filtered = filtered.filter(retreat => 
        retreat.destination.country_code.toLowerCase() === filters.destination?.toLowerCase()
      );
    }

    // Type filter
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(retreat => retreat.type === filters.type);
    }

    // Price filter
    filtered = filtered.filter(retreat => 
      retreat.base_price >= priceRange[0] && retreat.base_price <= priceRange[1]
    );

    // Duration filter
    if (filters.duration && filters.duration !== 'all') {
      const [min, max] = filters.duration.split('-').map(Number);
      filtered = filtered.filter(retreat => 
        retreat.duration_days >= min && (max ? retreat.duration_days <= max : true)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating;
        case 'price_low':
          return a.base_price - b.base_price;
        case 'price_high':
          return b.base_price - a.base_price;
        case 'rating':
          return b.rating - a.rating;
        case 'duration_short':
          return a.duration_days - b.duration_days;
        case 'duration_long':
          return b.duration_days - a.duration_days;
        case 'popularity':
          return b.review_count - a.review_count;
        default:
          return 0;
      }
    });

    setFilteredRetreats(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', { 
      style: 'currency', 
      currency: 'CHF' 
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'de' ? 'de-CH' : 'en-CH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wellness': return Heart;
      case 'spiritual': return Target;
      case 'adventure': return Mountain;
      case 'yoga': return TreePine;
      case 'meditation': return Sparkles;
      default: return Globe;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'wellness': return 'text-green-600 bg-green-100';
      case 'spiritual': return 'text-purple-600 bg-purple-100';
      case 'adventure': return 'text-orange-600 bg-orange-100';
      case 'yoga': return 'text-blue-600 bg-blue-100';
      case 'meditation': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'filling_up':
        return <Badge className="bg-orange-100 text-orange-800">Filling Up</Badge>;
      case 'sold_out':
        return <Badge className="bg-red-100 text-red-800">Sold Out</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading global retreats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">Global Retreat Adventures</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Discover transformative wellness experiences around the world. From Baltic forests to Balinese temples, 
          find your perfect retreat destination.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{retreats.length}</div>
            <div className="text-sm text-muted-foreground">Destinations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">
              {retreats.reduce((sum, r) => sum + r.sessions.reduce((s, ses) => s + ses.current_bookings, 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Happy Travelers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">
              {(retreats.reduce((sum, r) => sum + r.rating, 0) / retreats.length).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">
              {retreats.reduce((sum, r) => sum + r.review_count, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Reviews</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="filters">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="filters">Filters & Search</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="filters">
              <div className="space-y-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search destinations, retreat types, or activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>

                {/* Filter Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Select value={filters.destination || 'all'} onValueChange={(value) => setFilters({...filters, destination: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Destinations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Destinations</SelectItem>
                      <SelectItem value="LT">Lithuania</SelectItem>
                      <SelectItem value="ID">Indonesia (Bali)</SelectItem>
                      <SelectItem value="CR">Costa Rica</SelectItem>
                      <SelectItem value="MA">Morocco</SelectItem>
                      <SelectItem value="IS">Iceland</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.type || 'all'} onValueChange={(value) => setFilters({...filters, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="wellness">Wellness</SelectItem>
                      <SelectItem value="spiritual">Spiritual</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.duration || 'all'} onValueChange={(value) => setFilters({...filters, duration: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Duration</SelectItem>
                      <SelectItem value="3-5">3-5 Days</SelectItem>
                      <SelectItem value="6-8">6-8 Days</SelectItem>
                      <SelectItem value="9">9+ Days</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="duration_short">Shortest Duration</SelectItem>
                      <SelectItem value="duration_long">Longest Duration</SelectItem>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Price Range</Label>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                    </span>
                  </div>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={5000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="map">
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Interactive map coming soon</p>
                  <p className="text-sm text-muted-foreground">Explore retreats by location</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {filteredRetreats.length} retreat{filteredRetreats.length !== 1 ? 's' : ''} found
          </h2>
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              Results for "{searchQuery}"
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Retreats Grid */}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredRetreats.map((retreat) => {
          const TypeIcon = getTypeIcon(retreat.type);
          const typeColor = getTypeColor(retreat.type);
          const nextSession = retreat.sessions[0];
          const isEarlyBird = retreat.early_bird_deadline && new Date() < new Date(retreat.early_bird_deadline);

          return (
            <Card key={retreat.id} className="transition-all hover:shadow-lg cursor-pointer group">
              <div className="relative">
                <img 
                  src={retreat.hero_image_url} 
                  alt={retreat.title[language]}
                  className={`w-full ${viewMode === 'grid' ? 'h-48' : 'h-32 md:h-48'} object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300`}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {retreat.featured && (
                    <Badge className="bg-yellow-500 text-yellow-900">
                      <Award className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {isEarlyBird && (
                    <Badge className="bg-green-500 text-white">
                      {retreat.early_bird_discount}% Off
                    </Badge>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <Badge className={typeColor} variant="outline">
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {retreat.type}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3">
                  {nextSession && getStatusBadge(nextSession.status)}
                </div>
              </div>

              <CardContent className={`${viewMode === 'grid' ? 'p-6' : 'p-4'}`}>
                <div className={`${viewMode === 'list' ? 'flex items-start gap-6' : ''}`}>
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{retreat.title[language]}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{retreat.destination.name[language]}</span>
                          <span>•</span>
                          <Clock className="h-4 w-4" />
                          <span>{retreat.duration_days} days</span>
                        </div>
                      </div>
                      {viewMode === 'grid' && (
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            {formatCurrency(isEarlyBird ? retreat.base_price * (1 - (retreat.early_bird_discount || 0) / 100) : retreat.base_price)}
                          </div>
                          {isEarlyBird && (
                            <div className="text-sm text-muted-foreground line-through">
                              {formatCurrency(retreat.base_price)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className={`text-muted-foreground mb-4 ${viewMode === 'list' ? 'text-sm' : ''} ${viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-1'}`}>
                      {retreat.description[language]}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {retreat.style_tags.slice(0, viewMode === 'grid' ? 3 : 5).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs capitalize">
                          {tag.replace('_', ' ')}
                        </Badge>
                      ))}
                      {retreat.style_tags.length > (viewMode === 'grid' ? 3 : 5) && (
                        <Badge variant="outline" className="text-xs">
                          +{retreat.style_tags.length - (viewMode === 'grid' ? 3 : 5)} more
                        </Badge>
                      )}
                    </div>

                    {/* Session Info */}
                    {nextSession && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">
                              {nextSession.name ? nextSession.name[language] : 'Next Session'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(nextSession.start_date)} - {formatDate(nextSession.end_date)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{nextSession.spots_remaining} spots left</div>
                            <div className="text-xs text-muted-foreground">
                              {nextSession.current_bookings}/{retreat.max_participants} booked
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{retreat.rating}</span>
                          <span className="text-xs text-muted-foreground">({retreat.review_count})</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Max {retreat.max_participants}</span>
                        </div>
                      </div>
                      
                      {viewMode === 'list' && (
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            {formatCurrency(isEarlyBird ? retreat.base_price * (1 - (retreat.early_bird_discount || 0) / 100) : retreat.base_price)}
                          </div>
                          {isEarlyBird && (
                            <div className="text-sm text-muted-foreground line-through">
                              {formatCurrency(retreat.base_price)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className={`flex gap-2 mt-4 ${viewMode === 'list' ? 'flex-col sm:flex-row' : ''}`}>
                      <Button className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {retreat.lead_magnet && (
                        <Button variant="outline" className="flex-1">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Free Guide
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRetreats.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Compass className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Retreats Found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search terms to find the perfect retreat for you.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setFilters({});
                setPriceRange([0, 5000]);
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Load More */}
      {filteredRetreats.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Retreats
            <TrendingUp className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}