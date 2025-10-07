import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  action?: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Platform',
    description: 'Let\'s get you started with a quick tour of the main features.',
  },
  {
    id: 'add_job',
    title: 'Create Your First Job',
    description: 'Click here to add a new job to your map.',
    target: '[data-onboarding="add-job"]',
  },
  {
    id: 'map_tools',
    title: 'Map Drawing Tools',
    description: 'Use these tools to measure areas and distances on the map.',
    target: '[data-onboarding="map-toolbar"]',
  },
  {
    id: 'schedule',
    title: 'Schedule Jobs',
    description: 'View and manage your job schedule here.',
    target: '[data-onboarding="schedule"]',
  },
  {
    id: 'reports',
    title: 'Generate Reports',
    description: 'Access analytics and generate custom reports.',
    target: '[data-onboarding="analytics"]',
  },
];

export const useOnboarding = () => {
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ["onboarding-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await (supabase as any)
        .from("user_onboarding")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data || {
        completed_steps: [],
        current_step: ONBOARDING_STEPS[0].id,
        is_completed: false,
      };
    },
  });

  const completeStep = useMutation({
    mutationFn: async (stepId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const completedSteps = [...(progress?.completed_steps || []), stepId];
      const nextStepIndex = ONBOARDING_STEPS.findIndex(s => s.id === stepId) + 1;
      const isCompleted = nextStepIndex >= ONBOARDING_STEPS.length;

      const { error } = await (supabase as any)
        .from("user_onboarding")
        .upsert({
          user_id: user.id,
          completed_steps: completedSteps,
          current_step: isCompleted ? null : ONBOARDING_STEPS[nextStepIndex]?.id,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-progress"] });
    },
  });

  const skipOnboarding = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await (supabase as any)
        .from("user_onboarding")
        .upsert({
          user_id: user.id,
          is_completed: true,
          skipped_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-progress"] });
      toast.success("Onboarding skipped");
    },
  });

  const resetOnboarding = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error} = await (supabase as any)
        .from("user_onboarding")
        .update({
          completed_steps: [],
          current_step: ONBOARDING_STEPS[0].id,
          is_completed: false,
          skipped_at: null,
          completed_at: null,
        })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-progress"] });
      toast.success("Onboarding reset");
    },
  });

  const currentStep = ONBOARDING_STEPS.find(s => s.id === (progress as any)?.current_step);
  const completedSteps = (progress as any)?.completed_steps || [];
  const isComplete = (progress as any)?.is_completed || false;

  return {
    progress,
    currentStep,
    completedSteps,
    isComplete,
    isLoading,
    completeStep: completeStep.mutate,
    skipOnboarding: skipOnboarding.mutate,
    resetOnboarding: resetOnboarding.mutate,
    allSteps: ONBOARDING_STEPS,
  };
};