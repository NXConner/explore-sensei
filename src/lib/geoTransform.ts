/**
 * Web Mercator helpers to convert between image pixel coordinates (from a Google Static Map)
 * and geographic coordinates (lat/lng) given center, zoom, image size, and scale.
 *
 * Assumptions:
 * - Google Static Maps uses Web Mercator. The provided `zoom` is standard slippy zoom.
 * - The `scale` parameter multiplies pixel density (1 or 2). We treat pixel offsets in
 *   world space as offset/scale.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

const TILE_SIZE = 256;

function latToRad(lat: number): number {
  return (lat * Math.PI) / 180;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function mercatorYFromLat(lat: number): number {
  const siny = Math.sin(latToRad(lat));
  // Truncate to within allowed range
  const clamped = Math.min(Math.max(siny, -0.9999), 0.9999);
  return 0.5 - (Math.log((1 + clamped) / (1 - clamped)) / (4 * Math.PI));
}

function latFromMercatorY(y: number): number {
  const n = Math.PI - 2 * Math.PI * y;
  return radToDeg(Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
}

export function projectLatLngToWorld(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const scale = 1 << zoom; // 2^zoom
  const worldX = ((lng + 180) / 360) * TILE_SIZE * scale;
  const worldY = mercatorYFromLat(lat) * TILE_SIZE * scale;
  return { x: worldX, y: worldY };
}

export function unprojectWorldToLatLng(x: number, y: number, zoom: number): LatLng {
  const scale = 1 << zoom; // 2^zoom
  const lng = (x / (TILE_SIZE * scale)) * 360 - 180;
  const mercY = y / (TILE_SIZE * scale);
  const lat = latFromMercatorY(mercY);
  return { lat, lng };
}

export interface StaticMapContext {
  center: LatLng;
  zoom: number;
  width: number; // pixels
  height: number; // pixels
  scale: number; // 1 or 2
}

/**
 * Converts an array of polygon points from image pixel coordinates to lat/lng using the static map context.
 *
 * imagePoints: [{x, y}] in pixel space (0..width, 0..height) where (width/2, height/2) is the center.
 * Returns array of {lat, lng} for each input point.
 */
export function imagePixelsToLatLng(
  imagePoints: Array<{ x: number; y: number }>,
  ctx: StaticMapContext,
): LatLng[] {
  const { center, zoom, width, height, scale } = ctx;
  const centerWorld = projectLatLngToWorld(center.lat, center.lng, zoom);

  const pxToWorld = (dx: number, dy: number) => {
    // Adjust by scale since Google Static Maps increases pixel density
    const worldX = centerWorld.x + dx / scale;
    const worldY = centerWorld.y + dy / scale;
    return { worldX, worldY };
  };

  return imagePoints.map((p) => {
    const dx = p.x - width / 2;
    const dy = p.y - height / 2;
    const { worldX, worldY } = pxToWorld(dx, dy);
    return unprojectWorldToLatLng(worldX, worldY, zoom);
  });
}

/**
 * Batch converts multiple asphalt area polygons (pixel space) to lat/lng polygons.
 */
export function areasPixelsToLatLng(
  areas: Array<{ id: string; coordinates: Array<{ x: number; y: number }>; area_sqft: number; condition: string }>,
  ctx: StaticMapContext,
) {
  return areas.map((area) => ({
    id: area.id,
    coordinates: imagePixelsToLatLng(area.coordinates, ctx),
    area_sqft: area.area_sqft,
    condition: area.condition,
  }));
}
