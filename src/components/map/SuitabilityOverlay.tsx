import React, { useEffect } from "react";

interface SuitabilityOverlayProps {
  map: google.maps.Map | null;
  enabled: boolean;
  tempF?: number;
  humidity?: number;
  precipChance?: number; // percent
  thresholds?: { minTempF?: number; maxTempF?: number; maxHumidity?: number; maxPrecipChance?: number };
}

export const SuitabilityOverlay: React.FC<SuitabilityOverlayProps> = ({ map, enabled, tempF = 72, humidity = 45, precipChance = 10, thresholds }) => {
  useEffect(() => {
    if (!map || !enabled) return;

    const zoom = map.getZoom?.() || 12;
    const tileSize = 256;
    const opacity = 0.15;

    const layer = new google.maps.ImageMapType({
      getTileUrl: (coord, z) => {
        // synthetic overlay based on params and zoom — returning a 1x1 transparent PNG via data URI is fine
        // We tint with red when unsuitable, greenish when optimal
        const minT = thresholds?.minTempF ?? 55;
        const maxT = thresholds?.maxTempF ?? 95;
        const maxH = thresholds?.maxHumidity ?? 70;
        const maxP = thresholds?.maxPrecipChance ?? 20;
        const unsuitable = tempF < minT || tempF > maxT || humidity > maxH || precipChance > maxP;
        const color = unsuitable ? "255,0,0" : "0,255,128";
        const alpha = unsuitable ? 0.25 : 0.12;
        const svg = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${tileSize}' height='${tileSize}'>\
 <rect width='100%' height='100%' fill='rgba(${color},${alpha})'/>\
 <path d='M0 0 L${tileSize} ${tileSize} M${tileSize} 0 L0 ${tileSize}' stroke='rgba(${color},${alpha*0.5})' stroke-width='1'/>\
</svg>`);
        return `data:image/svg+xml;charset=UTF-8,${svg}`;
      },
      tileSize: new google.maps.Size(tileSize, tileSize),
      name: "Suitability",
      opacity: opacity,
      minZoom: 5,
      maxZoom: 20,
    });

    map.overlayMapTypes.push(layer);

    return () => {
      try { map.overlayMapTypes.removeAt(map.overlayMapTypes.getLength() - 1); } catch {}
    };
  }, [map, enabled, tempF, humidity, precipChance]);

  return null;
}
