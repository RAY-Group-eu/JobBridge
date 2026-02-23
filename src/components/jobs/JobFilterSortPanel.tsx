"use client";

import { useCallback, useEffect, useRef } from "react";
import type React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, SlidersHorizontal, ArrowUpDown, Tag, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { JOB_CATEGORIES } from "@/lib/constants/jobCategories";

export type SortOption = "distance" | "newest" | "wage_desc";

export const DEFAULT_SORT_OPTION: SortOption = "distance";

export interface FilterState {
    categories: string[];
    maxDistanceKm: number | null;
}

export const DEFAULT_FILTER_STATE: FilterState = {
    categories: [],
    maxDistanceKm: null,
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "distance", label: "Entfernung (nächste zuerst)" },
    { value: "newest", label: "Neueste Jobs zuerst" },
    { value: "wage_desc", label: "Vergütung (höchste zuerst)" },
];

const DISTANCE_OPTIONS = [5, 10, 20, 50];

interface JobFilterSortPanelProps {
    isOpen: boolean;
    sortOption: SortOption;
    filterState: FilterState;
    onSortChange: (sort: SortOption) => void;
    onFilterChange: React.Dispatch<React.SetStateAction<FilterState>>;
    onClose: () => void;
    onReset: () => void;
    hasChanges: boolean;
}

export function JobFilterSortPanel({
    isOpen,
    sortOption,
    filterState,
    onSortChange,
    onFilterChange,
    onClose,
    onReset,
    hasChanges,
}: JobFilterSortPanelProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    // Lock body scroll and handle Escape key
    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = prev;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    const toggleCategory = useCallback((id: string) => {
        onFilterChange((prev) => ({
            ...prev,
            categories: prev.categories.includes(id)
                ? prev.categories.filter((c) => c !== id)
                : [...prev.categories, id],
        }));
    }, [onFilterChange]);

    const setMaxDistance = useCallback((km: number | null) => {
        onFilterChange((prev) => ({ ...prev, maxDistanceKm: km }));
    }, [onFilterChange]);

    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label="Filter & Sortierung">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Panel */}
                    <motion.div
                        ref={panelRef}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        className="relative w-full max-w-sm bg-[#18181b] border-t sm:border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
                    >
                        {/* Drag handle (mobile) */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full sm:hidden" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.06] shrink-0">
                            <div className="flex items-center gap-2 text-white font-bold text-base">
                                <SlidersHorizontal size={18} className="text-indigo-400" />
                                Filter &amp; Sortierung
                            </div>
                            <div className="flex items-center gap-3">
                                {hasChanges && (
                                    <button
                                        onClick={onReset}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
                                    >
                                        Zurücksetzen
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    aria-label="Schließen"
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable body */}
                        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-7">
                            {/* Sort */}
                            <section>
                                <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                                    <ArrowUpDown size={12} />
                                    Sortierung
                                </h4>
                                <div className="space-y-1.5">
                                    {SORT_OPTIONS.map((opt) => {
                                        const isSelected = sortOption === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => onSortChange(opt.value)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left",
                                                    isSelected
                                                        ? "bg-indigo-500/15 text-indigo-200 border border-indigo-500/30"
                                                        : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 border border-transparent"
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                                                        isSelected
                                                            ? "border-indigo-400 bg-indigo-400"
                                                            : "border-slate-600"
                                                    )}
                                                >
                                                    {isSelected && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#18181b]" />
                                                    )}
                                                </span>
                                                <span className={cn("font-medium", isSelected ? "text-indigo-200" : "text-slate-300")}>{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Category filter */}
                            <section>
                                <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                                    <Tag size={12} />
                                    Kategorie
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {JOB_CATEGORIES.map((cat) => {
                                        const isActive = filterState.categories.includes(cat.id);
                                        const CatIcon = cat.icon;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => toggleCategory(cat.id)}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                                                    isActive
                                                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_10px_-2px_rgba(99,102,241,0.3)]"
                                                        : "bg-white/[0.04] text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200"
                                                )}
                                            >
                                                <CatIcon size={12} className={isActive ? "text-indigo-400" : "text-slate-500"} />
                                                {cat.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Max distance */}
                            <section>
                                <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                                    <MapPin size={12} />
                                    Maximale Entfernung
                                </h4>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={() => setMaxDistance(null)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                                            filterState.maxDistanceKm === null
                                                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_10px_-2px_rgba(99,102,241,0.3)]"
                                                : "bg-white/[0.04] text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200"
                                        )}
                                    >
                                        Alle
                                    </button>
                                    {DISTANCE_OPTIONS.map((km) => (
                                        <button
                                            key={km}
                                            onClick={() => setMaxDistance(km)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                                                filterState.maxDistanceKm === km
                                                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_10px_-2px_rgba(99,102,241,0.3)]"
                                                    : "bg-white/[0.04] text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200"
                                            )}
                                        >
                                            {km} km
                                        </button>
                                    ))}
                                </div>
                                {filterState.maxDistanceKm !== null && (
                                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                        Nur Jobs bis {filterState.maxDistanceKm} km werden angezeigt. Jobs ohne Entfernungsangabe werden ausgeblendet.
                                    </p>
                                )}
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-white/[0.06] shrink-0">
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                            >
                                Ergebnisse anzeigen
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

