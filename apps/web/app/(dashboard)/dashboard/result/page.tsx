"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Ruler,
  FileText,
  Save,
  Plus,
  CheckCircle2,
  AlertCircle,
  Boxes,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import {
  formatLabourRange,
  formatRange,
  formatCurrency,
  createJob,
  uploadJobImage,
  calculateFinalPricing,
} from "@brickie/lib";
import { generatePDF } from "@/lib/pdf";

export default function ResultPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    currentResult,
    photoFile,
    photoPreview,
    user,
    profile,
    addJob,
    resetEstimate,
    getInputs,
    getPricingInputs,
  } = useStore();

  const inputs = getInputs();
  const pricingInputs = getPricingInputs();

  const finalPricing = useMemo(() => {
    if (!currentResult || !inputs) return null;
    return calculateFinalPricing(currentResult, pricingInputs, inputs.jobType);
  }, [currentResult, pricingInputs, inputs]);

  if (!currentResult || !inputs || !finalPricing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 mb-4">No estimate results available</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-gradient text-white px-6 py-3 rounded-xl font-semibold"
          >
            Start New Estimate
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const supabase = createClient();
      let photoUrl: string | null = null;
      if (photoFile) {
        photoUrl = await uploadJobImage(supabase, user.id, photoFile, photoFile.name);
      }
      const job = await createJob(supabase, user.id, inputs, currentResult, photoUrl);
      addJob(job);
      setSaved(true);
    } catch (err) {
      console.error("Failed to save job:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!profile) return;
    setIsGeneratingPDF(true);

    try {
      await generatePDF(
        {
          id: `temp-${Date.now()}`,
          timestamp: Date.now(),
          inputs,
          outputs: currentResult,
          photoUri: photoPreview || "",
        },
        {
          companyName: profile.company_name || "",
          defaultDayRate: profile.day_rate || 220,
          defaultPricingMethod: "day_rate",
          defaultRatePer1000: 500,
          defaultRatePerM2: 65,
          materialMarkup: 10,
          vatRegistered: false,
          vatRate: 20,
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

  const handleNewEstimate = () => {
    resetEstimate();
    router.push("/dashboard");
  };

  const pricingMethodLabel = {
    day_rate: `£${pricingInputs.dayRate}/day`,
    per_1000_bricks: `£${pricingInputs.ratePer1000}/1000`,
    per_m2: `£${pricingInputs.ratePerM2}/m²`,
  }[pricingInputs.method];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header with photo */}
      <div className="relative">
        {photoPreview ? (
          <div className="relative h-48 sm:h-64">
            <img
              src={photoPreview}
              alt="Job"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-r from-brick-600 to-brick-700" />
        )}

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Job Type Badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              {inputs.jobType}
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
              {inputs.difficulty}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6 relative z-10 space-y-4 pb-8">
        {/* Main Price Card */}
        <div className="card-modern overflow-hidden">
          <div className="bg-gradient-to-br from-brick-500 to-brick-700 p-6 text-white">
            <p className="text-sm font-medium text-brick-100 uppercase tracking-wide mb-2">
              Your Quote
            </p>
            <p className="text-4xl sm:text-5xl font-bold tracking-tight">
              {formatCurrency(finalPricing.totalLow)} – {formatCurrency(finalPricing.totalHigh)}
            </p>
            {pricingInputs.includeVAT && (
              <p className="text-sm text-brick-100 mt-1">inc. VAT</p>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="p-4 space-y-3 bg-white">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Labour <span className="text-slate-400">({pricingMethodLabel})</span></span>
              <span className="font-medium text-slate-800">
                {formatCurrency(finalPricing.labourLow)} – {formatCurrency(finalPricing.labourHigh)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Materials <span className="text-slate-400">(+{pricingInputs.materialMarkup}%)</span></span>
              <span className="font-medium text-slate-800">
                {formatCurrency(finalPricing.materialsLow)} – {formatCurrency(finalPricing.materialsHigh)}
              </span>
            </div>
            {pricingInputs.includeVAT && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">VAT (20%)</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(finalPricing.vatLow)} – {formatCurrency(finalPricing.vatHigh)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card-modern p-4 text-center">
            <Ruler className="w-5 h-5 text-brick-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-slate-800">{currentResult.area_m2.toFixed(1)}</p>
            <p className="text-xs text-slate-500">m²</p>
          </div>
          <div className="card-modern p-4 text-center">
            <Clock className="w-5 h-5 text-brick-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-slate-800">
              {currentResult.labour_hours_range[0]}–{currentResult.labour_hours_range[1]}
            </p>
            <p className="text-xs text-slate-500">hours</p>
          </div>
          <div className="card-modern p-4 text-center">
            <Boxes className="w-5 h-5 text-brick-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-slate-800">
              {currentResult.brick_count_range[0]}–{currentResult.brick_count_range[1]}
            </p>
            <p className="text-xs text-slate-500">bricks</p>
          </div>
        </div>

        {/* Materials */}
        <div className="card-modern p-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Materials Needed</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Bricks</span>
              <span className="font-semibold text-slate-800">{formatRange(currentResult.brick_count_range)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Sand</span>
              <span className="font-semibold text-slate-800">{formatRange(currentResult.materials.sand_kg_range)} kg</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Cement</span>
              <span className="font-semibold text-slate-800">{formatRange(currentResult.materials.cement_bags_range)} bags</span>
            </div>
          </div>
        </div>

        {/* Assumptions */}
        {currentResult.assumptions?.length > 0 && (
          <div className="card-modern p-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Assumptions</h3>
            <ul className="space-y-2">
              {currentResult.assumptions.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Exclusions */}
        {currentResult.exclusions?.length > 0 && (
          <div className="card-modern p-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Not Included</h3>
            <ul className="space-y-2">
              {currentResult.exclusions.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF}
            className="w-full py-4 px-6 bg-slate-800 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all tap-highlight"
          >
            {isGeneratingPDF ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Generate PDF Quote
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || saved}
            className={`w-full py-4 px-6 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all tap-highlight ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Job
              </>
            )}
          </button>

          <button
            onClick={handleNewEstimate}
            className="w-full py-4 px-6 btn-gradient text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Estimate
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-slate-400 text-center px-4">
          This is an estimate only. Actual costs may vary based on site conditions, material prices, and scope changes.
        </p>
      </div>
    </div>
  );
}
