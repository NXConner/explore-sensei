import React, { useEffect, useState } from "react";
import { useWeatherAlerts } from "@/hooks/useWeatherAlerts";
import { logger } from "@/lib/monitoring";
import { useWeatherAlertLocations } from "@/hooks/useWeatherAlertLocations";

interface WeatherRadarLayerProps {
  map: google.maps.Map | null;
  opacity: number;
  showAlerts: boolean;
  alertRadius: number;
}

export const WeatherRadarLayer = ({
  map,
  opacity,
  showAlerts,
  alertRadius,
}: WeatherRadarLayerProps) => {
  const { data: alerts } = useWeatherAlerts();
  const [circles, setCircles] = useState<google.maps.Circle[]>([]);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const { locations } = useWeatherAlertLocations();

  useEffect(() => {
    if (!map || !showAlerts) return;

    // Clear existing circles and markers
    circles.forEach((circle) => circle.setMap(null));
    markers.forEach((marker) => marker.setMap(null));

    const newCircles: google.maps.Circle[] = [];
    const newMarkers: google.maps.Marker[] = [];

    const allPoints = [
      // Current alerts
      ...(alerts || []).map((a) => ({
        position: a.location,
        severity: a.severity,
        message: a.message,
        radius: a.radius,
        type: a.type,
      })),
      // Custom saved locations with selected alert radius
      ...(locations || []).map((l) => ({
        position: { lat: l.lat, lng: l.lng },
        severity: "medium" as const,
        message: l.name,
        radius: alertRadius,
        type: "custom" as const,
      })),
    ];

    allPoints.forEach((alert) => {
      // Create alert circle
      const circle = new google.maps.Circle({
        map,
        center: alert.position,
        radius: (alert.radius ?? alertRadius) * 1609.34, // miles to meters
        fillColor: getSeverityColor(alert.severity),
        fillOpacity: opacity / 200,
        strokeColor: getSeverityColor(alert.severity),
        strokeOpacity: opacity / 100,
        strokeWeight: 2,
      });

      // Create alert marker
      const marker = new google.maps.Marker({
        map,
        position: alert.position,
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
            <h3 class="font-bold text-sm mb-1">${String(alert.type).toUpperCase()} ALERT</h3>
            <p class="text-xs mb-1">${alert.message}</p>
            <p class="text-xs text-muted-foreground">Severity: ${String(alert.severity).toUpperCase()}</p>
            <p class="text-xs text-muted-foreground">Radius: ${alert.radius} miles</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        try { infoWindow.open(map, marker); } catch (err) { logger.warn('Failed to open alert info window', { err }); }
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
