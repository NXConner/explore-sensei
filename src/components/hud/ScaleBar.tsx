import React, { useMemo } from "react";

function niceScale(meters: number) {
  const units = [
    { limit: 1, label: "m", factor: 1 },
    { limit: 1000, label: "m", factor: 1 },
    { limit: 1609.34, label: "m", factor: 1 },
    { limit: Infinity, label: "mi", factor: 1609.34 },
  ];
  const unit = meters < 1609.34 ? units[1] : units[3];
  const value = meters / unit.factor;
  const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500];
  let best = steps[0];
  for (const s of steps) {
    if (s >= value) { best = s; break; }
  }
  const pxPerMeter = 100 / meters; // for 100px bar
  const widthPx = Math.max(20, Math.min(100, Math.round((best * unit.factor) * pxPerMeter)));
  return { label: `${best} ${unit.label}`, widthPx };
}

export const ScaleBar: React.FC<{ lat?: number; zoom?: number }>= ({ lat = 0, zoom = 0 }) => {
  const { widthPx, label } = useMemo(() => {
    const earthCircumference = 40075016.686; // meters at equator
    const metersPerPixel = (lat: number, zoom: number) => {
      return (
        Math.cos((lat * Math.PI) / 180) * earthCircumference / (256 * Math.pow(2, zoom))
      );
    };
    const mpp = Math.max(0.01, metersPerPixel(lat, zoom || 0));
    const metersAt100px = mpp * 100;
    return niceScale(metersAt100px);
  }, [lat, zoom]);

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[950]">
      <div className="h-1 bg-foreground/60 relative" style={{ width: `${widthPx}px` }}>
        <div className="absolute inset-y-0 left-0 w-[1px] bg-foreground/60" />
        <div className="absolute inset-y-0 right-0 w-[1px] bg-foreground/60" />
      </div>
      <div className="text-[10px] text-center text-muted-foreground mt-1">{label}</div>
    </div>
  );
};
