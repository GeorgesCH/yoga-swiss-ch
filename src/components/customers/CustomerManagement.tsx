import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../LanguageProvider';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { enhancedPeopleService } from '../../utils/supabase/enhanced-services';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { 
  Search, Plus, Filter, Download, Upload, MessageSquare, 
  User, CreditCard, Calendar, FileText, Settings, 
  Phone, Mail, MapPin, Tag, TrendingUp, Clock, Wallet,
  ChevronRight, Star, AlertCircle, Check, X,
  MoreHorizontal, Eye, Edit2, Trash2, Send, Cloud
} from 'lucide-react';
import { CustomerDetailDialog } from './CustomerDetailDialog';
import { CustomerSegmentDialog } from './CustomerSegmentDialog';
import { CustomerImportDialog } from './CustomerImportDialog';
import { CustomerBulkActionsDialog } from './CustomerBulkActionsDialog';
import { CreateCustomerDialog } from './CreateCustomerDialog';
import { DeploymentHelper } from '../DeploymentHelper';

// Mock data removed - now using real backend service

const statusColors = {
  'Active': 'bg-green-100 text-green-800',
  'Inactive': 'bg-gray-100 text-gray-800', 
  'Trial': 'bg-blue-100 text-blue-800',
  'Suspended': 'bg-red-100 text-red-800'
};

const riskColors = {
  'Low': 'text-green-600',
  'Medium': 'text-yellow-600',
  'High': 'text-red-600'
};

const tagColors = {
  'VIP': 'bg-purple-100 text-purple-800',
  'First-timer': 'bg-blue-100 text-blue-800',
  'Corporate': 'bg-indigo-100 text-indigo-800',
  'Regular': 'bg-green-100 text-green-800',
  'Student': 'bg-cyan-100 text-cyan-800',
  'At-Risk': 'bg-red-100 text-red-800',
  'Premium': 'bg-amber-100 text-amber-800',
  'Instructor': 'bg-violet-100 text-violet-800',
  'New': 'bg-emerald-100 text-emerald-800',
  'Trial': 'bg-sky-100 text-sky-800'
};

export function CustomerManagement() {
  const { t } = useLanguage();
  const { session, currentOrg } = useMultiTenantAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [showSegmentDialog, setShowSegmentDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [showDeploymentHelper, setShowDeploymentHelper] = useState(false);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load customers data
  useEffect(() => {
    loadCustomers();
  }, [session]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 Customer Management - Loading customers with enhanced service');
      
      // Use enhanced service that returns demo data when database is not ready
      const orgId = currentOrg?.id || 'dfaa741f-720c-4bb7-93db-2867c4dc2d36';
      const result = await enhancedPeopleService.getCustomers(orgId, {
        page: 1,
        limit: 100,
        search: '',
        status: 'all',
        sortBy: 'created_at',
        sortOrder: 'desc'
      });
      
      if (result.error) {
        setError(result.error);
        console.error('Error loading customers:', result.error);
      } else {
        // Transform the enhanced service response to match Customer interface
        const customerData = result.data?.data?.map((customer: any) => ({
          id: customer.id,
          email: customer.customer?.email || customer.email,
          firstName: customer.customer?.first_name || customer.first_name || 'Unknown',
          lastName: customer.customer?.last_name || customer.last_name || 'Customer',
          phone: customer.customer?.phone || customer.phone || '',
          avatar: customer.customer?.avatar_url || customer.avatar_url || '',
          language: customer.customer?.preferred_locale || customer.language || 'en-CH',
          status: customer.is_active ? 'Active' : 'Inactive',
          city: 'Zürich', // Default city for demo data
          joinedDate: customer.joined_at || customer.created_at,
          lastActivity: customer.updated_at || new Date().toISOString(),
          totalSpent: customer.customer?.orders?.reduce((sum: number, order: any) => sum + (order.total_cents || 0), 0) || 0,
          classCount: customer.customer?.registrations?.[0]?.count || 0,
          walletBalance: customer.customer?.wallets?.[0]?.credit_balance || 0,
          tags: ['Regular'], // Default tags for demo data
          riskLevel: 'Low' // Default risk level
        })) || [];
        
        setCustomers(customerData);
        console.log('Loaded customers:', customerData.length);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load customers';
      setError(errorMessage);
      console.error('Error in loadCustomers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filters from actual data
  const statuses = [...new Set(customers.map(c => c.status))];
  const cities = ['Zürich', 'Genève', 'Basel', 'Bern', 'Lausanne', 'Lugano']; // Swiss cities
  const languages = [...new Set(customers.map(c => c.language?.replace('-CH', '')))];

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = searchTerm === '' || 
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm));
      
      const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
      const matchesLanguage = selectedTag === 'all' || customer.language?.includes(selectedTag);
      const matchesCity = selectedCity === 'all'; // City filtering can be implemented when city data is added

      return matchesSearch && matchesStatus && matchesLanguage && matchesCity;
    });

    // Sort customers
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case 'lastActivity':
          aValue = new Date(a.lastActivity || 0).getTime();
          bValue = new Date(b.lastActivity || 0).getTime();
          break;
        case 'walletBalance':
          aValue = a.walletBalance;
          bValue = b.walletBalance;
          break;
        case 'joinedDate':
          aValue = new Date(a.joinedDate || 0).getTime();
          bValue = new Date(b.joinedDate || 0).getTime();
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
  }, [customers, searchTerm, selectedStatus, selectedTag, selectedCity, sortBy, sortOrder]);

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const toggleAllCustomers = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const openCustomerDetail = (customer: any) => {
    setSelectedCustomer(customer);
    setShowCustomerDetail(true);
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

  const CustomerListItem = ({ customer }: { customer: Customer }) => (
    <div className="flex items-center p-4 border-b hover:bg-gray-50 cursor-pointer"
         onClick={() => openCustomerDetail(customer)}>
      <Checkbox 
        checked={selectedCustomers.includes(customer.id)}
        onCheckedChange={() => toggleCustomerSelection(customer.id)}
        onClick={(e) => e.stopPropagation()}
      />
      
      <Avatar className="w-10 h-10 ml-3">
        <AvatarImage src={customer.avatar} />
        <AvatarFallback>{getInitials(customer.firstName, customer.lastName)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 ml-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <div className="font-medium">
                {customer.firstName} {customer.lastName}
              </div>
              <div className="text-sm text-gray-600 flex items-center space-x-2">
                <span>{customer.email}</span>
                {customer.phone && (
                  <>
                    <span>•</span>
                    <span>{customer.phone}</span>
                  </>
                )}
              </div>
            </div>
            
            <Badge className={statusColors[customer.status] || 'bg-gray-100 text-gray-800'}>
              {customer.status}
            </Badge>

            <Badge variant="outline" className="text-xs">
{customer.language?.replace('-CH', '').toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600">            
            <div className="text-right">
              <div className="font-medium">{customer.activePasses} passes</div>
              <div className="text-xs">Active</div>
            </div>
            
            <div className="text-right">
              <div className="font-medium">
                {formatCurrency(customer.walletBalance)}
              </div>
              <div className="text-xs">Wallet balance</div>
            </div>

            <div className="text-right">
              <div className="font-medium">
                {formatDate(customer.joinedDate)}
              </div>
              <div className="text-xs">Joined</div>
            </div>

            <div className="flex items-center space-x-1">
              {customer.marketingConsent && (
                <Mail className="w-4 h-4 text-blue-500" />
              )}
            </div>

            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage customer profiles, memberships, and relationships
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={() => setShowSegmentDialog(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Segments
          </Button>
          <Button onClick={() => setShowCreateCustomer(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
                <p className="text-xs text-muted-foreground">
                  All registered customers
                </p>
              </div>
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.status === 'Active').length}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  Currently active
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trial Members</p>
                <p className="text-2xl font-bold text-blue-600">
                  {customers.filter(c => c.status === 'Trial').length}
                </p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  In trial period
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
                <p className="text-sm font-medium text-muted-foreground">Total Wallet Balance</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(customers.reduce((sum, c) => sum + c.walletBalance, 0))}
                </p>
                <p className="text-xs text-muted-foreground">
                  Across all customers
                </p>
              </div>
              <Wallet className="w-8 h-8 text-muted-foreground" />
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
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-3">
              {selectedCustomers.length > 0 && (
                <Button variant="outline" onClick={() => setShowBulkActions(true)}>
                  <Send className="w-4 h-4 mr-2" />
                  Actions ({selectedCustomers.length})
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
                  <SelectItem value="lastActivity">Last Activity</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="walletBalance">Wallet Balance</SelectItem>
                  <SelectItem value="joinedDate">Joined Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Select All Header */}
          <div className="flex items-center p-4 border-b bg-gray-50">
            <Checkbox 
              checked={selectedCustomers.length === filteredCustomers.length}
              onCheckedChange={toggleAllCustomers}
            />
            <span className="ml-3 text-sm font-medium">
              {filteredCustomers.length} customers 
              {selectedCustomers.length > 0 && ` (${selectedCustomers.length} selected)`}
            </span>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-12 text-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading customers...</p>
            </div>
          )}

          {/* Demo Mode Information */}
          {error && error.includes('demo data') && customers.length > 0 && (
            <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Demo Mode Active
                  </h4>
                  <p className="text-sm text-blue-700 mb-2">
                    You're viewing demonstration data. To connect to your Supabase backend:
                  </p>
                  <ol className="text-xs text-blue-600 list-decimal list-inside space-y-1">
                    <li>Deploy the Edge Function: <code className="bg-blue-100 px-1 rounded">supabase functions deploy make-server-f0b2daa4</code></li>
                    <li>Run database migrations: <code className="bg-blue-100 px-1 rounded">supabase db push</code></li>
                    <li>Refresh this page to connect to live data</li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => setShowDeploymentHelper(true)}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Deployment Guide
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={loadCustomers}
                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                  >
                    Retry Connection
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error State - but don't show it if we have customers (demo data) */}
          {error && !error.includes('demo data') && customers.length === 0 && (
            <div className="p-12 text-center text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">API Connection Issue</h3>
              <p className="mb-4 text-sm">
                Unable to connect to the backend API. Please check your Supabase configuration.
              </p>
              <div className="text-xs text-muted-foreground mb-4 bg-yellow-50 p-3 rounded border">
                <strong>Technical Details:</strong> {error}
              </div>
              <Button onClick={loadCustomers} variant="outline">
                Retry Connection
              </Button>
            </div>
          )}

          {/* Customer List */}
          {!loading && !error && (
            <div className="divide-y">
              {filteredCustomers.map(customer => (
                <CustomerListItem key={customer.id} customer={customer} />
              ))}
            </div>
          )}

          {!loading && !error && filteredCustomers.length === 0 && customers.length > 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No customers found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}

          {!loading && !error && customers.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No customers yet</h3>
              <p className="mb-4">Start by adding your first customer</p>
              <Button onClick={() => setShowCreateCustomer(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showCustomerDetail && selectedCustomer && (
        <CustomerDetailDialog
          customer={selectedCustomer}
          onClose={() => setShowCustomerDetail(false)}
        />
      )}

      {showSegmentDialog && (
        <CustomerSegmentDialog
          onClose={() => setShowSegmentDialog(false)}
        />
      )}

      {showImportDialog && (
        <CustomerImportDialog
          onClose={() => setShowImportDialog(false)}
        />
      )}

      {showBulkActions && (
        <CustomerBulkActionsDialog
          selectedCustomers={selectedCustomers}
          onClose={() => setShowBulkActions(false)}
          onComplete={() => {
            setShowBulkActions(false);
            setSelectedCustomers([]);
          }}
        />
      )}

      {showCreateCustomer && (
        <CreateCustomerDialog
          onClose={() => setShowCreateCustomer(false)}
          onCustomerCreated={(customer) => {
            // Add the new customer to the existing list
            setCustomers(prevCustomers => [customer, ...prevCustomers]);
            setShowCreateCustomer(false);
          }}
        />
      )}

      {showDeploymentHelper && (
        <DeploymentHelper
          onClose={() => setShowDeploymentHelper(false)}
        />
      )}
    </div>
  );
}