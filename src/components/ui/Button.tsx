"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import clsx from "clsx";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
  className?: string;
  loading?: boolean;
};

export function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  type = "button",
  className,
  loading = false,
}: ButtonProps) {
  const baseClasses = "rounded-full px-8 py-4 text-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent";
  
  const variantClasses = {
    primary: clsx(
      "bg-blue-600 text-white shadow-lg shadow-black/20",
      !disabled && !loading && "hover:bg-blue-700 hover:shadow-xl hover:shadow-black/30",
      disabled && "opacity-50 cursor-not-allowed shadow-none"
    ),
    secondary: clsx(
      "border border-white/30 text-white",
      !disabled && !loading && "hover:bg-white/10 hover:border-white/40",
      disabled && "opacity-40 cursor-not-allowed"
    ),
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      className={clsx(baseClasses, variantClasses[variant], className)}
    >
      {loading ? "Wird geladen..." : children}
    </motion.button>
  );
}

