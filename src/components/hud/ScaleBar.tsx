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

export const ScaleBar: React.FC<{ lat?: number; zoom?: number }> = ({ lat = 0, zoom = 0 }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

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
    <div 
      className={`absolute bottom-[88px] left-4 z-[var(--z-corners)] hud-element text-xs font-mono px-2 py-1.5 border border-primary/30 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-hud-sm ${isVisible ? 'animate-hud-slide-in' : 'opacity-0'}`}
      aria-label="Map scale"
    >
      <div className="flex items-center gap-2">
        <div className="relative h-1 bg-primary/40 transition-all duration-200" style={{ width: `${widthPx}px` }}>
          <div className="absolute left-0 top-0 bottom-0 w-px bg-primary" />
          <div className="absolute right-0 top-0 bottom-0 w-px bg-primary" />
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
};
