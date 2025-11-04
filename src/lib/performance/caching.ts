/**
 * Caching utilities
 */

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

export const createCache = <T>(maxSize: number = 100) => {
  const cache = new Map<string, T>();
  
  return {
    get: (key: string): T | undefined => {
      const value = cache.get(key);
      if (value) {
        cache.delete(key);
        cache.set(key, value);
      }
      return value;
    },
    
    set: (key: string, value: T): void => {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
    
    clear: (): void => {
      cache.clear();
    },
    
    size: (): number => cache.size,
    
    has: (key: string): boolean => cache.has(key),
    
    delete: (key: string): boolean => cache.delete(key)
  };
};

export const createTTLCache = <T>(ttlMs: number = 60000) => {
  const cache = new Map<string, { value: T; expires: number }>();
  
  return {
    get: (key: string): T | undefined => {
      const entry = cache.get(key);
      if (!entry) return undefined;
      
      if (Date.now() > entry.expires) {
        cache.delete(key);
        return undefined;
      }
      
      return entry.value;
    },
    
    set: (key: string, value: T, customTTL?: number): void => {
      cache.set(key, {
        value,
        expires: Date.now() + (customTTL || ttlMs)
      });
    },
    
    clear: (): void => {
      cache.clear();
    },
    
    size: (): number => cache.size
  };
};
