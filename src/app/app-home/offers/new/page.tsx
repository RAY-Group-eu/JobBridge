import { requireCompleteProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateJobForm } from "@/components/jobs/CreateJobForm";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function NewOfferPage() {
    const { profile } = await requireCompleteProfile();

    // RoleGuard in layout handles redirects, but double check here for good measure
    if (profile.account_type !== "job_provider") {
        redirect("/app-home/jobs");
    }

    const supabase = await supabaseServer();
    const { data: defaultLocation } = await (supabase as any).from("provider_locations")
        .select("*")
        .eq("provider_id", profile.id)
        .eq("is_default", true)
        .single();

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Neuen Job erstellen</h1>
                <p className="text-slate-400">Suche nach Unterstützung in Rheinbach.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <CreateJobForm
                    userId={profile.id}
                    marketId={profile.market_id || "rheinbach_fix"}
                    defaultLocation={defaultLocation}
                />
            </div>
        </div>
    );
}
