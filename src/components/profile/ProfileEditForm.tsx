import { Profile } from "@/lib/types";
import { BRAND_EMAIL } from "@/lib/constants";
import { LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileEditFormProps = {
    profile: Profile;
    className?: string;
};

export function ProfileEditForm({ profile, className }: ProfileEditFormProps) {
    const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || BRAND_EMAIL;
    const supportMailto = `mailto:${contactEmail}?subject=${encodeURIComponent("Profilkorrektur: Name oder Stadt/Ort")}`;

    const upcomingHeadline = profile.headline?.trim() || "";
    const upcomingBio = profile.bio?.trim() || "";
    const upcomingInterests = profile.interests?.trim() || "";

    return (
        <section className={cn("flex h-full flex-col rounded-2xl border border-white/10 bg-[#121217] p-6 shadow-xl md:p-8", className)}>
            <div className="mb-5">
                <h2 className="text-xl font-semibold text-white">Profil bearbeiten</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Name</label>
                    <input
                        readOnly
                        value={profile.full_name ?? "Nicht hinterlegt"}
                        className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-slate-200 outline-none"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Stadt / Ort</label>
                    <input
                        readOnly
                        value={profile.city ?? "Nicht hinterlegt"}
                        className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-slate-200 outline-none"
                    />
                </div>
            </div>

            <p className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400">
                <LockKeyhole size={13} />
                Name und Stadt/Ort sind fixiert.
                <a href={supportMailto} className="text-blue-300 underline underline-offset-4 hover:text-blue-200">
                    Support kontaktieren
                </a>
            </p>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Demnächst verfügbar</p>
                <p className="mt-1 text-xs text-slate-500">
                    Diese Felder sind aktuell sichtbar als Vorschau und werden noch nicht gespeichert.
                </p>

                <div className="mt-4 space-y-3">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">Kurzprofil</label>
                        <input
                            readOnly
                            value={upcomingHeadline}
                            placeholder="Noch nicht verfügbar"
                            className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-slate-400 outline-none placeholder:text-slate-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">Über mich</label>
                        <textarea
                            readOnly
                            rows={4}
                            value={upcomingBio}
                            placeholder="Noch nicht verfügbar"
                            className="w-full resize-none cursor-not-allowed rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-slate-400 outline-none placeholder:text-slate-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">Interessen / Skills</label>
                        <input
                            readOnly
                            value={upcomingInterests}
                            placeholder="Noch nicht verfügbar"
                            className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-slate-400 outline-none placeholder:text-slate-500"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
