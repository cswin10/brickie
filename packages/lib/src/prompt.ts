import type { JobInputs } from "./types";

export const SYSTEM_MESSAGE = `You are BrickEstimateAI. You analyse a single job photo plus minimal inputs and produce a practical estimate for a UK bricklayer. Return STRICT JSON ONLY.

CRITICAL CONTEXT BY JOB TYPE:
- Brickwork/Blockwork: Photo shows EMPTY SPACE (garden, foundation, gap, fence line) where NEW wall will be built. Measure the space/gap, not existing bricks.
- Repointing: Photo shows EXISTING wall with old/damaged mortar joints that need raking out and repointing.
- Demo+Rebuild: Photo shows EXISTING damaged/old wall to demolish and rebuild.

Use the anchor dimension provided to calibrate scale. Look for reference objects (doors ~2m, fence panels ~1.8m, wheelie bins ~1.1m, people ~1.7m).

If the photo is unclear, widen ranges and list assumptions. Never invent precise dimensions. Standard UK brick is 215x102.5x65mm with 10mm mortar joints.`;

export function buildUserMessage(inputs: JobInputs): string {
  const jobContext = getJobContext(inputs.jobType);

  return `INPUTS:
- Job Type: ${inputs.jobType}
- Anchor: ${inputs.anchorType}=${inputs.anchorValue} meters
- Difficulty: ${inputs.difficulty}
- Has Openings: ${inputs.hasOpenings ? "Yes" : "No"}

WHAT TO LOOK FOR:
${jobContext}

TASKS:
1) Estimate the area in m² using the anchor dimension and photo analysis.
2) Provide ranges for:
   - brick_count (or blocks if Blockwork)
   - sand_kg
   - cement_bags
   - labour_hours
   - recommended_price_gbp (materials + labour, UK rates)
3) Range widths: ±10–15% Easy, ±15–25% Standard, ±25–35% Tricky.
4) List realistic assumptions (wall height, courses, bond pattern).
5) List exclusions (footings, foundations, skip hire, scaffolding, special features).
6) For Repointing: no new bricks needed, focus on joint area and labour.
7) Return JSON matching:

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

function getJobContext(jobType: string): string {
  switch (jobType) {
    case "Brickwork":
      return `This is a NEW BUILD job. The photo shows an EMPTY SPACE where a brick wall will be constructed. Look for:
- The gap/space to be filled with brickwork
- Ground level, fence lines, or existing structures marking boundaries
- Any foundations or footings already in place
- Reference objects to gauge scale (doors, fences, bins, people)`;

    case "Blockwork":
      return `This is a NEW BUILD job using concrete blocks. The photo shows an EMPTY SPACE where blocks will be laid. Look for:
- The area to be filled with blockwork
- Foundation lines or string lines if visible
- Reference objects for scale
Note: Blocks are larger than bricks (440x215x100mm standard), so fewer units needed.`;

    case "Repointing":
      return `This is a REPAIR job on an EXISTING wall. The photo shows a brick/stone wall with deteriorated mortar joints. Look for:
- The extent of damaged/crumbling mortar
- Wall dimensions to calculate joint area
- Depth of raking out needed (typically 15-20mm)
Note: No new bricks needed. Labour-intensive work. Price per m² of wall face.`;

    case "Demo+Rebuild":
      return `This is a DEMOLITION and REBUILD job. The photo shows an EXISTING wall that will be knocked down and rebuilt. Look for:
- Current wall dimensions (this is what gets demolished AND rebuilt)
- Wall condition and thickness
- Access for skip/waste removal
Note: Include demolition labour + disposal + new build materials and labour.`;

    default:
      return `Analyse the photo to determine the scope of brickwork required.`;
  }
}
