import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  Palette, 
  Upload, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Save, 
  RefreshCw,
  CheckCircle,
  FileText,
  Users,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { BrandService, Brand, BrandAsset, BrandMember, BrandPolicy } from '../../utils/supabase/brands-service';
import { useAuth } from '../auth/AuthProvider';

// Types imported from BrandService

interface BrandManagementProps {
  selectedBrandId?: string;
  onBrandSelect?: (brandId: string) => void;
}

export function BrandManagement({ selectedBrandId, onBrandSelect }: BrandManagementProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [members, setMembers] = useState<BrandMember[]>([]);
  const [policies, setPolicies] = useState<BrandPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [brandForm, setBrandForm] = useState<Partial<Brand>>({});
  const [error, setError] = useState<string | null>(null);
  const { user, currentOrg } = useAuth();

  useEffect(() => {
    loadBrandData();
  }, [selectedBrandId]);

  const loadBrandData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load user brands
      const userBrands = await BrandService.listUserBrands();
      setBrands(userBrands);

      // Load current brand (either selected or first available)
      let brandToLoad: Brand | null = null;
      if (selectedBrandId) {
        brandToLoad = await BrandService.getBrand(selectedBrandId);
      } else if (userBrands.length > 0) {
        brandToLoad = userBrands[0];
      }

      if (brandToLoad) {
        setCurrentBrand(brandToLoad);
        setBrandForm(brandToLoad);

        // Load brand assets, members, and policies
        const [brandAssets, brandMembers, brandPolicies] = await Promise.all([
          BrandService.getBrandAssets(brandToLoad.id),
          BrandService.getBrandMembers(brandToLoad.id),
          BrandService.getBrandPolicies(brandToLoad.id)
        ]);

        setAssets(brandAssets);
        setMembers(brandMembers);
        setPolicies(brandPolicies);
      } else {
        setCurrentBrand(null);
        setBrandForm({});
        setAssets([]);
        setMembers([]);
        setPolicies([]);
      }
    } catch (error) {
      console.error('Error loading brand data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load brand data');
      
      // Fallback to mock data for development
      const mockBrand: Brand = {
        id: '1',
        slug: 'yogaswiss',
        name: 'YogaSwiss',
        tagline: 'Discover your inner peace in the heart of Switzerland',
        locale_default: 'en',
        theme: {
          color: {
            primary: '#2B5D31',
            secondary: '#E8B86D',
            accent: '#A8C09A',
            onPrimary: '#FFFFFF',
            surface: '#FAFAFA',
            onSurface: '#1C1C1C'
          },
          typography: {
            brandFont: 'Inter:600',
            bodyFont: 'Inter:400'
          },
          radius: { sm: 8, md: 12, lg: 16 },
          elevation: { card: 8 },
          email: { headerBg: '#2B5D31' }
        },
        content: {
          about: 'YogaSwiss brings together ancient wisdom and modern wellness in the beautiful Swiss landscape.'
        },
        is_active: true,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setBrands([mockBrand]);
      setCurrentBrand(mockBrand);
      setBrandForm(mockBrand);
      setAssets([]);
      setMembers([]);
      setPolicies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getBrandHealthScore = () => {
    if (!currentBrand) return 0;
    
    let score = 0;
    const checks = [
      { condition: !!currentBrand.name, weight: 20 },
      { condition: !!currentBrand.tagline, weight: 10 },
      { condition: assets.some(a => a.kind === 'logo_primary'), weight: 25 },
      { condition: !!currentBrand.theme.color.primary, weight: 15 },
      { condition: policies.some(p => p.kind === 'privacy' && p.is_published), weight: 20 },
      { condition: !!currentBrand.content.about, weight: 10 }
    ];

    score = checks.reduce((total, check) => total + (check.condition ? check.weight : 0), 0);
    return Math.min(score, 100);
  };

  const handleSaveBrand = async () => {
    if (!currentBrand?.id || !brandForm) return;
    
    try {
      setIsLoading(true);
      
      // Update brand via API
      const updatedBrand = await BrandService.updateBrand(currentBrand.id, brandForm);
      
      setCurrentBrand(updatedBrand);
      setBrandForm(updatedBrand);
      setEditMode(false);
      toast.success('Brand updated successfully');
      
      // Refresh brand list
      const userBrands = await BrandService.listUserBrands();
      setBrands(userBrands);
      
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error('Failed to save brand changes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBrand = async () => {
    try {
      setIsLoading(true);
      
      const newBrand = await BrandService.createBrand({
        name: 'New Brand',
        slug: `brand-${Date.now()}`,
        locale_default: 'en',
        theme: {
          color: {
            primary: '#2B5D31',
            secondary: '#E8B86D',
            accent: '#A8C09A',
            onPrimary: '#FFFFFF',
            surface: '#FAFAFA',
            onSurface: '#1C1C1C'
          },
          typography: {
            brandFont: 'Inter:600',
            bodyFont: 'Inter:400'
          },
          radius: { sm: 8, md: 12, lg: 16 },
          elevation: { card: 8 },
          email: { headerBg: '#2B5D31' }
        },
        content: {},
        is_active: true
      });

      toast.success('Brand created successfully');
      await loadBrandData(); // Reload data
      
    } catch (error) {
      console.error('Error creating brand:', error);
      toast.error('Failed to create brand');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentBrand) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <Palette className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium">No brands found</h3>
            <p className="text-muted-foreground">Create your first brand to get started.</p>
          </div>
          <Button onClick={handleCreateBrand}>
            <Plus className="h-4 w-4 mr-2" />
            Create Brand
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Brand Management</h2>
          <p className="text-muted-foreground">
            Manage your brand identity, assets, and policies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={editMode ? "default" : "outline"}
            onClick={() => editMode ? handleSaveBrand() : setEditMode(true)}
          >
            {editMode ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Brand
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Brand Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Brand Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Overall Completeness</span>
              <div className="flex items-center gap-2">
                <Progress value={getBrandHealthScore()} className="w-32" />
                <span className="font-medium">{getBrandHealthScore()}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${assets.some(a => a.kind === 'logo_primary') ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>Primary Logo</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${currentBrand.theme.color.primary ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>Brand Colors</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${currentBrand.content.about ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <span>Brand Story</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${currentBrand.tagline ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <span>Tagline</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${policies.some(p => p.kind === 'privacy' && p.is_published) ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>Privacy Policy</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${members.length > 1 ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <span>Team Access</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Brand Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    value={brandForm.name || ''}
                    onChange={(e) => setBrandForm(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label htmlFor="brandSlug">Brand Slug</Label>
                  <div className="flex">
                    <span className="px-3 py-2 bg-muted border border-r-0 rounded-l text-sm text-muted-foreground">
                      yogaswiss.ch/b/
                    </span>
                    <Input
                      id="brandSlug"
                      value={brandForm.slug || ''}
                      onChange={(e) => setBrandForm(prev => ({ ...prev, slug: e.target.value }))}
                      disabled={!editMode}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="brandTagline">Tagline</Label>
                <Input
                  id="brandTagline"
                  value={brandForm.tagline || ''}
                  onChange={(e) => setBrandForm(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="A memorable phrase that captures your brand essence"
                  disabled={!editMode}
                />
              </div>
              
              <div>
                <Label htmlFor="brandAbout">About</Label>
                <Textarea
                  id="brandAbout"
                  value={brandForm.content?.about || ''}
                  onChange={(e) => setBrandForm(prev => ({ 
                    ...prev, 
                    content: { ...prev.content, about: e.target.value }
                  }))}
                  placeholder="Tell your brand story..."
                  rows={4}
                  disabled={!editMode}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'primary', label: 'Primary', description: 'Main brand color' },
                  { key: 'secondary', label: 'Secondary', description: 'Accent color' },
                  { key: 'accent', label: 'Accent', description: 'Highlight color' },
                  { key: 'surface', label: 'Surface', description: 'Background color' },
                  { key: 'onPrimary', label: 'On Primary', description: 'Text on primary' },
                  { key: 'onSurface', label: 'On Surface', description: 'Text on surface' }
                ].map(({ key, label, description }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandForm.theme?.color?.[key as keyof typeof brandForm.theme.color] || '#000000'}
                        onChange={(e) => setBrandForm(prev => ({
                          ...prev,
                          theme: {
                            ...prev.theme,
                            color: {
                              ...prev.theme?.color,
                              [key]: e.target.value
                            }
                          }
                        }))}
                        disabled={!editMode}
                        className="w-12 h-8 rounded border"
                      />
                      <Input
                        value={brandForm.theme?.color?.[key as keyof typeof brandForm.theme.color] || ''}
                        onChange={(e) => setBrandForm(prev => ({
                          ...prev,
                          theme: {
                            ...prev.theme,
                            color: {
                              ...prev.theme?.color,
                              [key]: e.target.value
                            }
                          }
                        }))}
                        disabled={!editMode}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Asset Management</h3>
            <p className="text-muted-foreground mb-4">
              Upload and manage brand assets like logos, images, and documents.
            </p>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Assets
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Brand Policies</h3>
            <p className="text-muted-foreground mb-4">
              Create and manage brand policies, terms, and legal documents.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}