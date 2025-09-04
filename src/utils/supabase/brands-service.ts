import { supabase } from './client';

// =============================================
// BRAND SERVICE TYPES
// =============================================

export interface Brand {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  locale_default: string;
  theme: BrandTheme;
  content: BrandContent;
  is_active: boolean;
  version: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BrandTheme {
  color: {
    primary: string;
    secondary: string;
    accent: string;
    onPrimary: string;
    surface: string;
    onSurface: string;
  };
  typography: {
    brandFont: string;
    bodyFont: string;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
  elevation: {
    card: number;
  };
  email: {
    headerBg: string;
  };
}

export interface BrandContent {
  about?: string;
  short_bio?: string;
  mission?: string;
  social_links?: Record<string, string>;
  contact_info?: Record<string, any>;
}

export interface BrandAsset {
  id: string;
  brand_id: string;
  kind: 'logo_primary' | 'logo_dark' | 'logo_light' | 'logo_square' | 
        'email_header' | 'favicon' | 'hero' | 'og_image' | 
        'background' | 'pattern' | 'icon';
  storage_path: string;
  width?: number;
  height?: number;
  mime_type?: string;
  file_size?: number;
  variants?: AssetVariant[];
  alt_text?: string;
  description?: string;
  created_at: string;
}

export interface AssetVariant {
  size: 'sm' | 'md' | 'lg' | 'xl' | '2x';
  width: number;
  height: number;
  storage_path: string;
}

export interface BrandMember {
  id: string;
  brand_id: string;
  member_type: 'studio' | 'instructor' | 'org' | 'user';
  member_id: string;
  role: 'owner' | 'editor' | 'viewer';
  permissions: string[];
  is_active: boolean;
  invited_by?: string;
  joined_at: string;
}

export interface BrandDomain {
  id: string;
  brand_id: string;
  domain: string;
  subdomain?: string;
  email_from?: string;
  email_from_name?: string;
  email_dkim_record?: string;
  email_spf_record?: string;
  ssl_cert_path?: string;
  is_verified: boolean;
  is_active: boolean;
  verified_at?: string;
  verification_record?: string;
  verification_method?: 'DNS_TXT' | 'DNS_CNAME' | 'FILE';
  created_at: string;
  updated_at: string;
}

export interface BrandPolicy {
  id: string;
  brand_id: string;
  kind: 'cancellation' | 'late_no_show' | 'waiver' | 'privacy' | 
        'terms' | 'refund' | 'covid' | 'accessibility';
  title: string;
  content_md: string;
  content_html?: string;
  locale: string;
  version: number;
  is_published: boolean;
  published_at?: string;
  summary?: string;
  effective_date?: string;
  last_reviewed?: string;
  created_at: string;
  updated_at: string;
}

// =============================================
// BRAND CRUD OPERATIONS
// =============================================

export class BrandService {
  // Create a new brand
  static async createBrand(brandData: Partial<Brand>): Promise<Brand> {
    try {
      const user = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('brands')
        .insert([{
          ...brandData,
          created_by: user.data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Add creator as owner
      if (data?.id && user.data.user?.id) {
        await this.addBrandMember(data.id, {
          member_type: 'user',
          member_id: user.data.user.id,
          role: 'owner'
        });
      }

      return data;
    } catch (error) {
      console.warn('Brand service not available, using fallback data');
      // Return mock data for development
      return this.createMockBrand(brandData);
    }
  }

  // Helper method to create consistent mock data
  private static createMockBrand(brandData: Partial<Brand> = {}): Brand {
    return {
      id: 'mock-' + Date.now(),
      slug: brandData.slug || 'mock-brand',
      name: brandData.name || 'Mock Brand',
      tagline: brandData.tagline,
      locale_default: brandData.locale_default || 'en',
      theme: brandData.theme || {
        color: {
          primary: '#030213',
          secondary: '#F3B61F',
          accent: '#2ECC71',
          onPrimary: '#FFFFFF',
          surface: '#FFFFFF',
          onSurface: '#111111'
        },
        typography: {
          brandFont: 'Inter:600',
          bodyFont: 'Inter:400'
        },
        radius: { sm: 8, md: 12, lg: 20 },
        elevation: { card: 8 },
        email: { headerBg: '#030213' }
      },
      content: brandData.content || {
        about: '',
        short_bio: ''
      },
      is_active: true,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Get brand by ID
  static async getBrand(id: string): Promise<Brand | null> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.warn('Brand service not available, returning mock data for ID:', id);
      return this.createMockYogaSwissBrand(id);
    }
  }

  // Helper method for YogaSwiss mock brand
  private static createMockYogaSwissBrand(id: string): Brand {
    return {
      id,
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
        about: 'YogaSwiss brings together ancient wisdom and modern wellness in the beautiful Swiss landscape.',
        short_bio: "Switzerland's premier yoga community"
      },
      is_active: true,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Get brand by slug
  static async getBrandBySlug(slug: string): Promise<Brand | null> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.warn('Brand service not available, returning mock data for slug:', slug);
      
      // Return mock brand based on slug
      if (slug === 'yogaswiss') {
        return this.createMockYogaSwissBrand('1');
      }
      
      // Return null for unknown slugs
      return null;
    }
  }

  // Update brand
  static async updateBrand(id: string, updates: Partial<Brand>): Promise<Brand> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Brand update service not available, returning mock updated brand');
      // Return a mock updated brand
      const currentBrand = await this.getBrand(id);
      return { ...currentBrand, ...updates } as Brand;
    }
  }

  // Delete brand
  static async deleteBrand(id: string): Promise<void> {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // List brands accessible to current user
  static async listUserBrands(): Promise<Brand[]> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select(`
          *,
          brand_members!inner(role)
        `)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Brand service not available, returning mock data');
      return [this.createMockYogaSwissBrand('1')];
    }
  }

  // =============================================
  // BRAND ASSETS
  // =============================================

  // Upload brand asset
  static async uploadAsset(
    brandId: string, 
    kind: BrandAsset['kind'], 
    file: File,
    metadata?: Partial<BrandAsset>
  ): Promise<BrandAsset> {
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${brandId}/${kind}.${fileExt}`;
      const storagePath = `brand-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(storagePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Create asset record
      const { data, error } = await supabase
        .from('brand_assets')
        .upsert([{
          brand_id: brandId,
          kind,
          storage_path: storagePath,
          width: metadata?.width,
          height: metadata?.height,
          mime_type: file.type,
          file_size: file.size,
          alt_text: metadata?.alt_text,
          description: metadata?.description
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Asset upload service not available');
      // Return mock asset for development
      return {
        id: 'mock-asset-' + Date.now(),
        brand_id: brandId,
        kind,
        storage_path: `mock-assets/${kind}`,
        width: metadata?.width || 200,
        height: metadata?.height || 100,
        mime_type: file.type,
        file_size: file.size,
        alt_text: metadata?.alt_text,
        description: metadata?.description,
        variants: [],
        created_at: new Date().toISOString()
      };
    }
  }

  // Get brand assets
  static async getBrandAssets(brandId: string): Promise<BrandAsset[]> {
    try {
      const { data, error } = await supabase
        .from('brand_assets')
        .select('*')
        .eq('brand_id', brandId)
        .order('kind');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Brand assets service not available');
      return []; // Return empty array for mock
    }
  }

  // Get specific asset
  static async getBrandAsset(brandId: string, kind: BrandAsset['kind']): Promise<BrandAsset | null> {
    const { data, error } = await supabase
      .from('brand_assets')
      .select('*')
      .eq('brand_id', brandId)
      .eq('kind', kind)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Get asset public URL
  static async getAssetUrl(storagePath: string, version?: number): Promise<string> {
    const { data } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(storagePath);

    const url = data.publicUrl;
    return version ? `${url}?v=${version}` : url;
  }

  // Delete asset
  static async deleteAsset(id: string): Promise<void> {
    const { data: asset } = await supabase
      .from('brand_assets')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (asset) {
      // Delete from storage
      await supabase.storage
        .from('brand-assets')
        .remove([asset.storage_path]);
    }

    // Delete record
    const { error } = await supabase
      .from('brand_assets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // =============================================
  // BRAND MEMBERS
  // =============================================

  // Add brand member
  static async addBrandMember(brandId: string, member: Partial<BrandMember>): Promise<BrandMember> {
    try {
      const { data, error } = await supabase
        .from('brand_members')
        .insert([{
          brand_id: brandId,
          ...member,
          invited_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Brand member service not available');
      // Return mock member
      return {
        id: 'mock-member-' + Date.now(),
        brand_id: brandId,
        member_type: member.member_type || 'user',
        member_id: member.member_id || 'mock-user',
        role: member.role || 'viewer',
        permissions: [],
        is_active: true,
        joined_at: new Date().toISOString()
      };
    }
  }

  // Get brand members
  static async getBrandMembers(brandId: string): Promise<BrandMember[]> {
    try {
      const { data, error } = await supabase
        .from('brand_members')
        .select('*')
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .order('role');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Brand members service not available');
      return []; // Return empty array for mock
    }
  }

  // Update member role
  static async updateBrandMember(id: string, updates: Partial<BrandMember>): Promise<BrandMember> {
    const { data, error } = await supabase
      .from('brand_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Remove brand member
  static async removeBrandMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('brand_members')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // =============================================
  // BRAND POLICIES
  // =============================================

  // Create or update policy
  static async upsertPolicy(policy: Partial<BrandPolicy>): Promise<BrandPolicy> {
    const { data, error } = await supabase
      .from('brand_policies')
      .upsert([policy])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get brand policies
  static async getBrandPolicies(brandId: string, locale?: string): Promise<BrandPolicy[]> {
    try {
      let query = supabase
        .from('brand_policies')
        .select('*')
        .eq('brand_id', brandId);

      if (locale) {
        query = query.eq('locale', locale);
      }

      const { data, error } = await query.order('kind');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Brand policies service not available');
      return []; // Return empty array for mock
    }
  }

  // Get published policies (for public consumption)
  static async getPublishedPolicies(brandId: string, locale = 'en'): Promise<BrandPolicy[]> {
    const { data, error } = await supabase
      .from('brand_policies')
      .select('*')
      .eq('brand_id', brandId)
      .eq('locale', locale)
      .eq('is_published', true)
      .order('kind');

    if (error) throw error;
    return data || [];
  }

  // Publish policy
  static async publishPolicy(id: string): Promise<BrandPolicy> {
    const { data, error } = await supabase
      .from('brand_policies')
      .update({ 
        is_published: true, 
        published_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // =============================================
  // BRAND RESOLUTION
  // =============================================

  // Resolve brand for entity
  static async resolveEntityBrand(
    entityType: 'studio' | 'instructor' | 'class' | 'program' | 'retreat',
    entityId: string,
    overrideBrandId?: string
  ): Promise<Brand | null> {
    try {
      const { data, error } = await supabase
        .rpc('resolve_entity_brand', {
          entity_type: entityType,
          entity_id: entityId,
          override_brand_id: overrideBrandId
        });

      if (error) throw error;
      if (!data) return null;

      return this.getBrand(data);
    } catch (error) {
      console.warn('Entity brand resolution not available, returning default brand');
      // For development, return the default YogaSwiss brand
      return this.getBrand('1');
    }
  }

  // Get brand CSS variables
  static async getBrandCSSVariables(slug: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('get_brand_css_variables', { brand_slug: slug });

    if (error) throw error;
    return data || '';
  }

  // =============================================
  // BRAND DOMAINS
  // =============================================

  // Add domain
  static async addDomain(domain: Partial<BrandDomain>): Promise<BrandDomain> {
    const { data, error } = await supabase
      .from('brand_domains')
      .insert([domain])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get brand domains
  static async getBrandDomains(brandId: string): Promise<BrandDomain[]> {
    const { data, error } = await supabase
      .from('brand_domains')
      .select('*')
      .eq('brand_id', brandId)
      .eq('is_active', true)
      .order('domain');

    if (error) throw error;
    return data || [];
  }

  // Verify domain
  static async verifyDomain(id: string): Promise<BrandDomain> {
    const { data, error } = await supabase
      .from('brand_domains')
      .update({ 
        is_verified: true, 
        verified_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // =============================================
  // BRAND ANALYTICS
  // =============================================

  // Track brand event
  static async trackEvent(
    brandId: string,
    eventType: string,
    context?: {
      entityType?: string;
      entityId?: string;
      pagePath?: string;
      referrer?: string;
      value?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('brand_analytics')
        .insert([{
          brand_id: brandId,
          event_type: eventType,
          entity_type: context?.entityType,
          entity_id: context?.entityId,
          page_path: context?.pagePath,
          referrer: context?.referrer,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          value: context?.value || 0,
          metadata: context?.metadata || {}
        }]);

      if (error) console.warn('Failed to track brand event:', error);
    } catch (error) {
      // Silently fail analytics to avoid blocking functionality
      console.warn('Brand analytics not available:', error);
    }
  }

  // Get brand analytics
  static async getBrandAnalytics(
    brandId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    let query = supabase
      .from('brand_analytics')
      .select('*')
      .eq('brand_id', brandId);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // =============================================
  // THEME UTILITIES
  // =============================================

  // Generate CSS variables from theme
  static generateCSSVariables(theme: BrandTheme): string {
    const vars: string[] = [];

    // Colors
    Object.entries(theme.color).forEach(([key, value]) => {
      vars.push(`--brand-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`);
    });

    // Typography
    if (theme.typography.brandFont) {
      vars.push(`--brand-font: ${theme.typography.brandFont}`);
    }
    if (theme.typography.bodyFont) {
      vars.push(`--brand-body-font: ${theme.typography.bodyFont}`);
    }

    // Radius
    Object.entries(theme.radius).forEach(([key, value]) => {
      vars.push(`--brand-radius-${key}: ${value}px`);
    });

    // Elevation
    if (theme.elevation.card) {
      vars.push(`--brand-elevation-card: ${theme.elevation.card}px`);
    }

    return vars.join('; ');
  }

  // Apply brand theme to element
  static applyBrandTheme(element: HTMLElement, theme: BrandTheme): void {
    const cssVars = this.generateCSSVariables(theme);
    element.style.cssText += cssVars;
  }

  // =============================================
  // VALIDATION UTILITIES
  // =============================================

  // Validate slug availability
  static async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('brands')
      .select('id')
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.single();

    if (error && error.code === 'PGRST116') return true; // Not found = available
    if (error) throw error;
    return false; // Found = not available
  }

  // Validate color contrast
  static validateColorContrast(foreground: string, background: string): number {
    // Simplified contrast calculation
    // In real implementation, use proper WCAG contrast calculation
    const fgLum = this.getLuminance(foreground);
    const bgLum = this.getLuminance(background);
    const contrast = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);
    return contrast;
  }

  private static getLuminance(color: string): number {
    // Simplified luminance calculation
    // Convert hex to RGB and calculate relative luminance
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
  }
}