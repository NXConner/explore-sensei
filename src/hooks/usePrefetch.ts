import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Hook for prefetching data to improve perceived performance
 */

export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchQuery = useCallback(
    async <TData>(
      queryKey: readonly unknown[],
      queryFn: () => Promise<TData>,
      staleTime?: number
    ) => {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: staleTime || 60000, // 1 minute default
      });
    },
    [queryClient]
  );

  const prefetchOnHover = useCallback(
    <TData>(
      queryKey: readonly unknown[],
      queryFn: () => Promise<TData>
    ) => {
      return {
        onMouseEnter: () => prefetchQuery(queryKey, queryFn),
        onFocus: () => prefetchQuery(queryKey, queryFn),
      };
    },
    [prefetchQuery]
  );

  return { prefetchQuery, prefetchOnHover };
};
