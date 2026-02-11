"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { withdrawApplication } from "@/app/app-home/applications/actions";
import { useRouter } from "next/navigation";

export function WithdrawButton({ applicationId }: { applicationId: string }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleWithdraw = async () => {
        setLoading(true);
        try {
            await withdrawApplication(applicationId, reason || "Kein Interesse mehr");
            setIsOpen(false);
            router.refresh(); // Refresh to update UI state
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-medium border border-red-500/20"
            >
                Zurückziehen
            </button>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[60]" onClose={() => setIsOpen(false)}>
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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#18181b] border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-white flex items-center gap-2"
                                    >
                                        <AlertTriangle className="text-amber-500" size={20} />
                                        Bewerbung zurückziehen
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-slate-400">
                                            Möchtest du deine Bewerbung wirklich zurückziehen?
                                            Bitte gib einen Grund an.
                                        </p>

                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="Grund (optional, z.B. Hat sich erledigt)"
                                            className="w-full mt-4 bg-black/20 border border-white/10 rounded-xl p-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-24"
                                        />
                                    </div>

                                    <div className="mt-6 flex gap-3 justify-end">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 focus:outline-none"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Abbrechen
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20 focus:outline-none disabled:opacity-50"
                                            onClick={handleWithdraw}
                                            disabled={loading}
                                        >
                                            {loading ? "Wird verarbeitet..." : "Zurückziehen"}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
