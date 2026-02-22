"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { Database } from "@/lib/types/supabase";
import { updateJobAction } from "./actions"; // We'll create this next
import { Loader2, MapPin, Lock } from "lucide-react";

type Job = Database['public']['Tables']['jobs']['Row'] & { reach?: string | null };

export function EditJobForm({ job, marketName }: { job: Job, marketName: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError(null);

        try {
            const result = await updateJobAction(job.id, formData);
            if (result.success) {
                router.push("/app-home/offers");
                router.refresh();
            } else {
                setError(result.error || "Fehler beim Speichern");
            }
        } catch (e) {
            setError("Ein unerwarteter Fehler ist aufgetreten.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-slate-300">Titel</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    defaultValue={job.title || ""}
                    required
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Beschreibung</label>
                <textarea
                    id="description"
                    name="description"
                    defaultValue={job.description || ""}
                    required
                    rows={5}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 resize-none"
                />
            </div>

            {/* Read-only Location Display */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Einsatzort</label>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 opacity-70 cursor-not-allowed">
                    <div className="p-2 rounded-full bg-white/5">
                        <MapPin className="text-slate-400" size={18} />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-slate-300">
                            {job.public_location_label || "Standard-Adresse"}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Lock size={10} />
                            <span>Adresse kann nachträglich nicht geändert werden</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reach / Visibility Section */}
            <div className="pt-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Reichweite</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="cursor-pointer">
                        <input
                            type="radio"
                            name="reach"
                            value="internal_rheinbach"
                            defaultChecked={job.reach === 'internal_rheinbach' || !job.reach}
                            className="peer sr-only"
                        />
                        <div className="p-4 rounded-xl bg-slate-950/50 border border-white/10 peer-checked:bg-indigo-500/10 peer-checked:border-indigo-500/50 peer-checked:ring-1 peer-checked:ring-indigo-500/20 transition-all hover:bg-white/5 h-full">
                            <h4 className="font-bold text-sm text-white peer-checked:text-indigo-300">Lokal in {marketName}</h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Nur für Nutzer aus {marketName} sichtbar.</p>
                        </div>
                    </label>
                    <label className="cursor-pointer">
                        <input
                            type="radio"
                            name="reach"
                            value="extended"
                            defaultChecked={job.reach === 'extended'}
                            className="peer sr-only"
                        />
                        <div className="p-4 rounded-xl bg-slate-950/50 border border-white/10 peer-checked:bg-indigo-500/10 peer-checked:border-indigo-500/50 peer-checked:ring-1 peer-checked:ring-indigo-500/20 transition-all hover:bg-white/5 h-full relative overflow-hidden">
                            <h4 className="font-bold text-sm text-white peer-checked:text-indigo-300">Überregional</h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Auch für Nutzer aus umliegenden Städten sichtbar.</p>
                        </div>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="wage_hourly" className="block text-sm font-medium text-slate-300">Stundenlohn (€)</label>
                    <input
                        type="number"
                        id="wage_hourly"
                        name="wage_hourly"
                        defaultValue={job.wage_hourly || ""}
                        required
                        min="0"
                        step="0.50"
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="status" className="block text-sm font-medium text-slate-300">Status</label>
                    <select
                        id="status"
                        name="status"
                        defaultValue={job.status || "open"}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    >
                        <option value="open">Aktiv (Sichtbar)</option>
                        <option value="closed">Geschlossen (Archiviert)</option>
                        {/* Add more statuses if needed, e.g. draft */}
                        <option value="draft">Entwurf</option>
                    </select>
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.back()}
                    disabled={isLoading}
                >
                    Abbrechen
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="min-w-[120px]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Speichern...
                        </>
                    ) : (
                        "Speichern"
                    )}
                </Button>
            </div>
        </form>
    );
}
