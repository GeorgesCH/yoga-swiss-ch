import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Package,
  ShoppingCart,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Printer,
  Send,
  Search,
  Filter,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Download,
  RefreshCw,
  MoreHorizontal,
  ArrowRight,
  Banknote,
  Smartphone
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { shopService, Order, OrderItem } from '../../utils/supabase/shop-service';

interface OrderManagementProps {
  orgId: string;
}

export function OrderManagement({ orgId }: OrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const orderStatuses = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Edit },
    { value: 'pending_payment', label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-700', icon: CreditCard },
    { value: 'picking', label: 'Picking', color: 'bg-blue-100 text-blue-700', icon: Package },
    { value: 'packed', label: 'Packed', color: 'bg-purple-100 text-purple-700', icon: Package },
    { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
    { value: 'refunded', label: 'Refunded', color: 'bg-orange-100 text-orange-700', icon: RefreshCw }
  ];

  const channels = [
    { value: 'web', label: 'Website', icon: ShoppingCart },
    { value: 'pos', label: 'Point of Sale', icon: Smartphone },
    { value: 'mobile', label: 'Mobile App', icon: Smartphone },
    { value: 'admin', label: 'Admin', icon: User }
  ];

  const paymentMethods = [
    { value: 'twint', label: 'TWINT', icon: Smartphone },
    { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
    { value: 'apple_pay', label: 'Apple Pay', icon: Smartphone },
    { value: 'google_pay', label: 'Google Pay', icon: Smartphone },
    { value: 'qr_bill', label: 'QR-Bill', icon: Banknote },
    { value: 'cash', label: 'Cash', icon: Banknote }
  ];

  useEffect(() => {
    loadOrders();
  }, [orgId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await shopService.getOrders(orgId);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || order.channel === channelFilter;
    
    // Date filtering logic
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = orderDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesChannel && matchesDate;
  });

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await shopService.updateOrderStatus(orderId, newStatus);
      await loadOrders();
      setSelectedOrder(null);
      setShowOrderDialog(false);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusData = orderStatuses.find(s => s.value === status);
    if (!statusData) return null;
    
    const StatusIcon = statusData.icon;
    
    return (
      <Badge variant="secondary" className={`${statusData.color} border-0`}>
        <StatusIcon className="h-3 w-3 mr-1" />
        {statusData.label}
      </Badge>
    );
  };

  const getChannelIcon = (channel: string) => {
    const channelData = channels.find(c => c.value === channel);
    return channelData?.icon || ShoppingCart;
  };

  const calculateOrderStats = () => {
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    
    return {
      total: orders.length,
      today: orders.filter(o => new Date(o.created_at).toDateString() === today).length,
      pending: orders.filter(o => ['pending_payment', 'paid', 'picking'].includes(o.status)).length,
      completed: orders.filter(o => o.status === 'delivered').length,
      revenue_today: orders
        .filter(o => new Date(o.created_at).toDateString() === today && o.status === 'delivered')
        .reduce((sum, o) => sum + o.total, 0),
      revenue_month: orders
        .filter(o => new Date(o.created_at).getMonth() === thisMonth && o.status === 'delivered')
        .reduce((sum, o) => sum + o.total, 0)
    };
  };

  const orderStats = calculateOrderStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">
            Track and manage customer orders from checkout to delivery
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={loadOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{orderStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{orderStats.today}</div>
                <div className="text-sm text-muted-foreground">Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{orderStats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{orderStats.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">CHF {orderStats.revenue_today}</div>
                <div className="text-sm text-muted-foreground">Today's Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">CHF {orderStats.revenue_month}</div>
                <div className="text-sm text-muted-foreground">Monthly Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {orderStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              {channels.map((channel) => (
                <SelectItem key={channel.value} value={channel.value}>
                  {channel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {orderStatuses.slice(1, 6).map((status) => {
          const count = orders.filter(o => o.status === status.value).length;
          const StatusIcon = status.icon;
          
          return (
            <Card key={status.value} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${status.color}`}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground">{status.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Manage customer orders and fulfillment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 font-medium">Order</th>
                  <th className="text-left pb-3 font-medium">Customer</th>
                  <th className="text-center pb-3 font-medium">Channel</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-right pb-3 font-medium">Total</th>
                  <th className="text-center pb-3 font-medium">Date</th>
                  <th className="text-right pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const ChannelIcon = getChannelIcon(order.channel);
                  
                  return (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="py-4">
                        <div>
                          <div className="font-medium">#{order.id.slice(-8)}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Customer</div>
                            <div className="text-sm text-muted-foreground">
                              {order.customer_id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <ChannelIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{order.channel}</span>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-4 text-right">
                        <div className="font-medium">CHF {order.total.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.currency}
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <div className="text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDialog(true);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="h-4 w-4 mr-2" />
                              Print Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="h-4 w-4 mr-2" />
                              Send Receipt
                            </DropdownMenuItem>
                            {order.status === 'paid' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'picking')}>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Start Picking
                              </DropdownMenuItem>
                            )}
                            {order.status === 'picking' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'packed')}>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Mark Packed
                              </DropdownMenuItem>
                            )}
                            {order.status === 'packed' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'shipped')}>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Mark Shipped
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.slice(-8)} - {selectedOrder && new Date(selectedOrder.created_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <OrderDetailView
              order={selectedOrder}
              onStatusUpdate={handleStatusUpdate}
              orderStatuses={orderStatuses}
              paymentMethods={paymentMethods}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Order Detail View Component
interface OrderDetailViewProps {
  order: Order;
  onStatusUpdate: (orderId: string, status: Order['status']) => void;
  orderStatuses: any[];
  paymentMethods: any[];
}

function OrderDetailView({ order, onStatusUpdate, orderStatuses, paymentMethods }: OrderDetailViewProps) {
  const [newStatus, setNewStatus] = useState(order.status);

  const getStatusBadge = (status: string) => {
    const statusData = orderStatuses.find(s => s.value === status);
    if (!statusData) return null;
    
    const StatusIcon = statusData.icon;
    
    return (
      <Badge variant="secondary" className={`${statusData.color} border-0`}>
        <StatusIcon className="h-3 w-3 mr-1" />
        {statusData.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-medium">#{order.id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Channel:</span>
                  <span className="font-medium capitalize">{order.channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{new Date(order.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="font-medium">{new Date(order.updated_at).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer ID:</span>
                  <span className="font-medium">{order.customer_id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">customer@example.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">+41 79 123 45 67</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>CHF {order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>CHF {order.tax_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>CHF {order.shipping_total.toFixed(2)}</span>
                </div>
                {order.discount_total > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-CHF {order.discount_total.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>CHF {order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => onStatusUpdate(order.id, newStatus)}
                  disabled={newStatus === order.status}
                >
                  Update Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {item.quantity} × CHF {item.unit_price.toFixed(2)}
                      </div>
                      <div className="text-sm font-bold">
                        CHF {item.line_total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">Credit Card</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    Completed
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-medium">txn_abc123def456</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processed At:</span>
                  <span className="font-medium">{new Date(order.created_at).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fulfillment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fulfillment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Fulfillment tracking will be implemented in the next phase.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}