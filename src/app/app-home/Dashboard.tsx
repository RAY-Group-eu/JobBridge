"use client";

import { useState } from "react";
import { JobCard } from "@/components/jobs/JobCard";
import { JobDetailModal } from "@/components/jobs/JobDetailModal";
import type { JobsListItem } from "@/lib/types/jobbridge";
import { Briefcase, Clock, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardProps {
    activeJobs: JobsListItem[];
    waitlistedJobs: JobsListItem[];
    appliedJobs: JobsListItem[];
    isDemo: boolean;
    canApply: boolean;
    guardianStatus: string;
}

export function Dashboard({ activeJobs, waitlistedJobs, appliedJobs, isDemo, canApply, guardianStatus }: DashboardProps) {
    const [selectedJob, setSelectedJob] = useState<JobsListItem | null>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'waitlist' | 'applied'>('active');

    // Column Compoenent for Desktop Grid
    const Column = ({ title, icon: Icon, colorClass, jobs, emptyMsg }: { title: string, icon: any, colorClass: string, jobs: JobsListItem[], emptyMsg: string }) => (
        <div className="flex flex-col h-full bg-slate-900/20 rounded-2xl border border-white/5 p-4 min-h-[500px]">
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${colorClass}`}>
                <Icon size={20} /> {title} <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-slate-400 ml-auto">{jobs.length}</span>
            </h2>
            <div className="space-y-4 overflow-y-auto flex-grow pr-1 custom-scrollbar">
                {jobs.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm italic border border-dashed border-white/5 rounded-xl">
                        {emptyMsg}
                    </div>
                ) : (
                    jobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            isDemo={isDemo}
                            isApplied={activeTab === 'applied' || title === 'Bereits Beworben'} // Hacky but effective
                            isLocked={!canApply}
                            hideStatusLabel={activeTab === 'applied' || title === 'Bereits Beworben'}
                            onClick={() => setSelectedJob(job)}
                        />
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pb-20">
            {/* Mobile Tabs */}
            <div className="lg:hidden flex border-b border-white/10 mb-6 sticky top-16 bg-slate-950/80 backdrop-blur-md z-30 -mx-4 px-4 pt-2">
                <button
                    onClick={() => setActiveTab('active')}
                    className={cn(
                        "flex-1 pb-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2",
                        activeTab === 'active' ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500"
                    )}
                >
                    <Briefcase size={16} /> Aktuell
                </button>
                <button
                    onClick={() => setActiveTab('waitlist')}
                    className={cn(
                        "flex-1 pb-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2",
                        activeTab === 'waitlist' ? "border-amber-500 text-amber-400" : "border-transparent text-slate-500"
                    )}
                >
                    <Clock size={16} /> Warteliste
                </button>
                <button
                    onClick={() => setActiveTab('applied')}
                    className={cn(
                        "flex-1 pb-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2",
                        activeTab === 'applied' ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-500"
                    )}
                >
                    <CheckCircle2 size={16} /> Beworben
                </button>
            </div>

            {/* Desktop Grid / Mobile View */}
            <div className="lg:grid lg:grid-cols-3 lg:gap-6 h-full">
                {/* Active Column */}
                <div className={cn("lg:block", activeTab === 'active' ? "block" : "hidden")}>
                    <Column
                        title="Aktuelle Angebote"
                        icon={Briefcase}
                        colorClass="text-indigo-400"
                        jobs={activeJobs}
                        emptyMsg="Keine neuen Jobs verfügbar."
                    />
                </div>

                {/* Waitlist Column */}
                <div className={cn("lg:block", activeTab === 'waitlist' ? "block" : "hidden")}>
                    <Column
                        title="Warteliste"
                        icon={Clock}
                        colorClass="text-amber-400"
                        jobs={waitlistedJobs}
                        emptyMsg="Du bist auf keiner Warteliste."
                    />
                </div>

                {/* Applied Column */}
                <div className={cn("lg:block", activeTab === 'applied' ? "block" : "hidden")}>
                    <Column
                        title="Bereits Beworben"
                        icon={CheckCircle2}
                        colorClass="text-emerald-400"
                        jobs={appliedJobs}
                        emptyMsg="Noch keine Bewerbungen versendet."
                    />
                </div>
            </div>

            <JobDetailModal
                job={selectedJob}
                isOpen={!!selectedJob}
                onClose={() => setSelectedJob(null)}
                canApply={canApply}
                guardianStatus={guardianStatus}
            />
        </div>
    );
}
