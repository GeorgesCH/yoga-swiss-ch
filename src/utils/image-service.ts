import { supabase } from './supabase/client';

interface ImageConfig {
  bucket: string;
  folder?: string;
  defaultFallback: string;
  variants?: {
    thumb: { width: number; height: number };
    medium: { width: number; height: number };
    large: { width: number; height: number };
  };
}

const IMAGE_CONFIGS: Record<string, ImageConfig> = {
  studios: {
    bucket: 'public-images',
    folder: 'studios',
    defaultFallback: '/fallback-studio.jpg',
    variants: {
      thumb: { width: 150, height: 150 },
      medium: { width: 400, height: 300 },
      large: { width: 800, height: 600 }
    }
  },
  instructors: {
    bucket: 'public-images',
    folder: 'instructors',
    defaultFallback: '/fallback-instructor.jpg',
    variants: {
      thumb: { width: 100, height: 100 },
      medium: { width: 300, height: 300 },
      large: { width: 600, height: 600 }
    }
  },
  classes: {
    bucket: 'public-images',
    folder: 'classes',
    defaultFallback: '/fallback-class.jpg',
    variants: {
      thumb: { width: 200, height: 150 },
      medium: { width: 400, height: 300 },
      large: { width: 800, height: 600 }
    }
  },
  retreats: {
    bucket: 'public-images',
    folder: 'retreats',
    defaultFallback: '/fallback-retreat.jpg',
    variants: {
      thumb: { width: 250, height: 200 },
      medium: { width: 500, height: 400 },
      large: { width: 1000, height: 800 }
    }
  }
};

export class ImageService {
  private static instance: ImageService;
  private fallbackUrls: Map<string, string> = new Map();

  static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  private constructor() {
    this.initializeFallbacks();
  }

  private initializeFallbacks() {
    // Generate high-quality Unsplash fallback URLs
    this.fallbackUrls.set('studios', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop');
    this.fallbackUrls.set('instructors', 'https://images.unsplash.com/photo-1494790108755-2616b2e0e3f3?w=300&h=300&fit=crop');
    this.fallbackUrls.set('classes', 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&h=600&fit=crop');
    this.fallbackUrls.set('retreats', 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=1000&h=800&fit=crop');
    this.fallbackUrls.set('outdoor', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop');
    this.fallbackUrls.set('online', 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&h=600&fit=crop');
    this.fallbackUrls.set('meditation', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop');
    this.fallbackUrls.set('vinyasa', 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&h=600&fit=crop');
    this.fallbackUrls.set('hatha', 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&h=600&fit=crop');
    this.fallbackUrls.set('yin', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop');
    this.fallbackUrls.set('hot', 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&h=600&fit=crop');
  }

  /**
   * Get image URL from Supabase Storage with fallback
   */
  async getImageUrl(
    category: keyof typeof IMAGE_CONFIGS,
    filename: string,
    variant: 'thumb' | 'medium' | 'large' = 'medium'
  ): Promise<string> {
    try {
      const config = IMAGE_CONFIGS[category];
      if (!config) {
        throw new Error(`Unknown image category: ${category}`);
      }

      const path = config.folder ? `${config.folder}/${filename}` : filename;
      
      const { data, error } = await supabase.storage
        .from(config.bucket)
        .getPublicUrl(path);

      if (error || !data) {
        throw error || new Error('Failed to get image URL');
      }

      // If Supabase image transforms are available, apply them
      const { width, height } = config.variants?.[variant] || { width: 400, height: 300 };
      const transformedUrl = `${data.publicUrl}?width=${width}&height=${height}&resize=crop`;

      // Test if image exists by attempting to fetch
      const response = await fetch(transformedUrl, { method: 'HEAD' });
      if (response.ok) {
        return transformedUrl;
      } else {
        throw new Error('Image not found');
      }
    } catch (error) {
      console.warn(`Failed to load image ${filename} for ${category}:`, error);
      return this.getFallbackUrl(category, variant);
    }
  }

  /**
   * Get fallback URL for category
   */
  getFallbackUrl(category: string, variant: 'thumb' | 'medium' | 'large' = 'medium'): string {
    const baseUrl = this.fallbackUrls.get(category) || this.fallbackUrls.get('classes');
    const config = IMAGE_CONFIGS[category as keyof typeof IMAGE_CONFIGS];
    
    if (config?.variants?.[variant]) {
      const { width, height } = config.variants[variant];
      return `${baseUrl}&w=${width}&h=${height}`;
    }
    
    return baseUrl || '/fallback-image.jpg';
  }

  /**
   * Get style-specific fallback for yoga classes
   */
  getStyleFallback(style: string, variant: 'thumb' | 'medium' | 'large' = 'medium'): string {
    const normalizedStyle = style.toLowerCase().replace(/[^a-z]/g, '');
    const styleKey = ['vinyasa', 'hatha', 'yin', 'hot', 'meditation'].find(s => 
      normalizedStyle.includes(s)
    ) || 'classes';
    
    return this.getFallbackUrl(styleKey, variant);
  }

  /**
   * Upload image to Supabase Storage
   */
  async uploadImage(
    category: keyof typeof IMAGE_CONFIGS,
    file: File,
    filename?: string
  ): Promise<string> {
    try {
      const config = IMAGE_CONFIGS[category];
      const actualFilename = filename || `${Date.now()}-${file.name}`;
      const path = config.folder ? `${config.folder}/${actualFilename}` : actualFilename;

      const { data, error } = await supabase.storage
        .from(config.bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      return await this.getImageUrl(category, actualFilename);
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  }

  /**
   * Delete image from Supabase Storage
   */
  async deleteImage(category: keyof typeof IMAGE_CONFIGS, filename: string): Promise<void> {
    try {
      const config = IMAGE_CONFIGS[category];
      const path = config.folder ? `${config.folder}/${filename}` : filename;

      const { error } = await supabase.storage
        .from(config.bucket)
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  }

  /**
   * Get optimized image props for responsive images
   */
  getResponsiveImageProps(
    category: keyof typeof IMAGE_CONFIGS,
    filename: string,
    alt: string
  ) {
    const config = IMAGE_CONFIGS[category];
    
    return {
      src: this.getFallbackUrl(category, 'medium'),
      srcSet: config.variants ? Object.entries(config.variants)
        .map(([variant, size]) => 
          `${this.getFallbackUrl(category, variant as any)} ${size.width}w`
        ).join(', ') : undefined,
      sizes: config.variants ? 
        `(max-width: 768px) ${config.variants.thumb.width}px, (max-width: 1200px) ${config.variants.medium.width}px, ${config.variants.large.width}px` : 
        '100vw',
      alt,
      loading: 'lazy' as const,
      onError: (e: any) => {
        e.target.src = this.getFallbackUrl(category, 'medium');
      }
    };
  }
}

// Export singleton instance
export const imageService = ImageService.getInstance();

// Utility functions
export const getStudioImage = (filename?: string, variant: 'thumb' | 'medium' | 'large' = 'medium') => {
  if (!filename) return imageService.getFallbackUrl('studios', variant);
  return imageService.getImageUrl('studios', filename, variant);
};

export const getInstructorImage = (filename?: string, variant: 'thumb' | 'medium' | 'large' = 'medium') => {
  if (!filename) return imageService.getFallbackUrl('instructors', variant);
  return imageService.getImageUrl('instructors', filename, variant);
};

export const getClassImage = (filename?: string, style?: string, variant: 'thumb' | 'medium' | 'large' = 'medium') => {
  if (!filename) {
    return style ? imageService.getStyleFallback(style, variant) : imageService.getFallbackUrl('classes', variant);
  }
  return imageService.getImageUrl('classes', filename, variant);
};

export const getRetreatImage = (filename?: string, variant: 'thumb' | 'medium' | 'large' = 'medium') => {
  if (!filename) return imageService.getFallbackUrl('retreats', variant);
  return imageService.getImageUrl('retreats', filename, variant);
};