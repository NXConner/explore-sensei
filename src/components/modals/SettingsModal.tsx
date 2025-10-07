import React, { useState } from "react";
import { X, Settings, Moon, Sun, Bell, Map, Zap, Volume2, Eye, Gauge } from "lucide-react";
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
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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