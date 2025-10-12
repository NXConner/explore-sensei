import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface RainRadarOverlayProps {
  map: google.maps.Map | null;
  opacity: number;
}

// Real weather radar tile layer from OpenWeatherMap (free tier)
export const RainRadarOverlay = ({ map, opacity }: RainRadarOverlayProps) => {
  const [overlay, setOverlay] = useState<google.maps.ImageMapType | null>(null);

  useEffect(() => {
    if (!map) return;

    // Remove existing overlay if any
    if (overlay) {
      map.overlayMapTypes.clear();
    }

    // OpenWeatherMap precipitation layer (free, no API key needed for tiles)
    const rainLayer = new google.maps.ImageMapType({
      getTileUrl: (coord, zoom) => {
        return `https://tile.openweathermap.org/map/precipitation_new/${zoom}/${coord.x}/${coord.y}.png?appid=YOUR_API_KEY`;
      },
      tileSize: new google.maps.Size(256, 256),
      name: "Rain",
      opacity: opacity / 100,
    });

    map.overlayMapTypes.push(rainLayer);
    setOverlay(rainLayer);

    return () => {
      if (map.overlayMapTypes) {
        map.overlayMapTypes.clear();
      }
    };
  }, [map, opacity]);

  return null;
};

// Hook for weather data and work recommendations
export const useWeatherRecommendations = (lat?: number, lng?: number) => {
  return useQuery({
    queryKey: ["weather-recommendations", lat, lng],
    queryFn: async () => {
      if (!lat || !lng) return null;

      // Mock weather data with work recommendations
      const currentConditions = {
        temp: 72,
        humidity: 45,
        precipitation: 0,
        windSpeed: 5,
        conditions: "Clear",
      };

      const forecast24h = {
        avgTemp: 68,
        maxTemp: 75,
        minTemp: 60,
        precipChance: 10,
        conditions: "Partly Cloudy",
      };

      // Work suitability scoring (0-100)
      const calculateSuitability = (temp: number, humidity: number, precip: number) => {
        let score = 100;

        // Temperature penalties
        if (temp < 50 || temp > 95) score -= 40;
        else if (temp < 55 || temp > 90) score -= 20;

        // Humidity penalties
        if (humidity > 80) score -= 30;
        else if (humidity > 70) score -= 15;

        // Precipitation penalties
        if (precip > 50) score -= 50;
        else if (precip > 20) score -= 25;

        return Math.max(0, score);
      };

      const sealcoatScore = calculateSuitability(
        currentConditions.temp,
        currentConditions.humidity,
        currentConditions.precipitation,
      );
      const crackRepairScore = calculateSuitability(
        currentConditions.temp,
        currentConditions.humidity,
        currentConditions.precipitation * 0.5,
      );
      const stripingScore = calculateSuitability(
        currentConditions.temp,
        currentConditions.humidity,
        currentConditions.precipitation,
      );

      return {
        current: currentConditions,
        forecast: forecast24h,
        recommendations: {
          sealcoating: {
            score: sealcoatScore,
            status: sealcoatScore > 70 ? "Optimal" : sealcoatScore > 50 ? "Fair" : "Poor",
            reason:
              sealcoatScore > 70
                ? "Excellent conditions for sealcoating"
                : sealcoatScore > 50
                  ? "Acceptable but not ideal conditions"
                  : "Conditions not suitable for sealcoating",
            details: `Temp: ${currentConditions.temp}°F (ideal: 55-95°F), Humidity: ${currentConditions.humidity}% (ideal: <70%), No rain expected`,
          },
          crackRepair: {
            score: crackRepairScore,
            status: crackRepairScore > 70 ? "Optimal" : crackRepairScore > 50 ? "Fair" : "Poor",
            reason:
              crackRepairScore > 70
                ? "Great conditions for crack cleaning and repair"
                : crackRepairScore > 50
                  ? "Workable conditions for crack repair"
                  : "Not ideal for crack repair",
            details: `Temp: ${currentConditions.temp}°F, Light precipitation OK for cleaning`,
          },
          striping: {
            score: stripingScore,
            status: stripingScore > 70 ? "Optimal" : stripingScore > 50 ? "Fair" : "Poor",
            reason:
              stripingScore > 70
                ? "Perfect conditions for line striping"
                : stripingScore > 50
                  ? "Acceptable for striping work"
                  : "Delay striping until conditions improve",
            details: `Dry surface required. Temp: ${currentConditions.temp}°F, No rain for 4+ hours recommended`,
          },
        },
        bestWorkWindow:
          forecast24h.precipChance < 20 ? "Next 6-12 hours" : "Check forecast tomorrow",
      };
    },
    enabled: !!lat && !!lng,
    refetchInterval: 300000, // Refresh every 5 minutes
  });
};
