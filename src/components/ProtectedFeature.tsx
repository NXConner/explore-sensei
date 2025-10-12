import React from "react";
import { useUserRole, AppRole } from "@/hooks/useUserRole";

interface ProtectedFeatureProps {
  allowed: AppRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const ProtectedFeature: React.FC<ProtectedFeatureProps> = ({ allowed, fallback = null, children }) => {
  const { role, loading } = useUserRole();

  if (loading) return null;
  if (!role || !allowed.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
};
