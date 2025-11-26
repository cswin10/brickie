// Job Types
export type JobType = "Brickwork" | "Blockwork" | "Repointing" | "Demo+Rebuild";
export type Difficulty = "Easy" | "Standard" | "Tricky";
export type AnchorType = "length" | "height";

// Input Types
export interface JobInputs {
  jobType: JobType;
  anchorType: AnchorType;
  anchorValue: number;
  difficulty: Difficulty;
  hasOpenings: boolean;
  photoUri?: string;
  photoUrl?: string;
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

// Database Types
export interface Profile {
  id: string;
  email: string;
  company_name: string | null;
  day_rate: number;
  disclaimer_text: string | null;
  created_at: string;
  updated_at: string;
}

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
  defaultDayRate: number;
  currency: "GBP";
  disclaimerText: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  companyName: "",
  defaultDayRate: 220,
  currency: "GBP",
  disclaimerText:
    "This is an estimate only and is subject to site survey. Prices may vary based on actual conditions, material availability, and scope changes.",
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
