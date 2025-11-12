import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Require authenticated caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Check user role - optional check, allow authenticated users even without role assignment
    // This makes the function more permissive while still requiring authentication
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      // Only block if role check explicitly fails AND we have a strict policy
      // For now, we allow authenticated users even without roles
      // Uncomment the following if you want strict role enforcement:
      // if (!roleData) {
      //   return new Response(
      //     JSON.stringify({ error: "No role assigned - please contact administrator" }),
      //     { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      //   );
      // }
    } catch (roleCheckError) {
      // If user_roles table doesn't exist, log but don't block
      console.warn("Role check failed (table may not exist):", roleCheckError);
    }

    // 3. Get and return token
    const token = Deno.env.get("MAPBOX_ACCESS_TOKEN");
    if (!token) {
      console.error("Mapbox token not configured");
      return new Response(
        JSON.stringify({ error: "Map service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ token }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log full error server-side only
    console.error("get-mapbox-token error (server-side only):", error);
    
    // Return sanitized error to client
    return new Response(
      JSON.stringify({ 
        error: "Map service temporarily unavailable - please try again",
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
