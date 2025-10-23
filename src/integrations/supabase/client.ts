// Supabase browser client
import { createClient } from "@supabase/supabase-js";


const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment."
  );
}

export const supabase = (createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
) as any);
