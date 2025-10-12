// Supabase browser client
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

<<<<<<< HEAD
// Lovable sandbox does not support VITE_* env vars; use fixed project values
const SUPABASE_URL = "https://vodglzbgqsafghlihivy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGdsemJncXNhZmdobGloaXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDcwMDQsImV4cCI6MjA2NDkyMzAwNH0.uLAZ_zY3zY-QmDDXwkAuspCUW9NpotsTV5fVCiHf5mM";
=======
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;
>>>>>>> 9994a4d1e9900372338879dc4e862a100a01a0c3

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment."
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
