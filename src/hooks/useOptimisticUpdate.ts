import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook for optimistic updates with rollback on error
 */

type OptimisticUpdateOptions<TData, TVariables> = {
  queryKey: readonly unknown[];
  mutationFn: (variables: TVariables) => Promise<TData>;
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData;
  successMessage?: string;
  errorMessage?: string;
};

export function useOptimisticUpdate<TData, TVariables>({
  queryKey,
  mutationFn,
  updateFn,
  successMessage,
  errorMessage,
}: OptimisticUpdateOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);
      
      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<TData>(queryKey, updateFn(previousData, variables));
      }
      
      return { previousData };
    },
    
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error(errorMessage || 'Operation failed');
    },
    
    onSuccess: () => {
      if (successMessage) {
        toast.success(successMessage);
      }
    },
    
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
