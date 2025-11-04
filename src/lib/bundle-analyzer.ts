/**
 * Bundle size tracking and analysis
 */

interface BundleMetrics {
  totalSize: number;
  chunkSizes: Record<string, number>;
  timestamp: number;
}

class BundleAnalyzer {
  private metrics: BundleMetrics[] = [];
  private maxHistory = 10;

  recordMetrics(metrics: BundleMetrics): void {
    this.metrics.push(metrics);
    if (this.metrics.length > this.maxHistory) {
      this.metrics.shift();
    }
  }

  getMetrics(): BundleMetrics[] {
    return this.metrics;
  }

  getTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.metrics.length < 2) return 'stable';
    
    const recent = this.metrics.slice(-3);
    const sizes = recent.map(m => m.totalSize);
    
    const increasing = sizes.every((size, i) => 
      i === 0 || size > sizes[i - 1]
    );
    const decreasing = sizes.every((size, i) => 
      i === 0 || size < sizes[i - 1]
    );
    
    return increasing ? 'increasing' : decreasing ? 'decreasing' : 'stable';
  }

  getBudgetStatus(budgetKB: number): {
    within: boolean;
    overageKB: number;
    percentage: number;
  } {
    if (this.metrics.length === 0) {
      return { within: true, overageKB: 0, percentage: 0 };
    }
    
    const latest = this.metrics[this.metrics.length - 1];
    const totalKB = latest.totalSize / 1024;
    const overageKB = Math.max(0, totalKB - budgetKB);
    const percentage = (totalKB / budgetKB) * 100;
    
    return {
      within: totalKB <= budgetKB,
      overageKB,
      percentage,
    };
  }
}

export const bundleAnalyzer = new BundleAnalyzer();

// Bundle size budgets in KB
export const BUNDLE_BUDGETS = {
  main: 500,
  vendor: 800,
  total: 1500,
};

export const checkBundleBudget = (): {
  passed: boolean;
  violations: string[];
} => {
  const violations: string[] = [];
  const status = bundleAnalyzer.getBudgetStatus(BUNDLE_BUDGETS.total);
  
  if (!status.within) {
    violations.push(
      `Total bundle size exceeds budget by ${status.overageKB.toFixed(2)}KB (${status.percentage.toFixed(1)}% of budget)`
    );
  }
  
  const trend = bundleAnalyzer.getTrend();
  if (trend === 'increasing') {
    violations.push('Bundle size is trending upward');
  }
  
  return {
    passed: violations.length === 0,
    violations,
  };
};
