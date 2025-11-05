#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

type WallpaperConfig = {
  slug: string;
  name: string;
  palette: string[];
  accent: string;
  tone: "command" | "rogue" | "stealth" | "tech" | "hunter";
  description: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const WALLPAPER_DIR = path.join(PROJECT_ROOT, "public", "wallpapers");
const METADATA_PATH = path.join(WALLPAPER_DIR, "metadata.json");

const wallpapers: WallpaperConfig[] = [
  {
    slug: "division-agent",
    name: "Division Agent",
    palette: ["#0b0f1a", "#13223f", "#1f3a64"],
    accent: "#ff6f0f",
    tone: "command",
    description: "Primary SHD-inspired gradient with tactical grid overlay and pulse arcs.",
  },
  {
    slug: "rogue-agent",
    name: "Rogue Agent",
    palette: ["#12080d", "#2b1016", "#3b161f"],
    accent: "#E63946",
    tone: "rogue",
    description: "Hazard-red bloom with digital noise for rogue protocol states.",
  },
  {
    slug: "dark-zone",
    name: "Dark Zone",
    palette: ["#04060b", "#0e141f", "#151d29"],
    accent: "#f2b705",
    tone: "command",
    description: "Midnight blue gradient with warning thresholds for Dark Zone operations.",
  },
  {
    slug: "tech-specialist",
    name: "Tech Specialist",
    palette: ["#031b24", "#063040", "#0b4c63"],
    accent: "#6cd3ff",
    tone: "tech",
    description: "Icy teal circuitry motif with diagnostic scan lines.",
  },
  {
    slug: "stealth-operations",
    name: "Stealth Operations",
    palette: ["#050b07", "#0a1a11", "#123523"],
    accent: "#3ab795",
    tone: "stealth",
    description: "Low luminance green tones with soft grid for night deployments.",
  },
  {
    slug: "tactical-command",
    name: "Tactical Command",
    palette: ["#0b0f1a", "#20150a", "#301d0e"],
    accent: "#ff964f",
    tone: "command",
    description: "Mission dossier gradient with amber accents and directive glyphs.",
  },
  {
    slug: "hunter-protocol",
    name: "Hunter Protocol",
    palette: ["#020c10", "#0b1f26", "#123541"],
    accent: "#ff6f0f",
    tone: "hunter",
    description: "Covert teal-to-charcoal gradient with hunter concentric pings.",
  },
  {
    slug: "dark-zone-threat",
    name: "Dark Zone Threat",
    palette: ["#030507", "#111018", "#1a1522"],
    accent: "#E63946",
    tone: "rogue",
    description: "Threat heatmap with red flare and sonar sweep for incursion alerts.",
  },
];

const svgTemplate = (config: WallpaperConfig) => {
  const [start, mid, end] = config.palette;
  const gridOpacity = config.tone === "stealth" ? 0.08 : 0.14;
  const flareOpacity = config.tone === "rogue" ? 0.35 : 0.22;
  const sweepColor = config.tone === "tech" ? "#6cd3ff" : config.accent;
  const blurStdDev = config.tone === "stealth" ? 80 : 120;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg-${config.slug}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${start}" />
      <stop offset="45%" stop-color="${mid}" />
      <stop offset="100%" stop-color="${end}" />
    </linearGradient>
    <radialGradient id="flare-${config.slug}" cx="40%" cy="30%" r="65%">
      <stop offset="0%" stop-color="${config.accent}" stop-opacity="${flareOpacity}" />
      <stop offset="70%" stop-color="${config.accent}" stop-opacity="0" />
    </radialGradient>
    <pattern id="grid-${config.slug}" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
      <path d="M80 0H0V80" fill="none" stroke="rgba(255,255,255,${gridOpacity})" stroke-width="1" />
      <circle cx="0" cy="0" r="1" fill="rgba(255,255,255,${gridOpacity * 1.8})" />
    </pattern>
    <filter id="glow-${config.slug}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${blurStdDev}" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <rect width="1600" height="900" fill="url(#bg-${config.slug})" />
  <rect width="1600" height="900" fill="url(#grid-${config.slug})" opacity="0.55" />
  <circle cx="1180" cy="260" r="520" fill="url(#flare-${config.slug})" filter="url(#glow-${config.slug})" />
  <g opacity="0.35">
    <path d="M1400 240c-40 120-220 220-420 220-200 0-380-100-420-220" fill="none" stroke="${sweepColor}" stroke-width="1.5" stroke-dasharray="12 18" />
    <path d="M1320 220c-35 90-180 160-360 160-180 0-335-70-360-160" fill="none" stroke="${sweepColor}" stroke-width="1" stroke-dasharray="8 16" />
  </g>
  <g opacity="0.32">
    <circle cx="320" cy="680" r="240" fill="none" stroke="${sweepColor}" stroke-width="0.8" stroke-dasharray="6 12" />
    <circle cx="320" cy="680" r="320" fill="none" stroke="${config.accent}" stroke-width="0.6" stroke-dasharray="4 14" />
  </g>
  <g opacity="0.22">
    <line x1="200" y1="140" x2="1400" y2="760" stroke="${sweepColor}" stroke-width="0.5" stroke-dasharray="10 20" />
    <line x1="1400" y1="140" x2="200" y2="760" stroke="${config.accent}" stroke-width="0.35" stroke-dasharray="6 18" />
  </g>
  <g opacity="0.6" fill="${config.accent}">
    <path d="M1480 140h60l-30 52z" opacity="0.45" />
    <rect x="1260" y="110" width="6" height="50" rx="3" />
    <rect x="1280" y="110" width="6" height="70" rx="3" />
    <rect x="1300" y="110" width="6" height="40" rx="3" />
  </g>
  <g opacity="0.35" stroke="${config.accent}" stroke-width="1.4">
    <rect x="120" y="120" width="220" height="120" rx="8" ry="8" fill="none" />
    <path d="M120 152h220" />
    <path d="M180 120v120" />
  </g>
  <text x="138" y="148" fill="rgba(255,255,255,0.68)" font-family="'Rajdhani', 'Orbitron', 'Segoe UI', sans-serif" font-size="18" letter-spacing="0.32em">
    ${config.name.toUpperCase()}
  </text>
  <text x="138" y="186" fill="rgba(255,255,255,0.45)" font-family="'Share Tech Mono', 'IBM Plex Mono', monospace" font-size="13" letter-spacing="0.2em">
    ${config.description.toUpperCase()}
  </text>
</svg>
`;
};

const writeFileIfChanged = async (targetPath: string, content: string) => {
  try {
    const existing = await fs.readFile(targetPath, "utf8");
    if (existing === content) {
      return false;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
  await fs.writeFile(targetPath, content, "utf8");
  return true;
};

const main = async () => {
  await fs.mkdir(WALLPAPER_DIR, { recursive: true });

  const writes: string[] = [];
  const previousMeta = new Map<string, { updatedAt?: string }>();

  try {
    const raw = await fs.readFile(METADATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as Array<{ slug: string; updatedAt?: string }>;
    for (const entry of parsed) {
      previousMeta.set(entry.slug, { updatedAt: entry.updatedAt });
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  for (const wallpaper of wallpapers) {
    const svgContent = svgTemplate(wallpaper);
    const outputPath = path.join(WALLPAPER_DIR, `${wallpaper.slug}.svg`);
    const updated = await writeFileIfChanged(outputPath, svgContent);
    if (updated) {
      writes.push(wallpaper.slug);
    }
  }

  const metadata = wallpapers.map(({ slug, name, palette, accent, tone, description }) => ({
    slug,
    name,
    palette,
    accent,
    tone,
    description,
    source: `wallpapers/${slug}.svg`,
    updatedAt: writes.includes(slug)
      ? new Date().toISOString()
      : previousMeta.get(slug)?.updatedAt ?? new Date().toISOString(),
  }));

  await fs.writeFile(METADATA_PATH, JSON.stringify(metadata, null, 2), "utf8");

  if (writes.length > 0) {
    console.log(`[assets] Generated tactical wallpapers: ${writes.join(", ")}`);
  } else {
    console.log("[assets] Tactical wallpapers already up to date");
  }
};

main().catch((error) => {
  console.error("[assets] Failed to sync tactical wallpapers", error);
  process.exitCode = 1;
});
