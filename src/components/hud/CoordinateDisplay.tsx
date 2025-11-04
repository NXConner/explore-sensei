import React from "react";

export const CoordinateDisplay: React.FC<{ lat?: number; lng?: number }>= ({ lat, lng }) => {
  return (
    <div className="absolute left-2 bottom-20 z-[var(--z-corners)] hud-element px-2 py-1 text-xs">
      <span className="text-muted-foreground mr-1">Lat</span>
      <span className="font-mono">{lat?.toFixed(6) ?? "--.--"}</span>
      <span className="text-muted-foreground mx-2">Lng</span>
      <span className="font-mono">{lng?.toFixed(6) ?? "--.--"}</span>
    </div>
  );
};
