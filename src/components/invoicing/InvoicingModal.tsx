import React, { useState, useEffect } from "react";
import { X, FileText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InvoiceForm } from "./InvoiceForm";
import { format } from "date-fns";

interface InvoicingModalProps {
  onClose: () => void;
}

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  amount_paid: number;
  status: string;
  customers?: { name: string } | null;
  jobs?: { title: string } | null;
}

export const InvoicingModal = ({ onClose }: InvoicingModalProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
      return;
    }

    if (data && data.length > 0) {
      const customerIds = [...new Set(data.map((inv: any) => inv.customer_id).filter(Boolean))];
      const jobIds = [...new Set(data.map((inv: any) => inv.job_id).filter(Boolean))];

      const [customersData, jobsData] = await Promise.all([
        customerIds.length > 0 ? supabase.from("customers").select("id, name").in("id", customerIds) : Promise.resolve({ data: [] }),
        jobIds.length > 0 ? supabase.from("jobs").select("id, title").in("id", jobIds) : Promise.resolve({ data: [] })
      ]);

      const customersMap = new Map((customersData.data || []).map(c => [c.id, c]));
      const jobsMap = new Map((jobsData.data || []).map(j => [j.id, j]));

      const enrichedData = data.map((invoice: any) => ({
        ...invoice,
        customers: invoice.customer_id ? customersMap.get(invoice.customer_id) || null : null,
        jobs: invoice.job_id ? jobsMap.get(invoice.job_id) || null : null
      }));

      setInvoices(enrichedData as any);
    } else {
      setInvoices([]);
    }
  };

  const handleInvoiceCreated = () => {
    setShowForm(false);
    fetchInvoices();
    toast({
      title: "Success",
      description: "Invoice created successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-500/20 text-green-400";
      case "sent": return "bg-blue-500/20 text-blue-400";
      case "overdue": return "bg-red-500/20 text-red-400";
      case "draft": return "bg-gray-500/20 text-gray-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customers?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.jobs?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[90vh] hud-element m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <h2 className="text-2xl font-bold text-glow flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Invoicing & Billing
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary/20 hover:bg-primary/30 border border-primary/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {showForm ? (
            <InvoiceForm
              onSave={handleInvoiceCreated}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <>
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 hud-element border-primary/30"
                />
              </div>

              {/* Invoices Grid */}
              <div className="grid gap-4">
                {filteredInvoices.map((invoice) => (
                  <Card key={invoice.id} className="hud-element border-primary/30 p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-bold">{invoice.invoice_number}</h3>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          {invoice.customers && (
                            <p>
                              <span className="font-medium">Customer:</span> {invoice.customers.name}
                            </p>
                          )}
                          {invoice.jobs && (
                            <p>
                              <span className="font-medium">Job:</span> {invoice.jobs.title}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Issue Date:</span>{" "}
                            {format(new Date(invoice.issue_date), "MMM dd, yyyy")}
                          </p>
                          <p>
                            <span className="font-medium">Due Date:</span>{" "}
                            {format(new Date(invoice.due_date), "MMM dd, yyyy")}
                          </p>
                          <p>
                            <span className="font-medium">Total:</span>{" "}
                            ${invoice.total_amount.toFixed(2)}
                          </p>
                          <p>
                            <span className="font-medium">Paid:</span>{" "}
                            ${invoice.amount_paid.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {filteredInvoices.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No invoices found</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
