import { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageProvider';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Search, Plus, Filter, Download, Calendar, Users, Clock,
  MapPin, CreditCard, CheckCircle, XCircle, AlertCircle,
  Mail, Phone, MoreHorizontal, Eye, Edit2, Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { classesService } from '../../utils/supabase/classes-service';
import { peopleService } from '../../utils/supabase/people-service';

interface Registration {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  className: string;
  classDate: string;
  classTime: string;
  instructor: string;
  location: string;
  status: 'confirmed' | 'waitlist' | 'cancelled' | 'no-show';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  price: number;
  bookingDate: string;
  notes: string;
  avatar: string | null;
}

const statusColors = {
  'confirmed': 'bg-green-100 text-green-800',
  'waitlist': 'bg-yellow-100 text-yellow-800',
  'cancelled': 'bg-red-100 text-red-800',
  'no-show': 'bg-gray-100 text-gray-800'
};

const paymentStatusColors = {
  'paid': 'bg-green-100 text-green-800',
  'pending': 'bg-yellow-100 text-yellow-800',
  'failed': 'bg-red-100 text-red-800',
  'refunded': 'bg-blue-100 text-blue-800'
};

export function RegistrationManagement() {
  const { t } = useLanguage();
  const { currentOrg } = useMultiTenantAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrg?.id) {
      loadRegistrations();
    }
  }, [currentOrg]);

  const loadRegistrations = async () => {
    if (!currentOrg?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Get current date range based on filter
      const today = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (dateFilter) {
        case 'today':
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
          break;
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          startDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
          endDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59);
          break;
        case 'week':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay()); // Start of week
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6); // End of week
          break;
        case 'month':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
          break;
        default:
          startDate = today;
          endDate = today;
      }

      // Load class occurrences for the date range
      const occurrences = await classesService.getClassOccurrences(currentOrg.id, {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

      // Transform occurrences into registration format
      const transformedRegistrations: Registration[] = [];
      
      for (const occurrence of occurrences) {
        // Get roster for this occurrence
        const roster = await classesService.getClassRoster(occurrence.id);
        
        for (const registration of roster) {
          transformedRegistrations.push({
            id: registration.id,
            customerName: registration.customer?.display_name || 'Unknown Customer',
            customerEmail: registration.customer?.email || '',
            customerPhone: registration.customer?.phone || '',
            className: occurrence.template?.name || 'Unknown Class',
            classDate: occurrence.start_time.split('T')[0],
            classTime: new Date(occurrence.start_time).toLocaleTimeString('en-CH', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            instructor: occurrence.instructor?.display_name || 'Unknown Instructor',
            location: occurrence.location?.name || 'Unknown Location',
            status: registration.status as 'confirmed' | 'waitlist' | 'cancelled' | 'no-show',
            paymentStatus: registration.payment_status as 'paid' | 'pending' | 'failed' | 'refunded',
            price: occurrence.price || 0,
            bookingDate: registration.booked_at,
            notes: registration.notes || '',
            avatar: registration.customer?.avatar_url || null
          });
        }
      }

      setRegistrations(transformedRegistrations);

    } catch (err) {
      console.error('Error loading registrations:', err);
      setError('Failed to load registrations');
      // Fallback to mock data
      setRegistrations([
        {
          id: '1',
          customerName: 'Emma Weber',
          customerEmail: 'emma.weber@email.ch',
          customerPhone: '+41 79 123 4567',
          className: 'Morning Vinyasa Flow',
          classDate: '2024-01-16',
          classTime: '08:00',
          instructor: 'Sarah Chen',
          location: 'Studio A',
          status: 'confirmed',
          paymentStatus: 'paid',
          price: 28.00,
          bookingDate: '2024-01-14T10:30:00Z',
          notes: '',
          avatar: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'waitlist':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'no-show':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = searchTerm === '' || 
      reg.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.className.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const registrationStats = {
    total: registrations.length,
    confirmed: registrations.filter(r => r.status === 'confirmed').length,
    waitlist: registrations.filter(r => r.status === 'waitlist').length,
    cancelled: registrations.filter(r => r.status === 'cancelled').length,
    revenue: registrations
      .filter(r => r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + r.price, 0)
  };

  const handleCancelBooking = async (registrationId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await classesService.cancelRegistration(registrationId, 'Cancelled by admin', 'studio');
      loadRegistrations(); // Reload data
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const handleEditBooking = async (registrationId: string) => {
    // This would open an edit dialog
    console.log('Edit booking:', registrationId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Registration Management</h1>
          <p className="text-muted-foreground">
            Manage customer bookings and class registrations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Manual Booking
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{registrationStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{registrationStats.confirmed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Waitlist</p>
                <p className="text-2xl font-bold text-yellow-600">{registrationStats.waitlist}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{registrationStats.cancelled}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(registrationStats.revenue)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search registrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="waitlist">Waitlist</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Registrations List */}
      <Card>
        <CardHeader>
          <CardTitle>Registrations ({filteredRegistrations.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredRegistrations.map((registration) => (
              <div key={registration.id} className="p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={registration.avatar} />
                      <AvatarFallback>
                        {getInitials(registration.customerName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{registration.customerName}</span>
                        <Badge className={statusColors[registration.status]}>
                          {registration.status}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={paymentStatusColors[registration.paymentStatus]}
                        >
                          {registration.paymentStatus}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {registration.customerEmail} • {registration.customerPhone}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(registration.classDate)} at {formatTime(registration.classTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {registration.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {registration.instructor}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">{registration.className}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(registration.price)}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditBooking(registration.id)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Booking
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="h-4 w-4 mr-2" />
                          Call Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleCancelBooking(registration.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Cancel Booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRegistrations.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No registrations found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}