import React from "react";
import { Button } from "@/components/ui/button";
import { Ruler, Circle, Square, MapPin, Trash2, Save } from "lucide-react";
import { DrawingMode } from "@/hooks/useMapDrawing";

interface MapToolbarProps {
  onModeChange: (mode: DrawingMode) => void;
  onClear: () => void;
  onSave?: () => void;
  activeMode: DrawingMode;
}

export const MapToolbar = ({ onModeChange, onClear, onSave, activeMode }: MapToolbarProps) => {
  const tools = [
    { mode: "measure" as DrawingMode, icon: Ruler, label: "Measure Distance" },
    { mode: "circle" as DrawingMode, icon: Circle, label: "Measure Area (Circle)" },
    { mode: "rectangle" as DrawingMode, icon: Square, label: "Measure Area (Rectangle)" },
    { mode: "marker" as DrawingMode, icon: MapPin, label: "Add Marker" },
  ];

  return (
    <div className="absolute top-20 right-20 z-[1000] flex flex-col gap-2">
      {tools.map((tool) => (
        <Button
          key={tool.mode}
          variant={activeMode === tool.mode ? "default" : "outline"}
          size="icon"
          className="w-12 h-12 hud-element border-primary/30 hover:border-primary/50"
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
