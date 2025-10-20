import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Lightweight in-memory TTL cache for the browser runtime.
// Note: This cache resets on reload; use for short-lived UI memoization only.
type CacheEntry<T = unknown> = { expireAt: number; value: T };
const inMemoryCache = new Map<string, CacheEntry>();

export function cacheGet<T = unknown>(key: string): T | undefined {
  const now = Date.now();
  const hit = inMemoryCache.get(key);
  if (!hit) return undefined;
  if (hit.expireAt < now) {
    inMemoryCache.delete(key);
    return undefined;
  }
  return hit.value as T;
}

export function cacheSet<T = unknown>(key: string, value: T, ttlMs = 60_000): void {
  inMemoryCache.set(key, { expireAt: Date.now() + ttlMs, value });
}

export function memoizeAsync<TArgs extends any[], TResult>(
  keyBuilder: (...args: TArgs) => string,
  fn: (...args: TArgs) => Promise<TResult>,
  ttlMs = 60_000,
) {
  return async (...args: TArgs): Promise<TResult> => {
    const key = keyBuilder(...args);
    const cached = cacheGet<TResult>(key);
    if (cached !== undefined) return cached;
    const result = await fn(...args);
    cacheSet<TResult>(key, result, ttlMs);
    return result;
  };
}
