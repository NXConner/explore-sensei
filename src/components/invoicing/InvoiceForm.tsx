import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addDays, format } from "date-fns";

interface InvoiceFormProps {
  onSave: () => void;
  onCancel: () => void;
}

interface Customer {
  id: string;
  name: string;
}

interface Job {
  id: string;
  title: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export const InvoiceForm = ({ onSave, onCancel }: InvoiceFormProps) => {
  const [customerId, setCustomerId] = useState("");
  const [jobId, setJobId] = useState("");
  const [issueDate, setIssueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [paymentTerms, setPaymentTerms] = useState(30);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price: 0 }
  ]);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
    fetchJobs();
  }, []);

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from("customers")
      .select("id, name")
      .order("name");
    
    if (data) setCustomers(data);
  };

  const fetchJobs = async () => {
    const { data } = await supabase
      .from("jobs")
      .select("id, title")
      .order("title");
    
    if (data) setJobs(data);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    return `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId || lineItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select a customer and add at least one line item",
        variant: "destructive",
      });
      return;
    }

    const dueDate = addDays(new Date(issueDate), paymentTerms);
    const subtotal = calculateSubtotal();
    const taxAmount = calculateTax();
    const totalAmount = calculateTotal();

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert([{
        invoice_number: generateInvoiceNumber(),
        customer_id: customerId,
        job_id: jobId || null,
        issue_date: issueDate,
        due_date: format(dueDate, "yyyy-MM-dd"),
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        amount_paid: 0,
        payment_terms: paymentTerms,
        notes: notes || null,
        status: "draft"
      } as any])
      .select()
      .single();

    if (invoiceError || !invoice) {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
      return;
    }

    const items = lineItems.map(item => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.quantity * item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(items);

    if (itemsError) {
      toast({
        title: "Error",
        description: "Failed to create invoice items",
        variant: "destructive",
      });
      return;
    }

    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer">Customer *</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger className="hud-element border-primary/30">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="job">Job (Optional)</Label>
          <Select value={jobId} onValueChange={setJobId}>
            <SelectTrigger className="hud-element border-primary/30">
              <SelectValue placeholder="Select job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="issueDate">Issue Date</Label>
          <Input
            id="issueDate"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="hud-element border-primary/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
          <Input
            id="paymentTerms"
            type="number"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(Number(e.target.value))}
            className="hud-element border-primary/30"
            min="0"
          />
        </div>
      </div>

      {/* Line Items */}
      <Card className="hud-element border-primary/30 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Line Items</h3>
          <Button type="button" onClick={addLineItem} size="sm" variant="ghost">
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateLineItem(index, "description", e.target.value)}
                  className="hud-element border-primary/30"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(index, "quantity", Number(e.target.value))}
                  className="hud-element border-primary/30"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Price"
                  value={item.unit_price}
                  onChange={(e) => updateLineItem(index, "unit_price", Number(e.target.value))}
                  className="hud-element border-primary/30"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2">
                <Input
                  value={`$${(item.quantity * item.unit_price).toFixed(2)}`}
                  disabled
                  className="hud-element border-primary/30"
                />
              </div>
              <div className="col-span-1">
                {lineItems.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-bold">${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Tax Rate (%):</span>
            <Input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-20 h-8 hud-element border-primary/30 text-right"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax:</span>
            <span className="font-bold">${calculateTax().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg border-t border-primary/30 pt-2">
            <span className="font-bold">Total:</span>
            <span className="font-bold text-primary">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes or payment instructions..."
          className="hud-element border-primary/30"
          rows={3}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary/20 hover:bg-primary/30 border border-primary/30"
        >
          Create Invoice
        </Button>
      </div>
    </form>
  );
};
