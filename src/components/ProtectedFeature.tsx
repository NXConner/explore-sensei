import React from "react";
import { useUserRole, AppRole } from "@/hooks/useUserRole";

interface ProtectedFeatureProps {
  allowed: AppRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const ProtectedFeature: React.FC<ProtectedFeatureProps> = ({ allowed, fallback = null, children }) => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  if (!role || !allowed.includes(role)) {
    return fallback ? <>{fallback}</> : (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};
