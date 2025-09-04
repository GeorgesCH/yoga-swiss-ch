import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, MoreHorizontal, Users, UserCheck, Calendar,
  Clock, Mail, Phone, MapPin, Badge as BadgeIcon, Star, Activity,
  Building2, Briefcase, DollarSign, FileText, Camera, Edit,
  Trash2, Eye, CheckCircle, AlertTriangle, Calendar as CalendarIcon,
  Download, Upload, Settings, AlertCircle
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { peopleService, PeopleService, type StaffMember } from '../../utils/supabase/people-service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

export function StaffManagement() {
  const { session } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Load staff data
  useEffect(() => {
    loadStaff();
  }, [session]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize service with access token
      const service = session?.access_token 
        ? new PeopleService(session.access_token)
        : peopleService;
      
      const { staff: staffData, error: staffError } = await service.getStaff();
      
      // Always use the staff data (including mock data)
      setStaff(staffData || []);
      console.log('Loaded staff:', staffData?.length || 0);
      
      // Only show error if we got no data at all
      if (staffError && (!staffData || staffData.length === 0)) {
        console.warn('Staff service error (using fallback):', staffError);
        // Don't set error state since we have fallback data
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load staff';
      console.error('Error in loadStaff:', err);
      // Don't set error state, service should provide fallback data
      setStaff([]); // Set empty array as final fallback
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(staffMember => {
    const matchesSearch = `${staffMember.firstName} ${staffMember.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || staffMember.status === statusFilter;
    const matchesRole = roleFilter === 'all' || staffMember.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Get unique values for filters
  const statuses = [...new Set(staff.map(s => s.status))];
  const roles = [...new Set(staff.map(s => s.role))];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>;
      case 'Inactive':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Inactive</Badge>;
      case 'On Leave':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">On Leave</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage your studio team, schedules, and performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>
                  Create a new staff member profile with role and permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="Enter first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Enter last name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@yogaswiss.ch" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+41 79 123 4567" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="studio-manager">Studio Manager</SelectItem>
                        <SelectItem value="assistant-manager">Assistant Manager</SelectItem>
                        <SelectItem value="front-desk">Front Desk Coordinator</SelectItem>
                        <SelectItem value="customer-service">Customer Service</SelectItem>
                        <SelectItem value="marketing">Marketing Coordinator</SelectItem>
                        <SelectItem value="maintenance">Maintenance Specialist</SelectItem>
                        <SelectItem value="cleaner">Cleaner</SelectItem>
                        <SelectItem value="part-time">Part-time Assistant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="customer-service">Customer Service</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="facilities">Facilities</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permissions">Permissions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Manage Staff', 'View Reports', 'Schedule Classes', 'Manage Customers', 'Process Payments', 'Facility Access'].map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <input type="checkbox" id={permission.toLowerCase().replace(' ', '-')} />
                        <Label htmlFor={permission.toLowerCase().replace(' ', '-')} className="text-sm">
                          {permission}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowCreateDialog(false)}>
                    Add Staff Member
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-semibold">{loading ? '...' : staff.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Staff</p>
                <p className="text-2xl font-semibold">{loading ? '...' : staff.filter(s => s.status === 'Active').length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Roles</p>
                <p className="text-2xl font-semibold">{loading ? '...' : roles.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Languages</p>
                <p className="text-2xl font-semibold">{loading ? '...' : [...new Set(staff.map(s => s.language))].length}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="staff" className="w-full">
        <TabsList>
          <TabsTrigger value="staff">Staff Directory</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-12 text-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading staff...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-12 text-center text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Error Loading Staff</h3>
              <p className="mb-4">{error}</p>
              <Button onClick={loadStaff} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Staff List */}
          {!loading && !error && (
            <div className="space-y-4">
              {filteredStaff.map((staffMember) => (
                <Card key={staffMember.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          {staffMember.avatar ? (
                            <AvatarImage src={staffMember.avatar} alt={`${staffMember.firstName} ${staffMember.lastName}`} />
                          ) : (
                            <AvatarFallback>{getInitials(staffMember.firstName, staffMember.lastName)}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">{staffMember.firstName} {staffMember.lastName}</h3>
                            {getStatusBadge(staffMember.status)}
                            <Badge variant="outline" className="text-xs">
                              {staffMember.role}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Role:</span>
                              <p className="font-medium">{staffMember.role}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Joined:</span>
                              <p className="font-medium">{new Date(staffMember.joinedDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Language:</span>
                              <p className="font-medium">{staffMember.language}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {staffMember.email}
                            </div>
                            {staffMember.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {staffMember.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStaff(staffMember);
                            setShowDetailDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BadgeIcon className="h-4 w-4 mr-2" />
                              Manage Permissions
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && !error && filteredStaff.length === 0 && staff.length > 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No staff members found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}

          {!loading && !error && staff.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No staff members yet</h3>
              <p className="mb-4">Start by adding your first staff member</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="p-8 text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Department management coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <div className="p-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Schedule management coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="p-8 text-center text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Performance management coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}