import { useQuery } from "@tanstack/react-query";

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
      // Mock weather alerts - integrate with real weather API
      return [
        {
          id: "alert-1",
          type: "storm",
          severity: "high",
          message: "Severe thunderstorm warning in effect",
          location: { lat: 40.7128, lng: -74.006 },
          radius: 15,
          expires: new Date(Date.now() + 3600000),
        },
        {
          id: "alert-2",
          type: "rain",
          severity: "medium",
          message: "Heavy rain expected",
          location: { lat: 40.758, lng: -73.9855 },
          radius: 10,
          expires: new Date(Date.now() + 7200000),
        },
      ];
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};
