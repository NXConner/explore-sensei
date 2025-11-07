import { useEffect, useState } from "react";

export interface HUDSettings {
  // Visual
  radarEffect: boolean;
  radarSpeed: number;
  radarType: "standard" | "sonar" | "aviation";
  glitchEffect: boolean;
  glitchIntensity: number;
  glitchClickPreset: "barely" | "subtle" | "normal";
  scanlineEffect: boolean;
  gridOverlay: boolean;
  vignetteEffect: boolean;

  // HUD elements visibility
  hudCornerBrackets?: boolean;
  hudMiniMap?: boolean;
  hudCompassRose?: boolean;
  hudCoordinateDisplay?: boolean;
  hudScaleBar?: boolean;
  hudZoomIndicator?: boolean;

  // Audio
  soundVolume: number;
  radarAudioEnabled?: boolean;
  radarAudioVolume?: number;

  // Weather
  weatherAlertsEnabled?: boolean;
  weatherAlertRadius?: number; // miles

  // Themes
  mapTheme?: "division" | "animus";
}

const STORAGE_KEY = "aos_settings";

export function useHUDSettings(): [HUDSettings, (patch: Partial<HUDSettings>) => void] {
  const [settings, setSettings] = useState<HUDSettings>({
    radarEffect: true,
    radarSpeed: 3,
    radarType: "standard",
    glitchEffect: true,
    glitchIntensity: 30,
    glitchClickPreset: "subtle",
    scanlineEffect: true,
    gridOverlay: true,
    vignetteEffect: false,
    hudCornerBrackets: true,
    hudMiniMap: false,
    hudCompassRose: true,
    hudCoordinateDisplay: true,
    hudScaleBar: true,
    hudZoomIndicator: true,
    soundVolume: 70,
    radarAudioEnabled: false,
    radarAudioVolume: 50,
    weatherAlertsEnabled: true,
    weatherAlertRadius: 15,
    mapTheme: "division",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings((s) => ({ ...s, ...(JSON.parse(raw) as HUDSettings) }));
    } catch {}

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue) as HUDSettings;
        setSettings((s) => ({ ...s, ...parsed }));
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = (patch: Partial<HUDSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...patch };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch {}
      return merged;
    });
  };

  return [settings, update];
}
