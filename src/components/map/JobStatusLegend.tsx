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
    <Card className="fixed right-[280px] bottom-20 z-[400] p-3 bg-background/95 backdrop-blur-sm border-primary/30">
      <div className="text-xs font-bold mb-2 text-primary">JOB STATUS</div>
      <div className="space-y-1.5">
        {jobStatuses.map((item) => (
          <div key={item.status} className="flex items-center gap-2 text-xs">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className="text-muted-foreground">{item.status}</span>
            <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0">
              {item.count}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};
