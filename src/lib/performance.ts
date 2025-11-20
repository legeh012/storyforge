/**
 * Performance optimization utilities for the production studio
 */

// Debounce function for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for rate-limiting
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Batch multiple operations into a single frame
export function batchUpdates<T>(
  callback: (items: T[]) => void,
  delay: number = 16
): (item: T) => void {
  let pending: T[] = [];
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (item: T) => {
    pending.push(item);

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback(pending);
      pending = [];
      timeoutId = null;
    }, delay);
  };
}

// Memory-efficient image loading
export async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// Preload critical assets
export async function preloadAssets(urls: string[]): Promise<void> {
  await Promise.all(
    urls.map(async (url) => {
      if (url.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
        try {
          await loadImage(url);
        } catch {
          // Silently fail for individual images
        }
      } else {
        // For other assets, use link preload
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = 'fetch';
        document.head.appendChild(link);
      }
    })
  );
}

// Performance metrics tracking
export class PerformanceTracker {
  private marks: Map<string, number> = new Map();

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();

    if (!start) {
      return 0;
    }

    const duration = (end || performance.now()) - start;
    // Performance measured: ${name} in ${duration.toFixed(2)}ms
    return duration;
  }

  clear(): void {
    this.marks.clear();
  }
}

export const performanceTracker = new PerformanceTracker();
