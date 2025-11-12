import React, { useEffect, useRef, useState } from "react";
import { triggerPulseHaptic } from "@/lib/hapticFeedback";

interface PulseScanOverlayProps {
  enabled: boolean;
  color?: string;
  speed?: number; // degrees per tick
  shape?: "standard" | "narrow" | "wide" | "double";
  showHistoryTrail?: boolean;
  historyLength?: number; // Number of previous pulses to show (1-10)
  hapticEnabled?: boolean; // Enable haptic feedback for mobile
}

type PulseHistory = {
  angle: number;
  opacity: number;
};

const getGradientForShape = (shape: "standard" | "narrow" | "wide" | "double", color: string): string => {
  switch (shape) {
    case "narrow":
      return `conic-gradient(from 0deg, transparent 0%, ${color} 4%, transparent 8%)`;
    case "wide":
      return `conic-gradient(from 0deg, transparent 0%, ${color} 12%, transparent 20%)`;
    case "double":
      return `conic-gradient(from 0deg, transparent 0%, ${color} 5%, transparent 7%, ${color} 9%, transparent 14%)`;
    case "standard":
    default:
      return `conic-gradient(from 0deg, transparent 0%, ${color} 8%, transparent 14%)`;
  }
};

export const PulseScanOverlay: React.FC<PulseScanOverlayProps> = ({ 
  enabled, 
  color = "rgba(0, 255, 255, 0.18)", 
  speed = 3,
  shape = "standard",
  showHistoryTrail = false,
  historyLength = 5,
  hapticEnabled = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<PulseHistory[]>([]);
  const angleRef = useRef(0);
  const lastUpdateRef = useRef(0);
  const lastHapticAngleRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setHistory([]);
      return;
    }
    
    let id: number | null = null;
    const step = (timestamp: number) => {
      angleRef.current = (angleRef.current + speed) % 360;
      
      if (ref.current) {
        ref.current.style.transform = `translate(-50%, -50%) rotate(${angleRef.current}deg)`;
      }

      // Update history trail (throttle updates to avoid too many re-renders)
      if (showHistoryTrail && timestamp - lastUpdateRef.current > 50) {
        lastUpdateRef.current = timestamp;
        setHistory((prev) => {
          const newHistory = [{ angle: angleRef.current, opacity: 1.0 }, ...prev];
          return newHistory
            .map((item, index) => ({
              ...item,
              opacity: Math.max(0, item.opacity - (1 / (historyLength * 2))),
            }))
            .filter((item) => item.opacity > 0)
            .slice(0, historyLength);
        });
      }

      // Trigger haptic feedback every full rotation (360 degrees)
      if (hapticEnabled && Math.floor(angleRef.current / 360) > Math.floor(lastHapticAngleRef.current / 360) && angleRef.current >= 360) {
        triggerPulseHaptic(hapticEnabled);
        lastHapticAngleRef.current = angleRef.current;
      }

      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => { if (id) cancelAnimationFrame(id); };
  }, [enabled, speed, shape, showHistoryTrail, historyLength, hapticEnabled]);

  if (!enabled) return null;
  
  const gradient = getGradientForShape(shape, color);
  
  return (
    <div className="absolute inset-0 pointer-events-none z-[140]">
      {/* Current pulse */}
      <div ref={ref} className="absolute top-1/2 left-1/2 w-[200%] h-[200%]" style={{
        background: gradient,
        transform: 'translate(-50%, -50%)',
        transformOrigin: 'center'
      }} />
      
      {/* History trail */}
      {showHistoryTrail && history.map((hist, index) => {
        const historyColor = color.replace(/[\d.]+\)$/, `${hist.opacity * 0.3})`);
        return (
          <div
            key={`${hist.angle}-${index}`}
            className="absolute top-1/2 left-1/2 w-[200%] h-[200%]"
            style={{
              background: getGradientForShape(shape, historyColor),
              transform: `translate(-50%, -50%) rotate(${hist.angle}deg)`,
              transformOrigin: 'center',
              opacity: hist.opacity,
            }}
          />
        );
      })}
    </div>
  );
}
