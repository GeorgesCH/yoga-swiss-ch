import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Calendar } from '../ui/calendar';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { 
  Calendar as CalendarIcon, Clock, MapPin, Users, Plus, Edit, 
  Trash2, Copy, RefreshCw, AlertCircle, CheckCircle, X,
  Filter, Search, Download, Upload, Settings, Target,
  TrendingUp, DollarSign, Star, ChevronLeft, ChevronRight,
  Zap, Award, BookOpen, Heart, Bell, MessageSquare
} from 'lucide-react';

interface InstructorSchedulingManagementProps {
  instructor: any;
  onClose: () => void;
}

export function InstructorSchedulingManagement({ 
  instructor, 
  onClose 
}: InstructorSchedulingManagementProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  // Mock schedule data
  const weeklySchedule = [
    {
      id: '1',
      day: 'Monday',
      date: '2024-02-19',
      timeSlots: [
        {
          id: 'slot-1',
          time: '07:00',
          duration: 60,
          className: 'Morning Flow',
          location: 'Studio A',
          maxCapacity: 20,
          currentBookings: 15,
          revenue: 450,
          status: 'confirmed',
          isRecurring: true
        },
        {
          id: 'slot-2',
          time: '18:30',
          duration: 75,
          className: 'Vinyasa Flow',
          location: 'Studio B',
          maxCapacity: 25,
          currentBookings: 23,
          revenue: 690,
          status: 'confirmed',
          isRecurring: true
        }
      ]
    },
    {
      id: '2',
      day: 'Tuesday',
      date: '2024-02-20',
      timeSlots: [
        {
          id: 'slot-3',
          time: '12:00',
          duration: 60,
          className: 'Lunch Flow',
          location: 'Studio A',
          maxCapacity: 15,
          currentBookings: 8,
          revenue: 240,
          status: 'confirmed',
          isRecurring: false
        },
        {
          id: 'slot-4',
          time: '19:00',
          duration: 90,
          className: 'Yin & Meditation',
          location: 'Studio C',
          maxCapacity: 20,
          currentBookings: 18,
          revenue: 540,
          status: 'confirmed',
          isRecurring: true
        }
      ]
    },
    {
      id: '3',
      day: 'Wednesday',
      date: '2024-02-21',
      timeSlots: [
        {
          id: 'slot-5',
          time: '18:30',
          duration: 75,
          className: 'Power Yoga',
          location: 'Studio A',
          maxCapacity: 20,
          currentBookings: 12,
          revenue: 360,
          status: 'pending',
          isRecurring: true
        }
      ]
    },
    {
      id: '4',
      day: 'Thursday',
      date: '2024-02-22',
      timeSlots: [
        {
          id: 'slot-6',
          time: '07:00',
          duration: 60,
          className: 'Morning Meditation',
          location: 'Online',
          maxCapacity: 30,
          currentBookings: 25,
          revenue: 500,
          status: 'confirmed',
          isRecurring: true
        },
        {
          id: 'slot-7',
          time: '19:30',
          duration: 60,
          className: 'Hot Yoga',
          location: 'Studio B',
          maxCapacity: 15,
          currentBookings: 14,
          revenue: 420,
          status: 'confirmed',
          isRecurring: false
        }
      ]
    },
    {
      id: '5',
      day: 'Friday',
      date: '2024-02-23',
      timeSlots: [
        {
          id: 'slot-8',
          time: '18:00',
          duration: 90,
          className: 'Friday Flow & Relax',
          location: 'Studio A',
          maxCapacity: 25,
          currentBookings: 22,
          revenue: 660,
          status: 'confirmed',
          isRecurring: true
        }
      ]
    },
    {
      id: '6',
      day: 'Saturday',
      date: '2024-02-24',
      timeSlots: [
        {
          id: 'slot-9',
          time: '09:00',
          duration: 75,
          className: 'Weekend Warrior',
          location: 'Studio B',
          maxCapacity: 20,
          currentBookings: 16,
          revenue: 480,
          status: 'confirmed',
          isRecurring: true
        },
        {
          id: 'slot-10',
          time: '15:00',
          duration: 60,
          className: 'Gentle Hatha',
          location: 'Studio C',
          maxCapacity: 15,
          currentBookings: 0,
          revenue: 0,
          status: 'cancelled',
          isRecurring: false
        }
      ]
    },
    {
      id: '7',
      day: 'Sunday',
      date: '2024-02-25',
      timeSlots: [
        {
          id: 'slot-11',
          time: '10:00',
          duration: 90,
          className: 'Sunday Reset',
          location: 'Studio A',
          maxCapacity: 20,
          currentBookings: 18,
          revenue: 540,
          status: 'confirmed',
          isRecurring: true
        }
      ]
    }
  ];

  // Availability template
  const defaultAvailability = {
    monday: { available: true, timeSlots: [{ start: '07:00', end: '20:00' }] },
    tuesday: { available: true, timeSlots: [{ start: '12:00', end: '21:00' }] },
    wednesday: { available: true, timeSlots: [{ start: '07:00', end: '20:00' }] },
    thursday: { available: true, timeSlots: [{ start: '07:00', end: '21:00' }] },
    friday: { available: true, timeSlots: [{ start: '17:00', end: '21:00' }] },
    saturday: { available: true, timeSlots: [{ start: '08:00', end: '17:00' }] },
    sunday: { available: true, timeSlots: [{ start: '09:00', end: '15:00' }] }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled': return <X className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const weeklyStats = {
    totalClasses: weeklySchedule.reduce((sum, day) => sum + day.timeSlots.length, 0),
    totalRevenue: weeklySchedule.reduce((sum, day) => 
      sum + day.timeSlots.reduce((daySum, slot) => daySum + slot.revenue, 0), 0
    ),
    totalBookings: weeklySchedule.reduce((sum, day) => 
      sum + day.timeSlots.reduce((daySum, slot) => daySum + slot.currentBookings, 0), 0
    ),
    averageUtilization: weeklySchedule.reduce((sum, day) => 
      sum + day.timeSlots.reduce((daySum, slot) => 
        daySum + (slot.currentBookings / slot.maxCapacity) * 100, 0
      ) / Math.max(day.timeSlots.length, 1), 0
    ) / weeklySchedule.length
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const formatWeekRange = () => {
    const start = new Date(currentWeek);
    const end = new Date(currentWeek);
    end.setDate(end.getDate() + 6);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={instructor.avatar} />
                <AvatarFallback className="bg-primary/10">
                  {instructor.firstName.charAt(0)}{instructor.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <DialogTitle>Schedule Management</DialogTitle>
                <p className="text-muted-foreground">
                  {instructor.firstName} {instructor.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Availability
              </Button>
              <Button size="sm" onClick={() => setShowCreateClass(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            {/* Weekly Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">Weekly Classes</p>
                      <p>{weeklyStats.totalClasses}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p>{formatCurrency(weeklyStats.totalRevenue)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">Bookings</p>
                      <p>{weeklyStats.totalBookings}</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">Utilization</p>
                      <p>{weeklyStats.averageUtilization.toFixed(0)}%</p>
                    </div>
                    <Target className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Week
              </Button>
              
              <h3>{formatWeekRange()}</h3>
              
              <Button 
                variant="outline" 
                onClick={() => navigateWeek('next')}
              >
                Next Week
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Weekly Schedule Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {weeklySchedule.map((day) => (
                <Card key={day.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-center">
                      <div>{day.day}</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {day.timeSlots.map((slot) => (
                      <div 
                        key={slot.id} 
                        className="p-3 border rounded-lg hover:shadow-sm cursor-pointer transition-shadow"
                        onClick={() => setSelectedTimeSlot(slot)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-medium">{slot.time}</span>
                            </div>
                            {getStatusIcon(slot.status)}
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm">{slot.className}</h4>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{slot.location}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {slot.currentBookings}/{slot.maxCapacity}
                              </span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(slot.revenue)}
                              </span>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-blue-600 h-1 rounded-full"
                                style={{ 
                                  width: `${(slot.currentBookings / slot.maxCapacity) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge className={getStatusColor(slot.status)}>
                              {slot.status}
                            </Badge>
                            {slot.isRecurring && (
                              <RefreshCw className="h-3 w-3 text-blue-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {day.timeSlots.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No classes scheduled</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setShowCreateClass(true)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Class
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Weekly Availability Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(defaultAvailability).map(([day, settings]) => (
                    <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Switch 
                          checked={settings.available}
                          className="data-[state=checked]:bg-green-600"
                        />
                        <span className="font-medium capitalize">{day}</span>
                      </div>
                      
                      {settings.available && (
                        <div className="flex items-center space-x-2">
                          {settings.timeSlots.map((slot, index) => (
                            <Badge key={index} variant="outline">
                              {slot.start} - {slot.end}
                            </Badge>
                          ))}
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span>Average Class Rating</span>
                      </div>
                      <span className="font-medium">{instructor.rating}/5.0</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span>Student Retention</span>
                      </div>
                      <span className="font-medium">{instructor.student_retention}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Target className="h-5 w-5 text-green-600" />
                        <span>Class Utilization</span>
                      </div>
                      <span className="font-medium">{weeklyStats.averageUtilization.toFixed(0)}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <span>Monthly Growth</span>
                      </div>
                      <span className="font-medium text-green-600">+12%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>This Week</span>
                      <span className="font-medium">{formatCurrency(weeklyStats.totalRevenue)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Average per Class</span>
                      <span className="font-medium">
                        {formatCurrency(weeklyStats.totalRevenue / weeklyStats.totalClasses)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Monthly Target</span>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(3000)}</div>
                        <div className="text-sm text-muted-foreground">96% achieved</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Copy className="h-5 w-5 mr-2" />
                  Class Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Copy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Class Templates</h3>
                  <p className="text-muted-foreground">
                    Create and manage reusable class templates for quick scheduling
                  </p>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Class Dialog */}
        {showCreateClass && (
          <Dialog open={showCreateClass} onOpenChange={setShowCreateClass}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Class Name</Label>
                    <Input placeholder="e.g., Vinyasa Flow" />
                  </div>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="75">75 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input type="time" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Location</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="studio-a">Studio A</SelectItem>
                        <SelectItem value="studio-b">Studio B</SelectItem>
                        <SelectItem value="studio-c">Studio C</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Max Capacity</Label>
                    <Input type="number" placeholder="20" />
                  </div>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Class description..." rows={3} />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch />
                  <Label>Make this a recurring class</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateClass(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowCreateClass(false)}>
                    Create Class
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}