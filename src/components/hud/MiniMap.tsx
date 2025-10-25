import React from "react";

type MiniMapProps = {
  variant?: "overlay" | "embedded";
  className?: string;
};

export const MiniMap: React.FC<MiniMapProps> = ({ variant = "overlay", className }) => {
  if (variant === "embedded") {
    return (
      <div className={"w-full rounded border border-primary/30 bg-background/60 " + (className || "h-36")}
        aria-label="Mini Map">
        <div className="w-full h-full bg-black/30 flex items-center justify-center text-[10px] text-muted-foreground">
          Mini-Map
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-12 top-16 w-48 h-48 z-[980] hud-element border-primary/30" aria-label="Mini Map">
      <div className="w-full h-full bg-black/30 flex items-center justify-center text-[10px] text-muted-foreground">Mini-Map</div>
    </div>
  );
};
