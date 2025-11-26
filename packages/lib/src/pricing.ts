import type { EstimateResult, PricingInputs, FinalPricing, DEFAULT_PRICING } from "./types";

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

// Pricing constants
export const PRICING = {
  // Material costs (approximate UK prices 2024)
  BRICK_COST_EACH: 0.55,
  BLOCK_COST_EACH: 1.80,
  SAND_COST_PER_KG: 0.04,
  CEMENT_BAG_COST: 7.50,

  // Labour defaults
  DEFAULT_DAY_RATE: 220,
  DEFAULT_RATE_PER_1000: 500,
  DEFAULT_RATE_PER_M2: 65,
  HOURS_PER_DAY: 8,

  // Bricks per 1000 labour unit
  BRICKS_PER_DAY: 500, // Average bricklayer lays 400-600/day
};

/**
 * Calculate final pricing using the user's custom rates
 */
export function calculateFinalPricing(
  result: EstimateResult,
  pricing: PricingInputs,
  jobType: string = "Brickwork"
): FinalPricing {
  // Get average values from ranges
  const avgBricks = (result.brick_count_range[0] + result.brick_count_range[1]) / 2;
  const avgHours = (result.labour_hours_range[0] + result.labour_hours_range[1]) / 2;
  const avgSand = (result.materials.sand_kg_range[0] + result.materials.sand_kg_range[1]) / 2;
  const avgCement = (result.materials.cement_bags_range[0] + result.materials.cement_bags_range[1]) / 2;

  // Calculate labour based on chosen method
  let labourLow: number;
  let labourHigh: number;

  switch (pricing.method) {
    case "day_rate": {
      const rate = pricing.dayRate || PRICING.DEFAULT_DAY_RATE;
      const minDays = result.labour_hours_range[0] / PRICING.HOURS_PER_DAY;
      const maxDays = result.labour_hours_range[1] / PRICING.HOURS_PER_DAY;
      labourLow = minDays * rate;
      labourHigh = maxDays * rate;
      break;
    }
    case "per_1000_bricks": {
      const rate = pricing.ratePer1000 || PRICING.DEFAULT_RATE_PER_1000;
      labourLow = (result.brick_count_range[0] / 1000) * rate;
      labourHigh = (result.brick_count_range[1] / 1000) * rate;
      break;
    }
    case "per_m2": {
      const rate = pricing.ratePerM2 || PRICING.DEFAULT_RATE_PER_M2;
      // Apply ±10% to the area for range
      labourLow = result.area_m2 * 0.95 * rate;
      labourHigh = result.area_m2 * 1.05 * rate;
      break;
    }
    default: {
      const rate = pricing.dayRate || PRICING.DEFAULT_DAY_RATE;
      const minDays = result.labour_hours_range[0] / PRICING.HOURS_PER_DAY;
      const maxDays = result.labour_hours_range[1] / PRICING.HOURS_PER_DAY;
      labourLow = minDays * rate;
      labourHigh = maxDays * rate;
    }
  }

  // Calculate base materials cost
  const unitCost = jobType === "Blockwork" ? PRICING.BLOCK_COST_EACH : PRICING.BRICK_COST_EACH;
  const baseMaterialsCost =
    avgBricks * unitCost +
    avgSand * PRICING.SAND_COST_PER_KG +
    avgCement * PRICING.CEMENT_BAG_COST;

  // Apply markup
  const markupMultiplier = 1 + (pricing.materialMarkup / 100);
  const materialsWithMarkup = baseMaterialsCost * markupMultiplier;

  // Materials range (±10%)
  const materialsLow = materialsWithMarkup * 0.9;
  const materialsHigh = materialsWithMarkup * 1.1;

  // Subtotals
  const subtotalLow = labourLow + materialsLow;
  const subtotalHigh = labourHigh + materialsHigh;

  // VAT
  let vatLow = 0;
  let vatHigh = 0;
  if (pricing.includeVAT) {
    vatLow = subtotalLow * (pricing.vatRate / 100);
    vatHigh = subtotalHigh * (pricing.vatRate / 100);
  }

  // Totals
  const totalLow = subtotalLow + vatLow;
  const totalHigh = subtotalHigh + vatHigh;

  return {
    labourLow: Math.round(labourLow),
    labourHigh: Math.round(labourHigh),
    materialsLow: Math.round(materialsLow),
    materialsHigh: Math.round(materialsHigh),
    subtotalLow: Math.round(subtotalLow),
    subtotalHigh: Math.round(subtotalHigh),
    vatLow: Math.round(vatLow),
    vatHigh: Math.round(vatHigh),
    totalLow: Math.round(totalLow),
    totalHigh: Math.round(totalHigh),
  };
}

/**
 * Format final pricing for display
 */
export function formatFinalPricing(pricing: FinalPricing): {
  labour: string;
  materials: string;
  subtotal: string;
  vat: string;
  total: string;
} {
  return {
    labour: `${formatCurrency(pricing.labourLow)} – ${formatCurrency(pricing.labourHigh)}`,
    materials: `${formatCurrency(pricing.materialsLow)} – ${formatCurrency(pricing.materialsHigh)}`,
    subtotal: `${formatCurrency(pricing.subtotalLow)} – ${formatCurrency(pricing.subtotalHigh)}`,
    vat: pricing.vatLow > 0
      ? `${formatCurrency(pricing.vatLow)} – ${formatCurrency(pricing.vatHigh)}`
      : "N/A",
    total: `${formatCurrency(pricing.totalLow)} – ${formatCurrency(pricing.totalHigh)}`,
  };
}

// Legacy function - keep for backwards compatibility
export function calculatePriceWithDayRate(
  result: EstimateResult,
  dayRate: number
): [number, number] {
  const pricing: PricingInputs = {
    method: "day_rate",
    dayRate,
    materialMarkup: 15,
    includeVAT: false,
    vatRate: 20,
  };
  const final = calculateFinalPricing(result, pricing);
  return [final.totalLow, final.totalHigh];
}

// Legacy function
export function calculateDetailedPricing(
  result: EstimateResult,
  dayRate: number = PRICING.DEFAULT_DAY_RATE
): {
  labour: { min: number; max: number };
  materials: { min: number; max: number };
  total: { min: number; max: number };
} {
  const pricing: PricingInputs = {
    method: "day_rate",
    dayRate,
    materialMarkup: 15,
    includeVAT: false,
    vatRate: 20,
  };
  const final = calculateFinalPricing(result, pricing);

  return {
    labour: { min: final.labourLow, max: final.labourHigh },
    materials: { min: final.materialsLow, max: final.materialsHigh },
    total: { min: final.totalLow, max: final.totalHigh },
  };
}
