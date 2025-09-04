import React, { useState } from 'react';
import { usePortal } from '../PortalProvider';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Alert, AlertDescription } from '../../ui/alert';
import { 
  Search, 
  MapPin, 
  Calendar,
  Clock,
  Users,
  Star,
  Mountain,
  Waves,
  TreePine,
  Sun,
  CloudRain,
  Thermometer,
  Wind,
  Heart,
  Share,
  Navigation,
  Info,
  AlertTriangle,
  CheckCircle,
  Umbrella
} from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

export function OutdoorPage({ onPageChange, pageParams }: { 
  onPageChange: (page: string) => void;
  pageParams?: any;
}) {
  const { currentLocation, searchQuery, setSearchQuery } = usePortal();
  const [activeCategory, setActiveCategory] = useState('all');
  const [weatherWarning, setWeatherWarning] = useState(true);

  // Handle category filtering from homepage links
  React.useEffect(() => {
    if (pageParams?.category) {
      // Map homepage category names to our filter categories
      const categoryMap: { [key: string]: string } = {
        'sunrise': 'lake', // Sunrise yoga often happens at lakes
        'sunset': 'rooftop', // Sunset yoga often on rooftops
        'mountain': 'mountain',
        'lake': 'lake', 
        'park': 'park',
        'rooftop': 'rooftop'
      };
      
      const mappedCategory = categoryMap[pageParams.category] || pageParams.category;
      if (categories.find(c => c.id === mappedCategory)) {
        setActiveCategory(mappedCategory);
      }
    }
  }, [pageParams]);

  // Mock outdoor activities data
  const outdoorActivities = [
    {
      id: '1',
      name: 'Sunrise Yoga at Lake Zürich',
      type: 'lake',
      location: 'Mythenquai Beach, Zürich',
      coordinates: { lat: 47.3588, lng: 8.5322 },
      instructor: {
        name: 'Anna Müller',
        rating: 4.9,
        image: '/placeholder-instructor-1.jpg'
      },
      schedule: [
        { date: 'Today', time: '06:30', available: true, spots: 8 },
        { date: 'Tomorrow', time: '06:30', available: true, spots: 12 },
        { date: 'Friday', time: '06:30', available: true, spots: 15 }
      ],
      duration: 60,
      level: 'All Levels',
      style: 'Hatha',
      price: 25,
      originalPrice: 30,
      maxParticipants: 15,
      image: '/placeholder-outdoor-1.jpg',
      gallery: ['/placeholder-outdoor-1-1.jpg', '/placeholder-outdoor-1-2.jpg'],
      description: 'Start your day with peaceful yoga practice as the sun rises over Lake Zürich. This gentle Hatha session focuses on breath work and gentle movements.',
      whatToBring: ['Yoga mat (rentals available)', 'Water bottle', 'Layers for changing weather', 'Towel'],
      meetingPoint: 'Mythenquai Beach, near the red sculpture',
      surfaceType: 'Grass/Sand',
      amenities: ['Nearby toilets', 'Parking available', 'Public transport access'],
      backupPlan: 'Indoor studio at Flow Zürich (5min walk)',
      weatherPolicy: 'Classes run in light rain. Cancelled only in severe weather conditions.',
      tags: ['Sunrise', 'Lake', 'Beginner Friendly', 'Peaceful'],
      rating: 4.8,
      reviewCount: 124,
      lastUpdated: '2024-12-01'
    },
    {
      id: '2',
      name: 'Mountain Top Meditation',
      type: 'mountain',
      location: 'Uetliberg Summit, Zürich',
      coordinates: { lat: 47.3494, lng: 8.4906 },
      instructor: {
        name: 'Peter Schmidt',
        rating: 4.7,
        image: '/placeholder-instructor-2.jpg'
      },
      schedule: [
        { date: 'Today', time: '14:00', available: true, spots: 3 },
        { date: 'Saturday', time: '14:00', available: true, spots: 8 },
        { date: 'Sunday', time: '10:00', available: true, spots: 10 }
      ],
      duration: 90,
      level: 'All Levels',
      style: 'Meditation',
      price: 45,
      maxParticipants: 10,
      image: '/placeholder-outdoor-2.jpg',
      gallery: ['/placeholder-outdoor-2-1.jpg', '/placeholder-outdoor-2-2.jpg'],
      description: 'Experience deep meditation and gentle movement high above Zürich with panoramic views of the Alps and lake.',
      whatToBring: ['Warm layers (can be 5°C cooler)', 'Meditation cushion or mat', 'Water', 'Snack for after session'],
      meetingPoint: 'Uetliberg TV Tower base',
      surfaceType: 'Rocky terrain with platform',
      amenities: ['Restaurant nearby', 'Train access', 'Scenic viewpoint'],
      backupPlan: 'Covered pavilion available at summit',
      weatherPolicy: 'Weather dependent. Minimum 5 participants required.',
      tags: ['Mountain', 'Meditation', 'Views', 'Advanced'],
      rating: 4.9,
      reviewCount: 67,
      lastUpdated: '2024-12-01'
    },
    {
      id: '3',
      name: 'Park Flow Session',
      type: 'park',
      location: 'Lindenhof Park, Zürich',
      coordinates: { lat: 47.3707, lng: 8.5411 },
      instructor: {
        name: 'Marie Dupont',
        rating: 4.8,
        image: '/placeholder-instructor-3.jpg'
      },
      schedule: [
        { date: 'Today', time: '17:30', available: true, spots: 6 },
        { date: 'Tomorrow', time: '17:30', available: true, spots: 15 },
        { date: 'Thursday', time: '17:30', available: false, spots: 0 }
      ],
      duration: 75,
      level: 'Intermediate',
      style: 'Vinyasa',
      price: 20,
      maxParticipants: 20,
      image: '/placeholder-outdoor-3.jpg',
      gallery: ['/placeholder-outdoor-3-1.jpg', '/placeholder-outdoor-3-2.jpg'],
      description: 'Dynamic Vinyasa flow in the heart of Zürich\'s Old Town. Perfect for unwinding after work with city views.',
      whatToBring: ['Yoga mat', 'Water bottle', 'Light layers'],
      meetingPoint: 'Main entrance near Lindenhof stairs',
      surfaceType: 'Flat grass area',
      amenities: ['Historic location', 'City center', 'Tram access', 'Nearby cafes'],
      backupPlan: 'Covered area under trees available',
      weatherPolicy: 'Rain cancellation. Refund or credit offered.',
      tags: ['Park', 'City Center', 'After Work', 'Historic'],
      rating: 4.6,
      reviewCount: 89,
      lastUpdated: '2024-12-01'
    },
    {
      id: '4',
      name: 'Rooftop Sunset Yoga',
      type: 'rooftop',
      location: 'Frau Gerolds Garten, Zürich',
      coordinates: { lat: 47.3915, lng: 8.5262 },
      instructor: {
        name: 'Lisa Chen',
        rating: 4.9,
        image: '/placeholder-instructor-4.jpg'
      },
      schedule: [
        { date: 'Today', time: '19:00', available: true, spots: 4 },
        { date: 'Friday', time: '19:00', available: true, spots: 8 },
        { date: 'Saturday', time: '18:30', available: true, spots: 12 }
      ],
      duration: 60,
      level: 'All Levels',
      style: 'Yin',
      price: 35,
      maxParticipants: 12,
      image: '/placeholder-outdoor-4.jpg',
      gallery: ['/placeholder-outdoor-4-1.jpg', '/placeholder-outdoor-4-2.jpg'],
      description: 'Wind down with gentle Yin yoga on a beautiful rooftop terrace as the sun sets over Zürich.',
      whatToBring: ['Yoga mat', 'Blanket for relaxation', 'Eye pillow (optional)'],
      meetingPoint: 'Frau Gerolds Garten main entrance',
      surfaceType: 'Wooden deck',
      amenities: ['Bar/restaurant', 'Toilets', 'Urban garden setting'],
      backupPlan: 'Covered terrace area available',
      weatherPolicy: 'Sunset timing adjusted seasonally. Weather dependent.',
      tags: ['Rooftop', 'Sunset', 'Urban', 'Relaxing'],
      rating: 4.7,
      reviewCount: 156,
      lastUpdated: '2024-12-01'
    }
  ];

  // Weather data (mock)
  const weatherData = {
    current: {
      temperature: 18,
      condition: 'partly-cloudy',
      description: 'Partly Cloudy',
      windSpeed: 12,
      humidity: 65,
      uvIndex: 4
    },
    forecast: [
      { day: 'Today', high: 20, low: 15, condition: 'partly-cloudy', precipitation: 10 },
      { day: 'Tomorrow', high: 22, low: 16, condition: 'sunny', precipitation: 0 },
      { day: 'Thursday', high: 19, low: 14, condition: 'rainy', precipitation: 80 }
    ]
  };

  const categories = [
    { id: 'all', name: 'All Outdoor', icon: Sun, count: outdoorActivities.length },
    { id: 'lake', name: 'Lake Yoga', icon: Waves, count: outdoorActivities.filter(a => a.type === 'lake').length },
    { id: 'mountain', name: 'Mountain', icon: Mountain, count: outdoorActivities.filter(a => a.type === 'mountain').length },
    { id: 'park', name: 'Park Sessions', icon: TreePine, count: outdoorActivities.filter(a => a.type === 'park').length },
    { id: 'rooftop', name: 'Rooftops', icon: Sun, count: outdoorActivities.filter(a => a.type === 'rooftop').length }
  ];

  const filteredActivities = activeCategory === 'all' 
    ? outdoorActivities 
    : outdoorActivities.filter(a => a.type === activeCategory);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    if (date === 'Today' || date === 'Tomorrow') return date;
    return date;
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'partly-cloudy': return <Sun className="h-4 w-4 text-yellow-400" />;
      case 'rainy': return <CloudRain className="h-4 w-4 text-blue-500" />;
      default: return <Sun className="h-4 w-4" />;
    }
  };

  const OutdoorActivityCard = ({ activity }: { activity: any }) => (
    <Card className="group cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="relative h-64">
        <ImageWithFallback
          src={activity.image}
          alt={activity.name}
          className="w-full h-full object-cover"
        />
        
        {/* Overlays */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-green-100 text-green-700 capitalize">
            {React.createElement(categories.find(c => c.id === activity.type)?.icon || Sun, { className: "h-3 w-3 mr-1" })}
            {activity.type}
          </Badge>
        </div>
        
        <div className="absolute top-3 right-3 flex gap-2">
          {activity.originalPrice && activity.originalPrice > activity.price && (
            <Badge className="bg-red-100 text-red-700">
              Sale
            </Badge>
          )}
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
            <h3 className="font-semibold text-sm mb-1">{activity.name}</h3>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{activity.location.split(',')[0]}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{activity.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">with</span>
              <span className="font-medium text-sm">{activity.instructor.name}</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs">{activity.instructor.rating}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {activity.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{activity.duration} minutes</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Max {activity.maxParticipants}</span>
            </div>
          </div>
          <div className="space-y-1">
            <Badge variant="outline" className="text-xs">{activity.level}</Badge>
            <div className="text-xs text-muted-foreground">{activity.style}</div>
          </div>
        </div>

        {/* Next Sessions */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Next sessions:</p>
          <div className="space-y-1">
            {activity.schedule.slice(0, 2).map((session: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>{formatDate(session.date)} {session.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {session.spots} spots
                  </span>
                  <span className={`h-2 w-2 rounded-full ${
                    session.available ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Surface:</span>
            <span>{activity.surfaceType}</span>
          </div>
          
          {activity.backupPlan && (
            <div className="flex items-start gap-2 text-xs">
              <Umbrella className="h-3 w-3 text-muted-foreground mt-0.5" />
              <span className="text-muted-foreground">Backup: {activity.backupPlan}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{formatPrice(activity.price)}</span>
              {activity.originalPrice && activity.originalPrice > activity.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(activity.originalPrice)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {activity.reviewCount} reviews
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Navigation className="h-4 w-4" />
            </Button>
            <Button size="sm">
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section className="space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">
            Outdoor Yoga in {currentLocation?.name}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Connect with nature through yoga in {currentLocation?.name}'s most beautiful outdoor spaces. 
            From lakeside sunrise sessions to mountain meditation retreats.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search outdoor sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Weather Alert */}
      {weatherWarning && (
        <Alert className="max-w-4xl mx-auto">
          <Info className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getWeatherIcon(weatherData.current.condition)}
                <span>{weatherData.current.temperature}°C, {weatherData.current.description}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Wind className="h-3 w-3" />
                <span>{weatherData.current.windSpeed} km/h</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setWeatherWarning(false)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Category Tabs */}
      <section className="space-y-4">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-5">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <category.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
                <Badge variant="secondary" className="ml-1">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </section>

      {/* Weather Forecast */}
      <section className="bg-muted/30 rounded-2xl p-6">
        <div className="space-y-4">
          <h3 className="font-semibold">3-Day Weather Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weatherData.forecast.map((day) => (
              <Card key={day.day} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{day.day}</p>
                    <div className="flex items-center gap-2">
                      {getWeatherIcon(day.condition)}
                      <span className="text-sm text-muted-foreground capitalize">
                        {day.condition.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{day.high}°/{day.low}°</p>
                    <p className="text-xs text-muted-foreground">
                      {day.precipitation}% rain
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Outdoor Activities Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {activeCategory === 'all' ? 'All Outdoor Sessions' : 
             categories.find(c => c.id === activeCategory)?.name} 
            ({filteredActivities.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <OutdoorActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </section>

      {/* Safety Guidelines */}
      <section className="bg-muted/30 rounded-2xl p-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Outdoor Yoga Safety Guidelines</h2>
            <p className="text-muted-foreground">
              Enjoy safe and comfortable outdoor practice with these helpful tips
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-4">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Thermometer className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Weather Preparedness</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Check weather 30 min before class</li>
                  <li>• Bring layers for temperature changes</li>
                  <li>• Sun protection (hat, sunscreen)</li>
                  <li>• Waterproof mat bag for damp conditions</li>
                </ul>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">What to Bring</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Non-slip yoga mat</li>
                  <li>• Water bottle (extra for hot days)</li>
                  <li>• Towel for sweat or ground covering</li>
                  <li>• Insect repellent (parks/lakes)</li>
                </ul>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold">Cancellation Policy</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Classes cancelled in severe weather</li>
                  <li>• 2-hour notice for weather cancellations</li>
                  <li>• Full refund or credit for cancellations</li>
                  <li>• Backup indoor locations available</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Outdoor Yoga Categories */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Explore Outdoor Yoga Categories</h2>
          <p className="text-muted-foreground">
            Find the perfect outdoor yoga experience that matches your style and adventure level
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sunrise Yoga */}
          <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-border hover:border-accent">
            <div className="bg-muted/30 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sun className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sunrise Yoga</h3>
                    <p className="text-sm text-muted-foreground">Early morning sessions</p>
                  </div>
                </div>
                <p className="text-sm">
                  Start your day with energizing practice as the sun rises. Perfect for setting positive intentions and connecting with natural rhythms.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>6:00 - 7:30 AM</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>All levels welcome</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Lakes, Parks, Mountains</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">Energizing</Badge>
                  <Badge variant="secondary" className="text-xs">Peaceful</Badge>
                  <Badge variant="secondary" className="text-xs">Mindful</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Sunset Yoga */}
          <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-border hover:border-accent">
            <div className="bg-muted/30 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sun className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sunset Yoga</h3>
                    <p className="text-sm text-muted-foreground">Evening wind-down</p>
                  </div>
                </div>
                <p className="text-sm">
                  Unwind with gentle flows and restorative poses as the day transitions to night. Perfect for releasing stress and finding inner peace.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>6:30 - 8:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Beginner friendly</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Rooftops, Beaches, Hills</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">Relaxing</Badge>
                  <Badge variant="secondary" className="text-xs">Romantic</Badge>
                  <Badge variant="secondary" className="text-xs">Restorative</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Alpine Yoga */}
          <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-border hover:border-accent">
            <div className="bg-muted/30 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mountain className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Alpine Yoga</h3>
                    <p className="text-sm text-muted-foreground">Mountain meditation</p>
                  </div>
                </div>
                <p className="text-sm">
                  Practice among the Swiss Alps with breathtaking panoramic views. Challenge yourself with elevated poses while breathing fresh mountain air.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Various times</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Intermediate+</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Mountains, Peaks, Trails</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">Adventure</Badge>
                  <Badge variant="secondary" className="text-xs">Spiritual</Badge>
                  <Badge variant="secondary" className="text-xs">Challenging</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Lakeside Yoga */}
          <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-border hover:border-accent">
            <div className="bg-muted/30 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Waves className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Lakeside Yoga</h3>
                    <p className="text-sm text-muted-foreground">Waterfront serenity</p>
                  </div>
                </div>
                <p className="text-sm">
                  Flow with gentle movements beside Switzerland's pristine lakes. The sound of water creates a natural soundtrack for mindful practice.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Morning & Evening</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>All levels</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Lake shores, Beaches</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">Tranquil</Badge>
                  <Badge variant="secondary" className="text-xs">Flowing</Badge>
                  <Badge variant="secondary" className="text-xs">Healing</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Forest Yoga */}
          <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-border hover:border-accent">
            <div className="bg-muted/30 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TreePine className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Forest Yoga</h3>
                    <p className="text-sm text-muted-foreground">Nature immersion</p>
                  </div>
                </div>
                <p className="text-sm">
                  Practice forest bathing (Shinrin-yoku) combined with yoga among ancient trees. Connect deeply with nature's healing energy.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Mid-morning</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Beginner+</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Forest paths, Clearings</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">Grounding</Badge>
                  <Badge variant="secondary" className="text-xs">Meditative</Badge>
                  <Badge variant="secondary" className="text-xs">Natural</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Urban Rooftop */}
          <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-border hover:border-accent">
            <div className="bg-muted/30 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sun className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Urban Rooftop</h3>
                    <p className="text-sm text-muted-foreground">City skyline views</p>
                  </div>
                </div>
                <p className="text-sm">
                  Elevate your practice above the city hustle. Modern outdoor yoga with urban energy and spectacular skyline panoramas.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>After work hours</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>All levels</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Rooftops, Terraces</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">Urban</Badge>
                  <Badge variant="secondary" className="text-xs">Dynamic</Badge>
                  <Badge variant="secondary" className="text-xs">Social</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-4 pt-8">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Ready to Take Your Practice Outdoors?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the transformative power of practicing yoga in nature. Each category offers unique benefits for body, mind, and spirit.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => onPageChange('explore')}>
              Explore All Outdoor Classes
            </Button>
            <Button variant="outline" size="lg" onClick={() => onPageChange('instructors')}>
              Find Outdoor Instructors
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}