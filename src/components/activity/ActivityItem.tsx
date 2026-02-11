import { memo } from "react";
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
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/types/supabase";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

export const ActivityItem = memo(function ActivityItem({ app, onSelect }: { app: any, onSelect: (app: any) => void }) {
    const status = app.status as ApplicationStatus;

    // Map DB status to UI Label
    let statusLabel = "Offen";
    let statusColor = "text-slate-500";
    let statusBg = "bg-slate-500/10";
    let statusIcon = <Clock size={14} />;

    if (status === 'negotiating') {
        statusLabel = "Verhandlung";
        statusColor = "text-indigo-400";
        statusBg = "bg-indigo-500/10";
        statusIcon = <MessageSquare size={14} />;
    } else if (status === 'accepted') {
        statusLabel = "Akzeptiert";
        statusColor = "text-emerald-400";
        statusBg = "bg-emerald-500/10";
        statusIcon = <CheckCircle2 size={14} />;
    } else if (status === 'rejected') {
        statusLabel = "Abgelehnt";
        statusColor = "text-red-400";
        statusBg = "bg-red-500/10";
        statusIcon = <XCircle size={14} />;
    } else if (status === 'withdrawn') {
        statusLabel = "Zurückgezogen";
        statusColor = "text-slate-500";
        statusBg = "bg-slate-500/10";
        statusIcon = <XCircle size={14} />;
    } else if (status === 'waitlisted') {
        statusLabel = "Warteliste";
        statusColor = "text-orange-400";
        statusBg = "bg-orange-500/10";
        statusIcon = <Loader2 size={14} className="animate-spin-slow" />;
    } else if (status === 'submitted') {
        statusLabel = "Gesendet";
        statusColor = "text-blue-400";
        statusBg = "bg-blue-500/10";
        statusIcon = <CheckCircle2 size={14} />;
    }

    return (
        <div
            className="group relative overflow-hidden rounded-2xl bg-[#111116] border border-white/5 hover:border-white/10 transition-all hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5"
        >
            <div className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                {/* Job Info */}
                <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/5", statusBg, statusColor)}>
                            {statusIcon}
                            {statusLabel}
                        </div>
                        <span className="text-slate-500 text-xs font-medium">
                            {formatDistanceToNow(new Date(app.created_at), { addSuffix: true, locale: de })}
                        </span>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors truncate mb-1">
                            {app.job?.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <Building2 size={14} className="text-slate-600" />
                                {app.job?.creator?.company_name || "Privat"}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-slate-600" />
                                {app.job?.public_location_label || "Rheinbach"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:border-l md:border-white/5 md:pl-6 pt-4 md:pt-0 border-t border-white/5 md:border-t-0 mt-2 md:mt-0">
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => onSelect(app)}
                            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white transition-all font-medium text-sm flex items-center justify-center gap-2 group/btn"
                        >
                            Ansehen
                            <ArrowRight size={16} className="text-slate-500 group-hover/btn:text-white transition-colors" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});
