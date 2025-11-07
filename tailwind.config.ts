import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Rajdhani", "Segoe UI", "system-ui", "-apple-system", "sans-serif"],
        display: ["Orbitron", "Rajdhani", "sans-serif"],
        mono: ["Share Tech Mono", "IBM Plex Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xl: "var(--radius)",
        lg: "calc(var(--radius) - 2px)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        "hud-sm": "0 18px 48px rgba(10, 14, 28, 0.45)",
        "hud-md": "0 26px 68px rgba(6, 12, 24, 0.55)",
        "hud-lg": "0 38px 92px rgba(4, 8, 16, 0.65)",
        "hud-glow": "0 0 38px rgba(255, 111, 15, 0.35)",
      },
      dropShadow: {
        "hud-glow": "0 0 24px rgba(255, 111, 15, 0.4)",
      },
      transitionTimingFunction: {
        hud: "cubic-bezier(0.19, 1, 0.22, 1)",
        sonar: "cubic-bezier(0.37, 0, 0.45, 1)",
        glitch: "cubic-bezier(0.83, 0, 0.17, 1)",
      },
      backgroundImage: {
        "hud-grid":
          "linear-gradient(15deg, rgba(108, 211, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 111, 15, 0.12) 1px, transparent 1px)",
        "hud-noise": "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 0)",
      },
      animation: {
        "hud-glitch": "hud-glitch 0.6s steps(2, jump-start) infinite",
        "hud-grid": "hud-grid-pulse 4s ease-in-out infinite",
        "hud-sonar": "hud-sonar 2.4s var(--ease-sonar, cubic-bezier(0.37,0,0.45,1)) infinite",
        "hud-scanline": "hud-scanline 8s linear infinite",
        "marquee": "marquee 45s linear infinite",
        "hud-slide-in": "hud-slide-in 0.3s cubic-bezier(0.19, 1, 0.22, 1)",
        "hud-fade-in": "hud-fade-in 0.4s cubic-bezier(0.19, 1, 0.22, 1)",
        "notification-slide": "notification-slide 0.4s cubic-bezier(0.19, 1, 0.22, 1)",
        "screen-shake": "screen-shake 0.5s ease-in-out",
      },
      keyframes: {
        "hud-glitch": {
          "0%": { clipPath: "inset(0% 0 0% 0)", transform: "translate3d(0,0,0)" },
          "8%": { clipPath: "inset(12% 0 33% 0)", transform: "translate3d(-2px,2px,0) skewX(2deg)" },
          "16%": { clipPath: "inset(45% 0 5% 0)", transform: "translate3d(3px,-1px,0) skewX(-2deg)" },
          "32%": { clipPath: "inset(8% 0 60% 0)", transform: "translate3d(-1px,1px,0)" },
          "48%": { clipPath: "inset(0% 0 0% 0)", transform: "translate3d(1px,0,0)" },
          "100%": { clipPath: "inset(0% 0 0% 0)", transform: "translate3d(0,0,0)" },
        },
        "hud-sonar": {
          "0%": { transform: "scale(0.15)", opacity: "0.75" },
          "70%": { opacity: "0.15" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
        "hud-grid-pulse": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.7" },
        },
        "hud-scanline": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "hud-slide-in": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "hud-fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "notification-slide": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "screen-shake-sustained": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translate(calc(-1 * var(--shake-intensity, 5px)), calc(-1 * var(--shake-intensity, 5px) * 0.5))" },
          "20%, 40%, 60%, 80%": { transform: "translate(var(--shake-intensity, 5px), calc(var(--shake-intensity, 5px) * 0.5))" },
        },
        "screen-shake-quick": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(calc(-1 * var(--shake-intensity, 5px)))" },
          "75%": { transform: "translateX(var(--shake-intensity, 5px))" },
        },
        "screen-shake-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
      },
    },
  },
  plugins: [
    animate,
    plugin(({ addUtilities }) => {
      addUtilities({
        ".hud-backdrop": {
          background: "var(--glass-surface, rgba(12,18,28,0.78))",
          backdropFilter: "blur(26px)",
          border: "1px solid rgba(255,255,255,0.04)",
        },
        ".hud-outline": {
          outline: "1px solid rgba(255,111,15,0.35)",
          outlineOffset: "6px",
        },
      });
    }),
  ],
};

export default config;
