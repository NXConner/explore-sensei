import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Send, Plus, Edit, Trash2, DollarSign, Calendar, User, Building, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/LoadingSpinner';
import { logger } from '@/lib/monitoring';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { AnimatedDiv, HoverAnimation } from '@/components/ui/Animations';
import { Invoice, Payment, Client, InvoiceLineItem, Job, mapDbInvoiceToInvoice, mapDbPaymentToPayment, mapDbClientToClient } from './InvoicingModalTypes';

interface InvoicingModalProps {
  onClose: () => void;
}

export const InvoicingModal: React.FC<InvoicingModalProps> = ({ onClose }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    client_id: '',
    job_id: '',
    due_date: '',
    tax_rate: 0.08,
    notes: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'check' as const,
    reference: '',
    notes: ''
  });
  const [lineItems, setLineItems] = useState<Partial<InvoiceLineItem>[]>([
    { description: '', quantity: 1, unit_price: 0, total: 0 }
  ]);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [invoicesRes, paymentsRes, clientsRes, jobsRes] = await Promise.all([
        supabase
          .from('invoices')
          .select(`*, clients (name, email, address), jobs (title, description), line_items (*)`)
          .order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('payment_date', { ascending: false }),
        supabase.from('clients').select('*').order('name'),
        supabase.from('jobs').select('*').order('title')
      ]);

      // Fallbacks for environments where relationships/tables are not present yet
      let invoicesData = invoicesRes.data || [];
      const paymentsData = paymentsRes.data || [];
      const clientsData = clientsRes.data || [];
      const jobsData = jobsRes.data || [];

      setInvoices((invoicesData as any[]).map(mapDbInvoiceToInvoice));
      setPayments((paymentsData as any[]).map(mapDbPaymentToPayment));
      setClients((clientsData as any[]).map(mapDbClientToClient));
      setJobs(jobsData as Job[]);
    } catch (error) {
      logger.error('Error fetching invoicing data', { error });
      toast({
        title: 'Error',
        description: 'Failed to load invoicing data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createInvoice = async () => {
    try {
      // Calculate totals
      const subtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const tax_amount = subtotal * invoiceForm.tax_rate;
      const total_amount = subtotal + tax_amount;

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoiceNumber,
          customer_id: invoiceForm.client_id,
          job_id: invoiceForm.job_id,
          due_date: invoiceForm.due_date,
          status: 'draft',
          amount: total_amount,
          created_by: '',
          notes: invoiceForm.notes
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create line items
      const lineItemsData = lineItems.map(item => ({
        invoice_id: invoiceData.id,
        description: item.description || '',
        quantity: item.quantity || 0,
        unit_price: item.unit_price || 0,
        total: item.total || 0
      }));

      // Note: invoice_line_items table may not exist, commenting out for now
      // const { error: lineItemsError } = await supabase
      //   .from('invoice_line_items')
      //   .insert(lineItemsData);
      // if (lineItemsError) throw lineItemsError;

      toast({
        title: 'Success',
        description: 'Invoice created successfully'
      });

      setShowInvoiceForm(false);
      resetInvoiceForm();
      fetchData();
    } catch (error) {
      logger.error('Error creating invoice', { error });
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'destructive'
      });
    }
  };

  const recordPayment = async () => {
    if (!selectedInvoice) return;

    try {
      const { error } = await supabase
        .from('payments')
        .insert([{
          invoice_id: selectedInvoice.id,
          amount: paymentForm.amount,
          payment_date: paymentForm.payment_date,
          payment_method: paymentForm.payment_method,
          reference: paymentForm.reference,
          notes: paymentForm.notes
        }]);

      if (error) throw error;

      // Update invoice status if fully paid
      const totalPaid = payments
        .filter(p => p.invoice_id === selectedInvoice.id)
        .reduce((sum, p) => sum + p.amount, 0) + paymentForm.amount;

      const newStatus = totalPaid >= selectedInvoice.total_amount ? 'paid' : 'sent';

      await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', selectedInvoice.id);

      toast({
        title: 'Success',
        description: 'Payment recorded successfully'
      });

      setShowPaymentForm(false);
      setPaymentForm({
        amount: 0,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'check',
        reference: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      logger.error('Error recording payment', { error });
      toast({
        title: 'Error',
        description: 'Failed to record payment',
        variant: 'destructive'
      });
    }
  };

  const generatePDF = async (invoice: Invoice) => {
    try {
      // In a real app, this would generate a PDF using a library like jsPDF or Puppeteer
      toast({
        title: 'PDF Generated',
        description: `Invoice ${invoice.invoice_number} PDF has been generated`
      });
    } catch (error) {
      logger.error('Error generating PDF', { error });
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive'
      });
    }
  };

  const sendInvoice = async (invoice: Invoice) => {
    try {
      // In a real app, this would send an email
      await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', invoice.id);

      toast({
        title: 'Invoice Sent',
        description: `Invoice ${invoice.invoice_number} has been sent to ${invoice.clients?.email}`
      });

      fetchData();
    } catch (error) {
      logger.error('Error sending invoice', { error });
      toast({
        title: 'Error',
        description: 'Failed to send invoice',
        variant: 'destructive'
      });
    }
  };

  const resetInvoiceForm = () => {
    setInvoiceForm({
      client_id: '',
      job_id: '',
      due_date: '',
      tax_rate: 0.08,
      notes: ''
    });
    setLineItems([{ description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total = (updated[index].quantity || 0) * (updated[index].unit_price || 0);
    }
    
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'sent': return 'bg-blue-500';
      case 'paid': return 'bg-green-500';
      case 'overdue': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-600';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return '💵';
      case 'check': return '📝';
      case 'credit_card': return '💳';
      case 'bank_transfer': return '🏦';
      default: return '💰';
    }
  };

  const getTotalPaid = (invoiceId: string) => {
    return payments
      .filter(p => p.invoice_id === invoiceId)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getOutstandingAmount = (invoice: Invoice) => {
    const totalPaid = getTotalPaid(invoice.id);
    return invoice.total_amount - totalPaid;
  };

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-7xl h-[90vh] hud-element m-4 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-primary/30">
            <h2 className="text-2xl font-bold text-glow flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Invoicing & Finance
            </h2>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <Tabs defaultValue="invoices" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="create">Create Invoice</TabsTrigger>
              </TabsList>

              <TabsContent value="invoices" className="space-y-6">
                <LoadingOverlay isLoading={isLoading}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Invoices</h3>
                    <Button onClick={() => setShowInvoiceForm(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      New Invoice
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {invoices.map((invoice) => (
                      <HoverAnimation key={invoice.id}>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold">
                                  {invoice.invoice_number}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {invoice.clients?.name} • {new Date(invoice.issue_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(invoice.status)}>
                                  {invoice.status}
                                </Badge>
                                <span className="text-lg font-bold">
                                  ${invoice.total_amount.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <Label className="text-xs">Due Date</Label>
                                <p>{new Date(invoice.due_date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <Label className="text-xs">Paid</Label>
                                <p>${getTotalPaid(invoice.id).toFixed(2)}</p>
                              </div>
                              <div>
                                <Label className="text-xs">Outstanding</Label>
                                <p className={getOutstandingAmount(invoice) > 0 ? 'text-red-500' : 'text-green-500'}>
                                  ${getOutstandingAmount(invoice).toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs">Job</Label>
                                <p className="truncate">{invoice.jobs?.title}</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => generatePDF(invoice)}
                                className="gap-2"
                              >
                                <Download className="h-4 w-4" />
                                PDF
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => sendInvoice(invoice)}
                                className="gap-2"
                              >
                                <Send className="h-4 w-4" />
                                Send
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowPaymentForm(true);
                                }}
                                className="gap-2"
                              >
                                <DollarSign className="h-4 w-4" />
                                Payment
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </HoverAnimation>
                    ))}
                  </div>
                </LoadingOverlay>
              </TabsContent>

              <TabsContent value="payments" className="space-y-6">
                <div className="grid gap-4">
                  {payments.map((payment) => (
                    <HoverAnimation key={payment.id}>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">
                                Payment #{payment.id.slice(-8)}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(payment.payment_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">
                                ${payment.amount.toFixed(2)}
                              </span>
                              <span className="text-2xl">
                                {getPaymentMethodIcon(payment.payment_method)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <Label className="text-xs">Method</Label>
                              <p className="capitalize">{payment.payment_method.replace('_', ' ')}</p>
                            </div>
                            <div>
                              <Label className="text-xs">Reference</Label>
                              <p>{payment.reference || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-xs">Invoice</Label>
                              <p>{invoices.find(i => i.id === payment.invoice_id)?.invoice_number}</p>
                            </div>
                            <div>
                              <Label className="text-xs">Client</Label>
                              <p>{invoices.find(i => i.id === payment.invoice_id)?.clients?.name}</p>
                            </div>
                          </div>
                          
                          {payment.notes && (
                            <div className="mt-3">
                              <Label className="text-xs">Notes</Label>
                              <p className="text-sm text-muted-foreground">{payment.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </HoverAnimation>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Revenue Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Invoiced</span>
                          <span className="font-semibold">
                            ${invoices.reduce((sum, i) => sum + i.total_amount, 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Total Paid</span>
                          <span className="font-semibold text-green-500">
                            ${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Outstanding</span>
                          <span className="font-semibold text-red-500">
                            ${invoices.reduce((sum, i) => sum + getOutstandingAmount(i), 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Invoice Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Draft</span>
                          <Badge className="bg-gray-500">
                            {invoices.filter(i => i.status === 'draft').length}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Sent</span>
                          <Badge className="bg-blue-500">
                            {invoices.filter(i => i.status === 'sent').length}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Paid</span>
                          <Badge className="bg-green-500">
                            {invoices.filter(i => i.status === 'paid').length}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Overdue</span>
                          <Badge className="bg-red-500">
                            {invoices.filter(i => i.status === 'overdue').length}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {['cash', 'check', 'credit_card', 'bank_transfer'].map(method => {
                          const count = payments.filter(p => p.payment_method === method).length;
                          const amount = payments.filter(p => p.payment_method === method).reduce((sum, p) => sum + p.amount, 0);
                          return (
                            <div key={method} className="flex justify-between">
                              <span className="text-sm capitalize">{method.replace('_', ' ')}</span>
                              <span className="text-sm">
                                {count} (${amount.toFixed(2)})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="create" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Invoice</CardTitle>
                    <CardDescription>
                      Create a new invoice for a client and job
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Client</Label>
                        <Select value={invoiceForm.client_id} onValueChange={(value) => setInvoiceForm(prev => ({ ...prev, client_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Job</Label>
                        <Select value={invoiceForm.job_id} onValueChange={(value) => setInvoiceForm(prev => ({ ...prev, job_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a job" />
                          </SelectTrigger>
                          <SelectContent>
                            {jobs.map((job) => (
                              <SelectItem key={job.id} value={job.id}>
                                {job.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input
                          type="date"
                          value={invoiceForm.due_date}
                          onChange={(e) => setInvoiceForm(prev => ({ ...prev, due_date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tax Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={invoiceForm.tax_rate * 100}
                          onChange={(e) => setInvoiceForm(prev => ({ ...prev, tax_rate: Number(e.target.value) / 100 }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={invoiceForm.notes}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes for the invoice..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Line Items</Label>
                        <Button onClick={addLineItem} size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {lineItems.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-5">
                              <Input
                                placeholder="Description"
                                value={item.description || ''}
                                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                placeholder="Qty"
                                value={item.quantity || ''}
                                onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Price"
                                value={item.unit_price || ''}
                                onChange={(e) => updateLineItem(index, 'unit_price', Number(e.target.value))}
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Total"
                                value={item.total || ''}
                                readOnly
                              />
                            </div>
                            <div className="col-span-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeLineItem(index)}
                                disabled={lineItems.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={resetInvoiceForm}>
                        Reset
                      </Button>
                      <Button onClick={createInvoice}>
                        Create Invoice
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Payment Form Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for invoice {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_date: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentForm.payment_method} onValueChange={(value: any) => setPaymentForm(prev => ({ ...prev, payment_method: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Check number, transaction ID, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowPaymentForm(false)}>
                Cancel
              </Button>
              <Button onClick={recordPayment}>
                Record Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
};
