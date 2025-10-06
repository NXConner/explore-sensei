import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Route, Download, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface RouteOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RouteOptimizationModal = ({ isOpen, onClose }: RouteOptimizationModalProps) => {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null);

  const { data: jobs } = useQuery({
    queryKey: ["jobs-for-route"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .in("status", ["Scheduled", "In Progress"])
        .order("scheduled_date");
      if (error) throw error;
      return data;
    },
  });

  const handleOptimize = async () => {
    if (!jobs || jobs.length === 0) {
      toast({
        title: "No Jobs",
        description: "No scheduled jobs to optimize.",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    setProgress(0);

    // Simulate optimization process
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsOptimizing(false);
          
          // Generate mock optimized route
          const totalDistance = jobs.reduce((sum, _, idx) => 
            sum + (idx > 0 ? Math.random() * 15 + 5 : 0), 0
          );
          
          const optimized = {
            totalDistance: totalDistance.toFixed(1),
            totalTime: Math.floor(totalDistance * 2.5 + jobs.length * 45),
            savings: {
              distance: (totalDistance * 0.23).toFixed(1),
              time: Math.floor(totalDistance * 0.23 * 2.5),
            },
            route: jobs.map((job, idx) => ({
              ...job,
              order: idx + 1,
              eta: new Date(Date.now() + idx * 3600000).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              travelTime: idx > 0 ? Math.floor(Math.random() * 30 + 10) : 0,
            })),
          };
          
          setOptimizedRoute(optimized);
          toast({
            title: "Route Optimized",
            description: `Saved ${optimized.savings.distance} miles and ${optimized.savings.time} minutes!`,
          });
          return 100;
        }
        return prev + 3;
      });
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-primary" />
            Route Optimization
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleOptimize}
              disabled={isOptimizing || !jobs?.length}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Optimize Route
            </Button>
            {optimizedRoute && (
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Route
              </Button>
            )}
          </div>

          {isOptimizing && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-sm">
                <span>Calculating optimal route...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Analyzing {jobs?.length} jobs with time windows and constraints
              </p>
            </div>
          )}

          {!optimizedRoute && !isOptimizing && (
            <div className="border rounded-lg p-6 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Ready to Optimize</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {jobs?.length || 0} scheduled jobs available for route optimization
              </p>
              <p className="text-xs text-muted-foreground">
                Our AI will calculate the most efficient route considering travel time, 
                traffic patterns, and job time windows.
              </p>
            </div>
          )}

          {optimizedRoute && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 bg-accent/20">
                  <div className="text-sm text-muted-foreground mb-1">Total Distance</div>
                  <div className="text-2xl font-bold text-primary">
                    {optimizedRoute.totalDistance} mi
                  </div>
                  <div className="text-xs text-green-500">
                    -{optimizedRoute.savings.distance} mi saved
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-accent/20">
                  <div className="text-sm text-muted-foreground mb-1">Total Time</div>
                  <div className="text-2xl font-bold text-primary">
                    {Math.floor(optimizedRoute.totalTime / 60)}h {optimizedRoute.totalTime % 60}m
                  </div>
                  <div className="text-xs text-green-500">
                    -{optimizedRoute.savings.time}m saved
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-accent/20">
                  <div className="text-sm text-muted-foreground mb-1">Stops</div>
                  <div className="text-2xl font-bold text-primary">
                    {optimizedRoute.route.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    jobs scheduled
                  </div>
                </div>
              </div>

              <div className="border rounded-lg">
                <div className="p-3 border-b bg-accent/10">
                  <h3 className="font-semibold">Optimized Route Sequence</h3>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="p-4 space-y-3">
                    {optimizedRoute.route.map((stop: any, idx: number) => (
                      <div key={stop.id} className="border rounded-lg p-4 relative">
                        <div className="absolute -left-3 top-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                          {stop.order}
                        </div>
                        <div className="ml-6">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-semibold">{stop.job_name}</div>
                              <div className="text-sm text-muted-foreground">{stop.location}</div>
                            </div>
                            <Badge variant="outline">{stop.status}</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                            <div>
                              <div className="text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                ETA
                              </div>
                              <div className="font-semibold">{stop.eta}</div>
                            </div>
                            {idx > 0 && (
                              <div>
                                <div className="text-muted-foreground flex items-center gap-1">
                                  <Route className="w-3 h-3" />
                                  Travel Time
                                </div>
                                <div className="font-semibold">{stop.travelTime} min</div>
                              </div>
                            )}
                            <div>
                              <div className="text-muted-foreground">Duration</div>
                              <div className="font-semibold">{stop.estimated_hours || 2}h</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
