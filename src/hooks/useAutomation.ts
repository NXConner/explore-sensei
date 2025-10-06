import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config: any;
  action_type: string;
  action_config: any;
  active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useAutomation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch automation rules
  const { data: rules, isLoading } = useQuery({
    queryKey: ["automation-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_rules" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as AutomationRule[];
    },
  });

  // Create rule mutation
  const createRule = useMutation({
    mutationFn: async (rule: Partial<AutomationRule>) => {
      const { error } = await supabase
        .from("automation_rules" as any)
        .insert(rule);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
      toast({
        title: "Success",
        description: "Automation rule created successfully",
      });
    },
  });

  // Update rule mutation
  const updateRule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AutomationRule> & { id: string }) => {
      const { error } = await supabase
        .from("automation_rules" as any)
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
      toast({
        title: "Success",
        description: "Automation rule updated successfully",
      });
    },
  });

  // Delete rule mutation
  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("automation_rules" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
      toast({
        title: "Success",
        description: "Automation rule deleted successfully",
      });
    },
  });

  // Toggle rule active status
  const toggleRule = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("automation_rules" as any)
        .update({ active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
    },
  });

  return {
    rules,
    isLoading,
    createRule: createRule.mutate,
    updateRule: updateRule.mutate,
    deleteRule: deleteRule.mutate,
    toggleRule: toggleRule.mutate,
  };
};
