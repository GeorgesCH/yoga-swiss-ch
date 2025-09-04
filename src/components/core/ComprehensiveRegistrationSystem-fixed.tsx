import React, { useState, useEffect } from 'react';
import { 
  User, Users, UserPlus, UserCheck, UserX, Clock, Calendar, 
  CreditCard, Smartphone, Mail, Phone, MapPin, Star, Tag,
  Filter, Search, MoreHorizontal, Eye, Edit, Trash2, Send,
  CheckCircle, AlertCircle, X, Plus, Download, Upload,
  Bell, MessageSquare, Gift, Zap, RefreshCw, Activity,
  Settings // Add Settings import
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

interface RegistrationForm {
  id: string;
  name: string;
  description: string;
  type: 'class' | 'workshop' | 'membership' | 'retreat' | 'trial';
  fields: FormField[];
  isActive: boolean;
  requiresApproval: boolean;
  autoConfirm: boolean;
  paymentRequired: boolean;
  waiverRequired: boolean;
  customCSS?: string;
  thankYouMessage: string;
  redirectUrl?: string;
  notifications: {
    email: boolean;
    sms: boolean;
    admin: boolean;
  };
  restrictions: {
    maxRegistrations?: number;
    registrationDeadline?: string;
    ageRestriction?: { min?: number; max?: number; };
    membershipRequired?: string[];
  };
}

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'multiselect' | 'checkbox' | 'textarea' | 'date' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  conditionalLogic?: {
    showIf: { fieldId: string; value: string; };
  };
}

interface Registration {
  id: string;
  formId: string;
  formName: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted' | 'cancelled';
  data: Record<string, any>;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: number;
  paymentMethod: string;
  notes?: string;
  adminNotes?: string;
  waiverSigned: boolean;
  source: 'website' | 'mobile_app' | 'admin' | 'walk_in';
  referralCode?: string;
  discountApplied?: {
    code: string;
    amount: number;
    type: 'percentage' | 'fixed';
  };
}

interface RegistrationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  conversionRate: number;
  averageProcessingTime: number;
  revenue: number;
}

export function ComprehensiveRegistrationSystem() {
  const [activeTab, setActiveTab] = useState<'registrations' | 'forms' | 'analytics'>('registrations');
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formFilter, setFormFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7days');
  const [showRegistrationDetail, setShowRegistrationDetail] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState<RegistrationForm | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Mock data for registrations - simplified version to avoid file size issues
  const registrations: Registration[] = [
    {
      id: 'reg-1',
      formId: 'form-1',
      formName: 'Class Registration',
      customer: {
        id: 'cust-1',
        firstName: 'Emma',
        lastName: 'Weber',
        email: 'emma.weber@email.ch',
        phone: '+41 79 123 4567',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
      },
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'approved',
      paymentStatus: 'completed',
      amount: 28.00,
      paymentMethod: 'TWINT',
      waiverSigned: true,
      source: 'website',
      data: {
        firstName: 'Emma',
        lastName: 'Weber',
        email: 'emma.weber@email.ch',
        phone: '+41 79 123 4567',
        emergencyContact: 'Hans Weber (+41 79 987 6543)',
        experience: 'Some Experience',
        medicalConditions: 'None'
      }
    }
  ];

  const registrationForms: RegistrationForm[] = [
    {
      id: 'form-1',
      name: 'Class Registration',
      description: 'Standard registration form for drop-in classes',
      type: 'class',
      isActive: true,
      requiresApproval: false,
      autoConfirm: true,
      paymentRequired: true,
      waiverRequired: true,
      thankYouMessage: 'Thank you for registering! You will receive a confirmation email shortly.',
      notifications: {
        email: true,
        sms: true,
        admin: true
      },
      restrictions: {
        registrationDeadline: '2024-01-20T18:00:00Z'
      },
      fields: [
        {
          id: 'firstName',
          type: 'text',
          label: 'First Name',
          required: true,
          validation: { minLength: 2, maxLength: 50 }
        }
      ]
    }
  ];

  const calculateStats = (): RegistrationStats => {
    const total = registrations.length;
    const pending = registrations.filter(r => r.status === 'pending').length;
    const approved = registrations.filter(r => r.status === 'approved').length;
    const rejected = registrations.filter(r => r.status === 'rejected').length;
    const conversionRate = total > 0 ? (approved / total) * 100 : 0;
    const revenue = registrations
      .filter(r => r.paymentStatus === 'completed')
      .reduce((sum, r) => sum + r.amount, 0);
    
    return {
      total,
      pending,
      approved,
      rejected,
      conversionRate,
      averageProcessingTime: 2.5, // hours
      revenue
    };
  };

  const [stats, setStats] = useState<RegistrationStats>(calculateStats());

  useEffect(() => {
    setStats(calculateStats());
  }, [registrations]);

  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = registration.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.formName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || registration.status === statusFilter;
    const matchesForm = formFilter === 'all' || registration.formId === formFilter;
    const matchesSource = sourceFilter === 'all' || registration.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesForm && matchesSource;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="text-2xl font-semibold">Registration Management</h1>
          <p className="text-muted-foreground">
            Comprehensive registration system with form builder and automation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => {
            setEditingForm(null);
            setShowFormBuilder(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Registrations</p>
                <p className="text-2xl font-semibold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-semibold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-semibold">{stats.conversionRate.toFixed(1)}%</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-semibold">{formatCurrency(stats.revenue)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search registrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
            />
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <TabsContent value="registrations" className="space-y-4">
          {/* Registration filters */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={formFilter} onValueChange={setFormFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Forms</SelectItem>
                {registrationForms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="mobile_app">Mobile App</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="walk_in">Walk-in</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Registrations list */}
          <div className="space-y-4">
            {filteredRegistrations.map((registration) => (
              <Card key={registration.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedRegistrations.includes(registration.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRegistrations([...selectedRegistrations, registration.id]);
                          } else {
                            setSelectedRegistrations(selectedRegistrations.filter(id => id !== registration.id));
                          }
                        }}
                      />
                      
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={registration.customer.avatar} alt={`${registration.customer.firstName} ${registration.customer.lastName}`} />
                        <AvatarFallback>
                          {registration.customer.firstName[0]}{registration.customer.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {registration.customer.firstName} {registration.customer.lastName}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {registration.formName}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <p className="font-medium">{registration.customer.email}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Submitted:</span>
                            <p className="font-medium">{formatDate(registration.submittedAt)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <p className="font-medium">{formatCurrency(registration.amount)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant="outline">{registration.status}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRegistration(registration);
                          setShowRegistrationDetail(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <div className="space-y-4">
            {registrationForms.map((form) => (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{form.name}</CardTitle>
                      <CardDescription>{form.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Fields:</span>
                      <p className="font-medium">{form.fields.length}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Registrations:</span>
                      <p className="font-medium">
                        {registrations.filter(r => r.formId === form.id).length}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payment:</span>
                      <p className="font-medium">{form.paymentRequired ? 'Required' : 'Optional'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={form.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {form.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registration Analytics</CardTitle>
              <CardDescription>Overview of registration performance and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.conversionRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.averageProcessingTime}h</p>
                  <p className="text-sm text-muted-foreground">Avg. Processing Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.revenue)}</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Registrations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}