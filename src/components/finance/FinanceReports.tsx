import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { 
  ArrowLeft, 
  Download,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Filter,
  RefreshCw,
  FileText,
  Calculator,
  PiggyBank,
  Users,
  CreditCard,
  Receipt
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface FinanceReportsProps {
  onBack: () => void;
}

export function FinanceReports({ onBack }: FinanceReportsProps) {
  const [dateRange, setDateRange] = useState('last_30_days');
  const [reportType, setReportType] = useState('revenue');

  // Mock revenue data
  const revenueData = [
    { date: '2024-12-01', revenue: 2450, classes: 1890, memberships: 560, passes: 0, retail: 0 },
    { date: '2024-12-02', revenue: 3120, classes: 2180, memberships: 940, passes: 0, retail: 0 },
    { date: '2024-12-03', revenue: 2890, classes: 1950, memberships: 940, passes: 0, retail: 0 },
    { date: '2024-12-04', revenue: 3450, classes: 2510, memberships: 940, passes: 0, retail: 0 },
    { date: '2024-12-05', revenue: 4120, classes: 2730, memberships: 1390, passes: 0, retail: 0 },
    { date: '2024-12-06', revenue: 3890, classes: 2950, memberships: 940, passes: 0, retail: 0 },
    { date: '2024-12-07', revenue: 3670, classes: 2480, memberships: 1190, passes: 0, retail: 0 },
  ];

  // Mock VAT data
  const vatData = [
    { rate: '8.1%', description: 'Standard Rate', netAmount: 32150.00, vatAmount: 2604.15, grossAmount: 34754.15, transactions: 1247 },
    { rate: '2.5%', description: 'Reduced Rate', netAmount: 850.00, vatAmount: 21.25, grossAmount: 871.25, transactions: 12 },
    { rate: '0.0%', description: 'Exempt', netAmount: 1200.00, vatAmount: 0.00, grossAmount: 1200.00, transactions: 8 }
  ];

  // Mock payment method data
  const paymentMethodData = [
    { name: 'Credit Card', value: 45.2, amount: 15680.50, color: '#8884d8' },
    { name: 'TWINT', value: 28.7, amount: 9950.80, color: '#82ca9d' },
    { name: 'Bank Transfer', value: 18.3, amount: 6340.20, color: '#ffc658' },
    { name: 'Cash', value: 5.1, amount: 1770.30, color: '#ff7300' },
    { name: 'Gift Cards', value: 2.7, amount: 935.60, color: '#0088fe' }
  ];

  // Mock instructor earnings data
  const instructorEarningsData = [
    { instructor: 'Sarah Johnson', classes: 18, earnings: 1250.80, avgPerClass: 69.49 },
    { instructor: 'Marco Bianchi', classes: 14, earnings: 980.60, avgPerClass: 70.04 },
    { instructor: 'Lisa Müller', classes: 22, earnings: 1580.40, avgPerClass: 71.84 },
    { instructor: 'Anna Schmidt', classes: 16, earnings: 1120.00, avgPerClass: 70.00 },
    { instructor: 'David Weber', classes: 12, earnings: 840.00, avgPerClass: 70.00 }
  ];

  // Mock class performance data
  const classPerformanceData = [
    { className: 'Vinyasa Flow', revenue: 4850.00, attendees: 142, avgPrice: 34.15, classes: 18 },
    { className: 'Power Yoga', revenue: 3920.00, attendees: 98, avgPrice: 40.00, classes: 14 },
    { className: 'Restorative Yoga', revenue: 2890.00, attendees: 89, avgPrice: 32.47, classes: 12 },
    { className: 'Hot Yoga', revenue: 4200.00, avgPrice: 35.00, attendees: 120, classes: 16 },
    { className: 'Beginner Yoga', revenue: 2450.00, attendees: 98, avgPrice: 25.00, classes: 15 }
  ];

  // Mock export options
  const exportOptions = [
    { id: 'revenue_summary', name: 'Revenue Summary', description: 'Complete revenue breakdown by category and date', format: 'CSV/PDF' },
    { id: 'vat_report', name: 'VAT Report', description: 'Swiss VAT filing report with all rates and amounts', format: 'CSV/XML' },
    { id: 'instructor_payroll', name: 'Instructor Payroll', description: 'Detailed instructor earnings and payroll data', format: 'CSV/PDF' },
    { id: 'payment_reconciliation', name: 'Payment Reconciliation', description: 'Provider payouts and bank reconciliation', format: 'CSV' },
    { id: 'datev_export', name: 'DATEV Export', description: 'Accounting export for DATEV software', format: 'CSV' },
    { id: 'sage_export', name: 'SAGE Export', description: 'Accounting export for SAGE software', format: 'CSV' },
    { id: 'audit_trail', name: 'Audit Trail', description: 'Complete audit log of all financial transactions', format: 'CSV/PDF' }
  ];

  const formatCurrency = (amount: number) => `CHF ${amount.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`;

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

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
            <h1>Finance Reports & Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive financial reporting and business intelligence
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>
            Select date range and report parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="this_quarter">This Quarter</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue Analysis</SelectItem>
                  <SelectItem value="vat">VAT Reports</SelectItem>
                  <SelectItem value="payments">Payment Methods</SelectItem>
                  <SelectItem value="instructors">Instructor Earnings</SelectItem>
                  <SelectItem value="classes">Class Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button>
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Reports */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="vat">VAT & Tax</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">CHF 75,280.40</div>
                <p className="text-xs text-muted-foreground">
                  +15.3% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">VAT Collected</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">CHF 6,104.35</div>
                <p className="text-xs text-muted-foreground">
                  8.1% effective rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Payouts</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">CHF 68,920.15</div>
                <p className="text-xs text-muted-foreground">
                  After fees and refunds
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Instructor Costs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">CHF 8,950.60</div>
                <p className="text-xs text-muted-foreground">
                  12 instructors paid
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Daily revenue breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Area type="monotone" dataKey="classes" stackId="1" stroke="#8884d8" fill="#8884d8" name="Classes" />
                    <Area type="monotone" dataKey="memberships" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Memberships" />
                    <Area type="monotone" dataKey="passes" stackId="1" stroke="#ffc658" fill="#ffc658" name="Passes" />
                    <Area type="monotone" dataKey="retail" stackId="1" stroke="#ff7300" fill="#ff7300" name="Retail" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of payment methods used</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Details</CardTitle>
                <CardDescription>Volume and amounts by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethodData.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: method.color }}
                        ></div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.value}% of transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(method.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Class Type</CardTitle>
              <CardDescription>Performance analysis of different class offerings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Type</TableHead>
                      <TableHead>Total Revenue</TableHead>
                      <TableHead>Classes Held</TableHead>
                      <TableHead>Total Attendees</TableHead>
                      <TableHead>Avg Price</TableHead>
                      <TableHead>Revenue/Class</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classPerformanceData.map((classType, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{classType.className}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(classType.revenue)}</TableCell>
                        <TableCell>{classType.classes}</TableCell>
                        <TableCell>{classType.attendees}</TableCell>
                        <TableCell>{formatCurrency(classType.avgPrice)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(classType.revenue / classType.classes)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>VAT Summary Report</CardTitle>
              <CardDescription>Swiss VAT breakdown by rate and category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>VAT Rate</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead className="text-right">Net Amount</TableHead>
                      <TableHead className="text-right">VAT Amount</TableHead>
                      <TableHead className="text-right">Gross Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vatData.map((vat, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{vat.rate}</TableCell>
                        <TableCell>{vat.description}</TableCell>
                        <TableCell>{vat.transactions}</TableCell>
                        <TableCell className="text-right">{formatCurrency(vat.netAmount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(vat.vatAmount)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(vat.grossAmount)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 font-medium">
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell>{vatData.reduce((sum, vat) => sum + vat.transactions, 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(vatData.reduce((sum, vat) => sum + vat.netAmount, 0))}</TableCell>
                      <TableCell className="text-right">{formatCurrency(vatData.reduce((sum, vat) => sum + vat.vatAmount, 0))}</TableCell>
                      <TableCell className="text-right">{formatCurrency(vatData.reduce((sum, vat) => sum + vat.grossAmount, 0))}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>VAT Filing Information</CardTitle>
                <CardDescription>Swiss VAT registration and filing details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">VAT Number:</span>
                      <p className="font-medium">CHE-123.456.789 MWST</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Filing Period:</span>
                      <p className="font-medium">Quarterly</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current Quarter:</span>
                      <p className="font-medium">Q1 2025</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Due Date:</span>
                      <p className="font-medium">April 30, 2025</p>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate VAT Return (XML)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Configuration</CardTitle>
                <CardDescription>Current VAT rates and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">Standard Rate (Services):</span>
                    <Badge variant="secondary">8.1%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">Reduced Rate (Products):</span>
                    <Badge variant="secondary">2.5%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">Exempt (Healthcare):</span>
                    <Badge variant="secondary">0.0%</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Tax Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Instructor Earnings Performance</CardTitle>
              <CardDescription>Earnings breakdown and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Classes Taught</TableHead>
                      <TableHead>Total Earnings</TableHead>
                      <TableHead>Avg per Class</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instructorEarningsData.map((instructor, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{instructor.instructor}</TableCell>
                        <TableCell>{instructor.classes}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(instructor.earnings)}</TableCell>
                        <TableCell>{formatCurrency(instructor.avgPerClass)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={(instructor.avgPerClass / 80) * 100} className="w-16" />
                            <span className="text-sm text-muted-foreground">
                              {((instructor.avgPerClass / 80) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="exports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Exports & Integrations</CardTitle>
              <CardDescription>Export financial data for accounting software and compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {exportOptions.map((option) => (
                  <div key={option.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{option.name}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                      <Badge variant="outline" className="mt-1">{option.format}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}