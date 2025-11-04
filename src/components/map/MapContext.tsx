import React, { createContext, useContext, useState, useCallback } from "react";

export interface MapContextType {
  map: google.maps.Map | null;
  setMap: (map: google.maps.Map | null) => void;
  center: { lat: number; lng: number };
  setCenter: (center: { lat: number; lng: number }) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
}

const defaultValue: MapContextType = {
  map: null,
  setMap: () => {},
  center: { lat: 0, lng: 0 },
  setCenter: () => {},
  zoom: 15,
  setZoom: () => {},
};

export const MapContext = createContext<MapContextType>(defaultValue);

export const useMap = () => useContext(MapContext);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [map, setMapState] = useState<google.maps.Map | null>(null);
  const [center, setCenterState] = useState({ lat: 0, lng: 0 });
  const [zoom, setZoomState] = useState(15);

  const setMap = useCallback((newMap: google.maps.Map | null) => {
    setMapState(newMap);
  }, []);

  const setCenter = useCallback((newCenter: { lat: number; lng: number }) => {
    setCenterState(newCenter);
  }, []);

  const setZoom = useCallback((newZoom: number) => {
    setZoomState(newZoom);
  }, []);

  return (
    <MapContext.Provider value={{ map, setMap, center, setCenter, zoom, setZoom }}>
      {children}
    </MapContext.Provider>
  );
};
