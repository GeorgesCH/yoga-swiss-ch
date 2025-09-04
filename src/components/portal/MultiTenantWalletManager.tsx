import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Wallet,
  Plus,
  Gift,
  CreditCard,
  Building,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  ArrowUpDown,
  History,
  DollarSign,
  Calendar,
  Download
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { toast } from 'sonner@2.0.3';

interface WalletProvider {
  id: string;
  name: string;
  type: 'studio' | 'instructor';
  image: string;
  location?: string;
  specialties?: string[];
  credits: number;
  creditValue: number; // CHF per credit
  expiryDate?: Date;
  lastActivity: Date;
  totalSpent: number;
  totalEarned: number;
  status: 'active' | 'inactive' | 'suspended';
  transactions: WalletTransaction[];
}

interface WalletTransaction {
  id: string;
  type: 'purchase' | 'redemption' | 'bonus' | 'refund' | 'transfer';
  amount: number;
  description: string;
  date: Date;
  relatedItem?: string;
  balance: number;
}

export function MultiTenantWalletManager({ onPageChange }: { onPageChange?: (page: string) => void }) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');

  // Mock wallet data
  const wallets: WalletProvider[] = [
    {
      id: 'studio-1',
      name: 'Flow Studio Zürich',
      type: 'studio',
      image: '/placeholder-studio-1.jpg',
      location: 'Bahnhofstrasse 45, 8001 Zürich',
      credits: 45,
      creditValue: 1.20,
      expiryDate: new Date(2025, 5, 15),
      lastActivity: new Date(2024, 11, 10),
      totalSpent: 450.00,
      totalEarned: 540.00,
      status: 'active',
      transactions: [
        {
          id: 'tx-1',
          type: 'redemption',
          amount: -25,
          description: 'Vinyasa Flow Class',
          date: new Date(2024, 11, 10),
          relatedItem: 'Class Booking',
          balance: 45
        },
        {
          id: 'tx-2',
          type: 'purchase',
          amount: 50,
          description: 'Credit Package Purchase',
          date: new Date(2024, 11, 5),
          relatedItem: 'Package: Studio 50',
          balance: 70
        }
      ]
    },
    {
      id: 'studio-2',
      name: 'Heat Studio Basel',
      type: 'studio',
      image: '/placeholder-studio-2.jpg',
      location: 'Steinenvorstadt 28, 4051 Basel',
      credits: 30,
      creditValue: 1.30,
      expiryDate: new Date(2025, 3, 20),
      lastActivity: new Date(2024, 11, 8),
      totalSpent: 320.00,
      totalEarned: 416.00,
      status: 'active',
      transactions: [
        {
          id: 'tx-3',
          type: 'redemption',
          amount: -30,
          description: 'Hot Yoga Power Class',
          date: new Date(2024, 11, 8),
          relatedItem: 'Class Booking',
          balance: 30
        },
        {
          id: 'tx-4',
          type: 'purchase',
          amount: 75,
          description: 'Premium Package',
          date: new Date(2024, 10, 28),
          relatedItem: 'Package: Heat 75',
          balance: 60
        }
      ]
    },
    {
      id: 'instructor-1',
      name: 'Marc Dubois',
      type: 'instructor',
      image: '/placeholder-instructor-1.jpg',
      specialties: ['Vinyasa', 'Power Yoga', 'Meditation'],
      credits: 15,
      creditValue: 1.10,
      expiryDate: new Date(2025, 2, 10),
      lastActivity: new Date(2024, 11, 5),
      totalSpent: 165.00,
      totalEarned: 181.50,
      status: 'active',
      transactions: [
        {
          id: 'tx-5',
          type: 'redemption',
          amount: -15,
          description: 'Private Yoga Session',
          date: new Date(2024, 11, 5),
          relatedItem: 'Private Session',
          balance: 15
        },
        {
          id: 'tx-6',
          type: 'purchase',
          amount: 30,
          description: 'Instructor Credit Package',
          date: new Date(2024, 10, 20),
          relatedItem: 'Package: Instructor 30',
          balance: 30
        }
      ]
    }
  ];

  const totalCredits = wallets.reduce((sum, wallet) => sum + wallet.credits, 0);
  const totalValue = wallets.reduce((sum, wallet) => sum + (wallet.credits * wallet.creditValue), 0);
  const activeWallets = wallets.filter(w => w.status === 'active').length;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getTimeUntilExpiry = (expiryDate?: Date) => {
    if (!expiryDate) return null;
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days` : 'Expired';
  };

  const handleAddCredits = () => {
    if (!creditAmount || !selectedProvider) {
      toast.error('Please select an amount and provider');
      return;
    }

    const amount = parseInt(creditAmount);
    if (amount < 10 || amount > 500) {
      toast.error('Credit amount must be between 10 and 500');
      return;
    }

    toast.success(`Added ${amount} credits to ${wallets.find(w => w.id === selectedProvider)?.name}`);
    setShowAddCredits(false);
    setCreditAmount('');
    setSelectedProvider('');
  };

  const handleTransferCredits = () => {
    toast.success('Credit transfer initiated');
    setShowTransfer(false);
  };

  const getWalletIcon = (type: 'studio' | 'instructor') => {
    return type === 'studio' ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-700">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'redemption':
        return <CreditCard className="h-4 w-4 text-red-600" />;
      case 'bonus':
        return <Gift className="h-4 w-4 text-purple-600" />;
      case 'refund':
        return <ArrowUpDown className="h-4 w-4 text-blue-600" />;
      case 'transfer':
        return <ArrowUpDown className="h-4 w-4 text-orange-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">My Wallets</h2>
        <div className="flex gap-2">
          <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Transfer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transfer Credits</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>From Wallet</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.filter(w => w.credits > 0).map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} ({wallet.credits} credits)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To Wallet</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input type="number" placeholder="Credits to transfer" min="1" />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleTransferCredits}>Transfer</Button>
                  <Button variant="outline" onClick={() => setShowTransfer(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddCredits} onOpenChange={setShowAddCredits}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Credits
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Credits</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Provider</Label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose studio or instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          <div className="flex items-center gap-2">
                            {getWalletIcon(wallet.type)}
                            {wallet.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Credit Amount</Label>
                  <Input
                    type="number"
                    placeholder="10 - 500 credits"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    min="10"
                    max="500"
                  />
                </div>
                {selectedProvider && creditAmount && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm">
                      <strong>Total Cost:</strong> {formatPrice(parseInt(creditAmount || '0') * (wallets.find(w => w.id === selectedProvider)?.creditValue || 0))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleAddCredits}>Add Credits</Button>
                  <Button variant="outline" onClick={() => setShowAddCredits(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xl font-semibold">{totalCredits}</div>
                <div className="text-sm text-muted-foreground">Total Credits</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-xl font-semibold">{formatPrice(totalValue)}</div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-xl font-semibold">{activeWallets}</div>
                <div className="text-sm text-muted-foreground">Active Wallets</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-xl font-semibold">CHF {(totalValue * 0.15).toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Monthly Savings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Wallets */}
      <div className="space-y-4">
        {wallets.map((wallet) => (
          <Card key={wallet.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {wallet.type === 'studio' ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={wallet.image}
                        alt={wallet.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={wallet.image} alt={wallet.name} />
                      <AvatarFallback>{wallet.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <h3 className="font-semibold">{wallet.name}</h3>
                    <div className="flex items-center gap-2">
                      {getWalletIcon(wallet.type)}
                      <p className="text-sm text-muted-foreground capitalize">{wallet.type} Wallet</p>
                    </div>
                  </div>
                </div>
                {getStatusBadge(wallet.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Credit Balance */}
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                  <div className="text-2xl font-semibold text-blue-600">{wallet.credits}</div>
                  <p className="text-sm text-muted-foreground">Credits Available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ≈ {formatPrice(wallet.credits * wallet.creditValue)} value
                  </p>
                  <div className="text-xs text-blue-600 mt-2">
                    {formatPrice(wallet.creditValue)}/credit
                  </div>
                </div>

                {/* Wallet Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Spent:</span>
                    <span className="font-medium">{formatPrice(wallet.totalSpent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Earned:</span>
                    <span className="font-medium text-green-600">{formatPrice(wallet.totalEarned)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Activity:</span>
                    <span>{formatDate(wallet.lastActivity)}</span>
                  </div>
                  {wallet.expiryDate && (
                    <div className="flex justify-between text-sm">
                      <span>Expires in:</span>
                      <span className={`font-medium ${getTimeUntilExpiry(wallet.expiryDate) === 'Expired' ? 'text-red-600' : 'text-green-600'}`}>
                        {getTimeUntilExpiry(wallet.expiryDate)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setSelectedProvider(wallet.id);
                      setShowAddCredits(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Credits
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    <Gift className="h-3 w-3 mr-1" />
                    Gift Credits
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedWallet(selectedWallet === wallet.id ? null : wallet.id)}
                  >
                    <History className="h-3 w-3 mr-1" />
                    {selectedWallet === wallet.id ? 'Hide' : 'View'} History
                  </Button>
                </div>
              </div>

              {/* Location/Specialties */}
              {wallet.location && (
                <div className="text-sm text-muted-foreground">
                  📍 {wallet.location}
                </div>
              )}
              {wallet.specialties && (
                <div className="flex flex-wrap gap-1">
                  {wallet.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Expiry Warning */}
              {wallet.expiryDate && getTimeUntilExpiry(wallet.expiryDate) !== 'Expired' && (
                parseInt(getTimeUntilExpiry(wallet.expiryDate)?.split(' ')[0] || '999') < 30
              ) && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-orange-800">
                    Credits expire in {getTimeUntilExpiry(wallet.expiryDate)}. Use them soon!
                  </AlertDescription>
                </Alert>
              )}

              {/* Transaction History */}
              {selectedWallet === wallet.id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Transaction History</h4>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {wallet.transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-medium text-sm">{transaction.description}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(transaction.date)}</span>
                              {transaction.relatedItem && (
                                <>
                                  <span>•</span>
                                  <span>{transaction.relatedItem}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Balance: {transaction.balance}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}