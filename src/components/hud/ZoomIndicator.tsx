import React from "react";

export const ZoomIndicator: React.FC<{ zoom?: number }> = ({ zoom }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  if (zoom == null) return null;
  return (
    <div 
      className={`absolute bottom-20 right-4 z-[var(--z-corners)] hud-element text-xs font-mono px-3 py-1.5 border border-primary/30 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-hud-sm ${isVisible ? 'animate-hud-slide-in' : 'opacity-0'}`}
      aria-label="Map zoom level"
    >
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Z:</span>
        <span className="text-primary font-semibold">{Math.round(zoom)}</span>
      </div>
    </div>
  );
};
