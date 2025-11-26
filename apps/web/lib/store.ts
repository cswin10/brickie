import { create } from "zustand";
import type {
  JobInputs,
  EstimateResult,
  Job,
  Profile,
  JobType,
  Difficulty,
  AnchorType,
  PricingMethod,
  PricingInputs,
  DEFAULT_PRICING,
} from "@brickie/lib";

interface WebStore {
  // Auth state
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isLoading: boolean;

  // Current estimate
  photoFile: File | null;
  photoPreview: string | null;
  jobType: JobType;
  anchorType: AnchorType;
  anchorValue: string;
  difficulty: Difficulty;
  hasOpenings: boolean;
  jobDescription: string;
  currentResult: EstimateResult | null;
  isEstimating: boolean;
  error: string | null;

  // Pricing inputs
  pricingMethod: PricingMethod;
  dayRate: string;
  ratePer1000: string;
  ratePerM2: string;
  materialMarkup: string;
  includeVAT: boolean;

  // Saved jobs
  jobs: Job[];

  // Actions - Auth
  setUser: (user: { id: string; email: string } | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;

  // Actions - Photo
  setPhotoFile: (file: File | null) => void;
  setPhotoPreview: (preview: string | null) => void;

  // Actions - Inputs
  setJobType: (type: JobType) => void;
  setAnchorType: (type: AnchorType) => void;
  setAnchorValue: (value: string) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setHasOpenings: (hasOpenings: boolean) => void;
  setJobDescription: (description: string) => void;

  // Actions - Pricing
  setPricingMethod: (method: PricingMethod) => void;
  setDayRate: (rate: string) => void;
  setRatePer1000: (rate: string) => void;
  setRatePerM2: (rate: string) => void;
  setMaterialMarkup: (markup: string) => void;
  setIncludeVAT: (include: boolean) => void;

  // Actions - Estimate
  setCurrentResult: (result: EstimateResult | null) => void;
  setEstimating: (estimating: boolean) => void;
  setError: (error: string | null) => void;
  resetEstimate: () => void;

  // Actions - Jobs
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  removeJob: (id: string) => void;

  // Getters
  getInputs: () => JobInputs | null;
  getPricingInputs: () => PricingInputs;
}

export const useStore = create<WebStore>((set, get) => ({
  // Initial state
  user: null,
  profile: null,
  isLoading: true,
  photoFile: null,
  photoPreview: null,
  jobType: "Brickwork",
  anchorType: "length",
  anchorValue: "",
  difficulty: "Standard",
  hasOpenings: false,
  jobDescription: "",
  currentResult: null,
  isEstimating: false,
  error: null,
  jobs: [],

  // Pricing defaults
  pricingMethod: "day_rate",
  dayRate: "220",
  ratePer1000: "500",
  ratePerM2: "65",
  materialMarkup: "10",
  includeVAT: false,

  // Auth actions
  setUser: (user) => set({ user }),
  setProfile: (profile) => {
    // When profile loads, update pricing defaults from profile
    if (profile) {
      set({
        profile,
        dayRate: profile.day_rate?.toString() || "220",
        pricingMethod: profile.default_pricing_method || "day_rate",
        materialMarkup: profile.material_markup?.toString() || "10",
        includeVAT: profile.vat_registered || false,
      });
    } else {
      set({ profile });
    }
  },
  setLoading: (loading) => set({ isLoading: loading }),

  // Photo actions
  setPhotoFile: (file) => set({ photoFile: file }),
  setPhotoPreview: (preview) => set({ photoPreview: preview }),

  // Input actions
  setJobType: (type) => set({ jobType: type }),
  setAnchorType: (type) => set({ anchorType: type }),
  setAnchorValue: (value) => set({ anchorValue: value }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setHasOpenings: (hasOpenings) => set({ hasOpenings }),
  setJobDescription: (description) => set({ jobDescription: description }),

  // Pricing actions
  setPricingMethod: (method) => set({ pricingMethod: method }),
  setDayRate: (rate) => set({ dayRate: rate }),
  setRatePer1000: (rate) => set({ ratePer1000: rate }),
  setRatePerM2: (rate) => set({ ratePerM2: rate }),
  setMaterialMarkup: (markup) => set({ materialMarkup: markup }),
  setIncludeVAT: (include) => set({ includeVAT: include }),

  // Estimate actions
  setCurrentResult: (result) => set({ currentResult: result }),
  setEstimating: (estimating) => set({ isEstimating: estimating }),
  setError: (error) => set({ error }),
  resetEstimate: () =>
    set({
      photoFile: null,
      photoPreview: null,
      jobType: "Brickwork",
      anchorType: "length",
      anchorValue: "",
      difficulty: "Standard",
      hasOpenings: false,
      jobDescription: "",
      currentResult: null,
      error: null,
    }),

  // Jobs actions
  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  removeJob: (id) =>
    set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) })),

  // Getters
  getInputs: () => {
    const { jobType, anchorType, anchorValue, difficulty, hasOpenings, jobDescription } = get();

    if (!anchorValue) return null;

    const parsedValue = parseFloat(anchorValue);
    if (isNaN(parsedValue) || parsedValue <= 0) return null;

    const pricing = get().getPricingInputs();

    return {
      jobType,
      anchorType,
      anchorValue: parsedValue,
      difficulty,
      hasOpenings,
      jobDescription: jobDescription.trim() || undefined,
      pricing,
    };
  },

  getPricingInputs: () => {
    const { pricingMethod, dayRate, ratePer1000, ratePerM2, materialMarkup, includeVAT } = get();

    return {
      method: pricingMethod,
      dayRate: parseFloat(dayRate) || 220,
      ratePer1000: parseFloat(ratePer1000) || 500,
      ratePerM2: parseFloat(ratePerM2) || 65,
      materialMarkup: parseFloat(materialMarkup) || 10,
      includeVAT,
      vatRate: 20,
    };
  },
}));
