import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  MapPin, Building, Users, Wifi, Car, AirVent, Volume2, 
  Home, ShowerHead, X, Plus, Upload, Image 
} from 'lucide-react';

interface CreateLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (locationData: any) => void;
}

const locationTypes = [
  'Indoor Studio',
  'Hot Yoga Studio', 
  'Outdoor Space',
  'Wellness Center',
  'Retreat Center'
];

const amenityOptions = [
  { id: 'wifi', label: 'Wifi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'ac', label: 'Air Conditioning', icon: AirVent },
  { id: 'sound', label: 'Sound System', icon: Volume2 },
  { id: 'changing', label: 'Changing Rooms', icon: Home },
  { id: 'showers', label: 'Showers', icon: ShowerHead },
  { id: 'reception', label: 'Reception', icon: Building },
  { id: 'cafe', label: 'Café', icon: Building },
  { id: 'spa', label: 'Spa', icon: Building },
  { id: 'shop', label: 'Shop', icon: Building }
];

const equipmentOptions = [
  'Yoga Mats', 'Blocks', 'Straps', 'Bolsters', 'Blankets', 
  'Meditation Cushions', 'Towels', 'Water Stations', 'Fans',
  'Aerial Equipment', 'Sound Equipment', 'Props'
];

export function CreateLocationDialog({ isOpen, onClose, onSave }: CreateLocationDialogProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    capacity: '',
    size_sqm: '',
    description: '',
    hourly_rate: '',
    manager: '',
    phone: '',
    email: '',
    operating_hours: '',
    accessibility: false,
    parking_spots: '',
    changing_rooms: '',
    showers: '',
    storage_space: 'Medium',
    natural_light: false,
    flooring: '',
    ceiling_height: '',
    temperature_control: '',
    sound_system: 'Basic',
    amenities: [] as string[],
    equipment: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleAmenity = (amenity: string) => {
    updateFormData('amenities', 
      formData.amenities.includes(amenity)
        ? formData.amenities.filter(a => a !== amenity)
        : [...formData.amenities, amenity]
    );
  };

  const toggleEquipment = (equipment: string) => {
    updateFormData('equipment',
      formData.equipment.includes(equipment)
        ? formData.equipment.filter(e => e !== equipment)
        : [...formData.equipment, equipment]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.capacity || parseInt(formData.capacity) <= 0) newErrors.capacity = 'Valid capacity is required';
    if (!formData.hourly_rate || parseFloat(formData.hourly_rate) <= 0) newErrors.hourly_rate = 'Valid hourly rate is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        ...formData,
        capacity: parseInt(formData.capacity),
        size_sqm: parseInt(formData.size_sqm) || 0,
        hourly_rate: parseFloat(formData.hourly_rate),
        parking_spots: parseInt(formData.parking_spots) || 0,
        changing_rooms: parseInt(formData.changing_rooms) || 0,
        showers: parseInt(formData.showers) || 0,
        status: 'Active'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Create a new location for your yoga studio with all necessary details and amenities.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Location Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Main Studio Zürich"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                placeholder="Bahnhofstrasse 15, 8001 Zürich"
              />
              {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => updateFormData('capacity', e.target.value)}
                  placeholder="25"
                />
                {errors.capacity && <p className="text-sm text-destructive">{errors.capacity}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="size_sqm">Size (m²)</Label>
                <Input
                  id="size_sqm"
                  type="number"
                  value={formData.size_sqm}
                  onChange={(e) => updateFormData('size_sqm', e.target.value)}
                  placeholder="85"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate (CHF) *</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => updateFormData('hourly_rate', e.target.value)}
                  placeholder="120.00"
                />
                {errors.hourly_rate && <p className="text-sm text-destructive">{errors.hourly_rate}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Describe the location, its features, and atmosphere..."
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Input
                  id="manager"
                  value={formData.manager}
                  onChange={(e) => updateFormData('manager', e.target.value)}
                  placeholder="Sarah Chen"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="+41 44 123 4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="location@yogaswiss.ch"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operating_hours">Operating Hours</Label>
                <Input
                  id="operating_hours"
                  value={formData.operating_hours}
                  onChange={(e) => updateFormData('operating_hours', e.target.value)}
                  placeholder="06:00-22:00"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parking_spots">Parking Spots</Label>
                <Input
                  id="parking_spots"
                  type="number"
                  value={formData.parking_spots}
                  onChange={(e) => updateFormData('parking_spots', e.target.value)}
                  placeholder="8"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="changing_rooms">Changing Rooms</Label>
                <Input
                  id="changing_rooms"
                  type="number"
                  value={formData.changing_rooms}
                  onChange={(e) => updateFormData('changing_rooms', e.target.value)}
                  placeholder="2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="showers">Showers</Label>
                <Input
                  id="showers"
                  type="number"
                  value={formData.showers}
                  onChange={(e) => updateFormData('showers', e.target.value)}
                  placeholder="2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flooring">Flooring</Label>
                <Input
                  id="flooring"
                  value={formData.flooring}
                  onChange={(e) => updateFormData('flooring', e.target.value)}
                  placeholder="Bamboo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ceiling_height">Ceiling Height (m)</Label>
                <Input
                  id="ceiling_height"
                  value={formData.ceiling_height}
                  onChange={(e) => updateFormData('ceiling_height', e.target.value)}
                  placeholder="3.2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accessibility"
                  checked={formData.accessibility}
                  onCheckedChange={(checked) => updateFormData('accessibility', checked)}
                />
                <Label htmlFor="accessibility">Wheelchair Accessible</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="natural_light"
                  checked={formData.natural_light}
                  onCheckedChange={(checked) => updateFormData('natural_light', checked)}
                />
                <Label htmlFor="natural_light">Natural Light</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="amenities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {amenityOptions.map(amenity => (
                    <div key={amenity.id} 
                         className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                           formData.amenities.includes(amenity.label) 
                             ? 'border-primary bg-primary/5' 
                             : 'border-border hover:bg-muted/50'
                         }`}
                         onClick={() => toggleAmenity(amenity.label)}>
                      <amenity.icon className="w-4 h-4" />
                      <span>{amenity.label}</span>
                      {formData.amenities.includes(amenity.label) && (
                        <Badge variant="secondary" className="ml-auto">✓</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {equipmentOptions.map(equipment => (
                    <div key={equipment}
                         className={`p-2 border rounded-md cursor-pointer text-sm transition-colors ${
                           formData.equipment.includes(equipment)
                             ? 'border-primary bg-primary/5 text-primary'
                             : 'border-border hover:bg-muted/50'
                         }`}
                         onClick={() => toggleEquipment(equipment)}>
                      {equipment}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Upload Location Photos</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add photos to showcase your location (JPEG, PNG up to 10MB each)
                  </p>
                  <Button variant="outline">
                    <Image className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Create Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}