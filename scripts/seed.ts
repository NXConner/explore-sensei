/*
  Seed script to populate realistic data using the Supabase service role.
  Usage: npm run db:seed (ensure VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are configured)
*/
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("[seed] Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const CONSTANT_IDS = {
  clientStMichael: "0f5e2c4a-1c0c-4b35-a86c-faa4928f6401",
  jobSealcoat: "1c8844fa-53fb-4f4f-8c21-5fc279b84bc3",
  catalogStandard: "2f0ce210-5e9f-4a4e-9b58-2f69a4ab9ad9",
  costItemSealcoat: "8297c02d-0e41-47a8-8b32-4ad0e0d7a0b9",
  costItemCrack: "5b3d8f4d-b752-45c3-a5af-9ea4ceb0fbe0",
  missionWeather: "3d6af4d2-70e4-42f8-bf2f-383d8dd7a4f1",
  missionCrew: "4cb24777-0b79-4931-b3eb-8731ef4b65fb",
  missionRevenue: "5f13e1e8-6bc2-4d7a-8e22-7f9f4cdf5337",
  hudPreferenceAdmin: "6f35fc3d-22d8-4e90-862f-db1a8a13c9e1",
  alertOps: "7bd3c1b8-9875-46c8-aa0f-9b6e84b8e8a9",
};

async function ensureAdminBootstrap(adminEmail: string) {
  const { data: adminLookup, error } = await supabase.auth.admin.getUserByEmail(adminEmail);
  if (error) {
    throw new Error(`Failed to query Supabase auth admin API: ${error.message}`);
  }
  if (!adminLookup?.user) {
    console.warn(
      `[seed] Admin user ${adminEmail} not found. Create this account via Supabase dashboard before re-running the seed.`,
    );
    return { adminId: null };
  }

  const adminId = adminLookup.user.id;
  console.log(`[seed] Found admin user ${adminEmail} (${adminId}).`);

  await supabase
    .from("profiles")
    .upsert(
      {
        id: adminId,
        user_id: adminId,
        email: adminEmail,
        full_name: adminLookup.user.user_metadata?.full_name ?? "Super Admin",
        onboarding_status: "completed",
        preferences: { theme: "tactical-dark" },
      },
      { onConflict: "user_id" },
    );

  await supabase
    .from("user_roles")
    .upsert({ user_id: adminId, role_id: "super_admin" }, { onConflict: "user_id,role_id" });

  await supabase
    .from("hud_preferences")
    .upsert(
      {
        id: CONSTANT_IDS.hudPreferenceAdmin,
        user_id: adminId,
        theme_id: "division-shd",
        fidelity_mode: "faithful",
        wallpaper: {
          presetId: "division-agent",
          opacity: 68,
        },
        wallpaper_opacity: 68,
        feature_flags: {
          divisionHudEnabled: true,
          tacticalMapEnabled: true,
        },
        layout: {
          panels: ["mission-feed", "map", "crew-status", "weather"],
          compactMode: false,
        },
        sound_enabled: true,
        glitch_intensity: 28,
        animation_speed: 90,
      },
      { onConflict: "user_id" },
    );

  await supabase
    .from("mission_alert_subscriptions")
    .upsert(
      {
        id: CONSTANT_IDS.alertOps,
        user_id: adminId,
        subscription_type: "operations",
        channels: ["in-app", "email"],
        preferences: { severity: ["critical", "warning"], quiet_hours_start: "21:00" },
      },
      { onConflict: "user_id,subscription_type" },
    );

  return { adminId };
}

async function seedCoreEntities(adminId: string | null) {
  const clientPayload = {
    id: CONSTANT_IDS.clientStMichael,
    slug: "st-michael-church",
    name: "St. Michael Church",
    contact_name: "Pastor John",
    email: "office@stmichael.org",
    phone: "555-123-4567",
    address: "123 Church St",
    city: "Stuart",
    state: "VA",
    postal_code: "24171",
    country: "USA",
    metadata: { campus: "Main", worshipServices: 4 },
    owner_id: adminId,
    created_by: adminId,
  };

  await supabase.from("clients").upsert(clientPayload, { onConflict: "slug" });

  const jobPayload = {
    id: CONSTANT_IDS.jobSealcoat,
    client_id: CONSTANT_IDS.clientStMichael,
    title: "Church Parking Lot Sealcoat",
    description: "Sealcoat, crack fill, and restripe sanctuary parking lot.",
    status: "in_progress",
    priority: "high",
    scheduled_start: new Date().toISOString(),
    progress: 45,
    latitude: 36.6403,
    longitude: -80.2667,
    metadata: { shift: "day", crew: ["Ava Mason", "Ethan Cole"] },
    owner_id: adminId,
    created_by: adminId,
  };

  await supabase.from("jobs").upsert(jobPayload, { onConflict: "id" });

  await supabase
    .from("inventory_items")
    .upsert(
      [
        {
          sku: "SC-001",
          name: "Sealcoat",
          category: "Materials",
          unit: "gal",
          quantity: 500,
          reorder_level: 100,
          unit_cost: 2.5,
          created_by: adminId,
        },
        {
          sku: "CS-010",
          name: "Crack Sealant",
          category: "Materials",
          unit: "lb",
          quantity: 200,
          reorder_level: 50,
          unit_cost: 1.2,
          created_by: adminId,
        },
      ],
      { onConflict: "sku" },
    );

  await supabase
    .from("cost_catalog")
    .upsert(
      {
        id: CONSTANT_IDS.catalogStandard,
        name: "Standard Pavement Pricing",
        description: "Baseline catalog for sealcoat, crack fill, and striping.",
        metadata: { currency: "USD" },
        created_by: adminId,
      },
      { onConflict: "id" },
    );

  await supabase
    .from("cost_items")
    .upsert(
      [
        {
          id: CONSTANT_IDS.costItemSealcoat,
          catalog_id: CONSTANT_IDS.catalogStandard,
          item_code: "SC-001",
          name: "Sealcoat Application",
          unit: "sqft",
          unit_cost: 0.15,
          markup_rate: 35,
        },
        {
          id: CONSTANT_IDS.costItemCrack,
          catalog_id: CONSTANT_IDS.catalogStandard,
          item_code: "CS-010",
          name: "Crack Sealing",
          unit: "lf",
          unit_cost: 1.25,
          markup_rate: 42,
        },
      ],
      { onConflict: "id" },
    );
}

async function seedMissionIntelligence(adminId: string | null) {
  const events = [
    {
      id: CONSTANT_IDS.missionWeather,
      event_type: "weather.alert",
      title: "Weather Watch – Thunderstorms",
      description: "NOAA radar indicates a thunderstorm cell 12 miles west of the sanctuary lot.",
      severity: "warning",
      status: "open",
      source: "weather-radar",
      payload: { radius_miles: 15, expected_arrival_minutes: 45 },
      related_job: CONSTANT_IDS.jobSealcoat,
      created_by: adminId,
    },
    {
      id: CONSTANT_IDS.missionCrew,
      event_type: "crew.status",
      title: "Crew Check-In",
      description: "Crew Alpha checked in on site. OPS drone sweep complete.",
      severity: "info",
      status: "acknowledged",
      source: "crew-tracking",
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: adminId,
      payload: { crew: "Alpha", members: 5 },
      related_job: CONSTANT_IDS.jobSealcoat,
      created_by: adminId,
    },
    {
      id: CONSTANT_IDS.missionRevenue,
      event_type: "finance.variance",
      title: "Material Usage Trending High",
      description: "Sealcoat draw is 8% above planned usage. Review calibration after next pass.",
      severity: "alert",
      status: "open",
      source: "inventory-monitor",
      payload: { variance_percent: 8.1 },
      related_client: CONSTANT_IDS.clientStMichael,
      created_by: adminId,
    },
  ];

  await supabase.from("mission_events").upsert(events, { onConflict: "id" });
}

async function seedTelemetrySample(adminId: string | null) {
  if (!adminId) return;
  await supabase.from("telemetry_events").insert(
    {
      session_id: "local-seed-session",
      user_id: adminId,
      category: "hud",
      action: "theme_applied",
      label: "division-shd",
      metadata: { fidelity: "faithful", triggered_by: "seed" },
    },
    { returning: "minimal" },
  );
}

async function main() {
  console.log("[seed] Starting...");
  const { adminId } = await ensureAdminBootstrap("n8ter8@gmail.com");
  await seedCoreEntities(adminId);
  await seedMissionIntelligence(adminId);
  await seedTelemetrySample(adminId);
  console.log("[seed] Complete.");
}

main().catch((error) => {
  console.error("[seed] Failed:", error);
  process.exit(1);
});
