import { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { 
  Search, Calendar, Clock, MapPin, Users, 
  CheckCircle, XCircle, Timer, AlertCircle,
  User, Phone, Mail, Plus, QrCode,
  MoreHorizontal, Edit2, MessageSquare,
  FileText, CreditCard, RefreshCw
} from 'lucide-react';

// Mock data for today's classes with roster
const mockClassesWithRoster = [
  {
    id: 'c1',
    className: 'Vinyasa Flow',
    instructor: 'Sarah Chen',
    date: '2024-01-22',
    time: '09:00',
    duration: 75,
    location: 'Studio A',
    capacity: 20,
    registrations: [
      {
        id: 'r1',
        customer: {
          id: 'c1',
          firstName: 'Emma',
          lastName: 'Weber',
          email: 'emma.weber@email.ch',
          phone: '+41 79 123 4567',
          avatar: null
        },
        status: 'confirmed',
        entitlementType: 'membership',
        checkinStatus: 'present',
        checkinAt: '2024-01-22T08:55:00',
        attendanceStatus: 'present',
        notes: '',
        paymentStatus: 'paid'
      },
      {
        id: 'r2',
        customer: {
          id: 'c2',
          firstName: 'Marc',
          lastName: 'Dubois',
          email: 'marc.dubois@email.ch',
          phone: '+41 76 234 5678',
          avatar: null
        },
        status: 'confirmed',
        entitlementType: 'drop_in',
        checkinStatus: null,
        checkinAt: null,
        attendanceStatus: null,
        notes: '',
        paymentStatus: 'paid'
      },
      {
        id: 'r3',
        customer: {
          id: 'c3',
          firstName: 'Sofia',
          lastName: 'Rossi',
          email: 'sofia.rossi@email.ch',
          phone: '+41 78 345 6789',
          avatar: null
        },
        status: 'pending_payment',
        entitlementType: 'drop_in',
        checkinStatus: null,
        checkinAt: null,
        attendanceStatus: null,
        notes: 'Payment pending - allow check-in with staff override',
        paymentStatus: 'pending'
      },
      {
        id: 'r4',
        customer: {
          id: 'c4',
          firstName: 'Anna',
          lastName: 'Müller',
          email: 'anna.mueller@email.ch',
          phone: '+41 79 567 8901',
          avatar: null
        },
        status: 'confirmed',
        entitlementType: 'trial',
        checkinStatus: 'late',
        checkinAt: '2024-01-22T09:10:00',
        attendanceStatus: 'late',
        notes: 'First class - provided mat',
        paymentStatus: 'paid'
      },
      {
        id: 'r5',
        customer: {
          id: 'c5',
          firstName: 'James',
          lastName: 'Smith',
          email: 'james.smith@email.ch',
          phone: '+41 77 456 7890',
          avatar: null
        },
        status: 'confirmed',
        entitlementType: 'credits',
        checkinStatus: null,
        checkinAt: null,
        attendanceStatus: 'no_show',
        notes: 'No-show - credits returned',
        paymentStatus: 'paid'
      }
    ],
    waitlist: [
      {
        id: 'w1',
        customer: {
          id: 'c6',
          firstName: 'Lisa',
          lastName: 'Anderson',
          email: 'lisa.anderson@email.ch',
          phone: '+41 78 123 4567',
          avatar: null
        },
        position: 1,
        joinedAt: '2024-01-21T16:30:00',
        status: 'active'
      }
    ]
  },
  {
    id: 'c2',
    className: 'Hot Yoga',
    instructor: 'Lisa Anderson',
    date: '2024-01-22',
    time: '18:30',
    duration: 60,
    location: 'Studio C',
    capacity: 25,
    registrations: [
      // Mock data would go here - simplified for brevity
    ],
    waitlist: []
  }
];

export function RosterManagement() {
  const { t } = useLanguage();
  const [selectedClass, setSelectedClass] = useState(mockClassesWithRoster[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('today');
  const [activeView, setActiveView] = useState<'checkin' | 'attendance' | 'waitlist'>('checkin');

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-CH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCheckinStatusColor = (status: string | null) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'no_show':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCheckinStatusIcon = (status: string | null) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'late':
        return <Timer className="w-4 h-4 text-yellow-600" />;
      case 'no_show':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleCheckin = (registrationId: string, status: 'present' | 'late') => {
    // Implementation would update the registration status
    console.log('Check-in:', registrationId, status);
  };

  const handleNoShow = (registrationId: string) => {
    // Implementation would mark as no-show and apply policies
    console.log('Mark no-show:', registrationId);
  };

  const handleAddWalkIn = () => {
    // Implementation would open walk-in booking dialog
    console.log('Add walk-in customer');
  };

  const handlePromoteWaitlist = (waitlistId: string) => {
    // Implementation would promote from waitlist
    console.log('Promote from waitlist:', waitlistId);
  };

  const getClassStats = (classData: any) => {
    const total = classData.registrations.length;
    const present = classData.registrations.filter(r => r.checkinStatus === 'present').length;
    const late = classData.registrations.filter(r => r.checkinStatus === 'late').length;
    const noShow = classData.registrations.filter(r => r.attendanceStatus === 'no_show').length;
    const pending = classData.registrations.filter(r => !r.checkinStatus && r.attendanceStatus !== 'no_show').length;
    
    return { total, present, late, noShow, pending };
  };

  const stats = getClassStats(selectedClass);

  return (
    <div className="space-y-6">
      {/* Header with Class Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Roster & Check-in</h2>
          <p className="text-muted-foreground">
            Manage attendance and check-ins for today's classes
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
          
          <Button>
            <QrCode className="w-4 h-4 mr-2" />
            QR Check-in
          </Button>
        </div>
      </div>

      {/* Class Selection Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          {mockClassesWithRoster.map(cls => (
            <button
              key={cls.id}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                selectedClass.id === cls.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSelectedClass(cls)}
            >
              <div className="text-left">
                <div>{cls.className}</div>
                <div className="text-xs">
                  {formatTime(cls.time)} • {cls.location}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Present</p>
                <p className="text-xl font-bold text-green-600">{stats.present}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Late</p>
                <p className="text-xl font-bold text-yellow-600">{stats.late}</p>
              </div>
              <Timer className="w-5 h-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">No Show</p>
                <p className="text-xl font-bold text-red-600">{stats.noShow}</p>
              </div>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-gray-600">{stats.pending}</p>
              </div>
              <Clock className="w-5 h-5 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="font-medium">{selectedClass.className}</h3>
                <p className="text-sm text-muted-foreground">
                  with {selectedClass.instructor}
                </p>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatTime(selectedClass.time)} ({selectedClass.duration}min)</span>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{selectedClass.location}</span>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{selectedClass.registrations.length}/{selectedClass.capacity}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleAddWalkIn}>
                <Plus className="w-4 h-4 mr-2" />
                Walk-in
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roster Views */}
      <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
        <TabsList>
          <TabsTrigger value="checkin">Check-in</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist ({selectedClass.waitlist.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Class Roster</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search roster..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="divide-y">
                {selectedClass.registrations.map(registration => (
                  <div key={registration.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={registration.customer.avatar} />
                          <AvatarFallback>
                            {getInitials(registration.customer.firstName, registration.customer.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="font-medium">
                            {registration.customer.firstName} {registration.customer.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {registration.customer.email}
                          </div>
                        </div>

                        <Badge variant="outline" className="capitalize">
                          {registration.entitlementType.replace('_', ' ')}
                        </Badge>

                        {registration.paymentStatus === 'pending' && (
                          <Badge variant="destructive" className="text-xs">
                            Payment Pending
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          {registration.checkinAt && (
                            <div className="text-muted-foreground">
                              Checked in: {formatDateTime(registration.checkinAt)}
                            </div>
                          )}
                          {registration.notes && (
                            <div className="text-xs text-blue-600 max-w-48 truncate">
                              {registration.notes}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {registration.checkinStatus ? (
                            <Badge className={getCheckinStatusColor(registration.checkinStatus)}>
                              {getCheckinStatusIcon(registration.checkinStatus)}
                              <span className="ml-1 capitalize">
                                {registration.checkinStatus.replace('_', ' ')}
                              </span>
                            </Badge>
                          ) : (
                            <div className="flex space-x-1">
                              <Button 
                                size="sm"
                                onClick={() => handleCheckin(registration.id, 'present')}
                                disabled={registration.paymentStatus === 'pending'}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Check In
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleCheckin(registration.id, 'late')}
                                disabled={registration.paymentStatus === 'pending'}
                              >
                                <Timer className="w-4 h-4 mr-1" />
                                Late
                              </Button>
                            </div>
                          )}
                        </div>

                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Final Attendance</CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="divide-y">
                {selectedClass.registrations.map(registration => (
                  <div key={registration.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={registration.customer.avatar} />
                          <AvatarFallback className="text-xs">
                            {getInitials(registration.customer.firstName, registration.customer.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="font-medium">
                            {registration.customer.firstName} {registration.customer.lastName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Select 
                          value={registration.attendanceStatus || 'pending'} 
                          onValueChange={(value) => console.log('Update attendance:', registration.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                            <SelectItem value="no_show">No Show</SelectItem>
                            <SelectItem value="excused">Excused</SelectItem>
                          </SelectContent>
                        </Select>

                        {registration.attendanceStatus === 'no_show' && (
                          <Button size="sm" variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Apply Fee
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Waitlist ({selectedClass.waitlist.length})</CardTitle>
                <Button 
                  size="sm" 
                  disabled={selectedClass.waitlist.length === 0}
                  onClick={() => handlePromoteWaitlist(selectedClass.waitlist[0]?.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Promote Next
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {selectedClass.waitlist.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">No one on waitlist</h3>
                  <p>Waitlisted customers will appear here</p>
                </div>
              ) : (
                <div className="divide-y">
                  {selectedClass.waitlist.map((waitlistEntry, index) => (
                    <div key={waitlistEntry.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              #{waitlistEntry.position}
                            </span>
                          </div>
                          
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={waitlistEntry.customer.avatar} />
                            <AvatarFallback className="text-xs">
                              {getInitials(waitlistEntry.customer.firstName, waitlistEntry.customer.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="font-medium">
                              {waitlistEntry.customer.firstName} {waitlistEntry.customer.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Joined {formatDateTime(waitlistEntry.joinedAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm"
                            onClick={() => handlePromoteWaitlist(waitlistEntry.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Promote
                          </Button>
                          
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}