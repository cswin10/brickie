import { z } from "zod";
import type { EstimateResult, JobInputs } from "./types";

// Zod schemas for validation
export const jobTypeSchema = z.enum([
  "Brickwork",
  "Blockwork",
  "Repointing",
  "Demo+Rebuild",
]);

export const difficultySchema = z.enum(["Easy", "Standard", "Tricky"]);

export const anchorTypeSchema = z.enum(["length", "height"]);

export const jobInputsSchema = z.object({
  jobType: jobTypeSchema,
  anchorType: anchorTypeSchema,
  anchorValue: z.number().positive().max(100),
  difficulty: difficultySchema,
  hasOpenings: z.boolean(),
  photoUri: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

export const estimateResultSchema = z.object({
  area_m2: z.number().nonnegative(),
  brick_count_range: z.tuple([z.number(), z.number()]),
  materials: z.object({
    sand_kg_range: z.tuple([z.number(), z.number()]),
    cement_bags_range: z.tuple([z.number(), z.number()]),
    other: z.array(z.string()),
  }),
  labour_hours_range: z.tuple([z.number(), z.number()]),
  recommended_price_gbp_range: z.tuple([z.number(), z.number()]),
  assumptions: z.array(z.string()),
  exclusions: z.array(z.string()),
  notes: z.array(z.string()),
});

// Validation functions
export function validateJobInputs(data: unknown): JobInputs {
  return jobInputsSchema.parse(data);
}

export function validateEstimateResult(
  result: unknown
): asserts result is EstimateResult {
  const r = result as Record<string, unknown>;

  if (typeof r.area_m2 !== "number") {
    throw new Error("Invalid response: missing area_m2");
  }
  if (!Array.isArray(r.brick_count_range) || r.brick_count_range.length !== 2) {
    throw new Error("Invalid response: missing brick_count_range");
  }
  if (!r.materials || typeof r.materials !== "object") {
    throw new Error("Invalid response: missing materials");
  }
  if (
    !Array.isArray(r.labour_hours_range) ||
    r.labour_hours_range.length !== 2
  ) {
    throw new Error("Invalid response: missing labour_hours_range");
  }
  if (
    !Array.isArray(r.recommended_price_gbp_range) ||
    r.recommended_price_gbp_range.length !== 2
  ) {
    throw new Error("Invalid response: missing recommended_price_gbp_range");
  }

  // Check for zero values which indicate AI couldn't interpret the image
  const brickRange = r.brick_count_range as [number, number];
  const priceRange = r.recommended_price_gbp_range as [number, number];

  if (r.area_m2 === 0 && brickRange[0] === 0 && brickRange[1] === 0) {
    throw new Error(
      "Could not estimate from this image. Please try a clearer photo showing the work area, or adjust your reference dimension."
    );
  }

  if (priceRange[0] === 0 && priceRange[1] === 0) {
    throw new Error(
      "Could not calculate pricing. Please try a different photo or check your inputs."
    );
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  return { valid: true };
}

export function validateAnchorValue(value: string): {
  valid: boolean;
  error?: string;
  parsed?: number;
} {
  if (!value || value.trim() === "") {
    return { valid: false, error: "Anchor dimension is required" };
  }

  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    return { valid: false, error: "Please enter a valid number" };
  }

  if (parsed <= 0) {
    return { valid: false, error: "Value must be greater than 0" };
  }

  if (parsed > 100) {
    return {
      valid: false,
      error: "Value seems too large. Please enter in meters.",
    };
  }

  return { valid: true, parsed };
}
