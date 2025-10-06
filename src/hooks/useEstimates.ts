import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EstimateLineItem {
  id?: string;
  cost_item_id?: string;
  item_name: string;
  item_code?: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  line_total: number;
}

export interface Estimate {
  id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  job_site_address?: string;
  catalog_id?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  notes?: string;
  valid_until?: string;
  line_items: EstimateLineItem[];
}

export const useEstimates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: estimates, isLoading } = useQuery({
    queryKey: ["estimates"],
    queryFn: async () => {
      const { data: estimatesData, error: estimatesError } = await supabase
        .from("estimates")
        .select("*")
        .order("created_at", { ascending: false });

      if (estimatesError) throw estimatesError;

      const estimatesWithItems = await Promise.all(
        (estimatesData || []).map(async (estimate) => {
          const { data: lineItems, error: itemsError } = await supabase
            .from("estimate_line_items")
            .select("*")
            .eq("estimate_id", estimate.id);

          if (itemsError) throw itemsError;

          return {
            ...estimate,
            line_items: lineItems || [],
          };
        })
      );

      return estimatesWithItems;
    },
  });

  const createEstimate = useMutation({
    mutationFn: async (estimate: Estimate) => {
      const { line_items, ...estimateData } = estimate;

      const { data: newEstimate, error: estimateError } = await supabase
        .from("estimates")
        .insert([estimateData])
        .select()
        .single();

      if (estimateError) throw estimateError;

      if (line_items && line_items.length > 0) {
        const lineItemsWithEstimateId = line_items.map((item) => ({
          ...item,
          estimate_id: newEstimate.id,
        }));

        const { error: itemsError } = await supabase
          .from("estimate_line_items")
          .insert(lineItemsWithEstimateId);

        if (itemsError) throw itemsError;
      }

      return newEstimate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
      toast({
        title: "Estimate Created",
        description: "Your estimate has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create estimate.",
        variant: "destructive",
      });
    },
  });

  const updateEstimate = useMutation({
    mutationFn: async ({ id, ...estimate }: Estimate & { id: string }) => {
      const { line_items, ...estimateData } = estimate;

      const { error: estimateError } = await supabase
        .from("estimates")
        .update(estimateData)
        .eq("id", id);

      if (estimateError) throw estimateError;

      await supabase.from("estimate_line_items").delete().eq("estimate_id", id);

      if (line_items && line_items.length > 0) {
        const lineItemsWithEstimateId = line_items.map((item) => ({
          ...item,
          estimate_id: id,
        }));

        const { error: itemsError } = await supabase
          .from("estimate_line_items")
          .insert(lineItemsWithEstimateId);

        if (itemsError) throw itemsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
      toast({
        title: "Estimate Updated",
        description: "Your estimate has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update estimate.",
        variant: "destructive",
      });
    },
  });

  const deleteEstimate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("estimates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
      toast({
        title: "Estimate Deleted",
        description: "The estimate has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete estimate.",
        variant: "destructive",
      });
    },
  });

  return {
    estimates,
    isLoading,
    createEstimate: createEstimate.mutate,
    updateEstimate: updateEstimate.mutate,
    deleteEstimate: deleteEstimate.mutate,
  };
};
