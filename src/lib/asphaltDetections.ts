import { supabase } from "@/integrations/supabase/client";
import type { StaticMapContext } from "./geoTransform";
import { areasPixelsToLatLng } from "./geoTransform";

export interface PixelPoint { x: number; y: number }
export interface PixelArea { id: string; coordinates: PixelPoint[]; area_sqft: number; condition: string }

export interface DetectionAnalysis {
  condition?: string;
  confidence_score?: number;
  area_sqft?: number;
  area_sqm?: number;
  detected_issues?: any[];
  recommendations?: string[];
  priority?: string | number;
  estimated_repair_cost?: string | number | null;
  ai_notes?: string;
  asphalt_areas?: PixelArea[];
}

export interface SaveDetectionInput {
  source: "upload" | "map_view";
  imageWidth?: number;
  imageHeight?: number;
  mapLat?: number;
  mapLng?: number;
  mapZoom?: number;
  roi?: any;
  analysis: DetectionAnalysis;
  staticMapCtx?: StaticMapContext; // Required for converting pixel coordinates to lat/lng polygons
}

export async function saveDetection(input: SaveDetectionInput) {
  const { source, imageWidth, imageHeight, mapLat, mapLng, mapZoom, roi, analysis, staticMapCtx } = input;

  let geoAreas: any[] | null = null;
  if (analysis.asphalt_areas && analysis.asphalt_areas.length > 0 && staticMapCtx) {
    const converted = areasPixelsToLatLng(analysis.asphalt_areas, staticMapCtx);
    // Convert to GeoJSON MultiPolygon (each area -> polygon of [lng,lat])
    geoAreas = converted.map((a) => ({
      id: a.id,
      condition: a.condition,
      area_sqft: a.area_sqft,
      polygon: {
        type: "Polygon",
        coordinates: [a.coordinates.map((p) => [p.lng, p.lat])],
      },
    }));
  }

  const record = {
    source,
    image_width: imageWidth ?? null,
    image_height: imageHeight ?? null,
    map_lat: mapLat ?? null,
    map_lng: mapLng ?? null,
    map_zoom: mapZoom ?? null,
    roi: roi ?? null,
    condition: analysis.condition ?? null,
    confidence_score: typeof analysis.confidence_score === "number" ? analysis.confidence_score : null,
    area_sqft: typeof analysis.area_sqft === "number" ? analysis.area_sqft : null,
    area_sqm: typeof analysis.area_sqm === "number" ? analysis.area_sqm : null,
    priority: typeof analysis.priority === "string" ? analysis.priority : String(analysis.priority ?? "") || null,
    estimated_repair_cost: analysis.estimated_repair_cost ?? null,
    ai_notes: analysis.ai_notes ?? null,
    analysis: {
      ...analysis,
      geo_areas: geoAreas ?? undefined,
    },
  };

  const { data, error } = await supabase.from("ai_asphalt_detections").insert(record).select("*").single();
  if (error) throw error;
  return data;
}

export async function listRecentDetections(limit = 25) {
  const { data, error } = await supabase
    .from("ai_asphalt_detections")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export function subscribeDetections(onInsert: (row: any) => void) {
  const channel = supabase
    .channel("ai_asphalt_detections_rt")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "ai_asphalt_detections" },
      (payload) => {
        onInsert(payload.new);
      },
    )
    .subscribe();
  return () => {
    try { supabase.removeChannel(channel); } catch {}
  };
}
