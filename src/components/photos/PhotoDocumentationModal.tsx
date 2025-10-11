import React, { useState, useEffect } from "react";
import { X, Camera, Upload, Filter, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PhotoUploadForm } from "./PhotoUploadForm";
import { PhotoGallery } from "./PhotoGallery";
import { format } from "date-fns";
import { useGamification } from "@/hooks/useGamification";

interface PhotoDocumentationModalProps {
  onClose: () => void;
}

interface Job {
  id: string;
  title: string;
  status: string;
}

export const PhotoDocumentationModal = ({ onClose }: PhotoDocumentationModalProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [photoType, setPhotoType] = useState<string>("all");
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToast();
  const { emitEvent } = useGamification();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("id, title, status")
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

  const handlePhotoUploaded = () => {
    setShowUpload(false);
    toast({
      title: "Success",
      description: "Photo uploaded successfully",
    });
    try { emitEvent({ event_type: "photo_uploaded", metadata: { job_id: selectedJobId, type: photoType } }); } catch {}
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-7xl h-[90vh] hud-element m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <h2 className="text-2xl font-bold text-glow flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            Photo Documentation
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowUpload(true)}
              className="bg-primary/20 hover:bg-primary/30 border border-primary/30"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {showUpload ? (
            <PhotoUploadForm
              jobs={jobs}
              onSave={handlePhotoUploaded}
              onCancel={() => setShowUpload(false)}
            />
          ) : (
            <>
              {/* Filters */}
              <Card className="hud-element border-primary/30 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold">Filters:</span>
                  </div>

                  <div className="flex gap-3 flex-1">
                    <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                      <SelectTrigger className="w-[200px] hud-element border-primary/30">
                        <SelectValue placeholder="All Jobs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Jobs</SelectItem>
                        {jobs.map((job) => (
                          <SelectItem key={job.id} value={job.id}>
                            {job.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={photoType} onValueChange={setPhotoType}>
                      <SelectTrigger className="w-[200px] hud-element border-primary/30">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="progress">Progress</SelectItem>
                        <SelectItem value="before">Before</SelectItem>
                        <SelectItem value="after">After</SelectItem>
                        <SelectItem value="issue">Issue</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Photo Gallery */}
              <PhotoGallery
                jobId={selectedJobId === "all" ? undefined : selectedJobId}
                photoType={photoType === "all" ? undefined : photoType}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
