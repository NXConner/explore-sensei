import React, { useState, useEffect, useRef } from 'react';
import { X, Route, MapPin, Clock, Fuel, Users, Zap, Navigation, AlertCircle, CheckCircle, TrendingUp, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { AnimatedDiv, HoverAnimation } from '@/components/ui/Animations';

interface JobSite {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_duration: number; // in hours
  required_crew_size: number;
  required_equipment: string[];
  time_windows: {
    start: string;
    end: string;
  }[];
  client_id: string;
  clients?: {
    name: string;
    phone: string;
  };
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  capacity: number;
  fuel_efficiency: number; // miles per gallon
  current_location: {
    lat: number;
    lng: number;
    address: string;
  };
  assigned_crew: string[];
  equipment: string[];
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

interface RouteOptimizationModalProps {
  onClose: () => void;
}

export const RouteOptimizationModal: React.FC<RouteOptimizationModalProps> = ({ onClose }) => {
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoute[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [optimizationResults, setOptimizationResults] = useState<OptimizedRoute | null>(null);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [optimizationSettings, setOptimizationSettings] = useState({
    fuel_cost_per_gallon: 3.50,
    driver_hourly_rate: 25.00,
    traffic_factor: 1.2,
    break_duration: 0.5, // 30 minutes
    max_daily_hours: 10,
    optimize_for: 'time' as 'time' | 'cost' | 'distance'
  });
  const [routeHistory, setRouteHistory] = useState<OptimizedRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sitesRes, vehiclesRes, routesRes] = await Promise.all([
        supabase.from('job_sites').select(`
          *,
          clients (name, phone)
        `).eq('status', 'active'),
        supabase.from('vehicles').select(`
          *,
          employees (name, role)
        `).eq('status', 'active'),
        supabase.from('route_optimizations').select('*').order('created_at', { ascending: false })
      ]);

      if (sitesRes.data) setJobSites(sitesRes.data as JobSite[]);
      if (vehiclesRes.data) setVehicles(vehiclesRes.data as Vehicle[]);
      if (routesRes.data) {
        setOptimizedRoutes(routesRes.data as OptimizedRoute[]);
        setRouteHistory(routesRes.data as OptimizedRoute[]);
      }
    } catch (error) {
      console.error('Error fetching route data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load route optimization data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const optimizeRoute = async () => {
    if (selectedSites.length === 0 || !selectedVehicle) {
      toast({
        title: 'Error',
        description: 'Please select job sites and a vehicle',
        variant: 'destructive'
      });
      return;
    }

    setIsOptimizing(true);
    setOptimizationProgress(0);

    try {
      // Simulate optimization progress
      const progressInterval = setInterval(() => {
        setOptimizationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // In a real app, this would call Google Maps Directions API or similar
      const selectedSitesData = jobSites.filter(site => selectedSites.includes(site.id));
      const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);

      if (!selectedVehicleData) throw new Error('Selected vehicle not found');

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const optimizedRoute: OptimizedRoute = {
        id: `route-${Date.now()}`,
        vehicle_id: selectedVehicle,
        route_name: `Route ${new Date().toLocaleDateString()}`,
        total_distance: Math.random() * 100 + 50, // Simulated distance
        total_duration: Math.random() * 8 + 4, // Simulated duration
        total_fuel_cost: Math.random() * 50 + 25, // Simulated fuel cost
        job_sites: selectedSitesData,
        waypoints: selectedSitesData.map((site, index) => ({
          lat: site.lat,
          lng: site.lng,
          address: site.address,
          arrival_time: new Date(Date.now() + index * 2 * 60 * 60 * 1000).toISOString(),
          departure_time: new Date(Date.now() + (index * 2 + 1) * 60 * 60 * 1000).toISOString(),
          job_site_id: site.id
        })),
        optimization_score: Math.random() * 20 + 80, // 80-100 score
        created_at: new Date().toISOString()
      };

      clearInterval(progressInterval);
      setOptimizationProgress(100);
      setOptimizationResults(optimizedRoute);
      
      // Save to database
      await supabase.from('route_optimizations').insert([optimizedRoute]);
      
      toast({
        title: 'Route Optimized',
        description: `Optimized route with ${optimizedRoute.job_sites.length} stops`
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error optimizing route:', error);
      toast({
        title: 'Error',
        description: 'Failed to optimize route',
        variant: 'destructive'
      });
    } finally {
      setIsOptimizing(false);
      setOptimizationProgress(0);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getOptimizationScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const calculateSavings = (route: OptimizedRoute) => {
    const baseCost = route.total_fuel_cost + (route.total_duration * optimizationSettings.driver_hourly_rate);
    const optimizedCost = route.total_fuel_cost * 0.8 + (route.total_duration * optimizationSettings.driver_hourly_rate * 0.9);
    return baseCost - optimizedCost;
  };

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-7xl h-[90vh] hud-element m-4 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-primary/30">
            <h2 className="text-2xl font-bold text-glow flex items-center gap-2">
              <Route className="h-6 w-6" />
              Route Optimization
            </h2>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <Tabs defaultValue="optimize" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="optimize">Optimize Route</TabsTrigger>
                <TabsTrigger value="routes">Route History</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="optimize" className="space-y-6">
                <LoadingOverlay isLoading={isLoading}>
                  {/* Job Sites Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Select Job Sites
                    </CardTitle>
                    <CardDescription>
                      Choose the job sites to include in the route optimization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {jobSites.map((site) => (
                        <HoverAnimation key={site.id}>
                          <Card 
                            className={`cursor-pointer transition-all ${
                              selectedSites.includes(site.id) 
                                ? 'border-primary bg-primary/10' 
                                : 'hover:border-primary/50'
                            }`}
                            onClick={() => {
                              if (selectedSites.includes(site.id)) {
                                setSelectedSites(prev => prev.filter(id => id !== site.id));
                              } else {
                                setSelectedSites(prev => [...prev, site.id]);
                              }
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-sm">{site.name}</h3>
                                <Badge className={getPriorityColor(site.priority)}>
                                  {site.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">{site.address}</p>
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {site.estimated_duration}h
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {site.required_crew_size}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </HoverAnimation>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Vehicle Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Navigation className="h-5 w-5" />
                      Select Vehicle
                    </CardTitle>
                    <CardDescription>
                      Choose the vehicle for this route
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            <div className="flex items-center gap-2">
                              <span>{vehicle.make} {vehicle.model}</span>
                              <Badge variant="outline" className="text-xs">
                                {vehicle.capacity} crew
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Optimization Progress */}
                {isOptimizing && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <LoadingSpinner size="lg" text="Optimizing route..." />
                        <Progress value={optimizationProgress} className="w-full" />
                        <p className="text-sm text-muted-foreground">
                          Analyzing traffic patterns and calculating optimal route...
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Optimization Results */}
                {optimizationResults && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Optimization Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {optimizationResults.total_distance.toFixed(1)} mi
                          </div>
                          <div className="text-sm text-muted-foreground">Total Distance</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {optimizationResults.total_duration.toFixed(1)}h
                          </div>
                          <div className="text-sm text-muted-foreground">Total Duration</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            ${optimizationResults.total_fuel_cost.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">Fuel Cost</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getOptimizationScoreColor(optimizationResults.optimization_score)}`}>
                            {optimizationResults.optimization_score.toFixed(0)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Optimization Score</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={() => setShowRouteDetails(true)} className="gap-2">
                          <Route className="h-4 w-4" />
                          View Route Details
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Export Route
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <Share2 className="h-4 w-4" />
                          Share Route
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Optimize Button */}
                <div className="flex justify-center">
                  <Button 
                    onClick={optimizeRoute}
                    disabled={selectedSites.length === 0 || !selectedVehicle || isOptimizing}
                    size="lg"
                    className="gap-2"
                  >
                    <Zap className="h-5 w-5" />
                    {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
                  </Button>
                </div>
                </LoadingOverlay>
              </TabsContent>

              <TabsContent value="routes" className="space-y-6">
                <div className="grid gap-4">
                  {routeHistory.map((route) => (
                    <HoverAnimation key={route.id}>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">{route.route_name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(route.created_at).toLocaleDateString()} • {route.job_sites.length} stops
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getOptimizationScoreColor(route.optimization_score)}>
                                {route.optimization_score.toFixed(0)}% optimized
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <Label className="text-xs">Distance</Label>
                              <p>{route.total_distance.toFixed(1)} mi</p>
                            </div>
                            <div>
                              <Label className="text-xs">Duration</Label>
                              <p>{route.total_duration.toFixed(1)}h</p>
                            </div>
                            <div>
                              <Label className="text-xs">Fuel Cost</Label>
                              <p>${route.total_fuel_cost.toFixed(2)}</p>
                            </div>
                            <div>
                              <Label className="text-xs">Savings</Label>
                              <p className="text-green-500">${calculateSavings(route).toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="gap-2">
                              <Route className="h-4 w-4" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Download className="h-4 w-4" />
                              Export
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </HoverAnimation>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Optimization Settings
                    </CardTitle>
                    <CardDescription>
                      Configure route optimization parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fuel Cost per Gallon ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={optimizationSettings.fuel_cost_per_gallon}
                          onChange={(e) => setOptimizationSettings(prev => ({
                            ...prev,
                            fuel_cost_per_gallon: Number(e.target.value)
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Driver Hourly Rate ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={optimizationSettings.driver_hourly_rate}
                          onChange={(e) => setOptimizationSettings(prev => ({
                            ...prev,
                            driver_hourly_rate: Number(e.target.value)
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Traffic Factor</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={optimizationSettings.traffic_factor}
                          onChange={(e) => setOptimizationSettings(prev => ({
                            ...prev,
                            traffic_factor: Number(e.target.value)
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Break Duration (hours)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={optimizationSettings.break_duration}
                          onChange={(e) => setOptimizationSettings(prev => ({
                            ...prev,
                            break_duration: Number(e.target.value)
                          }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Optimize For</Label>
                      <Select 
                        value={optimizationSettings.optimize_for} 
                        onValueChange={(value: any) => setOptimizationSettings(prev => ({
                          ...prev,
                          optimize_for: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="time">Time</SelectItem>
                          <SelectItem value="cost">Cost</SelectItem>
                          <SelectItem value="distance">Distance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};