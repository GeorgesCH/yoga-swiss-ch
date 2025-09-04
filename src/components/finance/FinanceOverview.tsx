import React, { useState, useEffect } from 'react';
import { CreditCard, Receipt, Smartphone, Wallet, FileText, TrendingUp, AlertCircle, DollarSign, PiggyBank, Users, Calculator } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { financeService } from '../../utils/supabase/finance-service';
import { FinanceManagement } from '../FinanceManagement';
import { SwissPaymentIntegration } from './SwissPaymentIntegration';
import { WalletManagement } from './WalletManagement';

interface FinanceOverviewProps {
  onPageChange?: (page: string) => void;
}

interface FinancialSummary {
  total_revenue_cents: number;
  total_payments_cents: number;
  total_fees_cents: number;
  net_revenue_cents: number;
  wallet_liability_cents: number;
  credit_liability: number;
  order_count: number;
  payment_count: number;
  average_order_value_cents: number;
}

export function FinanceOverview({ onPageChange }: FinanceOverviewProps) {
  const { currentOrg } = useMultiTenantAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrg?.id) {
      loadFinancialSummary();
    }
  }, [currentOrg]);

  const loadFinancialSummary = async () => {
    if (!currentOrg?.id) return;

    try {
      setLoading(true);
      
      // Get current month's data
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      const result = await financeService.getFinancialSummary(
        currentOrg.id,
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );

      if (result.success && result.data) {
        setFinancialSummary(result.data);
      }
    } catch (error) {
      console.error('Error loading financial summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCHF = (amountCents: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amountCents / 100);
  };

  const financeStats = [
    {
      title: 'Monthly Revenue',
      value: financialSummary ? formatCHF(financialSummary.total_revenue_cents) : 'CHF 0',
      change: `${financialSummary?.order_count || 0} orders this month`,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Net Revenue',
      value: financialSummary ? formatCHF(financialSummary.net_revenue_cents) : 'CHF 0',
      change: `After fees: ${financialSummary ? formatCHF(financialSummary.total_fees_cents) : 'CHF 0'}`,
      icon: DollarSign,
      color: 'text-blue-600'
    },
    {
      title: 'Customer Wallets',
      value: financialSummary ? formatCHF(financialSummary.wallet_liability_cents) : 'CHF 0',
      change: `${financialSummary?.credit_liability || 0} credits outstanding`,
      icon: Wallet,
      color: 'text-purple-600'
    },
    {
      title: 'Transaction Fees',
      value: financialSummary ? formatCHF(financialSummary.total_fees_cents) : 'CHF 0',
      change: financialSummary && financialSummary.total_payments_cents > 0 
        ? `${((financialSummary.total_fees_cents / financialSummary.total_payments_cents) * 100).toFixed(1)}% of payments`
        : '0% of payments',
      icon: CreditCard,
      color: 'text-orange-600'
    }
  ];

  const PaymentsComponent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Accepted payment options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Credit/Debit Cards</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                  </div>
                </div>
                <Badge variant="secondary">74% of payments</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 border-orange-200">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">TWINT</p>
                    <p className="text-sm text-muted-foreground">Swiss mobile payment</p>
                  </div>
                </div>
                <Badge variant="secondary">22% of payments</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Receipt className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Bank Transfer</p>
                    <p className="text-sm text-muted-foreground">QR-Bill and SEPA</p>
                  </div>
                </div>
                <Badge variant="secondary">4% of payments</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Performance</CardTitle>
            <CardDescription>Transaction success rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Success Rate</span>
                  <span className="font-medium text-green-600">98.7%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '98.7%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Processing Time</span>
                  <span className="font-medium">2.3 seconds</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Failed Transactions</span>
                  <span className="font-medium text-red-600">1.3%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '1.3%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ReportsComponent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Reports</CardTitle>
            <CardDescription>Financial performance insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Monthly Revenue Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Class Revenue Breakdown
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Membership Revenue
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Payment Method Analysis
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Reports</CardTitle>
            <CardDescription>Swiss tax compliance reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                VAT Report (MWST)
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Income Statement
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Expense Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Annual Summary
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Reports</CardTitle>
            <CardDescription>Customer financial insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Customer Lifetime Value
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Payment Behavior Analysis
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Refund Analysis
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Outstanding Balances
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>Key financial metrics for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">CHF 42,850</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">CHF 38,200</p>
              <p className="text-sm text-muted-foreground">Class Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">CHF 4,650</p>
              <p className="text-sm text-muted-foreground">Product Sales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">CHF 284</p>
              <p className="text-sm text-muted-foreground">Transaction Fees</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Finance Management</h1>
          <p className="text-muted-foreground">
            Manage payments, billing, wallets, and financial reporting
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Receipt className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 w-28 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))
        ) : (
          financeStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Finance Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="swiss-payments" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Swiss Payments
          </TabsTrigger>
          <TabsTrigger value="wallets" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallets
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Finance Overview</h3>
              <p className="text-muted-foreground">Complete financial management dashboard</p>
            </div>
            <Badge variant="secondary">
              {financialSummary ? formatCHF(financialSummary.total_revenue_cents) : 'CHF 0'} this month
            </Badge>
          </div>
          <FinanceManagement />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Payments & Billing</h3>
              <p className="text-muted-foreground">Manage payment methods and billing processes</p>
            </div>
            <Badge variant="secondary">98.7% success rate</Badge>
          </div>
          <PaymentsComponent />
        </TabsContent>

        <TabsContent value="swiss-payments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Swiss Payment Integration</h3>
              <p className="text-muted-foreground">TWINT, QR-Bills, and Swiss banking integration</p>
            </div>
            <Badge variant="secondary">TWINT enabled</Badge>
          </div>
          <SwissPaymentIntegration />
        </TabsContent>

        <TabsContent value="wallets" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Wallet Management</h3>
              <p className="text-muted-foreground">Customer wallets, credits, and refunds</p>
            </div>
            <Badge variant="secondary">
              {financialSummary ? formatCHF(financialSummary.wallet_liability_cents) : 'CHF 0'} total balance
            </Badge>
          </div>
          <WalletManagement />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Financial Reports</h3>
              <p className="text-muted-foreground">Comprehensive financial reporting and analytics</p>
            </div>
            <Badge variant="secondary">Swiss tax compliant</Badge>
          </div>
          <ReportsComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
}