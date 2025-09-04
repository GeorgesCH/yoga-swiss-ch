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
  Receipt,
  CreditCard,
  Gift,
  Percent,
  DollarSign,
  Edit,
  Trash2,
  Search,
  Filter,
  Star,
  Clock,
  Users,
  Tag,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  Package
} from 'lucide-react';
import { shopService, PriceRule, GiftCard } from '../../utils/supabase/shop-service';

interface PricingManagementProps {
  orgId: string;
}

interface Package {
  id: string;
  name: string;
  description: string;
  type: 'class_pack' | 'membership' | 'gift_card';
  price: number;
  credits?: number;
  validity_days?: number;
  is_unlimited: boolean;
  is_recurring: boolean;
  recurring_interval?: 'monthly' | 'yearly';
  is_active: boolean;
  benefits?: string[];
  restrictions?: string[];
}

export function PricingManagement({ orgId }: PricingManagementProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [showGiftCardDialog, setShowGiftCardDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('packages');

  const packageTypes = [
    { value: 'class_pack', label: 'Class Packages', icon: Package, description: 'Multi-class credits' },
    { value: 'membership', label: 'Memberships', icon: Star, description: 'Recurring subscriptions' },
    { value: 'gift_card', label: 'Gift Cards', icon: Gift, description: 'Monetary gift cards' }
  ];

  const discountTypes = [
    { value: 'coupon', label: 'Coupon Codes', icon: Tag },
    { value: 'auto_discount', label: 'Automatic Discounts', icon: Percent },
    { value: 'volume_discount', label: 'Volume Discounts', icon: TrendingUp },
    { value: 'corporate_rate', label: 'Corporate Rates', icon: Users }
  ];

  useEffect(() => {
    loadPricingData();
  }, [orgId]);

  const loadPricingData = async () => {
    try {
      setLoading(true);
      // Load packages, price rules, and gift cards
      // For now using mock data
      setPackages([
        {
          id: '1',
          name: '5-Class Package',
          description: 'Perfect for occasional practice',
          type: 'class_pack',
          price: 150,
          credits: 5,
          validity_days: 90,
          is_unlimited: false,
          is_recurring: false,
          is_active: true,
          benefits: ['Valid for all regular classes', '3 months validity', 'Transferable to family'],
          restrictions: ['Not valid for workshops', 'Cannot be combined with other offers']
        },
        {
          id: '2',
          name: 'Unlimited Monthly',
          description: 'Unlimited access to all classes',
          type: 'membership',
          price: 180,
          validity_days: 30,
          is_unlimited: true,
          is_recurring: true,
          recurring_interval: 'monthly',
          is_active: true,
          benefits: ['Unlimited classes', 'Priority booking', '10% retail discount', 'Guest passes'],
          restrictions: ['12-month commitment', 'No freeze in first 3 months']
        }
      ]);

      setPriceRules([
        {
          id: '1',
          org_id: orgId,
          name: 'New Student Special',
          type: 'coupon',
          rule_json: { code: 'NEWSTUDENT', type: 'percentage', value: 50 },
          usage_limit: 100,
          usage_count: 23,
          is_active: true
        }
      ]);

      setGiftCards([
        {
          id: '1',
          org_id: orgId,
          code: 'GIFT2024ABC123',
          initial_amount: 100,
          balance: 100,
          currency: 'CHF',
          is_active: true
        }
      ]);
    } catch (error) {
      console.error('Error loading pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = 
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || pkg.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleCreatePackage = async (packageData: any) => {
    try {
      // Create package via API
      await loadPricingData();
      setShowPackageDialog(false);
      setEditingPackage(null);
    } catch (error) {
      console.error('Error creating package:', error);
    }
  };

  const handleCreateDiscount = async (discountData: any) => {
    try {
      // Create price rule via API
      await loadPricingData();
      setShowDiscountDialog(false);
    } catch (error) {
      console.error('Error creating discount:', error);
    }
  };

  const handleCreateGiftCard = async (giftCardData: any) => {
    try {
      const giftCard = await shopService.createGiftCard({
        ...giftCardData,
        org_id: orgId
      });
      await loadPricingData();
      setShowGiftCardDialog(false);
    } catch (error) {
      console.error('Error creating gift card:', error);
    }
  };

  const getPackageIcon = (type: string) => {
    const packageType = packageTypes.find(t => t.value === type);
    return packageType?.icon || Package;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-700">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const packageStats = {
    total: packages.length,
    active: packages.filter(p => p.is_active).length,
    class_packs: packages.filter(p => p.type === 'class_pack').length,
    memberships: packages.filter(p => p.type === 'membership').length,
    revenue: packages.reduce((sum, p) => sum + (p.price * 10), 0) // Mock revenue
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
          <h1 className="text-3xl font-bold">Pricing & Packages</h1>
          <p className="text-muted-foreground">
            Manage class packages, memberships, discounts, and gift cards
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Package</DialogTitle>
                <DialogDescription>
                  Create a new class package or membership plan
                </DialogDescription>
              </DialogHeader>
              <PackageForm
                package={editingPackage}
                packageTypes={packageTypes}
                onSave={handleCreatePackage}
                onCancel={() => {
                  setShowPackageDialog(false);
                  setEditingPackage(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{packageStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Packages</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{packageStats.active}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{packageStats.class_packs}</div>
                <div className="text-sm text-muted-foreground">Class Packs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{packageStats.memberships}</div>
                <div className="text-sm text-muted-foreground">Memberships</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">CHF {packageStats.revenue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Est. Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="packages">Packages & Plans</TabsTrigger>
          <TabsTrigger value="discounts">Discounts & Coupons</TabsTrigger>
          <TabsTrigger value="giftcards">Gift Cards</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search packages..."
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
                  {packageTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {filteredPackages.length} of {packages.length} packages
            </div>
          </div>

          {/* Package Type Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packageTypes.map((type) => {
              const count = packages.filter(p => p.type === type.value).length;
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

          {/* Packages Table */}
          <Card>
            <CardHeader>
              <CardTitle>Packages & Plans</CardTitle>
              <CardDescription>
                Manage your pricing packages and membership plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPackages.map((pkg) => {
                  const PackageIcon = getPackageIcon(pkg.type);
                  
                  return (
                    <Card key={pkg.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <PackageIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold">{pkg.name}</h3>
                                {getStatusBadge(pkg.is_active)}
                                {pkg.is_recurring && (
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Recurring
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {pkg.description}
                              </p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Price:</span>
                                  <div className="font-medium">CHF {pkg.price}</div>
                                </div>
                                {pkg.credits && (
                                  <div>
                                    <span className="text-muted-foreground">Credits:</span>
                                    <div className="font-medium">{pkg.credits}</div>
                                  </div>
                                )}
                                {pkg.validity_days && (
                                  <div>
                                    <span className="text-muted-foreground">Validity:</span>
                                    <div className="font-medium">{pkg.validity_days} days</div>
                                  </div>
                                )}
                                {pkg.is_unlimited && (
                                  <div>
                                    <span className="text-muted-foreground">Access:</span>
                                    <div className="font-medium text-green-600">Unlimited</div>
                                  </div>
                                )}
                              </div>

                              {pkg.benefits && pkg.benefits.length > 0 && (
                                <div className="mt-3">
                                  <div className="text-sm text-muted-foreground mb-1">Benefits:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {pkg.benefits.slice(0, 3).map((benefit, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {benefit}
                                      </Badge>
                                    ))}
                                    {pkg.benefits.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{pkg.benefits.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discounts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Discounts & Promotions</h3>
              <p className="text-muted-foreground">Create and manage discount codes and automatic promotions</p>
            </div>
            <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Discount
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Discount</DialogTitle>
                  <DialogDescription>
                    Create a new discount code or automatic promotion
                  </DialogDescription>
                </DialogHeader>
                <DiscountForm onSave={handleCreateDiscount} onCancel={() => setShowDiscountDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {priceRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{rule.name}</h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        {rule.type === 'coupon' && `Code: ${rule.rule_json.code}`}
                      </div>
                      <div className="mt-2">
                        {getStatusBadge(rule.is_active)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {rule.rule_json.type === 'percentage' ? `${rule.rule_json.value}%` : `CHF ${rule.rule_json.value}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {rule.usage_count}/{rule.usage_limit || '∞'} used
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="giftcards" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Gift Cards</h3>
              <p className="text-muted-foreground">Manage digital gift cards and balances</p>
            </div>
            <Dialog open={showGiftCardDialog} onOpenChange={setShowGiftCardDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Gift Card
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Gift Card</DialogTitle>
                  <DialogDescription>
                    Generate a new digital gift card
                  </DialogDescription>
                </DialogHeader>
                <GiftCardForm onSave={handleCreateGiftCard} onCancel={() => setShowGiftCardDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {giftCards.map((giftCard) => (
              <Card key={giftCard.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Gift className="h-8 w-8 text-pink-600" />
                    {getStatusBadge(giftCard.is_active)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-mono text-sm bg-muted p-2 rounded">
                      {giftCard.code}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Balance:</span>
                      <span className="font-semibold">CHF {giftCard.balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Original:</span>
                      <span className="text-sm">CHF {giftCard.initial_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Pricing Analytics</h3>
            <p className="text-muted-foreground">Sales performance and package analytics</p>
          </div>
          
          <div className="text-center py-12 text-muted-foreground">
            Analytics dashboard will be implemented in the next phase.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Package Form Component
interface PackageFormProps {
  package?: Package | null;
  packageTypes: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

function PackageForm({ package: pkg, packageTypes, onSave, onCancel }: PackageFormProps) {
  const [formData, setFormData] = useState({
    name: pkg?.name || '',
    description: pkg?.description || '',
    type: pkg?.type || 'class_pack',
    price: pkg?.price || 0,
    credits: pkg?.credits || 1,
    validity_days: pkg?.validity_days || 90,
    is_unlimited: pkg?.is_unlimited || false,
    is_recurring: pkg?.is_recurring || false,
    recurring_interval: pkg?.recurring_interval || 'monthly',
    is_active: pkg?.is_active !== undefined ? pkg.is_active : true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Package Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="5-Class Package"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Package Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {packageTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Perfect for occasional practice"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (CHF)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        {formData.type === 'class_pack' && (
          <div className="space-y-2">
            <Label htmlFor="credits">Credits</Label>
            <Input
              id="credits"
              type="number"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 1 })}
              required
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="validity">Validity (Days)</Label>
          <Input
            id="validity"
            type="number"
            value={formData.validity_days}
            onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) || 90 })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="unlimited">Unlimited Access</Label>
          <Switch
            id="unlimited"
            checked={formData.is_unlimited}
            onCheckedChange={(checked) => setFormData({ ...formData, is_unlimited: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="recurring">Recurring Subscription</Label>
          <Switch
            id="recurring"
            checked={formData.is_recurring}
            onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
          />
        </div>

        {formData.is_recurring && (
          <div className="space-y-2">
            <Label htmlFor="interval">Billing Interval</Label>
            <Select 
              value={formData.recurring_interval} 
              onValueChange={(value) => setFormData({ ...formData, recurring_interval: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor="active">Package Active</Label>
          <Switch
            id="active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {pkg ? 'Update Package' : 'Create Package'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Discount Form Component
interface DiscountFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

function DiscountForm({ onSave, onCancel }: DiscountFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'coupon',
    code: '',
    discount_type: 'percentage',
    value: 0,
    usage_limit: 100,
    is_active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Discount Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="New Student Special"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Coupon Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="WELCOME20"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discount-type">Discount Type</Label>
          <Select 
            value={formData.discount_type} 
            onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="value">
            {formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount (CHF)'}
          </Label>
          <Input
            id="value"
            type="number"
            step={formData.discount_type === 'percentage' ? '1' : '0.01'}
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="usage-limit">Usage Limit</Label>
          <Input
            id="usage-limit"
            type="number"
            value={formData.usage_limit}
            onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Discount
        </Button>
      </DialogFooter>
    </form>
  );
}

// Gift Card Form Component
interface GiftCardFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

function GiftCardForm({ onSave, onCancel }: GiftCardFormProps) {
  const [formData, setFormData] = useState({
    initial_amount: 50,
    recipient_email: '',
    recipient_name: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Gift Card Amount (CHF)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.initial_amount}
          onChange={(e) => setFormData({ ...formData, initial_amount: parseFloat(e.target.value) || 0 })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="recipient-name">Recipient Name</Label>
          <Input
            id="recipient-name"
            value={formData.recipient_name}
            onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
            placeholder="John Smith"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipient-email">Recipient Email</Label>
          <Input
            id="recipient-email"
            type="email"
            value={formData.recipient_email}
            onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Personal Message (Optional)</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Happy Birthday! Enjoy your yoga practice."
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Gift Card
        </Button>
      </DialogFooter>
    </form>
  );
}