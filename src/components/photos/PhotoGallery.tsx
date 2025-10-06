import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { MapPin, Calendar, User } from "lucide-react";

interface PhotoGalleryProps {
  jobId?: string;
  photoType?: string;
}

interface Photo {
  id: string;
  file_path: string;
  file_name: string;
  description: string | null;
  photo_type: string;
  latitude: number | null;
  longitude: number | null;
  taken_at: string;
  jobs?: {
    title: string;
  } | null;
  employees?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const PhotoGallery = ({ jobId, photoType }: PhotoGalleryProps) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPhotos();
  }, [jobId, photoType]);

  const fetchPhotos = async () => {
    setLoading(true);

    let query = supabase
      .from("job_photos")
      .select("*")
      .order("taken_at", { ascending: false });

    if (jobId) {
      query = query.eq("job_id", jobId);
    }

    if (photoType) {
      query = query.eq("photo_type", photoType);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load photos",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Fetch related data
    if (data && data.length > 0) {
      const jobIds = [...new Set(data.filter(p => p.job_id).map(p => p.job_id))];
      const employeeIds = [...new Set(data.filter(p => p.employee_id).map(p => p.employee_id))];

      const [jobsData, employeesData] = await Promise.all([
        jobIds.length > 0 ? supabase.from("jobs").select("id, title").in("id", jobIds) : Promise.resolve({ data: [] }),
        employeeIds.length > 0 ? supabase.from("employees").select("id, first_name, last_name").in("id", employeeIds) : Promise.resolve({ data: [] })
      ]);

      const jobsMap = new Map((jobsData.data || []).map(j => [j.id, j]));
      const employeesMap = new Map((employeesData.data || []).map(e => [e.id, e]));

      const enrichedData = data.map(photo => ({
        ...photo,
        jobs: photo.job_id ? jobsMap.get(photo.job_id) : null,
        employees: photo.employee_id ? employeesMap.get(photo.employee_id) : null,
      }));

      setPhotos(enrichedData as any);
    } else {
      setPhotos([]);
    }

    setLoading(false);
  };

  const getPhotoUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('job-photos')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "before":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "after":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "progress":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "issue":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "equipment":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading photos...
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No photos found. Upload your first photo to get started!
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <Card
            key={photo.id}
            className="hud-element border-primary/30 overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="aspect-video relative overflow-hidden bg-black/50">
              <img
                src={getPhotoUrl(photo.file_path)}
                alt={photo.description || photo.file_name}
                className="w-full h-full object-cover"
              />
              <Badge className={`absolute top-2 right-2 ${getTypeColor(photo.photo_type)}`}>
                {photo.photo_type}
              </Badge>
            </div>
            <div className="p-3 space-y-2">
              {photo.jobs && (
                <p className="font-bold text-sm truncate">{photo.jobs.title}</p>
              )}
              {photo.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {photo.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {format(new Date(photo.taken_at), "MMM d, yyyy")}
              </div>
              {photo.employees && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  {photo.employees.first_name} {photo.employees.last_name}
                </div>
              )}
              {photo.latitude && photo.longitude && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  GPS: {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl w-full m-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={getPhotoUrl(selectedPhoto.file_path)}
              alt={selectedPhoto.description || selectedPhoto.file_name}
              className="w-full h-auto rounded-lg"
            />
            <Card className="hud-element border-primary/30 p-4 mt-4">
              <div className="space-y-2">
                {selectedPhoto.jobs && (
                  <h3 className="text-lg font-bold">{selectedPhoto.jobs.title}</h3>
                )}
                {selectedPhoto.description && (
                  <p className="text-muted-foreground">{selectedPhoto.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  <Badge className={getTypeColor(selectedPhoto.photo_type)}>
                    {selectedPhoto.photo_type}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(selectedPhoto.taken_at), "MMM d, yyyy h:mm a")}
                  </span>
                  {selectedPhoto.employees && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {selectedPhoto.employees.first_name} {selectedPhoto.employees.last_name}
                    </span>
                  )}
                  {selectedPhoto.latitude && selectedPhoto.longitude && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedPhoto.latitude.toFixed(6)}, {selectedPhoto.longitude.toFixed(6)}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};
