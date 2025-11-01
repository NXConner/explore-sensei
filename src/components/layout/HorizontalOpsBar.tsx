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
    <div className="absolute left-0 right-0 top-[48px] z-[995] hud-element border-b border-primary/30 bg-background/80 backdrop-blur-md">
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
          <Button type="submit" size="sm" className="h-8 px-3">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        <div className="w-px h-6 bg-primary/30" />

        {/* Layer Toggles with Icons */}
        <div className="flex items-center gap-4 flex-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
            <Checkbox 
              checked={showTraffic} 
              onCheckedChange={onToggleTraffic}
              className="border-2"
            />
            <Car className="w-4 h-4" />
            <span>Traffic</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
            <Checkbox 
              checked={showWeather} 
              onCheckedChange={onToggleWeather}
              className="border-2"
            />
            <Cloud className="w-4 h-4" />
            <span>Weather</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
            <Checkbox 
              checked={showDarkZones} 
              onCheckedChange={onToggleDarkZones}
              className="border-2"
            />
            <AlertTriangle className="w-4 h-4" />
            <span>Dark Zones</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
            <Checkbox 
              checked={showEquipment} 
              onCheckedChange={onToggleEquipment}
              className="border-2"
            />
            <Users className="w-4 h-4" />
            <span>Equipment</span>
          </label>
        </div>
      </div>
    </div>
  );
};
