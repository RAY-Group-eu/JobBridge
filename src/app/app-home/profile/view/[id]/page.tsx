import { requireCompleteProfile } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Briefcase, Calendar } from "lucide-react";
import Link from "next/link";

interface ProfileViewPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProfileViewPage({ params }: ProfileViewPageProps) {
    const { id } = await params;

    // ...
    const { profile: myProfile } = await requireCompleteProfile();
    const supabase = await supabaseServer();

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !profile) {
        notFound();
    }

    // Basic privacy check: if we want to restrict viewing, do it here.
    // For now, allow viewing generic info.

    const initials = (profile.company_name || profile.full_name || "?")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
            <Link href="/app-home/jobs" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
                <ArrowLeft size={20} />
                Zurück zu Jobs
            </Link>

            <div className="rounded-3xl border border-white/10 bg-[#1A1A23] overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-indigo-900/50 to-purple-900/50" />
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-6 flex justify-between items-end">
                        <div className="w-32 h-32 rounded-full border-4 border-[#1A1A23] bg-[#2A2A35] flex items-center justify-center text-4xl font-bold text-slate-300">
                            {initials}
                        </div>
                        {myProfile.id === profile.id && (
                            <Link
                                href="/app-home/settings"
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
                            >
                                Profil bearbeiten
                            </Link>
                        )}
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {profile.company_name || profile.full_name || "Unbekannt"}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-slate-400 text-sm mb-6">
                            {(profile.city || profile.country) && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={16} />
                                    <span>{profile.city}{profile.country ? `, ${profile.country}` : ""}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <Calendar size={16} />
                                <span>Mitglied seit {new Date(profile.created_at).toLocaleDateString("de-DE", { month: "long", year: "numeric" })}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Briefcase size={16} />
                                <span className="capitalize">
                                    {profile.account_type === "job_provider" ? "Arbeitgeber" : "Arbeitsuchend"}
                                    {profile.provider_kind ? ` (${profile.provider_kind === "company" ? "Firma" : "Privat"})` : ""}
                                </span>
                            </div>
                        </div>

                        {profile.bio && (
                            <div className="prose prose-invert max-w-none">
                                <h3 className="text-lg font-semibold text-white mb-2">Über mich</h3>
                                <p className="text-slate-300 leading-relaxed">
                                    {profile.bio}
                                </p>
                            </div>
                        )}

                        {!profile.bio && (
                            <p className="text-slate-500 italic">Keine Beschreibung verfügbar.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
