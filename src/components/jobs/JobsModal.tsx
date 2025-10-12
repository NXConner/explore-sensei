import React, { useState, useEffect } from "react";
import { X, Plus, Search, MapPin, Calendar, Users, DollarSign, Church, Filter, SortAsc, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { JobForm } from "./JobForm";
import { ChurchJobTemplate } from "../church/ChurchJobTemplate";
import { ParkingLayoutDesigner } from "../church/ParkingLayoutDesigner";
import type { JobFormData } from "@/types";

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
  const [activeTab, setActiveTab] = useState("jobs");
  const [showChurchTemplates, setShowChurchTemplates] = useState(false);
  const [showParkingDesigner, setShowParkingDesigner] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("start_date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        `
        *,
        clients (
          name
        )
      `,
      )
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

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
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

  const handleChurchTemplateSelect = (templateData: JobFormData) => {
    setSelectedJob(null);
    setShowForm(true);
    // Pass template data to JobForm
    setShowChurchTemplates(false);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.clients?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "status":
        return a.status.localeCompare(b.status);
      case "start_date":
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      case "budget":
        return (b.budget || 0) - (a.budget || 0);
      default:
        return 0;
    }
  });

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
            <Button
              onClick={() => setShowChurchTemplates(true)}
              className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30"
            >
              <Church className="w-4 h-4 mr-2" />
              Church Templates
            </Button>
            <Button
              onClick={() => setShowParkingDesigner(true)}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30"
            >
              <Grid className="w-4 h-4 mr-2" />
              Layout Designer
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!showForm && !showChurchTemplates && !showParkingDesigner ? (
            <>
              {/* Enhanced Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs by name or client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 hud-element border-primary/30"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SortAsc className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="start_date">Start Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="budget">Budget</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex border border-primary/30 rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Jobs Display */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="hud-element border-primary/30 p-4 cursor-pointer hover:border-primary/50 transition-all"
                      onClick={() => handleEditJob(job)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg text-glow">{job.title}</h3>
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
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
                          <DollarSign className="w-4 h-4" />${job.budget.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}

                {sortedJobs.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No jobs found. Create your first job to get started!
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {sortedJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="hud-element border-primary/30 p-4 cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => handleEditJob(job)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-glow">{job.title}</h3>
                          <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          {job.clients && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {job.clients.name}
                            </div>
                          )}
                          {job.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(job.start_date).toLocaleDateString()}
                          </div>
                          {job.budget && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${job.budget.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {sortedJobs.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No jobs found. Create your first job to get started!
                  </div>
                )}
              </div>
            )}
            </>
          ) : showChurchTemplates ? (
            <ChurchJobTemplate
              onTemplateSelect={handleChurchTemplateSelect}
              onClose={() => setShowChurchTemplates(false)}
            />
          ) : showParkingDesigner ? (
            <ParkingLayoutDesigner />
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
