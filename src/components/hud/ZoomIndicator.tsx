import React from "react";

export const ZoomIndicator: React.FC<{ zoom?: number }>= ({ zoom }) => {
  if (zoom == null) return null;
  return (
    // Position at the inside corner where the TopBar meets the right sidebar (w-80 = 20rem)
    <div className="absolute right-[21rem] top-[84px] z-[var(--z-corners)] hud-element px-2 py-1 text-xs">
      Zoom: <span className="font-mono">{Math.round(zoom)}</span>
    </div>
  );
};
