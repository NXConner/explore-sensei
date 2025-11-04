import { WallpaperPreset, WallpaperPresetId } from "./types";

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: "mission-grid",
    name: "Mission Grid",
    description: "Tactical grid overlay with warm command-center glow.",
    kind: "gradient",
    gradient:
      "radial-gradient(circle at 20% 20%, rgba(255,128,0,0.24) 0%, rgba(12,15,24,0.92) 55%, rgba(2,4,10,0.98) 100%)",
    previewColor: "#ff8000",
    recommendedThemes: ["tactical-dark", "division-shd", "isac-core"],
    defaultOpacity: 70,
  },
  {
    id: "sanctuary-dawn",
    name: "Sanctuary Dawn",
    description: "Soft sunrise gradient ideal for Sunday schedules and church dashboards.",
    kind: "gradient",
    gradient:
      "linear-gradient(135deg, rgba(255,201,173,0.72) 0%, rgba(164,216,238,0.68) 52%, rgba(42,82,152,0.82) 100%)",
    previewColor: "#f8af94",
    recommendedThemes: ["industry-blue", "light", "safety-green"],
    defaultOpacity: 65,
  },
  {
    id: "night-ops-grid",
    name: "Night Ops",
    description: "Deep blues with cyan tracer lines for after-dark sealcoating runs.",
    kind: "gradient",
    gradient:
      "radial-gradient(circle at 10% 10%, rgba(0,156,255,0.32) 0%, rgba(4,12,24,0.97) 50%, rgba(1,6,14,1) 100%)",
    previewColor: "#009cff",
    recommendedThemes: ["night-ops", "aviation", "security"],
    defaultOpacity: 72,
  },
  {
    id: "nav-blueprint",
    name: "Blueprint",
    description: "Navigation blueprint with gridlines to plan striping layouts.",
    kind: "image",
    url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
    previewColor: "#1f4ea1",
    recommendedThemes: ["industry-blue", "security", "aviation"],
    defaultOpacity: 68,
    saturation: 0.85,
  },
  {
    id: "ember-gold",
    name: "Ember Gold",
    description: "Smoldering amber glow for high-energy sales pushes.",
    kind: "gradient",
    gradient:
      "linear-gradient(135deg, rgba(255,112,0,0.65) 0%, rgba(12,8,4,0.94) 68%, rgba(0,0,0,0.98) 100%)",
    previewColor: "#ff7000",
    recommendedThemes: ["construction", "rogue-agent", "contaminated"],
    defaultOpacity: 75,
  },
  {
    id: "stormsetter",
    name: "Stormsetter",
    description: "Dynamic clouds and cyan lightning accents for weather readiness dashboards.",
    kind: "image",
    url: "https://images.unsplash.com/photo-1501973801540-537f08ccae7b?auto=format&fit=crop&w=1600&q=80",
    previewColor: "#38bdf8",
    recommendedThemes: ["dark-zone", "dark-zone-faithful", "safety-green"],
    defaultOpacity: 62,
    blur: 2,
  },
  {
    id: "revival",
    name: "Revival",
    description: "Church sanctuary interior with warm lighting and depth.",
    kind: "image",
    url: "https://images.unsplash.com/photo-1455778976758-17b3a84b7054?auto=format&fit=crop&w=1600&q=80",
    previewColor: "#d1a575",
    recommendedThemes: ["industry-blue", "light", "construction"],
    defaultOpacity: 55,
  },
  {
    id: "steelworks",
    name: "Steelworks",
    description: "Industrial texture overlay for equipment maintenance hubs.",
    kind: "image",
    url: "https://images.unsplash.com/photo-1437419764061-2473afe69fc2?auto=format&fit=crop&w=1600&q=80",
    previewColor: "#8892a4",
    recommendedThemes: ["black-tusk", "security", "aviation"],
    defaultOpacity: 58,
  },
  {
    id: "uplift",
    name: "Uplift",
    description: "Diagonal teal and amber gradient celebrating volunteer crews and donors.",
    kind: "gradient",
    gradient:
      "linear-gradient(120deg, rgba(16,185,129,0.42) 0%, rgba(56,189,248,0.42) 50%, rgba(250,204,21,0.55) 100%)",
    previewColor: "#38bdf8",
    recommendedThemes: ["safety-green", "industry-blue", "light"],
    defaultOpacity: 64,
  },
  {
    id: "legacy",
    name: "Legacy Marble",
    description: "Stone texture for executive dashboards and board meeting prep.",
    kind: "image",
    url: "https://images.unsplash.com/photo-1505849864904-01c3173c6b30?auto=format&fit=crop&w=1600&q=80",
    previewColor: "#a7b4c9",
    recommendedThemes: ["light", "industry-blue", "construction"],
    defaultOpacity: 60,
  },
];

export function getWallpaperPreset(id?: WallpaperPresetId | null): WallpaperPreset | undefined {
  if (!id) return undefined;
  return WALLPAPER_PRESETS.find((preset) => preset.id === id);
}

export function listWallpaperPresets(): WallpaperPreset[] {
  return WALLPAPER_PRESETS;
}
