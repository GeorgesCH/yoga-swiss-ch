import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Plus, 
  Package, 
  Edit,
  Trash2,
  Copy,
  Eye,
  Star,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  BarChart3,
  Settings,
  Upload,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  CreditCard,
  Gift,
  Zap
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface Product {
  id: string;
  name: string;
  description: string;
  category: 'class' | 'membership' | 'workshop' | 'retreat' | 'merchandise' | 'package';
  price: number;
  currency: 'CHF';
  duration?: number; // in minutes for classes/workshops
  capacity?: number;
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  totalSold: number;
  revenue: number;
  rating?: number;
  tags: string[];
}

export function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Hatha Yoga Drop-in',
      description: 'Traditional Hatha yoga class focusing on alignment and breath',
      category: 'class',
      price: 28,
      currency: 'CHF',
      duration: 75,
      capacity: 20,
      isActive: true,
      isPublic: true,
      createdAt: '2024-12-01',
      updatedAt: '2025-01-01',
      totalSold: 234,
      revenue: 6552,
      rating: 4.8,
      tags: ['beginner-friendly', 'traditional', 'alignment']
    },
    {
      id: '2',
      name: 'Premium Monthly Membership',
      description: 'Unlimited access to all regular classes and member perks',
      category: 'membership',
      price: 150,
      currency: 'CHF',
      isActive: true,
      isPublic: true,
      createdAt: '2024-11-15',
      updatedAt: '2025-01-01',
      totalSold: 89,
      revenue: 13350,
      rating: 4.9,
      tags: ['unlimited', 'premium', 'popular']
    },
    {
      id: '3',
      name: 'Meditation Weekend Retreat',
      description: '2-day intensive meditation retreat in the Swiss Alps',
      category: 'retreat',
      price: 450,
      currency: 'CHF',
      duration: 2880, // 48 hours
      capacity: 15,
      isActive: true,
      isPublic: true,
      createdAt: '2024-10-20',
      updatedAt: '2024-12-15',
      totalSold: 12,
      revenue: 5400,
      rating: 5.0,
      tags: ['retreat', 'meditation', 'intensive', 'nature']
    },
    {
      id: '4',
      name: 'Beginner Workshop Series',
      description: '4-week introduction to yoga fundamentals',
      category: 'workshop',
      price: 120,
      currency: 'CHF',
      duration: 90,
      capacity: 12,
      isActive: true,
      isPublic: true,
      createdAt: '2024-12-10',
      updatedAt: '2025-01-01',
      totalSold: 45,
      revenue: 5400,
      rating: 4.7,
      tags: ['beginner', 'series', 'fundamentals']
    },
    {
      id: '5',
      name: 'YogaSwiss Water Bottle',
      description: 'Eco-friendly bamboo water bottle with studio logo',
      category: 'merchandise',
      price: 25,
      currency: 'CHF',
      isActive: true,
      isPublic: true,
      createdAt: '2024-11-01',
      updatedAt: '2024-11-01',
      totalSold: 67,
      revenue: 1675,
      rating: 4.3,
      tags: ['eco-friendly', 'bamboo', 'merchandise']
    }
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const categories = [
    { value: 'class', label: 'Classes', icon: Calendar },
    { value: 'membership', label: 'Memberships', icon: CreditCard },
    { value: 'workshop', label: 'Workshops', icon: Users },
    { value: 'retreat', label: 'Retreats', icon: Star },
    { value: 'package', label: 'Packages', icon: Gift },
    { value: 'merchandise', label: 'Merchandise', icon: Package }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.isActive) ||
                         (statusFilter === 'inactive' && !product.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateProduct = () => {
    // Handle product creation
    setShowCreateDialog(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowCreateDialog(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const toggleProductStatus = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const duplicateProduct = (product: Product) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      name: `${product.name} (Copy)`,
      totalSold: 0,
      revenue: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setProducts([...products, newProduct]);
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData?.icon || Package;
  };

  const renderProductForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="product-name">Product Name</Label>
            <Input 
              id="product-name" 
              placeholder="Enter product name"
              defaultValue={editingProduct?.name}
            />
          </div>
          
          <div>
            <Label htmlFor="product-category">Category</Label>
            <Select defaultValue={editingProduct?.category || 'class'}>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="product-price">Price (CHF)</Label>
              <Input 
                id="product-price" 
                type="number" 
                placeholder="0.00"
                defaultValue={editingProduct?.price}
              />
            </div>
            <div>
              <Label htmlFor="product-duration">Duration (minutes)</Label>
              <Input 
                id="product-duration" 
                type="number" 
                placeholder="60"
                defaultValue={editingProduct?.duration}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="product-capacity">Capacity</Label>
            <Input 
              id="product-capacity" 
              type="number" 
              placeholder="20"
              defaultValue={editingProduct?.capacity}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="product-description">Description</Label>
            <Textarea 
              id="product-description" 
              placeholder="Describe the product"
              defaultValue={editingProduct?.description}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="product-tags">Tags (comma separated)</Label>
            <Input 
              id="product-tags" 
              placeholder="beginner, traditional, alignment"
              defaultValue={editingProduct?.tags.join(', ')}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="product-active">Active</Label>
              <Switch id="product-active" defaultChecked={editingProduct?.isActive ?? true} />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="product-public">Public</Label>
              <Switch id="product-public" defaultChecked={editingProduct?.isPublic ?? true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products & Services</h1>
          <p className="text-muted-foreground">
            Manage your classes, memberships, workshops, and merchandise
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
                Create Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </DialogTitle>
                <DialogDescription>
                  Add a new product or service to your studio offerings
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic">
                  {renderProductForm()}
                </TabsContent>
                
                <TabsContent value="pricing">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Advanced pricing options</p>
                      <p className="text-sm">Set up flexible pricing, discounts, and payment plans</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Advanced settings</p>
                      <p className="text-sm">Configure booking rules, cancellation policies, and more</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowCreateDialog(false);
                  setEditingProduct(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProduct}>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
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
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredProducts.length} products</span>
          <span>•</span>
          <span>CHF {filteredProducts.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()} revenue</span>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => {
          const categoryProducts = products.filter(p => p.category === category.value);
          const CategoryIcon = category.icon;
          
          return (
            <Card key={category.value} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <CategoryIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <div className="font-medium">{category.label}</div>
                <div className="text-2xl font-bold mt-1">{categoryProducts.length}</div>
                <div className="text-xs text-muted-foreground">
                  CHF {categoryProducts.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const CategoryIcon = getCategoryIcon(product.category);
          
          return (
            <Card key={product.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {product.description}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateProduct(product)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleProductStatus(product.id)}>
                        {product.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={product.isActive ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {categories.find(c => c.value === product.category)?.label}
                  </Badge>
                  {!product.isPublic && (
                    <Badge variant="secondary" className="text-xs">
                      Private
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Price and Details */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {product.currency} {product.price}
                  </div>
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {product.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{product.duration}min</span>
                    </div>
                  )}
                  {product.capacity && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{product.capacity} max</span>
                    </div>
                  )}
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-sm text-muted-foreground">Sold</div>
                    <div className="font-medium">{product.totalSold}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                    <div className="font-medium">CHF {product.revenue.toLocaleString()}</div>
                  </div>
                </div>

                {/* Tags */}
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {product.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{product.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}