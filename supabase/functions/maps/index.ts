// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GOOGLE_MAPS_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const op = url.searchParams.get("op") as SupportedOperation | null;
    if (!op) {
      return new Response(
        JSON.stringify({ error: "Missing op. Use ?op=geocode|reverseGeocode|directions" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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
      if (!origin || !destination)
        return { status: 400, body: { error: "origin and destination required" } };
      const endpoint = new URL("https://maps.googleapis.com/maps/api/directions/json");
      endpoint.searchParams.set("origin", origin);
      endpoint.searchParams.set("destination", destination);
      if (mode) endpoint.searchParams.set("mode", mode);
      endpoint.searchParams.set("key", apiKey);
      const res = await fetch(endpoint.toString());
      const data = await res.json();
      return { status: res.ok ? 200 : 502, body: data } as const;
    };

    const search = url.searchParams;
    let result: { status: number; body: unknown } | undefined;

    if (op === "geocode") {
      result = await doGeocode({ address: search.get("address") || undefined });
    } else if (op === "reverseGeocode") {
      result = await doReverse({ latlng: search.get("latlng") || undefined });
    } else if (op === "directions") {
      result = await doDirections({
        origin: search.get("origin") || undefined,
        destination: search.get("destination") || undefined,
        mode: (search.get("mode") as DirectionsParams["mode"]) || undefined,
      });
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
