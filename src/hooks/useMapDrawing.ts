/// <reference types="@types/google.maps" />
import { useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { emitGamificationEvent } from "@/lib/gamificationClient";

export type DrawingMode = "marker" | "polyline" | "circle" | "rectangle" | "measure" | null;

export const useMapDrawing = (map: google.maps.Map | null) => {
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const currentShapeRef = useRef<google.maps.MVCObject | null>(null);
  const measurementOverlaysRef = useRef<google.maps.Polyline[]>([]);
  const [measurement, setMeasurement] = useState<{ distance?: number; area?: number }>({});

  const initializeDrawingManager = useCallback(() => {
    if (!map || drawingManagerRef.current) return;

    drawingManagerRef.current = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      markerOptions: {
        draggable: true,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#ff8c00",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      },
      polylineOptions: {
        strokeColor: "#ff8c00",
        strokeOpacity: 0.8,
        strokeWeight: 3,
        editable: true,
      },
      circleOptions: {
        fillColor: "#ff8c00",
        fillOpacity: 0.2,
        strokeColor: "#ff8c00",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        editable: true,
      },
      rectangleOptions: {
        fillColor: "#ff8c00",
        fillOpacity: 0.2,
        strokeColor: "#ff8c00",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        editable: true,
      },
    });

    drawingManagerRef.current.setMap(map);

    // Listen for shape completion
    google.maps.event.addListener(
      drawingManagerRef.current,
      "overlaycomplete",
      (event: google.maps.drawing.OverlayCompleteEvent) => {
        currentShapeRef.current = event.overlay;

        // Calculate measurements
        if (event.type === google.maps.drawing.OverlayType.POLYLINE) {
          const path = (event.overlay as google.maps.Polyline).getPath();
          const distance = calculateDistance(path.getArray());
          setMeasurement({ distance });
          try { emitGamificationEvent({ event_type: "map_drawing_saved", metadata: { type: "polyline", distance } }); } catch {}
        } else if (event.type === google.maps.drawing.OverlayType.CIRCLE) {
          const area = calculateArea(event.overlay as google.maps.Circle);
          setMeasurement({ area });
          try { emitGamificationEvent({ event_type: "map_drawing_saved", metadata: { type: "circle", area } }); } catch {}
        } else if (event.type === google.maps.drawing.OverlayType.RECTANGLE) {
          const area = calculateArea(event.overlay as google.maps.Rectangle);
          setMeasurement({ area });
          try { emitGamificationEvent({ event_type: "map_drawing_saved", metadata: { type: "rectangle", area } }); } catch {}
        }
      },
    );
  }, [map]);

  const setDrawingMode = useCallback(
    (mode: DrawingMode) => {
      if (!drawingManagerRef.current) {
        initializeDrawingManager();
      }

      if (!drawingManagerRef.current) return;

      const modeMap: Record<Exclude<DrawingMode, null>, google.maps.drawing.OverlayType | null> = {
        marker: google.maps.drawing.OverlayType.MARKER,
        polyline: google.maps.drawing.OverlayType.POLYLINE,
        circle: google.maps.drawing.OverlayType.CIRCLE,
        rectangle: google.maps.drawing.OverlayType.RECTANGLE,
        measure: google.maps.drawing.OverlayType.POLYLINE,
      };

      drawingManagerRef.current.setDrawingMode(mode ? modeMap[mode] : null);
    },
    [initializeDrawingManager],
  );

  const clearDrawings = useCallback(() => {
    if (currentShapeRef.current) {
      if (
        "setMap" in currentShapeRef.current &&
        typeof currentShapeRef.current.setMap === "function"
      ) {
        currentShapeRef.current.setMap(null);
      }
      currentShapeRef.current = null;
    }

    measurementOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
    measurementOverlaysRef.current = [];
    setMeasurement({});
  }, []);

  const getMeasurementGeoJSON = useCallback((): any | null => {
    const shape = currentShapeRef.current as any;
    if (!shape) return null;
    // Polyline => LineString of [lng,lat]
    if (typeof google !== 'undefined' && shape instanceof google.maps.Polyline) {
      try {
        const path = shape.getPath()?.getArray?.() || [];
        const coords = path.map((p: google.maps.LatLng) => [p.lng(), p.lat()]);
        if (coords.length >= 2) return { type: 'LineString', coordinates: coords };
      } catch {}
    }
    // Circle => center point (area derived from measurement.value elsewhere)
    if (typeof google !== 'undefined' && shape instanceof google.maps.Circle) {
      try {
        const c = shape.getCenter?.();
        if (!c) return null;
        return { type: 'Point', coordinates: [c.lng(), c.lat()] };
      } catch {}
    }
    // Rectangle => center point
    if (typeof google !== 'undefined' && shape instanceof google.maps.Rectangle) {
      try {
        const b = shape.getBounds?.();
        const ne = b?.getNorthEast?.();
        const sw = b?.getSouthWest?.();
        if (!ne || !sw) return null;
        const lat = (ne.lat() + sw.lat()) / 2;
        const lng = (ne.lng() + sw.lng()) / 2;
        return { type: 'Point', coordinates: [lng, lat] };
      } catch {}
    }
    // Marker or unknown => null
    return null;
  }, []);

  const calculateDistance = useCallback((path: google.maps.LatLng[]) => {
    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      totalDistance += google.maps.geometry.spherical.computeDistanceBetween(path[i], path[i + 1]);
    }
    return totalDistance;
  }, []);

  const calculateArea = useCallback((shape: google.maps.Circle | google.maps.Rectangle) => {
    if (shape instanceof google.maps.Circle) {
      const radius = shape.getRadius();
      return Math.PI * radius * radius;
    } else {
      const bounds = shape.getBounds();
      if (!bounds) return 0;
      return google.maps.geometry.spherical.computeArea([
        bounds.getNorthEast(),
        { lat: bounds.getNorthEast().lat(), lng: bounds.getSouthWest().lng() },
        bounds.getSouthWest(),
        { lat: bounds.getSouthWest().lat(), lng: bounds.getNorthEast().lng() },
      ]);
    }
  }, []);

  return {
    initializeDrawingManager,
    setDrawingMode,
    clearDrawings,
    calculateDistance,
    calculateArea,
    measurement,
    getMeasurementGeoJSON,
  };
};
