import { useEffect, useCallback, useMemo, useRef } from 'react';

/**
 * Performance optimization utilities for Explore Sensei
 */

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memoization utility
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Lazy loading utility
export const lazyLoad = (importFn: () => Promise<any>) => {
  return React.lazy(importFn);
};

// Image optimization
export const optimizeImage = (src: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
} = {}): string => {
  const { width, height, quality = 80, format = 'webp' } = options;
  const params = new URLSearchParams();
  
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  params.set('f', format);
  
  return `${src}?${params.toString()}`;
};

// Bundle size optimization
export const codeSplit = (importFn: () => Promise<any>) => {
  return React.lazy(importFn);
};

// Database query optimization
export const optimizeQuery = (query: string, params: any[] = []) => {
  // Remove unnecessary whitespace
  const optimizedQuery = query.replace(/\s+/g, ' ').trim();
  
  // Add query hints for better performance
  const hints = [
    '/*+ USE_INDEX */',
    '/*+ PARALLEL */',
    '/*+ CACHE */'
  ];
  
  return {
    query: optimizedQuery,
    params,
    hints
  };
};

// Caching utilities
export const createCache = <T>(maxSize: number = 100) => {
  const cache = new Map<string, T>();
  
  return {
    get: (key: string): T | undefined => {
      const value = cache.get(key);
      if (value) {
        // Move to end (LRU)
        cache.delete(key);
        cache.set(key, value);
      }
      return value;
    },
    
    set: (key: string, value: T): void => {
      if (cache.size >= maxSize) {
        // Remove least recently used
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
    
    clear: (): void => {
      cache.clear();
    },
    
    size: (): number => cache.size
  };
};

// Performance monitoring
export const performanceMonitor = {
  start: (name: string): void => {
    performance.mark(`${name}-start`);
  },
  
  end: (name: string): number => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    const measure = performance.getEntriesByName(name)[0];
    return measure.duration;
  },
  
  getMetrics: (): PerformanceEntry[] => {
    return performance.getEntriesByType('measure');
  },
  
  clear: (): void => {
    performance.clearMarks();
    performance.clearMeasures();
  }
};

// React performance hooks
export const usePerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  
  useEffect(() => {
    renderCount.current++;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    if (renderTime > 16) { // More than one frame
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
    }
    
    startTime.current = performance.now();
  });
  
  return {
    renderCount: renderCount.current
  };
};

// Memory management
export const memoryManager = {
  getMemoryUsage: (): MemoryInfo | null => {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  },
  
  isMemoryLow: (): boolean => {
    const memory = memoryManager.getMemoryUsage();
    if (!memory) return false;
    
    const used = memory.usedJSHeapSize;
    const total = memory.totalJSHeapSize;
    const percentage = (used / total) * 100;
    
    return percentage > 80;
  },
  
  cleanup: (): void => {
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
  }
};

// Network optimization
export const networkOptimizer = {
  preload: (url: string, type: 'script' | 'style' | 'image' | 'font' = 'script'): void => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    document.head.appendChild(link);
  },
  
  prefetch: (url: string): void => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  },
  
  preconnect: (url: string): void => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    document.head.appendChild(link);
  }
};

// Bundle analysis
export const bundleAnalyzer = {
  getChunkSize: (chunkName: string): number => {
    const chunks = (window as any).__webpack_require__.cache;
    if (chunks && chunks[chunkName]) {
      return chunks[chunkName].size || 0;
    }
    return 0;
  },
  
  getTotalSize: (): number => {
    const chunks = (window as any).__webpack_require__.cache;
    if (!chunks) return 0;
    
    return Object.values(chunks).reduce((total: number, chunk: any) => {
      return total + (chunk.size || 0);
    }, 0);
  }
};

// Lazy loading hook
export const useLazyLoad = (threshold: number = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [threshold]);
  
  return [ref, isVisible] as const;
};

// Virtual scrolling
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(start, end).map((item, index) => ({
      item,
      index: start + index
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = Math.floor(scrollTop / itemHeight) * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

// Performance budget
export const performanceBudget = {
  firstContentfulPaint: 1.5, // seconds
  largestContentfulPaint: 2.5, // seconds
  firstInputDelay: 100, // milliseconds
  cumulativeLayoutShift: 0.1, // score
  totalBlockingTime: 200, // milliseconds
  
  check: (metrics: any): { passed: boolean; violations: string[] } => {
    const violations: string[] = [];
    
    if (metrics.firstContentfulPaint > performanceBudget.firstContentfulPaint) {
      violations.push(`FCP: ${metrics.firstContentfulPaint}s > ${performanceBudget.firstContentfulPaint}s`);
    }
    
    if (metrics.largestContentfulPaint > performanceBudget.largestContentfulPaint) {
      violations.push(`LCP: ${metrics.largestContentfulPaint}s > ${performanceBudget.largestContentfulPaint}s`);
    }
    
    if (metrics.firstInputDelay > performanceBudget.firstInputDelay) {
      violations.push(`FID: ${metrics.firstInputDelay}ms > ${performanceBudget.firstInputDelay}ms`);
    }
    
    if (metrics.cumulativeLayoutShift > performanceBudget.cumulativeLayoutShift) {
      violations.push(`CLS: ${metrics.cumulativeLayoutShift} > ${performanceBudget.cumulativeLayoutShift}`);
    }
    
    if (metrics.totalBlockingTime > performanceBudget.totalBlockingTime) {
      violations.push(`TBT: ${metrics.totalBlockingTime}ms > ${performanceBudget.totalBlockingTime}ms`);
    }
    
    return {
      passed: violations.length === 0,
      violations
    };
  }
};

// Resource hints
export const resourceHints = {
  dnsPrefetch: (domain: string): void => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  },
  
  preconnect: (url: string): void => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    document.head.appendChild(link);
  },
  
  preload: (url: string, as: string): void => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    document.head.appendChild(link);
  }
};

// Export all utilities
export default {
  debounce,
  throttle,
  memoize,
  lazyLoad,
  optimizeImage,
  codeSplit,
  optimizeQuery,
  createCache,
  performanceMonitor,
  usePerformance,
  memoryManager,
  networkOptimizer,
  bundleAnalyzer,
  useLazyLoad,
  useVirtualScroll,
  performanceBudget,
  resourceHints
};
