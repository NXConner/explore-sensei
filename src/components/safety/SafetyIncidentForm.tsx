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
import { format } from "date-fns";

interface SafetyIncidentFormProps {
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

export const SafetyIncidentForm = ({ onSave, onCancel }: SafetyIncidentFormProps) => {
  const [incidentDate, setIncidentDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [jobId, setJobId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [incidentType, setIncidentType] = useState("");
  const [severity, setSeverity] = useState("low");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [immediateAction, setImmediateAction] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
    fetchEmployees();
  }, []);

  const fetchJobs = async () => {
    const { data } = await supabase.from("jobs").select("id, title").order("title");

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

    if (!incidentType || !description) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("safety_incidents").insert([
      {
        incident_date: incidentDate,
        job_id: jobId || null,
        employee_id: employeeId || null,
        incident_type: incidentType,
        severity,
        description,
        location: location || null,
        immediate_action: immediateAction || null,
        status: "open",
      } as any,
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to report incident",
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
          <Label htmlFor="incidentDate">Incident Date & Time *</Label>
          <Input
            id="incidentDate"
            type="datetime-local"
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
            className="hud-element border-primary/30"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="incidentType">Incident Type *</Label>
          <Select value={incidentType} onValueChange={setIncidentType}>
            <SelectTrigger className="hud-element border-primary/30">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="near_miss">Near Miss</SelectItem>
              <SelectItem value="first_aid">First Aid</SelectItem>
              <SelectItem value="medical_treatment">Medical Treatment</SelectItem>
              <SelectItem value="lost_time">Lost Time</SelectItem>
              <SelectItem value="property_damage">Property Damage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="severity">Severity *</Label>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="hud-element border-primary/30">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="hud-element border-primary/30"
            placeholder="Incident location"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="job">Job</Label>
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
          <Label htmlFor="employee">Involved Employee</Label>
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger className="hud-element border-primary/30">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="hud-element border-primary/30"
          rows={4}
          required
          placeholder="Describe the incident in detail..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="immediateAction">Immediate Action Taken</Label>
        <Textarea
          id="immediateAction"
          value={immediateAction}
          onChange={(e) => setImmediateAction(e.target.value)}
          className="hud-element border-primary/30"
          rows={3}
          placeholder="Actions taken immediately following the incident..."
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary/20 hover:bg-primary/30 border border-primary/30"
        >
          Report Incident
        </Button>
      </div>
    </form>
  );
};
