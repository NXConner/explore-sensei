import React from "react";

export const MiniMap: React.FC = () => {
  return (
    <div className="absolute right-4 top-16 w-48 h-48 z-[980] hud-element border-primary/30">
      <div className="w-full h-full bg-black/30 flex items-center justify-center text-[10px] text-muted-foreground">Mini-Map</div>
    </div>
  );
};
