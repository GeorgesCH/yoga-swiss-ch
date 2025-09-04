import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Users, 
  Download,
  Eye,
  MoreHorizontal,
  DollarSign,
  Calculator,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  FileSpreadsheet,
  Settings,
  TrendingUp,
  User
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface InstructorEarningsProps {
  onBack: () => void;
}

export function InstructorEarnings({ onBack }: InstructorEarningsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('instructors');

  // Mock instructors data
  const instructors = [
    {
      id: 'INST-001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@yogaswiss.ch',
      status: 'active',
      currentPeriodEarnings: 1250.80,
      totalClasses: 18,
      avgPerClass: 69.49,
      pendingAmount: 350.00,
      paidAmount: 900.80,
      earningRule: {
        type: 'per_head',
        amount: 8.50,
        minAmount: 45.00,
        maxAmount: 120.00
      }
    },
    {
      id: 'INST-002',
      name: 'Marco Bianchi',
      email: 'marco.bianchi@yogaswiss.ch',
      status: 'active',
      currentPeriodEarnings: 980.60,
      totalClasses: 14,
      avgPerClass: 70.04,
      pendingAmount: 280.20,
      paidAmount: 700.40,
      earningRule: {
        type: 'per_class',
        amount: 70.00,
        minAmount: null,
        maxAmount: null
      }
    },
    {
      id: 'INST-003',
      name: 'Lisa Müller',
      email: 'lisa.mueller@yogaswiss.ch',
      status: 'active',
      currentPeriodEarnings: 1580.40,
      totalClasses: 22,
      avgPerClass: 71.84,
      pendingAmount: 450.60,
      paidAmount: 1129.80,
      earningRule: {
        type: 'percent_revenue',
        amount: 65.0,
        minAmount: 50.00,
        maxAmount: 150.00
      }
    }
  ];

  // Mock payroll periods data
  const payrollPeriods = [
    {
      id: 'PP-2025-01',
      name: 'January 2025',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      status: 'open',
      totalEarnings: 8950.60,
      totalInstructors: 12,
      totalClasses: 186
    },
    {
      id: 'PP-2024-12',
      name: 'December 2024',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      status: 'paid',
      totalEarnings: 9450.80,
      totalInstructors: 11,
      totalClasses: 198
    },
    {
      id: 'PP-2024-11',
      name: 'November 2024',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      status: 'closed',
      totalEarnings: 8750.40,
      totalInstructors: 10,
      totalClasses: 175
    }
  ];

  // Mock earnings data
  const earnings = [
    {
      id: 'EARN-001',
      instructorId: 'INST-001',
      instructorName: 'Sarah Johnson',
      classOccurrenceId: 'OCC-001',
      className: 'Vinyasa Flow',
      date: '2025-01-01',
      attendees: 12,
      basisAmount: 420.00,
      computedAmount: 85.00,
      status: 'accrued',
      ruleType: 'per_head'
    },
    {
      id: 'EARN-002',
      instructorId: 'INST-002',
      instructorName: 'Marco Bianchi',
      classOccurrenceId: 'OCC-002',
      className: 'Power Yoga',
      date: '2025-01-01',
      attendees: 8,
      basisAmount: 280.00,
      computedAmount: 70.00,
      status: 'approved',
      ruleType: 'per_class'
    },
    {
      id: 'EARN-003',
      instructorId: 'INST-003',
      instructorName: 'Lisa Müller',
      classOccurrenceId: 'OCC-003',
      className: 'Restorative Yoga',
      date: '2025-01-01',
      attendees: 15,
      basisAmount: 525.00,
      computedAmount: 94.50,
      status: 'paid',
      ruleType: 'percent_revenue'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>;
      case 'open':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Open</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Closed</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
      case 'accrued':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Accrued</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRuleBadge = (type: string) => {
    switch (type) {
      case 'per_head':
        return <Badge variant="secondary">Per Student</Badge>;
      case 'per_class':
        return <Badge variant="secondary">Per Class</Badge>;
      case 'percent_revenue':
        return <Badge variant="secondary">% Revenue</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = 
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || instructor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
            <h1>Instructor Earnings & Payroll</h1>
            <p className="text-muted-foreground">
              Manage instructor earnings, payroll periods and payment processing
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Earning Rules
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Period
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF 8,951</div>
            <p className="text-xs text-muted-foreground">
              January 2025 • 12 instructors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Class</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF 65.40</div>
            <p className="text-xs text-muted-foreground">
              +3.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF 1,081</div>
            <p className="text-xs text-muted-foreground">
              28 earnings entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">186</div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings & Payroll Management</CardTitle>
          <CardDescription>
            Track instructor earnings, manage payroll periods and process payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="instructors">Instructors</TabsTrigger>
              <TabsTrigger value="periods">Payroll Periods</TabsTrigger>
              <TabsTrigger value="earnings">Earnings Detail</TabsTrigger>
              <TabsTrigger value="rules">Earning Rules</TabsTrigger>
            </TabsList>
            
            <TabsContent value="instructors" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search instructors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current Earnings</TableHead>
                      <TableHead>Classes</TableHead>
                      <TableHead>Avg per Class</TableHead>
                      <TableHead>Earning Rule</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstructors.map((instructor) => (
                      <TableRow key={instructor.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{instructor.name}</div>
                            <div className="text-sm text-muted-foreground">{instructor.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(instructor.status)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">CHF {instructor.currentPeriodEarnings.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">
                              Pending: CHF {instructor.pendingAmount.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{instructor.totalClasses}</TableCell>
                        <TableCell className="font-medium">CHF {instructor.avgPerClass.toFixed(2)}</TableCell>
                        <TableCell>{getRuleBadge(instructor.earningRule.type)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedInstructor(instructor)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => console.log('Edit rules', instructor.id)}>
                                <Settings className="h-4 w-4 mr-2" />
                                Edit Rules
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => console.log('Download statement', instructor.id)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Statement
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="periods" className="space-y-4">
              <div className="space-y-4">
                {payrollPeriods.map((period) => (
                  <Card key={period.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedPeriod(period)}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{period.name}</CardTitle>
                          <CardDescription>
                            {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">CHF {period.totalEarnings.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{period.totalInstructors} instructors</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getStatusBadge(period.status)}
                          <div className="text-sm text-muted-foreground">
                            {period.totalClasses} classes taught
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {period.status === 'open' && (
                            <>
                              <Button variant="outline" size="sm">
                                <Calculator className="h-4 w-4 mr-2" />
                                Calculate
                              </Button>
                              <Button size="sm">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Close Period
                              </Button>
                            </>
                          )}
                          {period.status === 'closed' && (
                            <Button size="sm">
                              <DollarSign className="h-4 w-4 mr-2" />
                              Process Payment
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="earnings" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Attendees</TableHead>
                      <TableHead>Basis</TableHead>
                      <TableHead>Earned</TableHead>
                      <TableHead>Rule</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earnings.map((earning) => (
                      <TableRow key={earning.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(earning.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{earning.instructorName}</div>
                        </TableCell>
                        <TableCell>{earning.className}</TableCell>
                        <TableCell className="font-medium">{earning.attendees}</TableCell>
                        <TableCell>CHF {earning.basisAmount.toLocaleString()}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          CHF {earning.computedAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>{getRuleBadge(earning.ruleType)}</TableCell>
                        <TableCell>{getStatusBadge(earning.status)}</TableCell>
                        <TableCell className="text-right">
                          {earning.status === 'accrued' && (
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="rules" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Per Student
                    </CardTitle>
                    <CardDescription>
                      Earnings based on number of attendees
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Rate per student:</span>
                        <span className="font-medium">CHF 8.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Minimum per class:</span>
                        <span className="font-medium">CHF 45.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Maximum per class:</span>
                        <span className="font-medium">CHF 120.00</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Edit Rule
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Per Class
                    </CardTitle>
                    <CardDescription>
                      Fixed amount per class taught
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Fixed amount:</span>
                        <span className="font-medium">CHF 70.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Minimum:</span>
                        <span className="font-medium">-</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Maximum:</span>
                        <span className="font-medium">-</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Edit Rule
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      % Revenue
                    </CardTitle>
                    <CardDescription>
                      Percentage of class revenue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Revenue share:</span>
                        <span className="font-medium">65.0%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Minimum per class:</span>
                        <span className="font-medium">CHF 50.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Maximum per class:</span>
                        <span className="font-medium">CHF 150.00</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Edit Rule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Instructor Detail Dialog */}
      <Dialog open={!!selectedInstructor} onOpenChange={() => setSelectedInstructor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Instructor Details - {selectedInstructor?.name}</DialogTitle>
            <DialogDescription>
              Detailed earnings breakdown and payment history
            </DialogDescription>
          </DialogHeader>
          
          {selectedInstructor && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact Information</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">{selectedInstructor.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedInstructor.email}</p>
                    <div className="mt-1">{getStatusBadge(selectedInstructor.status)}</div>
                  </div>
                </div>
                <div>
                  <Label>Current Period Summary</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">Total Earnings: <span className="font-medium">CHF {selectedInstructor.currentPeriodEarnings.toLocaleString()}</span></p>
                    <p className="text-sm">Classes Taught: <span className="font-medium">{selectedInstructor.totalClasses}</span></p>
                    <p className="text-sm">Average per Class: <span className="font-medium">CHF {selectedInstructor.avgPerClass.toFixed(2)}</span></p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Payment Status</Label>
                <div className="mt-2 border rounded-lg">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Paid Amount</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          CHF {selectedInstructor.paidAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Pending Amount</TableCell>
                        <TableCell className="text-right font-medium text-yellow-600">
                          CHF {selectedInstructor.pendingAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-b-2">
                        <TableCell className="font-medium">Total Earnings</TableCell>
                        <TableCell className="text-right font-medium">
                          CHF {selectedInstructor.currentPeriodEarnings.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div>
                <Label>Earning Rule</Label>
                <div className="mt-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Current Rule</h4>
                    {getRuleBadge(selectedInstructor.earningRule.type)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Base Amount:</span>
                      <p className="font-medium">
                        {selectedInstructor.earningRule.type === 'percent_revenue' 
                          ? `${selectedInstructor.earningRule.amount}%`
                          : `CHF ${selectedInstructor.earningRule.amount.toLocaleString()}`
                        }
                      </p>
                    </div>
                    {selectedInstructor.earningRule.minAmount && (
                      <div>
                        <span className="text-muted-foreground">Minimum:</span>
                        <p className="font-medium">CHF {selectedInstructor.earningRule.minAmount.toLocaleString()}</p>
                      </div>
                    )}
                    {selectedInstructor.earningRule.maxAmount && (
                      <div>
                        <span className="text-muted-foreground">Maximum:</span>
                        <p className="font-medium">CHF {selectedInstructor.earningRule.maxAmount.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}