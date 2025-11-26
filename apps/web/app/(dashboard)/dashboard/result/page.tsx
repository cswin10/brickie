"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PoundSterling, Clock, Boxes, FileText, Save, Plus } from "lucide-react";
import { Button, Card } from "@brickie/ui";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import {
  formatPriceRange,
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

  // Calculate final pricing with user's rates
  const finalPricing = useMemo(() => {
    if (!currentResult || !inputs) return null;
    return calculateFinalPricing(currentResult, pricingInputs, inputs.jobType);
  }, [currentResult, pricingInputs, inputs]);

  if (!currentResult || !inputs || !finalPricing) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-warm-600 mb-4">No estimate results available</p>
        <Button onClick={() => router.push("/dashboard")}>
          Start New Estimate
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      const supabase = createClient();

      // Upload image if available
      let photoUrl: string | null = null;
      if (photoFile) {
        photoUrl = await uploadJobImage(
          supabase,
          user.id,
          photoFile,
          photoFile.name
        );
      }

      // Save job
      const job = await createJob(
        supabase,
        user.id,
        inputs,
        currentResult,
        photoUrl
      );

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

  // Format pricing method for display
  const pricingMethodLabel = {
    day_rate: `£${pricingInputs.dayRate}/day`,
    per_1000_bricks: `£${pricingInputs.ratePer1000}/1000 bricks`,
    per_m2: `£${pricingInputs.ratePerM2}/m²`,
  }[pricingInputs.method];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-warm-900 mb-6">Estimate Results</h1>

      <div className="space-y-6">
        {/* Photo Preview */}
        {photoPreview && (
          <img
            src={photoPreview}
            alt="Job photo"
            className="w-full h-48 object-cover rounded-xl"
          />
        )}

        {/* Job Info */}
        <div>
          <h2 className="text-xl font-semibold text-warm-900">
            {inputs.jobType}
          </h2>
          <p className="text-warm-600">
            {inputs.anchorType}: {inputs.anchorValue}m • {inputs.difficulty}
            {inputs.hasOpenings ? " • Has openings" : ""}
          </p>
        </div>

        {/* Price Breakdown */}
        <div className="bg-brick-500 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-2 mb-4">
            <PoundSterling className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">YOUR QUOTE</span>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between opacity-90">
              <span>Labour ({pricingMethodLabel})</span>
              <span>{formatCurrency(finalPricing.labourLow)} – {formatCurrency(finalPricing.labourHigh)}</span>
            </div>
            <div className="flex justify-between opacity-90">
              <span>Materials ({pricingInputs.materialMarkup}% markup)</span>
              <span>{formatCurrency(finalPricing.materialsLow)} – {formatCurrency(finalPricing.materialsHigh)}</span>
            </div>
            {pricingInputs.includeVAT && (
              <div className="flex justify-between opacity-90">
                <span>VAT (20%)</span>
                <span>{formatCurrency(finalPricing.vatLow)} – {formatCurrency(finalPricing.vatHigh)}</span>
              </div>
            )}
            <div className="border-t border-white/30 pt-2 mt-2" />
          </div>

          <p className="text-3xl font-bold">
            {formatCurrency(finalPricing.totalLow)} – {formatCurrency(finalPricing.totalHigh)}
          </p>
          {pricingInputs.includeVAT && (
            <p className="text-sm opacity-80 mt-1">inc. VAT</p>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-warm-100">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4 text-warm-600" />
              <span className="text-xs font-medium text-warm-600 uppercase">
                Labour
              </span>
            </div>
            <p className="text-lg font-semibold text-warm-900">
              {formatLabourRange(currentResult.labour_hours_range)}
            </p>
          </Card>
          <Card className="bg-warm-100">
            <span className="text-xs font-medium text-warm-600 uppercase">
              Area
            </span>
            <p className="text-lg font-semibold text-warm-900">
              {currentResult.area_m2.toFixed(1)} m²
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
                {formatRange(currentResult.brick_count_range)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-warm-200">
              <span className="text-warm-700">Sand</span>
              <span className="font-semibold text-warm-900">
                {formatRange(currentResult.materials.sand_kg_range)} kg
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-warm-700">Cement</span>
              <span className="font-semibold text-warm-900">
                {formatRange(currentResult.materials.cement_bags_range)} bags
              </span>
            </div>
            {currentResult.materials.other?.length > 0 && (
              <div className="pt-2 border-t border-warm-200">
                <p className="text-sm text-warm-600 mb-1">Other:</p>
                <ul className="list-disc list-inside text-sm text-warm-700">
                  {currentResult.materials.other.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        {/* Assumptions */}
        {currentResult.assumptions?.length > 0 && (
          <Card title="Assumptions">
            <ul className="space-y-2">
              {currentResult.assumptions.map((item, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-brick-500 rounded-full mt-2" />
                  <span className="text-warm-700">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Exclusions */}
        {currentResult.exclusions?.length > 0 && (
          <Card title="Exclusions">
            <ul className="space-y-2">
              {currentResult.exclusions.map((item, i) => (
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
          <Button
            variant="secondary"
            fullWidth
            onClick={handleSave}
            loading={isSaving}
            disabled={saved}
          >
            <Save className="w-5 h-5 mr-2" />
            {saved ? "Saved" : "Save Job"}
          </Button>
          <Button fullWidth onClick={handleNewEstimate}>
            <Plus className="w-5 h-5 mr-2" />
            New Estimate
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-warm-500 text-center">
          This is an estimate only. Actual costs may vary based on site
          conditions, material prices, and scope changes.
        </p>
      </div>
    </div>
  );
}
