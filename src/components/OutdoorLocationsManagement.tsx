import { useState } from 'react';
import { 
  Plus, Search, MapPin, Mountain, Trees, Waves, Building2, 
  Shield, AlertTriangle, Thermometer, Cloud, QrCode, 
  Smartphone, Calendar, Users, Edit, Trash2, MoreHorizontal,
  Navigation, Clock, FileText, Star, Eye, Copy
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { useLanguage } from './LanguageProvider';

// Outdoor location type icons
const OutdoorTypeIcon = ({ type, className = "h-4 w-4" }: { type: string, className?: string }) => {
  const iconMap = {
    lake: Waves,
    park: Trees,
    mountain: Mountain,
    rooftop: Building2,
    forest: Trees
  };
  
  const Icon = iconMap[type as keyof typeof iconMap] || MapPin;
  return <Icon className={className} />;
};

// Weather condition icons
const WeatherIcon = ({ condition, className = "h-4 w-4" }: { condition: string, className?: string }) => {
  const iconMap = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    windy: '💨',
    snowy: '❄️'
  };
  
  return <span className={className}>{iconMap[condition as keyof typeof iconMap] || '☀️'}</span>;
};

interface OutdoorLocation {
  id: string;
  name: string;
  type: 'lake' | 'park' | 'mountain' | 'rooftop' | 'forest';
  subtype?: string;
  description: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  what3words: string;
  privacy_level: 'public' | 'approximate' | 'hidden_until_booked';
  capacity: {
    min: number;
    max: number;
    dynamic: boolean;
  };
  check_in_method: 'geofence' | 'qr_code' | 'manual' | 'hybrid';
  geofence_radius?: number;
  weather_rules: {
    auto_cancel_conditions: string[];
    auto_move_conditions: string[];
    temperature_min?: number;
    temperature_max?: number;
    wind_speed_max?: number;
  };
  backup_location?: {
    type: 'indoor' | 'covered_outdoor';
    location_id?: string;
    name?: string;
  };
  seasonality: {
    available_months: number[];
    peak_season: number[];
    off_season_discount?: number;
  };
  permits: {
    required: boolean;
    permit_number?: string;
    expiry_date?: string;
    contact_authority?: string;
  };
  amenities: string[];
  safety_requirements: {
    insurance_required: boolean;
    waiver_required: boolean;
    emergency_contact: boolean;
    first_aid_kit: boolean;
    weather_monitoring: boolean;
  };
  accessibility: {
    wheelchair_accessible: boolean;
    public_transport: boolean;
    parking_available: boolean;
    parking_spaces?: number;
  };
  pricing: {
    base_rate_chf: number;
    seasonal_multiplier?: number;
    weather_discount?: number;
  };
  contact_info: {
    emergency_number: string;
    local_contact?: string;
    authorities?: string;
  };
  status: 'active' | 'seasonal_closed' | 'maintenance' | 'permit_expired';
  created_date: string;
  last_updated: string;
}

interface OutdoorLocationsManagementProps {
  onCreateLocation?: () => void;
}

export function OutdoorLocationsManagement({ onCreateLocation }: OutdoorLocationsManagementProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<OutdoorLocation | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock outdoor locations data
  const mockOutdoorLocations: OutdoorLocation[] = [
    {
      id: 'outdoor-1',
      name: 'Zürichsee Sunrise Spot',
      type: 'lake',
      subtype: 'lakefront',
      description: 'Peaceful lakefront location with stunning sunrise views over Lake Zurich',
      address: 'Seestrasse 120, 8002 Zürich',
      coordinates: { lat: 47.3656, lng: 8.5320 },
      what3words: '///lakes.sunrise.peaceful',
      privacy_level: 'approximate',
      capacity: { min: 8, max: 20, dynamic: true },
      check_in_method: 'hybrid',
      geofence_radius: 50,
      weather_rules: {
        auto_cancel_conditions: ['heavy_rain', 'thunderstorm', 'strong_wind'],
        auto_move_conditions: ['light_rain'],
        temperature_min: 5,
        wind_speed_max: 25
      },
      backup_location: {
        type: 'indoor',
        location_id: 'studio-a',
        name: 'Studio A'
      },
      seasonality: {
        available_months: [4, 5, 6, 7, 8, 9, 10],
        peak_season: [6, 7, 8],
        off_season_discount: 0.2
      },
      permits: {
        required: true,
        permit_number: 'ZH-OUTDOOR-2024-001',
        expiry_date: '2024-12-31',
        contact_authority: 'Stadt Zürich Grün Stadt Zürich'
      },
      amenities: ['restrooms_nearby', 'parking', 'public_transport', 'water_access'],
      safety_requirements: {
        insurance_required: true,
        waiver_required: true,
        emergency_contact: true,
        first_aid_kit: true,
        weather_monitoring: true
      },
      accessibility: {
        wheelchair_accessible: false,
        public_transport: true,
        parking_available: true,
        parking_spaces: 12
      },
      pricing: {
        base_rate_chf: 45,
        seasonal_multiplier: 1.3,
        weather_discount: 0.15
      },
      contact_info: {
        emergency_number: '+41 117',
        local_contact: '+41 44 123 4567',
        authorities: '+41 44 412 1234'
      },
      status: 'active',
      created_date: '2024-01-15',
      last_updated: '2024-08-15'
    },
    {
      id: 'outdoor-2',
      name: 'Uetliberg Mountain View',
      type: 'mountain',
      subtype: 'summit',
      description: 'Mountain top yoga with panoramic views of Zurich and the Alps',
      address: 'Uetlibergweg, 8143 Stallikon',
      coordinates: { lat: 47.3492, lng: 8.4912 },
      what3words: '///summit.views.mountain',
      privacy_level: 'public',
      capacity: { min: 6, max: 15, dynamic: false },
      check_in_method: 'geofence',
      geofence_radius: 75,
      weather_rules: {
        auto_cancel_conditions: ['fog_heavy', 'thunderstorm', 'snow'],
        auto_move_conditions: ['light_fog'],
        temperature_min: 0,
        wind_speed_max: 35
      },
      backup_location: {
        type: 'covered_outdoor',
        name: 'Uetliberg Restaurant Terrace'
      },
      seasonality: {
        available_months: [5, 6, 7, 8, 9, 10],
        peak_season: [7, 8, 9]
      },
      permits: {
        required: false
      },
      amenities: ['restaurant_nearby', 'restrooms', 'scenic_views', 'hiking_trails'],
      safety_requirements: {
        insurance_required: true,
        waiver_required: true,
        emergency_contact: true,
        first_aid_kit: true,
        weather_monitoring: true
      },
      accessibility: {
        wheelchair_accessible: false,
        public_transport: true,
        parking_available: true,
        parking_spaces: 25
      },
      pricing: {
        base_rate_chf: 55,
        seasonal_multiplier: 1.2
      },
      contact_info: {
        emergency_number: '+41 1414',
        local_contact: '+41 44 123 4567'
      },
      status: 'active',
      created_date: '2024-02-01',
      last_updated: '2024-08-20'
    },
    {
      id: 'outdoor-3',
      name: 'Stadtpark Forest Grove',
      type: 'park',
      subtype: 'forest_grove',
      description: 'Tranquil forest setting in the heart of the city park',
      address: 'Stadtpark, 8001 Zürich',
      coordinates: { lat: 47.3769, lng: 8.5417 },
      what3words: '///forest.tranquil.grove',
      privacy_level: 'approximate',
      capacity: { min: 10, max: 25, dynamic: true },
      check_in_method: 'qr_code',
      weather_rules: {
        auto_cancel_conditions: ['thunderstorm', 'heavy_rain'],
        auto_move_conditions: [],
        temperature_min: -5
      },
      backup_location: {
        type: 'covered_outdoor',
        name: 'Park Pavilion'
      },
      seasonality: {
        available_months: [3, 4, 5, 6, 7, 8, 9, 10, 11],
        peak_season: [5, 6, 7, 8, 9]
      },
      permits: {
        required: true,
        permit_number: 'ZH-PARK-2024-003',
        expiry_date: '2024-11-30'
      },
      amenities: ['restrooms', 'playground_nearby', 'cafe_nearby', 'bike_racks'],
      safety_requirements: {
        insurance_required: true,
        waiver_required: false,
        emergency_contact: true,
        first_aid_kit: true,
        weather_monitoring: false
      },
      accessibility: {
        wheelchair_accessible: true,
        public_transport: true,
        parking_available: true,
        parking_spaces: 8
      },
      pricing: {
        base_rate_chf: 35
      },
      contact_info: {
        emergency_number: '+41 117'
      },
      status: 'active',
      created_date: '2024-03-10',
      last_updated: '2024-08-25'
    }
  ];

  const filteredLocations = mockOutdoorLocations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || location.type === filterType;
    const matchesStatus = filterStatus === 'all' || location.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleLocationClick = (location: OutdoorLocation) => {
    setSelectedLocation(location);
    setShowDetailDialog(true);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700 border-green-200',
      seasonal_closed: 'bg-orange-100 text-orange-700 border-orange-200',
      maintenance: 'bg-red-100 text-red-700 border-red-200',
      permit_expired: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const getSeasonalStatus = (location: OutdoorLocation) => {
    const currentMonth = new Date().getMonth() + 1;
    const isInSeason = location.seasonality.available_months.includes(currentMonth);
    const isPeakSeason = location.seasonality.peak_season.includes(currentMonth);
    
    if (!isInSeason) return { label: 'Out of Season', color: 'text-red-600' };
    if (isPeakSeason) return { label: 'Peak Season', color: 'text-green-600' };
    return { label: 'In Season', color: 'text-blue-600' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Outdoor Locations</h1>
          <p className="text-muted-foreground">
            Manage outdoor yoga locations with weather monitoring and Swiss compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none first:rounded-l-lg"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none last:rounded-r-lg"
            >
              List
            </Button>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Outdoor Location
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="lake">Lake</SelectItem>
            <SelectItem value="mountain">Mountain</SelectItem>
            <SelectItem value="park">Park</SelectItem>
            <SelectItem value="rooftop">Rooftop</SelectItem>
            <SelectItem value="forest">Forest</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="seasonal_closed">Seasonal Closed</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="permit_expired">Permit Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Locations Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLocations.map((location) => {
            const seasonalStatus = getSeasonalStatus(location);
            
            return (
              <Card 
                key={location.id} 
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleLocationClick(location)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <OutdoorTypeIcon type={location.type} className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{location.name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">
                          {location.type} • {location.subtype}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(location.status)}>
                      {location.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {location.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{location.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {location.capacity.min}-{location.capacity.max} people
                        {location.capacity.dynamic && ' (dynamic)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={seasonalStatus.color}>
                        {seasonalStatus.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                      {location.check_in_method === 'qr_code' && (
                        <QrCode className="h-4 w-4 text-blue-500" title="QR Check-in" />
                      )}
                      {location.check_in_method === 'geofence' && (
                        <Navigation className="h-4 w-4 text-green-500" title="Geofence Check-in" />
                      )}
                      {location.permits.required && (
                        <Shield className="h-4 w-4 text-orange-500" title="Permit Required" />
                      )}
                      {location.weather_rules.auto_cancel_conditions.length > 0 && (
                        <Cloud className="h-4 w-4 text-blue-500" title="Weather Monitoring" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Location
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // List view
        <div className="space-y-4">
          {filteredLocations.map((location) => {
            const seasonalStatus = getSeasonalStatus(location);
            
            return (
              <Card 
                key={location.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleLocationClick(location)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <OutdoorTypeIcon type={location.type} className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-medium">{location.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {location.type} • {location.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-right">
                        <div className="font-medium">
                          {location.capacity.min}-{location.capacity.max} people
                        </div>
                        <div className={`text-sm ${seasonalStatus.color}`}>
                          {seasonalStatus.label}
                        </div>
                      </div>
                      <Badge className={getStatusColor(location.status)}>
                        {location.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Location Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLocation && (
                <>
                  <OutdoorTypeIcon type={selectedLocation.type} className="h-5 w-5" />
                  {selectedLocation.name}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLocation && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="weather">Weather & Safety</TabsTrigger>
                <TabsTrigger value="permits">Permits & Legal</TabsTrigger>
                <TabsTrigger value="pricing">Pricing & Seasonality</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Type:</strong> {selectedLocation.type}</div>
                      <div><strong>Subtype:</strong> {selectedLocation.subtype}</div>
                      <div><strong>Status:</strong> {selectedLocation.status}</div>
                      <div><strong>Capacity:</strong> {selectedLocation.capacity.min}-{selectedLocation.capacity.max} people</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Quick Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Check-in:</strong> {selectedLocation.check_in_method}</div>
                      <div><strong>Privacy:</strong> {selectedLocation.privacy_level}</div>
                      <div><strong>Base Rate:</strong> CHF {selectedLocation.pricing.base_rate_chf}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedLocation.description}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocation.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline">
                        {amenity.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="location" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Address & Coordinates</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Address:</strong> {selectedLocation.address}</div>
                      <div><strong>Coordinates:</strong> {selectedLocation.coordinates.lat}, {selectedLocation.coordinates.lng}</div>
                      <div><strong>What3Words:</strong> {selectedLocation.what3words}</div>
                      <div><strong>Privacy Level:</strong> {selectedLocation.privacy_level}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Accessibility</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={selectedLocation.accessibility.wheelchair_accessible} disabled />
                        <span>Wheelchair accessible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={selectedLocation.accessibility.public_transport} disabled />
                        <span>Public transport</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={selectedLocation.accessibility.parking_available} disabled />
                        <span>Parking available ({selectedLocation.accessibility.parking_spaces} spaces)</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Check-in Configuration</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <strong>Method:</strong> {selectedLocation.check_in_method}
                      {selectedLocation.geofence_radius && (
                        <div className="text-sm text-muted-foreground">
                          Geofence radius: {selectedLocation.geofence_radius}m
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="weather" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Weather Rules</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <strong>Auto-cancel conditions:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedLocation.weather_rules.auto_cancel_conditions.map((condition) => (
                          <Badge key={condition} variant="destructive">
                            {condition.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong>Auto-move conditions:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedLocation.weather_rules.auto_move_conditions.map((condition) => (
                          <Badge key={condition} variant="outline">
                            {condition.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  {(selectedLocation.weather_rules.temperature_min || selectedLocation.weather_rules.temperature_max) && (
                    <div>
                      <strong>Temperature limits:</strong>
                      <div className="text-sm text-muted-foreground">
                        {selectedLocation.weather_rules.temperature_min && `Min: ${selectedLocation.weather_rules.temperature_min}°C`}
                        {selectedLocation.weather_rules.temperature_max && ` Max: ${selectedLocation.weather_rules.temperature_max}°C`}
                        {selectedLocation.weather_rules.wind_speed_max && ` Wind: max ${selectedLocation.weather_rules.wind_speed_max} km/h`}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Backup Location</h4>
                  {selectedLocation.backup_location ? (
                    <div className="text-sm">
                      <div><strong>Type:</strong> {selectedLocation.backup_location.type}</div>
                      <div><strong>Location:</strong> {selectedLocation.backup_location.name}</div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No backup location configured</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Safety Requirements</h4>
                  <div className="grid gap-2 md:grid-cols-2 text-sm">
                    {Object.entries(selectedLocation.safety_requirements).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <input type="checkbox" checked={value} disabled />
                        <span>{key.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="permits" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Permit Information</h4>
                  {selectedLocation.permits.required ? (
                    <div className="space-y-2 text-sm">
                      <div><strong>Permit Number:</strong> {selectedLocation.permits.permit_number}</div>
                      <div><strong>Expiry Date:</strong> {selectedLocation.permits.expiry_date}</div>
                      <div><strong>Authority:</strong> {selectedLocation.permits.contact_authority}</div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No permits required</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Emergency Contacts</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Emergency:</strong> {selectedLocation.contact_info.emergency_number}</div>
                    {selectedLocation.contact_info.local_contact && (
                      <div><strong>Local Contact:</strong> {selectedLocation.contact_info.local_contact}</div>
                    )}
                    {selectedLocation.contact_info.authorities && (
                      <div><strong>Authorities:</strong> {selectedLocation.contact_info.authorities}</div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="pricing" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Pricing Structure</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Base Rate:</strong> CHF {selectedLocation.pricing.base_rate_chf}</div>
                    {selectedLocation.pricing.seasonal_multiplier && (
                      <div><strong>Peak Season Multiplier:</strong> {selectedLocation.pricing.seasonal_multiplier}x</div>
                    )}
                    {selectedLocation.pricing.weather_discount && (
                      <div><strong>Weather Discount:</strong> {selectedLocation.pricing.weather_discount * 100}%</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Seasonality</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Available Months:</strong> {selectedLocation.seasonality.available_months.join(', ')}</div>
                    <div><strong>Peak Season:</strong> {selectedLocation.seasonality.peak_season.join(', ')}</div>
                    {selectedLocation.seasonality.off_season_discount && (
                      <div><strong>Off-season Discount:</strong> {selectedLocation.seasonality.off_season_discount * 100}%</div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}