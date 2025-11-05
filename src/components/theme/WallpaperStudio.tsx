import React, { useMemo, useRef, useState } from "react";
import {
  WallpaperSelection,
  listWallpaperPresets,
  getWallpaperPreset,
  WallpaperPreset,
} from "@/design-system";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { UploadCloud, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WallpaperStudioProps {
  selection?: WallpaperSelection;
  opacity: number;
  onSelectionChange: (selection: WallpaperSelection | undefined) => void;
  onOpacityChange: (opacity: number) => void;
}

const MAX_UPLOAD_BYTES = 2.5 * 1024 * 1024; // 2.5 MB

const buildPreviewStyle = (preset: WallpaperPreset): React.CSSProperties => {
  if (preset.kind === "gradient" && preset.gradient) {
    return {
      backgroundImage: preset.gradient,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }

  return {
    backgroundImage: `linear-gradient(rgba(9,12,20,0.55), rgba(9,12,20,0.75)), url('${preset.url}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
};

export const WallpaperStudio: React.FC<WallpaperStudioProps> = ({
  selection,
  opacity,
  onSelectionChange,
  onOpacityChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = useMemo(() => listWallpaperPresets(), []);
  const activePreset = selection?.presetId ? getWallpaperPreset(selection.presetId) : undefined;

  const handlePresetClick = (preset: WallpaperPreset) => {
    setError(null);
    onSelectionChange({ presetId: preset.id, kind: preset.kind, customUrl: preset.url });
  };

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Please choose an image under 2.5MB for reliable offline caching.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : undefined;
      if (!dataUrl) {
        setError("Unable to read the selected image. Try a different file format.");
        return;
      }
      setError(null);
      onSelectionChange({
        kind: "upload",
        customUrl: dataUrl,
        fileName: file.name,
      });
    };
    reader.onerror = () => {
      setError("Failed to process the image. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const clearWallpaper = () => {
    setError(null);
    onSelectionChange(undefined);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.32em] text-muted-foreground">
          Wallpaper Studio
        </div>
        <p className="mt-1 text-xs text-muted-foreground/80">
          Curate the tactical backdrop for your command center. Presets ship with built-in grid, glow,
          and vignette values tuned for the Division HUD aesthetic.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {presets.map((preset) => {
          const isActive = selection?.presetId === preset.id;
          const previewStyle = buildPreviewStyle(preset);

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetClick(preset)}
              aria-pressed={isActive}
              className={cn(
                "group relative flex h-36 w-full flex-col justify-end overflow-hidden rounded-2xl border border-border/45 bg-background/60 p-4 text-left transition-all",
                "hover:border-primary/50 hover:shadow-[0_16px_48px_rgba(255,111,15,0.22)]",
                isActive && "border-primary/70 shadow-[0_18px_60px_rgba(255,111,15,0.3)]",
              )}
              style={previewStyle}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-background/20 transition-opacity group-hover:opacity-80" />
              <div className="relative flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={isActive ? "default" : "outline"} className="uppercase tracking-[0.28em]">
                    {preset.name}
                  </Badge>
                  {preset.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-background/70 text-[0.65rem] uppercase tracking-widest">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/90 line-clamp-2 drop-shadow-sm">
                  {preset.description}
                </p>
                {preset.recommendedThemes && (
                  <div className="flex flex-wrap gap-1 text-[0.625rem] text-muted-foreground/80">
                    <span className="font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
                      Pair with
                    </span>
                    {preset.recommendedThemes.map((theme) => (
                      <Badge key={theme} variant="outline" className="border-border/50 bg-background/70 text-[0.625rem] uppercase tracking-wide">
                        {theme.replace(/[-_]/g, " ")}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-dashed border-primary/35 bg-background/70 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <UploadCloud className="h-4 w-4 text-primary" />
              Custom Wallpaper
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a JPG or PNG to personalise the command center for your church or client. Files stay local to
              the browser and are never synced to Supabase.
            </p>
            {selection?.kind === "upload" && selection.customUrl && (
              <div className="relative mt-2 h-24 w-48 overflow-hidden rounded-xl border border-border/30">
                <img src={selection.customUrl} alt="Custom wallpaper preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={clearWallpaper}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-destructive transition hover:bg-background"
                  title="Remove custom wallpaper"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            )}
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(event) => handleUpload(event.target.files?.[0] ?? null)}
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="border-primary/40 text-primary hover:bg-primary/10">
              Upload Image
            </Button>
            <Button variant="ghost" size="sm" onClick={clearWallpaper} className="text-xs text-muted-foreground hover:text-destructive">
              Clear Wallpaper
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Wallpaper Opacity</span>
          <span>{opacity}%</span>
        </div>
        <Slider value={[opacity]} min={20} max={100} step={1} onValueChange={([value]) => onOpacityChange(value)} className="w-full" />
        <p className="text-xs text-muted-foreground/80">
          Lower opacity increases readability for dense operations data while preserving ambience. Most Division skins
          look best between 55% and 75%.
        </p>
      </div>

      <div className="rounded-xl border border-border/35 bg-background/70 p-4 text-xs text-muted-foreground/80">
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Active Wallpaper</div>
        <div className="mt-1">
          {selection?.kind === "upload" && selection.customUrl && selection.fileName && <span>Custom upload • {selection.fileName}</span>}
          {selection?.presetId && activePreset && <span>{activePreset.name} preset</span>}
          {!selection && <span>None (solid background)</span>}
        </div>
      </div>
    </div>
  );
};
