// This file has been removed. Please use LuxuryExplorePage.tsx instead.

export function ExplorePage({ onPageChange }: { onPageChange: (page: string) => void }) {
  const { 
    currentLocation, 
    searchQuery, 
    setSearchQuery,
    searchFilters,
    setSearchFilters,
    addToCart,
    searchClasses,
    getStudios,
    getInstructors,
    getWeatherData
  } = usePortal();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [savedClasses, setSavedClasses] = useState<string[]>([]);

  // Mock data for classes
  const allClasses: ClassData[] = [
    {
      id: '1',
      name: 'Vinyasa Flow',
      instructor: {
        id: 'instructor-1',
        name: 'Sarah Miller',
        rating: 4.9,
        avatar: '/placeholder-instructor-1.jpg'
      },
      studio: {
        name: 'Flow Studio Zürich',
        location: 'Bahnhofstrasse 45, Zürich',
        distance: 0.8
      },
      schedule: {
        date: new Date(2024, 11, 15),
        time: '18:30',
        duration: 75
      },
      pricing: {
        price: 32,
        originalPrice: 40,
        currency: 'CHF'
      },
      capacity: {
        total: 20,
        booked: 15
      },
      details: {
        level: 'All Levels',
        style: 'Vinyasa',
        language: 'English',
        isOutdoor: false,
        isHotRoom: false
      },
      image: '/placeholder-yoga-1.jpg',
      tags: ['Strength', 'Flow', 'Beginner Friendly']
    },
    {
      id: '2',
      name: 'Yin Yoga & Meditation',
      instructor: {
        id: 'instructor-2',
        name: 'Marc Dubois',
        rating: 4.8,
        avatar: '/placeholder-instructor-2.jpg'
      },
      studio: {
        name: 'Zen Space Geneva',
        location: 'Rue du Rhône 12, Geneva',
        distance: 1.2
      },
      schedule: {
        date: new Date(2024, 11, 15),
        time: '19:00',
        duration: 90
      },
      pricing: {
        price: 28,
        currency: 'CHF'
      },
      capacity: {
        total: 15,
        booked: 3
      },
      details: {
        level: 'Beginner',
        style: 'Yin',
        language: 'French',
        isOutdoor: false,
        isHotRoom: false
      },
      image: '/placeholder-yoga-2.jpg',
      tags: ['Relaxation', 'Meditation', 'Stress Relief']
    },
    {
      id: '3',
      name: 'Sunrise Yoga at Lake',
      instructor: {
        id: 'instructor-3',
        name: 'Anna Müller',
        rating: 4.9,
        avatar: '/placeholder-instructor-3.jpg'
      },
      studio: {
        name: 'Outdoor Collective',
        location: 'Mythenquai, Zürich',
        distance: 2.1
      },
      schedule: {
        date: new Date(2024, 11, 16),
        time: '06:30',
        duration: 60
      },
      pricing: {
        price: 25,
        currency: 'CHF'
      },
      capacity: {
        total: 15,
        booked: 7
      },
      details: {
        level: 'All Levels',
        style: 'Hatha',
        language: 'German',
        isOutdoor: true,
        isHotRoom: false
      },
      image: '/placeholder-outdoor-1.jpg',
      tags: ['Sunrise', 'Nature', 'Mindfulness']
    },
    {
      id: '4',
      name: 'Hot Power Yoga',
      instructor: {
        id: 'instructor-4',
        name: 'Lisa Chen',
        rating: 4.7,
        avatar: '/placeholder-instructor-4.jpg'
      },
      studio: {
        name: 'Heat Yoga Basel',
        location: 'Steinenvorstadt 28, Basel',
        distance: 0.5
      },
      schedule: {
        date: new Date(2024, 11, 15),
        time: '19:30',
        duration: 60
      },
      pricing: {
        price: 35,
        currency: 'CHF'
      },
      capacity: {
        total: 25,
        booked: 22
      },
      details: {
        level: 'Intermediate',
        style: 'Power',
        language: 'English',
        isOutdoor: false,
        isHotRoom: true
      },
      image: '/placeholder-yoga-3.jpg',
      tags: ['Strength', 'Cardio', 'Heated']
    },
    {
      id: '5',
      name: 'Prenatal Gentle Flow',
      instructor: {
        id: 'instructor-5',
        name: 'Sophie Laurent',
        rating: 4.8,
        avatar: '/placeholder-instructor-5.jpg'
      },
      studio: {
        name: 'Mother & Baby Yoga',
        location: 'Place de la Navigation 4, Lausanne',
        distance: 1.5
      },
      schedule: {
        date: new Date(2024, 11, 16),
        time: '10:00',
        duration: 60
      },
      pricing: {
        price: 30,
        currency: 'CHF'
      },
      capacity: {
        total: 12,
        booked: 5
      },
      details: {
        level: 'Prenatal',
        style: 'Prenatal',
        language: 'French',
        isOutdoor: false,
        isHotRoom: false
      },
      image: '/placeholder-yoga-4.jpg',
      tags: ['Pregnancy', 'Gentle', 'Support']
    }
  ];

  const [filteredClasses, setFilteredClasses] = useState(allClasses);
  const [realTimeClasses, setRealTimeClasses] = useState<any[]>([]);
  const [realTimeStudios, setRealTimeStudios] = useState<any[]>([]);
  const [realTimeInstructors, setRealTimeInstructors] = useState<any[]>([]);
  const [isLoadingRealTime, setIsLoadingRealTime] = useState(false);

  // Load real-time data from backend
  useEffect(() => {
    const loadRealTimeData = async () => {
      if (!currentLocation) return;
      
      setIsLoadingRealTime(true);
      try {
        // Fetch real classes from backend
        const classes = await searchClasses({
          location: currentLocation.name,
          date: new Date().toISOString().split('T')[0]
        });
        setRealTimeClasses(classes);

        // Fetch studios
        const studios = await getStudios(currentLocation.name);
        setRealTimeStudios(studios);

        // Fetch instructors
        const instructors = await getInstructors(currentLocation.name);
        setRealTimeInstructors(instructors);

        // Get weather data for outdoor recommendations
        await getWeatherData(currentLocation.lat, currentLocation.lng);

      } catch (error) {
        console.log('Error loading real-time data:', error);
      } finally {
        setIsLoadingRealTime(false);
      }
    };

    loadRealTimeData();
  }, [currentLocation, searchClasses, getStudios, getInstructors, getWeatherData]);

  // Apply filters
  useEffect(() => {
    // Use real-time data if available, otherwise fall back to mock data
    let filtered = realTimeClasses.length > 0 ? realTimeClasses : allClasses;

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(classItem => 
        classItem.name.toLowerCase().includes(query) ||
        classItem.instructor.name.toLowerCase().includes(query) ||
        classItem.studio.name.toLowerCase().includes(query) ||
        classItem.details.style.toLowerCase().includes(query) ||
        classItem.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Style filter
    if (searchFilters.styles && searchFilters.styles.length > 0) {
      filtered = filtered.filter(classItem => 
        searchFilters.styles.includes(classItem.details.style)
      );
    }

    // Level filter
    if (searchFilters.levels && searchFilters.levels.length > 0) {
      filtered = filtered.filter(classItem => 
        searchFilters.levels.includes(classItem.details.level)
      );
    }

    // Language filter
    if (searchFilters.languages && searchFilters.languages.length > 0) {
      filtered = filtered.filter(classItem => 
        searchFilters.languages.includes(classItem.details.language || 'English')
      );
    }

    // Indoor/Outdoor filter
    if (searchFilters.indoor !== undefined || searchFilters.outdoor !== undefined) {
      filtered = filtered.filter(classItem => {
        if (searchFilters.indoor && !searchFilters.outdoor) return !classItem.details.isOutdoor;
        if (searchFilters.outdoor && !searchFilters.indoor) return classItem.details.isOutdoor;
        return true;
      });
    }

    // Price range filter
    if (searchFilters.priceRange) {
      filtered = filtered.filter(classItem => 
        classItem.pricing.price >= searchFilters.priceRange.min && 
        classItem.pricing.price <= searchFilters.priceRange.max
      );
    }

    setFilteredClasses(filtered);
  }, [searchQuery, searchFilters, realTimeClasses]);

  const handleBookClass = (classData: ClassData) => {
    addToCart({
      id: classData.id,
      type: 'class',
      name: classData.name,
      date: classData.schedule.date,
      time: classData.schedule.time,
      price: classData.pricing.price,
      quantity: 1,
      instructorName: classData.instructor.name,
      studioName: classData.studio.name,
      location: classData.studio.location
    });
  };

  const handleViewClassDetails = (classId: string) => {
    onPageChange(`class-detail-${classId}`);
  };

  const handleSaveClass = (classId: string) => {
    setSavedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Explore Classes in {currentLocation?.name}
            </h1>
            <p className="text-muted-foreground">
              {filteredClasses.length} classes found
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden md:flex border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="h-8 w-8 p-0"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Sort
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy('relevance')}>
                  Relevance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('date')}>
                  Date & Time
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('price_low')}>
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('price_high')}>
                  Price: High to Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('distance')}>
                  Distance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('rating')}>
                  Rating
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes, instructors, studios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((classItem) => (
              <ClassCard 
                key={classItem.id} 
                classData={classItem}
                variant="default"
                onBook={handleBookClass}
                onViewDetails={handleViewClassDetails}
                onFavorite={(classId, favorited) => handleSaveClass(classId)}
              />
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredClasses.map((classItem) => (
              <ClassCard 
                key={classItem.id} 
                classData={classItem}
                variant="compact"
                onBook={handleBookClass}
                onViewDetails={handleViewClassDetails}
                onFavorite={(classId, favorited) => handleSaveClass(classId)}
              />
            ))}
          </div>
        )}

        {viewMode === 'map' && (
          <div className="space-y-4">
            {/* Weather Widget for Outdoor Classes */}
            <WeatherWidget 
              location={currentLocation?.name || "Zürich"} 
              showRecommendations={true}
              compact={false}
            />
            
            {/* Interactive Map */}
            <InteractiveMap
              locations={filteredClasses.map(classItem => ({
                id: classItem.id,
                name: classItem.studio.name,
                type: classItem.details.isOutdoor ? 'outdoor' : 'studio',
                lat: 47.3769 + (Math.random() - 0.5) * 0.1, // Mock coordinates
                lng: 8.5417 + (Math.random() - 0.5) * 0.1,
                address: classItem.studio.location,
                rating: classItem.instructor.rating,
                nextClass: `${classItem.schedule.time} - ${classItem.name}`,
                priceRange: classItem.pricing.price.toString(),
                specialties: classItem.tags || []
              }))}
              onLocationSelect={(location) => {
                console.log('Selected location:', location);
              }}
              onGetDirections={(location) => {
                console.log('Get directions to:', location);
              }}
            />
            
            {/* Featured Classes below map */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClasses.slice(0, 4).map((classItem) => (
                <ClassCard 
                  key={classItem.id} 
                  classData={classItem}
                  variant="compact"
                  onBook={handleBookClass}
                  onViewDetails={handleViewClassDetails}
                  onFavorite={(classId, favorited) => handleSaveClass(classId)}
                />
              ))}
            </div>
          </div>
        )}

        {filteredClasses.length === 0 && (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <Search className="h-12 w-12 mx-auto text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="font-semibold">No classes found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters to find more classes.
                </p>
              </div>
              <Button onClick={() => {
                setSearchQuery('');
                setSearchFilters({});
              }}>
                Clear Search & Filters
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}