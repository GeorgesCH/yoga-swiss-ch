import { useState, useEffect } from 'react';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { getSupabaseProjectId } from '../../utils/supabase/env';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  ArrowLeft, 
  Calculator,
  DollarSign,
  Banknote,
  Plus,
  Minus,
  Eye,
  FileText,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  TrendingUp,
  Users
} from 'lucide-react';

interface CashDrawerManagementProps {
  onBack: () => void;
}

export function CashDrawerManagement({ onBack }: CashDrawerManagementProps) {
  const { currentOrg } = useMultiTenantAuth();
  const [cashDrawers, setCashDrawers] = useState<any[]>([]);
  const [cashTransactions, setCashTransactions] = useState<any[]>([]);
  const [zReports, setZReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDrawer, setActiveDrawer] = useState<any>(null);
  const [showCountDialog, setShowCountDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [cashCount, setCashCount] = useState({
    '200': 0, '100': 0, '50': 0, '20': 0, '10': 0, '5': 0,
    '2': 0, '1': 0, '0.50': 0, '0.20': 0, '0.10': 0, '0.05': 0
  });

  // API helper function
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API call failed');
    }
    
    return response.json();
  };

  // Load cash drawers
  const loadCashDrawers = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`/cash-drawers/${currentOrg?.id}`);
      setCashDrawers(data.data || []);
    } catch (error) {
      console.error('Error loading cash drawers:', error);
      setCashDrawers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentOrg) {
      loadCashDrawers();
      // Do not initialize with mock data in production
      setCashTransactions([]);
      setZReports([]);
    }
  }, [currentOrg]);

  // Mock cash drawer data (fallback)
  const mockCashDrawers = [
    {
      id: 'DRAWER-001',
      location: 'Front Desk - Main',
      status: 'open',
      userId: 'user-001',
      userName: 'Sarah Martinez',
      openedAt: '2025-01-01T08:00:00Z',
      openingFloat: 200.00,
      currentBalance: 485.75,
      totalSales: 325.75,
      totalRefunds: 40.00,
      transactionCount: 18,
      lastTransaction: '2025-01-01T14:30:00Z'
    },
    {
      id: 'DRAWER-002',
      location: 'Front Desk - Secondary',
      status: 'closed',
      userId: 'user-002',
      userName: 'Marco Weber',
      openedAt: '2025-01-01T06:00:00Z',
      closedAt: '2025-01-01T14:00:00Z',
      openingFloat: 150.00,
      closingBalance: 398.50,
      totalSales: 278.50,
      totalRefunds: 30.00,
      variance: 0.00,
      transactionCount: 15
    },
    {
      id: 'DRAWER-003',
      location: 'Reception - Studio B',
      status: 'pending_count',
      userId: 'user-003',
      userName: 'Lisa Müller',
      openedAt: '2025-01-01T14:00:00Z',
      openingFloat: 200.00,
      currentBalance: 512.30,
      totalSales: 382.30,
      totalRefunds: 70.00,
      transactionCount: 22,
      lastTransaction: '2025-01-01T21:45:00Z'
    }
  ];

  // Mock cash transactions (fallback data)
  const mockCashTransactions = [
    {
      id: 'CASH-001',
      drawerId: 'DRAWER-001',
      type: 'sale',
      amount: 35.00,
      description: 'Vinyasa Flow Class - Drop-in',
      customerName: 'Anna Schmidt',
      timestamp: '2025-01-01T14:30:00Z',
      roundingAdjustment: 0.00,
      originalAmount: 35.00
    },
    {
      id: 'CASH-002',
      drawerId: 'DRAWER-001',
      type: 'refund',
      amount: -25.00,
      description: 'Class cancellation refund',
      customerName: 'Thomas Weber',
      timestamp: '2025-01-01T13:15:00Z',
      roundingAdjustment: 0.00,
      originalAmount: -25.00
    },
    {
      id: 'CASH-003',
      drawerId: 'DRAWER-001',
      type: 'sale',
      amount: 32.45,
      description: 'Hot Yoga Workshop',
      customerName: 'Maria Rossi',
      timestamp: '2025-01-01T12:00:00Z',
      roundingAdjustment: 0.05,
      originalAmount: 32.50,
      note: 'Rounded to nearest 0.05 CHF'
    },
    {
      id: 'CASH-004',
      drawerId: 'DRAWER-001',
      type: 'payout',
      amount: -50.00,
      description: 'Petty cash withdrawal',
      customerName: 'Staff Request',
      timestamp: '2025-01-01T11:30:00Z',
      approval: 'manager-001'
    }
  ];

  // Mock Z-reports (end-of-day summaries) - fallback data
  const mockZReports = [
    {
      id: 'Z-001',
      date: '2024-12-31',
      location: 'Front Desk - Main',
      openingFloat: 200.00,
      totalSales: 1450.75,
      totalRefunds: 125.00,
      cashPayouts: 75.00,
      expectedCash: 1450.75,
      actualCash: 1448.25,
      variance: -2.50,
      transactionCount: 64,
      status: 'completed'
    },
    {
      id: 'Z-002',
      date: '2024-12-30',
      location: 'Front Desk - Main',
      openingFloat: 200.00,
      totalSales: 1325.50,
      totalRefunds: 95.00,
      cashPayouts: 50.00,
      expectedCash: 1380.50,
      actualCash: 1380.50,
      variance: 0.00,
      transactionCount: 58,
      status: 'completed'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Open</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Closed</Badge>;
      case 'pending_count':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Count</Badge>;
      case 'variance':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Variance</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale': return <Plus className="h-4 w-4 text-green-600" />;
      case 'refund': return <Minus className="h-4 w-4 text-red-600" />;
      case 'payout': return <ArrowLeft className="h-4 w-4 text-orange-600" />;
      case 'float': return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const calculateCashCountTotal = () => {
    const denominations = {
      '200': 200, '100': 100, '50': 50, '20': 20, '10': 10, '5': 5,
      '2': 2, '1': 1, '0.50': 0.50, '0.20': 0.20, '0.10': 0.10, '0.05': 0.05
    };
    
    return Object.entries(cashCount).reduce((total, [denom, count]) => {
      return total + (denominations[denom as keyof typeof denominations] * count);
    }, 0);
  };

  const openCashDrawer = async () => {
    try {
      await apiCall(`/cash-drawers/${currentOrg?.id}/open`, {
        method: 'POST',
        body: JSON.stringify({
          location: 'Front Desk - Main',
          user_id: 'current-user-id',
          opening_float_cents: 20000 // CHF 200.00
        })
      });
      await loadCashDrawers();
    } catch (error) {
      console.error('Error opening cash drawer:', error);
    }
  };

  const closeCashDrawer = (drawerId: string) => {
    setShowCountDialog(true);
    setActiveDrawer(cashDrawers.find(d => d.id === drawerId));
  };

  const processCashCount = async () => {
    try {
      const countedTotal = calculateCashCountTotal();
      const expectedTotal = activeDrawer?.current_balance_cents || 0;
      const variance = countedTotal * 100 - expectedTotal; // Convert to cents
      
      await apiCall(`/cash-drawers/${activeDrawer?.id}/close`, {
        method: 'POST',
        body: JSON.stringify({
          actual_cash_cents: countedTotal * 100,
          variance_cents: variance
        })
      });
      
      setShowCountDialog(false);
      setCashCount({
        '200': 0, '100': 0, '50': 0, '20': 0, '10': 0, '5': 0,
        '2': 0, '1': 0, '0.50': 0, '0.20': 0, '0.10': 0, '0.05': 0
      });
      
      await loadCashDrawers();
    } catch (error) {
      console.error('Error processing cash count:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Finance
          </Button>
          <div>
            <h1>Cash Drawer Management</h1>
            <p className="text-muted-foreground">
              Manage cash drawers, track transactions and generate Z-reports
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Z-Report
          </Button>
          <Button onClick={openCashDrawer}>
            <Plus className="h-4 w-4 mr-2" />
            Open Cash Drawer
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drawers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cashDrawers.filter(d => d.status === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently open
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Cash Sales</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              CHF {(986.55).toLocaleString('de-CH', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              55 transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Float Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              CHF {(550.00).toLocaleString('de-CH', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yesterday Variance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              CHF -2.50
            </div>
            <p className="text-xs text-muted-foreground">
              Under by CHF 2.50
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="drawers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="drawers">Cash Drawers</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reports">Z-Reports</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="drawers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Cash Drawers</CardTitle>
              <CardDescription>
                Monitor and manage all cash drawer sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cashDrawers.map((drawer) => (
                  <Card key={drawer.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{drawer.location}</CardTitle>
                          <CardDescription>
                            {drawer.userName} • Opened {new Date(drawer.openedAt).toLocaleTimeString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(drawer.status)}
                          <div className="text-right">
                            <div className="font-medium">CHF {drawer.currentBalance?.toLocaleString('de-CH', { minimumFractionDigits: 2 }) || drawer.closingBalance?.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</div>
                            <div className="text-sm text-muted-foreground">
                              {drawer.transactionCount} transactions
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Opening Float:</span>
                          <p className="font-medium">CHF {drawer.openingFloat.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Sales:</span>
                          <p className="font-medium text-green-600">CHF {drawer.totalSales.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Refunds:</span>
                          <p className="font-medium text-red-600">CHF -{drawer.totalRefunds.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Transaction:</span>
                          <p className="font-medium">
                            {drawer.lastTransaction 
                              ? new Date(drawer.lastTransaction).toLocaleTimeString()
                              : drawer.closedAt 
                                ? new Date(drawer.closedAt).toLocaleTimeString()
                                : 'None'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {drawer.variance !== undefined && (
                        <div className={`mt-4 p-3 rounded-lg ${drawer.variance === 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className="flex items-center gap-2">
                            {drawer.variance === 0 ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`font-medium ${drawer.variance === 0 ? 'text-green-800' : 'text-red-800'}`}>
                              {drawer.variance === 0 
                                ? 'No variance - Perfect balance!' 
                                : `Variance: CHF ${drawer.variance.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`
                              }
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {drawer.status === 'open' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => setShowTransactionDialog(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Transaction
                            </Button>
                            <Button size="sm" onClick={() => closeCashDrawer(drawer.id)}>
                              <Lock className="h-4 w-4 mr-2" />
                              Close Drawer
                            </Button>
                          </>
                        )}
                        {drawer.status === 'pending_count' && (
                          <Button size="sm" onClick={() => {
                            setActiveDrawer(drawer);
                            setShowCountDialog(true);
                          }}>
                            <Calculator className="h-4 w-4 mr-2" />
                            Count Cash
                          </Button>
                        )}
                        {drawer.status === 'closed' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Transactions</CardTitle>
              <CardDescription>
                All cash transactions across all drawers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Drawer</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-sm">
                          {new Date(transaction.timestamp).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className={`font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          CHF {Math.abs(transaction.amount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.customerName}</TableCell>
                        <TableCell className="font-mono text-xs">{transaction.drawerId}</TableCell>
                        <TableCell className="text-xs">
                          {transaction.roundingAdjustment && transaction.roundingAdjustment !== 0 && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              Rounded: {transaction.roundingAdjustment > 0 ? '+' : ''}CHF {transaction.roundingAdjustment.toFixed(2)}
                            </Badge>
                          )}
                          {transaction.approval && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Approved
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Z-Reports (End of Day)</CardTitle>
              <CardDescription>
                Daily cash reconciliation reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {zReports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{new Date(report.date).toLocaleDateString()}</CardTitle>
                          <CardDescription>{report.location}</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(report.status)}
                          <div className="text-right">
                            <div className={`font-medium ${report.variance === 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {report.variance === 0 ? 'Balanced' : `Variance: CHF ${report.variance.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {report.transactionCount} transactions
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Opening Float:</span>
                          <p className="font-medium">CHF {report.openingFloat.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Sales:</span>
                          <p className="font-medium text-green-600">CHF {report.totalSales.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Refunds:</span>
                          <p className="font-medium text-red-600">CHF -{report.totalRefunds.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expected Cash:</span>
                          <p className="font-medium">CHF {report.expectedCash.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Actual Cash:</span>
                          <p className="font-medium">CHF {report.actualCash.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Report
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reconciliation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Reconciliation</CardTitle>
              <CardDescription>
                Reconcile cash transactions with bank deposits and accounting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Reconciliation in Progress</h3>
                <p className="text-muted-foreground">
                  Cash reconciliation features will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cash Count Dialog */}
      <Dialog open={showCountDialog} onOpenChange={setShowCountDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cash Count - {activeDrawer?.location}</DialogTitle>
            <DialogDescription>
              Count all cash denominations in the drawer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {/* Banknotes */}
              <div>
                <h4 className="font-medium mb-3">Banknotes</h4>
                <div className="space-y-3">
                  {['200', '100', '50', '20', '10'].map((denom) => (
                    <div key={denom} className="flex items-center justify-between">
                      <span className="text-sm">CHF {denom}</span>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setCashCount(prev => ({ ...prev, [denom]: Math.max(0, prev[denom as keyof typeof prev] - 1) }))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={cashCount[denom as keyof typeof cashCount]}
                          onChange={(e) => setCashCount(prev => ({ ...prev, [denom]: parseInt(e.target.value) || 0 }))}
                          className="w-16 text-center"
                          min="0"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setCashCount(prev => ({ ...prev, [denom]: prev[denom as keyof typeof prev] + 1 }))}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Coins */}
              <div>
                <h4 className="font-medium mb-3">Coins</h4>
                <div className="space-y-3">
                  {['5', '2', '1'].map((denom) => (
                    <div key={denom} className="flex items-center justify-between">
                      <span className="text-sm">CHF {denom}</span>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setCashCount(prev => ({ ...prev, [denom]: Math.max(0, prev[denom as keyof typeof prev] - 1) }))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={cashCount[denom as keyof typeof cashCount]}
                          onChange={(e) => setCashCount(prev => ({ ...prev, [denom]: parseInt(e.target.value) || 0 }))}
                          className="w-16 text-center"
                          min="0"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setCashCount(prev => ({ ...prev, [denom]: prev[denom as keyof typeof prev] + 1 }))}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Small Coins */}
              <div>
                <h4 className="font-medium mb-3">Small Coins</h4>
                <div className="space-y-3">
                  {['0.50', '0.20', '0.10', '0.05'].map((denom) => (
                    <div key={denom} className="flex items-center justify-between">
                      <span className="text-sm">{denom} Rp</span>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setCashCount(prev => ({ ...prev, [denom]: Math.max(0, prev[denom as keyof typeof prev] - 1) }))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={cashCount[denom as keyof typeof cashCount]}
                          onChange={(e) => setCashCount(prev => ({ ...prev, [denom]: parseInt(e.target.value) || 0 }))}
                          className="w-16 text-center"
                          min="0"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setCashCount(prev => ({ ...prev, [denom]: prev[denom as keyof typeof prev] + 1 }))}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Expected Total:</p>
                  <p className="text-lg font-medium">CHF {(activeDrawer?.currentBalance || 0).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Counted Total:</p>
                  <p className="text-lg font-medium">CHF {calculateCashCountTotal().toLocaleString('de-CH', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Variance:</p>
                  <p className={`text-lg font-medium ${calculateCashCountTotal() - (activeDrawer?.currentBalance || 0) === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    CHF {(calculateCashCountTotal() - (activeDrawer?.currentBalance || 0)).toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCountDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={processCashCount}>
                  Complete Count
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Cash Transaction</DialogTitle>
            <DialogDescription>
              Record a manual cash transaction
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Transaction Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="payout">Payout</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount (CHF)</Label>
                <Input type="number" step="0.05" placeholder="0.00" />
              </div>
            </div>
            
            <div>
              <Label>Description</Label>
              <Input placeholder="Transaction description" />
            </div>
            
            <div>
              <Label>Customer Name (optional)</Label>
              <Input placeholder="Customer name" />
            </div>
            
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Additional notes..." rows={3} />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowTransactionDialog(false)}>
                Add Transaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
