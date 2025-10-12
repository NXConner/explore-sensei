import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ClientHome = () => (
  <div className="container mx-auto p-4 space-y-4">
    <h1 className="text-xl font-bold">Client Portal</h1>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="p-4 space-y-2">
        <h2 className="font-semibold">Projects</h2>
        <p className="text-sm text-muted-foreground">View your active and past projects.</p>
        <Button asChild size="sm"><Link to="projects">Open</Link></Button>
      </Card>
      <Card className="p-4 space-y-2">
        <h2 className="font-semibold">Quotes</h2>
        <p className="text-sm text-muted-foreground">Review and approve quotes.</p>
        <Button asChild size="sm"><Link to="quotes">Open</Link></Button>
      </Card>
      <Card className="p-4 space-y-2">
        <h2 className="font-semibold">Invoices</h2>
        <p className="text-sm text-muted-foreground">Check balances and download PDFs.</p>
        <Button asChild size="sm"><Link to="invoices">Open</Link></Button>
      </Card>
      <Card className="p-4 space-y-2">
        <h2 className="font-semibold">Documents</h2>
        <p className="text-sm text-muted-foreground">Permits, photos, and reports.</p>
        <Button asChild size="sm"><Link to="documents">Open</Link></Button>
      </Card>
    </div>
  </div>
);

const Placeholder = ({ title }: { title: string }) => (
  <div className="container mx-auto p-4">
    <h1 className="text-xl font-bold mb-2">{title}</h1>
    <p className="text-sm text-muted-foreground">This section will be expanded with client-specific data views secured by Supabase RLS.</p>
  </div>
);

export const ClientApp = () => {
  const { role } = useUserRole();
  if (!role) return <Navigate to="/auth" replace />;
  return (
    <Routes>
      <Route path="/" element={<ClientHome />} />
      <Route path="projects" element={<Placeholder title="Projects" />} />
      <Route path="quotes" element={<Placeholder title="Quotes" />} />
      <Route path="invoices" element={<Placeholder title="Invoices" />} />
      <Route path="documents" element={<Placeholder title="Documents" />} />
      <Route path="*" element={<Navigate to="/client" replace />} />
    </Routes>
  );
};

export default ClientApp;
