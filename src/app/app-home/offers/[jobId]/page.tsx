import { requireCompleteProfile } from "@/lib/auth";
import { getJobByIdService } from "@/lib/services/jobs";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, Euro, Building2, Calendar, FileText, ArrowRight } from "lucide-react";
import { Database } from "@/lib/types/supabase";
import { getEffectiveView, fetchJobApplications } from "@/lib/dal/jobbridge";
import { ApplicationRow } from "@/lib/types/jobbridge";

type JobRow = Database['public']['Tables']['jobs']['Row'];

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = await params;
    const { profile } = await requireCompleteProfile();

    const viewRes = await getEffectiveView({ userId: profile.id, baseAccountType: profile.account_type });
    const viewRole = viewRes.ok ? viewRes.data.viewRole : (profile.account_type ?? "job_seeker");
    const isDemo = viewRes.ok ? (viewRes.data.source === "demo") : false;

    if (viewRole !== "job_provider") {
        redirect("/app-home/jobs");
    }

    let { data, error } = await getJobByIdService(jobId, isDemo);

    // Fallback: If not found in current mode, try the other mode (Provider might have clicked a link from a different context)
    if (error || !data) {
        const { data: fallbackData, error: fallbackError } = await getJobByIdService(jobId, !isDemo);
        if (fallbackData && !fallbackError) {
            data = fallbackData;
            error = undefined;
        }
    }

    if (error || !data) {
        return (
            <div className="container mx-auto py-20 px-4 text-center">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl inline-block max-w-lg w-full backdrop-blur-sm">
                    <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-red-500 mb-2">Job nicht gefunden (404)</h1>
                    <p className="text-slate-400 mb-8">Dieser Job existiert nicht oder du hast keine Berechtigung.</p>

                    <div className="text-left bg-black/50 p-4 rounded-xl font-mono text-xs text-slate-500 mb-8 overflow-x-auto border border-white/5">
                        <p><span className="text-slate-400">ID:</span> {jobId}</p>
                        <p><span className="text-slate-400">Mode:</span> {isDemo ? 'Demo' : 'Live'}</p>
                        <p><span className="text-slate-400">Role:</span> {viewRole}</p>
                        {error && <p className="text-red-400 mt-2">Error: {error}</p>}
                    </div>

                    <Link href="/app-home/offers" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors border border-white/10">
                        <ArrowLeft size={16} />
                        Zurück zur Übersicht
                    </Link>
                </div>
            </div>
        );
    }

    const job = data as unknown as JobRow;

    // Ownership check
    if (job.posted_by !== profile.id) {
        redirect("/app-home/offers");
    }

    // Fetch Applications count only
    const appRes = await fetchJobApplications(jobId, profile.id);
    const applicationCount = appRes.ok ? appRes.data.length : 0;

    // Status logic for the tile
    const getStatusInfo = () => {
        if (job.status === 'draft') return { label: "Entwurf", color: "text-slate-400", bg: "bg-slate-500/10", glow: "shadow-slate-500/20" };
        if (job.status === 'closed') return { label: "Abgeschlossen", color: "text-red-400", bg: "bg-red-500/10", glow: "shadow-red-500/20" };
        if (applicationCount > 0) return { label: "In Verhandlung", color: "text-amber-400", bg: "bg-amber-500/10", glow: "shadow-amber-500/20" };
        return { label: "Online & Sucht", color: "text-emerald-400", bg: "bg-emerald-500/10", glow: "shadow-emerald-500/20" };
    };

    const statusInfo = getStatusInfo();

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
            <Link href="/app-home/offers" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors font-medium text-sm group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Zurück zu meinen Jobs</span>
            </Link>

            {/* Premium Job Detail Card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B0C10] shadow-2xl">
                {/* Background Design Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#312e81,transparent)] opacity-30 pointer-events-none" />

                {/* Refined Grid: Top-right only, very subtle */}
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(circle_at_100%_0%,black,transparent_70%)] pointer-events-none" />

                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

                {/* Status Bar */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-50" />

                <div className="relative z-10 p-8 md:p-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-white/5 pb-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-indigo-400 shadow-inner">
                                    <Building2 size={28} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${job.status === 'open' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                    job.status === 'closed' ? 'bg-slate-500/10 border-slate-500/20 text-slate-400' :
                                        job.status === 'draft' ? 'bg-slate-500/10 border-slate-500/20 text-slate-300' :
                                            'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    }`}>
                                    {job.status === 'open' ? <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" /> :
                                        job.status === 'closed' ? <div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> :
                                            job.status === 'draft' ? <div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> :
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    }
                                    {job.status === 'open' ? 'Aktiv veröffentlicht' :
                                        job.status === 'closed' ? 'Geschlossen' :
                                            job.status === 'draft' ? 'Entwurf' : job.status}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight tracking-tight">{job.title}</h1>
                            <p className="text-slate-400 flex items-center gap-2 text-sm">
                                <Calendar size={14} className="text-slate-500" />
                                Erstellt am {new Date(job.created_at).toLocaleDateString("de-DE", { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 min-w-[200px]">
                            <Link
                                href={`/app-home/offers/edit/${job.id}`}
                                className="w-full py-3 px-4 rounded-xl bg-white/[0.03] hover:bg-white/5 border border-white/10 text-white font-medium transition-all flex items-center justify-center gap-2 hover:border-indigo-500/30 group"
                            >
                                <FileText size={16} className="text-indigo-400 group-hover:text-indigo-300" />
                                <span>Bearbeiten</span>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-10">
                        <div className="p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-all hover:bg-white/[0.04] hover:border-white/10 group/tile">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_-5px_rgba(52,211,153,0.2)] group-hover/tile:scale-110 transition-transform shrink-0">
                                <Euro size={20} className="md:w-6 md:h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Stundenlohn</p>
                                <p className="text-lg md:text-xl font-black text-white leading-tight">{job.wage_hourly} € <span className="text-xs md:text-sm font-medium text-slate-500">/ h</span></p>
                            </div>
                        </div>
                        <div className="p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-all hover:bg-white/[0.04] hover:border-white/10 group/tile">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)] group-hover/tile:scale-110 transition-transform shrink-0">
                                <MapPin size={20} className="md:w-6 md:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Einsatzort</p>
                                <p className="text-lg md:text-xl font-black text-white truncate w-full leading-tight">{job.public_location_label || "Rheinbach"}</p>
                            </div>
                        </div>
                        <div className="p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 transition-all hover:bg-white/[0.04] hover:border-white/10 col-span-2 lg:col-span-1 group/tile">
                            {/* Status Tile */}
                            <div className="flex-1 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl ${statusInfo.bg} flex items-center justify-center ${statusInfo.color} shadow-[0_0_20px_-5px_rgba(255,255,255,0.05)] group-hover/tile:scale-110 transition-transform shrink-0`}>
                                        <Clock size={20} className="md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Status</p>
                                        <p className={`text-lg md:text-xl font-black ${statusInfo.color} leading-tight`}>{statusInfo.label}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-headings:text-white">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                            <FileText size={20} className="text-indigo-400" />
                            Aufgabenbeschreibung
                        </h3>
                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 text-slate-300 whitespace-pre-wrap">
                            {job.description}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center">
                        <Link
                            href="/app-home/activities"
                            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-lg rounded-2xl hover:bg-slate-200 transition-all shadow-[0_0_40px_-5px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.3)] hover:-translate-y-1"
                        >
                            <span>Zu den Aktivitäten (Bewerbungen)</span>
                            <ArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
                        </Link>
                        <p className="text-sm text-slate-500 mt-4">Verwalte Bewerbungen und Chats im Aktivitäten-Tab</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
