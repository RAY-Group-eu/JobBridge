import { requireCompleteProfile } from "@/lib/auth";
import { GuardianBanner } from "@/components/profile/GuardianBanner";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { AddGuardianButton } from "@/components/profile/AddGuardianButton";
import { supabaseServer } from "@/lib/supabaseServer";
import { Clock3, Mail, ShieldCheck } from "lucide-react";

// Enforce strict type for the roles join
type UserRoleData = {
    role_id: string;
    system_roles: {
        name: string;
    } | null;
};

export default async function ProfilePage() {
    const { profile, session } = await requireCompleteProfile();
    const supabase = await supabaseServer();
    const displayName = profile.full_name?.trim() || "Nicht hinterlegt";

    // 1. Fetch Staff Roles
    // We explicitly cast the result or use a known type to avoid 'any'
    const { data: rolesData } = await supabase
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

    // 2. Fetch Security Events (Last Login)
    const { data: securityEvents } = await supabase
        .from("security_events")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1);

    const lastLogin = securityEvents && securityEvents.length > 0 ? securityEvents[0] : null;

    // 3. Prepare display data
    const locationDisplay = profile.city?.trim() || "Kein Ort festgelegt";
    const accountLabel = profile.account_type === "job_provider" ? "Jobanbieter" : "Jobsuchend";
    const memberSince = profile.created_at ? new Date(profile.created_at).toLocaleDateString("de-DE") : "-";
    const lastLoginDisplay = lastLogin ? new Date(lastLogin.created_at).toLocaleString("de-DE") : "Noch kein Login protokolliert";
    const profileEmail = profile.email?.trim() || session.user.email || "Keine E-Mail hinterlegt";



    // 4. Fetch Guardian Profiles via Relationships
    // 4. Fetch Guardian Profiles via Redeemed Invitations
    let guardians: Array<{ id: string; full_name: string | null; email: string | null }> = [];

    const { data: redeemedInvites } = await supabase
        .from("guardian_invitations")
        .select(`
            redeemed_by,
            guardian_profile:redeemed_by (
                id,
                full_name,
                email
            )
        `)
        .eq("child_id", profile.id)
        .eq("status", "redeemed");

    if (redeemedInvites && redeemedInvites.length > 0) {
        // Cast to any to avoid complex type mapping issues with joined data
        guardians = redeemedInvites.map((r: any) => r.guardian_profile).filter(Boolean);
    }
    // 5. Determine effective status (Self-healing)
    // If we found guardians in the relationship table, we consider the user "linked"
    // even if the profile status says "pending" (which might happen during 2nd invite).
    // CRITICAL FIX: If status is 'linked' but we found NO guardians, reset to 'none' (broken link).
    const effectiveGuardianStatus = guardians.length > 0
        ? "linked"
        : (profile.guardian_status === "pending" ? "pending" : "none");

    const isVerifiedBadge =
        profile.account_type === "job_provider"
            ? profile.provider_verification_status === "verified" || Boolean(profile.provider_verified_at)
            : effectiveGuardianStatus === "linked";

    const statusLabel =
        profile.account_type === "job_provider"
            ? (isVerifiedBadge ? "Geprüfter Anbieter" : (profile.provider_verification_status === "pending" ? "Prüfung läuft" : "Noch nicht geprüft"))
            : (effectiveGuardianStatus === "linked"
                ? "Eltern bestätigt"
                : (effectiveGuardianStatus === "pending" ? "Bestätigung ausstehend" : "Bestätigung erforderlich"));
    return (
        <ProfileEditForm
            profile={profile}
            isStaff={isStaff}
            guardians={guardians}
            lastLogin={lastLogin}
        />
    );
}
