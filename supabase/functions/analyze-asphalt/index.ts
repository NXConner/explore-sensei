import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();

    if (!imageData) {
      throw new Error("No image data provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

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
      console.error("AI API error:", response.status, errorText);

      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      if (response.status === 402) {
        throw new Error("AI credits depleted. Please add credits to continue.");
      }

      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const data = await response.json();
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

    console.log("Analysis complete:", analysis);

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error in analyze-asphalt function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Analysis failed",
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
