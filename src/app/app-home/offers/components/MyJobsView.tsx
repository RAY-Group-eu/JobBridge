"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";
import type { JobsListItem } from "@/lib/types/jobbridge";
import { JobCard } from "@/components/jobs/JobCard";
import { useRouter } from "next/navigation";

export function MyJobsView({ jobs }: { jobs: JobsListItem[] }) {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');

    const activeJobs = jobs.filter(j => j.status !== 'closed');
    const closedJobs = jobs.filter(j => j.status === 'closed');

    const displayedJobs = activeTab === 'active' ? activeJobs : closedJobs;

    if (jobs.length === 0) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-16 text-center backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-white/10">
                        <Briefcase size={40} className="text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Noch keine Jobs</h3>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">Erstelle jetzt dein erstes Jobangebot, um Unterstützung aus deiner Nachbarschaft zu erhalten.</p>
                    <Link href="/app-home/offers/new" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl transition-all font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5">
                        <Plus size={20} />
                        <span>Jetzt Job erstellen</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white mb-1">Meine Inserate</h2>
                    <p className="text-slate-400 text-sm">Verwalte deine offenen Stellen und vergangene Aufträge.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/app-home/offers/new" className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-5 py-2.5 rounded-xl transition-colors font-bold text-sm shadow-lg shadow-white/5">
                        <Plus size={18} />
                        <span>Neuer Job</span>
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-white/5">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'active'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Aktuell ({activeJobs.length})
                </button>
                <button
                    onClick={() => setActiveTab('closed')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'closed'
                        ? 'bg-slate-700 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Abgeschlossen ({closedJobs.length})
                </button>
            </div>

            {displayedJobs.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                    <p className="text-slate-500">Keine {activeTab === 'active' ? 'aktiven' : 'abgeschlossenen'} Jobs gefunden.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedJobs.map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            isDemo={false}
                            isApplied={false}
                            providerStatus={job.status}
                            onSelect={(j) => router.push(`/app-home/offers/${j.id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
