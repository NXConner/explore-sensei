// Feature flag utilities
// - Flags can be enabled via environment variable VITE_FEATURE_FLAGS (comma-separated)
// - Users can also toggle flags in localStorage key 'aos_settings' under featureFlags
// - Runtime checks should always call isEnabled to respect both sources

export type FeatureFlag =
  | "ai_estimate_autofill"
  | "mapbox_fallback"
  | "pwa_offline_enhanced"
  | "observability_tracing"
  | "gamification_v2";

function parseEnvFlags(): Set<string> {
  try {
    const raw = (import.meta as any)?.env?.VITE_FEATURE_FLAGS as string | undefined;
    if (!raw) return new Set();
    return new Set(
      String(raw)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
  } catch {
    return new Set();
  }
}

function parseLocalFlags(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem("aos_settings");
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    const flags = parsed?.featureFlags as Record<string, boolean> | undefined;
    if (!flags) return new Set();
    return new Set(Object.entries(flags).filter(([, v]) => !!v).map(([k]) => k));
  } catch {
    return new Set();
  }
}

const envFlags = parseEnvFlags();

export function isEnabled(flag: FeatureFlag | string): boolean {
  const localFlags = parseLocalFlags();
  return envFlags.has(flag) || localFlags.has(flag);
}

export function listEnabledFlags(): string[] {
  const localFlags = parseLocalFlags();
  return Array.from(new Set([...envFlags, ...localFlags]));
}
