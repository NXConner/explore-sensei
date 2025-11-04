import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { realtimeManager } from '@/lib/real-time';

/**
 * Hook for real-time data subscriptions with React Query integration
 */

interface UseRealtimeSubscriptionOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  queryKey: readonly unknown[];
  enabled?: boolean;
}

export const useRealtimeSubscription = ({
  table,
  event = '*',
  filter,
  queryKey,
  enabled = true,
}: UseRealtimeSubscriptionOptions) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = realtimeManager.subscribe(
      table,
      event,
      (payload) => {
        console.log('Real-time update:', payload);
        
        // Invalidate queries to refetch data
        queryClient.invalidateQueries({ queryKey });
        
        // Optionally update cache directly for faster UI updates
        if (payload.eventType === 'INSERT') {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (Array.isArray(old)) {
              return [...old, payload.new];
            }
            return old;
          });
        }
        
        if (payload.eventType === 'UPDATE') {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (Array.isArray(old)) {
              return old.map((item: any) =>
                item.id === payload.new.id ? payload.new : item
              );
            }
            return old;
          });
        }
        
        if (payload.eventType === 'DELETE') {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (Array.isArray(old)) {
              return old.filter((item: any) => item.id !== payload.old.id);
            }
            return old;
          });
        }
      },
      filter
    );

    return () => {
      unsubscribe();
    };
  }, [table, event, filter, queryKey, enabled, queryClient]);
};
