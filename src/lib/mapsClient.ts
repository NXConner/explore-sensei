import { supabase } from "../integrations/supabase/client";

export interface DirectionsOptions {
  origin: string; // "lat,lng" or address
  destination: string; // "lat,lng" or address
  mode?: "driving" | "walking" | "bicycling" | "transit";
}

export async function geocodeAddress(address: string) {
  const { data, error } = await supabase.functions.invoke("maps", {
    body: { op: "geocode", address },
  });
  if (error) throw error;
  return data;
}

export async function reverseGeocode(lat: number, lng: number) {
  const { data, error } = await supabase.functions.invoke("maps", {
    body: { op: "reverseGeocode", latlng: `${lat},${lng}` },
  });
  if (error) throw error;
  return data;
}

export async function getDirections(options: DirectionsOptions) {
  const { data, error } = await supabase.functions.invoke("maps", {
    body: {
      op: "directions",
      origin: options.origin,
      destination: options.destination,
      mode: options.mode,
    },
  });
  if (error) throw error;
  return data;
}

