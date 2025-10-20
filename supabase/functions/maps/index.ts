// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { delay } from "https://deno.land/std@0.168.0/async/delay.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SupportedOperation = "geocode" | "reverseGeocode" | "directions" | "elevation";

interface GeocodeParams {
  address?: string;
}

interface ReverseGeocodeParams {
  latlng?: string; // "lat,lng"
}

interface DirectionsParams {
  origin?: string; // "lat,lng" or address
  destination?: string; // "lat,lng" or address
  mode?: "driving" | "walking" | "bicycling" | "transit";
}

interface ElevationParams {
  locations?: string; // pipe-delimited "lat,lng|lat,lng" or single "lat,lng"
}

type GeocoderProvider = "google" | "nominatim";
type RoutingProvider = "google" | "osrm";
type ElevationProvider = "google" | "open_elevation";

// Simple in-memory TTL cache (best-effort across warm Deno isolates)
const cacheStore = new Map<string, { expireAt: number; value: unknown }>();
function cacheGet<T = unknown>(key: string): T | undefined {
  const now = Date.now();
  const hit = cacheStore.get(key);
  if (!hit) return undefined;
  if (hit.expireAt < now) {
    cacheStore.delete(key);
    return undefined;
  }
  return hit.value as T;
}
function cacheSet(key: string, value: unknown, ttlMs = 60_000) {
  cacheStore.set(key, { expireAt: Date.now() + ttlMs, value });
}

async function fetchWithRetries(url: string, init: RequestInit = {}, retries = 2, baseDelayMs = 250) {
  let attempt = 0;
  // Avoid sending "undefined" headers
  const cleanInit: RequestInit = { ...init, headers: { ...(init.headers || {}) } } as any;
  while (true) {
    const res = await fetch(url, cleanInit);
    if (res.status !== 429 && res.status !== 503) return res;
    if (attempt >= retries) return res;
    await delay(baseDelayMs * Math.pow(2, attempt));
    attempt += 1;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Enforce authenticated access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase env not configured");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const googleApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

    // Support both GET with query params and POST with JSON body
    let op: SupportedOperation | null = null;
    let address: string | undefined;
    let latlng: string | undefined;
    let origin: string | undefined;
    let destination: string | undefined;
    let mode: DirectionsParams["mode"] | undefined;
    let provider: string | undefined;
    let locations: string | undefined;

    if (req.method === "GET") {
      const url = new URL(req.url);
      op = url.searchParams.get("op") as SupportedOperation | null;
      address = url.searchParams.get("address") || undefined;
      latlng = url.searchParams.get("latlng") || undefined;
      origin = url.searchParams.get("origin") || undefined;
      destination = url.searchParams.get("destination") || undefined;
      mode = (url.searchParams.get("mode") as DirectionsParams["mode"]) || undefined;
      provider = url.searchParams.get("provider") || undefined;
      locations = url.searchParams.get("locations") || undefined;
    } else {
      const body = await req.json().catch(() => ({} as any));
      op = (body?.op as SupportedOperation) || null;
      address = body?.address;
      latlng = body?.latlng;
      origin = body?.origin;
      destination = body?.destination;
      mode = body?.mode;
      provider = body?.provider;
      locations = body?.locations;
    }

    if (!op) {
      return new Response(
        JSON.stringify({ error: "Missing op. Use geocode|reverseGeocode|directions" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const doGeocode = async (params: GeocodeParams) => {
      const address = params.address;
      if (!address) return { status: 400, body: { error: "address required" } };
      const chosen: GeocoderProvider = ((provider || Deno.env.get("MAPS_GEOCODER_PROVIDER") || "google").toLowerCase()) as GeocoderProvider;
      const cacheKey = `geocode:${chosen}:${address}`;
      const cached = cacheGet(cacheKey);
      if (cached) return { status: 200, body: cached } as const;

      if (chosen === "nominatim") {
        const base = Deno.env.get("NOMINATIM_BASE_URL") || "https://nominatim.openstreetmap.org";
        const endpoint = new URL("/search", base);
        endpoint.searchParams.set("q", address);
        endpoint.searchParams.set("format", "json");
        endpoint.searchParams.set("addressdetails", "1");
        endpoint.searchParams.set("limit", "5");
        const ua = Deno.env.get("NOMINATIM_USER_AGENT") || "PavementPerformanceSuite/1.0";
        const res = await fetchWithRetries(endpoint.toString(), { headers: { "User-Agent": ua } });
        const osm = await res.json();
        // Normalize to Google-like Geocoding response shape used by the client
        const normalized = {
          results: (Array.isArray(osm) ? osm : []).map((r: any) => ({
            formatted_address: r.display_name,
            geometry: { location: { lat: Number(r.lat), lng: Number(r.lon) } },
            place_id: r.place_id?.toString(),
            address_components: [],
          })),
          status: res.ok ? "OK" : "ERROR",
          provider: "nominatim",
        };
        if (res.ok) cacheSet(cacheKey, normalized, 120_000);
        return { status: res.ok ? 200 : 502, body: normalized } as const;
      }

      // default: google
      if (!googleApiKey) {
        return { status: 500, body: { error: "GOOGLE_MAPS_API_KEY not configured" } } as const;
      }
      const endpoint = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      endpoint.searchParams.set("address", address);
      endpoint.searchParams.set("key", googleApiKey);
      const res = await fetchWithRetries(endpoint.toString());
      const data = await res.json();
      if (res.ok) cacheSet(cacheKey, data, 120_000);
      return { status: res.ok ? 200 : 502, body: { ...data, provider: "google" } } as const;
    };

    const doReverse = async (params: ReverseGeocodeParams) => {
      const latlng = params.latlng;
      if (!latlng) return { status: 400, body: { error: "latlng required" } };
      const chosen: GeocoderProvider = ((provider || Deno.env.get("MAPS_GEOCODER_PROVIDER") || "google").toLowerCase()) as GeocoderProvider;
      const cacheKey = `reverse:${chosen}:${latlng}`;
      const cached = cacheGet(cacheKey);
      if (cached) return { status: 200, body: cached } as const;

      if (chosen === "nominatim") {
        const base = Deno.env.get("NOMINATIM_BASE_URL") || "https://nominatim.openstreetmap.org";
        const endpoint = new URL("/reverse", base);
        endpoint.searchParams.set("lat", latlng.split(",")[0]);
        endpoint.searchParams.set("lon", latlng.split(",")[1]);
        endpoint.searchParams.set("format", "json");
        endpoint.searchParams.set("addressdetails", "1");
        const ua = Deno.env.get("NOMINATIM_USER_AGENT") || "PavementPerformanceSuite/1.0";
        const res = await fetchWithRetries(endpoint.toString(), { headers: { "User-Agent": ua } });
        const osm = await res.json();
        const normalized = {
          results: [
            {
              formatted_address: osm.display_name,
              geometry: { location: { lat: Number(osm.lat), lng: Number(osm.lon) } },
              place_id: osm.place_id?.toString(),
              address_components: [],
            },
          ],
          status: res.ok ? "OK" : "ERROR",
          provider: "nominatim",
        };
        if (res.ok) cacheSet(cacheKey, normalized, 120_000);
        return { status: res.ok ? 200 : 502, body: normalized } as const;
      }

      // default: google
      if (!googleApiKey) {
        return { status: 500, body: { error: "GOOGLE_MAPS_API_KEY not configured" } } as const;
      }
      const endpoint = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      endpoint.searchParams.set("latlng", latlng);
      endpoint.searchParams.set("key", googleApiKey);
      const res = await fetchWithRetries(endpoint.toString());
      const data = await res.json();
      if (res.ok) cacheSet(cacheKey, data, 120_000);
      return { status: res.ok ? 200 : 502, body: { ...data, provider: "google" } } as const;
    };

    const doDirections = async (params: DirectionsParams) => {
      const { origin, destination, mode } = params;
      if (!origin || !destination)
        return { status: 400, body: { error: "origin and destination required" } };

      const chosen: RoutingProvider = ((provider || Deno.env.get("MAPS_ROUTING_PROVIDER") || "google").toLowerCase()) as RoutingProvider;
      const cacheKey = `directions:${chosen}:${origin}:${destination}:${mode || ""}`;
      const cached = cacheGet(cacheKey);
      if (cached) return { status: 200, body: cached } as const;

      if (chosen === "osrm") {
        // Accept either lat,lng or address; if address, try geocoding first via chosen geocoder
        const toLL = async (val: string) => {
          if (/^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/.test(val)) {
            const [lat, lng] = val.split(",").map((n) => Number(n));
            return { lat, lng };
          }
          const g = await doGeocode({ address: val });
          const loc = (g.body as any)?.results?.[0]?.geometry?.location;
          if (!loc) throw new Error("Failed to geocode address for routing");
          return { lat: Number(loc.lat), lng: Number(loc.lng) };
        };
        const o = await toLL(origin);
        const d = await toLL(destination);
        const base = Deno.env.get("OSRM_BASE_URL") || "https://router.project-osrm.org";
        const profile = mode === "walking" ? "foot" : mode === "bicycling" ? "bike" : "car";
        const endpoint = new URL(`/route/v1/${profile}/${o.lng},${o.lat};${d.lng},${d.lat}`, base);
        endpoint.searchParams.set("overview", "full");
        endpoint.searchParams.set("geometries", "polyline");
        endpoint.searchParams.set("alternatives", "false");
        const res = await fetchWithRetries(endpoint.toString());
        const osrm = await res.json();
        // Normalize to Google-like shape expected by client code
        const meters = osrm?.routes?.[0]?.distance ?? 0;
        const seconds = osrm?.routes?.[0]?.duration ?? 0;
        const poly = osrm?.routes?.[0]?.geometry ?? "";
        const normalized = {
          routes: [
            {
              overview_polyline: { points: poly },
              legs: [
                {
                  distance: { value: meters, text: `${(meters / 1000).toFixed(1)} km` },
                  duration: { value: seconds, text: `${Math.round(seconds / 60)} mins` },
                },
              ],
            },
          ],
          status: res.ok ? "OK" : "ERROR",
          provider: "osrm",
        };
        if (res.ok) cacheSet(cacheKey, normalized, 60_000);
        return { status: res.ok ? 200 : 502, body: normalized } as const;
      }

      // default: google
      if (!googleApiKey) {
        return { status: 500, body: { error: "GOOGLE_MAPS_API_KEY not configured" } } as const;
      }
      const endpoint = new URL("https://maps.googleapis.com/maps/api/directions/json");
      endpoint.searchParams.set("origin", origin);
      endpoint.searchParams.set("destination", destination);
      if (mode) endpoint.searchParams.set("mode", mode);
      endpoint.searchParams.set("key", googleApiKey);
      const res = await fetchWithRetries(endpoint.toString());
      const data = await res.json();
      if (res.ok) cacheSet(cacheKey, data, 60_000);
      return { status: res.ok ? 200 : 502, body: { ...data, provider: "google" } } as const;
    };

    const doElevation = async (params: ElevationParams) => {
      const input = (params.locations || "").trim();
      if (!input) return { status: 400, body: { error: "locations required" } } as const;
      const chosen: ElevationProvider = ((provider || Deno.env.get("MAPS_ELEVATION_PROVIDER") || "open_elevation").toLowerCase()) as ElevationProvider;
      const cacheKey = `elevation:${chosen}:${input}`;
      const cached = cacheGet(cacheKey);
      if (cached) return { status: 200, body: cached } as const;

      const pairs = input.split("|").map((s) => s.trim()).filter(Boolean);

      if (chosen === "open_elevation") {
        const base = Deno.env.get("OPEN_ELEVATION_BASE_URL") || "https://api.open-elevation.com/api/v1/lookup";
        const endpoint = new URL(base);
        // Open-Elevation expects GET with ?locations=lat,lng|lat,lng
        endpoint.searchParams.set("locations", pairs.join("|"));
        const res = await fetchWithRetries(endpoint.toString());
        const oe = await res.json();
        // Normalize to Google Elevation-like shape
        const results = (oe?.results || []).map((r: any) => ({
          elevation: r.elevation,
          location: { lat: r.latitude, lng: r.longitude },
          resolution: r.resolution ?? null,
        }));
        const normalized = { results, status: res.ok ? "OK" : "ERROR", provider: "open_elevation" };
        if (res.ok) cacheSet(cacheKey, normalized, 300_000);
        return { status: res.ok ? 200 : 502, body: normalized } as const;
      }

      // default: google Elevation API
      if (!googleApiKey) {
        return { status: 500, body: { error: "GOOGLE_MAPS_API_KEY not configured" } } as const;
      }
      const endpoint = new URL("https://maps.googleapis.com/maps/api/elevation/json");
      endpoint.searchParams.set("locations", pairs.join("|"));
      endpoint.searchParams.set("key", googleApiKey);
      const res = await fetchWithRetries(endpoint.toString());
      const data = await res.json();
      if (res.ok) cacheSet(cacheKey, data, 300_000);
      return { status: res.ok ? 200 : 502, body: { ...data, provider: "google" } } as const;
    };

    let result:
      | { status: number; body: unknown }
      | undefined;
    

    if (op === "geocode") {
      result = await doGeocode({ address });
    } else if (op === "reverseGeocode") {
      result = await doReverse({ latlng });
    } else if (op === "directions") {
      result = await doDirections({ origin, destination, mode });
    } else if (op === "elevation") {
      result = await doElevation({ locations });
    }

    if (!result) {
      return new Response(JSON.stringify({ error: "Unsupported op" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
