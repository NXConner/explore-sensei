import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/monitoring";

interface WeatherAlert {
  id: string;
  type: "storm" | "rain" | "wind" | "tornado";
  severity: "low" | "medium" | "high" | "extreme";
  message: string;
  location: { lat: number; lng: number };
  radius: number; // in miles
  expires: Date;
}

export const useWeatherAlerts = () => {
  return useQuery({
    queryKey: ["weather-alerts"],
    queryFn: async (): Promise<WeatherAlert[]> => {
      try {
        const { data, error } = await supabase
          .from("weather_alerts")
          .select("id, type, severity, title, message, location, radius, end_time")
          .gte("end_time", new Date().toISOString())
          .order("created_at", { ascending: false });

        if (error) throw error;
        const alerts: WeatherAlert[] = (data || []).map((row: any) => ({
          id: row.id,
          type: (row.type || 'storm') as WeatherAlert["type"],
          severity: (row.severity || 'medium') as WeatherAlert["severity"],
          message: row.title ? `${row.title}: ${row.message}` : row.message,
          location: { lat: row.location?.lat ?? 0, lng: row.location?.lng ?? 0 },
          radius: Number(row.radius ?? 10),
          expires: new Date(row.end_time || Date.now())
        }));
        return alerts;
      } catch (err) {
        logger.warn('weather_alerts query failed', { error: err });
        return [];
      }
    },
    refetchInterval: 300000,
  });
};
