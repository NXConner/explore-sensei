import React, { useState, useEffect } from "react";
import { X, Shield, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SafetyIncidentForm } from "./SafetyIncidentForm";
import { format } from "date-fns";

interface SafetyComplianceModalProps {
  onClose: () => void;
}

interface SafetyIncident {
  id: string;
  incident_date: string;
  incident_type: string;
  severity: string;
  description: string;
  status: string;
  jobs?: { title: string } | null;
  employees?: { first_name: string; last_name: string } | null;
}

export const SafetyComplianceModal = ({ onClose }: SafetyComplianceModalProps) => {
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    const { data, error } = await supabase
      .from("safety_incidents")
      .select("*")
      .order("incident_date", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load safety incidents",
        variant: "destructive",
      });
      return;
    }

    if (data && data.length > 0) {
      const jobIds = [...new Set(data.map((i: any) => i.job_id).filter(Boolean))];
      const employeeIds = [...new Set(data.map((i: any) => i.employee_id).filter(Boolean))];

      const [jobsData, employeesData] = await Promise.all([
        jobIds.length > 0
          ? supabase.from("jobs").select("id, title").in("id", jobIds)
          : Promise.resolve({ data: [] }),
        employeeIds.length > 0
          ? supabase.from("employees").select("id, first_name, last_name").in("id", employeeIds)
          : Promise.resolve({ data: [] }),
      ]);

      const jobsMap = new Map((jobsData.data || []).map((j) => [j.id, j]));
      const employeesMap = new Map((employeesData.data || []).map((e) => [e.id, e]));

      const enrichedData = data.map((incident: any) => ({
        ...incident,
        jobs: incident.job_id ? jobsMap.get(incident.job_id) || null : null,
        employees: incident.employee_id ? employeesMap.get(incident.employee_id) || null : null,
      }));

      setIncidents(enrichedData as any);
    } else {
      setIncidents([]);
    }
  };

  const handleIncidentCreated = () => {
    setShowForm(false);
    fetchIncidents();
    toast({
      title: "Success",
      description: "Safety incident reported successfully",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-400";
      case "high":
        return "bg-orange-500/20 text-orange-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "low":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "closed":
        return "bg-green-500/20 text-green-400";
      case "resolved":
        return "bg-blue-500/20 text-blue-400";
      case "investigating":
        return "bg-yellow-500/20 text-yellow-400";
      case "open":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[90vh] hud-element m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <h2 className="text-2xl font-bold text-glow flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Safety & Compliance
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary/20 hover:bg-primary/30 border border-primary/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              Report Incident
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {showForm ? (
            <SafetyIncidentForm
              onSave={handleIncidentCreated}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <Tabs defaultValue="incidents" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="incidents">Incidents</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>

              <TabsContent value="incidents" className="space-y-4 mt-6">
                {incidents.map((incident) => (
                  <Card key={incident.id} className="hud-element border-primary/30 p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-primary" />
                          <div>
                            <h3 className="text-lg font-bold capitalize">
                              {incident.incident_type.replace("_", " ")}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(incident.incident_date), "MMM dd, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm">{incident.description}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        {incident.jobs && (
                          <p>
                            <span className="font-medium">Job:</span> {incident.jobs.title}
                          </p>
                        )}
                        {incident.employees && (
                          <p>
                            <span className="font-medium">Employee:</span>{" "}
                            {incident.employees.first_name} {incident.employees.last_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}

                {incidents.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No safety incidents reported</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="hud-element border-primary/30 p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Incidents</h3>
                    <p className="text-3xl font-bold text-primary mt-2">{incidents.length}</p>
                  </Card>
                  <Card className="hud-element border-primary/30 p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Open Cases</h3>
                    <p className="text-3xl font-bold text-red-400 mt-2">
                      {incidents.filter((i) => i.status === "open").length}
                    </p>
                  </Card>
                  <Card className="hud-element border-primary/30 p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Critical</h3>
                    <p className="text-3xl font-bold text-orange-400 mt-2">
                      {incidents.filter((i) => i.severity === "critical").length}
                    </p>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};
