import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      imageData,
      source,
      imageMeta,
      mapCenter,
      mapZoom,
      roiNormalized,
    } = await req.json();
    
    if (!imageData) {
      throw new Error('No image data provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase environment not configured');
    }

    // Create Supabase client with caller auth context (if any)
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user ?? null;

    console.log('Starting asphalt analysis...');

    // Call Lovable AI with vision capabilities
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert asphalt surface analysis AI. Analyze images of asphalt surfaces and provide detailed assessments including:
- Surface condition (Excellent, Good, Fair, Poor)
- Detected issues (cracks, potholes, deterioration, etc.)
- Estimated area in square feet and square meters
- Confidence score (0-100)
- Maintenance recommendations
- Priority level (Low, Medium, High, Critical)
 - If possible, detection bounding boxes as normalized [x,y,width,height] under 'detections'.

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
  "detections": [
    { "label": "crack", "confidence": 0.82, "bbox_normalized": [0.12, 0.30, 0.45, 0.06] }
  ]
}`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this asphalt surface and provide a detailed condition assessment.' },
              { type: 'image_url', image_url: { url: imageData } },
              ...(roiNormalized ? [{ type: 'text', text: `Focus analysis on ROI (normalized [x,y,width,height]): ${JSON.stringify(roiNormalized)}. Compute area and detections within this ROI if present.` }] : [])
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI credits depleted. Please add credits to continue.');
      }
      
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const aiMessage = data.choices[0]?.message?.content;
    if (!aiMessage) {
      throw new Error('No analysis result from AI');
    }

    // Parse JSON from AI response
    let analysis;
    try {
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = {
          condition: 'Good',
          confidence_score: 75,
          area_sqft: 0,
          area_sqm: 0,
          detected_issues: [],
          recommendations: [aiMessage],
          priority: 'Medium',
          estimated_repair_cost: 'Analysis pending',
          ai_notes: aiMessage,
          detections: []
        };
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      analysis = {
        condition: 'Unknown',
        confidence_score: 0,
        area_sqft: 0,
        area_sqm: 0,
        detected_issues: [],
        recommendations: [aiMessage],
        priority: 'Medium',
        estimated_repair_cost: 'Analysis pending',
        ai_notes: aiMessage,
        detections: []
      };
    }

    console.log('Analysis complete:', analysis);

    // Persist result if authenticated
    let detection_id: string | null = null;
    try {
      if (user?.id) {
        const { data: inserted, error: insertError } = await supabase
          .from('ai_asphalt_detections')
          .insert({
            user_id: user.id,
            job_site_id: null,
            source: source && (source === 'upload' || source === 'map_view') ? source : 'upload',
            image_width: imageMeta?.width ?? null,
            image_height: imageMeta?.height ?? null,
            map_lat: mapCenter?.lat ?? null,
            map_lng: mapCenter?.lng ?? null,
            map_zoom: mapZoom ?? null,
            roi: roiNormalized ?? null,
            condition: analysis?.condition ?? null,
            confidence_score: analysis?.confidence_score ?? null,
            area_sqft: analysis?.area_sqft ?? null,
            area_sqm: analysis?.area_sqm ?? null,
            priority: analysis?.priority ?? null,
            estimated_repair_cost: analysis?.estimated_repair_cost ?? null,
            ai_notes: analysis?.ai_notes ?? null,
            analysis,
          })
          .select('id')
          .single();
        if (!insertError) {
          detection_id = inserted?.id ?? null;
        } else {
          console.warn('Persist error:', insertError.message);
        }
      }
    } catch (persistErr) {
      console.warn('Persistence error (non-fatal):', persistErr);
    }

    return new Response(
      JSON.stringify({ success: true, analysis, detection_id }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error: any) {
    console.error('Error in analyze-asphalt function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Analysis failed' 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
