import React, { useState, useEffect } from 'react';
import { Package, Receipt, ShoppingCart, TrendingUp, Plus, Search, Filter, Download, Wallet, CreditCard, Users, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ProductManagement } from './ProductManagement';
import { InventoryManagement } from './InventoryManagement';
import { PricingManagement } from './PricingManagement';
import { OrderManagement } from './OrderManagement';
import { WalletManager } from './WalletManager';
import { shopService, ShopStats } from '../../utils/supabase/shop-service';

interface ShopOverviewProps {
  onPageChange?: (page: string) => void;
  orgId: string;
}

export function ShopOverview({ onPageChange, orgId }: ShopOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [shopStats, setShopStats] = useState<ShopStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShopStats();
  }, [orgId]);

  const loadShopStats = async () => {
    try {
      setLoading(true);
      const stats = await shopService.getShopStats(orgId);
      setShopStats(stats);
    } catch (error) {
      console.error('Error loading shop stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // If a specific section is active, render that component
  if (activeSection) {
    switch (activeSection) {
      case 'products':
        return (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveSection(null)}
              className="mb-4"
            >
              ← Back to Shop Overview
            </Button>
            <ProductManagement orgId={orgId} />
          </div>
        );
      case 'inventory':
        return (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveSection(null)}
              className="mb-4"
            >
              ← Back to Shop Overview
            </Button>
            <InventoryManagement />
          </div>
        );
      case 'pricing':
        return (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveSection(null)}
              className="mb-4"
            >
              ← Back to Shop Overview
            </Button>
            <PricingManagement orgId={orgId} />
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveSection(null)}
              className="mb-4"
            >
              ← Back to Shop Overview
            </Button>
            <OrderManagement orgId={orgId} />
          </div>
        );
      case 'wallets':
        return (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveSection(null)}
              className="mb-4"
            >
              ← Back to Shop Overview
            </Button>
            <WalletManager orgId={orgId} />
          </div>
        );
      default:
        setActiveSection(null);
        break;
    }
  }

  const PricingComponent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Class Packages</CardTitle>
            <CardDescription>Single classes and multi-class packages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Single Class</p>
                  <p className="text-sm text-muted-foreground">Drop-in rate</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">CHF 35</p>
                  <Badge variant="secondary" className="text-xs">Popular</Badge>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">5-Class Package</p>
                  <p className="text-sm text-muted-foreground">Valid for 3 months</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">CHF 150</p>
                  <p className="text-xs text-green-600">CHF 30 per class</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">10-Class Package</p>
                  <p className="text-sm text-muted-foreground">Valid for 6 months</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">CHF 280</p>
                  <p className="text-xs text-green-600">CHF 28 per class</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">Unlimited Monthly</p>
                  <p className="text-sm text-muted-foreground">All classes included</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">CHF 180</p>
                  <Badge variant="default" className="text-xs">Best Value</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memberships</CardTitle>
            <CardDescription>Monthly and yearly membership plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Basic Membership</p>
                  <p className="text-sm text-muted-foreground">4 classes per month</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">CHF 120/mo</p>
                  <p className="text-xs text-muted-foreground">CHF 30 per class</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Premium Membership</p>
                  <p className="text-sm text-muted-foreground">8 classes per month</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">CHF 200/mo</p>
                  <p className="text-xs text-green-600">CHF 25 per class</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg bg-primary/5">
                <div>
                  <p className="font-medium">Elite Membership</p>
                  <p className="text-sm text-muted-foreground">Unlimited classes</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">CHF 299/mo</p>
                  <Badge variant="default" className="text-xs">Most Popular</Badge>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg border-green-200 bg-green-50">
                <div>
                  <p className="font-medium">Annual Elite</p>
                  <p className="text-sm text-muted-foreground">Unlimited + perks</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">CHF 2,990/yr</p>
                  <p className="text-xs text-green-600">Save CHF 598</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Special Offers</CardTitle>
            <CardDescription>Limited time promotions and deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg border-orange-200 bg-orange-50">
                <div>
                  <p className="font-medium">New Student Special</p>
                  <p className="text-sm text-muted-foreground">First month unlimited</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold line-through text-muted-foreground">CHF 299</p>
                  <p className="font-semibold text-orange-600">CHF 99</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg border-blue-200 bg-blue-50">
                <div>
                  <p className="font-medium">Student Discount</p>
                  <p className="text-sm text-muted-foreground">20% off all packages</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">-20%</p>
                  <Badge variant="outline" className="text-xs border-blue-300">ID Required</Badge>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg border-purple-200 bg-purple-50">
                <div>
                  <p className="font-medium">Corporate Wellness</p>
                  <p className="text-sm text-muted-foreground">Group rates for companies</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-600">Custom</p>
                  <p className="text-xs text-muted-foreground">Contact us</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const InventoryComponent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Yoga Equipment</CardTitle>
            <CardDescription>Mats, blocks, and accessories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Yoga Mats (Premium)</span>
                <div className="text-right">
                  <p className="font-medium">CHF 85</p>
                  <p className="text-xs text-muted-foreground">12 in stock</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Yoga Blocks (Set of 2)</span>
                <div className="text-right">
                  <p className="font-medium">CHF 25</p>
                  <p className="text-xs text-muted-foreground">8 in stock</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Yoga Straps</span>
                <div className="text-right">
                  <p className="font-medium">CHF 18</p>
                  <p className="text-xs text-red-600">2 in stock</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apparel</CardTitle>
            <CardDescription>Yoga clothing and accessories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Yoga T-Shirts</span>
                <div className="text-right">
                  <p className="font-medium">CHF 45</p>
                  <p className="text-xs text-muted-foreground">Various sizes</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Leggings</span>
                <div className="text-right">
                  <p className="font-medium">CHF 75</p>
                  <p className="text-xs text-muted-foreground">S-XL available</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Water Bottles</span>
                <div className="text-right">
                  <p className="font-medium">CHF 28</p>
                  <p className="text-xs text-muted-foreground">15 in stock</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplements</CardTitle>
            <CardDescription>Health and wellness products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Protein Powder</span>
                <div className="text-right">
                  <p className="font-medium">CHF 65</p>
                  <p className="text-xs text-muted-foreground">6 units</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Energy Bars</span>
                <div className="text-right">
                  <p className="font-medium">CHF 4</p>
                  <p className="text-xs text-muted-foreground">24 bars</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Herbal Tea Blend</span>
                <div className="text-right">
                  <p className="font-medium">CHF 18</p>
                  <p className="text-xs text-muted-foreground">10 packages</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Shop Management</h1>
          <p className="text-muted-foreground">
            Manage products, pricing, packages, and inventory
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : shopStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shopStats.total_products}</div>
              <p className="text-xs text-muted-foreground">Active catalog items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shopStats.total_orders}</div>
              <p className="text-xs text-muted-foreground">All-time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">CHF {shopStats.revenue_today.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Today's sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <Receipt className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">CHF {shopStats.revenue_month.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <Package className="h-4 w-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">CHF {shopStats.inventory_value.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Stock valuation</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Shop Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('products')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Products & Services
            </CardTitle>
            <CardDescription>
              Manage classes, workshops, and merchandise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Products</span>
                <span className="font-semibold">{shopStats?.total_products || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Products</span>
                <span className="font-semibold text-green-600">{Math.floor((shopStats?.total_products || 0) * 0.9)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Revenue (Month)</span>
                <span className="font-semibold">CHF {shopStats?.revenue_month.toFixed(0) || '0'}</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Manage Products
            </Button>
          </CardContent>
        </Card>

        {/* Orders Section */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('orders')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Orders & Fulfillment
            </CardTitle>
            <CardDescription>
              Process orders and manage fulfillment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Orders</span>
                <span className="font-semibold">{shopStats?.total_orders || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending Orders</span>
                <span className="font-semibold text-orange-600">{shopStats?.pending_orders || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Today's Revenue</span>
                <span className="font-semibold">CHF {shopStats?.revenue_today.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Manage Orders
            </Button>
          </CardContent>
        </Card>

        {/* Inventory Section */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('inventory')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              Inventory Management
            </CardTitle>
            <CardDescription>
              Track stock levels and supplies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="font-semibold">CHF {shopStats?.inventory_value.toFixed(0) || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Low Stock Items</span>
                <span className="font-semibold text-orange-600">{shopStats?.low_stock_items || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Out of Stock</span>
                <span className="font-semibold text-red-600">{shopStats?.out_of_stock_items || '0'}</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Manage Inventory
            </Button>
          </CardContent>
        </Card>

        {/* Pricing Section */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('pricing')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-purple-600" />
              Pricing & Packages
            </CardTitle>
            <CardDescription>
              Membership plans and class packages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Packages</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Memberships</span>
                <span className="font-semibold text-blue-600">4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Gift Cards</span>
                <span className="font-semibold">12</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Manage Pricing
            </Button>
          </CardContent>
        </Card>

        {/* Wallets Section */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('wallets')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-cyan-600" />
              Customer Wallets
            </CardTitle>
            <CardDescription>
              Manage customer credits and balances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Wallets</span>
                <span className="font-semibold">156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Credits</span>
                <span className="font-semibold text-green-600">2,847</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Balance</span>
                <span className="font-semibold">CHF 18,450</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Manage Wallets
            </Button>
          </CardContent>
        </Card>

        {/* Analytics Section */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Shop Analytics
            </CardTitle>
            <CardDescription>
              Sales reports and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Conversion Rate</span>
                <span className="font-semibold">3.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg. Order Value</span>
                <span className="font-semibold text-blue-600">CHF 87</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Top Channel</span>
                <span className="font-semibold">Website</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      {shopStats && (shopStats.low_stock_items > 0 || shopStats.out_of_stock_items > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {shopStats.low_stock_items > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Low stock items require attention</span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    {shopStats.low_stock_items} items
                  </Badge>
                </div>
              )}
              {shopStats.out_of_stock_items > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Items are completely out of stock</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    {shopStats.out_of_stock_items} items
                  </Badge>
                </div>
              )}
            </div>
            <Button 
              size="sm" 
              className="mt-3"
              onClick={() => setActiveSection('inventory')}
            >
              Manage Inventory
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common shop management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveSection('products')}>
              <Plus className="h-6 w-6 mb-2" />
              Add Product
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveSection('orders')}>
              <ShoppingCart className="h-6 w-6 mb-2" />
              Process Orders
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveSection('inventory')}>
              <Package className="h-6 w-6 mb-2" />
              Update Stock
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveSection('wallets')}>
              <CreditCard className="h-6 w-6 mb-2" />
              Manage Credits
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}