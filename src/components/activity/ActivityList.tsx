"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import {
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight,
    MessageSquare,
    Building2,
    MapPin,
    Euro,
    Loader2
} from "lucide-react";
import { ApplicationDetailModal } from "@/components/activity/ApplicationDetailModal";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/types/supabase";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

interface ActivityListProps {
    applications: any[]; // Using any for joined data, can be typed strictly later
}

export function ActivityList({ applications }: ActivityListProps) {
    const [selectedApp, setSelectedApp] = useState<any>(null);

    // Mock handlers for now
    const handleWithdraw = async (reason: string) => {
        console.log("Withdrawing application", selectedApp?.id, reason);
        // await withdrawApplication(selectedApp.id, reason);
        setSelectedApp(null);
    };

    const handleSendMessage = async (message: string) => {
        console.log("Sending message", selectedApp?.id, message);
        // await sendMessage(selectedApp.id, message);
    };

    if (applications.length === 0) {
        return (
            <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-slate-800 bg-slate-900/20">
                <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                    <Briefcase size={24} />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Keine Aktivitäten</h3>
                <p className="text-slate-400 max-w-sm mx-auto mb-6">
                    Du hast dich noch auf keine Jobs beworben. Stöbere in den Angeboten und finde deinen ersten Job!
                </p>
                <a href="/app-home" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Zu den Angeboten <ArrowRight size={16} />
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#111116] border border-white/5 p-4 rounded-2xl">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Offen</div>
                    <div className="text-2xl font-bold text-white">
                        {applications.filter(a => ['submitted', 'pending'].includes(a.status)).length}
                    </div>
                </div>
                <div className="bg-[#111116] border border-white/5 p-4 rounded-2xl">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">In Verhandlung</div>
                    <div className="text-2xl font-bold text-indigo-400">
                        {applications.filter(a => a.status === 'negotiating').length}
                    </div>
                </div>
                <div className="bg-[#111116] border border-white/5 p-4 rounded-2xl">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Warteliste</div>
                    <div className="text-2xl font-bold text-orange-400">
                        {applications.filter(a => a.status === 'waitlisted').length}
                    </div>
                </div>
                <div className="bg-[#111116] border border-white/5 p-4 rounded-2xl">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Akzeptiert</div>
                    <div className="text-2xl font-bold text-emerald-400">
                        {applications.filter(a => a.status === 'accepted').length}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {applications.map((app) => {
                    const status = app.status as ApplicationStatus;
                    const isNew = new Date(app.created_at).getTime() > Date.now() - 1000 * 60 * 60 * 24; // 24h

                    return (
                        <div
                            key={app.id}
                            onClick={() => setSelectedApp(app)}
                            className="group relative overflow-hidden rounded-2xl bg-[#111116] border border-white/5 hover:border-white/10 transition-all cursor-pointer hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5"
                        >
                            {/* Status Stripe */}
                            <div className={cn("absolute left-0 top-0 bottom-0 w-1",
                                status === 'accepted' ? "bg-emerald-500" :
                                    status === 'negotiating' ? "bg-indigo-500" :
                                        status === 'waitlisted' ? "bg-orange-500" :
                                            status === 'rejected' ? "bg-red-500" :
                                                "bg-slate-700"
                            )} />

                            <div className="p-5 pl-7 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                {/* Job Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        {isNew && (
                                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 uppercase tracking-wide">
                                                Neu
                                            </span>
                                        )}
                                        <div className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
                                            status === 'accepted' ? "text-emerald-400" :
                                                status === 'negotiating' ? "text-indigo-400" :
                                                    status === 'waitlisted' ? "text-orange-400" :
                                                        status === 'rejected' ? "text-red-400" :
                                                            "text-slate-500"
                                        )}>
                                            {status === 'accepted' && <CheckCircle2 size={12} />}
                                            {status === 'negotiating' && <MessageSquare size={12} />}
                                            {status === 'waitlisted' && <Loader2 size={12} className="animate-spin-slow" />}
                                            {status === 'rejected' && <XCircle size={12} />}
                                            {status}
                                        </div>
                                        <span className="text-slate-600 text-xs">•</span>
                                        <span className="text-slate-500 text-xs">
                                            {formatDistanceToNow(new Date(app.created_at), { addSuffix: true, locale: de })}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors truncate">
                                        {app.job?.title}
                                    </h3>

                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <span className="flex items-center gap-1.5">
                                            <Building2 size={14} className="text-slate-600" />
                                            {app.job?.creator?.company_name || "Privat"}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Euro size={14} className="text-slate-600" />
                                            {app.job?.wage_hourly} €
                                        </span>
                                    </div>
                                </div>

                                {/* Right Side Actions/Status */}
                                <div className="flex items-center gap-4 md:border-l md:border-white/5 md:pl-6">
                                    {status === 'negotiating' && (
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-1">
                                                1 neue Nachricht
                                            </span>
                                        </div>
                                    )}

                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                        <ArrowRight size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <ApplicationDetailModal
                isOpen={!!selectedApp}
                onClose={() => setSelectedApp(null)}
                application={selectedApp}
                onWithdraw={handleWithdraw}
                onSendMessage={handleSendMessage}
            />
        </div>
    );
}

// Helper icon component 
function Briefcase({ size, className }: { size?: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}
