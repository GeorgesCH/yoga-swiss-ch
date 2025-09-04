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
  PiggyBank, 
  Download,
  Upload,
  Eye,
  MoreHorizontal,
  Banknote,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Link,
  FileSpreadsheet
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface PayoutsReconciliationProps {
  onBack: () => void;
}

export function PayoutsReconciliation({ onBack }: PayoutsReconciliationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('payouts');

  // Mock payouts data
  const payouts = [
    {
      id: 'PO-2025-001',
      provider: 'stripe',
      providerPayoutId: 'po_1234567890',
      status: 'paid',
      currency: 'CHF',
      grossAmount: 2847.50,
      feeAmount: 85.43,
      netAmount: 2762.07,
      estimatedArrival: '2025-01-03',
      arrivedAt: '2025-01-03',
      statementDescriptor: 'STRIPE PAYOUT',
      items: [
        { type: 'charge', amount: 2950.00, description: 'Card payments', count: 84 },
        { type: 'refund', amount: -102.50, description: 'Refunds processed', count: 3 },
        { type: 'fee', amount: -85.43, description: 'Processing fees', count: 87 }
      ]
    },
    {
      id: 'PO-2025-002',
      provider: 'datatrans',
      providerPayoutId: 'dt_abc123def',
      status: 'in_transit',
      currency: 'CHF',
      grossAmount: 1890.75,
      feeAmount: 47.27,
      netAmount: 1843.48,
      estimatedArrival: '2025-01-04',
      statementDescriptor: 'DATATRANS SETTLEMENT',
      items: [
        { type: 'charge', amount: 1950.00, description: 'TWINT payments', count: 39 },
        { type: 'refund', amount: -59.25, description: 'Refunds processed', count: 2 },
        { type: 'fee', amount: -47.27, description: 'Processing fees', count: 41 }
      ]
    },
    {
      id: 'PO-2025-003',
      provider: 'wallee',
      providerPayoutId: 'wl_xyz789abc',
      status: 'expected',
      currency: 'CHF',
      grossAmount: 945.30,
      feeAmount: 28.36,
      netAmount: 916.94,
      estimatedArrival: '2025-01-05',
      statementDescriptor: 'WALLEE PAYOUT',
      items: [
        { type: 'charge', amount: 975.00, description: 'Mixed payments', count: 26 },
        { type: 'refund', amount: -29.70, description: 'Refunds processed', count: 1 },
        { type: 'fee', amount: -28.36, description: 'Processing fees', count: 27 }
      ]
    }
  ];

  // Mock bank statements data
  const bankStatements = [
    {
      id: 'BS-2025-001',
      source: 'camt053',
      accountIBAN: 'CH93 0076 2011 6238 5295 7',
      statementDate: '2025-01-03',
      totalLines: 45,
      matchedLines: 43,
      unmatchedLines: 2,
      totalAmount: 15480.50,
      fileName: 'camt053-20250103.xml'
    },
    {
      id: 'BS-2025-002',
      source: 'csv',
      accountIBAN: 'CH93 0076 2011 6238 5295 7',
      statementDate: '2025-01-02',
      totalLines: 38,
      matchedLines: 38,
      unmatchedLines: 0,
      totalAmount: 12750.30,
      fileName: 'statement-20250102.csv'
    }
  ];

  // Mock bank lines data
  const bankLines = [
    {
      id: 'BL-001',
      statementId: 'BS-2025-001',
      postedAt: '2025-01-03',
      amount: 2762.07,
      currency: 'CHF',
      description: 'STRIPE PAYOUT',
      counterparty: 'Stripe Payments Europe',
      endToEndId: 'STRIPE-PO-123456',
      matchedEntity: 'payouts',
      matchedId: 'PO-2025-001',
      matchConfidence: 1.0
    },
    {
      id: 'BL-002',
      statementId: 'BS-2025-001',
      postedAt: '2025-01-03',
      amount: 120.00,
      currency: 'CHF',
      description: 'QR Invoice Payment',
      counterparty: 'Thomas Weber',
      endToEndId: 'INV-2025-YST-000124',
      matchedEntity: 'invoice',
      matchedId: 'INV-2025-YST-000124',
      matchConfidence: 1.0
    },
    {
      id: 'BL-003',
      statementId: 'BS-2025-001',
      postedAt: '2025-01-03',
      amount: 150.00,
      currency: 'CHF',
      description: 'Bank Transfer',
      counterparty: 'Unknown Customer',
      endToEndId: 'UNKNOWN-REF-789',
      matchedEntity: null,
      matchedId: null,
      matchConfidence: 0.0
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
      case 'in_transit':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Transit</Badge>;
      case 'expected':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Expected</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'stripe':
        return <Badge variant="secondary" className="bg-purple-50 text-purple-700">Stripe</Badge>;
      case 'datatrans':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700">Datatrans</Badge>;
      case 'wallee':
        return <Badge variant="secondary" className="bg-green-50 text-green-700">Wallee</Badge>;
      default:
        return <Badge variant="secondary">{provider}</Badge>;
    }
  };

  const getMatchBadge = (confidence: number) => {
    if (confidence >= 0.9) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Auto Matched</Badge>;
    } else if (confidence >= 0.7) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Possible Match</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Unmatched</Badge>;
    }
  };

  const filteredPayouts = payouts.filter(payout => {
    const matchesSearch = 
      payout.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.providerPayoutId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
    
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
            <h1>Payouts & Reconciliation</h1>
            <p className="text-muted-foreground">
              Track provider settlements and reconcile bank statements
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Statement
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Payouts
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF 2,760</div>
            <p className="text-xs text-muted-foreground">
              Expected in 2-3 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Match Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.1%</div>
            <p className="text-xs text-muted-foreground">
              Auto-reconciliation success
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Fees</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF 161</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unmatched Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Require manual review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Payout & Reconciliation Management</CardTitle>
          <CardDescription>
            Monitor provider payouts and reconcile with bank statements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payouts">Provider Payouts</TabsTrigger>
              <TabsTrigger value="statements">Bank Statements</TabsTrigger>
              <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="payouts" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search payouts..."
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
                    <SelectItem value="expected">Expected</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payout ID</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expected Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-mono">{payout.id}</TableCell>
                        <TableCell>{getProviderBadge(payout.provider)}</TableCell>
                        <TableCell>
                          <div className="font-medium">{payout.currency} {payout.grossAmount.toLocaleString()}</div>
                        </TableCell>
                        <TableCell className="text-red-600">
                          -{payout.currency} {payout.feeAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {payout.currency} {payout.netAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(payout.estimatedArrival).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedPayout(payout)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => console.log('Download report', payout.id)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Report
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => console.log('Match manually', payout.id)}>
                                <Link className="h-4 w-4 mr-2" />
                                Manual Match
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
            
            <TabsContent value="statements" className="space-y-4">
              <div className="space-y-4">
                {bankStatements.map((statement) => (
                  <Card key={statement.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{statement.fileName}</CardTitle>
                          <CardDescription>
                            {statement.source.toUpperCase()} • {new Date(statement.statementDate).toLocaleDateString()} • {statement.accountIBAN}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">CHF {statement.totalAmount.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{statement.totalLines} transactions</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <div className="text-sm">
                              <span className="text-green-600 font-medium">{statement.matchedLines} matched</span>
                              {statement.unmatchedLines > 0 && (
                                <span className="text-red-600 font-medium ml-4">{statement.unmatchedLines} unmatched</span>
                              )}
                            </div>
                          </div>
                          <Progress 
                            value={(statement.matchedLines / statement.totalLines) * 100} 
                            className="w-48"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
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
            
            <TabsContent value="reconciliation" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Counterparty</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Match Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(line.postedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium ${line.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {line.amount > 0 ? '+' : ''}{line.currency} {Math.abs(line.amount).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>{line.description}</TableCell>
                        <TableCell>{line.counterparty}</TableCell>
                        <TableCell className="font-mono text-xs">{line.endToEndId}</TableCell>
                        <TableCell>{getMatchBadge(line.matchConfidence)}</TableCell>
                        <TableCell className="text-right">
                          {line.matchConfidence === 0 && (
                            <Button variant="outline" size="sm">
                              <Link className="h-4 w-4 mr-2" />
                              Match
                            </Button>
                          )}
                          {line.matchConfidence > 0 && (
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payout Detail Dialog */}
      <Dialog open={!!selectedPayout} onOpenChange={() => setSelectedPayout(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payout Details - {selectedPayout?.id}</DialogTitle>
            <DialogDescription>
              Detailed breakdown of provider settlement
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayout && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Provider Information</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      {getProviderBadge(selectedPayout.provider)}
                      {getStatusBadge(selectedPayout.status)}
                    </div>
                    <p className="text-sm font-mono">{selectedPayout.providerPayoutId}</p>
                  </div>
                </div>
                <div>
                  <Label>Timing</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">Expected: {new Date(selectedPayout.estimatedArrival).toLocaleDateString()}</p>
                    {selectedPayout.arrivedAt && (
                      <p className="text-sm">Arrived: {new Date(selectedPayout.arrivedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Financial Summary</Label>
                <div className="mt-2 border rounded-lg">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Gross Amount</TableCell>
                        <TableCell className="text-right font-medium">
                          {selectedPayout.currency} {selectedPayout.grossAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Processing Fees</TableCell>
                        <TableCell className="text-right text-red-600">
                          -{selectedPayout.currency} {selectedPayout.feeAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-b-2">
                        <TableCell className="font-medium">Net Amount</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {selectedPayout.currency} {selectedPayout.netAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div>
                <Label>Payout Items</Label>
                <div className="mt-2 border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPayout.items.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="capitalize">{item.type}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.count}</TableCell>
                          <TableCell className={`text-right ${item.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {item.amount > 0 ? '+' : ''}{selectedPayout.currency} {Math.abs(item.amount).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}