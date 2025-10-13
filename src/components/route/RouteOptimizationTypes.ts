// Type definitions for Route Optimization to match database schema

export interface DbJobSite {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  area: number;
  status: string;
  created_at: string;
}

export interface JobSite {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  priority: number;
  estimated_duration: number;
  status: string;
  time_windows?: { start: string; end: string }[];
  service_type?: string;
  notes?: string;
}

export interface DbOptimizedRoute {
  id: string;
  name: string;
  created_by: string;
  optimization_method: string;
  start_location: any;
  stops: any;
  optimized_route: any;
  total_distance: number;
  total_duration: number;
  created_at: string;
  updated_at: string;
}

export interface OptimizedRoute {
  id: string;
  vehicle_id: string;
  route_name: string;
  start_location: { lat: number; lng: number; address: string };
  job_sites: JobSite[];
  optimized_order: string[];
  total_distance: number;
  total_duration: number;
  total_fuel_cost: number;
  created_at: string;
  created_by: string;
}

// Helper to convert DB job site to app job site
export function mapDbJobSiteToJobSite(dbJobSite: any): JobSite {
  return {
    id: dbJobSite.id,
    name: dbJobSite.name || 'Unnamed Site',
    address: dbJobSite.address || '',
    lat: dbJobSite.latitude || 0,
    lng: dbJobSite.longitude || 0,
    priority: 1,
    estimated_duration: 60,
    status: dbJobSite.status || 'pending',
    service_type: 'asphalt',
    notes: dbJobSite.notes
  };
}

export function mapDbOptimizedRouteToOptimizedRoute(dbRoute: any): OptimizedRoute {
  const startLoc = typeof dbRoute.start_location === 'string' 
    ? JSON.parse(dbRoute.start_location) 
    : dbRoute.start_location || {};
  
  const stops = typeof dbRoute.stops === 'string'
    ? JSON.parse(dbRoute.stops)
    : dbRoute.stops || [];

  return {
    id: dbRoute.id,
    vehicle_id: '',
    route_name: dbRoute.name || 'Unnamed Route',
    start_location: {
      lat: startLoc.lat || 0,
      lng: startLoc.lng || 0,
      address: startLoc.address || ''
    },
    job_sites: stops.map((stop: any) => ({
      id: stop.id || '',
      name: stop.name || 'Stop',
      address: stop.address || '',
      lat: stop.lat || 0,
      lng: stop.lng || 0,
      priority: 1,
      estimated_duration: 60,
      status: 'pending'
    })),
    optimized_order: stops.map((s: any, i: number) => s.id || `stop-${i}`),
    total_distance: dbRoute.total_distance || 0,
    total_duration: dbRoute.total_duration || 0,
    total_fuel_cost: 0,
    created_at: dbRoute.created_at,
    created_by: dbRoute.created_by
  };
}
