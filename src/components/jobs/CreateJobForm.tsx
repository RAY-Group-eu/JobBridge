"use client";

import { createJob } from "@/app/app-home/offers/actions";
import { Loader2, Save, MapPin } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useActionState, useState } from "react";
import { cn } from "@/lib/utils";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Veröffentlichen</span>
        </button>
    );
}

export function CreateJobForm({ userId, marketId, defaultLocation }: { userId: string, marketId: string, defaultLocation?: any }) {
    const [state, formAction] = useActionState(createJob, null);
    const [useCustomLocation, setUseCustomLocation] = useState(!defaultLocation);

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="use_default_location" value={(!useCustomLocation && defaultLocation) ? "true" : "false"} />

            <div className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">Titel des Jobs *</label>
                    <input
                        type="text"
                        name="title"
                        required
                        placeholder="z.B. Rasenmähen am Wochenende"
                        className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Beschreibung</label>
                    <textarea
                        name="description"
                        rows={4}
                        placeholder="Beschreibe, was zu tun ist..."
                        className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
                    />
                </div>

                {/* Location Section */}
                <div className="pt-2">
                    {defaultLocation && (
                        <div className="mb-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
                            <MapPin className="text-indigo-400 mt-1" size={18} />
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-white">Standard-Ort wird verwendet</h4>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {defaultLocation.public_label || "Mein Ort"} ({defaultLocation.address_line1}, {defaultLocation.city})
                                </p>
                            </div>
                            <div className="flex items-center h-full">
                                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={useCustomLocation}
                                        onChange={(e) => setUseCustomLocation(e.target.checked)}
                                        className="rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/50"
                                    />
                                    Anderen Ort wählen
                                </label>
                            </div>
                        </div>
                    )}

                    {(useCustomLocation || !defaultLocation) && (
                        <div className={cn("space-y-4 transition-all", defaultLocation && "pl-4 border-l-2 border-slate-800")}>
                            <div>
                                <label htmlFor="address_full" className="block text-sm font-medium text-slate-300 mb-1">Adresse *</label>
                                <input
                                    type="text"
                                    name="address_full"
                                    required={useCustomLocation}
                                    placeholder="Musterstraße 123, 53359 Rheinbach"
                                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="wage" className="block text-sm font-medium text-slate-300 mb-1">Stundenlohn (€)</label>
                    <input
                        type="number"
                        name="wage"
                        min="0"
                        step="0.50"
                        placeholder="12.00"
                        className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                </div>
            </div>

            {state?.error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {state.error}
                </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-6">
                <p className="text-xs text-slate-500">Dein Job wird für Jobsuchende in Rheinbach sichtbar sein.</p>
                <SubmitButton />
            </div>
        </form>
    );
}
