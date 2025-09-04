import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Calendar, Clock, DollarSign, Users, Star, TrendingUp, 
  Award, CheckCircle, AlertTriangle, BarChart3, MapPin,
  Phone, Mail, Globe, CreditCard, FileText, Settings,
  Edit, Plus, Download, MessageSquare, Target, Heart,
  BookOpen, Zap, ChevronRight, Filter, Search, RefreshCw
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Input } from '../ui/input';

interface InstructorProfileManagementProps {
  instructor: any;
  onEdit: () => void;
  onSchedule: () => void;
}

export function InstructorProfileManagement({ 
  instructor, 
  onEdit, 
  onSchedule 
}: InstructorProfileManagementProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const getLanguageFlag = (lang: string) => {
    const flags = { de: '🇩🇪', fr: '🇫🇷', it: '🇮🇹', en: '🇬🇧', zh: '🇨🇳' };
    return flags[lang as keyof typeof flags] || '🌐';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock data for performance metrics
  const performanceData = {
    weeklyStats: [
      { week: 'Week 1', classes: 8, revenue: 720, rating: 4.8 },
      { week: 'Week 2', classes: 7, revenue: 630, rating: 4.9 },
      { week: 'Week 3', classes: 9, revenue: 810, rating: 4.7 },
      { week: 'Week 4', classes: 8, revenue: 720, rating: 4.8 }
    ],
    monthlyTrends: {
      classes: { current: 32, previous: 28, change: 14.3 },
      revenue: { current: 2880, previous: 2450, change: 17.6 },
      rating: { current: 4.8, previous: 4.6, change: 4.3 },
      retention: { current: 87, previous: 82, change: 6.1 }
    }
  };

  // Mock schedule data
  const upcomingClasses = [
    {
      id: '1',
      name: 'Vinyasa Flow',
      date: '2024-02-20',
      time: '18:30',
      duration: 75,
      location: 'Studio A',
      attendees: 15,
      maxCapacity: 20,
      revenue: 480
    },
    {
      id: '2',
      name: 'Yin Yoga',
      date: '2024-02-21',
      time: '19:00',
      duration: 90,
      location: 'Studio B',
      attendees: 12,
      maxCapacity: 15,
      revenue: 360
    },
    {
      id: '3',
      name: 'Meditation',
      date: '2024-02-22',
      time: '07:00',
      duration: 60,
      location: 'Online',
      attendees: 25,
      maxCapacity: 30,
      revenue: 500
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={instructor.avatar} />
            <AvatarFallback className="text-lg bg-primary/10">
              {instructor.firstName.charAt(0)}{instructor.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h1>{instructor.firstName} {instructor.lastName}</h1>
            <div className="flex items-center space-x-3 mt-1">
              <Badge className={getStatusColor(instructor.status)}>
                {instructor.status}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {instructor.employment}
              </Badge>
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span>{instructor.rating}</span>
                <span>•</span>
                <span>{instructor.total_classes} classes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onSchedule}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Monthly Revenue</p>
                <p>{formatCurrency(instructor.monthly_earnings)}</p>
                <p className="text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{performanceData.monthlyTrends.revenue.change}%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Monthly Classes</p>
                <p>{instructor.monthly_classes}</p>
                <p className="text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{performanceData.monthlyTrends.classes.change}%
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Student Retention</p>
                <p>{instructor.student_retention}%</p>
                <p className="text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{performanceData.monthlyTrends.retention.change}%
                </p>
              </div>
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Availability</p>
                <p>{instructor.availability_score}%</p>
                <p className="text-blue-600 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Excellent
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Classes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Classes
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={onSchedule}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingClasses.slice(0, 3).map((class_) => (
                  <div key={class_.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{class_.name}</h4>
                      <div className="flex items-center space-x-2 text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{class_.date}</span>
                        <Clock className="h-3 w-3" />
                        <span>{class_.time}</span>
                        <MapPin className="h-3 w-3" />
                        <span>{class_.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{class_.attendees}/{class_.maxCapacity}</span>
                      </div>
                      <div className="font-medium text-green-600">
                        {formatCurrency(class_.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Class Rating</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={instructor.rating * 20} className="w-20" />
                      <span className="font-medium">{instructor.rating}/5.0</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Student Retention</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={instructor.student_retention} className="w-20" />
                      <span className="font-medium">{instructor.student_retention}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Availability Score</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={instructor.availability_score} className="w-20" />
                      <span className="font-medium">{instructor.availability_score}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Monthly Goal</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={75} className="w-20" />
                      <span className="font-medium">75%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="font-medium text-green-600">{instructor.completed_classes}</div>
                      <div className="text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="font-medium text-red-600">{instructor.cancelled_classes}</div>
                      <div className="text-muted-foreground">Cancelled</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCw className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p>Completed Vinyasa Flow class with 18 students</p>
                    <p className="text-muted-foreground">2 hours ago</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    +{formatCurrency(540)}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p>New class "Morning Meditation" scheduled for next week</p>
                    <p className="text-muted-foreground">1 day ago</p>
                  </div>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p>Received excellent rating (5.0) from student Sarah M.</p>
                    <p className="text-muted-foreground">2 days ago</p>
                  </div>
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Next 7 days</SelectItem>
                  <SelectItem value="30d">Next 30 days</SelectItem>
                  <SelectItem value="90d">Next 90 days</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search classes..." className="pl-10 w-64" />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {upcomingClasses.map((class_) => (
              <Card key={class_.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{class_.name}</h4>
                        <p className="text-muted-foreground">{class_.date} at {class_.time}</p>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        {formatCurrency(class_.revenue)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{class_.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{class_.duration} minutes</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Attendees:</span>
                        <span>{class_.attendees}/{class_.maxCapacity}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Progress 
                        value={(class_.attendees / class_.maxCapacity) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {class_.maxCapacity - class_.attendees} spots remaining
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Users className="h-3 w-3 mr-1" />
                        Roster
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.weeklyStats.map((week, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{week.week}</div>
                        <div className="text-muted-foreground">{week.classes} classes</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(week.revenue)}</div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-muted-foreground">{week.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Revenue Goal</div>
                        <div className="text-muted-foreground">Monthly target</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        {formatCurrency(2880)} / {formatCurrency(3000)}
                      </div>
                      <div className="text-muted-foreground">96% achieved</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Class Goal</div>
                        <div className="text-muted-foreground">Monthly target</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">32 / 30 classes</div>
                      <div className="text-muted-foreground">107% achieved</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="font-medium">Performance Score</div>
                        <div className="text-muted-foreground">Overall rating</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">Excellent</div>
                      <div className="text-muted-foreground">Top 10%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span>Hourly Rate:</span>
                  <span className="font-medium">{formatCurrency(instructor.hourly_rate)}/hr</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span>Payment Method:</span>
                  <span className="font-medium">{instructor.preferred_payment.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span>Monthly Earnings:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(instructor.monthly_earnings)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span>YTD Earnings:</span>
                  <span className="font-medium">
                    {formatCurrency(instructor.monthly_earnings * 8.5)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Payments</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">January 2024</div>
                      <div className="text-muted-foreground">Monthly payment</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        {formatCurrency(2450)}
                      </div>
                      <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">December 2023</div>
                      <div className="text-muted-foreground">Monthly payment</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        {formatCurrency(2280)}
                      </div>
                      <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">February 2024</div>
                      <div className="text-muted-foreground">Pending payment</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-orange-600">
                        {formatCurrency(2880)}
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">Pending</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Student Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Student Management</h3>
                <p className="text-muted-foreground">
                  Student feedback, retention metrics, and class attendance insights will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{instructor.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{instructor.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{instructor.city}, Switzerland</span>
                </div>
                {instructor.social_media?.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{instructor.social_media.website}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specialties & Languages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {instructor.specialties.map((specialty: string) => (
                      <Badge key={specialty} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {instructor.languages.map((lang: string) => (
                      <Badge key={lang} variant="outline" className="flex items-center gap-1">
                        <span>{getLanguageFlag(lang)}</span>
                        <span>{lang.toUpperCase()}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}