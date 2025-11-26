"use client";

import React from "react";
import { clsx } from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  icon,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2",
        // Variants
        {
          "bg-brick-500 text-white hover:bg-brick-600 focus:ring-brick-500":
            variant === "primary",
          "bg-warm-200 text-warm-800 hover:bg-warm-300 focus:ring-warm-400":
            variant === "secondary",
          "border-2 border-brick-500 text-brick-500 hover:bg-brick-50 focus:ring-brick-500":
            variant === "outline",
          "text-brick-500 hover:bg-brick-50 focus:ring-brick-500":
            variant === "ghost",
        },
        // Sizes
        {
          "px-3 py-1.5 text-sm min-h-[32px]": size === "sm",
          "px-5 py-2.5 text-base min-h-[44px]": size === "md",
          "px-6 py-3.5 text-lg min-h-[52px]": size === "lg",
        },
        // States
        {
          "w-full": fullWidth,
          "opacity-50 cursor-not-allowed": isDisabled,
        },
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <LoadingSpinner className={variant === "primary" ? "text-white" : "text-brick-500"} />
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={clsx("animate-spin h-5 w-5", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
