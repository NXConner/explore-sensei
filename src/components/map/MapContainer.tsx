/// <reference types="google.maps" />
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, lazy, Suspense } from "react";
import mapboxgl from "mapbox-gl";
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
import { MapEffects } from "./MapEffects";
import { divisionMapStyle, animusMapStyle } from "./themes";
import { WeatherRadarLayer } from "@/components/weather/WeatherRadarLayer";
import { RainRadarOverlay } from "@/components/weather/RainRadarOverlay";
import { MapContext } from "./MapContext";
import { getGoogleMapsApiKey, getMapboxAccessToken, getPreferredMapProvider } from "@/config/env";
import { geocodeAddress, getDirections } from "@/lib/mapsClient";
import { CornerBrackets } from "@/components/hud/CornerBrackets";
import { CompassRose } from "@/components/hud/CompassRose";
import { CoordinateDisplay } from "@/components/hud/CoordinateDisplay";
import { ScaleBar } from "@/components/hud/ScaleBar";
import { ZoomIndicator } from "@/components/hud/ZoomIndicator";
// import { MiniMap } from "@/components/hud/MiniMap";

// API keys are read dynamically to allow runtime updates via Settings

type MapTheme = "division" | "animus";

export interface MapContainerRef {
  handleLocateMe: () => void;
  handleToggleTraffic: () => void;
  handleToggleStreetView: () => void;
  toggleEmployeeTracking: () => void;
  toggleWeatherRadar: () => void;
  handleModeChange: (mode: DrawingMode) => void;
  handleClear: () => void;
  handleSave: () => void;
  getShowTraffic: () => boolean;
  getShowEmployeeTracking: () => boolean;
  getShowWeatherRadar: () => boolean;
  getActiveMode: () => DrawingMode;
}

export const MapContainer = forwardRef<
  MapContainerRef,
  { initialMapTheme?: "division" | "animus" }
>((props, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const mapboxInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const savedMeasurementsRef = useRef<Array<google.maps.Polyline | google.maps.Circle>>([]);
  const aiOverlayRef = useRef<google.maps.Circle | null>(null);
  const streetViewRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const searchMarkerRef = useRef<google.maps.Marker | null>(null);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const [showStreetView, setShowStreetView] = useState(false);
  const [showAIDetection, setShowAIDetection] = useState(false);
  const [showEmployeeTracking, setShowEmployeeTracking] = useState(false);
  const [showWeatherRadar, setShowWeatherRadar] = useState(false);
  const [radarOpacity, setRadarOpacity] = useState(70);
  const [alertRadius, setAlertRadius] = useState(15);
  const [mapTheme, setMapTheme] = useState<MapTheme>(props.initialMapTheme || "division");
  const [mapsUnavailable, setMapsUnavailable] = useState(false);
  const [usingMapbox, setUsingMapbox] = useState(false);
  const [configVersion, setConfigVersion] = useState(0);
  const { data: jobSites } = useJobSites();
  const { measurement, setDrawingMode, clearDrawings } = useMapDrawing(mapInstanceRef.current);
  const [activeMode, setActiveMode] = useState<DrawingMode>(null);
  const { toast } = useToast();
  const { measurements } = useMapMeasurements();

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleLocateMe,
    handleToggleTraffic,
    handleToggleStreetView,
    toggleEmployeeTracking: () => setShowEmployeeTracking(!showEmployeeTracking),
    toggleWeatherRadar: () => setShowWeatherRadar(!showWeatherRadar),
    handleModeChange,
    handleClear,
    handleSave,
    getShowTraffic: () => trafficLayerRef.current?.getMap() != null,
    getShowEmployeeTracking: () => showEmployeeTracking,
    getShowWeatherRadar: () => showWeatherRadar,
    getActiveMode: () => activeMode,
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
          console.error("Geolocation error:", error);
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
        }));
        if (parsed.mapTheme && (parsed.mapTheme === "division" || parsed.mapTheme === "animus")) {
          setMapTheme(parsed.mapTheme);
        }
        if (parsed.apiKeys) setConfigVersion((v) => v + 1);
      } catch (err) {
        console.warn("Failed to read UI settings:", err);
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

  const handleModeChange = (mode: DrawingMode) => {
    setActiveMode(mode);
    setDrawingMode(mode);
  };

  const handleClear = () => {
    clearDrawings();
    setActiveMode(null);
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
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: mapInstanceRef.current,
      });

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
      const { error } = await supabase.from("Mapmeasurements").insert({
        type: measurement.distance ? "distance" : "area",
        value: measurement.distance || measurement.area,
        unit: measurement.distance ? "meters" : "square_meters",
        geojson: center
          ? {
              type: "Point",
              coordinates: [center.lng(), center.lat()],
            }
          : null,
      });

      if (error) throw error;

      toast({
        title: "Measurement Saved",
        description: "Your measurement has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving measurement:", error);
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
        console.warn("Failed to initialize Mapbox:", e);
        setMapsUnavailable(true);
      }
    };

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
          console.warn("Google Maps authentication failed. Falling back to Mapbox.");
          toast({
            title: "Google Maps authentication failed",
            description:
              "Using Mapbox fallback. Ensure billing is enabled and the key allows this domain.",
            variant: "destructive",
          });
          initializeMapboxFallback();
        };
      } catch {}
      if (window.google && window.google.maps) {
        initMap();
        return;
      }
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
          console.warn("Google Maps failed to load. Falling back to Mapbox.", errorMsg);
          
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
        const defaultCenter = { lat: 36.6904, lng: -80.2715 };

        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 12,
          mapTypeId: "hybrid",
          styles: mapTheme === "division" ? divisionMapStyle : animusMapStyle,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
          scrollwheel: true,
          gestureHandling: "greedy",
        });

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

  // Apply theme class to body for CSS variables
  useEffect(() => {
    const clsDivision = "theme-division";
    const clsAnimus = "theme-animus";
    document.body.classList.remove(clsDivision, clsAnimus);
    document.body.classList.add(mapTheme === "division" ? clsDivision : clsAnimus);
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
        console.warn("Failed to render AI overlay", err);
      }
    };
    window.addEventListener("ai-detection-overlay", handler as any);
    return () => window.removeEventListener("ai-detection-overlay", handler as any);
  }, [usingMapbox]);

  return (
    <MapContext.Provider value={{ map: mapInstanceRef.current }}>
      {/* Map Effects */}
      <MapEffects
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
      />

      {/* HUD overlay elements */}
      <CornerBrackets />
      <CompassRose />
      <CoordinateDisplay lat={mapInstanceRef.current?.getCenter?.()?.lat()} lng={mapInstanceRef.current?.getCenter?.()?.lng()} />
      <ScaleBar lat={mapInstanceRef.current?.getCenter?.()?.lat()} zoom={mapInstanceRef.current?.getZoom?.() || 0} />
      <ZoomIndicator zoom={mapInstanceRef.current?.getZoom?.() || 0} />
      {/* Optional */}
      {/* <MiniMap /> */}

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
      <div
        ref={mapRef}
        className="absolute inset-0 w-full h-full map-container"
        style={{
          filter: mapTheme === "division" ? "brightness(0.7) contrast(1.3)" : "brightness(1.05) contrast(1.05)",
        }}
      />
      {usingMapbox && (
        <div className="absolute left-4 bottom-4 z-[500]">
          <div className="tactical-panel max-w-md text-sm">
            Mapbox fallback active. Advanced tools are disabled without Google Maps.
          </div>
        </div>
      )}
      {mapsUnavailable && (
        <div className="absolute inset-0 flex items-center justify-center z-[500]">
          <div className="tactical-panel max-w-md text-center">
            <h3 className="text-lg font-bold mb-2">Map preview disabled</h3>
            <p className="text-sm text-muted-foreground">
              No Google Maps API key configured. Add your key to enable live map, or continue using
              other features.
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
