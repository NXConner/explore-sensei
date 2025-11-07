import React from "react";

export const ZoomIndicator: React.FC<{ zoom?: number }>= ({ zoom }) => {
  if (zoom == null) return null;
  return (
    // Position at bottom right, above KPI ticker
    <div className="absolute right-2 bottom-20 z-[var(--z-corners)] hud-element px-2 py-1 text-[10px] pointer-events-none">
      <span className="text-muted-foreground mr-1">Z</span>
      <span className="font-mono text-foreground">{Math.round(zoom)}</span>
    </div>
  );
};
