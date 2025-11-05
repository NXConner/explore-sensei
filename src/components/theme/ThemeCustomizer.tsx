import React from "react";
import { ThemeId, WallpaperSelection } from "@/design-system";
import { HUDPanel } from "@/components/foundation";
import { ThemeSelector } from "./ThemeSelector";
import { WallpaperStudio } from "./WallpaperStudio";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HudFxSettings {
  glitchEffect: boolean;
  scanlineEffect: boolean;
  gridOverlay: boolean;
  animationSpeed: number;
  glitchIntensity: number;
  reduceMotion: boolean;
  bootOverlay: boolean;
}

interface ThemeCustomizerProps {
  themeId: ThemeId;
  onThemeChange: (themeId: ThemeId) => void;
  fidelityMode: "inspired" | "faithful";
  onFidelityModeChange: (mode: "inspired" | "faithful") => void;
  premiumAccess?: boolean;
  wallpaperSelection?: WallpaperSelection;
  wallpaperOpacity: number;
  onWallpaperSelectionChange: (selection?: WallpaperSelection) => void;
  onWallpaperOpacityChange: (opacity: number) => void;
  wallpaperRemoteUrl?: string;
  onWallpaperRemoteUrlChange: (url: string) => void;
  hudFx: HudFxSettings;
  onHudFxChange: (patch: Partial<HudFxSettings>) => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  themeId,
  onThemeChange,
  fidelityMode,
  onFidelityModeChange,
  premiumAccess,
  wallpaperSelection,
  wallpaperOpacity,
  onWallpaperSelectionChange,
  onWallpaperOpacityChange,
  wallpaperRemoteUrl,
  onWallpaperRemoteUrlChange,
  hudFx,
  onHudFxChange,
}) => {
  const handleSwitch = (key: keyof HudFxSettings) => (value: boolean) => {
    onHudFxChange({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <HUDPanel className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
              Palette Selection
            </div>
            <p className="text-xs text-muted-foreground/80">
              Choose Division-inspired palettes with built-in wallpapers and HUD tuning.
            </p>
          </div>
          <Badge variant="outline" className="border-border/40 bg-background/70 uppercase tracking-[0.32em]">
            {fidelityMode === "faithful" ? "Faithful" : "Inspired"}
          </Badge>
        </div>
        <ThemeSelector value={themeId} onChange={onThemeChange} premiumAccess={premiumAccess} />
      </HUDPanel>

      <HUDPanel className="space-y-6" withGlow>
        <WallpaperStudio
          selection={wallpaperSelection}
          opacity={wallpaperOpacity}
          onSelectionChange={onWallpaperSelectionChange}
          onOpacityChange={onWallpaperOpacityChange}
        />
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Remote Wallpaper URL
          </Label>
          <Input
            type="url"
            placeholder="https://assets.example.com/brand/wallpaper.jpg"
            value={wallpaperRemoteUrl ?? ""}
            onChange={(event) => onWallpaperRemoteUrlChange(event.target.value)}
            className="h-9 border-border/50 bg-background/70 text-sm"
          />
          <p className="text-[0.7rem] text-muted-foreground">
            Provide a hosted image to synchronise branding with remote teams. Leaving this blank uses the selected preset
            or custom upload.
          </p>
        </div>
      </HUDPanel>

      <HUDPanel className="grid gap-4 md:grid-cols-2" withGlow>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Fidelity Mode</Label>
              <p className="text-xs text-muted-foreground/80">Switch between lore-inspired and faithful colour tuning.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onFidelityModeChange("inspired")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition",
                  fidelityMode === "inspired" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-primary",
                )}
              >
                Inspired
              </button>
              <button
                type="button"
                onClick={() => onFidelityModeChange("faithful")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition",
                  fidelityMode === "faithful" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-primary",
                )}
              >
                Faithful
              </button>
            </div>
          </div>
          <div className="grid gap-3">
            <ToggleRow label="Glitch Effects" description="Enable the route-change and button glitch pulse." value={hudFx.glitchEffect} onChange={handleSwitch("glitchEffect")}
            />
            <ToggleRow label="Scanline Overlay" description="Add a subtle HUD scanline over mission panels." value={hudFx.scanlineEffect} onChange={handleSwitch("scanlineEffect")}
            />
            <ToggleRow label="Grid Overlay" description="Render the tactical grid atop HUD surfaces." value={hudFx.gridOverlay} onChange={handleSwitch("gridOverlay")}
            />
            <ToggleRow label="Boot Overlay" description="Show the ISAC-style boot vignette on load." value={hudFx.bootOverlay} onChange={handleSwitch("bootOverlay")}
            />
            <ToggleRow label="Reduce Motion" description="Respect reduced motion preference for operators." value={hudFx.reduceMotion} onChange={handleSwitch("reduceMotion")}
            />
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Glitch Intensity</Label>
            <Slider
              value={[hudFx.glitchIntensity]}
              min={0}
              max={60}
              step={5}
              onValueChange={([value]) => onHudFxChange({ glitchIntensity: value })}
            />
            <p className="text-[0.7rem] text-muted-foreground">Controls the strength of HUD glitch artifacts.</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Animation Pace</Label>
            <Slider
              value={[hudFx.animationSpeed]}
              min={40}
              max={160}
              step={10}
              onValueChange={([value]) => onHudFxChange({ animationSpeed: value })}
            />
            <p className="text-[0.7rem] text-muted-foreground">
              Lower values speed up the HUD animations; higher values slow them down for calmer control rooms.
            </p>
          </div>
        </div>
      </HUDPanel>
    </div>
  );
};

interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, value, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">{label}</div>
      <p className="text-[0.7rem] text-muted-foreground/80">{description}</p>
    </div>
    <Switch checked={value} onCheckedChange={onChange} />
  </div>
);
