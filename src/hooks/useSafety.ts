import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SafetyIncident {
  id: string;
  incident_type: string;
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  description: string;
  location?: string;
  job_id?: string;
  reported_by?: string;
  involved_employees?: string[];
  witnesses?: string[];
  injury_occurred: boolean;
  medical_attention: boolean;
  property_damage: boolean;
  root_cause?: string;
  corrective_actions?: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  incident_date: string;
  reported_at: string;
}

export interface SafetyTraining {
  id: string;
  employee_id: string;
  training_name: string;
  training_type: string;
  completion_date: string;
  expiration_date?: string;
  certificate_url?: string;
  instructor?: string;
  notes?: string;
}

export const useSafety = () => {
  const queryClient = useQueryClient();

  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ["safety-incidents"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("safety_incidents")
        .select("*")
        .order("incident_date", { ascending: false });
      if (error) throw error;
      return data as unknown as SafetyIncident[];
    },
  });

  const { data: trainings, isLoading: trainingsLoading } = useQuery({
    queryKey: ["safety-training"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("safety_training")
        .select("*")
        .order("completion_date", { ascending: false });
      if (error) throw error;
      return data as unknown as SafetyTraining[];
    },
  });

  const reportIncident = useMutation({
    mutationFn: async (incident: Omit<SafetyIncident, 'id' | 'reported_at'>) => {
      const { data, error } = await (supabase as any)
        .from("safety_incidents")
        .insert(incident)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety-incidents"] });
      toast.success("Incident reported");
    },
    onError: (error: Error) => {
      toast.error(`Failed to report incident: ${error.message}`);
    },
  });

  const updateIncident = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SafetyIncident> & { id: string }) => {
      const { error } = await (supabase as any)
        .from("safety_incidents")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety-incidents"] });
      toast.success("Incident updated");
    },
  });

  const addTraining = useMutation({
    mutationFn: async (training: Omit<SafetyTraining, 'id'>) => {
      const { data, error } = await (supabase as any)
        .from("safety_training")
        .insert(training)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety-training"] });
      toast.success("Training record added");
    },
  });

  const expiringTrainings = trainings?.filter(t => {
    if (!t.expiration_date) return false;
    const daysUntilExpiry = Math.floor(
      (new Date(t.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  }) || [];

  return {
    incidents: incidents || [],
    trainings: trainings || [],
    expiringTrainings,
    isLoading: incidentsLoading || trainingsLoading,
    reportIncident: reportIncident.mutate,
    updateIncident: updateIncident.mutate,
    addTraining: addTraining.mutate,
  };
};