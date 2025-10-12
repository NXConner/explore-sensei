export interface DirectionsOptions {
  origin: string; // "lat,lng" or address
  destination: string; // "lat,lng" or address
  mode?: "driving" | "walking" | "bicycling" | "transit";
}

const baseUrl = "/functions/v1/maps"; // Supabase functions proxy path

export async function geocodeAddress(address: string) {
  const url = `${baseUrl}?op=geocode&address=${encodeURIComponent(address)}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Geocode failed: ${res.status}`);
  return res.json();
}

export async function reverseGeocode(lat: number, lng: number) {
  const url = `${baseUrl}?op=reverseGeocode&latlng=${lat},${lng}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Reverse geocode failed: ${res.status}`);
  return res.json();
}

export async function getDirections(options: DirectionsOptions) {
  const params = new URLSearchParams();
  params.set("op", "directions");
  params.set("origin", options.origin);
  params.set("destination", options.destination);
  if (options.mode) params.set("mode", options.mode);
  const url = `${baseUrl}?${params.toString()}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Directions failed: ${res.status}`);
  return res.json();
}
