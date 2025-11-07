import React, { useEffect, useRef } from "react";
import { beep } from "@/lib/audioEffects";
import { RadarParticles } from "./RadarParticles";

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
  radarType?: "standard" | "sonar" | "aviation";
  radarAudioEnabled?: boolean;
  radarAudioVolume?: number; // 0..100
  masterVolumePercent?: number; // 0..100
  lowPowerMode?: boolean;
  reduceMotion?: boolean;
  useCanvasFX?: boolean;
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
  radarType = "standard",
  radarAudioEnabled = false,
  radarAudioVolume = 50,
  masterVolumePercent = 70,
  lowPowerMode = false,
  reduceMotion = false,
  useCanvasFX = false,
}: MapEffectsProps) => {
  const radarRef = useRef<HTMLDivElement>(null);
  const glitchRef = useRef<HTMLDivElement>(null);
  const sonarRef = useRef<HTMLDivElement>(null);
  const aviationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect reduced motion and low power
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!showRadar || prefersReduced || reduceMotion || lowPowerMode) return;
    let raf: number | null = null;
    let angle = 0;

    const glowMarkers = () => {
      // Find all map markers and apply glow effect based on radar angle
      const markers = document.querySelectorAll('[role="button"][aria-label]');
      markers.forEach((marker) => {
        const el = marker as HTMLElement;
        const rect = el.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const markerAngle = Math.atan2(rect.top + rect.height / 2 - centerY, rect.left + rect.width / 2 - centerX) * (180 / Math.PI);
        const normalizedMarkerAngle = (markerAngle + 360) % 360;
        const normalizedRadarAngle = angle % 360;
        const diff = Math.abs(normalizedMarkerAngle - normalizedRadarAngle);
        const threshold = 15;

        if (diff < threshold || diff > 360 - threshold) {
          el.style.filter = `drop-shadow(0 0 12px hsl(var(--primary))) brightness(1.4)`;
          el.style.transition = 'filter 0.2s ease-out';
          setTimeout(() => {
            el.style.filter = 'none';
          }, 400);
        }
      });
    };

    const animate = () => {
      angle += radarSpeed * 0.5;
      if (radarRef.current) {
        radarRef.current.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      }
      if (aviationRef.current) {
        aviationRef.current.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      }
      
      // Trigger marker glow every 10 degrees
      if (Math.floor(angle) % 10 === 0) {
        glowMarkers();
      }

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [showRadar, radarSpeed, reduceMotion, lowPowerMode]);

  useEffect(() => {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!showGlitch || !glitchRef.current || prefersReduced || reduceMotion || lowPowerMode) return;

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
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!showGlitch || !glitchRef.current || prefersReduced || reduceMotion || lowPowerMode) return;
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

  // Audio pings for radar
  useEffect(() => {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!radarAudioEnabled || !showRadar || prefersReduced || reduceMotion) return;
    const revolutionMs = Math.max(1000, 6500 - (radarSpeed || 1) * 450);
    const pingEveryDegrees = 45; // 8 pings per revolution
    const pingInterval = Math.max(120, (revolutionMs * pingEveryDegrees) / 360);

    const frequency = (() => {
      switch (radarType) {
        case "sonar":
          return 660;
        case "aviation":
          return 990;
        default:
          return 820;
      }
    })();

    const type = radarType === "aviation" ? "square" : radarType === "sonar" ? "sine" : "triangle";
    const vol = Math.max(0, Math.min(1, ((radarAudioVolume ?? 50) / 100) * Math.max(0, Math.min(1, (masterVolumePercent ?? 70) / 100))));

    const id = window.setInterval(() => {
      try { beep({ frequency, durationMs: 60, volume: vol, type: type as any }); } catch {}
    }, pingInterval);

    return () => window.clearInterval(id);
  }, [radarAudioEnabled, showRadar, radarSpeed, radarType, radarAudioVolume]);

  return (
    <>
      {/* Particle Effects Trail */}
      <RadarParticles 
        enabled={showRadar}
        radarSpeed={radarSpeed}
        radarType={radarType}
        accentColor={accentColor}
        lowPowerMode={lowPowerMode}
        reduceMotion={reduceMotion}
      />

      {/* Radar Effects (variant by type) */}
      {showRadar && radarType === "standard" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[100]">
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

      {showRadar && radarType === "sonar" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[100]">
          {/* Concentric pulsing circles */}
          <div
            ref={sonarRef}
            className="absolute top-1/2 left-1/2 w-[160%] h-[160%]"
            style={{
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle at center, rgba(0,255,255,0.18) 0%, rgba(0,255,255,0.12) 20%, transparent 22%),\n                 radial-gradient(circle at center, rgba(0,255,255,0.14) 28%, transparent 30%),\n                 radial-gradient(circle at center, rgba(0,255,255,0.10) 36%, transparent 38%),\n                 radial-gradient(circle at center, rgba(0,255,255,0.08) 44%, transparent 46%)",
              animation: "sonarPulse 2.5s ease-out infinite",
            }}
          />
        </div>
      )}

      {showRadar && radarType === "aviation" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[100]">
          {/* Scanning line with trailing fade */}
          <div
            ref={aviationRef}
            className="absolute top-1/2 left-1/2 w-[200%] h-[200%]"
            style={{
              transformOrigin: "center",
              transform: "translate(-50%, -50%)",
              background:
                "conic-gradient(from 0deg, rgba(0,255,0,0.0) 0deg, rgba(0,255,0,0.22) 2deg, rgba(0,255,0,0.12) 10deg, rgba(0,255,0,0.02) 25deg, transparent 40deg)",
            }}
          />
        </div>
      )}

      {/* Glitch Effect */}
      {showGlitch && (
        <div
          ref={glitchRef}
          className="absolute inset-0 pointer-events-none opacity-0 transition-opacity z-[150]"
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
          className="absolute inset-0 pointer-events-none z-[120]"
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
          className="absolute inset-0 pointer-events-none z-[110]"
          style={{
            background: `var(--grid-overlay)`,
          }}
        />
      )}

      {/* Vignette corners */}
      {vignetteEffect && (
        <div
          className="absolute inset-0 pointer-events-none z-[105]"
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

        @keyframes sonarPulse {
          0% { opacity: 0.2; filter: blur(0px); }
          50% { opacity: 0.35; filter: blur(0.5px); }
          100% { opacity: 0.2; filter: blur(0px); }
        }
      `}</style>
    </>
  );
};
