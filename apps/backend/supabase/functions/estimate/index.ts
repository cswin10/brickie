// Supabase Edge Function for AI Estimation
// This function can be used as an alternative to client-side OpenAI calls
// to keep the API key secure on the server side.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const SYSTEM_MESSAGE = `You are BrickEstimateAI. You analyse a single job photo plus minimal inputs and produce a practical estimate for a UK bricklayer. Return STRICT JSON ONLY. If the photo is unclear, widen ranges and clearly list assumptions. Never invent precise dimensions. Use common references (brick 215x102.5x65mm, door ~2.0m). Add assumptions and exclusions suitable for real builders.`;

interface JobInputs {
  jobType: string;
  anchorType: string;
  anchorValue: number;
  difficulty: string;
  hasOpenings: boolean;
}

function buildUserMessage(inputs: JobInputs): string {
  return `INPUTS:
- Job Type: ${inputs.jobType}
- Anchor: ${inputs.anchorType}=${inputs.anchorValue} meters
- Difficulty: ${inputs.difficulty}
- Has Openings: ${inputs.hasOpenings ? "Yes" : "No"}

TASKS:
1) Estimate area in m² using the anchor dimension and inference from the photo.
2) Provide ranges for:
   - brick_count
   - sand_kg
   - cement_bags
   - labour_hours
   - recommended_price_gbp
3) Ranges: ±10–15% Easy, ±15–25% Standard, ±25–35% Tricky.
4) Include assumptions and exclusions (footings, skip, special pointing, scaffold).
5) Adjust logic if job type is Repointing (no new bricks, more labour).
6) Return JSON matching:

{
  "area_m2": number,
  "brick_count_range": [number, number],
  "materials": {
    "sand_kg_range": [number, number],
    "cement_bags_range": [number, number],
    "other": string[]
  },
  "labour_hours_range": [number, number],
  "recommended_price_gbp_range": [number, number],
  "assumptions": string[],
  "exclusions": string[],
  "notes": string[]
}

PHOTO BELOW.`;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { inputs, imageBase64, imageUrl } = await req.json();

    if (!inputs) {
      return new Response(
        JSON.stringify({ error: "Missing inputs" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get OpenAI API key from environment
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build image URL
    let imageContent: string;
    if (imageBase64) {
      imageContent = `data:image/jpeg;base64,${imageBase64}`;
    } else if (imageUrl) {
      imageContent = imageUrl;
    } else {
      return new Response(
        JSON.stringify({ error: "Missing image (base64 or URL)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userMessage = buildUserMessage(inputs);

    // Call OpenAI
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: SYSTEM_MESSAGE,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userMessage,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageContent,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          error: error.error?.message || `OpenAI API error: ${response.status}`,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from OpenAI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = JSON.parse(content);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Estimation error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to process estimate",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
