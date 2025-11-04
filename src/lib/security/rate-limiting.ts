/**
 * Rate limiting utilities
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export const checkRateLimit = (
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean => {
  const now = Date.now();
  const key = identifier;
  
  if (!rateLimitStore[key] || now > rateLimitStore[key].resetTime) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs
    };
    return true;
  }
  
  if (rateLimitStore[key].count >= maxRequests) {
    return false;
  }
  
  rateLimitStore[key].count++;
  return true;
};

export const clearRateLimit = (identifier: string): void => {
  delete rateLimitStore[identifier];
};

export const getRateLimitStatus = (identifier: string): {
  count: number;
  resetTime: number;
  remaining: number;
} | null => {
  const limit = rateLimitStore[identifier];
  if (!limit) return null;
  
  return {
    count: limit.count,
    resetTime: limit.resetTime,
    remaining: Math.max(0, 100 - limit.count)
  };
};
