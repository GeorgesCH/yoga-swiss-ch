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
import { Textarea } from '../ui/textarea';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  FileText, 
  Download,
  Send,
  Eye,
  MoreHorizontal,
  QrCode,
  Receipt,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Printer
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface InvoicesQRManagementProps {
  onBack: () => void;
}

export function InvoicesQRManagement({ onBack }: InvoicesQRManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);

  // Mock invoices data
  const invoices = [
    {
      id: 'INV-2025-YST-000123',
      orderId: 'ORD-2025-001234',
      customer: 'Maria Schmidt',
      email: 'maria.schmidt@email.com',
      amount: 35.00,
      vatAmount: 2.84,
      netAmount: 32.16,
      currency: 'CHF',
      status: 'paid',
      issueDate: '2025-01-01',
      dueDate: '2025-01-15',
      paidDate: '2025-01-01',
      items: [
        { 
          description: 'Vinyasa Flow - Drop-in Class', 
          quantity: 1, 
          unitPrice: 35.00, 
          vatRate: 0.081,
          vatAmount: 2.84,
          total: 35.00 
        }
      ],
      hasQRBill: true,
      paymentMethod: 'card'
    },
    {
      id: 'INV-2025-YST-000124',
      orderId: 'ORD-2025-001235',
      customer: 'Thomas Weber',
      email: 'thomas.weber@email.com',
      amount: 120.00,
      vatAmount: 9.72,
      netAmount: 110.28,
      currency: 'CHF',
      status: 'sent',
      issueDate: '2025-01-01',
      dueDate: '2025-01-15',
      items: [
        { 
          description: 'Monthly Unlimited Membership', 
          quantity: 1, 
          unitPrice: 120.00, 
          vatRate: 0.081,
          vatAmount: 9.72,
          total: 120.00 
        }
      ],
      hasQRBill: true,
      paymentMethod: 'bank_transfer'
    },
    {
      id: 'INV-2025-YST-000125',
      orderId: 'ORD-2025-001236',
      customer: 'Anna Müller',
      email: 'anna.mueller@email.com',
      amount: 150.00,
      vatAmount: 12.15,
      netAmount: 137.85,
      currency: 'CHF',
      status: 'paid',
      issueDate: '2025-01-01',
      dueDate: '2025-01-15',
      paidDate: '2025-01-01',
      items: [
        { 
          description: '5-Class Pass', 
          quantity: 1, 
          unitPrice: 150.00, 
          vatRate: 0.081,
          vatAmount: 12.15,
          total: 150.00 
        }
      ],
      hasQRBill: false,
      paymentMethod: 'twint'
    },
    {
      id: 'CNT-2025-YST-000126',
      orderId: 'ORD-2025-001237',
      customer: 'Peter Zimmermann',
      email: 'peter.zimmermann@email.com',
      amount: -30.00,
      vatAmount: -2.43,
      netAmount: -27.57,
      currency: 'CHF',
      status: 'issued',
      issueDate: '2025-01-01',
      items: [
        { 
          description: 'Refund: Vinyasa Flow Class', 
          quantity: 1, 
          unitPrice: -30.00, 
          vatRate: 0.081,
          vatAmount: -2.43,
          total: -30.00 
        }
      ],
      hasQRBill: false,
      paymentMethod: 'original_method',
      type: 'credit_note',
      originalInvoice: 'INV-2025-YST-000120'
    }
  ];

  const getStatusBadge = (status: string, type?: string) => {
    if (type === 'credit_note') {
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Credit Note</Badge>;
    }
    
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sent</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Overdue</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Draft</Badge>;
      case 'issued':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Issued</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const generateQRBill = (invoice: any) => {
    console.log('Generating QR-bill for invoice:', invoice.id);
    setShowQRDialog(true);
  };

  // Mock QR-bill data
  const qrBillData = {
    creditorName: 'YogaSwiss Studio GmbH',
    creditorAddress: 'Bahnhofstrasse 123, 8001 Zürich',
    creditorIBAN: 'CH93 0076 2011 6238 5295 7',
    amount: selectedInvoice?.amount || 0,
    currency: 'CHF',
    debtorName: selectedInvoice?.customer || '',
    reference: selectedInvoice?.id || '',
    additionalInfo: `Invoice ${selectedInvoice?.id}`,
    qrCodeData: 'SPC\n0200\n1\nCH9300762011623852957\nS\nYogaSwiss Studio GmbH\nBahnhofstrasse 123\n8001\nZürich\nCH'
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
            <h1>Invoices & QR-Bills</h1>
            <p className="text-muted-foreground">
              Generate invoices, Swiss QR-bills and manage tax documentation
            </p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF 45,280</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.2%</div>
            <p className="text-xs text-muted-foreground">
              +1.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF 3,250</div>
            <p className="text-xs text-muted-foreground">
              23 invoices pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VAT Collected</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF 3,668</div>
            <p className="text-xs text-muted-foreground">
              8.1% standard rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
          <CardDescription>
            Manage invoices, credit notes and Swiss QR-bill generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search invoices, customers, or emails..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Invoices Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-mono">{invoice.id}</div>
                      {invoice.hasQRBill && (
                        <div className="flex items-center gap-1 mt-1">
                          <QrCode className="h-3 w-3 text-blue-500" />
                          <span className="text-xs text-blue-600">QR-Bill</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.customer}</div>
                        <div className="text-sm text-muted-foreground">{invoice.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className={`font-medium ${invoice.amount < 0 ? 'text-red-600' : ''}`}>
                          {invoice.currency} {Math.abs(invoice.amount).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          VAT: {invoice.currency} {Math.abs(invoice.vatAmount).toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status, invoice.type)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedInvoice(invoice)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log('Download PDF', invoice.id)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          {invoice.hasQRBill && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedInvoice(invoice);
                              generateQRBill(invoice);
                            }}>
                              <QrCode className="h-4 w-4 mr-2" />
                              View QR-Bill
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => console.log('Send email', invoice.id)}>
                            <Send className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log('Print', invoice.id)}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice && !showQRDialog} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice Details - {selectedInvoice?.id}</DialogTitle>
            <DialogDescription>
              Complete invoice information and tax breakdown
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <Tabs defaultValue="invoice" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="invoice">Invoice Info</TabsTrigger>
                <TabsTrigger value="tax">Tax Breakdown</TabsTrigger>
                <TabsTrigger value="payment">Payment Status</TabsTrigger>
              </TabsList>
              
              <TabsContent value="invoice" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Customer Information</Label>
                    <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium">{selectedInvoice.customer}</p>
                      <p className="text-sm text-muted-foreground">{selectedInvoice.email}</p>
                    </div>
                  </div>
                  <div>
                    <Label>Invoice Details</Label>
                    <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">Issue Date: {new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                      {selectedInvoice.dueDate && (
                        <p className="text-sm">Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                      )}
                      <p className="text-sm">Status: {selectedInvoice.status}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Invoice Items</Label>
                  <div className="mt-2 border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">VAT Rate</TableHead>
                          <TableHead className="text-right">VAT Amount</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.items.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell className="text-right">{selectedInvoice.currency} {Math.abs(item.unitPrice).toLocaleString()}</TableCell>
                            <TableCell className="text-right">{(item.vatRate * 100).toFixed(1)}%</TableCell>
                            <TableCell className="text-right">{selectedInvoice.currency} {Math.abs(item.vatAmount).toLocaleString()}</TableCell>
                            <TableCell className="text-right font-medium">{selectedInvoice.currency} {Math.abs(item.total).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span>Net Amount:</span>
                        <span>{selectedInvoice.currency} {Math.abs(selectedInvoice.netAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT (8.1%):</span>
                        <span>{selectedInvoice.currency} {Math.abs(selectedInvoice.vatAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-medium text-lg border-t pt-2">
                        <span>Total:</span>
                        <span className={selectedInvoice.amount < 0 ? 'text-red-600' : ''}>
                          {selectedInvoice.currency} {Math.abs(selectedInvoice.amount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="tax" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>VAT Breakdown</Label>
                    <div className="mt-2 border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>VAT Rate</TableHead>
                            <TableHead className="text-right">Net Amount</TableHead>
                            <TableHead className="text-right">VAT Amount</TableHead>
                            <TableHead className="text-right">Gross Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>8.1% (Standard Rate)</TableCell>
                            <TableCell className="text-right">{selectedInvoice.currency} {Math.abs(selectedInvoice.netAmount).toLocaleString()}</TableCell>
                            <TableCell className="text-right">{selectedInvoice.currency} {Math.abs(selectedInvoice.vatAmount).toLocaleString()}</TableCell>
                            <TableCell className="text-right font-medium">{selectedInvoice.currency} {Math.abs(selectedInvoice.amount).toLocaleString()}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Tax Information</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• VAT calculated using Swiss standard rate (8.1%)</li>
                      <li>• Tax mode: Inclusive pricing</li>
                      <li>• VAT ID: CHE-123.456.789 MWST</li>
                      <li>• Tax period: Q1 2025</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="payment" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Payment Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedInvoice.status, selectedInvoice.type)}</div>
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    <p className="text-sm font-medium capitalize">{selectedInvoice.paymentMethod.replace('_', ' ')}</p>
                  </div>
                  {selectedInvoice.paidDate && (
                    <div>
                      <Label>Payment Date</Label>
                      <p className="text-sm font-medium">{new Date(selectedInvoice.paidDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedInvoice.hasQRBill && (
                    <div>
                      <Label>Swiss QR-Bill</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateQRBill(selectedInvoice)}
                        className="mt-1"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        View QR-Bill
                      </Button>
                    </div>
                  )}
                </div>
                
                {selectedInvoice.type === 'credit_note' && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-2">Credit Note Information</h4>
                    <p className="text-sm text-purple-700">
                      This is a credit note referencing original invoice: {selectedInvoice.originalInvoice}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* QR-Bill Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Swiss QR-Bill - {selectedInvoice?.id}</DialogTitle>
            <DialogDescription>
              QR payment part for Swiss bank transfers
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* QR Code Section */}
            <div className="flex items-center justify-center p-8 bg-white border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <div className="w-32 h-32 bg-black mx-auto mb-4 flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">Swiss QR Code</p>
                <p className="text-xs text-muted-foreground">ISO 20022 Standard</p>
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Creditor (Payee)</h4>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{qrBillData.creditorName}</p>
                  <p className="text-muted-foreground">{qrBillData.creditorAddress}</p>
                  <p className="font-mono">{qrBillData.creditorIBAN}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Payment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">{qrBillData.currency} {qrBillData.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reference:</span>
                    <span className="font-mono text-xs">{qrBillData.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Additional Info:</span>
                    <span className="text-xs">{qrBillData.additionalInfo}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Debtor Information */}
            <div>
              <h4 className="font-medium mb-3">Debtor (Payer)</h4>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium">{qrBillData.debtorName}</p>
                <p className="text-sm text-muted-foreground">
                  Payment reference will be automatically filled when using this QR code
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => console.log('Download QR-Bill PNG')}>
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
              <Button variant="outline" onClick={() => console.log('Download QR-Bill PDF')}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={() => console.log('Print QR-Bill')}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}