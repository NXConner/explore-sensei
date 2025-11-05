import { MotionTokens } from "./types";

export const motionTokens: MotionTokens = {
  easings: {
    hud: "cubic-bezier(0.19, 1, 0.22, 1)",
    sonar: "cubic-bezier(0.37, 0, 0.45, 1)",
    tactical: "cubic-bezier(0.83, 0, 0.17, 1)",
    glitch: "steps(2, jump-start)",
    deploy: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  durations: {
    instant: "0ms",
    quick: "130ms",
    fast: "220ms",
    base: "280ms",
    deliberate: "420ms",
    sonar: "2400ms",
    sweep: "8800ms",
  },
  keyframes: {
    "hud-glitch": `
      0% { clip-path: inset(0% 0 0% 0); transform: translate3d(0,0,0); }
      2% { clip-path: inset(12% 0 33% 0); transform: translate3d(-2px,2px,0); }
      4% { clip-path: inset(45% 0 5% 0); transform: translate3d(3px,-1px,0); }
      8% { clip-path: inset(8% 0 60% 0); transform: translate3d(-1px,1px,0); }
      12% { clip-path: inset(0% 0 0% 0); transform: translate3d(0,0,0); }
      100% { clip-path: inset(0% 0 0% 0); transform: translate3d(0,0,0); }
    `,
    "hud-sonar": `
      0% { transform: scale(0.2); opacity: 0.8; }
      60% { opacity: 0.2; }
      100% { transform: scale(1); opacity: 0; }
    `,
    "hud-scanline": `
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    `,
    "hud-grid-pulse": `
      0%, 100% { opacity: 0.45; }
      50% { opacity: 0.7; }
    `,
    "hud-typing": `
      0% { width: 0; }
      100% { width: 100%; }
    `,
  },
};
