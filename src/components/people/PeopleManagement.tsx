import React, { useState, useEffect } from 'react';
import { Users, UserCog, UserCheck, Wallet, MessageSquare, Plus, Search, Filter, Download } from 'lucide-react';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { enhancedPeopleService } from '../../utils/supabase/enhanced-services';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CustomerManagement } from '../customers/CustomerManagement';
import { InstructorManagement } from '../instructors/InstructorManagement';
import { StaffManagement } from '../staff/StaffManagement';
import { CustomerWalletManager } from '../core/CustomerWalletManager';
import { CommunicationsManagement } from '../communications/CommunicationsManagement';
import { DevelopmentBanner } from '../DevelopmentBanner';
import { ApiConnectionTest } from '../ApiConnectionTest';

interface PeopleManagementProps {
  onPageChange?: (page: string) => void;
}

export function PeopleManagement({ onPageChange }: PeopleManagementProps) {
  const { session } = useMultiTenantAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('customers');
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeInstructors: 0,
    staffMembers: 0,
    totalWalletBalance: 0
  });
  const [loading, setLoading] = useState(true);

  // Load people statistics
  useEffect(() => {
    loadStats();
  }, [session]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Initialize service with access token
      const service = session?.access_token 
        ? new PeopleService(session.access_token)
        : peopleService;
      
      // Load all people data
      const [customersResult, instructorsResult, staffResult, walletsResult] = await Promise.all([
        service.getCustomers(),
        service.getInstructors(),
        service.getStaff(),
        service.getWallets()
      ]);
      
      setStats({
        totalCustomers: customersResult.customers?.length || 0,
        activeInstructors: instructorsResult.instructors?.length || 0,
        staffMembers: staffResult.staff?.length || 0,
        totalWalletBalance: walletsResult.wallets?.reduce((sum, w) => sum + w.balance, 0) || 0
      });
    } catch (error) {
      console.error('Error loading people stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const peopleStats = [
    {
      title: 'Total Customers',
      value: loading ? '...' : stats.totalCustomers.toString(),
      change: 'All registered customers',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Active Instructors',
      value: loading ? '...' : stats.activeInstructors.toString(),
      change: 'Teaching staff',
      icon: UserCog,
      color: 'text-green-600'
    },
    {
      title: 'Staff Members',
      value: loading ? '...' : stats.staffMembers.toString(),
      change: 'Admin & support staff',
      icon: UserCheck,
      color: 'text-purple-600'
    },
    {
      title: 'Customer Wallets',
      value: loading ? '...' : formatCurrency(stats.totalWalletBalance),
      change: 'Total balance',
      icon: Wallet,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Development Banner */}
      <DevelopmentBanner />
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">People Management</h1>
          <p className="text-muted-foreground">
            Manage customers, instructors, staff, and communications in one place
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Removed demo seeding in production */}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Person
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {peopleStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* API Connection Test */}
        <div className="flex-shrink-0">
          <ApiConnectionTest />
        </div>
      </div>

      {/* People Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="instructors" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Instructors
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Staff
          </TabsTrigger>
          <TabsTrigger value="wallets" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallets
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Customer Management</h3>
              <p className="text-muted-foreground">Manage your studio customers and their memberships</p>
            </div>
            <Badge variant="secondary">{stats.totalCustomers} customers</Badge>
          </div>
          <CustomerManagement />
        </TabsContent>

        <TabsContent value="instructors" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Instructor Management</h3>
              <p className="text-muted-foreground">Manage instructors, schedules, and payments</p>
            </div>
            <Badge variant="secondary">{stats.activeInstructors} instructors</Badge>
          </div>
          <InstructorManagement />
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Staff Management</h3>
              <p className="text-muted-foreground">Manage staff members, roles, and permissions</p>
            </div>
            <Badge variant="secondary">{stats.staffMembers} staff members</Badge>
          </div>
          <StaffManagement />
        </TabsContent>

        <TabsContent value="wallets" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Customer Wallets</h3>
              <p className="text-muted-foreground">Manage customer credits, refunds, and wallet balances</p>
            </div>
            <Badge variant="secondary">{formatCurrency(stats.totalWalletBalance)} total balance</Badge>
          </div>
          <CustomerWalletManager />
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Communications</h3>
              <p className="text-muted-foreground">Send messages, notifications, and manage communications</p>
            </div>
            <Badge variant="secondary">Email, SMS, Push</Badge>
          </div>
          <CommunicationsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
