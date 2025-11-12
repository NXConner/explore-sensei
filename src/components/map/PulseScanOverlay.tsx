import React, { useEffect, useRef, useState } from "react";

interface PulseScanOverlayProps {
  enabled: boolean;
  color?: string;
  speed?: number; // 1-10 speed control
  interval?: number; // seconds between pulses
  duration?: number; // seconds for pulse animation
  highlightMarkers?: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

export const PulseScanOverlay: React.FC<PulseScanOverlayProps> = ({ 
  enabled, 
  color = "#ff0000", 
  speed = 5,
  interval = 8,
  duration = 3,
  highlightMarkers = true,
  userLocation
}) => {
  const pulseRef = useRef<HTMLDivElement>(null);
  const [pulseRadius, setPulseRadius] = useState(0);
  const animationRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Trigger pulse from user location
  useEffect(() => {
    if (!enabled || !userLocation) return;

    const triggerPulse = () => {
      setPulseRadius(0);
      
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
              el.style.transition = 'filter 0.3s ease-out';
              el.style.transform = 'scale(1.15)';
              setTimeout(() => {
                el.style.filter = 'none';
                el.style.transform = 'scale(1)';
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
  }, [enabled, userLocation, interval, duration, color, highlightMarkers, speed]);

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
      `}</style>
    </div>
  );
};
