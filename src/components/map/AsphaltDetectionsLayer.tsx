import React, { useEffect, useRef, useState } from "react";
import { listRecentDetections, subscribeDetections } from "@/lib/asphaltDetections";

interface Props { map: google.maps.Map | null }

export const AsphaltDetectionsLayer: React.FC<Props> = ({ map }) => {
  const [detections, setDetections] = useState<any[]>([]);
  const overlaysRef = useRef<Array<google.maps.Polygon>>([]);

  useEffect(() => {
    if (!map) return;

    const render = () => {
      // clear
      overlaysRef.current.forEach((p) => p.setMap(null));
      overlaysRef.current = [];

      detections.forEach((row) => {
        const geoAreas = row?.analysis?.geo_areas as Array<any> | undefined;
        if (!geoAreas) return;
        geoAreas.forEach((ga) => {
          const coords = ga?.polygon?.coordinates?.[0];
          if (!Array.isArray(coords)) return;
          const path = coords.map((c: number[]) => ({ lat: c[1], lng: c[0] }));
          const condition = String(ga?.condition || row?.condition || "unknown").toLowerCase();
          const color =
            condition === "excellent" ? "#10b981" :
            condition === "good" ? "#3b82f6" :
            condition === "fair" ? "#f59e0b" :
            condition === "poor" ? "#ef4444" : "#6b7280";

          const polygon = new google.maps.Polygon({
            paths: path,
            strokeColor: color,
            strokeOpacity: 0.9,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.2,
            map,
          });
          overlaysRef.current.push(polygon);
        });
      });
    };

    render();
  }, [map, detections]);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    (async () => {
      try {
        const rows = await listRecentDetections(100);
        setDetections(rows || []);
      } catch {}
      unsub = subscribeDetections((row) => {
        setDetections((prev) => [row, ...prev]);
      });
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  useEffect(() => {
    return () => {
      overlaysRef.current.forEach((p) => p.setMap(null));
      overlaysRef.current = [];
    };
  }, []);

  return null;
};
