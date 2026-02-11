import { requireCompleteProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { fetchJobs, fetchCandidateApplications, getEffectiveView } from "@/lib/dal/jobbridge";
import { QueryDebugPanel } from "@/components/debug/QueryDebugPanel";
import { JobsList } from "@/components/jobs/JobsList";
import type { JobsListItem } from "@/lib/types/jobbridge";

function isMinor(birthdate: string | null): boolean {
    if (!birthdate) return true;
    const d = new Date(birthdate);
    if (Number.isNaN(d.getTime())) return true;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age < 18;
}

export default async function JobsPage() {
    const { profile } = await requireCompleteProfile();

    const viewRes = await getEffectiveView({ userId: profile.id, baseAccountType: profile.account_type });
    if (!viewRes.ok) {
        return (
            <div className="container mx-auto py-12 px-4 md:px-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Finde deinen Job</h1>
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
                        <p className="font-semibold">Fehler beim Bestimmen der Datenquelle/Rolle</p>
                        <p className="mt-2 text-sm font-mono">
                            {viewRes.error.code ? `${viewRes.error.code}: ` : ""}{viewRes.error.message}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const view = viewRes.data;
    if (view.viewRole === "job_provider") {
        redirect("/app-home/offers");
    }

    const guardianStatus = profile.guardian_status ?? "none";
    const canApply = !isMinor(profile.birthdate ?? null) || guardianStatus === "linked";

    const [jobsRes, appsRes] = await Promise.all([
        fetchJobs({
            mode: "feed",
            view,
            userId: profile.id,
            marketId: profile.market_id,
            status: "open",
            limit: 50,
            offset: 0,
        }),
        fetchCandidateApplications(profile.id)
    ]);

    const rawActiveJobs: JobsListItem[] = jobsRes.ok ? jobsRes.data : [];
    const allApps = appsRes.ok ? appsRes.data : [];

    const waitlistedJobs = allApps
        .filter(a => a.status === 'waitlisted')
        .map(a => a.job);

    const appliedJobs = allApps
        .filter(a => ['submitted', 'pending', 'negotiating', 'accepted', 'rejected'].includes(a.status))
        .map(a => a.job);

    // Filter activeJobs to exclude those that are already applied
    const appliedJobIds = new Set(appliedJobs.map(j => j.id));
    // Also exclude waitlisted jobs if they appear in active (though status should handle it, play safe)
    const waitlistedJobIds = new Set(waitlistedJobs.map(j => j.id));

    const activeJobs = rawActiveJobs.filter(job => !appliedJobIds.has(job.id) && !waitlistedJobIds.has(job.id));

    return (
        <div className="container mx-auto py-2 px-4 md:px-6">
            <div className="mx-auto max-w-6xl space-y-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Finde deinen Job
                    </h1>
                    <p className="text-slate-400">Hier findest du aktuelle Taschengeldjobs in deiner Nähe.</p>
                </div>

                {!jobsRes.ok ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-12 text-center backdrop-blur-sm">
                        <p className="text-red-200 font-semibold">Jobs konnten nicht geladen werden.</p>
                        <p className="mt-2 text-xs text-red-200/80 font-mono break-words">
                            {jobsRes.error.code ? `${jobsRes.error.code}: ` : ""}{jobsRes.error.message}
                        </p>
                    </div>
                ) : (activeJobs.length === 0 && waitlistedJobs.length === 0 && appliedJobs.length === 0) ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm">
                        <p className="text-slate-300">Aktuell sind keine neuen Jobs verfügbar.</p>
                        <div className="mt-4 text-[10px] text-slate-600 font-mono">
                            Region: {profile.market_id?.slice(0, 8) ?? "Global"}
                        </div>
                    </div>
                ) : (
                    <JobsList
                        activeJobs={activeJobs}
                        waitlistedJobs={waitlistedJobs}
                        appliedJobs={appliedJobs}
                        isDemo={view.source === "demo"}
                        canApply={canApply}
                        guardianStatus={guardianStatus}
                    />
                )}
            </div>
        </div>
    );
}
