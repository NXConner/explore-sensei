import React, { useState } from "react";
import { Crosshair, Minus, Circle, Square, Ruler, Trash2, Plus, MapPin, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMap } from "@/components/map/MapContext";
import { useMapDrawing, DrawingMode } from "@/hooks/useMapDrawing";
import { useJobSites } from "@/hooks/useJobSites";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { ClockInStatus } from "@/components/time/ClockInStatus";
import { MiniMap } from "@/components/hud/MiniMap";
import { JobStatusLegend } from "@/components/map/JobStatusLegend";
import { cn } from "@/lib/utils";

type LeftSidebarProps = { side?: "left" | "right"; layoutMode?: "floating" | "docked" };

export const LeftSidebar = ({ side = "left", layoutMode = "floating" }: LeftSidebarProps) => {
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
  // Enhance button moved to TopBar; keep state in case other panels listen
  const [enhanceOpen, setEnhanceOpen] = useState(false);
  React.useEffect(() => {
    const handler = (e: any) => setEnhanceOpen(!!e?.detail?.open);
    window.addEventListener('enhance-panel-state', handler as any);
    return () => window.removeEventListener('enhance-panel-state', handler as any);
  }, []);

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

  const chromeSurface =
    "hud-element border-primary/20 bg-[radial-gradient(circle_at_top,rgba(10,15,25,0.35),rgba(6,10,18,0.25))] supports-[backdrop-filter]:backdrop-blur-2xl shadow-[0_24px_60px_rgba(6,10,18,0.3)]";
  const isDocked = layoutMode === "docked";
  const borderClass = side === "left" ? "border-r" : "border-l";
  const positionClass = isDocked
    ? "sticky top-[84px]"
    : `absolute ${side === "left" ? "left-0" : "right-0"} top-[84px] bottom-16`;
  const baseShell = cn(
    positionClass,
    borderClass,
    "z-[var(--z-sidebars)] pointer-events-auto",
    chromeSurface,
    isDocked && "flex-shrink-0 max-h-[calc(100vh-84px-64px)] h-[calc(100vh-84px-64px)]",
  );
  if (isMinimized) {
    return (
      <div className={cn(baseShell, "w-12 flex items-center justify-center")}>
        <Button
          onClick={() => setIsMinimized(false)}
          variant="ghost"
          size="sm"
          className="h-12 w-10"
          aria-label="Expand sidebar"
        >
          {side === "left" ? <ChevronRight className="icon-md" /> : <ChevronLeft className="icon-md" />}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(baseShell, "w-80 flex flex-col overflow-hidden")}>
      {/* Tactical Header */}
      <div className="p-4 border-b border-primary/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair className="icon-md text-primary" />
            <h2 className="text-sm font-bold tracking-widest text-primary">TACTICAL COMMAND</h2>
          </div>
          <Button
            onClick={() => setIsMinimized(true)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Minimize"
            aria-label="Minimize sidebar"
          >
            {side === "right" ? <ChevronRight className="icon-sm" /> : <ChevronLeft className="icon-sm" />}
          </Button>
        </div>
      </div>

      <ScrollArea className={cn("flex-1 h-full", side === "left" ? "scrollbar-left" : "")}>
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
                aria-label={tool.label}
              >
                <tool.icon className="icon-sm" />
                <span className="text-xs">{tool.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Embedded Mini Map and Legend under Map Tools for right sidebar */}
        {side === 'right' && (
          <div className="m-2">
            {/* Ensure square mini map (same width and height) */}
            <MiniMap variant="embedded" className="w-full aspect-square" />
            <div className="mt-2">
              <JobStatusLegend variant="embedded" className="w-full" />
            </div>
          </div>
        )}

        {/* Active Job Sites */}
        <div className="tactical-panel m-2 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-primary">ACTIVE JOBS</h3>
            <Button size="sm" variant="ghost" className="h-6 px-2" aria-label="Add job">
              <Plus className="icon-sm" />
            </Button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent scrollbar-hover-visible">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="p-2 rounded bg-background/50 border border-primary/20 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <p className="text-xs font-bold">{job.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {job.client_name || "Client"}
                  </span>
                  <span className="text-xs text-primary">{job.progress}%</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-1 bg-primary/20 rounded overflow-hidden mt-2">
                  <div 
                    className="h-full bg-primary transition-all duration-300" 
                    style={{ width: `${job.progress}%` }}
                  />
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
                onCheckedChange={() => {
                  handleLayerToggle("darkZones");
                  try {
                    const evt = new CustomEvent('toggle-dark-zones', { detail: { enabled: !layersVisible.darkZones } });
                    window.dispatchEvent(evt);
                  } catch {}
                }}
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
