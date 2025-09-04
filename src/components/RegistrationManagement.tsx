import { useState, useMemo } from 'react';
import { useLanguage } from './LanguageProvider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { 
  Search, Plus, Filter, Download, Calendar, 
  User, CreditCard, Clock, MapPin, 
  CheckCircle, XCircle, AlertCircle, Timer,
  Users, MoreHorizontal, Eye, Edit2, Trash2,
  Send, PhoneCall, Mail, MessageSquare, 
  TrendingUp, TrendingDown, Minus, BarChart3
} from 'lucide-react';
import { RegistrationDetailDialog } from './RegistrationDetailDialog';
import { RegistrationBookingDialog } from './RegistrationBookingDialog';
import { RosterManagement } from './RosterManagement';
import { RegistrationBulkActionsDialog } from './RegistrationBulkActionsDialog';

// Mock registration data with comprehensive details
const mockRegistrations = [
  {
    id: '1',
    customer: {
      id: 'c1',
      firstName: 'Emma',
      lastName: 'Weber',
      email: 'emma.weber@email.ch',
      phone: '+41 79 123 4567',
      avatar: null
    },
    occurrence: {
      id: 'o1',
      className: 'Vinyasa Flow',
      instructor: 'Sarah Chen',
      date: '2024-01-22',
      time: '09:00',
      duration: 75,
      location: 'Studio A',
      capacity: 20,
      registered: 18
    },
    status: 'confirmed',
    entitlementType: 'membership',
    ticketTier: 'unlimited_monthly',
    creditsUsed: 0,
    price: 0.00,
    paidAmount: 149.00, // membership fee
    paymentMethod: 'membership',
    source: 'mobile_app',
    bookedAt: '2024-01-20T14:30:00',
    checkinStatus: null,
    checkinAt: null,
    attendanceStatus: null,
    notes: '',
    policies: {
      cancellationCutoff: 24,
      noShowFee: 15.00,
      lateCancelFee: 10.00
    }
  },
  {
    id: '2',
    customer: {
      id: 'c2',
      firstName: 'Marc',
      lastName: 'Dubois',
      email: 'marc.dubois@email.ch',
      phone: '+41 76 234 5678',
      avatar: null
    },
    occurrence: {
      id: 'o2',
      className: 'Yin Yoga',
      instructor: 'Michael Brown',
      date: '2024-01-22',
      time: '19:00',
      duration: 90,
      location: 'Studio B',
      capacity: 15,
      registered: 12
    },
    status: 'pending_payment',
    entitlementType: 'drop_in',
    ticketTier: 'standard',
    creditsUsed: 0,
    price: 28.00,
    paidAmount: 0.00,
    paymentMethod: 'pending',
    source: 'website',
    bookedAt: '2024-01-22T16:45:00',
    holdExpiresAt: '2024-01-22T17:00:00',
    checkinStatus: null,
    checkinAt: null,
    attendanceStatus: null,
    notes: '',
    policies: {
      cancellationCutoff: 12,
      noShowFee: 20.00,
      lateCancelFee: 15.00
    }
  },
  {
    id: '3',
    customer: {
      id: 'c3',
      firstName: 'Sofia',
      lastName: 'Rossi',
      email: 'sofia.rossi@email.ch',
      phone: '+41 78 345 6789',
      avatar: null
    },
    occurrence: {
      id: 'o1',
      className: 'Vinyasa Flow',
      instructor: 'Sarah Chen',
      date: '2024-01-22',
      time: '09:00',
      duration: 75,
      location: 'Studio A',
      capacity: 20,
      registered: 18
    },
    status: 'waitlisted',
    entitlementType: 'credits',
    ticketTier: 'standard',
    creditsUsed: 1,
    price: 0.00,
    paidAmount: 0.00,
    paymentMethod: 'credits',
    source: 'mobile_app',
    bookedAt: '2024-01-21T10:15:00',
    waitlistPosition: 2,
    checkinStatus: null,
    checkinAt: null,
    attendanceStatus: null,
    notes: '',
    policies: {
      cancellationCutoff: 24,
      noShowFee: 15.00,
      lateCancelFee: 0.00 // No fee for credits
    }
  },
  {
    id: '4',
    customer: {
      id: 'c4',
      firstName: 'James',
      lastName: 'Smith',
      email: 'james.smith@email.ch',
      phone: '+41 77 456 7890',
      avatar: null
    },
    occurrence: {
      id: 'o3',
      className: 'Hot Yoga',
      instructor: 'Lisa Anderson',
      date: '2024-01-21',
      time: '18:30',
      duration: 60,
      location: 'Studio C',
      capacity: 25,
      registered: 23
    },
    status: 'confirmed',
    entitlementType: 'drop_in',
    ticketTier: 'standard',
    creditsUsed: 0,
    price: 32.00,
    paidAmount: 32.00,
    paymentMethod: 'twint',
    source: 'pos',
    bookedAt: '2024-01-21T17:45:00',
    checkinStatus: 'present',
    checkinAt: '2024-01-21T18:25:00',
    attendanceStatus: 'present',
    notes: 'Early arrival, very enthusiastic',
    policies: {
      cancellationCutoff: 12,
      noShowFee: 25.00,
      lateCancelFee: 15.00
    }
  },
  {
    id: '5',
    customer: {
      id: 'c5',
      firstName: 'Anna',
      lastName: 'Müller',
      email: 'anna.mueller@email.ch',
      phone: '+41 79 567 8901',
      avatar: null
    },
    occurrence: {
      id: 'o4',
      className: 'Beginner Flow',
      instructor: 'Tom Wilson',
      date: '2024-01-20',
      time: '10:00',
      duration: 60,
      location: 'Studio A',
      capacity: 15,
      registered: 8
    },
    status: 'no_show',
    entitlementType: 'trial',
    ticketTier: 'trial_pass',
    creditsUsed: 0,
    price: 0.00,
    paidAmount: 0.00,
    paymentMethod: 'trial',
    source: 'website',
    bookedAt: '2024-01-19T11:20:00',
    checkinStatus: 'no_show',
    checkinAt: null,
    attendanceStatus: 'no_show',
    notes: 'No-show fee waived for trial class',
    policies: {
      cancellationCutoff: 24,
      noShowFee: 0.00, // Waived for trial
      lateCancelFee: 0.00
    }
  }
];

const statusColors = {
  'confirmed': 'bg-green-100 text-green-800',
  'pending_payment': 'bg-yellow-100 text-yellow-800',
  'waitlisted': 'bg-blue-100 text-blue-800',
  'canceled_by_client': 'bg-gray-100 text-gray-800',
  'canceled_by_studio': 'bg-purple-100 text-purple-800',
  'no_show': 'bg-red-100 text-red-800',
  'refunded': 'bg-orange-100 text-orange-800'
};

const statusIcons = {
  'confirmed': CheckCircle,
  'pending_payment': Timer,
  'waitlisted': Clock,
  'canceled_by_client': XCircle,
  'canceled_by_studio': XCircle,
  'no_show': AlertCircle,
  'refunded': Minus
};

const sourceColors = {
  'website': 'bg-blue-50 text-blue-700',
  'mobile_app': 'bg-green-50 text-green-700',
  'pos': 'bg-purple-50 text-purple-700',
  'admin': 'bg-orange-50 text-orange-700'
};

export function RegistrationManagement() {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<'list' | 'roster' | 'analytics'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [showRegistrationDetail, setShowRegistrationDetail] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [sortBy, setSortBy] = useState('bookedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get unique values for filters
  const statuses = [...new Set(mockRegistrations.map(r => r.status))];
  const locations = [...new Set(mockRegistrations.map(r => r.occurrence.location))];
  const sources = [...new Set(mockRegistrations.map(r => r.source))];

  // Filter and sort registrations
  const filteredRegistrations = useMemo(() => {
    let filtered = mockRegistrations.filter(registration => {
      const matchesSearch = searchTerm === '' || 
        registration.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.occurrence.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.occurrence.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || registration.status === selectedStatus;
      const matchesLocation = selectedLocation === 'all' || registration.occurrence.location === selectedLocation;
      const matchesSource = selectedSource === 'all' || registration.source === selectedSource;
      
      // Date filtering logic would go here
      const matchesDate = selectedDate === 'all' || true; // Simplified for now

      return matchesSearch && matchesStatus && matchesLocation && matchesSource && matchesDate;
    });

    // Sort registrations
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'customer':
          aValue = `${a.customer.firstName} ${a.customer.lastName}`;
          bValue = `${b.customer.firstName} ${b.customer.lastName}`;
          break;
        case 'class':
          aValue = a.occurrence.className;
          bValue = b.occurrence.className;
          break;
        case 'date':
          aValue = new Date(`${a.occurrence.date} ${a.occurrence.time}`).getTime();
          bValue = new Date(`${b.occurrence.date} ${b.occurrence.time}`).getTime();
          break;
        case 'bookedAt':
          aValue = new Date(a.bookedAt).getTime();
          bValue = new Date(b.bookedAt).getTime();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, selectedStatus, selectedDate, selectedLocation, selectedSource, sortBy, sortOrder]);

  const toggleRegistrationSelection = (registrationId: string) => {
    setSelectedRegistrations(prev => 
      prev.includes(registrationId)
        ? prev.filter(id => id !== registrationId)
        : [...prev, registrationId]
    );
  };

  const toggleAllRegistrations = () => {
    if (selectedRegistrations.length === filteredRegistrations.length) {
      setSelectedRegistrations([]);
    } else {
      setSelectedRegistrations(filteredRegistrations.map(r => r.id));
    }
  };

  const openRegistrationDetail = (registration: any) => {
    setSelectedRegistration(registration);
    setShowRegistrationDetail(true);
  };

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
    return timeString.slice(0, 5); // HH:MM format
  };

  const getTimeUntilHoldExpires = (holdExpiresAt?: string) => {
    if (!holdExpiresAt) return null;
    const now = new Date().getTime();
    const expires = new Date(holdExpiresAt).getTime();
    const diffMs = expires - now;
    const diffMins = Math.ceil(diffMs / (1000 * 60));
    return diffMins > 0 ? `${diffMins}min` : 'Expired';
  };

  const RegistrationListItem = ({ registration }: { registration: any }) => {
    const StatusIcon = statusIcons[registration.status];
    const holdTimeLeft = getTimeUntilHoldExpires(registration.holdExpiresAt);

    return (
      <div className="flex items-center p-4 border-b hover:bg-gray-50 cursor-pointer"
           onClick={() => openRegistrationDetail(registration)}>
        <Checkbox 
          checked={selectedRegistrations.includes(registration.id)}
          onCheckedChange={() => toggleRegistrationSelection(registration.id)}
          onClick={(e) => e.stopPropagation()}
        />
        
        <Avatar className="w-10 h-10 ml-3">
          <AvatarImage src={registration.customer.avatar} />
          <AvatarFallback>
            {getInitials(registration.customer.firstName, registration.customer.lastName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 ml-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <div className="font-medium">
                  {registration.customer.firstName} {registration.customer.lastName}
                </div>
                <div className="text-sm text-gray-600">
                  {registration.customer.email}
                </div>
              </div>
              
              <div>
                <div className="font-medium">{registration.occurrence.className}</div>
                <div className="text-sm text-gray-600">
                  with {registration.occurrence.instructor}
                </div>
              </div>

              <div>
                <div className="font-medium">
                  {formatDate(registration.occurrence.date)} {formatTime(registration.occurrence.time)}
                </div>
                <div className="text-sm text-gray-600 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {registration.occurrence.location}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <StatusIcon className="w-4 h-4" />
                  <Badge className={statusColors[registration.status]}>
                    {registration.status.replace('_', ' ')}
                  </Badge>
                </div>
                {registration.status === 'pending_payment' && holdTimeLeft && (
                  <div className="text-xs text-red-600 mt-1">
                    Hold expires: {holdTimeLeft}
                  </div>
                )}
                {registration.status === 'waitlisted' && (
                  <div className="text-xs text-blue-600 mt-1">
                    Position: #{registration.waitlistPosition}
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="font-medium">
                  {registration.entitlementType === 'membership' ? 'Membership' :
                   registration.entitlementType === 'credits' ? `${registration.creditsUsed} Credits` :
                   formatCurrency(registration.price)}
                </div>
                <Badge variant="outline" className={sourceColors[registration.source]}>
                  {registration.source.replace('_', ' ')}
                </Badge>
              </div>

              <div className="text-right text-sm text-gray-600">
                <div>Booked:</div>
                <div>{formatDateTime(registration.bookedAt)}</div>
              </div>

              {registration.checkinStatus && (
                <div className="flex items-center">
                  {registration.checkinStatus === 'present' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : registration.checkinStatus === 'no_show' ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Registration Management</h1>
          <p className="text-muted-foreground">
            Manage bookings, check-ins, and attendance across all classes
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowBookingDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
        <TabsList>
          <TabsTrigger value="list">Registration List</TabsTrigger>
          <TabsTrigger value="roster">Roster & Check-in</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Today's Bookings</p>
                    <p className="text-2xl font-bold">142</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +8% from yesterday
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
                    <p className="text-sm font-medium text-muted-foreground">Pending Payment</p>
                    <p className="text-2xl font-bold text-yellow-600">8</p>
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <Timer className="w-3 h-3 mr-1" />
                      Expires soon
                    </p>
                  </div>
                  <Timer className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Waitlisted</p>
                    <p className="text-2xl font-bold">23</p>
                    <p className="text-xs text-blue-600 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      5 auto-promoted today
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Revenue Today</p>
                    <p className="text-2xl font-bold">{formatCurrency(3247)}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +15% from yesterday
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search registrations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedSource} onValueChange={setSelectedSource}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      {sources.map(source => (
                        <SelectItem key={source} value={source}>
                          {source.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-3">
                  {selectedRegistrations.length > 0 && (
                    <Button variant="outline" onClick={() => setShowBulkActions(true)}>
                      <Send className="w-4 h-4 mr-2" />
                      Actions ({selectedRegistrations.length})
                    </Button>
                  )}
                  
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bookedAt">Booking Date</SelectItem>
                      <SelectItem value="date">Class Date</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="class">Class</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Select All Header */}
              <div className="flex items-center p-4 border-b bg-gray-50">
                <Checkbox 
                  checked={selectedRegistrations.length === filteredRegistrations.length}
                  onCheckedChange={toggleAllRegistrations}
                />
                <span className="ml-3 text-sm font-medium">
                  {filteredRegistrations.length} registrations 
                  {selectedRegistrations.length > 0 && ` (${selectedRegistrations.length} selected)`}
                </span>
              </div>

              {/* Registration List */}
              <div className="divide-y">
                {filteredRegistrations.map(registration => (
                  <RegistrationListItem key={registration.id} registration={registration} />
                ))}
              </div>

              {filteredRegistrations.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No registrations found</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roster">
          <RosterManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground">Registration analytics and reporting coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showRegistrationDetail && selectedRegistration && (
        <RegistrationDetailDialog
          registration={selectedRegistration}
          onClose={() => setShowRegistrationDetail(false)}
        />
      )}

      {showBookingDialog && (
        <RegistrationBookingDialog
          onClose={() => setShowBookingDialog(false)}
        />
      )}

      {showBulkActions && (
        <RegistrationBulkActionsDialog
          selectedRegistrations={selectedRegistrations}
          onClose={() => setShowBulkActions(false)}
          onComplete={() => {
            setShowBulkActions(false);
            setSelectedRegistrations([]);
          }}
        />
      )}
    </div>
  );
}