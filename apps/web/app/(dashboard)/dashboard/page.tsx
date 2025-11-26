"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Camera, Upload, X } from "lucide-react";
import { Button, Card, Input } from "@brickie/ui";
import { useStore } from "@/lib/store";
import { fileToBase64, type JobType, type Difficulty, type AnchorType } from "@brickie/lib";

const JOB_TYPES: JobType[] = ["Brickwork", "Blockwork", "Repointing", "Demo+Rebuild"];
const DIFFICULTIES: Difficulty[] = ["Easy", "Standard", "Tricky"];
const ANCHOR_TYPES: { label: string; value: AnchorType }[] = [
  { label: "Length", value: "length" },
  { label: "Height", value: "height" },
];

export default function EstimatePage() {
  const router = useRouter();
  const [validationError, setValidationError] = useState<string | null>(null);

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
  } = useStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
      }
    },
    [setPhotoFile, setPhotoPreview]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
  });

  const clearPhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
  };

  const handleEstimate = async () => {
    setValidationError(null);
    setError(null);

    if (!photoFile) {
      setValidationError("Please upload a photo of the job");
      return;
    }

    const inputs = getInputs();
    if (!inputs) {
      setValidationError("Please enter a valid anchor dimension");
      return;
    }

    setEstimating(true);

    try {
      const imageBase64 = await fileToBase64(photoFile);

      const response = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs,
          imageBase64,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get estimate");
      }

      setCurrentResult(data.data);
      router.push("/dashboard/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setEstimating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-warm-900 mb-6">New Estimate</h1>

      <div className="space-y-6">
        {/* Photo Upload */}
        <Card title="Job Photo">
          {photoPreview ? (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Job preview"
                className="w-full h-64 object-cover rounded-xl"
              />
              <button
                onClick={clearPhoto}
                className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-brick-500 bg-brick-50"
                  : "border-warm-300 hover:border-brick-400"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-warm-100 rounded-full flex items-center justify-center mb-4">
                  {isDragActive ? (
                    <Upload className="w-8 h-8 text-brick-500" />
                  ) : (
                    <Camera className="w-8 h-8 text-warm-500" />
                  )}
                </div>
                <p className="text-warm-700 font-medium mb-1">
                  {isDragActive ? "Drop the photo here" : "Upload a photo"}
                </p>
                <p className="text-sm text-warm-500">
                  Drag & drop or click to select
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Job Type */}
        <Card title="Job Type">
          <div className="grid grid-cols-2 gap-2">
            {JOB_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setJobType(type)}
                className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                  jobType === type
                    ? "bg-brick-500 text-white"
                    : "bg-warm-100 text-warm-700 hover:bg-warm-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </Card>

        {/* Difficulty */}
        <Card title="Difficulty">
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                  difficulty === d
                    ? "bg-brick-500 text-white"
                    : "bg-warm-100 text-warm-700 hover:bg-warm-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </Card>

        {/* Anchor Dimension */}
        <Card title="Anchor Dimension">
          <p className="text-sm text-warm-600 mb-4">
            Enter one known dimension to help calibrate the estimate
          </p>
          <div className="flex gap-2 mb-4">
            {ANCHOR_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setAnchorType(type.value)}
                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-colors ${
                  anchorType === type.value
                    ? "bg-brick-500 text-white"
                    : "bg-warm-100 text-warm-700 hover:bg-warm-200"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          <Input
            label={anchorType === "length" ? "Length" : "Height"}
            type="number"
            step="0.1"
            placeholder="e.g., 4.5"
            value={anchorValue}
            onChange={(e) => setAnchorValue(e.target.value)}
            suffix="meters"
          />
        </Card>

        {/* Has Openings */}
        <Card>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-warm-900">Has Openings</p>
              <p className="text-sm text-warm-600">
                Doors, windows, or other openings
              </p>
            </div>
            <button
              onClick={() => setHasOpenings(!hasOpenings)}
              className={`w-12 h-7 rounded-full transition-colors ${
                hasOpenings ? "bg-brick-500" : "bg-warm-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mx-1 ${
                  hasOpenings ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>
        </Card>

        {/* Errors */}
        {(validationError || error) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600">{validationError || error}</p>
          </div>
        )}

        {/* Submit */}
        <Button
          onClick={handleEstimate}
          loading={isEstimating}
          fullWidth
          size="lg"
        >
          {isEstimating ? "Analysing Job..." : "Get Estimate"}
        </Button>
      </div>
    </div>
  );
}
