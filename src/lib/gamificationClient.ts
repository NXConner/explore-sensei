import { supabase } from "@/integrations/supabase/client";

export type EmitEventInput = {
  event_type: string;
  idempotency_key?: string;
  device_id?: string;
  lat?: number;
  lng?: number;
  metadata?: Record<string, unknown>;
};

async function callEdge(path: string, body?: any) {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) throw new Error("Not authenticated");

  const url = `${import.meta.env.VITE_SUPABASE_URL ?? ""}/functions/v1/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      apikey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? "",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function emitGamificationEvent(input: EmitEventInput) {
  return callEdge("game-process-event", input);
}

export async function fetchGamificationProfile() {
  return callEdge("game-get-profile");
}

export async function fetchLeaderboard() {
  return callEdge("game-get-leaderboard");
}
