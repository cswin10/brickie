"use client";

import React from "react";
import { clsx } from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: string;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  suffix,
  containerClassName,
  className,
  ...props
}: InputProps) {
  return (
    <div className={clsx("mb-4", containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-warm-800 mb-2">
          {label}
        </label>
      )}
      <div
        className={clsx(
          "flex items-center bg-warm-100 rounded-xl border-2 transition-colors",
          error ? "border-red-500" : "border-warm-300 focus-within:border-brick-500"
        )}
      >
        <input
          className={clsx(
            "flex-1 bg-transparent px-4 py-3 text-warm-900 placeholder-warm-500 outline-none",
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="pr-4 text-sm text-warm-600">{suffix}</span>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Textarea({
  label,
  error,
  containerClassName,
  className,
  ...props
}: TextareaProps) {
  return (
    <div className={clsx("mb-4", containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-warm-800 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={clsx(
          "w-full bg-warm-100 rounded-xl border-2 px-4 py-3 text-warm-900 placeholder-warm-500 outline-none transition-colors resize-none",
          error
            ? "border-red-500"
            : "border-warm-300 focus:border-brick-500",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
