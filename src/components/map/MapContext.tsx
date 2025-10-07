import React, { createContext, useContext } from "react";

export interface MapContextType {
  map: google.maps.Map | null;
}

const defaultValue: MapContextType = { map: null };

export const MapContext = createContext<MapContextType>(defaultValue);

export const useMap = () => useContext(MapContext);

