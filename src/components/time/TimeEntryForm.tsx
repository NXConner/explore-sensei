import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface TimeEntryFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export const TimeEntryForm = ({ onSave, onCancel }: TimeEntryFormProps) => {
  const [employeeId, setEmployeeId] = useState("");
  const [jobId, setJobId] = useState("");
  const [notes, setNotes] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
    fetchJobs();
  }, []);

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from("employees")
      .select("id, first_name, last_name")
      .order("first_name");

    if (data) setEmployees(data);
  };

  const fetchJobs = async () => {
    const { data } = await supabase
      .from("jobs")
      .select("id, title")
      .in("status", ["pending", "in progress"])
      .order("title");

    if (data) setJobs(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate input data
    const formData = {
      employeeId,
      jobId,
      notes,
    };

    const { validateFormData, timeEntrySchema } = await import('@/lib/formValidation');
    const validation = validateFormData(timeEntrySchema, formData);

    if (validation.success === false) {
      const firstError = Object.values(validation.errors)[0];
      toast({
        title: "Validation Error",
        description: String(firstError),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const validData = validation.data;
    const { error } = await supabase.from("time_entries").insert({
      employee_id: validData.employeeId,
      job_id: validData.jobId || null,
      clock_in: new Date().toISOString(),
      break_duration: 0,
      notes: validData.notes || null,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Clocked In",
      description: "Time tracking has started",
    });

    onSave();
  };

  return (
    <Card className="hud-element border-primary/30 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-bold mb-4">Clock In</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId} required>
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
            <Label htmlFor="job">Job (Optional)</Label>
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger className="hud-element border-primary/30">
                <SelectValue placeholder="Select job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
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
            placeholder="Add any notes about this work session..."
            rows={3}
            className="hud-element border-primary/30"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="hud-element border-primary/30"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !employeeId}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400"
          >
            {loading ? "Starting..." : "Start Timer"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
