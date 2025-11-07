/// <reference types="google.maps" />
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, lazy, Suspense } from "react";
import mapboxgl from "mapbox-gl";
import maplibregl from "maplibre-gl";
import L from "leaflet";
import { Protocol as PMTilesProtocol } from "pmtiles";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useJobSites } from "@/hooks/useJobSites";
import { MeasurementDisplay } from "./MeasurementDisplay";
import { useMapDrawing, DrawingMode } from "@/hooks/useMapDrawing";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMapMeasurements } from "@/hooks/useMapMeasurements";
// Lazy-load AI modal to avoid bundling conflicts and reduce initial payload
const AIAsphaltDetectionModalLazy = lazy(() =>
  import("@/components/ai/AIAsphaltDetectionModal").then((m) => ({ default: m.AIAsphaltDetectionModal }))
);
import { MapVisibilityControls } from "./MapVisibilityControls";
import { EmployeeTrackingLayer } from "./EmployeeTrackingLayer";
const MapEffectsLazy = lazy(() => import("./MapEffects").then((m) => ({ default: m.MapEffects })));
import { divisionMapStyle, animusMapStyle } from "./themes";
import { WeatherRadarLayer } from "@/components/weather/WeatherRadarLayer";
import { DarkZoneLayer } from "@/components/map/DarkZoneLayer";
import { RainRadarOverlay } from "@/components/weather/RainRadarOverlay";
import { MapContext } from "./MapContext";
import { PulseScanOverlay } from "@/components/map/PulseScanOverlay";
import { AsphaltDetectionsLayer } from "./AsphaltDetectionsLayer";
import {
  getGoogleMapsApiKey,
  getMapboxAccessToken,
  getPreferredMapProvider,
  getMapLibreStyleUrl,
  getBasemapPmtilesUrl,
  getMapTilerApiKey,
  getUSGSImageryWmsUrl,
  getUSDA_NAIP_WmsUrl,
  getPatrickCountyWmsUrl,
  getPatrickCountyEsriFeatureUrl,
  getParcelsTilesTemplate,
} from "@/config/env";
import { logger } from "@/lib/monitoring";
import { geocodeAddress, getDirections, reverseGeocode } from "@/lib/mapsClient";
import { CornerBrackets } from "@/components/hud/CornerBrackets";
import { CompassRose } from "@/components/hud/CompassRose";
import { CoordinateDisplay } from "@/components/hud/CoordinateDisplay";
import { ScaleBar } from "@/components/hud/ScaleBar";
import { ZoomIndicator } from "@/components/hud/ZoomIndicator";
import { MiniMap } from "@/components/hud/MiniMap";
import { SuitabilityOverlay } from "@/components/map/SuitabilityOverlay";
import { HeatmapOverlay } from "@/components/map/HeatmapOverlay";
import { RadialMenu } from "@/components/map/RadialMenu";
import { RingSliders } from "@/components/map/RingSliders";
import { useOpenWeather } from "@/hooks/useOpenWeather";
import { playCue } from "@/lib/audioEffects";
import { DarkZoneEditor } from "@/components/map/DarkZoneEditor";

// API keys are read dynamically to allow runtime updates via Settings

type MapTheme = "division" | "animus";

export interface MapContainerRef {
  handleLocateMe: () => void;
  handleToggleTraffic: () => void;
  handleToggleStreetView: () => void;
  toggleEmployeeTracking: () => void;
  toggleWeatherRadar: () => void;
  toggleParcels: () => void;
  handleTogglePulseScan: () => void;
  handleModeChange: (mode: DrawingMode) => void;
  handleClear: () => void;
  handleSave: () => void;
  getShowTraffic: () => boolean;
  getShowEmployeeTracking: () => boolean;
  getShowWeatherRadar: () => boolean;
  getShowParcels: () => boolean;
  getActiveMode: () => DrawingMode;
  setImagery: (mode: "none" | "naip" | "usgs") => void;
  getImagery: () => "none" | "naip" | "usgs";
}

export const MapContainer = forwardRef<
  MapContainerRef,
  { initialMapTheme?: "division" | "animus" }
>((props, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const mapboxInstanceRef = useRef<any | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const savedMeasurementsRef = useRef<Array<google.maps.Polyline | google.maps.Circle>>([]);
  const aiOverlayRef = useRef<google.maps.Circle | null>(null);
  const streetViewRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const searchMarkerRef = useRef<google.maps.Marker | null>(null);
  const selectionMarkerRef = useRef<google.maps.Marker | null>(null);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const routeCometRef = useRef<google.maps.Circle | null>(null);
  const parcelsImageMapTypeRef = useRef<google.maps.ImageMapType | null>(null);
  // Fallback map helpers (Mapbox/MapLibre/Leaflet)
  const fallbackSelectionMarkerRef = useRef<any | null>(null);
  const mapboxJobMarkersRef = useRef<any[]>([]);
  const leafletJobLayerRef = useRef<any | null>(null);
  const leafletMeasurementsLayerRef = useRef<any | null>(null);
  const [showStreetView, setShowStreetView] = useState(false);
  const [showAIDetection, setShowAIDetection] = useState(false);
  const [showEmployeeTracking, setShowEmployeeTracking] = useState(false);
  const [showWeatherRadar, setShowWeatherRadar] = useState(false);
  const [showParcels, setShowParcels] = useState(false);

  const [imagery, setImagery] = useState<"none" | "naip" | "usgs">("none");
  const leafletImageryRef = useRef<L.TileLayer | null>(null);
  const googleImageryRef = useRef<google.maps.ImageMapType | null>(null);

  const [showDarkZones, setShowDarkZones] = useState(false);
  const [showSuitability, setShowSuitability] = useState(false);
  const [showPulseScan, setShowPulseScan] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapPoints, setHeatmapPoints] = useState<Array<{ lat: number; lng: number; weight?: number }>>([]);

  const [radarOpacity, setRadarOpacity] = useState(70);
  const [alertRadius, setAlertRadius] = useState(15);
  const [mapTheme, setMapTheme] = useState<MapTheme>(props.initialMapTheme || "division");
  const [mapsUnavailable, setMapsUnavailable] = useState(false);
  const [usingMapbox, setUsingMapbox] = useState(false);
  const [configVersion, setConfigVersion] = useState(0);
  const { data: jobSites } = useJobSites();
  const { measurement, setDrawingMode, clearDrawings, getMeasurementGeoJSON } = useMapDrawing(mapInstanceRef.current);
  const [activeMode, setActiveMode] = useState<DrawingMode>(null);
  const { toast } = useToast();
  const { measurements } = useMapMeasurements();
  const [weatherCenter, setWeatherCenter] = useState<{ lat: number; lng: number } | null>(null);
  const weather = useOpenWeather(weatherCenter?.lat, weatherCenter?.lng);
  const [showDarkZoneEditor, setShowDarkZoneEditor] = useState(false);

  // MapContext state
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [mapZoom, setMapZoom] = useState(15);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleLocateMe,
    handleToggleTraffic,
    handleToggleStreetView,
    toggleEmployeeTracking: () => setShowEmployeeTracking(!showEmployeeTracking),
    toggleWeatherRadar: () => setShowWeatherRadar(!showWeatherRadar),
    toggleParcels: () => setShowParcels((v) => !v),
    handleModeChange,
    handleClear,
    handleSave,
    handleTogglePulseScan: () => setShowPulseScan((v) => !v),
    getShowTraffic: () => trafficLayerRef.current?.getMap() != null,
    getShowEmployeeTracking: () => showEmployeeTracking,
    getShowWeatherRadar: () => showWeatherRadar,
    getShowParcels: () => showParcels,
    getActiveMode: () => activeMode,
    setImagery: (mode: "none" | "naip" | "usgs") => setImagery(mode),
    getImagery: () => imagery,
  }));

  // UI settings loaded from SettingsModal persistence
  const [uiSettings, setUiSettings] = useState({
    radarEffect: true,
    glitchEffect: true,
    scanlineEffect: true,
    gridOverlay: true,
    radarSpeed: 3,
    glitchIntensity: 30, // percent
    glitchClickPreset: "subtle" as "barely" | "subtle" | "normal",
    vignetteEffect: false,
    radarType: "standard" as "standard" | "sonar" | "aviation",
    radarAudioEnabled: false,
    radarAudioVolume: 50,
    ringControls: true,
    reduceMotion: false,
    lowPowerMode: false,
    useCanvasFX: false,
    soundset: "auto" as "auto" | "division" | "animus",
    soundVolume: 70,
    pulseHighlightPOIs: true,
    suitabilityThresholds: { minTempF: 55, maxTempF: 95, maxHumidity: 70, maxPrecipChance: 20 },
  });

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Auto-locate user on mount
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Check if there's a default address in settings
          const savedSettings = localStorage.getItem("aos_settings");
          if (savedSettings) {
            try {
              const settings = JSON.parse(savedSettings);
              if (settings.defaultMapAddress && settings.useDefaultLocation) {
                // Use default address instead
                return;
              }
            } catch (e) {}
          }

          // Zoom to user location (all the way in = zoom 20)
          mapInstanceRef.current?.setCenter(userLocation);
          mapInstanceRef.current?.setZoom(20);

          toast({
            title: "Location Found",
            description: "Centered map on your current location",
          });
        },
        (error) => {
          logger.warn("Geolocation error", { error });
          // Fallback to default location or saved address
          const savedSettings = localStorage.getItem("aos_settings");
          if (savedSettings) {
            try {
              const settings = JSON.parse(savedSettings);
              if (settings.defaultMapAddress) {
                // Geocode the default address
                toast({
                  title: "Using Default Location",
                  description: "GPS unavailable, using saved address",
                });
              }
            } catch (e) {}
          }
        },
      );
    }
  }, [toast]);

  useEffect(() => {
    const readFromLocalStorage = () => {
      try {
        const raw = localStorage.getItem("aos_settings");
        if (!raw) return;
        const parsed = JSON.parse(raw);
        setUiSettings((prev) => ({
          ...prev,
          radarEffect: parsed.radarEffect ?? prev.radarEffect,
          glitchEffect: parsed.glitchEffect ?? prev.glitchEffect,
          scanlineEffect: parsed.scanlineEffect ?? prev.scanlineEffect,
          gridOverlay: parsed.gridOverlay ?? prev.gridOverlay,
          radarSpeed: parsed.radarSpeed ?? prev.radarSpeed,
          glitchIntensity: parsed.glitchIntensity ?? prev.glitchIntensity,
          glitchClickPreset: parsed.glitchClickPreset ?? prev.glitchClickPreset,
          vignetteEffect: parsed.vignetteEffect ?? prev.vignetteEffect,
          radarType: parsed.radarType ?? prev.radarType,
          radarAudioEnabled: parsed.radarAudioEnabled ?? prev.radarAudioEnabled,
          radarAudioVolume: parsed.radarAudioVolume ?? prev.radarAudioVolume,
          ringControls: parsed.ringControls ?? prev.ringControls,
          reduceMotion: parsed.reduceMotion ?? prev.reduceMotion,
          lowPowerMode: parsed.lowPowerMode ?? prev.lowPowerMode,
          useCanvasFX: parsed.useCanvasFX ?? prev.useCanvasFX,
          soundset: parsed.soundset ?? prev.soundset,
          soundVolume: parsed.soundVolume ?? prev.soundVolume,
          pulseHighlightPOIs: parsed.pulseHighlightPOIs ?? prev.pulseHighlightPOIs,
          suitabilityThresholds: parsed.suitabilityThresholds ?? prev.suitabilityThresholds,
        }));
        if (parsed.mapTheme && (parsed.mapTheme === "division" || parsed.mapTheme === "animus")) {
          setMapTheme(parsed.mapTheme);
        }
        if (parsed.apiKeys) setConfigVersion((v) => v + 1);
        if (typeof parsed.radarOpacity === 'number') setRadarOpacity(parsed.radarOpacity);
        if (typeof parsed.weatherAlertRadius === 'number') setAlertRadius(parsed.weatherAlertRadius);
        if (parsed.pulseScanEnabled) setShowPulseScan(true);
      } catch (err) {
        logger.warn("Failed to read UI settings", { error: err });
      }
    };

    // Initial load
    readFromLocalStorage();

    // Sync across tabs/windows and within same tab via custom event
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "aos_settings" || !e.newValue) return;
      readFromLocalStorage();
    };
    const onCustom = () => readFromLocalStorage();
    window.addEventListener("storage", onStorage);
    window.addEventListener("aos_settings_updated", onCustom as any);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("aos_settings_updated", onCustom as any);
    };
  }, []);

  // Listen for Dark Zones toggle from sidebar
  useEffect(() => {
    const handler = (e: any) => {
      const enabled = !!e?.detail?.enabled;
      setShowDarkZones(enabled);
    };
    window.addEventListener('toggle-dark-zones', handler as any);
    return () => window.removeEventListener('toggle-dark-zones', handler as any);
  }, []);

  // Bridge window events for new horizontal ops bar
  useEffect(() => {
    const onGeocode = (e: any) => {
      const q = e?.detail?.query;
      if (typeof q === 'string' && q.trim()) {
        try { handleGeocode(q.trim()); } catch {}
      }
    };
    const onSetMode = (e: any) => {
      const mode = e?.detail?.mode as DrawingMode;
      try { handleModeChange(mode); } catch {}
    };
    const onClear = () => { try { handleClear(); } catch {} };
    const onToggleTraffic = () => { try { handleToggleTraffic(); } catch {} };
    const onToggleWeather = () => { try { setShowWeatherRadar((v) => !v); } catch {} };
    const onToggleEmployee = () => { try { setShowEmployeeTracking((v) => !v); } catch {} };

    window.addEventListener('geocode-address', onGeocode as any);
    window.addEventListener('set-drawing-mode', onSetMode as any);
    window.addEventListener('clear-drawings', onClear as any);
    window.addEventListener('toggle-traffic', onToggleTraffic as any);
    window.addEventListener('toggle-weather-radar', onToggleWeather as any);
    window.addEventListener('toggle-employee-tracking', onToggleEmployee as any);
    return () => {
      window.removeEventListener('geocode-address', onGeocode as any);
      window.removeEventListener('set-drawing-mode', onSetMode as any);
      window.removeEventListener('clear-drawings', onClear as any);
      window.removeEventListener('toggle-traffic', onToggleTraffic as any);
      window.removeEventListener('toggle-weather-radar', onToggleWeather as any);
      window.removeEventListener('toggle-employee-tracking', onToggleEmployee as any);
    };
  }, []);

  // Listen for Suitability / Pulse Scan toggles
  useEffect(() => {
    const onSuitability = () => setShowSuitability((v) => {
      const next = !v;
      try { logger.info('Suitability toggled', { enabled: next }); } catch {}
      try {
        if (next) {
          const th = uiSettings.suitabilityThresholds;
          const temp = weather.data?.current?.temp ?? 72;
          const hum = weather.data?.current?.humidity ?? 45;
          const pop = weather.data?.precipChance ?? 0;
          const bad = temp < (th?.minTempF ?? 55) || temp > (th?.maxTempF ?? 95) || hum > (th?.maxHumidity ?? 70) || pop > (th?.maxPrecipChance ?? 20);
          if (bad) playCue('hazard', { soundset: uiSettings.soundset });
        }
      } catch {}
      return next;
    });
    const onPulse = () => setShowPulseScan((v) => {
      const next = !v;
      try { logger.info('Pulse scan toggled', { enabled: next }); } catch {}
      try { playCue(next ? 'objective' : 'scan-complete', { soundset: uiSettings.soundset }); } catch {}
      return next;
    });
    const onHeat = () => setShowHeatmap((v) => !v);
    const onOpenDzEditor = () => setShowDarkZoneEditor(true);
    window.addEventListener('toggle-suitability', onSuitability as any);
    window.addEventListener('toggle-pulse-scan', onPulse as any);
    window.addEventListener('toggle-heatmap', onHeat as any);
    window.addEventListener('open-dark-zone-editor', onOpenDzEditor as any);
    return () => {
      window.removeEventListener('toggle-suitability', onSuitability as any);
      window.removeEventListener('toggle-pulse-scan', onPulse as any);
      window.removeEventListener('toggle-heatmap', onHeat as any);
      window.removeEventListener('open-dark-zone-editor', onOpenDzEditor as any);
    };
  }, [uiSettings.soundset, uiSettings.suitabilityThresholds, weather.data]);
  // Track map center for weather queries
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const updateCenter = () => {
      try {
        const c = mapInstanceRef.current!.getCenter?.();
        if (c) setWeatherCenter({ lat: c.lat(), lng: c.lng() });
      } catch {}
    };
    updateCenter();
    const idle = mapInstanceRef.current.addListener?.('idle', updateCenter);
    return () => { try { (google.maps.event as any).removeListener?.(idle); } catch {} };
  }, [mapInstanceRef.current]);

  // Pulse scan POI highlighting
  useEffect(() => {
    if (!showPulseScan || !uiSettings.pulseHighlightPOIs) return;
    if (!markersRef.current || markersRef.current.length === 0) return;
    let i = 0;
    let cancelled = false;
    const seq = () => {
      if (cancelled) return;
      if (!mapInstanceRef.current) return;
      const m = markersRef.current[i % markersRef.current.length];
      try {
        (m as any).setAnimation?.(google.maps.Animation.BOUNCE);
        setTimeout(() => (m as any).setAnimation?.(null), 500);
      } catch {}
      i += 1;
      timer = window.setTimeout(seq, 120);
    };
    let timer = window.setTimeout(seq, 120);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [showPulseScan, uiSettings.pulseHighlightPOIs, markersRef.current?.length]);

  // Build heatmap points from job sites as a placeholder; could be productivity/issue density
  useEffect(() => {
    if (!jobSites) return;
    const pts = jobSites
      .filter((s) => s.latitude && s.longitude)
      .map((s) => ({ lat: Number(s.latitude), lng: Number(s.longitude), weight: Math.max(1, Math.min(5, (s.progress || 0) / 20)) }));
    setHeatmapPoints(pts);
  }, [jobSites]);

  // Add job site markers for Mapbox/MapLibre/Leaflet fallbacks
  useEffect(() => {
    if (!usingMapbox || !jobSites) return;
    const gl: any = mapboxInstanceRef.current;
    if (!gl) return;

    // Clear previous markers/overlays
    try {
      mapboxJobMarkersRef.current.forEach((m) => m?.remove?.());
    } catch {}
    mapboxJobMarkersRef.current = [];
    try {
      if (leafletJobLayerRef.current) {
        gl.removeLayer(leafletJobLayerRef.current);
        leafletJobLayerRef.current = null;
      }
    } catch {}

    // Mapbox/MapLibre path
    if (gl && typeof gl.getStyle === 'function') {
      jobSites.forEach((site) => {
        if (!site.latitude || !site.longitude) return;
        const color = site.status === 'In Progress' ? '#ff8c00' : '#00aaff';
        let marker: any = null;
        try {
          marker = new (mapboxgl as any).Marker({ color })
            .setLngLat([site.longitude, site.latitude])
            .addTo(gl);
        } catch {
          try {
            marker = new (maplibregl as any).Marker({ color })
              .setLngLat([site.longitude, site.latitude])
              .addTo(gl);
          } catch {}
        }
        if (marker) mapboxJobMarkersRef.current.push(marker);
      });
      return;
    }

    // Leaflet path
    if (gl && typeof gl.addLayer === 'function' && typeof gl.eachLayer === 'function') {
      const group = L.layerGroup();
      jobSites.forEach((site) => {
        if (!site.latitude || !site.longitude) return;
        L.circleMarker([site.latitude, site.longitude], {
          radius: 6,
          color: '#ffffff',
          weight: 2,
          fillColor: '#00aaff',
          fillOpacity: 1,
        }).addTo(group);
      });
      group.addTo(gl);
      leafletJobLayerRef.current = group;
    }
  }, [jobSites, usingMapbox]);

  const handleModeChange = (mode: DrawingMode) => {
    setActiveMode(mode);
    setDrawingMode(mode);
  };

  const handleClear = () => {
    clearDrawings();
    setActiveMode(null);
    try {
      routePolylineRef.current?.setMap(null);
      routePolylineRef.current = null;
      if (routeCometRef.current) {
        window.clearInterval((routeCometRef.current as any).__pulse);
        routeCometRef.current.setMap(null);
        routeCometRef.current = null;
      }
    } catch {}
  };

  const handleLocateMe = () => {
    if (!mapInstanceRef.current) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          mapInstanceRef.current?.panTo(userLocation);
          mapInstanceRef.current?.setZoom(18);

          toast({
            title: "Location Found",
            description: "Map centered on your location.",
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enable location services.",
            variant: "destructive",
          });
        },
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  const handleToggleTraffic = () => {
    if (!trafficLayerRef.current || !mapInstanceRef.current) return;

    if (trafficLayerRef.current.getMap()) {
      trafficLayerRef.current.setMap(null);
      toast({
        title: "Traffic Hidden",
        description: "Traffic layer has been hidden.",
      });
    } else {
      trafficLayerRef.current.setMap(mapInstanceRef.current);
      toast({
        title: "Traffic Shown",
        description: "Traffic layer is now visible.",
      });
    }
  };

  const handleToggleStreetView = () => {
    if (!mapInstanceRef.current) return;

    setShowStreetView(!showStreetView);

    if (!showStreetView) {
      const center = mapInstanceRef.current.getCenter();
      if (center) {
        streetViewRef.current = mapInstanceRef.current.getStreetView();
        streetViewRef.current?.setPosition(center);
        streetViewRef.current?.setVisible(true);
        toast({
          title: "Street View Active",
          description: "Click and drag to navigate in Street View.",
        });
      }
    } else {
      streetViewRef.current?.setVisible(false);
      toast({
        title: "Street View Closed",
        description: "Returned to map view.",
      });
    }
  };

  // Apply imagery overlay for current provider
  useEffect(() => {
    const USGS = getUSGSImageryWmsUrl() ||
      "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}";
    const NAIP = getUSDA_NAIP_WmsUrl() ||
      "https://services.nationalmap.gov/arcgis/rest/services/USGSNAIPPlus/MapServer/tile/{z}/{y}/{x}";

    const tileUrl = imagery === "usgs" ? USGS : imagery === "naip" ? NAIP : null;

    // Google Maps path
    if (!usingMapbox && mapInstanceRef.current) {
      // Clear existing overlay
      if (googleImageryRef.current) {
        try {
          const overlays = mapInstanceRef.current.overlayMapTypes;
          for (let i = overlays.getLength() - 1; i >= 0; i--) {
            overlays.removeAt(i);
          }
        } catch {}
        googleImageryRef.current = null;
      }
      if (!tileUrl) return;
      try {
        const imt = new google.maps.ImageMapType({
          getTileUrl: (coord: google.maps.Point, zoom: number) =>
            tileUrl
              .replace("{z}", String(zoom))
              .replace("{x}", String(coord.x))
              .replace("{y}", String(coord.y)),
          tileSize: new google.maps.Size(256, 256),
          name: imagery.toUpperCase(),
        } as any);
        mapInstanceRef.current.overlayMapTypes.push(imt);
        googleImageryRef.current = imt;
      } catch {}
      return;
    }

    // MapLibre/Mapbox path
    const gl = mapboxInstanceRef.current as any;
    if (gl && typeof gl?.getStyle === "function" && typeof gl?.addSource === "function") {
      const layerId = "imagery-layer";
      const sourceId = "imagery-src";
      try {
        if (gl.getLayer(layerId)) gl.removeLayer(layerId);
      } catch {}
      try {
        if (gl.getSource(sourceId)) gl.removeSource(sourceId);
      } catch {}
      if (!tileUrl) return;
      try {
        gl.addSource(sourceId, {
          type: "raster",
          tiles: [tileUrl],
          tileSize: 256,
          attribution: "USGS/USDA",
        });
        gl.addLayer({ id: layerId, type: "raster", source: sourceId, paint: { "raster-opacity": 0.85 } });
      } catch {}
      return;
    }

    // Leaflet path
    const lf = mapboxInstanceRef.current as any;
    if (lf && typeof lf?.addLayer === "function" && typeof lf?.eachLayer === "function") {
      if (leafletImageryRef.current) {
        try { lf.removeLayer(leafletImageryRef.current); } catch {}
        leafletImageryRef.current = null;
      }
      if (!tileUrl) return;
      try {
        const layer = L.tileLayer(tileUrl, { opacity: 0.85, crossOrigin: true });
        layer.addTo(lf);
        leafletImageryRef.current = layer;
      } catch {}
      return;
    }
  }, [imagery, usingMapbox]);

  const handleAIDetect = () => {
    setShowAIDetection(true);
  };

  const handleGeocode = async (query: string) => {
    try {
      const data = await geocodeAddress(query);
      const result = data.results?.[0];
      const loc = result?.geometry?.location;
      if (!loc) throw new Error("No results");
      const position = { lat: loc.lat, lng: loc.lng };

      if (!mapInstanceRef.current) return;
      mapInstanceRef.current.panTo(position);
      mapInstanceRef.current.setZoom(16);

      if (searchMarkerRef.current) searchMarkerRef.current.setMap(null);
      searchMarkerRef.current = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: query,
      });
    } catch (e) {
      toast({ title: "Geocode failed", description: "No results found.", variant: "destructive" });
    }
  };

  const handleRoute = async (origin: string, destination: string) => {
    try {
      const data = await getDirections({ origin, destination, mode: "driving" });
      const route = data.routes?.[0];
      const overview = route?.overview_polyline?.points;
      if (!overview || !mapInstanceRef.current) throw new Error("No route");

      // decode polyline using geometry library
      // google.maps.geometry.encoding is included via libraries
      const path = google.maps.geometry.encoding.decodePath(overview);

      if (routePolylineRef.current) routePolylineRef.current.setMap(null);
      routePolylineRef.current = new google.maps.Polyline({
        path,
        strokeColor: "#00ffff",
        strokeOpacity: 0.9,
        strokeWeight: 4,
        map: mapInstanceRef.current,
        icons: [{
          icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2, strokeOpacity: 0, fillOpacity: 0 },
          offset: "0%",
          repeat: "20px",
        }],
      });

      // Comet pulse traveling along route
      try {
        const comet = new google.maps.Circle({
          radius: 8,
          strokeColor: "#00ffff",
          strokeOpacity: 0.0,
          strokeWeight: 1,
          fillColor: "#00ffff",
          fillOpacity: 0.9,
          map: mapInstanceRef.current,
        });
        routeCometRef.current = comet;
        let i = 0;
        const pts = path.map((p) => ({ lat: p.lat(), lng: p.lng() }));
        const id = window.setInterval(() => {
          if (!mapInstanceRef.current || !routeCometRef.current || pts.length === 0) return;
          const idx = i % pts.length;
          routeCometRef.current.setCenter(pts[idx]);
          // pulse size
          const r = 6 + (idx % 6);
          routeCometRef.current.setRadius(r);
          i += 2;
        }, 60);
        (comet as any).__pulse = id;
      } catch {}

      const bounds = new google.maps.LatLngBounds();
      path.forEach((latLng) => bounds.extend(latLng));
      mapInstanceRef.current.fitBounds(bounds, 48);
      toast({
        title: "Route ready",
        description: `${route.legs?.[0]?.distance?.text || ""} • ${route.legs?.[0]?.duration?.text || ""}`,
      });
    } catch (e) {
      toast({
        title: "Directions failed",
        description: "Unable to compute route.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!measurement.distance && !measurement.area) {
      toast({
        title: "No Measurement",
        description: "Please create a measurement first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const center = mapInstanceRef.current?.getCenter();
      const geometry = getMeasurementGeoJSON?.() || (center
        ? { type: "Point", coordinates: [center.lng(), center.lat()] }
        : null);
      const { error } = await supabase.from("Mapmeasurements").insert({
        type: measurement.distance ? "distance" : "area",
        value: measurement.distance || measurement.area,
        unit: measurement.distance ? "meters" : "square_meters",
        geojson: geometry,
      });

      if (error) throw error;

      toast({
        title: "Measurement Saved",
        description: "Your measurement has been saved successfully.",
      });
    } catch (error) {
      logger.error("Error saving measurement", { error });
      toast({
        title: "Error",
        description: "Failed to save measurement.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // If no Google Maps key, use Mapbox fallback
    const currentGoogleKey = getGoogleMapsApiKey();
    const preference = getPreferredMapProvider();
    const forceMapbox = preference === "mapbox";
    const forceGoogle = preference === "google";
    const forceMapLibre = preference === "maplibre";
    const forceLeaflet = preference === "leaflet";
    const noGoogleKey = !currentGoogleKey || currentGoogleKey === "undefined";
    const initializeMapboxFallback = async () => {
      setUsingMapbox(true);
      setMapsUnavailable(false);
      if (!mapRef.current || mapboxInstanceRef.current) return;
      try {
        let token = getMapboxAccessToken();
        if (!token) {
          const { data, error } = await supabase.functions.invoke("get-mapbox-token");
          if (error || !data?.token) throw new Error(error?.message || "No Mapbox token");
          token = data.token as string;
        }

        mapboxgl.accessToken = token;
        const defaultCenter: [number, number] = [-80.2715, 36.6904];
        const map = new mapboxgl.Map({
          container: mapRef.current,
          style: "mapbox://styles/mapbox/satellite-streets-v12",
          center: defaultCenter,
          zoom: 12,
          projection: "globe",
        });
        mapboxInstanceRef.current = map;

        map.on("load", () => {
          map.setFog({});
          try {
            const template = getParcelsTilesTemplate();
            if (template) {
              if (!map.getSource('parcels-source')) {
                map.addSource('parcels-source', {
                  type: 'raster',
                  tiles: [template],
                  tileSize: 256,
                } as any);
              }
              if (!map.getLayer('parcels-layer')) {
                map.addLayer({
                  id: 'parcels-layer',
                  type: 'raster',
                  source: 'parcels-source',
                  paint: { 'raster-opacity': 0.7 },
                  layout: { visibility: showParcels ? 'visible' : 'none' },
                } as any);
              } else {
                map.setLayoutProperty('parcels-layer', 'visibility', showParcels ? 'visible' : 'none');
              }
            }
          } catch (e) {
            logger.warn('Failed to configure parcels layer for Mapbox', { error: e });
          }
          // Click to select (Mapbox GL)
          try {
            map.on('click', async (e: any) => {
              try {
                const lng = e?.lngLat?.lng;
                const lat = e?.lngLat?.lat;
                if (typeof lat !== 'number' || typeof lng !== 'number') return;
                const data = await reverseGeocode(lat, lng, 'nominatim');
                const best = (data as any)?.results?.[0];
                const address: string = best?.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                try { fallbackSelectionMarkerRef.current?.remove?.(); } catch {}
                try {
                  fallbackSelectionMarkerRef.current = new mapboxgl.Marker({ color: '#00d1ff' })
                    .setLngLat([lng, lat])
                    .addTo(map);
                } catch {}
                try {
                  const detail = { lat, lng, address, provider: (data as any)?.provider, placeId: best?.place_id };
                  window.dispatchEvent(new CustomEvent('map-location-selected', { detail }));
                  try { localStorage.setItem('aos_last_selected_location', JSON.stringify(detail)); } catch {}
                } catch {}
                toast({ title: 'Location selected', description: address });
              } catch (err) {
                logger.warn('Mapbox click reverse geocode failed', { error: err });
              }
            });
          } catch {}
        });

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              map.easeTo({
                center: [position.coords.longitude, position.coords.latitude],
                zoom: 15,
              });
            },
            () => {},
          );
        }
      } catch (e) {
        logger.warn("Failed to initialize Mapbox", { error: e });
        setMapsUnavailable(true);
      }
    };

    const initializeMapLibre = async () => {
      setUsingMapbox(true);
      setMapsUnavailable(false);
      if (!mapRef.current || mapboxInstanceRef.current) return;
      try {
        const protocol = new PMTilesProtocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);
        const defaultCenter: [number, number] = [-80.2715, 36.6904];
        const styleUrl = getMapLibreStyleUrl();
        const pmtilesUrl = getBasemapPmtilesUrl();
        const maptilerKey = getMapTilerApiKey();
        const style: any = styleUrl
          ? styleUrl
          : pmtilesUrl
          ? {
              version: 8,
              glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
              sources: {
                protomaps: { type: "vector", url: `pmtiles://${pmtilesUrl}` },
              },
              layers: [
                { id: "land", type: "fill", source: "protomaps", "source-layer": "landuse", paint: { "fill-color": "#0b0b0b" } },
                { id: "water", type: "fill", source: "protomaps", "source-layer": "water", paint: { "fill-color": "#0a1a2a" } },
                { id: "roads", type: "line", source: "protomaps", "source-layer": "roads", paint: { "line-color": "#7f8c8d", "line-width": 1 } },
                { id: "boundaries", type: "line", source: "protomaps", "source-layer": "boundaries", paint: { "line-color": "#4b5563", "line-width": 0.5 } },
                { id: "places", type: "symbol", source: "protomaps", "source-layer": "places", layout: { "text-field": ["get", "name"], "text-size": 12 }, paint: { "text-color": "#d1d5db" } },
              ],
            }
          : maptilerKey
          ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`
          : "https://demotiles.maplibre.org/style.json";

        const map = new maplibregl.Map({
          container: mapRef.current,
          style,
          center: defaultCenter,
          zoom: 12,
        });
        mapboxInstanceRef.current = map;
        try {
          map.on('load', () => {
            try {
              map.on('click', async (e: any) => {
                try {
                  const lng = e?.lngLat?.lng;
                  const lat = e?.lngLat?.lat;
                  if (typeof lat !== 'number' || typeof lng !== 'number') return;
                  const data = await reverseGeocode(lat, lng, 'nominatim');
                  const best = (data as any)?.results?.[0];
                  const address: string = best?.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                  try { fallbackSelectionMarkerRef.current?.remove?.(); } catch {}
                  try {
                    fallbackSelectionMarkerRef.current = new (maplibregl as any).Marker({ color: '#00d1ff' })
                      .setLngLat([lng, lat])
                      .addTo(map);
                  } catch {}
                  try {
                    const detail = { lat, lng, address, provider: (data as any)?.provider, placeId: best?.place_id };
                    window.dispatchEvent(new CustomEvent('map-location-selected', { detail }));
                    try { localStorage.setItem('aos_last_selected_location', JSON.stringify(detail)); } catch {}
                  } catch {}
                  toast({ title: 'Location selected', description: address });
                } catch (err) {
                  logger.warn('MapLibre click reverse geocode failed', { error: err });
                }
              });
            } catch {}
          });
        } catch {}
      } catch (e) {
        logger.warn("Failed to initialize MapLibre", { error: e });
        setMapsUnavailable(true);
      }
    };

    const initializeLeaflet = async () => {
      setUsingMapbox(true);
      setMapsUnavailable(false);
      if (!mapRef.current || mapboxInstanceRef.current) return;
      try {
        const map = L.map(mapRef.current).setView([36.6904, -80.2715], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);
        mapboxInstanceRef.current = map;
        try {
          map.on('click', async (e: any) => {
            try {
              const lat = e?.latlng?.lat;
              const lng = e?.latlng?.lng;
              if (typeof lat !== 'number' || typeof lng !== 'number') return;
              const data = await reverseGeocode(lat, lng, 'nominatim');
              const best = (data as any)?.results?.[0];
              const address: string = best?.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
              try { if (fallbackSelectionMarkerRef.current) { (map as any).removeLayer(fallbackSelectionMarkerRef.current); } } catch {}
              try {
                fallbackSelectionMarkerRef.current = L.marker([lat, lng], { title: address }).addTo(map as any);
              } catch {}
              try {
                const detail = { lat, lng, address, provider: (data as any)?.provider, placeId: best?.place_id };
                window.dispatchEvent(new CustomEvent('map-location-selected', { detail }));
                try { localStorage.setItem('aos_last_selected_location', JSON.stringify(detail)); } catch {}
              } catch {}
              toast({ title: 'Location selected', description: address });
            } catch (err) {
              logger.warn('Leaflet click reverse geocode failed', { error: err });
            }
          });
        } catch {}
      } catch (e) {
        logger.warn("Failed to initialize Leaflet", { error: e });
        setMapsUnavailable(true);
      }
    };

    if (forceMapLibre) {
      initializeMapLibre();

      return () => {
        if (mapboxInstanceRef.current) {
          try { mapboxInstanceRef.current.remove(); } catch {}
          mapboxInstanceRef.current = null;
        }
      };
    }

    if (forceLeaflet) {
      initializeLeaflet();

      return () => {
        if (mapboxInstanceRef.current) {
          try { mapboxInstanceRef.current.remove(); } catch {}
          mapboxInstanceRef.current = null;
        }
      };
    }

    if (forceMapbox || (preference !== "google" && noGoogleKey)) {
      initializeMapboxFallback();

      return () => {
        if (mapboxInstanceRef.current) {
          mapboxInstanceRef.current.remove();
          mapboxInstanceRef.current = null;
        }
      };
    }

    setUsingMapbox(false);
    setMapsUnavailable(false);

    const beginLoadGoogleMaps = () => {
      // Catch Google Maps auth failures (bad key, referer, billing, etc.)
      try {
        (window as any).gm_authFailure = () => {
          logger.warn("Google Maps authentication failed. Falling back to Mapbox.");
          toast({
            title: "Google Maps authentication failed",
            description:
              "Using Mapbox fallback. Ensure billing is enabled and the key allows this domain.",
            variant: "destructive",
          });
          initializeMapboxFallback();
        };
      } catch {}
      
      if (!currentGoogleKey) {
        initializeMapboxFallback();
        return;
      }

      loadGoogleMaps(["places", "drawing", "geometry"])
        .then(() => {
          // If preference forces Mapbox, skip Google even if loaded
          if (forceMapbox) {
            initializeMapboxFallback();
            return;
          }
          initMap();
        })
        .catch((err) => {
          const errorMsg = err?.message || String(err);
          logger.warn("Google Maps failed to load. Falling back to Mapbox.", { error: errorMsg });
          
          // Show appropriate error message to user
          if (errorMsg.includes("ExpiredKeyMapError") || errorMsg.includes("expired")) {
            toast({
              title: "Google Maps API Key Expired",
              description: "Falling back to Mapbox. Update your Google Maps API key in settings for full features.",
              variant: "destructive",
            });
          } else if (errorMsg.includes("Missing")) {
            toast({
              title: "Google Maps Not Configured",
              description: "Using Mapbox as the map provider. Configure Google Maps in settings for advanced features.",
            });
          }
          
          initializeMapboxFallback();
        });
    };

    const initMap = () => {
      if (mapRef.current && !mapInstanceRef.current) {
        // Verify Google Maps API is fully loaded
        if (!window.google?.maps?.Map) {
          logger.error("Google Maps API not fully loaded");
          initializeMapboxFallback();
          return;
        }

        const defaultCenter = { lat: 36.6904, lng: -80.2715 };

        try {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
            zoom: 12,
            mapTypeId: "hybrid",
            styles: mapTheme === "division" ? divisionMapStyle : animusMapStyle,
            disableDefaultUI: true,
            zoomControl: true,
            scrollwheel: true,
            gestureHandling: "greedy",
          });

          // Set zoom control position after map creation, guarded for enum availability
          try {
            const cp = (window as any).google?.maps?.ControlPosition;
            if (cp && mapInstanceRef.current) {
              mapInstanceRef.current.setOptions({
                zoomControlOptions: { position: cp.RIGHT_CENTER },
              });
            }
          } catch (err) {
            logger.warn("Failed to set zoom control position", { error: err });
          }

          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const userLocation = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                mapInstanceRef.current?.setCenter(userLocation);
                mapInstanceRef.current?.setZoom(15);
              },
              () => {},
            );
          }

          trafficLayerRef.current = new google.maps.TrafficLayer();

          // Map click handler: reverse geocode -> drop marker -> broadcast event
          try {
            mapInstanceRef.current.addListener("click", async (e: google.maps.MapMouseEvent) => {
              try {
                const lat = e.latLng?.lat();
                const lng = e.latLng?.lng();
                if (typeof lat !== "number" || typeof lng !== "number") return;

                // Reverse geocode via Supabase edge function (google/nominatim)
                const data = await reverseGeocode(lat, lng);
                const best = (data as any)?.results?.[0];
                const address: string = best?.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

                // Drop or move selection marker
                if (selectionMarkerRef.current) selectionMarkerRef.current.setMap(null);
                selectionMarkerRef.current = new google.maps.Marker({
                  position: { lat, lng },
                  map: mapInstanceRef.current!,
                  title: address,
                  animation: google.maps.Animation.DROP,
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#00d1ff",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 2,
                  },
                });

                // Broadcast to the app so forms can auto-fill
                try {
                  const detail = { lat, lng, address, provider: (data as any)?.provider, placeId: best?.place_id };
                  window.dispatchEvent(new CustomEvent("map-location-selected", { detail }));
                  try { localStorage.setItem('aos_last_selected_location', JSON.stringify(detail)); } catch {}
                } catch {}

                toast({ title: "Location selected", description: address });
              } catch (err) {
                logger.warn("Map click reverse geocode failed", { error: err });
              }
            });
          } catch {}

          // Listen for map changes to update context state
          try {
            mapInstanceRef.current.addListener("idle", () => {
              if (mapInstanceRef.current) {
                const center = mapInstanceRef.current.getCenter();
                const zoom = mapInstanceRef.current.getZoom();
                if (center && typeof zoom === 'number') {
                  setMapCenter({ lat: center.lat(), lng: center.lng() });
                  setMapZoom(zoom);
                  
                  // Emit state change event for other components
                  window.dispatchEvent(new CustomEvent('map-state-change', {
                    detail: {
                      lat: center.lat(),
                      lng: center.lng(),
                      zoom: zoom
                    }
                  }));
                }
              }
            });
          } catch (err) {
            logger.warn("Failed to add map idle listener", { error: err });
          }

          // Detect unauthorized/dev-only overlay and auto-fallback to Mapbox
          setTimeout(() => {
            const container = mapRef.current;
            if (!container) return;
            const text = (container.textContent || "").toLowerCase();
            if (text.includes("for development purposes only") || text.includes("own this website")) {
              logger.warn("Google Maps shows dev-only overlay. Switching to Mapbox.");
              toast({
                title: "Google Maps not authorized",
                description: "Switching to Mapbox fallback for a functional preview.",
                variant: "destructive",
              });
              try {
                mapInstanceRef.current = null;
                container.innerHTML = "";
              } catch {}
              initializeMapboxFallback();
            }
          }, 1200);
        } catch (err) {
          logger.error("Failed to initialize Google Maps", { error: err });
          toast({
            title: "Map Initialization Failed",
            description: "Falling back to Mapbox.",
            variant: "destructive",
          });
          initializeMapboxFallback();
        }
      }
    };

    if (forceGoogle || (!forceMapbox && !noGoogleKey)) {
      beginLoadGoogleMaps();
    } else {
      initializeMapboxFallback();
    }

    return () => {
      if (mapInstanceRef.current) {
        // No explicit remove for Google Maps; allow GC
      }
    };
  }, [mapTheme, configVersion]);

  // Toggle Mapbox parcels layer visibility on state change
  useEffect(() => {
    if (!usingMapbox) return;
    const map = mapboxInstanceRef.current;
    if (!map) return;
    try {
      const hasSource = !!map.getSource('parcels-source');
      const template = getParcelsTilesTemplate();
      if (!hasSource && template) {
        map.addSource('parcels-source', { type: 'raster', tiles: [template], tileSize: 256 } as any);
      }
      const hasLayer = !!map.getLayer('parcels-layer');
      if (!hasLayer && map.getSource('parcels-source')) {
        map.addLayer({ id: 'parcels-layer', type: 'raster', source: 'parcels-source', paint: { 'raster-opacity': 0.7 } } as any);
      }
      if (map.getLayer('parcels-layer')) {
        map.setLayoutProperty('parcels-layer', 'visibility', showParcels ? 'visible' : 'none');
      }
    } catch (e) {
      logger.warn('Failed to toggle parcels layer', { error: e });
    }
  }, [showParcels, usingMapbox]);

  // Apply theme class to body for CSS variables
  useEffect(() => {
    const classes = [
      "theme-division",
      "theme-animus",
      "theme-division-shd",
      "theme-division-shd-faithful",
      "theme-dark-zone",
      "theme-dark-zone-faithful",
      "theme-black-tusk",
      "theme-black-tusk-faithful",
      "theme-night-ops",
      "theme-isac-core",
      "theme-rogue-agent",
      "theme-contaminated",
    ];
    document.body.classList.remove(...classes);
    // Base map style remains Division or Animus; body class controls UI tokens
    document.body.classList.add(mapTheme === "division" ? "theme-division" : "theme-animus");
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setOptions({
        styles: mapTheme === "division" ? divisionMapStyle : animusMapStyle,
      });
    }
  }, [mapTheme]);

  // Add job site markers (Google Maps only) with clustering
  useEffect(() => {
    if (!mapInstanceRef.current || !jobSites || usingMapbox) return;

    // Clear previous clusterer and markers
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    jobSites.forEach((site) => {
      if (!site.latitude || !site.longitude) return;

      const marker = new google.maps.Marker({
        position: { lat: site.latitude, lng: site.longitude },
        map: mapInstanceRef.current,
        title: site.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: site.status === "In Progress" ? "#ff8c00" : "#00aaff",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #0a0a0a; font-family: 'Orbitron', sans-serif;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${site.name}</h3>
            <p style="margin: 4px 0;"><strong>Status:</strong> ${site.status}</p>
            <p style="margin: 4px 0;"><strong>Progress:</strong> ${site.progress}%</p>
            ${site.client_name ? `<p style="margin: 4px 0;"><strong>Client:</strong> ${site.client_name}</p>` : ""}
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Create clusterer
    if (markersRef.current.length > 0) {
      clustererRef.current = new MarkerClusterer({
        markers: markersRef.current,
        map: mapInstanceRef.current,
      });
    }
  }, [jobSites]);

  // Add job site markers for Mapbox/MapLibre/Leaflet fallbacks
  useEffect(() => {
    if (!usingMapbox || !jobSites) return;
    const gl: any = mapboxInstanceRef.current;
    if (!gl) return;

    // Clear previous markers/overlays
    try { mapboxJobMarkersRef.current.forEach((m) => m?.remove?.()); } catch {}
    mapboxJobMarkersRef.current = [];
    try { if (leafletJobLayerRef.current) { gl.removeLayer(leafletJobLayerRef.current); leafletJobLayerRef.current = null; } } catch {}

    // Mapbox/MapLibre path
    if (gl && typeof gl.getStyle === 'function') {
      jobSites.forEach((site) => {
        if (!site.latitude || !site.longitude) return;
        const color = site.status === 'In Progress' ? '#ff8c00' : '#00aaff';
        let marker: any = null;
        try {
          marker = new (mapboxgl as any).Marker({ color }).setLngLat([site.longitude, site.latitude]).addTo(gl);
        } catch {
          try { marker = new (maplibregl as any).Marker({ color }).setLngLat([site.longitude, site.latitude]).addTo(gl); } catch {}
        }
        if (marker) mapboxJobMarkersRef.current.push(marker);
      });
      return;
    }

    // Leaflet path
    if (gl && typeof gl.addLayer === 'function' && typeof gl.eachLayer === 'function') {
      const group = L.layerGroup();
      jobSites.forEach((site) => {
        if (!site.latitude || !site.longitude) return;
        L.circleMarker([site.latitude, site.longitude], { radius: 6, color: '#ffffff', weight: 2, fillColor: '#00aaff', fillOpacity: 1 }).addTo(group);
      });
      group.addTo(gl);
      leafletJobLayerRef.current = group;
    }
  }, [jobSites, usingMapbox]);

  // Display saved measurements on map (Google Maps only)
  useEffect(() => {
    if (!mapInstanceRef.current || !measurements || usingMapbox) return;

    // Clear existing measurement overlays
    savedMeasurementsRef.current.forEach((overlay) => overlay.setMap(null));
    savedMeasurementsRef.current = [];

    // Render each saved measurement
    measurements.forEach((m) => {
      if (!m.geojson || !m.geojson.coordinates) return;

      const coords = m.geojson.coordinates;

      if (m.type === "distance" && Array.isArray(coords)) {
        const path = coords.map((c: number[]) => ({ lat: c[1], lng: c[0] }));
        const polyline = new google.maps.Polyline({
          path,
          strokeColor: "#00ff00",
          strokeOpacity: 0.7,
          strokeWeight: 3,
          map: mapInstanceRef.current,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="color: #0a0a0a;"><strong>Distance:</strong> ${m.value.toFixed(2)}m</div>`,
        });

        polyline.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            infoWindow.setPosition(e.latLng);
            infoWindow.open(mapInstanceRef.current);
          }
        });

        savedMeasurementsRef.current.push(polyline);
      } else if (m.type === "area") {
        // Render area measurements as polygons or circles
        const circle = new google.maps.Circle({
          center: { lat: coords[1], lng: coords[0] },
          radius: Math.sqrt(m.value / Math.PI),
          strokeColor: "#0088ff",
          strokeOpacity: 0.7,
          strokeWeight: 2,
          fillColor: "#0088ff",
          fillOpacity: 0.2,
          map: mapInstanceRef.current,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="color: #0a0a0a;"><strong>Area:</strong> ${m.value.toFixed(2)}m²</div>`,
          position: { lat: coords[1], lng: coords[0] },
        });

        circle.addListener("click", () => {
          infoWindow.open(mapInstanceRef.current);
        });

        // Track for later cleanup alongside polylines
        savedMeasurementsRef.current.push(circle);
      }
    });
  }, [measurements]);

  // Display saved measurements on Mapbox/MapLibre/Leaflet fallbacks
  useEffect(() => {
    if (!usingMapbox || !measurements) return;
    const gl: any = mapboxInstanceRef.current;
    if (!gl) return;

    // Mapbox GL / MapLibre path
    if (gl && typeof gl.getStyle === 'function' && typeof gl.addSource === 'function') {
      const featureCollection: any = { type: 'FeatureCollection', features: [] as any[] };
      measurements.forEach((m) => {
        if (!m.geojson) return;
        if (m.type === 'distance' && Array.isArray(m.geojson.coordinates)) {
          featureCollection.features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: m.geojson.coordinates }, properties: { id: m.id } });
        } else if (m.type === 'area' && Array.isArray(m.geojson.coordinates)) {
          featureCollection.features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: m.geojson.coordinates }, properties: { id: m.id } });
        }
      });
      const ensure = () => {
        try {
          const src = gl.getSource('measurements-source');
          if (src) {
            (src as any).setData(featureCollection);
          } else {
            gl.addSource('measurements-source', { type: 'geojson', data: featureCollection });
            if (!gl.getLayer('measurements-line')) {
              gl.addLayer({ id: 'measurements-line', type: 'line', source: 'measurements-source', filter: ['==', ['geometry-type'], 'LineString'], paint: { 'line-color': '#00ff00', 'line-width': 3, 'line-opacity': 0.7 } } as any);
            }
            if (!gl.getLayer('measurements-points')) {
              gl.addLayer({ id: 'measurements-points', type: 'circle', source: 'measurements-source', filter: ['==', ['geometry-type'], 'Point'], paint: { 'circle-color': '#0088ff', 'circle-radius': 6, 'circle-opacity': 0.6 } } as any);
            }
          }
        } catch (e) {
          // Style may not be ready
        }
      };
      if (typeof gl.isStyleLoaded === 'function' && !gl.isStyleLoaded()) {
        gl.once?.('load', ensure);
      } else {
        ensure();
      }
      return;
    }

    // Leaflet path
    if (gl && typeof gl.addLayer === 'function' && typeof gl.eachLayer === 'function') {
      try {
        if (leafletMeasurementsLayerRef.current) {
          gl.removeLayer(leafletMeasurementsLayerRef.current);
          leafletMeasurementsLayerRef.current = null;
        }
      } catch {}
      const group = L.layerGroup();
      measurements.forEach((m) => {
        if (!m.geojson) return;
        if (m.type === 'distance' && Array.isArray(m.geojson.coordinates)) {
          const path: [number, number][] = (m.geojson.coordinates as number[][]).map((c) => [c[1], c[0]] as [number, number]);
          L.polyline(path, { color: '#00ff00', weight: 3, opacity: 0.7 }).addTo(group);
        } else if (m.type === 'area' && Array.isArray(m.geojson.coordinates)) {
          const center = [m.geojson.coordinates[1], m.geojson.coordinates[0]] as [number, number];
          L.circle(center, { radius: Math.sqrt(m.value / Math.PI), color: '#0088ff', opacity: 0.7, weight: 2, fillOpacity: 0.2 }).addTo(group);
        }
      });
      group.addTo(gl);
      leafletMeasurementsLayerRef.current = group;
    }
  }, [measurements, usingMapbox]);

  // Handle Parcels overlay for Google Maps
  useEffect(() => {
    if (!mapInstanceRef.current || usingMapbox) return;
    const template = getParcelsTilesTemplate();
    if (!showParcels) {
      try {
        if (parcelsImageMapTypeRef.current) {
          const idx = mapInstanceRef.current.overlayMapTypes.getArray().indexOf(parcelsImageMapTypeRef.current as any);
          if (idx >= 0) mapInstanceRef.current.overlayMapTypes.removeAt(idx);
          parcelsImageMapTypeRef.current = null;
        }
      } catch {}
      return;
    }

    if (!template) {
      toast({ title: "Parcels not configured", description: "Set VITE_PARCELS_TILES_TEMPLATE or Settings → providers.parcelsTilesTemplate.", variant: "destructive" });
      setShowParcels(false);
      return;
    }

    try {
      const imageMapType = new google.maps.ImageMapType({
        getTileUrl: (coord, zoom) => {
          return template
            .replace('{z}', String(zoom))
            .replace('{x}', String(coord.x))
            .replace('{y}', String(coord.y));
        },
        tileSize: new google.maps.Size(256, 256),
        name: 'Parcels',
        opacity: 0.7,
        isPng: true,
        maxZoom: 22,
        minZoom: 0,
      } as any);
      parcelsImageMapTypeRef.current = imageMapType;
      mapInstanceRef.current.overlayMapTypes.insertAt(0, imageMapType);
    } catch (err) {
      logger.warn('Failed to add parcels overlay', { error: err });
      toast({ title: 'Parcels overlay failed', description: 'Could not add overlay', variant: 'destructive' });
      setShowParcels(false);
    }
    return () => {
      try {
        if (mapInstanceRef.current && parcelsImageMapTypeRef.current) {
          const idx = mapInstanceRef.current.overlayMapTypes.getArray().indexOf(parcelsImageMapTypeRef.current as any);
          if (idx >= 0) mapInstanceRef.current.overlayMapTypes.removeAt(idx);
        }
        parcelsImageMapTypeRef.current = null;
      } catch {}
    };
  }, [showParcels, usingMapbox]);

  // AI detection overlay: highlight asphalt area and display area label
  useEffect(() => {
    if (!mapInstanceRef.current || usingMapbox) return;
    const handler = (e: any) => {
      try {
        const detail = e?.detail || {};
        const areaSqFt = Number(detail.areaSqFt || 0);
        if (!areaSqFt || areaSqFt <= 0) return;

        // Clear previous overlay
        if (aiOverlayRef.current) {
          aiOverlayRef.current.setMap(null);
          aiOverlayRef.current = null;
        }

        // Convert sqft to m², then compute equivalent radius in meters
        const areaSqM = areaSqFt * 0.092903;
        const radiusMeters = Math.sqrt(areaSqM / Math.PI);

        const center = mapInstanceRef.current.getCenter?.();
        if (!center) return;

        const circle = new google.maps.Circle({
          center,
          radius: radiusMeters,
          strokeColor: "#00D1FF",
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: "#00D1FF",
          fillOpacity: 0.18,
          map: mapInstanceRef.current,
        });

        const info = new google.maps.InfoWindow({
          content: `<div style="color:#0a0a0a"><strong>Asphalt Area:</strong> ${Math.round(areaSqFt).toLocaleString()} ft²</div>`,
          position: center,
        });
        circle.addListener("click", () => {
          info.setPosition(center);
          info.open(mapInstanceRef.current!);
        });
        info.setPosition(center);
        info.open(mapInstanceRef.current!);

        aiOverlayRef.current = circle;
      } catch (err) {
        logger.warn("Failed to render AI overlay", { error: err });
      }
    };
    window.addEventListener("ai-detection-overlay", handler as any);
    return () => window.removeEventListener("ai-detection-overlay", handler as any);
  }, [usingMapbox]);

  return (
    <MapContext.Provider
      value={{
        map: mapInstanceRef.current,
        setMap: (map) => {
          mapInstanceRef.current = map;
        },
        center: mapCenter,
        setCenter: setMapCenter,
        zoom: mapZoom,
        setZoom: setMapZoom,
      }}
    >
      {/* Map Effects */}
      <Suspense fallback={null}>
      <MapEffectsLazy
        showRadar={uiSettings.radarEffect}
        showGlitch={uiSettings.glitchEffect}
        showScanline={uiSettings.scanlineEffect}
        radarSpeed={uiSettings.radarSpeed}
        glitchIntensity={Math.max(0.03, Math.min(0.9, (uiSettings.glitchIntensity || 0) / 100))}
        accentColor={
          mapTheme === "division" ? "rgba(255, 140, 0, 0.12)" : "rgba(0, 200, 200, 0.12)"
        }
        showGridOverlay={uiSettings.gridOverlay}
        glitchClickPreset={uiSettings.glitchClickPreset}
        vignetteEffect={uiSettings.vignetteEffect}
        radarType={uiSettings.radarType}
        radarAudioEnabled={uiSettings.radarAudioEnabled}
        radarAudioVolume={uiSettings.radarAudioVolume}
        masterVolumePercent={uiSettings.soundVolume}
        lowPowerMode={uiSettings.lowPowerMode}
        reduceMotion={uiSettings.reduceMotion}
        useCanvasFX={uiSettings.useCanvasFX}
      />
      </Suspense>
      <PulseScanOverlay enabled={showPulseScan} color={mapTheme === 'division' ? 'rgba(0,255,255,0.16)' : 'rgba(255,140,0,0.16)'} speed={4} />

      {/* HUD overlay elements - Remove duplicates, handled by Index.tsx */}
      {/* MiniMap overlay removed; now embedded in sidebar */}
      {/* Radial Menu (hold 'Q') */}
      <RadialMenu onSelect={(mode) => handleModeChange(mode)} />

      <MeasurementDisplay distance={measurement.distance} area={measurement.area} />
      <MapVisibilityControls />
      {!usingMapbox && showEmployeeTracking && (
        <EmployeeTrackingLayer map={mapInstanceRef.current} />
      )}
      {!usingMapbox && showWeatherRadar && (
        <>
          <RainRadarOverlay map={mapInstanceRef.current} opacity={radarOpacity} />
          <WeatherRadarLayer
            map={mapInstanceRef.current}
            opacity={radarOpacity}
            showAlerts={true}
            alertRadius={alertRadius}
          />
        </>
      )}
      {!usingMapbox && (
        <AsphaltDetectionsLayer map={mapInstanceRef.current} />
      )}
      {/* Imagery toggle indicator (functional layers to be added in a dedicated overlay component) */}
      {imagery !== "none" && (
        <div className="absolute right-4 bottom-4 z-[500]">
          <div className="tactical-panel text-xs">Imagery: {imagery.toUpperCase()}</div>
        </div>
      )}

      {!usingMapbox && showSuitability && (
        <SuitabilityOverlay
          map={mapInstanceRef.current}
          enabled={true}
          tempF={weather.data?.current?.temp ?? 72}
          humidity={weather.data?.current?.humidity ?? 45}
          precipChance={weather.data?.precipChance ?? 10}
          thresholds={uiSettings.suitabilityThresholds}
        />
      )}

      {!usingMapbox && showHeatmap && (
        <HeatmapOverlay map={mapInstanceRef.current} enabled={true} points={heatmapPoints} />
      )}

      {showPulseScan && uiSettings.ringControls && (
        <div className="absolute inset-0 pointer-events-none z-[120]">
          <RingSliders
            opacityValue={radarOpacity}
            intensityValue={uiSettings.glitchIntensity}
            onChangeOpacity={(v) => {
              setRadarOpacity(v);
              try { const raw = localStorage.getItem('aos_settings'); const p = raw ? JSON.parse(raw) : {}; localStorage.setItem('aos_settings', JSON.stringify({ ...p, radarOpacity: v })); } catch {}
            }}
            onChangeIntensity={(v) => {
              setUiSettings((prev) => ({ ...prev, glitchIntensity: v }));
              try { const raw = localStorage.getItem('aos_settings'); const p = raw ? JSON.parse(raw) : {}; localStorage.setItem('aos_settings', JSON.stringify({ ...p, glitchIntensity: v })); } catch {}
            }}
          />
        </div>
      )}
      {!usingMapbox && showDarkZones && (
        <DarkZoneLayer
          map={mapInstanceRef.current}
          onEnterZone={() => {
            try {
              // subtle vibration on supported devices
              (navigator as any).vibrate?.(50);
            } catch {}
          }}
        />
      )}
      <div
        ref={mapRef}
        className="absolute inset-0 w-full h-full map-container"
        style={{
          filter: mapTheme === "division" ? "brightness(0.7) contrast(1.3)" : "brightness(1.05) contrast(1.05)",
        }}
      />
      {usingMapbox && (
        <div className="absolute left-4 bottom-24 z-[var(--z-corners)] pointer-events-none">
          <div className="hud-element px-3 py-1.5 text-xs text-muted-foreground border-l-2 border-accent/60">
            Mapbox Mode • Limited Features
          </div>
        </div>
      )}
      {showDarkZoneEditor && (
        <DarkZoneEditor
          map={mapInstanceRef.current}
          onClose={() => setShowDarkZoneEditor(false)}
        />
      )}
      {mapsUnavailable && (
        <div className="absolute left-4 bottom-24 z-[var(--z-corners)]">
          <div className="hud-element px-3 py-2 max-w-sm border-l-2 border-destructive/60">
            <div className="text-xs font-semibold text-destructive mb-1">No API Key</div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Configure Google Maps in Settings to enable full functionality
            </p>
          </div>
        </div>
      )}
      {showAIDetection && (
        <Suspense fallback={null}>
          <AIAsphaltDetectionModalLazy
            isOpen={showAIDetection}
            onClose={() => setShowAIDetection(false)}
          />
        </Suspense>
      )}
    </MapContext.Provider>
  );
});
