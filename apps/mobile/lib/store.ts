import { create } from "zustand";
import type {
  JobInputs,
  EstimateResult,
  SavedJob,
  AppSettings,
  JobType,
  Difficulty,
  AnchorType,
  Profile,
  Job,
} from "@brickie/lib";
import { DEFAULT_SETTINGS } from "@brickie/lib";
import {
  saveJob as saveJobToStorage,
  getJobs,
  deleteJob as deleteJobFromStorage,
  getSettings,
  saveSettings as saveSettingsToStorage,
  getApiKey,
  saveApiKey as saveApiKeyToStorage,
  generateId,
} from "./storage";

interface EstimateState {
  // Auth state
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isAuthenticated: boolean;

  // Current estimate flow
  photoUri: string | null;
  jobType: JobType;
  anchorType: AnchorType;
  anchorValue: string;
  difficulty: Difficulty;
  hasOpenings: boolean;
  currentResult: EstimateResult | null;
  isLoading: boolean;
  error: string | null;

  // Saved jobs (local)
  savedJobs: SavedJob[];

  // Cloud jobs
  cloudJobs: Job[];

  // Settings
  settings: AppSettings;
  apiKey: string;

  // Actions - Auth
  setUser: (user: { id: string; email: string } | null) => void;
  setProfile: (profile: Profile | null) => void;
  setAuthenticated: (authenticated: boolean) => void;

  // Actions - Photo
  setPhotoUri: (uri: string | null) => void;

  // Actions - Inputs
  setJobType: (type: JobType) => void;
  setAnchorType: (type: AnchorType) => void;
  setAnchorValue: (value: string) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setHasOpenings: (hasOpenings: boolean) => void;

  // Actions - Estimate
  setCurrentResult: (result: EstimateResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetEstimate: () => void;

  // Actions - Local Jobs
  loadJobs: () => Promise<void>;
  saveCurrentJob: () => Promise<SavedJob | null>;
  deleteJob: (id: string) => Promise<void>;
  loadJobById: (id: string) => SavedJob | null;

  // Actions - Cloud Jobs
  setCloudJobs: (jobs: Job[]) => void;
  addCloudJob: (job: Job) => void;
  removeCloudJob: (id: string) => void;

  // Actions - Settings
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  setApiKey: (key: string) => Promise<void>;
  loadApiKey: () => Promise<void>;

  // Getters
  getInputs: () => JobInputs | null;
}

export const useStore = create<EstimateState>((set, get) => ({
  // Initial state
  user: null,
  profile: null,
  isAuthenticated: false,
  photoUri: null,
  jobType: "Brickwork",
  anchorType: "length",
  anchorValue: "",
  difficulty: "Standard",
  hasOpenings: false,
  currentResult: null,
  isLoading: false,
  error: null,
  savedJobs: [],
  cloudJobs: [],
  settings: DEFAULT_SETTINGS,
  apiKey: "",

  // Auth actions
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),

  // Photo actions
  setPhotoUri: (uri) => set({ photoUri: uri }),

  // Input actions
  setJobType: (type) => set({ jobType: type }),
  setAnchorType: (type) => set({ anchorType: type }),
  setAnchorValue: (value) => set({ anchorValue: value }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setHasOpenings: (hasOpenings) => set({ hasOpenings }),

  // Estimate actions
  setCurrentResult: (result) => set({ currentResult: result }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  resetEstimate: () =>
    set({
      photoUri: null,
      jobType: "Brickwork",
      anchorType: "length",
      anchorValue: "",
      difficulty: "Standard",
      hasOpenings: false,
      currentResult: null,
      error: null,
    }),

  // Local jobs actions
  loadJobs: async () => {
    const jobs = await getJobs();
    set({ savedJobs: jobs });
  },

  saveCurrentJob: async () => {
    const state = get();
    const inputs = state.getInputs();

    if (!inputs || !state.currentResult) {
      return null;
    }

    const job: SavedJob = {
      id: generateId(),
      timestamp: Date.now(),
      inputs,
      outputs: state.currentResult,
      photoUri: inputs.photoUri || "",
    };

    await saveJobToStorage(job);
    await get().loadJobs();

    return job;
  },

  deleteJob: async (id) => {
    await deleteJobFromStorage(id);
    await get().loadJobs();
  },

  loadJobById: (id) => {
    const { savedJobs } = get();
    return savedJobs.find((j) => j.id === id) || null;
  },

  // Cloud jobs actions
  setCloudJobs: (jobs) => set({ cloudJobs: jobs }),
  addCloudJob: (job) =>
    set((state) => ({ cloudJobs: [job, ...state.cloudJobs] })),
  removeCloudJob: (id) =>
    set((state) => ({ cloudJobs: state.cloudJobs.filter((j) => j.id !== id) })),

  // Settings actions
  loadSettings: async () => {
    const settings = await getSettings();
    set({ settings });
  },

  updateSettings: async (newSettings) => {
    const { settings } = get();
    const updated = { ...settings, ...newSettings };
    await saveSettingsToStorage(updated);
    set({ settings: updated });
  },

  setApiKey: async (key) => {
    await saveApiKeyToStorage(key);
    set({ apiKey: key });
  },

  loadApiKey: async () => {
    const key = await getApiKey();
    set({ apiKey: key });
  },

  // Getters
  getInputs: () => {
    const { photoUri, jobType, anchorType, anchorValue, difficulty, hasOpenings } =
      get();

    if (!photoUri || !anchorValue) {
      return null;
    }

    const parsedValue = parseFloat(anchorValue);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      return null;
    }

    return {
      jobType,
      anchorType,
      anchorValue: parsedValue,
      difficulty,
      hasOpenings,
      photoUri,
    };
  },
}));
