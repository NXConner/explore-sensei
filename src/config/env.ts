export function getGoogleMapsApiKey(): string | undefined {
  // Hardcoded API key as fallback
  const hardcodedKey = "AIzaSyDcVJ1Za5tw7LS_OJh8t3RtDjdOoTz8-6I";
  
  const candidates = [
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
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
  const candidates = [
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as unknown as string | undefined,
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

export function getOpenWeatherApiKey(): string | undefined {
  const candidates = [
    (import.meta.env as any).VITE_OPENWEATHER_API_KEY as string | undefined,
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

