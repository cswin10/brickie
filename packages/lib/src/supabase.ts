import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Job, Profile, JobInputs, EstimateResult } from "./types";

// Create Supabase client (untyped for flexibility)
export function createSupabaseClient(
  url: string,
  anonKey: string
): SupabaseClient {
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}

// Profile operations
export async function getProfile(
  supabase: SupabaseClient,
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
  return data as Profile;
}

export async function updateProfile(
  supabase: SupabaseClient,
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
  return data as Profile;
}

// Job operations
export async function createJob(
  supabase: SupabaseClient,
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
  return data as Job;
}

export async function getJobs(
  supabase: SupabaseClient,
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
  return (data || []) as Job[];
}

export async function getJob(
  supabase: SupabaseClient,
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
  return data as Job;
}

export async function deleteJob(
  supabase: SupabaseClient,
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
  supabase: SupabaseClient,
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
  supabase: SupabaseClient,
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
  supabase: SupabaseClient,
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
  supabase: SupabaseClient,
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

export async function signOut(supabase: SupabaseClient): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser(
  supabase: SupabaseClient
): Promise<{ id: string; email: string } | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { id: user.id, email: user.email || "" };
  }
  return null;
}
