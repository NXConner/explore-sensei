import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  category: string;
  quantity: number;
  unit: string;
  unit_cost?: number;
  reorder_level: number;
  location?: string;
  supplier?: string;
  notes?: string;
}

export interface InventoryTransaction {
  id: string;
  item_id: string;
  transaction_type: 'in' | 'out' | 'adjustment' | 'return';
  quantity: number;
  job_id?: string;
  employee_id?: string;
  notes?: string;
  created_at: string;
}

export const useInventory = () => {
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("inventory_items")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as unknown as InventoryItem[];
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ["inventory-transactions"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("inventory_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as unknown as InventoryTransaction[];
    },
  });

  const addItem = useMutation({
    mutationFn: async (item: Omit<InventoryItem, 'id'>) => {
      const { data, error } = await (supabase as any)
        .from("inventory_items")
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      toast.success("Item added to inventory");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add item: ${error.message}`);
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InventoryItem> & { id: string }) => {
      const { error } = await (supabase as any)
        .from("inventory_items")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      toast.success("Item updated");
    },
  });

  const recordTransaction = useMutation({
    mutationFn: async (transaction: Omit<InventoryTransaction, 'id' | 'created_at'>) => {
      const { data, error } = await (supabase as any)
        .from("inventory_transactions")
        .insert(transaction)
        .select()
        .single();
      if (error) throw error;

      // Update item quantity
      const item = items?.find(i => i.id === transaction.item_id);
      if (item) {
        const newQuantity = transaction.transaction_type === 'in' 
          ? item.quantity + transaction.quantity
          : item.quantity - transaction.quantity;
        
        await (supabase as any)
          .from("inventory_items")
          .update({ quantity: newQuantity })
          .eq("id", transaction.item_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions"] });
      toast.success("Transaction recorded");
    },
  });

  const lowStockItems = items?.filter(item => item.quantity <= item.reorder_level) || [];

  return {
    items: items || [],
    transactions: transactions || [],
    lowStockItems,
    isLoading,
    addItem: addItem.mutate,
    updateItem: updateItem.mutate,
    recordTransaction: recordTransaction.mutate,
  };
};