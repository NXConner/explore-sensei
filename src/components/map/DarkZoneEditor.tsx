import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface DarkZoneEditorProps {
  map: google.maps.Map | null;
  onClose: () => void;
}

interface EditableZone {
  id?: string;
  name: string;
  active: boolean;
  path: Array<{ lat: number; lng: number }>; // polygon
}

export const DarkZoneEditor: React.FC<DarkZoneEditorProps> = ({ map, onClose }) => {
  const { isAdmin } = useUserRole();
  const [zones, setZones] = useState<EditableZone[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const drawRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    // Load existing zones (server or local)
    (async () => {
      try {
        const { data, error } = await (supabase as any).from("DarkZones").select("id,name,active,coordinates");
        if (!error && Array.isArray(data)) {
          setZones(
            data.map((z: any) => ({
              id: z.id,
              name: z.name || "Dark Zone",
              active: !!z.active,
              path: ((z.coordinates?.[0] || z.coordinates || []) as any[]).map((p) => ({ lat: Number(p[1]), lng: Number(p[0]) })),
            })),
          );
          return;
        }
      } catch {}
      try {
        const raw = localStorage.getItem("dark_zones");
        if (raw) setZones(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!map) return;
    if (selected == null) return;
    // Render selected polygon for editing
    const zone = zones[selected];
    if (!zone) return;
    if (drawRef.current) {
      try { drawRef.current.setMap(null); } catch {}
      drawRef.current = null;
    }
    drawRef.current = new google.maps.Polygon({
      paths: [zone.path],
      strokeColor: "#ff2a2a",
      strokeOpacity: 0.9,
      strokeWeight: 2,
      fillColor: "#ff2a2a",
      fillOpacity: 0.08,
      editable: isAdmin,
      draggable: isAdmin,
      map,
    });
    return () => { try { drawRef.current?.setMap(null); } catch {} };
  }, [map, selected, zones.length, isAdmin]);

  const saveLocal = (next: EditableZone[]) => {
    try { localStorage.setItem("dark_zones", JSON.stringify(next)); } catch {}
  };

  const saveToServer = async (zone: EditableZone) => {
    const coords = zone.path.map((p) => [p.lng, p.lat]);
    if (zone.id) {
      await (supabase as any).from("DarkZones").update({ name: zone.name, active: zone.active, coordinates: coords }).eq("id", zone.id);
    } else {
      const { data } = await (supabase as any).from("DarkZones").insert({ name: zone.name, active: zone.active, coordinates: coords }).select("id").single();
      zone.id = data?.id;
    }
  };

  const importJson = (text: string) => {
    try {
      const arr = JSON.parse(text);
      if (!Array.isArray(arr)) return;
      const parsed: EditableZone[] = arr.map((z: any) => ({
        id: z.id,
        name: z.name || "Dark Zone",
        active: !!z.active,
        path: (z.path || []).map((p: any) => ({ lat: Number(p.lat), lng: Number(p.lng) })),
      }));
      setZones(parsed);
      saveLocal(parsed);
    } catch {}
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(zones)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "dark_zones.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const addZone = () => {
    setZones((prev) => [...prev, { name: "New Dark Zone", active: true, path: [] }]);
    setSelected(zones.length);
  };

  const removeSelected = async () => {
    if (selected == null) return;
    const z = zones[selected];
    if (z?.id) await (supabase as any).from("DarkZones").delete().eq("id", z.id);
    const next = zones.filter((_, i) => i !== selected);
    setZones(next);
    saveLocal(next);
    setSelected(null);
  };

  const persistSelected = async () => {
    if (selected == null) return;
    const all = [...zones];
    const current = all[selected];
    if (!current) return;
    await saveToServer(current);
    setZones(all);
    saveLocal(all);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-background/70">
      <div className="tactical-panel w-full max-w-5xl h-[80vh] grid grid-cols-1 md:grid-cols-3">
        <div className="p-3 border-r border-primary/30 space-y-3 md:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Dark Zones</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={addZone} disabled={!isAdmin}>Add</Button>
              <Button size="sm" variant="outline" onClick={exportJson}>Export</Button>
              <Button size="sm" variant="outline" onClick={() => {
                const txt = prompt("Paste JSON");
                if (txt) importJson(txt);
              }}>Import</Button>
              <Button size="sm" onClick={onClose}>Close</Button>
            </div>
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
            {zones.map((z, i) => (
              <button key={i} className={`w-full text-left text-xs p-2 rounded border ${selected===i? 'border-primary' : 'border-primary/30'}`} onClick={() => setSelected(i)}>
                {z.name} {z.active ? '' : '(inactive)'}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 md:col-span-2 space-y-3">
          {selected != null && zones[selected] && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input value={zones[selected].name} onChange={(e) => {
                    const next = [...zones];
                    next[selected].name = e.target.value;
                    setZones(next);
                  }} />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <Label className="text-xs">Active</Label>
                  </div>
                  <Switch checked={zones[selected].active} onCheckedChange={(v) => {
                    const next = [...zones];
                    next[selected].active = !!v;
                    setZones(next);
                  }} />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Draw or edit polygon directly on the map. Drag vertices to adjust. Only administrators can save to server; others can export/import JSON locally.</div>
              <div className="flex gap-2">
                <Button size="sm" onClick={persistSelected} disabled={!isAdmin}>Save</Button>
                <Button size="sm" variant="destructive" onClick={removeSelected} disabled={!isAdmin}>Delete</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DarkZoneEditor;
