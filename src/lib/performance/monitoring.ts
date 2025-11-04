import { useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/monitoring';

/**
 * Performance monitoring utilities
 */

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

export const usePerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = performance.now();
    renderCount.current++;

    return () => {
      if (startTimeRef.current != null) {
        const endTime = performance.now();
        const renderTime = endTime - startTimeRef.current;
        if (renderTime > 16) {
          logger.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
        }
      }
    };
  });

  const [countSnapshot] = useState(() => renderCount.current);
  return { renderCount: countSnapshot };
};

export const memoryManager = {
  getMemoryUsage: (): any | null => {
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
    if ('gc' in window) {
      (window as any).gc();
    }
  }
};

export const performanceBudget = {
  firstContentfulPaint: 1.5,
  largestContentfulPaint: 2.5,
  firstInputDelay: 100,
  cumulativeLayoutShift: 0.1,
  totalBlockingTime: 200,
  
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
