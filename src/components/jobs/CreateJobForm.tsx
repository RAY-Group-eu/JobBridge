"use client";

import { createJob } from "@/app/app-home/offers/actions";
import { Loader2, Save, MapPin, FileEdit } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useActionState, useState } from "react";
import { cn } from "@/lib/utils";
import type { ErrorInfo } from "@/lib/types/jobbridge";
import Link from "next/link";

function SubmitButtons() {
    const { pending } = useFormStatus();
    return (
        <div className="flex gap-3">
            <button
                type="submit"
                name="intent"
                value="draft"
                disabled={pending}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
            >
                {pending ? <Loader2 size={18} className="animate-spin" /> : <FileEdit size={18} />}
                <span>Als Entwurf speichern</span>
            </button>
            <button
                type="submit"
                name="intent"
                value="create"
                disabled={pending}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {pending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>Veröffentlichen</span>
            </button>
        </div>
    );
}

type CreateJobFormState =
    | null
    | { status: "error"; error: ErrorInfo; debug?: Record<string, unknown> }
    | { status: "partial"; jobId: string; error: ErrorInfo; debug?: Record<string, unknown> };

type DefaultLocation = {
    id: string;
    public_label: string | null;
    address_line1: string | null;
    city: string | null;
    postal_code: string | null;
};

export function CreateJobForm({ defaultLocation }: { defaultLocation?: DefaultLocation | null }) {
    const [state, formAction] = useActionState<CreateJobFormState, FormData>(createJob, null);
    const [useCustomLocation, setUseCustomLocation] = useState(!defaultLocation);

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="use_default_location" value={(!useCustomLocation && defaultLocation) ? "true" : "false"} />
            {state?.status === "partial" && <input type="hidden" name="job_id" value={state.jobId} />}

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

            {state?.status === "error" && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                    <div className="font-semibold">Fehler</div>
                    <div className="mt-1 font-mono text-xs break-words">
                        {state.error.code ? `${state.error.code}: ` : ""}{state.error.message}
                    </div>
                    {process.env.NEXT_PUBLIC_SHOW_DEBUG_QUERY_PANEL === "true" && state.debug && (
                        <details className="mt-2 text-xs text-slate-300">
                            <summary className="cursor-pointer select-none text-slate-400 hover:text-slate-200">Debug</summary>
                            <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg border border-white/5 bg-black/30 p-2 text-[10px] text-slate-300">
                                {JSON.stringify(state.debug, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            )}

            {state?.status === "partial" && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm">
                    <div className="font-semibold">Job erstellt, aber unvollstaendig</div>
                    <div className="mt-1 text-sm text-amber-200/90">
                        Der Job wurde erstellt, aber die privaten Details konnten nicht gespeichert werden.
                    </div>
                    <div className="mt-2 font-mono text-xs break-words text-amber-200/80">
                        Job ID: {state.jobId}
                        <br />
                        {state.error.code ? `${state.error.code}: ` : ""}{state.error.message}
                    </div>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <button
                            type="submit"
                            name="intent"
                            value="retry_private_details"
                            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/25 text-amber-100 border border-amber-500/30 text-sm font-semibold"
                        >
                            Private Details erneut speichern
                        </button>
                        <Link
                            href="/app-home/offers"
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-sm font-semibold text-center"
                        >
                            Weiter zu Meine Jobs
                        </Link>
                    </div>

                    {process.env.NEXT_PUBLIC_SHOW_DEBUG_QUERY_PANEL === "true" && state.debug && (
                        <details className="mt-3 text-xs text-slate-300">
                            <summary className="cursor-pointer select-none text-slate-400 hover:text-slate-200">Debug</summary>
                            <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg border border-white/5 bg-black/30 p-2 text-[10px] text-slate-300">
                                {JSON.stringify(state.debug, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/5 mt-6 gap-4">
                <p className="text-xs text-slate-500">Dein Job wird für Jobsuchende in Rheinbach sichtbar sein.</p>
                <SubmitButtons />
            </div>
        </form>
    );
}
