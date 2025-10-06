import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LogActivityParams {
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: any;
}

export const useActivityLog = () => {
  const logActivity = useMutation({
    mutationFn: async ({ action, resource_type, resource_id, details }: LogActivityParams) => {
      const { error } = await supabase.from("activity_logs" as any).insert({
        action,
        resource_type,
        resource_id,
        details: details || {},
      });

      if (error) throw error;
    },
  });

  return {
    logActivity: logActivity.mutate,
  };
};
