import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Car, Wrench, Fuel, AlertTriangle, CheckCircle, Clock, Users, Route, Settings } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { AnimatedDiv, HoverAnimation } from '@/components/ui/Animations';
import { Vehicle, MaintenanceRecord, mapDbVehicleToVehicle, mapDbMaintenanceToMaintenance } from './FleetTypes';

interface FleetManagementModalProps {
  onClose: () => void;
}

export const FleetManagementModal: React.FC<FleetManagementModalProps> = ({ onClose }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    type: 'routine' as const,
    description: '',
    cost: 0,
    date: new Date().toISOString().split('T')[0],
    mileage: 0,
    notes: ''
  });
  const [trackingInterval, setTrackingInterval] = useState<number | null>(null);
  const [realTimeLocations, setRealTimeLocations] = useState<Map<string, any>>(new Map());
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    startRealTimeTracking();

    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [vehiclesRes, maintenanceRes] = await Promise.all([
        supabase.from('vehicles').select(`
          *,
          employees (name, role)
        `).order('make'),
        supabase.from('maintenance_records').select(`
          *,
          vehicles (make, model, license_plate)
        `).order('date', { ascending: false })
      ]);

      if (vehiclesRes.data) setVehicles(vehiclesRes.data.map(mapDbVehicleToVehicle));
      if (maintenanceRes.data) setMaintenanceRecords(maintenanceRes.data.map(mapDbMaintenanceToMaintenance));
    } catch (error) {
      console.error('Error fetching fleet data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load fleet data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRealTimeTracking = () => {
    const interval = setInterval(async () => {
      // Simulate real-time location updates
      const updatedLocations = new Map();
      
      for (const vehicle of vehicles) {
        if (vehicle.status === 'active' && vehicle.assigned_employee) {
          // In a real app, this would fetch actual GPS data
          const mockLocation = {
            lat: vehicle.current_location?.lat + (Math.random() - 0.5) * 0.001,
            lng: vehicle.current_location?.lng + (Math.random() - 0.5) * 0.001,
            timestamp: new Date().toISOString()
          };
          updatedLocations.set(vehicle.id, mockLocation);
        }
      }
      
      setRealTimeLocations(updatedLocations);
    }, 5000);

    setTrackingInterval(interval);
  };

  const updateVehicleLocation = async (vehicleId: string, location: any) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          location: JSON.stringify(location)
        })
        .eq('id', vehicleId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating vehicle location:', error);
    }
  };

  const scheduleMaintenance = async () => {
    if (!selectedVehicle) return;

    try {
      const { error } = await supabase
        .from('maintenance_records')
        .insert([{
          asset_id: selectedVehicle.id,
          oil_type: maintenanceForm.description,
          oil_change_date: maintenanceForm.date,
          maintenance_notes: maintenanceForm.notes
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Maintenance scheduled successfully'
      });

      setShowMaintenanceForm(false);
      setMaintenanceForm({
        type: 'routine',
        description: '',
        cost: 0,
        date: new Date().toISOString().split('T')[0],
        mileage: 0,
        notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule maintenance',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'out_of_service': return 'bg-red-500';
      case 'retired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getMaintenanceTypeColor = (type: string) => {
    switch (type) {
      case 'routine': return 'bg-blue-500';
      case 'repair': return 'bg-red-500';
      case 'inspection': return 'bg-yellow-500';
      case 'emergency': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getFuelLevelColor = (level: number) => {
    if (level > 75) return 'text-green-500';
    if (level > 25) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMaintenanceStatus = (vehicle: Vehicle) => {
    if (!vehicle.next_maintenance) return 'No maintenance scheduled';
    
    const nextDate = new Date(vehicle.next_maintenance);
    const today = new Date();
    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'Overdue', color: 'text-red-500' };
    if (diffDays < 7) return { status: 'Due Soon', color: 'text-yellow-500' };
    return { status: 'Up to Date', color: 'text-green-500' };
  };

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-7xl h-[90vh] hud-element m-4 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-primary/30">
            <h2 className="text-2xl font-bold text-glow flex items-center gap-2">
              <Car className="h-6 w-6" />
              Fleet Management
            </h2>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <Tabs defaultValue="vehicles" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="vehicles" className="space-y-6">
                <LoadingOverlay isLoading={isLoading}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map((vehicle) => (
                      <HoverAnimation key={vehicle.id}>
                        <Card 
                          className="cursor-pointer"
                          onClick={() => setSelectedVehicle(vehicle)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </CardTitle>
                              <Badge className={getStatusColor(vehicle.status)}>
                                {vehicle.status}
                              </Badge>
                            </div>
                            <CardDescription>
                              {vehicle.license_plate} • {vehicle.color}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="text-xs">Mileage</Label>
                                <p>{vehicle.mileage.toLocaleString()} mi</p>
                              </div>
                              <div>
                                <Label className="text-xs">Fuel Level</Label>
                                <p className={getFuelLevelColor(vehicle.fuel_level || 0)}>
                                  {vehicle.fuel_level || 0}%
                                </p>
                              </div>
                            </div>
                            
                            {vehicle.current_location && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span className="truncate">{vehicle.current_location.address}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4" />
                              {typeof getMaintenanceStatus(vehicle) === 'object' ? (
                                <span className={getMaintenanceStatus(vehicle).color}>
                                  {getMaintenanceStatus(vehicle).status}
                                </span>
                              ) : (
                                <span>{getMaintenanceStatus(vehicle)}</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </HoverAnimation>
                    ))}
                  </div>
                </LoadingOverlay>
              </TabsContent>

              <TabsContent value="tracking" className="space-y-6">
                <div className="grid gap-4">
                  {vehicles.filter(v => v.status === 'active').map((vehicle) => (
                    <HoverAnimation key={vehicle.id}>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {vehicle.license_plate} • {vehicle.assigned_employee || 'Unassigned'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-sm text-green-500">Online</span>
                            </div>
                          </div>
                          
                          {vehicle.current_location && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4" />
                                <span>{vehicle.current_location.address}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                  Last updated: {new Date(vehicle.current_location.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-3 flex gap-2">
                            <Button size="sm" variant="outline" className="gap-2">
                              <Route className="h-4 w-4" />
                              View Route
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Settings className="h-4 w-4" />
                              Settings
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </HoverAnimation>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="maintenance" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Maintenance Records</h3>
                  <Dialog open={showMaintenanceForm} onOpenChange={setShowMaintenanceForm}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Wrench className="h-4 w-4" />
                        Schedule Maintenance
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Schedule Maintenance</DialogTitle>
                        <DialogDescription>
                          Schedule maintenance for {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Type</Label>
                            <Select 
                              value={maintenanceForm.type} 
                              onValueChange={(value: any) => setMaintenanceForm(prev => ({ ...prev, type: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="routine">Routine</SelectItem>
                                <SelectItem value="repair">Repair</SelectItem>
                                <SelectItem value="inspection">Inspection</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={maintenanceForm.date}
                              onChange={(e) => setMaintenanceForm(prev => ({ ...prev, date: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={maintenanceForm.description}
                            onChange={(e) => setMaintenanceForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe the maintenance work..."
                            rows={3}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Cost</Label>
                            <Input
                              type="number"
                              value={maintenanceForm.cost}
                              onChange={(e) => setMaintenanceForm(prev => ({ ...prev, cost: Number(e.target.value) }))}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Mileage</Label>
                            <Input
                              type="number"
                              value={maintenanceForm.mileage}
                              onChange={(e) => setMaintenanceForm(prev => ({ ...prev, mileage: Number(e.target.value) }))}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Textarea
                            value={maintenanceForm.notes}
                            onChange={(e) => setMaintenanceForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional notes..."
                            rows={2}
                          />
                        </div>
                        
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setShowMaintenanceForm(false)}>
                            Cancel
                          </Button>
                          <Button onClick={scheduleMaintenance}>
                            Schedule
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="grid gap-4">
                  {maintenanceRecords.map((record) => (
                    <HoverAnimation key={record.id}>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">
                                Vehicle Maintenance - {record.vehicle_id}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(record.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getMaintenanceTypeColor(record.type)}>
                                {record.type}
                              </Badge>
                              <Badge variant="outline">
                                {record.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm">{record.description}</p>
                            {record.notes && (
                              <p className="text-sm text-muted-foreground">{record.notes}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              <span>Cost: ${record.cost.toFixed(2)}</span>
                              {record.next_due && (
                                <span>Next Due: {new Date(record.next_due).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </HoverAnimation>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Fleet Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Active</span>
                          <Badge className="bg-green-500">
                            {vehicles.filter(v => v.status === 'active').length}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Maintenance</span>
                          <Badge className="bg-yellow-500">
                            {vehicles.filter(v => v.status === 'maintenance').length}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Out of Service</span>
                          <Badge className="bg-red-500">
                            {vehicles.filter(v => v.status === 'out_of_service').length}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Maintenance Costs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">This Month</span>
                          <span className="font-semibold">
                            ${maintenanceRecords
                              .filter(r => new Date(r.date).getMonth() === new Date().getMonth())
                              .reduce((sum, r) => sum + r.cost, 0)
                              .toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">This Year</span>
                          <span className="font-semibold">
                            ${maintenanceRecords
                              .filter(r => new Date(r.date).getFullYear() === new Date().getFullYear())
                              .reduce((sum, r) => sum + r.cost, 0)
                              .toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Fuel Efficiency</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Average Level</span>
                          <span className="font-semibold">
                            {Math.round(vehicles.reduce((sum, v) => sum + (v.fuel_level || 0), 0) / vehicles.length)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Low Fuel</span>
                          <Badge className="bg-red-500">
                            {vehicles.filter(v => (v.fuel_level || 0) < 25).length}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
