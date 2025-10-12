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
  | "black-tusk";

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
  } catch {}
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
    const isDark = (parsed as any).darkMode ?? theme !== "light";
    applyThemeVariables(theme, { highContrast: !!parsed.highContrast, forceDark: !!isDark });
    applyWallpaper(parsed.wallpaperUrl, parsed.wallpaperOpacity);
  } catch {}
}

export function listenForThemeChanges() {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== "aos_settings") return;
    applySavedThemeFromLocalStorage();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}
