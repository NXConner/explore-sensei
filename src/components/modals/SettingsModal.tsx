import React, { useEffect, useMemo, useState } from "react";
import { X, Settings, Moon, Sun, Bell, ImageUp, Zap, Volume2, Palette, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGamificationToggle } from "@/context/GamificationContext";
import { Slider } from "@/components/ui/slider";
import { WeatherAlertLocationsManager } from "./WeatherAlertLocationsManager";
import { applyThemeVariables, applyWallpaper } from "@/lib/theme";
import { Input } from "@/components/ui/input";
import { detectExistingApiKeys } from "@/config/env";

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
    // Animation & Effects
    radarEffect: true,
    radarType: 'standard' as 'standard' | 'sonar' | 'aviation',
    glitchEffect: true,
    scanlineEffect: true,
    gridOverlay: true,
    radarSpeed: 3,
    glitchIntensity: 30,
    animationSpeed: 100,
    glitchClickPreset: 'subtle' as 'barely' | 'subtle' | 'normal',
    vignetteEffect: false,
    // Sounds
    uiSounds: false,
    alertSounds: true,
    soundVolume: 70,
    radarAudioEnabled: false,
    radarAudioVolume: 50,
    // Weather Alerts
    weatherAlertsEnabled: true,
    weatherAlertRadius: 15,
    // Themes & Wallpapers
    theme: "tactical-dark" as
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
      | "black-tusk",
    mapTheme: "division" as "division" | "animus",
    wallpaperUrl: "",
    wallpaperOpacity: 60,
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
    },
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
        if (!merged.googleGeneric && found.googleGeneric) merged.googleGeneric = found.googleGeneric;
        if (!merged.mapbox && found.mapbox) merged.mapbox = found.mapbox;
        if (!merged.openWeather && found.openWeather) merged.openWeather = found.openWeather;
        return { ...prev, apiKeys: merged };
      });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("aos_settings", JSON.stringify(settings));
      // notify live listeners in same tab
      window.dispatchEvent(new Event("aos_settings_updated"));
    } catch {}
  }, [settings]);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Apply theme by setting CSS variables on :root and sync dark class based on darkMode
  useEffect(() => {
    applyThemeVariables(settings.theme as any, { highContrast: settings.highContrast, forceDark: settings.darkMode });
    applyWallpaper(settings.wallpaperUrl, settings.wallpaperOpacity);
  }, [settings.theme, settings.wallpaperUrl, settings.wallpaperOpacity, settings.highContrast, settings.darkMode]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="tactical-panel w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">SETTINGS</h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <Tabs defaultValue="appearance" className="flex-1 flex flex-col">
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
                      <Moon className="w-5 h-5 text-primary" />
                    ) : (
                      <Sun className="w-5 h-5 text-primary" />
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
              <div className="tactical-panel p-4 space-y-3">
                <div className="text-sm font-semibold">HUD Elements</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Corner Brackets</span>
                  <Switch checked={true} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Compass Rose</span>
                  <Switch checked={true} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Coordinate Display</span>
                  <Switch checked={true} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Scale Bar</span>
                  <Switch checked={true} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Zoom Indicator</span>
                  <Switch checked={true} disabled />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="weather" className="mt-0 space-y-6">
              <div className="tactical-panel p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Weather Alerts</Label>
                    <p className="text-xs text-muted-foreground">Show alert radius circles and markers</p>
                  </div>
                  <Switch
                    checked={settings.weatherAlertsEnabled}
                    onCheckedChange={() => handleToggle('weatherAlertsEnabled')}
                  />
                </div>
                <div>
                  <Label className="text-xs">Alert Radius: {settings.weatherAlertRadius} miles</Label>
                  <Slider
                    value={[settings.weatherAlertRadius]}
                    onValueChange={([val]) => setSettings((p) => ({ ...p, weatherAlertRadius: val }))}
                    min={5}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              <WeatherAlertLocationsManager />
            </TabsContent>

            <TabsContent value="themes" className="mt-0 space-y-6">
              <div className="tactical-panel p-4 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <Label>Theme Presets</Label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { id: "tactical-dark", label: "Tactical Dark", premium: false },
                    { id: "light", label: "Light", premium: false },
                    { id: "high-contrast", label: "High Contrast", premium: false },
                    { id: "industry-blue", label: "Industry Blue", premium: false },
                    { id: "safety-green", label: "Safety Green", premium: false },
                    // Division-inspired collection
                    { id: "division-shd", label: "Division: SHD", premium: false },
                    { id: "dark-zone", label: "Division: Dark Zone", premium: false },
                    { id: "black-tusk", label: "Division: Black Tusk", premium: false },
                    // Premium industry themes
                    { id: "construction", label: "Construction (Premium)", premium: true },
                    { id: "landscaping", label: "Landscaping (Premium)", premium: true },
                    { id: "security", label: "Security (Premium)", premium: true },
                    { id: "aviation", label: "Aviation (Premium)", premium: true },
                  ].map((t) => (
                    <Button
                      key={t.id}
                      variant={settings.theme === (t.id as any) ? "default" : "outline"}
                      onClick={() => {
                        if (t.premium && !settings.premiumEnabled) return;
                        setSettings((p) => ({ ...p, theme: t.id as any }));
                      }}
                      className={`justify-start ${t.premium && !settings.premiumEnabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {t.label}
                    </Button>
                   ))}
                </div>
              </div>

              {/* Map Theme Selection */}
              <div className="tactical-panel p-4 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <Label>Map Theme</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={settings.mapTheme === "division" ? "default" : "outline"}
                    onClick={() => setSettings((p) => ({ ...p, mapTheme: "division" }))}
                    className="justify-start"
                  >
                    Division
                  </Button>
                  <Button
                    variant={settings.mapTheme === "animus" ? "default" : "outline"}
                    onClick={() => setSettings((p) => ({ ...p, mapTheme: "animus" }))}
                    className="justify-start"
                  >
                    Animus
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose between Division (orange) and Animus (cyan) map styles
                </p>
              </div>

              {/* Default Map Location */}
              <div className="tactical-panel p-4 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-primary" />
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
                    <input
                      type="text"
                      value={settings.defaultMapAddress}
                      onChange={(e) => setSettings((p) => ({ ...p, defaultMapAddress: e.target.value }))}
                      placeholder="123 Main St, City, State"
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-sm"
                      disabled={!settings.useDefaultLocation}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Fallback location when GPS is unavailable
                    </p>
                  </div>
                </div>
              </div>

              <div className="tactical-panel p-4 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <ImageUp className="w-5 h-5 text-primary" />
                  <Label>Custom Wallpaper</Label>
                </div>
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (https://...)"
                    value={settings.wallpaperUrl}
                    onChange={(e) => setSettings((p) => ({ ...p, wallpaperUrl: e.target.value }))}
                    className="w-full hud-element border-primary/30 rounded px-3 py-2 text-sm bg-transparent"
                  />
                  <div className="pl-1">
                    <Label className="text-xs">Wallpaper Opacity: {settings.wallpaperOpacity}%</Label>
                    <Slider
                      value={[settings.wallpaperOpacity]}
                      onValueChange={([val]) => setSettings((prev) => ({ ...prev, wallpaperOpacity: val }))}
                      min={10}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Theme Customizer with Live Preview */}
              <div className="tactical-panel p-4 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Label>Theme Customizer</Label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Primary Hue</Label>
                    <input type="range" min={0} max={360} step={1}
                      value={Number((getComputedStyle(document.documentElement).getPropertyValue('--primary').split(' ')[0]) || 30)}
                      onChange={(e) => {
                        const root = document.documentElement as HTMLElement;
                        const current = getComputedStyle(root).getPropertyValue('--primary').trim().split(' ');
                        const sat = current[1] || '100%';
                        const lum = current[2] || '50%';
                        root.style.setProperty('--primary', `${e.target.value} ${sat} ${lum}`);
                      }}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Accent Hue</Label>
                    <input type="range" min={0} max={360} step={1}
                      value={Number((getComputedStyle(document.documentElement).getPropertyValue('--accent').split(' ')[0]) || 197)}
                      onChange={(e) => {
                        const root = document.documentElement as HTMLElement;
                        const current = getComputedStyle(root).getPropertyValue('--accent').trim().split(' ');
                        const sat = current[1] || '100%';
                        const lum = current[2] || '50%';
                        root.style.setProperty('--accent', `${e.target.value} ${sat} ${lum}`);
                      }}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Background Luminance</Label>
                    <input type="range" min={0} max={100} step={1}
                      value={Number((getComputedStyle(document.documentElement).getPropertyValue('--background').split(' ')[2] || '4%').replace('%',''))}
                      onChange={(e) => {
                        const root = document.documentElement as HTMLElement;
                        const current = getComputedStyle(root).getPropertyValue('--background').trim().split(' ');
                        const h = current[0] || '0';
                        const s = current[1] || '0%';
                        root.style.setProperty('--background', `${h} ${s} ${e.target.value}%`);
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="mt-2 p-3 border border-primary/30 rounded">
                  <div className="text-xs mb-2">Live Preview</div>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 rounded bg-primary text-primary-foreground">Primary</button>
                    <button className="px-3 py-2 rounded bg-accent text-accent-foreground">Accent</button>
                    <div className="px-3 py-2 rounded border" style={{ background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>Body</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 space-y-6">
              <div className="tactical-panel p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <div>
                      <Label>Enable Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts and updates
                      </p>
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
                    <p className="text-sm text-muted-foreground">
                      Play sounds for notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.soundEffects}
                    onCheckedChange={() => handleToggle("soundEffects")}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="animations" className="mt-0 space-y-6">
              <div className="tactical-panel p-4 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-primary" />
                  <Label>Visual Effects & Animations</Label>
                </div>

                {/* Radar Effect */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Radar Sweep Effect</Label>
                      <p className="text-xs text-muted-foreground">
                        Rotating radar sweep on map
                      </p>
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
                        <div className="flex gap-2 mt-1">
                          {(["standard","sonar","aviation"] as const).map((t) => (
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
                      <p className="text-xs text-muted-foreground">
                        Tactical glitch overlay
                      </p>
                    </div>
                    <Switch
                      checked={settings.glitchEffect}
                      onCheckedChange={() => handleToggle("glitchEffect")}
                    />
                  </div>
                  {settings.glitchEffect && (
                    <div className="pl-4 space-y-3">
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
                          className="hud-element border-primary/30 rounded px-2 py-1 text-xs bg-transparent"
                          value={settings.glitchClickPreset}
                          onChange={(e) => setSettings((p) => ({ ...p, glitchClickPreset: e.target.value as any }))}
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
                    <p className="text-xs text-muted-foreground">
                      CRT-style scanlines
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      Tactical grid pattern
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      Subtle darkening near the edges
                    </p>
                  </div>
                  <Switch
                    checked={settings.vignetteEffect}
                    onCheckedChange={() => handleToggle("vignetteEffect")}
                  />
                </div>

                {/* Animation Speed */}
                <div>
                  <Label className="text-xs">Global Animation Speed: {settings.animationSpeed}%</Label>
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
              </div>
            </TabsContent>

            <TabsContent value="sounds" className="mt-0 space-y-6">
              <div className="tactical-panel p-4 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Volume2 className="w-5 h-5 text-primary" />
                  <Label>Sound Settings</Label>
                </div>

                {/* UI Sounds */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>UI Sounds</Label>
                    <p className="text-xs text-muted-foreground">
                      Button clicks and interactions
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      Notification and warning sounds
                    </p>
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
                  onCheckedChange={() => handleToggle('radarAudioEnabled')}
                />
              </div>
              {settings.radarAudioEnabled && (
                <div>
                  <Label className="text-xs">Radar Volume: {settings.radarAudioVolume}%</Label>
                  <Slider
                    value={[settings.radarAudioVolume]}
                    onValueChange={([val]) => setSettings((prev) => ({ ...prev, radarAudioVolume: val }))}
                    min={0}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              )}
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="mt-0 space-y-6">
              <div className="tactical-panel p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label>Screensaver Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Auto-start after idle time
                    </p>
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
              </div>
            </TabsContent>

            {/* API Keys Management */}
            <TabsContent value="api-keys" className="mt-0 space-y-6">
              <div className="tactical-panel p-4 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <Label>API Keys</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Values entered here override environment variables on this device. Keys are stored locally in your browser storage.
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
                      value={settings.apiKeys?.googleGeneric || ""
                      }
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
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="p-4 border-t border-primary/30 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              try {
                localStorage.setItem("aos_settings", JSON.stringify(settings));
              } catch {}
              // Re-apply in case toggles changed without theme change
              applyThemeVariables(settings.theme as any, { highContrast: settings.highContrast, forceDark: settings.darkMode });
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