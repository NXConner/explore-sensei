import {
  ThemeId,
  defaultThemeId,
  getThemeDefinition,
  listThemeDefinitions,
  listWallpaperPresets,
  WallpaperSelection,
  getWallpaperPreset,
} from "@/design-system";

type ApplyOptions = { highContrast?: boolean; forceDark?: boolean };

const baseTheme = getThemeDefinition(defaultThemeId);
const highContrastTheme = getThemeDefinition("high-contrast");

export { ThemeId } from "@/design-system";

export function applyThemeVariables(themeId: ThemeId, options?: ApplyOptions): void {
  const root = document.documentElement as HTMLElement;
  const selectedTheme = getThemeDefinition(themeId);
  const mergedVars = {
    ...baseTheme.cssVars,
    ...selectedTheme.cssVars,
    ...(options?.highContrast ? highContrastTheme.cssVars : {}),
  };

  Object.entries(mergedVars).forEach(([token, value]) => {
    root.style.setProperty(token, value);
  });

  const wantsDark = options?.forceDark ?? themeId !== "light";
  if (wantsDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  try {
    window.dispatchEvent(new Event("theme-updated"));
  } catch {
    /* noop */
  }
}

interface ResolvedWallpaper {
  presetId?: string;
  gradient?: string;
  url?: string;
  defaultOpacity?: number;
}

export function resolveWallpaper(
  selection?: WallpaperSelection | string | null,
): ResolvedWallpaper | undefined {
  if (!selection) return undefined;

  if (typeof selection === "string") {
    const preset = getWallpaperPreset(selection as any);
    if (preset) {
      return {
        presetId: preset.id,
        gradient: preset.kind === "gradient" ? preset.gradient : undefined,
        url: preset.kind === "image" ? preset.url : undefined,
        defaultOpacity: preset.defaultOpacity,
      };
    }
    if (selection.trim().length > 0) {
      return { url: selection };
    }
    return undefined;
  }

  if (selection.presetId) {
    const preset = getWallpaperPreset(selection.presetId as any);
    if (preset) {
      return {
        presetId: preset.id,
        gradient: preset.kind === "gradient" ? preset.gradient : undefined,
        url:
          preset.kind === "image"
            ? selection.customUrl && selection.customUrl.length > 0
              ? selection.customUrl
              : preset.url
            : undefined,
        defaultOpacity: preset.defaultOpacity,
      };
    }
  }

  if (selection.customUrl && selection.customUrl.trim().length > 0) {
    return { url: selection.customUrl };
  }

  return undefined;
}

export function applyWallpaper(
  selection?: WallpaperSelection | string | null,
  opacityPercent?: number,
): void {
  const resolved = resolveWallpaper(selection);
  const body = document.body as HTMLBodyElement;
  const overlayId = "wallpaper-opacity-overlay";
  let overlay = document.getElementById(overlayId) as HTMLDivElement | null;

  if (!resolved) {
    body.style.backgroundImage = "";
    if (overlay) overlay.remove();
    return;
  }

  if (resolved.gradient) {
    body.style.backgroundImage = resolved.gradient;
  } else if (resolved.url) {
    body.style.backgroundImage = `url('${resolved.url}')`;
    body.style.backgroundSize = "cover";
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundAttachment = "fixed";
    body.style.backgroundPosition = "center";
  }

  const calibratedOpacity = Math.max(
    0.2,
    Math.min(1, (opacityPercent ?? resolved.defaultOpacity ?? 60) / 100),
  );

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = overlayId;
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "0";
    document.body.prepend(overlay);
  }

  overlay.style.background = `rgba(0,0,0,${1 - calibratedOpacity})`;
}

export function resolveWallpaperFromSettings(settings: any): WallpaperSelection | undefined {
  if (!settings) return undefined;
  const presetId = settings.wallpaperPresetId as string | undefined;
  if (presetId && getWallpaperPreset(presetId as any)) {
    return {
      presetId: presetId as any,
      kind: getWallpaperPreset(presetId as any)?.kind,
      customUrl: settings.wallpaperUrl,
    };
  }
  const customUrl = typeof settings.wallpaperUrl === "string" ? settings.wallpaperUrl : undefined;
  if (customUrl && customUrl.trim().length > 0) {
    return { customUrl, kind: "upload" };
  }
  return undefined;
}

export function applySavedThemeFromLocalStorage(): void {
  try {
    const raw = localStorage.getItem("aos_settings");
    if (!raw) {
      applyThemeVariables(defaultThemeId);
      applyWallpaper(undefined);
      return;
    }

    const settings = JSON.parse(raw);
    let themeId: ThemeId = settings.theme ?? defaultThemeId;

    if (themeId === "church-blue") {
      themeId = "industry-blue";
    }

    if (settings.fidelityMode === "faithful") {
      const faithfulMap: Partial<Record<ThemeId, ThemeId>> = {
        "division-shd": "division-shd-faithful",
        "dark-zone": "dark-zone-faithful",
        "black-tusk": "black-tusk-faithful",
      };
      themeId = (faithfulMap[themeId] ?? themeId) as ThemeId;
    }

    if (!getThemeDefinition(themeId)) {
      themeId = defaultThemeId;
    }

    const highContrast = Boolean(settings.highContrast);
    const forceDark = settings.darkMode ?? themeId !== "light";
    applyThemeVariables(themeId, { highContrast, forceDark });

    const wallpaperSelection = resolveWallpaperFromSettings(settings);
    applyWallpaper(wallpaperSelection, settings.wallpaperOpacity);
  } catch {
    applyThemeVariables(defaultThemeId);
  }
}

export function listenForThemeChanges(): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => applySavedThemeFromLocalStorage();
  window.addEventListener("aos_settings_updated", handler);
  return () => window.removeEventListener("aos_settings_updated", handler);
}

export function listAvailableThemes() {
  return listThemeDefinitions();
}

export function listAvailableWallpapers() {
  return listWallpaperPresets();
}
