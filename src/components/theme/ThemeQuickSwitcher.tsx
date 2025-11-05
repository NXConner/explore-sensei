import React, { useEffect, useMemo, useState } from "react";
import { Palette } from "lucide-react";
import {
  ThemeId,
  listThemeDefinitions,
  getThemeDefinition,
  themeRegistry,
  defaultThemeId,
} from "@/design-system";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeSwatch } from "./ThemeSwatch";
import { applyThemeVariables, applyWallpaper, resolveWallpaperFromSettings } from "@/lib/theme";

interface ThemeQuickSwitcherProps {
  premiumAccess?: boolean;
  onOpenSettings?: () => void;
}

const CURATED_THEMES: ThemeId[] = [
  "tactical-dark",
  "division-shd",
  "dark-zone",
  "isac-core",
  "industry-blue",
  "high-contrast",
];

export const ThemeQuickSwitcher: React.FC<ThemeQuickSwitcherProps> = ({
  premiumAccess = false,
  onOpenSettings,
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(defaultThemeId);
  const [open, setOpen] = useState(false);

  const definitions = useMemo(() => listThemeDefinitions(), []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aos_settings");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.theme && themeRegistry.has(parsed.theme as ThemeId)) {
        setCurrentTheme(parsed.theme as ThemeId);
      }
    } catch {
      setCurrentTheme(defaultThemeId);
    }
  }, []);

  const quickThemes = useMemo(() => {
    const curated = CURATED_THEMES.map((id) => getThemeDefinition(id)).filter((theme) =>
      premiumAccess ? true : !theme.premium,
    );
    const extras = definitions
      .filter(
        (theme) => !curated.find((c) => c.id === theme.id) && (premiumAccess || !theme.premium),
      )
      .slice(0, 6 - curated.length);
    return [...curated, ...extras];
  }, [definitions, premiumAccess]);

  const handleSelect = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    try {
      const raw = localStorage.getItem("aos_settings");
      const payload = raw ? JSON.parse(raw) : {};
      payload.theme = themeId;
      localStorage.setItem("aos_settings", JSON.stringify(payload));
      window.dispatchEvent(new Event("aos_settings_updated"));
      const highContrast = Boolean(payload.highContrast);
      const forceDark = payload.darkMode ?? themeId !== "light";
      applyThemeVariables(themeId, { highContrast, forceDark });
      const wallpaper = resolveWallpaperFromSettings(payload);
      applyWallpaper(wallpaper, payload.wallpaperOpacity);
    } catch {
      applyThemeVariables(themeId);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 border border-primary/20 bg-background/40 backdrop-blur hover:border-primary/40 hover:bg-primary/10"
          title="Quick Theme Switcher"
        >
          <Palette className="h-4 w-4 text-primary" />
          <span className="sr-only">Open theme switcher</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] space-y-4 border-primary/20 bg-background/95 p-4 shadow-xl shadow-primary/15">
        <header className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/70">
              Theme Switcher
            </div>
            <p className="text-xs text-muted-foreground/80">
              Rotate between command, analytics, and accessibility skins.
            </p>
          </div>
          <Button
            variant="link"
            size="sm"
            className="px-0 text-xs uppercase tracking-wide text-primary"
            onClick={() => {
              setOpen(false);
              onOpenSettings?.();
            }}
          >
            Manage
          </Button>
        </header>
        <div className="grid grid-cols-1 gap-3">
          {quickThemes.map((theme) => (
            <ThemeSwatch
              key={theme.id}
              theme={theme}
              selected={theme.id === currentTheme}
              disabled={Boolean(theme.premium && !premiumAccess)}
              onSelect={handleSelect}
              compact
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
