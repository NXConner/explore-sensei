import React, { useState, useEffect } from "react";
import { X, FileText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FieldReportForm } from "./FieldReportForm";
import { format } from "date-fns";

interface FieldReportsModalProps {
  onClose: () => void;
}

interface FieldReport {
  id: string;
  report_date: string;
  work_performed: string;
  weather_conditions: string | null;
  hours_worked: number | null;
  progress_percentage: number | null;
  jobs?: { title: string } | null;
  employees?: { first_name: string; last_name: string } | null;
}

export const FieldReportsModal = ({ onClose }: FieldReportsModalProps) => {
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("daily_field_reports")
      .select("*")
      .order("report_date", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load field reports",
        variant: "destructive",
      });
      return;
    }

    if (data && data.length > 0) {
      const jobIds = [...new Set(data.map((r: any) => r.job_id).filter(Boolean))];
      const employeeIds = [...new Set(data.map((r: any) => r.employee_id).filter(Boolean))];

      const [jobsData, employeesData] = await Promise.all([
        jobIds.length > 0 ? supabase.from("jobs").select("id, title").in("id", jobIds) : Promise.resolve({ data: [] }),
        employeeIds.length > 0 ? supabase.from("employees").select("id, first_name, last_name").in("id", employeeIds) : Promise.resolve({ data: [] })
      ]);

      const jobsMap = new Map((jobsData.data || []).map(j => [j.id, j]));
      const employeesMap = new Map((employeesData.data || []).map(e => [e.id, e]));

      const enrichedData = data.map((report: any) => ({
        ...report,
        jobs: report.job_id ? jobsMap.get(report.job_id) || null : null,
        employees: report.employee_id ? employeesMap.get(report.employee_id) || null : null
      }));

      setReports(enrichedData as any);
    } else {
      setReports([]);
    }
  };

  const handleReportCreated = () => {
    setShowForm(false);
    fetchReports();
    toast({
      title: "Success",
      description: "Field report created successfully",
    });
  };

  const filteredReports = reports.filter((report) =>
    report.work_performed.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.jobs?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[90vh] hud-element m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <h2 className="text-2xl font-bold text-glow flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Daily Field Reports
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary/20 hover:bg-primary/30 border border-primary/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {showForm ? (
            <FieldReportForm
              onSave={handleReportCreated}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 hud-element border-primary/30"
                />
              </div>

              <div className="grid gap-4">
                {filteredReports.map((report) => (
                  <Card key={report.id} className="hud-element border-primary/30 p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold">
                            {format(new Date(report.report_date), "MMMM dd, yyyy")}
                          </h3>
                          {report.jobs && (
                            <p className="text-sm text-muted-foreground">
                              Job: {report.jobs.title}
                            </p>
                          )}
                        </div>
                        {report.progress_percentage !== null && (
                          <Badge className="bg-primary/20 text-primary">
                            {report.progress_percentage}% Complete
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm">{report.work_performed}</p>

                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        {report.weather_conditions && (
                          <p>
                            <span className="font-medium">Weather:</span> {report.weather_conditions}
                          </p>
                        )}
                        {report.hours_worked && (
                          <p>
                            <span className="font-medium">Hours:</span> {report.hours_worked}
                          </p>
                        )}
                        {report.employees && (
                          <p>
                            <span className="font-medium">Lead:</span> {report.employees.first_name} {report.employees.last_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}

                {filteredReports.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No field reports found</p>
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
