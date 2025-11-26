"use client";

import React from "react";
import { clsx } from "clsx";

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  title,
  className,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={clsx(
        "bg-white rounded-2xl shadow-sm",
        {
          "p-0": padding === "none",
          "p-3": padding === "sm",
          "p-4": padding === "md",
          "p-6": padding === "lg",
        },
        className
      )}
    >
      {title && (
        <h3 className="text-base font-semibold text-warm-800 mb-3">{title}</h3>
      )}
      {children}
    </div>
  );
}
