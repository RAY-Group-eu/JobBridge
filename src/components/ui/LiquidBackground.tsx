"use client";

import { motion } from "framer-motion";

export function LiquidBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Globales Radial-Gradient im Hintergrund - sehr subtil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.06),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(15,118,110,0.04),transparent_70%)]" />
      
      {/* Sanfte, globale Bewegungen - sehr niedrige Opacity */}
      <motion.div
        className="absolute left-[10%] top-[20%] h-[800px] w-[800px] rounded-full bg-gradient-radial from-blue-500/2 via-blue-500/1 to-transparent blur-[120px]"
        animate={{
          x: [0, 40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute right-[10%] bottom-[20%] h-[700px] w-[700px] rounded-full bg-gradient-radial from-teal-500/2 via-teal-500/1 to-transparent blur-[120px]"
        animate={{
          x: [0, -35, 0],
          y: [0, -25, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
    </div>
  );
}

