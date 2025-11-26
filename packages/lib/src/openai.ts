import type { JobInputs, EstimateResult } from "./types";
import { SYSTEM_MESSAGE, buildUserMessage } from "./prompt";
import { validateEstimateResult } from "./validators";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

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
    validateEstimateResult(result);
    return result;
  } catch (e) {
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
