"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Lock, X, ArrowRight, ShieldCheck, QrCode } from "lucide-react";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { useRouter } from "next/navigation";

interface VerificationRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function VerificationRequiredModal({ isOpen, onClose }: VerificationRequiredModalProps) {
    const router = useRouter();

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-4"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-[#09090b] border border-white/10 text-left align-middle shadow-2xl transition-all relative">
                                {/* Close Button */}
                                <button
                                    type="button"
                                    className="absolute top-4 right-4 z-10 rounded-full bg-white/5 p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    onClick={onClose}
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                {/* Decorative Background */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

                                <div className="p-8 flex flex-col items-center text-center space-y-6">
                                    {/* Icon */}
                                    <div className="w-20 h-20 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-indigo-400 shadow-xl relative group">
                                        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <Lock size={32} className="relative z-10" />
                                    </div>

                                    <div className="space-y-2">
                                        <Dialog.Title as="h3" className="text-2xl font-bold text-white">
                                            Account freischalten
                                        </Dialog.Title>
                                        <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] mx-auto">
                                            Um dich auf Jobs zu bewerben, muss dein Account von einem Erziehungsberechtigten verifiziert werden.
                                        </p>
                                    </div>

                                    {/* Benefits */}
                                    <div className="w-full bg-white/5 rounded-2xl p-4 flex items-start gap-4 text-left border border-white/5">
                                        <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">Sicher & Verifiziert</h4>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Zugriff auf geprüfte Jobs und Versicherungsschutz während der Arbeit.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="w-full space-y-3 pt-2">
                                        <ButtonPrimary
                                            onClick={() => {
                                                // In a real app, this might navigate to a dedicated page or show a QR code.
                                                // For this task, we'll assume it navigates to the Onboarding Wizard or similar.
                                                // Since OnboardingWizard is complex, we'll just redirect to the onboarding page if it exists,
                                                // or show an alert for the prototype.
                                                // The user wanted "Add 'Generate Link' modal trigger".
                                                // Let's pretend we generate a link.
                                                alert("Link für Eltern generiert! (Demo)");
                                                onClose();
                                            }}
                                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20"
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                <QrCode size={18} />
                                                Link für Eltern erstellen
                                            </span>
                                        </ButtonPrimary>

                                        <button
                                            onClick={onClose}
                                            className="text-sm text-slate-500 hover:text-white transition-colors"
                                        >
                                            Später erledigen
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
