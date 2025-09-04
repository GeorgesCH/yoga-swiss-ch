import { useState } from 'react';
import { X, Users, Clock, MapPin, Calendar, Star, ChevronRight, Phone, Mail, CreditCard, AlertTriangle, CheckCircle, XCircle, Edit, Trash2, Copy, Send, Download, Plus, Minus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { useLanguage } from './LanguageProvider';

interface ClassParticipant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  booking_date: string;
  booking_status: 'confirmed' | 'pending' | 'cancelled' | 'no_show';
  payment_status: 'paid' | 'pending' | 'failed' | 'refunded';
  payment_method: 'credit_card' | 'twint' | 'cash' | 'package' | 'membership';
  special_requirements?: string;
  attendance_status?: 'attended' | 'absent' | 'late';
  arrival_time?: string;
  checkin_method?: 'manual' | 'qr_code' | 'mobile_app';
}

interface ClassOccurrence {
  id: string;
  template_name: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
    phone?: string;
  };
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  capacity: number;
  booked: number;
  waitlist: number;
  location: string;
  room?: string;
  is_online?: boolean;
  online_url?: string;
  language: 'de' | 'fr' | 'it' | 'en';
  status: 'scheduled' | 'cancelled' | 'completed';
  price_chf: number;
  category: string;
  level: string;
  description?: string;
  participants: ClassParticipant[];
  waitlist_participants: ClassParticipant[];
  special_instructions?: string;
  equipment_needed?: string[];
  cancellation_reason?: string;
  revenue_total: number;
  revenue_instructor: number;
  revenue_studio: number;
}

interface ClassDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classOccurrence: ClassOccurrence | null;
  onEdit: (classId: string) => void;
  onCancel: (classId: string, reason: string) => void;
  onDuplicate: (classId: string) => void;
}

export function ClassDetailDialog({ 
  isOpen, 
  onClose, 
  classOccurrence, 
  onEdit, 
  onCancel, 
  onDuplicate 
}: ClassDetailDialogProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [addingToWaitlist, setAddingToWaitlist] = useState(false);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');

  if (!classOccurrence) return null;

  const occupancyRate = (classOccurrence.booked / classOccurrence.capacity) * 100;
  const isFull = classOccurrence.booked >= classOccurrence.capacity;
  const isUpcoming = new Date(`${classOccurrence.date} ${classOccurrence.start_time}`) > new Date();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Cancelled</Badge>;
      case 'no_show':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCancelClass = () => {
    if (cancellationReason.trim()) {
      onCancel(classOccurrence.id, cancellationReason);
      setShowCancelDialog(false);
      setCancellationReason('');
      onClose();
    }
  };

  const handleAddToWaitlist = () => {
    if (newParticipantEmail.trim()) {
      console.log('Adding to waitlist:', newParticipantEmail);
      setNewParticipantEmail('');
      setAddingToWaitlist(false);
    }
  };

  const handleSendReminders = () => {
    console.log('Sending reminders to all participants');
    // This would trigger email/SMS reminders
  };

  const handleExportAttendance = () => {
    console.log('Exporting attendance sheet');
    // This would generate a CSV or PDF export
  };

  const handleCheckIn = (participantId: string) => {
    console.log('Checking in participant:', participantId);
    // This would update the participant's attendance status
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl">{classOccurrence.template_name}</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {classOccurrence.category}
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {classOccurrence.level}
                </Badge>
                {classOccurrence.is_online && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Online
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(classOccurrence.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDuplicate(classOccurrence.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              {isUpcoming && (
                <Button variant="outline" size="sm" onClick={() => setShowCancelDialog(true)} className="text-red-600 hover:text-red-700">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Class
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-2xl font-semibold">{classOccurrence.booked}/{classOccurrence.capacity}</div>
                  <div className="text-xs text-muted-foreground">Capacity ({Math.round(occupancyRate)}%)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-2xl font-semibold">{classOccurrence.waitlist}</div>
                  <div className="text-xs text-muted-foreground">Waitlist</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-2xl font-semibold">CHF {classOccurrence.revenue_total}</div>
                  <div className="text-xs text-muted-foreground">Total Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="text-2xl font-semibold">4.8</div>
                  <div className="text-xs text-muted-foreground">Avg. Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="participants">Participants ({classOccurrence.booked})</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist ({classOccurrence.waitlist})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Class Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <div className="font-medium">{new Date(classOccurrence.date).toLocaleDateString('en-CH')}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time:</span>
                      <div className="font-medium">{classOccurrence.start_time} - {classOccurrence.end_time}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <div className="font-medium">{classOccurrence.duration_minutes} minutes</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <div className="font-medium">CHF {classOccurrence.price_chf}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <div className="font-medium">
                        {classOccurrence.is_online ? 'Online' : classOccurrence.location}
                        {classOccurrence.room && ` - ${classOccurrence.room}`}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Language:</span>
                      <div className="font-medium">
                        {classOccurrence.language === 'de' && '🇩🇪 Deutsch'}
                        {classOccurrence.language === 'fr' && '🇫🇷 Français'}
                        {classOccurrence.language === 'it' && '🇮🇹 Italiano'}
                        {classOccurrence.language === 'en' && '🇬🇧 English'}
                      </div>
                    </div>
                  </div>

                  {classOccurrence.description && (
                    <div>
                      <span className="text-muted-foreground text-sm">Description:</span>
                      <p className="text-sm mt-1">{classOccurrence.description}</p>
                    </div>
                  )}

                  {classOccurrence.equipment_needed && classOccurrence.equipment_needed.length > 0 && (
                    <div>
                      <span className="text-muted-foreground text-sm">Equipment Needed:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {classOccurrence.equipment_needed.map((item, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {classOccurrence.special_instructions && (
                    <div>
                      <span className="text-muted-foreground text-sm">Special Instructions:</span>
                      <p className="text-sm mt-1 bg-blue-50 p-2 rounded border">{classOccurrence.special_instructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Instructor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={classOccurrence.instructor.avatar} />
                      <AvatarFallback>
                        {classOccurrence.instructor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{classOccurrence.instructor.name}</div>
                      <div className="text-sm text-muted-foreground">{classOccurrence.instructor.email}</div>
                      {classOccurrence.instructor.phone && (
                        <div className="text-sm text-muted-foreground">{classOccurrence.instructor.phone}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Earnings</div>
                      <div className="font-medium">CHF {classOccurrence.revenue_instructor}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" onClick={handleSendReminders}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reminders
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleExportAttendance}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Attendance
                  </Button>
                  {classOccurrence.is_online && classOccurrence.online_url && (
                    <Button size="sm" variant="outline" onClick={() => window.open(classOccurrence.online_url, '_blank')}>
                      <ChevronRight className="h-4 w-4 mr-2" />
                      Join Online Class
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participants" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Registered Participants</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleSendReminders}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminders
                </Button>
                <Button size="sm" variant="outline" onClick={handleExportAttendance}>
                  <Download className="h-4 w-4 mr-2" />
                  Export List
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Booking Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classOccurrence.participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>
                            {participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{participant.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Booked: {new Date(participant.booking_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {participant.email}
                        </div>
                        {participant.phone && (
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {participant.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(participant.booking_status)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getPaymentStatusBadge(participant.payment_status)}
                        <div className="text-xs text-muted-foreground capitalize">
                          {participant.payment_method.replace('_', ' ')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {participant.attendance_status ? (
                        <div className="space-y-1">
                          <Badge 
                            className={
                              participant.attendance_status === 'attended' 
                                ? "bg-green-100 text-green-700 border-green-200"
                                : participant.attendance_status === 'late'
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }
                          >
                            {participant.attendance_status}
                          </Badge>
                          {participant.arrival_time && (
                            <div className="text-xs text-muted-foreground">
                              {participant.arrival_time}
                            </div>
                          )}
                        </div>
                      ) : isUpcoming ? (
                        <Button size="sm" onClick={() => handleCheckIn(participant.id)}>
                          Check In
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="waitlist" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Waitlist</h3>
              <Button 
                size="sm" 
                onClick={() => setAddingToWaitlist(true)}
                disabled={!isUpcoming}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Waitlist
              </Button>
            </div>

            {addingToWaitlist && (
              <Card className="border-dashed">
                <CardContent className="pt-4">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter email address..."
                      value={newParticipantEmail}
                      onChange={(e) => setNewParticipantEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleAddToWaitlist}>Add</Button>
                    <Button variant="ghost" onClick={() => setAddingToWaitlist(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {classOccurrence.waitlist_participants.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Participant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classOccurrence.waitlist_participants.map((participant, index) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>
                              {participant.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{participant.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{participant.email}</div>
                          {participant.phone && (
                            <div className="text-muted-foreground">{participant.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(participant.booking_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            Promote
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Waitlist Yet</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    When the class fills up, interested participants will be added to the waitlist.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Revenue:</span>
                    <span className="font-semibold">CHF {classOccurrence.revenue_total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Instructor Share:</span>
                    <span>CHF {classOccurrence.revenue_instructor.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Studio Share:</span>
                    <span>CHF {classOccurrence.revenue_studio.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Revenue per Participant:</span>
                    <span>CHF {(classOccurrence.revenue_total / classOccurrence.booked).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Occupancy Rate:</span>
                    <span className="font-semibold">{Math.round(occupancyRate)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Waitlist Conversion:</span>
                    <span>75%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>No-Show Rate:</span>
                    <span>5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last-minute Bookings:</span>
                    <span>3</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { method: 'Credit Card', count: 8, percentage: 40 },
                    { method: 'TWINT', count: 6, percentage: 30 },
                    { method: 'Package', count: 4, percentage: 20 },
                    { method: 'Membership', count: 2, percentage: 10 },
                    { method: 'Cash', count: 0, percentage: 0 }
                  ].map((payment) => (
                    <div key={payment.method} className="text-center">
                      <div className="text-2xl font-semibold">{payment.count}</div>
                      <div className="text-sm text-muted-foreground">{payment.method}</div>
                      <div className="text-xs text-muted-foreground">{payment.percentage}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Cancel Class Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-red-600">Cancel Class</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This will cancel the class and notify all participants. This action cannot be undone.
                </p>
                <div>
                  <label className="text-sm font-medium">Cancellation Reason *</label>
                  <Textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Please provide a reason for cancellation..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelClass}
                    disabled={!cancellationReason.trim()}
                  >
                    Cancel Class
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}