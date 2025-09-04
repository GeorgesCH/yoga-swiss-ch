import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  MapPin, 
  Cloud, 
  CloudRain, 
  Plus, 
  Edit, 
  Trash2, 
  Camera,
  Clock,
  Users,
  Wifi,
  Car,
  Accessibility
} from 'lucide-react';

interface Location {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor' | 'virtual';
  address: string;
  capacity: number;
  isActive: boolean;
  amenities: string[];
}

interface Room {
  id: string;
  locationId: string;
  name: string;
  capacity: number;
  equipment: string[];
  spotLayout: 'grid' | 'circle' | 'rows';
}

export function LocationsSettings() {
  const [locations, setLocations] = useState<Location[]>([
    {
      id: '1',
      name: 'Hauptstandort Zürich',
      type: 'indoor',
      address: 'Bahnhofstrasse 15, 8001 Zürich',
      capacity: 120,
      isActive: true,
      amenities: ['parking', 'wifi', 'accessibility', 'showers', 'lockers']
    },
    {
      id: '2', 
      name: 'Outdoor Pavilion Seefeld',
      type: 'outdoor',
      address: 'Seefeld Park, 8008 Zürich',
      capacity: 40,
      isActive: true,
      amenities: ['parking', 'backup_location']
    },
    {
      id: '3',
      name: 'Virtual Studio',
      type: 'virtual',
      address: 'Online',
      capacity: 100,
      isActive: true,
      amenities: ['hd_streaming', 'recording']
    }
  ]);

  const [rooms, setRooms] = useState<Room[]>([
    {
      id: '1',
      locationId: '1',
      name: 'Studio A - Hauptraum',
      capacity: 50,
      equipment: ['yoga_mats', 'blocks', 'straps', 'bolsters', 'sound_system'],
      spotLayout: 'grid'
    },
    {
      id: '2',
      locationId: '1', 
      name: 'Studio B - Meditation',
      capacity: 25,
      equipment: ['meditation_cushions', 'blankets', 'singing_bowls'],
      spotLayout: 'circle'
    }
  ]);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);

  const amenityIcons = {
    parking: Car,
    wifi: Wifi,
    accessibility: Accessibility,
    showers: '🚿',
    lockers: '🔒',
    backup_location: MapPin,
    hd_streaming: '📹',
    recording: '🎥'
  };

  const amenityLabels = {
    parking: 'Parking Available',
    wifi: 'Free WiFi',
    accessibility: 'Wheelchair Accessible',
    showers: 'Shower Facilities',
    lockers: 'Lockers Available',
    backup_location: 'Backup Location',
    hd_streaming: 'HD Streaming',
    recording: 'Session Recording'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Locations & Rooms</h2>
          <p className="text-muted-foreground">
            Manage physical, outdoor, and virtual spaces
          </p>
        </div>
        <Button onClick={() => setIsLocationDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Card key={location.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                  <CardDescription className="mt-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={location.type === 'indoor' ? 'default' : location.type === 'outdoor' ? 'secondary' : 'outline'}>
                        {location.type}
                      </Badge>
                      <span className="text-sm">{location.capacity} spots</span>
                    </div>
                  </CardDescription>
                </div>
                <Switch checked={location.isActive} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 inline mr-1" />
                {location.address}
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-1">
                {location.amenities.map((amenity) => (
                  <Badge key={amenity} variant="outline" className="text-xs">
                    {amenityLabels[amenity as keyof typeof amenityLabels]}
                  </Badge>
                ))}
              </div>

              {/* Rooms count */}
              <div className="text-sm text-muted-foreground">
                {rooms.filter(r => r.locationId === location.id).length} rooms configured
              </div>

              {/* Outdoor-specific settings */}
              {location.type === 'outdoor' && (
                <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <CloudRain className="h-4 w-4 text-blue-600" />
                    <span>Weather Monitoring</span>
                    <Switch size="sm" defaultChecked />
                  </div>
                  <div className="text-xs text-blue-700">
                    Backup location: Hauptstandort Zürich
                  </div>
                </div>
              )}

              {/* Virtual-specific settings */}
              {location.type === 'virtual' && (
                <div className="space-y-2 p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <span>📹</span>
                    <span>Auto Check-in</span>
                    <Switch size="sm" defaultChecked />
                  </div>
                  <div className="text-xs text-purple-700">
                    Zoom integration active
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rooms Section */}
      <Card>
        <CardHeader>
          <CardTitle>Room Configuration</CardTitle>
          <CardDescription>Configure individual rooms and their layouts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rooms.map((room) => {
              const location = locations.find(l => l.id === room.locationId);
              return (
                <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{room.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {location?.name} • {room.capacity} spots • {room.spotLayout} layout
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {room.equipment.map((eq) => (
                        <Badge key={eq} variant="outline" className="text-xs">
                          {eq.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-1" />
                      Layout
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Opening Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Operating Hours</CardTitle>
          <CardDescription>Set default hours for all locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-24">
                  <Label>{day}</Label>
                </div>
                <Switch defaultChecked={day !== 'Sunday'} />
                <div className="flex gap-2">
                  <Input type="time" defaultValue="06:00" className="w-32" />
                  <span className="text-muted-foreground">to</span>
                  <Input type="time" defaultValue="22:00" className="w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location Dialog */}
      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Create a new location for your studio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location-name">Location Name</Label>
                <Input id="location-name" placeholder="Studio Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location-type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indoor">Indoor Studio</SelectItem>
                    <SelectItem value="outdoor">Outdoor Location</SelectItem>
                    <SelectItem value="virtual">Virtual Studio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location-address">Address</Label>
              <Textarea id="location-address" placeholder="Full address including postal code" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location-capacity">Total Capacity</Label>
                <Input id="location-capacity" type="number" placeholder="Maximum number of students" />
              </div>
              <div className="space-y-2">
                <Label>Active</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="location-active" defaultChecked />
                  <Label htmlFor="location-active" className="text-sm">
                    Location is active and bookable
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(amenityLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Switch id={`amenity-${key}`} />
                    <Label htmlFor={`amenity-${key}`} className="text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsLocationDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsLocationDialogOpen(false)}>
                Create Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}