import React, { useState } from 'react';
import { usePortal } from '../PortalProvider';
import { LuxuryButton } from '../../ui/luxury-button';
import { LuxuryCard, LuxuryCardContent } from '../../ui/luxury-card';
import { LuxuryBadge, ClassTypeBadge, LevelBadge, SwissBadge } from '../../ui/luxury-badge';
import { LuxuryClassCard } from '../../ui/luxury-class-card';
import { Input } from '../../ui/input';
import { 
  Search, 
  SlidersHorizontal,
  MapPin, 
  Calendar,
  Clock,
  Star,
  Filter,
  Grid3X3,
  List,
  Map,
  X,
  ChevronDown
} from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Checkbox } from "../../ui/checkbox";

export function LuxuryExplorePage({ onPageChange }: { onPageChange: (page: string) => void }) {
  const { 
    currentLocation, 
    searchQuery, 
    setSearchQuery 
  } = usePortal();

  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [selectedFilters, setSelectedFilters] = useState({
    styles: [] as string[],
    levels: [] as string[],
    times: [] as string[],
    locations: [] as string[],
    features: [] as string[],
    priceRange: [0, 100] as [number, number]
  });
  const [sortBy, setSortBy] = useState('relevance');

  // Signature classes data
  const allClasses = [
    {
      id: '1',
      title: 'Vinyasa Flow Masterclass',
      instructor: 'Sarah Zimmermann',
      type: 'Vinyasa',
      level: 'Intermediate',
      duration: 75,
      time: '18:30',
      date: 'Today',
      location: 'Flow Studio Zürich',
      price: 45,
      spotsLeft: 3,
      isOutdoor: false,
      isSignature: true,
      isSwiss: true,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1588286840104-8957b019727f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwY2xhc3MlMjBzdHVkaW8lMjBpbnN0cnVjdG9yfGVufDF8fHx8MTc1Njc5MzMxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: '2',
      title: 'Sunrise Alpine Meditation',
      instructor: 'Marc Dubois',
      type: 'Meditation',
      level: 'All Levels',
      duration: 90,
      time: '06:30',
      date: 'Tomorrow',
      location: 'Uetliberg Peak',
      price: 65,
      spotsLeft: 8,
      isOutdoor: true,
      isSignature: true,
      isSwiss: true,
      rating: 5.0,
      image: "https://images.unsplash.com/photo-1570050785774-7288f3039ba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIweW9nYSUyMG5hdHVyZSUyMGxha2UlMjBzd2l0emVybGFuZHxlbnwxfHx8fDE3NTY3OTMzMDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: '3',
      title: 'Yin & Sound Therapy',
      instructor: 'Elena Rossi',
      type: 'Yin',
      level: 'Beginner',
      duration: 60,
      time: '19:30',
      date: 'Today',
      location: 'Zen Studio Geneva',
      price: 38,
      spotsLeft: 12,
      isOutdoor: false,
      isSignature: false,
      isSwiss: true,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5aW4lMjB5b2dhJTIwbWVkaXRhdGlvbiUyMGNhbmRsZXN8ZW58MXx8fHwxNzU2NzkzMzE0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: '4',
      title: 'Hot Power Flow',
      instructor: 'Lisa Chen',
      type: 'Hot Yoga',
      level: 'Advanced',
      duration: 60,
      time: '12:00',
      date: 'Today',
      location: 'Heat Studio Basel',
      price: 42,
      spotsLeft: 5,
      isOutdoor: false,
      isSignature: false,
      isSwiss: true,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjB5b2dhJTIwc3R1ZGlvJTIwaGVhdGVkfGVufDF8fHx8MTc1Njc5MzMxOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: '5',
      title: 'Lakeside Flow',
      instructor: 'Anna Weber',
      type: 'Vinyasa',
      level: 'All Levels',
      duration: 75,
      time: '17:00',
      date: 'Tomorrow',
      location: 'Lake Zürich',
      price: 35,
      spotsLeft: 15,
      isOutdoor: true,
      isSignature: false,
      isSwiss: true,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWtlJTIweW9nYSUyMG91dGRvb3IlMjBzdW5zZXR8ZW58MXx8fHwxNzU2NzkzMzIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: '6',
      title: 'Prenatal Gentle Flow',
      instructor: 'Sophie Martin',
      type: 'Prenatal',
      level: 'Beginner',
      duration: 60,
      time: '10:30',
      date: 'Today',
      location: 'Mother Studio Lausanne',
      price: 40,
      spotsLeft: 8,
      isOutdoor: false,
      isSignature: true,
      isSwiss: true,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVuYXRhbCUyMHlvZ2ElMjBtb3RoZXJ8ZW58MXx8fHwxNzU2NzkzMzI2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  const filterOptions = {
    styles: ['Vinyasa', 'Yin', 'Hot Yoga', 'Meditation', 'Prenatal', 'Aerial'],
    levels: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    times: ['Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-22)'],
    locations: ['Zürich', 'Geneva', 'Basel', 'Lausanne', 'Bern'],
    features: ['Outdoor', 'Signature', 'Swiss Certified', 'Small Group', 'Private']
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const activeFiltersCount = Object.values(selectedFilters).flat().length;

  const clearAllFilters = () => {
    setSelectedFilters({
      styles: [],
      levels: [],
      times: [],
      locations: [],
      features: [],
      priceRange: [0, 100]
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Advanced Filters Sidebar */}
          <div className="lg:w-80 space-y-6">
            <LuxuryCard variant="elevated">
              <LuxuryCardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl font-semibold">Filters</h3>
                    {activeFiltersCount > 0 && (
                      <div className="flex items-center gap-2">
                        <LuxuryBadge variant="default" size="sm">
                          {activeFiltersCount}
                        </LuxuryBadge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={clearAllFilters}
                          className="text-xs"
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Yoga Styles */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Yoga Styles</h4>
                    <div className="space-y-2">
                      {filterOptions.styles.map((style) => (
                        <div key={style} className="flex items-center space-x-2">
                          <Checkbox 
                            id={style}
                            checked={selectedFilters.styles.includes(style)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedFilters(prev => ({
                                  ...prev,
                                  styles: [...prev.styles, style]
                                }));
                              } else {
                                setSelectedFilters(prev => ({
                                  ...prev,
                                  styles: prev.styles.filter(s => s !== style)
                                }));
                              }
                            }}
                          />
                          <label htmlFor={style} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {style}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Levels */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Levels</h4>
                    <div className="space-y-2">
                      {filterOptions.levels.map((level) => (
                        <div key={level} className="flex items-center space-x-2">
                          <Checkbox 
                            id={level}
                            checked={selectedFilters.levels.includes(level)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedFilters(prev => ({
                                  ...prev,
                                  levels: [...prev.levels, level]
                                }));
                              } else {
                                setSelectedFilters(prev => ({
                                  ...prev,
                                  levels: prev.levels.filter(l => l !== level)
                                }));
                              }
                            }}
                          />
                          <label htmlFor={level} className="text-sm font-medium leading-none">
                            {level}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time of Day */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Time of Day</h4>
                    <div className="space-y-2">
                      {filterOptions.times.map((time) => (
                        <div key={time} className="flex items-center space-x-2">
                          <Checkbox 
                            id={time}
                            checked={selectedFilters.times.includes(time)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedFilters(prev => ({
                                  ...prev,
                                  times: [...prev.times, time]
                                }));
                              } else {
                                setSelectedFilters(prev => ({
                                  ...prev,
                                  times: prev.times.filter(t => t !== time)
                                }));
                              }
                            }}
                          />
                          <label htmlFor={time} className="text-sm font-medium leading-none">
                            {time}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Special Features</h4>
                    <div className="space-y-2">
                      {filterOptions.features.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox 
                            id={feature}
                            checked={selectedFilters.features.includes(feature)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedFilters(prev => ({
                                  ...prev,
                                  features: [...prev.features, feature]
                                }));
                              } else {
                                setSelectedFilters(prev => ({
                                  ...prev,
                                  features: prev.features.filter(f => f !== feature)
                                }));
                              }
                            }}
                          />
                          <label htmlFor={feature} className="text-sm font-medium leading-none">
                            {feature}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Price Range</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">CHF 0</span>
                      <div className="flex-1 h-2 bg-muted rounded-full relative">
                        <div 
                          className="absolute h-2 bg-primary rounded-full"
                          style={{ width: `${selectedFilters.priceRange[1]}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">CHF 100+</span>
                    </div>
                    <div className="text-center text-sm font-medium">
                      Up to {formatCurrency(selectedFilters.priceRange[1])}
                    </div>
                  </div>
                </div>
              </LuxuryCardContent>
            </LuxuryCard>
          </div>

          {/* Results Section */}
          <div className="flex-1 space-y-6">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  {allClasses.length} Classes Found
                </h2>
                <p className="text-muted-foreground">
                  In {currentLocation?.name} and surrounding areas
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Most Relevant</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="time">Soonest</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex border rounded-lg p-1" style={{ borderColor: 'var(--border)' }}>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                    style={viewMode === 'grid' ? { 
                      backgroundColor: 'var(--forest)', 
                      color: 'white' 
                    } : {}}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3"
                    style={viewMode === 'list' ? { 
                      backgroundColor: 'var(--forest)', 
                      color: 'white' 
                    } : {}}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('map')}
                    className="px-3"
                    style={viewMode === 'map' ? { 
                      backgroundColor: 'var(--forest)', 
                      color: 'white' 
                    } : {}}
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mobile Filters */}
                <Sheet>
                  <SheetTrigger asChild>
                    <LuxuryButton variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <LuxuryBadge variant="default" size="sm" className="ml-2">
                          {activeFiltersCount}
                        </LuxuryBadge>
                      )}
                    </LuxuryButton>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    {/* Mobile filter content would go here */}
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {selectedFilters.styles.map(style => (
                  <Badge key={style} variant="secondary" className="cursor-pointer">
                    {style}
                    <X 
                      className="h-3 w-3 ml-1 hover:text-destructive" 
                      onClick={() => setSelectedFilters(prev => ({
                        ...prev,
                        styles: prev.styles.filter(s => s !== style)
                      }))}
                    />
                  </Badge>
                ))}
                {selectedFilters.levels.map(level => (
                  <Badge key={level} variant="secondary" className="cursor-pointer">
                    {level}
                    <X 
                      className="h-3 w-3 ml-1 hover:text-destructive"
                      onClick={() => setSelectedFilters(prev => ({
                        ...prev,
                        levels: prev.levels.filter(l => l !== level)
                      }))}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Results Grid */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {allClasses.map((class_) => (
                  <LuxuryClassCard
                    key={class_.id}
                    {...class_}
                    onBook={() => onPageChange(`class/${class_.id}`)}
                    onFavorite={() => {/* handle favorite */}}
                  />
                ))}
              </div>
            )}

            {/* Results List */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {allClasses.map((class_) => (
                  <LuxuryCard key={class_.id} variant="elevated" className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-64 h-48 md:h-auto">
                        <img 
                          src={class_.image} 
                          alt={class_.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <LuxuryCardContent className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif text-xl font-semibold">{class_.title}</h3>
                              {class_.isSignature && <LuxuryBadge variant="signature" size="sm">Signature</LuxuryBadge>}
                              {class_.isSwiss && <SwissBadge size="sm">Swiss</SwissBadge>}
                            </div>
                            <p className="text-muted-foreground">with {class_.instructor}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {class_.time} • {class_.duration}min
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {class_.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-current text-amber-400" />
                                {class_.rating}
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="luxury-price text-xl font-semibold">
                              {formatCurrency(class_.price)}
                            </div>
                            <LuxuryButton 
                              variant="elegant" 
                              size="sm"
                              onClick={() => onPageChange(`class/${class_.id}`)}
                            >
                              Book Now
                            </LuxuryButton>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ClassTypeBadge type={class_.type} size="sm" />
                            <LevelBadge level={class_.level} size="sm" />
                            {class_.isOutdoor && <LuxuryBadge variant="outdoor" size="sm">Outdoor</LuxuryBadge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {class_.spotsLeft} spots left
                          </p>
                        </div>
                      </LuxuryCardContent>
                    </div>
                  </LuxuryCard>
                ))}
              </div>
            )}

            {/* Map View Placeholder */}
            {viewMode === 'map' && (
              <LuxuryCard variant="elevated" className="h-96">
                <LuxuryCardContent className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Map className="h-16 w-16 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="font-serif text-xl font-semibold mb-2">Map View</h3>
                      <p className="text-muted-foreground">Interactive map coming soon</p>
                    </div>
                  </div>
                </LuxuryCardContent>
              </LuxuryCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}