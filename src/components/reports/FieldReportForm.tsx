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

interface FieldReportFormProps {
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

export const FieldReportForm = ({ onSave, onCancel }: FieldReportFormProps) => {
  const [reportDate, setReportDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [jobId, setJobId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [weatherConditions, setWeatherConditions] = useState("");
  const [temperature, setTemperature] = useState("");
  const [workPerformed, setWorkPerformed] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [progressPercentage, setProgressPercentage] = useState("");
  const [issuesEncountered, setIssuesEncountered] = useState("");
  const [safetyNotes, setSafetyNotes] = useState("");
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

    if (!workPerformed) {
      toast({
        title: "Error",
        description: "Please describe work performed",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("daily_field_reports").insert([
      {
        report_date: reportDate,
        job_id: jobId || null,
        employee_id: employeeId || null,
        weather_conditions: weatherConditions || null,
        temperature: temperature ? parseFloat(temperature) : null,
        work_performed: workPerformed,
        hours_worked: hoursWorked ? parseFloat(hoursWorked) : null,
        progress_percentage: progressPercentage ? parseInt(progressPercentage) : null,
        issues_encountered: issuesEncountered || null,
        safety_notes: safetyNotes || null,
      } as any,
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create field report",
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
          <Label htmlFor="reportDate">Report Date *</Label>
          <Input
            id="reportDate"
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="hud-element border-primary/30"
            required
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
          <Label htmlFor="employee">Lead Employee</Label>
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

        <div className="space-y-2">
          <Label htmlFor="hoursWorked">Hours Worked</Label>
          <Input
            id="hoursWorked"
            type="number"
            value={hoursWorked}
            onChange={(e) => setHoursWorked(e.target.value)}
            className="hud-element border-primary/30"
            min="0"
            step="0.5"
            placeholder="8.0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weather">Weather Conditions</Label>
          <Input
            id="weather"
            value={weatherConditions}
            onChange={(e) => setWeatherConditions(e.target.value)}
            className="hud-element border-primary/30"
            placeholder="Sunny, Clear"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature (°F)</Label>
          <Input
            id="temperature"
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="hud-element border-primary/30"
            step="0.1"
            placeholder="72"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="progress">Progress (%)</Label>
          <Input
            id="progress"
            type="number"
            value={progressPercentage}
            onChange={(e) => setProgressPercentage(e.target.value)}
            className="hud-element border-primary/30"
            min="0"
            max="100"
            placeholder="50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="workPerformed">Work Performed *</Label>
        <Textarea
          id="workPerformed"
          value={workPerformed}
          onChange={(e) => setWorkPerformed(e.target.value)}
          className="hud-element border-primary/30"
          rows={4}
          required
          placeholder="Describe the work completed today..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="issues">Issues Encountered</Label>
        <Textarea
          id="issues"
          value={issuesEncountered}
          onChange={(e) => setIssuesEncountered(e.target.value)}
          className="hud-element border-primary/30"
          rows={3}
          placeholder="Any problems or delays..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="safety">Safety Notes</Label>
        <Textarea
          id="safety"
          value={safetyNotes}
          onChange={(e) => setSafetyNotes(e.target.value)}
          className="hud-element border-primary/30"
          rows={3}
          placeholder="Safety observations or concerns..."
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
          Create Report
        </Button>
      </div>
    </form>
  );
};
