"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Camera,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Ruler,
  Settings2,
  ImagePlus
} from "lucide-react";
import { useStore } from "@/lib/store";
import { fileToBase64, type JobType, type Difficulty, type AnchorType, type PricingMethod } from "@brickie/lib";

const JOB_TYPES: { label: string; value: JobType; icon: string }[] = [
  { label: "Brickwork", value: "Brickwork", icon: "🧱" },
  { label: "Blockwork", value: "Blockwork", icon: "⬜" },
  { label: "Repointing", value: "Repointing", icon: "🔧" },
  { label: "Demo+Rebuild", value: "Demo+Rebuild", icon: "🔨" },
];

const DIFFICULTIES: { label: string; value: Difficulty; color: string }[] = [
  { label: "Easy", value: "Easy", color: "bg-emerald-500" },
  { label: "Standard", value: "Standard", color: "bg-amber-500" },
  { label: "Tricky", value: "Tricky", color: "bg-red-500" },
];

const PRICING_METHODS: { label: string; value: PricingMethod; description: string }[] = [
  { label: "Day Rate", value: "day_rate", description: "Charge per day worked" },
  { label: "Per 1000 Bricks", value: "per_1000_bricks", description: "Charge per 1000 bricks laid" },
  { label: "Per m²", value: "per_m2", description: "Charge per square metre" },
];

export default function EstimatePage() {
  const router = useRouter();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const {
    photoFile,
    photoPreview,
    jobType,
    anchorType,
    anchorValue,
    difficulty,
    hasOpenings,
    isEstimating,
    error,
    pricingMethod,
    dayRate,
    ratePer1000,
    ratePerM2,
    materialMarkup,
    includeVAT,
    setPhotoFile,
    setPhotoPreview,
    setJobType,
    setAnchorType,
    setAnchorValue,
    setDifficulty,
    setHasOpenings,
    setCurrentResult,
    setEstimating,
    setError,
    getInputs,
    setPricingMethod,
    setDayRate,
    setRatePer1000,
    setRatePerM2,
    setMaterialMarkup,
    setIncludeVAT,
  } = useStore();

  const handleFileSelect = (file: File) => {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) handleFileSelect(file);
    },
    [setPhotoFile, setPhotoPreview]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp", ".heic"] },
    maxFiles: 1,
    noClick: true,
  });

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleGallerySelect = () => {
    galleryInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  const handleEstimate = async () => {
    setValidationError(null);
    setError(null);

    if (!photoFile) {
      setValidationError("Please take or upload a photo of the job");
      return;
    }

    const inputs = getInputs();
    if (!inputs) {
      setValidationError("Please enter a valid dimension");
      return;
    }

    setEstimating(true);

    try {
      const imageBase64 = await fileToBase64(photoFile);
      const response = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, imageBase64 }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get estimate");

      setCurrentResult(data.data);
      router.push("/dashboard/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setEstimating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-8">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-brick-600 to-brick-700 text-white px-4 pt-6 pb-12 -mx-4 sm:mx-0 sm:rounded-b-3xl mb-[-2rem]">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">New Estimate</h1>
          <p className="text-brick-100 mt-1 text-sm sm:text-base">Snap a photo and get an instant quote</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-4">
        {/* Photo Section */}
        <div
          {...getRootProps()}
          className={`card-modern overflow-hidden ${isDragActive ? 'ring-2 ring-brick-500 ring-offset-2' : ''}`}
        >
          {photoPreview ? (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Job preview"
                className="w-full h-56 sm:h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <button
                onClick={clearPhoto}
                className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-all tap-highlight"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-3 text-white">
                <p className="text-sm font-medium">Photo ready</p>
                <p className="text-xs text-white/70">Tap × to retake</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <input {...getInputProps()} />
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brick-100 to-brick-200 rounded-2xl flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-brick-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Add Job Photo</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Take a photo of the space or existing wall
                </p>
              </div>

              {/* Camera & Gallery Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCameraCapture}
                  className="flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-br from-brick-500 to-brick-600 text-white rounded-2xl font-semibold shadow-lg shadow-brick-500/25 hover:shadow-brick-500/40 transition-all tap-highlight"
                >
                  <Camera className="w-5 h-5" />
                  <span>Take Photo</span>
                </button>
                <button
                  onClick={handleGallerySelect}
                  className="flex items-center justify-center gap-2 py-4 px-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 transition-all tap-highlight"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span>Gallery</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Job Type */}
        <div className="card-modern p-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Job Type</h3>
          <div className="grid grid-cols-2 gap-2">
            {JOB_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setJobType(type.value)}
                className={`relative py-3.5 px-4 rounded-xl font-medium transition-all tap-highlight ${
                  jobType === type.value
                    ? "bg-gradient-to-br from-brick-500 to-brick-600 text-white shadow-lg shadow-brick-500/25"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="card-modern p-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Difficulty</h3>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`flex-1 py-3.5 px-4 rounded-xl font-medium transition-all tap-highlight ${
                  difficulty === d.value
                    ? `${d.color} text-white shadow-lg`
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Anchor Dimension */}
        <div className="card-modern p-4">
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="w-4 h-4 text-brick-500" />
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Reference Dimension</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Enter one known measurement to calibrate the estimate
          </p>

          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setAnchorType("length")}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all tap-highlight ${
                anchorType === "length"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Width/Length
            </button>
            <button
              onClick={() => setAnchorType("height")}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all tap-highlight ${
                anchorType === "height"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Height
            </button>
          </div>

          <div className="relative">
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 4.5"
              value={anchorValue}
              onChange={(e) => setAnchorValue(e.target.value)}
              className="w-full input-modern py-3.5 px-4 text-lg font-medium"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
              metres
            </span>
          </div>
        </div>

        {/* Has Openings Toggle */}
        <div className="card-modern p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Has Openings?</p>
              <p className="text-sm text-slate-500">Doors, windows, or gaps</p>
            </div>
            <button
              onClick={() => setHasOpenings(!hasOpenings)}
              className={`relative w-14 h-8 rounded-full transition-all ${
                hasOpenings
                  ? "bg-gradient-to-r from-brick-500 to-brick-600"
                  : "bg-slate-200"
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                  hasOpenings ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Your Rates - Collapsible */}
        <div className="card-modern overflow-hidden">
          <button
            onClick={() => setShowPricing(!showPricing)}
            className="w-full p-4 flex items-center justify-between tap-highlight"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800">Your Rates</p>
                <p className="text-sm text-slate-500">
                  {pricingMethod === "day_rate" && `£${dayRate}/day`}
                  {pricingMethod === "per_1000_bricks" && `£${ratePer1000}/1000`}
                  {pricingMethod === "per_m2" && `£${ratePerM2}/m²`}
                  {includeVAT && " +VAT"}
                </p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showPricing ? 'rotate-180' : ''}`} />
          </button>

          {showPricing && (
            <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-4">
              {/* Pricing Method */}
              <div className="space-y-2">
                {PRICING_METHODS.map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPricingMethod(method.value)}
                    className={`w-full text-left p-3 rounded-xl transition-all tap-highlight ${
                      pricingMethod === method.value
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <p className="font-medium">{method.label}</p>
                    <p className={`text-sm ${pricingMethod === method.value ? "text-slate-300" : "text-slate-500"}`}>
                      {method.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Rate Input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">£</span>
                <input
                  type="number"
                  value={
                    pricingMethod === "day_rate" ? dayRate :
                    pricingMethod === "per_1000_bricks" ? ratePer1000 : ratePerM2
                  }
                  onChange={(e) => {
                    if (pricingMethod === "day_rate") setDayRate(e.target.value);
                    else if (pricingMethod === "per_1000_bricks") setRatePer1000(e.target.value);
                    else setRatePerM2(e.target.value);
                  }}
                  className="w-full input-modern py-3.5 pl-8 pr-4 text-lg font-medium"
                />
              </div>

              {/* Materials Markup */}
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Materials Markup</label>
                <div className="relative">
                  <input
                    type="number"
                    value={materialMarkup}
                    onChange={(e) => setMaterialMarkup(e.target.value)}
                    className="w-full input-modern py-3 px-4 font-medium"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                </div>
              </div>

              {/* VAT Toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-slate-700">Add VAT (20%)</p>
                </div>
                <button
                  onClick={() => setIncludeVAT(!includeVAT)}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    includeVAT
                      ? "bg-gradient-to-r from-brick-500 to-brick-600"
                      : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                      includeVAT ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Errors */}
        {(validationError || error) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-600 text-sm font-medium">{validationError || error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleEstimate}
          disabled={isEstimating}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            isEstimating
              ? "bg-slate-200 text-slate-400"
              : "btn-gradient text-white"
          }`}
        >
          {isEstimating ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              Analysing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Get Estimate
            </>
          )}
        </button>

        {/* Bottom padding for mobile */}
        <div className="h-4" />
      </div>
    </div>
  );
}
