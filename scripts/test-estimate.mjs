#!/usr/bin/env node

/**
 * Test script for Brickie estimation
 * Tests 3 sample jobs with different configurations
 *
 * Usage: node scripts/test-estimate.mjs
 *
 * Requires OPENAI_API_KEY environment variable to be set
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const SYSTEM_MESSAGE = `You are BrickEstimateAI. You analyse a single job photo plus minimal inputs and produce a practical estimate for a UK bricklayer. Return STRICT JSON ONLY. If the photo is unclear, widen ranges and clearly list assumptions. Never invent precise dimensions. Use common references (brick 215x102.5x65mm, door ~2.0m). Add assumptions and exclusions suitable for real builders.`;

function buildUserMessage(inputs) {
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

NOTE: Since no actual photo is provided, use typical dimensions for a ${inputs.jobType} job and the anchor dimension to estimate.`;
}

// Sample test cases
const testCases = [
  {
    name: "Simple Brickwork - Garden Wall",
    inputs: {
      jobType: "Brickwork",
      anchorType: "length",
      anchorValue: 4.5,
      difficulty: "Easy",
      hasOpenings: false,
    },
  },
  {
    name: "Standard Repointing - House Front",
    inputs: {
      jobType: "Repointing",
      anchorType: "height",
      anchorValue: 3.0,
      difficulty: "Standard",
      hasOpenings: true,
    },
  },
  {
    name: "Tricky Demo+Rebuild - Garage",
    inputs: {
      jobType: "Demo+Rebuild",
      anchorType: "length",
      anchorValue: 6.0,
      difficulty: "Tricky",
      hasOpenings: true,
    },
  },
];

async function runEstimate(testCase, apiKey) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing: ${testCase.name}`);
  console.log(`${"=".repeat(60)}`);
  console.log("Inputs:", JSON.stringify(testCase.inputs, null, 2));

  const userMessage = buildUserMessage(testCase.inputs);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_MESSAGE },
          { role: "user", content: userMessage },
        ],
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error?.message || `API error: ${response.status}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content);

    console.log("\nResult:");
    console.log("-".repeat(40));
    console.log(`Area: ${result.area_m2} m²`);
    console.log(
      `Bricks: ${result.brick_count_range[0]} - ${result.brick_count_range[1]}`
    );
    console.log(
      `Labour: ${result.labour_hours_range[0]} - ${result.labour_hours_range[1]} hours`
    );
    console.log(
      `Price: £${result.recommended_price_gbp_range[0]} - £${result.recommended_price_gbp_range[1]}`
    );
    console.log("\nMaterials:");
    console.log(
      `  Sand: ${result.materials.sand_kg_range[0]} - ${result.materials.sand_kg_range[1]} kg`
    );
    console.log(
      `  Cement: ${result.materials.cement_bags_range[0]} - ${result.materials.cement_bags_range[1]} bags`
    );
    if (result.materials.other?.length > 0) {
      console.log(`  Other: ${result.materials.other.join(", ")}`);
    }
    console.log("\nAssumptions:");
    result.assumptions?.forEach((a) => console.log(`  - ${a}`));
    console.log("\nExclusions:");
    result.exclusions?.forEach((e) => console.log(`  - ${e}`));

    return { success: true, result };
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("Error: OPENAI_API_KEY environment variable is not set");
    console.error("\nUsage:");
    console.error("  OPENAI_API_KEY=sk-... node scripts/test-estimate.mjs");
    process.exit(1);
  }

  console.log("Brickie Estimate Test Script");
  console.log("============================");
  console.log(`Testing ${testCases.length} sample jobs...\n`);

  const results = [];

  for (const testCase of testCases) {
    const result = await runEstimate(testCase, apiKey);
    results.push({ name: testCase.name, ...result });

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Summary
  console.log(`\n${"=".repeat(60)}`);
  console.log("SUMMARY");
  console.log(`${"=".repeat(60)}`);

  const successful = results.filter((r) => r.success).length;
  console.log(`\nPassed: ${successful}/${results.length}`);

  results.forEach((r) => {
    const status = r.success ? "✓" : "✗";
    console.log(`  ${status} ${r.name}`);
  });

  if (successful < results.length) {
    process.exit(1);
  }

  console.log("\nAll tests passed!");
}

main().catch(console.error);
