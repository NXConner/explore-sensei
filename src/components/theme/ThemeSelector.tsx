import React, { useMemo, useState } from "react";
import { listThemeDefinitions, ThemeDefinition, ThemeId } from "@/design-system";
import { Input } from "@/components/ui/input";
import { ThemeSwatch } from "./ThemeSwatch";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  value: ThemeId;
  onChange: (themeId: ThemeId) => void;
  premiumAccess?: boolean;
  className?: string;
  compact?: boolean;
}

const GROUP_ORDER: Array<ThemeDefinition["category"]> = [
  "core",
  "accessibility",
  "industry",
  "faithful",
  "premium",
  "limited",
];

const GROUP_TITLES: Record<ThemeDefinition["category"], string> = {
  core: "Core Command",
  accessibility: "Accessibility",
  industry: "Industry Verticals",
  faithful: "Lore Inspired",
  premium: "Premium Suites",
  limited: "Limited Drops",
};

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  value,
  onChange,
  premiumAccess = false,
  className,
  compact,
}) => {
  const [query, setQuery] = useState("");

  const definitions = useMemo(() => listThemeDefinitions(), []);

  const groups = useMemo(() => {
    const next = new Map<ThemeDefinition["category"], ThemeDefinition[]>();
    definitions.forEach((definition) => {
      const shouldInclude = query
        ? [
            definition.name,
            definition.description,
            definition.tags?.join(" ") ?? "",
            definition.shortName ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())
        : true;
      if (!shouldInclude) return;
      const collection = next.get(definition.category) ?? [];
      collection.push(definition);
      next.set(definition.category, collection);
    });
    GROUP_ORDER.forEach((key) => {
      if (next.has(key)) {
        next.set(
          key,
          next.get(key)!.sort((a, b) => a.name.localeCompare(b.name)),
        );
      }
    });
    return next;
  }, [definitions, query]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Theme Palette
        </div>
        <Input
          type="search"
          placeholder="Search themes (church, crew, high contrast...)"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-9 border-border/50 bg-background/70 text-sm"
        />
      </div>

      <div className="space-y-8">
        {GROUP_ORDER.map((groupId) => {
          const items = groups.get(groupId);
          if (!items || items.length === 0) return null;
          return (
            <section key={groupId} className="space-y-3">
              <header className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">
                    {GROUP_TITLES[groupId] ?? groupId}
                  </div>
                  <p className="text-xs text-muted-foreground/80">
                    {groupId === "core" &&
                      "Baseline palettes for fast switching in mission control."}
                    {groupId === "accessibility" &&
                      "Optimised for contrast, readability, and assistive tech."}
                    {groupId === "industry" &&
                      "Tailored palettes for ministry, crews, and compliance workflows."}
                    {groupId === "faithful" &&
                      "Lore-inspired HUD skins for high immersion dashboards."}
                    {groupId === "premium" &&
                      "Unlock with Premium to enable industry-exclusive skins."}
                    {groupId === "limited" && "Seasonal drops to energise special campaigns."}
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
