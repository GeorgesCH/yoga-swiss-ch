import { useState } from 'react';
import { Calendar, Clock, Users, MapPin, Plus, Edit, ChevronLeft, ChevronRight, MoreHorizontal, DollarSign, AlertTriangle, CheckCircle, Star, Phone, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useLanguage } from './LanguageProvider';

interface Instructor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  specialties: string[];
  languages: string[];
  experience_years: number;
  rating: number;
  total_classes: number;
  hourly_rate: number;
  preferred_payment: 'per_class' | 'per_hour' | 'per_attendee' | 'revenue_percent';
  availability: {
    [key: string]: { start: string; end: string; }[];
  };
  certifications: Array<{
    name: string;
    organization: string;
    year: number;
    expires?: number;
  }>;
}

interface ClassAssignment {
  id: string;
  template_name: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  location: string;
  room?: string;
  is_online: boolean;
  capacity: number;
  booked: number;
  waitlist: number;
  status: 'scheduled' | 'cancelled' | 'completed';
  price_chf: number;
  instructor_payment: number;
  category: string;
  level: string;
  language: 'de' | 'fr' | 'it' | 'en';
}

interface InstructorScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: Instructor | null;
  assignments: ClassAssignment[];
  onAssignClass: (instructorId: string) => void;
  onEditAssignment: (assignmentId: string) => void;
  onRemoveAssignment: (assignmentId: string) => void;
}

export function InstructorScheduleDialog({
  isOpen,
  onClose,
  instructor,
  assignments = [],
  onAssignClass,
  onEditAssignment,
  onRemoveAssignment
}: InstructorScheduleDialogProps) {
  const { t } = useLanguage();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [activeTab, setActiveTab] = useState('schedule');

  if (!instructor) return null;

  const getWeekDates = () => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1); // Start on Monday
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const getLanguageFlag = (lang: string) => {
    const flags = { de: '🇩🇪', fr: '🇫🇷', it: '🇮🇹', en: '🇬🇧' };
    return flags[lang as keyof typeof flags] || '🇩🇪';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Scheduled</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const weekDates = getWeekDates();
  const weekAssignments = assignments.filter(assignment => {
    const assignmentDate = new Date(assignment.date);
    return weekDates.some(date => 
      date.toDateString() === assignmentDate.toDateString()
    );
  });

  const upcomingAssignments = assignments
    .filter(assignment => new Date(assignment.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  const thisWeekStats = {
    classes: weekAssignments.length,
    hours: weekAssignments.reduce((sum, assignment) => sum + assignment.duration_minutes, 0) / 60,
    earnings: weekAssignments.reduce((sum, assignment) => sum + assignment.instructor_payment, 0),
    participants: weekAssignments.reduce((sum, assignment) => sum + assignment.booked, 0)
  };

  const monthlyStats = {
    classes: assignments.filter(a => {
      const assignmentDate = new Date(a.date);
      const now = new Date();
      return assignmentDate.getMonth() === now.getMonth() && 
             assignmentDate.getFullYear() === now.getFullYear();
    }).length,
    earnings: assignments
      .filter(a => {
        const assignmentDate = new Date(a.date);
        const now = new Date();
        return assignmentDate.getMonth() === now.getMonth() && 
               assignmentDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, assignment) => sum + assignment.instructor_payment, 0)
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={instructor.avatar} />
                <AvatarFallback className="text-lg">
                  {instructor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{instructor.name}</DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {instructor.email}
                  </div>
                  {instructor.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {instructor.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {instructor.rating.toFixed(1)} rating
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={() => onAssignClass(instructor.id)}>
              <Plus className="h-4 w-4 mr-2" />
              Assign Class
            </Button>
          </div>
        </DialogHeader>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-semibold">{thisWeekStats.classes}</div>
              <div className="text-sm text-muted-foreground">Classes This Week</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-semibold">{thisWeekStats.hours.toFixed(1)}h</div>
              <div className="text-sm text-muted-foreground">Hours This Week</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-semibold">CHF {thisWeekStats.earnings}</div>
              <div className="text-sm text-muted-foreground">Earnings This Week</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-semibold">{monthlyStats.classes}</div>
              <div className="text-sm text-muted-foreground">Classes This Month</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Classes</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            {/* Week Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold min-w-[200px] text-center">
                  {weekDates[0].toLocaleDateString('en-CH', { day: '2-digit', month: 'short' })} - {weekDates[6].toLocaleDateString('en-CH', { day: '2-digit', month: 'short' })}
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentWeek(new Date())}>
                This Week
              </Button>
            </div>

            {/* Week Schedule Grid */}
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-8 border-b">
                  <div className="p-4 border-r bg-muted/30">
                    <span className="text-sm font-medium">Time</span>
                  </div>
                  {weekDates.map((date, index) => (
                    <div key={index} className="p-4 border-r last:border-r-0 text-center bg-muted/30">
                      <div className="font-medium">{date.toLocaleDateString('en-CH', { weekday: 'short' })}</div>
                      <div className="text-sm text-muted-foreground">{date.getDate()}</div>
                    </div>
                  ))}
                </div>

                <div className="relative">
                  {Array.from({ length: 17 }, (_, i) => i + 6).map(hour => (
                    <div key={hour} className="grid grid-cols-8 border-b last:border-b-0 min-h-[60px]">
                      <div className="p-2 border-r bg-muted/10 flex items-center">
                        <span className="text-sm text-muted-foreground">
                          {hour.toString().padStart(2, '0')}:00
                        </span>
                      </div>
                      {weekDates.map((date, dayIndex) => {
                        const dayAssignments = weekAssignments.filter(assignment => {
                          const assignmentDate = new Date(assignment.date);
                          const assignmentHour = parseInt(assignment.start_time.split(':')[0]);
                          return assignmentDate.toDateString() === date.toDateString() && 
                                 assignmentHour === hour;
                        });

                        return (
                          <div key={dayIndex} className="border-r last:border-r-0 p-1 relative">
                            {dayAssignments.map(assignment => (
                              <div
                                key={assignment.id}
                                className="absolute inset-1 bg-primary/10 border border-primary/20 rounded p-2 cursor-pointer hover:bg-primary/20 transition-colors group"
                                style={{ zIndex: 10 }}
                              >
                                <div className="text-xs font-medium truncate">
                                  {assignment.template_name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {assignment.start_time} - {assignment.end_time}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Users className="h-3 w-3" />
                                  <span className="text-xs">{assignment.booked}/{assignment.capacity}</span>
                                  {assignment.is_online && <Badge className="text-xs px-1">Online</Badge>}
                                </div>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreHorizontal className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => onEditAssignment(assignment.id)}>
                                        <Edit className="h-3 w-3 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => onRemoveAssignment(assignment.id)}>
                                        Remove Assignment
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Upcoming Classes</h3>
              <Badge variant="outline">{upcomingAssignments.length} scheduled</Badge>
            </div>

            {upcomingAssignments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingAssignments.map(assignment => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{assignment.template_name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {assignment.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {assignment.level}
                            </Badge>
                            <span>{getLanguageFlag(assignment.language)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {new Date(assignment.date).toLocaleDateString('en-CH')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {assignment.start_time} - {assignment.end_time}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {assignment.is_online ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              Online
                            </Badge>
                          ) : (
                            <div>
                              <div>{assignment.location}</div>
                              {assignment.room && (
                                <div className="text-muted-foreground">{assignment.room}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{assignment.booked}/{assignment.capacity}</div>
                          {assignment.waitlist > 0 && (
                            <div className="text-orange-600">+{assignment.waitlist} waitlist</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">CHF {assignment.instructor_payment}</div>
                          <div className="text-muted-foreground">
                            {instructor.preferred_payment.replace('_', ' ')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(assignment.status)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onEditAssignment(assignment.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Assignment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onRemoveAssignment(assignment.id)}>
                              Remove Assignment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Upcoming Classes</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    This instructor has no upcoming class assignments.
                  </p>
                  <Button onClick={() => onAssignClass(instructor.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Assign First Class
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Instructor Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Experience:</span>
                      <div className="font-medium">{instructor.experience_years} years</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Classes:</span>
                      <div className="font-medium">{instructor.total_classes}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rating:</span>
                      <div className="font-medium flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {instructor.rating.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hourly Rate:</span>
                      <div className="font-medium">CHF {instructor.hourly_rate}</div>
                    </div>
                  </div>

                  {instructor.bio && (
                    <div>
                      <span className="text-muted-foreground text-sm">Bio:</span>
                      <p className="text-sm mt-1">{instructor.bio}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-muted-foreground text-sm">Specialties:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {instructor.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">Languages:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {instructor.languages.map((lang, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {getLanguageFlag(lang)} {lang.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {instructor.certifications.length > 0 ? (
                    <div className="space-y-3">
                      {instructor.certifications.map((cert, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="font-medium">{cert.name}</div>
                          <div className="text-sm text-muted-foreground">{cert.organization}</div>
                          <div className="text-sm text-muted-foreground">
                            Issued: {cert.year}
                            {cert.expires && (
                              <span className={cert.expires < new Date().getFullYear() ? 'text-red-600' : ''}>
                                {' • Expires: '}{cert.expires}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No certifications recorded.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Classes Taught:</span>
                    <span className="font-semibold">{monthlyStats.classes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Earnings:</span>
                    <span className="font-semibold">CHF {monthlyStats.earnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average per Class:</span>
                    <span className="font-semibold">
                      CHF {monthlyStats.classes > 0 ? (monthlyStats.earnings / monthlyStats.classes).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Class Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {instructor.specialties.map((specialty, index) => {
                      const specialtyClasses = assignments.filter(a => a.category === specialty).length;
                      const percentage = assignments.length > 0 ? (specialtyClasses / assignments.length) * 100 : 0;
                      
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{specialty}</span>
                            <span>{specialtyClasses} classes ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold">
                      {assignments.length > 0 ? Math.round((assignments.reduce((sum, a) => sum + a.booked, 0) / assignments.reduce((sum, a) => sum + a.capacity, 0)) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg. Occupancy</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold">
                      {assignments.filter(a => a.waitlist > 0).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Classes with Waitlist</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold">
                      {assignments.filter(a => a.status === 'cancelled').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Cancelled Classes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold">
                      {instructor.rating.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Student Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}