import { renderHook, act } from '@testing-library/react';
import { useRouteOptimizations } from '../useRouteOptimizations';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({
        data: [],
        error: null
      }))
    }))
  }
}));

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

describe('useRouteOptimizations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useRouteOptimizations());

    expect(result.current.routes).toEqual([]);
    expect(result.current.isOptimizing).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBe('');
  });

  it('should optimize route successfully', async () => {
    const mockJobSites = [
      { id: '1', lat: 40.7128, lng: -74.0060, priority: 'high' },
      { id: '2', lat: 40.7589, lng: -73.9851, priority: 'medium' }
    ];

    const mockVehicle = {
      id: 'vehicle-1',
      capacity: 4,
      fuel_efficiency: 25,
      current_location: { lat: 40.7128, lng: -74.0060 }
    };

    const { result } = renderHook(() => useRouteOptimizations());

    await act(async () => {
      await result.current.optimizeRoute(mockJobSites, mockVehicle, {
        fuel_cost_per_gallon: 3.50,
        driver_hourly_rate: 25.00,
        traffic_factor: 1.2,
        optimize_for: 'time'
      });
    });

    expect(result.current.isOptimizing).toBe(false);
    expect(result.current.routes.length).toBeGreaterThan(0);
    expect(result.current.error).toBe('');
  });

  it('should handle optimization error', async () => {
    const mockJobSites = [{ id: '1', lat: 40.7128, lng: -74.0060, priority: 'high' }];
    const mockVehicle = { id: 'vehicle-1', capacity: 4 };

    // Mock error
    (supabase.from as jest.Mock).mockImplementation(() => ({
      insert: jest.fn(() => ({
        error: new Error('Optimization failed')
      }))
    }));

    const { result } = renderHook(() => useRouteOptimizations());

    await act(async () => {
      await result.current.optimizeRoute(mockJobSites, mockVehicle, {
        fuel_cost_per_gallon: 3.50,
        driver_hourly_rate: 25.00,
        traffic_factor: 1.2,
        optimize_for: 'time'
      });
    });

    expect(result.current.isOptimizing).toBe(false);
    expect(result.current.error).toBe('Optimization failed');
  });

  it('should calculate route distance correctly', () => {
    const { result } = renderHook(() => useRouteOptimizations());

    const waypoints = [
      { lat: 40.7128, lng: -74.0060 },
      { lat: 40.7589, lng: -73.9851 },
      { lat: 40.7505, lng: -73.9934 }
    ];

    const distance = result.current.calculateDistance(waypoints);
    expect(distance).toBeGreaterThan(0);
    expect(typeof distance).toBe('number');
  });

  it('should calculate route duration correctly', () => {
    const { result } = renderHook(() => useRouteOptimizations());

    const distance = 10; // miles
    const averageSpeed = 30; // mph
    const trafficFactor = 1.2;

    const duration = result.current.calculateDuration(distance, averageSpeed, trafficFactor);
    expect(duration).toBeGreaterThan(0);
    expect(duration).toBeCloseTo((distance / averageSpeed) * trafficFactor, 2);
  });

  it('should calculate fuel cost correctly', () => {
    const { result } = renderHook(() => useRouteOptimizations());

    const distance = 100; // miles
    const fuelEfficiency = 25; // mpg
    const fuelCostPerGallon = 3.50;

    const fuelCost = result.current.calculateFuelCost(distance, fuelEfficiency, fuelCostPerGallon);
    expect(fuelCost).toBeCloseTo((distance / fuelEfficiency) * fuelCostPerGallon, 2);
  });

  it('should calculate optimization score correctly', () => {
    const { result } = renderHook(() => useRouteOptimizations());

    const route = {
      total_distance: 50,
      total_duration: 2,
      total_fuel_cost: 20,
      job_sites: [{ priority: 'high' }, { priority: 'medium' }]
    };

    const score = result.current.calculateOptimizationScore(route);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should sort routes by optimization score', () => {
    const { result } = renderHook(() => useRouteOptimizations());

    const routes = [
      { id: '1', optimization_score: 75 },
      { id: '2', optimization_score: 90 },
      { id: '3', optimization_score: 60 }
    ];

    const sortedRoutes = result.current.sortRoutesByScore(routes);
    expect(sortedRoutes[0].optimization_score).toBe(90);
    expect(sortedRoutes[1].optimization_score).toBe(75);
    expect(sortedRoutes[2].optimization_score).toBe(60);
  });

  it('should filter routes by date range', () => {
    const { result } = renderHook(() => useRouteOptimizations());

    const routes = [
      { id: '1', created_at: '2024-01-01T00:00:00Z' },
      { id: '2', created_at: '2024-01-15T00:00:00Z' },
      { id: '3', created_at: '2024-02-01T00:00:00Z' }
    ];

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    const filteredRoutes = result.current.filterRoutesByDateRange(routes, startDate, endDate);
    expect(filteredRoutes).toHaveLength(2);
  });

  it('should calculate route savings correctly', () => {
    const { result } = renderHook(() => useRouteOptimizations());

    const originalRoute = {
      total_distance: 100,
      total_duration: 4,
      total_fuel_cost: 50
    };

    const optimizedRoute = {
      total_distance: 80,
      total_duration: 3,
      total_fuel_cost: 40
    };

    const savings = result.current.calculateSavings(originalRoute, optimizedRoute);
    expect(savings.distance_saved).toBe(20);
    expect(savings.time_saved).toBe(1);
    expect(savings.cost_saved).toBe(10);
  });

  it('should validate route constraints', () => {
    const { result } = renderHook(() => useRouteOptimizations());

    const jobSites = [
      { id: '1', lat: 40.7128, lng: -74.0060, required_crew_size: 2 },
      { id: '2', lat: 40.7589, lng: -73.9851, required_crew_size: 3 }
    ];

    const vehicle = { id: 'vehicle-1', capacity: 4 };

    const isValid = result.current.validateRouteConstraints(jobSites, vehicle);
    expect(isValid).toBe(true);

    const invalidVehicle = { id: 'vehicle-2', capacity: 2 };
    const isInvalid = result.current.validateRouteConstraints(jobSites, invalidVehicle);
    expect(isInvalid).toBe(false);
  });

  it('should generate route waypoints', () => {
    const { result } = renderHook(() => useRouteOptimizations());

    const jobSites = [
      { id: '1', lat: 40.7128, lng: -74.0060, name: 'Site 1' },
      { id: '2', lat: 40.7589, lng: -73.9851, name: 'Site 2' }
    ];

    const waypoints = result.current.generateWaypoints(jobSites);
    expect(waypoints).toHaveLength(2);
    expect(waypoints[0]).toHaveProperty('lat');
    expect(waypoints[0]).toHaveProperty('lng');
    expect(waypoints[0]).toHaveProperty('job_site_id');
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useRouteOptimizations());

    // Set some state
    act(() => {
      result.current.setRoutes([{ id: '1' }]);
      result.current.setError('test error');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.routes).toEqual([]);
    expect(result.current.error).toBe('');
    expect(result.current.isOptimizing).toBe(false);
    expect(result.current.progress).toBe(0);
  });
});
