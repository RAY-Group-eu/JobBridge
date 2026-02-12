"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { useState, useEffect } from "react";
import type { GuardianStatus } from "@/lib/types";
import { GuardianConsentModal } from "@/components/GuardianConsentModal";

type GuardianBannerProps = {
    guardianStatus: GuardianStatus;
};

export function GuardianBanner({ guardianStatus }: GuardianBannerProps) {
    const [isDismissed, setIsDismissed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem("guardian_banner_dismissed");
        if (dismissed === "true") {
            setIsDismissed(true);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem("guardian_banner_dismissed", "true");
        setIsDismissed(true);
    };

    // 1. LINKED (GREEN)
    if (guardianStatus === "linked") {
        if (isDismissed) return null;

        return (
            <div className="relative group overflow-hidden rounded-[1.5rem] bg-[#0A0A0C] border border-emerald-500/20 p-6 flex items-start gap-5 mb-10 shadow-2xl">
                {/* Glow Effects */}
                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors duration-500" />
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-[50px]" />

                <div className="relative z-10 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shrink-0 shadow-lg">
                    <CheckCircle2 size={24} />
                </div>

                <div className="relative z-10 flex-1">
                    <h3 className="text-lg font-bold text-white mb-1 tracking-tight">
                        Elternbestätigung aktiv
                    </h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        Dein Konto wurde von einem Elternteil bestätigt. Du kannst Jobs annehmen.
                    </p>
                </div>

                <button
                    onClick={handleDismiss}
                    className="relative z-10 p-2 text-emerald-400/50 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-full transition-colors"
                    title="Hinweis ausblenden"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
            </div>
        );
    }

    // 2. PENDING (YELLOW) or INITIAL (RED)
    const isPending = guardianStatus === "pending";
    const statusColor = isPending ? "amber" : "rose"; // using rose for better red readability
    const StatusIcon = isPending ? AlertTriangle : AlertTriangle; // Could use distinct icons if needed

    return (
        <>
            <div className={`relative overflow-hidden rounded-[2rem] bg-[#0A0A0C] border p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 mb-12 shadow-2xl ${isPending ? "border-amber-500/20" : "border-rose-500/20"}`}>
                {/* Background Atmosphere */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none ${isPending ? "bg-amber-500/5" : "bg-rose-500/5"}`} />

                <div className="relative z-10 flex items-start gap-6 flex-1">
                    <div className={`p-4 border rounded-2xl shrink-0 shadow-[0_0_30px_-5px_rgba(0,0,0,0.3)] ${isPending ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"}`}>
                        <StatusIcon size={24} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                            {isPending ? "Bestätigung ausstehend" : "Elternbestätigung erforderlich"}
                        </h3>
                        <p className="text-slate-400 text-base font-medium leading-relaxed max-w-2xl">
                            {isPending
                                ? "Du hast bereits einen Link erstellt. Bitte lasse ihn bestätigen."
                                : "Um dich bewerben zu können, benötigen wir die Bestätigung eines Elternteils."}
                        </p>
                    </div>
                </div>

                <div className="relative z-10 md:ml-auto flex shrink-0">
                    <ButtonPrimary
                        onClick={() => setIsModalOpen(true)}
                        className={`border-none px-8 py-4 text-sm font-extrabold uppercase tracking-widest shadow-[0_0_40px_-10px_rgba(0,0,0,0.4)] hover:shadow-[0_0_60px_-10px_rgba(0,0,0,0.6)] ${isPending
                                ? "bg-amber-500 hover:bg-amber-400 text-[#0f0f13] shadow-amber-500/20"
                                : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"}`}
                    >
                        {isPending ? "Link anzeigen" : "Bestätigung starten"}
                    </ButtonPrimary>
                </div>
            </div>

            <GuardianConsentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                variant="initial"
            />
        </>
    );
}
