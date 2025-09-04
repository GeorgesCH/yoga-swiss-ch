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
  Gift, 
  CreditCard,
  Eye,
  MoreHorizontal,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Plus,
  DollarSign,
  Users,
  Ticket
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface LiabilitiesManagementProps {
  onBack: () => void;
}

export function LiabilitiesManagement({ onBack }: LiabilitiesManagementProps) {
  const [activeTab, setActiveTab] = useState('gift-cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Mock gift cards data
  const giftCards = [
    {
      id: 'GC-2025-001',
      code: 'YOGA2025GIFT',
      purchaser: 'Maria Schmidt',
      purchaserEmail: 'maria.schmidt@email.com',
      recipient: 'Anna Mueller',
      recipientEmail: 'anna.mueller@email.com',
      originalValue: 100.00,
      currentBalance: 65.00,
      currency: 'CHF',
      status: 'active',
      purchaseDate: '2024-12-15',
      expiryDate: '2025-12-15',
      issuedBy: 'system',
      transactions: [
        { date: '2024-12-20', type: 'redemption', amount: -35.00, description: 'Vinyasa Flow Class' },
      ]
    },
    {
      id: 'GC-2025-002',
      code: 'HOLIDAY2024',
      purchaser: 'Thomas Weber',
      purchaserEmail: 'thomas.weber@email.com',
      recipient: 'Self',
      recipientEmail: 'thomas.weber@email.com',
      originalValue: 250.00,
      currentBalance: 250.00,
      currency: 'CHF',
      status: 'active',
      purchaseDate: '2024-12-01',
      expiryDate: '2025-12-01',
      issuedBy: 'front_desk',
      transactions: []
    },
    {
      id: 'GC-2024-089',
      code: 'SUMMER2024',
      purchaser: 'Lisa Müller',
      purchaserEmail: 'lisa.mueller@email.com',
      recipient: 'Peter Schmidt',
      recipientEmail: 'peter.schmidt@email.com',
      originalValue: 150.00,
      currentBalance: 0.00,
      currency: 'CHF',
      status: 'redeemed',
      purchaseDate: '2024-06-15',
      expiryDate: '2025-06-15',
      redeemedDate: '2024-11-20',
      issuedBy: 'online',
      transactions: [
        { date: '2024-08-10', type: 'redemption', amount: -75.00, description: 'Hot Yoga Workshop' },
        { date: '2024-11-20', type: 'redemption', amount: -75.00, description: 'Private Session' }
      ]
    },
    {
      id: 'GC-2023-045',
      code: 'BIRTHDAY2023',
      purchaser: 'Anna Rossi',
      purchaserEmail: 'anna.rossi@email.com',
      recipient: 'Marco Bianchi',
      recipientEmail: 'marco.bianchi@email.com',
      originalValue: 200.00,
      currentBalance: 45.00,
      currency: 'CHF',
      status: 'expired',
      purchaseDate: '2023-03-15',
      expiryDate: '2024-03-15',
      issuedBy: 'online',
      breakageAmount: 45.00,
      transactions: [
        { date: '2023-05-20', type: 'redemption', amount: -80.00, description: 'Monthly Membership' },
        { date: '2023-08-15', type: 'redemption', amount: -75.00, description: 'Workshop Series' }
      ]
    }
  ];

  // Mock class passes data
  const classPasses = [
    {
      id: 'PASS-2025-001',
      customer: 'Sarah Johnson',
      customerEmail: 'sarah.johnson@email.com',
      passType: '10-Class Pass',
      originalClasses: 10,
      remainingClasses: 7,
      currency: 'CHF',
      originalValue: 320.00,
      currentLiability: 224.00,
      status: 'active',
      purchaseDate: '2024-12-01',
      expiryDate: '2025-06-01',
      transactions: [
        { date: '2024-12-05', type: 'redemption', classes: -1, description: 'Vinyasa Flow' },
        { date: '2024-12-12', type: 'redemption', classes: -1, description: 'Power Yoga' },
        { date: '2024-12-20', type: 'redemption', classes: -1, description: 'Restorative Yoga' }
      ]
    },
    {
      id: 'PASS-2025-002',
      customer: 'Marco Weber',
      customerEmail: 'marco.weber@email.com',
      passType: '5-Class Pass',
      originalClasses: 5,
      remainingClasses: 5,
      currency: 'CHF',
      originalValue: 175.00,
      currentLiability: 175.00,
      status: 'active',
      purchaseDate: '2024-12-28',
      expiryDate: '2025-03-28',
      transactions: []
    },
    {
      id: 'PASS-2024-156',
      customer: 'Lisa Schmidt',
      customerEmail: 'lisa.schmidt@email.com',
      passType: '20-Class Pass',
      originalClasses: 20,
      remainingClasses: 2,
      currency: 'CHF',
      originalValue: 580.00,
      currentLiability: 58.00,
      status: 'expiring_soon',
      purchaseDate: '2024-09-15',
      expiryDate: '2025-01-15',
      transactions: [
        { date: '2024-09-20', type: 'redemption', classes: -3, description: 'Various classes' },
        { date: '2024-10-15', type: 'redemption', classes: -5, description: 'Various classes' },
        { date: '2024-11-20', type: 'redemption', classes: -10, description: 'Various classes' }
      ]
    }
  ];

  // Mock customer credit balances
  const customerCredits = [
    {
      id: 'CREDIT-001',
      customer: 'Anna Mueller',
      customerEmail: 'anna.mueller@email.com',
      balance: 45.50,
      currency: 'CHF',
      lastActivity: '2024-12-20',
      source: 'refund',
      originalAmount: 45.50,
      transactions: [
        { date: '2024-12-20', type: 'credit', amount: 45.50, description: 'Class cancellation refund' }
      ]
    },
    {
      id: 'CREDIT-002',
      customer: 'Peter Zimmermann',
      customerEmail: 'peter.zimmermann@email.com',
      balance: 25.00,
      currency: 'CHF',
      lastActivity: '2024-12-15',
      source: 'goodwill',
      originalAmount: 30.00,
      transactions: [
        { date: '2024-12-10', type: 'credit', amount: 30.00, description: 'Service recovery credit' },
        { date: '2024-12-15', type: 'redemption', amount: -5.00, description: 'Applied to membership' }
      ]
    }
  ];

  const getStatusBadge = (status: string, type?: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'redeemed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Fully Redeemed</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Expired</Badge>;
      case 'expiring_soon':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Expiring Soon</Badge>;
      case 'suspended':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateTotalLiabilities = () => {
    const giftCardTotal = giftCards
      .filter(gc => gc.status === 'active')
      .reduce((sum, gc) => sum + gc.currentBalance, 0);
    
    const passTotal = classPasses
      .filter(pass => ['active', 'expiring_soon'].includes(pass.status))
      .reduce((sum, pass) => sum + pass.currentLiability, 0);
    
    const creditTotal = customerCredits
      .reduce((sum, credit) => sum + credit.balance, 0);
    
    return {
      giftCards: giftCardTotal,
      passes: passTotal,
      credits: creditTotal,
      total: giftCardTotal + passTotal + creditTotal
    };
  };

  const liabilities = calculateTotalLiabilities();

  const filteredItems = (() => {
    let items: any[] = [];
    
    switch (activeTab) {
      case 'gift-cards':
        items = giftCards;
        break;
      case 'passes':
        items = classPasses;
        break;
      case 'credits':
        items = customerCredits;
        break;
      default:
        items = [];
    }

    return items.filter(item => {
      const searchFields = activeTab === 'gift-cards' 
        ? [item.code, item.purchaser, item.recipient, item.purchaserEmail, item.recipientEmail]
        : activeTab === 'passes'
        ? [item.customer, item.customerEmail, item.passType]
        : [item.customer, item.customerEmail];
      
      const matchesSearch = searchFields.some(field => 
        field && field.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  })();

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
            <h1>Liabilities Management</h1>
            <p className="text-muted-foreground">
              Manage gift cards, class passes and customer credit balances
            </p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Issue Gift Card
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {liabilities.total.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Outstanding obligations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gift Cards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {liabilities.giftCards.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              {giftCards.filter(gc => gc.status === 'active').length} active cards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Passes</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {liabilities.passes.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              {classPasses.filter(p => ['active', 'expiring_soon'].includes(p.status)).length} active passes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {liabilities.credits.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              {customerCredits.length} credit balances
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Liability Details</CardTitle>
          <CardDescription>
            Monitor and manage all customer liabilities and prepaid balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="gift-cards">Gift Cards</TabsTrigger>
              <TabsTrigger value="passes">Class Passes</TabsTrigger>
              <TabsTrigger value="credits">Customer Credits</TabsTrigger>
              <TabsTrigger value="breakage">Breakage Analysis</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search..."
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
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="redeemed">Redeemed</SelectItem>
                    <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="gift-cards" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gift Card Code</TableHead>
                      <TableHead>Purchaser</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Original Value</TableHead>
                      <TableHead>Current Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((giftCard) => (
                      <TableRow key={giftCard.id}>
                        <TableCell className="font-mono">{giftCard.code}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{giftCard.purchaser}</div>
                            <div className="text-sm text-muted-foreground">{giftCard.purchaserEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {giftCard.recipient === 'Self' ? (
                            <span className="text-muted-foreground">Self</span>
                          ) : (
                            <div>
                              <div className="font-medium">{giftCard.recipient}</div>
                              <div className="text-sm text-muted-foreground">{giftCard.recipientEmail}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>CHF {giftCard.originalValue.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="font-medium">
                          CHF {giftCard.currentBalance.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>{getStatusBadge(giftCard.status)}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(giftCard.expiryDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedItem(giftCard)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {giftCard.status === 'active' && (
                                <>
                                  <DropdownMenuItem>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Adjust Balance
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Extend Expiry
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="passes" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Pass Type</TableHead>
                      <TableHead>Classes Remaining</TableHead>
                      <TableHead>Liability Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((pass) => (
                      <TableRow key={pass.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pass.customer}</div>
                            <div className="text-sm text-muted-foreground">{pass.customerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>{pass.passType}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pass.remainingClasses} / {pass.originalClasses}</div>
                            <Progress 
                              value={(pass.remainingClasses / pass.originalClasses) * 100}
                              className="w-16 mt-1"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          CHF {pass.currentLiability.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>{getStatusBadge(pass.status)}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(pass.expiryDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedItem(pass)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {pass.status === 'active' && (
                                <>
                                  <DropdownMenuItem>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Adjust Classes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Extend Pass
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="credits" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Credit Balance</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((credit) => (
                      <TableRow key={credit.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{credit.customer}</div>
                            <div className="text-sm text-muted-foreground">{credit.customerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          CHF {credit.balance.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {credit.source.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(credit.lastActivity).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedItem(credit)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Adjust Balance
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
            
            <TabsContent value="breakage" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Gift Card Breakage Analysis</CardTitle>
                    <CardDescription>Revenue recognized from expired gift cards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Expired This Year:</span>
                        <span className="font-medium">CHF 145.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Breakage Revenue:</span>
                        <span className="font-medium text-green-600">CHF 45.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Breakage Rate:</span>
                        <span className="font-medium">31.0%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg Days to Expiry:</span>
                        <span className="font-medium">287 days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Pass Breakage Analysis</CardTitle>
                    <CardDescription>Revenue from unused class credits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Expired This Year:</span>
                        <span className="font-medium">CHF 280.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Classes Unused:</span>
                        <span className="font-medium">12 classes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Utilization Rate:</span>
                        <span className="font-medium">73.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg Pass Completion:</span>
                        <span className="font-medium">85.2%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Breakage Recognition Schedule</CardTitle>
                  <CardDescription>Upcoming breakage revenue recognition events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-800">15 Gift Cards Expiring</p>
                          <p className="text-sm text-yellow-700">January 31, 2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-yellow-800">CHF 425.00</p>
                        <p className="text-sm text-yellow-700">Est. breakage: CHF 131.75</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <Ticket className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-800">8 Class Passes Expiring</p>
                          <p className="text-sm text-blue-700">February 15, 2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-blue-800">CHF 290.00</p>
                        <p className="text-sm text-blue-700">23 classes unused</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'gift-cards' ? 'Gift Card Details' : 
               activeTab === 'passes' ? 'Class Pass Details' : 
               'Customer Credit Details'}
            </DialogTitle>
            <DialogDescription>
              Complete transaction history and current status
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
              {activeTab === 'gift-cards' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Gift Card Code</Label>
                      <p className="font-mono">{selectedItem.code}</p>
                    </div>
                    <div>
                      <Label>Current Balance</Label>
                      <p className="font-medium">CHF {selectedItem.currentBalance.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <Label>Purchaser</Label>
                      <p className="font-medium">{selectedItem.purchaser}</p>
                      <p className="text-sm text-muted-foreground">{selectedItem.purchaserEmail}</p>
                    </div>
                    <div>
                      <Label>Recipient</Label>
                      {selectedItem.recipient === 'Self' ? (
                        <p className="text-muted-foreground">Self-purchase</p>
                      ) : (
                        <>
                          <p className="font-medium">{selectedItem.recipient}</p>
                          <p className="text-sm text-muted-foreground">{selectedItem.recipientEmail}</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Transaction History</Label>
                    <div className="mt-2 border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>{new Date(selectedItem.purchaseDate).toLocaleDateString()}</TableCell>
                            <TableCell>Purchase</TableCell>
                            <TableCell className="text-green-600">+CHF {selectedItem.originalValue.toFixed(2)}</TableCell>
                            <TableCell>Initial purchase</TableCell>
                          </TableRow>
                          {selectedItem.transactions.map((txn: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                              <TableCell className="capitalize">{txn.type}</TableCell>
                              <TableCell className={txn.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                                {txn.amount > 0 ? '+' : ''}CHF {Math.abs(txn.amount).toFixed(2)}
                              </TableCell>
                              <TableCell>{txn.description}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}