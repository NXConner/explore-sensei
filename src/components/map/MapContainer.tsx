import React, { useEffect, useRef, createContext, useContext } from "react";
import { useJobSites } from "@/hooks/useJobSites";
import { MeasurementDisplay } from "./MeasurementDisplay";
import { useMapDrawing } from "@/hooks/useMapDrawing";

const GOOGLE_MAPS_API_KEY = "AIzaSyBaUoISC-zfsvfJumBuZnstJv9uf4BgWJM";

interface MapContextType {
  map: google.maps.Map | null;
}

const MapContext = createContext<MapContextType>({ map: null });

export const useMap = () => useContext(MapContext);

export const MapContainer = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const { data: jobSites } = useJobSites();
  const { measurement } = useMapDrawing(mapInstanceRef.current);

  useEffect(() => {
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
          styles: [
            {
              featureType: "all",
              elementType: "all",
              stylers: [{ saturation: -20 }, { lightness: -10 }],
            },
          ],
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
  }, []);

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

  return (
    <MapContext.Provider value={{ map: mapInstanceRef.current }}>
      <MeasurementDisplay distance={measurement.distance} area={measurement.area} />
      <div
        ref={mapRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: "brightness(0.8)" }}
      />
    </MapContext.Provider>
  );
};
