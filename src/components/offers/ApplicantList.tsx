"use client";

import { useState } from "react";
import Image from "next/image";
import { User, MessageSquare, Check, X, Clock } from "lucide-react";
import { ApplicationRow, updateApplicationStatus } from "@/lib/dal/jobbridge";
import { RejectionModal } from "./RejectionModal";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function ApplicantList({ applications }: { applications: ApplicationRow[] }) {
    const router = useRouter();
    const [selectedApplicant, setSelectedApplicant] = useState<ApplicationRow | null>(null);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleAccept = async (appId: string) => {
        setLoadingId(appId);
        try {
            await updateApplicationStatus(appId, "accepted");
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingId(null);
        }
    };

    const handleRejectClick = (app: ApplicationRow) => {
        setSelectedApplicant(app);
        setIsRejectionModalOpen(true);
    };

    const handleRejectConfirm = async (reasonId: string, message: string) => {
        if (!selectedApplicant) return;
        setLoadingId(selectedApplicant.id);
        try {
            // We store the reason string or ID
            const reasonText = message || reasonId;
            await updateApplicationStatus(selectedApplicant.id, "rejected", reasonText);
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingId(null);
        }
    };

    if (applications.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                    <User size={32} />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Noch keine Bewerber</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                    Sobald sich jemand auf diesen Job bewirbt, erscheinen die Profile hier.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {applications.map((app) => (
                <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col md:flex-row items-center gap-6 group hover:border-white/20 transition-all">
                    {/* Avatar / User Info */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/10 shrink-0">
                            {/* Avatar placeholder only since we don't have avatar_url yet */}
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <User size={24} />
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="text-white font-semibold truncate">
                                {app.applicant?.full_name || "Unbekannter Nutzer"}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                <Clock size={12} />
                                <span>{new Date(app.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Message Preview (if any) */}
                    <div className="flex-1 w-full md:w-auto">
                        {app.message ? (
                            <div className="bg-black/20 p-3 rounded-lg text-sm text-slate-300 italic line-clamp-2 md:line-clamp-1 border border-white/5">
                                "{app.message}"
                            </div>
                        ) : (
                            <span className="text-sm text-slate-500 italic">Keine Nachricht</span>
                        )}
                    </div>

                    {/* Status / Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        {app.status === 'submitted' ? (
                            <>
                                <button
                                    onClick={() => handleRejectClick(app)}
                                    disabled={loadingId === app.id}
                                    className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors disabled:opacity-50"
                                    title="Absagen"
                                >
                                    <X size={18} />
                                </button>
                                <button
                                    onClick={() => handleAccept(app.id)}
                                    disabled={loadingId === app.id}
                                    className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-medium shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loadingId === app.id ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            <span>Akzeptieren</span>
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <div className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium border flex items-center gap-2",
                                app.status === 'accepted' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                    app.status === 'rejected' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                        "bg-slate-500/10 border-slate-500/20 text-slate-400"
                            )}>
                                {app.status === 'accepted' && <Check size={14} />}
                                {app.status === 'rejected' && <X size={14} />}
                                {app.status === 'accepted' ? "Akzeptiert" : app.status === 'rejected' ? "Abgesagt" : app.status}
                            </div>
                        )}
                        <button className="p-2.5 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-colors" title="Chat">
                            <MessageSquare size={18} />
                        </button>
                    </div>
                </div>
            ))}

            <RejectionModal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                onConfirm={handleRejectConfirm}
                applicantName={selectedApplicant?.applicant?.full_name || "Bewerber"}
            />
        </div>
    );
}
