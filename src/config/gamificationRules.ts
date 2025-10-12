// Gamification rules and types
export type GamificationEventType =
  | "clock_in"
  | "clock_out"
  | "photo_uploaded"
  | "job_status_updated"
  | "weather_alert_configured"
  | "map_drawing_saved";

export interface GamificationRule {
  eventType: GamificationEventType;
  basePoints: number;
  dailyCap?: number; // per user per day
  metadataRequirements?: string[]; // keys expected in payload
}

export interface LevelDefinition {
  level: number;
  minXp: number; // inclusive
}

export const LEVELS: LevelDefinition[] = [
  { level: 1, minXp: 0 },
  { level: 2, minXp: 100 },
  { level: 3, minXp: 250 },
  { level: 4, minXp: 500 },
  { level: 5, minXp: 900 },
  { level: 6, minXp: 1400 },
  { level: 7, minXp: 2000 },
  { level: 8, minXp: 2800 },
  { level: 9, minXp: 3800 },
  { level: 10, minXp: 5000 },
];

export const GAMIFICATION_RULES: Record<GamificationEventType, GamificationRule> = {
  clock_in: { eventType: "clock_in", basePoints: 5 },
  clock_out: { eventType: "clock_out", basePoints: 2 },
  photo_uploaded: { eventType: "photo_uploaded", basePoints: 3, dailyCap: 15 },
  job_status_updated: { eventType: "job_status_updated", basePoints: 8 },
  weather_alert_configured: {
    eventType: "weather_alert_configured",
    basePoints: 6,
  },
  map_drawing_saved: { eventType: "map_drawing_saved", basePoints: 4 },
};

export function getLevelForXp(xp: number): number {
  let current = 1;
  for (const def of LEVELS) {
    if (xp >= def.minXp) current = def.level;
    else break;
  }
  return current;
}

export function isGamificationEnabled(): boolean {
  const flag = (import.meta as any).env?.VITE_GAMIFY_ENABLED;
  if (typeof flag === "string") return flag.toLowerCase() !== "false";
  return true;
}
