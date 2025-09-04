import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  CreditCard, 
  Receipt, 
  RefreshCcw,
  Eye,
  MoreHorizontal,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Plus
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { financeService, Order, Payment, Refund } from '../../utils/supabase/finance-service';

interface OrdersPaymentsManagementProps {
  onBack: () => void;
}

export function OrdersPaymentsManagement({ onBack }: OrdersPaymentsManagementProps) {
  const { currentOrg } = useMultiTenantAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayOrders: 0,
    successRate: 0,
    failedPayments: 0,
    refundsToday: 0
  });

  useEffect(() => {
    if (currentOrg?.id) {
      loadOrders();
      loadPayments();
      loadStats();
    }
  }, [currentOrg]);

  const loadOrders = async () => {
    if (!currentOrg?.id) return;

    try {
      setLoading(true);
      const result = await financeService.getOrders(currentOrg.id, {
        limit: 100,
        offset: 0
      });

      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    if (!currentOrg?.id) return;

    try {
      const result = await financeService.getPayments(currentOrg.id, {
        limit: 100
      });

      if (result.success) {
        setPayments(result.data);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const loadStats = async () => {
    if (!currentOrg?.id) return;

    try {
      // Get today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const ordersResult = await financeService.getOrders(currentOrg.id, {
        date_from: today.toISOString(),
        date_to: tomorrow.toISOString()
      });

      const paymentsResult = await financeService.getPayments(currentOrg.id, {
        date_from: today.toISOString(),
        date_to: tomorrow.toISOString()
      });

      const refundsResult = await financeService.getRefunds(currentOrg.id, {
        date_from: today.toISOString(),
        date_to: tomorrow.toISOString()
      });

      if (ordersResult.success && paymentsResult.success && refundsResult.success) {
        const todayOrders = ordersResult.data.length;
        const successfulPayments = paymentsResult.data.filter(p => p.status === 'captured').length;
        const failedPayments = paymentsResult.data.filter(p => p.status === 'failed').length;
        const totalPayments = successfulPayments + failedPayments;
        const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
        const refundsToday = refundsResult.data.reduce((sum, r) => sum + r.amount_cents, 0);

        setStats({
          todayOrders,
          successRate,
          failedPayments,
          refundsToday
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const formatCHF = (amountCents: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amountCents / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Refunded</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'card':
        return <Badge variant="secondary">Card</Badge>;
      case 'twint':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700">TWINT</Badge>;
      case 'bank_transfer':
        return <Badge variant="secondary">Bank Transfer</Badge>;
      case 'cash':
        return <Badge variant="secondary">Cash</Badge>;
      default:
        return <Badge variant="secondary">{method}</Badge>;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleRefund = async () => {
    if (!selectedOrder || !currentOrg?.id || !refundAmount || !refundReason) return;

    try {
      const refundAmountCents = Math.round(parseFloat(refundAmount) * 100);
      
      const result = await financeService.processRefund({
        tenant_id: currentOrg.id,
        order_id: selectedOrder.id,
        amount_cents: refundAmountCents,
        reason: refundReason,
        reason_code: refundReason,
        notes: `Refund processed via admin dashboard`
      });

      if (result.success) {
        setShowRefundDialog(false);
        setRefundAmount('');
        setRefundReason('');
        await loadOrders(); // Reload orders to show updated status
      } else {
        console.error('Refund failed:', result.error);
        // Could show a toast notification here
      }
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  };

  const handleGenerateInvoice = async (orderId: string) => {
    if (!currentOrg?.id) return;

    try {
      const result = await financeService.generateInvoice(currentOrg.id, orderId);
      
      if (result.success) {
        console.log('Invoice generated:', result.data);
        // Could show a success notification or open invoice preview
      } else {
        console.error('Invoice generation failed:', result.error);
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  };

  const handleViewOrderDetails = async (order: any) => {
    // Fetch complete order details including payments and refunds
    try {
      const result = await financeService.getOrder(currentOrg!.id, order.id);
      if (result.success) {
        setSelectedOrder(result.data);
      } else {
        setSelectedOrder(order);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setSelectedOrder(order);
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
            <h1>Orders & Payments</h1>
            <p className="text-muted-foreground">
              Manage orders, process payments and handle refunds
            </p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Manual Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              Orders placed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Success</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Payment success rate today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedPayments}</div>
            <p className="text-xs text-muted-foreground">
              Failed payments today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunds Today</CardTitle>
            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCHF(stats.refundsToday)}</div>
            <p className="text-xs text-muted-foreground">
              Refunds processed today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            Search, filter and manage all customer orders and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search orders, customers, or emails..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Orders Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-40 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-8 bg-muted rounded animate-pulse" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm || statusFilter !== 'all' ? 'No orders found matching your criteria' : 'No orders yet'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    // Get payment details for this order - handle nested payments from API
                    const orderPayments = order.payments || payments.filter(p => p.order_id === order.id);
                    const mainPayment = orderPayments.find(p => p.status === 'captured') || orderPayments[0];
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.order_number}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customer_name || 'Unknown Customer'}</div>
                            <div className="text-sm text-muted-foreground">{order.customer_email || ''}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{formatCHF(order.total_cents)}</div>
                            <div className="text-xs text-muted-foreground">
                              VAT: {formatCHF(order.tax_total_cents || 0)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {order.channel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('de-CH')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewOrderDetails(order)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleGenerateInvoice(order.id)}>
                                <Receipt className="h-4 w-4 mr-2" />
                                Generate Invoice
                              </DropdownMenuItem>
                              {order.status === 'completed' && (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowRefundDialog(true);
                                  }}
                                >
                                  <RefreshCcw className="h-4 w-4 mr-2" />
                                  Process Refund
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder && !showRefundDialog} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              Complete order information and payment details
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <Tabs defaultValue="order" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="order">Order Info</TabsTrigger>
                <TabsTrigger value="payment">Payment Details</TabsTrigger>
                <TabsTrigger value="audit">Audit Trail</TabsTrigger>
              </TabsList>
              
              <TabsContent value="order" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Customer</Label>
                    <p className="text-sm font-medium">{selectedOrder.customer_name || 'Unknown Customer'}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.customer_email || ''}</p>
                  </div>
                  <div>
                    <Label>Order Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <Label>Total Amount</Label>
                    <p className="text-sm font-medium">{formatCHF(selectedOrder.total_cents)}</p>
                  </div>
                  <div>
                    <Label>VAT Amount</Label>
                    <p className="text-sm font-medium">{formatCHF(selectedOrder.tax_total_cents || 0)}</p>
                  </div>
                </div>
                
                <div>
                  <Label>Order Items</Label>
                  <div className="mt-2 border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(selectedOrder.order_items || []).map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.name}</div>
                                {item.description && (
                                  <div className="text-sm text-muted-foreground">{item.description}</div>
                                )}
                                {item.sku && (
                                  <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCHF(item.unit_price_cents)}</TableCell>
                            <TableCell className="text-right">{formatCHF(item.total_price_cents)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="payment" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Order Created</Label>
                    <p className="text-sm font-medium">{new Date(selectedOrder.created_at).toLocaleString('de-CH')}</p>
                  </div>
                  <div>
                    <Label>Order Number</Label>
                    <p className="text-sm font-medium font-mono">{selectedOrder.order_number}</p>
                  </div>
                  <div>
                    <Label>Channel</Label>
                    <Badge variant="secondary" className="capitalize">
                      {selectedOrder.channel}
                    </Badge>
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <p className="text-sm font-medium">{selectedOrder.currency}</p>
                  </div>
                </div>
                
                {/* Payment Information */}
                {(selectedOrder.payments && selectedOrder.payments.length > 0) && (
                  <div className="space-y-4">
                    <Label>Payment Details</Label>
                    {selectedOrder.payments.map((payment: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {getPaymentMethodBadge(payment.method)}
                            <Badge variant={payment.status === 'captured' ? 'default' : 'secondary'}>
                              {payment.status}
                            </Badge>
                          </div>
                          <div className="text-sm font-medium">{formatCHF(payment.amount_cents)}</div>
                        </div>
                        {payment.provider && (
                          <p className="text-sm text-muted-foreground">Provider: {payment.provider}</p>
                        )}
                        {payment.captured_at && (
                          <p className="text-sm text-muted-foreground">
                            Captured: {new Date(payment.captured_at).toLocaleString('de-CH')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Refund Information */}
                {(selectedOrder.refunds && selectedOrder.refunds.length > 0) && (
                  <div className="space-y-4">
                    <Label>Refund Information</Label>
                    {selectedOrder.refunds.map((refund: any, index: number) => (
                      <div key={index} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-orange-800">Refund #{refund.refund_number}</h4>
                          <div className="font-medium text-orange-800">{formatCHF(refund.amount_cents)}</div>
                        </div>
                        <p className="text-sm text-orange-700">Reason: {refund.reason}</p>
                        {refund.processed_at && (
                          <p className="text-xs text-orange-600">
                            Processed: {new Date(refund.processed_at).toLocaleString('de-CH')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="audit" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Order Created</p>
                      <p className="text-xs text-muted-foreground">{new Date(selectedOrder.created_at).toLocaleString('de-CH')}</p>
                    </div>
                  </div>
                  
                  {/* Payment Events */}
                  {(selectedOrder.payments || []).map((payment: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Payment {payment.status === 'captured' ? 'Captured' : payment.status}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.method} - {formatCHF(payment.amount_cents)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.captured_at ? new Date(payment.captured_at).toLocaleString('de-CH') : new Date(payment.created_at).toLocaleString('de-CH')}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Refund Events */}
                  {(selectedOrder.refunds || []).map((refund: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="h-2 w-2 rounded-full bg-orange-500 mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Refund Processed</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCHF(refund.amount_cents)} - {refund.reason}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {refund.processed_at ? new Date(refund.processed_at).toLocaleString('de-CH') : new Date(refund.created_at).toLocaleString('de-CH')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Issue a refund for order {selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="refund-amount">Refund Amount</Label>
              <Input
                id="refund-amount"
                type="number"
                placeholder="0.00"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={selectedOrder?.total_cents ? selectedOrder.total_cents / 100 : 0}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum refundable: {selectedOrder?.total_cents ? formatCHF(selectedOrder.total_cents) : 'CHF 0.00'}
              </p>
            </div>
            
            <div>
              <Label htmlFor="refund-reason">Refund Reason</Label>
              <Select value={refundReason} onValueChange={setRefundReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select refund reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_cancel">Customer Cancellation</SelectItem>
                  <SelectItem value="studio_cancel">Studio Cancellation</SelectItem>
                  <SelectItem value="no_show_fee">No Show Fee Adjustment</SelectItem>
                  <SelectItem value="goodwill">Goodwill Gesture</SelectItem>
                  <SelectItem value="duplicate_charge">Duplicate Charge</SelectItem>
                  <SelectItem value="technical_error">Technical Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRefund} disabled={!refundAmount || !refundReason}>
                Process Refund
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}