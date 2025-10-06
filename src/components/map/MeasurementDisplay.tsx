import React from "react";
import { Ruler } from "lucide-react";

interface MeasurementDisplayProps {
  distance?: number;
  area?: number;
}

export const MeasurementDisplay = ({ distance, area }: MeasurementDisplayProps) => {
  if (!distance && !area) return null;

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters.toFixed(2)} m`;
    }
    const feet = meters * 3.28084;
    return `${(meters / 1000).toFixed(2)} km (${feet.toFixed(2)} ft)`;
  };

  const formatArea = (sqMeters: number) => {
    const sqFeet = sqMeters * 10.7639;
    return `${sqMeters.toFixed(2)} m² (${sqFeet.toFixed(2)} ft²)`;
  };

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] hud-element px-6 py-3">
      <div className="flex items-center gap-3">
        <Ruler className="w-5 h-5 text-primary" />
        <div>
          {distance && (
            <p className="text-sm font-bold text-glow">
              Distance: {formatDistance(distance)}
            </p>
          )}
          {area && (
            <p className="text-sm font-bold text-glow">
              Area: {formatArea(area)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
