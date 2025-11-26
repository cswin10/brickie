"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Camera,
  X,
  ChevronDown,
  Sparkles,
  Ruler,
  Settings2,
  ImagePlus,
  Zap,
  AlertCircle
} from "lucide-react";
import { useStore } from "@/lib/store";
import { fileToBase64, type JobType, type Difficulty, type PricingMethod } from "@brickie/lib";

const JOB_TYPES: { label: string; value: JobType; icon: string }[] = [
  { label: "Brickwork", value: "Brickwork", icon: "🧱" },
  { label: "Blockwork", value: "Blockwork", icon: "⬜" },
  { label: "Repointing", value: "Repointing", icon: "🔧" },
  { label: "Demo+Rebuild", value: "Demo+Rebuild", icon: "🔨" },
];

const DIFFICULTIES: { label: string; value: Difficulty; desc: string }[] = [
  { label: "Easy", value: "Easy", desc: "Straight runs" },
  { label: "Standard", value: "Standard", desc: "Some detail" },
  { label: "Tricky", value: "Tricky", desc: "Complex work" },
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
    <div className="min-h-screen bg-mesh bg-grid pb-8">
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
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brick-600/20 via-transparent to-purple-900/10" />
        <div className="relative px-4 pt-8 pb-16 sm:pt-12">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brick-500 to-brick-600 flex items-center justify-center shadow-lg glow-brick-sm animate-pulse-glow">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                New <span className="text-gradient">Estimate</span>
              </h1>
            </div>
            <p className="text-slate-400 text-sm sm:text-base ml-13">
              Snap a photo, get an instant AI-powered quote
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8 space-y-4">
        {/* Photo Section */}
        <div
          {...getRootProps()}
          className={`glass-card rounded-2xl overflow-hidden transition-all animate-scale-in ${
            isDragActive ? 'ring-2 ring-brick-500 ring-offset-2 ring-offset-slate-900' : ''
          }`}
        >
          {photoPreview ? (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Job preview"
                className="w-full h-56 sm:h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <button
                onClick={clearPhoto}
                className="absolute top-3 right-3 p-2.5 glass rounded-xl text-white hover:bg-white/20 transition-all tap-highlight group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              </button>
              <div className="absolute bottom-3 left-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-sm font-semibold text-white">Photo ready</p>
                </div>
                <p className="text-xs text-white/60">Tap × to retake</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <input {...getInputProps()} />
              <div className="text-center mb-6">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brick-500 to-brick-600 opacity-20 blur-xl animate-pulse" />
                  <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-brick-500/20 to-brick-600/20 border border-brick-500/30 flex items-center justify-center">
                    <Camera className="w-9 h-9 text-brick-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Add Job Photo</h3>
                <p className="text-sm text-slate-400">
                  Take a photo of the space or existing wall
                </p>
              </div>

              {/* Camera & Gallery Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCameraCapture}
                  className="relative flex items-center justify-center gap-2 py-4 px-4 btn-gradient text-white rounded-2xl font-bold tap-highlight overflow-hidden group"
                >
                  <Camera className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Take Photo</span>
                </button>
                <button
                  onClick={handleGallerySelect}
                  className="flex items-center justify-center gap-2 py-4 px-4 btn-glass text-white rounded-2xl font-semibold tap-highlight"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span>Gallery</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Job Type */}
        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Job Type</h3>
          <div className="grid grid-cols-2 gap-2">
            {JOB_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setJobType(type.value)}
                className={`relative py-3.5 px-4 rounded-xl font-semibold transition-all tap-highlight border-glow ${
                  jobType === type.value
                    ? "bg-gradient-to-br from-brick-500 to-brick-600 text-white shadow-lg glow-brick-sm"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                <span className="mr-2 text-lg">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Difficulty Level</h3>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`py-3 px-3 rounded-xl font-semibold transition-all tap-highlight text-center ${
                  difficulty === d.value
                    ? d.value === "Easy"
                      ? "bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/30"
                      : d.value === "Standard"
                      ? "bg-amber-500/90 text-white shadow-lg shadow-amber-500/30"
                      : "bg-red-500/90 text-white shadow-lg shadow-red-500/30"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                <div className="text-sm font-bold">{d.label}</div>
                <div className={`text-xs mt-0.5 ${difficulty === d.value ? "text-white/80" : "text-slate-500"}`}>
                  {d.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Anchor Dimension */}
        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brick-500/20 flex items-center justify-center">
              <Ruler className="w-4 h-4 text-brick-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Reference Dimension</h3>
              <p className="text-xs text-slate-500">Enter one known measurement</p>
            </div>
          </div>

          <div className="flex gap-2 mb-3 mt-4">
            <button
              onClick={() => setAnchorType("length")}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all tap-highlight ${
                anchorType === "length"
                  ? "bg-white text-slate-900"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
              }`}
            >
              Width/Length
            </button>
            <button
              onClick={() => setAnchorType("height")}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all tap-highlight ${
                anchorType === "height"
                  ? "bg-white text-slate-900"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
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
              className="w-full input-modern py-3.5 px-4 text-lg font-semibold rounded-xl"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
              metres
            </span>
          </div>
        </div>

        {/* Has Openings Toggle */}
        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Has Openings?</p>
              <p className="text-sm text-slate-500">Doors, windows, or gaps</p>
            </div>
            <button
              onClick={() => setHasOpenings(!hasOpenings)}
              className={`relative w-14 h-8 rounded-full transition-all ${
                hasOpenings
                  ? "bg-gradient-to-r from-brick-500 to-brick-600 shadow-lg glow-brick-sm"
                  : "bg-white/10"
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${
                  hasOpenings ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Your Rates - Collapsible */}
        <div className="glass-card rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <button
            onClick={() => setShowPricing(!showPricing)}
            className="w-full p-4 flex items-center justify-between tap-highlight"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white">Your Rates</p>
                <p className="text-sm text-slate-500">
                  {pricingMethod === "day_rate" && `£${dayRate}/day`}
                  {pricingMethod === "per_1000_bricks" && `£${ratePer1000}/1000`}
                  {pricingMethod === "per_m2" && `£${ratePerM2}/m²`}
                  {includeVAT && " +VAT"}
                </p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${showPricing ? 'rotate-180' : ''}`} />
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${showPricing ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
              {/* Pricing Method */}
              <div className="space-y-2">
                {PRICING_METHODS.map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPricingMethod(method.value)}
                    className={`w-full text-left p-3 rounded-xl transition-all tap-highlight ${
                      pricingMethod === method.value
                        ? "bg-white text-slate-900"
                        : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    <p className="font-semibold">{method.label}</p>
                    <p className={`text-sm ${pricingMethod === method.value ? "text-slate-500" : "text-slate-500"}`}>
                      {method.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Rate Input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">£</span>
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
                  className="w-full input-modern py-3.5 pl-8 pr-4 text-lg font-bold rounded-xl"
                />
              </div>

              {/* Materials Markup */}
              <div>
                <label className="text-sm font-semibold text-slate-400 mb-2 block">Materials Markup</label>
                <div className="relative">
                  <input
                    type="number"
                    value={materialMarkup}
                    onChange={(e) => setMaterialMarkup(e.target.value)}
                    className="w-full input-modern py-3 px-4 font-semibold rounded-xl"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                </div>
              </div>

              {/* VAT Toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-semibold text-white">Add VAT (20%)</p>
                </div>
                <button
                  onClick={() => setIncludeVAT(!includeVAT)}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    includeVAT
                      ? "bg-gradient-to-r from-brick-500 to-brick-600 glow-brick-sm"
                      : "bg-white/10"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${
                      includeVAT ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Errors */}
        {(validationError || error) && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-scale-in">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm font-medium">{validationError || error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleEstimate}
          disabled={isEstimating}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all animate-slide-up ${
            isEstimating
              ? "bg-white/10 text-slate-500"
              : "btn-gradient text-white"
          }`}
          style={{ animationDelay: '0.3s' }}
        >
          {isEstimating ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
              <span>Analysing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Get Estimate</span>
            </>
          )}
        </button>

        {/* Bottom padding for mobile */}
        <div className="h-4" />
      </div>
    </div>
  );
}
