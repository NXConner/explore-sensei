import { DesignSpaceTokens } from "./types";

export const designTokens: DesignSpaceTokens = {
  spacing: {
    "0": 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
    "4xl": 40,
  },
  radii: {
    button: 8,
    card: 14,
    sheet: 18,
    hud: 24,
    full: 999,
  },
  shadows: {
    hud: "0 8px 28px rgba(0,0,0,0.55)",
    panel: "0 18px 48px rgba(9, 9, 11, 0.65)",
    inset: "inset 0 1px 0 rgba(255,255,255,0.05)",
    glow: "0 0 30px rgba(255, 132, 0, 0.3)",
  },
  typography: {
    fonts: {
      sans: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
      display: "'Orbitron', 'Inter', sans-serif",
      mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
    },
    sizes: {
      xs: "0.75rem",
      sm: "0.8125rem",
      md: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeights: {
      tight: "1.1",
      snug: "1.2",
      normal: "1.45",
      relaxed: "1.7",
    },
  },
  zIndices: {
    wallpaper: 0,
    map: 10,
    overlays: 50,
    hud: 100,
    modal: 1000,
    commandPalette: 1100,
    toast: 1200,
  },
  durations: {
    instant: "0ms",
    quick: "120ms",
    fast: "180ms",
    default: "240ms",
    slow: "360ms",
  },
  blurs: {
    subtle: "6px",
    medium: "12px",
    heavy: "22px",
  },
  gradients: {
    command: "linear-gradient(135deg, rgba(255,140,0,0.25) 0%, rgba(0,122,204,0.18) 100%)",
    alert: "linear-gradient(135deg, rgba(255,65,54,0.25) 0%, rgba(255,168,0,0.2) 100%)",
    sanctuary:
      "linear-gradient(135deg, rgba(126, 214, 223, 0.32) 0%, rgba(224, 195, 252, 0.28) 100%)",
    focus: "linear-gradient(135deg, rgba(255, 161, 0, 0.32) 0%, rgba(34, 211, 238, 0.25) 100%)",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

export const {
  spacing,
  radii,
  shadows,
  typography,
  zIndices,
  durations,
  blurs,
  gradients,
  breakpoints,
} = designTokens;
