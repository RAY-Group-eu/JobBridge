"use client";

import { motion } from "framer-motion";

type LoaderProps = {
  size?: "sm" | "md" | "lg";
  text?: string;
};

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function Loader({ size = "md", text = "Bitte kurz warten..." }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <motion.div
        className={`border-2 border-blue-500/30 border-t-blue-500 rounded-full ${sizeClasses[size]}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {text && <p className="text-sm text-slate-400">{text}</p>}
    </div>
  );
}

