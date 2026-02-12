"use client";

import { useMemo, useState } from "react";
import { Profile } from "@/lib/types";
import { BRAND_EMAIL } from "@/lib/constants";
import { LockKeyhole, Building2, User, MapPin, Briefcase, Sparkles, Clock, ShieldCheck, ShieldAlert, ArrowRight, Plus, Users, Calendar, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { UserProfileModal } from "@/components/profile/UserProfileModal";
import { ProviderVerificationModal } from "@/components/profile/ProviderVerificationModal";
import { GuardianBanner } from "./GuardianBanner";
import { GuardianConsentModal } from "@/components/GuardianConsentModal";
import { getGuardians } from "@/app/actions/guardian";

// Add type for Guardian display
type GuardianDisplay = {
    id: string;
    full_name: string | null;
    email: string | null;
};

type ProfileEditFormProps = {
    profile: Profile;
    className?: string;
    isStaff?: boolean;
    guardians?: GuardianDisplay[];
    lastLogin?: { created_at: string } | null;
};

export function ProfileEditForm({ profile, className, isStaff = false, guardians = [], lastLogin = null }: ProfileEditFormProps) {
    const isProvider = profile.account_type === "job_provider";
    const isVerified = profile.provider_verification_status === 'verified';

    // Tiered Verification Logic
    // FIX v6: Users hate the red badge. "Incomplete" is visually treated as "Basic" (Indigo).
    const isProfileIncomplete = !isVerified && (!profile.full_name || !profile.city || !profile.street || !profile.house_number || !profile.zip);
    const verificationStatusLabel = isVerified ? "VERIFIZIERT" : "BASIS";

    const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || BRAND_EMAIL;
    const supportMailto = `mailto:${contactEmail}?subject=${encodeURIComponent("Profilkorrektur: Name oder Stammdaten")}`;

    // Common Fields
    const [bio, setBio] = useState(profile.bio?.trim() || "");
    const [availabilityNote, setAvailabilityNote] = useState((profile.availability_note ?? "").trim());

    // Seeker Fields
    const [interests, setInterests] = useState(profile.interests?.trim() || "");
    const [skills, setSkills] = useState((profile.skills ?? "").trim());

    const [saving, setSaving] = useState(false);
    const [saveState, setSaveState] = useState<null | { type: "ok" | "error"; message: string }>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    // Guardian Management
    const [guardiansList, setGuardiansList] = useState<GuardianDisplay[]>(guardians);
    const [showAddGuardianModal, setShowAddGuardianModal] = useState(false);

    // Generic Toast State for "Under Development" messages
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showDevToast = () => {
        setToastMessage("Diese Funktion ist noch in der Entwicklung.");
        setTimeout(() => setToastMessage(null), 3000);
    };

    const refreshGuardians = async () => {
        const res = await getGuardians();
        if (res.guardians) {
            setGuardiansList(res.guardians);
        }
    };

    const savePayload = useMemo(() => {
        const toNull = (v: string) => {
            const t = v.trim();
            return t.length > 0 ? t : null;
        };

        const base = {
            bio: toNull(bio),
            availability_note: toNull(availabilityNote),
        };

        if (isProvider) {
            return {
                ...base,
                skills: null,
                interests: null,
            };
        } else {
            return {
                ...base,
                skills: toNull(skills),
                interests: toNull(interests),
            };
        }
    }, [bio, interests, skills, availabilityNote, isProvider]);

    const onSave = async () => {
        setSaving(true);
        setSaveState(null);
        try {
            const { error } = await supabaseBrowser
                .from("profiles")
                .update(savePayload)
                .eq("id", profile.id);

            if (error) throw error;
            setSaveState({ type: "ok", message: "Gespeichert." });
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
            setSaveState({ type: "error", message: msg });
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className={cn("relative min-h-screen -mt-24 pt-28 pb-24 font-sans", className)}>

            {/* GLOBAL BACKGROUND: Cinematic Atmosphere */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden bg-slate-950">
                {/* 1. Global Noise Texture / Grain */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay contrast-150 brightness-100 placeholder-content" />

                {/* 2. Primary Ambient Light (Top Left - "Sunlight") */}
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-indigo-600/10 rounded-full blur-[180px] opacity-40 mix-blend-screen animate-pulse-slow" />

                {/* 3. Secondary Ambient Light (Bottom Right - "Reflection") */}
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/5 rounded-full blur-[200px] opacity-30 mix-blend-screen" />

                {/* 4. Top Edge Glow (Connects to Nav) */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-50" />
            </div>

            <div className="relative z-10 container mx-auto px-4 lg:px-8 py-8 md:py-12 max-w-[1600px]">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
                    <div className="space-y-2 relative">
                        {/* Decorative line behind text */}
                        <div className="absolute -left-8 top-2 bottom-2 w-1 bg-gradient-to-b from-indigo-500 to-transparent opacity-0 md:opacity-30 rounded-full" />


                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-2xl">
                            {(isProvider && profile.provider_kind === 'company') ? "Firmenprofil" : "Das Profil"}<span className="text-indigo-500">.</span>
                        </h1>
                        <p className="text-slate-400 text-sm md:text-base max-w-xl font-medium leading-relaxed tracking-tight">
                            Verwalte deine digitalen Stammdaten und Einstellungen.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Header Actions */}
                        <button
                            type="button"
                            onClick={() => setShowPreview(true)}
                            className="inline-flex items-center gap-2 px-4 md:px-6 py-3 rounded-2xl bg-[#0F0F12] hover:bg-[#1A1A20] text-slate-200 border border-white/5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            <User size={18} className="text-indigo-400" />
                            <span className="hidden md:inline">Vorschau</span>
                            <span className="md:hidden">Vorschau</span>
                        </button>
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={saving}
                            className={cn(
                                "group inline-flex items-center gap-2 rounded-2xl px-8 py-3 text-sm font-bold transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.4)] hover:shadow-[0_0_60px_-10px_rgba(79,70,229,0.6)] hover:scale-[1.02] active:scale-[0.98]",
                                "bg-[#4F46E5] text-white hover:bg-[#4338CA] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                            )}
                        >
                            {saving ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Speichern...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} className="fill-white/20 group-hover:fill-white/40 transition-all" />
                                    Speichern
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Save State Notification */}
                {saveState && (
                    <div className="fixed top-24 right-8 z-[100]">
                        <div
                            className={cn(
                                "flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-right-8 duration-500",
                                saveState.type === "ok"
                                    ? "bg-[#052e16]/80 border-emerald-500/30 text-emerald-200 shadow-emerald-900/20"
                                    : "bg-[#4c0519]/80 border-rose-500/30 text-rose-200 shadow-rose-900/20"
                            )}
                        >
                            <div className={cn("p-2 rounded-full", saveState.type === "ok" ? "bg-emerald-500/20" : "bg-rose-500/20")}>
                                {saveState.type === "ok" ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                            </div>
                            <span className="font-bold tracking-wide text-sm">{saveState.message}</span>
                        </div>
                    </div>
                )}

                {/* Fluent Toast Notification */}
                {toastMessage && (
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100]">
                        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#1A1A20]/90 border border-indigo-500/30 text-indigo-100 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 zoom-in-95 duration-300">
                            <Sparkles size={16} className="text-indigo-400" />
                            <span className="text-xs font-bold tracking-wide">{toastMessage}</span>
                        </div>
                    </div>
                )}

                {/* --- NEW V6: VERIFICATION CTA & GUARDIAN BANNER --- */}
                <div className="mb-12">
                    {isProvider ? (
                        // PROVIDER: Verification Call-To-Action (Replaces old badges)
                        !isVerified && (
                            <div className="relative overflow-hidden rounded-[2rem] border border-indigo-500/30 bg-[#0F0F12] p-8 shadow-2xl group">
                                {/* Background Glows */}
                                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

                                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                                    {/* Icon Box */}
                                    <div className="w-20 h-20 rounded-3xl bg-[#15151A] border border-white/5 flex items-center justify-center shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-500">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse" />
                                            <ShieldCheck size={36} className="relative z-10 text-indigo-500" />
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-bold text-white tracking-tight">
                                                Basisverifizierung abschließen
                                            </h3>
                                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                                                Wichtig
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-base font-medium leading-relaxed max-w-2xl">
                                            Um Jobs auszuschreiben und vollen Zugriff auf die Plattform zu erhalten, musst du deine Identität bestätigen. Wir benötigen hierfür lediglich deine Adresse.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setShowVerificationModal(true)}
                                        className="w-full md:w-auto px-8 py-4 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-sm tracking-wide shadow-xl shadow-indigo-900/20 hover:shadow-indigo-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group/btn"
                                    >
                                        <MapPin size={18} className="text-indigo-200" />
                                        <span>Adresse eingeben</span>
                                        <ArrowRight size={16} className="text-indigo-200 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        )
                    ) : (
                        // SEEKER: Guardian Banner Logic
                        (() => {
                            const isMinor = (birthdate: string | null) => {
                                if (!birthdate) return false;
                                const d = new Date(birthdate);
                                if (Number.isNaN(d.getTime())) return false;
                                const now = new Date();
                                let age = now.getFullYear() - d.getFullYear();
                                const m = now.getMonth() - d.getMonth();
                                if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
                                return age < 18;
                            };

                            const minor = isMinor(profile.birthdate);
                            const showGuardianBanner = profile.guardian_status === "linked" ||
                                profile.guardian_status === "pending" ||
                                minor;

                            if (showGuardianBanner) {
                                return <GuardianBanner guardianStatus={profile.guardian_status || "none"} />;
                            }
                            return null;
                        })()
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* LEFT COL: DIGITAL ID (Stammdaten) */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 z-20">

                        {/* HOLOGRAPHIC ID CARD */}
                        <div className="relative group perspective-1000">
                            {/* Glow behind card */}
                            <div className="absolute -inset-0.5 bg-gradient-to-b from-indigo-500/20 to-purple-500/20 rounded-[2.2rem] blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-700" />

                            <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0A0A0C] shadow-2xl transition-transform duration-500 hover:scale-[1.005]">

                                {/* Top "Hole" for Lanyard Effect (Optional Visual Detail) */}
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-black/50 border border-white/5" />

                                {/* Card Header */}
                                <div className="relative p-6 pb-2 border-b border-white/[0.03]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#15151A] border border-white/5 flex items-center justify-center">
                                                <Building2 size={14} className="text-indigo-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-slate-500">Digital ID</span>
                                                <span className="text-[10px] font-mono text-indigo-400/80">ID-{profile.id.substring(0, 6)}</span>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-[#15151A] border border-white/5 flex items-center justify-center group-hover:bg-white/5 transition-colors" title={lastLogin ? `Letzter Login: ${new Date(lastLogin.created_at).toLocaleString("de-DE")}` : "Noch nie eingeloggt"}>
                                            <LockKeyhole size={12} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 pt-8 relative">
                                    <div className="flex flex-col items-center text-center mb-8">
                                        <div className="relative w-24 h-24 mb-4">
                                            {/* Avatar Glow */}
                                            <div className="absolute inset-0 rounded-full bg-indigo-500 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />

                                            <div className="relative w-full h-full rounded-full border border-white/10 bg-[#121215] p-1 shadow-2xl">
                                                <div className="w-full h-full rounded-full bg-[#1A1A20] flex items-center justify-center overflow-hidden">
                                                    {profile.avatar_url ? (
                                                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-3xl font-black text-slate-700 select-none">
                                                            {profile.full_name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* NEW: Avatar Plus Button (Overlay - DIRECTLY ON AVATAR) */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); showDevToast(); }}
                                                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#4F46E5] border-2 border-[#121215] flex items-center justify-center text-white hover:bg-[#4338CA] transition-all shadow-lg z-20 group/plus"
                                                    title="Profilbild ändern"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Status Indicator Dot - RED BADGE REMOVED (Blue or Green Only) */}
                                    <div className={cn(
                                        "absolute bottom-0 right-0 w-6 h-6 rounded-full border-[3px] border-[#0A0A0C] flex items-center justify-center shadow-sm z-10",
                                        isVerified ? "bg-emerald-500" : "bg-indigo-500"
                                    )} title={verificationStatusLabel}>
                                        {isVerified ? <Sparkles size={10} className="text-white fill-current" /> : <User size={10} className="text-white" />}
                                    </div>






                                    <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{profile.full_name}</h3>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <div className="flex items-center justify-center gap-2 mt-1">
                                            <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                                <MapPin size={10} /> {profile.city || "Unbekannt"}
                                            </p>

                                            {/* MOVED: JobBridge Team Badge */}
                                            {isStaff && (
                                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#15151A] border border-indigo-500/30 shadow-sm">
                                                    <ShieldCheck size={10} className="text-indigo-400" />
                                                    <span className="text-[8px] font-black text-indigo-100 tracking-wider">
                                                        JOBBRIDGE TEAM
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Data Grid */}
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div className="p-2.5 rounded-xl bg-[#121215] border border-white/[0.03] flex flex-col items-center justify-center gap-1 text-center">
                                                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                                                    <Calendar size={8} /> Mitglied seit
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-300">
                                                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString("de-DE", { month: 'short', year: 'numeric' }) : "-"}
                                                </span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-[#121215] border border-white/[0.03] flex flex-col items-center justify-center gap-1 text-center">
                                                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                                                    <Fingerprint size={8} /> Geburtsdatum
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-300">
                                                    {profile.birthdate ? new Date(profile.birthdate).toLocaleDateString("de-DE") : "-"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#121215] border border-white/[0.03]">
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Rolle</span>
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-1 rounded-md border uppercase",
                                                isProvider
                                                    ? "bg-amber-950/30 text-amber-500 border-amber-500/20"
                                                    : "bg-indigo-950/30 text-indigo-400 border-indigo-500/20"
                                            )}>
                                                {isProvider
                                                    ? (profile.company_name ? "JOBANBIETER (ORG)" : "JOBANBIETER (PRIVAT)")
                                                    : "JOBSUCHEND"}
                                            </span>
                                        </div>

                                        {/* Status Row: Provider (Verified/Basic) OR Seeker (Guardian Status) */}
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#121215] border border-white/[0.03]">
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Status</span>

                                            {isProvider ? (
                                                // Provider Status
                                                isVerified ? (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                                                        <ShieldCheck size={12} />
                                                        VERIFIZIERT
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-400">
                                                        <ShieldCheck size={12} />
                                                        BASIS
                                                    </span>
                                                )
                                            ) : (
                                                // Seeker Status (Guardian)
                                                profile.guardian_status === "linked" ? (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                                                        <ShieldCheck size={12} />
                                                        VERIFIZIERT
                                                    </span>
                                                ) : profile.guardian_status === "pending" ? (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-500">
                                                        <Clock size={12} />
                                                        AUSSTEHEND
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                                        NICHT ERFORDERLICH
                                                    </span>
                                                )
                                            )}
                                        </div>

                                        {/* Guardians List for Seekers */}
                                        {!isProvider && (
                                            <div className="p-3 rounded-xl bg-[#121215] border border-white/[0.03] space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                                                        <Users size={10} /> Erziehungsberechtigte
                                                    </span>
                                                    <button
                                                        onClick={() => setShowAddGuardianModal(true)}
                                                        className="w-5 h-5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 flex items-center justify-center transition-colors"
                                                        title="Weiteren hinzufügen"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>

                                                {guardiansList.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {guardiansList.map(g => (
                                                            <div key={g.id} className="flex items-center gap-2 group/g">
                                                                <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                                                                    {(g.full_name || "G").charAt(0)}
                                                                </div>
                                                                <div className="flex flex-col overflow-hidden">
                                                                    <span className="text-[10px] text-slate-300 font-bold truncate leading-none mb-0.5">{g.full_name}</span>
                                                                    <span className="text-[9px] text-slate-600 truncate leading-none">{g.email}</span>
                                                                </div>
                                                                <div className="ml-auto opacity-0 group-hover/g:opacity-100 transition-opacity">
                                                                    <ShieldCheck size={10} className="text-emerald-500" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-[10px] text-slate-500 font-medium italic">Noch keine Bestätigung.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NEW: GUARDIAN CONTROL CARD (Left Column) */}
                    {!isProvider && (profile.guardian_status === 'linked' || profile.guardian_status === 'pending') && (
                        <div className="relative group overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0A0A0C] shadow-2xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Erziehungsberechtigte</h4>
                                    <p className="text-[10px] text-slate-400">Verwaltung & Freigaben</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {guardiansList.length > 0 ? (
                                    guardiansList.map(g => (
                                        <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#15151A] border border-white/5">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                                                {g.full_name?.charAt(0) || "G"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-200 truncate">{g.full_name || "Unbekannt"}</p>
                                                <p className="text-[10px] text-slate-500 truncate">{g.email}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                                        <p className="text-[10px] font-bold text-amber-500">Verknüpfung ausstehend</p>
                                    </div>
                                )}

                                <button
                                    onClick={showDevToast}
                                    className="w-full py-3 rounded-xl bg-[#15151A] hover:bg-[#1A1A20] border border-white/5 text-xs font-bold text-indigo-400 transition-colors flex items-center justify-center gap-2 group/btn"
                                >
                                    <span>Verwaltung öffnen</span>
                                    <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* RIGHT COL: EDITABLE FORM */}
                    <div className="lg:col-span-8 space-y-8 pb-12">

                        {/* Public Profile Card */}
                        <div className="rounded-[2.5rem] bg-[#0A0A0C] border border-white/[0.05] p-6 md:p-10 relative overflow-hidden shadow-2xl">
                            {/* Content Background Spotlights */}
                            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 pb-8 border-b border-white/[0.03]">
                                    {/* Icon Container - NO GRADIENT, Solid Glass */}
                                    <div className="w-16 h-16 rounded-2xl bg-[#15151A] border border-white/5 flex items-center justify-center shadow-xl">
                                        <Sparkles size={28} className="text-indigo-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Persönliche Daten</h3>
                                        <p className="text-slate-400 text-sm font-medium">Diese Informationen sind teilweise öffentlich sichtbar.</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* BIO */}
                                    <div className="space-y-3 group">
                                        <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.15em] ml-1 group-focus-within:text-indigo-400 transition-colors">
                                            {isProvider ? "Über uns" : "Über mich"}
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                rows={6}
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                placeholder={isProvider ? "Erzähle potenziellen Bewerbern, wer ihr seid und was euch ausmacht..." : "Erzähle etwas über dich, deine Interessen und was du suchst..."}
                                                className="w-full resize-none rounded-2xl bg-[#0F0F12] border-2 border-transparent px-6 py-5 text-base md:text-lg text-slate-200 placeholder:text-slate-700 focus:outline-none focus:bg-[#121216] focus:border-indigo-500/20 transition-all font-medium leading-relaxed"
                                            />
                                            <div className="absolute bottom-4 right-4 text-[10px] font-bold tracking-wider text-slate-700">
                                                {bio.length} ZEICHEN
                                            </div>
                                        </div>
                                    </div>

                                    {/* SEEKER FIELDS (Island Layout) */}
                                    {!isProvider && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3 group">
                                                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.15em] ml-1 flex items-center gap-2 group-focus-within:text-indigo-400 transition-colors">
                                                    <Briefcase size={12} /> Skills
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        value={skills}
                                                        onChange={(e) => setSkills(e.target.value)}
                                                        placeholder="Mathe, Englisch..."
                                                        className="w-full h-14 rounded-2xl bg-[#0F0F12] border-2 border-transparent px-5 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:bg-[#121216] focus:border-indigo-500/20 transition-all font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3 group">
                                                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.15em] ml-1 flex items-center gap-2 group-focus-within:text-purple-400 transition-colors">
                                                    <Sparkles size={12} /> Interessen
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        value={interests}
                                                        onChange={(e) => setInterests(e.target.value)}
                                                        placeholder="Fußball, Gaming..."
                                                        className="w-full h-14 rounded-2xl bg-[#0F0F12] border-2 border-transparent px-5 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:bg-[#121216] focus:border-purple-500/20 transition-all font-medium"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* AVAILABILITY */}
                                    <div className="space-y-3 group">
                                        <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.15em] ml-1 flex items-center gap-2 group-focus-within:text-emerald-400 transition-colors">
                                            <Clock size={12} /> Zeitliche Verfügbarkeit
                                        </label>
                                        <div className="relative">
                                            <input
                                                value={availabilityNote}
                                                onChange={(e) => setAvailabilityNote(e.target.value)}
                                                placeholder="z.B. Nachmittags ab 15 Uhr, Wochenenden..."
                                                className="w-full h-14 rounded-2xl bg-[#0F0F12] border-2 border-transparent px-5 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:bg-[#121216] focus:border-emerald-500/20 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* JOBBRIDGE PLUS TEASER (Replaces old Badge Placeholder) */}
                                    {isProvider && !isProfileIncomplete && !isVerified && (
                                        <div className="mt-8 pt-8 border-t border-white/[0.03]">
                                            <div
                                                onClick={showDevToast}
                                                className="group/plus p-6 rounded-[2rem] bg-gradient-to-br from-[#0F0F12] to-[#0A0A0C] border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer relative overflow-hidden shadow-lg hover:shadow-blue-900/10"
                                            >
                                                {/* Blue Glow Effect */}
                                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] group-hover/plus:opacity-100 transition-opacity" />

                                                <div className="relative z-10 flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner border border-blue-500/20">
                                                            <ShieldCheck size={28} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                                                JobBridge Plus <span className="text-[10px] uppercase tracking-wider bg-blue-500 text-white px-2 py-0.5 rounded-full font-black">NEU</span>
                                                            </h4>
                                                            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm mt-1">
                                                                Verdiene dir den <span className="text-blue-400 font-bold">blauen Haken</span> und mache JobBridge zu einem sicheren Ort.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover/plus:bg-blue-500 group-hover/plus:text-white transition-all transform group-hover/plus:rotate-90">
                                                        <ArrowRight size={20} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            <UserProfileModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                isStaff={isStaff}
                profile={{
                    ...profile,
                    bio,
                    interests: isProvider ? null : interests,
                    skills: isProvider ? null : skills,
                    company_name: profile.company_name ?? null,
                    company_contact_email: profile.company_contact_email ?? null,
                    availability_note: availabilityNote,
                }}
                stats={{ jobsCompleted: 0, rating: 5.0 }}
            />

            {/* Add Guardian Modal */}
            <GuardianConsentModal
                isOpen={showAddGuardianModal}
                onClose={() => {
                    setShowAddGuardianModal(false);
                    refreshGuardians(); // Refresh list on close
                }}
                variant="add"
            />

            <ProviderVerificationModal
                isOpen={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                profileId={profile.id}
                onVerified={() => {
                    window.location.reload();
                }}
            />

        </section>
    );
}
