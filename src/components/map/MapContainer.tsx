/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, createContext, useContext, useState } from "react";
import { useJobSites } from "@/hooks/useJobSites";
import { MeasurementDisplay } from "./MeasurementDisplay";
import { MapToolbar } from "./MapToolbar";
import { useMapDrawing, DrawingMode } from "@/hooks/useMapDrawing";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMapMeasurements } from "@/hooks/useMapMeasurements";
import { AIAsphaltDetectionModal } from "@/components/ai/AIAsphaltDetectionModal";
import { MapVisibilityControls } from "./MapVisibilityControls";
import { EmployeeTrackingLayer } from "./EmployeeTrackingLayer";
import { MapEffects } from "./MapEffects";
import { divisionMapStyle, animusMapStyle } from "./themes";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { WeatherRadarLayer } from "@/components/weather/WeatherRadarLayer";

const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string;

interface MapContextType {
  map: google.maps.Map | null;
}

const MapContext = createContext<MapContextType>({ map: null });

export const useMap = () => useContext(MapContext);

type MapTheme = 'division' | 'animus';

export const MapContainer = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const savedMeasurementsRef = useRef<google.maps.Polyline[]>([]);
  const streetViewRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [showStreetView, setShowStreetView] = useState(false);
  const [showAIDetection, setShowAIDetection] = useState(false);
  const [showEmployeeTracking, setShowEmployeeTracking] = useState(true);
  const [showWeatherRadar, setShowWeatherRadar] = useState(false);
  const [radarOpacity, setRadarOpacity] = useState(70);
  const [alertRadius, setAlertRadius] = useState(15);
  const [mapTheme, setMapTheme] = useState<MapTheme>('division');
  const [mapsUnavailable, setMapsUnavailable] = useState(false);
  const { data: jobSites } = useJobSites();
  const { measurement, setDrawingMode, clearDrawings } = useMapDrawing(mapInstanceRef.current);
  const [activeMode, setActiveMode] = useState<DrawingMode>(null);
  const { toast } = useToast();
  const { measurements } = useMapMeasurements();

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
        }
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
        geojson: center ? {
          type: "Point",
          coordinates: [center.lng(), center.lat()]
        } : null,
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
    // Graceful fallback if no API key is configured
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "undefined") {
      console.warn("Google Maps API key missing; rendering fallback map.");
      setMapsUnavailable(true);
      return;
    } else {
      setMapsUnavailable(false);
    }

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (mapRef.current && !mapInstanceRef.current) {
        // Patrick County, Virginia coordinates as default
        const defaultCenter = { lat: 36.6904, lng: -80.2715 };
        
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 12,
          mapTypeId: "hybrid",
          styles: mapTheme === 'division' ? divisionMapStyle : animusMapStyle,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
          scrollwheel: true, // Enable mouse wheel zoom
          gestureHandling: "greedy", // Allow scroll wheel zoom without Ctrl
        });

        // Try to get user's location
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
            (error) => {
              console.log("Geolocation error, using default location:", error);
            }
          );
        }

        // Initialize traffic layer
        trafficLayerRef.current = new google.maps.TrafficLayer();
      }
    };

    loadGoogleMaps();
  }, [mapTheme]);

  // Apply theme class to body for CSS variables
  useEffect(() => {
    const clsDivision = 'theme-division';
    const clsAnimus = 'theme-animus';
    document.body.classList.remove(clsDivision, clsAnimus);
    document.body.classList.add(mapTheme === 'division' ? clsDivision : clsAnimus);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setOptions({ styles: mapTheme === 'division' ? divisionMapStyle : animusMapStyle });
    }
  }, [mapTheme]);

  // Add job site markers
  useEffect(() => {
    if (!mapInstanceRef.current || !jobSites) return;

    // Clear existing markers
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
  }, [jobSites]);

  // Display saved measurements on map
  useEffect(() => {
    if (!mapInstanceRef.current || !measurements) return;

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
      }
    });
  }, [measurements]);

  return (
    <MapContext.Provider value={{ map: mapInstanceRef.current }}>
      {/* Map Effects */}
      <MapEffects 
        showRadar={true}
        showGlitch={true}
        showScanline={true}
        radarSpeed={3}
        glitchIntensity={mapTheme === 'division' ? 0.3 : 0.15}
        accentColor={mapTheme === 'division' ? 'rgba(255, 140, 0, 0.12)' : 'rgba(0, 200, 200, 0.12)'}
      />

      <MeasurementDisplay distance={measurement.distance} area={measurement.area} />
      <MapToolbar
        onModeChange={handleModeChange}
        onClear={handleClear}
        onSave={handleSave}
        activeMode={activeMode}
        onLocateMe={handleLocateMe}
        onToggleTraffic={handleToggleTraffic}
        showTraffic={trafficLayerRef.current?.getMap() != null}
        onToggleStreetView={handleToggleStreetView}
        onAIDetect={handleAIDetect}
        onToggleEmployeeTracking={() => setShowEmployeeTracking(!showEmployeeTracking)}
        showEmployeeTracking={showEmployeeTracking}
        onToggleWeatherRadar={() => setShowWeatherRadar(!showWeatherRadar)}
        showWeatherRadar={showWeatherRadar}
      />
      <MapVisibilityControls />
      {/* Theme Switcher */}
      <div className="absolute left-4 top-20 z-[1000]">
        <div className="tactical-panel flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <Button size="sm" variant={mapTheme === 'division' ? 'default' : 'outline'} onClick={() => setMapTheme('division')}>Division</Button>
          <Button size="sm" variant={mapTheme === 'animus' ? 'default' : 'outline'} onClick={() => setMapTheme('animus')}>Animus</Button>
        </div>
      </div>
      {showEmployeeTracking && <EmployeeTrackingLayer map={mapInstanceRef.current} />}
      {showWeatherRadar && (
        <WeatherRadarLayer
          map={mapInstanceRef.current}
          opacity={radarOpacity}
          showAlerts={true}
          alertRadius={alertRadius}
        />
      )}
      <div
        ref={mapRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: mapTheme === 'division' ? "brightness(0.8)" : "brightness(1.05) contrast(1.05)" }}
      />
      {mapsUnavailable && (
        <div className="absolute inset-0 flex items-center justify-center z-[500]">
          <div className="tactical-panel max-w-md text-center">
            <h3 className="text-lg font-bold mb-2">Map preview disabled</h3>
            <p className="text-sm text-muted-foreground">No Google Maps API key configured. Add your key to enable live map, or continue using other features.</p>
          </div>
        </div>
      )}
      {showAIDetection && (
        <AIAsphaltDetectionModal 
          isOpen={showAIDetection} 
          onClose={() => setShowAIDetection(false)} 
        />
      )}
    </MapContext.Provider>
  );
};
