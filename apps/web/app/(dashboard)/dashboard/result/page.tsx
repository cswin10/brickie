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
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import {
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
      <div className="min-h-screen bg-mesh bg-grid flex items-center justify-center p-4">
        <div className="text-center animate-scale-in">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 opacity-20 blur-xl" />
            <div className="relative w-full h-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <AlertCircle className="w-9 h-9 text-slate-400" />
            </div>
          </div>
          <p className="text-slate-300 mb-6">No estimate results available</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-gradient text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
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
          logoUrl: profile.logo_url || undefined,
          phone: profile.phone || undefined,
          address: profile.address || undefined,
          email: user?.email || undefined,
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
    <div className="min-h-screen bg-mesh bg-grid">
      {/* Header with photo */}
      <div className="relative">
        {photoPreview ? (
          <div className="relative h-48 sm:h-64">
            <img
              src={photoPreview}
              alt="Job"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-black/40 to-transparent" />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-brick-600/30 via-transparent to-purple-600/20" />
        )}

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2.5 glass rounded-xl text-white hover:bg-white/20 transition-all tap-highlight"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Job Type Badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 glass rounded-xl text-white text-sm font-semibold">
              {inputs.jobType}
            </span>
            <span className={`px-3 py-1.5 rounded-xl text-sm font-medium ${
              inputs.difficulty === "Easy"
                ? "bg-emerald-500/20 text-emerald-400"
                : inputs.difficulty === "Standard"
                ? "bg-amber-500/20 text-amber-400"
                : "bg-red-500/20 text-red-400"
            }`}>
              {inputs.difficulty}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6 relative z-10 space-y-4 pb-8">
        {/* Main Price Card */}
        <div className="glass-card rounded-2xl overflow-hidden animate-scale-in">
          <div className="relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-brick-500/20 to-brick-600/10" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-brick-500/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-brick-400" />
                <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Your Quote
                </p>
              </div>
              <p className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {formatCurrency(finalPricing.totalLow)} – {formatCurrency(finalPricing.totalHigh)}
              </p>
              {pricingInputs.includeVAT && (
                <p className="text-sm text-slate-400 mt-2">inc. VAT</p>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-4 space-y-3 border-t border-white/5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Labour <span className="text-slate-400">({pricingMethodLabel})</span></span>
              <span className="font-semibold text-white">
                {formatCurrency(finalPricing.labourLow)} – {formatCurrency(finalPricing.labourHigh)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Materials <span className="text-slate-400">(+{pricingInputs.materialMarkup}%)</span></span>
              <span className="font-semibold text-white">
                {formatCurrency(finalPricing.materialsLow)} – {formatCurrency(finalPricing.materialsHigh)}
              </span>
            </div>
            {pricingInputs.includeVAT && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">VAT (20%)</span>
                <span className="font-semibold text-white">
                  {formatCurrency(finalPricing.vatLow)} – {formatCurrency(finalPricing.vatHigh)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-2xl p-4 text-center animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="w-10 h-10 rounded-xl bg-brick-500/20 flex items-center justify-center mx-auto mb-2">
              <Ruler className="w-5 h-5 text-brick-400" />
            </div>
            <p className="text-xl font-bold text-white">{currentResult.area_m2.toFixed(1)}</p>
            <p className="text-xs text-slate-400">m²</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-xl font-bold text-white">
              {currentResult.labour_hours_range[0]}–{currentResult.labour_hours_range[1]}
            </p>
            <p className="text-xs text-slate-400">hours</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
              <Boxes className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-xl font-bold text-white">
              {currentResult.brick_count_range[0]}–{currentResult.brick_count_range[1]}
            </p>
            <p className="text-xs text-slate-400">bricks</p>
          </div>
        </div>

        {/* Materials */}
        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Materials Needed</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-300">Bricks</span>
              <span className="font-bold text-white">{formatRange(currentResult.brick_count_range)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-300">Sand</span>
              <span className="font-bold text-white">{formatRange(currentResult.materials.sand_kg_range)} kg</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-300">Cement</span>
              <span className="font-bold text-white">{formatRange(currentResult.materials.cement_bags_range)} bags</span>
            </div>
          </div>
        </div>

        {/* Assumptions */}
        {currentResult.assumptions?.length > 0 && (
          <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Assumptions</h3>
            <ul className="space-y-2">
              {currentResult.assumptions.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Exclusions */}
        {currentResult.exclusions?.length > 0 && (
          <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Not Included</h3>
            <ul className="space-y-2">
              {currentResult.exclusions.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2 animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <button
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF}
            className="w-full py-4 px-6 glass text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all tap-highlight"
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
            className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all tap-highlight ${
              saved
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
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
            className="w-full py-4 px-6 btn-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-3"
          >
            <Plus className="w-5 h-5" />
            New Estimate
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-slate-600 text-center px-4 pt-2">
          This is an estimate only. Actual costs may vary based on site conditions, material prices, and scope changes.
        </p>
      </div>
    </div>
  );
}
