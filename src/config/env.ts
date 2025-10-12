function readSettingsApiKey(key: "googleMaps" | "googleGeneric" | "mapbox" | "openWeather"): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem("aos_settings");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    const apiKeys = parsed?.apiKeys as
      | {
          googleMaps?: string;
          googleGeneric?: string;
          mapbox?: string;
          openWeather?: string;
        }
      | undefined;
    const value = apiKeys?.[key];
    if (typeof value !== "string") return undefined;
    const normalized = value.trim().replace(/^['"]|['"]$/g, "");
    if (!normalized) return undefined;
    const lower = normalized.toLowerCase();
    if (lower === "undefined" || lower === "null") return undefined;
    return normalized;
  } catch {
    return undefined;
  }
}

function firstValidString(values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (typeof value !== "string") continue;
    const normalized = value.trim().replace(/^['"]|['"]$/g, "");
    if (!normalized) continue;
    const lower = normalized.toLowerCase();
    if (lower === "undefined" || lower === "null") continue;
    return normalized;
  }
  return undefined;
}

export function getGoogleMapsApiKey(): string | undefined {
  // Prefer user-provided override from settings, then env variants
  return firstValidString([
    readSettingsApiKey("googleMaps"),
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    // Some projects set a generic Google API key; accept as fallback
    readSettingsApiKey("googleGeneric"),
    import.meta.env.VITE_GOOGLE_API_KEY as unknown as string | undefined,
    import.meta.env.VITE_GOOGLE_KEY as unknown as string | undefined,
  ]);
}

export function getMapboxAccessToken(): string | undefined {
  return firstValidString([
    readSettingsApiKey("mapbox"),
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as unknown as string | undefined,
  ]);
}

export function getOpenWeatherApiKey(): string | undefined {
  return firstValidString([
    readSettingsApiKey("openWeather"),
    (import.meta.env as any).VITE_OPENWEATHER_API_KEY as string | undefined,
  ]);
}

export function detectExistingApiKeys(): {
  googleMaps?: string;
  googleGeneric?: string;
  mapbox?: string;
  openWeather?: string;
} {
  return {
    googleMaps: getGoogleMapsApiKey(),
    googleGeneric: firstValidString([
      readSettingsApiKey("googleGeneric"),
      import.meta.env.VITE_GOOGLE_API_KEY as unknown as string | undefined,
      import.meta.env.VITE_GOOGLE_KEY as unknown as string | undefined,
    ]),
    mapbox: getMapboxAccessToken(),
    openWeather: getOpenWeatherApiKey(),
  };
}

