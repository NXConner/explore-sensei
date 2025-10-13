// Type definitions for InvoicingModal to match database schema

export interface DbInvoice {
  id: string;
  invoice_number: string;
  customer_id: string; // DB uses customer_id
  job_id: string;
  due_date: string;
  status: string;
  amount: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DbPayment {
  id: string;
  proposal_id: string; // DB uses proposal_id
  amount: number;
  payment_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DbClient {
  id: string;
  name: string;
  contact: string;
  phone: string;
  user_id: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  job_id: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
    email?: string;
    address?: string;
  };
  jobs?: {
    title: string;
    description: string;
  };
  line_items?: InvoiceLineItem[];
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  status: string;
  reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
}

// Helper to convert DB invoice to app invoice
export function mapDbInvoiceToInvoice(dbInvoice: any): Invoice {
  return {
    id: dbInvoice.id,
    invoice_number: dbInvoice.invoice_number,
    client_id: dbInvoice.customer_id || dbInvoice.client_id,
    job_id: dbInvoice.job_id,
    issue_date: dbInvoice.created_at,
    due_date: dbInvoice.due_date,
    status: dbInvoice.status as any,
    subtotal: dbInvoice.amount || 0,
    tax_rate: 0,
    tax_amount: 0,
    total_amount: dbInvoice.amount || 0,
    notes: dbInvoice.notes,
    created_at: dbInvoice.created_at,
    updated_at: dbInvoice.updated_at,
    clients: dbInvoice.clients,
    jobs: dbInvoice.jobs,
    line_items: dbInvoice.line_items
  };
}

export function mapDbPaymentToPayment(dbPayment: any): Payment {
  return {
    id: dbPayment.id,
    invoice_id: dbPayment.proposal_id || dbPayment.invoice_id,
    amount: dbPayment.amount,
    payment_method: dbPayment.payment_method || 'unknown',
    payment_date: dbPayment.payment_date,
    status: dbPayment.status,
    reference: dbPayment.reference,
    notes: dbPayment.notes,
    created_at: dbPayment.created_at,
    updated_at: dbPayment.updated_at
  };
}

export function mapDbClientToClient(dbClient: any): Client {
  return {
    id: dbClient.id,
    name: dbClient.name,
    contact_name: dbClient.contact,
    email: dbClient.email || dbClient.contact,
    phone: dbClient.phone,
    address: dbClient.address,
    created_at: dbClient.created_at
  };
}
