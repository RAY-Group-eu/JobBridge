"use client";

import { LogoBadge } from "./LogoBadge";

type CardHeaderProps = {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  spacing?: "default" | "compact" | "tight";
};

export function CardHeader({
  title,
  subtitle,
  showLogo = true,
  spacing = "default",
}: CardHeaderProps) {
  const marginBottom =
    spacing === "tight" ? "mb-4" : spacing === "compact" ? "mb-6" : "mb-8";

  return (
    <div className={`flex items-center gap-4 ${marginBottom}`}>
      {showLogo && <LogoBadge size="md" className="flex-shrink-0" />}
      
      {/* Title + Subtitle */}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-base text-slate-300 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
