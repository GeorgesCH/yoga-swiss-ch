import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Download, 
  FileText, 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Receipt,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  Smartphone,
  Wallet
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';

interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: 'completed' | 'processing' | 'refunded' | 'cancelled';
  total: number;
  tax: number;
  subtotal: number;
  currency: string;
  paymentMethod: 'card' | 'twint' | 'wallet' | 'credits';
  paymentDetails: {
    last4?: string;
    brand?: string;
    phone?: string;
  };
  items: OrderItem[];
  billingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  refunds?: {
    id: string;
    amount: number;
    date: Date;
    reason: string;
    status: 'pending' | 'completed';
  }[];
  invoiceUrl?: string;
  receiptUrl?: string;
}

interface OrderItem {
  id: string;
  type: 'class' | 'package' | 'product' | 'membership';
  name: string;
  description?: string;
  price: number;
  quantity: number;
  instructor?: string;
  studio?: string;
  date?: Date;
  time?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
}

export function OrderHistoryManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Mock order data - in real app, this would be fetched from API
  const orders: Order[] = [
    {
      id: 'order-1',
      orderNumber: 'YS-2024-001234',
      date: new Date(2024, 11, 10),
      status: 'completed',
      total: 156.50,
      tax: 11.30,
      subtotal: 145.20,
      currency: 'CHF',
      paymentMethod: 'card',
      paymentDetails: {
        last4: '4242',
        brand: 'Visa'
      },
      items: [
        {
          id: 'item-1',
          type: 'class',
          name: 'Vinyasa Flow',
          description: 'Dynamic flow class with Sarah Miller',
          price: 32.00,
          quantity: 1,
          instructor: 'Sarah Miller',
          studio: 'Flow Studio Zürich',
          date: new Date(2024, 11, 12),
          time: '18:30',
          status: 'completed'
        },
        {
          id: 'item-2',
          type: 'package',
          name: '5-Class Package',
          description: 'Flexible class package valid for 3 months',
          price: 140.00,
          quantity: 1,
          status: 'scheduled'
        }
      ],
      billingAddress: {
        name: 'Anna Müller',
        address: 'Bahnhofstrasse 123',
        city: 'Zürich',
        postalCode: '8001',
        country: 'Switzerland'
      },
      invoiceUrl: '/invoices/YS-2024-001234.pdf',
      receiptUrl: '/receipts/YS-2024-001234.pdf'
    },
    {
      id: 'order-2',
      orderNumber: 'YS-2024-001235',
      date: new Date(2024, 11, 8),
      status: 'refunded',
      total: 64.00,
      tax: 4.64,
      subtotal: 59.36,
      currency: 'CHF',
      paymentMethod: 'twint',
      paymentDetails: {
        phone: '+41 79 123 45 67'
      },
      items: [
        {
          id: 'item-3',
          type: 'class',
          name: 'Hot Yoga Power',
          description: 'Intense heated yoga session',
          price: 35.00,
          quantity: 1,
          instructor: 'Lisa Chen',
          studio: 'Heat Studio Basel',
          date: new Date(2024, 11, 9),
          time: '19:00',
          status: 'cancelled'
        },
        {
          id: 'item-4',
          type: 'class',
          name: 'Yin & Meditation',
          description: 'Restorative practice with meditation',
          price: 28.00,
          quantity: 1,
          instructor: 'Peter Schmidt',
          studio: 'Zen Space',
          date: new Date(2024, 11, 10),
          time: '20:00',
          status: 'cancelled'
        }
      ],
      billingAddress: {
        name: 'Anna Müller',
        address: 'Bahnhofstrasse 123',
        city: 'Zürich',
        postalCode: '8001',
        country: 'Switzerland'
      },
      refunds: [
        {
          id: 'refund-1',
          amount: 64.00,
          date: new Date(2024, 11, 8),
          reason: 'Customer cancellation within policy',
          status: 'completed'
        }
      ],
      invoiceUrl: '/invoices/YS-2024-001235.pdf',
      receiptUrl: '/receipts/YS-2024-001235.pdf'
    },
    {
      id: 'order-3',
      orderNumber: 'YS-2024-001236',
      date: new Date(2024, 11, 5),
      status: 'completed',
      total: 89.00,
      tax: 6.45,
      subtotal: 82.55,
      currency: 'CHF',
      paymentMethod: 'wallet',
      paymentDetails: {},
      items: [
        {
          id: 'item-5',
          type: 'membership',
          name: 'Monthly Unlimited Pass',
          description: 'Unlimited classes for 30 days',
          price: 89.00,
          quantity: 1,
          status: 'scheduled'
        }
      ],
      billingAddress: {
        name: 'Anna Müller',
        address: 'Bahnhofstrasse 123',
        city: 'Zürich',
        postalCode: '8001',
        country: 'Switzerland'
      },
      invoiceUrl: '/invoices/YS-2024-001236.pdf',
      receiptUrl: '/receipts/YS-2024-001236.pdf'
    }
  ];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700"><RefreshCw className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'refunded':
        return <Badge className="bg-purple-100 text-purple-700"><RefreshCw className="h-3 w-3 mr-1" />Refunded</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'twint':
        return <Smartphone className="h-4 w-4" />;
      case 'wallet':
        return <Wallet className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodText = (order: Order) => {
    switch (order.paymentMethod) {
      case 'card':
        return `${order.paymentDetails.brand} ••••${order.paymentDetails.last4}`;
      case 'twint':
        return `TWINT (${order.paymentDetails.phone})`;
      case 'wallet':
        return 'Wallet Credits';
      default:
        return order.paymentMethod;
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    setIsDownloading(orderId);
    try {
      // Mock download - in real app, would fetch from API
      setTimeout(() => {
        toast.success('Invoice downloaded successfully');
        setIsDownloading(null);
      }, 1500);
    } catch (error) {
      toast.error('Failed to download invoice');
      setIsDownloading(null);
    }
  };

  const handleEmailInvoice = async (orderId: string) => {
    try {
      toast.success('Invoice sent to your email address');
    } catch (error) {
      toast.error('Failed to send invoice');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter === 'last30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      matchesDate = order.date >= thirtyDaysAgo;
    } else if (dateFilter === 'last90') {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      matchesDate = order.date >= ninetyDaysAgo;
    } else if (dateFilter === 'thisYear') {
      matchesDate = order.date.getFullYear() === new Date().getFullYear();
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Order History</h2>
          <p className="text-muted-foreground">
            View and download your purchase history, invoices, and receipts
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Order number or item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last90">Last 90 Days</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter('all');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                  ? 'Try adjusting your filters to find what you\'re looking for.'
                  : 'You haven\'t made any purchases yet.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatDate(order.date)}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        {getPaymentMethodIcon(order.paymentMethod)}
                        <span>{getPaymentMethodText(order)}</span>
                      </div>
                      <span>•</span>
                      <span className="font-medium text-foreground">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(order.id)}
                      disabled={isDownloading === order.id}
                    >
                      {isDownloading === order.id ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Invoice
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        {item.description && (
                          <span className="text-muted-foreground ml-2">• {item.description}</span>
                        )}
                        {item.date && item.time && (
                          <div className="text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {formatDate(item.date)} at {item.time}
                          </div>
                        )}
                      </div>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="text-sm text-muted-foreground">
                      +{order.items.length - 2} more items
                    </div>
                  )}
                </div>

                {order.refunds && order.refunds.length > 0 && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-800">
                      <RefreshCw className="h-4 w-4" />
                      <span className="font-medium">Refund Information</span>
                    </div>
                    {order.refunds.map((refund) => (
                      <div key={refund.id} className="text-sm text-purple-700 mt-1">
                        {formatPrice(refund.amount)} refunded on {formatDate(refund.date)}
                        <br />
                        <span className="text-purple-600">Reason: {refund.reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Order #{selectedOrder.orderNumber}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Order Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Order Date:</span>
                      <span>{formatDateTime(selectedOrder.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <div>{getStatusBadge(selectedOrder.status)}</div>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <div className="flex items-center gap-1">
                        {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                        <span>{getPaymentMethodText(selectedOrder)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Billing Address</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>{selectedOrder.billingAddress.name}</p>
                    <p>{selectedOrder.billingAddress.address}</p>
                    <p>{selectedOrder.billingAddress.postalCode} {selectedOrder.billingAddress.city}</p>
                    <p>{selectedOrder.billingAddress.country}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Items */}
              <div>
                <h4 className="font-semibold mb-4">Order Items</h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{item.name}</h5>
                          <Badge variant="outline">{item.type}</Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        )}
                        {item.instructor && (
                          <p className="text-sm text-muted-foreground">Instructor: {item.instructor}</p>
                        )}
                        {item.studio && (
                          <p className="text-sm text-muted-foreground">Studio: {item.studio}</p>
                        )}
                        {item.date && item.time && (
                          <p className="text-sm text-muted-foreground">
                            {formatDate(item.date)} at {item.time}
                          </p>
                        )}
                        <div className="text-sm text-muted-foreground mt-1">
                          Quantity: {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (7.7%):</span>
                  <span>{formatPrice(selectedOrder.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleDownloadInvoice(selectedOrder.id)}
                  disabled={isDownloading === selectedOrder.id}
                >
                  {isDownloading === selectedOrder.id ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download Invoice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleEmailInvoice(selectedOrder.id)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Invoice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}