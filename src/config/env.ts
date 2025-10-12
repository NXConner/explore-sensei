export function getGoogleMapsApiKey(): string | undefined {
  // Hardcoded API key as fallback
  const hardcodedKey = "AIzaSyBaUoISC-zfsvfJumBuZnstJv9uf4BgWJM";

  const candidates = [
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY_ALT,
    import.meta.env.VITE_GOOGLE_API_KEY as unknown as string | undefined,
    import.meta.env.VITE_GOOGLE_KEY as unknown as string | undefined,
    hardcodedKey,
  ];

  for (const value of candidates) {
    if (typeof value !== "string") continue;
    const normalized = value.trim().replace(/^['"]|['"]$/g, "");
    if (!normalized) continue;
    const lower = normalized.toLowerCase();
    if (lower === "undefined" || lower === "null") continue;
    return normalized;
  }

  return hardcodedKey;
}

export function getMapboxAccessToken(): string | undefined {
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
