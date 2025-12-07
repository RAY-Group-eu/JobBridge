"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import clsx from "clsx";

type CardProps = {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  disabled?: boolean;
};

export function Card({
  children,
  onClick,
  selected = false,
  className,
  disabled = false,
}: CardProps) {
  return (
    <motion.div
      onClick={disabled ? undefined : onClick}
      whileHover={!disabled && onClick ? { scale: 1.01 } : undefined}
      whileTap={!disabled && onClick ? { scale: 0.99 } : undefined}
      className={clsx(
        "glass-card rounded-3xl border-2 p-8 transition-all duration-200",
        selected
          ? "border-blue-500 bg-blue-500/10 shadow-[0_0_24px_rgba(37,99,235,0.3)] ring-2 ring-blue-500/40 ring-offset-2 ring-offset-transparent"
          : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/8",
        disabled && "opacity-50 cursor-not-allowed",
        onClick && !disabled && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

