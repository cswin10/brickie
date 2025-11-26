import { NextRequest, NextResponse } from "next/server";
import { callOpenAI, validateJobInputs } from "@brickie/lib";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inputs, imageBase64, imageUrl } = body;

    // Validate inputs
    try {
      validateJobInputs(inputs);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid inputs" },
        { status: 400 }
      );
    }

    // Check for image
    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        { error: "Image is required (base64 or URL)" },
        { status: 400 }
      );
    }

    // Get API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Call OpenAI
    const result = await callOpenAI(
      inputs,
      {
        base64: imageBase64,
        url: imageUrl,
        mediaType: "image/jpeg",
      },
      { apiKey }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("Estimate API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process estimate" },
      { status: 500 }
    );
  }
}
