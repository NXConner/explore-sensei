import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "leaflet/dist/leaflet.css";
import { initWebVitals } from "@/lib/webVitals";
import { registerServiceWorker } from "@/lib/service-worker";
import { db } from "@/lib/indexed-db";
import { runtimeEnv } from "@/config/runtime-env";
import { logger } from "@/lib/monitoring";

logger.info("Bootstrapping Pavement Performance Suite client", {
  environment: runtimeEnv.appEnv,
  telemetryEnvironment: runtimeEnv.telemetryEnvironment,
});

// Initialize performance monitoring
if (import.meta.env.PROD) {
  initWebVitals();
}

// Initialize offline capabilities
registerServiceWorker();
db.init().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
