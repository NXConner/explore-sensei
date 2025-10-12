import React, { useState } from "react";
import { Crosshair, Minus, Circle, Square, Ruler, Trash2, Plus, MapPin, ChevronLeft, ChevronRight, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMap } from "@/components/map/MapContext";
import { useMapDrawing, DrawingMode } from "@/hooks/useMapDrawing";
import { useJobSites } from "@/hooks/useJobSites";
import { useAddressSearch } from "@/hooks/useAddressSearch";

export const LeftSidebar = () => {
  const { map } = useMap();
  const { setDrawingMode, clearDrawings, initializeDrawingManager } = useMapDrawing(map);
  const { data: jobSites } = useJobSites();
  const { searchQuery, setSearchQuery, flyToAddress } = useAddressSearch(map);
  const [activeDrawingMode, setActiveDrawingMode] = useState<DrawingMode>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [layersVisible, setLayersVisible] = useState({
    traffic: false,
    weather: false,
    darkZones: false,
    equipment: true,
  });
  const [showEnhance, setShowEnhance] = useState(false);

  React.useEffect(() => {
    if (map) {
      initializeDrawingManager();
    }
  }, [map, initializeDrawingManager]);

  const drawingTools = [
    { id: "marker" as DrawingMode, icon: MapPin, label: "Pin" },
    { id: "polyline" as DrawingMode, icon: Minus, label: "Line" },
    { id: "circle" as DrawingMode, icon: Circle, label: "Circle" },
    { id: "rectangle" as DrawingMode, icon: Square, label: "Area" },
    { id: "measure" as DrawingMode, icon: Ruler, label: "Measure" },
    { id: null, icon: Trash2, label: "Clear" },
  ];

  const handleToolClick = (toolId: DrawingMode) => {
    if (toolId === null) {
      clearDrawings();
      setActiveDrawingMode(null);
    } else {
      setDrawingMode(toolId);
      setActiveDrawingMode(toolId);
    }
  };

  const handleLayerToggle = (layer: keyof typeof layersVisible) => {
    setLayersVisible((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      flyToAddress(searchQuery);
    }
  };

  const activeJobs = jobSites?.filter((job) => job.status === "In Progress") || [];

  if (isMinimized) {
    return (
      <div className="absolute left-0 top-16 bottom-16 w-12 z-[900] hud-element border-r border-primary/30 flex items-center justify-center">
        <Button
          onClick={() => setIsMinimized(false)}
          variant="ghost"
          size="sm"
          className="h-12 w-10"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-16 bottom-16 w-72 z-[900] hud-element border-r border-primary/30 flex flex-col">
      {/* Minimize Button */}
      <div className="flex items-center justify-between p-2 border-b border-primary/30 flex-shrink-0">
        <Button
          onClick={() => setIsMinimized(true)}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Minimize"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {/* Enhance button moved per HUD plan */}
        <Button
          onClick={() => setShowEnhance((v) => !v)}
          variant={showEnhance ? "default" : "ghost"}
          size="sm"
          className="h-8 px-2 gap-1"
          title="Visibility Controls"
        >
          <Eye className="w-4 h-4" />
          <span className="text-xs">Enhance</span>
        </Button>
      </div>

      <ScrollArea className="flex-1 h-full">
        {/* Address Search */}
        <div className="tactical-panel m-2 p-4">
          <h3 className="text-xs font-bold text-primary mb-3">ADDRESS SEARCH</h3>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-xs h-8"
            />
            <Button type="submit" size="sm" className="h-8 w-8 p-0">
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Visibility Controls Slideout */}
        {showEnhance && (
          <div className="tactical-panel m-2 p-4">
            <h3 className="text-xs font-bold text-primary mb-3">VISIBILITY CONTROLS</h3>
            <div className="space-y-3">
              {/* Lightweight toggles redirecting to the floating panel trigger */}
              <p className="text-[11px] text-muted-foreground">Use the floating Enhance panel for detailed adjustments.</p>
            </div>
          </div>
        )}

        {/* Drawing Tools */}
        <div className="tactical-panel m-2 p-4">
          <h3 className="text-xs font-bold text-primary mb-3">MAP TOOLS</h3>
          <div className="grid grid-cols-3 gap-2">
            {drawingTools.map((tool) => (
              <Button
                key={tool.label}
                onClick={() => handleToolClick(tool.id)}
                variant={activeDrawingMode === tool.id ? "default" : "outline"}
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <tool.icon className="w-4 h-4" />
                <span className="text-xs">{tool.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Active Job Sites */}
        <div className="tactical-panel m-2 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-primary">ACTIVE JOBS</h3>
            <Button size="sm" variant="ghost" className="h-6 px-2">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="p-2 rounded bg-background/50 border border-primary/20 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <p className="text-xs font-bold">{job.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{job.client_name || "Client"}</span>
                  <span className="text-xs text-primary">{job.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Layers */}
        <div className="tactical-panel m-2 p-4">
          <h3 className="text-xs font-bold text-primary mb-3">MAP LAYERS</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="traffic"
                checked={layersVisible.traffic}
                onCheckedChange={() => handleLayerToggle("traffic")}
              />
              <label htmlFor="traffic" className="text-xs cursor-pointer">
                Traffic Overlay
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="weather"
                checked={layersVisible.weather}
                onCheckedChange={() => handleLayerToggle("weather")}
              />
              <label htmlFor="weather" className="text-xs cursor-pointer">
                Weather Zones
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="darkZones"
                checked={layersVisible.darkZones}
                onCheckedChange={() => handleLayerToggle("darkZones")}
              />
              <label htmlFor="darkZones" className="text-xs cursor-pointer">
                Dark Zones
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="equipment"
                checked={layersVisible.equipment}
                onCheckedChange={() => handleLayerToggle("equipment")}
              />
              <label htmlFor="equipment" className="text-xs cursor-pointer">
                Equipment Tracking
              </label>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
