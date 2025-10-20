function readLocalStorageApiKey(path: Array<string>): string | undefined {
  try {
    if (typeof window === "undefined" || !("localStorage" in window)) return undefined;
    const raw = window.localStorage.getItem("aos_settings");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    let current: any = parsed;
    for (const key of path) {
      if (!current || typeof current !== "object") return undefined;
      current = current[key];
    }
    if (typeof current !== "string") return undefined;
    const normalized = current.trim().replace(/^['"]|['"]$/g, "");
    if (!normalized) return undefined;
    const lower = normalized.toLowerCase();
    if (lower === "undefined" || lower === "null") return undefined;
    return normalized;
  } catch {
    return undefined;
  }
}

export function getGoogleMapsApiKey(): string | undefined {
  // Local override takes precedence when running in the browser
  const lsOverride = readLocalStorageApiKey(["apiKeys", "googleMaps"]);
  if (lsOverride) return lsOverride;

  const candidates = [
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY_ALT,
    import.meta.env.VITE_GOOGLE_API_KEY as unknown as string | undefined,
    import.meta.env.VITE_GOOGLE_KEY as unknown as string | undefined,
  ];

  for (const value of candidates) {
    if (typeof value !== "string") continue;
    const normalized = value.trim().replace(/^['"]|['"]$/g, "");
    if (!normalized) continue;
    const lower = normalized.toLowerCase();
    if (lower === "undefined" || lower === "null") continue;
    return normalized;
  }

  // Return undefined if no valid key found - app should handle this gracefully
  return undefined;
}

export function getMapboxAccessToken(): string | undefined {
  // Local override takes precedence when running in the browser
  const lsOverride = readLocalStorageApiKey(["apiKeys", "mapbox"]);
  if (lsOverride) return lsOverride;

  const candidates = [import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as unknown as string | undefined];

  for (const value of candidates) {
    if (typeof value !== "string") continue;
    const normalized = value.trim().replace(/^['"]|['"]$/g, "");
    if (!normalized) continue;
    const lower = normalized.toLowerCase();
    if (lower === "undefined" || lower === "null") continue;
    return normalized;
  }

  return undefined;
}

export function getOpenWeatherApiKey(): string | undefined {
  // Local override takes precedence when running in the browser
  const lsOverride = readLocalStorageApiKey(["apiKeys", "openWeather"]);
  if (lsOverride) return lsOverride;

  const candidates = [
    import.meta.env.VITE_OPENWEATHER_API_KEY as unknown as string | undefined,
    import.meta.env.VITE_WEATHER_API_KEY as unknown as string | undefined,
  ];

  for (const value of candidates) {
    if (typeof value !== "string") continue;
    const normalized = value.trim().replace(/^['"]|['"]$/g, "");
    if (!normalized) continue;
    const lower = normalized.toLowerCase();
    if (lower === "undefined" || lower === "null") continue;
    return normalized;
  }

  return undefined;
}

/**
 * Returns a URL template for parcel tiles, e.g.
 * https://server/arcgis/rest/services/Parcels/MapServer/tile/{z}/{y}/{x}
 * LocalStorage path: aos_settings.providers.parcelsTilesTemplate
 * Env var fallback: VITE_PARCELS_TILES_TEMPLATE
 */
export function getParcelsTilesTemplate(): string | undefined {
  try {
    const ls = readLocalStorageApiKey(["providers", "parcelsTilesTemplate"]);
    if (ls) return ls;
  } catch {}

  const candidates = [
    import.meta.env.VITE_PARCELS_TILES_TEMPLATE as unknown as string | undefined,
  ];

  for (const value of candidates) {
    if (typeof value !== "string") continue;
    const normalized = value.trim().replace(/^['"]|['"]$/g, "");
    if (!normalized) continue;
    const lower = normalized.toLowerCase();
    if (lower === "undefined" || lower === "null") continue;
    return normalized;
  }
  return undefined;
}

export function detectExistingApiKeys(): {
  googleMaps?: string;
  googleGeneric?: string;
  mapbox?: string;
  openWeather?: string;
} {
  return {
    googleMaps: getGoogleMapsApiKey(),
    googleGeneric: import.meta.env.VITE_GOOGLE_API_KEY as any,
    mapbox: getMapboxAccessToken(),
    openWeather: getOpenWeatherApiKey(),
  };
}

export type MapProviderPreference = "auto" | "google" | "mapbox";

export function getPreferredMapProvider(): MapProviderPreference {
  try {
    if (typeof window === "undefined" || !("localStorage" in window)) return "auto";
    const raw = window.localStorage.getItem("aos_settings");
    if (!raw) return "auto";
    const parsed = JSON.parse(raw);
    const val = parsed?.preferredMapProvider;
    return val === "google" || val === "mapbox" ? val : "auto";
  } catch {
    return "auto";
  }
}
