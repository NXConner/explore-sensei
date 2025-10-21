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

export function getMapTilerApiKey(): string | undefined {
  const lsOverride = readLocalStorageApiKey(["apiKeys", "maptiler"]);
  if (lsOverride) return lsOverride;
  const value = (import.meta as any).env.VITE_MAPTILER_API_KEY as string | undefined;
  if (!value || typeof value !== "string") return undefined;
  const normalized = value.trim().replace(/^['"]|['"]$/g, "");
  const lower = normalized.toLowerCase();
  if (!normalized || lower === "undefined" || lower === "null") return undefined;
  return normalized;
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
  maptiler?: string;
} {
  return {
    googleMaps: getGoogleMapsApiKey(),
    googleGeneric: import.meta.env.VITE_GOOGLE_API_KEY as any,
    mapbox: getMapboxAccessToken(),
    openWeather: getOpenWeatherApiKey(),
    maptiler: getMapTilerApiKey(),
  };
}

export type MapProviderPreference = "auto" | "google" | "mapbox" | "maplibre" | "leaflet";

export function getPreferredMapProvider(): MapProviderPreference {
  try {
    if (typeof window === "undefined" || !("localStorage" in window)) return "auto";
    const raw = window.localStorage.getItem("aos_settings");
    if (!raw) return "auto";
    const parsed = JSON.parse(raw);
    const val = parsed?.preferredMapProvider;
    return val === "google" || val === "mapbox" || val === "maplibre" || val === "leaflet" ? val : "auto";
  } catch {
    return "auto";
  }
}

export function getMapLibreStyleUrl(): string | undefined {
  const lsOverride = readLocalStorageApiKey(["apiKeys", "maplibreStyle"]);
  if (lsOverride) return lsOverride;
  const value = (import.meta as any).env.VITE_MAPLIBRE_STYLE_URL as string | undefined;
  if (!value || typeof value !== "string") return undefined;
  const normalized = value.trim().replace(/^['"]|['"]$/g, "");
  const lower = normalized.toLowerCase();
  if (!normalized || lower === "undefined" || lower === "null") return undefined;
  return normalized;
}

export function getBasemapPmtilesUrl(): string | undefined {
  const lsOverride = readLocalStorageApiKey(["providers", "basemapPmtiles"]);
  if (lsOverride) return lsOverride;
  const value = (import.meta as any).env.VITE_BASEMAP_PMTILES_URL as string | undefined;
  return value?.trim() || undefined;
}

export function getUSGSImageryWmsUrl(): string | undefined {
  const ls = readLocalStorageApiKey(["providers", "usgsImageryWms"]);
  if (ls) return ls;
  const value = (import.meta as any).env.VITE_USGS_IMAGERY_WMS_URL as string | undefined;
  return value?.trim() || undefined;
}

export function getUSDA_NAIP_WmsUrl(): string | undefined {
  const ls = readLocalStorageApiKey(["providers", "usdaNaipWms"]);
  if (ls) return ls;
  const value = (import.meta as any).env.VITE_USDA_NAIP_WMS_URL as string | undefined;
  return value?.trim() || undefined;
}

export function getPatrickCountyWmsUrl(): string | undefined {
  const ls = readLocalStorageApiKey(["providers", "patrickWms"]);
  if (ls) return ls;
  const value = (import.meta as any).env.VITE_PATRICK_WMS_URL as string | undefined;
  return value?.trim() || undefined;
}

export function getPatrickCountyEsriFeatureUrl(): string | undefined {
  const ls = readLocalStorageApiKey(["providers", "patrickEsriFeature"]);
  if (ls) return ls;
  const value = (import.meta as any).env.VITE_PATRICK_ESRI_FEATURE_URL as string | undefined;
  return value?.trim() || undefined;
}

// ML API URL getter: localStorage override -> env -> default
export function getMlApiUrl(): string | undefined {
  try {
    const ls = readLocalStorageApiKey(["providers", "mlapiUrl"]);
    if (ls) return ls;
  } catch {}
  const candidates = [
    (import.meta as any).env.VITE_MLAPI_URL as string | undefined,
    (import.meta as any).env.VITE_ASPHALT_ML_URL as string | undefined,
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

// Provider preferences for server-side utilities (geocode/routing/elevation)
export type GeocoderProvider = "google" | "nominatim";
export type RoutingProvider = "google" | "osrm";
export type ElevationProvider = "google" | "open_elevation";

function readProviderPreference(lsKey: string, envKey: string, allowed: string[], fallback: string): string {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("aos_settings") : null;
    if (raw) {
      const p = JSON.parse(raw);
      const val = p?.providers?.[lsKey];
      if (typeof val === "string" && allowed.includes(val)) return val;
    }
  } catch {}
  const envVal = (import.meta as any).env[envKey] as string | undefined;
  if (envVal && allowed.includes(envVal)) return envVal;
  return fallback;
}

export function getPreferredGeocoderProvider(): GeocoderProvider {
  return readProviderPreference("geocoder", "VITE_MAPS_GEOCODER_PROVIDER", ["google", "nominatim"], "google") as GeocoderProvider;
}

export function getPreferredRoutingProvider(): RoutingProvider {
  return readProviderPreference("routing", "VITE_MAPS_ROUTING_PROVIDER", ["google", "osrm"], "google") as RoutingProvider;
}

export function getPreferredElevationProvider(): ElevationProvider {
  return readProviderPreference("elevation", "VITE_MAPS_ELEVATION_PROVIDER", ["google", "open_elevation"], "open_elevation") as ElevationProvider;
}
