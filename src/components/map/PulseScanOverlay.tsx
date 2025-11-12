import React, { useEffect, useRef, useState } from "react";
import { beep } from "@/lib/audioEffects";

interface PulseScanOverlayProps {
  enabled: boolean;
  color?: string;
  speed?: number; // 1-10 speed control
  interval?: number; // seconds between pulses
  duration?: number; // seconds for pulse animation
  highlightMarkers?: boolean;
  userLocation?: { lat: number; lng: number } | null;
  audioEnabled?: boolean;
  audioVolume?: number; // 0-100
  onManualTrigger?: () => void;
}

export const PulseScanOverlay: React.FC<PulseScanOverlayProps> = ({ 
  enabled, 
  color = "#ff0000", 
  speed = 5,
  interval = 8,
  duration = 3,
  highlightMarkers = true,
  userLocation,
  audioEnabled = true,
  audioVolume = 50,
  onManualTrigger
}) => {
  const pulseRef = useRef<HTMLDivElement>(null);
  const [pulseRadius, setPulseRadius] = useState(0);
  const animationRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [triggerCount, setTriggerCount] = useState(0);

  // Manual trigger listener
  useEffect(() => {
    if (!enabled) return;
    const handler = () => setTriggerCount((prev) => prev + 1);
    window.addEventListener("manual-pulse-trigger", handler);
    return () => window.removeEventListener("manual-pulse-trigger", handler);
  }, [enabled]);

  // Trigger pulse from user location
  useEffect(() => {
    if (!enabled || !userLocation) return;

    const triggerPulse = () => {
      setPulseRadius(0);
      
      // Play sonar ping audio
      if (audioEnabled) {
        try {
          beep({ 
            frequency: 440, 
            durationMs: 200, 
            volume: Math.max(0, Math.min(1, (audioVolume || 50) / 100)), 
            type: "sine" 
          });
        } catch {}
      }
      
      const startTime = Date.now();
      const endTime = startTime + (duration * 1000);
      const maxRadius = Math.max(window.innerWidth, window.innerHeight) * 1.5;

      const animate = () => {
        const now = Date.now();
        const progress = Math.min(1, (now - startTime) / (duration * 1000));
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const currentRadius = eased * maxRadius;
        
        setPulseRadius(currentRadius);

        // Highlight markers if enabled
        if (highlightMarkers && pulseRef.current) {
          const markers = document.querySelectorAll('[role="button"][aria-label], [data-marker]');
          markers.forEach((marker) => {
            const el = marker as HTMLElement;
            const rect = el.getBoundingClientRect();
            const markerCenterX = rect.left + rect.width / 2;
            const markerCenterY = rect.top + rect.height / 2;
            
            // Calculate distance from user location (center of screen or actual position)
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const distance = Math.sqrt(
              Math.pow(markerCenterX - centerX, 2) + Math.pow(markerCenterY - centerY, 2)
            );

            // Highlight markers near pulse wave (within threshold)
            const threshold = 50;
            const pixelRadius = (currentRadius / maxRadius) * Math.max(centerX, centerY) * 2;
            
            if (Math.abs(distance - pixelRadius) < threshold) {
              el.style.filter = `drop-shadow(0 0 20px ${color}) brightness(1.6)`;
              el.style.transition = 'filter 0.3s ease-out, transform 0.3s ease-out';
              el.style.transform = 'scale(1.15)';
              
              // Add pulsing ring animation
              const ring = document.createElement('div');
              ring.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 40px;
                height: 40px;
                border: 2px solid ${color};
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: pulse-ring 0.6s ease-out;
                pointer-events: none;
              `;
              el.style.position = 'relative';
              el.appendChild(ring);
              
              setTimeout(() => {
                el.style.filter = 'none';
                el.style.transform = 'scale(1)';
                ring.remove();
              }, 600);
            }
          });
        }

        if (now < endTime) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setPulseRadius(0);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    };

    // Initial pulse
    triggerPulse();

    // Set interval for recurring pulses
    intervalRef.current = window.setInterval(triggerPulse, interval * 1000);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, userLocation, interval, duration, color, highlightMarkers, speed, audioEnabled, audioVolume, triggerCount]);

  if (!enabled || !userLocation || pulseRadius === 0) return null;

  // Convert color to rgba with opacity
  const getRgbaColor = (hexOrRgba: string, opacity: number) => {
    if (hexOrRgba.startsWith('#')) {
      const hex = hexOrRgba.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return hexOrRgba;
  };

  return (
    <div 
      ref={pulseRef}
      className="absolute inset-0 pointer-events-none z-[140] flex items-center justify-center"
    >
      <div
        className="absolute rounded-full"
        style={{
          width: `${pulseRadius * 2}px`,
          height: `${pulseRadius * 2}px`,
          border: `3px solid ${getRgbaColor(color, 0.8)}`,
          boxShadow: `0 0 30px ${getRgbaColor(color, 0.6)}, inset 0 0 30px ${getRgbaColor(color, 0.3)}`,
          animation: `pulse-fade ${duration}s ease-out`,
        }}
      />
      <style>{`
        @keyframes pulse-fade {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes pulse-ring {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
