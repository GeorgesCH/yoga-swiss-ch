import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  Star, 
  MessageSquare,
  FileText,
  Upload,
  Target,
  TrendingUp,
  Award,
  Heart,
  Activity,
  User,
  MapPin,
  Globe,
  Video,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { format } from 'date-fns';

interface ProgramBooking {
  id: string;
  program_title: string;
  variant_name: string;
  instructor: {
    id: string;
    name: string;
    title: string;
    image: string;
    rating: number;
  };
  status: 'confirmed' | 'in_progress' | 'completed';
  progress: {
    sessions_completed: number;
    total_sessions: number;
    milestones_completed: number;
    total_milestones: number;
  };
  sessions: Array<{
    id: string;
    session_number: number;
    title?: string;
    starts_at: string;
    ends_at: string;
    location_type: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
    notes?: string;
    homework_assigned?: string;
  }>;
  milestones: Array<{
    id: string;
    name: string;
    description: string;
    due_at?: string;
    completed_at?: string;
    status: 'pending' | 'completed' | 'overdue';
    instructor_feedback?: string;
  }>;
  private_link_token: string;
  booked_at: string;
  next_session_at?: string;
}

export function ProgramProgressTracker() {
  const [bookings, setBookings] = useState<ProgramBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<ProgramBooking | null>(null);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserBookings();
  }, []);

  const loadUserBookings = async () => {
    try {
      setLoading(true);

      // Demo program bookings
      const demoBookings: ProgramBooking[] = [
        {
          id: 'booking-evolve-001',
          program_title: 'EVOLVE Holistic Life Coaching',
          variant_name: '8-Session Transformation',
          instructor: {
            id: 'instructor-sarah',
            name: 'Sarah Kumar',
            title: 'Certified Life Coach & Wellness Expert',
            image: '/api/placeholder/150/150',
            rating: 4.9
          },
          status: 'in_progress',
          progress: {
            sessions_completed: 3,
            total_sessions: 8,
            milestones_completed: 2,
            total_milestones: 4
          },
          sessions: [
            {
              id: 'session-1',
              session_number: 1,
              title: 'Initial Assessment & Goal Setting',
              starts_at: '2024-02-01T09:00:00Z',
              ends_at: '2024-02-01T10:30:00Z',
              location_type: 'studio',
              status: 'completed',
              notes: 'Great first session! Clear goals identified and action plan created.',
              homework_assigned: 'Complete life wheel assessment and reflect on values exercise.'
            },
            {
              id: 'session-2',
              session_number: 2,
              title: 'Mindset & Belief Exploration',
              starts_at: '2024-02-08T09:00:00Z',
              ends_at: '2024-02-08T10:30:00Z',
              location_type: 'studio',
              status: 'completed',
              notes: 'Explored limiting beliefs around career and self-confidence. Major breakthroughs!',
              homework_assigned: 'Daily mindfulness practice and journal challenging thoughts.'
            },
            {
              id: 'session-3',
              session_number: 3,
              title: 'Building New Thought Patterns',
              starts_at: '2024-02-15T09:00:00Z',
              ends_at: '2024-02-15T10:30:00Z',
              location_type: 'online',
              status: 'completed',
              notes: 'Excellent progress on mindset work. Implementing new thought patterns consistently.',
              homework_assigned: 'Practice positive affirmations and continue thought monitoring.'
            },
            {
              id: 'session-4',
              session_number: 4,
              title: 'Midpoint Review & Adjustment',
              starts_at: '2024-02-22T09:00:00Z',
              ends_at: '2024-02-22T10:30:00Z',
              location_type: 'studio',
              status: 'scheduled'
            },
            {
              id: 'session-5',
              session_number: 5,
              title: 'Action Planning & Implementation',
              starts_at: '2024-03-01T09:00:00Z',
              ends_at: '2024-03-01T10:30:00Z',
              location_type: 'studio',
              status: 'scheduled'
            }
          ],
          milestones: [
            {
              id: 'milestone-1',
              name: 'Life Assessment Completion',
              description: 'Complete comprehensive life wheel assessment',
              completed_at: '2024-02-03T10:00:00Z',
              status: 'completed',
              instructor_feedback: 'Excellent self-awareness shown in assessment. Very thorough responses.'
            },
            {
              id: 'milestone-2',
              name: 'Goal Setting Workshop',
              description: 'Define SMART goals for the program',
              completed_at: '2024-02-10T15:30:00Z',
              status: 'completed',
              instructor_feedback: 'Goals are well-defined and achievable. Great clarity on priorities.'
            },
            {
              id: 'milestone-3',
              name: 'Midpoint Review',
              description: 'Progress assessment and program adjustment',
              due_at: '2024-02-22T23:59:59Z',
              status: 'pending'
            },
            {
              id: 'milestone-4',
              name: 'Program Completion & Planning',
              description: 'Final assessment and long-term planning',
              due_at: '2024-03-15T23:59:59Z',
              status: 'pending'
            }
          ],
          private_link_token: 'abc123xyz789',
          booked_at: '2024-01-20T14:30:00Z',
          next_session_at: '2024-02-22T09:00:00Z'
        },
        {
          id: 'booking-split-002',
          program_title: 'SPLIT Grand Écart Training',
          variant_name: 'Intermediate 12-Week Program',
          instructor: {
            id: 'instructor-elena',
            name: 'Elena Varga',
            title: 'Movement & Flexibility Specialist',
            image: '/api/placeholder/150/150',
            rating: 4.8
          },
          status: 'confirmed',
          progress: {
            sessions_completed: 0,
            total_sessions: 12,
            milestones_completed: 0,
            total_milestones: 3
          },
          sessions: [
            {
              id: 'session-split-1',
              session_number: 1,
              title: 'Initial Flexibility Assessment',
              starts_at: '2024-02-25T16:00:00Z',
              ends_at: '2024-02-25T17:15:00Z',
              location_type: 'studio',
              status: 'scheduled'
            }
          ],
          milestones: [
            {
              id: 'milestone-split-1',
              name: 'Baseline Assessment',
              description: 'Document current flexibility range and limitations',
              due_at: '2024-02-28T23:59:59Z',
              status: 'pending'
            }
          ],
          private_link_token: 'def456uvw012',
          booked_at: '2024-02-10T11:15:00Z',
          next_session_at: '2024-02-25T16:00:00Z'
        }
      ];

      setBookings(demoBookings);
      if (demoBookings.length > 0) {
        setSelectedBooking(demoBookings[0]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { variant: 'secondary' as const, text: 'Confirmed', color: 'text-blue-600 bg-blue-100' },
      in_progress: { variant: 'default' as const, text: 'In Progress', color: 'text-green-600 bg-green-100' },
      completed: { variant: 'outline' as const, text: 'Completed', color: 'text-gray-600 bg-gray-100' }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.confirmed;
  };

  const getSessionStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'scheduled': return <Circle className="h-4 w-4 text-blue-600" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'no_show': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getMilestoneStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', { 
      style: 'currency', 
      currency: 'CHF' 
    }).format(amount);
  };

  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? (completed / total) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your programs...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold mb-2">No Active Programs</h3>
        <p className="text-muted-foreground mb-6">You don't have any active program bookings yet.</p>
        <Button>Browse Programs</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">My Programs</h2>
        <p className="text-muted-foreground">
          Track your progress and manage your individual program sessions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Program List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Programs</h3>
          {bookings.map((booking) => {
            const statusBadge = getStatusBadge(booking.status);
            const sessionProgress = calculateProgress(booking.progress.sessions_completed, booking.progress.total_sessions);
            const milestoneProgress = calculateProgress(booking.progress.milestones_completed, booking.progress.total_milestones);

            return (
              <Card 
                key={booking.id} 
                className={`cursor-pointer transition-all ${
                  selectedBooking?.id === booking.id ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-300'
                }`}
                onClick={() => setSelectedBooking(booking)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{booking.program_title}</h4>
                        <p className="text-xs text-muted-foreground">{booking.variant_name}</p>
                      </div>
                      <Badge className={statusBadge.color} variant="outline">
                        {statusBadge.text}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={booking.instructor.image} />
                        <AvatarFallback className="text-xs">
                          {booking.instructor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{booking.instructor.name}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Sessions</span>
                        <span>{booking.progress.sessions_completed}/{booking.progress.total_sessions}</span>
                      </div>
                      <Progress value={sessionProgress} className="h-1" />
                    </div>

                    {booking.next_session_at && (
                      <div className="text-xs text-muted-foreground">
                        Next: {format(new Date(booking.next_session_at), 'MMM d, HH:mm')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Program Details */}
        {selectedBooking && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedBooking.program_title}</CardTitle>
                    <CardDescription>{selectedBooking.variant_name}</CardDescription>
                  </div>
                  <Badge className={getStatusBadge(selectedBooking.status).color} variant="outline">
                    {getStatusBadge(selectedBooking.status).text}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="progress" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                    <TabsTrigger value="sessions">Sessions</TabsTrigger>
                    <TabsTrigger value="milestones">Milestones</TabsTrigger>
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                  </TabsList>

                  <TabsContent value="progress" className="space-y-6">
                    {/* Instructor Info */}
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <Avatar>
                        <AvatarImage src={selectedBooking.instructor.image} />
                        <AvatarFallback>
                          {selectedBooking.instructor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold">{selectedBooking.instructor.name}</div>
                        <div className="text-sm text-muted-foreground">{selectedBooking.instructor.title}</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{selectedBooking.instructor.rating}</span>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>

                    {/* Progress Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Session Progress
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Completed Sessions</span>
                              <span className="font-semibold">
                                {selectedBooking.progress.sessions_completed}/{selectedBooking.progress.total_sessions}
                              </span>
                            </div>
                            <Progress value={calculateProgress(
                              selectedBooking.progress.sessions_completed, 
                              selectedBooking.progress.total_sessions
                            )} />
                            <div className="text-xs text-muted-foreground">
                              {Math.round(calculateProgress(
                                selectedBooking.progress.sessions_completed, 
                                selectedBooking.progress.total_sessions
                              ))}% complete
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Milestone Progress
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Completed Milestones</span>
                              <span className="font-semibold">
                                {selectedBooking.progress.milestones_completed}/{selectedBooking.progress.total_milestones}
                              </span>
                            </div>
                            <Progress value={calculateProgress(
                              selectedBooking.progress.milestones_completed, 
                              selectedBooking.progress.total_milestones
                            )} />
                            <div className="text-xs text-muted-foreground">
                              {Math.round(calculateProgress(
                                selectedBooking.progress.milestones_completed, 
                                selectedBooking.progress.total_milestones
                              ))}% complete
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Next Session */}
                    {selectedBooking.next_session_at && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Next Session
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {format(new Date(selectedBooking.next_session_at), 'EEEE, MMMM d, yyyy')}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(selectedBooking.next_session_at), 'HH:mm')} - 90 minutes
                              </div>
                            </div>
                            <div className="text-right">
                              <Button size="sm">
                                <Calendar className="h-4 w-4 mr-1" />
                                Add to Calendar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="sessions" className="space-y-4">
                    {selectedBooking.sessions.map((session, index) => (
                      <Card 
                        key={session.id} 
                        className={`cursor-pointer transition-all ${
                          session.status === 'completed' ? 'bg-green-50 border-green-200' : ''
                        }`}
                        onClick={() => {
                          setSelectedSession(session);
                          setShowSessionDialog(true);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                                {session.session_number}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {session.title || `Session ${session.session_number}`}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(session.starts_at), 'MMM d, yyyy • HH:mm')}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {session.location_type === 'online' ? (
                                      <>
                                        <Globe className="h-3 w-3 mr-1" />
                                        Online
                                      </>
                                    ) : (
                                      <>
                                        <MapPin className="h-3 w-3 mr-1" />
                                        In-Person
                                      </>
                                    )}
                                  </Badge>
                                  {session.homework_assigned && (
                                    <Badge variant="outline" className="text-xs">
                                      <FileText className="h-3 w-3 mr-1" />
                                      Homework
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getSessionStatusIcon(session.status)}
                              <span className="text-sm capitalize">{session.status.replace('_', ' ')}</span>
                            </div>
                          </div>
                          {session.notes && (
                            <div className="mt-3 p-3 bg-muted rounded text-sm">
                              <div className="font-medium mb-1">Session Notes:</div>
                              <p>{session.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="milestones" className="space-y-4">
                    {selectedBooking.milestones.map((milestone) => (
                      <Card 
                        key={milestone.id}
                        className={`cursor-pointer transition-all ${
                          milestone.status === 'completed' ? 'bg-green-50 border-green-200' : 
                          milestone.status === 'overdue' ? 'bg-red-50 border-red-200' : ''
                        }`}
                        onClick={() => {
                          setSelectedMilestone(milestone);
                          setShowMilestoneDialog(true);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {getMilestoneStatusIcon(milestone.status)}
                              <div className="flex-1">
                                <div className="font-medium">{milestone.name}</div>
                                <div className="text-sm text-muted-foreground">{milestone.description}</div>
                                {milestone.due_at && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Due: {format(new Date(milestone.due_at), 'MMM d, yyyy')}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                milestone.status === 'completed' ? 'text-green-600 bg-green-100' :
                                milestone.status === 'overdue' ? 'text-red-600 bg-red-100' :
                                'text-blue-600 bg-blue-100'
                              }`}
                            >
                              {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                            </Badge>
                          </div>
                          {milestone.instructor_feedback && (
                            <div className="mt-3 p-3 bg-muted rounded text-sm">
                              <div className="font-medium mb-1">Instructor Feedback:</div>
                              <p>{milestone.instructor_feedback}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="messages" className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Message your instructor directly about your program progress, questions, or scheduling.
                      </AlertDescription>
                    </Alert>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <Textarea 
                            placeholder="Type your message to your instructor..."
                            rows={4}
                          />
                          <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm">
                              <Upload className="h-4 w-4 mr-2" />
                              Attach File
                            </Button>
                            <Button size="sm">
                              Send Message
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Previous Messages */}
                    <div className="space-y-3">
                      {[
                        {
                          id: '1',
                          sender: 'Sarah Kumar',
                          message: 'Great progress on your mindset work this week! Keep practicing those positive affirmations.',
                          timestamp: '2024-02-16T10:30:00Z',
                          isInstructor: true
                        },
                        {
                          id: '2',
                          sender: 'You',
                          message: 'Thank you! I\'m already noticing a difference in how I approach challenges at work.',
                          timestamp: '2024-02-16T14:45:00Z',
                          isInstructor: false
                        }
                      ].map((message) => (
                        <Card key={message.id} className={message.isInstructor ? 'bg-blue-50 border-blue-200' : ''}>
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {message.sender.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">{message.sender}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(message.timestamp), 'MMM d, HH:mm')}
                                  </span>
                                </div>
                                <p className="text-sm">{message.message}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Session Detail Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-2xl">
          {selectedSession && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle>
                  {selectedSession.title || `Session ${selectedSession.session_number}`}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{format(new Date(selectedSession.starts_at), 'EEEE, MMMM d, yyyy')}</span>
                  <span>{format(new Date(selectedSession.starts_at), 'HH:mm')} - {format(new Date(selectedSession.ends_at), 'HH:mm')}</span>
                  <Badge variant="outline" className="text-xs">
                    {selectedSession.location_type === 'online' ? 'Online' : 'In-Person'}
                  </Badge>
                </div>
              </DialogHeader>

              {selectedSession.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Session Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedSession.notes}</p>
                  </CardContent>
                </Card>
              )}

              {selectedSession.homework_assigned && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Homework Assignment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedSession.homework_assigned}</p>
                  </CardContent>
                </Card>
              )}

              {selectedSession.status === 'scheduled' && selectedSession.location_type === 'online' && (
                <Alert>
                  <Video className="h-4 w-4" />
                  <AlertDescription>
                    The video call link will be available 15 minutes before your session starts.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Milestone Detail Dialog */}
      <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
        <DialogContent className="max-w-2xl">
          {selectedMilestone && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getMilestoneStatusIcon(selectedMilestone.status)}
                  {selectedMilestone.name}
                </DialogTitle>
                <p className="text-muted-foreground">{selectedMilestone.description}</p>
              </DialogHeader>

              {selectedMilestone.due_at && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium">Due Date: </span>
                    {format(new Date(selectedMilestone.due_at), 'EEEE, MMMM d, yyyy')}
                  </div>
                </div>
              )}

              {selectedMilestone.instructor_feedback && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Instructor Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedMilestone.instructor_feedback}</p>
                  </CardContent>
                </Card>
              )}

              {selectedMilestone.status === 'pending' && (
                <div className="space-y-4">
                  <Label>Submit Your Work</Label>
                  <Textarea placeholder="Share your progress or submit your assignment..." />
                  <div className="flex gap-3">
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                    <Button>Submit</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}