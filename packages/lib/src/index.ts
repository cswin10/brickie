// Types
export * from "./types";

// Estimation
export { estimateJob, calculateLocalEstimate, normalizeEstimate } from "./estimate";
export {
  BRICK_DIMENSIONS,
  MORTAR_JOINT,
  BRICKS_PER_SQM,
  MATERIALS_PER_1000_BRICKS,
  LABOUR_RATES,
  DIFFICULTY_MULTIPLIERS,
} from "./estimate";

// OpenAI
export { callOpenAI, fileToBase64, urlToBase64 } from "./openai";
export type { OpenAIConfig, ImageSource } from "./openai";

// Pricing
export {
  formatCurrency,
  formatRange,
  formatPriceRange,
  formatLabourRange,
  hoursToWorkdays,
  calculatePriceWithDayRate,
  calculateDetailedPricing,
  PRICING,
} from "./pricing";

// Prompt
export { SYSTEM_MESSAGE, buildUserMessage } from "./prompt";

// Validators
export {
  validateJobInputs,
  validateEstimateResult,
  isValidEmail,
  isValidPassword,
  validateAnchorValue,
  jobTypeSchema,
  difficultySchema,
  anchorTypeSchema,
  jobInputsSchema,
  estimateResultSchema,
} from "./validators";

// Supabase
export {
  createSupabaseClient,
  getProfile,
  updateProfile,
  createJob,
  getJobs,
  getJob,
  deleteJob,
  uploadJobImage,
  deleteJobImage,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
} from "./supabase";
export type { Database } from "./supabase";
