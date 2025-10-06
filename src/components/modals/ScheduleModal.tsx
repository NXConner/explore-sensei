import React from "react";
import { X, Calendar, MapPin, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useJobSites } from "@/hooks/useJobSites";
import { format } from "date-fns";

interface ScheduleModalProps {
  onClose: () => void;
}

export const ScheduleModal = ({ onClose }: ScheduleModalProps) => {
  const { data: jobSites, isLoading } = useJobSites();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in progress":
        return "text-primary";
      case "scheduled":
        return "text-success";
      case "completed":
        return "text-muted-foreground";
      default:
        return "text-foreground";
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[80vh] tactical-panel m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-bold text-primary uppercase tracking-wider">
              Operations Schedule
            </h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading schedule...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobSites?.map((job) => (
                <div key={job.id} className="tactical-panel p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-glow mb-1">{job.name}</h3>
                      {job.client_name && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Client: {job.client_name}
                        </p>
                      )}
                    </div>
                    <div className={`text-sm font-bold ${getStatusColor(job.status)}`}>
                      {job.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {job.start_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>Start: {format(new Date(job.start_date), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                    {job.end_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>End: {format(new Date(job.end_date), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                    {job.latitude && job.longitude && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>Location: {job.latitude.toFixed(4)}, {job.longitude.toFixed(4)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary font-bold">{job.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
