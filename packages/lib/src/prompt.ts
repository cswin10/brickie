import type { JobInputs } from "./types";

export const SYSTEM_MESSAGE = `You are BrickEstimateAI. You analyse job photos to produce practical estimates for UK bricklayers. Return STRICT JSON ONLY.

YOUR PRIMARY JOB IS TO ANALYSE THE IMAGE. The photo is your main source of information.

STEP 1 - DESCRIBE WHAT YOU SEE:
Before estimating, you MUST identify in the photo:
- What structures/spaces are visible (walls, gaps, foundations, fences, etc.)
- The approximate dimensions you can infer from the image
- Reference objects for scale (doors ~2m tall, fence panels ~1.8m, wheelie bins ~1.1m, window ~1.2m wide, standard door ~0.8m wide)
- The condition and complexity of the work area

STEP 2 - USE THE ANCHOR TO CALIBRATE:
The user provides ONE known measurement (anchor). Use this to calibrate your visual estimate - but the IMAGE should drive what you're measuring.

STEP 3 - CALCULATE BASED ON WHAT YOU SEE:
Your area estimate should reflect the ACTUAL visible work area in the photo, not a generic calculation.

CRITICAL CONTEXT BY JOB TYPE:
- Brickwork/Blockwork: Photo shows EMPTY SPACE where NEW wall will be built
- Repointing: Photo shows EXISTING wall with damaged mortar joints
- Demo+Rebuild: Photo shows structure to demolish OR cleared space for rebuild

RULES:
1. Different photos MUST produce different estimates based on what's visible
2. If the image shows a small garden wall vs a large building facade, estimates should differ significantly
3. Never return zeros - if unclear, state assumptions and use wider ranges
4. Standard UK brick: 215x102.5x65mm with 10mm joints (60 bricks per m²)

UK PRICING GUIDE (2024 rates, materials + labour):
- Brickwork: £150-200 per m² (use £180 as baseline)
- Blockwork: £120-160 per m² (use £140 as baseline)
- Repointing: £80-120 per m² (use £100 as baseline, labour-intensive)
- Demo+Rebuild: £200-300 per m² (use £250 as baseline, includes disposal)

LABOUR HOURS per m²:
- Brickwork: 1.5 hours/m²
- Blockwork: 1.0 hours/m²
- Repointing: 2.5 hours/m²
- Demo+Rebuild: 3.5 hours/m²`;

export function buildUserMessage(inputs: JobInputs): string {
  const jobContext = getJobContext(inputs.jobType);

  return `ANALYSE THIS PHOTO CAREFULLY.

JOB DETAILS:
- Job Type: ${inputs.jobType}
- Known measurement (anchor): The ${inputs.anchorType} is ${inputs.anchorValue} metres
- Difficulty: ${inputs.difficulty}
- Has Openings: ${inputs.hasOpenings ? "Yes - account for doors/windows" : "No"}

CONTEXT FOR THIS JOB TYPE:
${jobContext}

REQUIRED ANALYSIS:
1) FIRST: Describe what you see in the image - what is the work area? What structures are visible?
2) SECOND: Using the ${inputs.anchorType} of ${inputs.anchorValue}m as your scale reference, estimate the dimensions of the work area
3) THIRD: Calculate the area in m² based on YOUR VISUAL ANALYSIS of the photo
4) Provide ranges for materials and labour based on the ACTUAL scope visible in the image

The anchor measurement (${inputs.anchorValue}m ${inputs.anchorType}) helps you calibrate scale, but your estimate should reflect what the PHOTO shows.

Range guidance: ±10-15% for Easy, ±15-25% for Standard, ±25-35% for Tricky jobs.

Return JSON:
{
  "image_analysis": "Brief description of what you see in the photo and how you measured it",
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
}`;
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
      return `This is a DEMOLITION and REBUILD job. The photo may show:
- An EXISTING damaged/old wall or structure to demolish and rebuild, OR
- An EMPTY/CLEARED space where something was (or will be) demolished and new construction is needed

Look for:
- If existing structure: wall dimensions, condition, thickness
- If empty space: boundary lines, fence posts, ground markings, foundations showing where work will go
- Access for skip/waste removal
- Reference objects for scale (doors, fences, bins, people)

Use the anchor dimension to estimate the work area. If the photo shows an empty space, treat the visible area as the rebuild zone and estimate materials for new construction.
Note: Include demolition labour + disposal + new build materials and labour. If no existing structure visible, demolition costs may be minimal.`;

    default:
      return `Analyse the photo to determine the scope of brickwork required.`;
  }
}
