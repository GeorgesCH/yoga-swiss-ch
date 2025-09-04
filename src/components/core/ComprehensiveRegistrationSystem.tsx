import React, { useState, useEffect } from 'react';
import { 
  User, Users, UserPlus, UserCheck, UserX, Clock, Calendar, 
  CreditCard, Smartphone, Mail, Phone, MapPin, Star, Tag,
  Filter, Search, MoreHorizontal, Eye, Edit, Trash2, Send,
  CheckCircle, AlertCircle, X, Plus, Download, Upload,
  Bell, MessageSquare, Gift, Zap, RefreshCw, Activity,
  Settings
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

  // Mock data for registration forms
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
        },
        {
          id: 'lastName',
          type: 'text',
          label: 'Last Name',
          required: true,
          validation: { minLength: 2, maxLength: 50 }
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          required: true
        },
        {
          id: 'phone',
          type: 'phone',
          label: 'Phone Number',
          required: true
        },
        {
          id: 'emergencyContact',
          type: 'text',
          label: 'Emergency Contact',
          required: true
        },
        {
          id: 'medicalConditions',
          type: 'textarea',
          label: 'Medical Conditions or Injuries',
          placeholder: 'Please list any medical conditions we should be aware of',
          required: false
        },
        {
          id: 'experience',
          type: 'select',
          label: 'Yoga Experience',
          required: true,
          options: ['Beginner', 'Some Experience', 'Intermediate', 'Advanced']
        }
      ]
    },
    {
      id: 'form-2',
      name: 'Workshop Registration',
      description: 'Detailed registration form for workshops and special events',
      type: 'workshop',
      isActive: true,
      requiresApproval: true,
      autoConfirm: false,
      paymentRequired: true,
      waiverRequired: true,
      thankYouMessage: 'Thank you for your workshop registration! We will review your application and get back to you within 24 hours.',
      notifications: {
        email: true,
        sms: false,
        admin: true
      },
      restrictions: {
        maxRegistrations: 20,
        registrationDeadline: '2024-01-25T23:59:59Z'
      },
      fields: [
        {
          id: 'firstName',
          type: 'text',
          label: 'First Name',
          required: true
        },
        {
          id: 'lastName',
          type: 'text',
          label: 'Last Name',
          required: true
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          required: true
        },
        {
          id: 'phone',
          type: 'phone',
          label: 'Phone Number',
          required: true
        },
        {
          id: 'experience',
          type: 'select',
          label: 'Yoga Experience',
          required: true,
          options: ['Beginner', 'Some Experience', 'Intermediate', 'Advanced']
        },
        {
          id: 'motivation',
          type: 'textarea',
          label: 'Why do you want to attend this workshop?',
          required: true,
          validation: { minLength: 50, maxLength: 500 }
        },
        {
          id: 'dietaryRestrictions',
          type: 'textarea',
          label: 'Dietary Restrictions',
          placeholder: 'Please list any dietary restrictions for meals',
          required: false
        }
      ]
    }
  ];

  // Mock data for registrations
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
    },
    {
      id: 'reg-2',
      formId: 'form-2',
      formName: 'Workshop Registration',
      customer: {
        id: 'cust-2',
        firstName: 'Marc',
        lastName: 'Dubois',
        email: 'marc.dubois@email.ch',
        phone: '+41 76 234 5678'
      },
      submittedAt: '2024-01-14T14:20:00Z',
      status: 'pending',
      paymentStatus: 'completed',
      amount: 120.00,
      paymentMethod: 'Credit Card',
      waiverSigned: true,
      source: 'mobile_app',
      data: {
        firstName: 'Marc',
        lastName: 'Dubois',
        email: 'marc.dubois@email.ch',
        phone: '+41 76 234 5678',
        experience: 'Intermediate',
        motivation: 'I want to deepen my understanding of yoga philosophy and improve my practice.',
        dietaryRestrictions: 'Vegetarian'
      }
    },
    {
      id: 'reg-3',
      formId: 'form-1',
      formName: 'Class Registration',
      customer: {
        id: 'cust-3',
        firstName: 'Sofia',
        lastName: 'Rossi',
        email: 'sofia.rossi@email.ch',
        phone: '+41 78 345 6789'
      },
      submittedAt: '2024-01-13T16:45:00Z',
      status: 'waitlisted',
      paymentStatus: 'pending',
      amount: 28.00,
      paymentMethod: 'Credit Card',
      waiverSigned: false,
      source: 'website',
      data: {
        firstName: 'Sofia',
        lastName: 'Rossi',
        email: 'sofia.rossi@email.ch',
        phone: '+41 78 345 6789',
        emergencyContact: 'Giuseppe Rossi (+41 78 987 6543)',
        experience: 'Beginner',
        medicalConditions: 'Lower back pain'
      }
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock },
      approved: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700 border-red-300', icon: X },
      waitlisted: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Clock },
      cancelled: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: X }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="outline">{status}</Badge>;
    
    return (
      <Badge className={config.color}>
        <config.icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-700', text: 'Pending' },
      completed: { color: 'bg-green-100 text-green-700', text: 'Completed' },
      failed: { color: 'bg-red-100 text-red-700', text: 'Failed' },
      refunded: { color: 'bg-gray-100 text-gray-700', text: 'Refunded' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="outline">{status}</Badge>;
    
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const handleStatusChange = (registrationId: string, newStatus: string) => {
    console.log('Changing status:', registrationId, newStatus);
    // Update registration status
  };

  const handleBulkAction = (action: string) => {
    console.log('Bulk action:', action, 'on registrations:', selectedRegistrations);
    setShowBulkActions(false);
    setSelectedRegistrations([]);
  };

  const renderRegistrationsList = () => (
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
                    {getStatusBadge(registration.status)}
                    {getPaymentStatusBadge(registration.paymentStatus)}
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
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-medium">{registration.customer.phone}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Submitted:</span>
                      <p className="font-medium">{formatDate(registration.submittedAt)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <p className="font-medium">{formatCurrency(registration.amount)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3 text-muted-foreground" />
                      {registration.paymentMethod}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {registration.source}
                    </div>
                    {registration.waiverSigned ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Waiver signed
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        Waiver pending
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
                    setSelectedRegistration(registration);
                    setShowRegistrationDetail(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(registration.id, 'approved')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(registration.id, 'rejected')}>
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(registration.id, 'waitlisted')}>
                      <Clock className="h-4 w-4 mr-2" />
                      Waitlist
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Registration
                    </DropdownMenuItem>
                    <Separator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderFormsList = () => (
    <div className="space-y-4">
      {registrationForms.map((form) => (
        <Card key={form.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{form.name}</CardTitle>
                <CardDescription>{form.description}</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{form.type}</Badge>
                  <Badge className={form.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {form.requiresApproval && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      Requires Approval
                    </Badge>
                  )}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setEditingForm(form);
                    setShowFormBuilder(true);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Form
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Activity className="h-4 w-4 mr-2" />
                    View Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                <span className="text-muted-foreground">Waiver:</span>
                <p className="font-medium">{form.waiverRequired ? 'Required' : 'Not Required'}</p>
              </div>
            </div>
            
            {form.restrictions.maxRegistrations && (
              <div className="mt-3">
                <Progress 
                  value={(registrations.filter(r => r.formId === form.id).length / form.restrictions.maxRegistrations!) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {registrations.filter(r => r.formId === form.id).length} / {form.restrictions.maxRegistrations} registrations
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

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
        <TabsList>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search registrations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="waitlisted">Waitlisted</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={formFilter} onValueChange={setFormFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
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
                    <SelectTrigger className="w-32">
                      <SelectValue />
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
                
                <div className="flex items-center gap-3">
                  {selectedRegistrations.length > 0 && (
                    <Button variant="outline" onClick={() => setShowBulkActions(true)}>
                      Actions ({selectedRegistrations.length})
                    </Button>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {filteredRegistrations.length} registrations
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {renderRegistrationsList()}
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          {renderFormsList()}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Approved</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(stats.approved / stats.total) * 100} className="w-20" />
                      <span className="text-sm font-medium">{stats.approved}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(stats.pending / stats.total) * 100} className="w-20" />
                      <span className="text-sm font-medium">{stats.pending}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rejected</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(stats.rejected / stats.total) * 100} className="w-20" />
                      <span className="text-sm font-medium">{stats.rejected}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registration Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['website', 'mobile_app', 'admin', 'walk_in'].map((source) => {
                    const count = registrations.filter(r => r.source === source).length;
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    
                    return (
                      <div key={source} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{source.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-20" />
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Registration Detail Dialog */}
      <Dialog open={showRegistrationDetail} onOpenChange={setShowRegistrationDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRegistration && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Registration Details - {selectedRegistration.customer.firstName} {selectedRegistration.customer.lastName}
                </DialogTitle>
                <DialogDescription>
                  {selectedRegistration.formName} submitted on {formatDate(selectedRegistration.submittedAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <p className="font-medium">{selectedRegistration.customer.firstName} {selectedRegistration.customer.lastName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{selectedRegistration.customer.email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <p className="font-medium">{selectedRegistration.customer.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Registration Status</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="mt-1">{getStatusBadge(selectedRegistration.status)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Payment:</span>
                        <div className="mt-1">{getPaymentStatusBadge(selectedRegistration.paymentStatus)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <p className="font-medium">{formatCurrency(selectedRegistration.amount)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Form Data</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedRegistration.data).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-muted-foreground text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <p className="font-medium">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleStatusChange(selectedRegistration.id, 'approved')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button variant="outline" onClick={() => handleStatusChange(selectedRegistration.id, 'rejected')}>
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Form Builder Dialog */}
      <Dialog open={showFormBuilder} onOpenChange={setShowFormBuilder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingForm ? 'Edit Registration Form' : 'Create Registration Form'}
            </DialogTitle>
            <DialogDescription>
              Build custom registration forms with dynamic fields and validation
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 border border-border rounded-lg">
            <div className="text-center text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Advanced Form Builder</p>
              <p className="text-sm">Drag-and-drop form builder with conditional logic and validation</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Apply actions to {selectedRegistrations.length} selected registrations
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => handleBulkAction('approve')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve All
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => handleBulkAction('reject')}>
              <X className="h-4 w-4 mr-2" />
              Reject All
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => handleBulkAction('waitlist')}>
              <Clock className="h-4 w-4 mr-2" />
              Move to Waitlist
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => handleBulkAction('message')}>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => handleBulkAction('export')}>
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}