"use client";

import { ReactNode } from "react";
import clsx from "clsx";

type ButtonSecondaryProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  loading?: boolean;
};

export function ButtonSecondary({
  children,
  onClick,
  disabled = false,
  type = "button",
  className,
  loading = false,
}: ButtonSecondaryProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        "border border-white/30 text-white rounded-full px-6 py-3",
        "font-semibold transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent",
        !disabled && !loading && "hover:bg-white/10 hover:border-white/40 hover:scale-[1.02] active:scale-[0.98]",
        (disabled || loading) && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {loading ? "Bitte kurz warten..." : children}
    </button>
  );
}
