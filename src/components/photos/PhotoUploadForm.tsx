import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, MapPin } from "lucide-react";

interface PhotoUploadFormProps {
  jobs: Array<{ id: string; title: string }>;
  onSave: () => void;
  onCancel: () => void;
}

export const PhotoUploadForm = ({ jobs, onSave, onCancel }: PhotoUploadFormProps) => {
  const [jobId, setJobId] = useState("");
  const [photoType, setPhotoType] = useState("progress");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [useLocation, setUseLocation] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !jobId) {
      toast({
        title: "Missing Information",
        description: "Please select both a job and a photo",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get location if requested
      let latitude = null;
      let longitude = null;
      
      if (useLocation && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (error) {
          console.log("Could not get location:", error);
        }
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${jobId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('job-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get current employee ID (simplified - you may need to fetch this from your auth system)
      const { data: userData } = await supabase.auth.getUser();
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userData?.user?.id)
        .single();

      // Create database record
      const { error: dbError } = await supabase
        .from('job_photos')
        .insert({
          job_id: jobId,
          employee_id: employeeData?.id || null,
          file_path: fileName,
          file_name: file.name,
          url: fileName, // Required field
          description: description || null,
          photo_type: photoType,
          latitude,
          longitude,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });

      onSave();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="hud-element border-primary/30 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-bold mb-4">Upload Photo</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="job">Job *</Label>
            <Select value={jobId} onValueChange={setJobId} required>
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

          <div className="space-y-2">
            <Label htmlFor="type">Photo Type</Label>
            <Select value={photoType} onValueChange={setPhotoType}>
              <SelectTrigger className="hud-element border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="before">Before</SelectItem>
                <SelectItem value="after">After</SelectItem>
                <SelectItem value="issue">Issue</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo">Photo *</Label>
          <div className="flex items-center gap-2">
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hud-element border-primary/30"
              required
            />
            {file && (
              <span className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(0)}KB
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes about this photo..."
            rows={3}
            className="hud-element border-primary/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="location"
            checked={useLocation}
            onChange={(e) => setUseLocation(e.target.checked)}
            className="rounded border-primary/30"
          />
          <Label htmlFor="location" className="flex items-center gap-2 cursor-pointer">
            <MapPin className="w-4 h-4 text-primary" />
            Include GPS location
          </Label>
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
            disabled={loading || !file || !jobId}
            className="bg-primary/20 hover:bg-primary/30 border border-primary/30"
          >
            {loading ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
