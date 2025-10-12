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
import { useGamification } from "@/hooks/useGamification";
import { useGamificationToggle } from "@/context/GamificationContext";

interface JobFormProps {
  job?: any;
  onSave: () => void;
  onCancel: () => void;
}

export const JobForm = ({ job, onSave, onCancel }: JobFormProps) => {
  const [title, setTitle] = useState(job?.title || "");
  const [description, setDescription] = useState(job?.description || "");
  const [status, setStatus] = useState(job?.status || "pending");
  const [startDate, setStartDate] = useState(job?.start_date?.split("T")[0] || "");
  const [endDate, setEndDate] = useState(job?.end_date?.split("T")[0] || "");
  const [budget, setBudget] = useState(job?.budget?.toString() || "");
  const [location, setLocation] = useState(job?.location || "");
  const [clientId, setClientId] = useState(job?.client_id || "");
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { emitEvent } = useGamification();
  const { enabled: gamifyEnabled } = useGamificationToggle();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("id, name").order("name");

    if (data) setClients(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const jobData = {
      title,
      description,
      status,
      start_date: startDate,
      end_date: endDate || null,
      budget: budget ? parseFloat(budget) : null,
      location,
      client_id: clientId || null,
    };

    const isUpdate = Boolean(job);
    const { error } = isUpdate
      ? await supabase.from("jobs").update(jobData).eq("id", job.id)
      : await supabase.from("jobs").insert(jobData);

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
      title: "Success",
      description: isUpdate ? "Job updated successfully" : "Job created successfully",
    });

    if (gamifyEnabled) {
      try {
        await emitEvent({ event_type: "job_status_updated", metadata: { status, isUpdate } });
      } catch {}
    }

    onSave();
  };

  return (
    <Card className="hud-element border-primary/30 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="hud-element border-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="hud-element border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="hud-element border-primary/30">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="hud-element border-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="hud-element border-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget ($)</Label>
            <Input
              id="budget"
              type="number"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="hud-element border-primary/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
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
            disabled={loading}
            className="bg-primary/20 hover:bg-primary/30 border border-primary/30"
          >
            {loading ? "Saving..." : job ? "Update Job" : "Create Job"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
