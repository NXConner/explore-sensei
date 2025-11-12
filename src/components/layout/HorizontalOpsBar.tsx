import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClockInStatus } from "@/components/time/ClockInStatus";
import { Search } from "lucide-react";
import type { DrawingMode } from "@/hooks/useMapDrawing";
import { cn } from "@/lib/utils";
import { useLayoutContext } from "@/context/LayoutContext";

interface HorizontalOpsBarProps {
  onModeChange?: (mode: DrawingMode) => void;
  activeMode?: DrawingMode;
  onClear?: () => void;
  className?: string;
}

export const HorizontalOpsBar: React.FC<HorizontalOpsBarProps> = ({
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
        "hud-element border-b border-primary/30 bg-background/60 backdrop-blur-lg supports-[backdrop-filter]:backdrop-blur-xl",
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

      </div>
    </div>
  );
};
