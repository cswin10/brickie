"use client";

import React from "react";
import { clsx } from "clsx";

export interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function Loader({ size = "md", text, className }: LoaderProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={clsx("flex flex-col items-center justify-center", className)}>
      <div
        className={clsx(
          "animate-spin rounded-full border-4 border-warm-300 border-t-brick-500",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="mt-3 text-sm text-warm-600 animate-pulse">{text}</p>
      )}
    </div>
  );
}

export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader size="lg" text={text} />
    </div>
  );
}

export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "animate-pulse bg-warm-200 rounded-lg",
        className
      )}
    />
  );
}

export function EstimateLoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <SkeletonLoader className="h-6 w-32" />
      <SkeletonLoader className="h-12 w-full" />

      <div className="space-y-2">
        <SkeletonLoader className="h-4 w-20" />
        <SkeletonLoader className="h-10 w-full" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <SkeletonLoader className="h-4 w-16" />
          <SkeletonLoader className="h-8 w-full" />
        </div>
        <div className="space-y-2">
          <SkeletonLoader className="h-4 w-16" />
          <SkeletonLoader className="h-8 w-full" />
        </div>
      </div>

      <div className="space-y-2">
        <SkeletonLoader className="h-4 w-24" />
        <SkeletonLoader className="h-20 w-full" />
      </div>
    </div>
  );
}
