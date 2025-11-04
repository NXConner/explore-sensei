import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScheduleItem {
  id: string;
  job_name: string;
  start_time: string;
  end_time: string;
  assigned_to: string;
  status: string;
  progress?: number;
  estimated_duration?: number;
}

export const useSchedule = () => {
  return useQuery({
    queryKey: ["schedule"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data as ScheduleItem[];
    },
  });
};
