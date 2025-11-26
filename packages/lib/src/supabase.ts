import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Job, Profile, JobInputs, EstimateResult } from "./types";

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      jobs: {
        Row: Job;
        Insert: Omit<Job, "id" | "created_at">;
        Update: Partial<Omit<Job, "id" | "user_id" | "created_at">>;
      };
    };
  };
}

// Create Supabase client
export function createSupabaseClient(
  url: string,
  anonKey: string
): SupabaseClient<Database> {
  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}

// Profile operations
export async function getProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data;
}

export async function updateProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  updates: Partial<Omit<Profile, "id" | "created_at">>
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
  return data;
}

// Job operations
export async function createJob(
  supabase: SupabaseClient<Database>,
  userId: string,
  inputs: JobInputs,
  outputs: EstimateResult,
  photoUrl: string | null
): Promise<Job> {
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      user_id: userId,
      photo_url: photoUrl,
      inputs,
      outputs,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating job:", error);
    throw error;
  }
  return data;
}

export async function getJobs(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
  return data || [];
}

export async function getJob(
  supabase: SupabaseClient<Database>,
  jobId: string,
  userId: string
): Promise<Job | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching job:", error);
    return null;
  }
  return data;
}

export async function deleteJob(
  supabase: SupabaseClient<Database>,
  jobId: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", jobId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting job:", error);
    return false;
  }
  return true;
}

// Storage operations
export async function uploadJobImage(
  supabase: SupabaseClient<Database>,
  userId: string,
  file: File | Blob,
  fileName: string
): Promise<string | null> {
  const filePath = `${userId}/${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from("job-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading image:", error);
    return null;
  }

  const { data } = supabase.storage.from("job-images").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function deleteJobImage(
  supabase: SupabaseClient<Database>,
  filePath: string
): Promise<boolean> {
  const { error } = await supabase.storage
    .from("job-images")
    .remove([filePath]);

  if (error) {
    console.error("Error deleting image:", error);
    return false;
  }
  return true;
}

// Auth helpers
export async function signUp(
  supabase: SupabaseClient<Database>,
  email: string,
  password: string
): Promise<{ user: { id: string; email: string } | null; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (data.user) {
    return {
      user: { id: data.user.id, email: data.user.email || email },
      error: null,
    };
  }

  return { user: null, error: "Unknown error occurred" };
}

export async function signIn(
  supabase: SupabaseClient<Database>,
  email: string,
  password: string
): Promise<{ user: { id: string; email: string } | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (data.user) {
    return {
      user: { id: data.user.id, email: data.user.email || email },
      error: null,
    };
  }

  return { user: null, error: "Unknown error occurred" };
}

export async function signOut(
  supabase: SupabaseClient<Database>
): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser(
  supabase: SupabaseClient<Database>
): Promise<{ id: string; email: string } | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { id: user.id, email: user.email || "" };
  }
  return null;
}
