import React, { useMemo, useRef, useState } from "react";
import {
  WallpaperSelection,
  listWallpaperPresets,
  getWallpaperPreset,
  WallpaperPreset,
} from "@/design-system";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface WallpaperStudioProps {
  selection?: WallpaperSelection;
  opacity: number;
  onSelectionChange: (selection: WallpaperSelection | undefined) => void;
  onOpacityChange: (opacity: number) => void;
}

const MAX_UPLOAD_BYTES = 2.5 * 1024 * 1024; // 2.5 MB

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

  const removeWallpaper = () => {
    setError(null);
    onSelectionChange(undefined);
  };

  return (
    <div className="space-y-5">
      <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Wallpaper Studio
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {presets.map((preset) => {
          const isActive = Boolean(selection?.presetId === preset.id);
          const previewStyle: React.CSSProperties =
            preset.kind === "gradient"
              ? { backgroundImage: preset.gradient }
              : {
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.65)), url('${preset.url}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                };
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className={cn(
                "group flex h-24 w-full flex-col justify-end rounded-xl border border-border/40 bg-background/50",
                "p-3 text-left transition-all hover:border-primary/50 hover:shadow-lg",
                isActive && "border-primary/70 shadow-lg shadow-primary/20",
              )}
              style={previewStyle}
            >
              <div className="relative flex flex-col gap-1">
                <div className="text-sm font-semibold text-white drop-shadow">{preset.name}</div>
                <p className="line-clamp-2 text-[0.7rem] text-white/80 drop-shadow">
                  {preset.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-dashed border-primary/30 bg-background/60 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <UploadCloud className="h-4 w-4 text-primary" />
              Custom Wallpaper
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a JPG or PNG to personalise the command center for your church or client. Files
              are stored locally and never leave the browser.
            </p>
            {selection?.kind === "upload" && selection.customUrl && (
              <div className="relative mt-2 h-20 w-40 overflow-hidden rounded-lg border border-border/30">
                <img
                  src={selection.customUrl}
                  alt="Custom wallpaper preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeWallpaper}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                  title="Remove custom wallpaper"
                >
                  <X className="h-3 w-3" />
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-primary/40 text-primary hover:bg-primary/10"
            >
              Upload Image
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeWallpaper}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
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
        <Slider
          value={[opacity]}
          min={20}
          max={100}
          step={1}
          onValueChange={([value]) => onOpacityChange(value)}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground/80">
          Lower opacity increases readability for dense operations data while preserving ambience.
        </p>
      </div>

      <div className="rounded-lg border border-border/30 bg-background/70 p-3 text-xs text-muted-foreground/90">
        <div className="font-semibold uppercase tracking-wide text-foreground/80">
          Active Wallpaper
        </div>
        <div className="mt-1 text-muted-foreground">
          {selection?.kind === "upload" && selection.customUrl && selection.fileName && (
            <span>Custom upload • {selection.fileName}</span>
          )}
          {selection?.presetId && activePreset && <span>{activePreset.name} preset</span>}
          {!selection && <span>None (solid background)</span>}
        </div>
      </div>
    </div>
  );
};
