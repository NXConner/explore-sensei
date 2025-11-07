import React, { useEffect, useRef, useState } from "react";
import { useMap } from "@/components/map/MapContext";

type MiniMapProps = {
  variant?: "overlay" | "embedded";
  className?: string;
};

export const MiniMap: React.FC<MiniMapProps> = ({ variant = "overlay", className }) => {
  const { map } = useMap();
  const miniMapRef = useRef<HTMLDivElement>(null);
  const [miniMapInstance, setMiniMapInstance] = useState<google.maps.Map | null>(null);
  const [viewportRect, setViewportRect] = useState<google.maps.Rectangle | null>(null);

  useEffect(() => {
    if (!miniMapRef.current || !map || miniMapInstance) return;

    // Create mini map instance
    const mini = new google.maps.Map(miniMapRef.current, {
      center: map.getCenter(),
      zoom: Math.max(1, (map.getZoom() || 15) - 3),
      disableDefaultUI: true,
      gestureHandling: "greedy",
      mapTypeId: map.getMapTypeId(),
    });

    setMiniMapInstance(mini);

    // Create viewport indicator rectangle
    const rect = new google.maps.Rectangle({
      map: mini,
      fillColor: "#ff8c00",
      fillOpacity: 0.2,
      strokeColor: "#ff8c00",
      strokeWeight: 2,
      clickable: false,
    });
    setViewportRect(rect);

    return () => {
      rect.setMap(null);
    };
  }, [map, miniMapRef.current]);

  useEffect(() => {
    if (!map || !miniMapInstance || !viewportRect) return;

    const updateMiniMap = () => {
      const bounds = map.getBounds();
      if (!bounds) return;

      viewportRect.setBounds(bounds);
      miniMapInstance.setCenter(map.getCenter()!);
      miniMapInstance.setZoom(Math.max(1, (map.getZoom() || 15) - 3));
    };

    const listener = map.addListener("bounds_changed", updateMiniMap);
    updateMiniMap();

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, miniMapInstance, viewportRect]);

  if (variant === "embedded") {
    return (
      <div className={"w-full rounded border border-primary/30 bg-background/60 relative overflow-hidden " + (className || "h-48")}
        aria-label="Mini Map">
        <div ref={miniMapRef} className="w-full h-full" />
        <div className="absolute bottom-1 left-1 text-[10px] bg-background/80 px-1 rounded text-muted-foreground">
          Mini Map
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-12 top-16 w-48 h-48 z-[980] hud-element border-primary/30 overflow-hidden animate-hud-fade-in transition-all duration-300 hover:border-primary/50 hover:shadow-hud-glow" aria-label="Mini Map">
      <div ref={miniMapRef} className="w-full h-full" />
      <div className="absolute bottom-1 left-1 text-[10px] bg-background/80 px-1 rounded text-muted-foreground font-mono">
        TACTICAL OVERVIEW
      </div>
      <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
    </div>
  );
};
