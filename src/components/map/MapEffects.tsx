import React, { useEffect, useRef } from "react";

interface MapEffectsProps {
  showRadar?: boolean;
  showGlitch?: boolean;
  showScanline?: boolean;
  radarSpeed?: number;
  glitchIntensity?: number;
  accentColor?: string; // css color for radar sweep
  showGridOverlay?: boolean;
  glitchClickPreset?: "barely" | "subtle" | "normal";
  vignetteEffect?: boolean;
}

export const MapEffects = ({
  showRadar = true,
  showGlitch = true,
  showScanline = true,
  radarSpeed = 3,
  glitchIntensity = 0.3,
  accentColor = "rgba(255, 140, 0, 0.1)",
  showGridOverlay = false,
  glitchClickPreset = "subtle",
  vignetteEffect = false,
}: MapEffectsProps) => {
  const radarRef = useRef<HTMLDivElement>(null);
  const glitchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showRadar || !radarRef.current) return;

    const radar = radarRef.current;
    let angle = 0;

    const animate = () => {
      angle += radarSpeed * 0.5;
      // Keep the radar centered while rotating
      radar.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
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
    let glitchInterval: ReturnType<typeof setInterval>;

    const triggerGlitch = () => {
      glitch.style.opacity = String(glitchIntensity);
      setTimeout(() => {
        glitch.style.opacity = "0";
      }, 100);
    };

    glitchInterval = setInterval(triggerGlitch, 3000 + Math.random() * 5000);

    return () => clearInterval(glitchInterval);
  }, [showGlitch, glitchIntensity]);

  // Click-triggered glitch burst on UI interactions
  useEffect(() => {
    if (!showGlitch || !glitchRef.current) return;
    const glitch = glitchRef.current;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Heuristic: trigger on common interactive elements
      const isInteractive = target.closest(
        'button, [role="button"], [data-glitch], a, .nav, .navigation-menu, .menubar, .menu, .sidebar, [data-radix-collection-item]',
      );
      if (!isInteractive) return;

      const ranges: Record<typeof glitchClickPreset, [number, number]> = {
        barely: [0.04, 0.08],
        subtle: [0.09, 0.18],
        normal: [0.2, 0.35],
      } as const;
      const [min, max] = ranges[glitchClickPreset];
      const burst = Math.min(0.95, Math.max(0.02, min + Math.random() * (max - min)));

      const prev = glitch.style.opacity;
      glitch.style.opacity = String(burst);
      setTimeout(() => {
        glitch.style.opacity = prev || "0";
      }, 140);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [showGlitch, glitchClickPreset]);

  return (
    <>
      {/* Radar Sweep Effect */}
      {showRadar && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            ref={radarRef}
            className="absolute top-1/2 left-1/2 w-[200%] h-[200%]"
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, ${accentColor} 5%, transparent 10%)`,
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

      {/* Grid Overlay */}
      {showGridOverlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `var(--grid-overlay)`,
          }}
        />
      )}

      {/* Vignette corners */}
      {vignetteEffect && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)",
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
