/*
  Seed script to populate realistic data using Supabase client in Node.
  Usage: ts-node scripts/seed.ts (ensure env vars are loaded)
*/
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL as string;
const anon = process.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(url, anon);

async function main() {
  // Clients
  const { data: client } = await supabase
    .from('clients')
    .insert({ name: 'St. Michael Church', contact_name: 'Pastor John', email: 'office@stmichael.org', phone: '555-123-4567', address: '123 Church St, Stuart, VA' })
    .select()
    .single();

  // Employees
  const employees = [
    { first_name: 'Ava', last_name: 'Mason', role: 'Operator' },
    { first_name: 'Ethan', last_name: 'Cole', role: 'Operator' },
  ];
  await supabase.from('employees').insert(employees as any);

  // Jobs
  const { data: job } = await supabase
    .from('jobs')
    .insert({ title: 'Church Parking Lot Sealcoat', client_id: client?.id, status: 'in progress', latitude: 36.6403, longitude: -80.2667, progress: 35 })
    .select()
    .single();

  // Inventory
  await supabase.from('inventory_items').insert([
    { name: 'Sealcoat (gal)', category: 'Materials', unit: 'gal', quantity: 500, reorder_level: 100, unit_cost: 2.5 },
    { name: 'Crack Sealant (lb)', category: 'Materials', unit: 'lb', quantity: 200, reorder_level: 50, unit_cost: 1.2 },
  ] as any);

  // Cost catalog & items
  const { data: catalog } = await supabase.from('cost_catalog').insert({ name: 'Standard Pavement Pricing' }).select().single();
  await supabase.from('cost_items').insert([
    { catalog_id: catalog?.id, item_code: 'SC-001', name: 'Sealcoat Application', unit: 'sqft', unit_cost: 0.15 },
    { catalog_id: catalog?.id, item_code: 'CS-010', name: 'Crack Sealing', unit: 'lf', unit_cost: 1.25 },
  ] as any);

  console.log('Seed complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
