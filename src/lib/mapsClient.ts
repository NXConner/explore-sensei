import { supabase } from "../integrations/supabase/client";
import { getPreferredGeocoderProvider, getPreferredRoutingProvider, getPreferredElevationProvider } from "@/config/env";

export interface DirectionsOptions {
  origin: string; // "lat,lng" or address
  destination: string; // "lat,lng" or address
  mode?: "driving" | "walking" | "bicycling" | "transit";
}

export async function geocodeAddress(address: string, provider?: "google" | "nominatim") {
  const chosen = provider || getPreferredGeocoderProvider();
  const { data, error } = await supabase.functions.invoke("maps", {
    body: { op: "geocode", address, provider: chosen },
  });
  if (error) throw error;
  return data;
}

export async function reverseGeocode(lat: number, lng: number, provider?: "google" | "nominatim") {
  const chosen = provider || getPreferredGeocoderProvider();
  const { data, error } = await supabase.functions.invoke("maps", {
    body: { op: "reverseGeocode", latlng: `${lat},${lng}`, provider: chosen },
  });
  if (error) throw error;
  return data;
}

export async function getDirections(options: DirectionsOptions, provider?: "google" | "osrm") {
  const chosen = provider || getPreferredRoutingProvider();
  const { data, error } = await supabase.functions.invoke("maps", {
    body: {
      op: "directions",
      origin: options.origin,
      destination: options.destination,
      mode: options.mode,
      provider: chosen,
    },
  });
  if (error) throw error;
  return data;
}

export async function getElevation(locations: Array<{ lat: number; lng: number }>, provider?: "google" | "open_elevation") {
  const chosen = provider || getPreferredElevationProvider();
  const serialized = locations.map((p) => `${p.lat},${p.lng}`).join("|");
  const { data, error } = await supabase.functions.invoke("maps", {
    body: { op: "elevation", locations: serialized, provider: chosen },
  });
  if (error) throw error;
  return data;
}
