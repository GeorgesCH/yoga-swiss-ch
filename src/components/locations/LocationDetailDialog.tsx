import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { 
  MapPin, Building, Users, Star, Calendar, Clock, Phone, Mail,
  Edit2, Trash2, Settings, Wifi, Car, AirVent, Volume2, Home,
  ShowerHead, CheckCircle, XCircle, Sun, AlertCircle, TrendingUp,
  BarChart3, DollarSign, Activity
} from 'lucide-react';

interface LocationDetailDialogProps {
  location: any;
  onClose: () => void;
  onEdit: () => void;
}

export function LocationDetailDialog({ location, onClose, onEdit }: LocationDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Inactive':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      case 'Seasonal':
        return <Sun className="w-5 h-5 text-yellow-600" />;
      case 'Maintenance':
        return <Settings className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const statusColors = {
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-gray-100 text-gray-800',
    'Seasonal': 'bg-yellow-100 text-yellow-800',
    'Maintenance': 'bg-orange-100 text-orange-800'
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
    'Reception': Building,
    'Café': Building,
    'Spa': Building,
    'Shop': Building
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DialogTitle className="text-2xl">{location.name}</DialogTitle>
              {getStatusIcon(location.status)}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Type</div>
                    <Badge className={typeColors[location.type] || 'bg-gray-100'}>
                      {location.type}
                    </Badge>
                  </div>
                  <Building className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge className={statusColors[location.status] || 'bg-gray-100'}>
                      {location.status}
                    </Badge>
                  </div>
                  {getStatusIcon(location.status)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{location.rating}</span>
                    </div>
                  </div>
                  <Star className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Capacity</div>
                    <div className="font-medium">{location.capacity} people</div>
                  </div>
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Location Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Address</div>
                        <div className="text-sm text-muted-foreground">{location.address}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Building className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Size</div>
                        <div className="text-sm text-muted-foreground">{location.size_sqm} m²</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Operating Hours</div>
                        <div className="text-sm text-muted-foreground">{location.operating_hours}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <DollarSign className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Hourly Rate</div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(location.hourly_rate)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact & Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Users className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Manager</div>
                        <div className="text-sm text-muted-foreground">{location.manager}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Phone</div>
                        <div className="text-sm text-muted-foreground">{location.phone}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-sm text-muted-foreground">{location.email}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{location.description}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {location.amenities.map((amenity: string) => {
                        const IconComponent = amenityIcons[amenity] || Building;
                        return (
                          <div key={amenity} className="flex items-center px-3 py-1 bg-gray-100 rounded-md text-sm">
                            <IconComponent className="w-3 h-3 mr-2" />
                            {amenity}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Equipment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {location.equipment.map((equipment: string) => (
                        <Badge key={equipment} variant="outline" className="text-xs">
                          {equipment}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Facility Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Parking Spots</span>
                      <span>{location.parking_spots}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Changing Rooms</span>
                      <span>{location.changing_rooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Showers</span>
                      <span>{location.showers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Storage Space</span>
                      <span>{location.storage_space}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Flooring</span>
                      <span>{location.flooring}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ceiling Height</span>
                      <span>{location.ceiling_height}m</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Natural Light</span>
                      <span>{location.natural_light ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Accessibility</span>
                      <span>{location.accessibility ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Temperature Control</span>
                      <span>{location.temperature_control}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sound System</span>
                      <span>{location.sound_system}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                        <p className="text-2xl font-bold">{location.total_classes}</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          All time
                        </p>
                      </div>
                      <Calendar className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                        <p className="text-2xl font-bold">{formatCurrency(location.monthly_revenue)}</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +12% from last month
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Utilization</p>
                        <p className="text-2xl font-bold">78%</p>
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                          <Activity className="w-3 h-3 mr-1" />
                          This month
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Detailed Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      View comprehensive analytics including booking patterns, peak hours, and revenue trends
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Location Schedule</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage class schedules, bookings, and availability for this location
                    </p>
                    <Button>
                      <Calendar className="w-4 h-4 mr-2" />
                      View Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Maintenance Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Maintenance</span>
                      <span>{new Date(location.last_maintenance).toLocaleDateString('de-CH')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Maintenance</span>
                      <span className="text-orange-600">{new Date(location.next_maintenance).toLocaleDateString('de-CH')}</span>
                    </div>
                    <Separator />
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Schedule Maintenance
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Maintenance History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <Settings className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No recent maintenance records
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}