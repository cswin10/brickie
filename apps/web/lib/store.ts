import { create } from "zustand";
import type {
  JobInputs,
  EstimateResult,
  Job,
  Profile,
  JobType,
  Difficulty,
  AnchorType,
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
  currentResult: EstimateResult | null;
  isEstimating: boolean;
  error: string | null;

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
  currentResult: null,
  isEstimating: false,
  error: null,
  jobs: [],

  // Auth actions
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
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
    const { jobType, anchorType, anchorValue, difficulty, hasOpenings } = get();

    if (!anchorValue) return null;

    const parsedValue = parseFloat(anchorValue);
    if (isNaN(parsedValue) || parsedValue <= 0) return null;

    return {
      jobType,
      anchorType,
      anchorValue: parsedValue,
      difficulty,
      hasOpenings,
    };
  },
}));
