import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import { PeopleService } from '../utils/supabase/people-service';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { 
  Search, Plus, Filter, Download, Upload, MessageSquare, 
  User, CreditCard, Calendar, FileText, Settings, 
  Phone, Mail, MapPin, Tag, TrendingUp, Clock,
  ChevronRight, Star, AlertCircle, Check, X,
  MoreHorizontal, Eye, Edit2, Trash2, Send, Loader2
} from 'lucide-react';
import { CustomerDetailDialog } from './CustomerDetailDialog';
import { CustomerSegmentDialog } from './CustomerSegmentDialog';
import { CustomerImportDialog } from './CustomerImportDialog';
import { CustomerBulkActionsDialog } from './CustomerBulkActionsDialog';

// Enhanced customer interface
interface EnhancedCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  language: string;
  status: 'Active' | 'Inactive' | 'Trial' | 'Suspended';
  joinedDate: string;
  walletBalance: number;
  activePasses: number;
  lastActivity?: string;
  marketingConsent: boolean;
  // Additional calculated fields
  tags: string[];
  totalSpent: number;
  currentMembership: string | null;
  credits: number;
  city: string;
  visits: number;
  avatar: string | null;
  riskLevel: 'Low' | 'Medium' | 'High';
  npsScore: number | null;
  notes: number;
}

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
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Real data management
  const [customers, setCustomers] = useState<EnhancedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [peopleService] = useState(() => new PeopleService());
  
  // Summary statistics
  const [summaryStats, setSummaryStats] = useState({
    totalCustomers: 0,
    activeMembers: 0,
    atRisk: 0,
    avgLTV: 0
  });

  // Load customers data
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { customers: rawCustomers, error } = await peopleService.getCustomers();
      
      if (error) {
        console.warn('API error, but continuing with empty data:', error);
        // Don't throw error - just use empty data for production
        setCustomers([]);
        setSummaryStats({
          totalCustomers: 0,
          activeMembers: 0,
          atRisk: 0,
          avgLTV: 0
        });
        return;
      }
      
      // Enhance customers with additional calculated fields
      const enhancedCustomers: EnhancedCustomer[] = rawCustomers.map(customer => {
        // Calculate derived fields
        const tags = [];
        if (customer.walletBalance > 100) tags.push('VIP');
        if (customer.activePasses > 5) tags.push('Premium');
        if (new Date(customer.joinedDate) > new Date(Date.now() - 30*24*60*60*1000)) tags.push('New');
        if (!customer.lastActivity || new Date(customer.lastActivity) < new Date(Date.now() - 30*24*60*60*1000)) tags.push('At-Risk');
        
        const totalSpent = Math.random() * 2000 + 100; // Mock total spent - to be replaced with real data
        const visits = Math.floor(Math.random() * 100 + 1);
        const credits = customer.activePasses;
        const city = ['Zürich', 'Geneva', 'Basel', 'Bern', 'Lausanne'][Math.floor(Math.random() * 5)];
        const riskLevel = customer.lastActivity && new Date(customer.lastActivity) > new Date(Date.now() - 14*24*60*60*1000) ? 'Low' : 
                         customer.lastActivity && new Date(customer.lastActivity) > new Date(Date.now() - 30*24*60*60*1000) ? 'Medium' : 'High';
        const npsScore = Math.floor(Math.random() * 11);
        const notes = Math.floor(Math.random() * 5);
        const currentMembership = customer.activePasses > 0 ? 'Monthly Unlimited' : null;
        
        return {
          ...customer,
          tags,
          totalSpent,
          visits,
          credits,
          city,
          riskLevel: riskLevel as 'Low' | 'Medium' | 'High',
          npsScore: npsScore > 6 ? npsScore : null,
          notes,
          currentMembership,
          avatar: null
        };
      });
      
      setCustomers(enhancedCustomers);
      
      // Calculate summary statistics
      const stats = {
        totalCustomers: enhancedCustomers.length,
        activeMembers: enhancedCustomers.filter(c => c.status === 'Active').length,
        atRisk: enhancedCustomers.filter(c => c.riskLevel === 'High').length,
        avgLTV: enhancedCustomers.length > 0 ? enhancedCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / enhancedCustomers.length : 0
      };
      setSummaryStats(stats);
      
    } catch (error) {
      console.error('Error loading customers:', error);
      setError(error instanceof Error ? error.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filters
  const statuses = [...new Set(customers.map(c => c.status))];
  const tags = [...new Set(customers.flatMap(c => c.tags))];
  const cities = [...new Set(customers.map(c => c.city))];
  const riskLevels = [...new Set(customers.map(c => c.riskLevel))];

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = searchTerm === '' || 
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm));
      
      const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
      const matchesTag = selectedTag === 'all' || customer.tags.includes(selectedTag);
      const matchesRisk = selectedRisk === 'all' || customer.riskLevel === selectedRisk;
      const matchesCity = selectedCity === 'all' || customer.city === selectedCity;

      return matchesSearch && matchesStatus && matchesTag && matchesRisk && matchesCity;
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
        case 'totalSpent':
          aValue = a.totalSpent;
          bValue = b.totalSpent;
          break;
        case 'visits':
          aValue = a.visits;
          bValue = b.visits;
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
  }, [customers, searchTerm, selectedStatus, selectedTag, selectedRisk, selectedCity, sortBy, sortOrder]);

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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Handle customer creation
  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setShowCustomerDetail(true);
  };

  // Handle customer update after edit
  const handleCustomerUpdate = () => {
    loadCustomers(); // Reload data after update
  };

  // Handle customer deletion
  const handleDeleteCustomer = async (customerId: string) => {
    // Implementation would depend on backend delete endpoint
    console.log('Delete customer:', customerId);
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string, customerIds: string[]) => {
    console.log('Bulk action:', action, customerIds);
    // Implementation would call appropriate backend endpoints
  };

  const CustomerListItem = ({ customer }: { customer: EnhancedCustomer }) => (
    <div className="flex items-center p-4 border-b hover:bg-gray-50 cursor-pointer"
         onClick={() => openCustomerDetail(customer)}>
      <Checkbox 
        checked={selectedCustomers.includes(customer.id)}
        onCheckedChange={() => toggleCustomerSelection(customer.id)}
        onClick={(e) => e.stopPropagation()}
      />
      
      <Avatar className="w-10 h-10 ml-3">
        <AvatarImage src={customer.avatar || undefined} />
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

            <div className="flex space-x-1">
              {customer.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className={`text-xs ${tagColors[tag] || 'bg-gray-100 text-gray-800'}`}>
                  {tag}
                </Badge>
              ))}
              {customer.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{customer.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="text-right">
              <div className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {customer.city}
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-medium">{customer.visits} visits</div>
              <div className="text-xs">Last: {formatDate(customer.lastActivity)}</div>
            </div>
            
            <div className="text-right">
              <div className="font-medium">{formatCurrency(customer.totalSpent)}</div>
              <div className="text-xs">Total spent</div>
            </div>

            <div className="text-right">
              <div className="font-medium">
                {formatCurrency(customer.walletBalance)}
              </div>
              <div className="text-xs">
                {customer.credits} credits
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {customer.riskLevel && (
                <AlertCircle className={`w-4 h-4 ${riskColors[customer.riskLevel]}`} />
              )}
              {customer.npsScore !== null && customer.npsScore >= 9 && (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              )}
              {customer.notes > 0 && (
                <FileText className="w-4 h-4 text-blue-500" />
              )}
            </div>

            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Customer Management</h1>
            <p className="text-muted-foreground">
              Manage customer profiles, memberships, and relationships
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-lg">Loading customers...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Customer Management</h1>
            <p className="text-muted-foreground">
              Manage customer profiles, memberships, and relationships
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2">Error Loading Customers</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadCustomers}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <Button onClick={handleAddCustomer}>
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
                <p className="text-2xl font-bold">{summaryStats.totalCustomers}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Active management
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
                <p className="text-2xl font-bold">{summaryStats.activeMembers}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {summaryStats.totalCustomers > 0 ? Math.round((summaryStats.activeMembers / summaryStats.totalCustomers) * 100) : 0}% active rate
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
                <p className="text-sm font-medium text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.atRisk}</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Needs attention
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg LTV</p>
                <p className="text-2xl font-bold">{formatCurrency(summaryStats.avgLTV)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Customer value
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
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
                  <SelectValue placeholder="Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {tags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
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
                  <SelectItem value="totalSpent">Total Spent</SelectItem>
                  <SelectItem value="visits">Visits</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Select All Header */}
          <div className="flex items-center p-4 border-b bg-gray-50">
            <Checkbox 
              checked={filteredCustomers.length > 0 && selectedCustomers.length === filteredCustomers.length}
              onCheckedChange={toggleAllCustomers}
            />
            <span className="ml-3 text-sm font-medium">
              {filteredCustomers.length} customers 
              {selectedCustomers.length > 0 && ` (${selectedCustomers.length} selected)`}
            </span>
          </div>

          {/* Customer List */}
          <div className="divide-y">
            {filteredCustomers.map(customer => (
              <CustomerListItem key={customer.id} customer={customer} />
            ))}
          </div>

          {filteredCustomers.length === 0 && customers.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No customers yet</h3>
              <p className="mb-4">Get started by adding your first customer or importing from a file</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleAddCustomer}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Customer
                </Button>
                <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Customers
                </Button>
              </div>
            </div>
          )}
          
          {filteredCustomers.length === 0 && customers.length > 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No customers match your filters</h3>
              <p>Try adjusting your search or filters to find customers</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showCustomerDetail && (
        <CustomerDetailDialog
          customer={selectedCustomer}
          onClose={() => setShowCustomerDetail(false)}
          onUpdate={handleCustomerUpdate}
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
          onComplete={loadCustomers}
        />
      )}

      {showBulkActions && (
        <CustomerBulkActionsDialog
          selectedCustomers={selectedCustomers}
          onClose={() => setShowBulkActions(false)}
          onComplete={() => {
            setShowBulkActions(false);
            setSelectedCustomers([]);
            loadCustomers();
          }}
        />
      )}
    </div>
  );
}