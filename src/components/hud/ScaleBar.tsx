import React from "react";

export const ScaleBar: React.FC = () => {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[950]">
      <div className="w-48 h-1 bg-foreground/60 relative">
        <div className="absolute inset-y-0 left-0 w-[1px] bg-foreground/60" />
        <div className="absolute inset-y-0 right-0 w-[1px] bg-foreground/60" />
      </div>
      <div className="text-[10px] text-center text-muted-foreground mt-1">Scale</div>
    </div>
  );
};
