import React, { useState } from "react";
import { X, MapPin, AlertTriangle, Wrench, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface IntelPOIModalProps {
  onClose: () => void;
}

export const IntelPOIModal = ({ onClose }: IntelPOIModalProps) => {
  const [layers, setLayers] = useState({
    hazards: true,
    vendors: true,
    safehouses: true,
    pois: true,
  });

  const hazards = [
    { id: 1, name: "Construction Zone", type: "hazard", lat: 40.7128, lng: -74.0060 },
    { id: 2, name: "Road Closure", type: "hazard", lat: 40.7589, lng: -73.9851 },
  ];

  const vendors = [
    { id: 3, name: "Home Depot", type: "vendor", lat: 40.7489, lng: -73.9680 },
    { id: 4, name: "Ace Hardware", type: "vendor", lat: 40.7614, lng: -73.9776 },
  ];

  const safehouses = [
    { id: 5, name: "Depot A", type: "safehouse", lat: 40.7506, lng: -73.9755 },
    { id: 6, name: "Depot B", type: "safehouse", lat: 40.7614, lng: -73.9846 },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "hazard":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "vendor":
        return <ShoppingBag className="w-4 h-4 text-primary" />;
      case "safehouse":
        return <Home className="w-4 h-4 text-success" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="tactical-panel w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">INTEL & POIs</h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Layer Controls */}
        <div className="p-4 border-b border-primary/30 grid grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="hazards"
              checked={layers.hazards}
              onCheckedChange={(checked) =>
                setLayers((prev) => ({ ...prev, hazards: checked as boolean }))
              }
            />
            <label htmlFor="hazards" className="text-sm cursor-pointer">
              Hazards
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="vendors"
              checked={layers.vendors}
              onCheckedChange={(checked) =>
                setLayers((prev) => ({ ...prev, vendors: checked as boolean }))
              }
            />
            <label htmlFor="vendors" className="text-sm cursor-pointer">
              Vendors
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="safehouses"
              checked={layers.safehouses}
              onCheckedChange={(checked) =>
                setLayers((prev) => ({ ...prev, safehouses: checked as boolean }))
              }
            />
            <label htmlFor="safehouses" className="text-sm cursor-pointer">
              Safehouses
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="pois"
              checked={layers.pois}
              onCheckedChange={(checked) =>
                setLayers((prev) => ({ ...prev, pois: checked as boolean }))
              }
            />
            <label htmlFor="pois" className="text-sm cursor-pointer">
              POIs
            </label>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          {layers.hazards && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-destructive mb-3">HAZARDS</h3>
              <div className="space-y-2">
                {hazards.map((item) => (
                  <div
                    key={item.id}
                    className="tactical-panel p-3 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {getIcon(item.type)}
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                        </p>
                      </div>
                      <Badge variant="destructive">Active</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {layers.vendors && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-primary mb-3">VENDORS</h3>
              <div className="space-y-2">
                {vendors.map((item) => (
                  <div
                    key={item.id}
                    className="tactical-panel p-3 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {getIcon(item.type)}
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                        </p>
                      </div>
                      <Badge>Nearby</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {layers.safehouses && (
            <div>
              <h3 className="text-sm font-bold text-success mb-3">SAFEHOUSES</h3>
              <div className="space-y-2">
                {safehouses.map((item) => (
                  <div
                    key={item.id}
                    className="tactical-panel p-3 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {getIcon(item.type)}
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                        </p>
                      </div>
                      <Badge className="bg-success/20 text-success border-success/30">
                        Secure
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};