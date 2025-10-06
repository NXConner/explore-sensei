import React, { useState, useEffect } from "react";
import { X, Plus, Search, MapPin, Calendar, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { JobForm } from "./JobForm";

interface JobsModalProps {
  onClose: () => void;
}

interface Job {
  id: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string | null;
  budget?: number | null;
  location?: string | null;
  client_id: string | null;
  clients?: {
    name: string;
  };
}

export const JobsModal = ({ onClose }: JobsModalProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        clients (
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
      return;
    }

    setJobs(data || []);
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleJobSaved = () => {
    setShowForm(false);
    setSelectedJob(null);
    fetchJobs();
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setShowForm(true);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-7xl h-[90vh] hud-element m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <h2 className="text-2xl font-bold text-glow">Job Management</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary/20 hover:bg-primary/30 border border-primary/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Job
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!showForm ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by name or client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 hud-element border-primary/30"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="hud-element border-primary/30 p-4 cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => handleEditJob(job)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg text-glow">{job.title}</h3>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      {job.clients && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {job.clients.name}
                        </div>
                      )}

                      {job.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(job.start_date).toLocaleDateString()}
                      </div>

                      {job.budget && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          ${job.budget.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}

                {filteredJobs.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No jobs found. Create your first job to get started!
                  </div>
                )}
              </div>
            </>
          ) : (
            <JobForm
              job={selectedJob}
              onSave={handleJobSaved}
              onCancel={() => {
                setShowForm(false);
                setSelectedJob(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
