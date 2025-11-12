import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Search, Building } from "lucide-react";
import { format } from "date-fns";

const ClientHome = () => (
  <div className="min-h-screen bg-background w-full">
    <div className="container mx-auto p-6 space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-glow text-primary mb-2">Client Portal</h1>
      <p className="text-muted-foreground">Manage your projects, quotes, invoices, and documents</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
      <Card className="tactical-panel p-6 space-y-3 hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-3">
          <Building className="w-8 h-8 text-primary" />
          <div>
            <h2 className="font-semibold text-lg">Projects</h2>
            <p className="text-sm text-muted-foreground">View your active and past projects</p>
          </div>
        </div>
        <Button asChild className="w-full">
          <Link to="projects">View Projects</Link>
        </Button>
      </Card>
      <Card className="tactical-panel p-6 space-y-3 hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div>
            <h2 className="font-semibold text-lg">Quotes</h2>
            <p className="text-sm text-muted-foreground">Review and approve quotes</p>
          </div>
        </div>
        <Button asChild className="w-full">
          <Link to="quotes">View Quotes</Link>
        </Button>
      </Card>
      <Card className="tactical-panel p-6 space-y-3 hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div>
            <h2 className="font-semibold text-lg">Invoices</h2>
            <p className="text-sm text-muted-foreground">Check balances and download PDFs</p>
          </div>
        </div>
        <Button asChild className="w-full">
          <Link to="invoices">View Invoices</Link>
        </Button>
      </Card>
      <Card className="tactical-panel p-6 space-y-3 hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div>
            <h2 className="font-semibold text-lg">Documents</h2>
            <p className="text-sm text-muted-foreground">Permits, photos, and reports</p>
          </div>
        </div>
        <Button asChild className="w-full">
          <Link to="documents">View Documents</Link>
        </Button>
      </Card>
    </div>
    </div>
  </div>
);

interface Quote {
  id: string;
  quote_number?: string;
  created_at: string;
  total_amount?: number;
  status?: string;
  customers?: { name: string } | null;
  jobs?: { title: string } | null;
}

const QuotesPage = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quotes")
        .select(`
          *,
          customers:customer_id (name),
          jobs:job_id (title)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.warn("Quotes table may not exist or query failed:", error);
        setQuotes([]);
        return;
      }
      setQuotes(data || []);
    } catch (error: any) {
      console.error("Error fetching quotes:", error);
      setQuotes([]);
      // Don't show toast for missing tables - just show empty state
      if (!error.message?.includes("relation") && !error.message?.includes("does not exist")) {
        toast({
          title: "Error",
          description: error.message || "Failed to load quotes",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotes = quotes.filter((quote) => {
    const search = searchQuery.toLowerCase();
    return (
      quote.quote_number?.toLowerCase().includes(search) ||
      quote.customers?.name?.toLowerCase().includes(search) ||
      quote.jobs?.title?.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status?: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "outline", label: "Pending" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
      expired: { variant: "secondary", label: "Expired" },
    };
    const statusInfo = statusMap[status || "pending"] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-glow text-primary mb-2">Quotes</h1>
          <p className="text-muted-foreground">Review and manage your project quotes</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search quotes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading quotes...</div>
        ) : filteredQuotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No quotes found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">
                    {quote.quote_number || `Q-${quote.id.slice(0, 8)}`}
                  </TableCell>
                  <TableCell>{quote.customers?.name || "N/A"}</TableCell>
                  <TableCell>{quote.jobs?.title || "N/A"}</TableCell>
                  <TableCell>
                    {quote.created_at ? format(new Date(quote.created_at), "MMM dd, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>
                    {quote.total_amount ? `$${quote.total_amount.toLocaleString()}` : "N/A"}
                  </TableCell>
                  <TableCell>{getStatusBadge(quote.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      </div>
    </div>
  );
};

interface Invoice {
  id: string;
  invoice_number?: string;
  issue_date?: string;
  due_date?: string;
  total_amount?: number;
  amount_paid?: number;
  status?: string;
  customers?: { name: string } | null;
  jobs?: { title: string } | null;
}

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          customers:customer_id (name),
          jobs:job_id (title)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.warn("Invoices table may not exist or query failed:", error);
        setInvoices([]);
        return;
      }
      setInvoices(data || []);
    } catch (error: any) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
      // Don't show toast for missing tables - just show empty state
      if (!error.message?.includes("relation") && !error.message?.includes("does not exist")) {
        toast({
          title: "Error",
          description: error.message || "Failed to load invoices",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const search = searchQuery.toLowerCase();
    return (
      invoice.invoice_number?.toLowerCase().includes(search) ||
      invoice.customers?.name?.toLowerCase().includes(search) ||
      invoice.jobs?.title?.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status?: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "outline", label: "Draft" },
      sent: { variant: "secondary", label: "Sent" },
      paid: { variant: "default", label: "Paid" },
      overdue: { variant: "destructive", label: "Overdue" },
      partial: { variant: "outline", label: "Partial" },
    };
    const statusInfo = statusMap[status || "draft"] || statusMap.draft;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getBalance = (invoice: Invoice) => {
    const total = invoice.total_amount || 0;
    const paid = invoice.amount_paid || 0;
    return total - paid;
  };

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-glow text-primary mb-2">Invoices</h1>
            <p className="text-muted-foreground">View and manage your invoices</p>
          </div>
        </div>

      <Card className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No invoices found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const balance = getBalance(invoice);
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`}
                    </TableCell>
                    <TableCell>{invoice.customers?.name || "N/A"}</TableCell>
                    <TableCell>{invoice.jobs?.title || "N/A"}</TableCell>
                    <TableCell>
                      {invoice.issue_date ? format(new Date(invoice.issue_date), "MMM dd, yyyy") : "N/A"}
                    </TableCell>
                    <TableCell>
                      {invoice.due_date ? format(new Date(invoice.due_date), "MMM dd, yyyy") : "N/A"}
                    </TableCell>
                    <TableCell>
                      {invoice.total_amount ? `$${invoice.total_amount.toLocaleString()}` : "N/A"}
                    </TableCell>
                    <TableCell className={balance > 0 ? "text-destructive font-semibold" : "text-muted-foreground"}>
                      ${balance.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
      </div>
    </div>
  );
};

interface Project {
  id: string;
  title?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  progress?: number;
  budget?: number;
  location?: string;
  clients?: { name: string } | null;
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          clients:client_id (name)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.warn("Jobs table may not exist or query failed:", error);
        setProjects([]);
        return;
      }
      setProjects(data || []);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      setProjects([]);
      // Don't show toast for missing tables - just show empty state
      if (!error.message?.includes("relation") && !error.message?.includes("does not exist")) {
        toast({
          title: "Error",
          description: error.message || "Failed to load projects",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const search = searchQuery.toLowerCase();
    return (
      project.title?.toLowerCase().includes(search) ||
      project.clients?.name?.toLowerCase().includes(search) ||
      project.location?.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status?: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "outline", label: "Pending" },
      "in progress": { variant: "default", label: "In Progress" },
      completed: { variant: "secondary", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const statusInfo = statusMap[status || "pending"] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-glow text-primary mb-2">Projects</h1>
            <p className="text-muted-foreground">View and manage your active and past projects</p>
          </div>
        </div>

      <Card className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No projects found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    {project.title || `Project ${project.id.slice(0, 8)}`}
                  </TableCell>
                  <TableCell>{project.clients?.name || "N/A"}</TableCell>
                  <TableCell>{project.location || "N/A"}</TableCell>
                  <TableCell>
                    {project.start_date ? format(new Date(project.start_date), "MMM dd, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>
                    {project.end_date ? format(new Date(project.end_date), "MMM dd, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-sm">{project.progress || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {project.budget ? `$${project.budget.toLocaleString()}` : "N/A"}
                  </TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      </div>
    </div>
  );
};

interface Document {
  id: string;
  name?: string;
  type?: string;
  size?: number;
  uploaded_at?: string;
  url?: string;
  project_id?: string;
  jobs?: { title: string } | null;
}

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Try project_documents first, fallback to job_photos
      const { data: projectDocs, error: projectError } = await supabase
        .from("project_documents")
        .select(`
          *,
          jobs:project_id (title)
        `)
        .order("uploaded_at", { ascending: false })
        .limit(50);

      if (!projectError && projectDocs) {
        setDocuments(projectDocs || []);
        setLoading(false);
        return;
      }

      // Fallback to job_photos
      const { data: photos, error: photosError } = await supabase
        .from("job_photos")
        .select(`
          id,
          file_name as name,
          url,
          taken_at as uploaded_at,
          jobs:job_id (title)
        `)
        .order("taken_at", { ascending: false })
        .limit(50);

      if (photosError) {
        console.warn("Documents tables may not exist:", photosError);
        setDocuments([]);
        return;
      }
      setDocuments(photos || []);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
      // Don't show toast for missing tables - just show empty state
      if (!error.message?.includes("relation") && !error.message?.includes("does not exist")) {
        toast({
          title: "Error",
          description: error.message || "Failed to load documents",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const search = searchQuery.toLowerCase();
    return (
      doc.name?.toLowerCase().includes(search) ||
      doc.type?.toLowerCase().includes(search) ||
      doc.jobs?.title?.toLowerCase().includes(search)
    );
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileTypeIcon = (type?: string) => {
    if (!type) return <FileText className="w-4 h-4" />;
    if (type.includes("image")) return "🖼️";
    if (type.includes("pdf")) return "📄";
    if (type.includes("word")) return "📝";
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-glow text-primary mb-2">Documents</h1>
            <p className="text-muted-foreground">View and manage project documents, permits, photos, and reports</p>
          </div>
        </div>

      <Card className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading documents...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No documents found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {getFileTypeIcon(doc.type)}
                    {doc.name || "Untitled Document"}
                  </TableCell>
                  <TableCell>{doc.type || "N/A"}</TableCell>
                  <TableCell>{doc.jobs?.title || "N/A"}</TableCell>
                  <TableCell>{formatFileSize(doc.size)}</TableCell>
                  <TableCell>
                    {doc.uploaded_at ? format(new Date(doc.uploaded_at), "MMM dd, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>
                    {doc.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      </div>
    </div>
  );
};

const Placeholder = ({ title }: { title: string }) => (
  <div className="container mx-auto p-6">
    <h1 className="text-3xl font-bold text-glow text-primary mb-2">{title}</h1>
    <p className="text-muted-foreground">This section will be expanded with client-specific data views secured by Supabase RLS.</p>
  </div>
);

export const ClientApp = () => {
  const { role } = useUserRole();
  if (!role) return <Navigate to="/auth" replace />;
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<ClientHome />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="quotes" element={<QuotesPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="*" element={<Navigate to="/client" replace />} />
      </Routes>
    </div>
  );
};

export default ClientApp;
