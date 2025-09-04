import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { 
  CreditCard, DollarSign, TrendingUp, Calendar, Clock, 
  Download, Upload, FileText, Settings, AlertCircle,
  CheckCircle, XCircle, Plus, Edit, Eye, Filter,
  BarChart3, Target, Award, Zap, RefreshCw, Bell,
  PiggyBank, Wallet, Receipt, Smartphone, QrCode,
  BanknoteIcon, Euro, Calculator, TrendingDown
} from 'lucide-react';

interface InstructorPaymentManagementProps {
  instructor: any;
  onClose: () => void;
}

export function InstructorPaymentManagement({ 
  instructor, 
  onClose 
}: InstructorPaymentManagementProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  // Mock payment data with Swiss specifics
  const paymentData = {
    currentMonth: {
      grossEarnings: 3240.00,
      socialContributions: 324.00, // 10% for social security (approximate)
      taxWithholding: 648.00, // 20% withholding tax
      netEarnings: 2268.00,
      classCount: 28,
      averagePerClass: 115.71,
      bonus: 150.00, // Performance bonus
      deductions: 48.00 // Various deductions
    },
    yearToDate: {
      grossEarnings: 28560.00,
      socialContributions: 2856.00,
      taxWithholding: 5712.00,
      netEarnings: 19992.00,
      classCount: 248,
      averagePerClass: 115.16
    },
    bankAccount: {
      bank: 'UBS Switzerland AG',
      accountNumber: 'CH93 0076 2011 6238 5295 7',
      accountHolder: `${instructor.firstName} ${instructor.lastName}`,
      currency: 'CHF'
    },
    paymentSettings: {
      method: 'per_class',
      rate: 85.00,
      currency: 'CHF',
      paymentFrequency: 'monthly',
      bonusEligible: true,
      autoWithholding: true
    }
  };

  // Mock payment history
  const paymentHistory = [
    {
      id: 'pay-2024-02',
      month: 'February 2024',
      period: '2024-02-01 to 2024-02-29',
      grossAmount: 3240.00,
      deductions: 972.00,
      netAmount: 2268.00,
      status: 'pending',
      paymentDate: '2024-03-05',
      classesCount: 28,
      bonusAmount: 150.00,
      method: 'bank_transfer'
    },
    {
      id: 'pay-2024-01',
      month: 'January 2024',
      period: '2024-01-01 to 2024-01-31',
      grossAmount: 2975.00,
      deductions: 892.50,
      netAmount: 2082.50,
      status: 'paid',
      paymentDate: '2024-02-05',
      paidDate: '2024-02-05',
      classesCount: 25,
      bonusAmount: 100.00,
      method: 'bank_transfer'
    },
    {
      id: 'pay-2023-12',
      month: 'December 2023',
      period: '2023-12-01 to 2023-12-31',
      grossAmount: 3150.00,
      deductions: 945.00,
      netAmount: 2205.00,
      status: 'paid',
      paymentDate: '2024-01-05',
      paidDate: '2024-01-05',
      classesCount: 26,
      bonusAmount: 200.00, // Holiday bonus
      method: 'bank_transfer'
    }
  ];

  // Mock class earnings breakdown
  const classEarnings = [
    {
      id: 'class-1',
      name: 'Vinyasa Flow',
      date: '2024-02-28',
      attendees: 18,
      baseRate: 85.00,
      bonus: 15.00, // High attendance bonus
      total: 100.00,
      status: 'confirmed'
    },
    {
      id: 'class-2',
      name: 'Yin Yoga',
      date: '2024-02-27',
      attendees: 12,
      baseRate: 85.00,
      bonus: 0.00,
      total: 85.00,
      status: 'confirmed'
    },
    {
      id: 'class-3',
      name: 'Morning Flow',
      date: '2024-02-26',
      attendees: 20,
      baseRate: 85.00,
      bonus: 20.00, // Full class bonus
      total: 105.00,
      status: 'confirmed'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={instructor.avatar} />
                <AvatarFallback className="bg-primary/10">
                  {instructor.firstName.charAt(0)}{instructor.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <DialogTitle>Payment Management</DialogTitle>
                <p className="text-muted-foreground">
                  {instructor.firstName} {instructor.lastName} • Swiss Tax Resident
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Payment Settings
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="taxes">Swiss Taxes</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">Monthly Gross</p>
                      <p>{formatCurrency(paymentData.currentMonth.grossEarnings)}</p>
                      <p className="text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +8.9%
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">Monthly Net</p>
                      <p>{formatCurrency(paymentData.currentMonth.netEarnings)}</p>
                      <p className="text-blue-600 flex items-center mt-1">
                        <Wallet className="h-3 w-3 mr-1" />
                        After taxes
                      </p>
                    </div>
                    <PiggyBank className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">Classes Taught</p>
                      <p>{paymentData.currentMonth.classCount}</p>
                      <p className="text-purple-600 flex items-center mt-1">
                        <Target className="h-3 w-3 mr-1" />
                        This month
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">Avg per Class</p>
                      <p>{formatCurrency(paymentData.currentMonth.averagePerClass)}</p>
                      <p className="text-orange-600 flex items-center mt-1">
                        <Award className="h-3 w-3 mr-1" />
                        +Bonuses
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Earnings Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BanknoteIcon className="h-5 w-5 mr-2" />
                    February 2024 Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span>Gross Earnings</span>
                      <span className="font-medium text-green-700">
                        {formatCurrency(paymentData.currentMonth.grossEarnings)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span>Performance Bonus</span>
                      <span className="font-medium text-blue-600">
                        +{formatCurrency(paymentData.currentMonth.bonus)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span>Social Contributions (10%)</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(paymentData.currentMonth.socialContributions)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span>Tax Withholding (20%)</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(paymentData.currentMonth.taxWithholding)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span>Other Deductions</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(paymentData.currentMonth.deductions)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <span className="font-medium">Net Payment</span>
                      <span className="font-bold text-blue-700">
                        {formatCurrency(paymentData.currentMonth.netEarnings)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    YTD Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Total Gross Income</span>
                      <span className="font-medium">
                        {formatCurrency(paymentData.yearToDate.grossEarnings)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Classes Taught</span>
                      <span className="font-medium">{paymentData.yearToDate.classCount}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Average per Class</span>
                      <span className="font-medium">
                        {formatCurrency(paymentData.yearToDate.averagePerClass)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Total Deductions</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(paymentData.yearToDate.socialContributions + paymentData.yearToDate.taxWithholding)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Net YTD Income</span>
                      <span className="font-bold text-green-700">
                        {formatCurrency(paymentData.yearToDate.netEarnings)}
                      </span>
                    </div>
                    
                    <div className="pt-2">
                      <div className="text-sm text-muted-foreground mb-2">Annual Goal Progress</div>
                      <Progress value={65} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>CHF {(paymentData.yearToDate.netEarnings / 1000).toFixed(0)}k</span>
                        <span>CHF 30k goal</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">February payment processed</div>
                        <div className="text-muted-foreground">CHF 2,268.00 net payment</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Pending Transfer
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Performance bonus earned</div>
                        <div className="text-muted-foreground">High attendance rate bonus</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-blue-600">
                      +CHF 150
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Tax certificate generated</div>
                        <div className="text-muted-foreground">2023 annual tax statement</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current-month">Current Month</SelectItem>
                    <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                    <SelectItem value="current-year">Current Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Payments
              </Button>
            </div>

            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <Card key={payment.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          <div>
                            <h4 className="font-medium">{payment.month}</h4>
                            <p className="text-muted-foreground">{payment.period}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6 text-sm">
                          <div>
                            <div className="text-muted-foreground">Gross Amount</div>
                            <div className="font-medium">{formatCurrency(payment.grossAmount)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Deductions</div>
                            <div className="font-medium text-red-600">-{formatCurrency(payment.deductions)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Net Amount</div>
                            <div className="font-medium text-green-600">{formatCurrency(payment.netAmount)}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {payment.status === 'paid' ? 
                              `Paid: ${payment.paidDate}` : 
                              `Due: ${payment.paymentDate}`
                            }
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowPaymentDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Class Earnings Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {classEarnings.map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="font-medium">{earning.name}</div>
                          <div className="text-muted-foreground">{earning.date} • {earning.attendees} attendees</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-right">
                          <div className="text-muted-foreground">Base Rate</div>
                          <div className="font-medium">{formatCurrency(earning.baseRate)}</div>
                        </div>
                        
                        {earning.bonus > 0 && (
                          <div className="text-right">
                            <div className="text-muted-foreground">Bonus</div>
                            <div className="font-medium text-green-600">+{formatCurrency(earning.bonus)}</div>
                          </div>
                        )}
                        
                        <div className="text-right">
                          <div className="text-muted-foreground">Total</div>
                          <div className="font-bold">{formatCurrency(earning.total)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Swiss Taxes Tab */}
          <TabsContent value="taxes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Receipt className="h-5 w-5 mr-2" />
                  Swiss Tax Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Tax Withholding</h4>
                      <p className="text-blue-700 text-sm">
                        20% withholding tax is automatically deducted from your earnings as required by Swiss law for freelance instructors.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-muted-foreground">YTD Withholding Tax</div>
                    <div className="font-medium">{formatCurrency(paymentData.yearToDate.taxWithholding)}</div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="text-muted-foreground">YTD Social Contributions</div>
                    <div className="font-medium">{formatCurrency(paymentData.yearToDate.socialContributions)}</div>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download 2023 Tax Certificate
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Payment Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Payment Method</Label>
                    <Select value={paymentData.paymentSettings.method}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_class">Per Class</SelectItem>
                        <SelectItem value="per_hour">Per Hour</SelectItem>
                        <SelectItem value="per_attendee">Per Attendee</SelectItem>
                        <SelectItem value="revenue_percent">Revenue %</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Base Rate (CHF)</Label>
                    <Input 
                      type="number" 
                      value={paymentData.paymentSettings.rate}
                      placeholder="85.00"
                    />
                  </div>
                  
                  <div>
                    <Label>Payment Frequency</Label>
                    <Select value={paymentData.paymentSettings.paymentFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Bank Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Bank Name</Label>
                    <Input value={paymentData.bankAccount.bank} disabled />
                  </div>
                  
                  <div>
                    <Label>IBAN</Label>
                    <Input value={paymentData.bankAccount.accountNumber} disabled />
                  </div>
                  
                  <div>
                    <Label>Account Holder</Label>
                    <Input value={paymentData.bankAccount.accountHolder} disabled />
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Bank Details
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Payment Details Dialog */}
        {showPaymentDetails && selectedPayment && (
          <Dialog open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Payment Details - {selectedPayment.month}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Payment Period:</span>
                      <span className="font-medium">{selectedPayment.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Classes Taught:</span>
                      <span className="font-medium">{selectedPayment.classesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonus Amount:</span>
                      <span className="font-medium text-green-600">{formatCurrency(selectedPayment.bonusAmount)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Gross Amount:</span>
                      <span className="font-medium">{formatCurrency(selectedPayment.grossAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deductions:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(selectedPayment.deductions)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Amount:</span>
                      <span className="font-bold text-green-600">{formatCurrency(selectedPayment.netAmount)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button variant="outline" onClick={() => setShowPaymentDetails(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}