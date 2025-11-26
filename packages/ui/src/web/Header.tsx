"use client";

import React from "react";
import { clsx } from "clsx";

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
}

export function Header({
  title,
  subtitle,
  leftContent,
  rightContent,
  className,
}: HeaderProps) {
  return (
    <header
      className={clsx(
        "bg-warm-200 border-b border-warm-300 px-4 py-3",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {leftContent}
          {title && (
            <div>
              <h1 className="text-lg font-semibold text-warm-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-warm-600">{subtitle}</p>
              )}
            </div>
          )}
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </header>
  );
}

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8 text-lg",
    md: "w-10 h-10 text-xl",
    lg: "w-14 h-14 text-2xl",
  };

  return (
    <div
      className={clsx(
        "bg-brick-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg",
        sizeClasses[size]
      )}
    >
      B
    </div>
  );
}
