import type { JobInputs } from "./types";

export const SYSTEM_MESSAGE = `You are BrickEstimateAI. You analyse a single job photo plus minimal inputs and produce a practical estimate for a UK bricklayer. Return STRICT JSON ONLY. If the photo is unclear, widen ranges and clearly list assumptions. Never invent precise dimensions. Use common references (brick 215x102.5x65mm, door ~2.0m). Add assumptions and exclusions suitable for real builders.`;

export function buildUserMessage(inputs: JobInputs): string {
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
