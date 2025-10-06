import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Fuel, AlertTriangle } from "lucide-react";

interface Vehicle {
  id: string;
  name: string;
  type: string;
  status: string;
  current_location?: { lat: number; lng: number };
  fuel_level?: number;
  last_maintenance?: string;
}

interface VehicleTrackerProps {
  onVehicleSelect?: (vehicle: Vehicle) => void;
}

export const VehicleTracker = ({ onVehicleSelect }: VehicleTrackerProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    fetchVehicles();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("vehicle-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vehicles",
        },
        () => {
          fetchVehicles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("name");

    if (!error && data) {
      setVehicles(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "maintenance":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    }
  };

  const getFuelColor = (level?: number) => {
    if (!level) return "text-gray-400";
    if (level < 25) return "text-red-400";
    if (level < 50) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vehicles.map((vehicle) => (
        <Card
          key={vehicle.id}
          className="hud-element border-primary/30 p-4 cursor-pointer hover:border-primary/50 transition-all"
          onClick={() => onVehicleSelect?.(vehicle)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-glow">{vehicle.name}</h3>
            </div>
            <Badge className={getStatusColor(vehicle.status)}>{vehicle.status}</Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{vehicle.type}</span>
            </div>

            {vehicle.fuel_level !== undefined && (
              <div className="flex items-center gap-2">
                <Fuel className={`w-4 h-4 ${getFuelColor(vehicle.fuel_level)}`} />
                <span className={getFuelColor(vehicle.fuel_level)}>
                  Fuel: {vehicle.fuel_level}%
                </span>
                {vehicle.fuel_level < 25 && (
                  <AlertTriangle className="w-4 h-4 text-red-400 ml-auto" />
                )}
              </div>
            )}

            {vehicle.last_maintenance && (
              <div className="text-xs text-muted-foreground">
                Last Maintenance: {new Date(vehicle.last_maintenance).toLocaleDateString()}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
