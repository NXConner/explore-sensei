import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JobSite {
  id: string;
  lat: number;
  lng: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  required_crew_size?: number;
  estimated_duration?: number;
  time_windows?: { start: string; end: string }[];
}

interface Vehicle {
  id: string;
  capacity: number;
  fuel_efficiency: number;
  current_location: { lat: number; lng: number };
}

interface OptimizationSettings {
  fuel_cost_per_gallon: number;
  driver_hourly_rate: number;
  traffic_factor: number;
  optimize_for: 'time' | 'cost' | 'distance';
}

interface OptimizedRoute {
  id: string;
  vehicle_id: string;
  route_name: string;
  total_distance: number;
  total_duration: number;
  total_fuel_cost: number;
  job_sites: JobSite[];
  waypoints: {
    lat: number;
    lng: number;
    address: string;
    arrival_time: string;
    departure_time: string;
    job_site_id: string;
  }[];
  optimization_score: number;
  created_at: string;
}

interface RouteSavings {
  distance_saved: number;
  time_saved: number;
  cost_saved: number;
  percentage_improvement: number;
}

export const useRouteOptimizations = () => {
  const [routes, setRoutes] = useState<OptimizedRoute[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const optimizeRoute = useCallback(async (
    jobSites: JobSite[],
    vehicle: Vehicle,
    settings: OptimizationSettings
  ) => {
    try {
      setIsOptimizing(true);
      setProgress(0);
      setError('');

      // Validate constraints
      if (!validateRouteConstraints(jobSites, vehicle)) {
        throw new Error('Route constraints not met: vehicle capacity insufficient');
      }

      // Simulate optimization progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
        }
          return prev + 10;
        });
      }, 200);

      // Generate waypoints
      const waypoints = generateWaypoints(jobSites);
      
      // Calculate route metrics
      const totalDistance = calculateDistance(waypoints);
      const totalDuration = calculateDuration(totalDistance, 30, settings.traffic_factor);
      const totalFuelCost = calculateFuelCost(totalDistance, vehicle.fuel_efficiency, settings.fuel_cost_per_gallon);
      
      // Calculate optimization score
      const optimizationScore = calculateOptimizationScore({
        total_distance: totalDistance,
        total_duration: totalDuration,
        total_fuel_cost: totalFuelCost,
        job_sites: jobSites
      });

      // Create optimized route
      const optimizedRoute: OptimizedRoute = {
        id: `route-${Date.now()}`,
        vehicle_id: vehicle.id,
        route_name: `Route ${new Date().toLocaleDateString()}`,
        total_distance: totalDistance,
        total_duration: totalDuration,
        total_fuel_cost: totalFuelCost,
        job_sites,
        waypoints: waypoints.map((wp, index) => ({
          ...wp,
          arrival_time: new Date(Date.now() + index * 2 * 60 * 60 * 1000).toISOString(),
          departure_time: new Date(Date.now() + (index * 2 + 1) * 60 * 60 * 1000).toISOString()
        })),
        optimization_score: optimizationScore,
        created_at: new Date().toISOString()
      };

      clearInterval(progressInterval);
      setProgress(100);

      // Save to database
      const { error: dbError } = await supabase
        .from('route_optimizations')
        .insert([optimizedRoute]);

      if (dbError) throw dbError;

      setRoutes(prev => [optimizedRoute, ...prev]);
      
      toast({
        title: 'Route Optimized',
        description: `Optimized route with ${jobSites.length} stops`
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Optimization failed');
      toast({
        title: 'Optimization Error',
        description: 'Failed to optimize route',
        variant: 'destructive'
      });
    } finally {
      setIsOptimizing(false);
      setProgress(0);
    }
  }, [toast]);

  const calculateDistance = useCallback((waypoints: { lat: number; lng: number }[]): number => {
    if (waypoints.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const distance = haversineDistance(waypoints[i], waypoints[i + 1]);
      totalDistance += distance;
    }
    return totalDistance;
  }, []);

  const haversineDistance = useCallback((point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const calculateDuration = useCallback((distance: number, averageSpeed: number, trafficFactor: number): number => {
    return (distance / averageSpeed) * trafficFactor;
  }, []);

  const calculateFuelCost = useCallback((distance: number, fuelEfficiency: number, fuelCostPerGallon: number): number => {
    return (distance / fuelEfficiency) * fuelCostPerGallon;
  }, []);

  const calculateOptimizationScore = useCallback((route: {
    total_distance: number;
    total_duration: number;
    total_fuel_cost: number;
    job_sites: JobSite[];
  }): number => {
    // Base score calculation
    let score = 100;
    
    // Penalize for distance
    score -= route.total_distance * 0.1;
    
    // Penalize for duration
    score -= route.total_duration * 2;
    
    // Penalize for fuel cost
    score -= route.total_fuel_cost * 0.5;
    
    // Bonus for high priority sites
    const highPrioritySites = route.job_sites.filter(site => site.priority === 'high' || site.priority === 'critical');
    score += highPrioritySites.length * 5;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }, []);

  const sortRoutesByScore = useCallback((routes: OptimizedRoute[]): OptimizedRoute[] => {
    return [...routes].sort((a, b) => b.optimization_score - a.optimization_score);
  }, []);

  const filterRoutesByDateRange = useCallback((routes: OptimizedRoute[], startDate: Date, endDate: Date): OptimizedRoute[] => {
    return routes.filter(route => {
      const routeDate = new Date(route.created_at);
      return routeDate >= startDate && routeDate <= endDate;
    });
  }, []);

  const calculateSavings = useCallback((originalRoute: {
    total_distance: number;
    total_duration: number;
    total_fuel_cost: number;
  }, optimizedRoute: {
    total_distance: number;
    total_duration: number;
    total_fuel_cost: number;
  }): RouteSavings => {
    const distanceSaved = originalRoute.total_distance - optimizedRoute.total_distance;
    const timeSaved = originalRoute.total_duration - optimizedRoute.total_duration;
    const costSaved = originalRoute.total_fuel_cost - optimizedRoute.total_fuel_cost;
    
    const totalOriginalCost = originalRoute.total_fuel_cost + (originalRoute.total_duration * 25); // Assuming $25/hour
    const totalOptimizedCost = optimizedRoute.total_fuel_cost + (optimizedRoute.total_duration * 25);
    const percentageImprovement = ((totalOriginalCost - totalOptimizedCost) / totalOriginalCost) * 100;

    return {
      distance_saved: distanceSaved,
      time_saved: timeSaved,
      cost_saved: costSaved,
      percentage_improvement: percentageImprovement
    };
  }, []);

  const validateRouteConstraints = useCallback((jobSites: JobSite[], vehicle: Vehicle): boolean => {
    const totalCrewRequired = jobSites.reduce((sum, site) => sum + (site.required_crew_size || 1), 0);
    return totalCrewRequired <= vehicle.capacity;
  }, []);

  const generateWaypoints = useCallback((jobSites: JobSite[]): {
    lat: number;
    lng: number;
    address: string;
    job_site_id: string;
  }[] => {
    return jobSites.map(site => ({
      lat: site.lat,
      lng: site.lng,
      address: `Job Site ${site.id}`,
      job_site_id: site.id
    }));
  }, []);

  const fetchRoutes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('route_optimizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch routes');
    }
  }, []);

  const deleteRoute = useCallback(async (routeId: string) => {
    try {
      const { error } = await supabase
        .from('route_optimizations')
        .delete()
        .eq('id', routeId);

      if (error) throw error;

      setRoutes(prev => prev.filter(route => route.id !== routeId));
      
      toast({
        title: 'Route Deleted',
        description: 'Route has been deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Delete Error',
        description: 'Failed to delete route',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const reset = useCallback(() => {
    setIsOptimizing(false);
    setProgress(0);
    setError('');
  }, []);

  return {
    routes,
    isOptimizing,
    progress,
    error,
    optimizeRoute,
    calculateDistance,
    calculateDuration,
    calculateFuelCost,
    calculateOptimizationScore,
    sortRoutesByScore,
    filterRoutesByDateRange,
    calculateSavings,
    validateRouteConstraints,
    generateWaypoints,
    fetchRoutes,
    deleteRoute,
    reset,
    setRoutes,
    setError
  };
};