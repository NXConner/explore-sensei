/// <reference types="@types/google.maps" />
import { useState, useCallback } from "react";

export const useAddressSearch = (map: google.maps.Map | null) => {
  const [searchQuery, setSearchQuery] = useState("");

  const flyToAddress = useCallback(
    (address: string) => {
      if (!map || !window.google) return;

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;

          // Smooth fly-to animation
          map.panTo(location);
          setTimeout(() => {
            map.setZoom(18);
          }, 500);

          // Add a marker at the searched location
          new google.maps.Marker({
            map: map,
            position: location,
            animation: google.maps.Animation.DROP,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: "#00ff00",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            },
          });
        }
      });
    },
    [map],
  );

  return {
    searchQuery,
    setSearchQuery,
    flyToAddress,
  };
};
