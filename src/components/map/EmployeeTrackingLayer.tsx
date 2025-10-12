import { useEffect, useRef } from "react";
import { useEmployeeTracking } from "@/hooks/useEmployeeTracking";
import { User, Navigation } from "lucide-react";

interface EmployeeTrackingLayerProps {
  map: google.maps.Map | null;
}

export const EmployeeTrackingLayer = ({ map }: EmployeeTrackingLayerProps) => {
  const { latestLocations } = useEmployeeTracking(undefined, { subscribeRealtime: false });
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowsRef = useRef<Map<string, google.maps.InfoWindow>>(new Map());

  useEffect(() => {
    if (!map) return;

    const updateEmployeeMarkers = () => {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      infoWindowsRef.current.clear();

      latestLocations.forEach((location) => {
        const empName =
          `${location.employees?.first_name || ""} ${location.employees?.last_name || ""}`.trim();
        const timeSinceUpdate = Date.now() - new Date(location.timestamp).getTime();
        const isRecent = timeSinceUpdate < 5 * 60 * 1000; // Last 5 minutes

        // Different colors based on activity
        let fillColor = "#10b981"; // Green for recent/active
        if (!isRecent) fillColor = "#6b7280"; // Gray for stale
        if (location.activity_type === "driving") fillColor = "#3b82f6"; // Blue for driving
        if (location.activity_type === "stationary") fillColor = "#f59e0b"; // Amber for stopped

        const marker = new google.maps.Marker({
          position: {
            lat: Number(location.latitude),
            lng: Number(location.longitude),
          },
          map,
          title: empName,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor,
            fillOpacity: 0.9,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          label: {
            text: empName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .substring(0, 2),
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: "bold",
          },
          zIndex: 1000,
        });

        // Create info window content
        const minutesAgo = Math.floor(timeSinceUpdate / 60000);
        const hoursAgo = Math.floor(minutesAgo / 60);
        const timeAgoStr =
          hoursAgo > 0
            ? `${hoursAgo}h ${minutesAgo % 60}m ago`
            : minutesAgo > 0
              ? `${minutesAgo}m ago`
              : "Just now";

        const infoContent = `
          <div style="color: #000; padding: 12px; min-width: 200px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: ${fillColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                ${empName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)}
              </div>
              <div>
                <strong style="font-size: 14px;">${empName}</strong><br/>
                <small style="color: #666;">${location.employees?.role || "Employee"}</small>
              </div>
            </div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; font-size: 12px;">
              <div style="margin-bottom: 4px;">
                <strong>Last Update:</strong> ${timeAgoStr}
              </div>
              ${
                location.speed
                  ? `
                <div style="margin-bottom: 4px;">
                  <strong>Speed:</strong> ${location.speed.toFixed(1)} km/h
                </div>
              `
                  : ""
              }
              ${
                location.activity_type
                  ? `
                <div style="margin-bottom: 4px;">
                  <strong>Activity:</strong> <span style="text-transform: capitalize;">${location.activity_type}</span>
                </div>
              `
                  : ""
              }
              ${
                location.battery_level !== null && location.battery_level !== undefined
                  ? `
                <div style="margin-bottom: 4px;">
                  <strong>Battery:</strong> ${location.battery_level}%
                </div>
              `
                  : ""
              }
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; color: #666; font-size: 11px;">
                ${Number(location.latitude).toFixed(6)}, ${Number(location.longitude).toFixed(6)}
              </div>
            </div>
          </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
          content: infoContent,
        });

        marker.addListener("click", () => {
          // Close all other info windows
          infoWindowsRef.current.forEach((iw) => iw.close());
          infoWindow.open(map, marker);
        });

        infoWindowsRef.current.set(location.employee_id, infoWindow);
        markersRef.current.push(marker);
      });
    };

    // Update markers immediately
    updateEmployeeMarkers();

    // Update markers every 30 seconds
    const interval = setInterval(updateEmployeeMarkers, 30000);

    return () => {
      clearInterval(interval);
      markersRef.current.forEach((marker) => marker.setMap(null));
      infoWindowsRef.current.clear();
    };
  }, [map, latestLocations]);

  return null;
};
