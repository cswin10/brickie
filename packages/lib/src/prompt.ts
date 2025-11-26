import type { JobInputs } from "./types";

export const SYSTEM_MESSAGE = `You are BrickEstimateAI. You analyse job photos WITH USER DESCRIPTIONS to produce practical estimates for UK bricklayers. Return STRICT JSON ONLY.

THE USER'S JOB DESCRIPTION IS YOUR PRIMARY GUIDE. It tells you exactly what they want to build and where to look in the photo.

ANALYSIS PROCESS:
1. READ the user's job description carefully - this tells you WHAT they want and WHERE
2. LOCATE the specific area in the photo that matches their description
3. MEASURE that specific area using the anchor dimension for scale
4. CALCULATE materials and cost for ONLY the described work

REFERENCE OBJECTS FOR SCALE:
- Standard UK door: 2m tall, 0.8m wide
- Fence panels: typically 1.8m tall
- Wheelie bin: 1.1m tall
- Window: typically 1.2m wide
- Brick courses: 75mm per course (65mm brick + 10mm mortar)
- Person: average 1.7m tall

CRITICAL: The job description defines the scope. If user says "build a wall along the left fence", measure ONLY that fence line, not the whole garden.

RULES:
1. Match your estimate to the DESCRIBED work, not everything visible in the photo
2. Different descriptions = different estimates, even for the same photo
3. Never return zeros - if unclear, state assumptions
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
  const hasDescription = inputs.jobDescription && inputs.jobDescription.trim().length > 0;

  return `${hasDescription ? `**USER'S JOB DESCRIPTION (THIS IS WHAT THEY WANT):**
"${inputs.jobDescription}"

Estimate ONLY the work described above. Locate this specific area in the photo.

` : ''}JOB DETAILS:
- Job Type: ${inputs.jobType}
- Reference measurement: The ${inputs.anchorType} is ${inputs.anchorValue} metres (use this for scale)
- Difficulty: ${inputs.difficulty}
- Has Openings: ${inputs.hasOpenings ? "Yes - subtract area for doors/windows" : "No"}

${jobContext}

YOUR TASK:
1) ${hasDescription ? `Find the specific area described: "${inputs.jobDescription}"` : 'Identify the work area in the photo'}
2) Measure it using the ${inputs.anchorType} (${inputs.anchorValue}m) as your scale reference
3) Calculate area, materials, labour and price for ${hasDescription ? 'the described work ONLY' : 'the visible work area'}

Range guidance: ±10-15% for Easy, ±15-25% for Standard, ±25-35% for Tricky jobs.

Return JSON:
{
  "image_analysis": "What I see: [describe the work area]. Dimensions: [your measurements]. How I calculated: [brief explanation]",
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
