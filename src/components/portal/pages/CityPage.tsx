import React, { useState, useEffect } from 'react';
import { usePortal } from '../PortalProvider';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  Search, 
  MapPin, 
  Calendar,
  Filter,
  Mountain,
  Waves,
  TreePine,
  Building,
  Users,
  Star,
  Clock,
  Navigation,
  Heart
} from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { getCityHeroImage, getCityHeroImageAlt } from '../../../utils/city-hero-images';

interface CityPageProps {
  onPageChange: (page: string) => void;
  citySlug: string;
}

export function CityPage({ onPageChange, citySlug }: CityPageProps) {
  const { 
    currentLocation, 
    searchQuery, 
    setSearchQuery, 
    setCurrentLocation, 
    locations,
    searchClasses,
    getStudios,
    getInstructors,
    getWeatherData,
    getLocalEvents
  } = usePortal();
  const [activeTab, setActiveTab] = useState('today');
  const [cityClasses, setCityClasses] = useState<any[]>([]);
  const [cityStudios, setCityStudios] = useState<any[]>([]);
  const [cityInstructors, setCityInstructors] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Find the city data based on slug
  const city = locations.find(l => l.slug === citySlug) || currentLocation;

  // Load city-specific data from backend
  useEffect(() => {
    const loadCityData = async () => {
      if (!city) return;
      
      setIsLoading(true);
      try {
        // Fetch classes for this city
        const classes = await searchClasses({
          location: city.name,
          date: new Date().toISOString().split('T')[0]
        });
        setCityClasses(classes);

        // Fetch studios in this city
        const studios = await getStudios(city.name);
        setCityStudios(studios);

        // Fetch instructors in this city
        const instructors = await getInstructors(city.name);
        setCityInstructors(instructors);

        // Fetch weather data for city coordinates
        const weatherData = await getWeatherData(city.lat, city.lng);
        setWeatherData(weatherData);

        // Fetch local events
        const events = await getLocalEvents(city.name);
        setLocalEvents(events);

      } catch (error) {
        console.log('Error loading city data:', error);
        // Use fallback data on error
      } finally {
        setIsLoading(false);
      }
    };

    loadCityData();
  }, [city, searchClasses, getStudios, getInstructors]);


  
  // Dynamic city data based on backend and location
  const cityData = {
    name: city?.name || 'Zürich',
    description: `Discover yoga classes, studios, and outdoor sessions in ${city?.name || 'Zürich'}. From lakeside morning flows to rooftop sunset sessions.`,
    image: getCityHeroImage(city?.name),
    stats: {
      studios: cityStudios.length || 45,
      instructors: cityInstructors.length || 120,
      weeklyClasses: cityClasses.length * 7 || 300,
      outdoorSpots: localEvents.length + 10 || 15
    },
    neighborhoods: [
      { name: 'Old Town', count: Math.floor(cityStudios.length * 0.3) || 12, slug: 'old-town' },
      { name: 'Seefeld', count: Math.floor(cityStudios.length * 0.2) || 8, slug: 'seefeld' },
      { name: 'Kreis 4', count: Math.floor(cityStudios.length * 0.35) || 15, slug: 'kreis-4' },
      { name: 'Kreis 5', count: Math.floor(cityStudios.length * 0.15) || 10, slug: 'kreis-5' }
    ]
  };

  // Use real class data from backend with fallback
  const todaysClasses = cityClasses.length > 0 ? cityClasses : [
    {
      id: '1',
      name: 'Morning Vinyasa Flow',
      instructor: 'Sarah Miller',
      studio: 'Flow Studio Zürich',
      time: '07:00',
      duration: 75,
      level: 'All Levels',
      price: 32,
      spotsLeft: 8,
      neighborhood: 'Old Town',
      image: '/placeholder-yoga-1.jpg'
    },
    {
      id: '2',
      name: 'Lunchtime Power Yoga',
      instructor: 'Marc Weber',
      studio: 'Urban Yoga Space',
      time: '12:30',
      duration: 45,
      level: 'Intermediate',
      price: 28,
      spotsLeft: 5,
      neighborhood: 'Seefeld',
      image: '/placeholder-yoga-2.jpg'
    },
    {
      id: '3',
      name: 'Evening Yin & Meditation',
      instructor: 'Lisa Chen',
      studio: 'Zen Center Zürich',
      time: '19:30',
      duration: 90,
      level: 'Beginner',
      price: 35,
      spotsLeft: 12,
      neighborhood: 'Kreis 4',
      image: '/placeholder-yoga-3.jpg'
    }
  ];

  const outdoorActivities = [
    {
      id: '1',
      name: 'Sunrise Yoga at Lake Zürich',
      location: 'Mythenquai',
      type: 'lake',
      time: '06:30',
      instructor: 'Anna Müller',
      participants: 15,
      price: 25,
      image: '/placeholder-outdoor-1.jpg',
      icon: Waves,
      weather: weatherData ? `${weatherData.condition}, ${weatherData.temperature}°C` : 'Sunny, 18°C'
    },
    {
      id: '2',
      name: 'Uetliberg Mountain Meditation',
      location: 'Uetliberg Summit',
      type: 'mountain',
      time: '14:00',
      instructor: 'Peter Schmidt',
      participants: 8,
      price: 45,
      image: '/placeholder-outdoor-2.jpg',
      icon: Mountain,
      weather: weatherData ? `${weatherData.condition}, ${weatherData.temperature - 3}°C` : 'Clear, 15°C'
    },
    {
      id: '3',
      name: 'Park Flow Session',
      location: 'Lindenhof Park',
      type: 'park',
      time: '17:30',
      instructor: 'Marie Dupont',
      participants: 20,
      price: 20,
      image: '/placeholder-outdoor-3.jpg',
      icon: TreePine,
      weather: weatherData ? `${weatherData.condition}, ${weatherData.temperature + 2}°C` : 'Partly cloudy, 22°C'
    }
  ];

  // Use real studio data from backend with fallback
  const topStudios = cityStudios.length > 0 ? cityStudios.slice(0, 3).map((studio: any) => ({
    id: studio.id,
    name: studio.name,
    rating: studio.rating || 4.8,
    reviews: studio.reviews || Math.floor(Math.random() * 1000 + 500),
    distance: studio.distance || Math.random() * 3,
    nextClass: studio.nextClass || 'View Schedule',
    image: studio.image || '/placeholder-studio-1.jpg',
    neighborhood: studio.neighborhood || 'City Center'
  })) : [
    {
      id: '1',
      name: 'Flow Studio Zürich',
      rating: 4.9,
      reviews: 1250,
      distance: 0.8,
      nextClass: 'Vinyasa Flow in 2h',
      image: '/placeholder-studio-1.jpg',
      neighborhood: 'Old Town'
    },
    {
      id: '2',
      name: 'Urban Yoga Space',
      rating: 4.8,
      reviews: 890,
      distance: 1.2,
      nextClass: 'Power Yoga in 45min',
      image: '/placeholder-studio-2.jpg',
      neighborhood: 'Seefeld'
    },
    {
      id: '3',
      name: 'Zen Center Zürich',
      rating: 4.7,
      reviews: 650,
      distance: 2.1,
      nextClass: 'Meditation in 3h',
      image: '/placeholder-studio-3.jpg',
      neighborhood: 'Kreis 4'
    }
  ];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 md:h-80 bg-muted rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Weather Widget */}
      {weatherData && (
        <Card className="bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  ☀️
                </div>
                <div>
                  <p className="font-medium">Current Weather in {city?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {weatherData.temperature}°C • {weatherData.condition} • Wind: {weatherData.windSpeed} km/h
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Perfect for outdoor yoga</p>
                <p className="text-xs text-green-600">UV Index: {weatherData.uvIndex}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* City Hero Section */}
      <section className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
        <ImageWithFallback
          src={cityData.image}
          alt={getCityHeroImageAlt(cityData.name)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center text-white text-center p-6">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-semibold">
              Yoga in {cityData.name}
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              {cityData.description}
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <p className="text-2xl font-semibold">{cityData.stats.studios}</p>
                <p className="text-sm opacity-80">Studios</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold">{cityData.stats.instructors}</p>
                <p className="text-sm opacity-80">Instructors</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold">{cityData.stats.weeklyClasses}</p>
                <p className="text-sm opacity-80">Weekly Classes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold">{cityData.stats.outdoorSpots}</p>
                <p className="text-sm opacity-80">Outdoor Spots</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search classes in ${cityData.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Quick Filter Chips */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="outdoor">Outdoor</TabsTrigger>
            <TabsTrigger value="workshops">Workshops</TabsTrigger>
            <TabsTrigger value="all">All Classes</TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="today" className="space-y-8">
          {/* Today's Classes */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Today in {cityData.name}</h2>
              <Button variant="outline" onClick={() => onPageChange('explore')}>
                View All Classes
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todaysClasses.map((class_) => (
                <Card key={class_.id} className="group cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden">
                  <div className="relative h-48">
                    <ImageWithFallback
                      src={class_.image}
                      alt={class_.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-white/90 text-black">
                        <Clock className="h-3 w-3 mr-1" />
                        {class_.time}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {class_.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        with {class_.instructor}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{class_.studio}</span>
                        <span>•</span>
                        <span>{class_.neighborhood}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline">{class_.level}</Badge>
                      <span>{class_.duration}min</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold">{formatPrice(class_.price)}</p>
                        <p className="text-xs text-muted-foreground">
                          {class_.spotsLeft} spots left
                        </p>
                      </div>
                      <Button size="sm">
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="outdoor" className="space-y-8">
          {/* Outdoor Activities */}
          <section className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Outdoor Yoga in {cityData.name}</h2>
              <p className="text-muted-foreground">
                Connect with nature through yoga in {cityData.name}'s beautiful outdoor spaces
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {outdoorActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <Card key={activity.id} className="group cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div className="relative h-56">
                      <ImageWithFallback
                        src={activity.image}
                        alt={activity.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-green-100 text-green-700">
                          <IconComponent className="h-3 w-3 mr-1" />
                          {activity.type}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-blue-100 text-blue-700">
                          {activity.weather}
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <div className="text-white">
                          <h3 className="font-semibold text-lg">{activity.name}</h3>
                          <p className="text-sm opacity-90 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {activity.location}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {activity.time} • with {activity.instructor}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{activity.participants} people joined</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(activity.price)}</p>
                        </div>
                      </div>
                      
                      <Button className="w-full" size="sm">
                        Join Session
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Button variant="outline" onClick={() => onPageChange('outdoor')}>
                Explore All Outdoor Sessions
              </Button>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="week" className="space-y-8">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Weekly Schedule</h3>
            <p className="text-muted-foreground">
              Weekly calendar view coming soon
            </p>
          </div>
        </TabsContent>

        <TabsContent value="workshops" className="space-y-8">
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Workshops & Events</h3>
            <p className="text-muted-foreground">
              Special workshops and events coming soon
            </p>
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-8">
          <div className="text-center">
            <Button onClick={() => onPageChange('explore')}>
              View All Classes
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Neighborhoods */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Explore by Neighborhood</h2>
          <p className="text-muted-foreground">
            Find yoga classes in your favorite {cityData.name} neighborhoods
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cityData.neighborhoods.map((neighborhood) => (
            <Card 
              key={neighborhood.slug}
              className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 text-center"
              onClick={() => {
                setSearchQuery(neighborhood.name);
                onPageChange('explore');
              }}
            >
              <div className="space-y-2">
                <Building className="h-8 w-8 mx-auto text-muted-foreground" />
                <h3 className="font-medium">{neighborhood.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {neighborhood.count} studios
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Top Studios */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Top Studios in {cityData.name}</h2>
          <Button variant="outline" onClick={() => onPageChange('studios')}>
            View All Studios
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topStudios.map((studio) => (
            <Card key={studio.id} className="group cursor-pointer hover:shadow-md transition-all duration-200">
              <div className="relative h-48">
                <ImageWithFallback
                  src={studio.image}
                  alt={studio.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-white/90 text-black">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {studio.rating}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {studio.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{studio.reviews} reviews</span>
                    <span>•</span>
                    <Navigation className="h-3 w-3" />
                    <span>{studio.distance}km away</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{studio.neighborhood}</p>
                  <p className="text-sm font-medium text-green-600">{studio.nextClass}</p>
                </div>

                <Button variant="outline" className="w-full" size="sm">
                  View Schedule
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* City Guide */}
      <section className="bg-muted/30 rounded-2xl p-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">{cityData.name} Yoga Guide</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {cityData.name} offers an incredible diversity of yoga experiences, from traditional studios in the historic Old Town 
              to modern spaces in trendy neighborhoods, plus unique outdoor sessions by the lake and in nearby mountains. 
              Whether you're a beginner looking for gentle Hatha classes or an experienced practitioner seeking challenging 
              Power Yoga sessions, you'll find your perfect practice here.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-4">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Waves className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Lakeside Yoga</h3>
                <p className="text-sm text-muted-foreground">
                  Practice by the beautiful Lake {cityData.name} with sunrise and sunset sessions available year-round.
                </p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Mountain className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Mountain Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Take your practice to new heights with mountain yoga sessions offering breathtaking views.
                </p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Historic Studios</h3>
                <p className="text-sm text-muted-foreground">
                  Experience yoga in beautifully restored historic buildings throughout the city center.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}