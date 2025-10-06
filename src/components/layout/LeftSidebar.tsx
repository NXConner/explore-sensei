import { useState } from "react";
import { MapPin, Layers, Ruler, Circle, Square, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export const LeftSidebar = () => {
  const [activeJobs] = useState([
    { id: 1, name: "Route 22 Repaving", status: "In Progress", progress: 65 },
    { id: 2, name: "Parking Lot - Mall", status: "Scheduled", progress: 0 },
    { id: 3, name: "Street Repairs - Main St", status: "In Progress", progress: 45 },
  ]);

  const drawingTools = [
    { icon: MapPin, label: "Marker", action: "marker" },
    { icon: Edit3, label: "Line", action: "polyline" },
    { icon: Circle, label: "Circle", action: "circle" },
    { icon: Square, label: "Rectangle", action: "rectangle" },
    { icon: Ruler, label: "Measure", action: "measure" },
    { icon: Trash2, label: "Clear", action: "clear" },
  ];

  return (
    <div className="absolute left-0 top-16 bottom-0 w-64 z-[900] hud-element border-r border-primary/30">
      <div className="h-full flex flex-col">
        {/* Drawing Tools */}
        <div className="p-3 border-b border-primary/30">
          <h3 className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">
            Map Tools
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {drawingTools.map((tool) => (
              <Button
                key={tool.action}
                variant="outline"
                size="sm"
                className="h-12 flex flex-col items-center justify-center gap-1 hover:bg-primary/20 hover:border-primary"
              >
                <tool.icon className="w-4 h-4" />
                <span className="text-xs">{tool.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Active Jobs */}
        <div className="flex-1 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
              Active Job Sites
            </h3>
            <Button size="sm" variant="ghost" className="h-6 text-xs">
              + New
            </Button>
          </div>
          <ScrollArea className="h-[calc(100%-2rem)]">
            <div className="space-y-2">
              {activeJobs.map((job) => (
                <div
                  key={job.id}
                  className="tactical-panel p-2 cursor-pointer hover:border-primary transition-all"
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-xs font-bold">{job.name}</h4>
                    <MapPin className="w-3 h-3 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{job.status}</p>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-right mt-1 text-primary">{job.progress}%</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Layer Controls */}
        <div className="p-3 border-t border-primary/30">
          <h3 className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">
            Map Layers
          </h3>
          <div className="space-y-1">
            {["Traffic", "Weather", "Dark Zones", "Equipment"].map((layer) => (
              <label
                key={layer}
                className="flex items-center gap-2 text-xs cursor-pointer hover:text-primary transition-colors"
              >
                <input type="checkbox" className="w-3 h-3" />
                {layer}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
