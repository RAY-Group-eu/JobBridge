"use client";

import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
    Briefcase,
    MessageSquare,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    ArrowRight,
    MoreHorizontal,
    MapPin,
    Euro
} from "lucide-react";
import type { Database } from "@/lib/types/supabase";
import { JobDetailModal } from "@/components/jobs/JobDetailModal";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { cn } from "@/lib/utils";

type JobRow = Database['public']['Tables']['jobs']['Row'] & {
    market_name?: string | null;
    public_location_label?: string | null;
    distance_km?: number | null;
    is_applied?: boolean; // We will always set this to true for activity list
};

type AppWithFullJob = Database["public"]["Tables"]["applications"]["Row"] & {
    job: (Database["public"]["Tables"]["jobs"]["Row"] & {
        creator?: {
            full_name: string | null;
            company_name: string | null;
            account_type: Database["public"]["Enums"]["account_type"] | null;
        } | null;
    }) | null;
    message?: string | null;
};

interface ActivityListProps {
    applications: AppWithFullJob[];
}

export function ActivityList({ applications }: ActivityListProps) {
    const [selectedJob, setSelectedJob] = useState<JobRow | null>(null);

    const total = applications.length;
    const accepted = applications.filter(a => a.status === 'accepted').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    const pending = total - accepted - rejected;

    const handleOpenJob = (app: AppWithFullJob) => {
        if (app.job) {
            setSelectedJob({
                ...app.job,
                is_applied: true
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Gesamt"
                    value={total}
                    icon={<Briefcase className="text-blue-400" size={20} />}
                    bg="bg-blue-500/10"
                    border="border-blue-500/20"
                />
                <StatCard
                    label="Offen"
                    value={pending}
                    icon={<Clock className="text-yellow-400" size={20} />}
                    bg="bg-yellow-500/10"
                    border="border-yellow-500/20"
                />
                <StatCard
                    label="Zusagen"
                    value={accepted}
                    icon={<CheckCircle2 className="text-emerald-400" size={20} />}
                    bg="bg-emerald-500/10"
                    border="border-emerald-500/20"
                />
                <StatCard
                    label="Absagen"
                    value={rejected}
                    icon={<XCircle className="text-red-400" size={20} />}
                    bg="bg-red-500/10"
                    border="border-red-500/20"
                />
            </div>

            {/* Applications List */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calendar size={20} className="text-indigo-400" /> Verlauf
                </h2>

                {applications.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-[#121217] p-12 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                            <Briefcase size={32} />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">Keine Bewerbungen</h3>
                        <p className="text-slate-400 mb-6 max-w-md mx-auto">
                            Du hast dich noch auf keine Jobs beworben. Finde jetzt spannende Aufgaben in deiner Nähe!
                        </p>
                        <a href="/app-home/jobs">
                            <ButtonPrimary className="px-8">
                                Jobs finden
                            </ButtonPrimary>
                        </a>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {applications.map((app) => (
                            <div
                                key={app.id}
                                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#121217] transition-all hover:border-white/20 hover:bg-[#16161c]"
                            >
                                {/* Background Gradient on Hover */}
                                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                                <div className="p-6">
                                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

                                        {/* Main Content */}
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <StatusBadge status={app.status} />
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        Beworben am {format(new Date(app.created_at), "d. MMMM yyyy", { locale: de })}
                                                    </span>
                                                </div>
                                                <h3
                                                    onClick={() => handleOpenJob(app)}
                                                    className="text-xl font-bold text-white cursor-pointer hover:text-indigo-400 transition-colors inline-flex items-center gap-2"
                                                >
                                                    {app.job?.title || "Unbekannter Job"}
                                                    <ArrowRight size={16} className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-indigo-400" />
                                                </h3>
                                            </div>

                                            {/* Job Metadata Snippet */}
                                            {app.job && (
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Euro size={14} className="text-emerald-400/70" />
                                                        <span>{app.job.wage_hourly} €/h</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin size={14} className="text-blue-400/70" />
                                                        <span>{app.job.public_location_label}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Application Message */}
                                            {app.message && (
                                                <div className="relative pl-4 border-l-2 border-white/10 py-1">
                                                    <p className="text-sm text-slate-400 italic line-clamp-2">
                                                        "{app.message}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col items-end gap-3 shrink-0">
                                            {app.status === 'accepted' ? (
                                                <ButtonPrimary className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/20">
                                                    <MessageSquare size={16} className="mr-2" />
                                                    Chat öffnen
                                                </ButtonPrimary>
                                            ) : (
                                                <button
                                                    onClick={() => handleOpenJob(app)}
                                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                                                >
                                                    Details
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer / Timeline (Simplified) */}
                                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <div className="w-2 h-2 rounded-full bg-slate-700 ring-2 ring-[#121217]" />
                                            <span>Bewerbung gesendet</span>
                                            {app.status !== 'submitted' && (
                                                <>
                                                    <div className="w-8 h-px bg-slate-800" />
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full ring-2 ring-[#121217]",
                                                        app.status === 'accepted' ? "bg-emerald-500" : "bg-red-500"
                                                    )} />
                                                    <span className={cn(
                                                        app.status === 'accepted' ? "text-emerald-400" : "text-red-400"
                                                    )}>
                                                        {app.status === 'accepted' ? 'Akzeptiert' : 'Abgelehnt'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">
                                            ID: {app.id.slice(0, 8)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <JobDetailModal
                job={selectedJob}
                isOpen={!!selectedJob}
                onClose={() => setSelectedJob(null)}
                canApply={false} // Always false in activity view
                guardianStatus="none" // Not relevant for viewing details
                context="activity"
            />
        </div>
    );
}

function StatCard({ label, value, icon, bg, border }: { label: string, value: number, icon: React.ReactNode, bg: string, border: string }) {
    return (
        <div className={cn("p-4 rounded-2xl border bg-[#121217] relative overflow-hidden group", border)}>
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity", bg)} />
            <div className="flex items-start justify-between mb-2">
                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{label}</span>
                <div className={cn("p-1.5 rounded-lg", bg)}>
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-bold text-white">
                {value}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'submitted':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
                    <Clock size={12} /> Offen
                </span>
            );
        case 'accepted':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={12} /> Zusage
                </span>
            );
        case 'rejected':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400 border border-red-500/20">
                    <XCircle size={12} /> Absage
                </span>
            );
        default:
            return null;
    }
}
