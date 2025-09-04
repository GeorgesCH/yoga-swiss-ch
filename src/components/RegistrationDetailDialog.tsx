import { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { 
  User, Calendar, MapPin, Clock, CreditCard, 
  CheckCircle, XCircle, AlertCircle, Timer,
  Edit2, Save, X, Phone, Mail, MessageSquare,
  Download, RefreshCw, MoveRight, Wallet,
  FileText, Bell, Settings, History, Send
} from 'lucide-react';

interface RegistrationDetailDialogProps {
  registration: any;
  onClose: () => void;
}

// Mock timeline data
const mockTimeline = [
  {
    id: '1',
    type: 'booking_created',
    title: 'Registration Created',
    description: 'Booked via mobile app',
    timestamp: '2024-01-20T14:30:00',
    actor: 'Customer',
    details: {
      source: 'mobile_app',
      paymentMethod: 'membership'
    }
  },
  {
    id: '2',
    type: 'payment_processed',
    title: 'Payment Processed',
    description: 'Membership entitlement applied',
    timestamp: '2024-01-20T14:30:15',
    actor: 'System',
    details: {
      amount: 0.00,
      method: 'membership'
    }
  },
  {
    id: '3',
    type: 'confirmation_sent',
    title: 'Confirmation Sent',
    description: 'Email confirmation sent with ICS attachment',
    timestamp: '2024-01-20T14:30:30',
    actor: 'System',
    details: {
      channel: 'email',
      template: 'booking_confirmation'
    }
  },
  {
    id: '4',
    type: 'reminder_sent',
    title: 'Reminder Sent',
    description: '24h class reminder sent',
    timestamp: '2024-01-21T14:30:00',
    actor: 'System',
    details: {
      channel: 'push_notification',
      template: 'class_reminder_24h'
    }
  }
];

// Mock payment/order data
const mockOrderDetails = {
  id: 'ord_123',
  items: [
    {
      id: '1',
      type: 'registration',
      name: 'Vinyasa Flow - Jan 22, 09:00',
      price: 0.00,
      quantity: 1,
      entitlement: 'Unlimited Monthly Membership'
    }
  ],
  subtotal: 0.00,
  tax: 0.00,
  total: 0.00,
  currency: 'CHF',
  paymentMethod: 'membership',
  status: 'completed'
};

export function RegistrationDetailDialog({ registration, onClose }: RegistrationDetailDialogProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [moveToClass, setMoveToClass] = useState('');

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'confirmed': 'bg-green-100 text-green-800',
      'pending_payment': 'bg-yellow-100 text-yellow-800',
      'waitlisted': 'bg-blue-100 text-blue-800',
      'canceled_by_client': 'bg-gray-100 text-gray-800',
      'canceled_by_studio': 'bg-purple-100 text-purple-800',
      'no_show': 'bg-red-100 text-red-800',
      'refunded': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'confirmed': CheckCircle,
      'pending_payment': Timer,
      'waitlisted': Clock,
      'canceled_by_client': XCircle,
      'canceled_by_studio': XCircle,
      'no_show': AlertCircle,
      'refunded': RefreshCw
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="w-4 h-4" />;
  };

  const canCancel = () => {
    if (registration.status !== 'confirmed' && registration.status !== 'waitlisted') return false;
    
    const classDateTime = new Date(`${registration.occurrence.date} ${registration.occurrence.time}`);
    const now = new Date();
    const hoursUntilClass = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilClass > registration.policies.cancellationCutoff;
  };

  const getCancellationFee = () => {
    if (registration.status !== 'confirmed') return 0;
    
    const classDateTime = new Date(`${registration.occurrence.date} ${registration.occurrence.time}`);
    const now = new Date();
    const hoursUntilClass = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilClass <= 0) {
      return registration.policies.noShowFee;
    } else if (hoursUntilClass <= registration.policies.cancellationCutoff) {
      return registration.policies.lateCancelFee;
    }
    return 0;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl h-[90vh] max-h-[900px] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={registration.customer.avatar} />
                <AvatarFallback className="text-lg">
                  {getInitials(registration.customer.firstName, registration.customer.lastName)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <DialogTitle className="text-2xl">
                  Registration #{registration.id}
                </DialogTitle>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                  <span>{registration.customer.firstName} {registration.customer.lastName}</span>
                  <span>•</span>
                  <span>{registration.occurrence.className}</span>
                  <span>•</span>
                  <span>{formatDate(registration.occurrence.date)} {formatTime(registration.occurrence.time)}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={getStatusColor(registration.status)}>
                    {getStatusIcon(registration.status)}
                    <span className="ml-1">{registration.status.replace('_', ' ')}</span>
                  </Badge>
                  {registration.entitlementType && (
                    <Badge variant="outline">
                      {registration.entitlementType === 'membership' ? 'Membership' :
                       registration.entitlementType === 'credits' ? 'Credits' :
                       registration.entitlementType === 'drop_in' ? 'Drop-in' :
                       registration.entitlementType}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setEditMode(!editMode)}>
                <Edit2 className="w-4 h-4 mr-2" />
                {editMode ? 'Cancel' : 'Edit'}
              </Button>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-6 flex-shrink-0">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="communications">Messages</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto mt-4">
              <TabsContent value="overview" className="space-y-6 m-0">
                <div className="grid grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{registration.customer.firstName} {registration.customer.lastName}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{registration.customer.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{registration.customer.phone}</span>
                      </div>
                      <div className="pt-2">
                        <Button variant="outline" size="sm">
                          View Full Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Class Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Class Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{registration.occurrence.className}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>with {registration.occurrence.instructor}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {formatDate(registration.occurrence.date)} at {formatTime(registration.occurrence.time)}
                          ({registration.occurrence.duration} min)
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{registration.occurrence.location}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {registration.occurrence.registered}/{registration.occurrence.capacity} registered
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Booking Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Booking Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Booked At</p>
                        <p className="font-medium">{formatDateTime(registration.bookedAt)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Source</p>
                        <p className="font-medium capitalize">{registration.source.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payment Method</p>
                        <p className="font-medium capitalize">{registration.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-medium">
                          {registration.entitlementType === 'membership' ? 'Included' :
                           registration.entitlementType === 'credits' ? `${registration.creditsUsed} Credits` :
                           formatCurrency(registration.price)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Check-in Status */}
                {(registration.checkinStatus || registration.attendanceStatus) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Check-in Status</p>
                          <div className="flex items-center mt-1">
                            {registration.checkinStatus === 'present' && (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                                <span className="font-medium text-green-600">Present</span>
                              </>
                            )}
                            {registration.checkinStatus === 'no_show' && (
                              <>
                                <XCircle className="w-4 h-4 text-red-600 mr-2" />
                                <span className="font-medium text-red-600">No Show</span>
                              </>
                            )}
                          </div>
                        </div>
                        {registration.checkinAt && (
                          <div>
                            <p className="text-muted-foreground">Check-in Time</p>
                            <p className="font-medium">{formatDateTime(registration.checkinAt)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground">Attendance</p>
                          <p className="font-medium capitalize">
                            {registration.attendanceStatus?.replace('_', ' ') || 'Pending'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {registration.notes ? (
                      <p className="text-sm">{registration.notes}</p>
                    ) : (
                      <p className="text-muted-foreground text-sm">No notes for this registration</p>
                    )}
                    
                    <div className="mt-4 space-y-2">
                      <Textarea
                        placeholder="Add a note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={2}
                      />
                      <Button size="sm" disabled={!newNote.trim()}>
                        Add Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Order #{mockOrderDetails.id}</span>
                        <Badge className="bg-green-100 text-green-800">
                          {mockOrderDetails.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {mockOrderDetails.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.entitlement && (
                                <p className="text-muted-foreground">{item.entitlement}</p>
                              )}
                            </div>
                            <span className="font-medium">
                              {item.price > 0 ? formatCurrency(item.price) : 'Included'}
                            </span>
                          </div>
                        ))}
                      </div>

                      <hr className="my-3" />
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(mockOrderDetails.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (7.7%):</span>
                          <span>{formatCurrency(mockOrderDetails.tax)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>{formatCurrency(mockOrderDetails.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download Invoice
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-2" />
                        Resend Receipt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="policies" className="space-y-4 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Cancellation & No-Show Policy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cancellation Cutoff</p>
                        <p className="font-medium">{registration.policies.cancellationCutoff} hours before</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Late Cancel Fee</p>
                        <p className="font-medium">{formatCurrency(registration.policies.lateCancelFee)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">No-Show Fee</p>
                        <p className="font-medium">{formatCurrency(registration.policies.noShowFee)}</p>
                      </div>
                    </div>

                    {canCancel() ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm text-green-800">
                            Free cancellation available until {registration.policies.cancellationCutoff} hours before class
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                          <span className="text-sm text-yellow-800">
                            Late cancellation fee applies: {formatCurrency(getCancellationFee())}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Registration Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockTimeline.map((event, index) => (
                        <div key={event.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-blue-600 rounded-full" />
                            </div>
                            {index < mockTimeline.length - 1 && (
                              <div className="w-px h-8 bg-gray-200 ml-4 mt-2" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{event.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(event.timestamp)}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </p>
                            {event.details && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {Object.entries(event.details).map(([key, value]) => (
                                  <span key={key} className="mr-3">
                                    {key}: {String(value)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communications" className="space-y-4 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Communications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium">Booking Confirmation</p>
                            <p className="text-xs text-muted-foreground">
                              Sent {formatDateTime('2024-01-20T14:30:30')}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Delivered</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Bell className="w-4 h-4 text-orange-500" />
                          <div>
                            <p className="font-medium">Class Reminder</p>
                            <p className="text-xs text-muted-foreground">
                              Sent {formatDateTime('2024-01-21T14:30:00')}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Delivered</Badge>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button size="sm" variant="outline">
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4 m-0">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Registration Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {registration.status === 'confirmed' && (
                        <>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            disabled={!canCancel()}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel Registration
                            {!canCancel() && (
                              <span className="ml-auto text-xs">
                                Fee: {formatCurrency(getCancellationFee())}
                              </span>
                            )}
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <MoveRight className="w-4 h-4 mr-2" />
                            Move to Another Class
                          </Button>
                        </>
                      )}
                      
                      {registration.status === 'pending_payment' && (
                        <>
                          <Button className="w-full justify-start">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Process Payment
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <X className="w-4 h-4 mr-2" />
                            Cancel & Release Hold
                          </Button>
                        </>
                      )}

                      {registration.status === 'waitlisted' && (
                        <Button variant="outline" className="w-full justify-start">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Promote from Waitlist
                        </Button>
                      )}

                      <Button variant="outline" className="w-full justify-start">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Issue Refund
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        View Full Profile
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Customer
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Wallet className="w-4 h-4 mr-2" />
                        Add Account Credit
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}