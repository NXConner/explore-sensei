import { Loader } from "@googlemaps/js-api-loader";
import { getGoogleMapsApiKey } from "@/config/env";

let loaderPromise: Promise<void> | null = null;

export function loadGoogleMaps(
  libraries: Array<"places" | "drawing" | "geometry"> = ["places", "drawing", "geometry"],
): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }

  if (window.google && window.google.maps) {
    return Promise.resolve();
  }

  if (!loaderPromise) {
    const apiKey = getGoogleMapsApiKey();
    if (!apiKey) {
      return Promise.reject(new Error("Missing Google Maps API key"));
    }

    const loader = new Loader({ apiKey, libraries });
    loaderPromise = loader.load().then(() => {
      // Loaded
    });
  }

  return loaderPromise;
}
