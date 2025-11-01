import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useJobSites } from "@/hooks/useJobSites";

type JobStatusLegendProps = {
  variant?: "overlay" | "embedded";
  className?: string;
};

export const JobStatusLegend = ({ variant = "overlay", className }: JobStatusLegendProps) => {
  const { data: jobSites } = useJobSites();

  const statusCounts = React.useMemo(() => {
    if (!jobSites) return {
      "Planned": 0,
      "In Progress": 0,
      "Completed": 0,
      "On Hold": 0,
      "Cancelled": 0,
    };
    
    return {
      "Planned": jobSites.filter(j => j.status === "Planned").length,
      "In Progress": jobSites.filter(j => j.status === "In Progress").length,
      "Completed": jobSites.filter(j => j.status === "Completed").length,
      "On Hold": jobSites.filter(j => j.status === "On Hold").length,
      "Cancelled": jobSites.filter(j => j.status === "Cancelled").length,
    };
  }, [jobSites]);

  const jobStatuses = [
    { status: "Planned", color: "bg-blue-500", count: statusCounts["Planned"] },
    { status: "In Progress", color: "bg-yellow-500", count: statusCounts["In Progress"] },
    { status: "Completed", color: "bg-green-500", count: statusCounts["Completed"] },
    { status: "On Hold", color: "bg-orange-500", count: statusCounts["On Hold"] },
    { status: "Cancelled", color: "bg-red-500", count: statusCounts["Cancelled"] },
  ];

  const content = (
    <>
      <div className="text-sm font-bold mb-2 text-primary tracking-wide">JOB STATUS</div>
      <div className="grid grid-cols-2 gap-2">
        {jobStatuses.map((item) => (
          <div key={item.status} className="flex items-center gap-2 text-xs">
            <div className={`w-3 h-3 rounded ${item.color}`} />
            <span className="text-muted-foreground truncate">{item.status}</span>
            <Badge variant="outline" className="ml-auto text-xs px-1.5 py-0.5 font-semibold">
              {item.count}
            </Badge>
          </div>
        ))}
      </div>
    </>
  );

  if (variant === "embedded") {
    return (
      <Card className={(className ? className + " " : "") + "p-2 bg-background/60 border-primary/30 rounded w-full"}>
        {content}
      </Card>
    );
  }

  return (
    <Card className="absolute right-12 top-[calc(4rem+12rem)] z-[970] p-2 bg-background/80 backdrop-blur-sm border-primary/30 rounded hud-element w-48">
      {content}
    </Card>
  );
};
