import { backdrops, noise } from "./tokens";
import { ThemeDefinition, ThemeId } from "./types";
import { allThemeConfigs, ThemeConfig } from "./theme-configs";

const sharedHud: Record<string, string> = {
  "--destructive": "0 86% 54%",
  "--destructive-foreground": "0 0% 100%",
  "--success": "133 68% 45%",
  "--success-foreground": "0 0% 10%",
  "--primary-glow": "30 100% 60%",
  "--radius": "0.75rem",
  "--hud-grid-size": "72px",
  "--hud-grid-color": "rgba(255,111,15,0.14)",
  "--hud-grid-color-soft": "rgba(108,211,255,0.08)",
  "--hud-noise-layer": noise?.fine ?? "transparent",
  "--glass-surface": backdrops.glass,
  "--holo-surface": backdrops.holo,
};

const baseDark: Record<string, string> = {
  "--background": "222 36% 6%",
  "--foreground": "210 24% 94%",
  "--card": "220 38% 8%",
  "--card-foreground": "210 24% 94%",
  "--popover": "220 38% 8%",
  "--popover-foreground": "210 24% 94%",
  "--muted": "220 24% 16%",
  "--muted-foreground": "215 18% 68%",
  "--border": "222 28% 18%",
  "--input": "222 28% 16%",
  "--ring": "30 100% 54%",
  "--sidebar-background": "222 32% 7%",
  "--sidebar-foreground": "210 24% 90%",
  "--sidebar-primary": "30 100% 54%",
  "--sidebar-primary-foreground": "0 0% 100%",
  "--sidebar-accent": "222 28% 12%",
  "--sidebar-accent-foreground": "210 24% 92%",
  "--sidebar-border": "222 28% 16%",
  "--sidebar-ring": "30 100% 54%",
};

const baseLight: Record<string, string> = {
  "--background": "210 48% 97%",
  "--foreground": "214 35% 20%",
  "--card": "0 0% 100%",
  "--card-foreground": "214 35% 18%",
  "--popover": "0 0% 100%",
  "--popover-foreground": "214 30% 18%",
  "--muted": "211 26% 92%",
  "--muted-foreground": "214 24% 32%",
  "--border": "210 22% 82%",
  "--input": "210 20% 88%",
  "--ring": "27 94% 50%",
  "--sidebar-background": "0 0% 100%",
  "--sidebar-foreground": "214 32% 18%",
  "--sidebar-primary": "27 94% 50%",
  "--sidebar-primary-foreground": "0 0% 100%",
  "--sidebar-accent": "210 22% 92%",
  "--sidebar-accent-foreground": "214 32% 24%",
  "--sidebar-border": "210 18% 84%",
  "--sidebar-ring": "27 94% 50%",
  "--hud-grid-color": "rgba(255,111,15,0.08)",
  "--hud-grid-color-soft": "rgba(30,144,255,0.08)",
};

const composeCssVariables = (mode: ThemeConfig["mode"], overrides: Record<string, string>) => ({
  ...sharedHud,
  ...(mode === "dark" ? baseDark : baseLight),
  ...overrides,
});

const hydrateTheme = (config: ThemeConfig): ThemeDefinition => ({
  id: config.id,
  name: config.name,
  shortName: config.shortName,
  description: config.description,
  category: config.category,
  cssVars: composeCssVariables(config.mode, config.css),
  premium: config.premium,
  wallpaper: config.wallpaper,
  accentGradient: config.accentGradient,
  badges: config.badges,
  tags: config.tags,
  accessibility: config.accessibility,
  hud: config.hud,
});

const themeDefinitions: ThemeDefinition[] = allThemeConfigs.map(hydrateTheme);

export const THEME_DEFINITIONS = themeDefinitions;

export const themeRegistry = new Map<ThemeId, ThemeDefinition>(
  themeDefinitions.map((definition) => [definition.id, definition]),
);

export const defaultThemeId: ThemeId = "tactical-dark";

export function getThemeDefinition(id: ThemeId): ThemeDefinition {
  return themeRegistry.get(id) ?? themeRegistry.get(defaultThemeId)!;
}

export function listThemeDefinitions(): ThemeDefinition[] {
  return THEME_DEFINITIONS;
}
