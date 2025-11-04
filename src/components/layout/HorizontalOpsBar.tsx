import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ClockInStatus } from "@/components/time/ClockInStatus";
import { Search, Car, Cloud, AlertTriangle, Users } from "lucide-react";
import type { DrawingMode } from "@/hooks/useMapDrawing";

interface HorizontalOpsBarProps {
  onModeChange?: (mode: DrawingMode) => void;
  activeMode?: DrawingMode;
  onClear?: () => void;
  onToggleTraffic?: () => void;
  showTraffic?: boolean;
  onToggleWeather?: () => void;
  showWeather?: boolean;
  onToggleDarkZones?: () => void;
  showDarkZones?: boolean;
  onToggleEquipment?: () => void;
  showEquipment?: boolean;
}

export const HorizontalOpsBar: React.FC<HorizontalOpsBarProps> = ({
  onToggleTraffic,
  showTraffic = false,
  onToggleWeather,
  showWeather = false,
  onToggleDarkZones,
  showDarkZones = false,
  onToggleEquipment,
  showEquipment = false,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    try {
      window.dispatchEvent(new CustomEvent("geocode-address", { detail: { query: q } }));
    } catch {}
  };

  return (
    <div className="absolute left-0 right-0 top-[48px] z-[var(--z-horizontal-ops)] hud-element border-b border-primary/30 bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-3 px-3 py-2">
        {/* Clock Status */}
        <ClockInStatus inline variant="compact" />

        <div className="w-px h-6 bg-primary/30" />

        {/* Expanded Address Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 min-w-[320px]">
          <Input
            type="text"
            placeholder="Search address or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-sm"
          />
          <Button type="submit" size="sm" className="h-8 px-3" aria-label="Search location">
            <Search className="icon-sm" />
          </Button>
        </form>

        <div className="w-px h-6 bg-primary/30" />

        {/* Layer Toggles with Icons - Hide on small screens */}
        <div className="hidden md:flex items-center gap-4 flex-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
            <Checkbox 
              checked={showTraffic} 
              onCheckedChange={onToggleTraffic}
              className="border-2"
              aria-label="Toggle traffic layer"
            />
            <Car className="icon-sm" />
            <span className="hidden lg:inline">Traffic</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
            <Checkbox 
              checked={showWeather} 
              onCheckedChange={onToggleWeather}
              className="border-2"
              aria-label="Toggle weather layer"
            />
            <Cloud className="icon-sm" />
            <span className="hidden lg:inline">Weather</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
            <Checkbox 
              checked={showDarkZones} 
              onCheckedChange={onToggleDarkZones}
              className="border-2"
              aria-label="Toggle dark zones layer"
            />
            <AlertTriangle className="icon-sm" />
            <span className="hidden lg:inline">Dark Zones</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
            <Checkbox 
              checked={showEquipment} 
              onCheckedChange={onToggleEquipment}
              className="border-2"
              aria-label="Toggle equipment tracking"
            />
            <Users className="icon-sm" />
            <span className="hidden lg:inline">Equipment</span>
          </label>
        </div>
      </div>
    </div>
  );
};
