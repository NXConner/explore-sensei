import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const jobStatuses = [
  { status: "Planned", color: "bg-blue-500", count: 0 },
  { status: "In Progress", color: "bg-yellow-500", count: 0 },
  { status: "Completed", color: "bg-green-500", count: 0 },
  { status: "On Hold", color: "bg-orange-500", count: 0 },
  { status: "Cancelled", color: "bg-red-500", count: 0 },
];

export const JobStatusLegend = () => {
  return (
    <Card className="absolute right-4 top-[calc(4rem+12rem+0.5rem)] z-[970] p-2 bg-background/80 backdrop-blur-sm border-primary/30 rounded hud-element w-[200px]">
      <div className="text-xs font-bold mb-2 text-primary">JOB STATUS</div>
      <div className="grid grid-cols-2 gap-1">
        {jobStatuses.map((item) => (
          <div key={item.status} className="flex items-center gap-1 text-[10px]">
            <div className={`w-3 h-3 rounded ${item.color}`} />
            <span className="text-muted-foreground truncate">{item.status}</span>
            <Badge variant="outline" className="ml-auto text-[9px] px-1 py-0">
              {item.count}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};
