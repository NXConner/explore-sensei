/**
 * Network optimization utilities
 */

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

export const bundleAnalyzer = {
  getChunkSize: (chunkName: string): number => {
    const chunks = (window as any).__webpack_require__?.cache;
    if (chunks && chunks[chunkName]) {
      return chunks[chunkName].size || 0;
    }
    return 0;
  },
  
  getTotalSize: (): number => {
    const chunks = (window as any).__webpack_require__?.cache;
    if (!chunks) return 0;
    
    const total = Object.values(chunks).reduce((acc: number, chunk: any) => {
      return acc + ((chunk?.size as number) || 0);
    }, 0);
    return total as number;
  }
};
