import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Slider } from '../../ui/slider';
import { Separator } from '../../ui/separator';
import { LuxuryButton } from '../../ui/luxury-button';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Star,
  Heart,
  Search,
  Filter,
  ChevronDown,
  Mountain,
  Waves,
  TreePine,
  Sunrise,
  User,
  Award,
  Sparkles
} from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

interface RetreatsPageProps {
  onPageChange: (page: string, params?: any) => void;
}

// Mock data for retreats
const mockRetreats = [
  {
    id: 'alpine-serenity-2024',
    slug: 'alpine-serenity-retreat',
    title: 'Alpine Serenity Yoga Retreat',
    subtitle: 'Discover inner peace surrounded by the Swiss Alps',
    location: 'Interlaken, Switzerland',
    startDate: '2024-07-15',
    endDate: '2024-07-21',
    duration: '7 days',
    price: { from: 1850, currency: 'CHF' },
    heroImage: 'https://images.unsplash.com/photo-1679161551610-67dd4756f8db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwcmV0cmVhdCUyMG1vdW50YWlucyUyMGJlYXV0aWZ1bCUyMG5hdHVyZXxlbnwxfHx8fDE3NTY3NzEyNTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'mountain',
    level: 'all-levels',
    rating: 4.9,
    reviewCount: 127,
    availableSpots: 8,
    totalSpots: 16,
    highlights: ['Mountain views', 'Hot springs', 'Organic meals', 'Meditation'],
    status: 'published'
  },
  {
    id: 'ocean-bliss-2024',
    slug: 'ocean-bliss-retreat',
    title: 'Ocean Bliss Meditation Retreat',
    subtitle: 'Find your center by the Mediterranean coast',
    location: 'Ibiza, Spain',
    startDate: '2024-08-10',
    endDate: '2024-08-16',
    duration: '7 days',
    price: { from: 1650, currency: 'CHF' },
    heroImage: 'https://images.unsplash.com/photo-1687436874119-6e587ae3dae5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxtZWRpdGF0aW9uJTIwd2VsbG5lc3MlMjByZXRyZWF0fGVufDF8fHx8MTc1Njc3MTM1NXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'beach',
    level: 'beginner',
    rating: 4.8,
    reviewCount: 94,
    availableSpots: 12,
    totalSpots: 20,
    highlights: ['Beach yoga', 'Sunset meditation', 'Spa treatments', 'Plant-based cuisine'],
    status: 'published'
  },
  {
    id: 'forest-awakening-2024',
    slug: 'forest-awakening-retreat',
    title: 'Forest Awakening Retreat',
    subtitle: 'Connect with nature in the Black Forest',
    location: 'Black Forest, Germany',
    startDate: '2024-09-05',
    endDate: '2024-09-10',
    duration: '6 days',
    price: { from: 1450, currency: 'CHF' },
    heroImage: 'https://images.unsplash.com/photo-1638820812789-6a53d0200bf3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwcmV0cmVhdCUyMGRpdmVyc2UlMjBhY3Rpdml0aWVzfGVufDF8fHx8MTc1Njc3MTM1MHww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'forest',
    level: 'intermediate',
    rating: 4.7,
    reviewCount: 83,
    availableSpots: 6,
    totalSpots: 14,
    highlights: ['Forest bathing', 'Wild yoga', 'Herbal workshops', 'Digital detox'],
    status: 'published'
  },
  {
    id: 'sunrise-intensive-2024',
    slug: 'sunrise-intensive-retreat',
    title: 'Sunrise Intensive Retreat',
    subtitle: 'Deepen your practice with daily sunrise sessions',
    location: 'Ticino, Switzerland',
    startDate: '2024-10-01',
    endDate: '2024-10-05',
    duration: '5 days',
    price: { from: 980, currency: 'CHF' },
    heroImage: 'https://images.unsplash.com/photo-1615275219949-b31d641fce23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwaW5zdHJ1Y3RvciUyMHRlYWNoaW5nJTIwY2xhc3MlMjBuYXR1cmV8ZW58MXx8fHwxNzU2NzcxMjU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'intensive',
    level: 'advanced',
    rating: 4.9,
    reviewCount: 156,
    availableSpots: 4,
    totalSpots: 12,
    highlights: ['Daily 6am practice', 'Advanced asanas', 'Philosophy study', 'Silent meditation'],
    status: 'published'
  }
];

const categories = [
  { id: 'all', name: 'All Retreats', icon: User },
  { id: 'mountain', name: 'Mountain', icon: Mountain },
  { id: 'beach', name: 'Beach', icon: Waves },
  { id: 'forest', name: 'Forest', icon: TreePine },
  { id: 'intensive', name: 'Intensive', icon: Sunrise }
];

const levels = [
  { id: 'all-levels', name: 'All Levels' },
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' }
];

export function RetreatsPage({ onPageChange }: RetreatsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState('date');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (retreatId: string) => {
    setFavorites(prev => 
      prev.includes(retreatId) 
        ? prev.filter(id => id !== retreatId)
        : [...prev, retreatId]
    );
  };

  const filteredRetreats = mockRetreats.filter(retreat => {
    // Search filter
    if (searchQuery && !retreat.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !retreat.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && retreat.category !== selectedCategory) {
      return false;
    }

    // Level filter
    if (selectedLevel !== 'all' && retreat.level !== selectedLevel && retreat.level !== 'all-levels') {
      return false;
    }

    // Price filter
    if (retreat.price.from < priceRange[0] || retreat.price.from > priceRange[1]) {
      return false;
    }

    return true;
  });

  const sortedRetreats = [...filteredRetreats].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price.from - b.price.from;
      case 'price-high':
        return b.price.from - a.price.from;
      case 'rating':
        return b.rating - a.rating;
      case 'popularity':
        return b.reviewCount - a.reviewCount;
      case 'date':
      default:
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-20 space-y-12">

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search retreats by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    {category.name}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                More Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Level Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Experience Level</label>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {levels.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Upcoming Dates</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="popularity">Most Popular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Price Range: CHF {priceRange[0]} - CHF {priceRange[1]}
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={3000}
                      min={0}
                      step={50}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {sortedRetreats.length} retreat{sortedRetreats.length !== 1 ? 's' : ''} found
        </p>
        <div className="text-sm text-muted-foreground">
          Showing results for {selectedCategory === 'all' ? 'all categories' : categories.find(c => c.id === selectedCategory)?.name.toLowerCase()}
        </div>
      </div>

      {/* Retreats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedRetreats.map((retreat) => (
          <Card 
            key={retreat.id} 
            className="group hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
            onClick={() => onPageChange('retreat-detail', { slug: retreat.slug })}
          >
            <div className="relative">
              <div className="aspect-[16/10] overflow-hidden">
                <ImageWithFallback
                  src={retreat.heroImage}
                  alt={retreat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(retreat.id);
                }}
              >
                <Heart
                  className={`h-4 w-4 ${
                    favorites.includes(retreat.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-600'
                  }`}
                />
              </Button>

              {/* Availability Badge */}
              <div className="absolute top-3 left-3">
                <Badge 
                  variant={retreat.availableSpots > 5 ? 'secondary' : 'destructive'}
                  className="bg-white/90 text-gray-800"
                >
                  {retreat.availableSpots} spots left
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Title and Location */}
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {retreat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{retreat.subtitle}</p>
                </div>

                {/* Location and Duration */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {retreat.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {retreat.duration}
                  </span>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1">
                  {retreat.highlights.slice(0, 3).map((highlight, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                      {highlight}
                    </Badge>
                  ))}
                  {retreat.highlights.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      +{retreat.highlights.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Rating and Price */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{retreat.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({retreat.reviewCount})
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">From</div>
                    <div className="font-semibold">
                      CHF {retreat.price.from.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sortedRetreats.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No retreats found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters to find more retreats.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                  setPriceRange([0, 3000]);
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

        {/* Load More (for future pagination) */}
        {sortedRetreats.length > 0 && (
          <div className="text-center pt-6">
            <Button variant="outline">
              Load More Retreats
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}