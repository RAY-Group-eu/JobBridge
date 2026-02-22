"use client";

import { useState, useActionState, useEffect } from "react";
import { ArrowLeft, MapPin, Save, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { LocationAutocomplete, LocationDetails } from "@/components/ui/LocationAutocomplete";
import { updateLocationAction } from "./actions";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LocationSettingsPage() {
    const router = useRouter();
    const [state, formAction] = useActionState(updateLocationAction, null);
    const [location, setLocation] = useState<LocationDetails | null>(null);
    const [currentAddress, setCurrentAddress] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("street, house_number, zip, city, lat, lng")
                    .eq("id", user.id)
                    .single();

                if (data && data.street && data.city) {
                    const address = `${data.street} ${data.house_number || ""}, ${data.zip || ""} ${data.city}`.trim();
                    setCurrentAddress(address);
                }
            }
            setIsLoading(false);
        }
        fetchProfile();
    }, []);

    // Also watch for successful form submission to redirect
    useEffect(() => {
        if (state?.status === "success") {
            router.push("/app-home/profile/settings");
        }
    }, [state, router]);

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-2xl animate-in fade-in zoom-in-[0.98] duration-300">
            <Link
                href="/app-home/profile/settings"
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft size={16} />
                Zurück zu Einstellungen
            </Link>

            <div className="mb-8">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 mb-4">
                    <MapPin size={28} />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Meine Adresse</h1>
                <p className="text-slate-400">
                    Hinterlege deinen genauen Standort, um bei der Jobsuche sofort zu sehen,
                    wie weit ein Job von deinem Zuhause entfernt ist.
                </p>
            </div>

            <div className="bg-[#12121A] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-indigo-500" size={32} />
                    </div>
                ) : (
                    <form action={formAction} className="space-y-6">

                        {state?.status === "error" && (
                            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <p>{state?.error?.message}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Dein Standort</label>
                            {currentAddress && !location && (
                                <div className="mb-4 p-4 border border-indigo-500/20 bg-indigo-500/5 rounded-xl text-indigo-200 text-sm flex items-center justify-between">
                                    <span>Aktuell hinterlegt: <strong>{currentAddress}</strong></span>
                                </div>
                            )}
                            <LocationAutocomplete
                                onSelect={setLocation}
                                placeholder="Straße, Nummer und Stadt suchen..."
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Deine exakte Adresse wird anderen Nutzern niemals angezeigt.
                                Wir nutzen sie ausschließlich, um dir die exakte Distanz zu Jobs anzuzeigen.
                            </p>
                        </div>

                        {location && (
                            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 opacity-0 fade-in duration-300 fill-mode-forwards">
                                <input type="hidden" name="street" value={location.address_line1} />
                                <input type="hidden" name="house_number" value={(location as any).house_number || ""} />
                                <input type="hidden" name="zip" value={location.postal_code} />
                                <input type="hidden" name="city" value={location.city} />
                                <input type="hidden" name="lat" value={location.lat} />
                                <input type="hidden" name="lng" value={location.lng} />

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-medium">Straße</label>
                                    <div className="p-3 bg-white/5 rounded-xl text-slate-200 text-sm border border-white/5">
                                        {location.address_line1} {(location as any).house_number}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-medium">Stadt</label>
                                    <div className="p-3 bg-white/5 rounded-xl text-slate-200 text-sm border border-white/5">
                                        {location.postal_code} {location.city}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 flex justify-end">
                            <SubmitButton disabled={!location} />
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

import { useFormStatus } from "react-dom";
function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending || disabled}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
        >
            {pending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Adresse Speichern</span>
        </button>
    );
}
