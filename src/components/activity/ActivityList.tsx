"use client";

import { useState, useCallback, memo, useMemo } from "react";
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
    Loader2
} from "lucide-react";
import { ApplicationChatModal } from "@/components/activity/ApplicationChatModal";
import { withdrawApplication, sendMessage } from "@/app/app-home/applications/actions";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/types/supabase";
import { useRouter } from "next/navigation";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

interface ActivityListProps {
    applications: any[]; // Using any for joined data, can be typed strictly later
}

import { ActivityItem } from "@/components/activity/ActivityItem";

export function ActivityList({ applications }: ActivityListProps) {
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const router = useRouter();

    const handleSelectApp = useCallback((app: any) => {
        setSelectedApp(app);
        setIsChatOpen(true);
    }, []);

    const handleWithdraw = async (reason: string) => {
        if (!selectedApp) return;
        await withdrawApplication(selectedApp.id, reason);
        setIsChatOpen(false);
        router.refresh();
    };

    // Memoized Stats to prevent expensive recalculations on every render (e.g. when modal opens)
    const stats = useMemo(() => {
        return {
            negotiating: applications.filter(a => ['negotiating', 'submitted', 'waitlisted'].includes(a.status)).length,
            accepted: applications.filter(a => a.status === 'accepted').length,
            rejected: applications.filter(a => ['rejected', 'withdrawn', 'cancelled'].includes(a.status)).length
        };
    }, [applications]);

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
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-[#111116] border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <MessageSquare size={48} />
                    </div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Verhandelt</div>
                    <div className="text-3xl font-bold text-white">
                        {stats.negotiating}
                    </div>
                </div>
                <div className="bg-[#111116] border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle2 size={48} className="text-emerald-500" />
                    </div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Abgeschlossen</div>
                    <div className="text-3xl font-bold text-emerald-400">
                        {stats.accepted}
                    </div>
                </div>
                <div className="bg-[#111116] border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <XCircle size={48} className="text-red-500" />
                    </div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Beendet</div>
                    <div className="text-3xl font-bold text-slate-400">
                        {stats.rejected}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white px-2">Deine Bewerbungen</h3>

                {applications.map((app) => (
                    <ActivityItem
                        key={app.id}
                        app={app}
                        onSelect={handleSelectApp}
                    />
                ))}
            </div>

            {/* Chat Modal */}
            <ApplicationChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                onClosed={() => setSelectedApp(null)}
                application={selectedApp}
                onWithdraw={handleWithdraw}
                onSendMessage={sendMessage}
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
