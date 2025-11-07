import React from "react";

export const CoordinateDisplay: React.FC<{ lat?: number; lng?: number }> = ({ lat, lng }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const formatCoord = (val: number, isLat: boolean) => {
    const absVal = Math.abs(val);
    const dir = isLat ? (val >= 0 ? "N" : "S") : (val >= 0 ? "E" : "W");
    return `${absVal.toFixed(5)}° ${dir}`;
  };

  return (
    <div 
      className={`absolute bottom-20 left-4 z-[var(--z-corners)] hud-element text-xs font-mono px-3 py-1.5 border border-primary/30 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-hud-sm ${isVisible ? 'animate-hud-slide-in' : 'opacity-0'}`}
      aria-label="Current coordinates"
    >
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">LAT:</span>
        <span className="text-primary font-semibold">{lat != null ? formatCoord(lat, true) : "--"}</span>
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-muted-foreground">LNG:</span>
        <span className="text-primary font-semibold">{lng != null ? formatCoord(lng, false) : "--"}</span>
      </div>
    </div>
  );
};
