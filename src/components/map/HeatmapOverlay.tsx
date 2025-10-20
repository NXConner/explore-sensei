import React, { useEffect } from "react";

interface HeatmapOverlayProps {
  map: google.maps.Map | null;
  enabled: boolean;
  points: Array<{ lat: number; lng: number; weight?: number }>;
}

export const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({ map, enabled, points }) => {
  useEffect(() => {
    if (!map || !enabled || !google.maps.visualization) return;
    const data = points.map((p) => ({ location: new google.maps.LatLng(p.lat, p.lng), weight: p.weight ?? 1 }));
    const heatmap = new google.maps.visualization.HeatmapLayer({ data, dissipating: true, radius: 24, opacity: 0.6 });
    heatmap.setMap(map);
    return () => heatmap.setMap(null);
  }, [map, enabled, points.length]);
  return null;
}
