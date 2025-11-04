/*
  Seed script to populate realistic data using Supabase client in Node.
  Usage: ts-node scripts/seed.ts (ensure env vars are loaded)
*/
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL as string;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!url || !serviceRole) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(url, serviceRole, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function main() {
  const adminEmail = "n8ter8@gmail.com";

  const { data: adminLookup, error: adminLookupError } =
    await supabase.auth.admin.getUserByEmail(adminEmail);
  if (adminLookupError) {
    console.error("Failed to query Supabase auth admin API", adminLookupError.message);
  }
  if (!adminLookup?.user) {
    console.warn(
      `Admin user ${adminEmail} not found. Create this account via Supabase dashboard before re-running the seed.`,
    );
  }

  if (adminLookup?.user) {
    await supabase.from("profiles").upsert({
      id: adminLookup.user.id,
      user_id: adminLookup.user.id,
      email: adminEmail,
      full_name: adminLookup.user.user_metadata?.full_name ?? "Super Admin",
      onboarding_status: "completed",
      preferences: { theme: "tactical-dark" },
    });

    await supabase
      .from("user_roles")
      .upsert(
        { user_id: adminLookup.user.id, role_id: "super_admin" },
        { onConflict: "user_id,role_id" },
      );
  }

  // Clients
  const { data: client } = await supabase
    .from("clients")
    .insert({
      name: "St. Michael Church",
      contact_name: "Pastor John",
      email: "office@stmichael.org",
      phone: "555-123-4567",
      address: "123 Church St, Stuart, VA",
    })
    .select()
    .single();

  // Employees
  const employees = [
    { first_name: "Ava", last_name: "Mason", role: "Operator" },
    { first_name: "Ethan", last_name: "Cole", role: "Operator" },
  ];
  await supabase.from("employees").insert(employees);

  // Jobs
  const { data: _job } = await supabase
    .from("jobs")
    .insert({
      title: "Church Parking Lot Sealcoat",
      client_id: client?.id,
      status: "in progress",
      latitude: 36.6403,
      longitude: -80.2667,
      progress: 35,
    })
    .select()
    .single();

  // Inventory
  await supabase.from("inventory_items").insert([
    {
      name: "Sealcoat (gal)",
      category: "Materials",
      unit: "gal",
      quantity: 500,
      reorder_level: 100,
      unit_cost: 2.5,
    },
    {
      name: "Crack Sealant (lb)",
      category: "Materials",
      unit: "lb",
      quantity: 200,
      reorder_level: 50,
      unit_cost: 1.2,
    },
  ]);

  await supabase
    .from("safety_incidents")
    .insert([
      {
        incident_type: "PPE",
        severity: "moderate",
        description: "Crew member missing reflective vest during lot striping.",
        job_id: _job?.id ?? null,
        reported_by: adminLookup?.user?.id ?? null,
        involved_employees: ["Ava Mason"],
        injury_occurred: false,
        corrective_actions: "Briefed crew on PPE checklist before mobilization.",
      },
    ])
    .catch(() => undefined);

  const { data: chatRoom } = await supabase
    .from("chat_rooms")
    .insert({
      name: "Ops – St. Michael",
      type: "job",
      job_id: _job?.id ?? null,
      created_by: adminLookup?.user?.id ?? null,
    })
    .select()
    .single();

  if (chatRoom) {
    await supabase.from("chat_messages").insert([
      {
        room_id: chatRoom.id,
        user_id: adminLookup?.user?.id ?? null,
        message: "Morning briefing: sealcoat delivery ETA 08:30.",
      },
    ]);
  }

  if (adminLookup?.user) {
    await supabase.from("game_profiles").upsert({
      user_id: adminLookup.user.id,
      points: 125,
      xp: 125,
      level: 3,
      streak_current: 4,
      streak_longest: 7,
      last_event_date: new Date().toISOString().slice(0, 10),
    });
  }

  // Cost catalog & items
  const { data: catalog } = await supabase
    .from("cost_catalog")
    .insert({ name: "Standard Pavement Pricing" })
    .select()
    .single();
  await supabase.from("cost_items").insert([
    {
      catalog_id: catalog?.id,
      item_code: "SC-001",
      name: "Sealcoat Application",
      unit: "sqft",
      unit_cost: 0.15,
    },
    {
      catalog_id: catalog?.id,
      item_code: "CS-010",
      name: "Crack Sealing",
      unit: "lf",
      unit_cost: 1.25,
    },
  ]);

  console.log("Seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
