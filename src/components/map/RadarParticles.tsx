import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  opacity: number;
  size: number;
  decay: number;
}

interface RadarParticlesProps {
  enabled: boolean;
  radarSpeed: number;
  radarType: "standard" | "sonar" | "aviation";
  accentColor?: string;
  lowPowerMode?: boolean;
  reduceMotion?: boolean;
}

export const RadarParticles: React.FC<RadarParticlesProps> = ({
  enabled,
  radarSpeed = 3,
  radarType,
  accentColor = "hsl(var(--primary))",
  lowPowerMode = false,
  reduceMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const angleRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!enabled || !canvasRef.current || prefersReduced || reduceMotion || lowPowerMode) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

    const animate = () => {
      angleRef.current += radarSpeed * 0.5;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new particles along the radar sweep line
      const angle = (angleRef.current * Math.PI) / 180;
      const particlesPerFrame = radarType === "sonar" ? 3 : 2;
      
      for (let i = 0; i < particlesPerFrame; i++) {
        const distance = Math.random() * maxRadius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        particlesRef.current.push({
          x,
          y,
          opacity: 0.8,
          size: radarType === "aviation" ? 3 : radarType === "sonar" ? 4 : 2.5,
          decay: 0.02 + Math.random() * 0.02,
        });
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.opacity -= particle.decay;

        if (particle.opacity > 0) {
          ctx.fillStyle = accentColor.includes("hsl") 
            ? accentColor.replace(")", ` / ${particle.opacity})`)
            : `rgba(255, 140, 0, ${particle.opacity})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();

          // Add glow effect
          ctx.shadowBlur = 8;
          ctx.shadowColor = accentColor;
          ctx.fill();
          ctx.shadowBlur = 0;

          return true;
        }
        return false;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [enabled, radarSpeed, radarType, accentColor, lowPowerMode, reduceMotion]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[105]"
      style={{ mixBlendMode: "screen" }}
    />
  );
};
