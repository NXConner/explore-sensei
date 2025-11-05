export type ThemeCategory =
  | "core"
  | "accessibility"
  | "industry"
  | "faithful"
  | "premium"
  | "limited";

export type ThemeId =
  | "tactical-dark"
  | "light"
  | "high-contrast"
  | "color-blind"
  | "colorblind-safe"
  | "industry-blue"
  | "safety-green"
  | "construction"
  | "landscaping"
  | "security"
  | "aviation"
  | "division-shd"
  | "dark-zone"
  | "black-tusk"
  | "division-shd-faithful"
  | "dark-zone-faithful"
  | "black-tusk-faithful"
  | "isac-core"
  | "hunter"
  | "rogue-agent"
  | "contaminated"
  | "night-ops";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  shortName?: string;
  description: string;
  category: ThemeCategory;
  cssVars: Record<string, string>;
  premium?: boolean;
  accessibility?: {
    highContrast?: boolean;
    colorBlindSafe?: boolean;
    recommendedFor?: string[];
  };
  wallpaper?: string;
  accentGradient?: string;
  badges?: string[];
  tags?: string[];
  hud?: {
    gridColor?: string;
    cornerAccent?: string;
    glassTint?: string;
    glow?: string;
  };
}

export type WallpaperPresetId =
  | "mission-grid"
  | "sanctuary-dawn"
  | "night-ops-grid"
  | "nav-blueprint"
  | "ember-gold"
  | "stormsetter"
  | "revival"
  | "steelworks"
  | "uplift"
  | "legacy"
  | "division-agent"
  | "rogue-agent"
  | "dark-zone"
  | "tech-specialist"
  | "stealth-operations"
  | "tactical-command"
  | "hunter-protocol"
  | "dark-zone-threat"
  | "custom";

export type WallpaperKind = "gradient" | "image";

export interface WallpaperPreset {
  id: WallpaperPresetId;
  name: string;
  description: string;
  kind: WallpaperKind;
  url?: string;
  gradient?: string;
  previewColor: string;
  credit?: string;
  tags?: string[];
  recommendedThemes?: ThemeId[];
  defaultOpacity?: number;
  brightness?: number;
  saturation?: number;
  blur?: number;
  source?: string;
}

export interface WallpaperSelection {
  presetId?: WallpaperPresetId;
  customUrl?: string;
  fileName?: string;
  kind?: WallpaperKind | "upload" | "none";
}

export interface DesignSpaceTokens {
  spacing: Record<string, number>;
  radii: Record<string, number>;
  shadows: Record<string, string>;
  typography: {
    fonts: Record<string, string>;
    sizes: Record<string, string>;
    weights: Record<string, number>;
    lineHeights: Record<string, string>;
  };
  zIndices: Record<string, number>;
  durations: Record<string, string>;
  blurs: Record<string, string>;
  gradients: Record<string, string>;
  breakpoints: Record<string, string>;
  noise?: Record<string, string>;
  backdrops?: Record<string, string>;
}

export interface MotionTokens {
  easings: Record<string, string>;
  durations: Record<string, string>;
  keyframes: Record<string, string>;
}
