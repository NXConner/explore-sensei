import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RouteStop {
  address: string;
  lat: number;
  lng: number;
}

export interface RouteOptimization {
  id?: string;
  name: string;
  start_location: {
    address: string;
    lat: number;
    lng: number;
  };
  stops: RouteStop[];
  optimized_route?: RouteStop[];
  total_distance?: number;
  total_duration?: number;
  optimization_method?: string;
  created_at?: string;
}

export const useRouteOptimizations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: routes, isLoading } = useQuery({
    queryKey: ["route-optimizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("route_optimizations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createRoute = useMutation({
    mutationFn: async (route: RouteOptimization) => {
      const routeData = {
        name: route.name,
        start_location: route.start_location as any,
        stops: route.stops as any,
        optimized_route: route.optimized_route as any,
        total_distance: route.total_distance,
        total_duration: route.total_duration,
        optimization_method: route.optimization_method,
      } as any;
      
      const { data, error } = await supabase
        .from("route_optimizations")
        .insert([routeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-optimizations"] });
      toast({
        title: "Route Saved",
        description: "Your optimized route has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save route.",
        variant: "destructive",
      });
    },
  });

  const deleteRoute = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("route_optimizations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-optimizations"] });
      toast({
        title: "Route Deleted",
        description: "The route has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete route.",
        variant: "destructive",
      });
    },
  });

  return {
    routes,
    isLoading,
    createRoute: createRoute.mutate,
    deleteRoute: deleteRoute.mutate,
  };
};
