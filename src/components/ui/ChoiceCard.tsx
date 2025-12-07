"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import clsx from "clsx";

type ChoiceCardProps = {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  disabled?: boolean;
};

export function ChoiceCard({
  children,
  onClick,
  selected = false,
  className,
  disabled = false,
}: ChoiceCardProps) {
  return (
    <motion.div
      onClick={disabled ? undefined : onClick}
      whileHover={!disabled && onClick ? { scale: 1.01 } : undefined}
      whileTap={!disabled && onClick ? { scale: 0.99 } : undefined}
      className={clsx(
        "cursor-pointer bg-white/5 backdrop-blur-xl rounded-2xl border p-6 transition-all duration-200",
        selected
          ? "border-blue-500 bg-white/10 ring-2 ring-blue-500 shadow-lg shadow-blue-500/20"
          : "border-white/10 hover:border-white/20 hover:bg-white/8",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="relative">
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center"
          >
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        )}
        {children}
      </div>
    </motion.div>
  );
}

