import { useEffect, useState } from "react";

export interface AlertLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const KEY = "aos_alert_locations";

export function useWeatherAlertLocations() {
  const [locations, setLocations] = useState<AlertLocation[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLocations(JSON.parse(raw));
    } catch {}
  }, []);

  const save = (next: AlertLocation[]) => {
    setLocations(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  const addLocation = (loc: Omit<AlertLocation, "id">) => {
    const next = [...locations, { ...loc, id: crypto.randomUUID() }];
    save(next);
  };

  const removeLocation = (id: string) => {
    save(locations.filter((l) => l.id !== id));
  };

  return { locations, addLocation, removeLocation };
}
