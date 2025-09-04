import React, { useState, useEffect } from 'react';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Wallet,
  CreditCard,
  Plus,
  Minus,
  History,
  Gift,
  Package,
  User,
  MoreHorizontal,
  Eye,
  Ban,
  RotateCcw,
  Download,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins
} from 'lucide-react';
import { getSupabaseProjectId } from '../../utils/supabase/env';

interface CustomerWallet {
  id: string;
  org_id: string;
  user_id: string;
  kind: 'customer' | 'gift' | 'promotion';
  currency: string;
  balance_cents: number;
  credits: number;
  status: 'active' | 'frozen' | 'closed';
  metadata: {
    created_by?: string;
    notes?: string;
  };
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_email?: string;
}

interface WalletTransaction {
  id: string;
  wallet_id: string;
  timestamp: string;
  entry_type: 'debit' | 'credit';
  amount_cents: number;
  credits_delta: number;
  reason: string;
  metadata: {
    description?: string;
    initiated_by?: string;
  };
}

interface WalletPackage {
  id: string;
  org_id: string;
  kind: 'pack' | 'membership' | 'gift_card';
  name: string;
  description?: string;
  price_cents: number;
  tax_mode: 'inclusive' | 'exclusive';
  vat_rate: number;
  credits?: number;
  duration_days?: number;
  features: {
    shareable: boolean;
    transferable: boolean;
    per_org_only: boolean;
    auto_renewal: boolean;
  };
  status: 'active' | 'archived';
  created_at: string;
}

export function WalletManagement() {
  const { currentOrg, hasPermission } = useMultiTenantAuth();
  const [wallets, setWallets] = useState<CustomerWallet[]>([]);
  const [packages, setPackages] = useState<WalletPackage[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<CustomerWallet | null>(null);
  const [walletHistory, setWalletHistory] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false);
  const [showCreatePackageDialog, setShowCreatePackageDialog] = useState(false);
  const [addFundsData, setAddFundsData] = useState({
    amount_chf: '',
    credits: '',
    reason: 'manual_adjustment',
    description: ''
  });
  const [newPackageData, setNewPackageData] = useState({
    name: '',
    description: '',
    kind: 'pack' as 'pack' | 'membership' | 'gift_card',
    price_chf: '',
    credits: '',
    duration_days: '',
    tax_mode: 'inclusive' as 'inclusive' | 'exclusive',
    vat_rate: '7.7',
    features: {
      shareable: false,
      transferable: false,
      per_org_only: true,
      auto_renewal: false
    }
  });

  // Check permissions
  if (!hasPermission('finance')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Ban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to access wallet management.
          </p>
        </div>
      </div>
    );
  }

  // API helper function
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Org-ID': currentOrg?.id || '',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API call failed');
    }
    
    return response.json();
  };

  // Format CHF currency
  const formatCHF = (amountCents: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amountCents / 100);
  };

  // Load wallets
  const loadWallets = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`/wallets/${currentOrg?.id}`);
      setWallets(data.wallets || []);
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load packages
  const loadPackages = async () => {
    try {
      const data = await apiCall(`/orgs/${currentOrg?.id}/packages`);
      setPackages(data.packages || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  };

  // Load wallet history
  const loadWalletHistory = async (walletId: string) => {
    try {
      const data = await apiCall(`/orgs/${currentOrg?.id}/wallets/${walletId}/history`);
      setWalletHistory(data.history || []);
    } catch (error) {
      console.error('Error loading wallet history:', error);
    }
  };

  // Add funds to wallet
  const handleAddFunds = async () => {
    if (!selectedWallet) return;

    try {
      const amountCents = parseFloat(addFundsData.amount_chf) * 100 || 0;
      const credits = parseInt(addFundsData.credits) || 0;

      await apiCall(`/orgs/${currentOrg?.id}/wallets/${selectedWallet.id}/add`, {
        method: 'POST',
        body: JSON.stringify({
          amount_cents: amountCents,
          credits,
          reason: addFundsData.reason,
          description: addFundsData.description
        })
      });

      setShowAddFundsDialog(false);
      setAddFundsData({ amount_chf: '', credits: '', reason: 'manual_adjustment', description: '' });
      await loadWallets();
      if (selectedWallet) {
        await loadWalletHistory(selectedWallet.id);
      }
    } catch (error) {
      console.error('Error adding funds:', error);
    }
  };

  // Create package
  const handleCreatePackage = async () => {
    try {
      const priceCents = parseFloat(newPackageData.price_chf) * 100;
      const credits = newPackageData.kind === 'pack' ? parseInt(newPackageData.credits) : undefined;
      const durationDays = newPackageData.kind === 'membership' ? parseInt(newPackageData.duration_days) : undefined;

      await apiCall(`/orgs/${currentOrg?.id}/packages`, {
        method: 'POST',
        body: JSON.stringify({
          ...newPackageData,
          price_cents: priceCents,
          credits,
          duration_days: durationDays,
          vat_rate: parseFloat(newPackageData.vat_rate)
        })
      });

      setShowCreatePackageDialog(false);
      setNewPackageData({
        name: '',
        description: '',
        kind: 'pack',
        price_chf: '',
        credits: '',
        duration_days: '',
        tax_mode: 'inclusive',
        vat_rate: '7.7',
        features: {
          shareable: false,
          transferable: false,
          per_org_only: true,
          auto_renewal: false
        }
      });
      await loadPackages();
    } catch (error) {
      console.error('Error creating package:', error);
    }
  };

  useEffect(() => {
    if (currentOrg) {
      loadWallets();
      loadPackages();
    }
  }, [currentOrg]);

  // Filter wallets
  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = !searchQuery || 
      wallet.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wallet.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || wallet.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate wallet statistics
  const walletStats = {
    totalBalance: wallets.reduce((sum, w) => sum + w.balance_cents, 0),
    totalCredits: wallets.reduce((sum, w) => sum + w.credits, 0),
    activeWallets: wallets.filter(w => w.status === 'active').length,
    totalWallets: wallets.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Wallet Management</h2>
          <p className="text-muted-foreground">
            Manage customer wallets, credits, and payment packages for {currentOrg?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => loadWallets()}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCHF(walletStats.totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Across all customer wallets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletStats.totalCredits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Credits in circulation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletStats.activeWallets}</div>
            <p className="text-xs text-muted-foreground">
              Out of {walletStats.totalWallets} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packages.length}</div>
            <p className="text-xs text-muted-foreground">
              Available for purchase
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="wallets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wallets">Customer Wallets</TabsTrigger>
          <TabsTrigger value="packages">Packages & Passes</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Status: {filterStatus === 'all' ? 'All' : filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('frozen')}>
                  Frozen
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('closed')}>
                  Closed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Wallets Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWallets.map((wallet) => (
                  <TableRow key={wallet.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {wallet.customer_name || 'Unknown Customer'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {wallet.customer_email || wallet.user_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={wallet.balance_cents > 0 ? 'text-green-600' : 'text-muted-foreground'}>
                        {formatCHF(wallet.balance_cents)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-muted-foreground" />
                        <span>{wallet.credits}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        wallet.status === 'active' ? 'default' :
                        wallet.status === 'frozen' ? 'secondary' : 'destructive'
                      }>
                        {wallet.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {wallet.kind}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(wallet.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedWallet(wallet);
                              loadWalletHistory(wallet.id);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedWallet(wallet);
                              setShowAddFundsDialog(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Funds
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <History className="h-4 w-4 mr-2" />
                            Transaction History
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredWallets.length === 0 && (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No wallets found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search criteria.' : 'Customer wallets will appear here when they make purchases.'}
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Payment Packages</h3>
            <Dialog open={showCreatePackageDialog} onOpenChange={setShowCreatePackageDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Package
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Payment Package</DialogTitle>
                  <DialogDescription>
                    Create a new credit pack, membership, or gift card package.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Package Name</Label>
                    <Input
                      value={newPackageData.name}
                      onChange={(e) => setNewPackageData({
                        ...newPackageData,
                        name: e.target.value
                      })}
                      placeholder="10 Class Pack"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Package Type</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newPackageData.kind}
                      onChange={(e) => setNewPackageData({
                        ...newPackageData,
                        kind: e.target.value as 'pack' | 'membership' | 'gift_card'
                      })}
                    >
                      <option value="pack">Credit Pack</option>
                      <option value="membership">Membership</option>
                      <option value="gift_card">Gift Card</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Price (CHF)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newPackageData.price_chf}
                      onChange={(e) => setNewPackageData({
                        ...newPackageData,
                        price_chf: e.target.value
                      })}
                      placeholder="250.00"
                    />
                  </div>

                  {newPackageData.kind === 'pack' && (
                    <div className="space-y-2">
                      <Label>Credits</Label>
                      <Input
                        type="number"
                        value={newPackageData.credits}
                        onChange={(e) => setNewPackageData({
                          ...newPackageData,
                          credits: e.target.value
                        })}
                        placeholder="10"
                      />
                    </div>
                  )}

                  {newPackageData.kind === 'membership' && (
                    <div className="space-y-2">
                      <Label>Duration (Days)</Label>
                      <Input
                        type="number"
                        value={newPackageData.duration_days}
                        onChange={(e) => setNewPackageData({
                          ...newPackageData,
                          duration_days: e.target.value
                        })}
                        placeholder="30"
                      />
                    </div>
                  )}

                  <div className="col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newPackageData.description}
                      onChange={(e) => setNewPackageData({
                        ...newPackageData,
                        description: e.target.value
                      })}
                      placeholder="Perfect for regular practitioners..."
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreatePackageDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePackage}
                    disabled={!newPackageData.name || !newPackageData.price_chf}
                  >
                    Create Package
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <Badge variant={pkg.kind === 'pack' ? 'default' : pkg.kind === 'membership' ? 'secondary' : 'outline'}>
                      {pkg.kind}
                    </Badge>
                  </div>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-medium">{formatCHF(pkg.price_cents)}</span>
                    </div>
                    {pkg.credits && (
                      <div className="flex justify-between">
                        <span>Credits:</span>
                        <span className="font-medium">{pkg.credits}</span>
                      </div>
                    )}
                    {pkg.duration_days && (
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{pkg.duration_days} days</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>VAT ({pkg.vat_rate}%):</span>
                      <span>{pkg.tax_mode}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest wallet transactions across all customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Transaction history will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Funds Dialog */}
      <Dialog open={showAddFundsDialog} onOpenChange={setShowAddFundsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds to Wallet</DialogTitle>
            <DialogDescription>
              Add CHF balance or credits to {selectedWallet?.customer_name || 'this customer'}'s wallet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (CHF)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={addFundsData.amount_chf}
                  onChange={(e) => setAddFundsData({
                    ...addFundsData,
                    amount_chf: e.target.value
                  })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Credits</Label>
                <Input
                  type="number"
                  value={addFundsData.credits}
                  onChange={(e) => setAddFundsData({
                    ...addFundsData,
                    credits: e.target.value
                  })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={addFundsData.reason}
                onChange={(e) => setAddFundsData({
                  ...addFundsData,
                  reason: e.target.value
                })}
              >
                <option value="manual_adjustment">Manual Adjustment</option>
                <option value="refund">Refund</option>
                <option value="compensation">Compensation</option>
                <option value="gift">Gift</option>
                <option value="promotion">Promotion</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={addFundsData.description}
                onChange={(e) => setAddFundsData({
                  ...addFundsData,
                  description: e.target.value
                })}
                placeholder="Reason for adding funds..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddFundsDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddFunds}
              disabled={!addFundsData.amount_chf && !addFundsData.credits}
            >
              Add Funds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
