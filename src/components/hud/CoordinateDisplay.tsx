import React from "react";

export const CoordinateDisplay: React.FC<{ lat?: number; lng?: number }>= ({ lat, lng }) => {
  return (
    <div className="absolute left-2 bottom-20 z-[var(--z-corners)] hud-element px-2 py-1 text-[10px] pointer-events-none">
      <span className="text-muted-foreground mr-1">Lat</span>
      <span className="font-mono text-foreground">{lat?.toFixed(6) ?? "--.------"}</span>
      <span className="text-muted-foreground mx-2">Lng</span>
      <span className="font-mono text-foreground">{lng?.toFixed(6) ?? "--.------"}</span>
    </div>
  );
};
