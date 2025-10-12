import React from "react";

export const ZoomIndicator: React.FC<{ zoom?: number }>= ({ zoom }) => {
  if (zoom == null) return null;
  return (
    <div className="absolute right-16 bottom-16 z-[950] hud-element px-2 py-1 text-[11px]">
      Zoom: <span className="font-mono">{Math.round(zoom)}</span>
    </div>
  );
};
