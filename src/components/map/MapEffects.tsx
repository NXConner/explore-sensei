import React, { useEffect, useRef } from "react";

interface MapEffectsProps {
  showRadar?: boolean;
  showGlitch?: boolean;
  showScanline?: boolean;
  radarSpeed?: number;
  glitchIntensity?: number;
}

export const MapEffects = ({
  showRadar = true,
  showGlitch = true,
  showScanline = true,
  radarSpeed = 3,
  glitchIntensity = 0.3,
}: MapEffectsProps) => {
  const radarRef = useRef<HTMLDivElement>(null);
  const glitchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showRadar || !radarRef.current) return;

    const radar = radarRef.current;
    let angle = 0;

    const animate = () => {
      angle += radarSpeed * 0.5;
      radar.style.transform = `rotate(${angle}deg)`;
      if (showRadar) {
        requestAnimationFrame(animate);
      }
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [showRadar, radarSpeed]);

  useEffect(() => {
    if (!showGlitch || !glitchRef.current) return;

    const glitch = glitchRef.current;
    let glitchInterval: NodeJS.Timeout;

    const triggerGlitch = () => {
      glitch.style.opacity = String(glitchIntensity);
      setTimeout(() => {
        glitch.style.opacity = "0";
      }, 100);
    };

    glitchInterval = setInterval(triggerGlitch, 3000 + Math.random() * 5000);

    return () => clearInterval(glitchInterval);
  }, [showGlitch, glitchIntensity]);

  return (
    <>
      {/* Radar Sweep Effect */}
      {showRadar && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            ref={radarRef}
            className="absolute top-1/2 left-1/2 w-[200%] h-[200%]"
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, rgba(255, 140, 0, 0.1) 5%, transparent 10%)`,
              transformOrigin: "center",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      )}

      {/* Glitch Effect */}
      {showGlitch && (
        <div
          ref={glitchRef}
          className="absolute inset-0 pointer-events-none opacity-0 transition-opacity"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                rgba(255, 0, 0, 0.1) 0px,
                transparent 2px,
                rgba(0, 255, 0, 0.1) 4px,
                transparent 6px,
                rgba(0, 0, 255, 0.1) 8px,
                transparent 10px
              )
            `,
            animation: "glitch 0.3s infinite",
          }}
        />
      )}

      {/* Scanline Effect */}
      {showScanline && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.1) 0px,
              transparent 2px
            )`,
            animation: "scanline 8s linear infinite",
          }}
        />
      )}

      <style>{`
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </>
  );
};
