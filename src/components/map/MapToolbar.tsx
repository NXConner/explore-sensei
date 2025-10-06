import React from "react";
import { Button } from "@/components/ui/button";
import { Ruler, Circle, Square, MapPin, Trash2, Save, Navigation, Car, Eye, Scan } from "lucide-react";
import { DrawingMode } from "@/hooks/useMapDrawing";

interface MapToolbarProps {
  onModeChange: (mode: DrawingMode) => void;
  onClear: () => void;
  onSave?: () => void;
  activeMode: DrawingMode;
  onLocateMe?: () => void;
  onToggleTraffic?: () => void;
  showTraffic?: boolean;
  onToggleStreetView?: () => void;
  onAIDetect?: () => void;
}

export const MapToolbar = ({ 
  onModeChange, 
  onClear, 
  onSave, 
  activeMode,
  onLocateMe,
  onToggleTraffic,
  showTraffic = false,
  onToggleStreetView,
  onAIDetect
}: MapToolbarProps) => {
  const tools = [
    { mode: "measure" as DrawingMode, icon: Ruler, label: "Measure Distance" },
    { mode: "circle" as DrawingMode, icon: Circle, label: "Measure Area (Circle)" },
    { mode: "rectangle" as DrawingMode, icon: Square, label: "Measure Area (Rectangle)" },
    { mode: "marker" as DrawingMode, icon: MapPin, label: "Add Marker" },
  ];

  return (
    <div className="absolute top-20 right-4 md:right-20 z-[1000] flex flex-col gap-2">
      {onLocateMe && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 hud-element border-blue-500/30 hover:border-blue-500/50 transition-all animate-fade-in"
            onClick={onLocateMe}
            title="Locate Me"
          >
            <Navigation className="w-5 h-5 text-blue-500" />
          </Button>
          
          {onToggleTraffic && (
            <Button
              variant={showTraffic ? "default" : "outline"}
              size="icon"
              className="w-12 h-12 hud-element border-orange-500/30 hover:border-orange-500/50 transition-all animate-fade-in"
              onClick={onToggleTraffic}
              title="Toggle Traffic"
            >
              <Car className="w-5 h-5" />
            </Button>
          )}

          {onToggleStreetView && (
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 hud-element border-purple-500/30 hover:border-purple-500/50 transition-all animate-fade-in"
              onClick={onToggleStreetView}
              title="Street View"
            >
              <Eye className="w-5 h-5 text-purple-500" />
            </Button>
          )}

          {onAIDetect && (
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 hud-element border-cyan-500/30 hover:border-cyan-500/50 transition-all animate-fade-in pulse"
              onClick={onAIDetect}
              title="AI Surface Detection"
            >
              <Scan className="w-5 h-5 text-cyan-500" />
            </Button>
          )}
          
          <div className="h-px bg-primary/30 my-2" />
        </>
      )}
      
      {tools.map((tool) => (
        <Button
          key={tool.mode}
          variant={activeMode === tool.mode ? "default" : "outline"}
          size="icon"
          className="w-12 h-12 hud-element border-primary/30 hover:border-primary/50 transition-all hover-scale"
          onClick={() => onModeChange(activeMode === tool.mode ? null : tool.mode)}
          title={tool.label}
        >
          <tool.icon className="w-5 h-5" />
        </Button>
      ))}
      
      <div className="h-px bg-primary/30 my-2" />
      
      {onSave && (
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 hud-element border-green-500/30 hover:border-green-500/50"
          onClick={onSave}
          title="Save Measurement"
        >
          <Save className="w-5 h-5 text-green-500" />
        </Button>
      )}
      
      <Button
        variant="outline"
        size="icon"
        className="w-12 h-12 hud-element border-red-500/30 hover:border-red-500/50"
        onClick={onClear}
        title="Clear Drawings"
      >
        <Trash2 className="w-5 h-5 text-red-500" />
      </Button>
    </div>
  );
};
