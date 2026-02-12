import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, MapPin, Building2, ShieldCheck, Info, CheckCircle2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

type ProviderVerificationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    profileId: string;
    onVerified: () => void;
};

export function ProviderVerificationModal({ isOpen, onClose, profileId, onVerified }: ProviderVerificationModalProps) {
    const [street, setStreet] = useState("");
    const [houseNumber, setHouseNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setIsSuccess(false);
            setStreet("");
            setHouseNumber("");
            setError(null);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!street.trim() || !houseNumber.trim()) {
            setError("Bitte gib Straße und Hausnummer an.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const { error: updateError } = await supabaseBrowser
                .from("profiles")
                .update({
                    street: street.trim(),
                    house_number: houseNumber.trim(),
                    provider_verification_status: "verified",
                    provider_verified_at: new Date().toISOString(),
                })
                .eq("id", profileId);

            if (updateError) throw updateError;

            // Trigger Success Animation
            setIsSuccess(true);

            // Wait for animation then close and notify
            setTimeout(() => {
                onVerified(); // This should trigger the banner removal in parent
                onClose();
            }, 2000);

        } catch (err) {
            console.error("Verification error:", err);
            setError("Fehler beim Speichern. Bitte versuche es erneut.");
            setIsSubmitting(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#0B0C10] border border-white/10 p-6 text-left align-middle shadow-xl transition-all relative">
                                {isSuccess ? (
                                    <div className="flex flex-col items-center justify-center py-10 space-y-6">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
                                            <CheckCircle2 size={80} className="text-emerald-500 relative z-10 animate-[bounce_1s_infinite]" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <h3 className="text-2xl font-bold text-white tracking-tight">Verifiziert!</h3>
                                            <p className="text-slate-400">Vielen Dank. Deine Adresse wurde bestätigt.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-6">
                                            <Dialog.Title as="h3" className="text-xl font-bold text-white flex items-center gap-2">
                                                <ShieldCheck className="text-emerald-500" />
                                                Adresse verifizieren
                                            </Dialog.Title>
                                            <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4">
                                                <div className="flex gap-3">
                                                    <Info className="flex-shrink-0 text-indigo-400" size={20} />
                                                    <div className="space-y-2">
                                                        <p className="text-sm text-indigo-200">
                                                            Bitte gib deine **richtige Wohnadresse** an. Diese Angabe ist verbindlich und erhöht deinen **Trust Score**.
                                                        </p>
                                                        <p className="text-xs text-indigo-300/70">
                                                            Hinweis: Der Support kann jederzeit eine Verifizierung per Brief an diese Adresse anfordern. Falschangaben führen zur Sperrung.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-slate-400 ml-1">Straße</label>
                                                    <div className="relative">
                                                        <div className="absolute left-3 top-3 text-slate-500 pointer-events-none">
                                                            <MapPin size={16} />
                                                        </div>
                                                        <input
                                                            value={street}
                                                            onChange={(e) => setStreet(e.target.value)}
                                                            placeholder="Musterstraße"
                                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-slate-400 ml-1">Hausnummer</label>
                                                    <div className="relative">
                                                        <div className="absolute left-3 top-3 text-slate-500 pointer-events-none">
                                                            <Building2 size={16} />
                                                        </div>
                                                        <input
                                                            value={houseNumber}
                                                            onChange={(e) => setHouseNumber(e.target.value)}
                                                            placeholder="12a"
                                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {error && (
                                                <p className="text-xs text-rose-400 font-medium">{error}</p>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                            >
                                                Abbrechen
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:opacity-50 transition-all"
                                            >
                                                {isSubmitting ? "Speichert..." : "Adresse bestätigen"}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
