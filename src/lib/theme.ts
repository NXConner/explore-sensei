export type ThemeId =
  | "tactical-dark"
  | "light"
  | "high-contrast"
  | "industry-blue"
  | "safety-green"
  | "construction"
  | "landscaping"
  | "security"
  | "aviation"
  | "division-shd"
  | "dark-zone"
  | "black-tusk"
  // Faithful/high-fidelity variants (no trademarked assets/logos; colors only)
  | "division-shd-faithful"
  | "dark-zone-faithful"
  | "black-tusk-faithful"
  // Additional inspired variants
  | "isac-core"
  | "hunter"
  | "rogue-agent"
  | "contaminated"
  | "night-ops";

type CssVarMap = Record<string, string>;

export const THEME_VARS: Record<ThemeId, CssVarMap> = {
  "tactical-dark": {
    "--primary": "30 100% 50%",
    "--accent": "197 100% 50%",
    "--background": "0 0% 4%",
    "--foreground": "0 0% 88%",
    "--card": "0 0% 6%",
    "--card-foreground": "0 0% 88%",
    "--popover": "0 0% 6%",
    "--popover-foreground": "0 0% 88%",
    "--muted": "0 0% 10%",
    "--muted-foreground": "0 0% 60%",
    "--primary-foreground": "0 0% 100%",
    "--accent-foreground": "0 0% 100%",
    "--destructive": "0 100% 54%",
    "--destructive-foreground": "0 0% 100%",
    "--success": "130 100% 50%",
    "--success-foreground": "0 0% 10%",
    "--border": "0 0% 15%",
    "--input": "0 0% 12%",
    "--ring": "30 100% 50%",
  },
  light: {
    "--background": "0 0% 98%",
    "--foreground": "0 0% 10%",
    "--card": "0 0% 100%",
    "--card-foreground": "0 0% 10%",
    "--primary": "220 90% 56%",
    "--primary-foreground": "0 0% 100%",
    "--accent": "260 90% 56%",
    "--muted": "0 0% 92%",
    "--muted-foreground": "0 0% 35%",
    "--border": "0 0% 80%",
    "--input": "0 0% 90%",
    "--ring": "220 90% 56%",
  },
  "high-contrast": {
    "--background": "0 0% 0%",
    "--foreground": "0 0% 100%",
    "--card": "0 0% 0%",
    "--card-foreground": "0 0% 100%",
    "--primary": "40 100% 50%",
    "--primary-foreground": "0 0% 0%",
    "--accent": "200 100% 50%",
    "--muted": "0 0% 12%",
    "--muted-foreground": "0 0% 92%",
    "--border": "0 0% 25%",
    "--input": "0 0% 20%",
    "--ring": "40 100% 50%",
  },
  "industry-blue": {
    "--primary": "211 100% 45%",
    "--primary-foreground": "0 0% 100%",
    "--accent": "39 100% 50%",
    "--background": "220 19% 10%",
    "--foreground": "0 0% 96%",
  },
  "safety-green": {
    "--primary": "130 100% 45%",
    "--primary-foreground": "0 0% 10%",
    "--accent": "30 100% 50%",
    "--background": "140 10% 6%",
    "--foreground": "0 0% 92%",
  },
  construction: {
    "--primary": "28 95% 52%",
    "--primary-foreground": "0 0% 10%",
    "--accent": "210 80% 52%",
    "--background": "215 22% 9%",
    "--foreground": "0 0% 96%",
  },
  landscaping: {
    "--primary": "133 70% 41%",
    "--primary-foreground": "0 0% 98%",
    "--accent": "43 93% 55%",
    "--background": "100 15% 8%",
    "--foreground": "0 0% 95%",
  },
  security: {
    "--primary": "220 90% 56%",
    "--primary-foreground": "0 0% 100%",
    "--accent": "0 0% 100%",
    "--background": "220 15% 6%",
    "--foreground": "0 0% 92%",
  },
  aviation: {
    "--primary": "197 100% 50%",
    "--primary-foreground": "0 0% 10%",
    "--accent": "258 90% 64%",
    "--background": "240 13% 10%",
    "--foreground": "0 0% 94%",
  },
  "division-shd": {
    "--primary": "30 100% 50%",
    "--primary-foreground": "0 0% 100%",
    "--accent": "197 100% 55%",
    "--accent-foreground": "0 0% 100%",
    "--background": "0 0% 3%",
    "--foreground": "0 0% 92%",
    "--card": "0 0% 6%",
    "--card-foreground": "0 0% 92%",
    "--muted": "0 0% 12%",
    "--muted-foreground": "0 0% 70%",
    "--border": "0 0% 14%",
    "--input": "0 0% 12%",
    "--ring": "30 100% 50%",
  },
  // Slightly deeper blacks and brighter accents for a more faithful feel
  "division-shd-faithful": {
    "--primary": "30 100% 54%",
    "--primary-foreground": "0 0% 100%",
    "--accent": "197 100% 58%",
    "--accent-foreground": "0 0% 100%",
    "--background": "0 0% 2%",
    "--foreground": "0 0% 95%",
    "--card": "0 0% 5%",
    "--card-foreground": "0 0% 95%",
    "--muted": "0 0% 10%",
    "--muted-foreground": "0 0% 72%",
    "--border": "0 0% 16%",
    "--input": "0 0% 12%",
    "--ring": "30 100% 54%",
  },
  "dark-zone": {
    "--primary": "0 85% 55%",
    "--primary-foreground": "0 0% 100%",
    "--accent": "186 85% 45%",
    "--accent-foreground": "0 0% 100%",
    "--background": "0 0% 2%",
    "--foreground": "0 0% 95%",
    "--card": "0 0% 6%",
    "--card-foreground": "0 0% 95%",
    "--muted": "0 0% 12%",
    "--muted-foreground": "0 0% 70%",
    "--border": "0 0% 14%",
    "--input": "0 0% 12%",
    "--ring": "0 85% 55%",
  },
  "dark-zone-faithful": {
    "--primary": "0 90% 56%",
    "--primary-foreground": "0 0% 100%",
    "--accent": "186 90% 48%",
    "--accent-foreground": "0 0% 100%",
    "--background": "0 0% 1.5%",
    "--foreground": "0 0% 96%",
    "--card": "0 0% 5%",
    "--card-foreground": "0 0% 96%",
    "--muted": "0 0% 10%",
    "--muted-foreground": "0 0% 72%",
    "--border": "0 0% 16%",
    "--input": "0 0% 12%",
    "--ring": "0 90% 56%",
  },
  "black-tusk": {
    "--primary": "135 95% 50%",
    "--primary-foreground": "0 0% 10%",
    "--accent": "220 15% 75%",
    "--accent-foreground": "0 0% 10%",
    "--background": "220 9% 6%",
    "--foreground": "0 0% 95%",
    "--card": "220 9% 8%",
    "--card-foreground": "0 0% 95%",
    "--muted": "220 8% 14%",
    "--muted-foreground": "0 0% 75%",
    "--border": "220 8% 16%",
    "--input": "220 8% 14%",
    "--ring": "135 95% 50%",
  },
  "black-tusk-faithful": {
    "--primary": "135 98% 52%",
    "--primary-foreground": "0 0% 10%",
    "--accent": "220 18% 76%",
    "--accent-foreground": "0 0% 10%",
    "--background": "220 10% 5%",
    "--foreground": "0 0% 96%",
    "--card": "220 10% 7%",
    "--card-foreground": "0 0% 96%",
    "--muted": "220 9% 13%",
    "--muted-foreground": "0 0% 76%",
    "--border": "220 9% 18%",
    "--input": "220 9% 14%",
    "--ring": "135 98% 52%",
  },
  // Additional inspired-but-original variants
  "isac-core": {
    "--primary": "30 100% 50%",   // SHD-like orange
    "--primary-foreground": "0 0% 100%",
    "--accent": "196 100% 50%",   // cyan
    "--accent-foreground": "0 0% 100%",
    "--background": "0 0% 2%",
    "--foreground": "0 0% 94%",
    "--card": "0 0% 6%",
    "--card-foreground": "0 0% 94%",
    "--muted": "0 0% 11%",
    "--muted-foreground": "0 0% 70%",
    "--border": "0 0% 15%",
    "--input": "0 0% 12%",
    "--ring": "30 100% 50%",
  },
  "hunter": {
    "--primary": "24 88% 52%",   // more amber/orange
    "--primary-foreground": "0 0% 100%",
    "--accent": "0 0% 100%",     // white accents
    "--accent-foreground": "0 0% 10%",
    "--background": "0 0% 2%",
    "--foreground": "0 0% 94%",
    "--card": "0 0% 6%",
    "--card-foreground": "0 0% 94%",
    "--muted": "0 0% 12%",
    "--muted-foreground": "0 0% 70%",
    "--border": "0 0% 16%",
    "--input": "0 0% 12%",
    "--ring": "24 88% 52%",
  },
  "rogue-agent": {
    "--primary": "0 86% 54%",    // aggressive red for alerts
    "--primary-foreground": "0 0% 100%",
    "--accent": "30 100% 50%",   // orange as secondary
    "--accent-foreground": "0 0% 100%",
    "--background": "0 0% 2%",
    "--foreground": "0 0% 95%",
    "--card": "0 0% 6%",
    "--card-foreground": "0 0% 95%",
    "--muted": "0 0% 12%",
    "--muted-foreground": "0 0% 72%",
    "--border": "0 0% 16%",
    "--input": "0 0% 12%",
    "--ring": "0 86% 54%",
  },
  "contaminated": {
    "--primary": "80 100% 45%",   // hazard yellow-green
    "--primary-foreground": "0 0% 10%",
    "--accent": "0 85% 54%",     // red warning
    "--accent-foreground": "0 0% 100%",
    "--background": "0 0% 3%",
    "--foreground": "0 0% 94%",
    "--card": "0 0% 6%",
    "--card-foreground": "0 0% 94%",
    "--muted": "0 0% 12%",
    "--muted-foreground": "0 0% 72%",
    "--border": "0 0% 14%",
    "--input": "0 0% 12%",
    "--ring": "80 100% 45%",
  },
  "night-ops": {
    "--primary": "210 90% 60%",   // blue neon
    "--primary-foreground": "0 0% 100%",
    "--accent": "197 100% 50%",   // cyan secondary
    "--accent-foreground": "0 0% 100%",
    "--background": "0 0% 2%",
    "--foreground": "0 0% 95%",
    "--card": "0 0% 6%",
    "--card-foreground": "0 0% 95%",
    "--muted": "0 0% 12%",
    "--muted-foreground": "0 0% 70%",
    "--border": "0 0% 15%",
    "--input": "0 0% 12%",
    "--ring": "210 90% 60%",
  },
};

export function applyThemeVariables(
  theme: ThemeId,
  options?: { highContrast?: boolean; forceDark?: boolean },
) {
  const root = document.documentElement as HTMLElement;
  const selected = { ...THEME_VARS["tactical-dark"], ...(THEME_VARS[theme] || {}) };
  const finalVars = options?.highContrast ? { ...selected, ...THEME_VARS["high-contrast"] } : selected;
  Object.entries(finalVars).forEach(([k, v]) => root.style.setProperty(k, v));

  // Sync Tailwind dark mode class for components using `dark:` utilities
  const wantsDark = options?.forceDark ?? theme !== "light";
  if (wantsDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Broadcast theme changes to any listeners (e.g., toasters)
  try {
    window.dispatchEvent(new Event("theme-updated"));
  } catch (_err) {
    // noop
  }
}

export function applyWallpaper(url?: string, opacityPercent?: number) {
  const body = document.body as HTMLBodyElement;
  if (url) {
    body.style.backgroundImage = `url('${url}')`;
    body.style.backgroundSize = "cover";
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundAttachment = "fixed";
    body.style.backgroundPosition = "center";
    const op = Math.max(0.3, Math.min(1, (opacityPercent ?? 60) / 100));
    // Apply opacity via overlay instead of body opacity to prevent dimming toasts/portals
    const overlayId = "wallpaper-opacity-overlay";
    let overlay = document.getElementById(overlayId) as HTMLDivElement | null;
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = overlayId;
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "0";
      document.body.prepend(overlay);
    }
    overlay.style.background = `rgba(0,0,0,${1 - op})`;
  } else {
    body.style.backgroundImage = "";
    const overlay = document.getElementById("wallpaper-opacity-overlay");
    if (overlay) overlay.remove();
  }
}

export function applySavedThemeFromLocalStorage() {
  try {
    const raw = localStorage.getItem("aos_settings");
    if (!raw) return;
    const parsed = JSON.parse(raw) as { theme?: ThemeId | "church-blue"; highContrast?: boolean; wallpaperUrl?: string; wallpaperOpacity?: number };
    // Backward-compatible alias: map legacy 'church-blue' to 'industry-blue'
    const mappedTheme = (parsed.theme === "church-blue" ? "industry-blue" : parsed.theme) as ThemeId | undefined;
    const theme = mappedTheme || "tactical-dark";
    const isDark = (parsed as unknown as { darkMode?: boolean }).darkMode ?? theme !== "light";
    applyThemeVariables(theme, { highContrast: !!parsed.highContrast, forceDark: !!isDark });
    applyWallpaper(parsed.wallpaperUrl, parsed.wallpaperOpacity);
  } catch (_err) {
    // noop
  }
}

export function listenForThemeChanges() {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== "aos_settings") return;
    applySavedThemeFromLocalStorage();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}
