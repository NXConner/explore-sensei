// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SupportedOperation = "geocode" | "reverseGeocode" | "directions";

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

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GOOGLE_MAPS_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Support both GET with query params and POST with JSON body
    let op: SupportedOperation | null = null;
    let address: string | undefined;
    let latlng: string | undefined;
    let origin: string | undefined;
    let destination: string | undefined;
    let mode: DirectionsParams["mode"] | undefined;

    if (req.method === "GET") {
      const url = new URL(req.url);
      op = url.searchParams.get("op") as SupportedOperation | null;
      address = url.searchParams.get("address") || undefined;
      latlng = url.searchParams.get("latlng") || undefined;
      origin = url.searchParams.get("origin") || undefined;
      destination = url.searchParams.get("destination") || undefined;
      mode = (url.searchParams.get("mode") as DirectionsParams["mode"]) || undefined;
    } else {
      const body = await req.json().catch(() => ({} as any));
      op = (body?.op as SupportedOperation) || null;
      address = body?.address;
      latlng = body?.latlng;
      origin = body?.origin;
      destination = body?.destination;
      mode = body?.mode;
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
      const endpoint = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      endpoint.searchParams.set("address", address);
      endpoint.searchParams.set("key", apiKey);
      const res = await fetch(endpoint.toString());
      const data = await res.json();
      return { status: res.ok ? 200 : 502, body: data } as const;
    };

    const doReverse = async (params: ReverseGeocodeParams) => {
      const latlng = params.latlng;
      if (!latlng) return { status: 400, body: { error: "latlng required" } };
      const endpoint = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      endpoint.searchParams.set("latlng", latlng);
      endpoint.searchParams.set("key", apiKey);
      const res = await fetch(endpoint.toString());
      const data = await res.json();
      return { status: res.ok ? 200 : 502, body: data } as const;
    };

    const doDirections = async (params: DirectionsParams) => {
      const { origin, destination, mode } = params;
      if (!origin || !destination) return { status: 400, body: { error: "origin and destination required" } };
      const endpoint = new URL("https://maps.googleapis.com/maps/api/directions/json");
      endpoint.searchParams.set("origin", origin);
      endpoint.searchParams.set("destination", destination);
      if (mode) endpoint.searchParams.set("mode", mode);
      endpoint.searchParams.set("key", apiKey);
      const res = await fetch(endpoint.toString());
      const data = await res.json();
      return { status: res.ok ? 200 : 502, body: data } as const;
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
    }

    if (!result) {
      return new Response(
        JSON.stringify({ error: "Unsupported op" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

