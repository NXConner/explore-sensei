// Supabase browser client
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  const errorMessage = [
    "Missing Supabase configuration.",
    "Required environment variables:",
    "  - VITE_SUPABASE_URL",
    "  - VITE_SUPABASE_ANON_KEY",
    "",
    "Please check your .env.local file or environment configuration.",
  ].join("\n");
  
  if (typeof window !== "undefined") {
    console.error(errorMessage);
  }
  
  throw new Error(errorMessage);
}

// Enhanced Supabase client with better error handling and configuration
export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
    global: {
      headers: {
        "x-client-info": "explore-sensei@1.0.0",
      },
    },
    db: {
      schema: "public",
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Health check function
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Try a simple query to test the connection
    // Use a table that should exist (like job_sites or user_roles)
    const { error } = await supabase
      .from("job_sites")
      .select("id")
      .limit(1);
    
    // If we get an error, check if it's a connection error or just a missing table
    if (error) {
      // PGRST116 = table not found, which is okay for connection test
      // Other errors might indicate connection issues
      if (error.code === "PGRST116") {
        // Table doesn't exist, but connection works - try auth check instead
        const { data: { user } } = await supabase.auth.getUser();
        return true; // If we can check auth, connection works
      }
      // Network or connection errors
      if (error.message?.includes("Failed to fetch") || 
          error.message?.includes("NetworkError") ||
          error.code === "PGRST301") {
        return false;
      }
      // Other errors might be permissions, which means connection works
      return true;
    }
    return true;
  } catch (err) {
    // Network errors, CORS issues, etc.
    console.error("Supabase connection check failed:", err);
    return false;
  }
}

// Enhanced error handler
export function handleSupabaseError(error: unknown): {
  message: string;
  code?: string;
  details?: string;
} {
  if (error && typeof error === "object" && "message" in error) {
    const supabaseError = error as { message: string; code?: string; details?: string };
    return {
      message: supabaseError.message || "An unknown error occurred",
      code: supabaseError.code,
      details: supabaseError.details,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message || "An unknown error occurred",
    };
  }
  
  return {
    message: "An unknown error occurred",
  };
}
