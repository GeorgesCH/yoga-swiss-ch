import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  CreditCard,
  Smartphone,
  QrCode,
  Banknote,
  Receipt,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Zap,
  RefreshCw,
  ArrowUpDown,
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  Package,
  Eye,
  Download,
  Plus,
  Edit
} from 'lucide-react';

interface SwissPaymentHubProps {
  orgId: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'twint' | 'credit_card' | 'apple_pay' | 'google_pay' | 'qr_bill' | 'bank_transfer' | 'cash';
  icon: any;
  description: string;
  is_enabled: boolean;
  processing_fee: number;
  setup_required: boolean;
  is_configured: boolean;
  supported_currencies: string[];
  settlement_time: string;
}

interface PaymentTransaction {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  customer_name: string;
  created_at: string;
  fee_amount: number;
  net_amount: number;
}

export function SwissPaymentHub({ orgId }: SwissPaymentHubProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadPaymentData();
  }, [orgId]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      
      // Mock payment methods data
      const mockMethods: PaymentMethod[] = [
        {
          id: '1',
          name: 'TWINT',
          type: 'twint',
          icon: Smartphone,
          description: 'Swiss mobile payment solution',
          is_enabled: true,
          processing_fee: 1.5,
          setup_required: true,
          is_configured: true,
          supported_currencies: ['CHF'],
          settlement_time: '1-2 business days'
        },
        {
          id: '2',
          name: 'Credit Card',
          type: 'credit_card',
          icon: CreditCard,
          description: 'Visa, Mastercard, American Express',
          is_enabled: true,
          processing_fee: 2.9,
          setup_required: true,
          is_configured: true,
          supported_currencies: ['CHF', 'EUR', 'USD'],
          settlement_time: '2-3 business days'
        },
        {
          id: '3',
          name: 'Apple Pay',
          type: 'apple_pay',
          icon: Smartphone,
          description: 'Quick payments via Apple devices',
          is_enabled: true,
          processing_fee: 2.9,
          setup_required: false,
          is_configured: true,
          supported_currencies: ['CHF', 'EUR'],
          settlement_time: '2-3 business days'
        },
        {
          id: '4',
          name: 'Google Pay',
          type: 'google_pay',
          icon: Smartphone,
          description: 'Quick payments via Google',
          is_enabled: false,
          processing_fee: 2.9,
          setup_required: false,
          is_configured: false,
          supported_currencies: ['CHF', 'EUR'],
          settlement_time: '2-3 business days'
        },
        {
          id: '5',
          name: 'QR-Bill',
          type: 'qr_bill',
          icon: QrCode,
          description: 'Swiss QR-Invoice system',
          is_enabled: true,
          processing_fee: 0.0,
          setup_required: true,
          is_configured: true,
          supported_currencies: ['CHF'],
          settlement_time: '1-5 business days'
        },
        {
          id: '6',
          name: 'Bank Transfer',
          type: 'bank_transfer',
          icon: Banknote,
          description: 'Direct bank-to-bank transfer',
          is_enabled: true,
          processing_fee: 0.0,
          setup_required: true,
          is_configured: true,
          supported_currencies: ['CHF', 'EUR'],
          settlement_time: '1-3 business days'
        },
        {
          id: '7',
          name: 'Cash (POS)',
          type: 'cash',
          icon: Banknote,
          description: 'Cash payments at point of sale',
          is_enabled: true,
          processing_fee: 0.0,
          setup_required: false,
          is_configured: true,
          supported_currencies: ['CHF'],
          settlement_time: 'Immediate'
        }
      ];

      // Mock transactions data
      const mockTransactions: PaymentTransaction[] = [
        {
          id: '1',
          order_id: 'ORD-2024-001',
          amount: 150.00,
          currency: 'CHF',
          method: 'TWINT',
          status: 'completed',
          customer_name: 'Anna Müller',
          created_at: '2024-12-25T10:30:00Z',
          fee_amount: 2.25,
          net_amount: 147.75
        },
        {
          id: '2',
          order_id: 'ORD-2024-002',
          amount: 85.00,
          currency: 'CHF',
          method: 'Credit Card',
          status: 'completed',
          customer_name: 'Marco Rossi',
          created_at: '2024-12-25T14:15:00Z',
          fee_amount: 2.47,
          net_amount: 82.53
        },
        {
          id: '3',
          order_id: 'ORD-2024-003',
          amount: 200.00,
          currency: 'CHF',
          method: 'QR-Bill',
          status: 'pending',
          customer_name: 'Sarah Weber',
          created_at: '2024-12-25T16:45:00Z',
          fee_amount: 0.00,
          net_amount: 200.00
        }
      ];

      setPaymentMethods(mockMethods);
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMethod = async (method: PaymentMethod) => {
    try {
      // Update payment method status
      setPaymentMethods(prev => 
        prev.map(m => 
          m.id === method.id 
            ? { ...m, is_enabled: !m.is_enabled }
            : m
        )
      );
    } catch (error) {
      console.error('Error toggling payment method:', error);
    }
  };

  const handleConfigureMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setShowConfigDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <RefreshCw className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'refunded':
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            <ArrowUpDown className="h-3 w-3 mr-1" />
            Refunded
          </Badge>
        );
      default:
        return null;
    }
  };

  const getMethodStatusBadge = (method: PaymentMethod) => {
    if (!method.is_configured) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-700">
          <XCircle className="h-3 w-3 mr-1" />
          Not Configured
        </Badge>
      );
    }
    
    if (!method.is_enabled) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
          <XCircle className="h-3 w-3 mr-1" />
          Disabled
        </Badge>
      );
    }
    
    return (
      <Badge variant="default" className="bg-green-100 text-green-700">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  };

  const calculateStats = () => {
    const today = new Date().toDateString();
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const todayTransactions = completedTransactions.filter(t => 
      new Date(t.created_at).toDateString() === today
    );

    return {
      total_revenue: completedTransactions.reduce((sum, t) => sum + t.amount, 0),
      total_fees: completedTransactions.reduce((sum, t) => sum + t.fee_amount, 0),
      net_revenue: completedTransactions.reduce((sum, t) => sum + t.net_amount, 0),
      today_revenue: todayTransactions.reduce((sum, t) => sum + t.amount, 0),
      pending_count: transactions.filter(t => t.status === 'pending').length,
      active_methods: paymentMethods.filter(m => m.is_enabled && m.is_configured).length
    };
  };

  const stats = calculateStats();

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
          <h1 className="text-3xl font-bold">Swiss Payment Hub</h1>
          <p className="text-muted-foreground">
            Manage payment methods, transactions, and Swiss financial compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" onClick={loadPaymentData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">CHF {stats.total_revenue.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">CHF {stats.today_revenue.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Today's Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">CHF {stats.total_fees.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Processing Fees</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">CHF {stats.net_revenue.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Net Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{stats.pending_count}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-cyan-600" />
              <div>
                <div className="text-2xl font-bold">{stats.active_methods}</div>
                <div className="text-sm text-muted-foreground">Active Methods</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="compliance">Swiss Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Payment Methods Status */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods Status</CardTitle>
              <CardDescription>
                Quick overview of all configured payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentMethods.map((method) => {
                  const MethodIcon = method.icon;
                  
                  return (
                    <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          method.is_enabled && method.is_configured 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <MethodIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {method.processing_fee}% fee
                          </div>
                        </div>
                      </div>
                      {getMethodStatusBadge(method)}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest payment transactions across all methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Receipt className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{transaction.customer_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.order_id} • {transaction.method}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">CHF {transaction.amount.toFixed(2)}</div>
                      <div className="text-sm">
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Payment Methods Configuration</h3>
              <p className="text-muted-foreground">Configure and manage available payment options</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentMethods.map((method) => {
              const MethodIcon = method.icon;
              
              return (
                <Card key={method.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${
                          method.is_enabled && method.is_configured 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <MethodIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{method.name}</h3>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={method.is_enabled}
                        onCheckedChange={() => handleToggleMethod(method)}
                        disabled={!method.is_configured}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Processing Fee:</span>
                        <span className="font-medium">{method.processing_fee}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Settlement:</span>
                        <span className="font-medium">{method.settlement_time}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Currencies:</span>
                        <span className="font-medium">{method.supported_currencies.join(', ')}</span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        {getMethodStatusBadge(method)}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleConfigureMethod(method)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Payment Transactions</h3>
              <p className="text-muted-foreground">View and manage all payment transactions</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-3 font-medium">Transaction</th>
                      <th className="text-left pb-3 font-medium">Customer</th>
                      <th className="text-center pb-3 font-medium">Method</th>
                      <th className="text-right pb-3 font-medium">Amount</th>
                      <th className="text-right pb-3 font-medium">Fee</th>
                      <th className="text-right pb-3 font-medium">Net</th>
                      <th className="text-center pb-3 font-medium">Status</th>
                      <th className="text-center pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-muted/50">
                        <td className="py-4">
                          <div className="font-medium">{transaction.id}</div>
                          <div className="text-sm text-muted-foreground">{transaction.order_id}</div>
                        </td>
                        <td className="py-4">
                          <div className="font-medium">{transaction.customer_name}</div>
                        </td>
                        <td className="py-4 text-center">
                          <Badge variant="outline" className="text-xs">
                            {transaction.method}
                          </Badge>
                        </td>
                        <td className="py-4 text-right">
                          <div className="font-medium">CHF {transaction.amount.toFixed(2)}</div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="text-sm text-muted-foreground">
                            CHF {transaction.fee_amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="font-medium">CHF {transaction.net_amount.toFixed(2)}</div>
                        </td>
                        <td className="py-4 text-center">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="py-4 text-center">
                          <div className="text-sm">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Swiss Financial Compliance</h3>
            <p className="text-muted-foreground">VAT, QR-Bill, and Swiss banking compliance features</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  VAT Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Standard VAT Rate:</span>
                  <span className="font-medium">7.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reduced VAT Rate:</span>
                  <span className="font-medium">2.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Special VAT Rate:</span>
                  <span className="font-medium">3.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT Number:</span>
                  <span className="font-medium">CHE-123.456.789 MWST</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Configure VAT
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-green-600" />
                  QR-Bill Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">QR-IBAN:</span>
                  <span className="font-medium">CH44 3199 9123 0008 8901 2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creditor Name:</span>
                  <span className="font-medium">YogaSwiss Studio</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference Type:</span>
                  <span className="font-medium">QR Reference</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Configure QR-Bill
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GDPR Compliance:</span>
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Compliant
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Swiss DPA:</span>
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Compliant
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PCI DSS:</span>
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Level 1
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data Residency:</span>
                  <span className="font-medium">Switzerland</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Compliance Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-orange-600" />
                  Banking Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary Bank:</span>
                  <span className="font-medium">UBS Switzerland AG</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="font-medium">CH93 0076 2011 6238 5295 7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auto Reconciliation:</span>
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Sync:</span>
                  <span className="font-medium">08:00 CET</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Configure Banking
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Configure {selectedMethod?.name}
            </DialogTitle>
            <DialogDescription>
              Set up and configure payment method settings
            </DialogDescription>
          </DialogHeader>
          
          {selectedMethod && (
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                Payment method configuration interface will be implemented based on the specific provider's requirements.
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowConfigDialog(false)}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}