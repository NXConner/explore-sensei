import { supabase } from "@/integrations/supabase/client";

export type EmitEventInput = {
  event_type: string;
  idempotency_key?: string;
  device_id?: string;
  lat?: number;
  lng?: number;
  metadata?: Record<string, unknown>;
};

function getOrCreateDeviceId(): string {
  try {
    const key = "device_id";
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    localStorage.setItem(key, id);
    return id;
  } catch {
    return "unknown-device";
  }
}

async function getGeo(): Promise<{ lat?: number; lng?: number }> {
  if (!("geolocation" in navigator)) return {};
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({}),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 2_000 }
    );
  });
}

export async function emitGamificationEvent(input: EmitEventInput) {
  // Check if user is authenticated first
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.warn("Cannot emit gamification event: User not authenticated");
    return null;
  }

  const device_id = input.device_id ?? getOrCreateDeviceId();
  const geo = await getGeo();
  const payload = { ...geo, ...input, device_id };
  const { data, error } = await supabase.functions.invoke("game-process-event", {
    body: payload,
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
