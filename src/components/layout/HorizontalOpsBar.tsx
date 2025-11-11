import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ClockInStatus } from "@/components/time/ClockInStatus";
import { Search, Car, Cloud, AlertTriangle, Users } from "lucide-react";
import type { DrawingMode } from "@/hooks/useMapDrawing";
import { cn } from "@/lib/utils";
import { useLayoutContext } from "@/context/LayoutContext";

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
  className?: string;
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
  className,
}) => {
  const { isMobile } = useLayoutContext();
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
    <div
      className={cn(
        "hud-element border-b border-primary/20 bg-[radial-gradient(circle_at_top,rgba(10,15,25,0.3),rgba(6,10,18,0.2))] backdrop-blur supports-[backdrop-filter]:backdrop-blur-2xl",
        isMobile
          ? "sticky top-[52px] z-[var(--z-horizontal-ops)] flex items-center gap-3 overflow-x-auto px-3 py-2"
          : "absolute left-0 right-0 top-[48px] z-[var(--z-horizontal-ops)]",
        className,
      )}
    >
      <div className={cn("flex items-center gap-3 px-3 py-2 w-full", isMobile && "min-w-max px-0")}>
          {/* Clock Status */}
          <ClockInStatus inline variant="compact" />

        <div className="hidden sm:block w-px h-6 bg-primary/30" />

        {/* Expanded Address Search */}
        <form
          onSubmit={handleSearch}
          className={cn(
            "flex items-center gap-2",
            isMobile ? "flex-1 min-w-[200px]" : "min-w-[320px]",
          )}
        >
          <Input
            type="text"
            placeholder="Search address or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-sm address-search-input"
          />
          <Button type="submit" size="sm" className="h-8 px-3 shrink-0" aria-label="Search location">
            <Search className="icon-sm" />
          </Button>
        </form>

        <div className={cn("h-6 bg-primary/30", isMobile ? "hidden" : "w-px")} />

        {/* Layer Toggles with Icons - Hide on small screens */}
        <div
          className={cn(
            "flex items-center gap-4 flex-1",
            isMobile ? "justify-end" : "hidden md:flex",
          )}
        >
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
