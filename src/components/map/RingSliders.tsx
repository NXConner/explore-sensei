import React, { useEffect, useMemo, useRef, useState } from "react";

interface RingSlidersProps {
  opacityValue: number; // 0..100
  intensityValue: number; // 0..100
  onChangeOpacity: (v: number) => void;
  onChangeIntensity: (v: number) => void;
}

export const RingSliders: React.FC<RingSlidersProps> = ({ opacityValue, intensityValue, onChangeOpacity, onChangeIntensity }) => {
  const [center, setCenter] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCenter({ x: rect.width / 2, y: rect.height / 2 });
  }, []);

  const radiusOuter = 160;
  const radiusInner = 110;

  const handleDrag = (e: React.MouseEvent, which: "opacity" | "intensity") => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x); // -PI..PI
    const deg = (angle * 180) / Math.PI; // -180..180
    const normalized = (deg + 360) % 360; // 0..360
    const value = Math.round((normalized / 360) * 100);
    if (which === "opacity") onChangeOpacity(value);
    else onChangeIntensity(value);
  };

  const knob = (value: number, r: number) => {
    const angle = (value / 100) * 360;
    const rad = (angle * Math.PI) / 180;
    const x = center.x + r * Math.cos(rad);
    const y = center.y + r * Math.sin(rad);
    return { left: x - 6, top: y - 6 };
  };

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto select-none">
        {/* Outer ring - Opacity */}
        <div
          className="relative"
          style={{ width: radiusOuter * 2, height: radiusOuter * 2 }}
          onMouseDown={(e) => handleDrag(e, "opacity")}
          onMouseMove={(e) => e.buttons === 1 && handleDrag(e, "opacity")}
        >
          <div
            className="rounded-full"
            style={{
              width: radiusOuter * 2,
              height: radiusOuter * 2,
              border: "2px solid rgba(0,255,255,0.35)",
              boxShadow: "inset 0 0 20px rgba(0,255,255,0.15)",
            }}
            title={`Opacity: ${opacityValue}%`}
          />
          <div
            className="absolute w-3 h-3 bg-cyan-400 rounded-full shadow"
            style={knob(opacityValue, radiusOuter)}
          />
          <div className="absolute left-1/2 -translate-x-1/2 top-2 text-[10px] tracking-widest uppercase">Opacity {opacityValue}%</div>
        </div>

        {/* Inner ring - Intensity */}
        <div
          className="relative mt-6"
          style={{ width: radiusInner * 2, height: radiusInner * 2 }}
          onMouseDown={(e) => handleDrag(e, "intensity")}
          onMouseMove={(e) => e.buttons === 1 && handleDrag(e, "intensity")}
        >
          <div
            className="rounded-full"
            style={{
              width: radiusInner * 2,
              height: radiusInner * 2,
              border: "2px solid rgba(255,140,0,0.35)",
              boxShadow: "inset 0 0 20px rgba(255,140,0,0.15)",
            }}
            title={`Intensity: ${intensityValue}%`}
          />
          <div
            className="absolute w-3 h-3 bg-amber-400 rounded-full shadow"
            style={knob(intensityValue, radiusInner)}
          />
          <div className="absolute left-1/2 -translate-x-1/2 top-2 text-[10px] tracking-widest uppercase">Intensity {intensityValue}%</div>
        </div>
      </div>
    </div>
  );
};

export default RingSliders;
