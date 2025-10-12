import React, { useState } from "react";
import { Eye, Sun, Contrast, Sparkles, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export const MapVisibilityControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [controls, setControls] = useState({
    brightness: 100,
    contrast: 100,
    sharpness: 0,
    hdr: 0,
    gamma: 100,
    shadows: 0,
    highlights: 0,
  });

  const [presets, setPresets] = useState([
    {
      name: "Default",
      values: {
        brightness: 100,
        contrast: 100,
        sharpness: 0,
        hdr: 0,
        gamma: 100,
        shadows: 0,
        highlights: 0,
      },
    },
    {
      name: "High Contrast",
      values: {
        brightness: 110,
        contrast: 130,
        sharpness: 20,
        hdr: 0,
        gamma: 100,
        shadows: -10,
        highlights: 10,
      },
    },
  ]);

  const handleControlChange = (key: keyof typeof controls, value: number) => {
    setControls((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: (typeof presets)[0]) => {
    setControls(preset.values);
  };

  const savePreset = () => {
    const name = prompt("Enter preset name:");
    if (name) {
      setPresets([...presets, { name, values: { ...controls } }]);
    }
  };

  const resetControls = () => {
    setControls({
      brightness: 100,
      contrast: 100,
      sharpness: 0,
      hdr: 0,
      gamma: 100,
      shadows: 0,
      highlights: 0,
    });
  };

  if (!isOpen) {
    return (
      <div className="absolute left-80 top-20 z-[900]">
        <Button onClick={() => setIsOpen(true)} size="sm" className="gap-2">
          <Eye className="w-4 h-4" />
          Enhance
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute left-80 top-20 z-[900] tactical-panel w-80">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-primary/30">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold">VISIBILITY CONTROLS</h3>
        </div>
        <Button onClick={() => setIsOpen(false)} variant="ghost" size="icon" className="h-6 w-6">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="max-h-[70vh]">
        {/* Controls */}
        <div className="p-3 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Brightness: {controls.brightness}%</Label>
            <Slider
              value={[controls.brightness]}
              onValueChange={([val]) => handleControlChange("brightness", val)}
              min={50}
              max={150}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Contrast: {controls.contrast}%</Label>
            <Slider
              value={[controls.contrast]}
              onValueChange={([val]) => handleControlChange("contrast", val)}
              min={50}
              max={150}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Sharpness: {controls.sharpness}</Label>
            <Slider
              value={[controls.sharpness]}
              onValueChange={([val]) => handleControlChange("sharpness", val)}
              min={-50}
              max={50}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">HDR: {controls.hdr}</Label>
            <Slider
              value={[controls.hdr]}
              onValueChange={([val]) => handleControlChange("hdr", val)}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Gamma: {controls.gamma}%</Label>
            <Slider
              value={[controls.gamma]}
              onValueChange={([val]) => handleControlChange("gamma", val)}
              min={50}
              max={150}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Shadows: {controls.shadows}</Label>
            <Slider
              value={[controls.shadows]}
              onValueChange={([val]) => handleControlChange("shadows", val)}
              min={-50}
              max={50}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Highlights: {controls.highlights}</Label>
            <Slider
              value={[controls.highlights]}
              onValueChange={([val]) => handleControlChange("highlights", val)}
              min={-50}
              max={50}
              step={5}
            />
          </div>
        </div>

        {/* Presets */}
        <div className="p-3 border-t border-primary/30">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-bold">PRESETS</Label>
            <Button onClick={savePreset} size="sm" variant="outline" className="h-7 gap-1">
              <Save className="w-3 h-3" />
              Save
            </Button>
          </div>
          <div className="space-y-2">
            {presets.map((preset, idx) => (
              <Button
                key={idx}
                onClick={() => applyPreset(preset)}
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
              >
                <Sparkles className="w-3 h-3 mr-2" />
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 border-t border-primary/30 flex gap-2">
          <Button onClick={resetControls} variant="outline" size="sm" className="flex-1">
            Reset
          </Button>
          <Button size="sm" className="flex-1">
            Apply
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};
