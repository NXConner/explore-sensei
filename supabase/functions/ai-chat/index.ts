import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please contact administrator." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
