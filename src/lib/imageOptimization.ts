/**
 * Image optimization utilities for performance enhancement
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Generate optimized image URL for Supabase storage
 * Supports WebP format and responsive sizing
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // If URL contains Supabase storage, add transformation parameters
  if (baseUrl.includes('supabase.co/storage')) {
    const url = new URL(baseUrl);
    const params = new URLSearchParams();
    
    if (width) params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    if (quality) params.set('quality', quality.toString());
    if (format) params.set('format', format);
    
    const transformParams = params.toString();
    if (transformParams) {
      url.searchParams.set('transform', transformParams);
    }
    
    return url.toString();
  }
  
  return baseUrl;
}

/**
 * Lazy load images using Intersection Observer
 */
export function createLazyImageLoader() {
  if (typeof IntersectionObserver === 'undefined') {
    return null;
  }

  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px',
    }
  );

  return imageObserver;
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(baseUrl: string, widths: number[]): string {
  return widths
    .map((width) => {
      const optimizedUrl = getOptimizedImageUrl(baseUrl, { width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}
