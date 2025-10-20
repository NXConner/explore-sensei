import {
  Bot,
  Bell,
  Settings,
  MessageSquare,
  Navigation,
  Car,
  Eye,
  Scan,
  Users,
  Cloud,
  Ruler,
  Circle,
  Square,
  MapPin,
  Trash2,
  Save,
  Download,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DrawingMode } from "@/hooks/useMapDrawing";
<<<<<<< HEAD
import { Waves, Radio, FlameKindling, Layers } from "lucide-react";
=======
import { Waves, Radio, FlameKindling } from "lucide-react";
>>>>>>> origin/main

interface RightSidebarProps {
  onAIClick: () => void;
  onSettingsClick: () => void;
  onLocateMe?: () => void;
  onToggleTraffic?: () => void;
  showTraffic?: boolean;
  onToggleStreetView?: () => void;
  onAIDetect?: () => void;
  onToggleEmployeeTracking?: () => void;
  showEmployeeTracking?: boolean;
  onToggleWeatherRadar?: () => void;
  showWeatherRadar?: boolean;
<<<<<<< HEAD
  onToggleParcels?: () => void;
  showParcels?: boolean;
=======
  onImageryChange?: (mode: "none" | "naip" | "usgs") => void;
  imagery?: "none" | "naip" | "usgs";
>>>>>>> origin/main
  onModeChange?: (mode: DrawingMode) => void;
  activeMode?: DrawingMode;
  onClear?: () => void;
  onSave?: () => void;
  onExport?: () => void;
}

export const RightSidebar = ({
  onAIClick,
  onSettingsClick,
  onLocateMe,
  onToggleTraffic,
  showTraffic = false,
  onToggleStreetView,
  onAIDetect,
  onToggleEmployeeTracking,
  showEmployeeTracking = false,
  onToggleWeatherRadar,
  showWeatherRadar = false,
  onToggleParcels,
  showParcels = false,
  onModeChange,
  activeMode = null,
  onClear,
  onSave,
  onExport,
  onImageryChange,
  imagery = "none",
}: RightSidebarProps) => {
  const tools = [
    {
      mode: "measure" as DrawingMode,
      icon: Ruler,
      label: "Measure Distance",
      color: "text-primary",
    },
    {
      mode: "circle" as DrawingMode,
      icon: Circle,
      label: "Measure Area (Circle)",
      color: "text-primary",
    },
    {
      mode: "rectangle" as DrawingMode,
      icon: Square,
      label: "Measure Area (Rectangle)",
      color: "text-primary",
    },
    { mode: "marker" as DrawingMode, icon: MapPin, label: "Add Marker", color: "text-primary" },
  ];

  return (
    <div className="absolute right-0 top-16 bottom-16 w-16 z-[900] hud-element border-l border-primary/30 flex flex-col">
      <ScrollArea className="flex-1 h-full">
        <div className="flex flex-col items-center gap-2 p-2">
          {/* AI & Settings */}
          <Button
            onClick={onAIClick}
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/50 transition-all"
            title="AI Assistant"
          >
            <Bot className="w-5 h-5" />
          </Button>

          <Button
            onClick={onSettingsClick}
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/50 transition-all"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>

          <div className="h-px w-10 bg-primary/30 my-1" />

          {/* Map Controls */}
          {onLocateMe && (
            <Button
              variant="ghost"
              size="sm"
              className="w-12 h-12 p-0 hover:bg-blue-500/20 hover:text-blue-500 border border-transparent hover:border-blue-500/50 transition-all"
              onClick={onLocateMe}
              title="Locate Me"
            >
              <Navigation className="w-5 h-5 text-blue-500" />
            </Button>
          )}

          {onToggleTraffic && (
            <Button
              variant={showTraffic ? "default" : "ghost"}
              size="sm"
              className="w-12 h-12 p-0 hover:bg-orange-500/20 hover:text-orange-500 border border-transparent hover:border-orange-500/50 transition-all"
              onClick={onToggleTraffic}
              title="Toggle Traffic"
            >
              <Car className="w-5 h-5" />
            </Button>
          )}

          {onToggleStreetView && (
            <Button
              variant="ghost"
              size="sm"
              className="w-12 h-12 p-0 hover:bg-purple-500/20 hover:text-purple-500 border border-transparent hover:border-purple-500/50 transition-all"
              onClick={onToggleStreetView}
              title="Street View"
            >
              <Eye className="w-5 h-5 text-purple-500" />
            </Button>
          )}

          {onAIDetect && (
            <Button
              variant="ghost"
              size="sm"
              className="w-12 h-12 p-0 hover:bg-cyan-500/20 hover:text-cyan-500 border border-transparent hover:border-cyan-500/50 transition-all pulse"
              onClick={onAIDetect}
              title="AI Surface Detection"
            >
              <Scan className="w-5 h-5 text-cyan-500" />
            </Button>
          )}

          {onToggleEmployeeTracking && (
            <Button
              variant={showEmployeeTracking ? "default" : "ghost"}
              size="sm"
              className="w-12 h-12 p-0 hover:bg-green-500/20 hover:text-green-500 border border-transparent hover:border-green-500/50 transition-all"
              onClick={onToggleEmployeeTracking}
              title="Employee Tracking"
            >
              <Users className="w-5 h-5" />
            </Button>
          )}

          {onToggleWeatherRadar && (
            <Button
              variant={showWeatherRadar ? "default" : "ghost"}
              size="sm"
              className="w-12 h-12 p-0 hover:bg-sky-500/20 hover:text-sky-500 border border-transparent hover:border-sky-500/50 transition-all"
              onClick={onToggleWeatherRadar}
              title="Weather Radar"
            >
              <Cloud className="w-5 h-5 text-sky-500" />
            </Button>
          )}

<<<<<<< HEAD
          {onToggleParcels && (
            <Button
              variant={showParcels ? "default" : "ghost"}
              size="sm"
              className="w-12 h-12 p-0 hover:bg-emerald-500/20 hover:text-emerald-500 border border-transparent hover:border-emerald-500/50 transition-all"
              onClick={onToggleParcels}
              title="Parcels Overlay"
            >
              <Layers className="w-5 h-5 text-emerald-500" />
            </Button>
          )}

=======
<<<<<<< HEAD
          {onImageryChange && (
            <>
              <div className="h-px w-10 bg-primary/30 my-1" />
              <Button
                variant={imagery === "none" ? "default" : "ghost"}
                size="sm"
                className="w-12 h-12 p-0"
                onClick={() => onImageryChange("none")}
                title="Base Map"
              >
                BM
              </Button>
              <Button
                variant={imagery === "naip" ? "default" : "ghost"}
                size="sm"
                className="w-12 h-12 p-0"
                onClick={() => onImageryChange("naip")}
                title="NAIP Imagery"
              >
                N
              </Button>
              <Button
                variant={imagery === "usgs" ? "default" : "ghost"}
                size="sm"
                className="w-12 h-12 p-0"
                onClick={() => onImageryChange("usgs")}
                title="USGS Imagery"
              >
                U
              </Button>
            </>
          )}
=======
>>>>>>> origin/main
          {/* Suitability Overlay (hazard/ok tint) */}
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 hover:bg-red-500/20 hover:text-red-500 border border-transparent hover:border-red-500/50 transition-all"
            onClick={() => {
              const evt = new CustomEvent('toggle-suitability', { detail: {} });
              window.dispatchEvent(evt);
            }}
            title="Suitability Overlay"
          >
            <Waves className="w-5 h-5" />
          </Button>

          {/* Pulse Scan */}
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 hover:bg-cyan-500/20 hover:text-cyan-500 border border-transparent hover:border-cyan-500/50 transition-all"
            onClick={() => {
              const evt = new CustomEvent('toggle-pulse-scan', { detail: {} });
              window.dispatchEvent(evt);
            }}
            title="Pulse Scan"
          >
            <Radio className="w-5 h-5" />
          </Button>

          {/* Heatmap */}
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 hover:bg-amber-500/20 hover:text-amber-500 border border-transparent hover:border-amber-500/50 transition-all"
            onClick={() => {
              const evt = new CustomEvent('toggle-heatmap', { detail: {} });
              window.dispatchEvent(evt);
            }}
            title="Heatmap"
          >
            <FlameKindling className="w-5 h-5" />
          </Button>

          {/* Dark Zones Editor */}
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 hover:bg-red-500/20 hover:text-red-500 border border-transparent hover:border-red-500/50 transition-all"
            onClick={() => {
              const evt = new CustomEvent('open-dark-zone-editor', { detail: {} });
              window.dispatchEvent(evt);
            }}
            title="Edit Dark Zones"
          >
            <Pencil className="w-5 h-5" />
          </Button>

          {/* Suitability Overlay (hazard/ok tint) */}
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 hover:bg-red-500/20 hover:text-red-500 border border-transparent hover:border-red-500/50 transition-all"
            onClick={() => {
              const evt = new CustomEvent('toggle-suitability', { detail: {} });
              window.dispatchEvent(evt);
            }}
            title="Suitability Overlay"
          >
            <Waves className="w-5 h-5" />
          </Button>

          {/* Pulse Scan */}
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 hover:bg-cyan-500/20 hover:text-cyan-500 border border-transparent hover:border-cyan-500/50 transition-all"
            onClick={() => {
              const evt = new CustomEvent('toggle-pulse-scan', { detail: {} });
              window.dispatchEvent(evt);
            }}
            title="Pulse Scan"
          >
            <Radio className="w-5 h-5" />
          </Button>
>>>>>>> origin/main

          {onModeChange && (
            <>
              <div className="h-px w-10 bg-primary/30 my-1" />

              {/* Drawing Tools */}
              {tools.map((tool) => (
                <Button
                  key={tool.mode}
                  variant={activeMode === tool.mode ? "default" : "ghost"}
                  size="sm"
                  className="w-12 h-12 p-0 hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/50 transition-all"
                  onClick={() => onModeChange(activeMode === tool.mode ? null : tool.mode)}
                  title={tool.label}
                >
                  <tool.icon className={`w-5 h-5 ${tool.color}`} />
                </Button>
              ))}
            </>
          )}

          {(onSave || onClear || onExport) && (
            <>
              <div className="h-px w-10 bg-primary/30 my-1" />

              {onSave && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 p-0 hover:bg-green-500/20 hover:text-green-500 border border-transparent hover:border-green-500/50 transition-all"
                  onClick={onSave}
                  title="Save Measurement"
                >
                  <Save className="w-5 h-5 text-green-500" />
                </Button>
              )}

              {onClear && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 p-0 hover:bg-red-500/20 hover:text-red-500 border border-transparent hover:border-red-500/50 transition-all"
                  onClick={onClear}
                  title="Clear Drawings"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </Button>
              )}

              {onExport && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 p-0 hover:bg-blue-500/20 hover:text-blue-500 border border-transparent hover:border-blue-500/50 transition-all"
                  onClick={onExport}
                  title="Export Measurements"
                >
                  <Download className="w-5 h-5 text-blue-500" />
                </Button>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
