import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface JobSite {
  id: string;
  name: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  progress: number;
  client_name?: string;
  start_date?: string;
  end_date?: string;
}

export const useJobSites = () => {
  return useQuery({
    queryKey: ["job-sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          job_name,
          status,
          latitude,
          longitude,
          progress,
          start_date,
          end_date,
          clients (
            name
          )
        `)
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (error) throw error;

      return (data || []).map((job: any) => ({
        id: job.id,
        name: job.job_name || "Unnamed Job",
        status: job.status || "unknown",
        latitude: job.latitude,
        longitude: job.longitude,
        progress: job.progress || 0,
        client_name: job.clients?.name,
        start_date: job.start_date,
        end_date: job.end_date,
      })) as JobSite[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
