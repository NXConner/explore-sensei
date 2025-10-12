import React from "react";

export const MiniMap: React.FC = () => {
  return (
    <div className="absolute left-2 bottom-24 w-40 h-40 z-[950] hud-element border-primary/30">
      <div className="w-full h-full bg-black/30 flex items-center justify-center text-[10px] text-muted-foreground">Mini-Map</div>
    </div>
  );
};
