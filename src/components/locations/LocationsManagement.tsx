import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { 
  Search, Plus, MapPin, Building, Users, Wifi, Parking,
  AirVent, Thermometer, Volume2, Camera, Lock, Lightbulb,
  Calendar, Clock, Edit2, Trash2, MoreHorizontal, Eye,
  Settings, Star, AlertCircle, CheckCircle, XCircle,
  Home, Car, Coffee, Utensils, ShowerHead, Dumbbell,
  TreePine, Mountain, Waves, Sun, Flower, Leaf
} from 'lucide-react';
import { CreateLocationDialog } from './CreateLocationDialog';
import { LocationDetailDialog } from './LocationDetailDialog';
import { EquipmentManagement } from './EquipmentManagement';

// Mock data for locations
const mockLocations = [
  {
    id: '1',
    name: 'Main Studio Zürich',
    type: 'Indoor Studio',
    address: 'Bahnhofstrasse 15, 8001 Zürich',
    capacity: 25,
    size_sqm: 85,
    status: 'Active',
    rating: 4.8,
    total_classes: 1250,
    monthly_revenue: 15680.00,
    amenities: ['Wifi', 'Parking', 'AC', 'Sound System', 'Changing Rooms', 'Reception'],
    equipment: ['Yoga Mats', 'Blocks', 'Straps', 'Bolsters', 'Blankets', 'Meditation Cushions'],
    photos: [],
    description: 'Our flagship studio in the heart of Zürich with premium amenities and equipment.',
    hourly_rate: 120.00,
    manager: 'Sarah Chen',
    phone: '+41 44 123 4567',
    email: 'zurich@yogaswiss.ch',
    operating_hours: '06:00-22:00',
    accessibility: true,
    parking_spots: 8,
    changing_rooms: 2,
    showers: 2,
    storage_space: 'Large',
    natural_light: true,
    flooring: 'Bamboo',
    ceiling_height: 3.2,
    temperature_control: 'AC + Heating',
    sound_system: 'Professional',
    last_maintenance: '2024-01-10',
    next_maintenance: '2024-04-10'
  },
  {
    id: '2',
    name: 'Hot Yoga Geneva',
    type: 'Hot Yoga Studio',
    address: 'Rue du Rhône 65, 1204 Genève',
    capacity: 20,
    size_sqm: 75,
    status: 'Active',
    rating: 4.6,
    total_classes: 890,
    monthly_revenue: 12400.00,
    amenities: ['Wifi', 'AC', 'Sound System', 'Changing Rooms', 'Showers', 'Towel Service'],
    equipment: ['Yoga Mats', 'Towels', 'Water Stations', 'Fans'],
    photos: [],
    description: 'Specialized hot yoga studio with advanced climate control systems.',
    hourly_rate: 110.00,
    manager: 'Amélie Dubois',
    phone: '+41 22 123 4567',
    email: 'geneva@yogaswiss.ch',
    operating_hours: '06:30-21:30',
    accessibility: true,
    parking_spots: 5,
    changing_rooms: 2,
    showers: 3,
    storage_space: 'Medium',
    natural_light: false,
    flooring: 'Cork',
    ceiling_height: 2.8,
    temperature_control: 'Heated',
    sound_system: 'Basic',
    last_maintenance: '2024-01-05',
    next_maintenance: '2024-04-05'
  },
  {
    id: '3',
    name: 'Outdoor Pavilion Basel',
    type: 'Outdoor Space',
    address: 'Rheinpark, 4052 Basel',
    capacity: 40,
    size_sqm: 150,
    status: 'Seasonal',
    rating: 4.9,
    total_classes: 320,
    monthly_revenue: 8900.00,
    amenities: ['Parking', 'Restrooms', 'Water Fountain', 'Shelter'],
    equipment: ['Portable Sound System', 'Mats Available for Rent'],
    photos: [],
    description: 'Beautiful outdoor space by the Rhine River, perfect for seasonal yoga sessions.',
    hourly_rate: 80.00,
    manager: 'Marco Bernasconi',
    phone: '+41 61 123 4567',
    email: 'basel@yogaswiss.ch',
    operating_hours: 'Sunrise-Sunset',
    accessibility: true,
    parking_spots: 15,
    changing_rooms: 0,
    showers: 0,
    storage_space: 'Small',
    natural_light: true,
    flooring: 'Grass/Wood Deck',
    ceiling_height: 'Open Air',
    temperature_control: 'Natural',
    sound_system: 'Portable',
    last_maintenance: '2024-01-15',
    next_maintenance: '2024-05-15'
  },
  {
    id: '4',
    name: 'Wellness Center Lugano',
    type: 'Wellness Center',
    address: 'Via Nassa 28, 6900 Lugano',
    capacity: 30,
    size_sqm: 110,
    status: 'Active',
    rating: 4.7,
    total_classes: 650,
    monthly_revenue: 18200.00,
    amenities: ['Wifi', 'Parking', 'AC', 'Sound System', 'Changing Rooms', 'Spa', 'Café', 'Shop'],
    equipment: ['Yoga Mats', 'Props', 'Aerial Equipment', 'Meditation Corner', 'Tea Station'],
    photos: [],
    description: 'Full-service wellness center with yoga, spa treatments, and retail.',
    hourly_rate: 140.00,
    manager: 'Lisa Müller',
    phone: '+41 91 123 4567',
    email: 'lugano@yogaswiss.ch',
    operating_hours: '06:00-22:00',
    accessibility: true,
    parking_spots: 12,
    changing_rooms: 3,
    showers: 4,
    storage_space: 'Large',
    natural_light: true,
    flooring: 'Premium Bamboo',
    ceiling_height: 3.5,
    temperature_control: 'Smart Climate',
    sound_system: 'Premium',
    last_maintenance: '2024-01-08',
    next_maintenance: '2024-04-08'
  },
  {
    id: '5',
    name: 'Mountain Retreat Zermatt',
    type: 'Retreat Center',
    address: 'Bergstrasse 45, 3920 Zermatt',
    capacity: 15,
    size_sqm: 60,
    status: 'Seasonal',
    rating: 5.0,
    total_classes: 180,
    monthly_revenue: 25000.00,
    amenities: ['Parking', 'Kitchen', 'Accommodation', 'Mountain Views', 'Hiking Trails'],
    equipment: ['Yoga Mats', 'Meditation Supplies', 'Blankets', 'Tea Station'],
    photos: [],
    description: 'Exclusive mountain retreat with breathtaking Alpine views.',
    hourly_rate: 200.00,
    manager: 'David Wilson',
    phone: '+41 27 123 4567',
    email: 'zermatt@yogaswiss.ch',
    operating_hours: 'All Day',
    accessibility: false,
    parking_spots: 6,
    changing_rooms: 1,
    showers: 2,
    storage_space: 'Medium',
    natural_light: true,
    flooring: 'Natural Wood',
    ceiling_height: 2.9,
    temperature_control: 'Wood Heating',
    sound_system: 'Acoustic',
    last_maintenance: '2023-11-15',
    next_maintenance: '2024-05-15'
  }
];

const statusColors = {
  'Active': 'bg-green-100 text-green-800',
  'Inactive': 'bg-gray-100 text-gray-800',
  'Seasonal': 'bg-yellow-100 text-yellow-800',
  'Maintenance': 'bg-orange-100 text-orange-800',
  'Under Construction': 'bg-blue-100 text-blue-800'
};

const typeColors = {
  'Indoor Studio': 'bg-blue-100 text-blue-800',
  'Hot Yoga Studio': 'bg-red-100 text-red-800',
  'Outdoor Space': 'bg-green-100 text-green-800',
  'Wellness Center': 'bg-purple-100 text-purple-800',
  'Retreat Center': 'bg-indigo-100 text-indigo-800'
};

const amenityIcons = {
  'Wifi': Wifi,
  'Parking': Car,
  'AC': AirVent,
  'Sound System': Volume2,
  'Changing Rooms': Home,
  'Showers': ShowerHead,
  'Reception': Coffee,
  'Café': Utensils,
  'Spa': Flower,
  'Shop': Building,
  'Kitchen': Utensils,
  'Accommodation': Home,
  'Mountain Views': Mountain,
  'Hiking Trails': TreePine,
  'Restrooms': Home,
  'Water Fountain': Waves,
  'Shelter': Home,
  'Towel Service': ShowerHead,
  'Tea Station': Coffee
};

export function LocationsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [showLocationDetail, setShowLocationDetail] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sortBy, setSortBy] = useState('name');

  // Get unique values for filters
  const types = [...new Set(mockLocations.map(l => l.type))];
  const statuses = [...new Set(mockLocations.map(l => l.status))];

  // Filter and sort locations
  const filteredLocations = useMemo(() => {
    let filtered = mockLocations.filter(location => {
      const matchesSearch = searchTerm === '' || 
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'all' || location.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || location.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort locations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'capacity':
          return b.capacity - a.capacity;
        case 'revenue':
          return b.monthly_revenue - a.monthly_revenue;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedType, selectedStatus, sortBy]);

  const toggleLocationSelection = (locationId: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const toggleAllLocations = () => {
    if (selectedLocations.length === filteredLocations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(filteredLocations.map(l => l.id));
    }
  };

  const openLocationDetail = (location: any) => {
    setSelectedLocation(location);
    setShowLocationDetail(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Inactive':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      case 'Seasonal':
        return <Sun className="w-4 h-4 text-yellow-600" />;
      case 'Maintenance':
        return <Settings className="w-4 h-4 text-orange-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const LocationCard = ({ location }: { location: any }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => openLocationDetail(location)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Checkbox 
              checked={selectedLocations.includes(location.id)}
              onCheckedChange={() => toggleLocationSelection(location.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{location.name}</h3>
                {getStatusIcon(location.status)}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={typeColors[location.type]}>
                  {location.type}
                </Badge>
                <Badge className={statusColors[location.status]}>
                  {location.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="font-medium">{location.rating}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-2" />
          {location.address}
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="flex items-center text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              Capacity
            </div>
            <div className="font-medium">{location.capacity} people</div>
          </div>
          <div>
            <div className="flex items-center text-muted-foreground">
              <Building className="w-4 h-4 mr-1" />
              Size
            </div>
            <div className="font-medium">{location.size_sqm} m²</div>
          </div>
          <div>
            <div className="text-muted-foreground">Monthly Revenue</div>
            <div className="font-medium text-green-600">
              {formatCurrency(location.monthly_revenue)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Amenities</div>
          <div className="flex flex-wrap gap-1">
            {location.amenities.slice(0, 6).map((amenity: string) => {
              const IconComponent = amenityIcons[amenity] || Building;
              return (
                <div key={amenity} 
                     className="flex items-center px-2 py-1 bg-gray-100 rounded-md text-xs">
                  <IconComponent className="w-3 h-3 mr-1" />
                  {amenity}
                </div>
              );
            })}
            {location.amenities.length > 6 && (
              <div className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                +{location.amenities.length - 6} more
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            {location.total_classes} classes hosted
          </div>
          <div className="font-medium">
            {formatCurrency(location.hourly_rate)}/hour
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Calculate summary stats
  const stats = {
    total: mockLocations.length,
    active: mockLocations.filter(l => l.status === 'Active').length,
    totalCapacity: mockLocations.reduce((sum, l) => sum + l.capacity, 0),
    totalRevenue: mockLocations.reduce((sum, l) => sum + l.monthly_revenue, 0),
    avgRating: mockLocations.reduce((sum, l) => sum + l.rating, 0) / mockLocations.length
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Locations & Resources</h1>
            <p className="text-muted-foreground">
              Manage studio locations, rooms, and equipment
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Bulk Actions
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>
        </div>

        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Locations</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-green-600">{stats.active} active</p>
                  </div>
                  <Building className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Capacity</p>
                    <p className="text-2xl font-bold">{stats.totalCapacity}</p>
                    <p className="text-xs text-blue-600">people</p>
                  </div>
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                    <p className="text-xs text-green-600">+8% this month</p>
                  </div>
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                    <p className="text-2xl font-bold flex items-center">
                      <Star className="w-6 h-6 text-yellow-500 fill-current mr-1" />
                      {stats.avgRating.toFixed(1)}
                    </p>
                    <p className="text-xs text-yellow-600">Excellent</p>
                  </div>
                  <Star className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Utilization</p>
                    <p className="text-2xl font-bold">78%</p>
                    <p className="text-xs text-blue-600">This month</p>
                  </div>
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search locations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {types.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-3">
                  {selectedLocations.length > 0 && (
                    <Badge variant="outline">
                      {selectedLocations.length} selected
                    </Badge>
                  )}
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="capacity">Capacity</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map(location => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>

          {filteredLocations.length === 0 && (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No locations found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="equipment">
          <EquipmentManagement />
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Maintenance Management</h3>
                <p className="text-sm text-muted-foreground">
                  Track and schedule maintenance for all locations and equipment
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Location Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Analytics Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed analytics for location utilization, revenue, and performance
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showCreateDialog && (
        <CreateLocationDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSave={(locationData) => {
            console.log('Creating location:', locationData);
            setShowCreateDialog(false);
          }}
        />
      )}

      {showLocationDetail && selectedLocation && (
        <LocationDetailDialog
          location={selectedLocation}
          onClose={() => setShowLocationDetail(false)}
          onEdit={() => {
            console.log('Edit location:', selectedLocation.id);
          }}
        />
      )}
    </div>
  );
}