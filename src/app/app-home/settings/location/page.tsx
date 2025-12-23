import { requireCompleteProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { DefaultLocationForm } from "./DefaultLocationForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function LocationSettingsPage() {
    const { profile } = await requireCompleteProfile();

    if (profile.account_type !== "job_provider") {
        redirect("/app-home/settings");
    }

    const supabase = await supabaseServer();
    const { data: location } = await (supabase as any).from("provider_locations")
        .select("*")
        .eq("provider_id", profile.id)
        .eq("is_default", true)
        .single();

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-2xl">
            <Link href="/app-home/settings" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
                <ChevronLeft size={16} />
                <span>Zurück</span>
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Standard-Ort</h1>
                <p className="text-slate-400">Lege deinen Standard-Ort für neue Jobs fest.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <DefaultLocationForm initialData={location} />
            </div>
        </div>
    );
}
