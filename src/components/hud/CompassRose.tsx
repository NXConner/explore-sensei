import React, { useEffect, useRef } from "react";

export const CompassRose: React.FC<{ bearing?: number }> = ({ bearing = 0 }) => {
  const needleRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!needleRef.current) return;
    // Apply rotation only to the needle, not the entire compass
    needleRef.current.style.transform = `rotate(${bearing}deg)`;
  }, [bearing]);
  
  return (
    <div className="absolute top-[140px] left-1/2 -translate-x-1/2 z-[var(--z-corners)] pointer-events-none">
      <div className="w-12 h-12 rounded-full border border-primary/60 bg-background/60 backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
        {/* Compass ticks - static */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 w-[1px] h-2 bg-primary/50"
            style={{ transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-20px)` }}
          />
        ))}
        {/* North indicator - rotates with bearing */}
        <div ref={needleRef} className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary" />
        </div>
      </div>
    </div>
  );
};
