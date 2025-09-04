// This file has been removed. Please use LuxuryHomePage.tsx instead.

export function HomePage({ onPageChange }: { onPageChange: (page: string) => void }) {
  const { 
    currentLocation, 
    searchQuery, 
    setSearchQuery,
    isAuthenticated,
    customerProfile
  } = usePortal();
  // Format currency in CHF
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };
  const [featuredSection, setFeaturedSection] = useState('today');
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  // Hero images carousel - Modern Swiss yoga experiences
  const heroImages = [
    "https://images.unsplash.com/photo-1602827114685-efbb2717da9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwc3R1ZGlvJTIwbWVkaXRhdGlvbiUyMG1vZGVybiUyMGludGVyaW9yfGVufDF8fHx8MTc1Njc5MzI5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1606237184375-c30ab1c89575?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2lzcyUyMG1vdW50YWlucyUyMHlvZ2ElMjBzdW5yaXNlJTIwbWVkaXRhdGlvbnxlbnwxfHx8fDE3NTY3OTMzMDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1529693662653-9d480530a697?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwaW5zdHJ1Y3RvciUyMHRlYWNoaW5nJTIwY2xhc3MlMjBwZWFjZWZ1bHxlbnwxfHx8fDE3NTY3OTMzMDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1570050785774-7288f3039ba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIweW9nYSUyMG5hdHVyZSUyMGxha2UlMjBzd2l0emVybGFuZHxlbnwxfHx8fDE3NTY3OTMzMDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  ];

  // Auto-rotate hero images with smooth transition
  React.useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000); // Slightly longer interval for better UX
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Mock data for demonstration
  const todayClasses = [
    {
      id: '1',
      name: 'Vinyasa Flow',
      instructor: 'Sarah Miller',
      studio: 'Flow Studio Zürich',
      time: '18:30',
      duration: 75,
      level: 'All Levels',
      price: 32,
      spotsLeft: 5,
      image: '/placeholder-yoga-1.jpg'
    },
    {
      id: '2',
      name: 'Yin Yoga & Meditation',
      instructor: 'Marc Dubois',
      studio: 'Zen Space Geneva',
      time: '19:00',
      duration: 90,
      level: 'Beginner',
      price: 28,
      spotsLeft: 12,
      image: '/placeholder-yoga-2.jpg'
    },
    {
      id: '3',
      name: 'Hot Yoga Power',
      instructor: 'Lisa Chen',
      studio: 'Heat Yoga Basel',
      time: '19:30',
      duration: 60,
      level: 'Intermediate',
      price: 35,
      spotsLeft: 3,
      image: '/placeholder-yoga-3.jpg'
    }
  ];

  const popularCategories = [
    { name: 'Vinyasa', count: 45, icon: '🌊', color: 'bg-blue-100 text-blue-700' },
    { name: 'Yin Yoga', count: 32, icon: '🌙', color: 'bg-purple-100 text-purple-700' },
    { name: 'Hot Yoga', count: 28, icon: '🔥', color: 'bg-red-100 text-red-700' },
    { name: 'Prenatal', count: 15, icon: '🤱', color: 'bg-pink-100 text-pink-700' },
    { name: 'Meditation', count: 22, icon: '🧘', color: 'bg-green-100 text-green-700' },
    { name: 'Aerial Yoga', count: 18, icon: '🎪', color: 'bg-orange-100 text-orange-700' }
  ];

  const outdoorActivities = [
    {
      id: '1',
      name: 'Sunrise Yoga at Lake Zürich',
      location: 'Mythenquai, Zürich',
      type: 'lake',
      time: '06:30',
      instructor: 'Anna Müller',
      participants: 15,
      price: 25,
      image: '/placeholder-outdoor-1.jpg',
      icon: Waves
    },
    {
      id: '2',
      name: 'Mountain Meditation Retreat',
      location: 'Uetliberg, Zürich',
      type: 'mountain',
      time: '14:00',
      instructor: 'Peter Schmidt',
      participants: 8,
      price: 45,
      image: '/placeholder-outdoor-2.jpg',
      icon: Mountain
    },
    {
      id: '3',
      name: 'Park Flow Session',
      location: 'Parc des Bastions, Geneva',
      type: 'park',
      time: '17:30',
      instructor: 'Marie Dupont',
      participants: 20,
      price: 20,
      image: '/placeholder-outdoor-3.jpg',
      icon: TreePine
    }
  ];

  const getTimeOfDayIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 10) return <Sun className="h-4 w-4 text-yellow-500" />;
    if (hour < 18) return <Sun className="h-4 w-4 text-orange-500" />;
    return <Moon className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-background border-b">
        <div className="container mx-auto px-6 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              {isAuthenticated && customerProfile ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h1>
                      Welcome back,<br />
                      <span className="text-primary">
                        {customerProfile.firstName}
                      </span>
                    </h1>
                    <p className="text-muted-foreground max-w-lg">
                      You have <span className="font-medium text-primary">{customerProfile.upcomingBookings} upcoming classes</span> and <span className="font-medium text-primary">{customerProfile.creditsBalance} credits remaining</span>
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      onClick={() => onPageChange('account')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      My Bookings
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => onPageChange('explore')}
                    >
                      Book Another Class
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h1>
                      Find Your Perfect<br />
                      <span className="text-primary">
                        Yoga Experience
                      </span>
                    </h1>
                    <p className="text-muted-foreground max-w-lg">
                      Discover Switzerland's most beautiful studios, inspiring instructors, and transformative classes in {currentLocation?.name}
                    </p>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="space-y-4">
                    <div className="relative max-w-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        placeholder="Try 'Yin Yoga Geneva Friday evening'"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-20"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && searchQuery.trim()) {
                            onPageChange('explore');
                          }
                        }}
                      />
                      {searchQuery && (
                        <Button
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => onPageChange('explore')}
                        >
                          Search
                        </Button>
                      )}
                    </div>
                    
                    {/* Quick Action Pills */}
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onPageChange('schedule')}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Browse Classes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onPageChange('online')}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Online Studio
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onPageChange('outdoor')}
                      >
                        <Mountain className="h-4 w-4 mr-2" />
                        Outdoor Classes
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Image */}
            <div className="relative">
              <div className="relative h-[400px] lg:h-[500px] w-full rounded-2xl overflow-hidden">
                {heroImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === heroImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`Yoga experience ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                
                {/* Stats Cards */}
                <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur rounded-xl p-3 border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Members</p>
                      <p className="font-semibold">12.4k+</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 right-4 bg-card/90 backdrop-blur rounded-xl p-3 border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Studios</p>
                      <p className="font-semibold">150+</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Navigation Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setHeroImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === heroImageIndex 
                        ? 'bg-primary w-6' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Today Near You */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Today Near You</h2>
            <p className="text-muted-foreground">Classes happening in {currentLocation?.name} today</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={featuredSection === 'today' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFeaturedSection('today')}
            >
              Today
            </Button>
            <Button 
              variant={featuredSection === 'evening' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFeaturedSection('evening')}
            >
              This Evening
            </Button>
            <Button 
              variant={featuredSection === 'tomorrow' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFeaturedSection('tomorrow')}
            >
              Tomorrow
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {todayClasses.map((class_) => (
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
                    {getTimeOfDayIcon(class_.time)}
                    <span className="ml-1">{class_.time}</span>
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {class_.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    with {class_.instructor} • {class_.studio}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{class_.duration}min</span>
                  </div>
                  <Badge variant="secondary">{class_.level}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">{formatCurrency(class_.price)}</p>
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

        <div className="text-center">
          <Button variant="outline" onClick={() => onPageChange('explore')}>
            See All Classes Today
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Popular Yoga Styles</h2>
          <p className="text-muted-foreground">Explore different yoga practices and find your perfect fit</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularCategories.map((category) => (
            <Card key={category.name} className="group cursor-pointer hover:shadow-md transition-all duration-200">
              <CardContent className="p-6 text-center space-y-3">
                <div className="text-3xl">{category.icon}</div>
                <div className="space-y-1">
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count} classes
                  </p>
                </div>
                <Badge className={category.color} variant="secondary">
                  Popular
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Outdoor Yoga Categories */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Outdoor Yoga Adventures</h2>
          <p className="text-muted-foreground">Discover unique outdoor yoga experiences across Switzerland</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sunrise Yoga */}
          <Card 
            className="group cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => onPageChange('outdoor?category=sunrise')}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                    <Sun className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sunrise Yoga</h3>
                    <p className="text-sm text-muted-foreground">Early morning energy</p>
                  </div>
                </div>
                <p className="text-sm">
                  Start your day with peaceful practice as the sun rises over Swiss landscapes. Perfect for morning meditation and gentle flows.
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">6:00-7:30 AM</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Lakes • Parks • Mountains
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sunset Yoga */}
          <Card 
            className="group cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => onPageChange('outdoor?category=sunset')}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                    <Sun className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sunset Yoga</h3>
                    <p className="text-sm text-muted-foreground">Evening wind-down</p>
                  </div>
                </div>
                <p className="text-sm">
                  Unwind with gentle flows and restorative poses as day transitions to night. Perfect for releasing stress and finding peace.
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">6:30-8:00 PM</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Rooftops • Beaches • Hills
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alpine Yoga */}
          <Card 
            className="group cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => onPageChange('outdoor?category=mountain')}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                    <Mountain className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Alpine Yoga</h3>
                    <p className="text-sm text-muted-foreground">Mountain meditation</p>
                  </div>
                </div>
                <p className="text-sm">
                  Practice among the Swiss Alps with breathtaking views. Challenge yourself with elevated poses while breathing fresh mountain air.
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">Intermediate+</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Mountains • Peaks • Trails
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lakeside Yoga */}
          <Card 
            className="group cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => onPageChange('outdoor?category=lake')}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                    <Waves className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Lakeside Yoga</h3>
                    <p className="text-sm text-muted-foreground">Waterfront serenity</p>
                  </div>
                </div>
                <p className="text-sm">
                  Flow with gentle movements beside Switzerland's pristine lakes. The sound of water creates natural soundtrack for practice.
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">All levels</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Lake shores • Beaches
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forest Yoga */}
          <Card 
            className="group cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => onPageChange('outdoor?category=park')}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                    <TreePine className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Forest Yoga</h3>
                    <p className="text-sm text-muted-foreground">Nature immersion</p>
                  </div>
                </div>
                <p className="text-sm">
                  Practice forest bathing combined with yoga among ancient trees. Connect deeply with nature's healing energy and find grounding.
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">Beginner+</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Forest paths • Clearings
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Urban Rooftop */}
          <Card 
            className="group cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => onPageChange('outdoor?category=rooftop')}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                    <Sun className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Urban Rooftop</h3>
                    <p className="text-sm text-muted-foreground">City skyline views</p>
                  </div>
                </div>
                <p className="text-sm">
                  Elevate your practice above the city hustle. Modern outdoor yoga with urban energy and spectacular skyline panoramas.
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">After work</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Rooftops • Terraces
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-4 pt-4">
          <p className="text-muted-foreground">
            Ready to take your practice outdoors?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => onPageChange('outdoor')}
            >
              Explore All Outdoor Classes
              <ArrowRight className="h-4 w-4 ml-2" />
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