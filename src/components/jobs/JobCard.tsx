"use client";

import { memo } from "react";
import { Building2, MapPin, Euro, Clock } from "lucide-react";
import type { Database } from "@/lib/types/supabase";
import { timeAgo } from "@/lib/utils";
import type { JobsListItem } from "@/lib/types/jobbridge";

interface JobCardProps {
    job: JobsListItem;
    isDemo?: boolean;
    isApplied?: boolean;
    onClick: () => void;
}

export const JobCard = memo(function JobCard({ job, isDemo, isApplied, onClick }: JobCardProps) {
    return (
        <div
            onClick={onClick}
            className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer
                ${isApplied
                    ? "bg-slate-900/50 grayscale-[0.5] hover:grayscale-0 hover:bg-slate-900/80 border-white/5"
                    : "bg-gradient-to-br from-slate-900/90 via-slate-800/70 to-slate-900/90 hover:border-indigo-500/40 hover:shadow-[0_8px_40px_-12px_rgba(99,102,241,0.25)]"
                }
            `}
        >
            {/* Premium Gradient Accent Line */}
            {!isApplied && (
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}

            {/* Subtle Glow at bottom */}
            {!isApplied && (
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-indigo-900/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-5">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10 text-indigo-400 border border-indigo-500/10 group-hover:from-indigo-500/25 group-hover:to-violet-500/15 group-hover:border-indigo-500/25 group-hover:text-indigo-300 transition-all duration-300">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white leading-tight mb-1 group-hover:text-indigo-100 transition-colors">
                                {job.title}
                            </h3>
                            <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
                                {job.creator?.company_name || "Privater Auftraggeber"}
                                {isDemo && (
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-400 border border-cyan-400/30 px-1.5 py-0.5 rounded bg-cyan-400/10 ml-2">
                                        Demo
                                    </span>
                                )}
                                {isApplied && (
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 border border-emerald-400/30 px-1.5 py-0.5 rounded bg-emerald-400/10 ml-2 flex items-center gap-1">
                                        Bereits beworben
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-slate-300 text-base line-clamp-2 mb-6 leading-relaxed flex-grow font-light">
                    {job.description}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-auto pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2">
                        <Euro size={16} className="text-emerald-400" />
                        <span className="font-semibold text-white">{job.wage_hourly} € / Std.</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-indigo-400" />
                        <span className="truncate max-w-[150px]">{job.public_location_label || job.market_name || "Standort unbekannt"}</span>
                    </div>
                    {job.distance_km != null && (
                        <div className="flex items-center gap-2 ml-auto text-xs text-slate-500 font-medium">
                            <Clock size={14} className="text-slate-600" />
                            <span>{timeAgo(job.created_at)}</span>
                            {job.creator && (
                                <>
                                    <span className="text-slate-700">•</span>
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center text-[9px] font-bold text-indigo-400">
                                            {(job.creator.company_name || job.creator.full_name || "?")[0].toUpperCase()}
                                        </div>
                                        <span className="truncate max-w-[100px]">
                                            {job.creator.company_name || job.creator.full_name || "Unbekannt"}
                                        </span>
                                    </div>
                                </>
                            )}
                            {/* Original distance_km display, integrated if still desired */}
                            {job.distance_km != null && (
                                <>
                                    <span className="text-slate-700">•</span>
                                    <span className="text-slate-500">{Math.round(job.distance_km * 10) / 10} km</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
