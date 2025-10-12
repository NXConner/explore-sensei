import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CostItem {
  id?: string;
  catalog_id?: string;
  code: string;
  name: string;
  material_type?: string;
  unit: string;
  unit_cost: number;
  notes?: string;
}

export interface CostCatalog {
  id?: string;
  region: string;
  is_default: boolean;
  created_at?: string;
  items?: CostItem[];
}

export const useCostCatalog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: catalogs, isLoading } = useQuery({
    queryKey: ["cost-catalogs"],
    queryFn: async () => {
      const { data: catalogsData, error: catalogsError } = await supabase
        .from("cost_catalog")
        .select("*")
        .order("created_at", { ascending: false });

      if (catalogsError) throw catalogsError;

      const catalogsWithItems = await Promise.all(
        (catalogsData || []).map(async (catalog) => {
          const { data: items, error: itemsError } = await supabase
            .from("cost_items")
            .select("*")
            .eq("catalog_id", catalog.id);

          if (itemsError) throw itemsError;

          return {
            ...catalog,
            items: items || [],
          };
        }),
      );

      return catalogsWithItems as CostCatalog[];
    },
  });

  const createCatalog = useMutation({
    mutationFn: async (catalog: { region: string; is_default: boolean }) => {
      const { data, error } = await supabase
        .from("cost_catalog")
        .insert([catalog])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cost-catalogs"] });
      toast({
        title: "Catalog Created",
        description: "Cost catalog has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create catalog.",
        variant: "destructive",
      });
    },
  });

  const deleteCatalog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cost_catalog").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cost-catalogs"] });
      toast({
        title: "Catalog Deleted",
        description: "Cost catalog has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete catalog.",
        variant: "destructive",
      });
    },
  });

  const createItem = useMutation({
    mutationFn: async (item: CostItem & { catalog_id: string }) => {
      const { data, error } = await supabase.from("cost_items").insert([item]).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cost-catalogs"] });
      toast({
        title: "Item Added",
        description: "Cost item has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item.",
        variant: "destructive",
      });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cost_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cost-catalogs"] });
      toast({
        title: "Item Deleted",
        description: "Cost item has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item.",
        variant: "destructive",
      });
    },
  });

  return {
    catalogs,
    isLoading,
    createCatalog: createCatalog.mutate,
    deleteCatalog: deleteCatalog.mutate,
    createItem: createItem.mutate,
    deleteItem: deleteItem.mutate,
  };
};
