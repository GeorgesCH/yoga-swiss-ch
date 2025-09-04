import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  CreditCard, 
  Receipt, 
  TrendingUp, 
  Users, 
  PiggyBank,
  FileText,
  Calculator,
  BarChart3,
  Settings,
  DollarSign,
  Banknote,
  RefreshCcw,
  Clock,
  AlertTriangle,
  CheckCircle,
  Shield,
  Wallet,
  Smartphone
} from 'lucide-react';
import { OrdersPaymentsManagement } from './finance/OrdersPaymentsManagement';
import { InvoicesQRManagement } from './finance/InvoicesQRManagement';
import { PayoutsReconciliation } from './finance/PayoutsReconciliation';
import { InstructorEarnings } from './finance/InstructorEarnings';
import { FinanceReports } from './finance/FinanceReports';
import { FinanceSettings } from './finance/FinanceSettings';
import { CashDrawerManagement } from './finance/CashDrawerManagement';
import { LiabilitiesManagement } from './finance/LiabilitiesManagement';
import { AuditTrail } from './finance/AuditTrail';

export function FinanceManagement() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock KPI data - All amounts in CHF
  const kpiData = {
    todayRevenue: 2847.50,
    weeklyRevenue: 18945.20,
    monthlyRevenue: 75280.40,
    pendingPayouts: 12450.30,
    outstandingInvoices: 3250.80,
    instructorPayroll: 8950.60,
    cashFlow: 45280.90,
    vatLiability: 6104.35,
    cashDrawerBalance: 1850.00,
    accountsReceivable: 4250.80,
    giftCardLiability: 2850.00,
    passLiability: 5670.40,
    monthlyGrowth: 15.3,
    avgTransactionValue: 67.45,
    refundRate: 2.1
  };

  const recentActivity = [
    {
      id: 1,
      type: 'payment',
      description: 'Class registration payment received',
      amount: 35.00,
      currency: 'CHF',
      status: 'completed',
      time: '2 minutes ago',
      customer: 'Maria Schmidt'
    },
    {
      id: 2,
      type: 'invoice',
      description: 'Monthly membership invoice issued',
      amount: 120.00,
      currency: 'CHF',
      status: 'sent',
      time: '15 minutes ago',
      customer: 'Thomas Weber'
    },
    {
      id: 3,
      type: 'refund',
      description: 'Class cancellation refund processed',
      amount: -25.00,
      currency: 'CHF',
      status: 'processing',
      time: '1 hour ago',
      customer: 'Anna Müller'
    },
    {
      id: 4,
      type: 'payout',
      description: 'Stripe payout received',
      amount: 2450.80,
      currency: 'CHF',
      status: 'completed',
      time: '3 hours ago',
      customer: 'Stripe Settlement'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard className="h-4 w-4 text-green-600" />;
      case 'invoice': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'refund': return <RefreshCcw className="h-4 w-4 text-orange-600" />;
      case 'payout': return <Banknote className="h-4 w-4 text-purple-600" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Processing</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sent</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (activeTab !== 'overview') {
    switch (activeTab) {
      case 'orders-payments':
        return <OrdersPaymentsManagement onBack={() => setActiveTab('overview')} />;
      case 'invoices':
        return <InvoicesQRManagement onBack={() => setActiveTab('overview')} />;
      case 'payouts':
        return <PayoutsReconciliation onBack={() => setActiveTab('overview')} />;
      case 'earnings':
        return <InstructorEarnings onBack={() => setActiveTab('overview')} />;
      case 'reports':
        return <FinanceReports onBack={() => setActiveTab('overview')} />;
      case 'settings':
        return <FinanceSettings onBack={() => setActiveTab('overview')} />;
      case 'cash-drawer':
        return <CashDrawerManagement onBack={() => setActiveTab('overview')} />;
      case 'liabilities':
        return <LiabilitiesManagement onBack={() => setActiveTab('overview')} />;
      case 'audit':
        return <AuditTrail onBack={() => setActiveTab('overview')} />;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Finance Management</h1>
          <p className="text-muted-foreground">
            Complete financial overview and management for your studio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            System Healthy
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Finance Settings
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {kpiData.todayRevenue.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {kpiData.monthlyRevenue.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              +{kpiData.monthlyGrowth}% growth this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {kpiData.cashFlow.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Current liquid position
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VAT Liability</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {kpiData.vatLiability.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Q1 2025 filing due Apr 30
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {kpiData.pendingPayouts.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Expected in 2-3 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructor Payroll</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {kpiData.instructorPayroll.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Current period accrual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Drawer</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {kpiData.cashDrawerBalance.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Current cash balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding A/R</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {kpiData.accountsReceivable.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Accounts receivable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('orders-payments')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Orders & Payments
              </CardTitle>
              <Badge variant="outline">148 today</Badge>
            </div>
            <CardDescription>
              Manage orders, process payments, handle refunds and view transaction history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Success Rate</span>
              <span className="font-medium text-green-600">98.7%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('invoices')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-purple-600" />
                Invoices & QR-Bills
              </CardTitle>
              <Badge variant="outline">23 pending</Badge>
            </div>
            <CardDescription>
              Generate invoices, Swiss QR-bills, manage tax reporting and legal documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Collection Rate</span>
              <span className="font-medium text-green-600">96.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('payouts')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-green-600" />
                Payouts & Reconciliation
              </CardTitle>
              <Badge variant="outline">Auto-sync</Badge>
            </div>
            <CardDescription>
              Track provider payouts, reconcile bank statements and manage cash flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Match Rate</span>
              <span className="font-medium text-green-600">99.1%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('earnings')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Instructor Earnings
              </CardTitle>
              <Badge variant="outline">12 instructors</Badge>
            </div>
            <CardDescription>
              Calculate instructor earnings, manage payroll periods and process payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg. per Class</span>
              <span className="font-medium">CHF 65.40</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('reports')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-red-600" />
                Reports & Analytics
              </CardTitle>
              <Badge variant="outline">Real-time</Badge>
            </div>
            <CardDescription>
              Financial reports, tax exports, revenue analytics and audit trails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Growth</span>
              <span className="font-medium text-green-600">+15.3%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('cash-drawer')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-green-600" />
                Cash Drawer
              </CardTitle>
              <Badge variant="outline">3 active</Badge>
            </div>
            <CardDescription>
              Manage cash drawers, track transactions and generate Z-reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cash Balance</span>
              <span className="font-medium">CHF 1,850.00</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('liabilities')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Liabilities
              </CardTitle>
              <Badge variant="outline">CHF 8,671</Badge>
            </div>
            <CardDescription>
              Gift cards, class passes and customer credit balances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Outstanding</span>
              <span className="font-medium">CHF 8,671.20</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('audit')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Audit Trail
              </CardTitle>
              <Badge variant="outline">7 today</Badge>
            </div>
            <CardDescription>
              Complete audit log and compliance tracking for all financial activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Risk Events</span>
              <span className="font-medium text-orange-600">2 high</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('settings')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Finance Settings
              </CardTitle>
              <Badge variant="outline">Configure</Badge>
            </div>
            <CardDescription>
              Tax rates, payment methods, accounting exports and system configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">VAT Rate</span>
              <span className="font-medium">8.1%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Financial Activity</CardTitle>
          <CardDescription>
            Latest transactions and financial events across your studio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getActivityIcon(activity.type)}
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.customer} • {activity.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`font-medium ${activity.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {activity.amount > 0 ? '+' : ''}{activity.currency} {Math.abs(activity.amount).toLocaleString()}
                    </p>
                  </div>
                  {getStatusBadge(activity.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common financial tasks and operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Receipt className="h-5 w-5" />
              Generate Invoice
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <RefreshCcw className="h-5 w-5" />
              Process Refund
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Calculator className="h-5 w-5" />
              VAT Report
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <FileText className="h-5 w-5" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}