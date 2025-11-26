// Job Types
export type JobType = "Brickwork" | "Blockwork" | "Repointing" | "Demo+Rebuild";
export type Difficulty = "Easy" | "Standard" | "Tricky";
export type AnchorType = "length" | "height";
export type PricingMethod = "day_rate" | "per_1000_bricks" | "per_m2";

// Pricing Inputs (user can override per job)
export interface PricingInputs {
  method: PricingMethod;
  dayRate?: number;          // £ per day
  ratePer1000?: number;      // £ per 1000 bricks laid
  ratePerM2?: number;        // £ per m²
  materialMarkup: number;    // % markup on materials (0-100)
  includeVAT: boolean;
  vatRate: number;           // Usually 20
}

// Input Types
export interface JobInputs {
  jobType: JobType;
  anchorType: AnchorType;
  anchorValue: number;
  difficulty: Difficulty;
  hasOpenings: boolean;
  photoUri?: string;
  photoUrl?: string;
  // Custom pricing for this job
  pricing?: PricingInputs;
}

// AI Response Types
export interface EstimateResult {
  area_m2: number;
  brick_count_range: [number, number];
  materials: {
    sand_kg_range: [number, number];
    cement_bags_range: [number, number];
    other: string[];
  };
  labour_hours_range: [number, number];
  recommended_price_gbp_range: [number, number];
  assumptions: string[];
  exclusions: string[];
  notes: string[];
}

// Calculated final price (after applying custom rates)
export interface FinalPricing {
  labourLow: number;
  labourHigh: number;
  materialsLow: number;
  materialsHigh: number;
  subtotalLow: number;
  subtotalHigh: number;
  vatLow: number;
  vatHigh: number;
  totalLow: number;
  totalHigh: number;
}

// Database Types
export interface Profile {
  id: string;
  email: string;
  company_name: string | null;
  // Default pricing settings
  day_rate: number;
  rate_per_1000: number | null;
  rate_per_m2: number | null;
  default_pricing_method: PricingMethod;
  material_markup: number;
  vat_registered: boolean;
  disclaimer_text: string | null;
  created_at: string;
  updated_at: string;
}

// Database Types
export interface Job {
  id: string;
  user_id: string;
  photo_url: string | null;
  inputs: JobInputs;
  outputs: EstimateResult;
  created_at: string;
}

// Saved Job (for local storage in mobile)
export interface SavedJob {
  id: string;
  timestamp: number;
  inputs: JobInputs;
  outputs: EstimateResult;
  photoUri: string;
}

// Settings
export interface AppSettings {
  companyName: string;
  // Pricing defaults
  defaultPricingMethod: PricingMethod;
  defaultDayRate: number;
  defaultRatePer1000: number;
  defaultRatePerM2: number;
  materialMarkup: number;
  vatRegistered: boolean;
  vatRate: number;
  currency: "GBP";
  disclaimerText: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  companyName: "",
  defaultPricingMethod: "day_rate",
  defaultDayRate: 220,
  defaultRatePer1000: 500,
  defaultRatePerM2: 65,
  materialMarkup: 10,
  vatRegistered: false,
  vatRate: 20,
  currency: "GBP",
  disclaimerText:
    "This is an estimate only and is subject to site survey. Prices may vary based on actual conditions, material availability, and scope changes.",
};

export const DEFAULT_PRICING: PricingInputs = {
  method: "day_rate",
  dayRate: 220,
  ratePer1000: 500,
  ratePerM2: 65,
  materialMarkup: 10,
  includeVAT: false,
  vatRate: 20,
};

// API Request/Response Types
export interface EstimateRequest {
  inputs: JobInputs;
  imageBase64?: string;
  imageUrl?: string;
}

export interface EstimateResponse {
  success: boolean;
  data?: EstimateResult;
  error?: string;
}

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
