"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import clsx from "clsx";

type GlassTileProps = {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  disabled?: boolean;
};

export function GlassTile({
  children,
  onClick,
  selected = false,
  className,
  disabled = false,
}: GlassTileProps) {
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
        "relative cursor-pointer bg-white/5 backdrop-blur-xl border rounded-3xl shadow-xl shadow-black/40 overflow-hidden",
        selected
          ? "border-cyan-400/50 ring-4 ring-cyan-400/30"
          : "border-white/10 hover:border-white/20",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Subtle gradient sheen layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 p-6">{children}</div>
      
      {/* Selected ripple effect */}
      {selected && (
        <motion.div
          className="absolute inset-0 border-2 border-cyan-400 rounded-3xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}
    </motion.div>
  );
}

