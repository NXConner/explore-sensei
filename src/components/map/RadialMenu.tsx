import React, { useEffect, useRef, useState } from "react";
import { Ruler, Circle, Square, MapPin, Trash2 } from "lucide-react";
import { DrawingMode } from "@/hooks/useMapDrawing";

interface RadialMenuProps {
  onSelect: (mode: DrawingMode) => void;
}

export const RadialMenu: React.FC<RadialMenuProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const centerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'q') setOpen(true);
    };
    const up = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'q') setOpen(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  if (!open) return null;
  const items: Array<{ icon: any; mode: DrawingMode; label: string; angle: number }> = [
    { icon: MapPin, mode: 'marker', label: 'Pin', angle: -90 },
    { icon: Ruler, mode: 'measure', label: 'Measure', angle: -45 },
    { icon: Circle, mode: 'circle', label: 'Circle', angle: 0 },
    { icon: Square, mode: 'rectangle', label: 'Area', angle: 45 },
    { icon: Trash2, mode: null, label: 'Clear', angle: 90 },
  ];

  return (
    <div className="absolute inset-0 z-[980] pointer-events-none">
      <div ref={centerRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {items.map((it, idx) => (
          <button
            key={idx}
            className="pointer-events-auto absolute w-10 h-10 rounded-full hud-element border-primary/40 flex items-center justify-center text-xs"
            style={{ transform: `translate(-50%, -50%) rotate(${it.angle}deg) translateY(-120px) rotate(${-it.angle}deg)` }}
            onClick={() => onSelect(it.mode)}
            title={it.label}
          >
            <it.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
