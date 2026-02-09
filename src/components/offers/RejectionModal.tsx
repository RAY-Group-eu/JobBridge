"use client";

import { useState } from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { cn } from "@/lib/utils";

interface RejectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string, message: string) => Promise<void>;
    applicantName: string;
}

const REASONS = [
    { id: "filled", label: "Stelle ist bereits vergeben", message: "Vielen Dank für deine Bewerbung. Wir haben uns leider für einen anderen Bewerber entschieden. Viel Erfolg weiterhin!" },
    { id: "skills", label: "Qualifikation passt nicht ganz", message: "Dein Profil ist interessant, aber für diese spezifische Position suchen wir jemanden mit anderer Erfahrung." },
    { id: "other", label: "Anderer Grund", message: "" },
];

export function RejectionModal({ isOpen, onClose, onConfirm, applicantName }: RejectionModalProps) {
    const [selectedReason, setSelectedReason] = useState<string>("filled");
    const [customMessage, setCustomMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const currentReasonObj = REASONS.find(r => r.id === selectedReason);
    const effectiveMessage = selectedReason === "other" ? customMessage : currentReasonObj?.message || "";

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm(selectedReason, effectiveMessage);
            onClose();
        } catch (error) {
            console.error("Failed to reject:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1A1A23] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                    <h2 className="text-lg font-semibold text-white">Bewerbung absagen</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={20} />
                        <div className="text-sm text-amber-200/80">
                            Du bist dabei, <span className="font-bold text-amber-200">{applicantName}</span> abzusagen.
                            Bitte wähle einen Grund, um dem Bewerber eine höfliche Rückmeldung zu geben.
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300">Grund für die Absage</label>
                        <div className="grid gap-2">
                            {REASONS.map((reason) => (
                                <button
                                    key={reason.id}
                                    onClick={() => setSelectedReason(reason.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                                        selectedReason === reason.id
                                            ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/20"
                                            : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300"
                                    )}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                                        selectedReason === reason.id ? "border-indigo-500 text-indigo-500" : "border-slate-600"
                                    )}>
                                        {selectedReason === reason.id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                                    </div>
                                    <span className="text-sm font-medium">{reason.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedReason === "other" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-sm font-medium text-slate-300">Deine Nachricht</label>
                            <textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="Schreibe eine kurze Nachricht..."
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[100px] resize-none"
                            />
                        </div>
                    )}

                    {selectedReason !== "other" && (
                        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Vorschau der Nachricht</label>
                            <p className="text-sm text-slate-300 italic">"{currentReasonObj?.message}"</p>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-white/5 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        Abbrechen
                    </button>
                    <ButtonPrimary
                        onClick={handleSubmit}
                        disabled={isSubmitting || (selectedReason === "other" && !customMessage.trim())}
                        className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                    >
                        {isSubmitting ? "Wird gesendet..." : "Absagen senden"}
                    </ButtonPrimary>
                </div>
            </div>
        </div>
    );
}
