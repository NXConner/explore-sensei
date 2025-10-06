import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, Download, Save } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEstimates } from "@/hooks/useEstimates";
import { useToast } from "@/hooks/use-toast";

interface EstimateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EstimateLineItem {
  item_id: string;
  name: string;
  code: string;
  unit: string;
  unit_cost: number;
  quantity: number;
  total: number;
}

export const EstimateCalculatorModal = ({ isOpen, onClose }: EstimateCalculatorModalProps) => {
  const { toast } = useToast();
  const { createEstimate } = useEstimates();
  const [selectedCatalog, setSelectedCatalog] = useState<string>("");
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>([]);
  const [quantity, setQuantity] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [jobSiteAddress, setJobSiteAddress] = useState("");

  const { data: catalogs } = useQuery({
    queryKey: ["cost-catalogs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cost_catalog").select("*");
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
        .eq("catalog_id", selectedCatalog);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCatalog,
  });

  const addLineItem = (item: any) => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return;

    const newLine: EstimateLineItem = {
      item_id: item.id,
      name: item.name,
      code: item.code,
      unit: item.unit,
      unit_cost: item.unit_cost,
      quantity: qty,
      total: qty * item.unit_cost,
    };

    setLineItems([...lineItems, newLine]);
    setQuantity("");
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 8.0;
  const tax = subtotal * (taxRate / 100);
  const grandTotal = subtotal + tax;

  const handleSaveEstimate = () => {
    if (!customerName || lineItems.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please add customer name and at least one line item.",
        variant: "destructive",
      });
      return;
    }

    createEstimate({
      customer_name: customerName,
      customer_email: customerEmail || undefined,
      job_site_address: jobSiteAddress || undefined,
      catalog_id: selectedCatalog || undefined,
      subtotal: subtotal,
      tax_rate: taxRate,
      tax_amount: tax,
      total: grandTotal,
      status: 'draft',
      line_items: lineItems.map(item => ({
        cost_item_id: item.item_id,
        item_name: item.name,
        item_code: item.code,
        quantity: item.quantity,
        unit: item.unit,
        unit_cost: item.unit_cost,
        line_total: item.total,
      })),
    });

    // Reset form
    setLineItems([]);
    setCustomerName("");
    setCustomerEmail("");
    setJobSiteAddress("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Estimate Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
          <div className="border rounded-lg p-4 flex flex-col">
            <h3 className="font-semibold mb-3">Customer & Items</h3>
            
            <div className="space-y-3 mb-4">
              <div>
                <Label>Customer Name *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label>Customer Email</Label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label>Job Site Address</Label>
                <Input
                  value={jobSiteAddress}
                  onChange={(e) => setJobSiteAddress(e.target.value)}
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <Label>Catalog</Label>
                <Select value={selectedCatalog} onValueChange={setSelectedCatalog}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select catalog" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogs?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {items?.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 mb-2 hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => addLineItem(item)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.code} • ${item.unit_cost}/{item.unit}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          <div className="border rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Estimate Summary</h3>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleSaveEstimate}
                  disabled={!customerName || lineItems.length === 0}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-1" />
                  Export PDF
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 mb-4">
              {lineItems.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No items added yet
                </div>
              ) : (
                <div className="space-y-2">
                  {lineItems.map((line, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-semibold">{line.name}</div>
                          <div className="text-sm text-muted-foreground">{line.code}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeLineItem(index)}
                        >
                          ×
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Qty:</span> {line.quantity} {line.unit}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rate:</span> ${line.unit_cost.toFixed(2)}
                        </div>
                        <div className="text-right font-semibold">
                          ${line.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8%):</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-primary">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
