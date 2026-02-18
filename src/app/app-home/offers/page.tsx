import { requireCompleteProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { MyJobsView } from "./components/MyJobsView";
import { RegionView } from "./components/RegionView";
import { fetchJobs, getEffectiveView } from "@/lib/dal/jobbridge";
import type { JobsListItem } from "@/lib/types/jobbridge";
import { Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function OffersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { profile } = await requireCompleteProfile();

    const viewRes = await getEffectiveView({ userId: profile.id, baseAccountType: profile.account_type });
    if (!viewRes.ok) {
        return (
            <div className="container mx-auto py-8 px-4 md:px-6 max-w-6xl">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
                    <p className="font-semibold">Fehler beim Bestimmen der Datenquelle/Rolle</p>
                    <p className="mt-2 text-sm font-mono break-words">
                        {viewRes.error.code ? `${viewRes.error.code}: ` : ""}{viewRes.error.message}
                    </p>
                </div>
            </div>
        );
    }

    const effectiveView = viewRes.data;
    if (effectiveView.viewRole === "job_seeker") {
        redirect("/app-home/jobs");
    }

    const isDemo = effectiveView.source === "demo";

    // Determine View
    const params = await searchParams;
    const isRegionView = params.view === 'region';

    // Data Fetching
    let jobs: JobsListItem[] = [];
    let regionName: string | null = null;
    const regionId = profile.market_id;
    let jobsError: { code?: string; message: string } | null = null;

    if (isRegionView) {
        const supabase = await supabaseServer();
        if (regionId) {
            // regions_live has `city`, not `display_name`
            const { data } = await supabase.from("regions_live").select("city").eq("id", regionId).single();
            if (data) regionName = data.city;
        }
    } else {
        const res = await fetchJobs({
            mode: "my_jobs",
            view: effectiveView,
            userId: profile.id,
            limit: 100,
            offset: 0,
        });

        if (res.ok) {
            jobs = res.data;
        } else {
            jobsError = { code: res.error.code, message: res.error.message };
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-6xl">
            {!isRegionView && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            Meine Jobs
                        </h1>
                        <p className="text-slate-400">
                            Verwalte deine Jobs für {regionName || "Rheinbach"}.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/app-home/offers/new">
                            <Button>
                                Neuer Job
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {isRegionView && (
                <div className="mb-8">
                    <Link href="/app-home/offers" className="inline-flex items-center gap-2 mb-4 text-slate-400 hover:text-white transition-colors">
                        <Settings size={16} />
                        <span>Zurück zu meinen Jobs</span>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Region & Sichtbarkeit
                    </h1>
                </div>
            )}

            {/* Content Area */}
            <div className="min-h-[400px]">
                {!isRegionView && (
                    jobsError ? (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-10 text-center">
                            <p className="text-red-200 font-semibold">Jobs konnten nicht geladen werden.</p>
                            <p className="mt-2 text-xs text-red-200/80 font-mono break-words">
                                {jobsError.code ? `${jobsError.code}: ` : ""}{jobsError.message}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <MyJobsView jobs={jobs} />
                        </div>
                    )
                )}
                {isRegionView && <RegionView regionName={regionName || "Rheinbach"} />}
            </div>
        </div>
    );
}
