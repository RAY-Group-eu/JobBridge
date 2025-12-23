import { requireCompleteProfile } from "@/lib/auth";
import { GuardianBanner } from "@/components/profile/GuardianBanner";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { SecurityEvent } from "@/lib/types";
import { Database } from "@/lib/types/supabase";

// Enforce strict type for the roles join
type UserRoleData = {
    role_id: string;
    system_roles: {
        name: string;
    } | null;
};

export default async function ProfilePage() {
    const { profile, session } = await requireCompleteProfile();
    const isYouth = profile.user_type === "youth";
    const supabase = await supabaseServer();

    // 1. Fetch Staff Roles
    // We explicitly cast the result or use a known type to avoid 'any'
    const { data: rolesData, error: rolesError } = await supabase
        .from("user_system_roles")
        .select(`
            role_id,
            system_roles (
                name
            )
        `)
        .eq("user_id", profile.id);

    // Manual type assertion / mapping because join types are complex
    const roles = rolesData as unknown as UserRoleData[];
    const isStaff = roles && roles.length > 0;
    const roleNames = roles?.map(r => r.system_roles?.name).filter(Boolean).join(", ");

    // 2. Fetch Security Events (Last Login)
    const { data: securityEvents } = await supabase
        .from("security_events")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1);

    const lastLogin = securityEvents && securityEvents.length > 0 ? securityEvents[0] : null;

    // 3. Prepare display data
    // We treat city/market as read-only from the profile
    const locationDisplay = profile.city || "Kein Ort festgelegt";

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-5xl">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-8">Dein Profil</h1>

            {isYouth && (
                <div className="mb-8">
                    <GuardianBanner isVerified={!!profile.is_verified} />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Public Profile Preview & Stats (4 columns) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Access Card */}
                    <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-200 ring-4 ring-[#1A1A23]">
                                    {profile.full_name?.charAt(0).toUpperCase() || "?"}
                                </div>
                                {isStaff && (
                                    <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[#121217]">
                                        STAFF
                                    </div>
                                )}
                            </div>

                            <h2 className="text-xl font-bold text-white mb-1">
                                {profile.full_name}
                            </h2>
                            <p className="text-sm text-slate-400 mb-4 capitalize">
                                {profile.user_type} Account
                            </p>

                            <div className="w-full h-px bg-white/5 my-4" />

                            <div className="w-full space-y-3 text-left">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Status</span>
                                    <span className={profile.is_verified ? "text-emerald-400" : "text-amber-400"}>
                                        {profile.is_verified ? "Verifiziert" : "Nicht verifiziert"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Standort</span>
                                    <span className="text-slate-300 truncate max-w-[120px]" title={locationDisplay}>
                                        {locationDisplay}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Mitglied seit</span>
                                    <span className="text-slate-300">
                                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Sicherheit</h3>
                        <div className="space-y-3">
                            <div className="text-sm">
                                <p className="text-slate-400 text-xs mb-1">Email</p>
                                <p className="text-slate-200 truncate">{profile.email}</p>
                            </div>
                            {lastLogin && (
                                <div className="text-sm">
                                    <p className="text-slate-400 text-xs mb-1">Letzter Login</p>
                                    <p className="text-slate-200">
                                        {new Date(lastLogin.created_at).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form (8 columns) */}
                <div className="lg:col-span-8">
                    <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Profil bearbeiten</h2>
                        </div>

                        <ProfileEditForm profile={profile} />
                    </div>
                </div>
            </div>
        </div>
    );
}
