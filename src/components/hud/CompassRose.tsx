import React, { useEffect, useRef } from "react";

export const CompassRose: React.FC<{ bearing?: number }>= ({ bearing = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.transform = `rotate(${bearing}deg)`;
  }, [bearing]);
  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[950]">
      <div ref={ref} className="w-12 h-12 rounded-full border border-primary/60 bg-background/60 backdrop-blur-sm flex items-center justify-center">
        <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary" />
      </div>
    </div>
  );
};
