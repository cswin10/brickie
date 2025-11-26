import type { JobInputs, EstimateResult } from "./types";
import { callOpenAI, type OpenAIConfig, type ImageSource } from "./openai";

// Constants for calculations
export const BRICK_DIMENSIONS = {
  length: 215, // mm
  width: 102.5, // mm
  height: 65, // mm
};

export const MORTAR_JOINT = 10; // mm

// Bricks per square meter (based on stretcher bond)
export const BRICKS_PER_SQM = 60;

// Materials per 1000 bricks
export const MATERIALS_PER_1000_BRICKS = {
  sand_kg: 1000, // kg of sand
  cement_bags: 8, // 25kg bags of cement
};

// Labour rates (hours per sqm)
export const LABOUR_RATES = {
  Brickwork: 1.5,
  Blockwork: 1.0,
  Repointing: 2.5,
  "Demo+Rebuild": 3.0,
};

// Difficulty multipliers
export const DIFFICULTY_MULTIPLIERS = {
  Easy: { min: 0.9, max: 1.1 },
  Standard: { min: 0.85, max: 1.15 },
  Tricky: { min: 0.75, max: 1.25 },
};

// Openings reduction (average)
export const OPENINGS_REDUCTION = 0.15; // 15% reduction for openings

/**
 * Main estimation function that calls OpenAI
 */
export async function estimateJob(
  inputs: JobInputs,
  image: ImageSource,
  config: OpenAIConfig
): Promise<EstimateResult> {
  return callOpenAI(inputs, image, config);
}

/**
 * Calculate a rough estimate based on inputs only (no AI)
 * Useful as a fallback or for quick calculations
 */
export function calculateLocalEstimate(inputs: JobInputs): EstimateResult {
  // Estimate area based on anchor dimension
  // Assume a square-ish area for simplicity
  const anchorMeters = inputs.anchorValue;
  const estimatedOtherDimension = anchorMeters * 0.8; // Rough assumption
  let area = anchorMeters * estimatedOtherDimension;

  // Reduce for openings
  if (inputs.hasOpenings) {
    area *= 1 - OPENINGS_REDUCTION;
  }

  // Calculate brick count
  const baseBricks =
    inputs.jobType === "Repointing" ? 0 : Math.round(area * BRICKS_PER_SQM);
  const { min: minMult, max: maxMult } = DIFFICULTY_MULTIPLIERS[inputs.difficulty];
  const brickCountRange: [number, number] = [
    Math.round(baseBricks * minMult),
    Math.round(baseBricks * maxMult),
  ];

  // Calculate materials
  const avgBricks = (brickCountRange[0] + brickCountRange[1]) / 2;
  const sandKgBase = (avgBricks / 1000) * MATERIALS_PER_1000_BRICKS.sand_kg;
  const cementBagsBase = (avgBricks / 1000) * MATERIALS_PER_1000_BRICKS.cement_bags;

  const sandKgRange: [number, number] = [
    Math.round(sandKgBase * minMult),
    Math.round(sandKgBase * maxMult),
  ];
  const cementBagsRange: [number, number] = [
    Math.round(cementBagsBase * minMult),
    Math.round(cementBagsBase * maxMult),
  ];

  // Calculate labour hours
  const baseHours = area * LABOUR_RATES[inputs.jobType];
  const labourHoursRange: [number, number] = [
    Math.round(baseHours * minMult),
    Math.round(baseHours * maxMult),
  ];

  // Calculate price (using default day rate of £220)
  const dayRate = 220;
  const hoursPerDay = 8;
  const labourCost =
    ((labourHoursRange[0] + labourHoursRange[1]) / 2 / hoursPerDay) * dayRate;

  // Add materials cost (rough estimate)
  const materialsCost = avgBricks * 0.5 + sandKgBase * 0.05 + cementBagsBase * 8;
  const totalBase = labourCost + materialsCost;

  const priceRange: [number, number] = [
    Math.round(totalBase * minMult),
    Math.round(totalBase * maxMult),
  ];

  return {
    area_m2: Math.round(area * 10) / 10,
    brick_count_range: brickCountRange,
    materials: {
      sand_kg_range: sandKgRange,
      cement_bags_range: cementBagsRange,
      other:
        inputs.jobType === "Demo+Rebuild"
          ? ["Skip hire", "Scaffolding possible"]
          : [],
    },
    labour_hours_range: labourHoursRange,
    recommended_price_gbp_range: priceRange,
    assumptions: [
      "Standard brick size (215x102.5x65mm)",
      "Stretcher bond pattern",
      `${inputs.anchorType === "length" ? "Height" : "Length"} estimated from photo`,
      "Good ground access",
    ],
    exclusions: [
      "Scaffolding (if required)",
      "Skip hire (if not Demo+Rebuild)",
      "Footings and foundations",
      "Special pointing finishes",
      "Structural engineering",
    ],
    notes: [
      "This is a local calculation without AI analysis",
      "Actual dimensions should be measured on-site",
    ],
  };
}

/**
 * Normalize an estimate result (ensure all fields are present)
 */
export function normalizeEstimate(result: Partial<EstimateResult>): EstimateResult {
  return {
    area_m2: result.area_m2 || 0,
    brick_count_range: result.brick_count_range || [0, 0],
    materials: {
      sand_kg_range: result.materials?.sand_kg_range || [0, 0],
      cement_bags_range: result.materials?.cement_bags_range || [0, 0],
      other: result.materials?.other || [],
    },
    labour_hours_range: result.labour_hours_range || [0, 0],
    recommended_price_gbp_range: result.recommended_price_gbp_range || [0, 0],
    assumptions: result.assumptions || [],
    exclusions: result.exclusions || [],
    notes: result.notes || [],
  };
}
