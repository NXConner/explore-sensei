import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ClockInStatus } from "@/components/time/ClockInStatus";
import { MapPin, Minus, Circle, Square, Ruler, Trash2 } from "lucide-react";
import type { DrawingMode } from "@/hooks/useMapDrawing";

export const HorizontalOpsBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeDrawingMode, setActiveDrawingMode] = React.useState<DrawingMode>(null);
  const [layers, setLayers] = React.useState({
    traffic: false,
    weather: false,
    darkZones: false,
    equipment: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    try {
      window.dispatchEvent(new CustomEvent("geocode-address", { detail: { query: q } }));
    } catch {}
  };

  const setMode = (mode: DrawingMode) => {
    setActiveDrawingMode(mode);
    try {
      window.dispatchEvent(new CustomEvent("set-drawing-mode", { detail: { mode } }));
    } catch {}
  };

  const clear = () => {
    setActiveDrawingMode(null);
    try {
      window.dispatchEvent(new Event("clear-drawings"));
    } catch {}
  };

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        if (key === "traffic") window.dispatchEvent(new Event("toggle-traffic"));
        if (key === "weather") window.dispatchEvent(new Event("toggle-weather-radar"));
        if (key === "darkZones") {
          window.dispatchEvent(new CustomEvent("toggle-dark-zones", { detail: { enabled: next.darkZones } }));
        }
        if (key === "equipment") window.dispatchEvent(new Event("toggle-employee-tracking"));
      } catch {}
      return next;
    });
  };

  return (
    <div className="absolute left-0 right-0 top-[56px] z-[995] hud-element border-b border-primary/30 bg-background/70 backdrop-blur">
      <div className="flex items-center gap-3 px-2 py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
        {/* Clock in/out */}
        <ClockInStatus inline variant="compact" />

        {/* Divider */}
        <div className="w-px h-6 bg-primary/30" />

        {/* Address Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 min-w-[260px]">
          <Input
            type="text"
            placeholder="Enter address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs"
          />
          <Button type="submit" size="sm" className="h-8 px-3">Search</Button>
        </form>

        {/* Divider */}
        <div className="w-px h-6 bg-primary/30" />

        {/* Map Tools */}
        <div className="flex items-center gap-1">
          <Button
            onClick={() => setMode("marker" as DrawingMode)}
            variant={activeDrawingMode === ("marker" as DrawingMode) ? "default" : "outline"}
            size="sm"
            className="h-8 px-2"
            title="Pin"
          >
            <MapPin className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setMode("polyline" as DrawingMode)}
            variant={activeDrawingMode === ("polyline" as DrawingMode) ? "default" : "outline"}
            size="sm"
            className="h-8 px-2"
            title="Line"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setMode("circle" as DrawingMode)}
            variant={activeDrawingMode === ("circle" as DrawingMode) ? "default" : "outline"}
            size="sm"
            className="h-8 px-2"
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setMode("rectangle" as DrawingMode)}
            variant={activeDrawingMode === ("rectangle" as DrawingMode) ? "default" : "outline"}
            size="sm"
            className="h-8 px-2"
            title="Area"
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setMode("measure" as DrawingMode)}
            variant={activeDrawingMode === ("measure" as DrawingMode) ? "default" : "outline"}
            size="sm"
            className="h-8 px-2"
            title="Measure"
          >
            <Ruler className="w-4 h-4" />
          </Button>
          <Button onClick={clear} variant="ghost" size="sm" className="h-8 px-2" title="Clear">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-primary/30" />

        {/* Layers */}
        <div className="flex items-center gap-3 pr-2">
          <label className="flex items-center gap-2 text-xs">
            <Checkbox checked={layers.traffic} onCheckedChange={() => toggleLayer("traffic")} />
            Traffic
          </label>
          <label className="flex items-center gap-2 text-xs">
            <Checkbox checked={layers.weather} onCheckedChange={() => toggleLayer("weather")} />
            Weather
          </label>
          <label className="flex items-center gap-2 text-xs">
            <Checkbox checked={layers.darkZones} onCheckedChange={() => toggleLayer("darkZones")} />
            Dark Zones
          </label>
          <label className="flex items-center gap-2 text-xs">
            <Checkbox checked={layers.equipment} onCheckedChange={() => toggleLayer("equipment")} />
            Equipment
          </label>
        </div>
      </div>
    </div>
  );
};
