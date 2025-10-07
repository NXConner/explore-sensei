import React, { useState } from "react";
import { X, Cloud, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface WeatherRadarModalProps {
  onClose: () => void;
}

export const WeatherRadarModal = ({ onClose }: WeatherRadarModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeIndex, setTimeIndex] = useState(0);
  const [opacity, setOpacity] = useState(70);

  const timeFrames = [
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", 
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="tactical-panel w-full max-w-5xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <Cloud className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">WEATHER RADAR</h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Radar Display */}
        <div className="flex-1 bg-muted/20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground">Weather radar overlay visualization</p>
          </div>
          
          {/* Time Display */}
          <div className="absolute top-4 left-4 tactical-panel p-2">
            <p className="text-sm font-mono text-primary">{timeFrames[timeIndex]}</p>
          </div>

          {/* Opacity Control */}
          <div className="absolute top-4 right-4 tactical-panel p-4 w-48">
            <p className="text-xs mb-2">Opacity: {opacity}%</p>
            <Slider
              value={[opacity]}
              onValueChange={([val]) => setOpacity(val)}
              min={0}
              max={100}
              step={5}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-primary/30 space-y-4">
          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setTimeIndex(Math.max(0, timeIndex - 1))}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              className="h-12 w-12"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setTimeIndex(Math.min(timeFrames.length - 1, timeIndex + 1))}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Timeline Scrubber */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{timeFrames[0]}</span>
              <span>Current: {timeFrames[timeIndex]}</span>
              <span>{timeFrames[timeFrames.length - 1]}</span>
            </div>
            <Slider
              value={[timeIndex]}
              onValueChange={([val]) => setTimeIndex(val)}
              min={0}
              max={timeFrames.length - 1}
              step={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};