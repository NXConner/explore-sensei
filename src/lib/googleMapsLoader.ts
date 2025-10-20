import { Loader } from "@googlemaps/js-api-loader";
import { getGoogleMapsApiKey } from "@/config/env";
import { logger } from "@/lib/monitoring";

let loaderPromise: Promise<void> | null = null;
let lastKey: string | undefined;

export function loadGoogleMaps(
  libraries: Array<"places" | "drawing" | "geometry" | "visualization"> = [
    "places",
    "drawing",
    "geometry",
    "visualization",
  ],
): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }

  if (window.google && window.google.maps) {
    return Promise.resolve();
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    logger.warn("Google Maps API key missing; maps will not load");
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
        if (import.meta.env.DEV) {
          logger.info("Google Maps JS API loaded");
        }
      })
      .catch((err) => {
        // Reset so future attempts can retry (e.g., updated key)
        loaderPromise = null;
        logger.error("Google Maps JS API failed to load", { error: err });
        throw err;
      });
  }

  return loaderPromise;
}
