"use client";

import { motion } from "framer-motion";
import { LogoBadge } from "@/components/ui/LogoBadge";
import { BRAND_NAME } from "@/lib/constants";

type StepWelcomeProps = {
  onStart: () => void;
};

export function StepWelcome({ onStart }: StepWelcomeProps) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-6 text-center md:gap-8">
      <motion.div 
        className="flex items-center gap-4 mb-2"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <LogoBadge size="md" />
        <div>
          <h1 className="text-glow text-2xl font-semibold leading-tight md:text-3xl">
            {BRAND_NAME}
          </h1>
        </div>
      </motion.div>
      <div className="space-y-3 md:space-y-4">
        <motion.h2
          className="text-xl font-semibold leading-tight md:text-2xl text-slate-200"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        >
          Willkommen
        </motion.h2>
        <p className="max-w-2xl text-base text-slate-200/85 md:text-lg">
          Plattform für sichere Taschengeldjobs und Alltagshilfe – Schritt für
          Schritt verständlich für Jung und Alt.
        </p>
      </div>
      <motion.button
        type="button"
        onClick={onStart}
        className="soft-gradient shadow-lg shadow-cyan-400/25 inline-flex items-center gap-3 rounded-full px-8 py-4 text-lg font-semibold text-slate-950 transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 md:px-10 md:py-5 md:text-xl mt-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.99 }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
      >
        Los geht&apos;s
      </motion.button>
      <p className="text-sm text-slate-300/70 md:text-base mt-2">
        Keine Hektik – wir führen Sie in wenigen Schritten durch die wichtigsten
        Angaben.
      </p>
    </div>
  );
}
