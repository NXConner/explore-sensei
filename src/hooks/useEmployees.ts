import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Employee {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role?: string;
  hire_date?: string;
  hourly_rate?: number;
  status?: string;
  created_at?: string;
}

export const useEmployees = () => {
  const { data: employees, isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("employees")
        .select("*")
        .order("first_name", { ascending: true });
      
      if (error) throw error;
      return (data || []) as Employee[];
    },
  });

  return {
    employees: employees || [],
    isLoading,
    error,
  };
};
