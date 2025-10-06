import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useKPIData = () => {
  return useQuery({
    queryKey: ["kpi-data"],
    queryFn: async () => {
      // Fetch active jobs count
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, status");

      // Fetch employees count
      const { data: employees } = await supabase
        .from("employees")
        .select("id, status")
        .eq("status", "active");

      const activeJobs = jobs?.filter((j) => 
        j.status === "In Progress" || j.status === "Scheduled"
      ).length || 0;
      
      const crewMembers = employees?.length || 0;

      // Mock data for now - will be connected to real data later
      const totalRevenue = 2400000;
      const fleetUtilization = 87;

      return {
        activeJobs,
        totalRevenue,
        fleetUtilization,
        crewMembers,
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });
};
