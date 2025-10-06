import { X, Truck, MapPin, Fuel, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface FleetModalProps {
  onClose: () => void;
}

const fleetVehicles = [
  {
    id: 1,
    name: "1978 Chevy C30",
    type: "Truck",
    status: "Active",
    location: "337 Ayers Orchard Rd, Stuart VA",
    fuel: "85%",
    equipment: "SK 550 Sealing Machine"
  },
  {
    id: 2,
    name: "1995 Dodge Dakota",
    type: "Truck",
    status: "Active",
    location: "Job Site #3",
    fuel: "60%",
    equipment: "8ft Utility Trailer"
  },
  {
    id: 3,
    name: "8ft Black Utility",
    type: "Trailer",
    status: "Available",
    location: "337 Ayers Orchard Rd, Stuart VA",
    fuel: "N/A",
    equipment: "Crack Machines, Blowers"
  },
  {
    id: 4,
    name: "10ft Black Utility",
    type: "Trailer",
    status: "Available",
    location: "337 Ayers Orchard Rd, Stuart VA",
    fuel: "N/A",
    equipment: "General Equipment"
  }
];

export const FleetModal = ({ onClose }: FleetModalProps) => {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[80vh] tactical-panel m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-bold text-primary uppercase tracking-wider">
              Fleet Management
            </h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {fleetVehicles.map((vehicle) => (
              <div key={vehicle.id} className="tactical-panel p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-primary/20 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{vehicle.name}</h3>
                      <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                    </div>
                  </div>
                  <Badge variant={vehicle.status === "Active" ? "default" : "secondary"}>
                    {vehicle.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{vehicle.location}</span>
                  </div>
                  
                  {vehicle.fuel !== "N/A" && (
                    <div className="flex items-center gap-2 text-sm">
                      <Fuel className="w-4 h-4 text-muted-foreground" />
                      <span>Fuel: {vehicle.fuel}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span>{vehicle.equipment}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="tactical-panel p-4">
            <h3 className="font-bold text-lg mb-3 text-primary">Fleet Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Vehicles</p>
                <p className="text-2xl font-bold text-primary">4</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-primary">2</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-primary">2</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Fuel</p>
                <p className="text-2xl font-bold text-primary">72%</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
