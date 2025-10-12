import { Loader } from "@googlemaps/js-api-loader";
import { getGoogleMapsApiKey } from "@/config/env";

let loaderPromise: Promise<void> | null = null;
let lastKey: string | undefined;

export function loadGoogleMaps(
  libraries: Array<"places" | "drawing" | "geometry"> = ["places", "drawing", "geometry"],
): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }

  if (window.google && window.google.maps) {
    return Promise.resolve();
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(new Error("Missing Google Maps API key"));
  }

  // If key changed since last attempt, reset loader so we can reload
  if (lastKey && lastKey !== apiKey) {
    loaderPromise = null;
  }

  if (!loaderPromise) {
    const loader = new Loader({ apiKey, libraries });
    lastKey = apiKey;
    loaderPromise = loader
      .load()
      .then(() => {
        // Loaded
      })
      .catch((err) => {
        // Reset so future attempts can retry (e.g., updated key)
        loaderPromise = null;
        throw err;
      });
  }

  return loaderPromise;
}
