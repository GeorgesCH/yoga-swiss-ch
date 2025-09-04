import React, { useState, useEffect } from 'react';
import { imageService } from '../../utils/image-service';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

interface EnhancedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  category?: 'studios' | 'instructors' | 'classes' | 'retreats';
  imageStyle?: string; // For style-specific fallbacks
  variant?: 'thumb' | 'medium' | 'large';
  fallbackSrc?: string;
}

export function ImageWithFallback(props: EnhancedImageProps) {
  const { 
    src, 
    alt, 
    style, 
    className, 
    category,
    imageStyle,
    variant = 'medium',
    fallbackSrc,
    ...rest 
  } = props;
  
  const [didError, setDidError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(!!src);

  useEffect(() => {
    if (src) {
      setDidError(false);
      setCurrentSrc(src);
      setIsLoading(true);
      
      // Test if image loads
      const img = new Image();
      img.onload = () => setIsLoading(false);
      img.onerror = () => {
        setIsLoading(false);
        handleError();
      };
      img.src = src;
    } else {
      // No src provided, use fallback immediately
      setCurrentSrc(getFallbackUrl());
      setIsLoading(false);
    }
  }, [src]);

  const getFallbackUrl = () => {
    if (fallbackSrc) return fallbackSrc;
    
    if (category) {
      if (category === 'classes' && imageStyle) {
        return imageService.getStyleFallback(imageStyle, variant);
      } else {
        return imageService.getFallbackUrl(category, variant);
      }
    }
    
    // Analyze alt text for smart fallback
    const altLower = alt?.toLowerCase() || '';
    if (altLower.includes('studio') || altLower.includes('location')) {
      return imageService.getFallbackUrl('studios', variant);
    } else if (altLower.includes('instructor') || altLower.includes('teacher')) {
      return imageService.getFallbackUrl('instructors', variant);
    } else if (altLower.includes('retreat')) {
      return imageService.getFallbackUrl('retreats', variant);
    } else {
      return imageService.getFallbackUrl('classes', variant);
    }
  };

  const handleError = () => {
    if (!didError) {
      setDidError(true);
      setCurrentSrc(getFallbackUrl());
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (didError && !fallbackSrc && !category) {
    return (
      <div
        className={`inline-block bg-muted text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className ?? ''}`} style={style}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
      <img 
        src={currentSrc} 
        alt={alt} 
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        {...rest} 
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}

// Specialized components for different use cases
export function StudioImage({ 
  studioId, 
  studioName, 
  className, 
  variant = 'medium',
  ...props
}: { 
  studioId?: string; 
  studioName: string; 
  className?: string; 
  variant?: 'thumb' | 'medium' | 'large';
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>) {
  const src = studioId ? `studios/${studioId}.jpg` : undefined;
  
  return (
    <ImageWithFallback
      src={src}
      alt={studioName}
      category="studios"
      variant={variant}
      className={className}
      {...props}
    />
  );
}

export function InstructorImage({ 
  instructorId, 
  instructorName, 
  className, 
  variant = 'medium',
  ...props
}: { 
  instructorId?: string; 
  instructorName: string; 
  className?: string; 
  variant?: 'thumb' | 'medium' | 'large';
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>) {
  const src = instructorId ? `instructors/${instructorId}.jpg` : undefined;
  
  return (
    <ImageWithFallback
      src={src}
      alt={instructorName}
      category="instructors"
      variant={variant}
      className={className}
      {...props}
    />
  );
}

export function ClassImage({ 
  classId, 
  classTitle, 
  classStyle, 
  className, 
  variant = 'medium',
  ...props
}: { 
  classId?: string; 
  classTitle: string; 
  classStyle?: string; 
  className?: string;
  variant?: 'thumb' | 'medium' | 'large';
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>) {
  const src = classId ? `classes/${classId}.jpg` : undefined;
  
  return (
    <ImageWithFallback
      src={src}
      alt={classTitle}
      category="classes"
      imageStyle={classStyle}
      variant={variant}
      className={className}
      {...props}
    />
  );
}

export function RetreatImage({ 
  retreatId, 
  retreatName, 
  className, 
  variant = 'medium',
  ...props
}: { 
  retreatId?: string; 
  retreatName: string; 
  className?: string; 
  variant?: 'thumb' | 'medium' | 'large';
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>) {
  const src = retreatId ? `retreats/${retreatId}.jpg` : undefined;
  
  return (
    <ImageWithFallback
      src={src}
      alt={retreatName}
      category="retreats"
      variant={variant}
      className={className}
      {...props}
    />
  );
}
