"use client";

import { useActionState } from "react";
import { saveDefaultLocation } from "./actions";
import { Loader2, Save, MapPin } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
        >
            {pending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Speichern</span>
        </button>
    );
}

export function DefaultLocationForm({ initialData }: { initialData: any }) {
    const [state, formAction] = useActionState(saveDefaultLocation, null);

    return (
        <form action={formAction} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Anzeigename (Öffentlich)</label>
                    <input
                        type="text"
                        name="public_label"
                        defaultValue={initialData?.public_label || ""}
                        placeholder="z.B. Rheinbach Zentrum"
                        className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <p className="text-xs text-slate-500 mt-1">Das sehen Jobsuchende als ungefähren Ort.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Straße & Hausnummer (Privat)</label>
                        <input
                            type="text"
                            name="address_line1"
                            defaultValue={initialData?.address_line1 || ""}
                            required
                            placeholder="Musterstraße 123"
                            className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Postleitzahl</label>
                        <input
                            type="text"
                            name="postal_code"
                            defaultValue={initialData?.postal_code || ""}
                            required
                            placeholder="53359"
                            className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Stadt</label>
                        <input
                            type="text"
                            name="city"
                            defaultValue={initialData?.city || ""}
                            required
                            placeholder="Rheinbach"
                            className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>
                </div>
            </div>

            {state?.error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {state.error}
                </div>
            )}
            {state?.success && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                    <MapPin size={16} />
                    {state.success}
                </div>
            )}

            <div className="pt-4 flex items-center justify-end border-t border-white/5 mt-6">
                <SubmitButton />
            </div>
        </form>
    );
}
