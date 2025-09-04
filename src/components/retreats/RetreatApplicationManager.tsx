import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Heart, 
  AlertTriangle,
  FileText,
  CreditCard,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Plane,
  UtensilsCrossed,
  Shield,
  Flag,
  Globe,
  Activity,
  Target,
  Zap
} from 'lucide-react';

interface Application {
  id: string;
  retreat_id: string;
  retreat_title: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: 'submitted' | 'under_review' | 'approved' | 'waitlist' | 'rejected' | 'withdrawn';
  submitted_at: string;
  reviewed_at?: string;
  
  // Room & Pricing
  room_type_id: string;
  room_type_name: string;
  quoted_price: number;
  deposit_amount: number;
  balance_amount: number;
  
  // Personal Info
  date_of_birth: string;
  nationality: string;
  dietary_requirements?: string;
  medical_conditions?: string;
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Travel Info
  passport_country: string;
  passport_number_last4?: string;
  travel_insurance_confirmed: boolean;
  arrival_info?: {
    flight_number?: string;
    arrival_time?: string;
    airport?: string;
  };
  departure_info?: {
    flight_number?: string;
    departure_time?: string;
    airport?: string;
  };
  
  // Preferences
  roommate_preference?: 'any' | 'female_only' | 'male_only' | 'no_preference';
  roommate_requests?: string;
  special_requests?: string;
  
  // Yoga Experience
  yoga_experience: 'beginner' | 'intermediate' | 'advanced';
  yoga_styles: string[];
  injuries_limitations?: string;
  
  // Application Answers
  motivation?: string;
  expectations?: string;
  how_heard_about?: string;
  
  // Admin Notes
  admin_notes?: string;
  rejection_reason?: string;
  
  // Risk Flags
  has_medical_conditions: boolean;
  has_dietary_requirements: boolean;
  requires_special_attention: boolean;
  travel_documents_complete: boolean;
}

interface GroupBooking {
  id: string;
  group_name: string;
  group_leader: string;
  group_size: number;
  applications: Application[];
  group_discount: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'confirmed';
}

export function RetreatApplicationManager() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [groupBookings, setGroupBookings] = useState<GroupBooking[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
    loadGroupBookings();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);

      // Demo applications with comprehensive data
      const demoApplications: Application[] = [
        {
          id: 'app-001',
          retreat_id: 'retreat-alpine-yoga-2024',
          retreat_title: 'Alpine Yoga Retreat - Jungfrau Region',
          customer_id: 'user-emma',
          customer_name: 'Emma Müller',
          customer_email: 'emma.muller@email.com',
          customer_phone: '+41 79 123 45 67',
          status: 'submitted',
          submitted_at: new Date(Date.now() - 3600000).toISOString(),
          
          room_type_id: 'room-shared-twin',
          room_type_name: 'Shared Twin Room',
          quoted_price: 1650.00,
          deposit_amount: 495.00,
          balance_amount: 1155.00,
          
          date_of_birth: '1985-03-15',
          nationality: 'Swiss',
          dietary_requirements: 'Vegetarian, gluten-free',
          medical_conditions: 'Mild asthma, controlled with inhaler',
          emergency_contact: {
            name: 'Hans Müller',
            phone: '+41 79 876 54 32',
            relationship: 'Husband'
          },
          
          passport_country: 'CH',
          passport_number_last4: '1234',
          travel_insurance_confirmed: true,
          arrival_info: {
            flight_number: 'LX318',
            arrival_time: '2024-07-15T14:30:00Z',
            airport: 'ZUR'
          },
          
          roommate_preference: 'female_only',
          roommate_requests: 'Prefer quiet roommate for early sleep',
          special_requests: 'Ground floor room if possible due to mild knee issues',
          
          yoga_experience: 'intermediate',
          yoga_styles: ['Hatha', 'Vinyasa', 'Restorative'],
          injuries_limitations: 'Previous knee surgery, no deep lunges',
          
          motivation: 'Looking to deepen my practice and connect with nature in the beautiful Alps.',
          expectations: 'To learn new techniques, meet like-minded people, and find inner peace.',
          how_heard_about: 'Recommendation from my yoga teacher Sarah',
          
          has_medical_conditions: true,
          has_dietary_requirements: true,
          requires_special_attention: true,
          travel_documents_complete: true
        },
        {
          id: 'app-002',
          retreat_id: 'retreat-alpine-yoga-2024',
          retreat_title: 'Alpine Yoga Retreat - Jungfrau Region',
          customer_id: 'user-david',
          customer_name: 'David Chen',
          customer_email: 'david.chen@email.com',
          customer_phone: '+41 76 987 65 43',
          status: 'under_review',
          submitted_at: new Date(Date.now() - 7200000).toISOString(),
          
          room_type_id: 'room-private-single',
          room_type_name: 'Private Single Room',
          quoted_price: 2250.00,
          deposit_amount: 675.00,
          balance_amount: 1575.00,
          
          date_of_birth: '1978-11-22',
          nationality: 'Swiss',
          emergency_contact: {
            name: 'Lisa Chen',
            phone: '+41 76 345 67 89',
            relationship: 'Wife'
          },
          
          passport_country: 'CH',
          passport_number_last4: '5678',
          travel_insurance_confirmed: true,
          
          roommate_preference: 'no_preference',
          
          yoga_experience: 'advanced',
          yoga_styles: ['Ashtanga', 'Vinyasa', 'Meditation'],
          
          motivation: 'Seeking to advance my teacher training and learn from experienced instructors.',
          expectations: 'Advanced workshops, philosophy discussions, and mountain meditation.',
          how_heard_about: 'YogaSwiss website',
          
          has_medical_conditions: false,
          has_dietary_requirements: false,
          requires_special_attention: false,
          travel_documents_complete: true
        },
        {
          id: 'app-003',
          retreat_id: 'retreat-ticino-wellness-2024',
          retreat_title: 'Ticino Wellness & Yoga Retreat',
          customer_id: 'user-sophie',
          customer_name: 'Sophie Laurent',
          customer_email: 'sophie.laurent@email.com',
          customer_phone: '+41 22 456 78 90',
          status: 'approved',
          submitted_at: new Date(Date.now() - 86400000).toISOString(),
          reviewed_at: new Date(Date.now() - 43200000).toISOString(),
          
          room_type_id: 'room-shared-triple',
          room_type_name: 'Shared Triple Room',
          quoted_price: 1450.00,
          deposit_amount: 435.00,
          balance_amount: 1015.00,
          
          date_of_birth: '1992-07-08',
          nationality: 'French',
          dietary_requirements: 'Vegan',
          emergency_contact: {
            name: 'Marie Laurent',
            phone: '+33 6 12 34 56 78',
            relationship: 'Mother'
          },
          
          passport_country: 'FR',
          passport_number_last4: '9012',
          travel_insurance_confirmed: true,
          
          roommate_preference: 'any',
          
          yoga_experience: 'beginner',
          yoga_styles: ['Hatha', 'Gentle'],
          
          motivation: 'First retreat experience, want to start my yoga journey in a supportive environment.',
          expectations: 'Learn basics, relax, and gain confidence in my practice.',
          how_heard_about: 'Instagram',
          
          has_medical_conditions: false,
          has_dietary_requirements: true,
          requires_special_attention: false,
          travel_documents_complete: true
        }
      ];

      setApplications(demoApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupBookings = async () => {
    try {
      // Demo group bookings
      const demoGroups: GroupBooking[] = [
        {
          id: 'group-001',
          group_name: 'Zurich Yoga Studio Group',
          group_leader: 'Anna Zimmerman',
          group_size: 6,
          applications: [], // Would be populated with actual applications
          group_discount: 10,
          total_amount: 9900.00,
          status: 'pending'
        }
      ];

      setGroupBookings(demoGroups);
    } catch (error) {
      console.error('Error loading group bookings:', error);
    }
  };

  const handleReview = (application: Application) => {
    setSelectedApplication(application);
    setAdminNotes(application.admin_notes || '');
    setReviewDialogOpen(true);
  };

  const submitReview = async () => {
    if (!selectedApplication) return;

    try {
      // Update application status
      const updatedApplication = {
        ...selectedApplication,
        status: reviewStatus as any,
        admin_notes: adminNotes,
        reviewed_at: new Date().toISOString()
      };

      // Update in state
      setApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id ? updatedApplication : app
        )
      );

      // Close dialog
      setReviewDialogOpen(false);
      setSelectedApplication(null);
      setReviewStatus('');
      setAdminNotes('');

      console.log('Application reviewed:', updatedApplication);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { variant: 'secondary' as const, text: 'New', color: 'bg-blue-100 text-blue-800' },
      under_review: { variant: 'default' as const, text: 'Reviewing', color: 'bg-yellow-100 text-yellow-800' },
      approved: { variant: 'default' as const, text: 'Approved', color: 'bg-green-100 text-green-800' },
      waitlist: { variant: 'secondary' as const, text: 'Waitlist', color: 'bg-purple-100 text-purple-800' },
      rejected: { variant: 'destructive' as const, text: 'Rejected', color: 'bg-red-100 text-red-800' },
      withdrawn: { variant: 'outline' as const, text: 'Withdrawn', color: 'bg-gray-100 text-gray-800' }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
  };

  const getRiskLevel = (application: Application) => {
    let riskScore = 0;
    if (application.has_medical_conditions) riskScore += 2;
    if (application.has_dietary_requirements) riskScore += 1;
    if (!application.travel_documents_complete) riskScore += 3;
    if (application.requires_special_attention) riskScore += 2;

    if (riskScore >= 5) return { level: 'high', color: 'text-red-600', bg: 'bg-red-50' };
    if (riskScore >= 3) return { level: 'medium', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { level: 'low', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const pendingCount = applications.filter(app => ['submitted', 'under_review'].includes(app.status)).length;
  const approvedCount = applications.filter(app => app.status === 'approved').length;
  const totalRevenue = applications
    .filter(app => app.status === 'approved')
    .reduce((sum, app) => sum + app.quoted_price, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            Retreat Application Manager
          </h2>
          <p className="text-muted-foreground mt-1">
            Review and manage retreat applications with intelligent prioritization
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">CHF {totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Confirmed Revenue</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {pendingCount > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            You have {pendingCount} applications requiring review. Respond within 48 hours to maintain excellent customer service.
          </AlertDescription>
        </Alert>
      )}

      {/* Applications List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending Review
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="groups">Group Bookings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {applications.map((application) => {
              const statusBadge = getStatusBadge(application.status);
              const riskLevel = getRiskLevel(application);

              return (
                <Card key={application.id} className={`transition-all hover:shadow-md ${riskLevel.bg} border-l-4 ${
                  riskLevel.level === 'high' ? 'border-l-red-500' :
                  riskLevel.level === 'medium' ? 'border-l-orange-500' : 'border-l-green-500'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`/api/placeholder/48/48`} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {application.customer_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{application.customer_name}</h4>
                            <Badge className={statusBadge.color}>
                              {statusBadge.text}
                            </Badge>
                            {riskLevel.level === 'high' && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                High Priority
                              </Badge>
                            )}
                            {application.yoga_experience === 'beginner' && (
                              <Badge variant="outline" className="text-xs">
                                <Heart className="h-3 w-3 mr-1" />
                                First Timer
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{application.customer_email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{application.customer_phone}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(application.submitted_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Globe className="h-3 w-3" />
                              <span>{application.nationality}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-sm">
                            <div className="font-medium mb-1">{application.retreat_title}</div>
                            <div className="text-muted-foreground">{application.room_type_name}</div>
                          </div>

                          {/* Risk Indicators */}
                          <div className="flex items-center gap-2 mt-3">
                            {application.has_medical_conditions && (
                              <Badge variant="outline" className="text-xs">
                                <Heart className="h-3 w-3 mr-1 text-red-500" />
                                Medical
                              </Badge>
                            )}
                            {application.has_dietary_requirements && (
                              <Badge variant="outline" className="text-xs">
                                <UtensilsCrossed className="h-3 w-3 mr-1 text-orange-500" />
                                Dietary
                              </Badge>
                            )}
                            {application.travel_insurance_confirmed && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1 text-green-500" />
                                Insured
                              </Badge>
                            )}
                            {application.arrival_info?.flight_number && (
                              <Badge variant="outline" className="text-xs">
                                <Plane className="h-3 w-3 mr-1 text-blue-500" />
                                Flight Booked
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold mb-2">
                          CHF {application.quoted_price.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground mb-3">
                          Deposit: CHF {application.deposit_amount.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          {['submitted', 'under_review'].includes(application.status) && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setReviewStatus('rejected');
                                  setReviewDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setReviewStatus('approved');
                                  setReviewDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReview(application)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          {/* Same as "all" but filtered for pending applications */}
          <div className="space-y-4">
            {applications.filter(app => ['submitted', 'under_review'].includes(app.status)).map((application) => {
              // Same card structure as above
              const statusBadge = getStatusBadge(application.status);
              const riskLevel = getRiskLevel(application);

              return (
                <Card key={application.id} className={`transition-all hover:shadow-md ${riskLevel.bg} border-l-4 border-l-orange-500`}>
                  {/* Same card content */}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="space-y-4">
            {groupBookings.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {group.group_name}
                      </CardTitle>
                      <CardDescription>
                        Led by {group.group_leader} • {group.group_size} participants
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">CHF {group.total_amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{group.group_discount}% group discount</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant={group.status === 'approved' ? 'default' : 'secondary'}>
                      {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                    </Badge>
                    <Button size="sm">
                      <Users className="h-4 w-4 mr-1" />
                      Manage Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">Applications to bookings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Avg Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18h</div>
                <p className="text-xs text-muted-foreground">Application review time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Satisfaction Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8/5</div>
                <p className="text-xs text-muted-foreground">Application process rating</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={`/api/placeholder/64/64`} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {selectedApplication.customer_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedApplication.customer_name}</h3>
                  <p className="text-muted-foreground">{selectedApplication.customer_email}</p>
                  <p className="text-sm text-muted-foreground">{selectedApplication.retreat_title}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Room Type & Pricing</Label>
                  <div className="mt-1 text-sm">
                    <div>{selectedApplication.room_type_name}</div>
                    <div className="text-muted-foreground">
                      CHF {selectedApplication.quoted_price.toLocaleString()} 
                      (Deposit: CHF {selectedApplication.deposit_amount.toLocaleString()})
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Yoga Experience</Label>
                  <div className="mt-1 text-sm">
                    <div className="capitalize">{selectedApplication.yoga_experience}</div>
                    <div className="text-muted-foreground">
                      {selectedApplication.yoga_styles.join(', ')}
                    </div>
                  </div>
                </div>
              </div>

              {selectedApplication.dietary_requirements && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <UtensilsCrossed className="h-4 w-4" />
                    Dietary Requirements
                  </Label>
                  <div className="mt-1 text-sm bg-orange-50 p-2 rounded">
                    {selectedApplication.dietary_requirements}
                  </div>
                </div>
              )}

              {selectedApplication.medical_conditions && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    Medical Conditions
                  </Label>
                  <div className="mt-1 text-sm bg-red-50 p-2 rounded">
                    {selectedApplication.medical_conditions}
                  </div>
                </div>
              )}

              {selectedApplication.special_requests && (
                <div>
                  <Label className="text-sm font-medium">Special Requests</Label>
                  <div className="mt-1 text-sm bg-blue-50 p-2 rounded">
                    {selectedApplication.special_requests}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Review Decision</Label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select review outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve Application</SelectItem>
                    <SelectItem value="waitlist">Add to Waitlist</SelectItem>
                    <SelectItem value="rejected">Reject Application</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Admin Notes</Label>
                <Textarea
                  placeholder="Add notes about this application review..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submitReview} disabled={!reviewStatus}>
                  Submit Review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}