import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Plus, 
  Package,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  EyeOff,
  ShoppingCart,
  Gift,
  CreditCard,
  Smartphone,
  Monitor,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Globe,
  Warehouse,
  CheckCircle2,
  XCircle,
  Clock,
  Star
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { shopService, Product } from '../../utils/supabase/shop-service';

interface ProductManagementProps {
  orgId: string;
}

export function ProductManagement({ orgId }: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  const productTypes = [
    { value: 'retail', label: 'Retail Products', icon: Package, description: 'Physical products for sale' },
    { value: 'class_pack', label: 'Class Packages', icon: CreditCard, description: 'Multi-class credits' },
    { value: 'membership', label: 'Memberships', icon: Star, description: 'Recurring subscriptions' },
    { value: 'gift_card', label: 'Gift Cards', icon: Gift, description: 'Monetary gift cards' },
    { value: 'rental', label: 'Equipment Rental', icon: Clock, description: 'Rentable equipment' },
    { value: 'digital', label: 'Digital Products', icon: Monitor, description: 'Digital downloads' },
    { value: 'add_on', label: 'Add-ons', icon: Plus, description: 'Additional services' }
  ];

  const visibilityOptions = [
    { value: 'public', label: 'Public', icon: Globe, color: 'text-green-600' },
    { value: 'unlisted', label: 'Unlisted', icon: Eye, color: 'text-orange-600' },
    { value: 'private', label: 'Private', icon: EyeOff, color: 'text-red-600' }
  ];

  const channels = [
    { value: 'web', label: 'Website', icon: Globe },
    { value: 'pos', label: 'Point of Sale', icon: ShoppingCart },
    { value: 'mobile', label: 'Mobile App', icon: Smartphone }
  ];

  useEffect(() => {
    loadProducts();
  }, [orgId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await shopService.getProducts(orgId);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || product.type === typeFilter;
    const matchesVisibility = visibilityFilter === 'all' || product.visibility === visibilityFilter;
    
    return matchesSearch && matchesType && matchesVisibility;
  });

  const handleCreateProduct = async (productData: any) => {
    try {
      await shopService.createProduct({
        ...productData,
        org_id: orgId
      });
      
      await loadProducts();
      setShowCreateDialog(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowCreateDialog(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await shopService.deleteProduct(productId);
        await loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await shopService.updateProduct(product.id, {
        is_active: !product.is_active
      });
      await loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const typeData = productTypes.find(t => t.value === type);
    return typeData?.icon || Package;
  };

  const getVisibilityIcon = (visibility: string) => {
    const visibilityData = visibilityOptions.find(v => v.value === visibility);
    return visibilityData?.icon || Globe;
  };

  const getStatusBadge = (product: Product) => {
    if (!product.is_active) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-600"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
    }
    
    if (product.visibility === 'public') {
      return <Badge variant="default" className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Live</Badge>;
    }
    
    if (product.visibility === 'unlisted') {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-700"><Eye className="h-3 w-3 mr-1" />Unlisted</Badge>;
    }
    
    return <Badge variant="secondary" className="bg-red-100 text-red-700"><EyeOff className="h-3 w-3 mr-1" />Private</Badge>;
  };

  const productStats = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    public: products.filter(p => p.visibility === 'public').length,
    retail: products.filter(p => p.type === 'retail').length,
    packages: products.filter(p => p.type === 'class_pack').length,
    memberships: products.filter(p => p.type === 'membership').length
  };

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
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your products, services, packages, and pricing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </DialogTitle>
                <DialogDescription>
                  Add or update product information, pricing, and availability
                </DialogDescription>
              </DialogHeader>
              
              <ProductForm
                product={editingProduct}
                productTypes={productTypes}
                visibilityOptions={visibilityOptions}
                channels={channels}
                onSave={handleCreateProduct}
                onCancel={() => {
                  setShowCreateDialog(false);
                  setEditingProduct(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{productStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Products</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{productStats.active}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{productStats.public}</div>
                <div className="text-sm text-muted-foreground">Public</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{productStats.retail}</div>
                <div className="text-sm text-muted-foreground">Retail</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{productStats.packages}</div>
                <div className="text-sm text-muted-foreground">Packages</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{productStats.memberships}</div>
                <div className="text-sm text-muted-foreground">Memberships</div>
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
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {productTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visibility</SelectItem>
              {visibilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Product Type Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productTypes.map((type) => {
          const count = products.filter(p => p.type === type.value).length;
          const TypeIcon = type.icon;
          
          return (
            <Card key={type.value} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TypeIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{type.label}</div>
                      <div className="text-2xl font-bold">{count}</div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {type.description}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your product catalog and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 font-medium">Product</th>
                  <th className="text-left pb-3 font-medium">Type</th>
                  <th className="text-center pb-3 font-medium">Price</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-center pb-3 font-medium">Channels</th>
                  <th className="text-right pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const TypeIcon = getTypeIcon(product.type);
                  const VisibilityIcon = getVisibilityIcon(product.visibility);
                  
                  return (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {product.images.length > 0 ? (
                              <img 
                                src={product.images[0]} 
                                alt={product.name.en}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{product.name.en}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.sku && (
                                <code className="bg-muted px-1 rounded text-xs mr-2">
                                  {product.sku}
                                </code>
                              )}
                              {product.description.en}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">
                            {product.type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <div className="font-medium">CHF {product.price}</div>
                        {product.type === 'class_pack' && (
                          <div className="text-xs text-muted-foreground">
                            Package
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-center">
                        {getStatusBadge(product)}
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {product.channel_flags.map((channel) => {
                            const channelData = channels.find(c => c.value === channel);
                            if (!channelData) return null;
                            const ChannelIcon = channelData.icon;
                            return (
                              <div key={channel} className="p-1">
                                <ChannelIcon className="h-3 w-3 text-muted-foreground" />
                              </div>
                            );
                          })}
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
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(product)}>
                              {product.is_active ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
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

// Product Form Component
interface ProductFormProps {
  product?: Product | null;
  productTypes: any[];
  visibilityOptions: any[];
  channels: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

function ProductForm({ product, productTypes, visibilityOptions, channels, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: { en: product?.name.en || '', de: product?.name.de || '' },
    description: { en: product?.description.en || '', de: product?.description.de || '' },
    type: product?.type || 'retail',
    category: product?.category || '',
    sku: product?.sku || '',
    price: product?.price || 0,
    visibility: product?.visibility || 'public',
    channel_flags: product?.channel_flags || ['web'],
    inventory_tracking: product?.inventory_tracking || false,
    is_active: product?.is_active !== undefined ? product.is_active : true,
    tax_class: product?.tax_class || 'standard',
    revenue_category: product?.revenue_category || 'retail'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="seo">SEO & Media</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name-en">Product Name (English)</Label>
              <Input
                id="name-en"
                value={formData.name.en}
                onChange={(e) => setFormData({
                  ...formData,
                  name: { ...formData.name, en: e.target.value }
                })}
                placeholder="Yoga Mat Premium"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name-de">Product Name (German)</Label>
              <Input
                id="name-de"
                value={formData.name.de}
                onChange={(e) => setFormData({
                  ...formData,
                  name: { ...formData.name, de: e.target.value }
                })}
                placeholder="Premium Yogamatte"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description-en">Description (English)</Label>
            <Textarea
              id="description-en"
              value={formData.description.en}
              onChange={(e) => setFormData({
                ...formData,
                description: { ...formData.description, en: e.target.value }
              })}
              placeholder="High-quality non-slip yoga mat..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Product Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="equipment"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="YM-PREM-001"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (CHF)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="65.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-class">Tax Class</Label>
              <Select
                value={formData.tax_class}
                onValueChange={(value) => setFormData({ ...formData, tax_class: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard VAT (7.7%)</SelectItem>
                  <SelectItem value="reduced">Reduced VAT (2.5%)</SelectItem>
                  <SelectItem value="special">Special VAT (3.7%)</SelectItem>
                  <SelectItem value="exempt">VAT Exempt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="revenue-category">Revenue Category</Label>
            <Select
              value={formData.revenue_category}
              onValueChange={(value) => setFormData({ ...formData, revenue_category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail Sales</SelectItem>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="memberships">Memberships</SelectItem>
                <SelectItem value="packages">Class Packages</SelectItem>
                <SelectItem value="rentals">Equipment Rental</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select
              value={formData.visibility}
              onValueChange={(value) => setFormData({ ...formData, visibility: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sales Channels</Label>
            <div className="space-y-2">
              {channels.map((channel) => (
                <div key={channel.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={channel.value}
                    checked={formData.channel_flags.includes(channel.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          channel_flags: [...formData.channel_flags, channel.value]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          channel_flags: formData.channel_flags.filter(c => c !== channel.value)
                        });
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={channel.value} className="flex items-center gap-2">
                    <channel.icon className="h-4 w-4" />
                    {channel.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="inventory-tracking">Enable Inventory Tracking</Label>
              <Switch
                id="inventory-tracking"
                checked={formData.inventory_tracking}
                onCheckedChange={(checked) => setFormData({ ...formData, inventory_tracking: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is-active">Product Active</Label>
              <Switch
                id="is-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            SEO and media settings will be implemented in the next phase.
          </p>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </DialogFooter>
    </form>
  );
}