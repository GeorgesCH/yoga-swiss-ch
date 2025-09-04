import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Wallet,
  CreditCard,
  Plus,
  Minus,
  ArrowUpDown,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Gift,
  RefreshCw,
  History,
  User,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package
} from 'lucide-react';
import { shopService, Wallet as WalletType, WalletCredit } from '../../utils/supabase/shop-service';

interface WalletManagerProps {
  orgId: string;
}

interface WalletWithCustomer extends WalletType {
  customer: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface LedgerEntry {
  id: string;
  transaction_type: 'purchase' | 'redemption' | 'refund' | 'expiry' | 'transfer' | 'adjustment' | 'gift';
  amount_change?: number;
  credits_change?: number;
  balance_before?: number;
  balance_after?: number;
  credits_before?: number;
  credits_after?: number;
  description: string;
  reference_id?: string;
  reference_type?: string;
  created_at: string;
  performed_by?: string;
}

export function WalletManager({ orgId }: WalletManagerProps) {
  const [wallets, setWallets] = useState<WalletWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState<WalletWithCustomer | null>(null);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [creditTypeFilter, setCreditTypeFilter] = useState('all');
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);

  const creditTypes = [
    { value: 'class', label: 'Class Credits', icon: Package },
    { value: 'workshop', label: 'Workshop Credits', icon: Package },
    { value: 'retreat', label: 'Retreat Credits', icon: Package },
    { value: 'general', label: 'General Credits', icon: CreditCard }
  ];

  const transactionTypes = [
    { value: 'purchase', label: 'Purchase', icon: Plus, color: 'text-green-600' },
    { value: 'redemption', label: 'Redemption', icon: Minus, color: 'text-blue-600' },
    { value: 'refund', label: 'Refund', icon: RefreshCw, color: 'text-orange-600' },
    { value: 'expiry', label: 'Expiry', icon: Clock, color: 'text-red-600' },
    { value: 'transfer', label: 'Transfer', icon: ArrowUpDown, color: 'text-purple-600' },
    { value: 'adjustment', label: 'Adjustment', icon: AlertCircle, color: 'text-yellow-600' },
    { value: 'gift', label: 'Gift', icon: Gift, color: 'text-pink-600' }
  ];

  useEffect(() => {
    loadWallets();
  }, [orgId]);

  const loadWallets = async () => {
    try {
      setLoading(true);
      // This would fetch wallets with customer data
      // For now, using mock data
      const mockWallets: WalletWithCustomer[] = [
        {
          id: '1',
          customer_id: 'cust_1',
          org_id: orgId,
          balance: 150.00,
          currency: 'CHF',
          is_active: true,
          credits: [
            {
              id: 'cr_1',
              wallet_id: '1',
              credits: 5,
              credit_type: 'class',
              source_order_id: 'order_1',
              expires_at: '2025-03-01T00:00:00Z',
              is_active: true
            },
            {
              id: 'cr_2',
              wallet_id: '1',
              credits: 2,
              credit_type: 'workshop',
              source_order_id: 'order_2',
              expires_at: '2025-04-01T00:00:00Z',
              is_active: true
            }
          ],
          customer: {
            id: 'cust_1',
            full_name: 'Anna Müller',
            email: 'anna.mueller@example.com',
            avatar_url: undefined
          }
        },
        {
          id: '2',
          customer_id: 'cust_2',
          org_id: orgId,
          balance: 75.50,
          currency: 'CHF',
          is_active: true,
          credits: [
            {
              id: 'cr_3',
              wallet_id: '2',
              credits: 10,
              credit_type: 'class',
              source_order_id: 'order_3',
              expires_at: '2025-02-15T00:00:00Z',
              is_active: true
            }
          ],
          customer: {
            id: 'cust_2',
            full_name: 'Marco Rossi',
            email: 'marco.rossi@example.com',
            avatar_url: undefined
          }
        }
      ];
      setWallets(mockWallets);
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLedgerEntries = async (walletId: string) => {
    try {
      // Mock ledger entries
      const mockEntries: LedgerEntry[] = [
        {
          id: '1',
          transaction_type: 'purchase',
          credits_change: 5,
          credits_before: 0,
          credits_after: 5,
          description: 'Purchased 5-Class Package',
          reference_id: 'order_1',
          reference_type: 'order',
          created_at: '2024-12-01T10:00:00Z'
        },
        {
          id: '2',
          transaction_type: 'redemption',
          credits_change: -1,
          credits_before: 5,
          credits_after: 4,
          description: 'Redeemed 1 credit for Hatha Yoga class',
          reference_id: 'reg_1',
          reference_type: 'registration',
          created_at: '2024-12-05T18:30:00Z'
        },
        {
          id: '3',
          transaction_type: 'purchase',
          credits_change: 2,
          credits_before: 4,
          credits_after: 6,
          description: 'Purchased 2 Workshop Credits',
          reference_id: 'order_2',
          reference_type: 'order',
          created_at: '2024-12-10T14:15:00Z'
        }
      ];
      setLedgerEntries(mockEntries);
    } catch (error) {
      console.error('Error loading ledger entries:', error);
    }
  };

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = 
      wallet.customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wallet.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wallet.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCreditType = creditTypeFilter === 'all' || 
      wallet.credits.some(credit => credit.credit_type === creditTypeFilter);
    
    return matchesSearch && matchesCreditType;
  });

  const handleWalletClick = async (wallet: WalletWithCustomer) => {
    setSelectedWallet(wallet);
    await loadLedgerEntries(wallet.id);
    setShowWalletDialog(true);
  };

  const handleAddCredits = async (walletId: string, credits: number, creditType: string, description: string) => {
    try {
      await shopService.addCreditsToWallet(
        selectedWallet!.customer_id,
        orgId,
        credits,
        creditType,
        undefined, // No source order for manual additions
        undefined // No expiry for manual additions
      );
      
      // Reload data
      await loadWallets();
      if (selectedWallet) {
        await loadLedgerEntries(selectedWallet.id);
      }
      setShowTransactionDialog(false);
    } catch (error) {
      console.error('Error adding credits:', error);
    }
  };

  const getTransactionIcon = (type: string) => {
    const transactionType = transactionTypes.find(t => t.value === type);
    return transactionType?.icon || AlertCircle;
  };

  const getTransactionColor = (type: string) => {
    const transactionType = transactionTypes.find(t => t.value === type);
    return transactionType?.color || 'text-gray-600';
  };

  const calculateWalletStats = () => {
    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
    const totalCredits = wallets.reduce((sum, w) => 
      sum + w.credits.reduce((credSum, c) => credSum + c.credits, 0), 0
    );
    const expiringCredits = wallets.reduce((sum, w) => {
      const expiringCount = w.credits.filter(c => {
        if (!c.expires_at) return false;
        const expiryDate = new Date(c.expires_at);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow;
      }).reduce((credSum, c) => credSum + c.credits, 0);
      return sum + expiringCount;
    }, 0);

    return {
      total_balance: totalBalance,
      total_credits: totalCredits,
      active_wallets: wallets.filter(w => w.is_active).length,
      expiring_credits: expiringCredits
    };
  };

  const walletStats = calculateWalletStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wallet Management</h1>
          <p className="text-muted-foreground">
            Manage customer wallets, credits, and payment balances
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" onClick={loadWallets}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">CHF {walletStats.total_balance.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Balance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{walletStats.total_credits}</div>
                <div className="text-sm text-muted-foreground">Total Credits</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{walletStats.active_wallets}</div>
                <div className="text-sm text-muted-foreground">Active Wallets</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{walletStats.expiring_credits}</div>
                <div className="text-sm text-muted-foreground">Expiring Soon</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <Select value={creditTypeFilter} onValueChange={setCreditTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Credit Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Credit Types</SelectItem>
              {creditTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {filteredWallets.length} of {wallets.length} wallets
        </div>
      </div>

      {/* Credit Type Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {creditTypes.map((type) => {
          const totalCredits = wallets.reduce((sum, w) => {
            const typeCredits = w.credits
              .filter(c => c.credit_type === type.value)
              .reduce((credSum, c) => credSum + c.credits, 0);
            return sum + typeCredits;
          }, 0);
          
          const TypeIcon = type.icon;
          
          return (
            <Card key={type.value} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TypeIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{totalCredits}</div>
                    <div className="text-sm text-muted-foreground">{type.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Wallets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Wallets</CardTitle>
          <CardDescription>
            View and manage customer wallet balances and credits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 font-medium">Customer</th>
                  <th className="text-center pb-3 font-medium">Balance</th>
                  <th className="text-center pb-3 font-medium">Credits</th>
                  <th className="text-center pb-3 font-medium">Expiring Soon</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-right pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWallets.map((wallet) => {
                  const totalCredits = wallet.credits.reduce((sum, c) => sum + c.credits, 0);
                  const expiringCredits = wallet.credits.filter(c => {
                    if (!c.expires_at) return false;
                    const expiryDate = new Date(c.expires_at);
                    const thirtyDaysFromNow = new Date();
                    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                    return expiryDate <= thirtyDaysFromNow;
                  }).reduce((sum, c) => sum + c.credits, 0);
                  
                  return (
                    <tr key={wallet.id} className="border-b hover:bg-muted/50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{wallet.customer.full_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {wallet.customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <div className="font-medium">CHF {wallet.balance.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">{wallet.currency}</div>
                      </td>
                      <td className="py-4 text-center">
                        <div className="font-medium">{totalCredits}</div>
                        <div className="text-sm text-muted-foreground">
                          {wallet.credits.length} type{wallet.credits.length !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        {expiringCredits > 0 ? (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                            <Clock className="h-3 w-3 mr-1" />
                            {expiringCredits}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </td>
                      <td className="py-4 text-center">
                        {wallet.is_active ? (
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleWalletClick(wallet)}
                        >
                          <History className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Detail Dialog */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedWallet?.customer.full_name}'s Wallet
            </DialogTitle>
            <DialogDescription>
              Wallet balance, credits, and transaction history
            </DialogDescription>
          </DialogHeader>
          
          {selectedWallet && (
            <WalletDetailView
              wallet={selectedWallet}
              ledgerEntries={ledgerEntries}
              creditTypes={creditTypes}
              transactionTypes={transactionTypes}
              onAddCredits={() => setShowTransactionDialog(true)}
              getTransactionIcon={getTransactionIcon}
              getTransactionColor={getTransactionColor}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Credits Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Credits</DialogTitle>
            <DialogDescription>
              Manually add credits to {selectedWallet?.customer.full_name}'s wallet
            </DialogDescription>
          </DialogHeader>
          
          <AddCreditsForm
            creditTypes={creditTypes}
            onAddCredits={handleAddCredits}
            onCancel={() => setShowTransactionDialog(false)}
            walletId={selectedWallet?.id || ''}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Wallet Detail View Component
interface WalletDetailViewProps {
  wallet: WalletWithCustomer;
  ledgerEntries: LedgerEntry[];
  creditTypes: any[];
  transactionTypes: any[];
  onAddCredits: () => void;
  getTransactionIcon: (type: string) => any;
  getTransactionColor: (type: string) => string;
}

function WalletDetailView({ 
  wallet, 
  ledgerEntries, 
  creditTypes, 
  transactionTypes, 
  onAddCredits,
  getTransactionIcon,
  getTransactionColor 
}: WalletDetailViewProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">CHF {wallet.balance.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground mt-1">Swiss Francs</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {wallet.credits.reduce((sum, c) => sum + c.credits, 0)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Across {wallet.credits.length} type{wallet.credits.length !== 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={onAddCredits}>
              <Plus className="h-4 w-4 mr-2" />
              Add Credits
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="credits" className="space-y-4">
          <div className="space-y-4">
            {wallet.credits.map((credit) => {
              const creditType = creditTypes.find(t => t.value === credit.credit_type);
              const TypeIcon = creditType?.icon || CreditCard;
              const isExpiring = credit.expires_at && 
                new Date(credit.expires_at) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              
              return (
                <Card key={credit.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <TypeIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{creditType?.label || credit.credit_type}</div>
                          <div className="text-sm text-muted-foreground">
                            {credit.expires_at ? (
                              <>Expires: {new Date(credit.expires_at).toLocaleDateString()}</>
                            ) : (
                              'No expiry'
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{credit.credits}</div>
                        {isExpiring && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {ledgerEntries.map((entry) => {
              const TransactionIcon = getTransactionIcon(entry.transaction_type);
              const transactionColor = getTransactionColor(entry.transaction_type);
              
              return (
                <Card key={entry.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${transactionColor} bg-opacity-10`}>
                          <TransactionIcon className={`h-4 w-4 ${transactionColor}`} />
                        </div>
                        <div>
                          <div className="font-medium">{entry.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(entry.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {entry.credits_change && (
                          <div className={`font-medium ${
                            entry.credits_change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {entry.credits_change > 0 ? '+' : ''}{entry.credits_change} credits
                          </div>
                        )}
                        {entry.amount_change && (
                          <div className={`font-medium ${
                            entry.amount_change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {entry.amount_change > 0 ? '+' : ''}CHF {entry.amount_change.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Add Credits Form Component
interface AddCreditsFormProps {
  creditTypes: any[];
  onAddCredits: (walletId: string, credits: number, creditType: string, description: string) => void;
  onCancel: () => void;
  walletId: string;
}

function AddCreditsForm({ creditTypes, onAddCredits, onCancel, walletId }: AddCreditsFormProps) {
  const [credits, setCredits] = useState(1);
  const [creditType, setCreditType] = useState('class');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCredits(walletId, credits, creditType, description || `Added ${credits} ${creditType} credits`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="credits">Number of Credits</Label>
        <Input
          id="credits"
          type="number"
          value={credits}
          onChange={(e) => setCredits(parseInt(e.target.value) || 1)}
          min="1"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="creditType">Credit Type</Label>
        <Select value={creditType} onValueChange={setCreditType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {creditTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Manual credit adjustment"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Credits
        </Button>
      </DialogFooter>
    </form>
  );
}