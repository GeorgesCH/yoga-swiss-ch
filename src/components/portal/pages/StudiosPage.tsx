import React, { useState } from 'react';
import { usePortal } from '../PortalProvider';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Separator } from '../../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { LuxuryButton } from '../../ui/luxury-button';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock,
  Phone,
  Globe,
  Heart,
  Navigation,
  Calendar,
  Grid3X3,
  List,
  Filter,
  Award,
  Users,
  Mountain
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

export function StudiosPage({ onPageChange }: { onPageChange: (page: string) => void }) {
  const { currentLocation, searchQuery, setSearchQuery } = usePortal();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('distance');
  const [favoriteStudios, setFavoriteStudios] = useState<string[]>([]);


  // Mock studios data
  const studios = [
    {
      id: '1',
      name: 'Flow Studio Zürich',
      slug: 'flow-studio-zurich',
      description: 'Modern yoga studio in the heart of Zürich offering Vinyasa, Yin, and Power Yoga classes.',
      rating: 4.9,
      reviewCount: 1250,
      distance: 0.8,
      address: 'Bahnhofstrasse 45, 8001 Zürich',
      phone: '+41 44 123 4567',
      website: 'www.flowstudio.ch',
      email: 'hello@flowstudio.ch',
      image: '/placeholder-studio-1.jpg',
      gallery: ['/placeholder-studio-1-1.jpg', '/placeholder-studio-1-2.jpg'],
      specialties: ['Vinyasa', 'Yin', 'Power Yoga', 'Meditation'],
      amenities: ['Changing Rooms', 'Shower', 'Props', 'Parking', 'Accessibility'],
      languages: ['English', 'German', 'French'],
      priceRange: '28-45',
      nextClasses: [
        { name: 'Vinyasa Flow', time: '18:30', instructor: 'Sarah Miller', spotsLeft: 5 },
        { name: 'Yin Yoga', time: '20:00', instructor: 'Marc Weber', spotsLeft: 8 }
      ],
      instructors: [
        { name: 'Sarah Miller', image: '/placeholder-instructor-1.jpg', rating: 4.9 },
        { name: 'Marc Weber', image: '/placeholder-instructor-2.jpg', rating: 4.8 }
      ],
      membership: {
        available: true,
        monthlyPrice: 89,
        unlimitedClasses: true
      },
      coordinates: { lat: 47.3769, lng: 8.5417 }
    },
    {
      id: '2',
      name: 'Zen Space Geneva',
      slug: 'zen-space-geneva',
      description: 'Peaceful sanctuary dedicated to mindful movement and meditation practices.',
      rating: 4.8,
      reviewCount: 890,
      distance: 1.2,
      address: 'Rue du Rhône 12, 1204 Geneva',
      phone: '+41 22 345 6789',
      website: 'www.zenspace.ch',
      email: 'info@zenspace.ch',
      image: '/placeholder-studio-2.jpg',
      gallery: ['/placeholder-studio-2-1.jpg', '/placeholder-studio-2-2.jpg'],
      specialties: ['Yin', 'Meditation', 'Prenatal', 'Restorative'],
      amenities: ['Meditation Room', 'Tea Area', 'Props', 'Nursing Room'],
      languages: ['French', 'English'],
      priceRange: '25-38',
      nextClasses: [
        { name: 'Meditation Circle', time: '19:00', instructor: 'Marie Dupont', spotsLeft: 12 },
        { name: 'Prenatal Yoga', time: '10:00', instructor: 'Sophie Laurent', spotsLeft: 6 }
      ],
      instructors: [
        { name: 'Marie Dupont', image: '/placeholder-instructor-3.jpg', rating: 4.9 },
        { name: 'Sophie Laurent', image: '/placeholder-instructor-4.jpg', rating: 4.7 }
      ],
      membership: {
        available: true,
        monthlyPrice: 75,
        unlimitedClasses: true
      },
      coordinates: { lat: 46.2044, lng: 6.1432 }
    },
    {
      id: '3',
      name: 'Mountain Yoga Basel',
      slug: 'mountain-yoga-basel',
      description: 'Dynamic studio focusing on strength-building and adventurous yoga practices.',
      rating: 4.7,
      reviewCount: 650,
      distance: 2.1,
      address: 'Steinenvorstadt 28, 4051 Basel',
      phone: '+41 61 987 6543',
      website: 'www.mountainyoga.ch',
      email: 'contact@mountainyoga.ch',
      image: '/placeholder-studio-3.jpg',
      gallery: ['/placeholder-studio-3-1.jpg', '/placeholder-studio-3-2.jpg'],
      specialties: ['Power', 'Ashtanga', 'Aerial', 'Hot Yoga'],
      amenities: ['Hot Room', 'Aerial Equipment', 'Juice Bar', 'Retail'],
      languages: ['German', 'English'],
      priceRange: '32-50',
      nextClasses: [
        { name: 'Power Yoga', time: '17:30', instructor: 'Lisa Chen', spotsLeft: 3 },
        { name: 'Aerial Yoga', time: '19:30', instructor: 'Tom Mueller', spotsLeft: 4 }
      ],
      instructors: [
        { name: 'Lisa Chen', image: '/placeholder-instructor-5.jpg', rating: 4.8 },
        { name: 'Tom Mueller', image: '/placeholder-instructor-6.jpg', rating: 4.6 }
      ],
      membership: {
        available: true,
        monthlyPrice: 95,
        unlimitedClasses: true
      },
      coordinates: { lat: 47.5596, lng: 7.5886 }
    },
    {
      id: '4',
      name: 'Lakeside Wellness',
      slug: 'lakeside-wellness',
      description: 'Holistic wellness center offering yoga, spa treatments, and wellness workshops.',
      rating: 4.6,
      reviewCount: 420,
      distance: 3.5,
      address: 'Seestrasse 120, 8802 Kilchberg',
      phone: '+41 44 555 7890',
      website: 'www.lakesidewellness.ch',
      email: 'wellness@lakeside.ch',
      image: '/placeholder-studio-4.jpg',
      gallery: ['/placeholder-studio-4-1.jpg', '/placeholder-studio-4-2.jpg'],
      specialties: ['Hatha', 'Therapeutic', 'Seniors', 'Workshops'],
      amenities: ['Spa', 'Sauna', 'Lake View', 'Wellness Shop', 'Parking'],
      languages: ['German', 'English', 'Italian'],
      priceRange: '35-60',
      nextClasses: [
        { name: 'Gentle Hatha', time: '16:00', instructor: 'Elena Rossi', spotsLeft: 10 },
        { name: 'Therapeutic Yoga', time: '18:00', instructor: 'Dr. Klaus Weber', spotsLeft: 7 }
      ],
      instructors: [
        { name: 'Elena Rossi', image: '/placeholder-instructor-7.jpg', rating: 4.7 },
        { name: 'Dr. Klaus Weber', image: '/placeholder-instructor-8.jpg', rating: 4.8 }
      ],
      membership: {
        available: true,
        monthlyPrice: 120,
        unlimitedClasses: false,
        includedClasses: 8
      },
      coordinates: { lat: 47.3200, lng: 8.5500 }
    }
  ];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const handleToggleFavorite = (studioId: string) => {
    setFavoriteStudios(prev =>
      prev.includes(studioId)
        ? prev.filter(id => id !== studioId)
        : [...prev, studioId]
    );
  };

  const StudioCard = ({ studio, isListView = false }: { studio: any, isListView?: boolean }) => (
    <Card 
      className={`group cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden ${
        isListView ? 'flex' : ''
      }`}
      onClick={() => onPageChange(`studio-${studio.slug}`)}
    >
      <div className={`relative ${isListView ? 'w-80 flex-shrink-0' : 'h-48'}`}>
        <ImageWithFallback
          src={studio.image}
          alt={studio.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(studio.id);
            }}
          >
            <Heart className={`h-4 w-4 ${favoriteStudios.includes(studio.id) ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/90 text-black">
            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
            {studio.rating} ({studio.reviewCount})
          </Badge>
        </div>
      </div>
      
      <CardContent className={`${isListView ? 'flex-1' : ''} p-4 space-y-3`}>
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              {studio.name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Navigation className="h-3 w-3" />
              <span>{studio.distance}km</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {studio.description}
          </p>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{studio.address}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {studio.specialties.slice(0, 4).map((specialty: string) => (
            <Badge key={specialty} variant="secondary" className="text-xs">
              {specialty}
            </Badge>
          ))}
          {studio.specialties.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{studio.specialties.length - 4} more
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next classes:</span>
            <span className="font-medium">CHF {studio.priceRange}</span>
          </div>
          
          {studio.nextClasses.slice(0, 2).map((class_: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{class_.time} - {class_.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {class_.spotsLeft} spots
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" className="flex-1" onClick={(e) => e.stopPropagation()}>
            View Schedule
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onPageChange(`studio-${studio.slug}`);
            }}
          >
            Profile
          </Button>
        </div>

        {studio.membership.available && (
          <div className="border rounded-lg p-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Membership</p>
                <p className="text-xs text-muted-foreground">
                  {studio.membership.unlimitedClasses 
                    ? 'Unlimited classes' 
                    : `${studio.membership.includedClasses} classes/month`
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(studio.membership.monthlyPrice)}/mo</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-20 space-y-12">
        {/* Page Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold">
                Studios in {currentLocation?.name}
              </h2>
              <p className="text-muted-foreground text-lg">
                {studios.length} premium studios found
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
            </div>
            
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy('distance')}>
                  Distance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('rating')}>
                  Rating
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('reviews')}>
                  Most Reviewed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('price_low')}>
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('price_high')}>
                  Price: High to Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search studios by name, location, or style..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>



      {/* Studios Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studios.map((studio) => (
            <StudioCard key={studio.id} studio={studio} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {studios.map((studio) => (
            <StudioCard key={studio.id} studio={studio} isListView />
          ))}
        </div>
      )}



        {/* Map Section */}
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h3 className="font-semibold">Studio Locations Map</h3>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Interactive map coming soon</p>
                <p className="text-sm text-muted-foreground">
                  View all studio locations on a map with directions
                </p>
              </div>
            </div>
            <Button variant="outline">
              Open Full Map
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}