import React, { useEffect, useState } from "react";
import { useWeatherAlerts } from "@/hooks/useWeatherAlerts";

interface WeatherRadarLayerProps {
  map: google.maps.Map | null;
  opacity: number;
  showAlerts: boolean;
  alertRadius: number;
}

export const WeatherRadarLayer = ({ map, opacity, showAlerts, alertRadius }: WeatherRadarLayerProps) => {
  const { data: alerts } = useWeatherAlerts();
  const [circles, setCircles] = useState<google.maps.Circle[]>([]);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!map || !showAlerts || !alerts) return;

    // Clear existing circles and markers
    circles.forEach((circle) => circle.setMap(null));
    markers.forEach((marker) => marker.setMap(null));

    const newCircles: google.maps.Circle[] = [];
    const newMarkers: google.maps.Marker[] = [];

    alerts.forEach((alert) => {
      // Create alert circle
      const circle = new google.maps.Circle({
        map,
        center: alert.location,
        radius: alertRadius * 1609.34, // Convert miles to meters
        fillColor: getSeverityColor(alert.severity),
        fillOpacity: opacity / 200,
        strokeColor: getSeverityColor(alert.severity),
        strokeOpacity: opacity / 100,
        strokeWeight: 2,
      });

      // Create alert marker
      const marker = new google.maps.Marker({
        map,
        position: alert.location,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: getSeverityColor(alert.severity),
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: alert.message,
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold text-sm mb-1">${alert.type.toUpperCase()} ALERT</h3>
            <p class="text-xs mb-1">${alert.message}</p>
            <p class="text-xs text-muted-foreground">Severity: ${alert.severity.toUpperCase()}</p>
            <p class="text-xs text-muted-foreground">Radius: ${alert.radius} miles</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      newCircles.push(circle);
      newMarkers.push(marker);
    });

    setCircles(newCircles);
    setMarkers(newMarkers);

    return () => {
      newCircles.forEach((circle) => circle.setMap(null));
      newMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [map, alerts, showAlerts, opacity, alertRadius]);

  return null;
};

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case "extreme":
      return "#ff0000";
    case "high":
      return "#ff6600";
    case "medium":
      return "#ffcc00";
    case "low":
      return "#ffff00";
    default:
      return "#ffff00";
  }
};
