import React, { useEffect, useState } from 'react';
import { ClassCard, ClassData } from '../ui/class-card';
import { useBrandTheme, useBrandStyles } from './BrandThemeProvider';
import { BrandService } from '../../utils/supabase/brands-service';

interface BrandAwareClassCardProps {
  classData: ClassData;
  variant?: 'default' | 'compact' | 'detailed' | 'admin';
  showQuickBook?: boolean;
  showFavorite?: boolean;
  onBook?: (classData: ClassData) => void;
  onViewDetails?: (classId: string) => void;
  onFavorite?: (classId: string, favorited: boolean) => void;
  onEdit?: (classId: string) => void;
  className?: string;
  // Brand-specific props
  studioId?: string;
  instructorId?: string;
  overrideBrandId?: string;
}

export function BrandAwareClassCard({
  classData,
  studioId,
  instructorId,
  overrideBrandId,
  className = '',
  ...props
}: BrandAwareClassCardProps) {
  const { setBrandByEntity, currentBrand } = useBrandTheme();
  const { getBrandStyle, getBrandClassName } = useBrandStyles();
  const [brandLoaded, setBrandLoaded] = useState(false);

  useEffect(() => {
    const loadBrand = async () => {
      try {
        // Determine which entity to use for brand resolution
        if (overrideBrandId) {
          // Use override brand if specified
          const brand = await BrandService.getBrand(overrideBrandId);
          if (brand) {
            await setBrandByEntity('class', classData.id, overrideBrandId);
          }
        } else if (studioId) {
          // Use studio brand for hosted classes
          await setBrandByEntity('studio', studioId);
        } else if (instructorId) {
          // Use instructor brand for personal sessions
          await setBrandByEntity('instructor', instructorId);
        }
      } catch (error) {
        console.warn('Failed to load brand for class card:', error);
      } finally {
        setBrandLoaded(true);
      }
    };

    loadBrand();
  }, [studioId, instructorId, overrideBrandId, classData.id, setBrandByEntity]);

  // Generate brand-aware styles
  const brandStyles = {
    '--card-primary-color': getBrandStyle('primaryColor'),
    '--card-secondary-color': getBrandStyle('secondaryColor'),
    '--card-accent-color': getBrandStyle('accentColor'),
    '--card-border-radius': getBrandStyle('borderRadius'),
    '--card-brand-font': getBrandStyle('brandFont'),
  } as React.CSSProperties;

  // Enhance class data with brand-specific information
  const enhancedClassData = {
    ...classData,
    // Add brand context to metadata
    metadata: {
      ...classData.metadata,
      brandId: currentBrand?.id,
      brandName: currentBrand?.name,
      brandSlug: currentBrand?.slug
    }
  };

  const brandAwareClassName = getBrandClassName(
    `brand-aware-class-card ${className} ${brandLoaded ? 'brand-loaded' : 'brand-loading'}`
  );

  return (
    <div 
      className={brandAwareClassName}
      style={brandStyles}
      data-brand-id={currentBrand?.id}
      data-studio-id={studioId}
      data-instructor-id={instructorId}
    >
      <ClassCard
        classData={enhancedClassData}
        className="brand-styled-card"
        {...props}
      />
      
      {/* Brand attribution (if different from hosting studio) */}
      {currentBrand && instructorId && (
        <div className="brand-attribution mt-2 text-xs text-muted-foreground flex items-center gap-1">
          <span>Presented by</span>
          <span 
            className="font-medium"
            style={{ color: getBrandStyle('primaryColor') }}
          >
            {currentBrand.name}
          </span>
        </div>
      )}
    </div>
  );
}

// Hook for brand-aware class styling
export function useClassBrandStyling(
  studioId?: string, 
  instructorId?: string, 
  overrideBrandId?: string
) {
  const { setBrandByEntity, currentBrand, theme } = useBrandTheme();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadBrand = async () => {
      setIsLoading(true);
      try {
        if (overrideBrandId) {
          const brand = await BrandService.getBrand(overrideBrandId);
          if (brand) {
            await setBrandByEntity('class', 'temp', overrideBrandId);
          }
        } else if (studioId) {
          await setBrandByEntity('studio', studioId);
        } else if (instructorId) {
          await setBrandByEntity('instructor', instructorId);
        }
      } catch (error) {
        console.warn('Failed to load brand for class styling:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBrand();
  }, [studioId, instructorId, overrideBrandId, setBrandByEntity]);

  const getStyledProps = () => ({
    style: {
      '--brand-primary': theme?.color.primary,
      '--brand-secondary': theme?.color.secondary,
      '--brand-accent': theme?.color.accent,
    } as React.CSSProperties,
    'data-brand': currentBrand?.slug,
    className: currentBrand ? `brand-${currentBrand.slug}` : ''
  });

  return {
    brand: currentBrand,
    theme,
    isLoading,
    getStyledProps
  };
}

// Utility component for brand badge/chip
export function BrandChip({ 
  brandId, 
  size = 'sm', 
  showLogo = false 
}: { 
  brandId: string; 
  size?: 'xs' | 'sm' | 'md'; 
  showLogo?: boolean;
}) {
  const [brand, setBrand] = useState<any>(null);
  const [asset, setAsset] = useState<any>(null);

  useEffect(() => {
    const loadBrand = async () => {
      try {
        const brandData = await BrandService.getBrand(brandId);
        setBrand(brandData);
        
        if (showLogo && brandData) {
          const logoAsset = await BrandService.getBrandAsset(brandData.id, 'logo_square');
          setAsset(logoAsset);
        }
      } catch (error) {
        console.warn('Failed to load brand for chip:', error);
      }
    };

    loadBrand();
  }, [brandId, showLogo]);

  if (!brand) return null;

  const sizeClasses = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1',
    md: 'text-base px-4 py-2'
  };

  return (
    <div 
      className={`inline-flex items-center gap-1 rounded-full border ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: `${brand.theme.color.primary}15`,
        borderColor: `${brand.theme.color.primary}30`,
        color: brand.theme.color.primary
      }}
    >
      {showLogo && asset && (
        <img 
          src={`/api/brand-assets/${asset.storage_path}`}
          alt={brand.name}
          className="w-4 h-4 rounded"
        />
      )}
      <span className="font-medium">{brand.name}</span>
    </div>
  );
}

// Enhanced class card with automatic brand detection
export function SmartBrandClassCard({
  classData,
  ...props
}: Omit<BrandAwareClassCardProps, 'studioId' | 'instructorId'>) {
  // Auto-detect studio/instructor from class data
  const studioId = classData.studio?.id;
  const instructorId = classData.instructor?.id;
  
  return (
    <BrandAwareClassCard
      classData={classData}
      studioId={studioId}
      instructorId={instructorId}
      {...props}
    />
  );
}