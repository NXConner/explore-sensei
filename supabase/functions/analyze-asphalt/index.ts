import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_FORMATS = ['image/png', 'image/jpeg', 'image/jpg'];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Check user role for authorization (optional - allow authenticated users even without roles)
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['Super Administrator', 'Administrator', 'Manager', 'Operator'])
        .maybeSingle();

      // Only block if role check explicitly fails AND we have a strict policy
      // For now, we allow authenticated users even without roles
      // Uncomment the following if you want strict role enforcement:
      // if (!roleData) {
      //   return new Response(
      //     JSON.stringify({ success: false, error: 'No role assigned - please contact administrator' }),
      //     { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      //   );
      // }
    } catch (roleCheckError) {
      // If user_roles table doesn't exist, log but don't block
      console.warn("Role check failed (table may not exist):", roleCheckError);
    }

    // 3. Parse and validate input
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageData } = requestBody;

    // 4. Validate image data
    if (!imageData || typeof imageData !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Image data is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!imageData.startsWith('data:image/')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid image data format - must be a data URI' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check size limit
    if (imageData.length > MAX_IMAGE_SIZE) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Image too large - maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate image format
    const formatMatch = imageData.match(/^data:(image\/[a-z]+);/);
    if (!formatMatch || !ALLOWED_IMAGE_FORMATS.includes(formatMatch[1])) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Unsupported image format - allowed formats: ${ALLOWED_IMAGE_FORMATS.join(', ')}` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // deno-lint-ignore no-console
    console.log("Starting asphalt analysis...");

    // Call Lovable AI with vision capabilities
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert asphalt surface analysis AI. Analyze images of asphalt surfaces and provide detailed assessments including:
- Surface condition (Excellent, Good, Fair, Poor)
- Detected issues (cracks, potholes, deterioration, etc.)
- Estimated area in square feet and square meters
- Confidence score (0-100)
- Maintenance recommendations
- Priority level (Low, Medium, High, Critical)
- Asphalt area coordinates for visual overlay

Return your analysis as a JSON object with this structure:
{
  "condition": "Good",
  "confidence_score": 85,
  "area_sqft": 5000,
  "area_sqm": 464,
  "detected_issues": [
    {"type": "hairline_cracks", "severity": "minor", "location": "northeast_section"},
    {"type": "surface_wear", "severity": "moderate", "location": "center"}
  ],
  "recommendations": [
    "Apply crack sealant to northeast section",
    "Consider resurfacing center area within 6 months"
  ],
  "priority": "Medium",
  "estimated_repair_cost": "$3,500 - $5,000",
  "ai_notes": "Overall surface shows typical wear patterns for 5-7 year old asphalt. Proactive maintenance recommended.",
  "asphalt_areas": [
    {
      "id": "area_1",
      "coordinates": [
        {"x": 100, "y": 150},
        {"x": 400, "y": 150},
        {"x": 400, "y": 350},
        {"x": 100, "y": 350}
      ],
      "area_sqft": 2500,
      "condition": "Good"
    },
    {
      "id": "area_2", 
      "coordinates": [
        {"x": 450, "y": 200},
        {"x": 700, "y": 200},
        {"x": 700, "y": 400},
        {"x": 450, "y": 400}
      ],
      "area_sqft": 2500,
      "condition": "Fair"
    }
  ]
}`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this asphalt surface and provide a detailed condition assessment.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Log full error server-side only
      console.error("AI API error (server-side only):", response.status, errorText, "User:", user.id);

      // Return sanitized error messages to client
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Rate limit exceeded - please try again in a moment' 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'AI service temporarily unavailable - please contact support' 
          }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'AI analysis failed - please try again or contact support',
          code: 'AI_ERROR'
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    // deno-lint-ignore no-console
    console.log("AI response received");

    const aiMessage = data.choices[0]?.message?.content;
    if (!aiMessage) {
      throw new Error("No analysis result from AI");
    }

    // Parse JSON from AI response
    let analysis;
    try {
      // Extract JSON from response (AI might wrap it in markdown code blocks)
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, create structured response from text
        analysis = {
          condition: "Good",
          confidence_score: 75,
          area_sqft: 0,
          area_sqm: 0,
          detected_issues: [],
          recommendations: [aiMessage],
          priority: "Medium",
          estimated_repair_cost: "Analysis pending",
          ai_notes: aiMessage,
        };
      }
    } catch (parseError) {
      // deno-lint-ignore no-console
      console.error("Error parsing AI response:", parseError);
      // Return raw response if parsing fails
      analysis = {
        condition: "Unknown",
        confidence_score: 0,
        area_sqft: 0,
        area_sqm: 0,
        detected_issues: [],
        recommendations: [aiMessage],
        priority: "Medium",
        estimated_repair_cost: "Analysis pending",
        ai_notes: aiMessage,
      };
    }

    // deno-lint-ignore no-console
    console.log("Analysis complete:", analysis);

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    // Log full error server-side only
    console.error("Error in analyze-asphalt function (server-side only):", error);
    
    // Return sanitized error to client
    return new Response(
      JSON.stringify({
        success: false,
        error: "Image analysis temporarily unavailable - please try again",
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
