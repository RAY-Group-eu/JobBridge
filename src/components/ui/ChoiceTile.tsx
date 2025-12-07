"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import clsx from "clsx";

type ChoiceTileProps = {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  disabled?: boolean;
};

export function ChoiceTile({
  children,
  onClick,
  selected = false,
  className,
  disabled = false,
}: ChoiceTileProps) {
  return (
    <motion.div
      onClick={disabled ? undefined : onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: selected ? 1.05 : 1.0,
      }}
      whileHover={!disabled && onClick ? { scale: 1.03, rotateY: 1 } : undefined}
      whileTap={!disabled && onClick ? { scale: 0.98 } : undefined}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      className={clsx(
        "relative cursor-pointer backdrop-blur-xl border rounded-3xl overflow-hidden transition-all duration-300",
        selected
          ? "bg-white/8 border-cyan-400 ring-2 ring-cyan-400/70 shadow-[0_0_40px_rgba(34,211,238,0.55)]"
          : "bg-white/6 border-white/10 hover:bg-white/8 hover:scale-105 hover:shadow-lg",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Content */}
      <div className="relative z-10 p-6">{children}</div>
      
      {/* Selected state - Checkmark */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 h-6 w-6 rounded-full bg-cyan-400 flex items-center justify-center"
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
    </motion.div>
  );
}

