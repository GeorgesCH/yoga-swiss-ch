import React, { useState } from 'react';
import { useMultiTenantAuth } from './MultiTenantAuthProvider';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import {
  ChevronDown,
  Building2,
  MapPin,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Users,
  CreditCard,
  Settings
} from 'lucide-react';

export function OrgHierarchySwitcher() {
  const { 
    currentOrg, 
    userOrgs, 
    switchOrg, 
    orgSwitching, 
    createOrg,
    hasPermission,
    getOrgContext 
  } = useMultiTenantAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    slug: '',
    type: 'studio' as 'brand' | 'studio',
    parent_org_id: ''
  });

  // Group organizations by brands and studios
  const groupedOrgs = userOrgs.reduce((acc, org) => {
    if (org.type === 'brand') {
      acc.brands.push(org);
    } else {
      const brandId = org.parent_org_id || 'independent';
      if (!acc.studios[brandId]) {
        acc.studios[brandId] = [];
      }
      acc.studios[brandId].push(org);
    }
    return acc;
  }, { brands: [] as any[], studios: {} as any });

  // Filter organizations based on search
  const filteredOrgs = userOrgs.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOrgIcon = (org: any) => {
    return org.type === 'brand' ? (
      <Building2 className="h-4 w-4" />
    ) : (
      <MapPin className="h-4 w-4" />
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'setup_incomplete':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Setup Required
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      owner: 'bg-blue-50 text-blue-700 border-blue-200',
      manager: 'bg-purple-50 text-purple-700 border-purple-200',
      instructor: 'bg-green-50 text-green-700 border-green-200',
      front_desk: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      accountant: 'bg-orange-50 text-orange-700 border-orange-200',
      marketer: 'bg-pink-50 text-pink-700 border-pink-200'
    };

    return (
      <Badge variant="outline" className={roleColors[role as keyof typeof roleColors] || ''}>
        {role.replace('_', ' ')}
      </Badge>
    );
  };

  const handleCreateOrg = async () => {
    if (!newOrgData.name || !newOrgData.slug) return;

    // Validate parent-child relationship constraint
    if (newOrgData.type === 'studio' && newOrgData.parent_org_id) {
      const parentOrg = userOrgs.find(org => org.id === newOrgData.parent_org_id);
      if (parentOrg && parentOrg.type !== 'brand') {
        console.error('Validation error: Studios can only be children of brands');
        // This should not happen due to UI constraints, but add as safety check
        return;
      }
    }

    const result = await createOrg(newOrgData);
    
    if (result.org) {
      setShowCreateDialog(false);
      setNewOrgData({ name: '', slug: '', type: 'studio', parent_org_id: '' });
    } else if (result.error) {
      console.error('Organization creation failed:', result.error);
      // Handle specific error messages from backend
      if (result.error.includes('Studios can only be children of brands')) {
        // This error should be handled by the backend validation
        console.error('Backend validation caught invalid parent-child relationship');
      }
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  if (!currentOrg) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Current Organization Display */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={orgSwitching}>
          <Button variant="ghost" className="h-8 gap-2 px-2">
            <div className="flex items-center gap-2">
              {getOrgIcon(currentOrg)}
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate max-w-32">
                    {currentOrg.name}
                  </span>
                  {currentOrg.role && getRoleBadge(currentOrg.role)}
                </div>
                {currentOrg.parent && (
                  <span className="text-xs text-muted-foreground">
                    {currentOrg.parent.name}
                  </span>
                )}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Switch Organization</span>
            {hasPermission('settings') && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Organization</DialogTitle>
                    <DialogDescription>
                      Create a new brand or studio organization.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Organization Name</label>
                      <Input
                        value={newOrgData.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setNewOrgData({
                            ...newOrgData,
                            name,
                            slug: generateSlug(name)
                          });
                        }}
                        placeholder="YogaZen Zürich"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">URL Slug</label>
                      <Input
                        value={newOrgData.slug}
                        onChange={(e) => setNewOrgData({
                          ...newOrgData,
                          slug: generateSlug(e.target.value)
                        })}
                        placeholder="yogazen-zurich"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <div className="flex gap-2 mt-1">
                        <Button
                          size="sm"
                          variant={newOrgData.type === 'brand' ? 'default' : 'outline'}
                          onClick={() => setNewOrgData({ ...newOrgData, type: 'brand' })}
                        >
                          <Building2 className="h-4 w-4 mr-1" />
                          Brand
                        </Button>
                        <Button
                          size="sm"
                          variant={newOrgData.type === 'studio' ? 'default' : 'outline'}
                          onClick={() => setNewOrgData({ ...newOrgData, type: 'studio' })}
                        >
                          <MapPin className="h-4 w-4 mr-1" />
                          Studio
                        </Button>
                      </div>
                    </div>
                    
                    {newOrgData.type === 'studio' && userOrgs.filter(org => org.type === 'brand').length > 0 && (
                      <div>
                        <label className="text-sm font-medium">Parent Brand (Optional)</label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Studios can only be children of brands, not other studios
                        </p>
                        <select
                          className="w-full p-2 border rounded-md mt-1"
                          value={newOrgData.parent_org_id}
                          onChange={(e) => setNewOrgData({
                            ...newOrgData,
                            parent_org_id: e.target.value
                          })}
                        >
                          <option value="">Independent Studio</option>
                          {userOrgs
                            .filter(org => org.type === 'brand') // Double-check: only show brands
                            .map((brand) => (
                              <option key={brand.id} value={brand.id}>
                                {brand.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateOrg}
                      disabled={!newOrgData.name || !newOrgData.slug}
                    >
                      Create Organization
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </DropdownMenuLabel>

          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <DropdownMenuSeparator />

          <div className="max-h-64 overflow-y-auto">
            {searchQuery ? (
              // Show filtered results when searching
              filteredOrgs.length > 0 ? (
                filteredOrgs.map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => switchOrg(org.id)}
                    className={`p-3 ${currentOrg.id === org.id ? 'bg-accent' : ''}`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {getOrgIcon(org)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {org.name}
                          </span>
                          {org.role && getRoleBadge(org.role)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(org.status)}
                          {org.parent && (
                            <span className="text-xs text-muted-foreground truncate">
                              under {org.parent.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-3 text-center text-muted-foreground">
                  No organizations found
                </div>
              )
            ) : (
              // Show hierarchy when not searching
              <>
                {/* Brands */}
                {groupedOrgs.brands.map((brand) => (
                  <div key={brand.id}>
                    <DropdownMenuItem
                      onClick={() => switchOrg(brand.id)}
                      className={`p-3 ${currentOrg.id === brand.id ? 'bg-accent' : ''}`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Building2 className="h-4 w-4" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {brand.name}
                            </span>
                            {brand.role && getRoleBadge(brand.role)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(brand.status)}
                            <span className="text-xs text-muted-foreground">
                              Brand
                            </span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    
                    {/* Studios under this brand */}
                    {groupedOrgs.studios[brand.id]?.map((studio) => (
                      <DropdownMenuItem
                        key={studio.id}
                        onClick={() => switchOrg(studio.id)}
                        className={`p-3 pl-8 ${currentOrg.id === studio.id ? 'bg-accent' : ''}`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <MapPin className="h-4 w-4" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {studio.name}
                              </span>
                              {studio.role && getRoleBadge(studio.role)}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(studio.status)}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))}

                {/* Independent Studios */}
                {groupedOrgs.studios.independent?.length > 0 && (
                  <>
                    {groupedOrgs.brands.length > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel>Independent Studios</DropdownMenuLabel>
                    {groupedOrgs.studios.independent.map((studio) => (
                      <DropdownMenuItem
                        key={studio.id}
                        onClick={() => switchOrg(studio.id)}
                        className={`p-3 ${currentOrg.id === studio.id ? 'bg-accent' : ''}`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <MapPin className="h-4 w-4" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {studio.name}
                              </span>
                              {studio.role && getRoleBadge(studio.role)}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(studio.status)}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Organization Status Indicator */}
      <div className="flex items-center gap-1">
        {getStatusBadge(currentOrg.status)}
      </div>
    </div>
  );
}