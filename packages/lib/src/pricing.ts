import type { EstimateResult } from "./types";

// Format currency in GBP
export function formatCurrency(amount: number): string {
  return `£${amount.toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

// Format a range with optional formatter
export function formatRange(
  range: [number, number],
  formatter?: (n: number) => string
): string {
  const format = formatter || ((n: number) => n.toLocaleString("en-GB"));
  return `${format(range[0])} – ${format(range[1])}`;
}

// Format price range with currency
export function formatPriceRange(range: [number, number]): string {
  return formatRange(range, formatCurrency);
}

// Convert hours to workdays
export function hoursToWorkdays(hours: number, hoursPerDay: number = 8): number {
  return Math.ceil((hours / hoursPerDay) * 10) / 10;
}

// Format labour range with hours and days
export function formatLabourRange(range: [number, number]): string {
  const minDays = hoursToWorkdays(range[0]);
  const maxDays = hoursToWorkdays(range[1]);
  const minHours = range[0];
  const maxHours = range[1];

  return `${minHours}–${maxHours} hours (${minDays}–${maxDays} days)`;
}

// Calculate price with custom day rate
export function calculatePriceWithDayRate(
  result: EstimateResult,
  dayRate: number
): [number, number] {
  const hoursPerDay = 8;
  const minDays = result.labour_hours_range[0] / hoursPerDay;
  const maxDays = result.labour_hours_range[1] / hoursPerDay;

  // Labour cost
  const minLabourCost = minDays * dayRate;
  const maxLabourCost = maxDays * dayRate;

  // Materials cost estimate
  const avgBricks =
    (result.brick_count_range[0] + result.brick_count_range[1]) / 2;
  const brickCostPerUnit = 0.5; // £0.50 per brick average
  const materialsCost = avgBricks * brickCostPerUnit;

  // Add materials margin (15%)
  const materialsWithMargin = materialsCost * 1.15;

  return [
    Math.round(minLabourCost + materialsWithMargin),
    Math.round(maxLabourCost + materialsWithMargin),
  ];
}

// Pricing constants
export const PRICING = {
  // Material costs (approximate UK prices)
  BRICK_COST_EACH: 0.5,
  SAND_COST_PER_KG: 0.05,
  CEMENT_BAG_COST: 8,

  // Labour
  DEFAULT_DAY_RATE: 220,
  HOURS_PER_DAY: 8,

  // Margins
  MATERIALS_MARGIN: 0.15,
  CONTINGENCY: 0.1,
};

// Calculate detailed breakdown
export function calculateDetailedPricing(
  result: EstimateResult,
  dayRate: number = PRICING.DEFAULT_DAY_RATE
): {
  labour: { min: number; max: number };
  materials: { min: number; max: number };
  total: { min: number; max: number };
} {
  // Labour calculation
  const minLabour =
    (result.labour_hours_range[0] / PRICING.HOURS_PER_DAY) * dayRate;
  const maxLabour =
    (result.labour_hours_range[1] / PRICING.HOURS_PER_DAY) * dayRate;

  // Materials calculation
  const avgBricks =
    (result.brick_count_range[0] + result.brick_count_range[1]) / 2;
  const avgSand =
    (result.materials.sand_kg_range[0] + result.materials.sand_kg_range[1]) / 2;
  const avgCement =
    (result.materials.cement_bags_range[0] +
      result.materials.cement_bags_range[1]) /
    2;

  const baseMaterials =
    avgBricks * PRICING.BRICK_COST_EACH +
    avgSand * PRICING.SAND_COST_PER_KG +
    avgCement * PRICING.CEMENT_BAG_COST;

  const materialsWithMargin = baseMaterials * (1 + PRICING.MATERIALS_MARGIN);
  const minMaterials = materialsWithMargin * 0.9;
  const maxMaterials = materialsWithMargin * 1.1;

  return {
    labour: {
      min: Math.round(minLabour),
      max: Math.round(maxLabour),
    },
    materials: {
      min: Math.round(minMaterials),
      max: Math.round(maxMaterials),
    },
    total: {
      min: Math.round(minLabour + minMaterials),
      max: Math.round(maxLabour + maxMaterials),
    },
  };
}
