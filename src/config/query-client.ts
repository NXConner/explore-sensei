import { QueryClient } from '@tanstack/react-query';

/**
 * Optimized React Query configuration
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Aggressive caching for better performance
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Network optimization
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Performance
      structuralSharing: true,
    },
    mutations: {
      // Retry mutations on network errors
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: 1000,
    },
  },
});

// Query keys factory for better organization
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },
  
  // Gamification
  gamification: {
    all: ['gamification'] as const,
    profile: (userId?: string) => ['gamification', 'profile', userId] as const,
    leaderboard: ['gamification', 'leaderboard'] as const,
  },
  
  // Jobs
  jobs: {
    all: ['jobs'] as const,
    list: (filters?: any) => ['jobs', 'list', filters] as const,
    detail: (id: string) => ['jobs', 'detail', id] as const,
  },
  
  // Employees
  employees: {
    all: ['employees'] as const,
    list: (filters?: any) => ['employees', 'list', filters] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
    tracking: (id: string) => ['employees', 'tracking', id] as const,
  },
  
  // Map
  map: {
    tiles: (zoom: number, x: number, y: number) => ['map', 'tiles', zoom, x, y] as const,
    weather: (lat: number, lng: number) => ['map', 'weather', lat, lng] as const,
  },
  
  // Analytics
  analytics: {
    all: ['analytics'] as const,
    kpi: (period: string) => ['analytics', 'kpi', period] as const,
    reports: (type: string) => ['analytics', 'reports', type] as const,
  },
} as const;
