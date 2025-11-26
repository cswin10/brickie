import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import type { JobInputs, EstimateResult } from "@brickie/lib";
import { SYSTEM_MESSAGE, buildUserMessage, validateEstimateResult } from "@brickie/lib";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

async function getBase64FromUri(uri: string): Promise<string> {
  if (Platform.OS === "web") {
    // For web, fetch the image and convert to base64
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove data URL prefix if present
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } else {
    // For native, use expo-file-system
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  }
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

export async function estimateJob(
  inputs: JobInputs,
  apiKey: string
): Promise<EstimateResult> {
  if (!apiKey) {
    throw new Error(
      "OpenAI API key is required. Please add your API key in Settings."
    );
  }

  if (!inputs.photoUri) {
    throw new Error("Photo is required for estimation.");
  }

  const base64Image = await getBase64FromUri(inputs.photoUri);
  const mediaType = getMediaType(inputs.photoUri);
  const userMessage = buildUserMessage(inputs);

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
                url: `data:${mediaType};base64,${base64Image}`,
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
