import React, { useEffect, useState } from "react";
import { X, Settings, Moon, Sun, Bell, Zap, Volume2, Palette, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGamificationToggle } from "@/context/GamificationContext";
import { Slider } from "@/components/ui/slider";
import { WeatherAlertLocationsManager } from "./WeatherAlertLocationsManager";
import { applyThemeVariables, applyWallpaper } from "@/lib/theme";
import { ThemeCustomizer } from "@/components/theme";
import { HUDPanel } from "@/components/foundation";
import {
  ThemeId,
  WallpaperSelection,
  WallpaperPresetId,
  getWallpaperPreset,
} from "@/design-system";
import { Input } from "@/components/ui/input";
import { detectExistingApiKeys } from "@/config/env";

type HudFxState = {
  glitchEffect: boolean;
  scanlineEffect: boolean;
  gridOverlay: boolean;
  animationSpeed: number;
  glitchIntensity: number;
  reduceMotion: boolean;
  bootOverlay: boolean;
};

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal = ({ onClose }: SettingsModalProps) => {
  const { enabled: gamifyEnabled, setEnabled: setGamifyEnabled } = useGamificationToggle();
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    soundEffects: false,
    kpiTicker: true,
    screensaver: false,
    screensaverDelay: 5,
    highContrast: false,
    // HUD Element Visibility
    hudCornerBrackets: true,
    hudMiniMap: false,
    hudCompassRose: true,
    hudCoordinateDisplay: true,
    hudScaleBar: true,
    hudZoomIndicator: true,
    // Animation & Effects
    radarEffect: true,
    radarType: "standard" as "standard" | "sonar" | "aviation",
    glitchEffect: true,
    scanlineEffect: true,
    gridOverlay: true,
    radarSpeed: 3,
    glitchIntensity: 30,
    animationSpeed: 100,
    glitchClickPreset: "subtle" as "barely" | "subtle" | "normal",
    vignetteEffect: false,
    // Sounds
    uiSounds: false,
    alertSounds: true,
    soundVolume: 70,
    radarAudioEnabled: false,
    radarAudioVolume: 50,
    // Pulse / Scan
    pulseScanEnabled: false,
    pulseHighlightPOIs: true,
    ringControls: true,
    reduceMotion: false,
    lowPowerMode: false,
    useCanvasFX: false,
    // Boot overlay
    bootOverlay: true,
    // Weather Alerts
    weatherAlertsEnabled: true,
    weatherAlertRadius: 15,
    suitabilityThresholds: { minTempF: 55, maxTempF: 95, maxHumidity: 70, maxPrecipChance: 20 },
    // Themes & Wallpapers
    theme: "tactical-dark" as ThemeId,
    // fidelity toggle: original-inspired vs faithful (close color matching)
    fidelityMode: "inspired" as "inspired" | "faithful",
    mapTheme: "division" as "division" | "animus",
    preferredMapProvider: "auto" as "auto" | "google" | "mapbox" | "maplibre" | "leaflet",
    wallpaperUrl: "",
    wallpaperOpacity: 60,
    wallpaperPresetId: undefined as WallpaperPresetId | undefined,
    wallpaperFileName: "",
    // Map defaults
    defaultMapAddress: "",
    useDefaultLocation: false,
    // Premium gating
    premiumEnabled: false,
    // API Keys (overrides env when provided)
    apiKeys: {
      googleMaps: "",
      googleGeneric: "",
      mapbox: "",
      openWeather: "",
    } as {
      googleMaps?: string;
      googleGeneric?: string;
      mapbox?: string;
      openWeather?: string;
      maptiler?: string;
    },
    // Provider endpoints (persisted locally)
    providers: {
      patrickWms: "",
      patrickEsriFeature: "",
      usgsImageryWms: "",
      usdaNaipWms: "",
    } as {
      patrickWms?: string;
      patrickEsriFeature?: string;
      usgsImageryWms?: string;
      usdaNaipWms?: string;
    },
    soundset: "auto" as "auto" | "division" | "animus",
  });

  // Persist settings in localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("aos_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  // Prefill API keys from environment/config on first load if missing
  useEffect(() => {
    try {
      const found = detectExistingApiKeys();
      setSettings((prev) => {
        const current = prev.apiKeys || {};
        const merged = { ...current } as typeof current;
        if (!merged.googleMaps && found.googleMaps) merged.googleMaps = found.googleMaps;
        if (!merged.googleGeneric && found.googleGeneric)
          merged.googleGeneric = found.googleGeneric;
        if (!merged.mapbox && found.mapbox) merged.mapbox = found.mapbox;
        if (!merged.openWeather && found.openWeather) merged.openWeather = found.openWeather;
        if (!merged.maptiler && found.maptiler) merged.maptiler = found.maptiler;
        return { ...prev, apiKeys: merged };
      });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("aos_settings", JSON.stringify(settings));
      // notify live listeners in same tab
      window.dispatchEvent(new Event("aos_settings_updated"));
      // also notify theme consumers; Toaster listens for this
      window.dispatchEvent(new Event("theme-updated"));
    } catch {}
  }, [settings]);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleThemeChange = (themeId: ThemeId) => {
    setSettings((prev) => ({ ...prev, theme: themeId }));
  };

  const handleWallpaperSelection = (selection?: WallpaperSelection) => {
    if (!selection) {
      setSettings((prev) => ({
        ...prev,
        wallpaperPresetId: undefined,
        wallpaperUrl: "",
        wallpaperFileName: "",
      }));
      return;
    }

    if (selection.presetId) {
      const preset = getWallpaperPreset(selection.presetId);
      setSettings((prev) => ({
        ...prev,
        wallpaperPresetId: selection.presetId as WallpaperPresetId,
        wallpaperUrl:
          preset?.kind === "image"
            ? selection.customUrl && selection.customUrl.length > 0
              ? selection.customUrl
              : (preset?.url ?? "")
            : "",
        wallpaperFileName: preset?.name ?? "",
      }));
      return;
    }

    if (selection.customUrl && selection.customUrl.trim().length > 0) {
      setSettings((prev) => ({
        ...prev,
        wallpaperPresetId: undefined,
        wallpaperUrl: selection.customUrl,
        wallpaperFileName: selection.fileName ?? "",
      }));
    }
  };

  const handleWallpaperOpacityChange = (value: number) => {
    setSettings((prev) => ({ ...prev, wallpaperOpacity: value }));
  };

  const handleHudFxChange = (patch: Partial<HudFxState>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const handleFidelityModeChange = (mode: "inspired" | "faithful") => {
    const faithfulMap: Record<ThemeId, ThemeId> = {
      "division-shd": "division-shd-faithful",
      "dark-zone": "dark-zone-faithful",
      "black-tusk": "black-tusk-faithful",
    } as Record<ThemeId, ThemeId>;

    const inspiredMap: Record<ThemeId, ThemeId> = {
      "division-shd-faithful": "division-shd",
      "dark-zone-faithful": "dark-zone",
      "black-tusk-faithful": "black-tusk",
    } as Record<ThemeId, ThemeId>;

    setSettings((prev) => {
      const currentTheme = prev.theme as ThemeId;
      const nextTheme =
        mode === "faithful"
          ? faithfulMap[currentTheme] ?? currentTheme
          : inspiredMap[currentTheme] ?? currentTheme;
      return { ...prev, fidelityMode: mode, theme: nextTheme };
    });
  };

  // Apply theme by setting CSS variables on :root and sync dark class based on darkMode
  useEffect(() => {
    applyThemeVariables(settings.theme as ThemeId, {
      highContrast: settings.highContrast,
      forceDark: settings.darkMode,
    });
    const wallpaperSelection: WallpaperSelection | undefined = settings.wallpaperPresetId
      ? { presetId: settings.wallpaperPresetId, customUrl: settings.wallpaperUrl }
      : settings.wallpaperUrl
        ? { customUrl: settings.wallpaperUrl, kind: "upload", fileName: settings.wallpaperFileName }
        : undefined;
    applyWallpaper(wallpaperSelection, settings.wallpaperOpacity);
  }, [
    settings.theme,
    settings.wallpaperPresetId,
    settings.wallpaperUrl,
    settings.wallpaperOpacity,
    settings.highContrast,
    settings.darkMode,
    settings.wallpaperFileName,
  ]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="tactical-panel flex h-[80vh] w-full max-w-4xl flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/30 p-4">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">SETTINGS</h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <Tabs defaultValue="appearance" className="flex flex-1 flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
            <TabsTrigger value="gamification">Gamification</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="animations">Animations</TabsTrigger>
            <TabsTrigger value="hud">HUD</TabsTrigger>
            <TabsTrigger value="sounds">Sounds</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="pulse">Pulse</TabsTrigger>
          </TabsList>
          <TabsContent value="gamification" className="mt-0 space-y-6">
            <div className="tactical-panel p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Gamification</Label>
                  <p className="text-sm text-muted-foreground">
                    Turns on points, streaks, badges, leaderboards, and EOD summary
                  </p>
                </div>
                <Switch checked={gamifyEnabled} onCheckedChange={setGamifyEnabled} />
              </div>
            </div>
          </TabsContent>

          <ScrollArea className="flex-1 p-4">
            <TabsContent value="appearance" className="mt-0 space-y-6">
              <div className="tactical-panel p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {settings.darkMode ? (
                      <Moon className="h-5 w-5 text-primary" />
                    ) : (
                      <Sun className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle between light and dark themes
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={() => handleToggle("darkMode")}
                  />
                </div>
              </div>

              <div className="tactical-panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>High Contrast Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enhanced visibility for better readability
                    </p>
                  </div>
                  <Switch
                    checked={settings.highContrast}
                    onCheckedChange={() => handleToggle("highContrast")}
                  />
                </div>
              </div>

              <div className="tactical-panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>KPI Ticker</Label>
                    <p className="text-sm text-muted-foreground">
                      Show scrolling metrics at bottom
                    </p>
                  </div>
                  <Switch
                    checked={settings.kpiTicker}
                    onCheckedChange={() => handleToggle("kpiTicker")}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hud" className="mt-0 space-y-6">
              <div className="tactical-panel space-y-3 p-4">
                <div className="text-sm font-semibold mb-2">HUD Elements Visibility</div>
                <p className="text-xs text-muted-foreground mb-4">
                  Toggle individual HUD components on/off
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Corner Brackets</Label>
                    <p className="text-[10px] text-muted-foreground">Tactical frame corners</p>
                  </div>
                  <Switch 
                    checked={settings.hudCornerBrackets ?? true}
                    onCheckedChange={(checked) => {
                      setSettings((p) => ({ ...p, hudCornerBrackets: checked }));
                      window.dispatchEvent(new CustomEvent("aos_settings_updated"));
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Compass Rose</Label>
                    <p className="text-[10px] text-muted-foreground">Directional indicator</p>
                  </div>
                  <Switch 
                    checked={settings.hudCompassRose ?? true}
                    onCheckedChange={(checked) => {
                      setSettings((p) => ({ ...p, hudCompassRose: checked }));
                      window.dispatchEvent(new CustomEvent("aos_settings_updated"));
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Coordinate Display</Label>
                    <p className="text-[10px] text-muted-foreground">Current position</p>
                  </div>
                  <Switch 
                    checked={settings.hudCoordinateDisplay ?? true}
                    onCheckedChange={(checked) => {
                      setSettings((p) => ({ ...p, hudCoordinateDisplay: checked }));
                      window.dispatchEvent(new CustomEvent("aos_settings_updated"));
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Scale Bar</Label>
                    <p className="text-[10px] text-muted-foreground">Distance reference</p>
                  </div>
                  <Switch 
                    checked={settings.hudScaleBar ?? true}
                    onCheckedChange={(checked) => {
                      setSettings((p) => ({ ...p, hudScaleBar: checked }));
                      window.dispatchEvent(new CustomEvent("aos_settings_updated"));
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Zoom Indicator</Label>
                    <p className="text-[10px] text-muted-foreground">Current zoom level</p>
                  </div>
                  <Switch 
                    checked={settings.hudZoomIndicator ?? true}
                    onCheckedChange={(checked) => {
                      setSettings((p) => ({ ...p, hudZoomIndicator: checked }));
                      window.dispatchEvent(new CustomEvent("aos_settings_updated"));
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Mini Map</Label>
                    <p className="text-[10px] text-muted-foreground">Tactical overview</p>
                  </div>
                  <Switch 
                    checked={settings.hudMiniMap ?? false}
                    onCheckedChange={(checked) => {
                      setSettings((p) => ({ ...p, hudMiniMap: checked }));
                      window.dispatchEvent(new CustomEvent("aos_settings_updated"));
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="weather" className="mt-0 space-y-6">
              <div className="tactical-panel space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Weather Alerts</Label>
                    <p className="text-xs text-muted-foreground">
                      Show alert radius circles and markers
                    </p>
                  </div>
                  <Switch
                    checked={settings.weatherAlertsEnabled}
                    onCheckedChange={() => handleToggle("weatherAlertsEnabled")}
                  />
                </div>
                <div>
                  <Label className="text-xs">
                    Alert Radius: {settings.weatherAlertRadius} miles
                  </Label>
                  <Slider
                    value={[settings.weatherAlertRadius]}
                    onValueChange={([val]) =>
                      setSettings((p) => ({ ...p, weatherAlertRadius: val }))
                    }
                    min={5}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label className="text-xs">
                      Min Temperature (°F): {settings.suitabilityThresholds.minTempF}
                    </Label>
                    <Slider
                      value={[settings.suitabilityThresholds.minTempF]}
                      onValueChange={([val]) =>
                        setSettings((p) => ({
                          ...p,
                          suitabilityThresholds: { ...p.suitabilityThresholds, minTempF: val },
                        }))
                      }
                      min={30}
                      max={80}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">
                      Max Temperature (°F): {settings.suitabilityThresholds.maxTempF}
                    </Label>
                    <Slider
                      value={[settings.suitabilityThresholds.maxTempF]}
                      onValueChange={([val]) =>
                        setSettings((p) => ({
                          ...p,
                          suitabilityThresholds: { ...p.suitabilityThresholds, maxTempF: val },
                        }))
                      }
                      min={70}
                      max={110}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">
                      Max Humidity (%): {settings.suitabilityThresholds.maxHumidity}
                    </Label>
                    <Slider
                      value={[settings.suitabilityThresholds.maxHumidity]}
                      onValueChange={([val]) =>
                        setSettings((p) => ({
                          ...p,
                          suitabilityThresholds: { ...p.suitabilityThresholds, maxHumidity: val },
                        }))
                      }
                      min={40}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">
                      Max Precip Chance (%): {settings.suitabilityThresholds.maxPrecipChance}
                    </Label>
                    <Slider
                      value={[settings.suitabilityThresholds.maxPrecipChance]}
                      onValueChange={([val]) =>
                        setSettings((p) => ({
                          ...p,
                          suitabilityThresholds: {
                            ...p.suitabilityThresholds,
                            maxPrecipChance: val,
                          },
                        }))
                      }
                      min={0}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <WeatherAlertLocationsManager />
            </TabsContent>

              <TabsContent value="themes" className="mt-0 space-y-6">
                <ThemeCustomizer
                  themeId={settings.theme as ThemeId}
                  onThemeChange={handleThemeChange}
                  fidelityMode={settings.fidelityMode}
                  onFidelityModeChange={handleFidelityModeChange}
                  premiumAccess={settings.premiumEnabled}
                  wallpaperSelection={
                    settings.wallpaperPresetId || settings.wallpaperUrl
                      ? {
                          presetId: settings.wallpaperPresetId,
                          customUrl: settings.wallpaperUrl,
                          kind: settings.wallpaperPresetId
                            ? (getWallpaperPreset(settings.wallpaperPresetId)?.kind || "gradient")
                            : settings.wallpaperUrl
                              ? "upload"
                              : "none",
                          fileName: settings.wallpaperFileName,
                        }
                      : undefined
                  }
                  wallpaperOpacity={settings.wallpaperOpacity}
                  onWallpaperSelectionChange={handleWallpaperSelection}
                  onWallpaperOpacityChange={handleWallpaperOpacityChange}
                  wallpaperRemoteUrl={settings.wallpaperUrl}
                  onWallpaperRemoteUrlChange={(url) =>
                    setSettings((prev) => ({
                      ...prev,
                      wallpaperUrl: url,
                      wallpaperPresetId: url ? undefined : prev.wallpaperPresetId,
                    }))
                  }
                  hudFx={{
                    glitchEffect: settings.glitchEffect,
                    scanlineEffect: settings.scanlineEffect,
                    gridOverlay: settings.gridOverlay,
                    animationSpeed: settings.animationSpeed,
                    glitchIntensity: settings.glitchIntensity,
                    reduceMotion: settings.reduceMotion,
                    bootOverlay: settings.bootOverlay,
                  }}
                  onHudFxChange={handleHudFxChange}
                />

                {/* Default Map Location */}
              <HUDPanel className="space-y-4">
                <div className="mb-2 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <Label>Default Map Location</Label>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Use default location</span>
                    <Switch
                      checked={settings.useDefaultLocation}
                      onCheckedChange={() => handleToggle("useDefaultLocation")}
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      type="text"
                      value={settings.defaultMapAddress}
                      onChange={(e) =>
                        setSettings((p) => ({ ...p, defaultMapAddress: e.target.value }))
                      }
                      placeholder="123 Main St, City, State"
                      disabled={!settings.useDefaultLocation}
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Fallback location when GPS is unavailable
                    </p>
                  </div>
                </div>
              </HUDPanel>

                {/* Preferred Map Provider */}
              <div className="tactical-panel space-y-4 p-4">
                <div className="mb-2 flex items-center gap-3">
                  <Palette className="h-5 w-5 text-primary" />
                  <Label>Preferred Map Provider</Label>
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {(
                    [
                      { id: "auto", label: "Auto" },
                      { id: "google", label: "Google" },
                      { id: "mapbox", label: "Mapbox" },
                      { id: "maplibre", label: "MapLibre" },
                      { id: "leaflet", label: "Leaflet" },
                    ] as const
                  ).map((opt) => (
                    <Button
                      key={opt.id}
                      variant={settings.preferredMapProvider === opt.id ? "default" : "outline"}
                      onClick={() => setSettings((p) => ({ ...p, preferredMapProvider: opt.id }))}
                      className="justify-start"
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Auto uses Google if configured, else Mapbox/MapLibre fallback.
                </p>
              </div>
            </TabsContent>

            {/* Role Management (surface only) */}
            <TabsContent value="roles" className="mt-0 space-y-6">
              <div className="tactical-panel space-y-4 p-4">
                <div className="text-sm font-semibold">Role Management</div>
                <p className="text-xs text-muted-foreground">
                  Manage user roles and permissions. Only Super Administrators can modify roles.
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label className="text-xs">Assign Role to User (email)</Label>
                    <div className="mt-1 flex gap-2">
                      <Input placeholder="user@example.com" />
                      <select className="hud-element rounded border-primary/30 bg-transparent px-2 py-1 text-xs">
                        <option>Viewer</option>
                        <option>Operator</option>
                        <option>Manager</option>
                        <option>Administrator</option>
                        <option>Super Administrator</option>
                      </select>
                      <Button size="sm" disabled title="Requires Super Administrator">
                        Assign
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Existing Roles</Label>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Roles are defined in the database (`roles`, `user_roles`). Changes require
                      appropriate permissions.
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 space-y-6">
              <div className="tactical-panel p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-primary" />
                    <div>
                      <Label>Enable Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts and updates</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={() => handleToggle("notifications")}
                  />
                </div>
              </div>

              <div className="tactical-panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                  </div>
                  <Switch
                    checked={settings.soundEffects}
                    onCheckedChange={() => handleToggle("soundEffects")}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="animations" className="mt-0 space-y-6">
              <div className="tactical-panel space-y-4 p-4">
                <div className="mb-4 flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <Label>Visual Effects & Animations</Label>
                </div>

                {/* Radar Effect */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Radar Sweep Effect</Label>
                      <p className="text-xs text-muted-foreground">Rotating radar sweep on map</p>
                    </div>
                    <Switch
                      checked={settings.radarEffect}
                      onCheckedChange={() => handleToggle("radarEffect")}
                    />
                  </div>
                  {settings.radarEffect && (
                    <div className="pl-4">
                      <Label className="text-xs">Speed: {settings.radarSpeed}x</Label>
                      <Slider
                        value={[settings.radarSpeed]}
                        onValueChange={([val]) =>
                          setSettings((prev) => ({ ...prev, radarSpeed: val }))
                        }
                        min={1}
                        max={10}
                        step={1}
                        className="mt-2"
                      />
                      <div className="mt-3">
                        <Label className="text-xs">Radar Type</Label>
                        <div className="mt-1 flex gap-2">
                          {(["standard", "sonar", "aviation"] as const).map((t) => (
                            <Button
                              key={t}
                              variant={settings.radarType === t ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSettings((p) => ({ ...p, radarType: t }))}
                            >
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Glitch Effect */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Glitch Effect</Label>
                      <p className="text-xs text-muted-foreground">Tactical glitch overlay</p>
                    </div>
                    <Switch
                      checked={settings.glitchEffect}
                      onCheckedChange={() => handleToggle("glitchEffect")}
                    />
                  </div>
                  {settings.glitchEffect && (
                    <div className="space-y-3 pl-4">
                      <Label className="text-xs">Intensity: {settings.glitchIntensity}%</Label>
                      <Slider
                        value={[settings.glitchIntensity]}
                        onValueChange={([val]) =>
                          setSettings((prev) => ({ ...prev, glitchIntensity: val }))
                        }
                        min={10}
                        max={100}
                        step={10}
                        className="mt-2"
                      />
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Click Glitch Preset</Label>
                        <select
                          className="hud-element rounded border-primary/30 bg-transparent px-2 py-1 text-xs"
                          value={settings.glitchClickPreset}
                          onChange={(e) =>
                            setSettings((p) => ({ ...p, glitchClickPreset: e.target.value as any }))
                          }
                        >
                          <option value="barely">Barely</option>
                          <option value="subtle">Subtle</option>
                          <option value="normal">Normal</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scanline Effect */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Scanline Effect</Label>
                    <p className="text-xs text-muted-foreground">CRT-style scanlines</p>
                  </div>
                  <Switch
                    checked={settings.scanlineEffect}
                    onCheckedChange={() => handleToggle("scanlineEffect")}
                  />
                </div>

                {/* Grid Overlay */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Grid Overlay</Label>
                    <p className="text-xs text-muted-foreground">Tactical grid pattern</p>
                  </div>
                  <Switch
                    checked={settings.gridOverlay}
                    onCheckedChange={() => handleToggle("gridOverlay")}
                  />
                </div>

                {/* Vignette */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vignette Corners</Label>
                    <p className="text-xs text-muted-foreground">Subtle darkening near the edges</p>
                  </div>
                  <Switch
                    checked={settings.vignetteEffect}
                    onCheckedChange={() => handleToggle("vignetteEffect")}
                  />
                </div>

                {/* Animation Speed */}
                <div>
                  <Label className="text-xs">
                    Global Animation Speed: {settings.animationSpeed}%
                  </Label>
                  <Slider
                    value={[settings.animationSpeed]}
                    onValueChange={([val]) =>
                      setSettings((prev) => ({ ...prev, animationSpeed: val }))
                    }
                    min={25}
                    max={200}
                    step={25}
                    className="mt-2"
                  />
                </div>

                {/* Motion & Power */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Reduce Motion</Label>
                      <p className="text-xs text-muted-foreground">Disable most animations</p>
                    </div>
                    <Switch
                      checked={settings.reduceMotion}
                      onCheckedChange={() => handleToggle("reduceMotion")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Low Power Mode</Label>
                      <p className="text-xs text-muted-foreground">Lighter visual effects</p>
                    </div>
                    <Switch
                      checked={settings.lowPowerMode}
                      onCheckedChange={() => handleToggle("lowPowerMode")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Use Canvas FX</Label>
                      <p className="text-xs text-muted-foreground">Experimental canvas renderer</p>
                    </div>
                    <Switch
                      checked={settings.useCanvasFX}
                      onCheckedChange={() => handleToggle("useCanvasFX")}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sounds" className="mt-0 space-y-6">
              <div className="tactical-panel space-y-4 p-4">
                <div className="mb-4 flex items-center gap-3">
                  <Volume2 className="h-5 w-5 text-primary" />
                  <Label>Sound Settings</Label>
                </div>

                {/* UI Sounds */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>UI Sounds</Label>
                    <p className="text-xs text-muted-foreground">Button clicks and interactions</p>
                  </div>
                  <Switch
                    checked={settings.uiSounds}
                    onCheckedChange={() => handleToggle("uiSounds")}
                  />
                </div>

                {/* Alert Sounds */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alert Sounds</Label>
                    <p className="text-xs text-muted-foreground">Notification and warning sounds</p>
                  </div>
                  <Switch
                    checked={settings.alertSounds}
                    onCheckedChange={() => handleToggle("alertSounds")}
                  />
                </div>

                {/* Volume */}
                <div>
                  <Label className="text-xs">Master Volume: {settings.soundVolume}%</Label>
                  <Slider
                    value={[settings.soundVolume]}
                    onValueChange={([val]) =>
                      setSettings((prev) => ({ ...prev, soundVolume: val }))
                    }
                    min={0}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>

                {/* Radar Ping Audio */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Radar Ping Audio</Label>
                    <p className="text-xs text-muted-foreground">Beep on sweep rotation</p>
                  </div>
                  <Switch
                    checked={settings.radarAudioEnabled}
                    onCheckedChange={() => handleToggle("radarAudioEnabled")}
                  />
                </div>
                {settings.radarAudioEnabled && (
                  <div>
                    <Label className="text-xs">Radar Volume: {settings.radarAudioVolume}%</Label>
                    <Slider
                      value={[settings.radarAudioVolume]}
                      onValueChange={([val]) =>
                        setSettings((prev) => ({ ...prev, radarAudioVolume: val }))
                      }
                      min={0}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                )}

                {/* Soundset */}
                <div className="mt-2">
                  <Label className="text-xs">Theme Soundset</Label>
                  <div className="mt-1 flex gap-2">
                    {(["auto", "division", "animus"] as const).map((opt) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={settings.soundset === opt ? "default" : "outline"}
                        onClick={() => setSettings((p) => ({ ...p, soundset: opt }))}
                      >
                        {opt.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Pulse Scan */}
            <TabsContent value="pulse" className="mt-0 space-y-6">
              <div className="tactical-panel space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Pulse Scan</Label>
                    <p className="text-xs text-muted-foreground">
                      Overlay sweep and POI highlights
                    </p>
                  </div>
                  <Switch
                    checked={settings.pulseScanEnabled}
                    onCheckedChange={() => {
                      handleToggle("pulseScanEnabled");
                      try {
                        window.dispatchEvent(new CustomEvent("toggle-pulse-scan"));
                      } catch {}
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Highlight POIs During Scan</Label>
                    <p className="text-xs text-muted-foreground">Jobs and active alerts</p>
                  </div>
                  <Switch
                    checked={settings.pulseHighlightPOIs}
                    onCheckedChange={() => handleToggle("pulseHighlightPOIs")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Ring Controls</Label>
                    <p className="text-xs text-muted-foreground">Adjust opacity/intensity on-map</p>
                  </div>
                  <Switch
                    checked={settings.ringControls}
                    onCheckedChange={() => handleToggle("ringControls")}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="mt-0 space-y-6">
              <div className="tactical-panel p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <Label>Screensaver Mode</Label>
                    <p className="text-sm text-muted-foreground">Auto-start after idle time</p>
                  </div>
                  <Switch
                    checked={settings.screensaver}
                    onCheckedChange={() => handleToggle("screensaver")}
                  />
                </div>
                {settings.screensaver && (
                  <div className="mt-4">
                    <Label>Idle time (minutes): {settings.screensaverDelay}</Label>
                    <Slider
                      value={[settings.screensaverDelay]}
                      onValueChange={([val]) =>
                        setSettings((prev) => ({ ...prev, screensaverDelay: val }))
                      }
                      min={1}
                      max={30}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                )}
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <Label>Boot Overlay</Label>
                    <p className="text-sm text-muted-foreground">
                      Show ISAC-style boot animation on app load
                    </p>
                  </div>
                  <Switch
                    checked={settings.bootOverlay}
                    onCheckedChange={() => handleToggle("bootOverlay")}
                  />
                </div>
              </div>
            </TabsContent>

            {/* API Keys Management */}
            <TabsContent value="api-keys" className="mt-0 space-y-6">
              <div className="tactical-panel space-y-4 p-4">
                <div className="mb-2 flex items-center gap-3">
                  <Settings className="h-5 w-5 text-primary" />
                  <Label>API Keys</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Values entered here override environment variables on this device. Keys are stored
                  locally in your browser storage.
                </p>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Google Maps API Key</Label>
                    <Input
                      type="password"
                      placeholder="AIza..."
                      value={settings.apiKeys?.googleMaps || ""}
                      onChange={(e) =>
                        setSettings((p) => ({
                          ...p,
                          apiKeys: { ...(p.apiKeys || {}), googleMaps: e.target.value },
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Google API Key (generic fallback)</Label>
                    <Input
                      type="password"
                      placeholder="AIza..."
                      value={settings.apiKeys?.googleGeneric || ""}
                      onChange={(e) =>
                        setSettings((p) => ({
                          ...p,
                          apiKeys: { ...(p.apiKeys || {}), googleGeneric: e.target.value },
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Mapbox Access Token</Label>
                    <Input
                      type="password"
                      placeholder="pk.eyJ..."
                      value={settings.apiKeys?.mapbox || ""}
                      onChange={(e) =>
                        setSettings((p) => ({
                          ...p,
                          apiKeys: { ...(p.apiKeys || {}), mapbox: e.target.value },
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">MapTiler API Key</Label>
                    <Input
                      type="password"
                      placeholder="get from maptiler.com"
                      value={settings.apiKeys?.maptiler || ""}
                      onChange={(e) =>
                        setSettings((p) => ({
                          ...p,
                          apiKeys: { ...(p.apiKeys || {}), maptiler: e.target.value },
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">OpenWeather API Key</Label>
                    <Input
                      type="password"
                      placeholder="abc123..."
                      value={settings.apiKeys?.openWeather || ""}
                      onChange={(e) =>
                        setSettings((p) => ({
                          ...p,
                          apiKeys: { ...(p.apiKeys || {}), openWeather: e.target.value },
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Provider Endpoints */}
              <div className="tactical-panel space-y-4 p-4">
                <div className="mb-2 flex items-center gap-3">
                  <Settings className="h-5 w-5 text-primary" />
                  <Label>Provider Endpoints</Label>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">
                      Patrick County Tile URL (ArcGIS MapServer tile)
                    </Label>
                    <Input
                      type="url"
                      placeholder="https://.../arcgis/rest/services/Parcels/MapServer/tile/{z}/{y}/{x}"
                      value={settings.providers?.patrickWms || ""}
                      onChange={(e) =>
                        setSettings((p) => ({
                          ...p,
                          providers: { ...(p.providers || {}), patrickWms: e.target.value },
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">
                      Patrick County Feature Layer URL (ArcGIS FeatureServer)
                    </Label>
                    <Input
                      type="url"
                      placeholder="https://.../arcgis/rest/services/Parcels/FeatureServer/0"
                      value={settings.providers?.patrickEsriFeature || ""}
                      onChange={(e) =>
                        setSettings((p) => ({
                          ...p,
                          providers: { ...(p.providers || {}), patrickEsriFeature: e.target.value },
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">USGS Imagery tile URL</Label>
                    <Input
                      type="url"
                      placeholder="https://basemap.nationalmap.gov/.../USGSImageryOnly/MapServer/tile/{z}/{y}/{x}"
                      value={settings.providers?.usgsImageryWms || ""}
                      onChange={(e) =>
                        setSettings((p) => ({
                          ...p,
                          providers: { ...(p.providers || {}), usgsImageryWms: e.target.value },
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">USDA NAIP tile URL</Label>
                    <Input
                      type="url"
                      placeholder="https://services.nationalmap.gov/.../USGSNAIPPlus/MapServer/tile/{z}/{y}/{x}"
                      value={settings.providers?.usdaNaipWms || ""}
                      onChange={(e) =>
                        setSettings((p) => ({
                          ...p,
                          providers: { ...(p.providers || {}), usdaNaipWms: e.target.value },
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Values set here override environment variables on this device.
                </p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-primary/30 p-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              try {
                localStorage.setItem("aos_settings", JSON.stringify(settings));
              } catch {}
              // Re-apply in case toggles changed without theme change
              applyThemeVariables(settings.theme as any, {
                highContrast: settings.highContrast,
                forceDark: settings.darkMode,
              });
              applyWallpaper(settings.wallpaperUrl, settings.wallpaperOpacity);
              onClose();
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
