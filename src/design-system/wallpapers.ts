import { WallpaperPreset, WallpaperPresetId } from "./types";

const gradientPreset = (
  id: WallpaperPresetId,
  name: string,
  description: string,
  gradient: string,
  previewColor: string,
  extra?: Partial<WallpaperPreset>,
): WallpaperPreset => ({
  id,
  name,
  description,
  kind: "gradient",
  gradient,
  previewColor,
  ...extra,
});

const assetPreset = (
  id: WallpaperPresetId,
  name: string,
  description: string,
  assetPath: string,
  previewColor: string,
  extra?: Partial<WallpaperPreset>,
): WallpaperPreset => ({
  id,
  name,
  description,
  kind: "image",
  url: assetPath,
  source: assetPath,
  previewColor,
  ...extra,
});

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  assetPreset(
    "division-agent-grid",
    "Division Agent Grid",
    "SHD grid overlay with command-center glow and pulse arcs.",
    "/wallpapers/division-agent.svg",
    "#ff6f0f",
    {
      recommendedThemes: ["tactical-dark", "division-shd", "security"],
      defaultOpacity: 72,
      tags: ["command", "hud", "grid"],
    },
  ),
  assetPreset(
    "rogue-agent-grid",
    "Rogue Agent",
    "Hazard red flare with glitch streaks for escalation dashboards.",
    "/wallpapers/rogue-agent.svg",
    "#e63946",
    {
      recommendedThemes: ["rogue-agent", "contaminated", "construction"],
      defaultOpacity: 74,
      tags: ["alert", "incident"],
    },
  ),
  assetPreset(
    "dark-zone-holo",
    "Dark Zone Holo",
    "Low-visibility holographic rings for risk and threat monitoring.",
    "/wallpapers/dark-zone.svg",
    "#38bdf8",
    {
      recommendedThemes: ["dark-zone", "dark-zone-faithful", "security"],
      defaultOpacity: 68,
      tags: ["threat", "intel"],
    },
  ),
  assetPreset(
    "tech-specialist-grid",
    "Tech Specialist",
    "Cyan diagnostics grid for AI-assisted analytics consoles.",
    "/wallpapers/tech-specialist.svg",
    "#6cd3ff",
    {
      recommendedThemes: ["isac-core", "industry-blue", "aviation"],
      defaultOpacity: 70,
      tags: ["analytics", "ai"],
    },
  ),
  assetPreset(
    "stealth-operations-grid",
    "Stealth Operations",
    "Emerald sonar sweep built for overnight crew rotations.",
    "/wallpapers/stealth-operations.svg",
    "#3ab795",
    {
      recommendedThemes: ["night-ops", "safety-green", "landscaping"],
      defaultOpacity: 66,
      tags: ["stealth", "crew"],
    },
  ),
  assetPreset(
    "tactical-command-grid",
    "Tactical Command",
    "Amber holo rings with mission dossier corner brackets.",
    "/wallpapers/tactical-command.svg",
    "#ff964f",
    {
      recommendedThemes: ["tactical-dark", "division-shd", "construction"],
      defaultOpacity: 70,
      tags: ["mission", "briefing"],
    },
  ),
  assetPreset(
    "hunter-protocol-grid",
    "Hunter Protocol",
    "Precision concentric arcs for elite response readiness.",
    "/wallpapers/hunter-protocol.svg",
    "#ff6f0f",
    {
      recommendedThemes: ["hunter", "dark-zone", "security"],
      defaultOpacity: 74,
      tags: ["elite", "intel"],
    },
  ),
  assetPreset(
    "dark-zone-threat",
    "Dark Zone Threat",
    "Threat heatmap with dynamic sweep for incursion alerts.",
    "/wallpapers/dark-zone-threat.svg",
    "#e63946",
    {
      recommendedThemes: ["dark-zone", "rogue-agent", "contaminated"],
      defaultOpacity: 64,
      tags: ["threat", "alert"],
    },
  ),
  gradientPreset(
    "mission-grid",
    "Mission Grid",
    "Command-center radial glow with layered grid lines.",
    "radial-gradient(circle at 22% 18%, rgba(255,111,15,0.28) 0%, rgba(12,15,24,0.94) 58%, rgba(2,4,10,0.98) 100%)",
    "#ff6f0f",
    {
      recommendedThemes: ["tactical-dark", "division-shd", "security"],
      defaultOpacity: 70,
      tags: ["grid", "hud"],
    },
  ),
  gradientPreset(
    "sanctuary-dawn",
    "Sanctuary Dawn",
    "Soft sunrise palette for Sunday scheduling dashboards.",
    "linear-gradient(135deg, rgba(255,201,173,0.72) 0%, rgba(164,216,238,0.68) 52%, rgba(42,82,152,0.82) 100%)",
    "#f8af94",
    {
      recommendedThemes: ["industry-blue", "light", "safety-green"],
      defaultOpacity: 65,
      tags: ["church", "daylight"],
    },
  ),
  gradientPreset(
    "night-ops-grid",
    "Night Ops",
    "Deep blues with cyan tracer lines for after-dark runs.",
    "radial-gradient(circle at 10% 10%, rgba(0,156,255,0.32) 0%, rgba(4,12,24,0.97) 50%, rgba(1,6,14,1) 100%)",
    "#009cff",
    {
      recommendedThemes: ["night-ops", "aviation", "security"],
      defaultOpacity: 72,
      tags: ["night", "crew"],
    },
  ),
  assetPreset(
    "nav-blueprint",
    "Blueprint",
    "Navigation blueprint with gridlines for striping layouts.",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
    "#1f4ea1",
    {
      recommendedThemes: ["industry-blue", "security", "aviation"],
      defaultOpacity: 68,
      saturation: 0.85,
      tags: ["planning", "maps"],
    },
  ),
  gradientPreset(
    "ember-gold",
    "Ember Gold",
    "Smouldering amber glow for high-energy sales pushes.",
    "linear-gradient(135deg, rgba(255,112,0,0.65) 0%, rgba(12,8,4,0.94) 68%, rgba(0,0,0,0.98) 100%)",
    "#ff7000",
    {
      recommendedThemes: ["construction", "rogue-agent", "contaminated"],
      defaultOpacity: 75,
      tags: ["sales", "urgency"],
    },
  ),
  assetPreset(
    "stormsetter",
    "Stormsetter",
    "Dynamic cyan lightning accents for weather readiness dashboards.",
    "https://images.unsplash.com/photo-1501973801540-537f08ccae7b?auto=format&fit=crop&w=1600&q=80",
    "#38bdf8",
    {
      recommendedThemes: ["dark-zone", "dark-zone-faithful", "safety-green"],
      defaultOpacity: 62,
      blur: 2,
      tags: ["weather", "alert"],
    },
  ),
  assetPreset(
    "revival",
    "Revival",
    "Warm sanctuary lighting ideal for leadership briefings.",
    "https://images.unsplash.com/photo-1455778976758-17b3a84b7054?auto=format&fit=crop&w=1600&q=80",
    "#d1a575",
    {
      recommendedThemes: ["industry-blue", "light", "construction"],
      defaultOpacity: 55,
      tags: ["church", "board"],
    },
  ),
  assetPreset(
    "steelworks",
    "Steelworks",
    "Industrial texture overlay for fleet and equipment maintenance dashboards.",
    "https://images.unsplash.com/photo-1437419764061-2473afe69fc2?auto=format&fit=crop&w=1600&q=80",
    "#8892a4",
    {
      recommendedThemes: ["black-tusk", "security", "aviation"],
      defaultOpacity: 58,
      tags: ["maintenance", "fleet"],
    },
  ),
  gradientPreset(
    "uplift",
    "Uplift",
    "Diagonal teal and amber gradient celebrating volunteer crews and donors.",
    "linear-gradient(120deg, rgba(16,185,129,0.42) 0%, rgba(56,189,248,0.42) 50%, rgba(250,204,21,0.55) 100%)",
    "#38bdf8",
    {
      recommendedThemes: ["safety-green", "industry-blue", "light"],
      defaultOpacity: 64,
      tags: ["volunteer", "celebration"],
    },
  ),
  assetPreset(
    "legacy",
    "Legacy Marble",
    "Stone texture for executive dashboards and board meeting prep.",
    "https://images.unsplash.com/photo-1505849864904-01c3173c6b30?auto=format&fit=crop&w=1600&q=80",
    "#a7b4c9",
    {
      recommendedThemes: ["light", "industry-blue", "construction"],
      defaultOpacity: 60,
      tags: ["executive", "board"],
    },
  ),
];

export function getWallpaperPreset(id?: WallpaperPresetId | null): WallpaperPreset | undefined {
  if (!id) return undefined;
  return WALLPAPER_PRESETS.find((preset) => preset.id === id);
}

export function listWallpaperPresets(): WallpaperPreset[] {
  return WALLPAPER_PRESETS;
}
