// Supabase browser client
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Prefer environment variables; fall back to existing fixed values for local sandbox
const DEFAULT_URL = "https://vodglzbgqsafghlihivy.supabase.co";
const DEFAULT_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGdsemJncXNhZmdobGloaXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDcwMDQsImV4cCI6MjA2NDkyMzAwNH0.uLAZ_zY3zY-QmDDXwkAuspCUW9NpotsTV5fVCiHf5mM";

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || DEFAULT_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env?.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON;

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
