import { useEffect, useRef } from "react";
import { beep } from "@/lib/audioEffects";

export type RadarType = "standard" | "sonar" | "aviation";

export function useRadarEffects({
  enabled,
  type,
  speed,
  volume,
}: {
  enabled: boolean;
  type: RadarType;
  speed: number; // 1..10
  volume: number; // 0..100
}) {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    // Approximate revolution time based on visual speed factor
    const revolutionMs = Math.max(800, 6000 - speed * 500);
    const pingEveryDegrees = 45; // 8 pings per revolution
    const pingInterval = Math.max(120, (revolutionMs * pingEveryDegrees) / 360);

    const frequencyForType = () => {
      switch (type) {
        case "sonar":
          return 660;
        case "aviation":
          return 990;
        default:
          return 820;
      }
    };

    const waveForType = () => (type === "aviation" ? "square" : type === "sonar" ? "sine" : "triangle");

    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      beep({ frequency: frequencyForType(), durationMs: 60, volume: Math.max(0, Math.min(1, volume / 100)), type: waveForType() as any });
    }, pingInterval);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [enabled, type, speed, volume]);
}
