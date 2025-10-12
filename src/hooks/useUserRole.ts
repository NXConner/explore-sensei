import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// App-wide roles aligned to Supabase enum public.app_role
export type AppRole =
  | "Super Administrator"
  | "Administrator"
  | "Manager"
  | "Operator"
  | "Viewer";

const ROLE_PRECEDENCE: AppRole[] = [
  "Super Administrator",
  "Administrator",
  "Manager",
  "Operator",
  "Viewer",
];

export function computeEffectiveRole(roles: AppRole[]): AppRole | null {
  if (!roles || roles.length === 0) return null;
  const sorted = [...roles].sort(
    (a, b) => ROLE_PRECEDENCE.indexOf(a) - ROLE_PRECEDENCE.indexOf(b)
  );
  return sorted[0] ?? null;
}

export const useUserRole = () => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (active) setRoles([]);
          return;
        }
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        if (error) throw error;
        const fetched = (data?.map((r: any) => r.role) ?? []) as AppRole[];
        if (active) setRoles(fetched.length > 0 ? fetched : ["Viewer"]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const role = useMemo(() => computeEffectiveRole(roles), [roles]);
  const isAdmin = useMemo(
    () => roles.some((r) => r === "Super Administrator" || r === "Administrator"),
    [roles]
  );

  return { role, roles, isAdmin, loading };
};
