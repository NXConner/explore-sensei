import React from "react";

export const ZoomIndicator: React.FC<{ zoom?: number }>= ({ zoom }) => {
  if (zoom == null) return null;
  return (
    // Position at the inside corner where the TopBar meets the right sidebar (w-72)
    <div className="absolute right-[18rem] top-16 z-[950] hud-element px-2 py-1 text-[11px]">
      Zoom: <span className="font-mono">{Math.round(zoom)}</span>
    </div>
  );
};
