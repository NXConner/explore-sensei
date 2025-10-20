import { useQuery } from "@tanstack/react-query";
import { getOpenWeatherApiKey } from "@/config/env";

interface OpenWeatherCurrent {
  temp: number; // F
  humidity: number; // %
}

interface OpenWeatherResult {
  current?: OpenWeatherCurrent;
  precipChance?: number; // %
}

export function useOpenWeather(lat?: number, lon?: number) {
  return useQuery<OpenWeatherResult>({
    queryKey: ["openweather", lat, lon],
    enabled: !!lat && !!lon,
    queryFn: async () => {
      if (!lat || !lon) return {};
      const key = getOpenWeatherApiKey();
      if (!key) return {};
      // One Call API 3.0
      const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${key}&units=imperial`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("OpenWeather request failed");
      const data = await res.json();
      const current: OpenWeatherCurrent = {
        temp: Number(data?.current?.temp ?? 72),
        humidity: Number(data?.current?.humidity ?? 45),
      };
      // Take highest precipitation probability in next few hours
      const hourly = Array.isArray(data?.hourly) ? data.hourly.slice(0, 6) : [];
      const precipChance = Math.round(
        Math.max(
          0,
          Math.min(
            100,
            hourly.reduce((max: number, h: any) => Math.max(max, Number(h?.pop ?? 0) * 100), 0),
          ),
        ),
      );
      return { current, precipChance };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
