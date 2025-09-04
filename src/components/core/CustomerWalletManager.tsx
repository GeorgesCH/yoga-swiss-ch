import React, { useState, useEffect } from 'react';
import { 
  Wallet, Plus, Minus, History, CreditCard, Gift, RefreshCw,
  ArrowUpRight, ArrowDownLeft, Calendar, Filter, Search, Download,
  TrendingUp, DollarSign, Users, Eye, Edit, MoreHorizontal, Zap, BarChart3
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useAuth } from '../auth/AuthProvider';
import { peopleService, PeopleService, type Wallet } from '../../utils/supabase/people-service';

interface CustomerWallet {
  id: string;
  customer_id: string;
  customer: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WalletTransaction {
  id: string;
  wallet_id: string;
  customer_id: string;
  type: 'credit' | 'debit';
  amount: number;
  balance_after: number;
  reason: string;
  reference_type: string;
  reference_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

interface WalletStats {
  total_customers: number;
  total_balance: number;
  total_transactions: number;
  avg_balance: number;
  monthly_credits: number;
  monthly_debits: number;
}

export function CustomerWalletManager() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'transactions' | 'analytics'>('overview');
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<CustomerWallet | null>(null);
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false);
  const [showWalletDetail, setShowWalletDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [addFundsReason, setAddFundsReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<WalletStats>({
    total_customers: 0,
    total_balance: 0,
    total_transactions: 0,
    avg_balance: 0,
    monthly_credits: 0,
    monthly_debits: 0
  });

  useEffect(() => {
    loadWallets();
    loadTransactions();
    loadStats();
  }, [session]);

  const loadWallets = async () => {
    setLoading(true);
    try {
      // Initialize service with access token
      const service = session?.access_token 
        ? new PeopleService(session.access_token)
        : peopleService;
      
      const { wallets: walletData, error: walletError } = await service.getWallets();
      
      if (walletError) {
        console.error('Error loading wallets:', walletError);
      } else {
        setWallets(walletData);
        console.log('Loaded wallets:', walletData.length);
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      // For now, just set empty transactions as we don't have transaction endpoints yet
      setTransactions([]);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadStats = async () => {
    const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    const activeWallets = wallets.filter(w => w.is_active);
    
    setStats({
      total_customers: activeWallets.length,
      total_balance: totalBalance,
      total_transactions: transactions.length,
      avg_balance: activeWallets.length > 0 ? totalBalance / activeWallets.length : 0,
      monthly_credits: transactions
        .filter(t => t.type === 'credit' && new Date(t.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .reduce((sum, t) => sum + t.amount, 0),
      monthly_debits: transactions
        .filter(t => t.type === 'debit' && new Date(t.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .reduce((sum, t) => sum + t.amount, 0)
    });
  };

  const handleAddFunds = async () => {
    if (!selectedWallet || !addFundsAmount || !addFundsReason) return;
    
    setIsProcessing(true);
    try {
      const service = session?.access_token 
        ? new PeopleService(session.access_token)
        : peopleService;
        
      await service.updateWalletBalance(
        selectedWallet.id,
        selectedWallet.balance + parseFloat(addFundsAmount),
        addFundsReason
      );
      
      setShowAddFundsDialog(false);
      setAddFundsAmount('');
      setAddFundsReason('');
      setSelectedWallet(null);
      
      // Reload data
      await loadWallets();
      await loadTransactions();
      
    } catch (error) {
      console.error('Error adding funds:', error);
      alert('Error adding funds. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
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

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? ArrowUpRight : ArrowDownLeft;
  };

  const getTransactionColor = (type: string) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  const filteredWallets = wallets.filter(wallet =>
    wallet.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = transactionFilter === 'all' || transaction.type === transactionFilter;
    const matchesDate = true; // Implement date filtering if needed
    return matchesFilter && matchesDate;
  });

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-semibold">{stats.total_customers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-semibold">{formatCurrency(stats.total_balance)}</p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Balance</p>
                <p className="text-2xl font-semibold">{formatCurrency(stats.avg_balance)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Credits</p>
                <p className="text-2xl font-semibold text-green-600">{formatCurrency(stats.monthly_credits)}</p>
              </div>
              <Plus className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest wallet activity across all customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent transactions</p>
              </div>
            ) : (
              filteredTransactions.slice(0, 10).map((transaction) => {
                const wallet = wallets.find(w => w.id === transaction.wallet_id);
                const TransactionIcon = getTransactionIcon(transaction.type);
                const colorClass = getTransactionColor(transaction.type);
                
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <TransactionIcon className={`h-4 w-4 ${colorClass}`} />
                      </div>
                      <div>
                        <p className="font-medium">{wallet?.customerName}</p>
                        <p className="text-sm text-muted-foreground">{transaction.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${colorClass}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Customer Wallets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWallets.map((wallet) => (
          <Card key={wallet.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {wallet.customerName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{wallet.customerName}</h3>
                    <p className="text-sm text-muted-foreground">{wallet.customerEmail}</p>
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
                      setSelectedWallet(wallet);
                      setShowWalletDetail(true);
                    }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelectedWallet(wallet);
                      setShowAddFundsDialog(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Funds
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <History className="h-4 w-4 mr-2" />
                      Transaction History
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Balance</span>
                  <span className="text-xl font-semibold">{formatCurrency(wallet.balance)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={wallet.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {wallet.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Transaction</span>
                  <span>{wallet.lastTransaction ? formatDateTime(wallet.lastTransaction) : 'Never'}</span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedWallet(wallet);
                    setShowAddFundsDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Funds
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setSelectedWallet(wallet);
                    setShowWalletDetail(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={transactionFilter} onValueChange={setTransactionFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="credit">Credits</SelectItem>
            <SelectItem value="debit">Debits</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                <p>Transaction history will appear here</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => {
                const wallet = wallets.find(w => w.id === transaction.wallet_id);
                const TransactionIcon = getTransactionIcon(transaction.type);
                const colorClass = getTransactionColor(transaction.type);
                
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <TransactionIcon className={`h-4 w-4 ${colorClass}`} />
                      </div>
                      <div>
                        <p className="font-medium">{wallet?.customerName}</p>
                        <p className="text-sm text-muted-foreground">{transaction.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.reference_type} • {formatDateTime(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${colorClass}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Balance: {formatCurrency(transaction.balance_after)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customer Wallet Management</h1>
          <p className="text-muted-foreground">
            Manage customer wallets, credits, and transaction history
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          {renderCustomers()}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {renderTransactions()}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="p-8 text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Advanced wallet analytics coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Funds Dialog */}
      <Dialog open={showAddFundsDialog} onOpenChange={setShowAddFundsDialog}>
        <DialogContent>
          {selectedWallet && (
            <>
              <DialogHeader>
                <DialogTitle>Add Funds to Wallet</DialogTitle>
                <DialogDescription>
                  Add credit to {selectedWallet.customerName}'s wallet
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedWallet.customerName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedWallet.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        Current Balance: {formatCurrency(selectedWallet.balance)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (CHF)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Select value={addFundsReason} onValueChange={setAddFundsReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Customer top-up">Customer top-up</SelectItem>
                      <SelectItem value="Refund credit">Refund credit</SelectItem>
                      <SelectItem value="Promotional credit">Promotional credit</SelectItem>
                      <SelectItem value="Compensation">Compensation</SelectItem>
                      <SelectItem value="Manual adjustment">Manual adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setShowAddFundsDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddFunds} 
                    disabled={isProcessing || !addFundsAmount || !addFundsReason}
                  >
                    {isProcessing ? 'Processing...' : 'Add Funds'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}