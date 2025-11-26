import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SavedJob, AppSettings } from "@brickie/lib";
import { DEFAULT_SETTINGS } from "@brickie/lib";

const STORAGE_KEYS = {
  JOBS: "brickie_jobs",
  SETTINGS: "brickie_settings",
  API_KEY: "brickie_api_key",
} as const;

// Jobs Storage
export async function saveJob(job: SavedJob): Promise<void> {
  const jobs = await getJobs();
  const existingIndex = jobs.findIndex((j) => j.id === job.id);

  if (existingIndex >= 0) {
    jobs[existingIndex] = job;
  } else {
    jobs.unshift(job);
  }

  await AsyncStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
}

export async function getJobs(): Promise<SavedJob[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.JOBS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function getJob(id: string): Promise<SavedJob | null> {
  const jobs = await getJobs();
  return jobs.find((j) => j.id === id) || null;
}

export async function deleteJob(id: string): Promise<void> {
  const jobs = await getJobs();
  const filtered = jobs.filter((j) => j.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(filtered));
}

export async function clearAllJobs(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.JOBS);
}

// Settings Storage
export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// API Key Storage
export async function saveApiKey(key: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, key);
}

export async function getApiKey(): Promise<string> {
  try {
    const key = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
    // Also check environment variable
    const envKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    return key || envKey || "";
  } catch {
    return process.env.EXPO_PUBLIC_OPENAI_API_KEY || "";
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
