import React, { useState, useEffect } from "react";
import { X, Clock, Play, Square, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TimeEntryForm } from "./TimeEntryForm";
import { format } from "date-fns";

interface TimeTrackingModalProps {
  onClose: () => void;
}

interface TimeEntry {
  id: string;
  employee_id: string;
  job_id?: string | null;
  clock_in: string;
  clock_out: string | null;
  break_duration: number;
  total_hours: number | null;
  notes?: string | null;
  jobs?: {
    title: string;
  } | null;
  employees?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const TimeTrackingModal = ({ onClose }: TimeTrackingModalProps) => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    fetchTimeEntries();
    checkActiveEntry();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchTimeEntries = async () => {
    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .order("clock_in", { ascending: false })
      .limit(50);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load time entries",
        variant: "destructive",
      });
      return;
    }

    // Manually fetch related data if needed
    if (data && data.length > 0) {
      const jobIds = data.filter(e => e.job_id).map(e => e.job_id);
      const employeeIds = data.map(e => e.employee_id);

      const [jobsData, employeesData] = await Promise.all([
        jobIds.length > 0 ? supabase.from("jobs").select("id, title").in("id", jobIds) : Promise.resolve({ data: [] }),
        supabase.from("employees").select("id, first_name, last_name").in("id", employeeIds)
      ]);

      const jobsMap = new Map((jobsData.data || []).map(j => [j.id, j]));
      const employeesMap = new Map((employeesData.data || []).map(e => [e.id, e]));

      const enrichedData = data.map(entry => ({
        ...entry,
        jobs: entry.job_id ? jobsMap.get(entry.job_id) : null,
        employees: employeesMap.get(entry.employee_id),
      }));

      setEntries(enrichedData as any);
    } else {
      setEntries([]);
    }
  };

  const checkActiveEntry = async () => {
    const { data } = await supabase
      .from("time_entries")
      .select("*")
      .is("clock_out", null)
      .maybeSingle();

    if (data) {
      // Fetch related data
      const [jobData, employeeData] = await Promise.all([
        data.job_id ? supabase.from("jobs").select("id, title").eq("id", data.job_id).single() : Promise.resolve({ data: null }),
        supabase.from("employees").select("id, first_name, last_name").eq("id", data.employee_id).single()
      ]);

      setActiveEntry({
        ...data,
        jobs: jobData.data,
        employees: employeeData.data,
      } as any);
    }
  };

  const handleClockIn = async () => {
    setShowForm(true);
  };

  const handleClockOut = async () => {
    if (!activeEntry) return;

    const { error } = await supabase
      .from("time_entries")
      .update({
        clock_out: new Date().toISOString(),
      })
      .eq("id", activeEntry.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to clock out",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Clocked Out",
      description: "You have successfully clocked out",
    });

    setActiveEntry(null);
    fetchTimeEntries();
  };

  const calculateElapsedTime = (clockIn: string) => {
    const start = new Date(clockIn);
    const diff = currentTime.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleEntrySaved = () => {
    setShowForm(false);
    fetchTimeEntries();
    checkActiveEntry();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[90vh] hud-element m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <h2 className="text-2xl font-bold text-glow">Time Tracking</h2>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Timer Section */}
          <Card className="hud-element border-primary/30 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Current Session
                </h3>
                {activeEntry ? (
                  <>
                    <div className="text-4xl font-bold text-glow tabular-nums">
                      {calculateElapsedTime(activeEntry.clock_in)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Started at {format(new Date(activeEntry.clock_in), "h:mm a")}
                      {activeEntry.jobs && ` • ${activeEntry.jobs.title}`}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">Not clocked in</p>
                )}
              </div>

              <div className="flex gap-2">
                {activeEntry ? (
                  <Button
                    onClick={handleClockOut}
                    size="lg"
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Clock Out
                  </Button>
                ) : (
                  <Button
                    onClick={handleClockIn}
                    size="lg"
                    className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Clock In
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Time Entry Form */}
          {showForm && (
            <TimeEntryForm
              onSave={handleEntrySaved}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Recent Entries */}
          {!showForm && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Recent Time Entries
                </h3>
              </div>

              <div className="space-y-3">
                {entries.map((entry) => (
                  <Card
                    key={entry.id}
                    className="hud-element border-primary/30 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold">
                            {entry.employees
                              ? `${entry.employees.first_name} ${entry.employees.last_name}`
                              : "Unknown Employee"}
                          </span>
                          {entry.jobs && (
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                              {entry.jobs.title}
                            </Badge>
                          )}
                          {!entry.clock_out && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span>
                            In: {format(new Date(entry.clock_in), "MMM d, h:mm a")}
                          </span>
                          {entry.clock_out && (
                            <>
                              <span>
                                Out: {format(new Date(entry.clock_out), "MMM d, h:mm a")}
                              </span>
                              <span className="font-bold text-primary">
                                {entry.total_hours?.toFixed(2)}h
                              </span>
                            </>
                          )}
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}

                {entries.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No time entries yet. Clock in to start tracking!
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
