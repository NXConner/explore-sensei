import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EquipmentAssignmentFormProps {
  onSave: () => void;
  onCancel: () => void;
}

interface Job {
  id: string;
  title: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
}

export const EquipmentAssignmentForm = ({
  onSave,
  onCancel,
}: EquipmentAssignmentFormProps) => {
  const [assetType, setAssetType] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [jobId, setJobId] = useState("");
  const [conditionOut, setConditionOut] = useState("");
  const [notes, setNotes] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
    fetchEmployees();
  }, []);

  const fetchJobs = async () => {
    const { data } = await supabase
      .from("jobs")
      .select("id, title")
      .order("title");
    
    if (data) setJobs(data);
  };

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from("employees")
      .select("id, first_name, last_name")
      .order("first_name");
    
    if (data) setEmployees(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assetType || !assignedTo) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("asset_assignments").insert({
      asset_type: assetType,
      assigned_to: assignedTo,
      job_id: jobId || null,
      condition_out: conditionOut || null,
      notes: notes || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to assign equipment",
        variant: "destructive",
      });
      return;
    }

    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="assetType">Equipment Type *</Label>
          <Input
            id="assetType"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            placeholder="e.g., Paver, Roller, Truck"
            className="hud-element border-primary/30"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assign to Employee *</Label>
          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger className="hud-element border-primary/30">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobId">Job (Optional)</Label>
          <Select value={jobId} onValueChange={setJobId}>
            <SelectTrigger className="hud-element border-primary/30">
              <SelectValue placeholder="Select job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="conditionOut">Condition</Label>
          <Select value={conditionOut} onValueChange={setConditionOut}>
            <SelectTrigger className="hud-element border-primary/30">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes about this assignment..."
          className="hud-element border-primary/30"
          rows={3}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary/20 hover:bg-primary/30 border border-primary/30"
        >
          Assign Equipment
        </Button>
      </div>
    </form>
  );
};
