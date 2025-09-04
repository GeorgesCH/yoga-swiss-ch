import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Plus, 
  Package,
  Edit,
  Trash2,
  Search,
  Filter,
  BarChart3,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Boxes,
  ShoppingCart,
  Warehouse,
  FileText,
  Upload,
  Download,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: 'equipment' | 'merchandise' | 'supplies' | 'retail';
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  sellingPrice: number;
  currency: 'CHF';
  supplier: string;
  location: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
  lastRestocked: string;
  totalSold: number;
  revenue: number;
  isTrackable: boolean;
}

export function InventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Yoga Mat - Premium',
      description: 'High-quality non-slip yoga mat, 6mm thickness',
      category: 'equipment',
      sku: 'YM-PREM-001',
      currentStock: 45,
      minStock: 10,
      maxStock: 100,
      unitCost: 35,
      sellingPrice: 65,
      currency: 'CHF',
      supplier: 'SwissYoga Supplies',
      location: 'Storage Room A',
      status: 'in-stock',
      lastRestocked: '2024-12-15',
      totalSold: 234,
      revenue: 15210,
      isTrackable: true
    },
    {
      id: '2',
      name: 'Meditation Cushion',
      description: 'Organic buckwheat hull meditation cushion',
      category: 'equipment',
      sku: 'MC-ORG-002',
      currentStock: 8,
      minStock: 15,
      maxStock: 50,
      unitCost: 40,
      sellingPrice: 75,
      currency: 'CHF',
      supplier: 'Alpine Meditation Co.',
      location: 'Display Area',
      status: 'low-stock',
      lastRestocked: '2024-11-20',
      totalSold: 67,
      revenue: 5025,
      isTrackable: true
    },
    {
      id: '3',
      name: 'YogaSwiss Water Bottle',
      description: 'Eco-friendly bamboo water bottle with studio logo',
      category: 'merchandise',
      sku: 'WB-BAMB-003',
      currentStock: 0,
      minStock: 20,
      maxStock: 150,
      unitCost: 12,
      sellingPrice: 25,
      currency: 'CHF',
      supplier: 'EcoBottle Solutions',
      location: 'Reception',
      status: 'out-of-stock',
      lastRestocked: '2024-10-01',
      totalSold: 189,
      revenue: 4725,
      isTrackable: true
    },
    {
      id: '4',
      name: 'Yoga Block Set',
      description: 'Cork yoga blocks set of 2',
      category: 'equipment',
      sku: 'YB-CORK-004',
      currentStock: 32,
      minStock: 15,
      maxStock: 80,
      unitCost: 18,
      sellingPrice: 35,
      currency: 'CHF',
      supplier: 'CoreYoga Equipment',
      location: 'Storage Room A',
      status: 'in-stock',
      lastRestocked: '2025-01-05',
      totalSold: 145,
      revenue: 5075,
      isTrackable: true
    },
    {
      id: '5',
      name: 'Essential Oil - Lavender',
      description: 'Pure lavender essential oil for aromatherapy',
      category: 'supplies',
      sku: 'EO-LAV-005',
      currentStock: 24,
      minStock: 10,
      maxStock: 50,
      unitCost: 15,
      sellingPrice: 32,
      currency: 'CHF',
      supplier: 'Swiss Aromatherapy Ltd.',
      location: 'Supplies Cabinet',
      status: 'in-stock',
      lastRestocked: '2024-12-10',
      totalSold: 78,
      revenue: 2496,
      isTrackable: true
    },
    {
      id: '6',
      name: 'YogaSwiss T-Shirt',
      description: 'Organic cotton t-shirt with studio logo',
      category: 'merchandise',
      sku: 'TS-COT-006',
      currentStock: 56,
      minStock: 25,
      maxStock: 200,
      unitCost: 18,
      sellingPrice: 45,
      currency: 'CHF',
      supplier: 'OrganicWear Switzerland',
      location: 'Retail Display',
      status: 'in-stock',
      lastRestocked: '2024-11-28',
      totalSold: 123,
      revenue: 5535,
      isTrackable: true
    }
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const categories = [
    { value: 'equipment', label: 'Equipment', icon: Package },
    { value: 'merchandise', label: 'Merchandise', icon: ShoppingCart },
    { value: 'supplies', label: 'Supplies', icon: Boxes },
    { value: 'retail', label: 'Retail Items', icon: Warehouse }
  ];

  const statuses = [
    { value: 'in-stock', label: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-100' },
    { value: 'low-stock', label: 'Low Stock', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { value: 'out-of-stock', label: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-100' },
    { value: 'discontinued', label: 'Discontinued', color: 'text-gray-600', bgColor: 'bg-gray-100' }
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateItem = () => {
    setShowCreateDialog(false);
    setEditingItem(null);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setShowCreateDialog(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <CheckCircle className="h-4 w-4" />;
      case 'low-stock':
        return <AlertTriangle className="h-4 w-4" />;
      case 'out-of-stock':
        return <XCircle className="h-4 w-4" />;
      case 'discontinued':
        return <Clock className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusData = statuses.find(s => s.value === status);
    if (!statusData) return null;
    
    return (
      <Badge 
        variant="secondary" 
        className={`${statusData.bgColor} ${statusData.color} border-0`}
      >
        {getStatusIcon(status)}
        <span className="ml-1">{statusData.label}</span>
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData?.icon || Package;
  };

  const lowStockItems = items.filter(item => item.currentStock <= item.minStock);
  const outOfStockItems = items.filter(item => item.currentStock === 0);
  const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track stock levels, manage suppliers, and monitor inventory performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                </DialogTitle>
                <DialogDescription>
                  Add or update inventory items and their stock information
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="item-name">Item Name</Label>
                      <Input 
                        id="item-name" 
                        placeholder="Yoga Mat - Premium"
                        defaultValue={editingItem?.name}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="item-sku">SKU</Label>
                      <Input 
                        id="item-sku" 
                        placeholder="YM-PREM-001"
                        defaultValue={editingItem?.sku}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="item-category">Category</Label>
                      <Select defaultValue={editingItem?.category || 'equipment'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="current-stock">Current Stock</Label>
                        <Input 
                          id="current-stock" 
                          type="number" 
                          placeholder="45"
                          defaultValue={editingItem?.currentStock}
                        />
                      </div>
                      <div>
                        <Label htmlFor="min-stock">Min Stock</Label>
                        <Input 
                          id="min-stock" 
                          type="number" 
                          placeholder="10"
                          defaultValue={editingItem?.minStock}
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-stock">Max Stock</Label>
                        <Input 
                          id="max-stock" 
                          type="number" 
                          placeholder="100"
                          defaultValue={editingItem?.maxStock}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="item-description">Description</Label>
                      <Input 
                        id="item-description" 
                        placeholder="High-quality non-slip yoga mat"
                        defaultValue={editingItem?.description}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="unit-cost">Unit Cost (CHF)</Label>
                        <Input 
                          id="unit-cost" 
                          type="number" 
                          placeholder="35.00"
                          defaultValue={editingItem?.unitCost}
                        />
                      </div>
                      <div>
                        <Label htmlFor="selling-price">Selling Price (CHF)</Label>
                        <Input 
                          id="selling-price" 
                          type="number" 
                          placeholder="65.00"
                          defaultValue={editingItem?.sellingPrice}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="supplier">Supplier</Label>
                      <Input 
                        id="supplier" 
                        placeholder="SwissYoga Supplies"
                        defaultValue={editingItem?.supplier}
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        placeholder="Storage Room A"
                        defaultValue={editingItem?.location}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="trackable">Enable Stock Tracking</Label>
                      <Switch id="trackable" defaultChecked={editingItem?.isTrackable ?? true} />
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowCreateDialog(false);
                  setEditingItem(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleCreateItem}>
                  {editingItem ? 'Update Item' : 'Add Item'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Inventory Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {categories.length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Need restocking soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Items unavailable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredItems.length} items</span>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => {
          const categoryItems = items.filter(i => i.category === category.value);
          const CategoryIcon = category.icon;
          
          return (
            <Card key={category.value} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <CategoryIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <div className="font-medium">{category.label}</div>
                <div className="text-2xl font-bold mt-1">{categoryItems.length}</div>
                <div className="text-xs text-muted-foreground">
                  CHF {categoryItems.reduce((sum, i) => sum + (i.currentStock * i.unitCost), 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Inventory Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            Manage stock levels and track item performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 font-medium">Item</th>
                  <th className="text-left pb-3 font-medium">SKU</th>
                  <th className="text-center pb-3 font-medium">Stock</th>
                  <th className="text-right pb-3 font-medium">Unit Cost</th>
                  <th className="text-right pb-3 font-medium">Selling Price</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-right pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const CategoryIcon = getCategoryIcon(item.category);
                  const isLowStock = item.currentStock <= item.minStock;
                  
                  return (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {item.sku}
                        </code>
                      </td>
                      <td className="py-4 text-center">
                        <div className={`font-medium ${isLowStock ? 'text-orange-600' : ''}`}>
                          {item.currentStock}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Min: {item.minStock}
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <div className="font-medium">CHF {item.unitCost}</div>
                      </td>
                      <td className="py-4 text-right">
                        <div className="font-medium">CHF {item.sellingPrice}</div>
                        <div className="text-xs text-muted-foreground">
                          Margin: {Math.round((1 - item.unitCost / item.sellingPrice) * 100)}%
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditItem(item)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              View History
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Restock
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
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
    </div>
  );
}