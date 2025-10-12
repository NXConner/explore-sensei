import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWeatherAlertLocations } from "@/hooks/useWeatherAlertLocations";

export const WeatherAlertLocationsManager: React.FC = () => {
  const { locations, addLocation, removeLocation } = useWeatherAlertLocations();
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const handleAdd = () => {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!name || isNaN(latNum) || isNaN(lngNum)) return;
    addLocation({ name, lat: latNum, lng: lngNum });
    setName("");
    setLat("");
    setLng("");
  };

  return (
    <div className="tactical-panel p-4 space-y-3">
      <div className="mb-2"><Label className="text-xs">Custom Alert Locations</Label></div>
      <div className="grid grid-cols-3 gap-2">
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
        <Input placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={handleAdd}>Add</Button>
      </div>
      <div className="space-y-2">
        {locations.map((l) => (
          <div key={l.id} className="flex items-center justify-between text-sm border border-primary/20 rounded px-2 py-1">
            <div>
              <div className="font-medium">{l.name}</div>
              <div className="text-xs text-muted-foreground">{l.lat.toFixed(4)}, {l.lng.toFixed(4)}</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => removeLocation(l.id)}>Remove</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
