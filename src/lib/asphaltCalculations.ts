/**
 * Utility functions for asphalt area calculations and coordinate transformations
 */

export interface Point {
  x: number;
  y: number;
}

export interface AsphaltArea {
  id: string;
  coordinates: Point[];
  area_sqft: number;
  condition: string;
}

/**
 * Calculate the area of a polygon using the shoelace formula
 */
export function calculatePolygonArea(coordinates: Point[]): number {
  if (coordinates.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const j = (i + 1) % coordinates.length;
    area += coordinates[i].x * coordinates[j].y;
    area -= coordinates[j].x * coordinates[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Convert pixel area to square feet based on image scale
 * This is a simplified conversion - in production, you'd want to calibrate
 * this based on actual image scale and reference measurements
 */
export function pixelAreaToSqFt(pixelArea: number, scaleFactor: number = 0.01): number {
  return pixelArea * scaleFactor;
}

/**
 * Convert square feet to square meters
 */
export function sqFtToSqM(sqFt: number): number {
  return sqFt * 0.092903;
}

/**
 * Convert square meters to square feet
 */
export function sqMToSqFt(sqM: number): number {
  return sqM / 0.092903;
}

/**
 * Calculate the center point of a polygon
 */
export function calculatePolygonCenter(coordinates: Point[]): Point {
  if (coordinates.length === 0) return { x: 0, y: 0 };
  
  const sumX = coordinates.reduce((sum, point) => sum + point.x, 0);
  const sumY = coordinates.reduce((sum, point) => sum + point.y, 0);
  
  return {
    x: sumX / coordinates.length,
    y: sumY / coordinates.length
  };
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
        (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Find the closest point on a polygon to a given point
 */
export function findClosestPointOnPolygon(point: Point, polygon: Point[]): { point: Point; index: number; distance: number } {
  let closestIndex = 0;
  let minDistance = Infinity;
  
  polygon.forEach((polyPoint, index) => {
    const distance = Math.sqrt((polyPoint.x - point.x) ** 2 + (polyPoint.y - point.y) ** 2);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });
  
  return {
    point: polygon[closestIndex],
    index: closestIndex,
    distance: minDistance
  };
}

/**
 * Create a rectangle from two corner points
 */
export function createRectangleFromCorners(point1: Point, point2: Point): Point[] {
  return [
    { x: Math.min(point1.x, point2.x), y: Math.min(point1.y, point2.y) },
    { x: Math.max(point1.x, point2.x), y: Math.min(point1.y, point2.y) },
    { x: Math.max(point1.x, point2.x), y: Math.max(point1.y, point2.y) },
    { x: Math.min(point1.x, point2.x), y: Math.max(point1.y, point2.y) }
  ];
}

/**
 * Create a circle approximation from center and radius
 */
export function createCircleFromCenter(center: Point, radius: number, segments: number = 16): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    points.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle)
    });
  }
  return points;
}

/**
 * Smooth a polygon by reducing points that are too close together
 */
export function smoothPolygon(coordinates: Point[], minDistance: number = 5): Point[] {
  if (coordinates.length <= 3) return coordinates;
  
  const smoothed: Point[] = [coordinates[0]];
  
  for (let i = 1; i < coordinates.length - 1; i++) {
    const prev = smoothed[smoothed.length - 1];
    const current = coordinates[i];
    const distance = Math.sqrt((current.x - prev.x) ** 2 + (current.y - prev.y) ** 2);
    
    if (distance >= minDistance) {
      smoothed.push(current);
    }
  }
  
  // Always include the last point
  smoothed.push(coordinates[coordinates.length - 1]);
  
  return smoothed;
}

/**
 * Calculate the bounding box of a polygon
 */
export function calculateBoundingBox(coordinates: Point[]): { minX: number; minY: number; maxX: number; maxY: number } {
  if (coordinates.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  
  let minX = coordinates[0].x;
  let minY = coordinates[0].y;
  let maxX = coordinates[0].x;
  let maxY = coordinates[0].y;
  
  coordinates.forEach(point => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });
  
  return { minX, minY, maxX, maxY };
}

/**
 * Validate that a polygon is valid (has at least 3 points, no self-intersections)
 */
export function validatePolygon(coordinates: Point[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (coordinates.length < 3) {
    errors.push('Polygon must have at least 3 points');
  }
  
  if (coordinates.length > 2) {
    // Check for duplicate consecutive points
    for (let i = 0; i < coordinates.length; i++) {
      const current = coordinates[i];
      const next = coordinates[(i + 1) % coordinates.length];
      if (current.x === next.x && current.y === next.y) {
        errors.push('Polygon has duplicate consecutive points');
        break;
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate the total area of multiple asphalt areas
 */
export function calculateTotalArea(areas: AsphaltArea[]): number {
  return areas.reduce((total, area) => total + area.area_sqft, 0);
}

/**
 * Get area statistics for a collection of asphalt areas
 */
export function getAreaStatistics(areas: AsphaltArea[]): {
  totalSqFt: number;
  totalSqM: number;
  averageArea: number;
  largestArea: number;
  smallestArea: number;
  conditionCounts: Record<string, number>;
} {
  if (areas.length === 0) {
    return {
      totalSqFt: 0,
      totalSqM: 0,
      averageArea: 0,
      largestArea: 0,
      smallestArea: 0,
      conditionCounts: {}
    };
  }
  
  const totalSqFt = calculateTotalArea(areas);
  const areas_sqft = areas.map(area => area.area_sqft);
  const conditionCounts: Record<string, number> = {};
  
  areas.forEach(area => {
    conditionCounts[area.condition] = (conditionCounts[area.condition] || 0) + 1;
  });
  
  return {
    totalSqFt,
    totalSqM: sqFtToSqM(totalSqFt),
    averageArea: totalSqFt / areas.length,
    largestArea: Math.max(...areas_sqft),
    smallestArea: Math.min(...areas_sqft),
    conditionCounts
  };
}
