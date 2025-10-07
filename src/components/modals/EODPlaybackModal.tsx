import React, { useState } from "react";
import { X, Play, Pause, SkipBack, SkipForward, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface EODPlaybackModalProps {
  onClose: () => void;
}

export const EODPlaybackModal = ({ onClose }: EODPlaybackModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  const activities = [
    { time: "08:00", event: "Job Start", location: "Site A - Main St", crew: "Team Alpha" },
    { time: "10:30", event: "Equipment Arrival", location: "Site A - Main St", crew: "Team Alpha" },
    { time: "12:00", event: "Lunch Break", location: "Site A - Main St", crew: "All Teams" },
    { time: "14:00", event: "Material Delivery", location: "Site B - Oak Ave", crew: "Team Bravo" },
    { time: "16:30", event: "Progress Update", location: "Site A - Main St", crew: "Team Alpha" },
    { time: "17:00", event: "Job Complete", location: "Site A - Main St", crew: "Team Alpha" },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="tactical-panel w-full max-w-6xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">END-OF-DAY PLAYBACK</h2>
            <Badge variant="outline">February 15, 2024</Badge>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Map Preview Area */}
        <div className="flex-1 bg-muted/20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground">Map playback visualization area</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-4 space-y-4 border-t border-primary/30">
          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="icon">
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
            <Button variant="outline" size="icon">
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Time Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>08:00 AM</span>
              <span>Current: {activities[playbackTime]?.time || "08:00"}</span>
              <span>17:00 PM</span>
            </div>
            <Slider
              value={[playbackTime]}
              onValueChange={([val]) => setPlaybackTime(val)}
              min={0}
              max={activities.length - 1}
              step={1}
            />
          </div>
        </div>

        {/* Activity List */}
        <div className="border-t border-primary/30">
          <ScrollArea className="h-48">
            <div className="p-4 space-y-2">
              {activities.map((activity, idx) => (
                <div
                  key={idx}
                  className={`tactical-panel p-3 transition-all cursor-pointer ${
                    idx === playbackTime ? "border-primary" : "opacity-50"
                  }`}
                  onClick={() => setPlaybackTime(idx)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-primary">{activity.time}</span>
                      <div>
                        <p className="font-semibold">{activity.event}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.location} • {activity.crew}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};