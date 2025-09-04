import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  MapPin, 
  Navigation, 
  Filter,
  Star,
  Clock,
  Phone,
  Globe,
  X
} from 'lucide-react';

interface Location {
  id: string;
  name: string;
  type: 'studio' | 'outdoor';
  lat: number;
  lng: number;
  address: string;
  rating?: number;
  nextClass?: string;
  phone?: string;
  website?: string;
  image?: string;
  priceRange?: string;
  specialties?: string[];
}

interface InteractiveMapProps {
  locations: Location[];
  onLocationSelect?: (location: Location) => void;
  onGetDirections?: (location: Location) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function InteractiveMap({ 
  locations, 
  onLocationSelect,
  onGetDirections,
  center = { lat: 47.3769, lng: 8.5417 }, // Zurich center
  zoom = 12
}: InteractiveMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [filter, setFilter] = useState<'all' | 'studio' | 'outdoor'>('all');

  const filteredLocations = locations.filter(location => 
    filter === 'all' || location.type === filter
  );

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    onLocationSelect?.(location);
  };

  const handleGetDirections = (location: Location) => {
    onGetDirections?.(location);
    // In a real implementation, this would integrate with Google Maps or Apple Maps
    window.open(`https://maps.google.com/maps?q=${location.lat},${location.lng}`, '_blank');
  };

  const formatPrice = (amount: string) => {
    return `CHF ${amount}`;
  };

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Locations ({locations.length})
          </Button>
          <Button
            variant={filter === 'studio' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('studio')}
          >
            🏠 Studios ({locations.filter(l => l.type === 'studio').length})
          </Button>
          <Button
            variant={filter === 'outdoor' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('outdoor')}
          >
            🌿 Outdoor ({locations.filter(l => l.type === 'outdoor').length})
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Showing {filteredLocations.length} locations</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        {/* Simulated Map View */}
        <div className="h-96 bg-muted/30 rounded-lg border border-border relative overflow-hidden">
          {/* Swiss Map Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Location Markers */}
          {filteredLocations.map((location, index) => (
            <button
              key={location.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110 z-10 ${
                selectedLocation?.id === location.id ? 'scale-125' : ''
              }`}
              style={{
                left: `${20 + (index % 4) * 20}%`,
                top: `${20 + Math.floor(index / 4) * 15}%`
              }}
              onClick={() => handleLocationClick(location)}
            >
              <div className={`relative ${
                selectedLocation?.id === location.id ? 'z-20' : 'z-10'
              }`}>
                <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm ${
                  location.type === 'studio' 
                    ? 'bg-primary' 
                    : 'bg-primary/80'
                }`}>
                  {location.type === 'studio' ? '🏠' : '🌿'}
                </div>
                {selectedLocation?.id === location.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
                  </div>
                )}
              </div>
            </button>
          ))}

          {/* Map Center Indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-destructive rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          </div>

          {/* Swiss Flag in Corner */}
          <div className="absolute top-3 right-3 bg-background rounded-md p-2 shadow-sm border border-border">
            <span className="text-lg">🇨🇭</span>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-1">
            <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
              +
            </Button>
            <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
              -
            </Button>
          </div>
        </div>

        {/* Selected Location Info Panel */}
        {selectedLocation && (
          <Card className="absolute bottom-4 left-4 right-4 z-20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{selectedLocation.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {selectedLocation.type === 'studio' ? '🏠 Studio' : '🌿 Outdoor'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedLocation.address}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setSelectedLocation(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {selectedLocation.rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span>{selectedLocation.rating}</span>
                    </div>
                  )}
                  
                  {selectedLocation.nextClass && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLocation.nextClass}</span>
                    </div>
                  )}

                  {selectedLocation.priceRange && (
                    <div className="text-sm">
                      <strong>{formatPrice(selectedLocation.priceRange)}</strong> per class
                    </div>
                  )}

                  {selectedLocation.specialties && (
                    <div className="flex flex-wrap gap-1">
                      {selectedLocation.specialties.slice(0, 3).map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => handleGetDirections(selectedLocation)}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                  
                  <div className="flex gap-2">
                    {selectedLocation.phone && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    )}
                    {selectedLocation.website && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Globe className="h-4 w-4 mr-1" />
                        Website
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Map Legend */}
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center text-xs">
            🏠
          </div>
          <span>Yoga Studios</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary/80 rounded-full flex items-center justify-center text-xs">
            🌿
          </div>
          <span>Outdoor Locations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-destructive rounded-full"></div>
          <span>Your Location</span>
        </div>
      </div>
    </div>
  );
}