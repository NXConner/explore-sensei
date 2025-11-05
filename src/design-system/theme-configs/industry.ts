import { gradients } from "../tokens";
import { ThemeConfig } from "./types";

export const industryThemes: ThemeConfig[] = [
  {
    id: "industry-blue",
    name: "Operations Navy",
    description: "Corporate-ready navy with amber accents for executive dashboards.",
    category: "industry",
    mode: "dark",
    css: {
      "--primary": "211 100% 45%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "39 100% 50%",
      "--accent-foreground": "0 0% 12%",
      "--background": "220 20% 9%",
      "--hud-grid-color": "rgba(39,120,255,0.16)",
    },
    wallpaper: "nav-blueprint",
    accentGradient: gradients.focus,
    tags: ["executive", "reporting"],
  },
  {
    id: "safety-green",
    name: "Crew Steward",
    description: "High-visibility palette for field crews and volunteer coordination.",
    category: "industry",
    mode: "dark",
    css: {
      "--primary": "131 82% 46%",
      "--primary-foreground": "0 0% 10%",
      "--accent": "31 100% 54%",
      "--accent-foreground": "0 0% 12%",
      "--background": "140 12% 7%",
    },
    wallpaper: "stealth-operations",
    tags: ["field", "crew"],
  },
];
