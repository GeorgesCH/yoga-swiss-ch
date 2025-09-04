import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  ShoppingCart, 
  CreditCard, 
  Package, 
  Calculator, 
  Receipt, 
  Printer, 
  Users, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: 'retail' | 'gift_card' | 'membership' | 'workshop';
  price: number;
  stock?: number;
  isActive: boolean;
  taxRate: number;
}

interface CashDrawer {
  id: string;
  location: string;
  currentBalance: number;
  openedBy: string;
  openedAt: string;
  lastTransaction: string;
  status: 'open' | 'closed';
}

export function POSSettings() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Yoga Mat Premium',
      category: 'retail',
      price: 89.00,
      stock: 12,
      isActive: true,
      taxRate: 8.1
    },
    {
      id: '2',
      name: 'Gift Card CHF 100',
      category: 'gift_card',
      price: 100.00,
      isActive: true,
      taxRate: 0
    },
    {
      id: '3',
      name: 'Monthly Unlimited',
      category: 'membership',
      price: 149.00,
      isActive: true,
      taxRate: 8.1
    },
    {
      id: '4',
      name: 'Meditation Workshop',
      category: 'workshop',
      price: 65.00,
      stock: 20,
      isActive: true,
      taxRate: 8.1
    }
  ]);

  const [cashDrawers, setCashDrawers] = useState<CashDrawer[]>([
    {
      id: '1',
      location: 'Hauptstandort Zürich',
      currentBalance: 247.50,
      openedBy: 'Sarah M.',
      openedAt: '2024-01-15 08:00',
      lastTransaction: '2024-01-15 14:30',
      status: 'open'
    },
    {
      id: '2',
      location: 'Studio Seefeld',
      currentBalance: 0.00,
      openedBy: '-',
      openedAt: '-',
      lastTransaction: '2024-01-14 18:45',
      status: 'closed'
    }
  ]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'retail': return Package;
      case 'gift_card': return CreditCard;
      case 'membership': return Users;
      case 'workshop': return TrendingUp;
      default: return ShoppingCart;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'retail':
        return <Badge className="bg-blue-100 text-blue-800">Retail</Badge>;
      case 'gift_card':
        return <Badge className="bg-green-100 text-green-800">Gift Card</Badge>;
      case 'membership':
        return <Badge className="bg-purple-100 text-purple-800">Membership</Badge>;
      case 'workshop':
        return <Badge className="bg-orange-100 text-orange-800">Workshop</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Point of Sale & Retail</h2>
          <p className="text-muted-foreground">
            Manage retail products, cash drawers, and POS settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Receipt className="h-4 w-4 mr-2" />
            Open Cash Drawer
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="cash-drawer">Cash Drawers</TabsTrigger>
          <TabsTrigger value="receipts">Receipts & Printing</TabsTrigger>
          <TabsTrigger value="settings">POS Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>Manage retail products, memberships, and gift cards</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Tax Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const Icon = getCategoryIcon(product.category);
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryBadge(product.category)}</TableCell>
                        <TableCell>CHF {product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          {product.stock !== undefined ? (
                            <span className={product.stock < 5 ? 'text-red-600' : ''}>
                              {product.stock} units
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Digital</span>
                          )}
                        </TableCell>
                        <TableCell>{product.taxRate}%</TableCell>
                        <TableCell>
                          {product.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  {products.filter(p => p.isActive).length} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.stock && p.stock < 5).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Require restocking
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  CHF {(products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all products
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(products.map(p => p.category)).size}
                </div>
                <p className="text-xs text-muted-foreground">
                  Product categories
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cash-drawer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Drawer Management</CardTitle>
              <CardDescription>Monitor and manage cash drawers across locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cashDrawers.map((drawer) => (
                  <div key={drawer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        drawer.status === 'open' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Calculator className={`h-5 w-5 ${
                          drawer.status === 'open' ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{drawer.location}</p>
                        <p className="text-sm text-muted-foreground">
                          {drawer.status === 'open' 
                            ? `Opened by ${drawer.openedBy} at ${drawer.openedAt}`
                            : 'Drawer closed'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">CHF {drawer.currentBalance.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Current balance</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {drawer.status === 'open' ? (
                          <Badge className="bg-green-100 text-green-800">Open</Badge>
                        ) : (
                          <Badge variant="outline">Closed</Badge>
                        )}
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Cash Drawer Operations</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="bg-white">
                    Count Cash
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white">
                    Add Cash
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white">
                    Remove Cash
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white">
                    Close Drawer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cash Management Rules</CardTitle>
              <CardDescription>Configure cash handling and security policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="opening-balance">Opening Balance</Label>
                  <Input id="opening-balance" defaultValue="100.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-balance">Maximum Balance</Label>
                  <Input id="max-balance" defaultValue="500.00" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Manager for Large Transactions</Label>
                    <p className="text-sm text-muted-foreground">Manager approval for transactions over CHF 200</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-close at End of Day</Label>
                    <p className="text-sm text-muted-foreground">Automatically close cash drawers at closing time</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Track Cash Discrepancies</Label>
                    <p className="text-sm text-muted-foreground">Log and alert on cash count differences</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Settings</CardTitle>
              <CardDescription>Configure receipt printing and email settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-print Receipts</Label>
                    <p className="text-sm text-muted-foreground">Automatically print receipts for all transactions</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Receipts</Label>
                    <p className="text-sm text-muted-foreground">Send digital receipts to customer email</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include QR Code</Label>
                    <p className="text-sm text-muted-foreground">Add QR code for digital receipt verification</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Receipt Content</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="receipt-header">Header Text</Label>
                    <Input id="receipt-header" defaultValue="Yoga Zen Zürich" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receipt-footer">Footer Text</Label>
                    <Input id="receipt-footer" defaultValue="Thank you for your visit!" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="return-policy">Return Policy Text</Label>
                  <Input 
                    id="return-policy" 
                    defaultValue="Returns accepted within 30 days with receipt"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Printer Configuration</CardTitle>
              <CardDescription>Setup and manage receipt printers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { name: 'Front Desk Printer', location: 'Hauptstandort', status: 'connected', model: 'Epson TM-T88VI' },
                  { name: 'Studio 2 Printer', location: 'Seefeld', status: 'offline', model: 'Star TSP143III' }
                ].map((printer) => (
                  <div key={printer.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Printer className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{printer.name}</p>
                        <p className="text-sm text-muted-foreground">{printer.model} - {printer.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {printer.status === 'connected' ? (
                        <Badge className="bg-green-100 text-green-800">Connected</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Offline</Badge>
                      )}
                      <Button variant="outline" size="sm">Test Print</Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Printer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>POS General Settings</CardTitle>
              <CardDescription>Configure point of sale system preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Quick Sale Mode</Label>
                    <p className="text-sm text-muted-foreground">Fast checkout for common items</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Customer for All Sales</Label>
                    <p className="text-sm text-muted-foreground">Always associate sales with a customer account</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Discounts & Coupons</Label>
                    <p className="text-sm text-muted-foreground">Allow staff to apply discounts and promotional codes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-tax">Default Tax Rate</Label>
                  <Select defaultValue="8.1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8.1">8.1% (Standard VAT)</SelectItem>
                      <SelectItem value="2.6">2.6% (Reduced VAT)</SelectItem>
                      <SelectItem value="0">0% (Exempt)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="round-totals">Round Transaction Totals</Label>
                  <Select defaultValue="0.05">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.01">To nearest 0.01 CHF</SelectItem>
                      <SelectItem value="0.05">To nearest 0.05 CHF</SelectItem>
                      <SelectItem value="none">No rounding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Configure stock tracking and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Track Inventory</Label>
                  <p className="text-sm text-muted-foreground">Automatically deduct stock on sales</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">Notify when products are running low</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
                  <Input id="low-stock-threshold" type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorder-quantity">Default Reorder Quantity</Label>
                  <Input id="reorder-quantity" type="number" defaultValue="20" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reporting & Analytics</CardTitle>
              <CardDescription>Configure sales reporting preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Daily Sales Summary</Label>
                  <p className="text-sm text-muted-foreground">Email daily sales report to managers</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Track Employee Performance</Label>
                  <p className="text-sm text-muted-foreground">Record sales by staff member</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-recipients">Report Recipients</Label>
                <Input 
                  id="report-recipients" 
                  placeholder="manager@yogazen.ch, owner@yogazen.ch"
                  defaultValue="sarah@yogazen.ch, marco@yogazen.ch"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}