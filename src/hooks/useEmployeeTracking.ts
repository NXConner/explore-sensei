import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EmployeeLocation {
  id: string;
  employee_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  activity_type?: string;
  battery_level?: number;
  timestamp: string;
  employees?: {
    first_name: string;
    last_name: string;
    role?: string;
  };
}

export interface DailyActivitySummary {
  id: string;
  employee_id: string;
  date: string;
  total_distance_km: number;
  total_time_minutes: number;
  first_location_time: string;
  last_location_time: string;
  locations_count: number;
  path_geojson?: any;
  employees?: {
    first_name: string;
    last_name: string;
  };
}

export const useEmployeeTracking = (date?: Date) => {
  const [locations, setLocations] = useState<EmployeeLocation[]>([]);
  const [summaries, setSummaries] = useState<DailyActivitySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployeeLocations();
    fetchDailySummaries();

    // Subscribe to real-time location updates
    const channel = supabase
      .channel('employee-locations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'employee_locations'
        },
        (payload) => {
          fetchEmployeeLocations(); // Refresh locations
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [date]);

  const fetchEmployeeLocations = async () => {
    try {
      let query = (supabase as any)
        .from("employee_locations")
        .select("*")
        .order("timestamp", { ascending: false });

      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        query = query.gte('timestamp', `${dateStr}T00:00:00`)
                     .lte('timestamp', `${dateStr}T23:59:59`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLocations(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch locations: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailySummaries = async () => {
    try {
      let query = (supabase as any)
        .from("daily_activity_summary")
        .select("*")
        .order("date", { ascending: false });

      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        query = query.eq('date', dateStr);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSummaries(data || []);
    } catch (error: any) {
      console.error("Failed to fetch summaries:", error);
    }
  };

  const trackLocation = async (employeeId: string, location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
    activity_type?: string;
    battery_level?: number;
  }) => {
    try {
      const { error } = await (supabase as any)
        .from("employee_locations")
        .insert({
          employee_id: employeeId,
          ...location,
        });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to track location: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const generateDailySummary = async (employeeId: string, date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const { error } = await (supabase as any).rpc('generate_daily_summary', {
        p_employee_id: employeeId,
        p_date: dateStr,
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Daily summary generated",
      });
      
      fetchDailySummaries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to generate summary: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Get latest location for each employee
  const getLatestLocations = () => {
    const latestByEmployee = new Map<string, EmployeeLocation>();
    
    locations.forEach(loc => {
      const existing = latestByEmployee.get(loc.employee_id);
      if (!existing || new Date(loc.timestamp) > new Date(existing.timestamp)) {
        latestByEmployee.set(loc.employee_id, loc);
      }
    });
    
    return Array.from(latestByEmployee.values());
  };

  return {
    locations,
    summaries,
    isLoading,
    trackLocation,
    generateDailySummary,
    getLatestLocations,
    refresh: fetchEmployeeLocations,
  };
};
