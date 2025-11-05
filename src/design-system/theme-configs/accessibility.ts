import { gradients } from "../tokens";
import { ThemeConfig } from "./types";

export const accessibilityThemes: ThemeConfig[] = [
  {
    id: "high-contrast",
    name: "High Contrast",
    description: "Black and gold scheme tuned for maximum readability.",
    category: "accessibility",
    mode: "dark",
    css: {
      "--background": "0 0% 0%",
      "--foreground": "0 0% 100%",
      "--card": "0 0% 0%",
      "--card-foreground": "0 0% 100%",
      "--primary": "40 100% 50%",
      "--primary-foreground": "0 0% 0%",
      "--accent": "200 100% 50%",
      "--accent-foreground": "0 0% 0%",
      "--border": "0 0% 25%",
      "--input": "0 0% 20%",
      "--ring": "40 100% 50%",
    },
    wallpaper: "ember-gold",
    accentGradient: gradients.alert,
    accessibility: {
      highContrast: true,
      colorBlindSafe: true,
    },
    tags: ["a11y"],
  },
  {
    id: "color-blind",
    name: "Blue/Orange A11y",
    description: "Deuteranopia-friendly palette with vivid contrast.",
    category: "accessibility",
    mode: "dark",
    css: {
      "--primary": "205 100% 55%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "30 100% 55%",
      "--accent-foreground": "0 0% 10%",
      "--background": "220 30% 7%",
    },
    wallpaper: "uplift",
    accessibility: {
      highContrast: true,
      colorBlindSafe: true,
      recommendedFor: ["Deuteranopia", "Protanopia"],
    },
    tags: ["a11y", "field"],
  },
  {
    id: "colorblind-safe",
    name: "Blue/Orange A11y (Soft)",
    description: "Alternate blue/orange palette with softer accents.",
    category: "accessibility",
    mode: "dark",
    css: {
      "--primary": "205 96% 52%",
      "--accent": "28 100% 58%",
      "--accent-foreground": "0 0% 10%",
    },
    wallpaper: "uplift",
    accessibility: {
      highContrast: true,
      colorBlindSafe: true,
    },
    tags: ["a11y"],
  },
];
