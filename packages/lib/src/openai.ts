import type { JobInputs, EstimateResult, Difficulty } from "./types";
import { SYSTEM_MESSAGE, buildUserMessage } from "./prompt";
import { validateEstimateResult } from "./validators";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Fallback estimate generator when AI returns zeros or fails to interpret image
function generateFallbackEstimate(inputs: JobInputs): EstimateResult {
  // Calculate approximate area based on anchor dimension
  const anchor = inputs.anchorValue;
  let estimatedArea: number;

  if (inputs.anchorType === "length") {
    // If length is given, assume height is roughly 2.1m (typical wall height)
    estimatedArea = anchor * 2.1;
  } else {
    // If height is given, assume length is roughly 1.5x the height
    estimatedArea = anchor * (anchor * 1.5);
  }

  // Minimum 2m², maximum 100m² for sanity
  estimatedArea = Math.max(2, Math.min(estimatedArea, 100));

  // Calculate ranges based on difficulty
  const difficultyMultiplier: Record<Difficulty, number> = {
    Easy: 0.15,
    Standard: 0.25,
    Tricky: 0.35,
  };
  const variance = difficultyMultiplier[inputs.difficulty];

  // Bricks per m² (standard UK bricks, half-brick wall)
  const bricksPerM2 = 60;
  const baseBricks = Math.round(estimatedArea * bricksPerM2);
  const brickLow = Math.round(baseBricks * (1 - variance));
  const brickHigh = Math.round(baseBricks * (1 + variance));

  // Sand: roughly 50kg per m² of brickwork
  const sandBase = Math.round(estimatedArea * 50);
  const sandLow = Math.round(sandBase * (1 - variance));
  const sandHigh = Math.round(sandBase * (1 + variance));

  // Cement: roughly 1 bag (25kg) per 2.5m²
  const cementBase = Math.round(estimatedArea / 2.5);
  const cementLow = Math.max(1, Math.round(cementBase * (1 - variance)));
  const cementHigh = Math.max(1, Math.round(cementBase * (1 + variance)));

  // Labour hours: roughly 4 hours per m² for standard difficulty
  const hoursBase = estimatedArea * 4;
  const hoursLow = Math.round(hoursBase * (1 - variance));
  const hoursHigh = Math.round(hoursBase * (1 + variance));

  // Price: roughly £100-150 per m² (materials + labour)
  const pricePerM2 = inputs.jobType === "Repointing" ? 80 : inputs.jobType === "Demo+Rebuild" ? 180 : 130;
  const priceBase = estimatedArea * pricePerM2;
  const priceLow = Math.round(priceBase * (1 - variance));
  const priceHigh = Math.round(priceBase * (1 + variance));

  return {
    image_analysis: "Unable to clearly analyse the photo - using fallback calculation based on provided dimensions.",
    area_m2: Math.round(estimatedArea * 10) / 10,
    brick_count_range: [brickLow, brickHigh],
    materials: {
      sand_kg_range: [sandLow, sandHigh],
      cement_bags_range: [cementLow, cementHigh],
      other: [],
    },
    labour_hours_range: [hoursLow, hoursHigh],
    recommended_price_gbp_range: [priceLow, priceHigh],
    assumptions: [
      `Estimated based on ${inputs.anchorType} dimension of ${inputs.anchorValue}m`,
      "Assumed standard UK brick size (215×102.5×65mm)",
      "Assumed half-brick wall thickness",
      "Photo analysis was inconclusive - estimate based on provided dimensions",
    ],
    exclusions: [
      "Scaffolding if required",
      "Foundations/footings",
      "Skip hire for waste",
      "Permits if required",
    ],
    notes: [
      "This estimate is based primarily on the reference dimension provided",
      "A site visit is recommended for accurate pricing",
    ],
  };
}

// Check if AI result has essentially zero/minimal values
function isZeroResult(result: EstimateResult): boolean {
  return (
    result.area_m2 === 0 ||
    (result.brick_count_range[0] === 0 && result.brick_count_range[1] === 0) ||
    (result.recommended_price_gbp_range[0] === 0 && result.recommended_price_gbp_range[1] === 0)
  );
}

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
}

export interface ImageSource {
  base64?: string;
  url?: string;
  mediaType?: string;
}

function getMediaType(uri: string): string {
  const extension = uri.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
}

export async function callOpenAI(
  inputs: JobInputs,
  image: ImageSource,
  config: OpenAIConfig
): Promise<EstimateResult> {
  if (!config.apiKey) {
    throw new Error("OpenAI API key is required");
  }

  const userMessage = buildUserMessage(inputs);

  // Build image URL for the API
  let imageUrl: string;
  if (image.base64) {
    const mediaType = image.mediaType || "image/jpeg";
    imageUrl = `data:${mediaType};base64,${image.base64}`;
  } else if (image.url) {
    imageUrl = image.url;
  } else {
    throw new Error("Either base64 or url must be provided for the image");
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model || "gpt-4o",
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
                url: imageUrl,
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
    throw new Error(
      error.error?.message || `OpenAI API error: ${response.status}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No response from OpenAI");
  }

  try {
    const result = JSON.parse(content) as EstimateResult;

    // Check if AI returned zeros/empty result - use fallback instead
    if (isZeroResult(result)) {
      console.log("AI returned zero result, using fallback estimate based on dimensions");
      return generateFallbackEstimate(inputs);
    }

    validateEstimateResult(result);
    return result;
  } catch (e) {
    // If validation fails due to zeros, use fallback
    if (e instanceof Error && e.message.includes("Could not estimate")) {
      console.log("Validation failed, using fallback estimate");
      return generateFallbackEstimate(inputs);
    }
    if (e instanceof Error && e.message.startsWith("Invalid response")) {
      throw e;
    }
    throw new Error("Failed to parse AI response. Please try again.");
  }
}

// Helper to convert file to base64 (for server-side use)
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

// Helper to fetch image from URL and convert to base64
export async function urlToBase64(url: string): Promise<{ base64: string; mediaType: string }> {
  const response = await fetch(url);
  const blob = await response.blob();
  const mediaType = blob.type || getMediaType(url);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve({ base64, mediaType });
    };
    reader.onerror = (error) => reject(error);
  });
}
