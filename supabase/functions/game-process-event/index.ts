import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EventBody = {
  event_type: string;
  idempotency_key?: string;
  device_id?: string;
  lat?: number;
  lng?: number;
  metadata?: Record<string, unknown>;
};

const RULES: Record<string, { base: number; dailyCap?: number }> = {
  clock_in: { base: 5 },
  clock_out: { base: 2 },
  photo_uploaded: { base: 3, dailyCap: 15 },
  job_status_updated: { base: 8 },
  weather_alert_configured: { base: 6 },
  map_drawing_saved: { base: 4 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as EventBody;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase env not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) throw new Error("Unauthorized");

    const eventType = body.event_type;
    if (!RULES[eventType]) throw new Error("Unknown event type");

    const idempotencyKey = body.idempotency_key ?? `${user.id}:${eventType}:${Date.now()}`;

    // Upsert event (idempotent)
    await supabase.from("game_events").upsert({
      user_id: user.id,
      event_type: eventType,
      idempotency_key: idempotencyKey,
      device_id: body.device_id,
      lat: body.lat,
      lng: body.lng,
      metadata: body.metadata ?? {},
    }, { onConflict: "idempotency_key" });

    // Daily cap calculation
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const { data: todayEvents } = await supabase
      .from("game_events")
      .select("id, event_type, created_at")
      .gte("created_at", startOfDay.toISOString())
      .eq("event_type", eventType)
      .order("created_at", { ascending: false });

    const rule = RULES[eventType];
    const occurrencesToday = (todayEvents?.length ?? 0);
    let awarded = rule.base;
    if (rule.dailyCap && occurrencesToday * rule.base >= rule.dailyCap) {
      awarded = 0; // cap reached
    } else if (rule.dailyCap && (occurrencesToday + 1) * rule.base > rule.dailyCap) {
      // partial credit to meet cap exactly
      awarded = Math.max(0, rule.dailyCap - occurrencesToday * rule.base);
    }

    // Load or create profile
    const { data: profile } = await supabase
      .from("game_profiles")
      .select("user_id, points, xp, level, streak_current, streak_longest, last_event_date")
      .eq("user_id", user.id)
      .maybeSingle();

    const lastEventDate = profile?.last_event_date ? new Date(profile.last_event_date) : undefined;
    const lastDateOnly = lastEventDate ? new Date(lastEventDate.getFullYear(), lastEventDate.getMonth(), lastEventDate.getDate()) : undefined;
    const yesterday = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);

    let streakCurrent = profile?.streak_current ?? 0;
    let streakLongest = profile?.streak_longest ?? 0;

    if (!lastDateOnly) {
      streakCurrent = 1;
    } else if (lastDateOnly.getTime() === yesterday.getTime()) {
      streakCurrent = streakCurrent + 1;
    } else if (lastDateOnly.getTime() === startOfDay.getTime()) {
      // already counted today
      streakCurrent = streakCurrent;
    } else {
      streakCurrent = 1; // reset
    }
    if (streakCurrent > streakLongest) streakLongest = streakCurrent;

    const nextPoints = (profile?.points ?? 0) + awarded;
    const nextXp = (profile?.xp ?? 0) + awarded;

    // Compute level client-side analogue: simple thresholds
    const levelThresholds = [0,100,250,500,900,1400,2000,2800,3800,5000];
    let nextLevel = 1;
    for (let i = 0; i < levelThresholds.length; i++) {
      if (nextXp >= levelThresholds[i]) nextLevel = i + 1;
    }

    const upsertProfile = {
      user_id: user.id,
      points: nextPoints,
      xp: nextXp,
      level: nextLevel,
      streak_current: streakCurrent,
      streak_longest: streakLongest,
      last_event_date: startOfDay.toISOString().slice(0,10),
      updated_at: new Date().toISOString(),
    };

    await supabase.from("game_profiles").upsert(upsertProfile, { onConflict: "user_id" });

    // Badges and quest progress
    let newBadges: string[] = [];
    if (!profile) {
      const { error: badgeErr } = await supabase.from("game_badges").insert({
        user_id: user.id,
        badge_code: "FIRST_EVENT",
        title: "First Steps",
        description: "Completed your first action",
      });
      if (!badgeErr) newBadges.push("FIRST_EVENT");
    }
    if (eventType === "clock_in" && streakCurrent >= 7) {
      const { error: b2 } = await supabase.from("game_badges").insert({
        user_id: user.id,
        badge_code: "STREAK_WEEK",
        title: "On a Roll",
        description: "Maintained a 7-day streak",
      });
      if (!b2) newBadges.push("STREAK_WEEK");
    }
    if (eventType === "photo_uploaded") {
      // increment a generic quest counter if quest exists
      await supabase.rpc("upsert_quest_progress", { p_user_id: user.id, p_code: "PHOTO_PRO", p_key: "count", p_inc: 1 });
    }

    return new Response(
      JSON.stringify({ success: true, awarded_points: awarded, profile: upsertProfile, new_badges: newBadges }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message ?? String(error) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
