import { useEffect, useRef } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyBaUoISC-zfsvfJumBuZnstJv9uf4BgWJM";

export const MapContainer = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

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
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: 40.7128, lng: -74.006 },
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
        });
      }
    };

    loadGoogleMaps();
  }, []);

  return (
    <div
      ref={mapRef}
      className="absolute inset-0 w-full h-full"
      style={{ filter: "brightness(0.8)" }}
    />
  );
};
