import React, { useEffect, useState } from "react";
import { X, Settings, Moon, Sun, Bell, ImageUp, Zap, Volume2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal = ({ onClose }: SettingsModalProps) => {
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
    glitchEffect: true,
    scanlineEffect: true,
    gridOverlay: true,
    radarSpeed: 3,
    glitchIntensity: 30,
    animationSpeed: 100,
    // Sounds
    uiSounds: false,
    alertSounds: true,
    soundVolume: 70,
    // Themes & Wallpapers
    theme: "tactical-dark" as "tactical-dark" | "light" | "high-contrast" | "church-blue" | "safety-green",
    wallpaperUrl: "",
    wallpaperOpacity: 60,
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

  useEffect(() => {
    try {
      localStorage.setItem("aos_settings", JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Apply theme by setting CSS variables on :root
  useEffect(() => {
    const root = document.documentElement as HTMLElement;
    const applyTheme = (theme: typeof settings.theme) => {
      // default base from index.css. Override selectively.
      const themes: Record<string, Record<string, string>> = {
        "tactical-dark": {
          "--primary": "30 100% 50%",
          "--accent": "197 100% 50%",
          "--background": "0 0% 4%",
          "--foreground": "0 0% 88%",
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
        },
        "church-blue": {
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
      };
      const selected = themes[theme] || themes["tactical-dark"];
      Object.entries(selected).forEach(([k, v]) => root.style.setProperty(k, v));
    };

    applyTheme(settings.theme);

    // Apply wallpaper overlay via body background-image
    const body = document.body as HTMLBodyElement;
    if (settings.wallpaperUrl) {
      body.style.backgroundImage = `url('${settings.wallpaperUrl}')`;
      body.style.backgroundSize = 'cover';
      body.style.backgroundRepeat = 'no-repeat';
      body.style.backgroundAttachment = 'fixed';
      body.style.backgroundPosition = 'center';
      body.style.opacity = String(Math.max(0.3, Math.min(1, settings.wallpaperOpacity / 100)));
    } else {
      body.style.backgroundImage = '';
      body.style.opacity = '1';
    }
  }, [settings.theme, settings.wallpaperUrl, settings.wallpaperOpacity]);

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
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="animations">Animations</TabsTrigger>
            <TabsTrigger value="sounds">Sounds</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

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

            <TabsContent value="themes" className="mt-0 space-y-6">
              <div className="tactical-panel p-4 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <Label>Theme Presets</Label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { id: "tactical-dark", label: "Tactical Dark" },
                    { id: "light", label: "Light" },
                    { id: "high-contrast", label: "High Contrast" },
                    { id: "church-blue", label: "Church Blue" },
                    { id: "safety-green", label: "Safety Green" },
                  ].map((t) => (
                    <Button
                      key={t.id}
                      variant={settings.theme === (t.id as any) ? "default" : "outline"}
                      onClick={() => setSettings((p) => ({ ...p, theme: t.id as any }))}
                      className="justify-start"
                    >
                      {t.label}
                    </Button>
                  ))}
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
                    <div className="pl-4">
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
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="p-4 border-t border-primary/30 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};