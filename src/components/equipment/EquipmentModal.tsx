import React, { useState, useEffect } from "react";
import { X, Package, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EquipmentAssignmentForm } from "./EquipmentAssignmentForm";
import { format } from "date-fns";

interface EquipmentModalProps {
  onClose: () => void;
}

interface Assignment {
  id: string;
  asset_type: string;
  assigned_at: string;
  returned_at: string | null;
  condition_out: string | null;
  condition_in: string | null;
  notes: string | null;
  jobs?: { title: string } | null;
  employees?: { first_name: string; last_name: string } | null;
}

export const EquipmentModal = ({ onClose }: EquipmentModalProps) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from("asset_assignments")
      .select("*")
      .order("assigned_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load equipment assignments",
        variant: "destructive",
      });
      return;
    }

    // Fetch related data manually
    if (data && data.length > 0) {
      const jobIds = [...new Set(data.map(a => a.job_id).filter(Boolean))];
      const employeeIds = [...new Set(data.map(a => a.assigned_to).filter(Boolean))];

      const [jobsData, employeesData] = await Promise.all([
        jobIds.length > 0 ? supabase.from("jobs").select("id, title").in("id", jobIds) : Promise.resolve({ data: [] }),
        employeeIds.length > 0 ? supabase.from("employees").select("id, first_name, last_name").in("id", employeeIds) : Promise.resolve({ data: [] })
      ]);

      const jobsMap = new Map((jobsData.data || []).map(j => [j.id, j]));
      const employeesMap = new Map((employeesData.data || []).map(e => [e.id, e]));

      const enrichedData = data.map(assignment => ({
        ...assignment,
        jobs: assignment.job_id ? jobsMap.get(assignment.job_id) || null : null,
        employees: assignment.assigned_to ? employeesMap.get(assignment.assigned_to) || null : null
      }));

      setAssignments(enrichedData);
    } else {
      setAssignments([]);
    }
  };

  const handleAssignmentCreated = () => {
    setShowForm(false);
    fetchAssignments();
    toast({
      title: "Success",
      description: "Equipment assigned successfully",
    });
  };

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.asset_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.jobs?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${assignment.employees?.first_name} ${assignment.employees?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[90vh] hud-element m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <h2 className="text-2xl font-bold text-glow flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Equipment Management
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary/20 hover:bg-primary/30 border border-primary/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              Assign Equipment
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {showForm ? (
            <EquipmentAssignmentForm
              onSave={handleAssignmentCreated}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <>
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search equipment, job, or employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 hud-element border-primary/30"
                />
              </div>

              {/* Assignments List */}
              <div className="grid gap-4">
                {filteredAssignments.map((assignment) => (
                  <Card key={assignment.id} className="hud-element border-primary/30 p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-bold">{assignment.asset_type}</h3>
                          <Badge
                            variant={assignment.returned_at ? "secondary" : "default"}
                            className="ml-2"
                          >
                            {assignment.returned_at ? "Returned" : "Active"}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {assignment.employees && (
                            <p>
                              <span className="font-medium">Employee:</span>{" "}
                              {assignment.employees.first_name} {assignment.employees.last_name}
                            </p>
                          )}
                          {assignment.jobs && (
                            <p>
                              <span className="font-medium">Job:</span>{" "}
                              {assignment.jobs.title}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Assigned:</span>{" "}
                            {format(new Date(assignment.assigned_at), "MMM dd, yyyy")}
                          </p>
                          {assignment.returned_at && (
                            <p>
                              <span className="font-medium">Returned:</span>{" "}
                              {format(new Date(assignment.returned_at), "MMM dd, yyyy")}
                            </p>
                          )}
                          {assignment.condition_out && (
                            <p>
                              <span className="font-medium">Condition Out:</span>{" "}
                              {assignment.condition_out}
                            </p>
                          )}
                          {assignment.condition_in && (
                            <p>
                              <span className="font-medium">Condition In:</span>{" "}
                              {assignment.condition_in}
                            </p>
                          )}
                          {assignment.notes && (
                            <p>
                              <span className="font-medium">Notes:</span>{" "}
                              {assignment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {filteredAssignments.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No equipment assignments found</p>
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
