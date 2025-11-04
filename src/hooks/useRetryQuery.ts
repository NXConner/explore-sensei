import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Enhanced query hook with retry logic and error handling
 */

type RetryQueryOptions<TData> = Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> & {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TData>;
  showErrorToast?: boolean;
  errorMessage?: string;
  maxRetries?: number;
};

export function useRetryQuery<TData>({
  queryKey,
  queryFn,
  showErrorToast = true,
  errorMessage = 'Failed to load data',
  maxRetries = 3,
  ...options
}: RetryQueryOptions<TData>) {
  return useQuery({
    queryKey,
    queryFn,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < maxRetries;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
    ...options,
  });
}
