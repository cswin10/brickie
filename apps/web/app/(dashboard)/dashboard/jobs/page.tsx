"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, ChevronRight, Trash2, Plus, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";
import { getJobs, deleteJob, formatPriceRange, type Job } from "@brickie/lib";

export default function JobsPage() {
  const { user, jobs, setJobs, removeJob } = useStore();
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      if (!user) return;

      const supabase = createClient();
      const jobsList = await getJobs(supabase, user.id);
      setJobs(jobsList);
      setLoading(false);
    };

    loadJobs();
  }, [user, setJobs]);

  const handleDelete = async (e: React.MouseEvent, job: Job) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    if (!confirm("Are you sure you want to delete this job?")) return;

    setDeletingId(job.id);
    const supabase = createClient();
    const success = await deleteJob(supabase, job.id, user.id);

    if (success) {
      removeJob(job.id);
    }
    setDeletingId(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh bg-grid pb-8">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-brick-600/10" />
          <div className="relative px-4 pt-8 pb-16 sm:pt-12">
            <div className="max-w-lg mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-blue-400" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Saved Jobs</h1>
              </div>
              <p className="text-slate-200 text-sm sm:text-base ml-13">Your estimate history</p>
            </div>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 -mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-card rounded-2xl h-24 shimmer animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen bg-mesh bg-grid pb-8">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-brick-600/10" />
          <div className="relative px-4 pt-8 pb-16 sm:pt-12">
            <div className="max-w-lg mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-blue-400" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Saved Jobs</h1>
              </div>
              <p className="text-slate-200 text-sm sm:text-base ml-13">Your estimate history</p>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 -mt-8">
          <div className="glass-card rounded-2xl p-8 text-center animate-scale-in">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 opacity-20 blur-xl" />
              <div className="relative w-full h-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <FolderOpen className="w-9 h-9 text-slate-300" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              No Saved Jobs Yet
            </h2>
            <p className="text-slate-300 mb-6">
              Your saved estimates will appear here
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 btn-gradient text-white px-6 py-3 rounded-xl font-semibold"
            >
              <Sparkles className="w-5 h-5" />
              Create Your First Estimate
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh bg-grid pb-8">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-brick-600/10" />
        <div className="relative px-4 pt-8 pb-16 sm:pt-12">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Saved Jobs</h1>
                  <p className="text-slate-200 text-sm">{jobs.length} estimate{jobs.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="p-3 btn-gradient rounded-xl tap-highlight"
              >
                <Plus className="w-5 h-5 text-white" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8 space-y-3">
        {jobs.map((job, index) => (
          <Link
            key={job.id}
            href={`/dashboard/jobs/${job.id}`}
            className="glass-card rounded-2xl overflow-hidden block transition-all hover:scale-[1.02] tap-highlight animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center p-4 gap-4">
              {job.photo_url ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={job.photo_url}
                    alt="Job"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🧱</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white">
                    {job.inputs.jobType}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    job.inputs.difficulty === "Easy"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : job.inputs.difficulty === "Standard"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {job.inputs.difficulty}
                  </span>
                </div>
                <p className="text-brick-400 font-bold text-lg">
                  {formatPriceRange(job.outputs.recommended_price_gbp_range)}
                </p>
                <p className="text-sm text-slate-300">
                  {formatDate(job.created_at)} • {job.inputs.anchorValue}m {job.inputs.anchorType}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDelete(e, job)}
                  disabled={deletingId === job.id}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all tap-highlight"
                >
                  {deletingId === job.id ? (
                    <div className="w-5 h-5 border-2 border-slate-500 border-t-red-400 rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
