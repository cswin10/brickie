"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, ChevronRight, Trash2 } from "lucide-react";
import { Card } from "@brickie/ui";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";
import { getJobs, deleteJob, formatPriceRange, type Job } from "@brickie/lib";

export default function JobsPage() {
  const { user, jobs, setJobs, removeJob } = useStore();
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (job: Job) => {
    if (!user) return;

    if (!confirm("Are you sure you want to delete this job?")) return;

    const supabase = createClient();
    const success = await deleteJob(supabase, job.id, user.id);

    if (success) {
      removeJob(job.id);
    }
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-warm-900 mb-6">Saved Jobs</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-warm-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-warm-900 mb-6">Saved Jobs</h1>
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-warm-400" />
          </div>
          <h2 className="text-lg font-semibold text-warm-900 mb-2">
            No Saved Jobs
          </h2>
          <p className="text-warm-600 mb-4">
            Your saved estimates will appear here
          </p>
          <Link
            href="/dashboard"
            className="text-brick-500 font-medium hover:underline"
          >
            Create your first estimate
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-warm-900 mb-6">Saved Jobs</h1>

      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} padding="none" className="overflow-hidden">
            <div className="flex items-center p-4">
              {job.photo_url && (
                <img
                  src={job.photo_url}
                  alt="Job"
                  className="w-16 h-16 object-cover rounded-lg mr-4"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-warm-900">
                  {job.inputs.jobType}
                </h3>
                <p className="text-brick-500 font-semibold">
                  {formatPriceRange(job.outputs.recommended_price_gbp_range)}
                </p>
                <p className="text-sm text-warm-600">
                  {formatDate(job.created_at)} • {job.inputs.anchorType}:{" "}
                  {job.inputs.anchorValue}m
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDelete(job)}
                  className="p-2 text-warm-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <Link
                  href={`/dashboard/jobs/${job.id}`}
                  className="p-2 text-warm-400 hover:text-warm-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
