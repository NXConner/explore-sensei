import { gradients } from "../tokens";
import { ThemeConfig } from "./types";

export const coreThemes: ThemeConfig[] = [
  {
    id: "tactical-dark",
    name: "Tactical Command",
    shortName: "Command",
    description: "Baseline SHD palette tuned for mission control overlays.",
    category: "core",
    mode: "dark",
    css: {
      "--primary": "30 100% 54%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "197 100% 62%",
      "--accent-foreground": "0 0% 10%",
      "--hud-grid-color": "rgba(255,111,15,0.16)",
      "--hud-grid-color-soft": "rgba(108,211,255,0.09)",
    },
    wallpaper: "tactical-command",
    accentGradient: gradients.command,
    badges: ["Command HUD"],
    tags: ["mission", "command", "hud"],
    hud: {
      gridColor: "rgba(255,111,15,0.16)",
      cornerAccent: "rgba(255,111,15,0.66)",
      glassTint: "rgba(14, 18, 28, 0.8)",
      glow: "rgba(255,111,15,0.35)",
    },
  },
  {
    id: "light",
    name: "Mission Briefing",
    description: "Bright neutral palette for daylight planning and invoicing.",
    category: "core",
    mode: "light",
    css: {
      "--primary": "27 94% 50%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "210 92% 46%",
      "--accent-foreground": "0 0% 100%",
      "--hud-grid-color": "rgba(27, 94, 255, 0.08)",
    },
    wallpaper: "sanctuary-dawn",
    accentGradient: gradients.sanctuary,
    tags: ["day", "finance"],
  },
];
