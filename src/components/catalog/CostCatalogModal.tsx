import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BackToMapButton } from "@/components/common/BackToMapButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CostCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CostCatalogModal = ({ isOpen, onClose }: CostCatalogModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    code: "",
    unit: "sqft",
    unit_cost: "",
    material_type: "",
    notes: "",
  });

  const { data: catalogs } = useQuery({
    queryKey: ["cost-catalogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cost_catalog")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: items } = useQuery({
    queryKey: ["cost-items", selectedCatalog],
    queryFn: async () => {
      if (!selectedCatalog) return [];
      const { data, error } = await supabase
        .from("cost_items")
        .select("*")
        .eq("catalog_id", selectedCatalog)
        .order("code");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCatalog,
  });

  const addItem = useMutation({
    mutationFn: async () => {
      if (!selectedCatalog) throw new Error("No catalog selected");
      const { error } = await supabase.from("cost_items").insert({
        catalog_id: selectedCatalog,
        ...newItem,
        unit_cost: parseFloat(newItem.unit_cost),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cost-items"] });
      setIsAddingItem(false);
      setNewItem({ name: "", code: "", unit: "sqft", unit_cost: "", material_type: "", notes: "" });
      toast({ title: "Item Added", description: "Cost item added successfully." });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cost_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cost-items"] });
      toast({ title: "Item Deleted" });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Cost Catalog Management</span>
            <BackToMapButton variant="ghost" />
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Catalogs</h3>
            <ScrollArea className="h-[calc(100%-2rem)]">
              {catalogs?.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCatalog === cat.id ? "default" : "outline"}
                  className="w-full mb-2 justify-start"
                  onClick={() => setSelectedCatalog(cat.id)}
                >
                  {cat.region}
                </Button>
              ))}
            </ScrollArea>
          </div>

          <div className="col-span-2 border rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Cost Items</h3>
              {selectedCatalog && (
                <Button size="sm" onClick={() => setIsAddingItem(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
              )}
            </div>

            {isAddingItem && (
              <div className="border rounded-lg p-4 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Item Name</Label>
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Hot Mix Asphalt"
                    />
                  </div>
                  <div>
                    <Label>Code</Label>
                    <Input
                      value={newItem.code}
                      onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                      placeholder="HMA-001"
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Input
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      placeholder="sqft"
                    />
                  </div>
                  <div>
                    <Label>Unit Cost ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newItem.unit_cost}
                      onChange={(e) => setNewItem({ ...newItem, unit_cost: e.target.value })}
                      placeholder="2.50"
                    />
                  </div>
                  <div>
                    <Label>Material Type</Label>
                    <Input
                      value={newItem.material_type}
                      onChange={(e) => setNewItem({ ...newItem, material_type: e.target.value })}
                      placeholder="Asphalt"
                    />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    placeholder="Additional details..."
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => addItem.mutate()}
                    disabled={!newItem.name || !newItem.code}
                  >
                    Save Item
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingItem(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <ScrollArea className="flex-1">
              {items?.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 mb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{item.name}</span>
                        <span className="text-xs text-muted-foreground">({item.code})</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${item.unit_cost}/{item.unit} • {item.material_type}
                      </div>
                      {item.notes && <div className="text-xs mt-1">{item.notes}</div>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteItem.mutate(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
