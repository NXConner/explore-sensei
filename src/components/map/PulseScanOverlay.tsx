import React, { useEffect, useRef } from "react";

interface PulseScanOverlayProps {
  enabled: boolean;
  color?: string;
  speed?: number; // degrees per tick
}

export const PulseScanOverlay: React.FC<PulseScanOverlayProps> = ({ enabled, color = "rgba(0, 255, 255, 0.18)", speed = 3 }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    let angle = 0;
    let id: number | null = null;
    const step = () => {
      angle = (angle + speed) % 360;
      if (ref.current) ref.current.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => { if (id) cancelAnimationFrame(id); };
  }, [enabled, speed]);

  if (!enabled) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-[140]">
      <div ref={ref} className="absolute top-1/2 left-1/2 w-[200%] h-[200%]" style={{
        background: `conic-gradient(from 0deg, transparent 0%, ${color} 8%, transparent 14%)`,
        transform: 'translate(-50%, -50%)',
        transformOrigin: 'center'
      }} />
    </div>
  );
}
