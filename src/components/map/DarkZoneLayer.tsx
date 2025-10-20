import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DarkZone {
  id: string;
  name: string;
  // GeoJSON Polygon coordinates in [lng,lat]
  coordinates: number[][];
  active: boolean;
}

interface DarkZoneLayerProps {
  map: google.maps.Map | null;
  onEnterZone?: (zone: DarkZone) => void;
  onExitZone?: (zone: DarkZone) => void;
}

export const DarkZoneLayer: React.FC<DarkZoneLayerProps> = ({ map, onEnterZone, onExitZone }) => {
  const { toast } = useToast();
  const polygonsRef = useRef<Array<{ zone: DarkZone; poly: google.maps.Polygon }>>([]);
  const insideStateRef = useRef<Map<string, boolean>>(new Map());

  const { data: zones } = useQuery({
    queryKey: ["dark-zones"],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any).from("DarkZones").select("id,name,active,coordinates");
        if (error) throw error;
        return (data as any[]).map((r) => ({
          id: r.id,
          name: r.name || "Dark Zone",
          coordinates: (r.coordinates?.[0] || r.coordinates || []).map((p: any) => [Number(p[0]), Number(p[1])]),
          active: !!r.active,
        })) as DarkZone[];
      } catch {
        // Graceful fallback if table missing
        try {
          const raw = localStorage.getItem("dark_zones");
          const local = raw ? (JSON.parse(raw) as DarkZone[]) : [];
          return local;
        } catch {
          return [] as DarkZone[];
        }
      }
    },
  });

  useEffect(() => {
    if (!map) return;
    // Clear previous
    polygonsRef.current.forEach(({ poly }) => poly.setMap(null));
    polygonsRef.current = [];
    insideStateRef.current.clear();

    (zones || [])
      .filter((z) => z.active && Array.isArray(z.coordinates) && z.coordinates.length >= 3)
      .forEach((zone) => {
        const path = zone.coordinates.map(([lng, lat]) => ({ lat, lng }));
        const poly = new google.maps.Polygon({
          paths: [path],
          strokeColor: "#ff2a2a",
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: "#ff2a2a",
          fillOpacity: 0.08,
        });
        poly.setMap(map);

        // Pulsing border
        let dir = -1;
        let opacity = 0.9;
        const id = window.setInterval(() => {
          opacity += dir * 0.05;
          if (opacity <= 0.4 || opacity >= 0.95) dir *= -1;
          try {
            poly.setOptions({ strokeOpacity: Math.max(0.4, Math.min(0.95, opacity)) });
          } catch {}
        }, 180);
        (poly as any).__pulse = id;

        polygonsRef.current.push({ zone, poly });
      });

    return () => {
      polygonsRef.current.forEach(({ poly }) => {
        try {
          window.clearInterval((poly as any).__pulse);
        } catch {}
        poly.setMap(null);
      });
      polygonsRef.current = [];
    };
  }, [map, zones?.length]);

  useEffect(() => {
    if (!map) return;
    const check = () => {
      const center = map.getCenter?.();
      if (!center) return;
      polygonsRef.current.forEach(({ zone, poly }) => {
        const isInside = google.maps.geometry?.poly?.containsLocation
          ? google.maps.geometry.poly.containsLocation(center, poly)
          : false;
        const prev = insideStateRef.current.get(zone.id) || false;
        if (isInside && !prev) {
          insideStateRef.current.set(zone.id, true);
          toast({ title: "Dark Zone Entered", description: zone.name, variant: "destructive" });
          onEnterZone?.(zone);
          document.body.classList.add("theme-dark-zone");
        } else if (!isInside && prev) {
          insideStateRef.current.set(zone.id, false);
          toast({ title: "Dark Zone Exited", description: zone.name });
          onExitZone?.(zone);
        }
      });
    };
    const id = window.setInterval(check, 1200);
    return () => window.clearInterval(id);
  }, [map]);

  return null;
};
