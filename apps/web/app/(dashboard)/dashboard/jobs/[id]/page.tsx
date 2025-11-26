"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PoundSterling, Clock, Boxes, FileText, Trash2, ArrowLeft } from "lucide-react";
import { Button, Card, PageLoader } from "@brickie/ui";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";
import {
  getJob,
  deleteJob,
  formatPriceRange,
  formatLabourRange,
  formatRange,
  type Job,
} from "@brickie/lib";
import { generatePDF } from "@/lib/pdf";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile, removeJob } = useStore();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      if (!user || !params.id) return;

      const supabase = createClient();
      const jobData = await getJob(supabase, params.id as string, user.id);
      setJob(jobData);
      setLoading(false);
    };

    loadJob();
  }, [user, params.id]);

  const handleDelete = async () => {
    if (!user || !job) return;

    if (!confirm("Are you sure you want to delete this job?")) return;

    const supabase = createClient();
    const success = await deleteJob(supabase, job.id, user.id);

    if (success) {
      removeJob(job.id);
      router.push("/dashboard/jobs");
    }
  };

  const handleGeneratePDF = async () => {
    if (!job || !profile) return;

    setIsGeneratingPDF(true);

    try {
      await generatePDF(
        {
          id: job.id,
          timestamp: new Date(job.created_at).getTime(),
          inputs: job.inputs,
          outputs: job.outputs,
          photoUri: job.photo_url || "",
        },
        {
          companyName: profile.company_name || "",
          defaultDayRate: profile.day_rate || 220,
          currency: "GBP",
          disclaimerText: profile.disclaimer_text || "",
        }
      );
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-warm-600 mb-4">Job not found</p>
        <Button onClick={() => router.push("/dashboard/jobs")}>
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.push("/dashboard/jobs")}
        className="flex items-center text-warm-600 hover:text-warm-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </button>

      <div className="space-y-6">
        {/* Photo */}
        {job.photo_url && (
          <img
            src={job.photo_url}
            alt="Job photo"
            className="w-full h-64 object-cover rounded-xl"
          />
        )}

        {/* Job Info */}
        <div>
          <h1 className="text-2xl font-bold text-warm-900">
            {job.inputs.jobType}
          </h1>
          <p className="text-sm text-warm-500">{formatDate(job.created_at)}</p>
          <p className="text-warm-600 mt-1">
            {job.inputs.anchorType}: {job.inputs.anchorValue}m •{" "}
            {job.inputs.difficulty}
            {job.inputs.hasOpenings ? " • Has openings" : ""}
          </p>
        </div>

        {/* Price */}
        <div className="bg-brick-500 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <PoundSterling className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">ESTIMATED PRICE</span>
          </div>
          <p className="text-3xl font-bold">
            {formatPriceRange(job.outputs.recommended_price_gbp_range)}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-warm-100">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4 text-warm-600" />
              <span className="text-xs font-medium text-warm-600 uppercase">
                Labour
              </span>
            </div>
            <p className="text-lg font-semibold text-warm-900">
              {formatLabourRange(job.outputs.labour_hours_range)}
            </p>
          </Card>
          <Card className="bg-warm-100">
            <span className="text-xs font-medium text-warm-600 uppercase">
              Area
            </span>
            <p className="text-lg font-semibold text-warm-900">
              {job.outputs.area_m2.toFixed(1)} m²
            </p>
          </Card>
        </div>

        {/* Materials */}
        <Card title="Materials">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-warm-200">
              <div className="flex items-center space-x-2">
                <Boxes className="w-4 h-4 text-brick-500" />
                <span className="text-warm-700">Bricks</span>
              </div>
              <span className="font-semibold text-warm-900">
                {formatRange(job.outputs.brick_count_range)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-warm-200">
              <span className="text-warm-700">Sand</span>
              <span className="font-semibold text-warm-900">
                {formatRange(job.outputs.materials.sand_kg_range)} kg
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-warm-700">Cement</span>
              <span className="font-semibold text-warm-900">
                {formatRange(job.outputs.materials.cement_bags_range)} bags
              </span>
            </div>
          </div>
        </Card>

        {/* Assumptions */}
        {job.outputs.assumptions?.length > 0 && (
          <Card title="Assumptions">
            <ul className="space-y-2">
              {job.outputs.assumptions.map((item, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-brick-500 rounded-full mt-2" />
                  <span className="text-warm-700">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Exclusions */}
        {job.outputs.exclusions?.length > 0 && (
          <Card title="Exclusions">
            <ul className="space-y-2">
              {job.outputs.exclusions.map((item, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2" />
                  <span className="text-warm-700">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            fullWidth
            onClick={handleGeneratePDF}
            loading={isGeneratingPDF}
          >
            <FileText className="w-5 h-5 mr-2" />
            Generate PDF
          </Button>
          <Button variant="ghost" fullWidth onClick={handleDelete}>
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Job
          </Button>
        </div>
      </div>
    </div>
  );
}
