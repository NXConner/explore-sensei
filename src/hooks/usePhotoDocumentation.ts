import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface JobPhoto {
  id: string;
  job_id: string;
  uploaded_by: string;
  photo_url: string;
  photo_type: "before" | "during" | "after" | "issue" | "completion";
  description?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  ai_analysis?: any;
  created_at: string;
}

export const usePhotoDocumentation = (jobId?: string) => {
  const queryClient = useQueryClient();

  const { data: photos, isLoading } = useQuery({
    queryKey: ["job-photos", jobId],
    queryFn: async () => {
      let query = (supabase as any)
        .from("job_photos")
        .select("*")
        .order("created_at", { ascending: false });

      if (jobId) {
        query = query.eq("job_id", jobId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as JobPhoto[];
    },
    enabled: !!jobId,
  });

  const uploadPhoto = useMutation({
    mutationFn: async ({
      jobId,
      file,
      photoType,
      description,
      gpsCoords,
    }: {
      jobId: string;
      file: File;
      photoType: JobPhoto["photo_type"];
      description?: string;
      gpsCoords?: { latitude: number; longitude: number };
    }) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${jobId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("job-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("job-photos").getPublicUrl(fileName);

      const { data, error } = await (supabase as any)
        .from("job_photos")
        .insert({
          job_id: jobId,
          photo_url: publicUrl,
          photo_type: photoType,
          description,
          gps_latitude: gpsCoords?.latitude,
          gps_longitude: gpsCoords?.longitude,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-photos"] });
      toast.success("Photo uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const deletePhoto = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await (supabase as any).from("job_photos").delete().eq("id", photoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-photos"] });
      toast.success("Photo deleted");
    },
  });

  return {
    photos: photos || [],
    isLoading,
    uploadPhoto: uploadPhoto.mutate,
    deletePhoto: deletePhoto.mutate,
    isUploading: uploadPhoto.isPending,
  };
};
