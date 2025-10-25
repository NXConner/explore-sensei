import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUSINESS_KNOWLEDGE = `You are an AI assistant for Asphalt Overwatch, a tactical asphalt paving operations management system.

COMPANY INFORMATION:
- Company specializes in asphalt paving, sealcoating, and pavement maintenance
- Operations based in Patrick County, Virginia
- Focus on safety, quality, and efficiency

AVAILABLE SYSTEMS:
- Job scheduling and tracking with GPS locations
- Fleet management with real-time vehicle tracking
- Employee management and payroll
- Client relationship management
- Financial tracking and budgeting

BONUS PROGRAMS:
- Monthly production bonuses for meeting targets
- Safety compliance bonuses
- Quality workmanship incentives
- Team-based incentives for crew efficiency

SAFETY REQUIREMENTS:
- Hard hats (ANSI Z89.1 certified) required at all sites
- Safety glasses with side shields
- High-visibility vests
- Steel-toe boots
- Heat-resistant gloves for asphalt work
- Pre-shift equipment inspections mandatory
- Traffic control setup before work begins

OPTIMAL WORK CONDITIONS:
- Temperature: 50°F - 85°F (10°C - 29°C)
- No rain in forecast for 24 hours
- Low wind speeds
- Ground temperature above 40°F

You should provide helpful, accurate information about operations, schedules, safety protocols, and company policies. Keep responses clear and professional.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Parse and validate input
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = requestBody;

    // Validate messages structure
    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Maximum 50 messages allowed per conversation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return new Response(
          JSON.stringify({ error: 'Each message must have role and content' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        return new Response(
          JSON.stringify({ error: 'Invalid message role - must be user, assistant, or system' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (typeof msg.content !== 'string' || msg.content.length > 10000) {
        return new Response(
          JSON.stringify({ error: 'Message content must be a string with max 10,000 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase environment not configured');
    }

    // 2. Require authenticated caller and check role
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user ?? null;
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user role for authorization (viewers can't use AI chat)
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'No role assigned - please contact administrator' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Viewers don't get AI chat access
    if (roleData.role === 'Viewer') {
      return new Response(
        JSON.stringify({ error: 'AI chat requires Operator role or higher' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Role-based rate limiting
    const rateLimits: Record<string, number> = {
      'Super Administrator': 500,
      'Administrator': 200,
      'Manager': 100,
      'Operator': 50,
      'Viewer': 0
    };
    const limit = rateLimits[roleData.role] || parseInt(Deno.env.get('AI_CHAT_HOURLY_LIMIT') ?? '60');
    const now = new Date();
    const hourStart = new Date(now);
    hourStart.setMinutes(0, 0, 0);
    const periodStartIso = hourStart.toISOString();

    const { data: usageRow } = await supabase
      .from('edge_function_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('function_name', 'ai-chat')
      .eq('period_start', periodStartIso)
      .maybeSingle();

    const currentCount = usageRow?.count ?? 0;
    if (currentCount >= limit) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabase.from('edge_function_usage').upsert({
      user_id: user.id,
      function_name: 'ai-chat',
      period_start: periodStartIso,
      count: currentCount + 1,
    }, { onConflict: 'user_id,function_name,period_start' });

    console.log("Calling Lovable AI with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: BUSINESS_KNOWLEDGE }, ...messages],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Log full error server-side only
      console.error("AI gateway error (server-side only):", response.status, errorText, "User:", user.id);

      // Return sanitized error messages to client
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded - please try again in a moment" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable - please contact support" }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ error: "AI chat temporarily unavailable - please try again", code: 'AI_ERROR' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    console.log("AI response received");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log full error server-side only
    console.error("chat error (server-side only):", error);
    
    // Return sanitized error to client
    return new Response(
      JSON.stringify({ 
        error: "Chat service temporarily unavailable - please try again",
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
