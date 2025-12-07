"use client";

import { useEffect } from "react";
import clsx from "clsx";

type ToastProps = {
  open: boolean;
  message: string | null;
  type?: "success" | "error" | "info";
  onClose?: () => void;
  duration?: number;
};

export function Toast({ open, message, type = "info", onClose, duration = 2500 }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(id);
  }, [open, onClose, duration]);

  return (
    <div
      className={clsx(
        "pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4",
        open ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={clsx(
          "pointer-events-auto rounded-2xl backdrop-blur-xl border px-4 py-3 text-sm shadow-[0_10px_40px_rgba(0,0,0,0.45)]",
          type === "success" && "border-emerald-400/40 bg-emerald-500/20 text-emerald-100",
          type === "error" && "border-rose-400/40 bg-rose-500/20 text-rose-100",
          type === "info" && "border-slate-300/30 bg-white/10 text-slate-200"
        )}
      >
        {message}
      </div>
    </div>
  );
}
