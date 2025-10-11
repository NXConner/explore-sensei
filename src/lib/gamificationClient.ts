import { supabase } from "@/integrations/supabase/client";

export type EmitEventInput = {
  event_type: string;
  idempotency_key?: string;
  device_id?: string;
  lat?: number;
  lng?: number;
  metadata?: Record<string, unknown>;
};

export async function emitGamificationEvent(input: EmitEventInput) {
  const { data, error } = await supabase.functions.invoke("game-process-event", {
    body: input,
  });
  if (error) throw error;
  return data;
}

export async function fetchGamificationProfile() {
  const { data, error } = await supabase.functions.invoke("game-get-profile");
  if (error) throw error;
  return data;
}

export async function fetchLeaderboard() {
  const { data, error } = await supabase.functions.invoke("game-get-leaderboard");
  if (error) throw error;
  return data;
}
