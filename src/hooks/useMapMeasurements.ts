import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MapMeasurement {
  id: string;
  type: string;
  value: number;
  unit: string;
  geojson: any;
  created_at: string;
}

export const useMapMeasurements = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: measurements, isLoading } = useQuery({
    queryKey: ["map-measurements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Mapmeasurements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MapMeasurement[];
    },
  });

  const deleteMeasurement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("Mapmeasurements").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["map-measurements"] });
      toast({
        title: "Measurement Deleted",
        description: "The measurement has been removed from the map.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete measurement.",
        variant: "destructive",
      });
    },
  });

  return {
    measurements,
    isLoading,
    deleteMeasurement: deleteMeasurement.mutate,
  };
};
