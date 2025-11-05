import React, { useMemo, useState } from "react";
import { listThemeDefinitions, ThemeDefinition, ThemeId } from "@/design-system";
import { Input } from "@/components/ui/input";
import { ThemeSwatch } from "./ThemeSwatch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  value: ThemeId;
  onChange: (themeId: ThemeId) => void;
  premiumAccess?: boolean;
  className?: string;
  compact?: boolean;
}

const CATEGORY_ORDER: Array<ThemeDefinition["category"]> = [
  "core",
  "faithful",
  "limited",
  "industry",
  "premium",
  "accessibility",
];

const FILTER_PRESETS = [
  { id: "all", label: "All" },
  { id: "command", label: "Command" },
  { id: "field", label: "Field" },
  { id: "analytics", label: "Analytics" },
  { id: "lore", label: "Lore" },
  { id: "a11y", label: "A11y" },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  value,
  onChange,
  premiumAccess = false,
  className,
  compact,
}) => {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const definitions = useMemo(() => listThemeDefinitions(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return definitions.filter((definition) => {
      const matchesQuery =
        q.length === 0 ||
        [definition.name, definition.description, definition.tags?.join(" ") ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q);
      if (!matchesQuery) return false;
      if (activeFilter === "all") return true;
      return definition.tags?.some((tag) => tag.toLowerCase().includes(activeFilter));
    });
  }, [definitions, query, activeFilter]);

  const grouped = useMemo(() => {
    const map = new Map<ThemeDefinition["category"], ThemeDefinition[]>();
    filtered.forEach((definition) => {
      if (!premiumAccess && definition.premium) return;
      const items = map.get(definition.category) ?? [];
      items.push(definition);
      map.set(definition.category, items);
    });
    CATEGORY_ORDER.forEach((key) => {
      const items = map.get(key);
      if (items) {
        items.sort((a, b) => a.name.localeCompare(b.name));
      }
    });
    return map;
  }, [filtered, premiumAccess]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            Theme Library
          </div>
          <p className="text-xs text-muted-foreground/80">
            Division-inspired palettes with built-in wallpapers, grid overlays, and contrast tuning.
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto rounded-full border border-border/40 bg-background/70 p-1">
          {FILTER_PRESETS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition",
                activeFilter === filter.id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          type="search"
          placeholder="Search themes (hud, church, analytics, accessibility...)"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-9 border-border/50 bg-background/70 text-sm"
        />
        {activeFilter !== "all" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="border-border/50 bg-background/70 uppercase tracking-[0.28em]">
              Filter
            </Badge>
            <span className="uppercase tracking-[0.22em] text-muted-foreground/80">{activeFilter}</span>
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className="text-muted-foreground underline-offset-4 hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {CATEGORY_ORDER.map((category) => {
          const items = grouped.get(category);
          if (!items || items.length === 0) return null;
          return (
            <section key={category} className="space-y-4">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-border/40 bg-background/60 uppercase tracking-[0.32em]">
                    {categoryLabel(category)}
                  </Badge>
                  <p className="text-xs text-muted-foreground/80">
                    {renderCategoryCopy(category)}
                  </p>
                </div>
              </header>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((theme) => (
                  <ThemeSwatch
                    key={theme.id}
                    theme={theme}
                    selected={theme.id === value}
                    disabled={Boolean(theme.premium && !premiumAccess)}
                    onSelect={onChange}
                    compact={compact}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

const categoryLabel = (category: ThemeDefinition["category"]) => {
  switch (category) {
    case "core":
      return "Core Command";
    case "faithful":
      return "Lore Inspired";
    case "limited":
      return "Limited Drops";
    case "industry":
      return "Industry Verticals";
    case "premium":
      return "Premium Suites";
    case "accessibility":
      return "Accessibility";
    default:
      return category;
  }
};

const renderCategoryCopy = (category: ThemeDefinition["category"]) => {
  switch (category) {
    case "core":
      return "Baseline palettes for mission dashboards and executive briefings.";
    case "faithful":
      return "Lore-faithful skins staying true to The Division aesthetic.";
    case "limited":
      return "Seasonal drops tuned for alerts, night ops, and response drills.";
    case "industry":
      return "Optimised palettes for church, crew, fleet, and finance workflows.";
    case "premium":
      return "Premium suites unlock extended branding and compliance treatments.";
    case "accessibility":
      return "High-contrast and color-blind safe palettes for inclusive UX.";
    default:
      return "";
  }
};
